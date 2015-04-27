
'use strict';


/**
 * recbuild default options.
 *
 * @param name name of global namespace
 * @param index name of index files
 * @param intro name of intro files
 * @param outro name of outro files
 * @param struct name of struct files
 * @param rec whether dirs should have their own namespace
 * @param flat whether files should have their own namespace
 * @param strict whether the global namespace should be in strict mode
 * @param debug flag whether or not debug messages should be printed
 *
 *
 */

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


/**
 * recbuild template.
 *
 * @param <opt> options
 *
 */

var recbuild_t = function(opt) {

	var fs = require('fs');
	var util = require('util');
	var extend = require('node.extend');

	opt = extend({}, dflt, opt);

	var __INTRO__ = '( function ( ) {\n\n' +
		(opt.strict ? "'use strict' ;\n\n" : '' ) +
		'var definition = function ( exports , undefined ) {\n\n' ;
	var __INTRO2_ = '( function ( exports ) {\n\n';
	var __OUTRO__ = util.format(
		'return exports ;\n} ;\n' +
		'if ( typeof exports === "object" ) {\n' +
		'\tdefinition( exports ) ;\n' +
		'}\n' +
		'else if ( typeof define === "function" && define.amd ) {\n' +
		'\tdefine( "%s" , [ ] , function ( ) { return definition( { } ) ; } ) ;\n' +
		'}\n' +
		'else if ( typeof window === "object" && typeof window.document === "object" ) {\n' +
		'\tdefinition( window["%s"] = { } ) ;\n' +
		'}\n' +
		'else console.error( "unable to detect type of module to define for %s") ;\n' +
		'} )( ) ;',
	opt.name , opt.name , opt.name ) ;
	var __OUTRO2_ = function(sub){ return util.format("} )( exports['%s'] = { } ) ; ", sub); };

	// DEBUG
	var msg_t = function(type){
		return function(){
			console.log([
				opt.name,
				type,
				util.format.apply(this, arguments)
			].join(' '));
		};
	};

	var info = opt.debug ? msg_t('info') : function(){};
	var action = opt.debug ? msg_t('action') : function(){};

	var recbuild = function(dir, exports, level, fhandle, rhandle, origin) {

		if (origin === undefined) origin = true;

		var intro = false, outro = false, el = [];

		fs.readdirSync(dir).forEach(function(file) {

			if (file === opt.index || file === opt.struct) return;
			else if (file === opt.intro) intro = true;
			else if (file === opt.outro) outro = true;
			else el.push(file);

		});

		el.sort();

		if (origin) {
			if (intro) fhandle(dir + opt.intro);
			else       rhandle(__INTRO__);
		}

		el.forEach(function(e){
			var path = dir + e;

			if (fs.lstatSync(path).isDirectory()) {
				var child;
				if (fs.existsSync(path + '/' + opt.struct)) {
					info("struct file found in '%s'", path);
					var struct = JSON.parse( fs.readFileSync( path + '/' + opt.struct , "utf8" ) ) ;
					child = recbuild_t(struct);

				}
				else{
					// DEBUG
					info("no struct file found in dir '%s'", path);
					action(
						"@ recbuild('%s/', %s, %d);",
						path,
						opt.rec ? util.format("exports['%s'] = { }", e) : 'exports',
						level + 1
					);

					child = recbuild;

				}

				rhandle('/* ' + path + ' */');

				if (fs.existsSync(path + '/' + opt.intro)) fhandle(path + '/' + opt.intro);
				else if (opt.rec) rhandle(__INTRO2_);
				child(path + '/', e, level + 1, fhandle, rhandle, false);
				if (fs.existsSync(path + '/' + opt.outro)) fhandle(path + '/' + opt.outro);
				else if (opt.rec) rhandle(__OUTRO2_(e));
			}
			else if (level >= 0 && e.match(/.+\.js$/g) !== null) {

				info(".js file '%s'", path);
				rhandle('/* ' + path + ' */');

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

		if (origin) {
			if (outro) fhandle(dir + opt.outro);
			else       rhandle(__OUTRO__);
		}
	};

	return recbuild;

};

module.exports = recbuild_t;
