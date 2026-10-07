// The real module needs the native side, which doesn't exist under jest.
class Sound {
  static MAIN_BUNDLE = 'MAIN_BUNDLE';
  static setCategory() {}
  constructor(file, base, callback) {
    if (callback) {
      callback(null);
    }
  }
  play(callback) {
    if (callback) {
      callback(true);
    }
  }
  stop(callback) {
    if (callback) {
      callback();
    }
  }
  setCurrentTime() {}
}

module.exports = Sound;
module.exports.default = Sound;
