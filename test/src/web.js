import spirit from './gui/Spirit.web.spec';
import tick from './util/Tick.web.spec';
import att from './gui/AttPlugin.web.spec';
import css from './gui/CSSPlugin.web.spec';
import io from './gui/IOPlugin.web.spec';
import script0 from './gui/ScriptPlugin-0.web.spec';
import script1 from './gui/ScriptPlugin-1.web.spec';
import script2 from './gui/ScriptPlugin-2.web.spec';
import script3 from './gui/ScriptPlugin-3.web.spec';
import devtools from './edb/DevTools.web.spec.js';

[
	spirit,
	tick,
	att,
	css,
	io,
	script0,
	script1,
	script2,
	script3,
	devtools,
].forEach((test) => test());

/*
// script1, script2, script3
[script0, script1, script2].forEach(test => test());
*/
