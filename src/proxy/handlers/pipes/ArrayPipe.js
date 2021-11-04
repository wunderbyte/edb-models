import getvalidator from './Validators';
import getconverter from './Converters';
import { isClass, isFunction, typeOf } from '@edb/utils';

/**
 * Mapping Collection constructors to ArrayPipes.
 * @type {Map<constructor, function>}
 */
const pipes = new Map();

/**
 * Get pipe for constructor. This "pipe" is a function that can be
 * used validate and transform elements added to the {Collection}.
 * TODO: required
 * TODO: enumerable
 * TODO: configurable
 * TODO: default
 * @param {Class<Collection>} cons
 * @returns {Function}
 */
export default function getArrayPipe(cons) {
	return pipes.has(cons)
		? pipes.get(cons)
		: (function () {
				// do expression
				const name = Symbol.for('@edb/arraypipe');
				const type = cons[name]();
				const pipe = createpipe(cons, type);
				pipes.set(cons, pipe);
				return pipe;
		  })();
}

// Scoped ......................................................................

/**
 * Primitive and strangely exotic types.
 * @type {Set<Constructor>}
 */
const primitives = new Set([String, Number, Boolean, Symbol]);

/**
 * This pipe simply outputs the input untransformed.
 * @param {*} input
 * @returns {*}
 */
const identitypipe = (input) => input;

/**
 * Create new pipe.
 * @param {Collection} col
 * @param {Constructor|Function|null} pipe
 * @returns {Function}
 */
function createpipe(col, pipe) {
	if (pipe) {
		return primitives.has(pipe)
			? identitypipe
			: isClass(pipe)
			? constructorpipe(col, pipe)
			: isFunction(pipe)
			? functionpipe(col, pipe)
			: typeerror();
	} else {
		return pipe === null ? identitypipe : typeerror();
	}
}

/**
 * The pipe is a model constructor.
 * @param {Collection} col
 * @param {constructor} pipe
 * @returns {Function}
 */
function constructorpipe(col, pipe) {
	const validator = getvalidator(pipe);
	const converter = getconverter(pipe);
	return (input) => {
		return validator(input) ? converter(input) : fail(col, pipe, input);
	};
}

/**
 * The pipe is a function that evaluates the input and returns a constructor.
 * @param {Collection} col
 * @param {Function} pipe
 * @returns {Function}
 */
function functionpipe(col, pipe) {
	return (input) => {
		const constructor = pipe(input);
		return constructor.isModelConstructor
			? getconverter(constructor)(input)
			: typeerror(`Expected constructor, got ${typeOf(constructor)}`);
	};
}

/**
 * @param {Collection} col
 * @param {Constructor} pipe
 * @param {Object} input
 * @throws {TypeError}
 */
function fail(col, pipe, input) {
	const [name, type] = [col.name || 'Anonymous', typeOf(input)];
	typeerror(`Bad input for ${name}: Expected ${pipe.name}, got ${type}.`);
}

/**
 * @param {Collection} col
 * @param {*} badpipe
 * @throws {TypeError}
 */
function failreturntype(col, badpipe) {
	const wanted = 'constructor|function|null';
	const [name, type] = [col.name || 'Anonymous', typeOf(badpipe)];
	typeerror(`${name}.collection() returned ${type}, expected ${wanted}`);
}

/**
 * Throw that TypeError.
 * @param {string} message
 * @throws {TypeError}
 */
function typeerror(message) {
	throw new TypeError(message);
}
