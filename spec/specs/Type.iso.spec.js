import { isFunction, isClass } from '@edb/utils';

describe('util.Type', function likethis() {
	describe('Discern between function types', () => {
		// Preparation .............................................................

		function func() {}
		function Cons() {}
		Cons.prototype = {
			method() {},
		};
		class Con1 {}
		class Con2 {
			method() {}
		}
		let object = {
			method() {},
		};
		class Cla1 {
			method() {}
		}
		class Cla2 extends Cla1 {}
		let cla3 = class {};

		// Expectations ............................................................

		it('should be a function', () => {
			expect(isFunction(func)).toBe(true);
			expect(isFunction(Cons)).toBe(true);
			expect(isFunction(Con2)).toBe(true);
			expect(isFunction(new Cons().method)).toBe(true);
			expect(isFunction(new Con2().method)).toBe(true);
		});

		/*
			 * TODO!
			 *
			it('should be a class (constructor)', () => {
				expect(isClass(Cla1)).toBe(true);
				expect(isClass(Cla2)).toBe(true);
				expect(isClass(cla3)).toBe(true);
			});
			*/
	});
});
