"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (message) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$debug = _ref.debug,
      debug = _ref$debug === undefined ? false : _ref$debug;

  if (debug) {
    /* eslint no-console: "off"*/
    console.warn("[redux-offline-sauce] " + message);
  }
};