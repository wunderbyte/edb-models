import { generateKey } from '@edb/utils';

export default function () {
	describe('util.Key', function likethis() {
		it('should generate a default key', () => {
			expect(generateKey().indexOf('key')).toBe(0);
		});

		it('should generate a named key', () => {
			expect(generateKey('name').indexOf('name')).toBe(0);
		});
	});
}
