import { Model, Collection } from '@edb/models';

export default function () {
	describe('DevTools', () => {
		class Person extends Model {
			static model() {
				return {
					name: String,
					job: String,
					age: Number,
					cv: Object,
					hobbies: Array,
					spouse: Person,
					friends: Collection.$of(Person),
				};
			}
		}

		const person = new Person({
			name: 'Arne',
			job: 'Actor',
			age: 45,
			cv: {
				a: 'A',
				b: 'B',
				c: 'C',
			},
			hobbies: ['singing', 'dancing'],
			spouse: new Person({
				name: 'Bettina',
				job: 'Bomber Pilot',
				age: 23,
			}),
			friends: [
				new Person({
					name: 'Charlie',
					job: 'Gentleman Spy',
					age: 52,
				}),
				new Person({
					name: 'Connor',
					job: 'Antiques Dealer',
					age: 499,
					hobbies: ['fencing', 'fighting'],
				}),
			],
		});

		it('formats models and classes in Chrome if "Enable custom formatters"', () => {
			console.log(Person);
			console.log(person);
			expect(!!'great expectations').toBe(!!'expected');
		});
	});
}
