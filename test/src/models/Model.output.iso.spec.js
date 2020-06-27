import { Model } from '@edb/models';

export default function () {
	describe('edb.Model can output to connected handlers', () => {
		it('should connect and disconnect', () => {
			class MyModel extends Model {}
			let mymodel = new MyModel();
			MyModel.connect({
				oninput(input) {
					expect(input).toEqual(mymodel);
					let ignored = new MyModel();
					MyModel.disconnect(this);
					ignored.output();
				},
			});
			mymodel.output();
		});

		it('should input the latest output', (done) => {
			class MyModel extends Model {}
			let mymodel = new MyModel().output();
			later(() => {
				MyModel.connect({
					oninput(input) {
						expect(input).toEqual(mymodel);
						done();
					},
				});
			});
		});

		it('should revoke the output', (done) => {
			class MyModel extends Model {}
			let mymodel = new MyModel();
			let initial = true;
			MyModel.connect({
				oninput(input) {
					expect(input).toEqual(mymodel);
				},
				onrevoke(C) {
					expect(C).toEqual(MyModel);
					done();
				},
			});
			mymodel.output();
			mymodel.revoke();
		});

		it('should not trigger revoked output', (done) => {
			class MyModel extends Model {}
			let mymodel = new MyModel();
			mymodel.output().revoke();
			later(() => {
				let triggered = false;
				MyModel.connect({
					oninput(input) {
						triggered = true;
					},
				});
				expect(triggered).toBe(false);
				done();
			});
		});
	});
}
