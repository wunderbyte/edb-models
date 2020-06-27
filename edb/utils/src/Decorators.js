/**
 * Make a method return `this` if otherwise it would return `undefined`.
 * @param {Object} target
 * @param {string} name
 * @param {Object} descriptor
 * @returns {Object}
 */
export function chained(target, name, descriptor) {
	let unchained = descriptor.value;
	descriptor.value = function () {
		let result = unchained.apply(this, arguments);
		return result === undefined ? this : result;
	};
	return descriptor;
}
