'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _reduxsauce = require('reduxsauce');

var _warn = require('./warn');

var _warn2 = _interopRequireDefault(_warn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// matches on capital letters (except at the start & end of the string)
var RX_CAPS = /(?!^)([A-Z])/g;

// converts a camelCaseWord into a SCREAMING_SNAKE_CASE word
var camelToScreamingSnake = _ramda2.default.pipe(_ramda2.default.replace(RX_CAPS, '_$1'), _ramda2.default.toUpper);

// noop
var noop = function noop() {
  return {};
};
var omitActionMeta = _ramda2.default.omit(['action', 'meta']);

function createTypes(config, options) {
  /* eslint no-underscore-dangle: ["off"] */

  var typesCreator = _ramda2.default.curry(_reduxsauce.createTypes)(_ramda2.default.__, options);

  return _ramda2.default.pipe(_ramda2.default.keys, // just the keys
  _ramda2.default.map(camelToScreamingSnake), // CONVERT_THEM
  _ramda2.default.join(' '), // space separated
  typesCreator)(config);
}

function transformAction(action) {
  if ((typeof action === 'undefined' ? 'undefined' : _typeof(action)) === 'object') {
    return _extends({
      action: noop
    }, action);
  } else if (typeof action === 'function') {
    return { action: action };
  }
  return { action: noop };
}

function getMeta() {
  var metaArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var context = arguments[1];

  return _ramda2.default.pipe(_ramda2.default.converge(_ramda2.default.concat, [_ramda2.default.pipe(_ramda2.default.filter(function (v) {
    return typeof v === 'string';
  }), _ramda2.default.map(function (v) {
    return _defineProperty({}, v, context[v]);
  })), _ramda2.default.filter(function (v) {
    return (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object';
  })]), _ramda2.default.mergeAll)(metaArray);
}

function addPayloadToEffectBody(effect, payload) {
  if ((typeof effect === 'undefined' ? 'undefined' : _typeof(effect)) === 'object') {
    var body = effect.body,
        rest = _objectWithoutProperties(effect, ['body']);

    return {
      effect: _extends({}, rest, {
        body: _extends({}, body, payload)
      })
    };
  }
  return undefined;
}

function createActionCreator(_ref2, options) {
  var offline = _ref2.offline,
      commit = _ref2.commit,
      rollback = _ref2.rollback,
      effect = _ref2.effect,
      meta = _ref2.meta;

  /* eslint no-unused-vars: ["error",
    { "varsIgnorePattern": "type", "argsIgnorePattern": "options" }]*/

  if (typeof offline !== 'function' && (typeof offline === 'undefined' ? 'undefined' : _typeof(offline)) !== 'object') {
    throw new Error('[redux-offline-sauce] config.offline must be either a function or object');
  }

  var offlineObj = transformAction(offline);
  var commitObj = transformAction(commit);
  var rollbackObj = transformAction(rollback);

  var offlineRest = omitActionMeta(offlineObj);
  var commitRest = omitActionMeta(commitObj);
  var rollbackRest = omitActionMeta(rollbackObj);

  return function () {
    var offlineAction = offlineObj.action.apply(offlineObj, arguments);
    var commitAction = commitObj.action.apply(commitObj, arguments);
    var rollbackAction = rollbackObj.action.apply(rollbackObj, arguments);

    var offlineType = offlineAction.type,
        payload = _objectWithoutProperties(offlineAction, ['type']);

    return _extends({
      type: offlineType
    }, payload, {
      payload: payload
    }, offlineRest, {
      meta: _extends({
        offline: _extends({}, addPayloadToEffectBody(effect, payload), {
          commit: _extends({}, commitAction, commitRest, {
            meta: getMeta(commitObj.meta, payload)
          }),
          rollback: _extends({}, rollbackAction, rollbackRest, {
            meta: getMeta(rollbackObj.meta, payload)
          })
        })
      }, meta)
    });
  };
}

function createCreators(config, options) {
  return _ramda2.default.pipe(_ramda2.default.map(function (value) {
    return createActionCreator(value, options);
  }))(config);
}

exports.default = function (config, options) {
  if (_ramda2.default.isNil(config)) {
    throw new Error('an object is required to setup types and creators');
  }

  if (_ramda2.default.isEmpty(config)) {
    (0, _warn2.default)('empty object passed in for createOfflineActions', options);
    return {
      Types: {},
      Creators: {},
      merge: function merge(Types, Creators) {
        return { Types: Types, Creators: Creators };
      }
    };
  }

  var Types = createTypes(config, options);
  var Creators = createCreators(config, options);

  return {
    Types: Types,
    Creators: Creators,
    merge: function merge(mTypes, mCreators) {
      return {
        Types: _ramda2.default.merge(mTypes, Types),
        Creators: _ramda2.default.merge(mCreators, Creators)
      };
    }
  };
};