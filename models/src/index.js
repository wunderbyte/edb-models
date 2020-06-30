import installdevtools from './devtools/';
import { observe } from './proxy/ProxyFactory';
import { Environment } from '@edb/utils';

export { default as Tree } from './Tree';
export { default as Model } from './Model';
export { default as Collection } from './Collection';

if (Environment.browser) {
	installdevtools();
}

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