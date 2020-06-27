const TYPE = /\s([a-zA-Z]+)/; // match 'Array' in '[object Array]' and so on.

/**
 * Make sure not to use any strange `toString` method.
 * @type {Function}
 */
const stringify = Object.prototype.toString;

/**
 * Get type of argument. Note that response may differ between user agents.
 * @see http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator
 * @see http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
 * @see http://stackoverflow.com/questions/12018759/how-to-check-the-class-of-an-instance-in-javascript
 * @param {*} any
 * @returns {string}
 */
export const typeOf = (any) => stringify.call(any).match(TYPE)[1].toLowerCase();

/**
 * Is object defined?
 * TODO: unlimited arguments support
 * TODO: See note on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString
 * @param {*} any
 * @returns {boolean}
 */
export const isDefined = (any) => any !== undefined;

/**
 * Is complex type?
 * @param {*} any
 * @returns {boolean}
 */
export const isComplex = (any) => {
	switch (any) {
		case undefined:
		case null:
		case true:
		case false:
			return false;
	}
	switch (typeof any) {
		case 'string':
		case 'symbol':
		case 'number':
			return false;
	}
	return true;
};

/**
 * @param {*} any
 * @returns {boolean}
 */
export const isArray = (any) => Array.isArray(any);

/**
 * Note: This no longer works for classes in Chrome because `of`
 * now returns something like `[object [class MyClass]]`, this could
 * however be just a passing phase, so let's panic later.
 * @param {*} any
 * @returns {boolean}
 */
export const isFunction = (any) =>
	!!(typeof any === 'function' && any.call && any.apply);

/**
 * Is object and *not* and array?
 * @param {*} any
 * @returns {boolean}
 */
export const isObject = (any) => typeof any === 'object' && !Array.isArray(any);

/**
 * @param {*} any
 * @returns {boolean}
 */
export const isString = (any) => typeof any === 'string';

/**
 * @param {*} any
 * @returns {boolean}
 */
export const isNumber = (any) => typeof any === 'number';

/**
 * @param {*} any
 * @returns {boolean}
 */
export const isBoolean = (any) => any === true || any === false;

/**
 * @param {*} any
 * @returns {boolean}
 */
export const isDate = (any) => typeof any === 'object' && any instanceof Date;

/**
 * @param {*} any
 * @returns {boolean}
 */
export const isNull = (any) => any === null;

/**
 * @param {*} any
 * @returns {boolean}
 */
export const isArguments = (any) => typeOf(any) === 'arguments';

/**
 * @param {*} any
 * @returns {boolean}
 */
export const isSymbol = (any) => typeof any === 'symbol';

/**
 * @param {*} any
 * @returns {boolean}
 */
export const isFile = (any) => typeOf(any) === 'file';

/**
 * Is Window object?
 * @param {*} any
 * @returns {boolean}
 */
export const isWindow = (any) => {
	return !!(
		any &&
		any.document &&
		any.location &&
		any.alert &&
		any.setInterval
	);
};

/**
 * Is Event object?
 * @param {*} any
 * @returns {boolean}
 */
export const isEvent = (any) => !!(typeOf(any).endsWith('event') && any.type);

/**
 * Is node?
 * @param {*} any
 * @returns {boolean}
 */
export const isNode = (any) =>
	!!(
		any &&
		typeof any === 'object' &&
		any.nodeType &&
		any.compareDocumentPosition
	);

/**
 * Is DOM element?
 * @param {*} any
 * @returns {boolean}
 */
export const isElement = (any) =>
	isNode(any) && any.nodeType === Node.ELEMENT_NODE;

/**
 * Is DocumentFragment?
 * @param {*} any
 * @returns {boolean}
 */
export const isDocumentFragment = (any) =>
	isNode(any) && any.nodeType === Node.DOCUMENT_FRAGMENT_NODE;

/**
 * Is Document?
 * @param {*} any
 * @returns {boolean}
 */
export const isDocument = (any) =>
	isNode(any) && any.nodeType === Node.DOCUMENT_NODE;

/**
 * NOTE: As long as this only works on {Proto}, it doesn't belong in here!!!
 * TODO: Test if something is a class (and not just a constructor) even if not a {Proto} class!
 * @see https://stackoverflow.com/questions/526559/testing-if-something-is-a-class-in-javascript
 * @param {*} any
 * @returns {boolean}
 */
export const isClass = (any) =>
	any && typeof any === 'function' ? /^\[class /.test(any.toString()) : false;

/*
function isFunction(funcOrClass) {
	const propertyNames = Object.getOwnPropertyNames(funcOrClass);
	return (!propertyNames.includes('prototype') || propertyNames.includes('arguments'));
}
console.log('class isFunction?', isFunction(class A {}));
console.log('function isFunction?', isFunction(function() {}));
console.log('async function isFunction?', isFunction(async function() {}));
console.log('arrow function isFunction?', isFunction(() => {}));
*/

/**
 * Something appears to be something array-like?
 * @param {*} any
 * @returns {boolean}
 */
export const isArrayLike = (any) => any && '0' in any && !isArray(any);

/**
 * Autocast string to an inferred type. '123' will
 * return a number, `false` will return a boolean.
 * @param {String} string
 * @returns {object}
 */
export const cast = (string) => {
	const s = String(string).trim();
	switch (s) {
		case 'null':
			return null;
		case 'undefined':
			return undefined;
		case 'true':
		case 'false':
			return s === 'true';
		default:
			return String(parseInt(s, 10)) === s
				? parseInt(s, 10)
				: String(parseFloat(s)) === s
				? parseFloat(s)
				: String(string);
	}
};
