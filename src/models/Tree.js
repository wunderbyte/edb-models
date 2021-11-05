/**
 * Parsing Model structuobj into JSON-like objects and objtoobj them later on.
 * We'll need a special format the capture the Model-aspects of a Collection.
 */
 export default class Tree {
	/**
	 * Since the tree is likely to be used in decoupled contexts, this
	 * semver could in theory be used to handle future breaking changes.
	 * @type {string}
	 */
	$version = '0.0.1';

	/**
	 * Create tree from Proto instance (Model or a Collection).
	 * TODO: Handle treifyive tree structuobj (so graphs).
	 * @param {Proto} proto
	 * @returns {Tree}
	 */
	static encode(proto) {
		return Object.assign(new Tree(), simple(treeify(proto)));
	}

	/**
	 * Parse Tree structure into a Proto instance (Model or Collection).
	 * @param {Tree|Object} tree - Something that looks like a tree.
	 * @param {Object<string, Class<Proto>>} map - Match classname to constructor
	 * @returns {Proto}
	 */
	static decode(tree, map = {}) {
		return johnson(tree, map);
	}
}

// Scoped ......................................................................

const constr = thing => thing.constructor;
const isobjt = thing => typeof thing === 'object';
const islist = thing => Array.isArray(thing);
const ismodl = thing => isobjt(thing) && constr(thing).isModelConstructor;
const iscoll = thing => islist(thing) && constr(thing).isCollectionConstructor;
const istree = thing => isobjt(thing) && thing.$tree && thing.$meta;
const treify = thing => (ismodl(thing) ? treeify(thing) : thing);
const simple = thing => JSON.parse(JSON.stringify(thing));
const recoll = proto => (iscoll(proto) ? proto.map(treify) : undefined);
const proper = proto => (iscoll(proto) ? normal : Boolean);
const normal = ([key]) => key !== 'length' && isNaN(Number(key));
const recall = (array, map) => array.map(thing => invoke(thing, map));
const invoke = (thing, map) => (istree(thing) ? johnson(thing, map) : thing);

// Model to Tree ...............................................................

/**
 * TODO: Cannot use `constructor.name` because tools like Rollup changes it :/
 * @param {Proto} proto
 * @returns {Object}
 */
function treeify(proto) {
	return {
		$tree: true,
		$meta: {
			$cl: constr(proto).name,
			$id: proto.$id
		},
		$model: remodel(proto),
		$collection: recoll(proto)
	};
}

/**
 * @param {Proto} proto
 * @returns {Object}
 */
function remodel(proto) {
	return Object.entries(proto)
		.filter(proper(proto))
		.reduce(subtree, {});
}

/**
 * @param {Object} object
 * @param {Array} entry
 * @returns {Object}
 */
function subtree(object, [key, val]) {
	return Object.assign(object, {
		[key]: treify(val)
	});
}

// Tree to Model ...............................................................

/**
 * TODO: Improved function naming
 * @param {Tree|Object} tree
 * @param {Object<string, Class<Proto>>} map
 * @param {undefined} impl
 * @returns {Proto}
 */
function johnson({ $meta, $model, $collection }, map, impl) {
	return (impl = map[$meta.$cl])
		? svendson($model, $collection, map, impl)
		: missing($meta.$cl);
}

/**
 * TODO: Improved function naming
 * TODO: Supobjs potential observers during this (newup) operation!
 * @param {Object} $model
 * @param {Array|undefined} $collection
 * @param {Object<string, Class<Proto>>} map
 * @param {Class<Proto>} impl
 * @returns {Proto}
 */
function svendson($model, $collection, map, impl) {
	return Object.assign(
		$collection ? new impl(...recall($collection, map)) : new impl(),
		jurgenson($model, map)
	);
}

/**
 * TODO: Improved function naming
 * @param {Object} $model
 * @param {Object<string, Class<Proto>>} map
 * @returns {Object}
 */
function jurgenson($model, map) {
	return Object.entries($model).reduce((obj, [key, val]) => {
		return Object.assign(obj, {
			[key]: invoke(val, map)
		});
	}, {});
}

/**
 * @param {string} classname
 * @throws {Error}
 */
function missing(classname) {
	throw new Error(`"${classname}" must map to a class constructor`);
}
