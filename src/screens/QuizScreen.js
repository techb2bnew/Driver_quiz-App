import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import FadeView from '../components/FadeView';
import HintModal from '../components/Modals/HintModal';
import ResultModal from '../components/Modals/ResultModal';
import PathBoard, { CIRCLES } from '../components/PathBoard';
import QuizHeader from '../components/QuizHeader';
import { BaseStyle } from '../constant/Style';
import { SCORE, STRINGS, TIMING } from '../constant/Constants';
import { DECOY_POOL, LEVELS } from '../constant/Questions';
import { spacings } from '../constant/Fonts';
import { fontSize, fontWeight } from '../utils/typography';
import {
  gameAccentColor,
  gameArenaBorderColor,
  gameBgColor,
  gameCardColor,
  gameMutedTextColor,
  gameTextColor,
} from '../constant/Color';
import { arrangeCircles } from '../utils/boardLayout';
import { firstUnfinished, levelScore } from '../utils/levels';
import { finishLevel, markHintUsed, markQuestionDone } from '../utils/progress';

// Put a question's circles on the board in a fresh random arrangement that is
// guaranteed to be drawable (see utils/boardLayout.js).
const arrange = (question) =>
  arrangeCircles({
    path: question.path,
    pool: DECOY_POOL,
    circles: CIRCLES,
  }).nodes;

/**
 * levelId: which level to play. done: the saved { questionId: points } map, so a
 * level that was left half-way resumes at its first unfinished question.
 * hintUsed: the level's single hint was already spent in an earlier visit.
 * onFinish({ levelId, score, isNewBest }): the last question of the level was answered.
 */
const QuizScreen = ({ levelId, done, hintUsed: hintSpent, onFinish, onExit }) => {
  const level = LEVELS.find((l) => l.id === levelId);
  const questions = level.questions;
  const saved = done || {};

  const [index, setIndex] = useState(() => firstUnfinished(level, saved));
  const [earned, setEarned] = useState(saved); // questionId -> points, this level included
  const [nodes, setNodes] = useState(() => arrange(questions[firstUnfinished(level, saved)]));
  const [chain, setChain] = useState([]); // circle ids joined so far, in order
  const [boardKey, setBoardKey] = useState(0);
  const [attempts, setAttempts] = useState(0); // wrong tries on this question
  // One hint per level: `hintSpent` stays true for the rest of the level, while
  // `hintHere` only marks the question it was used on (that question pays for it).
  const [levelHintUsed, setLevelHintUsed] = useState(!!hintSpent);
  const [hintHere, setHintHere] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [status, setStatus] = useState(null); // null | 'correct' | 'wrong' | 'violation'
  const [modal, setModal] = useState({ visible: false, type: 'correct', points: 0 });
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const score = levelScore(level, earned);

  const showModal = (type, points, delay) => {
    timer.current = setTimeout(() => setModal({ visible: true, type, points }), delay);
  };

  const onCheck = () => {
    const labels = chain.map((id) => nodes.find((n) => n.id === id).label);
    const correct =
      labels.length === question.path.length && labels.every((l, i) => l === question.path[i]);
    const points = Math.max(
      SCORE.MIN_POINTS,
      SCORE.POINTS_PER_QUESTION -
        attempts * SCORE.PENALTY_PER_RETRY -
        (hintHere ? SCORE.HINT_COST : 0),
    );
    setStatus(correct ? 'correct' : 'wrong');
    if (correct) {
      setEarned({ ...earned, [question.id]: points });
      markQuestionDone(question.id, points); // saved now, so quitting at the popup keeps it
    } else {
      setAttempts(attempts + 1);
    }
    // Let the green/red path show before the popup covers it.
    showModal(correct ? 'correct' : 'wrong', points, TIMING.RESULT_MODAL_DELAY_MS);
  };

  // A line that crosses another or runs over a circle ends the attempt: show it, then explain and reset.
  const onViolation = () => {
    setStatus('violation');
    showModal('overlap', 0, TIMING.VIOLATION_MODAL_DELAY_MS);
  };

  const resetBoard = () => {
    setChain([]);
    setStatus(null);
    setBoardKey((k) => k + 1);
  };

  const onHint = () => {
    setLevelHintUsed(true);
    setHintHere(true);
    setHintOpen(true);
    markHintUsed(level.id);
  };

  const onModalPress = async () => {
    setModal((m) => ({ ...m, visible: false }));
    if (modal.type === 'wrong' || modal.type === 'overlap') {
      resetBoard();
    } else if (isLast) {
      const { isNewBest } = await finishLevel(level.id, score);
      onFinish({ levelId: level.id, score, isNewBest });
    } else {
      setNodes(arrange(questions[index + 1]));
      setChain([]);
      setAttempts(0);
      setHintHere(false);
      setStatus(null);
      setBoardKey((k) => k + 1);
      setIndex(index + 1);
    }
  };

  return (
    <SafeAreaView style={[BaseStyle.flex, styles.container]}>
      <StatusBar barStyle="light-content" backgroundColor={gameBgColor} />
      <QuizHeader current={index + 1} total={questions.length} score={score} onBack={onExit} />

      <View style={[BaseStyle.flex, BaseStyle.alignItemsCenter]}>
        {/* key remounts the block per question so the entrance animation replays. */}
        <FadeView key={question.id} style={BaseStyle.alignItemsCenter}>
          <View style={[styles.questionCard, BaseStyle.width100Percent]}>
            <View style={styles.accentBar} />
            <Text style={styles.kicker}>{STRINGS.QUIZ.LEVEL_LABEL(level.id, level.name)}</Text>
            <Text style={styles.question}>{question.title}</Text>
            <Text style={styles.hint}>{STRINGS.QUIZ.HINT}</Text>
          </View>
          <PathBoard
            key={`${question.id}-${boardKey}`}
            nodes={nodes}
            chain={chain}
            status={status}
            onChange={setChain}
            onViolation={onViolation}
          />
        </FadeView>
      </View>

      <View style={styles.actions}>
        <View style={[BaseStyle.flexDirectionRow, styles.tools]}>
          <AppButton
            title={STRINGS.QUIZ.RESET}
            variant="secondary"
            onPress={resetBoard}
            disabled={status !== null || chain.length === 0}
            style={styles.toolButton}
          />
          <AppButton
            title={STRINGS.QUIZ.UNDO}
            variant="secondary"
            onPress={() => setChain(chain.length <= 2 ? [] : chain.slice(0, -1))}
            disabled={status !== null || chain.length === 0}
            style={styles.toolButton}
          />
          <AppButton
            title={levelHintUsed ? STRINGS.QUIZ.HINT_USED : STRINGS.QUIZ.HINT_BUTTON(SCORE.HINT_COST)}
            variant="secondary"
            onPress={onHint}
            disabled={status !== null || levelHintUsed}
            style={styles.lastToolButton}
          />
        </View>
        <AppButton
          title={STRINGS.QUIZ.CHECK}
          onPress={onCheck}
          disabled={chain.length < 2 || status !== null}
        />
      </View>

      <HintModal
        visible={hintOpen}
        steps={question.path}
        note={question.note}
        cost={SCORE.HINT_COST}
        onClose={() => setHintOpen(false)}
      />

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
  kicker: {
    color: gameAccentColor,
    fontSize: fontSize('fontSizeSmall'),
    fontWeight: fontWeight('fontWeightMedium1x'),
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: spacings.small,
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
  tools: {
    marginBottom: spacings.large,
  },
  toolButton: {
    width: 'auto',
    flex: 1,
    marginRight: spacings.large,
  },
  lastToolButton: {
    width: 'auto',
    flex: 1,
  },
});

export default QuizScreen;
