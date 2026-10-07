import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import FadeView from '../components/FadeView';
import FlowBoard from '../components/FlowBoard';
import QuizHeader from '../components/QuizHeader';
import ResultModal from '../components/Modals/ResultModal';
import useBestScore from '../hooks/useBestScore';
import { BaseStyle } from '../constant/Style';
import { SCORE, STRINGS, TIMING } from '../constant/Constants';
import { QUESTIONS } from '../constant/Questions';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight } from '../utils/typography';
import {
  gameAccentColor,
  gameBgColor,
  gameCardColor,
  gameMutedTextColor,
  gameTextColor,
  gameAccentWash,
  gameArenaBorderColor,
} from '../constant/Color';

const TOTAL = QUESTIONS.length;

// Each question has several ready-made box layouts; show a different one each time.
const pickLayout = (question) => Math.floor(Math.random() * question.layouts.length);

// A link is the same whichever box you started from.
const linkKey = (a, b) => [a, b].sort().join('|');

const QuizScreen = ({ onFinish, onExit }) => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0); // wrong tries on this question
  const [layoutIndex, setLayoutIndex] = useState(() => pickLayout(QUESTIONS[0]));
  const [lines, setLines] = useState([]); // [{ a, b, points }]
  const [status, setStatus] = useState(null); // null | 'checked' | 'violation'
  const [modal, setModal] = useState({ visible: false, type: 'correct', points: 0 });
  const timer = useRef(null);
  const { saveIfBest } = useBestScore();

  // Leaving mid-quiz (the X, or the back button) still keeps the best score reached.
  const scoreRef = useRef(0);
  scoreRef.current = score;
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (scoreRef.current > 0) {
        saveIfBest(scoreRef.current);
      }
    },
    [saveIfBest],
  );

  const question = QUESTIONS[index];
  const isLast = index === TOTAL - 1;
  const required = question.links.length;
  const chips = useMemo(
    () =>
      question.chips.map((chip) => {
        const [x, y] = question.layouts[layoutIndex][chip.id];
        return { ...chip, x, y };
      }),
    [question, layoutIndex],
  );
  const correctKeys = useMemo(
    () => new Set(question.links.map(([a, b]) => linkKey(a, b))),
    [question],
  );
  const isCorrectLink = (a, b) => correctKeys.has(linkKey(a, b));

  const onCheck = () => {
    const correct = lines.length === required && lines.every((l) => isCorrectLink(l.a, l.b));
    const points = Math.max(
      SCORE.MIN_POINTS,
      SCORE.POINTS_PER_QUESTION - attempts * SCORE.PENALTY_PER_RETRY,
    );
    setStatus('checked');
    if (correct) {
      setScore((s) => s + points);
    } else {
      setAttempts((a) => a + 1);
    }
    // Let the green/red lines show before the popup covers them.
    timer.current = setTimeout(
      () => setModal({ visible: true, type: correct ? 'correct' : 'wrong', points }),
      TIMING.RESULT_MODAL_DELAY_MS,
    );
  };

  // Crossing / overlapping ends the attempt: show the line, then explain and reset.
  const onViolation = () => {
    setStatus('violation');
    timer.current = setTimeout(
      () => setModal({ visible: true, type: 'overlap', points: 0 }),
      TIMING.VIOLATION_MODAL_DELAY_MS,
    );
  };

  const resetBoard = () => {
    setLines([]);
    setStatus(null);
  };

  const onModalPress = () => {
    setModal((m) => ({ ...m, visible: false }));
    if (modal.type === 'wrong' || modal.type === 'overlap') {
      resetBoard();
    } else if (isLast) {
      onFinish(score);
    } else {
      resetBoard();
      setAttempts(0);
      setLayoutIndex(pickLayout(QUESTIONS[index + 1]));
      setIndex((i) => i + 1);
    }
  };

  return (
    <SafeAreaView style={[BaseStyle.flex, styles.container]}>
      <StatusBar barStyle="light-content" backgroundColor={gameBgColor} />
      <QuizHeader current={index + 1} total={TOTAL} score={score} onBack={onExit} />

      <View style={[BaseStyle.flex, BaseStyle.alignItemsCenter]}>
        {/* key remounts the block per question so the entrance animation replays. */}
        <FadeView key={question.id} style={BaseStyle.alignItemsCenter}>
          <View style={[styles.questionCard, BaseStyle.width100Percent]}>
            <View style={styles.accentBar} />
            <Text style={styles.question}>{question.title}</Text>
            <Text style={styles.hint}>{STRINGS.QUIZ.HINT}</Text>
            <View style={styles.linkPill}>
              <Text style={styles.links}>{STRINGS.QUIZ.LINKS(lines.length)}</Text>
            </View>
          </View>
          <FlowBoard
            chips={chips}
            lines={lines}
            onChange={setLines}
            onViolation={onViolation}
            status={status}
            isCorrectLink={isCorrectLink}
          />
        </FadeView>
      </View>

      <View style={[styles.actions, BaseStyle.flexDirectionRow]}>
        <AppButton
          title={STRINGS.QUIZ.RESET}
          variant="secondary"
          onPress={resetBoard}
          disabled={status !== null || lines.length === 0}
          style={styles.smallButton}
        />
        <AppButton
          title={STRINGS.QUIZ.UNDO}
          variant="secondary"
          onPress={() => setLines((current) => current.slice(0, -1))}
          disabled={status !== null || lines.length === 0}
          style={styles.smallButton}
        />
        <AppButton
          title={STRINGS.QUIZ.CHECK}
          onPress={onCheck}
          disabled={lines.length === 0 || status !== null}
          style={styles.checkButton}
        />
      </View>

      <ResultModal
        visible={modal.visible}
        type={modal.type}
        points={modal.points}
        isLast={isLast}
        onPress={onModalPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: gameBgColor,
    overflow: 'hidden',
    paddingHorizontal: spacings.xxxxLarge,
    paddingTop: spacings.xxxxLarge,
  },
  questionCard: {
    backgroundColor: gameCardColor,
    borderRadius: spacings.xxxxLarge,
    borderWidth: 1,
    borderColor: gameArenaBorderColor,
    padding: spacings.xxLarge,
    marginVertical: spacings.large,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: gameAccentColor,
  },
  question: {
    color: gameTextColor,
    fontSize: fontSize('fontSizeNormal2x'),
    fontWeight: fontWeight('fontWeightMedium1x'),
    textAlign: 'center',
  },
  hint: {
    color: gameMutedTextColor,
    fontSize: fontSize('fontSizeSmall1x'),
    textAlign: 'center',
    marginTop: spacings.small,
  },
  actions: {
    paddingBottom: spacings.xxLarge,
  },
  smallButton: {
    width: 'auto',
    flex: 1,
    marginRight: spacings.large,
  },
  checkButton: {
    width: 'auto',
    flex: 1.6,
  },
  linkPill: {
    alignSelf: 'center',
    marginTop: spacings.large,
    paddingVertical: spacings.small,
    paddingHorizontal: spacings.xxLarge,
    borderRadius: spacings.Large2x,
    backgroundColor: gameAccentWash,
  },
  links: {
    color: gameAccentColor,
    fontSize: fontSize('fontSizeSmall1x'),
    fontWeight: fontWeight('fontWeightBold'),
    textAlign: 'center',
  },
});

export default QuizScreen;
