import { chained } from './Decorators';

/**
 *
 */
export class Mapping {
	/*
	 * TODO: Convert to private (or symbol), see comment above
	 * @type {Map<string, Set<*>>}
	 */
	#map = new Map();

	/**
	 * Push entry to set indexed by key.
	 * TODO: Validate that `key` is a string
	 * @param {string} key
	 * @param {*} value
	 * @returns {this}
	 */
	@chained
	add(key, value) {
		const map = this.#map;
		if (!map.has(key)) {
			map.set(key, new Set());
		}
		const set = map.get(key);
		if (!set.has(value)) {
			set.add(value);
		}
	}

	/**
	 * Remove entry from set indexed by key.
	 * TODO: Rename `delete`
	 * TODO: Validate that `key` is a string
	 * TODO: Validate that `value` is provided
	 * @param {string} key
	 * @param {*} value
	 * @returns {this}
	 */
	@chained
	del(key, value) {
		let map = this.#map;
		let set = map.get(key);
		if (set && set.has(value)) {
			set.delete(value);
			if (set.size === 0) {
				map.delete(key);
			}
		}
	}

	/**
	 * @param {string} key
	 * @param {*} value
	 * @returns {boolean}
	 */
	has(key, value) {
		const map = this.#map;
		const one = arguments.length === 1;
		return map.has(key) && (one || map.get(key).has(value));
	}

	/**
	 * Get set indexed by key. Returns a copy. May return null.
	 * @param {string} key
	 * @returns {Set<*>}
	 */
	get(key) {
		return this.has(key) ? new Set(this.#map.get(key)) : undefined;
	}

	/**
	 * Clear the map.
	 * @returns {this}
	 */
	@chained
	clear() {
		this.#map.clear();
	}

	/**
	 * Get the map. Returns a copy.
	 * @returns {Map<string, Set<*>>}
	 */
	toMap() {
		return new Map(this.#map);
	}

	/**
	 * Get the set indexed by key. Returns a copy. Always returns a Set.
	 * @param {string} key
	 * @returns {Set<*>}
	 */
	toSet(key) {
		return this.has(key) ? new Set(this.#map.get(key)) : new Set();
	}

	/**
	 * Get the set indexed by key as array. Always returns an array.
	 * @param {string} key
	 * @returns {Array}
	 */
	toArray(key) {
		return [...this.toSet(key)];
	}
}
