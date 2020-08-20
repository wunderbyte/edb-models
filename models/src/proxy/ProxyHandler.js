import * as Target from './target/Target';
import * as Access from './access/Access';
import ModelHandler from './handlers/ModelHandler';
import CollectionHandler from './handlers/CollectionHandler';
import Observers from './handlers/observers/Observers';
import { isFunction, isSymbol } from '@edb/utils';

/**
 * First level proxy traps. Validate and analyze getter and setter operations,
 * then forward reponsibility to either {ModelHandler} or {CollectionHandler}.
 */
export default class ProxyHandler {
	/**
	 * Getter trap.
	 * @param {Proto} target
	 * @param {string} name
	 * @returns {*}
	 */
	static get(target, name) {
		const desc = getaccessor(target, name);
		return desc
			? getter(target, desc, name)
			: isFunction(target[name])
			? target[name]
			: CollectionHandler.match(target, name)
			? CollectionHandler.get(target, name)
			: ModelHandler.get(target, name);
	}

	/**
	 * Setter trap.
	 * @param {Proto} target
	 * @param {string} name
	 * @param {*} value
	 * @param {object} [desc] - (used internally)
	 * @returns {boolean} Return success
	 */
	static set(target, name, value) {
		const desc = getaccessor(target, name);
		return desc
			? setter(target, desc, name, value)
			: CollectionHandler.match(target, name)
			? CollectionHandler.set(target, name, value)
			: illegal(target, name, target[name])
			? badset(target, name, true)
			: ModelHandler.set(target, name, value);
	}

	/**
	 * Trap for ownKeys must implement for Chrome
	 * to respect property enumerability setting.
	 * https://bugs.chromium.org/p/v8/issues/detail?id=1543#c153
	 * @param {Object} target
	 * @returns {Array<string>}
	 */
	static ownKeys(target) {
		const keys = ModelHandler.keys(target);
		return Reflect.ownKeys(target).concat(keys);
	}

	/**
	 * Make `Object.keys` work more or less like expected.
	 * TODO: Revise ad-hoc descriptor sometime later on!
	 * https://bugzilla.mozilla.org/show_bug.cgi?id=1110332
	 * http://mdn.io/Proxy/handler/getOwnPropertyDescriptor
	 * @param {Object} target
	 * @param {string} name
	 * @returns {Object} - Property descriptor
	 */
	static getOwnPropertyDescriptor(target, name) {
		const desc = getdescriptor(target, name);
		return desc
			? desc
			: Access.isPublic(name)
			? {
					value: ModelHandler.get(target, name),
					configurable: true,
					enumerable: true,
			  }
			: null;
	}

	/**
	 * Trap `definePropety`.
	 * @param {Object} target
	 * @param {string} name
	 * @param {Object} desc
	 * @returns {boolean}
	 */
	static defineProperty(target, name, desc) {
		const old = Target.get(target, name);
		const val = desc.value;
		return desc.get || desc.set
			? Access.badDefine(target, name)
			: old !== val
			? Target.isPreserved(target, name)
				? badset(target, name)
				: do {
						Target.set(target, name, val, desc);
						Observers.$poke(target, name, val, old);
						true;
				  }
			: true;
	}

	/**
	 * Delete trap.
	 * TODO: Actually go ahead and remove the key value
	 * pair instead of just setting key to `undefined`
	 * (observers could still call `onpoke` undefined).
	 * @param {Proto} target
	 * @param {string} name
	 * @returns {boolean} Return success
	 */
	static deleteProperty(target, name) {
		return this.set(target, name, undefined);
	}
}

// Scoped ......................................................................

/**
 * Get descriptor on target (not scanning the prototype chain).
 * @param {Proto} target
 * @param {string|Symbol} name
 * @returns {Object|undefined}
 */
function getdescriptor(target, name) {
	return Reflect.getOwnPropertyDescriptor(target, name);
}

/**
 * Get accessor for property (scanning the prototype chain).
 * @param {Proto} target
 * @param {string|Symbol} name
 * @returns {Object|undefined}
 */
function getaccessor(target, name) {
	const desc = getdescriptor(target, name);
	return isSymbol(name)
		? undefined
		: desc && (desc.get || desc.set)
		? desc
		: (target = Object.getPrototypeOf(target))
		? getaccessor(target, name)
		: undefined;
}

/**
 * Resolve getter.
 * @param {Proto} target
 * @param {*} desc
 * @param {string} name
 * @param {boolean} safe
 * @returns {*}
 * @throws {Error}
 */
function getter(target, desc, name, safe) {
	return desc.get
		? do {
				const pro = Target.getProxy(target);
				const res = desc.get.call(pro);
				Observers.$peek(target, name);
				res;
		  }
		: safe
		? undefined
		: Access.badGetter(target, name);
}

/**
 * Resolve setter.
 * @param {Proto} target
 * @param {*} desc
 * @param {string} name
 * @param {*} value
 * @returns {boolean} Survive the proxy trap
 * @throws {Error}
 */
function setter(target, desc, name, value) {
	return desc.set
		? do {
				const oldval = getter(target, desc, name, true);
				desc.set.call(Target.getProxy(target), value);
				Observers.$poke(target, name, value, oldval);
				true;
		  }
		: Access.badSetter(target, name);
}

/**
 * @param {Proto} target
 * @param {string} name
 * @param {*} field
 * @returns {boolean}
 *
 */
function illegal(target, name, field) {
	return (
		isFunction(field) ||
		Target.isReadonly(target, name) ||
		Access.isReserved(name)
	);
}

/**
 * @param {Proto} target
 * @param {string} name
 * @throws {Error}
 * @returns {boolean} false
 */
function badset(target, name) {
	Access.badValue(target, name);
	return false;
}
