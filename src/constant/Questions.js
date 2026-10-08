// The questions, grouped into levels, copied from the dispatch-flow notebook.
// `id: 'nb7'` means notebook question 7, so a question can be found in the notes.
//
// A question is a path through the circles on the board:
//   title: the question as asked. It names who gives what, not who receives it.
//   path:  the circles to draw through, in order. The last one is the answer.
//          (Two circles may share a label; the answer is checked by label.)
//   note:  one plain sentence for the Hint popup.
// The other circles on the board are decoys picked at random from DECOY_POOL.
//
// Dropped from the notebook: #8 (crossed out) and #12 (the same question as #4), so 20
// different questions: 5 levels of 4.
export const LEVELS = [
  {
    id: 1,
    name: 'Load Handoff',
    questions: [
      {
        id: 'nb1',
        title: 'Shipper gives Commodity to whom?',
        path: ['Shipper', 'Commodity', 'Driver'],
        note: 'The Shipper gives the Commodity to the Driver at pickup.',
      },
      {
        id: 'nb2',
        title: 'Driver gives Commodity to whom?',
        path: ['Driver', 'Commodity', 'Receiver'],
        note: 'The Driver delivers the Commodity to the Receiver.',
      },
      {
        id: 'nb3',
        title: 'Shipper gives BOL to whom?',
        path: ['Shipper', 'BOL', 'Driver'],
        note: 'The Shipper gives the BOL to the Driver when the load is picked up.',
      },
      {
        id: 'nb7',
        title: 'Driver gives BOL at the time of delivery. To whom?',
        path: ['Driver', 'BOL', 'Receiver'],
        note: 'At delivery the Driver hands the BOL to the Receiver.',
      },
    ],
  },
  {
    id: 2,
    name: 'Rates and Orders',
    questions: [
      {
        id: 'nb4',
        title: 'Broker gives Rate Confirmation to whom?',
        path: ['Broker', 'Rate Confirmation', 'Dispatcher'],
        note: 'The Broker sends the Rate Confirmation to the Dispatcher.',
      },
      {
        id: 'nb5',
        title: 'Dispatcher gives Rate Confirmation to whom?',
        path: ['Dispatcher', 'Rate Confirmation', 'Driver'],
        note: 'The Dispatcher passes the Rate Confirmation on to the Driver.',
      },
      {
        id: 'nb17',
        title: 'Shipper gives P.O. No. to whom?',
        path: ['Shipper', 'P.O. No.', 'Broker'],
        note: 'The Shipper gives the P.O. No. to the Broker.',
      },
      {
        id: 'nb16',
        title: 'Broker gives P.O. No. to whom?',
        path: ['Broker', 'P.O. No.', 'Dispatcher'],
        note: 'The Broker passes the P.O. No. to the Dispatcher.',
      },
    ],
  },
  {
    id: 3,
    name: 'Dispatch Paperwork',
    questions: [
      {
        id: 'nb15',
        title: 'Dispatcher gives P.O. No. to whom?',
        path: ['Dispatcher', 'P.O. No.', 'Driver'],
        note: 'The Dispatcher gives the P.O. No. to the Driver.',
      },
      {
        id: 'nb6',
        title: 'Driver gives BOL after picking up the load. To whom?',
        path: ['Driver', 'BOL', 'Dispatcher'],
        note: 'After pickup the Driver sends the BOL to the Dispatcher.',
      },
      {
        id: 'nb13',
        title: 'Dispatcher gives Driver Information to whom?',
        path: ['Dispatcher', 'Driver Info', 'Broker'],
        note: 'The Dispatcher gives the Driver Information to the Broker.',
      },
      {
        id: 'nb14',
        title: 'Broker gives Driver Information to whom?',
        path: ['Broker', 'Driver Info', 'Shipper'],
        note: 'The Broker passes the Driver Information to the Shipper.',
      },
    ],
  },
  {
    id: 4,
    name: 'Driver Documents',
    questions: [
      {
        id: 'nb18',
        title: 'Dispatcher gives Driver’s CDL to whom?',
        path: ['Dispatcher', 'CDL', 'Broker'],
        note: 'The Dispatcher gives the Driver’s CDL to the Broker.',
      },
      {
        id: 'nb19',
        title: 'Broker gives Driver’s CDL to whom?',
        path: ['Broker', 'CDL', 'Shipper'],
        note: 'The Broker passes the Driver’s CDL on to the Shipper.',
      },
      {
        id: 'nb20',
        title: 'Dispatcher gives Permit to whom?',
        path: ['Dispatcher', 'Permit', 'Driver'],
        note: 'The Dispatcher gives the Permit to the Driver.',
      },
      {
        id: 'nb21',
        title: 'Driver shows Permit to whom?',
        path: ['Driver', 'Permit', 'Shipper'],
        note: 'The Driver shows the Permit to the Shipper.',
      },
    ],
  },
  {
    id: 5,
    name: 'Proof of Delivery',
    questions: [
      {
        id: 'nb8',
        title: 'Receiver gives POD to whom?',
        path: ['Receiver', 'POD', 'Driver'],
        note: 'The Receiver gives the POD to the Driver after delivery.',
      },
      {
        id: 'nb9',
        title: 'Driver gives POD to whom?',
        path: ['Driver', 'POD', 'Dispatcher'],
        note: 'The Driver gives the POD to the Dispatcher.',
      },
      {
        id: 'nb10',
        title: 'Dispatcher gives POD to whom?',
        path: ['Dispatcher', 'POD', 'Broker'],
        note: 'The Dispatcher passes the POD to the Broker.',
      },
      {
        id: 'nb11',
        title: 'Broker gives POD to whom?',
        path: ['Broker', 'POD', 'Shipper'],
        note: 'The Broker gives the POD to the Shipper.',
      },
    ],
  },
];

export const ALL_QUESTIONS = LEVELS.flatMap((level) =>
  level.questions.map((question) => ({ ...question, levelId: level.id })),
);

// Everything a circle can say: every word used in a path. Each question fills its
// spare circles from here, so the extra circles are always believable.
export const DECOY_POOL = [...new Set(ALL_QUESTIONS.flatMap((question) => question.path))];
