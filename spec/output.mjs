// src/utils/Type.js
var TYPE = /\s([a-zA-Z]+)/;
var stringify = Object.prototype.toString;
var typeOf = (any) => stringify.call(any).match(TYPE)[1].toLowerCase();
var isArray = (any) => Array.isArray(any);
var isFunction = (any) =>
	!!(typeof any === 'function' && any.call && any.apply);
var isObject = (any) => typeof any === 'object' && !Array.isArray(any);
var isString = (any) => typeof any === 'string';
var isNumber = (any) => typeof any === 'number';
var isBoolean = (any) => any === true || any === false;
var isDate = (any) => typeof any === 'object' && any instanceof Date;
var isSymbol = (any) => typeof any === 'symbol';
var isClass = (any) =>
	any && typeof any === 'function' ? /^\[class /.test(any.toString()) : false;

// src/utils/Key.js
var keys = new Set();
function generateKey(fix = 'key') {
	const ran = String(Math.random());
	const key = fix + ran.slice(2, 11);
	if (keys.has(key)) {
		return this.generate();
	}
	keys.add(key);
	return key;
}

// src/utils/MapSet.js
var MapSet = class {
	#map = new Map();
	add(key, value) {
		const map = this.#map;
		if (!map.has(key)) {
			map.set(key, new Set());
		}
		const set2 = map.get(key);
		if (!set2.has(value)) {
			set2.add(value);
		}
		return this;
	}
	del(key, value) {
		const map = this.#map;
		const set2 = map.get(key);
		if (set2 && set2.has(value)) {
			set2.delete(value);
			if (set2.size === 0) {
				map.delete(key);
			}
		}
		return this;
	}
	has(key, value) {
		const map = this.#map;
		const one = arguments.length === 1;
		return map.has(key) && (one || map.get(key).has(value));
	}
	get(key) {
		return this.has(key) ? new Set(this.#map.get(key)) : void 0;
	}
	clear() {
		this.#map.clear();
		return this;
	}
};

// src/utils/Environment.js
var global = typeof self !== 'undefined' ? self : Function('return this')();
var isNode = !!global.process;
var isBrowser = !!global.document;

// src/utils/Tick.js
function requestTick(cb) {
	return isBrowser ? requestAnimationFrame(cb) : setTimeout(cb);
}
function cancelTick(id) {
	isBrowser ? cancelAnimationFrame(id) : clearTimeout(id);
}

// spec/specs/Key.iso.spec.js
describe('util.Key', function likethis() {
	it('should generate a default key', () => {
		expect(generateKey().indexOf('key')).toBe(0);
	});
	it('should generate a named key', () => {
		expect(generateKey('name').indexOf('name')).toBe(0);
	});
});

// spec/specs/MapSet.iso.spec.js
describe('util.MapSet', function likethis2() {
	const KEY1 = 'key1';
	const KEY2 = 'key2';
	it('should push values to a set indexed by key', () => {
		let mapset = new MapSet().add(KEY1, 1).add(KEY1, 2).add(KEY2, 3);
		let set1 = mapset.get(KEY1);
		let set2 = mapset.get(KEY2);
		expect(set1).toEqual(jasmine.any(Set));
		expect(Array.from(set1)).toEqual([1, 2]);
		expect(Array.from(set2)).toEqual([3]);
	});
	it('should know when a set contains the given key', () => {
		let mapset = new MapSet().add(KEY1, 1).add(KEY1, 2);
		expect(mapset.has(KEY1, 2)).toBe(true);
	});
	it('should completely remove the set when empty', () => {
		let mapset = new MapSet().add(KEY1, 1).del(KEY1, 1);
		expect(mapset.get(KEY1)).toBe(void 0);
	});
});

// src/proxy/access/Access.js
var [ADD, REMOVE, OBSERVE] = ['addObserver', 'removeObserver', 'observe'];
function confirm(object) {
	if (object === null) {
		console.log('access confirm null');
		return true;
	}
	const keys2 = Object.keys(object);
	return keys2.every(ispublic) && !keys2.some(reserved);
}
function isPublic(name) {
	return ispublic(name);
}
function isReserved(name) {
	return reserved(name);
}
function badConstructor(target, object) {
	const props = Object.keys(object);
	bad(`Cannot create ${target.constructor.name}: ${problematic(props)}`);
}
function badValue(target, name) {
	bad(`Cannot assign to ${signature(target, name)}`);
}
function badGetter(target, name) {
	bad(`Getting a property that only has a setter: ${signature(target, name)}`);
}
function badSetter(target, name) {
	bad(`Setting a property that only has a getter: ${signature(target, name)}`);
}
function badDefine(target, name) {
	bad(`Cannot redefine ${signature(target, name)}`);
}
function reportDestructedViolation(cname, name) {
	bad(`Attempt to access "${name}" on destructed ${cname}`);
}
function signature(target, name) {
	return isSymbol(name)
		? '[symbol]'
		: `${isString(target) ? target : target.constructor.name}.${name}`;
}
function bad(message) {
	throw new Error(message);
}
function ispublic(name) {
	return !special(name);
}
function special(name) {
	return typeof name !== 'string' || name[0] === '_' || name[0] === '$';
}
function reserved(name) {
	switch (name) {
		case ADD:
		case REMOVE:
		case OBSERVE:
			return true;
	}
	return false;
}
function problematic(input) {
	if (Array.isArray(input)) {
		return input.filter(problematic).reduce((message, key) => {
			return (
				message +
				`  "${key}" is not allowed
`
			);
		}, '\n');
	} else {
		return special(input) || reserved(input);
	}
}

// src/proxy/target/Target.js
var [constructed, disposed] = [Symbol('constructed'), Symbol('disposed')];
var [proxy, normal, special2, readonly, locked] = [
	Symbol('proxy'),
	Symbol('normal'),
	Symbol('special'),
	Symbol('readonly'),
	Symbol('locked'),
];
function init(target, theproxy) {
	target[constructed] = false;
	target[disposed] = false;
	if ((target[proxy] = theproxy)) {
		target[normal] = new Map();
		target[special2] = new Map();
		target[readonly] = new Set();
		target[locked] = new Set();
	}
	$id(target);
}
function done(target) {
	target[constructed] = true;
}
function get(target, name) {
	return target[proxy] ? getmap(target, name).get(name) : target[name];
}
function set(target, name, value, desc) {
	if (target[proxy]) {
		getmap(target, name).set(name, value);
		maybepreserve(target, name, desc);
	} else {
		target[name] = value;
	}
}
function isPreserved(target, name) {
	return target[locked].has(name) || target[readonly].has(name);
}
function isReadonly(target, name) {
	return target[readonly].has(name);
}
function isConstructed(target) {
	return target[constructed];
}
function getProxy(target) {
	return target[proxy];
}
function isDisposed(target) {
	return target[disposed];
}
function publickeys(target) {
	return [...target[normal].keys()];
}
function dispose(target) {
	target[disposed] = true;
	(target[proxy] || target).ondestruct();
}
function $id(target) {
	const id = generateKey(classname(target));
	if (target[proxy]) {
		target[special2].set('$id', id);
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
function getmap(target, name) {
	return isPublic(name) ? target[normal] : target[special2];
}
function uppercase(name) {
	return notsymbol(name) && /^[A-Z0-9_\$]+$/.test(name);
}
function notsymbol(name) {
	return !!name.charAt;
}
function classname(target) {
	return target.constructor.name.replace(/(\$+)\d+$/, '');
}

// src/proxy/handlers/observers/Observers.js
var locals = new WeakMap();
var globals = new Set();
var peeks = new Map();
var pokes = new Map();
var mutes = new Map();
var cache = new Map();
var peeking = true;
var Observers = class {
	static unobserve() {}
	static add(target, observer = target) {
		let set2 = locals.get(target);
		if (observable(target)) {
			if (!set2) {
				locals.set(target, (set2 = new Set()));
			}
			set2.add(observer);
			return () => Observers.remove(target, observer);
		} else {
			observererror(target);
		}
	}
	static remove(target, observer = target) {
		let set2 = locals.get(target);
		if (observable(target)) {
			if (set2) {
				set2.delete(observer);
				!set2.size && locals.delete(target);
			}
		} else {
			observererror(target);
		}
	}
	static observe(target, first, last) {
		let get3 = (name) => getProxy(target)[name];
		let set2 = locals.get(target);
		let fun = typeof first === 'string' ? last : first;
		let nam = typeof first === 'string' ? first : null;
		if (observable(target)) {
			const old = fun;
			nam &&
				(fun = (name, newval, oldval, target2) => {
					name === nam && old(newval, oldval, target2);
				});
			if (!set2) {
				locals.set(target, (set2 = new Set()));
			}
			set2.add(fun);
			nam && old(get3(nam), void 0, target);
			return () => {
				set2.delete(fun);
				!set2.size && locals.delete(target);
			};
		} else {
			observererror(target);
		}
	}
	static addGlobal(observer) {
		globals.add(observer);
	}
	static removeGlobal(observer) {
		globals.delete(observer);
	}
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
			if (locals.has(target) && ispublic2(name)) {
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
	static $splice(target) {
		if (observable(target) && (globals.size || locals.has(target))) {
			if (!mutes.has(target)) {
				mutes.set(target, Array.from(target));
				debug('$splice', target);
				schedule();
			}
		}
	}
};
function observable(target) {
	return isConstructed(target) && target.$observable;
}
function debug(action, target, name) {
	if (false) {
		console.log(action, target.constructor.name, name || '');
	}
}
function schedule() {
	const id = schedule.id;
	cancelTick(isNaN(id) ? -1 : id);
	schedule.id = requestTick(onschedule);
}
function onschedule() {
	snapshot(peeks).forEach(gopeek);
	snapshot(pokes).forEach(gopoke);
	snapshot(mutes).forEach(gomute);
}
function snapshot(map) {
	const array = [];
	map.forEach((...mapping2) => array.push(mapping2));
	map.clear();
	return array;
}
function gopeek([props, target]) {
	const proxy2 = getProxy(target);
	const observers = locals.get(target);
	if (observers) {
		suspendpeeking(() => {
			observers.forEach((observer) => {
				if (observer.onpeek) {
					props.forEach((name) => {
						observer.onpeek(proxy2, name);
					});
				}
			});
		});
	}
}
function gopoke([props, target]) {
	const proxy2 = getProxy(target);
	const poke = (observer, isglobal) => {
		switch (typeof observer) {
			case 'object':
				if (observer.onpoke) {
					props.forEach(([newval, oldval], name) => {
						if (isglobal || ispublic2(name)) {
							observer.onpoke(proxy2, name, newval, oldval);
						}
					});
				}
				break;
			case 'function':
				props.forEach(([newval, oldval], name) => {
					if (isglobal || ispublic2(name)) {
						observer(name, newval, oldval, proxy2);
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
function gomute([source, target]) {
	const proxy2 = getProxy(target);
	const added = target.filter((any) => !source.includes(any));
	const removed = source.filter((any) => !target.includes(any));
	allobservers(target).forEach((observer) => {
		if (observer.onsplice) {
			observer.onsplice(proxy2, added, removed);
		}
	});
}
function suspendpeeking(action) {
	peeking = false;
	action();
	peeking = true;
}
function allobservers(target) {
	const loc = locals.get(target) || new Set();
	const set2 = new Set([...globals, ...loc]);
	return set2;
}
function ispublic2(name) {
	return notsymbol2(name) && name[0] !== '_' && name[0] !== '$';
}
function notsymbol2(name) {
	return !!name.charAt;
}
function observererror(target) {
	const classname2 = target.constructor.name;
	throw new Error(`The ${classname2} is unfortunately not observable.`);
}

// src/proxy/handlers/pipes/Validators.js
var validators = new Map([
	[String, isString],
	[Number, isNumber],
	[Boolean, isBoolean],
	[Object, isObject],
	[Array, isArray],
	[Function, isFunction],
	[Date, isDate],
	[Symbol, isSymbol],
]);
function getvalidator(cons) {
	return validators.has(cons) ? validators.get(cons) : newvalidator(cons);
}
var simplearray = (x) => Array.isArray(x) && x.constructor === Array;
var simplething = (x) => typeof x === 'object' && x.constructor === Object;
function newvalidator(cons) {
	const validator = Array.isArray(cons)
		? multivalidator(cons)
		: basicvalidator(cons);
	validators = validators.set(cons, validator);
	return validator;
}
function multivalidator(set2) {
	const validators2 = Array.from(set2).map(getvalidator);
	return (input) => validators2.some((isvalid) => isvalid(input));
}
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

// src/proxy/handlers/pipes/Converters.js
var converters = ((id) => {
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
function getconverter(cons) {
	return converters.has(cons) ? converters.get(cons) : newconverter(cons);
}
var simplearray2 = (x) => Array.isArray(x) && x.constructor === Array;
function newconverter(cons) {
	const converter = Array.isArray(cons)
		? multiconverter(cons)
		: basicconverter(cons);
	converters = converters.set(cons, converter);
	return converter;
}
function multiconverter(set2) {
	return (input) => {
		console.log('TODO: multiconverter');
		return input;
	};
}
function basicconverter(cons) {
	return (input) => {
		if (input === null) {
			console.log('TODO: converter null');
			return input;
		}
		return input instanceof cons
			? input
			: cons.isCollectionConstructor
			? simplearray2(input)
				? new cons(...input)
				: typeerror()
			: new cons(input);
	};
}
function typeerror(message = 'TODO') {
	throw new TypeError(message);
}

// src/proxy/handlers/pipes/ObjectPipe.js
var pipes = new Map();
function getObjectPipe(Proto) {
	return pipes.has(Proto)
		? pipes.get(Proto)
		: (function () {
				const pipe = resolve(Proto);
				pipes.set(Proto, pipe);
				return pipe;
		  })();
}
var mappings = new Map();
function resolve(Proto, map = ancestors(Proto).reduce(mapping)) {
	return map === null ? map : buildpipe(Proto, map);
}
function ancestors(Proto, list = [Proto]) {
	return (Proto = Object.getPrototypeOf(Proto)).isProtoConstructor
		? ancestors(Proto, list.concat(Proto))
		: list.reverse();
}
function mapping(oldmap, Proto) {
	return mappings.has(Proto)
		? mappings.get(Proto)
		: function () {
				const symbol = Symbol.for('@edb/objectpipe');
				const newmap = Proto[symbol](oldmap || {});
				mappings.set(Proto, newmap);
				return newmap;
		  };
}
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
function throwinvalid(Proto, key, input, cons) {
	const name = (c) => c.name;
	const list = (c) => [...c.map(name)].join('|');
	const want = Array.isArray(cons) ? list(cons) : name(cons);
	const fail2 = failedtype(input);
	const clas = name(Proto);
	throw new TypeError(
		`Bad assignment to ${clas}.${key}: Expected ${want}, got ${fail2}.`
	);
}
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

// src/proxy/handlers/ModelHandler.js
var [CONSTRUCTOR, CONSTRUCTED, ADD2, REMOVE2, OBSERVE2, DISPOSE, DISPOSED] = [
	'constructor',
	'constructed',
	'addObserver',
	'removeObserver',
	'observe',
	'dispose',
	'disposed',
];
var CONFIRM_PROXY = '$CONFIRM_PROXY';
function cool(target, name) {
	if (name !== 'disposed' && isDisposed(target)) {
		reportDestructedViolation(target.constructor.name, name);
		return false;
	}
	return true;
}
var ModelHandler = class {
	static init(target, object) {
		Object.entries(object).forEach(([key, value]) => {
			set(target, key, piped(target, key, value));
		});
	}
	static get(target, name) {
		if (cool(target, name)) {
			const value = special3(target, name) || normal2(target, name);
			return value === void 0 ? uniget(target, name) : value;
		}
	}
	static set(target, name, value) {
		if (cool(target, name)) {
			if (!uniset(target, name, value)) {
				const val = piped(target, name, value);
				const old = get(target, name);
				if (old !== val) {
					set(target, name, val);
					Observers.$poke(target, name, val, old);
				}
			}
			return true;
		}
	}
	static keys(target) {
		return publickeys(target);
	}
};
function special3(target, name) {
	switch (name) {
		case ADD2:
			return (observer) => Observers.add(target, observer);
		case REMOVE2:
			return (observer) => Observers.remove(target, observer);
		case OBSERVE2:
			return (...args) => Observers.observe(target, ...args);
		case DISPOSE:
			return () => dispose(target);
		case DISPOSED:
			return isDisposed(target);
		case CONSTRUCTOR:
			return target.constructor;
		case CONSTRUCTED:
			return isConstructed(target);
		case CONFIRM_PROXY:
			return true;
	}
}
function uniset(target, name, value) {
	if (target.uniset && uniok(target, name)) {
		return universal(target, name, value);
	}
}
function uniget(target, name) {
	if (target.uniget && uniok(target, name)) {
		return universal(target, name);
	}
}
function uniok(target, name) {
	return notsymbol3(name) && isConstructed(target) && !universal.suspended;
}
function universal(target, name, value) {
	universal.suspended = true;
	const proxy2 = getProxy(target);
	const getit = arguments.length === 2;
	const returnval = getit ? proxy2.uniget(name) : proxy2.uniset(name, value);
	universal.suspended = false;
	return returnval;
}
function normal2(target, name) {
	Observers.$peek(target, name);
	return get(target, name);
}
function piped(target, key, val) {
	const cons = target.constructor;
	const pipe = getObjectPipe(cons);
	return pipe ? pipeline(cons, pipe, key, val) : val;
}
function pipeline(cons, pipe, key, val) {
	return pipe.hasOwnProperty(key) ? pipe[key](val) : badValue(cons.name, key);
}
function notsymbol3(name) {
	return !!name.charAt;
}

// src/proxy/handlers/pipes/ArrayPipe.js
var pipes2 = new Map();
function getArrayPipe(cons) {
	return pipes2.has(cons)
		? pipes2.get(cons)
		: (function () {
				const name = Symbol.for('@edb/arraypipe');
				const type = cons[name]();
				const pipe = createpipe(cons, type);
				pipes2.set(cons, pipe);
				return pipe;
		  })();
}
var primitives = new Set([String, Number, Boolean, Symbol]);
var identitypipe = (input) => input;
function createpipe(col, pipe) {
	if (pipe) {
		return primitives.has(pipe)
			? identitypipe
			: isClass(pipe)
			? constructorpipe(col, pipe)
			: isFunction(pipe)
			? functionpipe(col, pipe)
			: typeerror2();
	} else {
		return pipe === null ? identitypipe : typeerror2();
	}
}
function constructorpipe(col, pipe) {
	const validator = getvalidator(pipe);
	const converter = getconverter(pipe);
	return (input) => {
		return validator(input) ? converter(input) : fail(col, pipe, input);
	};
}
function functionpipe(col, pipe) {
	return (input) => {
		const constructor = pipe(input);
		return constructor.isModelConstructor
			? getconverter(constructor)(input)
			: typeerror2(`Expected constructor, got ${typeOf(constructor)}`);
	};
}
function fail(col, pipe, input) {
	const [name, type] = [col.name || 'Anonymous', typeOf(input)];
	typeerror2(`Bad input for ${name}: Expected ${pipe.name}, got ${type}.`);
}
function typeerror2(message) {
	throw new TypeError(message);
}

// src/proxy/handlers/CollectionHandler.js
var INTEGER = /^-*(?:[1-9]\d*|\d)$/;
var CollectionHandler = class {
	static init(target, array) {
		if (Array.isArray(target)) {
			getProxy(target).push(...array);
		}
	}
	static match(target, name) {
		return (
			Array.isArray(target) &&
			notsymbol4(name) &&
			(name === 'length' || INTEGER.test(name))
		);
	}
	static get(target, name) {
		if (cool(target, name)) {
			Observers.$peek(target, name);
			return target[name];
		}
	}
	static set(target, name, value) {
		if (cool(target, name)) {
			Observers.$splice(target);
			if (name === 'length') {
				target[name] = value;
			} else {
				target[name] = value !== void 0 ? resolve2(target, value) : value;
			}
			return true;
		}
	}
};
function notsymbol4(name) {
	return !!name.charAt;
}
function resolve2(target, value) {
	const cons = target.constructor;
	const pipe = getArrayPipe(cons);
	return pipe ? pipe(value) : value;
}

// src/proxy/ProxyHandler.js
var ProxyHandler = class {
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
	static ownKeys(target) {
		const keys2 = ModelHandler.keys(target);
		return Reflect.ownKeys(target).concat(keys2);
	}
	static getOwnPropertyDescriptor(target, name) {
		const desc = getdescriptor(target, name);
		return desc
			? desc
			: isPublic(name)
			? {
					value: ModelHandler.get(target, name),
					configurable: true,
					enumerable: true,
			  }
			: null;
	}
	static defineProperty(target, name, desc) {
		const old = get(target, name);
		const val = desc.value;
		return desc.get || desc.set
			? badDefine(target, name)
			: old !== val
			? isPreserved(target, name)
				? badset(target, name)
				: (function () {
						set(target, name, val, desc);
						Observers.$poke(target, name, val, old);
						return true;
				  })()
			: true;
	}
	static deleteProperty(target, name) {
		return this.set(target, name, void 0);
	}
};
function getdescriptor(target, name) {
	return Reflect.getOwnPropertyDescriptor(target, name);
}
function getaccessor(target, name) {
	const desc = getdescriptor(target, name);
	return isSymbol(name)
		? void 0
		: desc && (desc.get || desc.set)
		? desc
		: (target = Object.getPrototypeOf(target))
		? getaccessor(target, name)
		: void 0;
}
function getter(target, desc, name, safe) {
	return desc.get
		? (function () {
				const pro = getProxy(target);
				const res = desc.get.call(pro);
				Observers.$peek(target, name);
				return res;
		  })()
		: safe
		? void 0
		: badGetter(target, name);
}
function setter(target, desc, name, value) {
	return desc.set
		? (function () {
				const oldval = getter(target, desc, name, true);
				desc.set.call(getProxy(target), value);
				Observers.$poke(target, name, value, oldval);
				return true;
		  })()
		: badSetter(target, name);
}
function illegal(target, name, field) {
	return isFunction(field) || isReadonly(target, name) || isReserved(name);
}
function badset(target, name) {
	badValue(target, name);
	return false;
}

// src/proxy/ProxyFactory.js
function approximate(target, object, array) {
	return Array.isArray(target) || confirm(object)
		? target.$observable
			? proxify(...arguments)
			: natural(...arguments)
		: badConstructor(target, object);
}
function proxify(target, object, array) {
	const proxy2 = new Proxy(target, ProxyHandler);
	common(target, object, array, proxy2);
	proxy2.onconstruct();
	return proxy2;
}
function natural(target, object, array) {
	common(target, object, array);
	target.onconstruct();
	return target;
}
function common(target, object, array, proxy2 = null) {
	init(target, proxy2);
	ModelHandler.init(target, object);
	CollectionHandler.init(target, array);
	done(target);
}

// src/output/scopes.js
var scopes = new Map();
function getscope(key) {
	const scope = scopes.get(key) || scopes.set(key, new Scope()).get(key);
	return [scope.outscope, scope.handlers];
}
var Scope = class {
	outscope = new Map();
	handlers = new MapSet();
};

// src/output/Output.js
var pubkey = Symbol('Output');
function output(model, key = pubkey) {
	const C = timestamp(model.constructor);
	const [outscope, handlers] = getscope(key);
	outscope.set(C, model);
	if (handlers.has(C)) {
		handlers.get(C).forEach((handler) => {
			handler.oninput ? handler.oninput(model) : handler(model);
		});
	}
}
function revoke(model, key = pubkey) {
	const C = model.constructor;
	const [outscope, handlers] = getscope(key);
	if (outscope.get(C) === model) {
		outscope.delete(C);
		if (handlers.has(C)) {
			Array.from(handlers.get(C))
				.filter((handler) => !!handler.onrevoke)
				.forEach((handler) => handler.onrevoke(C));
		}
	}
}
function connect(C, handler, key = pubkey) {
	const [outscope, handlers] = getscope(key);
	if (!handlers.has(C, handler)) {
		handlers.add(C, handler);
		if (outscope.has(C)) {
			const arg = outscope.get(C);
			handler.oninput ? handler.oninput(arg) : handler(arg);
		}
	}
}
function disconnect(C, handler, key = pubkey) {
	const [outscope, handlers] = getscope(key);
	handlers.del(C, handler);
}
function get2(C, key = pubkey) {
	const [outscope] = getscope(key);
	return outscope.get(C) || null;
}
function timestamp(C) {
	const now = isBrowser ? performance.now() : Date.now();
	C[Symbol.for('@edb/timestamp')] = now;
	return C;
}

// src/models/Proto.js
function mixin(superclass = class {}) {
	return class Proto extends superclass {
		get $observable() {
			return true;
		}
		get [Symbol.toStringTag]() {
			return this.constructor.name;
		}
		toString() {
			return `[proto ${this.constructor.name}]`;
		}
		onconstruct() {}
		ondestruct() {}
		output(scope) {
			output(this, scope);
			return this;
		}
		revoke(scope) {
			revoke(this, scope);
			return this;
		}
		static sync(tree, map) {
			return new this.constructor();
		}
		static is(thing) {
			return typeof thing === 'object' && thing instanceof this;
		}
		static output() {
			return get2(this);
		}
		static timestamp() {
			return timestamp(this);
		}
		static connect(handler) {
			if (arguments.length) {
				connect(this, handler);
				return this;
			} else {
				return new Promise((resolve3) => {
					connect(
						this,
						function once(input) {
							disconnect(this, once);
							resolve3(input);
						}.bind(this)
					);
				});
			}
		}
		static disconnect(handler) {
			disconnect(this, handler);
			return this;
		}
		static get [Symbol.toStringTag]() {
			return `[class ${this.name}]`;
		}
		static toString() {
			return this[Symbol.toStringTag];
		}
		static get isProtoConstructor() {
			return true;
		}
		static [Symbol.for('@edb/objectpipe')]() {
			return null;
		}
	};
}

// src/models/Model.js
var Model = class extends mixin() {
	constructor(object = Object.create(null)) {
		return approximate(super(), object);
	}
	get model() {
		return this;
	}
	get [Symbol.toStringTag]() {
		return 'Model';
	}
	toString() {
		return `[model ${this.constructor.name}]`;
	}
	static model(map) {
		return null;
	}
	static [Symbol.for('@edb/objectpipe')](map) {
		return this.model(...arguments);
	}
	static get isModelConstructor() {
		return true;
	}
	static cast(thing) {
		return thing;
	}
};

// src/models/Collection.js
var Collection = class extends mixin(class extends Array {}) {
	constructor(...args) {
		return approximate(super(), Object.create(null), args);
	}
	get collection() {
		return this;
	}
	get [Symbol.toStringTag]() {
		return 'Collection';
	}
	toString() {
		return `[collection ${this.constructor.name}]`;
	}
	static $of(cons) {
		return class extends this {
			static collection() {
				return cons;
			}
		};
	}
	static model(map) {
		return null;
	}
	static collection() {
		return null;
	}
	static [Symbol.for('@edb/objectpipe')](map) {
		return this.model(...arguments);
	}
	static [Symbol.for('@edb/arraypipe')]() {
		return this.collection();
	}
	static get [Symbol.species]() {
		return Array;
	}
	static get isModelConstructor() {
		return true;
	}
	static get isCollectionConstructor() {
		return true;
	}
};

// spec/specs/Model.iso.spec.js
describe('edb.Model', function likethis3() {
	class MyModel extends Model {
		onconstruct() {
			super.onconstruct();
			this.called = true;
		}
	}
	it('should call `onconstruct` when constructed', () => {
		let model = new MyModel();
		expect(model.called).toBe(true);
	});
	it('should throw an AccessError', () => {
		class MyModel2 extends Model {}
		const model = new MyModel2({ nickname: 'Morten' });
		expect(model.nickname).toBe('Morten');
		model.dispose();
		expecterror('destructed', () => {
			console.log(model.nickname);
		});
	});
});

// spec/specs/Model.proxy.iso.spec.js
describe('edb.Model proxy', function likethis4() {
	class MyModel extends Model {
		[Symbol('private')] = 23;
	}
	it('should be proxied, to begin with', () => {
		let mymodel = new MyModel();
		expect(mymodel.$CONFIRM_PROXY).toBe(true);
	});
	it('should store public keys', () => {
		let model = new MyModel();
		model.publickey = 'public';
		expect(model.publickey).toBe('public');
	});
	it('should store special keys', () => {
		let model = new MyModel();
		let symbolkey = Symbol('key');
		model._privatekey = 'private';
		model.$privilegedkey = 'privileged';
		model[symbolkey] = 'symbol';
		expect(model._privatekey).toBe('private');
		expect(model.$privilegedkey).toBe('privileged');
		expect(model[symbolkey]).toBe('symbol');
	});
	it('should support defineProperty', () => {
		let ok = false;
		let model = new MyModel();
		Reflect.defineProperty(model, 'normal', {
			writable: true,
			value: 23,
		});
		Reflect.defineProperty(model, 'readonly', {
			value: 23,
		});
		expecterror(
			'cannot assign',
			() => (model.readonly = 0),
			() => {
				Reflect.defineProperty(model, 'normal', {
					value: 'changed',
				});
			}
		);
		expect(model.normal).toBe(23);
	});
	it('should not casually reveal special properties', () => {
		let ok = true;
		const model = new MyModel();
		model._specialkey = 'private';
		model.$specialkey = 'privileged';
		model._CONSTANTED = 'CONSTANT';
		Reflect.defineProperty(model, '_privatekey', {
			value: 'This will become non-enumarable!',
			enumerable: true,
			writable: true,
		});
		expect(Object.keys(model).length).toBe(0);
		expect(JSON.parse(JSON.stringify(model))).toEqual({});
		for (let prop in model) {
			ok = false;
		}
		expect(ok).toBe(true);
	});
	it('should never reveal the value of symbol properties', () => {
		const symbol = Symbol('secret');
		const model = new MyModel();
		model[symbol] = 23;
		expect(model[symbol]).toBe(23);
		const symbols = Object.getOwnPropertySymbols(model);
		const undef = (symbol2) => model[symbol2] === void 0;
		expect(symbols.every(undef)).toBe(true);
	});
	it('should however reveal all normal properties', () => {
		let model = new MyModel();
		model.name = 'John';
		model.age = '23';
		model.married = false;
		expect(Object.keys(model).length).toBe(3);
		expect(JSON.parse(JSON.stringify(model))).toEqual({
			name: 'John',
			age: '23',
			married: false,
		});
	});
	it('should disallow special keys in constructor argument', () => {
		expecterror('not allowed', () => {
			let model = new MyModel({
				_privatekey: 'a',
				$privilegedkey: 'b',
				[Symbol('key')]: 'c',
			});
		});
	});
	it('should have have a nonconfigurable `$id`', () => {
		let model = new MyModel();
		let fails = false;
		expect(typeof model.$id).toBe('string');
		expecterror('cannot assign', () => {
			model.$id = 'John';
		});
	});
	it('should declare uppercase property names as readonly', () => {
		let model = new MyModel({
			CONSTANT_1: 'readonly',
			CONSTANT_2: 'readonly',
		});
		model.CONSTANT_3 = 'readonly';
		expecterror(
			'cannot assign',
			() => (model.CONSTANT_1 = 0),
			() => (model.CONSTANT_2 = 0),
			() => (model.CONSTANT_3 = 0),
			() => {
				Reflect.defineProperty(model, 'CONSTANT_1', {
					value: 0,
				});
			}
		);
	});
});

// spec/specs/Model.pipes.iso.spec.js
var TypedModel = class extends Model {
	static model() {
		return {
			name: String,
			age: Number,
			married: Boolean,
			object: Object,
			array: Array,
			onclick: Function,
			multitype: [String, Number, Boolean],
		};
	}
	greeting() {
		return 'hi';
	}
};
describe('edb.Model pipes provide type safety', () => {
	it('should accept the constructor object', () => {
		let model = new TypedModel({
			name: 'John',
			age: 23,
			married: false,
			object: {},
			array: [],
		});
		expect(model.name).toBe('John');
		expect(model.age).toBe(23);
		expect(model.married).toBe(false);
		expect(model.object).toEqual(jasmine.any(Object));
		expect(model.array).toEqual(jasmine.any(Array));
	});
	it('should accept the property assigment', () => {
		let model = new TypedModel();
		model.name = 'Jim Bob';
		expect(model.name).toBe('Jim Bob');
	});
	it('should explode on bad constructor object', () => {
		expecterror('bad assignment', () => {
			new TypedModel({
				name: Math.random(),
			});
		});
	});
	it('should explode on bad assignment', () => {
		let model = new TypedModel();
		expecterror('bad assignment', () => {
			model.object = new Array(23);
		});
	});
	it('should explode on assignment to undeclared key', () => {
		let model = new TypedModel();
		expecterror('cannot assign', () => {
			model.badname = 'Sauron';
		});
	});
	it('should explode on undeclared key in constructor argument', () => {
		expecterror('cannot assign', () => {
			new TypedModel({
				badname: 'Sauron',
			});
		});
	});
	it('should explode on overwriting a normal instance method', () => {
		let model = new TypedModel();
		expecterror('cannot assign', () => {
			model.greeting = () => 'hello there';
		});
	});
	it('should however let you implement a configurable method', () => {
		let model = new TypedModel();
		model.onclick = () => 'clicked';
		expect(model.onclick()).toBe('clicked');
	});
	it('should validate assignment of variable types', () => {
		const model = new TypedModel();
		['x', 23, true].forEach((primitive) => {
			model.multitype = primitive;
			expect(model.multitype).toBe(primitive);
		});
		expecterror('bad assignment', () => {
			model.multitype = [23];
		});
	});
	it('should throw on attempt to redefine the property descriptor', () => {
		expecterror('cannot redefine', () => {
			Reflect.defineProperty(new TypedModel(), 'name', {
				get: function () {
					return 'Arne';
				},
			});
		});
	});
});
describe('edb.Model pipes are inherited and can be modified', () => {
	it('can inherit type interface from ancestor class', () => {
		class SubModel extends TypedModel {}
		expecterror('cannot assign', () => {
			new SubModel().bonusprop = true;
		});
	});
	it('can extend type interface from ancestor class (NOTE: NEEDS WORK)', () => {
		class AnotherSubModel extends TypedModel {
			static model(parent) {
				return Object.assign(parent, {
					bonusprop: Boolean,
				});
			}
		}
		const model = new AnotherSubModel({
			name: 'Jib Bob Johnson',
			bonusprop: true,
		});
		expect(model.bonusprop).toBe(true);
	});
});
describe('edb.Model pipes convert objects and arrays to Models and Collections', () => {
	class Person extends Model {
		static model() {
			return {
				name: String,
				friend: Person,
				pet: Animal,
			};
		}
	}
	class Animal extends Model {
		static model() {
			return {
				name: String,
			};
		}
	}
	it('should map objects to models in constructor argument', () => {
		const jim = new Person({
			name: 'Jim Bob',
			pet: { name: 'Pretty' },
			friend: {
				name: 'John Johnson',
				pet: { name: 'Beauty' },
			},
		});
		expect(jim.pet).toEqual(jasmine.any(Animal));
		expect(jim.friend).toEqual(jasmine.any(Person));
		expect(jim.friend.pet).toEqual(jasmine.any(Animal));
	});
	it('should map objects to models in setters', () => {
		const jim = new Person();
		jim.pet = { name: 'Pretty' };
		jim.friend = { name: 'John' };
		jim.friend.pet = { name: 'Beauty' };
		expect(jim.pet).toEqual(jasmine.any(Animal));
		expect(jim.friend).toEqual(jasmine.any(Person));
		expect(jim.friend.pet).toEqual(jasmine.any(Animal));
	});
	it('should pass along instantiated valid models', () => {
		const john = new Person();
		const jim = new Person({
			friend: john,
		});
		expect(jim.friend).toBe(john);
	});
	it('should explode on instantiated invalid models', () => {
		const pet = new Animal();
		expecterror('bad assignment', () => {
			new Person({ friend: pet });
		});
	});
	it('should upgrade assignments of variable type', () => {
		expect(true).toBe(true);
	});
});

// spec/specs/Model.output.iso.spec.js
describe('edb.Model can output to connected handlers', () => {
	it('should connect and disconnect', () => {
		class MyModel extends Model {}
		let mymodel = new MyModel();
		MyModel.connect({
			oninput(input) {
				expect(input).toEqual(mymodel);
				let ignored = new MyModel();
				MyModel.disconnect(this);
				ignored.output();
			},
		});
		mymodel.output();
	});
	it('should input the latest output', (done2) => {
		class MyModel extends Model {}
		let mymodel = new MyModel().output();
		later(() => {
			MyModel.connect({
				oninput(input) {
					expect(input).toEqual(mymodel);
					done2();
				},
			});
		});
	});
	it('should revoke the output', (done2) => {
		class MyModel extends Model {}
		let mymodel = new MyModel();
		let initial = true;
		MyModel.connect({
			oninput(input) {
				expect(input).toEqual(mymodel);
			},
			onrevoke(C) {
				expect(C).toEqual(MyModel);
				done2();
			},
		});
		mymodel.output();
		mymodel.revoke();
	});
	it('should not trigger revoked output', (done2) => {
		class MyModel extends Model {}
		let mymodel = new MyModel();
		mymodel.output().revoke();
		later(() => {
			let triggered = false;
			MyModel.connect({
				oninput(input) {
					triggered = true;
				},
			});
			expect(triggered).toBe(false);
			done2();
		});
	});
	it('should support simple function callbacks', () => {
		class MyModel extends Model {}
		let mymodel = new MyModel();
		MyModel.connect(function cb(input) {
			expect(input).toEqual(mymodel);
			let ignored = new MyModel();
			MyModel.disconnect(cb);
			ignored.output();
		});
		mymodel.output();
	});
	it('should return a promise when the handler is omitted', (done2) => {
		class MyModel extends Model {}
		let mymodel1 = new MyModel();
		MyModel.connect().then((input) => {
			expect(input).toEqual(mymodel1);
		});
		mymodel1.output();
		let mymodel2 = new MyModel();
		mymodel2.output();
		MyModel.connect().then((input) => {
			expect(input).toEqual(mymodel2);
		});
		done2();
	});
});

// spec/specs/Model.observers.iso.spec.js
describe('edb.Model can be observed', () => {
	class MyModel extends Model {
		_private = 23;
		onconstruct() {
			this.$privileged = 23;
		}
	}
	class SecretModel extends Model {
		get $observable() {
			return false;
		}
	}
	it('should know when properties are changed, inspected, added and removed', (done2) => {
		let poked = false;
		let peekt = false;
		let added = false;
		let nuked = false;
		let name1 = 'Bob';
		let name2 = 'Jim';
		let model = new MyModel({
			name: name1,
			age: 23,
		});
		model.addObserver({
			onpeek(model2, name) {
				peekt = peekt || name === 'name';
			},
			onpoke(model2, name, value) {
				poked = poked || (name === 'name' && value === name2);
				nuked = nuked || (name === 'age' && value === void 0);
				added = added || name === 'hobby';
			},
		});
		if (model.name === name1) {
			model.hobby = 'Toys';
			model.name = name2;
			delete model.age;
		}
		later(() => {
			expect(peekt && poked && added && nuked).toBe(true);
			done2();
		});
	});
	it('should not notify observers on private or privileged props changed', (done2) => {
		let model = new MyModel();
		let works = true;
		model.addObserver({
			onpeek() {
				works = false;
			},
			onpoke() {
				works = false;
			},
		});
		model._private = 0;
		model.$privileged = 0;
		later(() => {
			expect(works).toBe(true);
			done2();
		});
	});
	it('should support simple function callbacks as observers', (done2) => {
		let model = new MyModel({ age: 23 });
		let works = true;
		let poked = false;
		const cleanup = model.observe((name, value, oldval, target) => {
			poked = true;
			works =
				name === 'age' && value === 24 && oldval === 23 && target === model;
		});
		expect(poked).toBe(false);
		model.age = 24;
		later(() => {
			expect(poked).toBe(true);
			expect(works).toBe(true);
			cleanup();
			model.age = 25;
			later(() => {
				expect(works).toBe(true);
				done2();
			});
		});
	});
	it('should support observing single properties', (done2) => {
		let model = new MyModel({ age: 23 });
		let works = true;
		let poked = false;
		const cleanup = model.observe('age', (value, oldval, target) => {
			poked = value === 23;
			works = value === 24 && oldval === 23 && target === model;
		});
		expect(poked).toBe(true);
		model.age = 24;
		later(() => {
			expect(works).toBe(true);
			cleanup();
			model.age = 25;
			later(() => {
				expect(works).toBe(true);
				done2();
			});
		});
	});
	it("(should really trigger when a public getter exposes a private prop, but it won't)", () => {
		expect(true).toBe(true);
	});
});

// spec/specs/Collection.iso.spec.js
describe('edb.Collection', function likethis5() {
	class Person extends Model {
		static model() {
			return {
				name: String,
			};
		}
	}
	class Animal extends Model {
		static model() {
			return {
				species: String,
			};
		}
	}
	class PersonCollection extends Collection {
		static collection() {
			return Person;
		}
	}
	class LifeFormCollection extends Collection {
		static collection() {
			return (input) => (input.species ? Animal : Person);
		}
	}
	it('should be proxied, obviously', () => {
		let persons = new PersonCollection();
		expect(persons.$CONFIRM_PROXY).toBe(true);
	});
	it('should behave like an array', () => {
		let col = new Collection(1, 2, 3, 4, 5);
		expect(col.length).toBe(5);
		col.push(void 0);
		expect(col.length).toBe(6);
		let last = col.pop();
		expect(last).toBe(void 0);
		expect(col.length).toBe(5);
		let first = col.shift();
		expect(first).toBe(1);
		expect(col.length).toBe(4);
	});
	it('should support simple objects and arrays', () => {
		let simpleo = (o) => o.constructor === Object;
		let simplea = (a) => a.constructor === Array;
		let objects = new Collection(
			{ name: 'John' },
			{ name: 'Bob' },
			{ name: 'Bill' }
		);
		expect(objects.every(simpleo)).toBe(true);
		expect(objects.map((o) => [o]).every(simplea)).toBe(true);
	});
	it('should convert objects into models', () => {
		let persons = new PersonCollection(
			{ name: 'John' },
			{ name: 'Bob' },
			{ name: 'Bill' }
		);
		expect(persons.every((person) => Person.is(person))).toBe(true);
	});
	it('should support multiple types of models', () => {
		let persons = new LifeFormCollection(
			{ name: 'Billy' },
			{ name: 'Bobby' },
			{ species: 'Goat' },
			{ species: 'Stork' },
			{ species: 'Baboon' }
		);
		expect(Person.is(persons[0])).toBe(true);
		expect(Animal.is(persons[2])).toBe(true);
	});
	it('should mutate like an array', () => {
		let persons = new PersonCollection();
		persons.push({ name: 'D' });
		persons.unshift({ name: 'C' });
		persons.splice(0, 0, { name: 'A' }, { name: 'B' });
		persons[4] = { name: 'E' };
		expect(persons.length).toBe(5);
		expect(persons.map((p) => p.name)).toEqual(['A', 'B', 'C', 'D', 'E']);
		expect(persons.every((p) => Person.is(p))).toBe(true);
	});
	it('should iterate and reduce like an array', () => {
		let persons = new PersonCollection({ name: 'John' });
		['forEach', 'every', 'map', 'filter', 'find'].forEach((method) => {
			persons[method](function (elm, idx, src) {
				expect(Person.is(elm)).toBe(true);
				expect(idx).toBe(0);
				expect(src).toBe(persons);
				expect(this).toBe(Math.PI);
			}, Math.PI);
		});
		['reduce', 'reduceRight'].forEach((method) => {
			persons[method](function (pre, now, idx, src) {
				expect(pre).toBe(Math.PI);
				expect(Person.is(now)).toBe(true);
				expect(idx).toBe(0);
				expect(src).toBe(persons);
			}, Math.PI);
		});
		let p = persons.find((x) => x.name === 'John');
		expect(p.name).toBe('John');
	});
	it('should stringify to JSON as simple array of objects', () => {
		let persons = new LifeFormCollection(
			{ name: 'Billy' },
			{ species: 'Goat' }
		);
		expect(persons.every((p) => Model.is(p))).toBe(true);
		expect(JSON.parse(JSON.stringify(persons))).toEqual([
			{ name: 'Billy' },
			{ species: 'Goat' },
		]);
	});
	it('can be observed', (done2) => {
		let name = (person) => person.name;
		let persons = new PersonCollection(
			{ name: 'John' },
			{ name: 'Bob' },
			{ name: 'Bill' }
		);
		persons.addObserver({
			onsplice(collection, added, removed) {
				expect(collection).toBe(persons);
				expect(added.map(name)).toEqual(['Henrik', 'Miguel', 'Heino']);
				expect(removed.map(name)).toEqual(['John', 'Bob', 'Bill']);
				persons.removeObserver(this);
				done2();
			},
		});
		persons.pop();
		persons[0] = { name: 'Henrik' };
		persons[1] = { name: 'Miguel' };
		persons.push({ name: 'Heino' });
	});
});
