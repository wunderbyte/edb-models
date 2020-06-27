import { Tree, Model, Collection } from '@edb/models';

const stringify = (obj) => JSON.stringify(obj, 0, 4);

export default function () {
	class MyModel extends Model {}
	class MyCollection extends Collection {}

	/*
	 * Used to parse Tree structures back into Models
	 * TODO: Cannot use `constructor.name` because tools like Rollup changes it :/
	 * @type {Object<String, Class<Proto>>}
	 */
	const mapping = {
		MyModel: MyModel,
		MyCollection: MyCollection,
	};

	/*
	 * Send in the clones.
	 */
	describe('edb.Tree', function likethis() {
		it('should encode and decode the Model', () => {
			const source = new MyModel({
				one: 1,
				two: 2,
				model1: new MyModel({
					one: 1,
					two: 2,
				}),
				model2: new MyModel({
					collection: new MyCollection(1, 2, 3),
				}),
			});
			const mytree = Tree.encode(source);
			const target = Tree.decode(mytree, mapping);
			expect(stringify(source)).toBe(stringify(target));
		});

		it('should encode and decode the Collection', () => {
			const source = new MyCollection(1, 2, new MyModel({ one: 1 }));
			source.prop1 = 'value';
			source.prop2 = new MyModel({ one: 1, two: 2 });
			source.push(new MyModel({ three: 3 }));
			source.push(new MyCollection(1, 2, 3, new MyModel({ four: 4 })));
			const mytree = Tree.encode(source);
			const target = Tree.decode(mytree, mapping);
			expect(stringify(source)).toBe(stringify(target));
		});
	});
}
