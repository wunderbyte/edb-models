import { Environment } from './Environment';

/**
 * Schedule callback async via `requestAnimationFrame`
 * (in the browser) or via `setTimeout` (in Node where
 * process.next cannot be cancelled, or can it?)
 * @param {Function} cb
 * @returns {number}
 */
export function requestTick(cb) {
	return Environment.browser ? requestAnimationFrame(cb) : setTimeout(cb);
}

/**
 * Cancel scheduled callback.
 * @param {number} id
 */

export function cancelTick(id) {
	Environment.browser ? cancelAnimationFrame(id) : clearTimeout(id);
}
