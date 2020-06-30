/**
 * Interface Observer.
 */
export default class IObserver {
	/**
	 * Model property changed.
	 * @param {Proto} model
	 * @param {string} name
	 * @param {Ary} newval
	 * @param {*} oldval
	 */
	onpoke(model, name, newval, oldval) {}

	/**
	 * Model property inspected.
	 * @param {Proto} model
	 * @param {string} name
	 */
	onpeek(model, name) {}

	/**
	 * Work in progress.
	 * @param {Collection} collection
	 * @param {Array<Any>} added
	 * @param {Array<Any>} removed
	 * @param {Array<Any>} moved TODO: This was deprecated, right?
	 */
	onsplice(collection, added, removed, moved) {}
}
