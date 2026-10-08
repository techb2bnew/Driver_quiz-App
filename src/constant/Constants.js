export const SCREENS = {
  SPLASH: 'Splash',
  ONBOARDING: 'Onboarding',
  HOME: 'Home',
  LEVELS: 'Levels',
  QUIZ: 'Quiz',
  RESULT: 'Result',
};

export const STORAGE_KEYS = {
  ONBOARDING_DONE: '@drivequiz/onboardingDone',
  BEST_SCORE: '@drivequiz/bestScore',
  PROGRESS: '@drivequiz/progress',
};

export const SCORE = {
  POINTS_PER_QUESTION: 10,
  // Every wrong attempt on a question takes this much off the next try.
  PENALTY_PER_RETRY: 2,
  MIN_POINTS: 2,
  // A level gives one hint; using it takes this much off the score straight away.
  HINT_COST: 3,
};

export const TIMING = {
  SPLASH_MS: 2200,
  RESULT_MODAL_DELAY_MS: 700,
  VIOLATION_MODAL_DELAY_MS: 350,
};

// Every piece of visible text lives here.
export const STRINGS = {
  APP_NAME: 'DriveQuiz',
  TAGLINE: 'Learn the dispatch flow. Drive with confidence.',

  ONBOARDING: {
    SKIP: 'Skip',
    NEXT: 'Next',
    GET_STARTED: 'Get Started',
    SLIDES: [
      {
        id: '1',
        icon: '🚛',
        title: 'Learn the Dispatch Flow',
        description:
          'See who hands what to whom, and which document goes where: Shipper, Broker, Dispatcher, Driver and Receiver.',
      },
      {
        id: '2',
        icon: '✍️',
        title: 'Draw the Path',
        description:
          'Read the question, then draw with your finger through the circles in the right order, starting with the first. Draw the whole route in one go. Some circles are extra.',
      },
      {
        id: '3',
        icon: '⚠️',
        title: 'Keep Lines Clean',
        description:
          'Lines cannot cross or overlap each other, or loop back. Every circle your line runs through counts, so go round the ones you do not want.',
      },
      {
        id: '4',
        icon: '🏆',
        title: 'Climb the Levels',
        description: `Press Check when you are done. Finish a level to unlock the next. Stuck? Each level gives one Hint, which takes ${SCORE.HINT_COST} points off your score.`,
      },
    ],
  },

  HOME: {
    GREETING: 'Ready to drive?',
    SUBTITLE: 'Test what you know about the dispatch flow',
    BEST_SCORE: 'Best Score',
    LEVELS: 'Levels',
    PLAY: 'Play',
    HOW_TO_PLAY: 'How to play',
    RULES: [
      'Read the question, then draw through the circles in order, starting with the first. Draw it all in one go, or one line at a time.',
      'Lines cannot cross or overlap each other. Every circle your line runs through counts, so go round the extra ones.',
      'Press Check when you are done. Wrong? Retry, but you lose points.',
      `Stuck? You get one Hint per level. It takes ${SCORE.HINT_COST} points off your score.`,
    ],
  },

  LEVELS: {
    TITLE: 'Choose a Level',
    LEVEL: (number) => `Level ${number}`,
    PROGRESS: (done, total) => `${done}/${total} done`,
    LOCKED: (previous) => `Finish Level ${previous} to unlock`,
    COMPLETED: (best, max) => `Completed · Best ${best}/${max}`,
  },

  QUIZ: {
    QUESTION_OF: (current, total) => `Question ${current}/${total}`,
    LEVEL_LABEL: (number, name) => `LEVEL ${number} · ${name.toUpperCase()}`,
    SCORE: 'Score',
    HINT: 'Draw through the circles in order, starting with the first. You can do it in one go. Lines cannot cross or overlap.',
    RESET: 'Reset',
    UNDO: 'Undo',
    CHECK: 'Check Answer',
    HINT_BUTTON: (cost) => `Hint −${cost}`,
    HINT_USED: 'Hint used',
  },

  MODAL: {
    CORRECT_TITLE: 'Correct! 🎉',
    CORRECT_MESSAGE: (points) => `Right path. You earned +${points} points.`,
    WRONG_TITLE: 'Not Quite ❌',
    WRONG_MESSAGE: 'That path is not right. Try again.',
    NEXT: 'Next Question',
    FINISH: 'Finish Level',
    RETRY: 'Retry',
    OVERLAP_TITLE: 'Line Not Allowed ⚠️',
    OVERLAP_MESSAGE:
      'Lines cannot cross or overlap each other, or loop back through a circle. This question is reset — draw it again.',
    RESET_FLOW: 'Reset Question',
    HINT_TITLE: 'Hint',
    HINT_BODY: 'Draw through these circles, in this order:',
    HINT_COST: (cost) => `${cost} points are taken off your score.`,
    HINT_OK: 'Got it',
  },

  RESULT: {
    TITLE: (number) => `Level ${number} Complete`,
    YOUR_SCORE: 'Your Score',
    BEST_SCORE: 'Best Score',
    NEW_BEST: '🏆 New Best Score!',
    NEXT_LEVEL: 'Next Level',
    REPLAY: 'Replay Level',
    ALL_LEVELS: 'All Levels',
    MESSAGES: {
      GREAT: 'Excellent driver!',
      GOOD: 'Good job, keep practising.',
      LOW: 'Keep learning, you will get there.',
    },
  },
};
