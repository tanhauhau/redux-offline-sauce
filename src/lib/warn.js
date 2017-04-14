// @flow
export default (message: string, { debug = false }: { debug ?: boolean } = {}): void => {
  if (debug) {
    /* eslint no-console: "off"*/
    console.warn(`[redux-offline-sauce] ${message}`);
  }
};
