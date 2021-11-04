import * as Output from '@edb/output';

/**
 * @param {Function} [superclass] Constructor
 * @returns {Proxy}
 */
export default function mixin(superclass = class {}) {
	return class Proto extends superclass {
		/**
		 * @type {boolean}
		 */
		get $observable() {
			return true;
		}

		/**
		 * Identification.
		 * @type {String}
		 */
		get [Symbol.toStringTag]() {
			return this.constructor.name;
		}

		/**
		 * More identification. This should probably be
		 * rethinked once `Symbol.toStringTag` works...
		 * @returns {string}
		 */
		toString() {
			return `[proto ${this.constructor.name}]`;
		}

		/**
		 * Painless constructor: No need to worry about constructor arguments.
		 * Whatever you would perform in the `constructor`, do it here instead.
		 * Subclass will decide, when it is appropriate to invoke this method.
		 */
		onconstruct() {}

		/**
		 * Called when the {Proto} is about to be disposed.
		 */
		ondestruct() {}

		/**
		 * Output this instance.
		 * @param {undefined|string|Symbol} [scope]
		 * @returns {this}
		 */
		@chained
		output(scope) {
			Output.output(this, scope);
		}

		/**
		 * Revoke this instance.
		 * @param {undefined|string|Symbol} [scope]
		 * @returns {this}
		 */
		@chained
		revoke(scope) {
			Output.revoke(this, scope);
		}

		// Static ..................................................................

		/**
		 * @param {Object} tree
		 * @param {Map<string, Class<Proto>>} map
		 * @returns {Proto}
		 */
		static sync(tree, map) {
			return new this.constructor();
		}

		/**
		 * Some given thing is an instance of this class?
		 * @param {*} thing
		 * @returns {boolean}
		 */
		static is(thing) {
			return typeof thing === 'object' && thing instanceof this;
		}

		/**
		 * Get latest output (instance of this type).
		 * @returns {Proto}
		 */
		static output() {
			return Output.get(this);
		}

		/**
		 * @returns {number}
		 */
		static timestamp() {
			return Output.timestamp(this);
		}

		/**
		 * TODO: Move this business login into {Output}
		 * @param {InputHandler|undefined} [handler]
		 * @returns {Constructor|Promise<Proto>}
		 */
		@chained
		static connect(handler) {
			return arguments.length
				? Output.connect(this, handler)
				: new Promise((resolve) => {
						Output.connect(
							this,
							function once(input) {
								Output.disconnect(this, once);
								resolve(input);
							}.bind(this)
						);
				  });
		}

		/**
		 * TODO: confirm interface.
		 * @param {InputHandler} handler
		 * @returns {Constructor}
		 */
		@chained
		static disconnect(handler) {
			Output.disconnect(this, handler);
		}

		/**
		 * Identification.
		 * TODO: Don't do this
		 * @type {String}
		 */
		static get [Symbol.toStringTag]() {
			return `[class ${this.name}]`;
		}

		/**
		 * Because the above doesn't seem to work.
		 * TODO: Don't do this
		 * @returns {String}
		 */
		static toString() {
			return this[Symbol.toStringTag];
		}

		/**
		 * Identification for ducks.
		 * TODO: Use Symbol
		 * @type {boolean}
		 */
		static get isProtoConstructor() {
			return true;
		}

		/**
		 * This has to do with property type checking and transformations
		 * (the subclass will reroute this method call to another method).
		 * @returns {null}
		 */
		static [Symbol.for('@edb/objectpipe')]() {
			return null;
		}
	};
}
