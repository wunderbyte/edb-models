import { Model } from '@edb/models';
// import { isImmutable } from '@edb/utils';

/**
 *TODO: allow private props that are not undefined even when note in model() - Symbols only?'
 */
export default function () {
	class TypedModel extends Model {
		static model() {
			return {
				name: String,
				age: Number,
				married: Boolean,
				object: Object,
				array: Array,
				onclick: Function,
				// anything: undefined,
				multitype: [String, Number, Boolean],
			};
		}
		greeting() {
			return 'hi';
		}
	}

	describe('edb.Model pipes provide type safety', () => {
		it('should accept the constructor object', () => {
			let model = new TypedModel({
				name: 'John',
				age: 23,
				married: false,
				object: {},
				array: [],
				// anything: new Date()
			});
			expect(model.name).toBe('John');
			expect(model.age).toBe(23);
			expect(model.married).toBe(false);
			expect(model.object).toEqual(jasmine.any(Object));
			expect(model.array).toEqual(jasmine.any(Array));
		});

		it('should accept the property assigment', () => {
			let model = new TypedModel();
			model.name = 'Jim Bob';
			expect(model.name).toBe('Jim Bob');
		});

		it('should explode on bad constructor object', () => {
			expecterror('bad assignment', () => {
				new TypedModel({
					name: Math.random(),
				});
			});
		});

		it('should explode on bad assignment', () => {
			let model = new TypedModel();
			expecterror('bad assignment', () => {
				model.object = new Array(23);
			});
		});

		it('should explode on assignment to undeclared key', () => {
			let model = new TypedModel();
			expecterror('cannot assign', () => {
				model.badname = 'Sauron';
			});
		});

		it('should explode on undeclared key in constructor argument', () => {
			expecterror('cannot assign', () => {
				new TypedModel({
					badname: 'Sauron',
				});
			});
		});

		it('should explode on overwriting a normal instance method', () => {
			let model = new TypedModel();
			expecterror('cannot assign', () => {
				model.greeting = () => 'hello there';
			});
		});

		it('should however let you implement a configurable method', () => {
			let model = new TypedModel();
			model.onclick = () => 'clicked';
			expect(model.onclick()).toBe('clicked');
		});

		it('should validate assignment of variable types', () => {
			const model = new TypedModel();
			['x', 23, true].forEach((primitive) => {
				model.multitype = primitive;
				expect(model.multitype).toBe(primitive);
			});
			expecterror('bad assignment', () => {
				model.multitype = [23];
			});
		});

		it('should throw on attempt to redefine the property descriptor', () => {
			expecterror('cannot redefine', () => {
				Reflect.defineProperty(new TypedModel(), 'name', {
					get: function () {
						return 'Arne';
					},
				});
			});
		});
	});

	describe('edb.Model pipes are inherited and can be modified', () => {
		it('can inherit type interface from ancestor class', () => {
			class SubModel extends TypedModel {}
			expecterror('cannot assign', () => {
				new SubModel().bonusprop = true;
			});
		});

		// We'll need to deepfreeze the parent to prevent modifications to it!
		it('can extend type interface from ancestor class (NOTE: NEEDS WORK)', () => {
			class AnotherSubModel extends TypedModel {
				static model(parent) {
					return Object.assign(parent, {
						bonusprop: Boolean,
					});
				}
			}
			const model = new AnotherSubModel({
				name: 'Jib Bob Johnson',
				bonusprop: true,
			});
			expect(model.bonusprop).toBe(true);
		});

		/*
		it('always receives an immutable map, though it is rarely used', () => {
			new (class TestModel extends Model {
				static model(map) {
					expect(isImmutable(map)).toBe(true);
					return null;
				}
			})({
				trigger: 'poke'
			});
		});
		*

		it('can use this map morph the ancestor interface into a new one', () => {
			class ModelA extends TypedModel {}
			class ModelB extends ModelA {}
			class ModelC extends ModelB {
				static model(map) {
					return map
						.delete('married')
						.delete('object')
						.delete('array')
						.delete('onclick')
						.set('bonusprop', Boolean);
				}
			}
			const model = new ModelC({
				bonusprop: true,
				name: 'Boba'
			});
			expect(model.bonusprop).toBe(true);
			expecterror('bad assignment', () => {
				model.bonusprop = Math.PI;
			});
			expecterror('cannot assign', () => {
				model.married = false;
			});
		});
		*/
	});

	/*
	class Person extends Model {
		static model() {
			return {
				name: {
					type: String,
					default: 'Jim Hans',
					required: true
				},
				age: {
					type: Number,
					required: true
				}
			}
		}
	}

	class Johnson extends Model {
		static model() {
			return {
				name: type(string)
					.default()
					.required();
				age: type(Number).default()required();
			}
		}
	}
	*/

	describe('edb.Model pipes convert objects and arrays to Models and Collections', () => {
		class Person extends Model {
			static model() {
				return {
					name: String,
					friend: Person,
					pet: Animal,
				};
			}
		}

		class Animal extends Model {
			static model() {
				return {
					name: String,
				};
			}
		}

		it('should map objects to models in constructor argument', () => {
			const jim = new Person({
				name: 'Jim Bob',
				pet: { name: 'Pretty' },
				friend: {
					name: 'John Johnson',
					pet: { name: 'Beauty' },
				},
			});
			expect(jim.pet).toEqual(jasmine.any(Animal));
			expect(jim.friend).toEqual(jasmine.any(Person));
			expect(jim.friend.pet).toEqual(jasmine.any(Animal));
		});

		it('should map objects to models in setters', () => {
			const jim = new Person();
			jim.pet = { name: 'Pretty' };
			jim.friend = { name: 'John' };
			jim.friend.pet = { name: 'Beauty' };
			expect(jim.pet).toEqual(jasmine.any(Animal));
			expect(jim.friend).toEqual(jasmine.any(Person));
			expect(jim.friend.pet).toEqual(jasmine.any(Animal));
		});

		it('should pass along instantiated valid models', () => {
			const john = new Person();
			const jim = new Person({
				friend: john,
			});
			expect(jim.friend).toBe(john);
		});

		it('should explode on instantiated invalid models', () => {
			const pet = new Animal();
			expecterror('bad assignment', () => {
				new Person({ friend: pet });
			});
		});

		it('should upgrade assignments of variable type', () => {
			expect(!!'todo').toBe(true);
		});
	});
}
