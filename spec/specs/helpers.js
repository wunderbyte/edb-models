/**
 * @param {Function} cb
 */
export function later(cb) {
	setTimeout(cb, 50);
}

/**
 * @param {Function} expect
 * @param {string} message
 * @param  {...Function} attempts
 */
export function expecterror(expect, message, ...attempts) {
	message = message.toLowerCase();
	attempts.forEach((attempt) => {
		try {
			attempt();
			expect(`should throw "${message}"`).toBe(true);
		} catch (exception) {
			expect(exception.message.toLowerCase()).toContain(message);
		}
	});
}
