// @flow

export type dict = {
  [string]: number | string | Array<dict> | dict | boolean;
}

export type thunk = () => dict;

type CreateOfflineActionsConfigObject = {
  action: thunk;
  meta?: dict;
}

type CreateOfflineActionsConfig = {
  offline: thunk | CreateOfflineActionsConfigObject | dict;
  effect?: dict;
  commit?: thunk | CreateOfflineActionsConfigObject | dict;
  rollback?: thunk | CreateOfflineActionsConfigObject | dict;
  meta?: dict;
}

type CreateOfflineAction = {
  type: string;
  meta: {
    offline: {
      effect: dict;
      commit: dict;
      rollback: dict;
    };
  };
};

export type CreateOfflineActionsConfigs = {
  [string]: CreateOfflineActionsConfig;
}

export type CreateOfflineActionsOptions = {
  prefix?: string;
  debug?: boolean;
}

export type CreateOfflineActions = {
  [string]: CreateOfflineAction;
};
