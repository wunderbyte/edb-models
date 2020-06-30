import { generateKey } from '@edb/utils';
import { isPublic } from '../access/Access';

/**
 * @filedesc
 * Manage {Proto} properties.
 */

/**
 * Artifacts shared by all {Proto} instances.
 */
const [constructed, disposed] = [Symbol('constructed'), Symbol('disposed')];

/**
 * Special artifacts for proxied {Proto} instances.
 */
const [proxy, normal, special, readonly, locked] = [
	Symbol('proxy'),
	Symbol('normal'),
	Symbol('special'),
	Symbol('readonly'),
	Symbol('locked'),
];

/**
 * Setup artifacts.
 * @param {Object} target
 * @param {Proxy} [theproxy]
 */
export function init(target, theproxy) {
	target[constructed] = false;
	target[disposed] = false;
	if ((target[proxy] = theproxy)) {
		target[normal] = new Map();
		target[special] = new Map();
		target[readonly] = new Set();
		target[locked] = new Set();
	}
	$id(target);
}

/**
 * Mark the target with a special property upon construction completed.
 * This will make sure that observers are not triggered during newup.
 * @param {Object} target
 */
export function done(target) {
	target[constructed] = true;
}

/**
 * Get property.
 * @param {Object} target
 * @param {string} name
 * @returns {*}
 */
export function get(target, name) {
	if (target[proxy]) {
		return getmap(target, name).get(name);
	} else {
		return target[name];
	}
}

/**
 * Set property.
 * @param {Object} target
 * @param {string} name
 * @param {*} value
 * @param {Object} [desc]
 */
export function set(target, name, value, desc) {
	if (target[proxy]) {
		getmap(target, name).set(name, value);
		maybepreserve(target, name, desc);
	} else {
		target[name] = value; // TODO: HANDLE THAT DESCRIPTOR !!!!!!!
	}
}

/**
 * Is property readonly or nonconfigurable?
 * @param {Object} target
 * @param {string} name
 * @returns {boolean}
 */
export function isPreserved(target, name) {
	return target[locked].has(name) || target[readonly].has(name);
}

/**
 * Is property readonly?
 * @param {Object} target
 * @param {string} name
 * @returns {boolean}
 */
export function isReadonly(target, name) {
	return target[readonly].has(name);
}

/**
 * Target is done parsing constructor arguments?
 * @param {Object} target
 * @returns {boolean}
 */
export function isConstructed(target) {
	return target[constructed];
}

/**
 * Get target proxy.
 * @param {Object} target
 * @returns {Proxy}
 */
export function getProxy(target) {
	return target[proxy]; // TODO: WHAT IF NOT? CHECK THE USE CASES HERE...
}

/**
 * Target has been disposed?
 * @param {Proto} target
 * @returns {boolean}
 */
export function isDisposed(target) {
	return target[disposed];
}

/**
 * Get non-special keys (only).
 * @param {Proto} target
 * @returns {Array<string>}
 */
export function publickeys(target) {
	return [...target[normal].keys()];
}

/**
 * Recursively dispose the target.
 * TODO: Revoke the proxies here!
 * @param {Object} target
 */
export function dispose(target) {
	target[disposed] = true;
	(target[proxy] || target).ondestruct();
}

// Scoped ......................................................................

/**
 * Compute and assign the unique `$id`.
 * @param {Proto} target
 * @param {boolean} proxied
 */
function $id(target) {
	const id = generateKey(classname(target));
	if (target[proxy]) {
		target[special].set('$id', id);
		target[readonly].add('$id');
		target[locked].add('$id');
	} else {
		Reflect.defineProperty(target, '$id', {
			configurable: false,
			enumerable: false,
			writable: false,
			value: id,
		});
	}
}

/**
 * Make readonly or nonconfigurable or both.
 * @param {Proto} target
 * @param {string} name
 * @param {Object} [desc]
 */
function maybepreserve(target, name, desc) {
	if (uppercase(name)) {
		target[locked].add(name);
		target[readonly].add(name);
	} else if (desc) {
		if (!desc.configurable) {
			target[locked].add(name);
		}
		if (!desc.writable) {
			target[readonly].add(name);
		}
	}
}

/**
 * Get map for normal or special properties (public or private).
 * @param {Proto} target
 * @param {string} name
 * @returns {Map}
 */
function getmap(target, name) {
	return isPublic(name) ? target[normal] : target[special];
}

/**
 * Property name matches a readonly value because UPPERCASE convention?
 * @param {string} name
 * @returns {boolean}
 */
function uppercase(name) {
	return notsymbol(name) && /^[A-Z0-9_\$]+$/.test(name);
}

/**
 * Not a symbol?
 * @param {string|Symbol} name
 * @returns {boolean}
 */
function notsymbol(name) {
	return !!name.charAt;
}

/**
 * Elegantly normalize some classname$$1 that was sanitized by Rollup :/
 * TODO: Perhaps let `displayName` take precedence in case of mangling?
 * @param {Proto} target
 * @returns {string}
 */
function classname(target) {
	return target.constructor.name.replace(/(\$+)\d+$/, '');
}
