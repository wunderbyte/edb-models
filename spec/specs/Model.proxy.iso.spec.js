import { Model } from '@edb/models';

/*
 * Model proxy specs.
 * TODO: test exceptions on get and set bogus property (and setting methods)
 */
describe('edb.Model proxy', function likethis() {
	class MyModel extends Model {
		[Symbol('private')] = 23;
	}

	it('should be proxied, to begin with', () => {
		let mymodel = new MyModel();
		expect(mymodel.$CONFIRM_PROXY).toBe(true);
	});

	it('should store public keys', () => {
		let model = new MyModel();
		model.publickey = 'public';
		expect(model.publickey).toBe('public');
	});

	it('should store special keys', () => {
		let model = new MyModel();
		let symbolkey = Symbol('key');
		model._privatekey = 'private';
		model.$privilegedkey = 'privileged';
		model[symbolkey] = 'symbol';
		expect(model._privatekey).toBe('private');
		expect(model.$privilegedkey).toBe('privileged');
		expect(model[symbolkey]).toBe('symbol');
	});

	it('should support defineProperty', () => {
		let ok = false;
		let model = new MyModel();
		Reflect.defineProperty(model, 'normal', {
			writable: true,
			value: 23,
		});
		Reflect.defineProperty(model, 'readonly', {
			value: 23,
		});
		expecterror(
			'cannot assign',
			() => (model.readonly = 0),
			() => {
				Reflect.defineProperty(model, 'normal', {
					value: 'changed',
				});
			}
		);
		expect(model.normal).toBe(23);
	});

	it('should not casually reveal special properties', () => {
		let ok = true;
		const model = new MyModel();
		model._specialkey = 'private';
		model.$specialkey = 'privileged';
		model._CONSTANTED = 'CONSTANT';
		Reflect.defineProperty(model, '_privatekey', {
			value: 'This will become non-enumarable!',
			enumerable: true,
			writable: true,
		});
		expect(Object.keys(model).length).toBe(0);
		expect(JSON.parse(JSON.stringify(model))).toEqual({});
		for (let prop in model) {
			ok = false;
		}
		expect(ok).toBe(true);
	});

	it('should never reveal the value of symbol properties', () => {
		const symbol = Symbol('secret');
		const model = new MyModel();
		model[symbol] = 23;
		expect(model[symbol]).toBe(23);
		const symbols = Object.getOwnPropertySymbols(model);
		const undef = (symbol) => model[symbol] === undefined;
		expect(symbols.every(undef)).toBe(true);
	});

	// https://bugzilla.mozilla.org/show_bug.cgi?id=1110332
	it('should however reveal all normal properties', () => {
		let model = new MyModel();
		model.name = 'John';
		model.age = '23';
		model.married = false;
		expect(Object.keys(model).length).toBe(3);
		expect(JSON.parse(JSON.stringify(model))).toEqual({
			name: 'John',
			age: '23',
			married: false,
		});
	});

	it('should disallow special keys in constructor argument', () => {
		expecterror('not allowed', () => {
			let model = new MyModel({
				_privatekey: 'a',
				$privilegedkey: 'b',
				[Symbol('key')]: 'c',
			});
		});
	});

	it('should have have a nonconfigurable `$id`', () => {
		let model = new MyModel();
		let fails = false;
		expect(typeof model.$id).toBe('string');
		expecterror('cannot assign', () => {
			model.$id = 'John';
		});
	});

	it('should declare uppercase property names as readonly', () => {
		let model = new MyModel({
			CONSTANT_1: 'readonly',
			CONSTANT_2: 'readonly',
		});
		model.CONSTANT_3 = 'readonly';
		expecterror(
			'cannot assign',
			() => (model.CONSTANT_1 = 0),
			() => (model.CONSTANT_2 = 0),
			() => (model.CONSTANT_3 = 0),
			() => {
				Reflect.defineProperty(model, 'CONSTANT_1', {
					value: 0,
				});
			}
		);
	});
});
