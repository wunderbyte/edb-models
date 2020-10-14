import { requestTick, cancelTick } from '@edb/utils';
import { isConstructed, getProxy } from '../../target/Target';

/**
 * Mapping target to observers.
 * @type {Map<Set<IObserver|Function>>}
 */
const locals = new WeakMap();

/**
 * Listing observers for *all* targets. These are not so
 * easily garbage collected, so please don't linger here.
 * @type {Set<IObserver>}
 */
const globals = new Set();

/**
 * Models inspected in current execution stack.
 * @type {Map<Model, Set<string>}
 */
const peeks = new Map();

/**
 * Models changed in current execution stack.
 * @type {Map<Model, Map<string, Array>>}
 */
const pokes = new Map();

/**
 * Collections mutated in current execution stack: The indexed value is an
 * array of pre-update collection members, a snapshot from before the change.
 * @type {Map<Collection, Array>}
 */
const mutes = new Map();

/**
 * TODO: Implement this cache for resolving observers
 * @type {Map<Proto, Set<IObserver>>}
 */
const cache = new Map();

/**
 * While false, suspend observer notification
 * while inspecting properties (internal use).
 */
let peeking = true;

/**
 * Observers management studio.
 */
export default class Observers {
	/**
	 * TODO: What is this? either implement or remove!
	 */
	static unobserve() {}

	/**
	 * Add observer for target.
	 * @param {Proto} target
	 * @param {IObserver} [observer]
	 * @returns {Function}
	 */
	static add(target, observer = target) {
		let set = locals.get(target);
		if (observable(target)) {
			if (!set) {
				locals.set(target, (set = new Set()));
			}
			set.add(observer);
			return () => Observers.remove(target, observer);
		} else {
			observererror(target);
		}
	}

	/**
	 * Remove observer for target.
	 * @param {Proto} target
	 * @param {IObserver|Function} [observer]
	 */
	static remove(target, observer = target) {
		let set = locals.get(target);
		if (observable(target)) {
			if (set) {
				set.delete(observer);
				!set.size && locals.delete(target);
			}
		} else {
			observererror(target);
		}
	}

	/**
	 * Add callback for target.
	 * @param {Proto} target
	 * @param {Function|string} first
	 * @param {Function|undefined} last
	 * @returns {Function}
	 */
	static observe(target, first, last) {
		let set = locals.get(target);
		let fun = typeof first === 'string' ? last : first;
		let nam = typeof first === 'string' ? first : null;
		if (observable(target)) {
			const old = fun;
			// TODO: Think about the `this` pointer here
			nam &&
				(fun = (name, newval, oldval, target) => {
					name === nam && old(newval, oldval, target);
				});
			if (!set) {
				locals.set(target, (set = new Set()));
			}
			set.add(fun);
			return () => {
				set.delete(fun);
				!set.size && locals.delete(target);
			};
		} else {
			observererror(target);
		}
	}

	/**
	 * Add observer for all targets.
	 * @param {IObserver} observer
	 */
	static addGlobal(observer) {
		globals.add(observer);
	}

	/**
	 * Remove observer for all targets.
	 * @param {IObserver} observer
	 */
	static removeGlobal(observer) {
		globals.delete(observer);
	}

	/**
	 * Model property inspected.
	 * TODO: For globals, confirm that the property (descriptor) is writable.
	 * @param {Proto} target
	 * @param {string} name
	 */
	static $peek(target, name) {
		if (observable(target) && peeking) {
			if (globals.size) {
				suspendpeeking(() => {
					globals.forEach((observer) => {
						if (observer.onpeek) {
							observer.onpeek(getProxy(target), name);
						}
					});
				});
			}
			if (locals.has(target) && ispublic(name)) {
				let names = peeks.get(target);
				if (!names) {
					peeks.set(target, (names = new Set()));
				}
				names.add(name);
				debug('$peek', target);
				schedule();
			}
		}
	}

	/**
	 * TODO: Local observers should NOT be notified about "private"
	 * changes (unless they have been proxied by a "public" getter)
	 * Model property changed.
	 * @param {Proto} target
	 * @param {string} name
	 * @param {*} newval
	 * @param {*} oldval
	 */
	static $poke(target, name, newval, oldval) {
		if (observable(target)) {
			if (globals.size || locals.has(target)) {
				let props = pokes.get(target);
				if (props) {
					if (props.has(name)) {
						props.get(name)[0] = newval;
					} else {
						props.set(name, [newval, oldval]);
					}
				} else {
					props = new Map();
					props.set(name, [newval, oldval]);
					pokes.set(target, props);
				}
				debug('$poke', target, name);
				schedule();
			}
		}
	}

	/**
	 * Collection members changed somehow. This gets called *before* the
	 * update operation(s) happens: We'll snapshot the old collection and
	 * compare it to the new so that we can figure out what was changed.
	 * @param {Collection} target
	 */
	static $splice(target) {
		if (observable(target) && (globals.size || locals.has(target))) {
			if (!mutes.has(target)) {
				mutes.set(target, Array.from(target));
				debug('$splice', target);
				schedule();
			}
		}
	}
}

// Scoped ......................................................................

/**
 * Target should trigger peeks and pokes?
 * @param {Proto} target
 * @returns {boolean}
 */
function observable(target) {
	return isConstructed(target) && target.$observable;
}

/**
 * Do enable this once in a while for a quick sanity check.
 * Does it look like we need to setup some transient cache?
 * @param {string} action
 * @param {Proto} target
 * @param {string} name
 */
function debug(action, target, name) {
	if (false) {
		console.log(action, target.constructor.name, name || '');
	}
}

/**
 * Schedule updates async via `requestAnimationFrame`
 * (in the browser) or via `setTimeout` (in the Node).
 */
function schedule() {
	const id = schedule.id;
	cancelTick(isNaN(id) ? -1 : id);
	schedule.id = requestTick(onschedule);
}

/**
 * Run scheduled updates, updating observers.
 */
function onschedule() {
	snapshot(peeks).forEach(gopeek);
	snapshot(pokes).forEach(gopoke);
	snapshot(mutes).forEach(gomute);
}

/**
 * Transfer map contents to an array so that the map can be cleared
 * before we trigger any side effects that might repopulate the map.
 * @param {Map} map
 * @returns {Array<Model, String|Map<string, *>>|Array<*>}
 */
function snapshot(map) {
	const array = [];
	map.forEach((...mapping) => array.push(mapping));
	map.clear();
	return array;
}

/**
 * Update observers for properties inspected.
 * @param {Array<Model|Set>} update
 */
function gopeek([props, target]) {
	const proxy = getProxy(target);
	const observers = locals.get(target);
	if (observers) {
		suspendpeeking(() => {
			observers.forEach((observer) => {
				if (observer.onpeek) {
					props.forEach((name) => {
						observer.onpeek(proxy, name);
					});
				}
			});
		});
	}
}

/**
 * Update observers for properties changed.
 * @param {Array<Model|Map<string, Array>>} update
 */
function gopoke([props, target]) {
	const proxy = getProxy(target);
	const poke = (observer, isglobal) => {
		// TODO: harmonize the order of arguments in these two callback scenarios
		switch (typeof observer) {
			case 'object':
				if (observer.onpoke) {
					props.forEach(([newval, oldval], name) => {
						if (isglobal || ispublic(name)) {
							observer.onpoke(proxy, name, newval, oldval);
						}
					});
				}
				break;
			case 'function':
				props.forEach(([newval, oldval], name) => {
					if (isglobal || ispublic(name)) {
						observer(name, newval, oldval, proxy);
					}
				});
				break;
		}
	};
	globals.forEach((observer) => poke(observer, true));
	if (locals.has(target)) {
		locals.get(target).forEach((observer) => poke(observer));
	}
}

/**
 * Update observers for collection mutations.
 * @param {Array<Array<Any>, Collection<Any>>} update
 */
function gomute([source, target]) {
	const proxy = getProxy(target);
	const added = target.filter((any) => !source.includes(any));
	const removed = source.filter((any) => !target.includes(any));
	allobservers(target).forEach((observer) => {
		if (observer.onsplice) {
			observer.onsplice(proxy, added, removed);
		}
	});
}

/**
 * Suspend peek notifications for the duration of given action. Note that the
 * business logic here is unfortunate: To save the call stack, we must disable
 * notifications while we notify the observers. This means that we have a
 * blind spot for properties that can be inspected in stealth mode. This will
 * most likely be the observer inspecting it's own properties, so perhaps OK.
 * @param {Function} action
 */
function suspendpeeking(action) {
	peeking = false;
	action();
	peeking = true;
}

/**
 * Get local and global observers for target, avoiding potential duplicates.
 * TODO: Something must optimize, perhaps setup a short-lived cache thingy?
 * @param {Proto} target
 * @returns {Set<IObserver>}
 */
function allobservers(target) {
	const loc = locals.get(target) || new Set();
	const set = new Set([...globals, ...loc]);
	return set;
}

/**
 * Only trigger "public" observers on "public" properties.
 * TODO: Figure this out with getter that proxies private.
 * TODO: If possible, move this function into {Access}
 * @param {string} name
 * @returns {boolean}
 */
function ispublic(name) {
	return notsymbol(name) && name[0] !== '_' && name[0] !== '$';
}

/**
 * Don't trigger observers on Symbol access.
 * @param {string|Symbol} name
 * @returns {boolean}
 */
function notsymbol(name) {
	return !!name.charAt;
}

/**
 * Can't observe that.
 * @param {Proto} target
 * @throws {Error}
 */
function observererror(target) {
	const classname = target.constructor.name;
	throw new Error(`The ${classname} is unfortunately not observable.`);
}
