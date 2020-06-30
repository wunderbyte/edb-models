import { isArray, isFunction, isDate, isSymbol } from '@edb/utils';
import { isString, isNumber, isBoolean, isObject } from '@edb/utils';

/**
 * Default validators.
 * TODO: Perhaps parity https://reactjs.org/docs/typechecking-with-proptypes.html
 * @type {Map<Constructor|Array<Constructor>, Function>}
 */
let validators = new Map([
	[String, isString],
	[Number, isNumber],
	[Boolean, isBoolean],
	[Object, isObject],
	[Array, isArray],
	[Function, isFunction],
	[Date, isDate],
	[Symbol, isSymbol],
]);

/**
 * Get validator for constructor. Returns function to confirm input data via
 * `instanceOf` test (unless the input is primitive, in which case see above).
 * @param {Constructor|Array<Constructor>} cons
 * @returns {Function}
 */
export default function getvalidator(cons) {
	return validators.has(cons) ? validators.get(cons) : newvalidator(cons);
}

// Scoped ......................................................................

const simplearray = (x) => Array.isArray(x) && x.constructor === Array;
const simplething = (x) => typeof x === 'object' && x.constructor === Object;

/**
 * Build function to validate input of complex type.
 * @param {Constructor|Array<Constructor>} cons
 * @returns {Function}
 */
function newvalidator(cons) {
	const validator = Array.isArray(cons)
		? multivalidator(cons)
		: basicvalidator(cons);
	validators = validators.set(cons, validator);
	return validator;
}

/**
 *
 * @param {Array<Constructor>} set
 * @returns {Function}
 */
function multivalidator(set) {
	const validators = Array.from(set).map(getvalidator);
	return (input) => validators.some((isvalid) => isvalid(input));
}

/**
 * @param {Class<Proto>} cons
 * @returns {Function}
 */
function basicvalidator(cons) {
	return (input) => {
		if (input === null) {
			console.log('TODO: validator null');
			return true;
		}
		return cons.isCollectionConstructor
			? cons.is(input) || simplearray(input)
			: cons.isModelConstructor
			? cons.is(input) || simplething(input)
			: true;
	};
}
