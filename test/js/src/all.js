var fs = require('fs');
var util = require('util');
var extend = require('node.extend');
var fmt = util.format;

var fhandle_t = function(a){
	return function(f) {
		a.push(fs.readFileSync(f));
	};
};

var rhandle_t = function(a){
	return function(raw) {
		a.push(raw);
	};
};

var ns = 'test-namespace';

var dflt = {
	name : ns,
	index : 'index.js',
	intro : 'intro.js',
	outro : 'outro.js',
	struct : 'struct.json',
	strict : false,
	debug : false
};

test('ff', function (assert) {
	var recbuild = recbuild_t(extend({}, dflt, {
		rec : false,
		flat : false,
		strict : true,
		debug : true
	}));

	var code = [];
	recbuild(fmt('%s/%s/', __dirname, ns), ns, -1, fhandle_t(code), rhandle_t(code));

	var exports = {};

	eval(code.join('\n'));

	var ref = {
		file1 : {
			prop1 : true
		},
		file2 : {
			prop2 : true
		},
		file3 : {
			prop3 : true
		},
		file4 : {
			prop4 : true
		}
	};

	deepEqual(exports, ref, 'check reference');
});

test('ft', function (assert) {
	var recbuild = recbuild_t(extend({}, dflt, {
		rec : false,
		flat : true
	}));
	var code = [];
	recbuild(fmt('%s/%s/', __dirname, ns), ns, -1, fhandle_t(code), rhandle_t(code));

	var exports = {};

	eval(code.join('\n'));

	var ref = {
		prop1 : true,
		prop2 : true,
		file3 : {
			prop3 : true
		},
		file4 : {
			prop4 : true
		}
	};

	deepEqual(exports, ref, 'check reference');
});

test('tf', function (assert) {
	var recbuild = recbuild_t(extend({}, dflt, {
		rec : true,
		flat : false
	}));
	var code = [];
	recbuild(fmt('%s/%s/', __dirname, ns), ns, -1, fhandle_t(code), rhandle_t(code));

	var exports = {};

	eval(code.join('\n'));

	var ref = {
		dir1 : {
			file1 : {
				prop1 : true
			},
			dir2 : {
				file2 : {
					prop2 : true
				},
				dir3 : {
					file3 : {
						prop3 : true
					},
					file4 : {
						prop4 : true
					}
				}
			}
		}
	};

	deepEqual(exports, ref, 'check reference');
});

test('tt', function (assert) {
	var recbuild = recbuild_t(extend({}, dflt, {
		rec : true,
		flat : true
	}));
	var code = [];
	recbuild(fmt('%s/%s/', __dirname, ns), ns, -1, fhandle_t(code), rhandle_t(code));

	var exports = {};

	eval(code.join('\n'));

	var ref = {
		dir1 : {
			prop1 : true,
			dir2 : {
				prop2 : true,
				dir3 : {
					file3 : {
						prop3 : true
					},
					file4 : {
						prop4 : true
					}
				}
			}
		}
	};

	deepEqual(exports, ref, 'check reference');
});

test('ff-2', function (assert) {
	var recbuild = recbuild_t(extend({}, dflt, {
		rec : false,
		flat : false
	}));
	var code = [];
	recbuild(fmt('%s/%s/', __dirname, ns), ns, -2, fhandle_t(code), rhandle_t(code));

	var exports = {};

	eval(code.join('\n'));

	var ref = {
		file2 : {
			prop2 : true
		},
		file3 : {
			prop3 : true
		},
		file4 : {
			prop4 : true
		}
	};

	deepEqual(exports, ref, 'check reference');
});

test('ft-2', function (assert) {
	var recbuild = recbuild_t(extend({}, dflt, {
		rec : false,
		flat : true
	}));
	var code = [];
	recbuild(fmt('%s/%s/', __dirname, ns), ns, -2, fhandle_t(code), rhandle_t(code));

	var exports = {};

	eval(code.join('\n'));

	var ref = {
		prop2 : true,
		file3 : {
			prop3 : true
		},
		file4 : {
			prop4 : true
		}
	};

	deepEqual(exports, ref, 'check reference');
});

test('tf-2', function (assert) {
	var recbuild = recbuild_t(extend({}, dflt, {
		rec : true,
		flat : false
	}));
	var code = [];
	recbuild(fmt('%s/%s/', __dirname, ns), ns, -2, fhandle_t(code), rhandle_t(code));

	var exports = {};

	eval(code.join('\n'));

	var ref = {
		dir1 : {
			dir2 : {
				file2 : {
					prop2 : true
				},
				dir3 : {
					file3 : {
						prop3 : true
					},
					file4 : {
						prop4 : true
					}
				}
			}
		}
	};

	deepEqual(exports, ref, 'check reference');
});

test('tt-2', function (assert) {
	var recbuild = recbuild_t(extend({}, dflt, {
		rec : true,
		flat : true
	}));
	var code = [];
	recbuild(fmt('%s/%s/', __dirname, ns), ns, -2, fhandle_t(code), rhandle_t(code));

	var exports = {};

	eval(code.join('\n'));

	var ref = {
		dir1 : {
			dir2 : {
				prop2 : true,
				dir3 : {
					file3 : {
						prop3 : true
					},
					file4 : {
						prop4 : true
					}
				}
			}
		}
	};

	deepEqual(exports, ref, 'check reference');
});

