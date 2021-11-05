import { Model } from '@edb/models';
import { later } from './helpers';

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

	it('should support simple function callbacks', () => {
		class MyModel extends Model {}
		let mymodel = new MyModel();
		MyModel.connect(function cb(input) {
			expect(input).toEqual(mymodel);
			let ignored = new MyModel();
			MyModel.disconnect(cb);
			ignored.output();
		});
		mymodel.output();
	});

	it('should return a promise when the handler is omitted', (done) => {
		class MyModel extends Model {}
		let mymodel1 = new MyModel();
		MyModel.connect().then((input) => {
			expect(input).toEqual(mymodel1);
		});
		mymodel1.output();
		let mymodel2 = new MyModel();
		mymodel2.output();
		MyModel.connect().then((input) => {
			expect(input).toEqual(mymodel2);
		});
		done();
	});
});
