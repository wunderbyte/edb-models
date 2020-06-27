import { Model, Collection } from '@edb/models';

export default function () {
	/*
	 * Collection specs.
	 * TODO: Read https://curiosity-driven.org/array-slices
	 */
	describe('edb.Collection', function likethis() {
		class NumberCollection extends Collection {
			static collection() {
				return Number;
			}
		}

		class Person extends Model {
			static model() {
				return {
					name: String,
				};
			}
		}

		class Animal extends Model {
			static model() {
				return {
					species: String,
				};
			}
		}

		class PersonCollection extends Collection {
			static collection() {
				return Person;
			}
		}

		class LifeFormCollection extends Collection {
			static collection() {
				return (input) => (input.species ? Animal : Person);
			}
		}

		// Expectations ..............................................................

		it('should be proxied, obviously', () => {
			let persons = new PersonCollection();
			expect(persons.$CONFIRM_PROXY).toBe(true);
		});

		it('should behave like an array', () => {
			let col = new Collection(1, 2, 3, 4, 5);
			expect(col.length).toBe(5);
			col.push(undefined);
			expect(col.length).toBe(6);
			let last = col.pop();
			expect(last).toBe(undefined);
			expect(col.length).toBe(5);
			let first = col.shift();
			expect(first).toBe(1);
			expect(col.length).toBe(4);
		});

		it('should support simple objects and arrays', () => {
			let simpleo = (o) => o.constructor === Object;
			let simplea = (a) => a.constructor === Array;
			let objects = new Collection(
				{ name: 'John' },
				{ name: 'Bob' },
				{ name: 'Bill' }
			);
			expect(objects.every(simpleo)).toBe(true);
			expect(objects.map((o) => [o]).every(simplea)).toBe(true);
		});

		it('should convert objects into models', () => {
			let persons = new PersonCollection(
				{ name: 'John' },
				{ name: 'Bob' },
				{ name: 'Bill' }
			);
			expect(persons.every((person) => Person.is(person))).toBe(true);
		});

		it('should support multiple types of models', () => {
			let persons = new LifeFormCollection(
				{ name: 'Billy' },
				{ name: 'Bobby' },
				{ species: 'Goat' },
				{ species: 'Stork' },
				{ species: 'Baboon' }
			);
			expect(Person.is(persons[0])).toBe(true);
			expect(Animal.is(persons[2])).toBe(true);
		});

		it('should mutate like an array', () => {
			let persons = new PersonCollection();
			persons.push({ name: 'D' });
			persons.unshift({ name: 'C' });
			persons.splice(0, 0, { name: 'A' }, { name: 'B' });
			persons[4] = { name: 'E' };
			expect(persons.length).toBe(5);
			expect(persons.map((p) => p.name)).toEqual(['A', 'B', 'C', 'D', 'E']);
			expect(persons.every((p) => Person.is(p))).toBe(true);
		});

		it('should iterate and reduce like an array', () => {
			let persons = new PersonCollection({ name: 'John' });
			['forEach', 'every', 'map', 'filter', 'find'].forEach((method) => {
				persons[method](function (elm, idx, src) {
					expect(Person.is(elm)).toBe(true);
					expect(idx).toBe(0);
					expect(src).toBe(persons);
					expect(this).toBe(Math.PI);
				}, Math.PI);
			});
			['reduce', 'reduceRight'].forEach((method) => {
				persons[method](function (pre, now, idx, src) {
					expect(pre).toBe(Math.PI);
					expect(Person.is(now)).toBe(true);
					expect(idx).toBe(0);
					expect(src).toBe(persons);
				}, Math.PI);
			});
			let p = persons.find((x) => x.name === 'John');
			expect(p.name).toBe('John');
		});

		/*
		 * TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		 *
		it('should only accept numbers', () => {
			let numbers = new NumberCollection(1, 2, 3, 4, 5);
			try {
				numbers.push(true);
			} catch (exception) {
				alert(exception);
			}
			expect(numbers).toEqual([1, 2, 3, 4, 5]);
		});
		*/

		it('should stringify to JSON as simple array of objects', () => {
			let persons = new LifeFormCollection(
				{ name: 'Billy' },
				{ species: 'Goat' }
			);
			expect(persons.every((p) => Model.is(p))).toBe(true);
			expect(JSON.parse(JSON.stringify(persons))).toEqual([
				{ name: 'Billy' },
				{ species: 'Goat' },
			]);
		});

		it('can be observed', (done) => {
			let name = (person) => person.name;
			let persons = new PersonCollection(
				{ name: 'John' },
				{ name: 'Bob' },
				{ name: 'Bill' }
			);
			persons.addObserver({
				onsplice(collection, added, removed) {
					expect(collection).toBe(persons);
					expect(added.map(name)).toEqual(['Henrik', 'Miguel', 'Heino']);
					expect(removed.map(name)).toEqual(['John', 'Bob', 'Bill']);
					persons.removeObserver(this);
					done();
				},
			});
			persons.pop();
			persons[0] = { name: 'Henrik' };
			persons[1] = { name: 'Miguel' };
			persons.push({ name: 'Heino' });
		});
	});
}
