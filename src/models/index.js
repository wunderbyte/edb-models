import installdevtools from '@edb/devtools';
import { observe } from '@edb/proxy';
import { isBrowser } from '@edb/utils';
import Model from './Model';
import Collection from './Collection';

export { Model as Model };
export { Collection as Collection };

/**
 * TODO: Not in production (via process.env.NODE_ENV)
 */
isBrowser && installdevtools(Model, Collection);

/**
 * TODO: Expose this via static method `Model.addObserver` !!!
 * @param {Observer} obs - TODO: Define `Observer` interface somewhere
 */
export function addGlobalObserver(obs) {
	observe(true, obs);
}

/**
 * TODO: Expose this via static method `Model.addObserver` !!!
 * @param {Observer} obs
 */
export function removeGlobalObserver(obs) {
	observe(false, obs);
}