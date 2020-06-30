/**
 * Custom error base class.
 * TODO: How much of this code is needed nowadays?
 */
class Custom extends Error {
	constructor(message) {
		super(message);
		if (Error.hasOwnProperty('captureStackTrace')) {
			Error['captureStackTrace'](this, this.constructor);
		} else {
			Object.defineProperty(this, 'stack', {
				value: new Error(message).stack,
			});
		}
		this.name = this.constructor.name;
	}
}

export class NotFoundError extends Custom {}
export class MethodError extends Custom {}
export class NotAcceptableError extends Custom {}
export class UnsupportedError extends Custom {}
export class AccessError extends Custom {}
export class ConfigurationError extends Custom {}
