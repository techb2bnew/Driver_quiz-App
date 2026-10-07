// The questions, grouped into levels (easy first), taken from the dispatch-flow notes.
//
// A question is a path through the circles on the board:
//   title: what the player is asked (it names where the path starts, not the whole path).
//   path:  the circles to swipe through, in order. Two circles may share a label
//          (e.g. 'RC' twice); the answer is checked by label.
//   note:  one plain sentence for the Hint popup.
// The other circles on the board are decoys picked at random from DECOY_POOL.
export const LEVELS = [
  {
    id: 1,
    name: 'Getting Started',
    questions: [
      {
        id: 'l1q1',
        title: 'Follow the BOL from the Shipper to the Driver.',
        path: ['Shipper', 'BOL', 'Driver'],
        note: 'The Shipper gives the BOL to the Driver at pickup.',
      },
      {
        id: 'l1q2',
        title: 'Follow the Product from the Driver to the Receiver.',
        path: ['Driver', 'Product', 'Receiver'],
        note: 'The Driver delivers the Product to the Receiver.',
      },
      {
        id: 'l1q3',
        title: 'Follow the Pickup No from the Dispatcher to the Driver.',
        path: ['Dispatcher', 'Pickup No', 'Driver'],
        note: 'The Dispatcher gives the Driver the Pickup No to collect the load.',
      },
    ],
  },
  {
    id: 2,
    name: 'Pickup Numbers',
    questions: [
      {
        id: 'l2q1',
        title: 'Follow the Pickup No from the Broker to the Dispatcher.',
        path: ['Broker', 'Pickup No', 'Dispatcher'],
        note: 'The Broker passes the Pickup No to the Dispatcher.',
      },
      {
        id: 'l2q2',
        title: 'Follow the Pickup No from the Shipper to the Broker.',
        path: ['Shipper', 'Pickup No', 'Broker'],
        note: 'The Shipper gives the Pickup No to the Broker.',
      },
      {
        id: 'l2q3',
        title: 'Follow the Compliance from the ELD to the Driver.',
        path: ['ELD', 'Compliance', 'Driver'],
        note: 'The ELD records driving hours, and the Compliance report goes to the Driver.',
      },
    ],
  },
  {
    id: 3,
    name: 'Key Documents',
    questions: [
      {
        id: 'l3q1',
        title: 'Follow the Product from the Shipper all the way to the Receiver.',
        path: ['Shipper', 'Product', 'Driver', 'Receiver'],
        note: 'The Shipper gives the Product to the Driver, who carries it on to the Receiver.',
      },
      {
        id: 'l3q2',
        title: 'Follow the BOL from the Driver to the Receiver who signs it.',
        path: ['Driver', 'BOL', 'Receiver', 'Sign'],
        note: 'The Driver gives the BOL to the Receiver, who signs it at delivery.',
      },
      {
        id: 'l3q3',
        title: 'Follow the Driver Info from the Dispatcher to the Broker who reviews it.',
        path: ['Dispatcher', 'Driver Info', 'Broker', 'Review'],
        note: 'The Dispatcher sends the Driver Info to the Broker, who reviews it.',
      },
    ],
  },
  {
    id: 4,
    name: 'Full Flows',
    questions: [
      {
        id: 'l4q1',
        title: 'Follow the RC from the Broker, through the Dispatcher, to the Driver.',
        path: ['Broker', 'RC', 'Dispatcher', 'RC', 'Driver'],
        note: 'The Broker sends the RC to the Dispatcher, who passes it on to the Driver.',
      },
      {
        id: 'l4q2',
        title: 'Follow the RC from the Dispatcher to the Driver who signs it, and back to the Broker.',
        path: ['Dispatcher', 'RC', 'Driver', 'Sign', 'Broker'],
        note: 'The Driver signs the RC, and the signed copy goes back to the Broker.',
      },
      {
        id: 'l4q3',
        title: 'Follow the POD from the Receiver all the way back to the Shipper.',
        path: ['Receiver', 'POD', 'Driver', 'Dispatcher', 'Broker', 'Shipper'],
        note: 'The Receiver gives the POD to the Driver, and it is passed back through the Dispatcher and Broker to the Shipper.',
      },
    ],
  },
];

export const ALL_QUESTIONS = LEVELS.flatMap((level) =>
  level.questions.map((question) => ({ ...question, levelId: level.id })),
);

// Everything a circle can say. Each question fills its spare circles from here.
export const DECOY_POOL = [
  ...new Set([
    ...ALL_QUESTIONS.flatMap((question) => question.path),
    'RPM',
    'CD',
    'Broker',
    'Dispatcher',
    'Receiver',
  ]),
];
