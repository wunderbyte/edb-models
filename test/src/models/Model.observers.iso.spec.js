import { Model } from '@edb/models';

export default function () {
	describe('edb.Model can be observed', () => {
		class MyModel extends Model {
			_private = 23;
			onconstruct() {
				this.$privileged = 23;
			}
		}
		class SecretModel extends Model {
			get $observable() {
				return false;
			}
		}

		it('should know when properties are changed, inspected, added and removed', (done) => {
			let poked = false;
			let peekt = false;
			let added = false;
			let nuked = false;
			let name1 = 'Bob';
			let name2 = 'Jim';
			let model = new MyModel({
				name: name1,
				age: 23,
			});
			model.addObserver({
				onpeek(model, name) {
					peekt = peekt || name === 'name';
				},
				onpoke(model, name, value) {
					poked = poked || (name === 'name' && value === name2);
					nuked = nuked || (name === 'age' && value === undefined);
					added = added || name === 'hobby';
				},
			});
			if (model.name === name1) {
				model.hobby = 'Toys'; // added
				model.name = name2; // changed
				delete model.age; // deleted
			}
			later(() => {
				expect(peekt && poked && added && nuked).toBe(true);
				done();
			});
		});

		it('should not notify observers on private or privileged props changed', (done) => {
			let model = new MyModel();
			let works = true;
			model.addObserver({
				onpeek() {
					works = false;
				},
				onpoke() {
					works = false;
				},
			});
			model._private = 0;
			model.$privileged = 0;
			later(() => {
				expect(works).toBe(true);
				done();
			});
		});

		it('should support simple function callbacks as observers', (done) => {
			let model = new MyModel({ age: 23 });
			let works = true;
			let poked = false;
			const cleanup = model.observe((name, value, oldval, target) => {
				poked = true;
				works =
					name === 'age' && value === 24 && oldval === 23 && target === model;
			});
			model.age = 24;
			later(() => {
				expect(poked).toBe(true);
				expect(works).toBe(true);
				cleanup();
				model.age = 25;
				later(() => {
					expect(works).toBe(true);
					done();
				});
			});
		});

		it('should support observing single properties', (done) => {
			let model = new MyModel({ age: 23 });
			let works = true;
			let poked = false;
			const cleanup = model.observe('age', (value, oldval, target) => {
				works = value === 24 && oldval === 23 && target === model;
				poked = true;
			});
			model.name = 'Hans Jozef';
			later(() => {
				expect(poked).toBe(false);
				model.age = 24;
				later(() => {
					expect(poked).toBe(true);
					expect(works).toBe(true);
					cleanup();
					model.age = 25;
					later(() => {
						expect(works).toBe(true);
						done();
					});
				});
			});
		});

		/**
		 * IDEA: If the prop has a setter, try setting it and note what private prop
		 * changed. Then invoke the getter to see if it matches. Then finally *reset*
		 * the setter. If match is found, perhaps we can assume that the getter
		 * proxies this particular private property? This is of course sketchy :/
		 */
		it("(should really trigger when a public getter exposes a private prop, but it won't)", () => {
			expect(!!'we should figure this out somehow').toBe(true);
		});

		/*
		 * DISABLED! TODO: When proxy disabled, this will throw a different error!
		 *
		it('should explode when attempting to observe an unobservable model', () => {
			expecterror('not observable', () => {
				new SecretModel().addObserver({});
			});
		});
		*/
	});
}
