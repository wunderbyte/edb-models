const global = typeof self !== 'undefined' ? self : Function('return this')();

// TODO: WebWorkerGlobalScope

/**
 * Appears to be a node script?
 * @type {boolean}
 */
export const isNode = !!global.process;

/**
 * Appears to run in a browser?
 * @type {boolean}
 */
export const isBrowser = !!global.document;
