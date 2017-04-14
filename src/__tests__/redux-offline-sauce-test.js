import { createActions } from 'reduxsauce';
import { createOfflineActions } from '../redux-offline-sauce';
import warn from '../lib/warn';

jest.mock('../lib/warn');

describe('ReactTestUtils', () => {
  // let Types, Creators, OfflineTypes, OfflineCreators;
  const NormalActionsConfig = {
    createObj: ['id', 'name'],
    deleteObj: ['id'],
    updateObj: ['id', 'name'],
  };

  afterEach(() => {
    warn.mockClear();
  });

  test('returns { Types, Creators, merge }', () => {
    const actions = createOfflineActions({});
    expect(typeof actions).toBe('object');

    const { Types, Creators, merge } = actions;

    expect(typeof Types).toBe('object');
    expect(typeof Creators).toBe('object');
    expect(typeof merge).toBe('function');
  });

  test('give warning and return empty Types and Creators when given empty object', () => {
    const { Types, Creators } = createOfflineActions({});

    expect(Types).toEqual({});
    expect(Creators).toEqual({});
    expect(warn).toHaveBeenCalled();
  });

  test('return correct Types', () => {
    const { Creators } = createActions(NormalActionsConfig);
    const { Types: OfflineTypes } = createOfflineActions({
      createOfflineObj: {
        offline: Creators.createObj,
        effect: { url: '/api/create', method: 'POST', body: { a: 1, b: 2 } },
        commit: Creators.updateObj,
        rollback: Creators.deleteObj,
      },
    });

    expect(OfflineTypes.CREATE_OFFLINE_OBJ).toBeDefined();
    expect(OfflineTypes.CREATE_OFFLINE_OBJ).toBe('CREATE_OFFLINE_OBJ');
  });

  describe('return correct Creators', () => {
    test('basic', () => {
      const { Creators } = createActions(NormalActionsConfig);
      const { Creators: OfflineCreators } = createOfflineActions({
        createOfflineObj: {
          offline: Creators.createObj,
          effect: { url: '/api/create', method: 'POST', body: { a: 1, b: 2 } },
          commit: Creators.updateObj,
          rollback: Creators.deleteObj,
        },
      });

      const { createOfflineObj } = OfflineCreators;

      expect(createOfflineObj).toBeDefined();
      expect(typeof createOfflineObj).toBe('function');
      expect(createOfflineObj(999, 'nine-nine-nine')).toEqual({
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
        },
      });
    });

    test('with custom meta', () => {
      const { Creators } = createActions(NormalActionsConfig);
      const { Creators: OfflineCreators } = createOfflineActions({
        createOfflineObj: {
          offline: Creators.createObj,
          effect: { url: '/api/create', method: 'POST', body: { a: 1, b: 2 } },
          commit: {
            action: Creators.updateObj,
            meta: ['id', 'name'],
          },
          rollback: {
            action: Creators.deleteObj,
            meta: [{ delete: 999 }],
          },
          meta: {
            otherMeta: {
              a: 2,
              b: 3,
            },
          },
        },
      });

      const { createOfflineObj } = OfflineCreators;

      expect(createOfflineObj).toBeDefined();
      expect(typeof createOfflineObj).toBe('function');
      expect(createOfflineObj(999, 'nine-nine-nine')).toEqual({
        type: 'CREATE_OBJ',
        id: 999,
        name: 'nine-nine-nine',
        payload: { id: 999, name: 'nine-nine-nine' },
        meta: {
          offline: {
            effect: { url: '/api/create', method: 'POST', body: { id: 999, name: 'nine-nine-nine', a: 1, b: 2 } },
            commit: { type: 'UPDATE_OBJ', id: 999, name: 'nine-nine-nine', meta: { id: 999, name: 'nine-nine-nine' } },
            rollback: { type: 'DELETE_OBJ', id: 999, meta: { delete: 999 } },
          },
          otherMeta: {
            a: 2,
            b: 3,
          },
        },
      });
    });

    test('no commit', () => {
      const { Creators } = createActions(NormalActionsConfig);
      const { Creators: OfflineCreators } = createOfflineActions({
        createOfflineObj: {
          offline: Creators.createObj,
          effect: { url: '/api/create', method: 'POST', body: { a: 1, b: 2 } },
          rollback: Creators.deleteObj,
        },
      });

      const { createOfflineObj } = OfflineCreators;

      expect(createOfflineObj).toBeDefined();
      expect(typeof createOfflineObj).toBe('function');
      expect(createOfflineObj(999, 'nine-nine-nine')).toEqual({
        type: 'CREATE_OBJ',
        id: 999,
        name: 'nine-nine-nine',
        payload: { id: 999, name: 'nine-nine-nine' },
        meta: {
          offline: {
            effect: { url: '/api/create', method: 'POST', body: { id: 999, name: 'nine-nine-nine', a: 1, b: 2 } },
            commit: { meta: {} },
            rollback: { type: 'DELETE_OBJ', id: 999, meta: {} },
          },
        },
      });
    });

    test('no rollback', () => {
      const { Creators } = createActions(NormalActionsConfig);
      const { Creators: OfflineCreators } = createOfflineActions({
        createOfflineObj: {
          offline: Creators.createObj,
          effect: { url: '/api/create', method: 'POST', body: { a: 1, b: 2 } },
          commit: Creators.updateObj,
        },
      });

      const { createOfflineObj } = OfflineCreators;

      expect(createOfflineObj).toBeDefined();
      expect(typeof createOfflineObj).toBe('function');
      expect(createOfflineObj(999, 'nine-nine-nine')).toEqual({
        type: 'CREATE_OBJ',
        id: 999,
        name: 'nine-nine-nine',
        payload: { id: 999, name: 'nine-nine-nine' },
        meta: {
          offline: {
            effect: { url: '/api/create', method: 'POST', body: { id: 999, name: 'nine-nine-nine', a: 1, b: 2 } },
            commit: { type: 'UPDATE_OBJ', id: 999, name: 'nine-nine-nine', meta: {} },
            rollback: { meta: {} },
          },
        },
      });
    });

    test('no effect', () => {
      const { Creators } = createActions(NormalActionsConfig);
      const { Creators: OfflineCreators } = createOfflineActions({
        createOfflineObj: {
          offline: Creators.createObj,
          commit: Creators.updateObj,
          rollback: Creators.deleteObj,
        },
      });

      const { createOfflineObj } = OfflineCreators;

      expect(createOfflineObj).toBeDefined();
      expect(typeof createOfflineObj).toBe('function');
      expect(createOfflineObj(999, 'nine-nine-nine')).toEqual({
        type: 'CREATE_OBJ',
        id: 999,
        name: 'nine-nine-nine',
        payload: { id: 999, name: 'nine-nine-nine' },
        meta: {
          offline: {
            commit: { type: 'UPDATE_OBJ', id: 999, name: 'nine-nine-nine', meta: {} },
            rollback: { type: 'DELETE_OBJ', id: 999, meta: {} },
          },
        },
      });
    });

    test('no offline', () => {
      const { Creators } = createActions(NormalActionsConfig);
      expect(() => {
        createOfflineActions({
          createOfflineObj: {
            effect: { url: '/api/create', method: 'POST', body: { a: 1, b: 2 } },
            commit: Creators.updateObj,
            rollback: Creators.deleteObj,
          },
        });
      }).toThrowError('[redux-offline-sauce] config.offline must be either a function or object');
    });

    test('with custom object', () => {
      const { Creators } = createActions(NormalActionsConfig);
      const { Creators: OfflineCreators } = createOfflineActions({
        createOfflineObj: {
          offline: Creators.createObj,
          effect: { url: '/api/create', method: 'POST', body: { a: 1, b: 2 } },
          commit: Creators.updateObj,
          rollback: { type: 'ROLLBACK', time: 'now', strategy: 'merge' },
        },
      });

      const { createOfflineObj } = OfflineCreators;

      expect(createOfflineObj).toBeDefined();
      expect(typeof createOfflineObj).toBe('function');
      expect(createOfflineObj(999, 'nine-nine-nine')).toEqual({
        type: 'CREATE_OBJ',
        id: 999,
        name: 'nine-nine-nine',
        payload: { id: 999, name: 'nine-nine-nine' },
        meta: {
          offline: {
            effect: { url: '/api/create', method: 'POST', body: { id: 999, name: 'nine-nine-nine', a: 1, b: 2 } },
            commit: { type: 'UPDATE_OBJ', id: 999, name: 'nine-nine-nine', meta: {} },
            rollback: { type: 'ROLLBACK', time: 'now', strategy: 'merge', meta: {} },
          },
        },
      });
    });

    test('readme example', () => {
      const { Creators } = createActions(NormalActionsConfig);
      const { Creators: OfflineCreators } = createOfflineActions({
        createOfflineObj: {
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

      const { createOfflineObj } = OfflineCreators;

      expect(createOfflineObj).toBeDefined();
      expect(typeof createOfflineObj).toBe('function');
      expect(createOfflineObj(999, 'nine-nine-nine')).toEqual({
        type: 'CREATE_OBJ',
        id: 999,
        name: 'nine-nine-nine',
        payload: { id: 999, name: 'nine-nine-nine' },
        meta: {
          offline: {
            effect: { url: '/api/create', method: 'POST', body: { id: 999, name: 'nine-nine-nine', a: 1, b: 2 } },
            commit: { type: 'UPDATE_OBJ', id: 999, name: 'nine-nine-nine', meta: { id: 999, delay: 10, retries: 5 } },
            rollback: { type: 'ROLLBACK', time: 'now', strategy: 'merge', meta: {} },
          },
          otherMeta: {
            a: 2,
            b: 3,
          },
        },
      });
    });
  });
});
