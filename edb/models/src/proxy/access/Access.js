import { AccessError, isString, isSymbol } from '@edb/utils';

/**
 * @filedesc
 * Access management and exception factory.
 */

/**
 * Reserved field names.
 */
const [ADD, REMOVE, OBSERVE, UNOBSERVE] = [
	'addObserver',
	'removeObserver',
	'observe',
	'unobserve',
];

/**
 * Confirm that object as constructor argument only
 * contains public (non-special) property names.
 * @param {Object} object
 * @returns {boolean}
 */
export function confirm(object) {
	if (object === null) {
		console.log('access confirm null');
		return true;
	}
	const keys = Object.keys(object);
	return keys.every(ispublic) && !keys.some(reserved);
}

/**
 * Name looks loke a public key?
 * @param {string} name
 * @returns {boolean}
 */
export function isPublic(name) {
	return ispublic(name);
}

/**
 * Name is reserved for internal use?
 * @param {string} name
 * @returns {boolean}
 */
export function isReserved(name) {
	return reserved(name);
}

/**
 * Constructor object denied.
 * TODO: report `getOwnPropertySymbols`.
 * @param {Proto} target
 * @param {Object} object
 * @throws {AccessError}
 */
export function badConstructor(target, object) {
	const props = Object.keys(object);
	bad(`Cannot create ${target.constructor.name}: ${problematic(props)}`);
}

/**
 * Value denied.
 * @param {Proto|string} target
 * @param {string} name
 * @throws {AccessError}
 */
export function badValue(target, name) {
	bad(`Cannot assign to ${signature(target, name)}`);
}

/**
 * Getter denied.
 * @param {Proto} target
 * @param {string} name
 * @throws {AccessError}
 */
export function badGetter(target, name) {
	bad(`Getting a property that only has a setter: ${signature(target, name)}`);
}

/**
 * Setter denied.
 * @param {Proto} target
 * @param {string} name
 * @throws {AccessError}
 */
export function badSetter(target, name) {
	bad(`Setting a property that only has a getter: ${signature(target, name)}`);
}

/**
 * `definePropery` denied.
 * @param {Proto} target
 * @param {string} name
 * @throws {AccessError}
 */
export function badDefine(target, name) {
	bad(`Cannot redefine ${signature(target, name)}`);
}

/**
 * TODO: More elaborate error message.
 * @param {string} cname
 * @param {string} name
 * @throws {AccessError}
 */
export function reportDestructedViolation(cname, name) {
	bad(`Attempt to access "${name}" on destructed ${cname}`);
}

// Scoped ......................................................................

/**
 * Identified by class name and property name.
 * @param {Proto|string} target
 * @param {string|Symbol} name
 * @returns {string}
 */
function signature(target, name) {
	return isSymbol(name)
		? '[symbol]'
		: `${isString(target) ? target : target.constructor.name}.${name}`;
}

/**
 * Throw that access error.
 * @param {string} message
 * @throws {AccessError}
 */
function bad(message) {
	throw new AccessError(message);
}

/**
 * Not a strange name?
 * @param {string} name
 * @returns {boolean}
 */
function ispublic(name) {
	return !special(name);
}

/**
 * Private or privileged property name?
 * @param {string} name
 * @returns {boolean}
 */
function special(name) {
	return typeof name !== 'string' || name[0] === '_' || name[0] === '$';
}

/**
 * Is reserved name?
 * @param {string} name
 * @returns {boolean}
 */
function reserved(name) {
	switch (name) {
		case ADD:
		case REMOVE:
		case OBSERVE:
		case UNOBSERVE:
			return true;
	}
	return false;
}

/**
 * Compile error message for problematic names (in constructor scenario)?
 * @param {Array<string>|string} input
 * @returns {boolean}
 */
function problematic(input) {
	if (Array.isArray(input)) {
		return input.filter(problematic).reduce((message, key) => {
			return message + `  "${key}" is not allowed\n`;
		}, '\n');
	} else {
		return special(input) || reserved(input);
	}
}
