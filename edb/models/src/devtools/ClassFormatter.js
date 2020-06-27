import { simple, double } from './styling';

/**
 * @param {Class<Proto>} Model
 * @param {Object} [config]
 * @returns {Array}
 */
export function head(Model, config) {
	return ['div', simple, `class ${Model.name}`];
}

/**
 * @param {Class<Proto>} Model
 * @returns {Array}
 */
export function body(Model) {
	const objectpipe = Symbol.for('@edb/objectpipe');
	return ['div', simple, ...resolveAll(Model[objectpipe]())];
}

// Scoped ......................................................................

/**
 * @param {Object} model
 * @returns {Array}
 */
function resolveAll(model) {
	return Object.entries(model).map(resolveOne);
}

/**
 * @param {Array<string, *>} entry
 * @returns {Array}
 */
function resolveOne([key, value]) {
	return [
		'div',
		double,
		['span', simple, `${key}: `],
		['span', simple, format(value)],
	];
}

/**
 * @param {*} value
 * @returns {string}
 */
function format(value) {
	if (typeof value === 'function') {
		if (native(value) || value.isModelConstructor) {
			return value.name;
		} else {
			return '? function';
		}
	} else {
		return String(value);
	}
}

/**
 * TODO: More goes here!
 * @param {*} value
 * @returns {boolean}
 */
function native(value) {
	switch (value) {
		case String:
		case Number:
		case Boolean:
		case Object:
		case Array:
		case Function:
			return true;
	}
	return false;
}
