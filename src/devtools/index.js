import { formatter } from './Formatter';

/**
 * Install custom console debug formatters.
 * TODO: Don't require these arguments!
 * @param {Window|GlobalContext} [context]
 */
export default function(Model, Collection) {
	formatters().push(formatter(Model, Collection));
}

// Scoped ......................................................................

/**
 * Formatters live inside a bizarre array that doesn't exist.
 * @returns {Array<Object>}
 */
function formatters() {
	return window.devtoolsFormatters || (window.devtoolsFormatters = []);
}
