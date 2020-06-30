const global = typeof self !== 'undefined' ? self : Function('return this')();
const isprocess = !!global.process;
const isbrowser = !!global.document;

/**
 * Awkward `window is not defined` workaround for Node process.
 * TODO: WebWorkerGlobalScope
 */
export class Environment {
	/**
	 * Appears to be a node script?
	 * @type {boolean}
	 */
	static get node() {
		return isprocess;
	}

	/**
	 * Appears to run in a browser?
	 * @type {boolean}
	 */
	static get browser() {
		return isbrowser;
	}

	/**
	 * Get the window.
	 * @type {Window}
	 */
	static get window() {
		return isbrowser ? global : null;
	}

	/**
	 * Get the document.
	 * @type {Document}
	 */
	static get document() {
		return isbrowser ? global.document : null;
	}
}
