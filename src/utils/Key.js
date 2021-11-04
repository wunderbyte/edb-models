import { isString } from './Type';

/**
 * Seriously tracking keys to avoid duplicates.
 * @type {Set<string>}
 */
const keys = new Set();

/**
 * Generate random key.
 * @param {string} [fix]
 * @returns {string}
 */
export function generateKey(fix = 'key') {
	const ran = String(Math.random());
	const key = fix + ran.slice(2, 11);
	if (keys.has(key)) {
		return this.generate();
	}
	keys.add(key);
	return key;
}
