import { Mapping } from '@edb/utils';

/**
 * Mapping all scopes by key.
 * TODO: Unref scope with no output or handlers.
 * @type {Map<string|Symbol, Scope>}
 */
const scopes = new Map();

/**
 * Get scope by key. If not found, a new scope will be created.
 * @param {string|Symbol} key
 * @returns {Array<Map|Mapping>}
 */
export function getscope(key) {
	const scope = scopes.get(key) || scopes.set(key, new Scope()).get(key);
	return [scope.outscope, scope.handlers];
}

// Scoped ......................................................................

class Scope {
	/**
	 * Tracking output in this scope.
	 * @type {Map} <Constructor, Model>
	 */
	outscope = new Map();

	/**
	 * Tracking (set of) input handlers in this scope.
	 * @type {Mapping<Constructor, Set<Function|InputHandler>>}
	 */
	handlers = new Mapping();
}
