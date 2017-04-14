// @flow

import R from 'ramda';
import { createTypes as reduxSauceCreateTypes } from 'reduxsauce';

import warn from './warn';

import type {
  dict, thunk,
  CreateOfflineActionsConfigs,
  CreateOfflineActionsOptions,
} from './types';

// matches on capital letters (except at the start & end of the string)
const RX_CAPS = /(?!^)([A-Z])/g;

// converts a camelCaseWord into a SCREAMING_SNAKE_CASE word
const camelToScreamingSnake: string => string = R.pipe(
  R.replace(RX_CAPS, '_$1'),
  R.toUpper,
);

// noop
const noop = () => ({});
const omitActionMeta = R.omit(['action', 'meta']);

function createTypes(config, options): { [string]: string } {
  /* eslint no-underscore-dangle: ["off"] */

  const typesCreator = R.curry(reduxSauceCreateTypes)(R.__, options);

  return R.pipe(
    R.keys,                       // just the keys
    R.map(camelToScreamingSnake), // CONVERT_THEM
    R.join(' '),                  // space separated
    typesCreator,                // make them into Redux Types
  )(config);
}

function transformAction(action: thunk | dict): { action: thunk, meta?: Array<string | dict> } {
  if (typeof action === 'object') {
    return {
      action: noop,
      ...action,
    };
  } else if (typeof action === 'function') {
    return { action };
  }
  return { action: noop };
}

function getMeta(metaArray: ?Array<string | dict> = [], context: dict): dict {
  return R.pipe(
    R.converge(R.concat, [
      R.pipe(
        R.filter(v => typeof v === 'string'),
        R.map(v => ({ [v]: context[v] })),
      ),
      R.filter(v => typeof v === 'object'),
    ]),
    R.mergeAll,
  )(metaArray);
}

function addPayloadToEffectBody(effect, payload): ?dict {
  if (typeof effect === 'object') {
    const { body, ...rest } = effect;

    return {
      effect: {
        ...rest,
        body: {
          ...body,
          ...payload,
        },
      },
    };
  }
  return undefined;
}

function createActionCreator({
  offline,
  commit,
  rollback,
  effect,
  meta,
 }, options) {
  /* eslint no-unused-vars: ["error",
    { "varsIgnorePattern": "type", "argsIgnorePattern": "options" }]*/

  if (typeof offline !== 'function' && typeof offline !== 'object') {
    throw new Error('[redux-offline-sauce] config.offline must be either a function or object');
  }

  const offlineObj = transformAction(offline);
  const commitObj = transformAction(commit);
  const rollbackObj = transformAction(rollback);

  const offlineRest = omitActionMeta(offlineObj);
  const commitRest = omitActionMeta(commitObj);
  const rollbackRest = omitActionMeta(rollbackObj);

  return (...args) => {
    const offlineAction = offlineObj.action(...args);
    const commitAction = commitObj.action(...args);
    const rollbackAction = rollbackObj.action(...args);
    const { type: offlineType, ...payload } = offlineAction;

    return {
      type: offlineType,
      ...payload,
      payload,
      ...offlineRest,
      meta: {
        offline: {
          ...addPayloadToEffectBody(effect, payload),
          commit: {
            ...commitAction,
            ...commitRest,
            meta: getMeta(commitObj.meta, payload),
          },
          rollback: {
            ...rollbackAction,
            ...rollbackRest,
            meta: getMeta(rollbackObj.meta, payload),
          },
        },
        ...meta,
      },
    };
  };
}

function createCreators(config, options) {
  return R.pipe(
    R.map(value => createActionCreator(value, options)),
  )(config);
}

export default (config: ?CreateOfflineActionsConfigs, options: CreateOfflineActionsOptions) => {
  if (R.isNil(config)) {
    throw new Error('an object is required to setup types and creators');
  }

  if (R.isEmpty(config)) {
    warn('empty object passed in for createOfflineActions', options);
    return {
      Types: {},
      Creators: {},
      merge: (Types: dict, Creators: dict): { Types: dict, Creators: dict } =>
        ({ Types, Creators }),
    };
  }

  const Types = createTypes(config, options);
  const Creators = createCreators(config, options);

  return {
    Types,
    Creators,
    merge: (mTypes: dict, mCreators: dict): { Types: dict, Creators: dict } => ({
      Types: R.merge(mTypes, Types),
      Creators: R.merge(mCreators, Creators),
    }),
  };
};
