import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { BaseStyle } from '../constant/Style';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight } from '../utils/typography';
import {
  gameAccentColor,
  gameBubbleColors,
  gameCardColor,
  gameLoseColor,
  gameSlotBgColor,
  gameTextColor,
  gameTileTextColor,
  gameWinColor,
  authBorderColor,
} from '../constant/Color';
import { pointInRect, segmentHitsRect, segmentsCross } from '../utils/geometry';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

export const BOARD_WIDTH = wp(100) - spacings.xxxxLarge * 2;
const BOARD_HEIGHT = hp(46);
const CHIP_WIDTH = wp(28);
const CHIP_HEIGHT = hp(6.5);
const LINE_THICKNESS = 5;
const MIN_POINT_GAP = 6; // a new point is kept only after the finger moved this far
const TOUCH_SLOP = spacings.xxLarge; // how far outside a box still counts as touching it
const FLASH_MS = 450;

const lineColor = (index) => gameBubbleColors[index % gameBubbleColors.length];

// One short piece of a freehand line. Memoised so a growing line only renders
// its newest pieces while the finger moves.
const Segment = memo(({ x1, y1, x2, y2, color }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy) + LINE_THICKNESS / 2;
  return (
    <View
      pointerEvents="none"
      style={[
        BaseStyle.positionAbsolute,
        {
          left: (x1 + x2) / 2 - length / 2,
          top: (y1 + y2) / 2 - LINE_THICKNESS / 2,
          width: length,
          height: LINE_THICKNESS,
          borderRadius: LINE_THICKNESS,
          backgroundColor: color,
          transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
        },
      ]}
    />
  );
});

const Path = memo(({ points, color }) => (
  <>
    {points.slice(1).map((p, i) => (
      <Segment key={i} x1={points[i].x} y1={points[i].y} x2={p.x} y2={p.y} color={color} />
    ))}
  </>
));

const clamp = (value, max) => Math.min(Math.max(value, 0), max);

/**
 * chips: [{ id, label, type: 'actor' | 'action', x, y }] — x / y are the box
 * centre as a 0–1 fraction of the board, so boxes stay put on every screen.
 * lines: [{ a, b, points }] — drawn links (the finger's path), owned by the parent.
 * onChange(lines): called with the new list when a valid line is drawn.
 * onViolation(): called when a line crosses another line or runs over a box.
 * status: null while playing; 'checked' or 'violation' lock the board.
 * isCorrectLink(a, b): used to colour lines green/red once checked.
 *
 * Draw with a finger from one box to another. The moment the path crosses an
 * existing line the line is kept on screen (red) and onViolation fires, so the
 * parent can explain and reset the flow.
 */
const FlowBoard = ({ chips, lines, onChange, onViolation, status, isCorrectLink }) => {
  const [drag, setDrag] = useState(null); // { from, points }
  const [rejected, setRejected] = useState(null); // { points } shown in red
  const dragRef = useRef(null);
  const timer = useRef(null);

  const rects = useMemo(() => {
    const result = {};
    chips.forEach((chip) => {
      const cx = chip.x * BOARD_WIDTH;
      const cy = chip.y * BOARD_HEIGHT;
      result[chip.id] = {
        cx,
        cy,
        left: cx - CHIP_WIDTH / 2,
        right: cx + CHIP_WIDTH / 2,
        top: cy - CHIP_HEIGHT / 2,
        bottom: cy + CHIP_HEIGHT / 2,
      };
    });
    return result;
  }, [chips]);

  const latest = useRef({});
  latest.current = { chips, lines, onChange, onViolation, status, rects };

  useEffect(() => () => clearTimeout(timer.current), []);

  // The red line stays up while the popup is open and goes when the flow resets.
  useEffect(() => {
    if (status === null) {
      setRejected(null);
    }
  }, [status]);

  // These only read `latest`, so they never change identity.
  const centerOf = useCallback(
    (id) => ({ x: latest.current.rects[id].cx, y: latest.current.rects[id].cy }),
    [],
  );

  // The box under a point (with a little slop), nearest centre wins.
  const chipAt = useCallback((x, y) => {
    const { chips: all, rects: boxes } = latest.current;
    let best = null;
    let bestDistance = Infinity;
    all.forEach((chip) => {
      const r = boxes[chip.id];
      const inside =
        x >= r.left - TOUCH_SLOP &&
        x <= r.right + TOUCH_SLOP &&
        y >= r.top - TOUCH_SLOP &&
        y <= r.bottom + TOUCH_SLOP;
      const distance = Math.hypot(x - r.cx, y - r.cy);
      if (inside && distance < bestDistance) {
        best = chip.id;
        bestDistance = distance;
      }
    });
    return best;
  }, []);

  // Does the piece a→b cross a line that is already drawn? Pieces that sit
  // wholly inside boxes are skipped: lines meeting at one box always overlap there.
  const crossesExisting = useCallback((a, b) => {
    const { chips: all, rects: boxes, lines: drawn } = latest.current;
    const inBox = (p) => all.some((chip) => pointInRect(p, boxes[chip.id]));
    if (inBox(a) && inBox(b)) {
      return false;
    }
    // The first and last piece of a drawn line are the tucked-in ends inside its boxes.
    return drawn.some((line) =>
      line.points.some(
        (p, i) =>
          i > 1 && i < line.points.length - 1 && segmentsCross(a, b, line.points[i - 1], p),
      ),
    );
  }, []);

  const violate = useCallback((points) => {
    clearTimeout(timer.current);
    setRejected({ points });
    latest.current.onViolation();
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (e) => {
          const { locationX: x, locationY: y } = e.nativeEvent;
          return !latest.current.status && chipAt(x, y) !== null;
        },
        onPanResponderGrant: (e) => {
          const { locationX: x, locationY: y } = e.nativeEvent;
          const from = chipAt(x, y);
          // `visited` collects every other box the path runs over.
          dragRef.current = { from, startX: x, startY: y, points: [{ x, y }], visited: new Set() };
          setDrag({ from, points: dragRef.current.points });
        },
        onPanResponderMove: (_, g) => {
          const d = dragRef.current;
          if (!d) {
            return;
          }
          const p = {
            x: clamp(d.startX + g.dx, BOARD_WIDTH),
            y: clamp(d.startY + g.dy, BOARD_HEIGHT),
          };
          const last = d.points[d.points.length - 1];
          if (Math.hypot(p.x - last.x, p.y - last.y) < MIN_POINT_GAP) {
            return;
          }
          latest.current.chips.forEach((chip) => {
            if (chip.id !== d.from && segmentHitsRect(last, p, latest.current.rects[chip.id])) {
              d.visited.add(chip.id);
            }
          });
          d.points.push(p);
          if (crossesExisting(last, p)) {
            dragRef.current = null;
            setDrag(null);
            violate([...d.points]);
            return;
          }
          setDrag({ from: d.from, points: [...d.points] });
        },
        onPanResponderRelease: (_, g) => {
          const d = dragRef.current;
          dragRef.current = null;
          setDrag(null);
          if (!d) {
            return;
          }
          const end = {
            x: clamp(d.startX + g.dx, BOARD_WIDTH),
            y: clamp(d.startY + g.dy, BOARD_HEIGHT),
          };
          const to = chipAt(end.x, end.y);
          if (!to || to === d.from) {
            return; // let go in empty space: just throw the line away
          }
          const last = d.points[d.points.length - 1];
          const points = [...d.points, end];
          if (crossesExisting(last, end)) {
            violate(points);
            return;
          }
          // Ending in a box is fine; running over any other box on the way is not.
          latest.current.chips.forEach((chip) => {
            if (chip.id !== d.from && segmentHitsRect(last, end, latest.current.rects[chip.id])) {
              d.visited.add(chip.id);
            }
          });
          d.visited.delete(to);
          if (d.visited.size > 0) {
            violate(points);
            return;
          }
          const { lines: drawn } = latest.current;
          if (drawn.some((l) => (l.a === d.from && l.b === to) || (l.a === to && l.b === d.from))) {
            clearTimeout(timer.current);
            setRejected({ points });
            timer.current = setTimeout(() => setRejected(null), FLASH_MS);
            return;
          }
          // Tuck the ends into the boxes so the line looks like it comes out of them.
          latest.current.onChange([
            ...drawn,
            { a: d.from, b: to, points: [centerOf(d.from), ...points, centerOf(to)] },
          ]);
        },
        onPanResponderTerminate: () => {
          dragRef.current = null;
          setDrag(null);
        },
      }),
    [chipAt, crossesExisting, centerOf, violate],
  );

  const degree = (id) => lines.filter((l) => l.a === id || l.b === id).length;

  return (
    <View style={[styles.board, BaseStyle.overflowHidden]}>
      {/* Lines sit under the boxes so they look like they come out of them. */}
      {lines.map((line, i) => (
        <Path
          key={`${line.a}-${line.b}`}
          points={line.points}
          color={
            status === 'checked'
              ? isCorrectLink(line.a, line.b)
                ? gameWinColor
                : gameLoseColor
              : lineColor(i)
          }
        />
      ))}
      {rejected && <Path points={rejected.points} color={gameLoseColor} />}
      {drag && <Path points={drag.points} color={lineColor(lines.length)} />}

      {chips.map((chip) => {
        const r = rects[chip.id];
        const isActor = chip.type === 'actor';
        const lit = degree(chip.id) > 0 || (drag && drag.from === chip.id);
        return (
          <View
            key={chip.id}
            style={[
              styles.chip,
              BaseStyle.positionAbsolute,
              BaseStyle.alignJustifyCenter,
              { left: r.left, top: r.top },
              isActor ? styles.actorChip : styles.actionChip,
              lit && styles.litChip,
            ]}>
            <Text
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={[styles.label, isActor && styles.actorLabel]}>
              {chip.label}
            </Text>
          </View>
        );
      })}

      {/* Transparent layer on top: the only thing that receives touches. */}
      <View
        style={[BaseStyle.positionAbsolute, BaseStyle.widthHeight100]}
        {...panResponder.panHandlers}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    backgroundColor: gameCardColor,
    borderRadius: spacings.xxxxLarge,
    borderWidth: 1,
    borderColor: authBorderColor,
  },
  chip: {
    width: CHIP_WIDTH,
    height: CHIP_HEIGHT,
    borderRadius: spacings.large,
    borderWidth: 2,
    paddingHorizontal: spacings.normal,
  },
  actionChip: {
    backgroundColor: gameSlotBgColor,
    borderColor: authBorderColor,
  },
  actorChip: {
    backgroundColor: gameAccentColor,
    borderColor: gameAccentColor,
  },
  litChip: {
    borderColor: gameTextColor,
  },
  label: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeSmall'),
    fontWeight: fontWeight('fontWeightMedium'),
    textAlign: 'center',
  },
  actorLabel: {
    color: gameTileTextColor,
    fontWeight: fontWeight('fontWeightMedium1x'),
  },
});

export default FlowBoard;
