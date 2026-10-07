// Edit the questions HERE, then run:  node scripts/generate-layouts.js
// That rewrites src/constant/Questions.js with box positions already worked out
// and checked, so every flow can be drawn without lines crossing.
//
// chips: { id: { label, kind } } — `kind` is 'actor' (a role) or 'action' (a
//        document / item handed over). Players never see the kind; it only helps
//        the generator pick believable decoys from other flows.
// links: the pairs that must be joined (order doesn't matter).
module.exports = [
  {
    id: 'q1',
    title: 'ELD compliance flow',
    chips: {
      eld: { label: 'ELD', kind: 'actor' },
      compliance: { label: 'ELD Give Compliance', kind: 'action' },
      driver: { label: 'Driver', kind: 'actor' },
    },
    links: [['eld', 'compliance'], ['compliance', 'driver']],
  },
  {
    id: 'q2',
    title: 'Product delivery flow',
    chips: {
      shipperProduct: { label: 'Shipper Give Product', kind: 'action' },
      driver: { label: 'Driver', kind: 'actor' },
      driverProduct: { label: 'Driver Give Product', kind: 'action' },
      receiver: { label: 'Receiver', kind: 'actor' },
    },
    links: [['shipperProduct', 'driver'], ['driver', 'driverProduct'], ['driverProduct', 'receiver']],
  },
  {
    id: 'q3',
    title: 'Rate confirmation flow',
    chips: {
      broker: { label: 'Broker', kind: 'actor' },
      brokerRc: { label: 'Broker Rate Confirmation', kind: 'action' },
      dispatcher: { label: 'Dispatcher', kind: 'actor' },
      dispatcherRc: { label: 'Dispatcher Rate Confirmation', kind: 'action' },
      driver: { label: 'Driver', kind: 'actor' },
    },
    links: [['broker', 'brokerRc'], ['brokerRc', 'dispatcher'], ['dispatcher', 'dispatcherRc'], ['dispatcherRc', 'driver']],
  },
  {
    id: 'q4',
    title: 'Pickup BOL flow',
    chips: {
      shipperBol: { label: 'Shipper Give BOL', kind: 'action' },
      driver: { label: 'Driver', kind: 'actor' },
      driverBol: { label: 'Driver Give BOL', kind: 'action' },
      receiver: { label: 'Receiver', kind: 'actor' },
      dispatcher: { label: 'Dispatcher', kind: 'actor' },
    },
    links: [['shipperBol', 'driver'], ['driver', 'driverBol'], ['driverBol', 'receiver'], ['driverBol', 'dispatcher']],
  },
  {
    id: 'q5',
    title: 'POD flow: receiver to dispatcher',
    chips: {
      receiverPod: { label: 'Receiver POD', kind: 'action' },
      driver: { label: 'Driver', kind: 'actor' },
      driverPod: { label: 'Driver Give POD', kind: 'action' },
      dispatcher: { label: 'Dispatcher', kind: 'actor' },
    },
    links: [['receiverPod', 'driver'], ['driver', 'driverPod'], ['driverPod', 'dispatcher']],
  },
  {
    id: 'q6',
    title: 'POD flow: dispatcher to shipper',
    chips: {
      dispatcherPod: { label: 'Dispatcher Give POD', kind: 'action' },
      broker: { label: 'Broker', kind: 'actor' },
      brokerPod: { label: 'Broker Give POD', kind: 'action' },
      shipper: { label: 'Shipper', kind: 'actor' },
    },
    links: [['dispatcherPod', 'broker'], ['broker', 'brokerPod'], ['brokerPod', 'shipper']],
  },
  {
    id: 'q7',
    title: 'Signed rate confirmation flow',
    chips: {
      dispatcher: { label: 'Dispatcher', kind: 'actor' },
      dispatcherRc: { label: 'Dispatcher Rate Confirmation', kind: 'action' },
      driver: { label: 'Driver', kind: 'actor' },
      driverSign: { label: 'Driver Give Signed RC', kind: 'action' },
      broker: { label: 'Broker', kind: 'actor' },
    },
    links: [['dispatcher', 'dispatcherRc'], ['dispatcherRc', 'driver'], ['driver', 'driverSign'], ['driverSign', 'broker']],
  },
  {
    id: 'q8',
    title: 'Broker and dispatcher information flow',
    chips: {
      rpm: { label: 'Broker Give RPM', kind: 'action' },
      dispatcher: { label: 'Dispatcher', kind: 'actor' },
      info: { label: 'Dispatcher Give Driver Info', kind: 'action' },
      cd: { label: 'Dispatcher Give CD', kind: 'action' },
      broker: { label: 'Broker', kind: 'actor' },
    },
    links: [['rpm', 'dispatcher'], ['dispatcher', 'info'], ['info', 'broker'], ['dispatcher', 'cd'], ['cd', 'broker']],
  },
  {
    id: 'q9',
    title: 'Pickup number flow',
    chips: {
      shipperPn: { label: 'Shipper Give Pickup No', kind: 'action' },
      broker: { label: 'Broker', kind: 'actor' },
      brokerPn: { label: 'Broker Give Pickup No', kind: 'action' },
      dispatcher: { label: 'Dispatcher', kind: 'actor' },
      dispatcherPn: { label: 'Dispatcher Give Pickup No', kind: 'action' },
      driver: { label: 'Driver', kind: 'actor' },
    },
    links: [['shipperPn', 'broker'], ['broker', 'brokerPn'], ['brokerPn', 'dispatcher'], ['dispatcher', 'dispatcherPn'], ['dispatcherPn', 'driver']],
  },
];
