
'use strict';

var dflt = {
	name : 'lib',
	index : 'index.js',
	intro : 'intro.js',
	outro : 'outro.js',
	struct : 'struct.json',
	rec : true,
	flat : true,
	strict : true,
	debug : false
};

var recbuild_t = function(opt) {

	var fs = require('fs');
	var util = require('util');
	var clc = require('cli-color');
	var extend = require('node.extend');

	opt = extend({}, dflt, opt);

	var __INTRO__ = '(function(exports){\n\n' + (opt.strict ? "\t'use strict';\n\n" : '');
	var __INTRO2_ = '(function(exports){\n\n';
	var __OUTRO__ = util.format("})(typeof exports === 'undefined' ? this['%s'] = {} : exports);", opt.name);
	var __OUTRO2_ = function(sub){ return util.format("})(exports['%s'] = {});", sub); };

	// DEBUG
	var msg_t = function(type, transform){
		// transform = transform || function(s){return s;};
		return function(){
			console.log([
				clc.white(clc.bgBlack(opt.name)),
				clc.green(type),
				transform(util.format.apply(this, arguments))
			].join(' '));
		};
	};
	
	var info = opt.debug ? msg_t('info', clc.blue) : function(){};
	var action = opt.debug ? msg_t('action', clc.magenta) : function(){};

	var recbuild = function(dir, exports, level, fhandle, rhandle, origin) {

		console.log.apply(console, arguments);

		if (origin === undefined) origin = true;

		console.log(origin);

		var intro = false, outro = false, el = [];

		fs.readdirSync(dir).forEach(function(file) {

			if (file === opt.index || file === opt.struct) return;
			else if (file === opt.intro) intro = true;
			else if (file === opt.outro) outro = true;
			else el.push(file);

		});

		el.sort();

		if (origin) rhandle(intro ? dir + opt.intro : __INTRO__);

		el.forEach(function(e){
			var path = dir + e;

			if (fs.lstatSync(path).isDirectory()) {
				var child;
				if (fs.existsSync(path + '/' + opt.struct)) {
					info("struct file found in '%s'", path);
					var struct = require(path + '/' + opt.struct);
					child = recbuild_t(struct);

				}
				else{
					// DEBUG
					info("no struct file found in dir '%s'", path);
					action(
						"@ recbuild('%s/', %s, %d);",
						path,
						opt.rec ? util.format("exports['%s'] = {}", e) : 'exports',
						level + 1
					);

					child = recbuild;

				}

				if (fs.existsSync(path + '/' + opt.intro)) fhandle(path + '/' + opt.intro);
				else if (opt.rec) rhandle(__INTRO2_);
				child(path + '/', e, level + 1, fhandle, rhandle, false);
				if (fs.existsSync(path + '/' + opt.outro)) fhandle(path + '/' + opt.outro);
				else if (opt.rec) rhandle(__OUTRO2_(e));
			}
			else if (level >= 0 && e.match(/.+\.js$/g) !== null) {

				info(".js file '%s'", path);
				if(opt.flat){

					action("@ extend(true, exports, require('%s'));", path);

					fhandle(path);
				}
				else{
					var name = e.substr(0, e.length - 3);

					action("@ exports['%s'] = require('%s');", name, path);

					rhandle(__INTRO2_);
					fhandle(path);
					rhandle(__OUTRO2_(name));
				}

			}
		});

		if (origin) rhandle(outro ? dir + opt.outro : __OUTRO__);

		console.log(origin);
	};

	return recbuild;

};

module.exports = recbuild_t;