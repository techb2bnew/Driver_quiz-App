export const SCREENS = {
  SPLASH: 'Splash',
  ONBOARDING: 'Onboarding',
  HOME: 'Home',
  QUIZ: 'Quiz',
  RESULT: 'Result',
};

export const STORAGE_KEYS = {
  ONBOARDING_DONE: '@drivequiz/onboardingDone',
  BEST_SCORE: '@drivequiz/bestScore',
};

export const SCORE = {
  POINTS_PER_QUESTION: 10,
  // Every wrong attempt on a question takes this much off the next try.
  PENALTY_PER_RETRY: 2,
  MIN_POINTS: 2,
};

export const TIMING = {
  SPLASH_MS: 2200,
  RESULT_MODAL_DELAY_MS: 700,
  VIOLATION_MODAL_DELAY_MS: 350,
};

// Every piece of visible text lives here.
export const STRINGS = {
  APP_NAME: 'DriveQuiz',
  TAGLINE: 'Learn your truck. Drive with confidence.',

  ONBOARDING: {
    SKIP: 'Skip',
    NEXT: 'Next',
    GET_STARTED: 'Get Started',
    SLIDES: [
      {
        id: '1',
        icon: '🚛',
        title: 'Know Your Truck',
        description:
          'Learn the parts, dashboard signs and road rules every driver must know.',
      },
      {
        id: '2',
        icon: '🔗',
        title: 'Connect the Flow',
        description:
          'Draw lines from one box to the next to build the dispatch flow in the right order.',
      },
      {
        id: '3',
        icon: '🏆',
        title: 'Beat Your Best',
        description:
          'Score points on every question and try to beat your best score.',
      },
    ],
  },

  HOME: {
    GREETING: 'Ready to drive?',
    SUBTITLE: 'Test what you know about trucks',
    BEST_SCORE: 'Best Score',
    QUESTIONS: 'Questions',
    START_QUIZ: 'Start Quiz',
    HOW_TO_PLAY: 'How to play',
    RULES: [
      'Find the boxes that belong to the flow and join them with your finger. Some boxes are extra.',
      'Lines cannot cross or overlap. If they do, the flow resets.',
      'Join the whole flow, then press Check. Wrong? Retry, but you lose points.',
    ],
  },

  QUIZ: {
    QUESTION_OF: (current, total) => `Question ${current}/${total}`,
    SCORE: 'Score',
    HINT: 'Find the boxes that belong to this flow and join them in order. Some boxes are extra. Lines cannot cross.',
    LINKS: (drawn) => `Links drawn: ${drawn}`,
    CHECK: 'Check Answer',
    RESET: 'Reset',
    UNDO: 'Undo',
  },

  MODAL: {
    CORRECT_TITLE: 'Correct! 🎉',
    CORRECT_MESSAGE: (points) => `Flow is right. You earned +${points} points.`,
    WRONG_TITLE: 'Not Quite ❌',
    WRONG_MESSAGE: 'Some links are not right. Try again.',
    NEXT: 'Next Question',
    FINISH: 'See Result',
    RETRY: 'Retry',
    OVERLAP_TITLE: 'Lines Cannot Cross ⚠️',
    OVERLAP_MESSAGE:
      'Lines cannot cross or overlap each other, or run over a box. This flow is reset — draw it again.',
    RESET_FLOW: 'Reset Flow',
  },

  RESULT: {
    TITLE: 'Quiz Complete',
    YOUR_SCORE: 'Your Score',
    BEST_SCORE: 'Best Score',
    NEW_BEST: '🏆 New Best Score!',
    PLAY_AGAIN: 'Play Again',
    HOME: 'Home',
    MESSAGES: {
      GREAT: 'Excellent driver!',
      GOOD: 'Good job, keep practising.',
      LOW: 'Keep learning, you will get there.',
    },
  },
};
