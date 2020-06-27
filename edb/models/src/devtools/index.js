import * as Formatter from './Formatter';

/**
 * Install custom console debug formatters.
 * @param {Window|GlobalContext} [context]
 */
export default function (context = window) {
	formatters(context).push(Formatter);
}

// Scoped ......................................................................

/**
 * Formatters live inside a bizarre array that doesn't exist.
 * @param {Window|GlobalContext} context
 * @returns {Array<Object>}
 */
function formatters(context) {
	return context.devtoolsFormatters || (context.devtoolsFormatters = []);
}
