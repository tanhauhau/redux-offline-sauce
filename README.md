# redux-offline-sauce

[![npm version](https://badge.fury.io/js/redux-offline-sauce.svg)](https://badge.fury.io/js/redux-offline-sauce)

> Some aesthetic toppings for your Redux Offline meal.

# Installation

```bash
$ npm install --save redux-offline-sauce
```

## Overview

What is Redux Offline? [Redux Offline](https://github.com/jevakallio/redux-offline) is a battle-tested offline-first architecture.

[redux-offline-sauce](https://github.com/tanhauhau/redux-offline-sauce) inspired by [reduxsauce](https://github.com/skellock/reduxsauce) aims to provide tools to work with [Redux Offline](https://github.com/jevakallio/redux-offline).

## Usage

### createOfflineActions

Like `createActions` from [reduxsauce](https://github.com/skellock/reduxsauce), `createOfflineActions` returns `Types` and `Creators`.

When creating a new offline action, you most probably have written redux actions such as `{ type: 'DELETE_OBJ', id: 1}` or redux thunk `(id) => ({ type: 'UPDATE_OBJ', id: id })`.
`createOfflineActions` allows you to specify a redux action or redux thunk or mixture of both in `commit` and `rollback` of the offline action.

**Example: **

```js
  const { Types, Creators } = createActions(NormalActionsConfig);
  const { Types: OfflineTypes, Creators: OfflineCreators } = createOfflineActions({
    createOfflineObj: {
      offline: Creators.createObj,
      effect: { url: '/api/create', method: 'POST', body: { a: 1, b: 2 } },
      commit: Creators.updateObj,
      rollback: Creators.deleteObj,
    },
    createOfflineObj2: {
      offline: Creators.createObj,
      effect: { url: '/api/create', method: 'POST', body: { a: 1, b: 2 } },
      commit: {
        action: Creators.updateObj,
        meta: ['id', { delay: 10, retries: 5 }],
      },
      rollback: { type: 'ROLLBACK', time: 'now', strategy: 'merge' },
      meta: {
        otherMeta: {
          a: 2,
          b: 3,
        },
      },
    },
  });

  OfflineTypes
  /*
    {
      CREATE_OFFLINE_OBJ: CREATE_OFFLINE_OBJ,
      CREATE_OFFLINE_OBJ2: CREATE_OFFLINE_OBJ2
    }
  */

  OfflineCreators.createOfflineObj(999, 'nine-nine-nine')
  /*
    {
      type: 'CREATE_OBJ',
      id: 999,
      name: 'nine-nine-nine',
      payload: { id: 999, name: 'nine-nine-nine' },
      meta: {
        offline: {
          effect: { url: '/api/create', method: 'POST', body: { id: 999, name: 'nine-nine-nine', a: 1, b: 2 } },
          commit: { type: 'UPDATE_OBJ', id: 999, name: 'nine-nine-nine', meta: {} },
          rollback: { type: 'DELETE_OBJ', id: 999, meta: {} },
        },
      }
    }
  */

  OfflineCreators.createOfflineObj2(999, 'nine-nine-nine')
  /*
    {
      type: 'CREATE_OBJ',
      id: 999,
      name: 'nine-nine-nine',
      payload: { id: 999, name: 'nine-nine-nine' },
      meta: {
        offline: {
          effect: { url: '/api/create', method: 'POST', body: { id: 999, name: 'nine-nine-nine', a: 1, b: 2 } },
          commit: { type: 'UPDATE_OBJ', id: 999, name: 'nine-nine-nine', meta: { id: 999, delay: 10, retries: 5 } },
          rollback: { type: 'ROLLBACK', time: 'now', strategy: 'merge' },
        },
        otherMeta: {
          a: 2,
          b: 3,
        },
      }
    }
  */

```



# License
MIT
