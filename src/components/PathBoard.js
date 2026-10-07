import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { BaseStyle } from '../constant/Style';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight } from '../utils/typography';
import {
  circleBlueColor,
  circleOutlineColor,
  circleRedColor,
  circleYellowColor,
  gameAccentColor,
  gameArenaBorderColor,
  gameBgColor,
  gameCardColor,
  gameLoseColor,
  gameTextColor,
  gameTileTextColor,
  gameWinColor,
} from '../constant/Color';
import { makeCircles } from '../utils/boardLayout';
import { segmentsIntersect } from '../utils/geometry';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

export const BOARD_WIDTH = wp(100) - spacings.xxxxLarge * 2;
export const BOARD_HEIGHT = hp(46);
// The circles the labels are placed on. Shared with the screen that arranges them.
export const CIRCLES = makeCircles(BOARD_WIDTH, BOARD_HEIGHT, wp(21));

const COLUMN_FILLS = [circleRedColor, circleBlueColor, circleYellowColor];
const COLUMN_TEXT = [gameTextColor, gameTextColor, gameTileTextColor]; // dark on the light fill
const LINE_THICKNESS = 5;
const OUTLINE_EXTRA = 4; // the dark edge around a line, so it shows on every circle colour
const MIN_POINT_GAP = 6; // a new point is kept only after the finger moved this far
const TOUCH_SLOP = spacings.large; // how far outside a circle a touch still counts
const ENTER_RATIO = 0.8; // a line "touches" a circle once it gets this deep into it

// One short piece of a freehand line, with its dark edge. Memoised so a growing line
// only renders its newest pieces while the finger moves.
const Segment = memo(({ x1, y1, x2, y2, color, thickness }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy) + thickness / 2;
  return (
    <View
      pointerEvents="none"
      style={[
        BaseStyle.positionAbsolute,
        {
          left: (x1 + x2) / 2 - length / 2,
          top: (y1 + y2) / 2 - thickness / 2,
          width: length,
          height: thickness,
          borderRadius: thickness,
          backgroundColor: color,
          transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
        },
      ]}
    />
  );
});

const Line = memo(({ points, color }) => (
  <>
    {points.slice(1).map((p, i) => (
      <Segment
        key={`edge-${i}`}
        x1={points[i].x}
        y1={points[i].y}
        x2={p.x}
        y2={p.y}
        color={gameBgColor}
        thickness={LINE_THICKNESS + OUTLINE_EXTRA}
      />
    ))}
    {points.slice(1).map((p, i) => (
      <Segment
        key={i}
        x1={points[i].x}
        y1={points[i].y}
        x2={p.x}
        y2={p.y}
        color={color}
        thickness={LINE_THICKNESS}
      />
    ))}
  </>
));

const clamp = (value, max) => Math.min(Math.max(value, 0), max);

/**
 * nodes: [{ id, label, cell }] — `cell` is an index into CIRCLES.
 * chain: [nodeId, ...] — the circles joined so far, in order (owned by the parent).
 * onChange(chain): the chain grew — one circle, or several if the player drew through
 *         them all in one go.
 * onViolation(): the line the player drew crosses or overlaps another line, or loops
 *         back through a circle already in the path.
 * status: null while playing; 'correct' | 'wrong' | 'violation' once judged (the
 *         board is then locked and the lines coloured).
 *
 * Draw with a finger and the line follows it. Every circle the line runs through joins
 * the chain, in order, so a whole route can be drawn without lifting the finger — or
 * one line at a time. The first line can start on any circle; after that each starts
 * where the last ended. Lifting the finger on empty space just drops the unfinished bit.
 */
const PathBoard = ({ nodes, chain, status, onChange, onViolation }) => {
  const [paths, setPaths] = useState([]); // one freehand line per joined pair, in order
  const [drag, setDrag] = useState(null); // { points, visited: [nodeId] } while drawing
  const [rejected, setRejected] = useState(null); // points of the refused line
  const dragRef = useRef(null);
  const latest = useRef({});
  latest.current = { nodes, chain, paths, status, onChange, onViolation };

  // Undo (or any change of the chain from outside) drops the lines that no longer belong.
  useEffect(() => {
    setPaths((current) => current.slice(0, Math.max(0, chain.length - 1)));
  }, [chain]);

  useEffect(() => {
    if (status === null) {
      setRejected(null);
    }
  }, [status]);

  const centerOf = useCallback((id) => {
    const c = CIRCLES[latest.current.nodes.find((node) => node.id === id).cell];
    return { x: c.cx, y: c.cy };
  }, []);

  // The circle under a point, with a little slop; nearest centre wins.
  const hitNode = useCallback((x, y) => {
    let best = null;
    let bestDistance = Infinity;
    latest.current.nodes.forEach((node) => {
      const c = CIRCLES[node.cell];
      const distance = Math.hypot(x - c.cx, y - c.cy);
      if (distance <= c.r + TOUCH_SLOP && distance < bestDistance) {
        best = node;
        bestDistance = distance;
      }
    });
    return best;
  }, []);

  const insideACircle = useCallback(
    (p) =>
      latest.current.nodes.some((node) => {
        const c = CIRCLES[node.cell];
        return Math.hypot(p.x - c.cx, p.y - c.cy) <= c.r;
      }),
    [],
  );

  // Circles the piece a→b runs into, in the order it meets them.
  const circlesOnSegment = useCallback((a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy || 1;
    const hits = [];
    latest.current.nodes.forEach((node) => {
      const c = CIRCLES[node.cell];
      const t = clamp(((c.cx - a.x) * dx + (c.cy - a.y) * dy) / lengthSquared, 1);
      if (Math.hypot(a.x + dx * t - c.cx, a.y + dy * t - c.cy) <= c.r * ENTER_RATIO) {
        hits.push({ id: node.id, t });
      }
    });
    return hits.sort((m, n) => m.t - n.t).map((h) => h.id);
  }, []);

  // Does the piece a→b cross the line being drawn (`own` = its points so far) or a
  // line already drawn? Pieces wholly inside circles are skipped — lines meet there —
  // and so are the tucked-in first and last pieces of the finished lines.
  const crosses = useCallback(
    (own, a, b) => {
      if (insideACircle(a) && insideACircle(b)) {
        return false;
      }
      for (let i = 1; i < own.length - 2; i++) {
        if (segmentsIntersect(a, b, own[i - 1], own[i])) {
          return true;
        }
      }
      return latest.current.paths.some((path) =>
        path.some((p, i) => i > 1 && i < path.length - 1 && segmentsIntersect(a, b, path[i - 1], p)),
      );
    },
    [insideACircle],
  );

  const refuse = useCallback((points) => {
    dragRef.current = null;
    setDrag(null);
    setRejected(points);
    latest.current.onViolation();
  }, []);

  // The finger reached circle `id`: close the piece of line since the last circle and
  // add `id` to the route. Returns 'revisit' if that circle is already part of the path
  // (the line has looped back), which is not allowed.
  const reach = useCallback(
    (d, ids) => {
      for (const id of ids) {
        const previous = d.visited[d.visited.length - 1];
        if (id === previous) {
          continue;
        }
        if (d.visited.includes(id) || latest.current.chain.includes(id)) {
          return 'revisit';
        }
        // Tuck both ends into their circles so the line looks like it joins them.
        d.hops.push([centerOf(previous), ...d.points.slice(d.hopStart), centerOf(id)]);
        d.hopStart = d.points.length - 1;
        d.visited.push(id);
      }
      return 'ok';
    },
    [centerOf],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (e) => {
          const { locationX: x, locationY: y } = e.nativeEvent;
          const node = hitNode(x, y);
          const { chain: current, status: judged } = latest.current;
          // The first line can start anywhere; the rest start where the last one ended.
          return !judged && node !== null && (current.length === 0 || current[current.length - 1] === node.id);
        },
        onPanResponderGrant: (e) => {
          const { locationX: x, locationY: y } = e.nativeEvent;
          const from = hitNode(x, y).id;
          dragRef.current = {
            startX: x,
            startY: y,
            points: [{ x, y }],
            visited: [from],
            hops: [], // the finished piece of line between each pair of circles
            hopStart: 0,
          };
          setDrag({ points: dragRef.current.points, visited: [from] });
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
          const crossed = crosses(d.points, last, p);
          d.points.push(p);
          const outcome = reach(d, circlesOnSegment(last, p));
          if (crossed || outcome === 'revisit') {
            refuse([...d.points]);
            return;
          }
          setDrag({ points: [...d.points], visited: [...d.visited] });
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
          const last = d.points[d.points.length - 1];
          const crossed = crosses(d.points, last, end);
          d.points.push(end);
          let outcome = reach(d, circlesOnSegment(last, end));
          // Letting go just inside a circle's edge still counts as arriving there.
          const endNode = hitNode(end.x, end.y);
          if (outcome === 'ok' && endNode) {
            outcome = reach(d, [endNode.id]);
          }
          if (crossed || outcome === 'revisit') {
            refuse(d.points);
            return;
          }
          // Only the lines that actually joined circles are kept; a tail ending in
          // empty space is dropped. Nothing joined means nothing to add.
          if (d.visited.length < 2) {
            return;
          }
          const { chain: current, paths: drawn } = latest.current;
          setPaths([...drawn, ...d.hops]);
          latest.current.onChange(current.length === 0 ? d.visited : [...current, ...d.visited.slice(1)]);
        },
        onPanResponderTerminate: () => {
          dragRef.current = null;
          setDrag(null);
        },
      }),
    [hitNode, crosses, circlesOnSegment, refuse, reach],
  );

  const lineColor =
    status === 'correct' ? gameWinColor : status ? gameLoseColor : gameAccentColor;

  return (
    <View style={[styles.board, BaseStyle.overflowHidden]}>
      {nodes.map((node) => {
        const c = CIRCLES[node.cell];
        const on = chain.includes(node.id) || (drag && drag.visited.includes(node.id));
        return (
          <View
            key={node.id}
            style={[
              styles.circle,
              BaseStyle.positionAbsolute,
              {
                left: c.cx - c.r,
                top: c.cy - c.r,
                width: c.r * 2,
                height: c.r * 2,
                borderRadius: c.r,
                backgroundColor: COLUMN_FILLS[c.col],
              },
              on && { borderColor: lineColor },
            ]}
          />
        );
      })}

      {/* Lines are drawn over the circle fills so the route stays visible... */}
      {paths.map((points, i) => (
        <Line key={i} points={points} color={lineColor} />
      ))}
      {rejected && <Line points={rejected} color={gameLoseColor} />}
      {drag && <Line points={drag.points} color={gameAccentColor} />}

      {/* ...and the words go on top, so they can always be read. */}
      {nodes.map((node) => {
        const c = CIRCLES[node.cell];
        return (
          <View
            key={`label-${node.id}`}
            pointerEvents="none"
            style={[
              BaseStyle.positionAbsolute,
              BaseStyle.alignJustifyCenter,
              { left: c.cx - c.r, top: c.cy - c.r, width: c.r * 2, height: c.r * 2 },
            ]}>
            <Text
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              style={[styles.label, { color: COLUMN_TEXT[c.col] }]}>
              {node.label}
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
    borderColor: gameArenaBorderColor,
  },
  circle: {
    borderWidth: 3,
    borderColor: circleOutlineColor,
  },
  label: {
    paddingHorizontal: spacings.normal,
    fontSize: fontSize('fontSizeSmall1x'),
    fontWeight: fontWeight('fontWeightMedium1x'),
    textAlign: 'center',
    // a soft dark halo keeps a word readable where a line runs under it
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});

export default PathBoard;
