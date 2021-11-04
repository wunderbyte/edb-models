import * as Access from '../access/Access';
import * as Target from '../target/Target';
import Observers from './observers/Observers';
import getObjectPipe from './pipes/ObjectPipe';

/*
 * Reserved and special field names.
 * TODO: Shouldn't there be an `unobserve`???
 */
const [CONSTRUCTOR, CONSTRUCTED, ADD, REMOVE, OBSERVE, DISPOSE, DISPOSED] = [
	'constructor',
	'constructed',
	'addObserver',
	'removeObserver',
	'observe',
	'dispose', // TODO: Deprecate
	'disposed', // TODO: Deprecate
];

/*
 * Special property that can be checked during testing to confirm that
 * the target has indeed been successfully hidden behind by the Proxy.
 */
const CONFIRM_PROXY = '$CONFIRM_PROXY';

/**
 * Decorator to throw an exception on attempt to access destructed target.
 * TODO: This can become deprecated once we revoke the proxies for good.
 * @param {Object} object
 * @param {string} name
 * @param {Object} descriptor
 * @returns {Object}
 *
export function ok(object, name, descriptor) {
	const base = descriptor.value;
	descriptor.value = function (target, name) {
		if (name !== 'disposed' && Target.isDisposed(target)) {
			Access.reportDestructedViolation(target.constructor.name, name);
		} else {
			return base.apply(this, arguments);
		}
	};
	return descriptor;
}
*/

/**
 * Throw an exception on attempt to access destructed target.
 * @param {Proto} target
 * @param {string} name
 * @returns {boolean}
 */
export function cool(target, name) {
	if (name !== 'disposed' && Target.isDisposed(target)) {
		Access.reportDestructedViolation(target.constructor.name, name);
		return false;
	}
	return true;
}

/**
 * Proxytraps for model aspects (object-like properties).
 */
export default class ModelHandler {
	/**
	 * Create target mapping.
	 * @param {Proto} target
	 * @param {Object} object
	 */
	static init(target, object) {
		Object.entries(object).forEach(([key, value]) => {
			Target.set(target, key, piped(target, key, value));
		});
	}

	/**
	 * Get property (or method).
	 * @param {Proto} target
	 * @param {string} name
	 * @returns {*}
	 */
	static get(target, name) {
		if (cool(target, name)) {
			const value = special(target, name) || normal(target, name);
			return value === undefined ? uniget(target, name) : value;
		}
	}

	/**
	 * Set property.
	 * @param {Proto} target
	 * @param {string} name
	 * @param {*} value
	 * @returns {boolean}
	 */
	static set(target, name, value) {
		if (cool(target, name)) {
			if (!uniset(target, name, value)) {
				const val = piped(target, name, value);
				const old = Target.get(target, name);
				if (old !== val) {
					Target.set(target, name, val);
					Observers.$poke(target, name, val, old);
				}
			}
			return true;
		}
	}

	/**
	 * Get non-special keys (only).
	 * @param {Proto} target
	 * @returns {Array<string>}
	 */
	static keys(target) {
		return Target.publickeys(target);
	}
}

// Scoped ......................................................................

/**
 * Step 0:
 * Special methods and properties that require access to the
 * `target` that is hidden behind the proxy event horizon.
 * The `constructor` apparently needs a fix in V8 (at least).
 * @param {Proto} target
 * @param {string} name
 * @returns {*}
 */
function special(target, name) {
	switch (name) {
		case ADD:
			return (observer) => Observers.add(target, observer);
		case REMOVE:
			return (observer) => Observers.remove(target, observer);
		case OBSERVE:
			return (...args) => Observers.observe(target, ...args);
		case DISPOSE:
			return () => Target.dispose(target);
		case DISPOSED:
			return Target.isDisposed(target);
		case CONSTRUCTOR:
			return target.constructor;
		case CONSTRUCTED:
			return Target.isConstructed(target);
		case CONFIRM_PROXY:
			return true;
	}
}

/**
 * Attempt to assign the property via "universal setter".
 * @param {Proto} target
 * @param {string|Symbol} name
 * @param {*} value
 * @returns {truthy} - `true` if the unversal setter handled it.
 */
function uniset(target, name, value) {
	if (target.uniset && uniok(target, name)) {
		return universal(target, name, value);
	}
}

/**
 * Attempt to retrieve the property via "universal getter".
 * @param {Proto} target
 * @param {string|Symbol} name
 * @returns {truthy} - `undefined` unless the unversal getter handled it.
 */
function uniget(target, name) {
	if (target.uniget && uniok(target, name)) {
		return universal(target, name);
	}
}

/**
 * OK to evalute "universal" setter or getter?
 * @param {Proto} target
 * @param {string|Symbol} name
 * @returns {boolean}
 */
function uniok(target, name) {
	return (
		notsymbol(name) && Target.isConstructed(target) && !universal.suspended
	);
}

/**
 * To save the callstack, suspend interception
 * while calling "universal" getter or setter.
 * @param {Proto} target
 * @param {string} name
 * @param {*} [value]
 * @returns {*}
 */
function universal(target, name, value) {
	universal.suspended = true;
	const proxy = Target.getProxy(target);
	const getit = arguments.length === 2;
	const returnval = getit ? proxy.uniget(name) : proxy.uniset(name, value);
	universal.suspended = false;
	return returnval;
}

/**
 * Get normal property.
 * @param {Proto} target
 * @param {string} name
 * @returns {*}
 */
function normal(target, name) {
	Observers.$peek(target, name);
	return Target.get(target, name);
}

/**
 * @param {Proto} target
 * @param {string} key
 * @param {*} val
 * @returns {*}
 */
function piped(target, key, val) {
	const cons = target.constructor;
	const pipe = getObjectPipe(cons);
	return pipe ? pipeline(cons, pipe, key, val) : val;
}

/**
 * Potentially "upgrade" the value to an advanced type. If type definitions
 * have been declared, this will also validate the correct type of the value.
 * @param {Constructor} cons
 * @param {Object} pipe
 * @param {string} key
 * @param {*} val
 * @throws {TypeError}
 * @throws {Error}
 * @returns {*}
 */
function pipeline(cons, pipe, key, val) {
	return pipe.hasOwnProperty(key) // || typeof key === 'symbol' TODO: this!
		? pipe[key](val)
		: Access.badValue(cons.name, key);
}

/**
 * Just while Type.isSymbol is not exactly the fastest implementation.
 * @param {string|Symbol} name
 * @returns {boolean}
 */
function notsymbol(name) {
	return !!name.charAt;
}
