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
	return keys.has(key)
		? this.generate()
		: do {
				keys.add(key);
				key;
		  };
}
