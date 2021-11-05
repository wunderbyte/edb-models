import * as ClassFormatter from './ClassFormatter';
import * as InstanceFormatter from './InstanceFormatter';

/**
 * @param {Class} Model 
 * @param {Class} Collection 
 * @returns {Object} Implements some kind of interface
 */
export function formatter(Model, Collection) {
	const objpipe = Symbol.for('@dataplastique/objectpipe');
	const arrpipe = Symbol.for('@dataplastique/arraypipe');
	const isfuncz = o => typeof o === 'function';
	const objectz = o => typeof o === 'object';
	const extendz = o => objectz(o) && Model.is(o);
	const definez = o => isfuncz(o) && o.isModelConstructor;
	const haspipe = o => !!(o[objpipe]() || (o[arrpipe] && o[arrpipe]()));
	const lengthy = o => !!(Object.keys(o).length || o.length);
	return {
		/**
		 * Render the header.
		 * @param {*} object
		 * @param {Object} [config]
		 * @returns {Object|null}
		 */
		header(object, config) {
			return config && config.dataplastique
				? InstanceFormatter.head(object, config.key)
				: definez(object)
					? ClassFormatter.head(object)
					: extendz(object)
						? InstanceFormatter.head(object)
						: null;
		},

		/**
		 * Should display a tree-twisty to expand either type defs or instance props?
		 * @param {*} object
		 * @returns {boolean}
		 */
		hasBody(object) {
			return definez(object) ? haspipe(object) : lengthy(object);
		},

		/**
		 * Render the body, either type definitions or instance props.
		 * @param {*} object
		 * @param {Object} [config]
		 * @returns {Object|null}
		 */
		body(object, config) {
			return config && config.dataplastique
				? InstanceFormatter.body(object)
				: definez(object)
					? ClassFormatter.body(object)
					: extendz(object)
						? InstanceFormatter.body(object)
						: null;
		}
	};
}
