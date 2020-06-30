/**
 * Default converters. Simple values will be passed through unconverted.
 * TODO: Untangle Object and Array!
 * TODO: Special converter for Date
 * @type {Map<Constructor|Array<Constructor>, Function>}
 */
let converters = ((id) => {
	return new Map([
		[String, id],
		[Number, id],
		[Boolean, id],
		[Function, id],
		[Object, id],
		[Array, id],
		[Symbol, id],
	]);
})((input) => input);

/**
 * Get converter for constructor. Returns a function that can upgrade
 * plain objects and arrays to super advanced Models and Collections.
 * @param {Constructor} cons
 * @returns {Function}
 */
export default function getconverter(cons) {
	return converters.has(cons) ? converters.get(cons) : newconverter(cons);
}

// Scoped ......................................................................

const simplearray = (x) => Array.isArray(x) && x.constructor === Array;
const simplething = (x) => typeof x === 'object' && x.constructor === Object;

/**
 * @param {Constructor|Array<Constructor>} cons
 * @returns {Function}
 */
function newconverter(cons) {
	const converter = Array.isArray(cons)
		? multiconverter(cons)
		: basicconverter(cons);
	converters = converters.set(cons, converter);
	return converter;
}

/**
 * TODO Something fancy.
 * @param {Array} set
 * @returns {Function}
 */
function multiconverter(set) {
	return (input) => {
		console.log('TODO: multiconverter');
		return input;
	};
}

/**
 * TODO: Handle null and undefined??????????????????????????????????????????????
 * Build function to transform input of complex type.
 * @param {Class<Proto>} cons
 * @returns {Function}
 */
function basicconverter(cons) {
	return (input) => {
		if (input === null) {
			console.log('TODO: converter null');
			return input;
		}
		return input instanceof cons
			? input
			: cons.isCollectionConstructor
			? simplearray(input)
				? new cons(...input)
				: typeerror()
			: new cons(input);
	};
}

/**
 * Throw that TypeError.
 * @param {string} message
 * @throws {TypeError}
 */
function typeerror(message = 'TODO') {
	throw new TypeError(message);
}

// TODO ........................................................................

/**
 * Users will input their Angular or React models to our models and despair
 * when we change them, so we'll clone their input into fresh objects first.
 * TODO: Instantiated models should survice this operation (somehow).
 * TODO: Something that won't explode on recursion (without `try catch`).
 * @param {Object|Array} input
 * @returns {Object|Array}
 */
function untangle(input) {
	return JSON.parse(JSON.stringify(input));
}
