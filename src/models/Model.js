import Proto from './Proto';
import { approximate } from '@edb/proxy';

/**
 *
 */
export default class Model extends Proto() {
	/**
	 * @param {Object} [object]
	 * @returns {Proxy}
	 */
	constructor(object = Object.create(null)) {
		return approximate(super(), object);
	}

	/**
	 * Support recursive arguments destructuring.
	 * Not to be confused with  `static model()`.
	 * @type {Model}
	 */
	get model() {
		return this;
	}

	/**
	 * Identification.
	 * @type {String}
	 */
	get [Symbol.toStringTag]() {
		return 'Model';
	}

	/**
	 * More identification.
	 * @returns {string}
	 */
	toString() {
		return `[model ${this.constructor.name}]`;
	}

	// Static ....................................................................

	/**
	 * Model type interface.
	 * TODO: Perhaps look at [Vue](https://vuejs.org/v2/guide/components.html#Prop-Validation)
	 * to finalize the syntax for required status and default value.
	 * @param {Object} map
	 * @returns {Object|null}
	 */
	static model(map) {
		return null;
	}

	/**
	 * Framework internal.
	 * @param {Object} map
	 * @returns {Object|null}
	 */
	static [Symbol.for('@edb/objectpipe')](map) {
		return this.model(...arguments);
	}

	/**
	 * Identification for ducks.
	 * TODO: Use Symbol
	 * @type {boolean}
	 */
	static get isModelConstructor() {
		return true;
	}

	/**
	 * TODO: Is this used???
	 * @param {*} thing
	 * @returns {*}
	 */
	static cast(thing) {
		return thing;
	}
}
