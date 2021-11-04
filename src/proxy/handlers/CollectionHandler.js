import { getProxy } from '../target/Target';
import Observers from './observers/Observers';
import getArrayPipe from './pipes/ArrayPipe';
import { cool } from './ModelHandler.js';

/**
 * String that would resolve to integer when used in square bracket notation.
 * TODO: This regular expressions appears over-engineered: Something simpler.
 * @type {RegExp}
 */
const INTEGER = /^-*(?:[1-9]\d*|\d)$/;

// ... but this would then need to parse back to a string to make sure :/
// const isinteger = string => Number.isInteger(parseInt(string, 10));

/**
 * Proxytraps for collection aspects (array-like properties).
 */
export default class CollectionHandler {
	/**
	 * TODO: Investigate if `array` can be a number somehow? Need validate much?
	 * @param {Proto} target
	 * @param {Array} [array]
	 */
	static init(target, array) {
		if (Array.isArray(target)) {
			getProxy(target).push(...array);
		}
	}

	/**
	 * Attempting to set uniquely array-related properties on an actual array?
	 * @param {Proto} target
	 * @param {string} name
	 * @returns {boolean}
	 */
	static match(target, name) {
		return (
			Array.isArray(target) &&
			notsymbol(name) &&
			(name === 'length' || INTEGER.test(name))
		);
	}

	/**
	 * Just FYI: `match` was called before this wass called and therefore we
	 * already know that the property is either `length` or a numeric index.
	 * @param {Proto} target
	 * @param {string\number} name
	 * @returns {*}
	 */
	static get(target, name) {
		if (cool(target, name)) {
			Observers.$peek(target, name);
			return target[name];
		}
	}

	/**
	 * Just FYI: `match` was called before this gets called and therefore,
	 * we already know that the property is either `length` or an index.
	 * If the value is undefined, it usually implies that this index was
	 * deleted, so we will not attempt to pipe that into a model (seems
	 * that we really cannot distinguish `push(undefined)` from a delete?)
	 * @param {Proto} target
	 * @param {string} name
	 * @param {*} value
	 * @returns {boolean}
	 */
	static set(target, name, value) {
		if (cool(target, name)) {
			Observers.$splice(target);
			if (name === 'length') {
				// TODO: observers when *manually* setting this: `mycol.length = 0`
				target[name] = value;
			} else {
				target[name] = value !== undefined ? resolve(target, value) : value;
			}
			return true;
		}
	}
}

// Scoped ......................................................................

/**
 * Given key is not a symbol?
 * @param {string|Symbol} name
 * @returns {boolean}
 */
function notsymbol(name) {
	return !!name.charAt;
}

/**
 * @param {Proto} target
 * @param {*} value
 * @returns {*}
 */
function resolve(target, value) {
	const cons = target.constructor;
	const pipe = getArrayPipe(cons);
	return pipe ? pipe(value) : value;
}
