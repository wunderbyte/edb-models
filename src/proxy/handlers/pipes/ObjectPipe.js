import getvalidator from './Validators';
import getconverter from './Converters';
import { typeOf } from '@edb/utils';

/**
 * Mapping Model constructor to pipe.
 * @type {Map<Class<Proto>, Object>}
 */
const pipes = new Map();

/**
 * Get pipe for constructor. This "pipe" is an object with methods to validate
 * and potentially transform properties assigned to the Model (or Collection).
 * TODO: required
 * TODO: enumerable
 * TODO: configurable
 * TODO: default
 * @param {Class<Proto>} Proto
 * @returns {Object}
 */
export default function getObjectPipe(Proto) {
	return pipes.has(Proto)
		? pipes.get(Proto)
		: (function () {
				// do expression
				const pipe = resolve(Proto);
				pipes.set(Proto, pipe);
				return pipe;
		  })();
}

// Scoped ......................................................................

/**
 * Mapping Model constructor to interface derived from `static model()`
 * @type {Map<Class<Proto>, Object|null>}
 */
const mappings = new Map();

/**
 * An empty object. There's nothing to it.
 * @type {Object}
 */
const blank = {};

/**
 * @param {Class<Proto>} Proto
 * @param {Object|null} [map]
 * @returns {Object|null}
 */
function resolve(Proto, map = ancestors(Proto).reduce(mapping)) {
	return map === null ? map : buildpipe(Proto, map);
	/*
	return isnull(map)
		? map
		: isimap(map)
		? buildpipe(Proto, map)
		: failpipe(Proto, map);
	*/
}

/**
 * List class hierarchy starting from the top (Proto itself).
 * @param {Class<Proto>} Proto
 * @param {Array<Class<Proto>>} [list]
 * @returns {Array<Class<Proto>>}
 */
function ancestors(Proto, list = [Proto]) {
	return (Proto = Object.getPrototypeOf(Proto)).isProtoConstructor
		? ancestors(Proto, list.concat(Proto))
		: list.reverse();
}

/**
 *
 * TODO: CLONE THE OLD MAP DON'T MUTATE IT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 * @param {Object|null} oldmap
 * @param {Class<Proto>} Proto
 * @returns {Object|null}
 */
function mapping(oldmap, Proto) {
	return mappings.has(Proto)
		? mappings.get(Proto)
		: function () {
				// do expression
				const symbol = Symbol.for('@edb/objectpipe');
				const newmap = Proto[symbol](oldmap || {});
				mappings.set(Proto, newmap);
				return newmap;
		  };
}

/**
 * Creates an object, the "pipe", with methods to match every entry in the map.
 * @param {Class<Proto>} Proto
 * @param {Object} map - The result of calling `static model()`.
 * @returns {Object}
 */
function buildpipe(Proto, map) {
	return Object.entries(map).reduce((pipe, [key, value]) => {
		Reflect.set(pipe, key, (input) => {
			return getvalidator(value)(input)
				? getconverter(value)(input)
				: throwinvalid(Proto, key, input, value);
		});
		return pipe;
	}, {});
}

// Failures ....................................................................

/**
 * The `static model` method returned something bad.
 * TODO: Method name 'model()' has been hardcoded!
 * @param {Constructor} Proto
 * @param {*} pipe
 * @throws {TypeError}
 *
function failpipe(Proto, pipe) {
	throw new TypeError(
		`${Proto.name}.model() returned ${typeOf(pipe)}, expected IMap|Object|null`
	);
}
*/

/**
 * Throw that type error.
 * @param {Class<Proto>} Proto
 * @param {string} key
 * @param {*} input
 * @param {Constructor|Array<Constructor>} cons (String, Number, Person etc)
 * @throws {TypeError}
 */
function throwinvalid(Proto, key, input, cons) {
	const name = (c) => c.name;
	const list = (c) => [...c.map(name)].join('|');
	const want = Array.isArray(cons) ? list(cons) : name(cons);
	const fail = failedtype(input);
	const clas = name(Proto);
	throw new TypeError(
		`Bad assignment to ${clas}.${key}: Expected ${want}, got ${fail}.`
	);
}

/**
 * Attempt to qualify the exact type of input that failed validation.
 * @param {*} input
 * @returns {string}
 */
function failedtype(input) {
	let type = typeOf(input);
	switch (type) {
		case 'object':
		case 'array':
			let cons = input.constructor;
			if (cons !== Object && cons !== Array) {
				type = cons.name;
			}
			break;
	}
	return type;
}
