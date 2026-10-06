// Dummy questions built from the dispatch-flow notes. Replace this file with the
// real ones — nothing else changes.
//
// Each question is a flow puzzle:
//   chips: the boxes on the board. `type` is 'actor' (a person/role, gold) or
//          'action' (what they hand over, dark). `x` / `y` is the box centre as a
//          0–1 fraction of the board.
//   links: the pairs the player must connect (order doesn't matter).
//
// Lay boxes out so the correct links can be drawn without crossing: boxes are about
// 0.3 wide and 0.14 tall in these units, so keep centres at least that far apart
// and `x` between 0.17 and 0.83, `y` between 0.08 and 0.92.
export const QUESTIONS = [
  {
    id: 'q1',
    title: 'ELD compliance flow',
    chips: [
      { id: 'eld', label: 'ELD', type: 'actor', x: 0.2, y: 0.16 },
      { id: 'compliance', label: 'ELD Give Compliance', type: 'action', x: 0.78, y: 0.45 },
      { id: 'driver', label: 'Driver', type: 'actor', x: 0.25, y: 0.78 },
    ],
    links: [
      ['eld', 'compliance'],
      ['compliance', 'driver'],
    ],
  },
  {
    id: 'q2',
    title: 'Product delivery flow',
    chips: [
      { id: 'shipperProduct', label: 'Shipper Give Product', type: 'action', x: 0.22, y: 0.12 },
      { id: 'driver', label: 'Driver', type: 'actor', x: 0.78, y: 0.34 },
      { id: 'driverProduct', label: 'Driver Give Product', type: 'action', x: 0.22, y: 0.58 },
      { id: 'receiver', label: 'Receiver', type: 'actor', x: 0.78, y: 0.84 },
    ],
    links: [
      ['shipperProduct', 'driver'],
      ['driver', 'driverProduct'],
      ['driverProduct', 'receiver'],
    ],
  },
  {
    id: 'q3',
    title: 'Rate confirmation flow',
    chips: [
      { id: 'broker', label: 'Broker', type: 'actor', x: 0.2, y: 0.1 },
      { id: 'brokerRc', label: 'Broker Rate Confirmation', type: 'action', x: 0.78, y: 0.3 },
      { id: 'dispatcher', label: 'Dispatcher', type: 'actor', x: 0.22, y: 0.52 },
      { id: 'dispatcherRc', label: 'Dispatcher Rate Confirmation', type: 'action', x: 0.78, y: 0.7 },
      { id: 'driver', label: 'Driver', type: 'actor', x: 0.24, y: 0.9 },
    ],
    links: [
      ['broker', 'brokerRc'],
      ['brokerRc', 'dispatcher'],
      ['dispatcher', 'dispatcherRc'],
      ['dispatcherRc', 'driver'],
    ],
  },
  {
    id: 'q4',
    title: 'Pickup BOL flow',
    chips: [
      { id: 'shipperBol', label: 'Shipper Give BOL', type: 'action', x: 0.22, y: 0.1 },
      { id: 'driver', label: 'Driver', type: 'actor', x: 0.74, y: 0.27 },
      { id: 'driverBol', label: 'Driver Give BOL', type: 'action', x: 0.24, y: 0.5 },
      { id: 'receiver', label: 'Receiver', type: 'actor', x: 0.78, y: 0.66 },
      { id: 'dispatcher', label: 'Dispatcher', type: 'actor', x: 0.5, y: 0.9 },
    ],
    links: [
      ['shipperBol', 'driver'],
      ['driver', 'driverBol'],
      ['driverBol', 'receiver'],
      ['driverBol', 'dispatcher'],
    ],
  },
  {
    id: 'q5',
    title: 'POD flow: receiver to dispatcher',
    chips: [
      { id: 'receiverPod', label: 'Receiver POD', type: 'action', x: 0.22, y: 0.12 },
      { id: 'driver', label: 'Driver', type: 'actor', x: 0.78, y: 0.34 },
      { id: 'driverPod', label: 'Driver Give POD', type: 'action', x: 0.22, y: 0.58 },
      { id: 'dispatcher', label: 'Dispatcher', type: 'actor', x: 0.78, y: 0.84 },
    ],
    links: [
      ['receiverPod', 'driver'],
      ['driver', 'driverPod'],
      ['driverPod', 'dispatcher'],
    ],
  },
  {
    id: 'q6',
    title: 'POD flow: dispatcher to shipper',
    chips: [
      { id: 'dispatcherPod', label: 'Dispatcher Give POD', type: 'action', x: 0.22, y: 0.12 },
      { id: 'broker', label: 'Broker', type: 'actor', x: 0.78, y: 0.34 },
      { id: 'brokerPod', label: 'Broker Give POD', type: 'action', x: 0.22, y: 0.58 },
      { id: 'shipper', label: 'Shipper', type: 'actor', x: 0.78, y: 0.84 },
    ],
    links: [
      ['dispatcherPod', 'broker'],
      ['broker', 'brokerPod'],
      ['brokerPod', 'shipper'],
    ],
  },
  {
    id: 'q7',
    title: 'Signed rate confirmation flow',
    chips: [
      { id: 'dispatcher', label: 'Dispatcher', type: 'actor', x: 0.2, y: 0.1 },
      { id: 'dispatcherRc', label: 'Dispatcher Rate Confirmation', type: 'action', x: 0.78, y: 0.3 },
      { id: 'driver', label: 'Driver', type: 'actor', x: 0.22, y: 0.52 },
      { id: 'driverSign', label: 'Driver Give Signed RC', type: 'action', x: 0.78, y: 0.7 },
      { id: 'broker', label: 'Broker', type: 'actor', x: 0.24, y: 0.9 },
    ],
    links: [
      ['dispatcher', 'dispatcherRc'],
      ['dispatcherRc', 'driver'],
      ['driver', 'driverSign'],
      ['driverSign', 'broker'],
    ],
  },
  {
    id: 'q8',
    title: 'Broker and dispatcher information flow',
    chips: [
      { id: 'rpm', label: 'Broker Give RPM', type: 'action', x: 0.2, y: 0.9 },
      { id: 'dispatcher', label: 'Dispatcher', type: 'actor', x: 0.2, y: 0.5 },
      { id: 'info', label: 'Dispatcher Give Driver Info', type: 'action', x: 0.5, y: 0.2 },
      { id: 'cd', label: 'Dispatcher Give CD', type: 'action', x: 0.58, y: 0.78 },
      { id: 'broker', label: 'Broker', type: 'actor', x: 0.8, y: 0.5 },
    ],
    links: [
      ['rpm', 'dispatcher'],
      ['dispatcher', 'info'],
      ['info', 'broker'],
      ['dispatcher', 'cd'],
      ['cd', 'broker'],
    ],
  },
  {
    id: 'q9',
    title: 'Pickup number flow',
    chips: [
      { id: 'shipperPn', label: 'Shipper Give Pickup No', type: 'action', x: 0.22, y: 0.08 },
      { id: 'broker', label: 'Broker', type: 'actor', x: 0.78, y: 0.24 },
      { id: 'brokerPn', label: 'Broker Give Pickup No', type: 'action', x: 0.22, y: 0.42 },
      { id: 'dispatcher', label: 'Dispatcher', type: 'actor', x: 0.78, y: 0.58 },
      { id: 'dispatcherPn', label: 'Dispatcher Give Pickup No', type: 'action', x: 0.22, y: 0.74 },
      { id: 'driver', label: 'Driver', type: 'actor', x: 0.78, y: 0.92 },
    ],
    links: [
      ['shipperPn', 'broker'],
      ['broker', 'brokerPn'],
      ['brokerPn', 'dispatcher'],
      ['dispatcher', 'dispatcherPn'],
      ['dispatcherPn', 'driver'],
    ],
  },
];
