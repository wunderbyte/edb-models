import { Model } from '@edb/models';

export default function () {
	/*
	 * Model specs.
	 */
	describe('edb.Model', function likethis() {
		class MyModel extends Model {
			onconstruct() {
				super.onconstruct();
				this.called = true;
			}
		}

		it('should call `onconstruct` when constructed', () => {
			let model = new MyModel();
			expect(model.called).toBe(true);
		});

		it('should throw an AccessError', () => {
			class MyModel extends Model {}
			const model = new MyModel({ nickname: 'Morten' });
			expect(model.nickname).toBe('Morten');
			model.dispose();
			expecterror('destructed', () => {
				console.log(model.nickname);
			});
		});
	});
}
