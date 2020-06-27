import { Mapping } from '@edb/utils';

export default function () {
	describe('util.Mapping', function likethis() {
		const KEY1 = 'key1';
		const KEY2 = 'key2';

		it('should push values to a set indexed by key', () => {
			let mapset = new Mapping().add(KEY1, 1).add(KEY1, 2).add(KEY2, 3);
			let set1 = mapset.get(KEY1);
			let set2 = mapset.get(KEY2);
			expect(set1).toEqual(jasmine.any(Set));
			expect(Array.from(set1)).toEqual([1, 2]);
			expect(Array.from(set2)).toEqual([3]);
		});

		it('should know when a set contains the given key', () => {
			let mapset = new Mapping().add(KEY1, 1).add(KEY1, 2);
			expect(mapset.has(KEY1, 2)).toBe(true);
		});

		it('should completely remove the set when empty', () => {
			let mapset = new Mapping().add(KEY1, 1).del(KEY1, 1);
			expect(mapset.get(KEY1)).toBe(undefined);
		});
	});
}
