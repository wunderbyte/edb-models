import key from './util/Key.iso.spec';
import mapping from './util/MapSet.iso.spec';
// import type from './util/Type.iso.spec';
import model from './models/Model.iso.spec';
import model_proxy from './models/Model.proxy.iso.spec';
import model_pipes from './models/Model.pipes.iso.spec';
import model_output from './models/Model.output.iso.spec';
import model_observers from './models/Model.observers.iso.spec';
import collection from './models/Collection.iso.spec';
import tree from './models/Tree.iso.spec';

[
	key,
	mapping,
	// type,
	model,
	model_proxy,
	model_pipes,
	model_output,
	model_observers,
	collection,
	tree,
].forEach((test) => test());
