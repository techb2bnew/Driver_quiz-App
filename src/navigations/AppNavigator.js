import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import FadeView from '../components/FadeView';
import HomeScreen from '../screens/HomeScreen';
import LevelsScreen from '../screens/LevelsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import QuizScreen from '../screens/QuizScreen';
import ResultScreen from '../screens/ResultScreen';
import SplashScreen from '../screens/SplashScreen';
import { BaseStyle } from '../constant/Style';
import { SCREENS } from '../constant/Constants';
import { preloadSounds } from '../utils/sound';
import { gameBgColor } from '../constant/Color';

// A handful of screens and a simple flow, so a tiny state machine does the job
// without a navigation library (and its native dependencies).
const AppNavigator = () => {
  const [route, setRoute] = useState({ name: SCREENS.SPLASH, params: {} });

  const navigate = useCallback((name, params = {}) => setRoute({ name, params }), []);

  useEffect(() => {
    preloadSounds();
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      // Quiz and Result go back to the level list, the list to Home; elsewhere the OS decides.
      if (route.name === SCREENS.QUIZ || route.name === SCREENS.RESULT) {
        navigate(SCREENS.LEVELS);
        return true;
      }
      if (route.name === SCREENS.LEVELS) {
        navigate(SCREENS.HOME);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [route.name, navigate]);

  const renderScreen = () => {
    switch (route.name) {
      case SCREENS.SPLASH:
        return <SplashScreen navigate={navigate} />;
      case SCREENS.ONBOARDING:
        return <OnboardingScreen navigate={navigate} />;
      case SCREENS.HOME:
        return <HomeScreen navigate={navigate} />;
      case SCREENS.LEVELS:
        return <LevelsScreen navigate={navigate} />;
      case SCREENS.QUIZ:
        return (
          <QuizScreen
            key={route.params.runId}
            levelId={route.params.levelId}
            done={route.params.done}
            hintUsed={route.params.hintUsed}
            onExit={() => navigate(SCREENS.LEVELS)}
            onFinish={(result) => navigate(SCREENS.RESULT, result)}
          />
        );
      case SCREENS.RESULT:
        return (
          <ResultScreen
            navigate={navigate}
            levelId={route.params.levelId}
            score={route.params.score}
            isNewBest={route.params.isNewBest}
          />
        );
      default:
        return null;
    }
  };

  // Keyed by screen so every change replays the fade. Offset 0 = fade only.
  return (
    <FadeView
      key={`${route.name}-${route.params.runId || ''}`}
      style={[BaseStyle.flex, { backgroundColor: gameBgColor }]}
      duration={350}
      offset={0}>
      {renderScreen()}
    </FadeView>
  );
};

export default AppNavigator;
