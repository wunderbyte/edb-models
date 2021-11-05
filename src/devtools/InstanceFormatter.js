import { simple, dimmed, indent, double } from './styling';

/**
 * @param {Object|Array|Model} object
 * @param {string|number} key
 * @returns {Array}
 */
export function head(object, key) {
	const name = getTitle(object, key);
	const guid = object.$id ? ` (${object.$id})` : '';
	return ['div', simple, ['span', simple, name], ['span', dimmed, guid]];
}

/**
 * @param {Object|Array|Model} object
 * @returns {Array}
 */
export function body(object) {
	return ['div', simple].concat(
		Array.isArray(object) ? arrayMembers(object) : instanceProps(object)
	);
}

// Scoped ......................................................................

/**
 * TODO: Color coding goes here!
 * @param {string|number} key
 * @param {*} value
 * @returns {string}
 */
function asattrib(key, value) {
	return `${key}: ${value}`;
}

/**
 * @param {Object|Array|Model} object
 * @param {string|number} key
 * @returns {string}
 */
function getTitle(object, key) {
	return key !== undefined
		? asattrib(key, getTitle(object))
		: getName(object, object.constructor);
}

/**
 * @param {Object|Array|Model} object
 * @param {Class<Object|Array|Model>} constructor
 * @returns {string}
 */
function getName(object, constructor) {
	switch (constructor) {
		case Object:
			return Object.keys(object).length ? '{…}' : '{}';
		case Array:
			return object.length ? '[…]' : '[]';
		default:
			return constructor.name;
	}
}

/**
 * Resolve array arrayMembers.
 * @param {Array} array
 * @returns {Array}
 */
function arrayMembers(array) {
	return array.map((value, index) => {
		return dennis(index, value);
	});
}

/**
 * Resolve instance (own) properties.
 * @param {Object} object
 * @returns {Array}
 */
function instanceProps(object) {
	return Object.entries(object).map(([key, value]) => {
		return dennis(key, value);
	});
}

/**
 * @param {string|number} key
 * @param {*} value
 * @returns {Array}
 */
function dennis(key, value) {
	const output = hans(key, value);
	const simple = typeof output === 'string';
	return ['div', simple ? double : indent, output];
}

/*
 * @param {string|number} key
 * @param {*} value
 * @returns {Array}
 */
function hans(key, value) {
	if (typeof value === 'object') {
		return asobject(key, value);
	} else {
		return asattrib(key, format(value));
	}
}

/**
 * Format quotes on strings.
 * @param {*} value
 * @returns {*}
 */
function format(value) {
	return typeof value === 'string' ? `"${value}"` : value;
}

/**
 * @param {string|number} key
 * @param {Object|Array} value
 * @returns {Array}
 */
function asobject(key, value) {
	return [
		'object',
		{
			object: value,
			config: {
				dataplastique: true,
				key: key
			}
		}
	];
}
