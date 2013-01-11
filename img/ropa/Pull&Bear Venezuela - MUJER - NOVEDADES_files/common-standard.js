if (typeof(HeaderJSON) == 'undefined'){
 	window.location.href = PULL_RELOGON_PAGE_URL;
}/*
---
MooTools: the javascript framework

web build:
 - http://mootools.net/core/7c56cfef9dddcf170a5d68e3fb61cfd7

packager build:
 - packager build Core/Core Core/Array Core/String Core/Number Core/Function Core/Object Core/Event Core/Browser Core/Class Core/Class.Extras Core/Slick.Parser Core/Slick.Finder Core/Element Core/Element.Style Core/Element.Event Core/Element.Dimensions Core/Fx Core/Fx.CSS Core/Fx.Tween Core/Fx.Morph Core/Fx.Transitions Core/Request Core/Request.HTML Core/Request.JSON Core/Cookie Core/JSON Core/DOMReady Core/Swiff

/*
---

name: Core

description: The heart of MooTools.

license: MIT-style license.

copyright: Copyright (c) 2006-2010 [Valerio Proietti](http://mad4milk.net/).

authors: The MooTools production team (http://mootools.net/developers/)

inspiration:
  - Class implementation inspired by [Base.js](http://dean.edwards.name/weblog/2006/03/base/) Copyright (c) 2006 Dean Edwards, [GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)
  - Some functionality inspired by [Prototype.js](http://prototypejs.org) Copyright (c) 2005-2007 Sam Stephenson, [MIT License](http://opensource.org/licenses/mit-license.php)

provides: [Core, MooTools, Type, typeOf, instanceOf, Native]

...
*/

(function(){

this.MooTools = {
	version: '1.3',
	build: 'a3eed692dd85050d80168ec2c708efe901bb7db3'
};

// typeOf, instanceOf

var typeOf = this.typeOf = function(item){
	if (item == null) return 'null';
	if (item.$family) return item.$family();

	if (item.nodeName){
		if (item.nodeType == 1) return 'element';
		if (item.nodeType == 3) return (/\S/).test(item.nodeValue) ? 'textnode' : 'whitespace';
	} else if (typeof item.length == 'number'){
		if (item.callee) return 'arguments';
		if ('item' in item) return 'collection';
	}

	return typeof item;
};

var instanceOf = this.instanceOf = function(item, object){
	if (item == null) return false;
	var constructor = item.$constructor || item.constructor;
	while (constructor){
		if (constructor === object) return true;
		constructor = constructor.parent;
	}
	return item instanceof object;
};

// Function overloading

var Function = this.Function;

var enumerables = true;
for (var i in {toString: 1}) enumerables = null;
if (enumerables) enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];

Function.prototype.overloadSetter = function(usePlural){
	var self = this;
	return function(a, b){
		if (a == null) return this;
		if (usePlural || typeof a != 'string'){
			for (var k in a) self.call(this, k, a[k]);
			if (enumerables) for (var i = enumerables.length; i--;){
				k = enumerables[i];
				if (a.hasOwnProperty(k)) self.call(this, k, a[k]);
			}
		} else {
			self.call(this, a, b);
		}
		return this;
	};
};

Function.prototype.overloadGetter = function(usePlural){
	var self = this;
	return function(a){
		var args, result;
		if (usePlural || typeof a != 'string') args = a;
		else if (arguments.length > 1) args = arguments;
		if (args){
			result = {};
			for (var i = 0; i < args.length; i++) result[args[i]] = self.call(this, args[i]);
		} else {
			result = self.call(this, a);
		}
		return result;
	};
};

Function.prototype.extend = function(key, value){
	this[key] = value;
}.overloadSetter();

Function.prototype.implement = function(key, value){
	this.prototype[key] = value;
}.overloadSetter();

// From

var slice = Array.prototype.slice;

Function.from = function(item){
	return (typeOf(item) == 'function') ? item : function(){
		return item;
	};
};

Array.from = function(item){
	if (item == null) return [];
	return (Type.isEnumerable(item) && typeof item != 'string') ? (typeOf(item) == 'array') ? item : slice.call(item) : [item];
};

Number.from = function(item){
	var number = parseFloat(item);
	return isFinite(number) ? number : null;
};

String.from = function(item){
	return item + '';
};

// hide, protect

Function.implement({

	hide: function(){
		this.$hidden = true;
		return this;
	},

	protect: function(){
		this.$protected = true;
		return this;
	}

});

// Type

var Type = this.Type = function(name, object){
	if (name){
		var lower = name.toLowerCase();
		var typeCheck = function(item){
			return (typeOf(item) == lower);
		};

		Type['is' + name] = typeCheck;
		if (object != null){
			object.prototype.$family = (function(){
				return lower;
			}).hide();
			
		}
	}

	if (object == null) return null;

	object.extend(this);
	object.$constructor = Type;
	object.prototype.$constructor = object;

	return object;
};

var toString = Object.prototype.toString;

Type.isEnumerable = function(item){
	return (item != null && typeof item.length == 'number' && toString.call(item) != '[object Function]' );
};

var hooks = {};

var hooksOf = function(object){
	var type = typeOf(object.prototype);
	return hooks[type] || (hooks[type] = []);
};

var implement = function(name, method){
	if (method && method.$hidden) return this;

	var hooks = hooksOf(this);

	for (var i = 0; i < hooks.length; i++){
		var hook = hooks[i];
		if (typeOf(hook) == 'type') implement.call(hook, name, method);
		else hook.call(this, name, method);
	}
	
	var previous = this.prototype[name];
	if (previous == null || !previous.$protected) this.prototype[name] = method;

	if (this[name] == null && typeOf(method) == 'function') extend.call(this, name, function(item){
		return method.apply(item, slice.call(arguments, 1));
	});

	return this;
};

var extend = function(name, method){
	if (method && method.$hidden) return this;
	var previous = this[name];
	if (previous == null || !previous.$protected) this[name] = method;
	return this;
};

Type.implement({

	implement: implement.overloadSetter(),

	extend: extend.overloadSetter(),

	alias: function(name, existing){
		implement.call(this, name, this.prototype[existing]);
	}.overloadSetter(),

	mirror: function(hook){
		hooksOf(this).push(hook);
		return this;
	}

});

new Type('Type', Type);

// Default Types

var force = function(name, object, methods){
	var isType = (object != Object),
		prototype = object.prototype;

	if (isType) object = new Type(name, object);

	for (var i = 0, l = methods.length; i < l; i++){
		var key = methods[i],
			generic = object[key],
			proto = prototype[key];

		if (generic) generic.protect();

		if (isType && proto){
			delete prototype[key];
			prototype[key] = proto.protect();
		}
	}

	if (isType) object.implement(prototype);

	return force;
};

force('String', String, [
	'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'quote', 'replace', 'search',
	'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase'
])('Array', Array, [
	'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice',
	'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'
])('Number', Number, [
	'toExponential', 'toFixed', 'toLocaleString', 'toPrecision'
])('Function', Function, [
	'apply', 'call', 'bind'
])('RegExp', RegExp, [
	'exec', 'test'
])('Object', Object, [
	'create', 'defineProperty', 'defineProperties', 'keys',
	'getPrototypeOf', 'getOwnPropertyDescriptor', 'getOwnPropertyNames',
	'preventExtensions', 'isExtensible', 'seal', 'isSealed', 'freeze', 'isFrozen'
])('Date', Date, ['now']);

Object.extend = extend.overloadSetter();

Date.extend('now', function(){
	return +(new Date);
});

new Type('Boolean', Boolean);

// fixes NaN returning as Number

Number.prototype.$family = function(){
	return isFinite(this) ? 'number' : 'null';
}.hide();

// Number.random

Number.extend('random', function(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
});

// forEach, each

Object.extend('forEach', function(object, fn, bind){
	for (var key in object){
		if (object.hasOwnProperty(key)) fn.call(bind, object[key], key, object);
	}
});

Object.each = Object.forEach;

Array.implement({

	forEach: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) fn.call(bind, this[i], i, this);
		}
	},

	each: function(fn, bind){
		Array.forEach(this, fn, bind);
		return this;
	}

});

// Array & Object cloning, Object merging and appending

var cloneOf = function(item){
	switch (typeOf(item)){
		case 'array': return item.clone();
		case 'object': return Object.clone(item);
		default: return item;
	}
};

Array.implement('clone', function(){
	var i = this.length, clone = new Array(i);
	while (i--) clone[i] = cloneOf(this[i]);
	return clone;
});

var mergeOne = function(source, key, current){
	switch (typeOf(current)){
		case 'object':
			if (typeOf(source[key]) == 'object') Object.merge(source[key], current);
			else source[key] = Object.clone(current);
		break;
		case 'array': source[key] = current.clone(); break;
		default: source[key] = current;
	}
	return source;
};

Object.extend({

	merge: function(source, k, v){
		if (typeOf(k) == 'string') return mergeOne(source, k, v);
		for (var i = 1, l = arguments.length; i < l; i++){
			var object = arguments[i];
			for (var key in object) mergeOne(source, key, object[key]);
		}
		return source;
	},

	clone: function(object){
		var clone = {};
		for (var key in object) clone[key] = cloneOf(object[key]);
		return clone;
	},

	append: function(original){
		for (var i = 1, l = arguments.length; i < l; i++){
			var extended = arguments[i] || {};
			for (var key in extended) original[key] = extended[key];
		}
		return original;
	}

});

// Object-less types

['Object', 'WhiteSpace', 'TextNode', 'Collection', 'Arguments'].each(function(name){
	new Type(name);
});

// Unique ID

var UID = Date.now();

String.extend('uniqueID', function(){
	return (UID++).toString(36);
});



})();


/*
---

name: Array

description: Contains Array Prototypes like each, contains, and erase.

license: MIT-style license.

requires: Type

provides: Array

...
*/

Array.implement({

	invoke: function(methodName){
		var args = Array.slice(arguments, 1);
		return this.map(function(item){
			return item[methodName].apply(item, args);
		});
	},

	every: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if ((i in this) && !fn.call(bind, this[i], i, this)) return false;
		}
		return true;
	},

	filter: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++){
			if ((i in this) && fn.call(bind, this[i], i, this)) results.push(this[i]);
		}
		return results;
	},

	clean: function(){
		return this.filter(function(item){
			return item != null;
		});
	},

	indexOf: function(item, from){
		var len = this.length;
		for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
			if (this[i] === item) return i;
		}
		return -1;
	},

	map: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) results[i] = fn.call(bind, this[i], i, this);
		}
		return results;
	},

	some: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if ((i in this) && fn.call(bind, this[i], i, this)) return true;
		}
		return false;
	},

	associate: function(keys){
		var obj = {}, length = Math.min(this.length, keys.length);
		for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
		return obj;
	},

	link: function(object){
		var result = {};
		for (var i = 0, l = this.length; i < l; i++){
			for (var key in object){
				if (object[key](this[i])){
					result[key] = this[i];
					delete object[key];
					break;
				}
			}
		}
		return result;
	},

	contains: function(item, from){
		return this.indexOf(item, from) != -1;
	},

	append: function(array){
		this.push.apply(this, array);
		return this;
	},

	getLast: function(){
		return (this.length) ? this[this.length - 1] : null;
	},

	getRandom: function(){
		return (this.length) ? this[Number.random(0, this.length - 1)] : null;
	},

	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},

	combine: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},

	erase: function(item){
		for (var i = this.length; i--;){
			if (this[i] === item) this.splice(i, 1);
		}
		return this;
	},

	empty: function(){
		this.length = 0;
		return this;
	},

	flatten: function(){
		var array = [];
		for (var i = 0, l = this.length; i < l; i++){
			var type = typeOf(this[i]);
			if (type == 'null') continue;
			array = array.concat((type == 'array' || type == 'collection' || type == 'arguments' || instanceOf(this[i], Array)) ? Array.flatten(this[i]) : this[i]);
		}
		return array;
	},

	pick: function(){
		for (var i = 0, l = this.length; i < l; i++){
			if (this[i] != null) return this[i];
		}
		return null;
	},

	hexToRgb: function(array){
		if (this.length != 3) return null;
		var rgb = this.map(function(value){
			if (value.length == 1) value += value;
			return value.toInt(16);
		});
		return (array) ? rgb : 'rgb(' + rgb + ')';
	},

	rgbToHex: function(array){
		if (this.length < 3) return null;
		if (this.length == 4 && this[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return (array) ? hex : '#' + hex.join('');
	}

});




/*
---

name: String

description: Contains String Prototypes like camelCase, capitalize, test, and toInt.

license: MIT-style license.

requires: Type

provides: String

...
*/

String.implement({

	test: function(regex, params){
		return ((typeOf(regex) == 'regexp') ? regex : new RegExp('' + regex, params)).test(this);
	},

	contains: function(string, separator){
		return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : this.indexOf(string) > -1;
	},

	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	clean: function(){
		return this.replace(/\s+/g, ' ').trim();
	},

	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function(){
		return this.replace(/[A-Z]/g, function(match){
			return ('-' + match.charAt(0).toLowerCase());
		});
	},

	capitalize: function(){
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},

	escapeRegExp: function(){
		return this.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	hexToRgb: function(array){
		var hex = this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
		return (hex) ? hex.slice(1).hexToRgb(array) : null;
	},

	rgbToHex: function(array){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHex(array) : null;
	},

	substitute: function(object, regexp){
		return this.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != null) ? object[name] : '';
		});
	}

});


/*
---

name: Number

description: Contains Number Prototypes like limit, round, times, and ceil.

license: MIT-style license.

requires: Type

provides: Number

...
*/

Number.implement({

	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},

	round: function(precision){
		precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
		return Math.round(this * precision) / precision;
	},

	times: function(fn, bind){
		for (var i = 0; i < this; i++) fn.call(bind, i, this);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	}

});

Number.alias('each', 'times');

(function(math){
	var methods = {};
	math.each(function(name){
		if (!Number[name]) methods[name] = function(){
			return Math[name].apply(null, [this].concat(Array.from(arguments)));
		};
	});
	Number.implement(methods);
})(['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'sin', 'sqrt', 'tan']);


/*
---

name: Function

description: Contains Function Prototypes like create, bind, pass, and delay.

license: MIT-style license.

requires: Type

provides: Function

...
*/

Function.extend({

	attempt: function(){
		for (var i = 0, l = arguments.length; i < l; i++){
			try {
				return arguments[i]();
			} catch (e){}
		}
		return null;
	}

});

Function.implement({

	attempt: function(args, bind){
		try {
			return this.apply(bind, Array.from(args));
		} catch (e){}
		
		return null;
	},

	bind: function(bind){
		var self = this,
			args = (arguments.length > 1) ? Array.slice(arguments, 1) : null;
		
		return function(){
			if (!args && !arguments.length) return self.call(bind);
			if (args && arguments.length) return self.apply(bind, args.concat(Array.from(arguments)));
			return self.apply(bind, args || arguments);
		};
	},

	pass: function(args, bind){
		var self = this;
		if (args != null) args = Array.from(args);
		return function(){
			return self.apply(bind, args || arguments);
		};
	},

	delay: function(delay, bind, args){
		return setTimeout(this.pass(args, bind), delay);
	},

	periodical: function(periodical, bind, args){
		return setInterval(this.pass(args, bind), periodical);
	}

});




/*
---

name: Object

description: Object generic methods

license: MIT-style license.

requires: Type

provides: [Object, Hash]

...
*/


Object.extend({

	subset: function(object, keys){
		var results = {};
		for (var i = 0, l = keys.length; i < l; i++){
			var k = keys[i];
			results[k] = object[k];
		}
		return results;
	},

	map: function(object, fn, bind){
		var results = {};
		for (var key in object){
			if (object.hasOwnProperty(key)) results[key] = fn.call(bind, object[key], key, object);
		}
		return results;
	},

	filter: function(object, fn, bind){
		var results = {};
		Object.each(object, function(value, key){
			if (fn.call(bind, value, key, object)) results[key] = value;
		});
		return results;
	},

	every: function(object, fn, bind){
		for (var key in object){
			if (object.hasOwnProperty(key) && !fn.call(bind, object[key], key)) return false;
		}
		return true;
	},

	some: function(object, fn, bind){
		for (var key in object){
			if (object.hasOwnProperty(key) && fn.call(bind, object[key], key)) return true;
		}
		return false;
	},

	keys: function(object){
		var keys = [];
		for (var key in object){
			if (object.hasOwnProperty(key)) keys.push(key);
		}
		return keys;
	},

	values: function(object){
		var values = [];
		for (var key in object){
			if (object.hasOwnProperty(key)) values.push(object[key]);
		}
		return values;
	},

	getLength: function(object){
		return Object.keys(object).length;
	},

	keyOf: function(object, value){
		for (var key in object){
			if (object.hasOwnProperty(key) && object[key] === value) return key;
		}
		return null;
	},

	contains: function(object, value){
		return Object.keyOf(object, value) != null;
	},

	toQueryString: function(object, base){
		var queryString = [];

		Object.each(object, function(value, key){
			if (base) key = base + '[' + key + ']';
			var result;
			switch (typeOf(value)){
				case 'object': result = Object.toQueryString(value, key); break;
				case 'array':
					var qs = {};
					value.each(function(val, i){
						qs[i] = val;
					});
					result = Object.toQueryString(qs, key);
				break;
				default: result = key + '=' + encodeURIComponent(value);
			}
			if (value != null) queryString.push(result);
		});

		return queryString.join('&');
	}

});





/*
---

name: Browser

description: The Browser Object. Contains Browser initialization, Window and Document, and the Browser Hash.

license: MIT-style license.

requires: [Array, Function, Number, String]

provides: [Browser, Window, Document]

...
*/

(function(){

var document = this.document;
var window = document.window = this;

var UID = 1;

this.$uid = (window.ActiveXObject) ? function(item){
	return (item.uid || (item.uid = [UID++]))[0];
} : function(item){
	return item.uid || (item.uid = UID++);
};

$uid(window);
$uid(document);

var ua = navigator.userAgent.toLowerCase(),
	platform = navigator.platform.toLowerCase(),
	UA = ua.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [null, 'unknown', 0],
	mode = UA[1] == 'ie' && document.documentMode;

var Browser = this.Browser = {

	extend: Function.prototype.extend,

	name: (UA[1] == 'version') ? UA[3] : UA[1],

	version: mode || parseFloat((UA[1] == 'opera' && UA[4]) ? UA[4] : UA[2]),

	Platform: {
		name: ua.match(/ip(?:ad|od|hone)/) ? 'ios' : (ua.match(/(?:webos|android)/) || platform.match(/mac|win|linux/) || ['other'])[0]
	},

	Features: {
		xpath: !!(document.evaluate),
		air: !!(window.runtime),
		query: !!(document.querySelector),
		json: !!(window.JSON)
	},

	Plugins: {}

};

Browser[Browser.name] = true;
Browser[Browser.name + parseInt(Browser.version, 10)] = true;
Browser.Platform[Browser.Platform.name] = true;

// Request

Browser.Request = (function(){

	var XMLHTTP = function(){
		return new XMLHttpRequest();
	};

	var MSXML2 = function(){
		return new ActiveXObject('MSXML2.XMLHTTP');
	};

	var MSXML = function(){
		return new ActiveXObject('Microsoft.XMLHTTP');
	};

	return Function.attempt(function(){
		XMLHTTP();
		return XMLHTTP;
	}, function(){
		MSXML2();
		return MSXML2;
	}, function(){
		MSXML();
		return MSXML;
	});

})();

Browser.Features.xhr = !!(Browser.Request);

// Flash detection

var version = (Function.attempt(function(){
	return navigator.plugins['Shockwave Flash'].description;
}, function(){
	return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
}) || '0 r0').match(/\d+/g);

Browser.Plugins.Flash = {
	version: Number(version[0] || '0.' + version[1]) || 0,
	build: Number(version[2]) || 0
};

// String scripts

Browser.exec = function(text){
	if (!text) return text;
	if (window.execScript){
		window.execScript(text);
	} else {
		var script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script.text = text;
		document.head.appendChild(script);
		document.head.removeChild(script);
	}
	return text;
};

String.implement('stripScripts', function(exec){
	var scripts = '';
	var text = this.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(all, code){
		scripts += code + '\n';
		return '';
	});
	if (exec === true) Browser.exec(scripts);
	else if (typeOf(exec) == 'function') exec(scripts, text);
	return text;
});

// Window, Document

Browser.extend({
	Document: this.Document,
	Window: this.Window,
	Element: this.Element,
	Event: this.Event
});

this.Window = this.$constructor = new Type('Window', function(){});

this.$family = Function.from('window').hide();

Window.mirror(function(name, method){
	window[name] = method;
});

this.Document = document.$constructor = new Type('Document', function(){});

document.$family = Function.from('document').hide();

Document.mirror(function(name, method){
	document[name] = method;
});

document.html = document.documentElement;
document.head = document.getElementsByTagName('head')[0];

if (document.execCommand) try {
	document.execCommand("BackgroundImageCache", false, true);
} catch (e){}

if (this.attachEvent && !this.addEventListener){
	var unloadEvent = function(){
		this.detachEvent('onunload', unloadEvent);
		document.head = document.html = document.window = null;
	};
	this.attachEvent('onunload', unloadEvent);
}

// IE fails on collections and <select>.options (refers to <select>)
var arrayFrom = Array.from;
try {
	arrayFrom(document.html.childNodes);
} catch(e){
	Array.from = function(item){
		if (typeof item != 'string' && Type.isEnumerable(item) && typeOf(item) != 'array'){
			var i = item.length, array = new Array(i);
			while (i--) array[i] = item[i];
			return array;
		}
		return arrayFrom(item);
	};

	var prototype = Array.prototype,
		slice = prototype.slice;
	['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice'].each(function(name){
		var method = prototype[name];
		Array[name] = function(item){
			return method.apply(Array.from(item), slice.call(arguments, 1));
		};
	});
}



})();


/*
---

name: Event

description: Contains the Event Class, to make the event object cross-browser.

license: MIT-style license.

requires: [Window, Document, Array, Function, String, Object]

provides: Event

...
*/

var Event = new Type('Event', function(event, win){
	if (!win) win = window;
	var doc = win.document;
	event = event || win.event;
	if (event.$extended) return event;
	this.$extended = true;
	var type = event.type,
		target = event.target || event.srcElement,
		page = {},
		client = {};
	while (target && target.nodeType == 3) target = target.parentNode;

	if (type.indexOf('key') != -1){
		var code = event.which || event.keyCode;
		var key = Object.keyOf(Event.Keys, code);
		if (type == 'keydown'){
			var fKey = code - 111;
			if (fKey > 0 && fKey < 13) key = 'f' + fKey;
		}
		if (!key) key = String.fromCharCode(code).toLowerCase();
	} else if (type.test(/click|mouse|menu/i)){
		doc = (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
		page = {
			x: (event.pageX != null) ? event.pageX : event.clientX + doc.scrollLeft,
			y: (event.pageY != null) ? event.pageY : event.clientY + doc.scrollTop
		};
		client = {
			x: (event.pageX != null) ? event.pageX - win.pageXOffset : event.clientX,
			y: (event.pageY != null) ? event.pageY - win.pageYOffset : event.clientY
		};
		if (type.test(/DOMMouseScroll|mousewheel/)){
			var wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
		}
		var rightClick = (event.which == 3) || (event.button == 2),
			related = null;
		if (type.test(/over|out/)){
			related = event.relatedTarget || event[(type == 'mouseover' ? 'from' : 'to') + 'Element'];
			var testRelated = function(){
				while (related && related.nodeType == 3) related = related.parentNode;
				return true;
			};
			var hasRelated = (Browser.firefox2) ? testRelated.attempt() : testRelated();
			related = (hasRelated) ? related : null;
		}
	} else if (type.test(/gesture|touch/i)){
		this.rotation = event.rotation;
		this.scale = event.scale;
		this.targetTouches = event.targetTouches;
		this.changedTouches = event.changedTouches;
		var touches = this.touches = event.touches;
		if (touches && touches[0]){
			var touch = touches[0];
			page = {x: touch.pageX, y: touch.pageY};
			client = {x: touch.clientX, y: touch.clientY};
		}
	}

	return Object.append(this, {
		event: event,
		type: type,

		page: page,
		client: client,
		rightClick: rightClick,

		wheel: wheel,

		relatedTarget: document.id(related),
		target: document.id(target),

		code: code,
		key: key,

		shift: event.shiftKey,
		control: event.ctrlKey,
		alt: event.altKey,
		meta: event.metaKey
	});
});

Event.Keys = {
	'enter': 13,
	'up': 38,
	'down': 40,
	'left': 37,
	'right': 39,
	'esc': 27,
	'space': 32,
	'backspace': 8,
	'tab': 9,
	'delete': 46
};



Event.implement({

	stop: function(){
		return this.stopPropagation().preventDefault();
	},

	stopPropagation: function(){
		if (this.event.stopPropagation) this.event.stopPropagation();
		else this.event.cancelBubble = true;
		return this;
	},

	preventDefault: function(){
		if (this.event.preventDefault) this.event.preventDefault();
		else this.event.returnValue = false;
		return this;
	}

});


/*
---

name: Class

description: Contains the Class Function for easily creating, extending, and implementing reusable Classes.

license: MIT-style license.

requires: [Array, String, Function, Number]

provides: Class

...
*/

(function(){

var Class = this.Class = new Type('Class', function(params){
	if (instanceOf(params, Function)) params = {initialize: params};

	var newClass = function(){
		reset(this);
		if (newClass.$prototyping) return this;
		this.$caller = null;
		var value = (this.initialize) ? this.initialize.apply(this, arguments) : this;
		this.$caller = this.caller = null;
		return value;
	}.extend(this).implement(params);

	newClass.$constructor = Class;
	newClass.prototype.$constructor = newClass;
	newClass.prototype.parent = parent;

	return newClass;
});

var parent = function(){
	if (!this.$caller) throw new Error('The method "parent" cannot be called.');
	var name = this.$caller.$name,
		parent = this.$caller.$owner.parent,
		previous = (parent) ? parent.prototype[name] : null;
	if (!previous) throw new Error('The method "' + name + '" has no parent.');
	return previous.apply(this, arguments);
};

var reset = function(object){
	for (var key in object){
		var value = object[key];
		switch (typeOf(value)){
			case 'object':
				var F = function(){};
				F.prototype = value;
				object[key] = reset(new F);
			break;
			case 'array': object[key] = value.clone(); break;
		}
	}
	return object;
};

var wrap = function(self, key, method){
	if (method.$origin) method = method.$origin;
	var wrapper = function(){
		if (method.$protected && this.$caller == null) throw new Error('The method "' + key + '" cannot be called.');
		var caller = this.caller, current = this.$caller;
		this.caller = current; this.$caller = wrapper;
		var result = method.apply(this, arguments);
		this.$caller = current; this.caller = caller;
		return result;
	}.extend({$owner: self, $origin: method, $name: key});
	return wrapper;
};

var implement = function(key, value, retain){
	if (Class.Mutators.hasOwnProperty(key)){
		value = Class.Mutators[key].call(this, value);
		if (value == null) return this;
	}

	if (typeOf(value) == 'function'){
		if (value.$hidden) return this;
		this.prototype[key] = (retain) ? value : wrap(this, key, value);
	} else {
		Object.merge(this.prototype, key, value);
	}

	return this;
};

var getInstance = function(klass){
	klass.$prototyping = true;
	var proto = new klass;
	delete klass.$prototyping;
	return proto;
};

Class.implement('implement', implement.overloadSetter());

Class.Mutators = {

	Extends: function(parent){
		this.parent = parent;
		this.prototype = getInstance(parent);
	},

	Implements: function(items){
		Array.from(items).each(function(item){
			var instance = new item;
			for (var key in instance) implement.call(this, key, instance[key], true);
		}, this);
	}
};

})();


/*
---

name: Class.Extras

description: Contains Utility Classes that can be implemented into your own Classes to ease the execution of many common tasks.

license: MIT-style license.

requires: Class

provides: [Class.Extras, Chain, Events, Options]

...
*/

(function(){

this.Chain = new Class({

	$chain: [],

	chain: function(){
		this.$chain.append(Array.flatten(arguments));
		return this;
	},

	callChain: function(){
		return (this.$chain.length) ? this.$chain.shift().apply(this, arguments) : false;
	},

	clearChain: function(){
		this.$chain.empty();
		return this;
	}

});

var removeOn = function(string){
	return string.replace(/^on([A-Z])/, function(full, first){
		return first.toLowerCase();
	});
};

this.Events = new Class({

	$events: {},

	addEvent: function(type, fn, internal){
		type = removeOn(type);

		

		this.$events[type] = (this.$events[type] || []).include(fn);
		if (internal) fn.internal = true;
		return this;
	},

	addEvents: function(events){
		for (var type in events) this.addEvent(type, events[type]);
		return this;
	},

	fireEvent: function(type, args, delay){
		type = removeOn(type);
		var events = this.$events[type];
		if (!events) return this;
		args = Array.from(args);
		events.each(function(fn){
			if (delay) fn.delay(delay, this, args);
			else fn.apply(this, args);
		}, this);
		return this;
	},
	
	removeEvent: function(type, fn){
		type = removeOn(type);
		var events = this.$events[type];
		if (events && !fn.internal){
			var index =  events.indexOf(fn);
			if (index != -1) delete events[index];
		}
		return this;
	},

	removeEvents: function(events){
		var type;
		if (typeOf(events) == 'object'){
			for (type in events) this.removeEvent(type, events[type]);
			return this;
		}
		if (events) events = removeOn(events);
		for (type in this.$events){
			if (events && events != type) continue;
			var fns = this.$events[type];
			for (var i = fns.length; i--;) this.removeEvent(type, fns[i]);
		}
		return this;
	}

});

this.Options = new Class({

	setOptions: function(){
		var options = this.options = Object.merge.apply(null, [{}, this.options].append(arguments));
		if (!this.addEvent) return this;
		for (var option in options){
			if (typeOf(options[option]) != 'function' || !(/^on[A-Z]/).test(option)) continue;
			this.addEvent(option, options[option]);
			delete options[option];
		}
		return this;
	}

});

})();


/*
---
name: Slick.Parser
description: Standalone CSS3 Selector parser
provides: Slick.Parser
...
*/

(function(){

var parsed,
	separatorIndex,
	combinatorIndex,
	reversed,
	cache = {},
	reverseCache = {},
	reUnescape = /\\/g;

var parse = function(expression, isReversed){
	if (expression == null) return null;
	if (expression.Slick === true) return expression;
	expression = ('' + expression).replace(/^\s+|\s+$/g, '');
	reversed = !!isReversed;
	var currentCache = (reversed) ? reverseCache : cache;
	if (currentCache[expression]) return currentCache[expression];
	parsed = {Slick: true, expressions: [], raw: expression, reverse: function(){
		return parse(this.raw, true);
	}};
	separatorIndex = -1;
	while (expression != (expression = expression.replace(regexp, parser)));
	parsed.length = parsed.expressions.length;
	return currentCache[expression] = (reversed) ? reverse(parsed) : parsed;
};

var reverseCombinator = function(combinator){
	if (combinator === '!') return ' ';
	else if (combinator === ' ') return '!';
	else if ((/^!/).test(combinator)) return combinator.replace(/^!/, '');
	else return '!' + combinator;
};

var reverse = function(expression){
	var expressions = expression.expressions;
	for (var i = 0; i < expressions.length; i++){
		var exp = expressions[i];
		var last = {parts: [], tag: '*', combinator: reverseCombinator(exp[0].combinator)};

		for (var j = 0; j < exp.length; j++){
			var cexp = exp[j];
			if (!cexp.reverseCombinator) cexp.reverseCombinator = ' ';
			cexp.combinator = cexp.reverseCombinator;
			delete cexp.reverseCombinator;
		}

		exp.reverse().push(last);
	}
	return expression;
};

var escapeRegExp = function(string){// Credit: XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License
	return string.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, "\\$&");
};

var regexp = new RegExp(
/*
#!/usr/bin/env ruby
puts "\t\t" + DATA.read.gsub(/\(\?x\)|\s+#.*$|\s+|\\$|\\n/,'')
__END__
	"(?x)^(?:\
	  \\s* ( , ) \\s*               # Separator          \n\
	| \\s* ( <combinator>+ ) \\s*   # Combinator         \n\
	|      ( \\s+ )                 # CombinatorChildren \n\
	|      ( <unicode>+ | \\* )     # Tag                \n\
	| \\#  ( <unicode>+       )     # ID                 \n\
	| \\.  ( <unicode>+       )     # ClassName          \n\
	|                               # Attribute          \n\
	\\[  \
		\\s* (<unicode1>+)  (?:  \
			\\s* ([*^$!~|]?=)  (?:  \
				\\s* (?:\
					([\"']?)(.*?)\\9 \
				)\
			)  \
		)?  \\s*  \
	\\](?!\\]) \n\
	|   :+ ( <unicode>+ )(?:\
	\\( (?:\
		(?:([\"'])([^\\12]*)\\12)|((?:\\([^)]+\\)|[^()]*)+)\
	) \\)\
	)?\
	)"
*/
	"^(?:\\s*(,)\\s*|\\s*(<combinator>+)\\s*|(\\s+)|(<unicode>+|\\*)|\\#(<unicode>+)|\\.(<unicode>+)|\\[\\s*(<unicode1>+)(?:\\s*([*^$!~|]?=)(?:\\s*(?:([\"']?)(.*?)\\9)))?\\s*\\](?!\\])|:+(<unicode>+)(?:\\((?:(?:([\"'])([^\\12]*)\\12)|((?:\\([^)]+\\)|[^()]*)+))\\))?)"
	.replace(/<combinator>/, '[' + escapeRegExp(">+~`!@$%^&={}\\;</") + ']')
	.replace(/<unicode>/g, '(?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])')
	.replace(/<unicode1>/g, '(?:[:\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])')
);

function parser(
	rawMatch,

	separator,
	combinator,
	combinatorChildren,

	tagName,
	id,
	className,

	attributeKey,
	attributeOperator,
	attributeQuote,
	attributeValue,

	pseudoClass,
	pseudoQuote,
	pseudoClassQuotedValue,
	pseudoClassValue
){
	if (separator || separatorIndex === -1){
		parsed.expressions[++separatorIndex] = [];
		combinatorIndex = -1;
		if (separator) return '';
	}

	if (combinator || combinatorChildren || combinatorIndex === -1){
		combinator = combinator || ' ';
		var currentSeparator = parsed.expressions[separatorIndex];
		if (reversed && currentSeparator[combinatorIndex])
			currentSeparator[combinatorIndex].reverseCombinator = reverseCombinator(combinator);
		currentSeparator[++combinatorIndex] = {combinator: combinator, tag: '*'};
	}

	var currentParsed = parsed.expressions[separatorIndex][combinatorIndex];

	if (tagName){
		currentParsed.tag = tagName.replace(reUnescape, '');

	} else if (id){
		currentParsed.id = id.replace(reUnescape, '');

	} else if (className){
		className = className.replace(reUnescape, '');

		if (!currentParsed.classList) currentParsed.classList = [];
		if (!currentParsed.classes) currentParsed.classes = [];
		currentParsed.classList.push(className);
		currentParsed.classes.push({
			value: className,
			regexp: new RegExp('(^|\\s)' + escapeRegExp(className) + '(\\s|$)')
		});

	} else if (pseudoClass){
		pseudoClassValue = pseudoClassValue || pseudoClassQuotedValue;
		pseudoClassValue = pseudoClassValue ? pseudoClassValue.replace(reUnescape, '') : null;

		if (!currentParsed.pseudos) currentParsed.pseudos = [];
		currentParsed.pseudos.push({
			key: pseudoClass.replace(reUnescape, ''),
			value: pseudoClassValue
		});

	} else if (attributeKey){
		attributeKey = attributeKey.replace(reUnescape, '');
		attributeValue = (attributeValue || '').replace(reUnescape, '');

		var test, regexp;

		switch (attributeOperator){
			case '^=' : regexp = new RegExp(       '^'+ escapeRegExp(attributeValue)            ); break;
			case '$=' : regexp = new RegExp(            escapeRegExp(attributeValue) +'$'       ); break;
			case '~=' : regexp = new RegExp( '(^|\\s)'+ escapeRegExp(attributeValue) +'(\\s|$)' ); break;
			case '|=' : regexp = new RegExp(       '^'+ escapeRegExp(attributeValue) +'(-|$)'   ); break;
			case  '=' : test = function(value){
				return attributeValue == value;
			}; break;
			case '*=' : test = function(value){
				return value && value.indexOf(attributeValue) > -1;
			}; break;
			case '!=' : test = function(value){
				return attributeValue != value;
			}; break;
			default   : test = function(value){
				return !!value;
			};
		}

		if (attributeValue == '' && (/^[*$^]=$/).test(attributeOperator)) test = function(){
			return false;
		};

		if (!test) test = function(value){
			return value && regexp.test(value);
		};

		if (!currentParsed.attributes) currentParsed.attributes = [];
		currentParsed.attributes.push({
			key: attributeKey,
			operator: attributeOperator,
			value: attributeValue,
			test: test
		});

	}

	return '';
};

// Slick NS

var Slick = (this.Slick || {});

Slick.parse = function(expression){
	return parse(expression);
};

Slick.escapeRegExp = escapeRegExp;

if (!this.Slick) this.Slick = Slick;

}).apply(/*<CommonJS>*/(typeof exports != 'undefined') ? exports : /*</CommonJS>*/this);


/*
---
name: Slick.Finder
description: The new, superfast css selector engine.
provides: Slick.Finder
requires: Slick.Parser
...
*/

(function(){

var local = {};

// Feature / Bug detection

local.isNativeCode = function(fn){
	return (/\{\s*\[native code\]\s*\}/).test('' + fn);
};

local.isXML = function(document){
	return (!!document.xmlVersion) || (!!document.xml) || (Object.prototype.toString.call(document) === '[object XMLDocument]') ||
	(document.nodeType === 9 && document.documentElement.nodeName !== 'HTML');
};

local.setDocument = function(document){

	// convert elements / window arguments to document. if document cannot be extrapolated, the function returns.

	if (document.nodeType === 9); // document
	else if (document.ownerDocument) document = document.ownerDocument; // node
	else if (document.navigator) document = document.document; // window
	else return;

	// check if it's the old document

	if (this.document === document) return;
	this.document = document;
	var root = this.root = document.documentElement;

	this.isXMLDocument = this.isXML(document);

	this.brokenStarGEBTN
	= this.starSelectsClosedQSA
	= this.idGetsName
	= this.brokenMixedCaseQSA
	= this.brokenGEBCN
	= this.brokenCheckedQSA
	= this.brokenEmptyAttributeQSA
	= this.isHTMLDocument
	= false;

	var starSelectsClosed, starSelectsComments,
		brokenSecondClassNameGEBCN, cachedGetElementsByClassName;

	var selected, id;
	var testNode = document.createElement('div');
	root.appendChild(testNode);

	// on non-HTML documents innerHTML and getElementsById doesnt work properly
	try {
		id = 'slick_getbyid_test';
		testNode.innerHTML = '<a id="'+id+'"></a>';
		this.isHTMLDocument = !!document.getElementById(id);
	} catch(e){};

	if (this.isHTMLDocument){
		
		testNode.style.display = 'none';
		
		// IE returns comment nodes for getElementsByTagName('*') for some documents
		testNode.appendChild(document.createComment(''));
		starSelectsComments = (testNode.getElementsByTagName('*').length > 0);

		// IE returns closed nodes (EG:"</foo>") for getElementsByTagName('*') for some documents
		try {
			testNode.innerHTML = 'foo</foo>';
			selected = testNode.getElementsByTagName('*');
			starSelectsClosed = (selected && selected.length && selected[0].nodeName.charAt(0) == '/');
		} catch(e){};

		this.brokenStarGEBTN = starSelectsComments || starSelectsClosed;

		// IE 8 returns closed nodes (EG:"</foo>") for querySelectorAll('*') for some documents
		if (testNode.querySelectorAll) try {
			testNode.innerHTML = 'foo</foo>';
			selected = testNode.querySelectorAll('*');
			this.starSelectsClosedQSA = (selected && selected.length && selected[0].nodeName.charAt(0) == '/');
		} catch(e){};

		// IE returns elements with the name instead of just id for getElementsById for some documents
		try {
			id = 'slick_id_gets_name';
			testNode.innerHTML = '<a name="'+id+'"></a><b id="'+id+'"></b>';
			this.idGetsName = document.getElementById(id) === testNode.firstChild;
		} catch(e){};

		// Safari 3.2 querySelectorAll doesnt work with mixedcase on quirksmode
		try {
			testNode.innerHTML = '<a class="MiXedCaSe"></a>';
			this.brokenMixedCaseQSA = !testNode.querySelectorAll('.MiXedCaSe').length;
		} catch(e){};

		try {
			testNode.innerHTML = '<a class="f"></a><a class="b"></a>';
			testNode.getElementsByClassName('b').length;
			testNode.firstChild.className = 'b';
			cachedGetElementsByClassName = (testNode.getElementsByClassName('b').length != 2);
		} catch(e){};

		// Opera 9.6 getElementsByClassName doesnt detects the class if its not the first one
		try {
			testNode.innerHTML = '<a class="a"></a><a class="f b a"></a>';
			brokenSecondClassNameGEBCN = (testNode.getElementsByClassName('a').length != 2);
		} catch(e){};

		this.brokenGEBCN = cachedGetElementsByClassName || brokenSecondClassNameGEBCN;
		
		// Webkit dont return selected options on querySelectorAll
		try {
			testNode.innerHTML = '<select><option selected="selected">a</option></select>';
			this.brokenCheckedQSA = (testNode.querySelectorAll(':checked').length == 0);
		} catch(e){};
		
		// IE returns incorrect results for attr[*^$]="" selectors on querySelectorAll
		try {
			testNode.innerHTML = '<a class=""></a>';
			this.brokenEmptyAttributeQSA = (testNode.querySelectorAll('[class*=""]').length != 0);
		} catch(e){};
		
	}

	root.removeChild(testNode);
	testNode = null;

	// hasAttribute

	this.hasAttribute = (root && this.isNativeCode(root.hasAttribute)) ? function(node, attribute) {
		return node.hasAttribute(attribute);
	} : function(node, attribute) {
		node = node.getAttributeNode(attribute);
		return !!(node && (node.specified || node.nodeValue));
	};

	// contains
	// FIXME: Add specs: local.contains should be different for xml and html documents?
	this.contains = (root && this.isNativeCode(root.contains)) ? function(context, node){
		return context.contains(node);
	} : (root && root.compareDocumentPosition) ? function(context, node){
		return context === node || !!(context.compareDocumentPosition(node) & 16);
	} : function(context, node){
		if (node) do {
			if (node === context) return true;
		} while ((node = node.parentNode));
		return false;
	};

	// document order sorting
	// credits to Sizzle (http://sizzlejs.com/)

	this.documentSorter = (root.compareDocumentPosition) ? function(a, b){
		if (!a.compareDocumentPosition || !b.compareDocumentPosition) return 0;
		return a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
	} : ('sourceIndex' in root) ? function(a, b){
		if (!a.sourceIndex || !b.sourceIndex) return 0;
		return a.sourceIndex - b.sourceIndex;
	} : (document.createRange) ? function(a, b){
		if (!a.ownerDocument || !b.ownerDocument) return 0;
		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.setStart(a, 0);
		aRange.setEnd(a, 0);
		bRange.setStart(b, 0);
		bRange.setEnd(b, 0);
		return aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
	} : null ;

	this.getUID = (this.isHTMLDocument) ? this.getUIDHTML : this.getUIDXML;

};

// Main Method

local.search = function(context, expression, append, first){

	var found = this.found = (first) ? null : (append || []);

	// context checks

	if (!context) return found; // No context
	if (context.navigator) context = context.document; // Convert the node from a window to a document
	else if (!context.nodeType) return found; // Reject misc junk input

	// setup

	var parsed, i;

	var uniques = this.uniques = {};

	if (this.document !== (context.ownerDocument || context)) this.setDocument(context);

	// should sort if there are nodes in append and if you pass multiple expressions.
	// should remove duplicates if append already has items
	var shouldUniques = !!(append && append.length);

	// avoid duplicating items already in the append array
	if (shouldUniques) for (i = found.length; i--;) this.uniques[this.getUID(found[i])] = true;

	// expression checks

	if (typeof expression == 'string'){ // expression is a string

		// Overrides

		for (i = this.overrides.length; i--;){
			var override = this.overrides[i];
			if (override.regexp.test(expression)){
				var result = override.method.call(context, expression, found, first);
				if (result === false) continue;
				if (result === true) return found;
				return result;
			}
		}

		parsed = this.Slick.parse(expression);
		if (!parsed.length) return found;
	} else if (expression == null){ // there is no expression
		return found;
	} else if (expression.Slick){ // expression is a parsed Slick object
		parsed = expression;
	} else if (this.contains(context.documentElement || context, expression)){ // expression is a node
		(found) ? found.push(expression) : found = expression;
		return found;
	} else { // other junk
		return found;
	}

	// cache elements for the nth selectors

	/*<pseudo-selectors>*//*<nth-pseudo-selectors>*/

	this.posNTH = {};
	this.posNTHLast = {};
	this.posNTHType = {};
	this.posNTHTypeLast = {};

	/*</nth-pseudo-selectors>*//*</pseudo-selectors>*/

	// if append is null and there is only a single selector with one expression use pushArray, else use pushUID
	this.push = (!shouldUniques && (first || (parsed.length == 1 && parsed.expressions[0].length == 1))) ? this.pushArray : this.pushUID;

	if (found == null) found = [];

	// default engine

	var j, m, n;
	var combinator, tag, id, classList, classes, attributes, pseudos;
	var currentItems, currentExpression, currentBit, lastBit, expressions = parsed.expressions;

	search: for (i = 0; (currentExpression = expressions[i]); i++) for (j = 0; (currentBit = currentExpression[j]); j++){

		combinator = 'combinator:' + currentBit.combinator;
		if (!this[combinator]) continue search;

		tag        = (this.isXMLDocument) ? currentBit.tag : currentBit.tag.toUpperCase();
		id         = currentBit.id;
		classList  = currentBit.classList;
		classes    = currentBit.classes;
		attributes = currentBit.attributes;
		pseudos    = currentBit.pseudos;
		lastBit    = (j === (currentExpression.length - 1));

		this.bitUniques = {};

		if (lastBit){
			this.uniques = uniques;
			this.found = found;
		} else {
			this.uniques = {};
			this.found = [];
		}

		if (j === 0){
			this[combinator](context, tag, id, classes, attributes, pseudos, classList);
			if (first && lastBit && found.length) break search;
		} else {
			if (first && lastBit) for (m = 0, n = currentItems.length; m < n; m++){
				this[combinator](currentItems[m], tag, id, classes, attributes, pseudos, classList);
				if (found.length) break search;
			} else for (m = 0, n = currentItems.length; m < n; m++) this[combinator](currentItems[m], tag, id, classes, attributes, pseudos, classList);
		}

		currentItems = this.found;
	}

	if (shouldUniques || (parsed.expressions.length > 1)) this.sort(found);

	return (first) ? (found[0] || null) : found;
};

// Utils

local.uidx = 1;
local.uidk = 'slick:uniqueid';

local.getUIDXML = function(node){
	var uid = node.getAttribute(this.uidk);
	if (!uid){
		uid = this.uidx++;
		node.setAttribute(this.uidk, uid);
	}
	return uid;
};

local.getUIDHTML = function(node){
	return node.uniqueNumber || (node.uniqueNumber = this.uidx++);
};

// sort based on the setDocument documentSorter method.

local.sort = function(results){
	if (!this.documentSorter) return results;
	results.sort(this.documentSorter);
	return results;
};

/*<pseudo-selectors>*//*<nth-pseudo-selectors>*/

local.cacheNTH = {};

local.matchNTH = /^([+-]?\d*)?([a-z]+)?([+-]\d+)?$/;

local.parseNTHArgument = function(argument){
	var parsed = argument.match(this.matchNTH);
	if (!parsed) return false;
	var special = parsed[2] || false;
	var a = parsed[1] || 1;
	if (a == '-') a = -1;
	var b = +parsed[3] || 0;
	parsed =
		(special == 'n')	? {a: a, b: b} :
		(special == 'odd')	? {a: 2, b: 1} :
		(special == 'even')	? {a: 2, b: 0} : {a: 0, b: a};

	return (this.cacheNTH[argument] = parsed);
};

local.createNTHPseudo = function(child, sibling, positions, ofType){
	return function(node, argument){
		var uid = this.getUID(node);
		if (!this[positions][uid]){
			var parent = node.parentNode;
			if (!parent) return false;
			var el = parent[child], count = 1;
			if (ofType){
				var nodeName = node.nodeName;
				do {
					if (el.nodeName !== nodeName) continue;
					this[positions][this.getUID(el)] = count++;
				} while ((el = el[sibling]));
			} else {
				do {
					if (el.nodeType !== 1) continue;
					this[positions][this.getUID(el)] = count++;
				} while ((el = el[sibling]));
			}
		}
		argument = argument || 'n';
		var parsed = this.cacheNTH[argument] || this.parseNTHArgument(argument);
		if (!parsed) return false;
		var a = parsed.a, b = parsed.b, pos = this[positions][uid];
		if (a == 0) return b == pos;
		if (a > 0){
			if (pos < b) return false;
		} else {
			if (b < pos) return false;
		}
		return ((pos - b) % a) == 0;
	};
};

/*</nth-pseudo-selectors>*//*</pseudo-selectors>*/

local.pushArray = function(node, tag, id, classes, attributes, pseudos){
	if (this.matchSelector(node, tag, id, classes, attributes, pseudos)) this.found.push(node);
};

local.pushUID = function(node, tag, id, classes, attributes, pseudos){
	var uid = this.getUID(node);
	if (!this.uniques[uid] && this.matchSelector(node, tag, id, classes, attributes, pseudos)){
		this.uniques[uid] = true;
		this.found.push(node);
	}
};

local.matchNode = function(node, selector){
	var parsed = this.Slick.parse(selector);
	if (!parsed) return true;

	// simple (single) selectors
	if(parsed.length == 1 && parsed.expressions[0].length == 1){
		var exp = parsed.expressions[0][0];
		return this.matchSelector(node, (this.isXMLDocument) ? exp.tag : exp.tag.toUpperCase(), exp.id, exp.classes, exp.attributes, exp.pseudos);
	}

	var nodes = this.search(this.document, parsed);
	for (var i = 0, item; item = nodes[i++];){
		if (item === node) return true;
	}
	return false;
};

local.matchPseudo = function(node, name, argument){
	var pseudoName = 'pseudo:' + name;
	if (this[pseudoName]) return this[pseudoName](node, argument);
	var attribute = this.getAttribute(node, name);
	return (argument) ? argument == attribute : !!attribute;
};

local.matchSelector = function(node, tag, id, classes, attributes, pseudos){
	if (tag){
		if (tag == '*'){
			if (node.nodeName < '@') return false; // Fix for comment nodes and closed nodes
		} else {
			if (node.nodeName != tag) return false;
		}
	}

	if (id && node.getAttribute('id') != id) return false;

	var i, part, cls;
	if (classes) for (i = classes.length; i--;){
		cls = ('className' in node) ? node.className : node.getAttribute('class');
		if (!(cls && classes[i].regexp.test(cls))) return false;
	}
	if (attributes) for (i = attributes.length; i--;){
		part = attributes[i];
		if (part.operator ? !part.test(this.getAttribute(node, part.key)) : !this.hasAttribute(node, part.key)) return false;
	}
	if (pseudos) for (i = pseudos.length; i--;){
		part = pseudos[i];
		if (!this.matchPseudo(node, part.key, part.value)) return false;
	}
	return true;
};

var combinators = {

	' ': function(node, tag, id, classes, attributes, pseudos, classList){ // all child nodes, any level

		var i, item, children;

		if (this.isHTMLDocument){
			getById: if (id){
				item = this.document.getElementById(id);
				if ((!item && node.all) || (this.idGetsName && item && item.getAttributeNode('id').nodeValue != id)){
					// all[id] returns all the elements with that name or id inside node
					// if theres just one it will return the element, else it will be a collection
					children = node.all[id];
					if (!children) return;
					if (!children[0]) children = [children];
					for (i = 0; item = children[i++];) if (item.getAttributeNode('id').nodeValue == id){
						this.push(item, tag, null, classes, attributes, pseudos);
						break;
					} 
					return;
				}
				if (!item){
					// if the context is in the dom we return, else we will try GEBTN, breaking the getById label
					if (this.contains(this.document.documentElement, node)) return;
					else break getById;
				} else if (this.document !== node && !this.contains(node, item)) return;
				this.push(item, tag, null, classes, attributes, pseudos);
				return;
			}
			getByClass: if (classes && node.getElementsByClassName && !this.brokenGEBCN){
				children = node.getElementsByClassName(classList.join(' '));
				if (!(children && children.length)) break getByClass;
				for (i = 0; item = children[i++];) this.push(item, tag, id, null, attributes, pseudos);
				return;
			}
		}
		getByTag: {
			children = node.getElementsByTagName(tag);
			if (!(children && children.length)) break getByTag;
			if (!this.brokenStarGEBTN) tag = null;
			for (i = 0; item = children[i++];) this.push(item, tag, id, classes, attributes, pseudos);
		}
	},

	'>': function(node, tag, id, classes, attributes, pseudos){ // direct children
		if ((node = node.firstChild)) do {
			if (node.nodeType === 1) this.push(node, tag, id, classes, attributes, pseudos);
		} while ((node = node.nextSibling));
	},

	'+': function(node, tag, id, classes, attributes, pseudos){ // next sibling
		while ((node = node.nextSibling)) if (node.nodeType === 1){
			this.push(node, tag, id, classes, attributes, pseudos);
			break;
		}
	},

	'^': function(node, tag, id, classes, attributes, pseudos){ // first child
		node = node.firstChild;
		if (node){
			if (node.nodeType === 1) this.push(node, tag, id, classes, attributes, pseudos);
			else this['combinator:+'](node, tag, id, classes, attributes, pseudos);
		}
	},

	'~': function(node, tag, id, classes, attributes, pseudos){ // next siblings
		while ((node = node.nextSibling)){
			if (node.nodeType !== 1) continue;
			var uid = this.getUID(node);
			if (this.bitUniques[uid]) break;
			this.bitUniques[uid] = true;
			this.push(node, tag, id, classes, attributes, pseudos);
		}
	},

	'++': function(node, tag, id, classes, attributes, pseudos){ // next sibling and previous sibling
		this['combinator:+'](node, tag, id, classes, attributes, pseudos);
		this['combinator:!+'](node, tag, id, classes, attributes, pseudos);
	},

	'~~': function(node, tag, id, classes, attributes, pseudos){ // next siblings and previous siblings
		this['combinator:~'](node, tag, id, classes, attributes, pseudos);
		this['combinator:!~'](node, tag, id, classes, attributes, pseudos);
	},

	'!': function(node, tag, id, classes, attributes, pseudos){  // all parent nodes up to document
		while ((node = node.parentNode)) if (node !== this.document) this.push(node, tag, id, classes, attributes, pseudos);
	},

	'!>': function(node, tag, id, classes, attributes, pseudos){ // direct parent (one level)
		node = node.parentNode;
		if (node !== this.document) this.push(node, tag, id, classes, attributes, pseudos);
	},

	'!+': function(node, tag, id, classes, attributes, pseudos){ // previous sibling
		while ((node = node.previousSibling)) if (node.nodeType === 1){
			this.push(node, tag, id, classes, attributes, pseudos);
			break;
		}
	},

	'!^': function(node, tag, id, classes, attributes, pseudos){ // last child
		node = node.lastChild;
		if (node){
			if (node.nodeType === 1) this.push(node, tag, id, classes, attributes, pseudos);
			else this['combinator:!+'](node, tag, id, classes, attributes, pseudos);
		}
	},

	'!~': function(node, tag, id, classes, attributes, pseudos){ // previous siblings
		while ((node = node.previousSibling)){
			if (node.nodeType !== 1) continue;
			var uid = this.getUID(node);
			if (this.bitUniques[uid]) break;
			this.bitUniques[uid] = true;
			this.push(node, tag, id, classes, attributes, pseudos);
		}
	}

};

for (var c in combinators) local['combinator:' + c] = combinators[c];

var pseudos = {

	/*<pseudo-selectors>*/

	'empty': function(node){
		var child = node.firstChild;
		return !(child && child.nodeType == 1) && !(node.innerText || node.textContent || '').length;
	},

	'not': function(node, expression){
		return !this.matchNode(node, expression);
	},

	'contains': function(node, text){
		return (node.innerText || node.textContent || '').indexOf(text) > -1;
	},

	'first-child': function(node){
		while ((node = node.previousSibling)) if (node.nodeType === 1) return false;
		return true;
	},

	'last-child': function(node){
		while ((node = node.nextSibling)) if (node.nodeType === 1) return false;
		return true;
	},

	'only-child': function(node){
		var prev = node;
		while ((prev = prev.previousSibling)) if (prev.nodeType === 1) return false;
		var next = node;
		while ((next = next.nextSibling)) if (next.nodeType === 1) return false;
		return true;
	},

	/*<nth-pseudo-selectors>*/

	'nth-child': local.createNTHPseudo('firstChild', 'nextSibling', 'posNTH'),

	'nth-last-child': local.createNTHPseudo('lastChild', 'previousSibling', 'posNTHLast'),

	'nth-of-type': local.createNTHPseudo('firstChild', 'nextSibling', 'posNTHType', true),

	'nth-last-of-type': local.createNTHPseudo('lastChild', 'previousSibling', 'posNTHTypeLast', true),

	'index': function(node, index){
		return this['pseudo:nth-child'](node, '' + index + 1);
	},

	'even': function(node, argument){
		return this['pseudo:nth-child'](node, '2n');
	},

	'odd': function(node, argument){
		return this['pseudo:nth-child'](node, '2n+1');
	},

	/*</nth-pseudo-selectors>*/

	/*<of-type-pseudo-selectors>*/

	'first-of-type': function(node){
		var nodeName = node.nodeName;
		while ((node = node.previousSibling)) if (node.nodeName === nodeName) return false;
		return true;
	},

	'last-of-type': function(node){
		var nodeName = node.nodeName;
		while ((node = node.nextSibling)) if (node.nodeName === nodeName) return false;
		return true;
	},

	'only-of-type': function(node){
		var prev = node, nodeName = node.nodeName;
		while ((prev = prev.previousSibling)) if (prev.nodeName === nodeName) return false;
		var next = node;
		while ((next = next.nextSibling)) if (next.nodeName === nodeName) return false;
		return true;
	},

	/*</of-type-pseudo-selectors>*/

	// custom pseudos

	'enabled': function(node){
		return (node.disabled === false);
	},

	'disabled': function(node){
		return (node.disabled === true);
	},

	'checked': function(node){
		return node.checked || node.selected;
	},

	'focus': function(node){
		return this.isHTMLDocument && this.document.activeElement === node && (node.href || node.type || this.hasAttribute(node, 'tabindex'));
	},

	'root': function(node){
		return (node === this.root);
	},
	
	'selected': function(node){
		return node.selected;
	}

	/*</pseudo-selectors>*/
};

for (var p in pseudos) local['pseudo:' + p] = pseudos[p];

// attributes methods

local.attributeGetters = {

	'class': function(){
		return ('className' in this) ? this.className : this.getAttribute('class');
	},

	'for': function(){
		return ('htmlFor' in this) ? this.htmlFor : this.getAttribute('for');
	},

	'href': function(){
		return ('href' in this) ? this.getAttribute('href', 2) : this.getAttribute('href');
	},

	'style': function(){
		return (this.style) ? this.style.cssText : this.getAttribute('style');
	}

};

local.getAttribute = function(node, name){
	// FIXME: check if getAttribute() will get input elements on a form on this browser
	// getAttribute is faster than getAttributeNode().nodeValue
	var method = this.attributeGetters[name];
	if (method) return method.call(node);
	var attributeNode = node.getAttributeNode(name);
	return attributeNode ? attributeNode.nodeValue : null;
};

// overrides

local.overrides = [];

local.override = function(regexp, method){
	this.overrides.push({regexp: regexp, method: method});
};

/*<overrides>*/

/*<query-selector-override>*/

var reEmptyAttribute = /\[.*[*$^]=(?:["']{2})?\]/;

local.override(/./, function(expression, found, first){ //querySelectorAll override

	if (!this.querySelectorAll || this.nodeType != 9 || !local.isHTMLDocument || local.brokenMixedCaseQSA ||
	(local.brokenCheckedQSA && expression.indexOf(':checked') > -1) ||
	(local.brokenEmptyAttributeQSA && reEmptyAttribute.test(expression)) || Slick.disableQSA) return false;

	var nodes, node;
	try {
		if (first) return this.querySelector(expression) || null;
		else nodes = this.querySelectorAll(expression);
	} catch(error){
		return false;
	}

	var i, hasOthers = !!(found.length);

	if (local.starSelectsClosedQSA) for (i = 0; node = nodes[i++];){
		if (node.nodeName > '@' && (!hasOthers || !local.uniques[local.getUIDHTML(node)])) found.push(node);
	} else for (i = 0; node = nodes[i++];){
		if (!hasOthers || !local.uniques[local.getUIDHTML(node)]) found.push(node);
	}

	if (hasOthers) local.sort(found);

	return true;

});

/*</query-selector-override>*/

/*<tag-override>*/

local.override(/^[\w-]+$|^\*$/, function(expression, found, first){ // tag override
	var tag = expression;
	if (tag == '*' && local.brokenStarGEBTN) return false;

	var nodes = this.getElementsByTagName(tag);

	if (first) return nodes[0] || null;
	var i, node, hasOthers = !!(found.length);

	for (i = 0; node = nodes[i++];){
		if (!hasOthers || !local.uniques[local.getUID(node)]) found.push(node);
	}

	if (hasOthers) local.sort(found);

	return true;
});

/*</tag-override>*/

/*<class-override>*/

local.override(/^\.[\w-]+$/, function(expression, found, first){ // class override
	if (!local.isHTMLDocument || (!this.getElementsByClassName && this.querySelectorAll)) return false;

	var nodes, node, i, hasOthers = !!(found && found.length), className = expression.substring(1);
	if (this.getElementsByClassName && !local.brokenGEBCN){
		nodes = this.getElementsByClassName(className);
		if (first) return nodes[0] || null;
		for (i = 0; node = nodes[i++];){
			if (!hasOthers || !local.uniques[local.getUIDHTML(node)]) found.push(node);
		}
	} else {
		var matchClass = new RegExp('(^|\\s)'+ Slick.escapeRegExp(className) +'(\\s|$)');
		nodes = this.getElementsByTagName('*');
		for (i = 0; node = nodes[i++];){
			className = node.className;
			if (!className || !matchClass.test(className)) continue;
			if (first) return node;
			if (!hasOthers || !local.uniques[local.getUIDHTML(node)]) found.push(node);
		}
	}
	if (hasOthers) local.sort(found);
	return (first) ? null : true;
});

/*</class-override>*/

/*<id-override>*/

local.override(/^#[\w-]+$/, function(expression, found, first){ // ID override
	if (!local.isHTMLDocument || this.nodeType != 9) return false;

	var id = expression.substring(1), el = this.getElementById(id);
	if (!el) return found;
	if (local.idGetsName && el.getAttributeNode('id').nodeValue != id) return false;
	if (first) return el || null;
	var hasOthers = !!(found.length);
	if (!hasOthers || !local.uniques[local.getUIDHTML(el)]) found.push(el);
	if (hasOthers) local.sort(found);
	return true;
});

/*</id-override>*/

/*</overrides>*/

if (typeof document != 'undefined') local.setDocument(document);

// Slick

var Slick = local.Slick = (this.Slick || {});

Slick.version = '0.9dev';

// Slick finder

Slick.search = function(context, expression, append){
	return local.search(context, expression, append);
};

Slick.find = function(context, expression){
	return local.search(context, expression, null, true);
};

// Slick containment checker

Slick.contains = function(container, node){
	local.setDocument(container);
	return local.contains(container, node);
};

// Slick attribute getter

Slick.getAttribute = function(node, name){
	return local.getAttribute(node, name);
};

// Slick matcher

Slick.match = function(node, selector){
	if (!(node && selector)) return false;
	if (!selector || selector === node) return true;
	if (typeof selector != 'string') return false;
	local.setDocument(node);
	return local.matchNode(node, selector);
};

// Slick attribute accessor

Slick.defineAttributeGetter = function(name, fn){
	local.attributeGetters[name] = fn;
	return this;
};

Slick.lookupAttributeGetter = function(name){
	return local.attributeGetters[name];
};

// Slick pseudo accessor

Slick.definePseudo = function(name, fn){
	local['pseudo:' + name] = function(node, argument){
		return fn.call(node, argument);
	};
	return this;
};

Slick.lookupPseudo = function(name){
	var pseudo = local['pseudo:' + name];
	if (pseudo) return function(argument){
		return pseudo.call(this, argument);
	};
	return null;
};

// Slick overrides accessor

Slick.override = function(regexp, fn){
	local.override(regexp, fn);
	return this;
};

Slick.isXML = local.isXML;

Slick.uidOf = function(node){
	return local.getUIDHTML(node);
};

if (!this.Slick) this.Slick = Slick;

}).apply(/*<CommonJS>*/(typeof exports != 'undefined') ? exports : /*</CommonJS>*/this);


/*
---

name: Element

description: One of the most important items in MooTools. Contains the dollar function, the dollars function, and an handful of cross-browser, time-saver methods to let you easily work with HTML Elements.

license: MIT-style license.

requires: [Window, Document, Array, String, Function, Number, Slick.Parser, Slick.Finder]

provides: [Element, Elements, $, $$, Iframe, Selectors]

...
*/

var Element = function(tag, props){
	var konstructor = Element.Constructors[tag];
	if (konstructor) return konstructor(props);
	if (typeof tag != 'string') return document.id(tag).set(props);

	if (!props) props = {};

	if (!tag.test(/^[\w-]+$/)){
		var parsed = Slick.parse(tag).expressions[0][0];
		tag = (parsed.tag == '*') ? 'div' : parsed.tag;
		if (parsed.id && props.id == null) props.id = parsed.id;

		var attributes = parsed.attributes;
		if (attributes) for (var i = 0, l = attributes.length; i < l; i++){
			var attr = attributes[i];
			if (attr.value != null && attr.operator == '=' && props[attr.key] == null)
				props[attr.key] = attr.value;
		}

		if (parsed.classList && props['class'] == null) props['class'] = parsed.classList.join(' ');
	}

	return document.newElement(tag, props);
};

if (Browser.Element) Element.prototype = Browser.Element.prototype;

new Type('Element', Element).mirror(function(name){
	if (Array.prototype[name]) return;

	var obj = {};
	obj[name] = function(){
		var results = [], args = arguments, elements = true;
		for (var i = 0, l = this.length; i < l; i++){
			var element = this[i], result = results[i] = element[name].apply(element, args);
			elements = (elements && typeOf(result) == 'element');
		}
		return (elements) ? new Elements(results) : results;
	};

	Elements.implement(obj);
});

if (!Browser.Element){
	Element.parent = Object;

	Element.Prototype = {'$family': Function.from('element').hide()};

	Element.mirror(function(name, method){
		Element.Prototype[name] = method;
	});
}

Element.Constructors = {};



var IFrame = new Type('IFrame', function(){
	var params = Array.link(arguments, {
		properties: Type.isObject,
		iframe: function(obj){
			return (obj != null);
		}
	});

	var props = params.properties || {}, iframe;
	if (params.iframe) iframe = document.id(params.iframe);
	var onload = props.onload || function(){};
	delete props.onload;
	props.id = props.name = [props.id, props.name, iframe ? (iframe.id || iframe.name) : 'IFrame_' + String.uniqueID()].pick();
	iframe = new Element(iframe || 'iframe', props);

	var onLoad = function(){
		onload.call(iframe.contentWindow);
	};
	
	if (window.frames[props.id]) onLoad();
	else iframe.addListener('load', onLoad);
	return iframe;
});

var Elements = this.Elements = function(nodes){
	if (nodes && nodes.length){
		var uniques = {}, node;
		for (var i = 0; node = nodes[i++];){
			var uid = Slick.uidOf(node);
			if (!uniques[uid]){
				uniques[uid] = true;
				this.push(node);
			}
		}
	}
};

Elements.prototype = {length: 0};
Elements.parent = Array;

new Type('Elements', Elements).implement({

	filter: function(filter, bind){
		if (!filter) return this;
		return new Elements(Array.filter(this, (typeOf(filter) == 'string') ? function(item){
			return item.match(filter);
		} : filter, bind));
	}.protect(),

	push: function(){
		var length = this.length;
		for (var i = 0, l = arguments.length; i < l; i++){
			var item = document.id(arguments[i]);
			if (item) this[length++] = item;
		}
		return (this.length = length);
	}.protect(),

	concat: function(){
		var newElements = new Elements(this);
		for (var i = 0, l = arguments.length; i < l; i++){
			var item = arguments[i];
			if (Type.isEnumerable(item)) newElements.append(item);
			else newElements.push(item);
		}
		return newElements;
	}.protect(),

	append: function(collection){
		for (var i = 0, l = collection.length; i < l; i++) this.push(collection[i]);
		return this;
	}.protect(),

	empty: function(){
		while (this.length) delete this[--this.length];
		return this;
	}.protect()

});

(function(){

// FF, IE
var splice = Array.prototype.splice, object = {'0': 0, '1': 1, length: 2};

splice.call(object, 1, 1);
if (object[1] == 1) Elements.implement('splice', function(){
	var length = this.length;
	splice.apply(this, arguments);
	while (length >= this.length) delete this[length--];
	return this;
}.protect());

Elements.implement(Array.prototype);

Array.mirror(Elements);

/*<ltIE8>*/
var createElementAcceptsHTML;
try {
	var x = document.createElement('<input name=x>');
	createElementAcceptsHTML = (x.name == 'x');
} catch(e){}

var escapeQuotes = function(html){
	return ('' + html).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
};
/*</ltIE8>*/

Document.implement({

	newElement: function(tag, props){
		if (props && props.checked != null) props.defaultChecked = props.checked;
		/*<ltIE8>*/// Fix for readonly name and type properties in IE < 8
		if (createElementAcceptsHTML && props){
			tag = '<' + tag;
			if (props.name) tag += ' name="' + escapeQuotes(props.name) + '"';
			if (props.type) tag += ' type="' + escapeQuotes(props.type) + '"';
			tag += '>';
			delete props.name;
			delete props.type;
		}
		/*</ltIE8>*/
		return this.id(this.createElement(tag)).set(props);
	}

});

})();

Document.implement({

	newTextNode: function(text){
		return this.createTextNode(text);
	},

	getDocument: function(){
		return this;
	},

	getWindow: function(){
		return this.window;
	},

	id: (function(){

		var types = {

			string: function(id, nocash, doc){
				id = Slick.find(doc, '#' + id.replace(/(\W)/g, '\\$1'));
				return (id) ? types.element(id, nocash) : null;
			},

			element: function(el, nocash){
				$uid(el);
				if (!nocash && !el.$family && !(/^object|embed$/i).test(el.tagName)){
					Object.append(el, Element.Prototype);
				}
				return el;
			},

			object: function(obj, nocash, doc){
				if (obj.toElement) return types.element(obj.toElement(doc), nocash);
				return null;
			}

		};

		types.textnode = types.whitespace = types.window = types.document = function(zero){
			return zero;
		};

		return function(el, nocash, doc){
			if (el && el.$family && el.uid) return el;
			var type = typeOf(el);
			return (types[type]) ? types[type](el, nocash, doc || document) : null;
		};

	})()

});

if (window.$ == null) Window.implement('$', function(el, nc){
	return document.id(el, nc, this.document);
});

Window.implement({

	getDocument: function(){
		return this.document;
	},

	getWindow: function(){
		return this;
	}

});

[Document, Element].invoke('implement', {

	getElements: function(expression){
		return Slick.search(this, expression, new Elements);
	},

	getElement: function(expression){
		return document.id(Slick.find(this, expression));
	}

});

if (window.$$ == null) Window.implement('$$', function(selector){
	if (arguments.length == 1){
		if (typeof selector == 'string') return Slick.search(this.document, selector, new Elements);
		else if (Type.isEnumerable(selector)) return new Elements(selector);
	}
	return new Elements(arguments);
});

(function(){

var collected = {}, storage = {};
var props = {input: 'checked', option: 'selected', textarea: 'value'};

var get = function(uid){
	return (storage[uid] || (storage[uid] = {}));
};

var clean = function(item){
	if (item.removeEvents) item.removeEvents();
	if (item.clearAttributes) item.clearAttributes();
	var uid = item.uid;
	if (uid != null){
		delete collected[uid];
		delete storage[uid];
	}
	return item;
};

var camels = ['defaultValue', 'accessKey', 'cellPadding', 'cellSpacing', 'colSpan', 'frameBorder', 'maxLength', 'readOnly',
	'rowSpan', 'tabIndex', 'useMap'
];
var bools = ['compact', 'nowrap', 'ismap', 'declare', 'noshade', 'checked', 'disabled', 'readOnly', 'multiple', 'selected',
	'noresize', 'defer'
];
 var attributes = {
	'html': 'innerHTML',
	'class': 'className',
	'for': 'htmlFor',
	'text': (function(){
		var temp = document.createElement('div');
		return (temp.innerText == null) ? 'textContent' : 'innerText';
	})()
};
var readOnly = ['type'];
var expandos = ['value', 'defaultValue'];
var uriAttrs = /^(?:href|src|usemap)$/i;

bools = bools.associate(bools);
camels = camels.associate(camels.map(String.toLowerCase));
readOnly = readOnly.associate(readOnly);

Object.append(attributes, expandos.associate(expandos));

var inserters = {

	before: function(context, element){
		var parent = element.parentNode;
		if (parent) parent.insertBefore(context, element);
	},

	after: function(context, element){
		var parent = element.parentNode;
		if (parent) parent.insertBefore(context, element.nextSibling);
	},

	bottom: function(context, element){
		element.appendChild(context);
	},

	top: function(context, element){
		element.insertBefore(context, element.firstChild);
	}

};

inserters.inside = inserters.bottom;



var injectCombinator = function(expression, combinator){
	if (!expression) return combinator;

	expression = Slick.parse(expression);

	var expressions = expression.expressions;
	for (var i = expressions.length; i--;)
		expressions[i][0].combinator = combinator;

	return expression;
};

Element.implement({

	set: function(prop, value){
		var property = Element.Properties[prop];
		(property && property.set) ? property.set.call(this, value) : this.setProperty(prop, value);
	}.overloadSetter(),

	get: function(prop){
		var property = Element.Properties[prop];
		return (property && property.get) ? property.get.apply(this) : this.getProperty(prop);
	}.overloadGetter(),

	erase: function(prop){
		var property = Element.Properties[prop];
		(property && property.erase) ? property.erase.apply(this) : this.removeProperty(prop);
		return this;
	},

	setProperty: function(attribute, value){
		attribute = camels[attribute] || attribute;
		if (value == null) return this.removeProperty(attribute);
		var key = attributes[attribute];
		(key) ? this[key] = value :
			(bools[attribute]) ? this[attribute] = !!value : this.setAttribute(attribute, '' + value);
		return this;
	},

	setProperties: function(attributes){
		for (var attribute in attributes) this.setProperty(attribute, attributes[attribute]);
		return this;
	},

	getProperty: function(attribute){
		attribute = camels[attribute] || attribute;
		var key = attributes[attribute] || readOnly[attribute];
		return (key) ? this[key] :
			(bools[attribute]) ? !!this[attribute] :
			(uriAttrs.test(attribute) ? this.getAttribute(attribute, 2) :
			(key = this.getAttributeNode(attribute)) ? key.nodeValue : null) || null;
	},

	getProperties: function(){
		var args = Array.from(arguments);
		return args.map(this.getProperty, this).associate(args);
	},

	removeProperty: function(attribute){
		attribute = camels[attribute] || attribute;
		var key = attributes[attribute];
		(key) ? this[key] = '' :
			(bools[attribute]) ? this[attribute] = false : this.removeAttribute(attribute);
		return this;
	},

	removeProperties: function(){
		Array.each(arguments, this.removeProperty, this);
		return this;
	},

	hasClass: function(className){
		return this.className.clean().contains(className, ' ');
	},

	addClass: function(className){
		if (!this.hasClass(className)) this.className = (this.className + ' ' + className).clean();
		return this;
	},

	removeClass: function(className){
		this.className = this.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
		return this;
	},

	toggleClass: function(className, force){
		if (force == null) force = !this.hasClass(className);
		return (force) ? this.addClass(className) : this.removeClass(className);
	},

	adopt: function(){
		var parent = this, fragment, elements = Array.flatten(arguments), length = elements.length;
		if (length > 1) parent = fragment = document.createDocumentFragment();

		for (var i = 0; i < length; i++){
			var element = document.id(elements[i], true);
			if (element) parent.appendChild(element);
		}

		if (fragment) this.appendChild(fragment);

		return this;
	},

	appendText: function(text, where){
		return this.grab(this.getDocument().newTextNode(text), where);
	},

	grab: function(el, where){
		inserters[where || 'bottom'](document.id(el, true), this);
		return this;
	},

	inject: function(el, where){
		inserters[where || 'bottom'](this, document.id(el, true));
		return this;
	},

	replaces: function(el){
		el = document.id(el, true);
		el.parentNode.replaceChild(this, el);
		return this;
	},

	wraps: function(el, where){
		el = document.id(el, true);
		return this.replaces(el).grab(el, where);
	},

	getPrevious: function(expression){
		return document.id(Slick.find(this, injectCombinator(expression, '!~')));
	},

	getAllPrevious: function(expression){
		return Slick.search(this, injectCombinator(expression, '!~'), new Elements);
	},

	getNext: function(expression){
		return document.id(Slick.find(this, injectCombinator(expression, '~')));
	},

	getAllNext: function(expression){
		return Slick.search(this, injectCombinator(expression, '~'), new Elements);
	},

	getFirst: function(expression){
		return document.id(Slick.search(this, injectCombinator(expression, '>'))[0]);
	},

	getLast: function(expression){
		return document.id(Slick.search(this, injectCombinator(expression, '>')).getLast());
	},

	getParent: function(expression){
		return document.id(Slick.find(this, injectCombinator(expression, '!')));
	},

	getParents: function(expression){
		return Slick.search(this, injectCombinator(expression, '!'), new Elements);
	},

	getSiblings: function(expression){
		return Slick.search(this, injectCombinator(expression, '~~'), new Elements);
	},

	getChildren: function(expression){
		return Slick.search(this, injectCombinator(expression, '>'), new Elements);
	},

	getWindow: function(){
		return this.ownerDocument.window;
	},

	getDocument: function(){
		return this.ownerDocument;
	},

	getElementById: function(id){
		return document.id(Slick.find(this, '#' + ('' + id).replace(/(\W)/g, '\\$1')));
	},

	getSelected: function(){
		this.selectedIndex; // Safari 3.2.1
		return new Elements(Array.from(this.options).filter(function(option){
			return option.selected;
		}));
	},

	toQueryString: function(){
		var queryString = [];
		this.getElements('input, select, textarea').each(function(el){
			var type = el.type;
			if (!el.name || el.disabled || type == 'submit' || type == 'reset' || type == 'file' || type == 'image') return;

			var value = (el.get('tag') == 'select') ? el.getSelected().map(function(opt){
				// IE
				return document.id(opt).get('value');
			}) : ((type == 'radio' || type == 'checkbox') && !el.checked) ? null : el.get('value');

			Array.from(value).each(function(val){
				if (typeof val != 'undefined') queryString.push(encodeURIComponent(el.name) + '=' + encodeURIComponent(val));
			});
		});
		return queryString.join('&');
	},

	clone: function(contents, keepid){
		contents = contents !== false;
		var clone = this.cloneNode(contents);
		var clean = function(node, element){
			if (!keepid) node.removeAttribute('id');
			if (Browser.ie){
				node.clearAttributes();
				node.mergeAttributes(element);
				node.removeAttribute('uid');
				if (node.options){
					var no = node.options, eo = element.options;
					for (var j = no.length; j--;) no[j].selected = eo[j].selected;
				}
			}
			var prop = props[element.tagName.toLowerCase()];
			if (prop && element[prop]) node[prop] = element[prop];
		};

		var i;
		if (contents){
			var ce = clone.getElementsByTagName('*'), te = this.getElementsByTagName('*');
			for (i = ce.length; i--;) clean(ce[i], te[i]);
		}

		clean(clone, this);
		if (Browser.ie){
			var ts = this.getElementsByTagName('object'),
				cs = clone.getElementsByTagName('object'),
				tl = ts.length, cl = cs.length;
			for (i = 0; i < tl && i < cl; i++)
				cs[i].outerHTML = ts[i].outerHTML;
		}
		return document.id(clone);
	},

	destroy: function(){
		var children = clean(this).getElementsByTagName('*');
		Array.each(children, clean);
		Element.dispose(this);
		return null;
	},

	empty: function(){
		Array.from(this.childNodes).each(Element.dispose);
		return this;
	},

	dispose: function(){
		return (this.parentNode) ? this.parentNode.removeChild(this) : this;
	},

	match: function(expression){
		return !expression || Slick.match(this, expression);
	}

});

var contains = {contains: function(element){
	return Slick.contains(this, element);
}};

if (!document.contains) Document.implement(contains);
if (!document.createElement('div').contains) Element.implement(contains);



[Element, Window, Document].invoke('implement', {

	addListener: function(type, fn){
		if (type == 'unload'){
			var old = fn, self = this;
			fn = function(){
				self.removeListener('unload', fn);
				old();
			};
		} else {
			collected[this.uid] = this;
		}
		if (this.addEventListener) this.addEventListener(type, fn, false);
		else this.attachEvent('on' + type, fn);
		return this;
	},

	removeListener: function(type, fn){
		if (this.removeEventListener) this.removeEventListener(type, fn, false);
		else this.detachEvent('on' + type, fn);
		return this;
	},

	retrieve: function(property, dflt){
		var storage = get(this.uid), prop = storage[property];
		if (dflt != null && prop == null) prop = storage[property] = dflt;
		return prop != null ? prop : null;
	},

	store: function(property, value){
		var storage = get(this.uid);
		storage[property] = value;
		return this;
	},

	eliminate: function(property){
		var storage = get(this.uid);
		delete storage[property];
		return this;
	}

});

// IE purge
if (window.attachEvent && !window.addEventListener) window.addListener('unload', function(){
	Object.each(collected, clean);
	if (window.CollectGarbage) CollectGarbage();
});

})();

Element.Properties = {};



Element.Properties.style = {

	set: function(style){
		this.style.cssText = style;
	},

	get: function(){
		return this.style.cssText;
	},

	erase: function(){
		this.style.cssText = '';
	}

};

Element.Properties.tag = {

	get: function(){
		return this.tagName.toLowerCase();
	}

};

(function(maxLength){
	if (maxLength != null) Element.Properties.maxlength = Element.Properties.maxLength = {
		get: function(){
			var maxlength = this.getAttribute('maxLength');
			return maxlength == maxLength ? null : maxlength;
		}
	};
})(document.createElement('input').getAttribute('maxLength'));

Element.Properties.html = (function(){

	var tableTest = Function.attempt(function(){
		var table = document.createElement('table');
		table.innerHTML = '<tr><td></td></tr>';
	});

	var wrapper = document.createElement('div');

	var translations = {
		table: [1, '<table>', '</table>'],
		select: [1, '<select>', '</select>'],
		tbody: [2, '<table><tbody>', '</tbody></table>'],
		tr: [3, '<table><tbody><tr>', '</tr></tbody></table>']
	};
	translations.thead = translations.tfoot = translations.tbody;

	var html = {
		set: function(){
			var html = Array.flatten(arguments).join('');
			var wrap = (!tableTest && translations[this.get('tag')]);
			if (wrap){
				var first = wrapper;
				first.innerHTML = wrap[1] + html + wrap[2];
				for (var i = wrap[0]; i--;) first = first.firstChild;
				this.empty().adopt(first.childNodes);
			} else {
				this.innerHTML = html;
			}
		}
	};

	html.erase = html.set;

	return html;
})();


/*
---

name: Element.Style

description: Contains methods for interacting with the styles of Elements in a fashionable way.

license: MIT-style license.

requires: Element

provides: Element.Style

...
*/

(function(){

var html = document.html;

Element.Properties.styles = {set: function(styles){
	this.setStyles(styles);
}};

var hasOpacity = (html.style.opacity != null);
var reAlpha = /alpha\(opacity=([\d.]+)\)/i;

var setOpacity = function(element, opacity){
	if (!element.currentStyle || !element.currentStyle.hasLayout) element.style.zoom = 1;
	if (hasOpacity){
		element.style.opacity = opacity;
	} else {
		opacity = (opacity == 1) ? '' : 'alpha(opacity=' + opacity * 100 + ')';
		var filter = element.style.filter || element.getComputedStyle('filter') || '';
		element.style.filter = filter.test(reAlpha) ? filter.replace(reAlpha, opacity) : filter + opacity;
	}
};

Element.Properties.opacity = {

	set: function(opacity){
		var visibility = this.style.visibility;
		if (opacity == 0 && visibility != 'hidden') this.style.visibility = 'hidden';
		else if (opacity != 0 && visibility != 'visible') this.style.visibility = 'visible';

		setOpacity(this, opacity);
	},

	get: (hasOpacity) ? function(){
		var opacity = this.style.opacity || this.getComputedStyle('opacity');
		return (opacity == '') ? 1 : opacity;
	} : function(){
		var opacity, filter = (this.style.filter || this.getComputedStyle('filter'));
		if (filter) opacity = filter.match(reAlpha);
		return (opacity == null || filter == null) ? 1 : (opacity[1] / 100);
	}

};

var floatName = (html.style.cssFloat == null) ? 'styleFloat' : 'cssFloat';

Element.implement({

	getComputedStyle: function(property){
		if (this.currentStyle) return this.currentStyle[property.camelCase()];
		var defaultView = Element.getDocument(this).defaultView,
			computed = defaultView ? defaultView.getComputedStyle(this, null) : null;
		return (computed) ? computed.getPropertyValue((property == floatName) ? 'float' : property.hyphenate()) : null;
	},

	setOpacity: function(value){
		setOpacity(this, value);
		return this;
	},

	getOpacity: function(){
		return this.get('opacity');
	},

	setStyle: function(property, value){
		switch (property){
			case 'opacity': return this.set('opacity', parseFloat(value));
			case 'float': property = floatName;
		}
		property = property.camelCase();
		if (typeOf(value) != 'string'){
			var map = (Element.Styles[property] || '@').split(' ');
			value = Array.from(value).map(function(val, i){
				if (!map[i]) return '';
				return (typeOf(val) == 'number') ? map[i].replace('@', Math.round(val)) : val;
			}).join(' ');
		} else if (value == String(Number(value))){
			value = Math.round(value);
		}
		this.style[property] = value;
		return this;
	},

	getStyle: function(property){
		switch (property){
			case 'opacity': return this.get('opacity');
			case 'float': property = floatName;
		}
		property = property.camelCase();
		var result = this.style[property];
		if (!result || property == 'zIndex'){
			result = [];
			for (var style in Element.ShortStyles){
				if (property != style) continue;
				for (var s in Element.ShortStyles[style]) result.push(this.getStyle(s));
				return result.join(' ');
			}
			result = this.getComputedStyle(property);
		}
		if (result){
			result = String(result);
			var color = result.match(/rgba?\([\d\s,]+\)/);
			if (color) result = result.replace(color[0], color[0].rgbToHex());
		}
		if (Browser.opera || (Browser.ie && isNaN(parseFloat(result)))){
			if (property.test(/^(height|width)$/)){
				var values = (property == 'width') ? ['left', 'right'] : ['top', 'bottom'], size = 0;
				values.each(function(value){
					size += this.getStyle('border-' + value + '-width').toInt() + this.getStyle('padding-' + value).toInt();
				}, this);
				return this['offset' + property.capitalize()] - size + 'px';
			}
			if (Browser.opera && String(result).indexOf('px') != -1) return result;
			if (property.test(/(border(.+)Width|margin|padding)/)) return '0px';
		}
		return result;
	},

	setStyles: function(styles){
		for (var style in styles) this.setStyle(style, styles[style]);
		return this;
	},

	getStyles: function(){
		var result = {};
		Array.flatten(arguments).each(function(key){
			result[key] = this.getStyle(key);
		}, this);
		return result;
	}

});

Element.Styles = {
	left: '@px', top: '@px', bottom: '@px', right: '@px',
	width: '@px', height: '@px', maxWidth: '@px', maxHeight: '@px', minWidth: '@px', minHeight: '@px',
	backgroundColor: 'rgb(@, @, @)', backgroundPosition: '@px @px', color: 'rgb(@, @, @)',
	fontSize: '@px', letterSpacing: '@px', lineHeight: '@px', clip: 'rect(@px @px @px @px)',
	margin: '@px @px @px @px', padding: '@px @px @px @px', border: '@px @ rgb(@, @, @) @px @ rgb(@, @, @) @px @ rgb(@, @, @)',
	borderWidth: '@px @px @px @px', borderStyle: '@ @ @ @', borderColor: 'rgb(@, @, @) rgb(@, @, @) rgb(@, @, @) rgb(@, @, @)',
	zIndex: '@', 'zoom': '@', fontWeight: '@', textIndent: '@px', opacity: '@'
};



Element.ShortStyles = {margin: {}, padding: {}, border: {}, borderWidth: {}, borderStyle: {}, borderColor: {}};

['Top', 'Right', 'Bottom', 'Left'].each(function(direction){
	var Short = Element.ShortStyles;
	var All = Element.Styles;
	['margin', 'padding'].each(function(style){
		var sd = style + direction;
		Short[style][sd] = All[sd] = '@px';
	});
	var bd = 'border' + direction;
	Short.border[bd] = All[bd] = '@px @ rgb(@, @, @)';
	var bdw = bd + 'Width', bds = bd + 'Style', bdc = bd + 'Color';
	Short[bd] = {};
	Short.borderWidth[bdw] = Short[bd][bdw] = All[bdw] = '@px';
	Short.borderStyle[bds] = Short[bd][bds] = All[bds] = '@';
	Short.borderColor[bdc] = Short[bd][bdc] = All[bdc] = 'rgb(@, @, @)';
});

})();


/*
---

name: Element.Event

description: Contains Element methods for dealing with events. This file also includes mouseenter and mouseleave custom Element Events.

license: MIT-style license.

requires: [Element, Event]

provides: Element.Event

...
*/

(function(){

Element.Properties.events = {set: function(events){
	this.addEvents(events);
}};

[Element, Window, Document].invoke('implement', {

	addEvent: function(type, fn){
		var events = this.retrieve('events', {});
		if (!events[type]) events[type] = {keys: [], values: []};
		if (events[type].keys.contains(fn)) return this;
		events[type].keys.push(fn);
		var realType = type,
			custom = Element.Events[type],
			condition = fn,
			self = this;
		if (custom){
			if (custom.onAdd) custom.onAdd.call(this, fn);
			if (custom.condition){
				condition = function(event){
					if (custom.condition.call(this, event)) return fn.call(this, event);
					return true;
				};
			}
			realType = custom.base || realType;
		}
		var defn = function(){
			return fn.call(self);
		};
		var nativeEvent = Element.NativeEvents[realType];
		if (nativeEvent){
			if (nativeEvent == 2){
				defn = function(event){
					event = new Event(event, self.getWindow());
					if (condition.call(self, event) === false) event.stop();
				};
			}
			this.addListener(realType, defn);
		}
		events[type].values.push(defn);
		return this;
	},

	removeEvent: function(type, fn){
		var events = this.retrieve('events');
		if (!events || !events[type]) return this;
		var list = events[type];
		var index = list.keys.indexOf(fn);
		if (index == -1) return this;
		var value = list.values[index];
		delete list.keys[index];
		delete list.values[index];
		var custom = Element.Events[type];
		if (custom){
			if (custom.onRemove) custom.onRemove.call(this, fn);
			type = custom.base || type;
		}
		return (Element.NativeEvents[type]) ? this.removeListener(type, value) : this;
	},

	addEvents: function(events){
		for (var event in events) this.addEvent(event, events[event]);
		return this;
	},

	removeEvents: function(events){
		var type;
		if (typeOf(events) == 'object'){
			for (type in events) this.removeEvent(type, events[type]);
			return this;
		}
		var attached = this.retrieve('events');
		if (!attached) return this;
		if (!events){
			for (type in attached) this.removeEvents(type);
			this.eliminate('events');
		} else if (attached[events]){
			attached[events].keys.each(function(fn){
				this.removeEvent(events, fn);
			}, this);
			delete attached[events];
		}
		return this;
	},

	fireEvent: function(type, args, delay){
		var events = this.retrieve('events');
		if (!events || !events[type]) return this;
		args = Array.from(args);

		events[type].keys.each(function(fn){
			if (delay) fn.delay(delay, this, args);
			else fn.apply(this, args);
		}, this);
		return this;
	},

	cloneEvents: function(from, type){
		from = document.id(from);
		var events = from.retrieve('events');
		if (!events) return this;
		if (!type){
			for (var eventType in events) this.cloneEvents(from, eventType);
		} else if (events[type]){
			events[type].keys.each(function(fn){
				this.addEvent(type, fn);
			}, this);
		}
		return this;
	}

});

// IE9
try {
	if (typeof HTMLElement != 'undefined')
		HTMLElement.prototype.fireEvent = Element.prototype.fireEvent;
} catch(e){}

Element.NativeEvents = {
	click: 2, dblclick: 2, mouseup: 2, mousedown: 2, contextmenu: 2, //mouse buttons
	mousewheel: 2, DOMMouseScroll: 2, //mouse wheel
	mouseover: 2, mouseout: 2, mousemove: 2, selectstart: 2, selectend: 2, //mouse movement
	keydown: 2, keypress: 2, keyup: 2, //keyboard
	orientationchange: 2, // mobile
	touchstart: 2, touchmove: 2, touchend: 2, touchcancel: 2, // touch
	gesturestart: 2, gesturechange: 2, gestureend: 2, // gesture
	focus: 2, blur: 2, change: 2, reset: 2, select: 2, submit: 2, //form elements
	load: 2, unload: 1, beforeunload: 2, resize: 1, move: 1, DOMContentLoaded: 1, readystatechange: 1, //window
	error: 1, abort: 1, scroll: 1 //misc
};

var check = function(event){
	var related = event.relatedTarget;
	if (related == null) return true;
	if (!related) return false;
	return (related != this && related.prefix != 'xul' && typeOf(this) != 'document' && !this.contains(related));
};

Element.Events = {

	mouseenter: {
		base: 'mouseover',
		condition: check
	},

	mouseleave: {
		base: 'mouseout',
		condition: check
	},

	mousewheel: {
		base: (Browser.firefox) ? 'DOMMouseScroll' : 'mousewheel'
	}

};



})();


/*
---

name: Element.Dimensions

description: Contains methods to work with size, scroll, or positioning of Elements and the window object.

license: MIT-style license.

credits:
  - Element positioning based on the [qooxdoo](http://qooxdoo.org/) code and smart browser fixes, [LGPL License](http://www.gnu.org/licenses/lgpl.html).
  - Viewport dimensions based on [YUI](http://developer.yahoo.com/yui/) code, [BSD License](http://developer.yahoo.com/yui/license.html).

requires: [Element, Element.Style]

provides: [Element.Dimensions]

...
*/

(function(){

Element.implement({

	scrollTo: function(x, y){
		if (isBody(this)){
			this.getWindow().scrollTo(x, y);
		} else {
			this.scrollLeft = x;
			this.scrollTop = y;
		}
		return this;
	},

	getSize: function(){
		if (isBody(this)) return this.getWindow().getSize();
		return {x: this.offsetWidth, y: this.offsetHeight};
	},

	getScrollSize: function(){
		if (isBody(this)) return this.getWindow().getScrollSize();
		return {x: this.scrollWidth, y: this.scrollHeight};
	},

	getScroll: function(){
		if (isBody(this)) return this.getWindow().getScroll();
		return {x: this.scrollLeft, y: this.scrollTop};
	},

	getScrolls: function(){
		var element = this.parentNode, position = {x: 0, y: 0};
		while (element && !isBody(element)){
			position.x += element.scrollLeft;
			position.y += element.scrollTop;
			element = element.parentNode;
		}
		return position;
	},

	getOffsetParent: function(){
		var element = this;
		if (isBody(element)) return null;
		if (!Browser.ie) return element.offsetParent;
		while ((element = element.parentNode)){
			if (styleString(element, 'position') != 'static' || isBody(element)) return element;
		}
		return null;
	},

	getOffsets: function(){
		if (this.getBoundingClientRect && !Browser.Platform.ios){
			var bound = this.getBoundingClientRect(),
				html = document.id(this.getDocument().documentElement),
				htmlScroll = html.getScroll(),
				elemScrolls = this.getScrolls(),
				isFixed = (styleString(this, 'position') == 'fixed');

			return {
				x: bound.left.toInt() + elemScrolls.x + ((isFixed) ? 0 : htmlScroll.x) - html.clientLeft,
				y: bound.top.toInt()  + elemScrolls.y + ((isFixed) ? 0 : htmlScroll.y) - html.clientTop
			};
		}

		var element = this, position = {x: 0, y: 0};
		if (isBody(this)) return position;

		while (element && !isBody(element)){
			position.x += element.offsetLeft;
			position.y += element.offsetTop;

			if (Browser.firefox){
				if (!borderBox(element)){
					position.x += leftBorder(element);
					position.y += topBorder(element);
				}
				var parent = element.parentNode;
				if (parent && styleString(parent, 'overflow') != 'visible'){
					position.x += leftBorder(parent);
					position.y += topBorder(parent);
				}
			} else if (element != this && Browser.safari){
				position.x += leftBorder(element);
				position.y += topBorder(element);
			}

			element = element.offsetParent;
		}
		if (Browser.firefox && !borderBox(this)){
			position.x -= leftBorder(this);
			position.y -= topBorder(this);
		}
		return position;
	},

	getPosition: function(relative){
		if (isBody(this)) return {x: 0, y: 0};
		var offset = this.getOffsets(),
			scroll = this.getScrolls();
		var position = {
			x: offset.x - scroll.x,
			y: offset.y - scroll.y
		};
		
		if (relative && (relative = document.id(relative))){
			var relativePosition = relative.getPosition();
			return {x: position.x - relativePosition.x - leftBorder(relative), y: position.y - relativePosition.y - topBorder(relative)};
		}
		return position;
	},

	getCoordinates: function(element){
		if (isBody(this)) return this.getWindow().getCoordinates();
		var position = this.getPosition(element),
			size = this.getSize();
		var obj = {
			left: position.x,
			top: position.y,
			width: size.x,
			height: size.y
		};
		obj.right = obj.left + obj.width;
		obj.bottom = obj.top + obj.height;
		return obj;
	},

	computePosition: function(obj){
		return {
			left: obj.x - styleNumber(this, 'margin-left'),
			top: obj.y - styleNumber(this, 'margin-top')
		};
	},

	setPosition: function(obj){
		return this.setStyles(this.computePosition(obj));
	}

});


[Document, Window].invoke('implement', {

	getSize: function(){
		var doc = getCompatElement(this);
		return {x: doc.clientWidth, y: doc.clientHeight};
	},

	getScroll: function(){
		var win = this.getWindow(), doc = getCompatElement(this);
		return {x: win.pageXOffset || doc.scrollLeft, y: win.pageYOffset || doc.scrollTop};
	},

	getScrollSize: function(){
		var doc = getCompatElement(this),
			min = this.getSize(),
			body = this.getDocument().body;

		return {x: Math.max(doc.scrollWidth, body.scrollWidth, min.x), y: Math.max(doc.scrollHeight, body.scrollHeight, min.y)};
	},

	getPosition: function(){
		return {x: 0, y: 0};
	},

	getCoordinates: function(){
		var size = this.getSize();
		return {top: 0, left: 0, bottom: size.y, right: size.x, height: size.y, width: size.x};
	}

});

// private methods

var styleString = Element.getComputedStyle;

function styleNumber(element, style){
	return styleString(element, style).toInt() || 0;
};

function borderBox(element){
	return styleString(element, '-moz-box-sizing') == 'border-box';
};

function topBorder(element){
	return styleNumber(element, 'border-top-width');
};

function leftBorder(element){
	return styleNumber(element, 'border-left-width');
};

function isBody(element){
	return (/^(?:body|html)$/i).test(element.tagName);
};

function getCompatElement(element){
	var doc = element.getDocument();
	return (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
};

})();

//aliases
Element.alias({position: 'setPosition'}); //compatability

[Window, Document, Element].invoke('implement', {

	getHeight: function(){
		return this.getSize().y;
	},

	getWidth: function(){
		return this.getSize().x;
	},

	getScrollTop: function(){
		return this.getScroll().y;
	},

	getScrollLeft: function(){
		return this.getScroll().x;
	},

	getScrollHeight: function(){
		return this.getScrollSize().y;
	},

	getScrollWidth: function(){
		return this.getScrollSize().x;
	},

	getTop: function(){
		return this.getPosition().y;
	},

	getLeft: function(){
		return this.getPosition().x;
	}

});


/*
---

name: Fx

description: Contains the basic animation logic to be extended by all other Fx Classes.

license: MIT-style license.

requires: [Chain, Events, Options]

provides: Fx

...
*/

(function(){

var Fx = this.Fx = new Class({

	Implements: [Chain, Events, Options],

	options: {
		/*
		onStart: nil,
		onCancel: nil,
		onComplete: nil,
		*/
		fps: 50,
		unit: false,
		duration: 500,
		link: 'ignore'
	},

	initialize: function(options){
		this.subject = this.subject || this;
		this.setOptions(options);
	},

	getTransition: function(){
		return function(p){
			return -(Math.cos(Math.PI * p) - 1) / 2;
		};
	},

	step: function(){
		var time = Date.now();
		if (time < this.time + this.options.duration){
			var delta = this.transition((time - this.time) / this.options.duration);
			this.set(this.compute(this.from, this.to, delta));
		} else {
			this.set(this.compute(this.from, this.to, 1));
			this.complete();
		}
	},

	set: function(now){
		return now;
	},

	compute: function(from, to, delta){
		return Fx.compute(from, to, delta);
	},

	check: function(){
		if (!this.timer) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.pass(arguments, this)); return false;
		}
		return false;
	},

	start: function(from, to){
		if (!this.check(from, to)) return this;
		var duration = this.options.duration;
		this.options.duration = Fx.Durations[duration] || duration.toInt();
		this.from = from;
		this.to = to;
		this.time = 0;
		this.transition = this.getTransition();
		this.startTimer();
		this.onStart();
		return this;
	},

	complete: function(){
		if (this.stopTimer()) this.onComplete();
		return this;
	},

	cancel: function(){
		if (this.stopTimer()) this.onCancel();
		return this;
	},

	onStart: function(){
		this.fireEvent('start', this.subject);
	},

	onComplete: function(){
		this.fireEvent('complete', this.subject);
		if (!this.callChain()) this.fireEvent('chainComplete', this.subject);
	},

	onCancel: function(){
		this.fireEvent('cancel', this.subject).clearChain();
	},

	pause: function(){
		this.stopTimer();
		return this;
	},

	resume: function(){
		this.startTimer();
		return this;
	},

	stopTimer: function(){
		if (!this.timer) return false;
		this.time = Date.now() - this.time;
		this.timer = removeInstance(this);
		return true;
	},

	startTimer: function(){
		if (this.timer) return false;
		this.time = Date.now() - this.time;
		this.timer = addInstance(this);
		return true;
	}

});

Fx.compute = function(from, to, delta){
	return (to - from) * delta + from;
};

Fx.Durations = {'short': 250, 'normal': 500, 'long': 1000};

// global timers

var instances = {}, timers = {};

var loop = function(){
	for (var i = this.length; i--;){
		if (this[i]) this[i].step();
	}
};

var addInstance = function(instance){
	var fps = instance.options.fps,
		list = instances[fps] || (instances[fps] = []);
	list.push(instance);
	if (!timers[fps]) timers[fps] = loop.periodical(Math.round(1000 / fps), list);
	return true;
};

var removeInstance = function(instance){
	var fps = instance.options.fps,
		list = instances[fps] || [];
	list.erase(instance);
	if (!list.length && timers[fps]) timers[fps] = clearInterval(timers[fps]);
	return false;
};

})();


/*
---

name: Fx.CSS

description: Contains the CSS animation logic. Used by Fx.Tween, Fx.Morph, Fx.Elements.

license: MIT-style license.

requires: [Fx, Element.Style]

provides: Fx.CSS

...
*/

Fx.CSS = new Class({

	Extends: Fx,

	//prepares the base from/to object

	prepare: function(element, property, values){
		values = Array.from(values);
		if (values[1] == null){
			values[1] = values[0];
			values[0] = element.getStyle(property);
		}
		var parsed = values.map(this.parse);
		return {from: parsed[0], to: parsed[1]};
	},

	//parses a value into an array

	parse: function(value){
		value = Function.from(value)();
		value = (typeof value == 'string') ? value.split(' ') : Array.from(value);
		return value.map(function(val){
			val = String(val);
			var found = false;
			Object.each(Fx.CSS.Parsers, function(parser, key){
				if (found) return;
				var parsed = parser.parse(val);
				if (parsed || parsed === 0) found = {value: parsed, parser: parser};
			});
			found = found || {value: val, parser: Fx.CSS.Parsers.String};
			return found;
		});
	},

	//computes by a from and to prepared objects, using their parsers.

	compute: function(from, to, delta){
		var computed = [];
		(Math.min(from.length, to.length)).times(function(i){
			computed.push({value: from[i].parser.compute(from[i].value, to[i].value, delta), parser: from[i].parser});
		});
		computed.$family = Function.from('fx:css:value');
		return computed;
	},

	//serves the value as settable

	serve: function(value, unit){
		if (typeOf(value) != 'fx:css:value') value = this.parse(value);
		var returned = [];
		value.each(function(bit){
			returned = returned.concat(bit.parser.serve(bit.value, unit));
		});
		return returned;
	},

	//renders the change to an element

	render: function(element, property, value, unit){
		element.setStyle(property, this.serve(value, unit));
	},

	//searches inside the page css to find the values for a selector

	search: function(selector){
		if (Fx.CSS.Cache[selector]) return Fx.CSS.Cache[selector];
		var to = {};
		Array.each(document.styleSheets, function(sheet, j){
			var href = sheet.href;
			if (href && href.contains('://') && !href.contains(document.domain)) return;
			var rules = sheet.rules || sheet.cssRules;
			Array.each(rules, function(rule, i){
				if (!rule.style) return;
				var selectorText = (rule.selectorText) ? rule.selectorText.replace(/^\w+/, function(m){
					return m.toLowerCase();
				}) : null;
				if (!selectorText || !selectorText.test('^' + selector + '$')) return;
				Element.Styles.each(function(value, style){
					if (!rule.style[style] || Element.ShortStyles[style]) return;
					value = String(rule.style[style]);
					to[style] = (value.test(/^rgb/)) ? value.rgbToHex() : value;
				});
			});
		});
		return Fx.CSS.Cache[selector] = to;
	}

});

Fx.CSS.Cache = {};

Fx.CSS.Parsers = {

	Color: {
		parse: function(value){
			if (value.match(/^#[0-9a-f]{3,6}$/i)) return value.hexToRgb(true);
			return ((value = value.match(/(\d+),\s*(\d+),\s*(\d+)/))) ? [value[1], value[2], value[3]] : false;
		},
		compute: function(from, to, delta){
			return from.map(function(value, i){
				return Math.round(Fx.compute(from[i], to[i], delta));
			});
		},
		serve: function(value){
			return value.map(Number);
		}
	},

	Number: {
		parse: parseFloat,
		compute: Fx.compute,
		serve: function(value, unit){
			return (unit) ? value + unit : value;
		}
	},

	String: {
		parse: Function.from(false),
		compute: function(zero, one){
			return one;
		},
		serve: function(zero){
			return zero;
		}
	}

};




/*
---

name: Fx.Tween

description: Formerly Fx.Style, effect to transition any CSS property for an element.

license: MIT-style license.

requires: Fx.CSS

provides: [Fx.Tween, Element.fade, Element.highlight]

...
*/

Fx.Tween = new Class({

	Extends: Fx.CSS,

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
	},

	set: function(property, now){
		if (arguments.length == 1){
			now = property;
			property = this.property || this.options.property;
		}
		this.render(this.element, property, now, this.options.unit);
		return this;
	},

	start: function(property, from, to){
		if (!this.check(property, from, to)) return this;
		var args = Array.flatten(arguments);
		this.property = this.options.property || args.shift();
		var parsed = this.prepare(this.element, this.property, args);
		return this.parent(parsed.from, parsed.to);
	}

});

Element.Properties.tween = {

	set: function(options){
		this.get('tween').cancel().setOptions(options);
		return this;
	},

	get: function(){
		var tween = this.retrieve('tween');
		if (!tween){
			tween = new Fx.Tween(this, {link: 'cancel'});
			this.store('tween', tween);
		}
		return tween;
	}

};

Element.implement({

	tween: function(property, from, to){
		this.get('tween').start(arguments);
		return this;
	},

	fade: function(how){
		var fade = this.get('tween'), o = 'opacity', toggle;
		how = [how, 'toggle'].pick();
		switch (how){
			case 'in': fade.start(o, 1); break;
			case 'out': fade.start(o, 0); break;
			case 'show': fade.set(o, 1); break;
			case 'hide': fade.set(o, 0); break;
			case 'toggle':
				var flag = this.retrieve('fade:flag', this.get('opacity') == 1);
				fade.start(o, (flag) ? 0 : 1);
				this.store('fade:flag', !flag);
				toggle = true;
			break;
			default: fade.start(o, arguments);
		}
		if (!toggle) this.eliminate('fade:flag');
		return this;
	},

	highlight: function(start, end){
		if (!end){
			end = this.retrieve('highlight:original', this.getStyle('background-color'));
			end = (end == 'transparent') ? '#fff' : end;
		}
		var tween = this.get('tween');
		tween.start('background-color', start || '#ffff88', end).chain(function(){
			this.setStyle('background-color', this.retrieve('highlight:original'));
			tween.callChain();
		}.bind(this));
		return this;
	}

});


/*
---

name: Fx.Morph

description: Formerly Fx.Styles, effect to transition any number of CSS properties for an element using an object of rules, or CSS based selector rules.

license: MIT-style license.

requires: Fx.CSS

provides: Fx.Morph

...
*/

Fx.Morph = new Class({

	Extends: Fx.CSS,

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
	},

	set: function(now){
		if (typeof now == 'string') now = this.search(now);
		for (var p in now) this.render(this.element, p, now[p], this.options.unit);
		return this;
	},

	compute: function(from, to, delta){
		var now = {};
		for (var p in from) now[p] = this.parent(from[p], to[p], delta);
		return now;
	},

	start: function(properties){
		if (!this.check(properties)) return this;
		if (typeof properties == 'string') properties = this.search(properties);
		var from = {}, to = {};
		for (var p in properties){
			var parsed = this.prepare(this.element, p, properties[p]);
			from[p] = parsed.from;
			to[p] = parsed.to;
		}
		return this.parent(from, to);
	}

});

Element.Properties.morph = {

	set: function(options){
		this.get('morph').cancel().setOptions(options);
		return this;
	},

	get: function(){
		var morph = this.retrieve('morph');
		if (!morph){
			morph = new Fx.Morph(this, {link: 'cancel'});
			this.store('morph', morph);
		}
		return morph;
	}

};

Element.implement({

	morph: function(props){
		this.get('morph').start(props);
		return this;
	}

});


/*
---

name: Fx.Transitions

description: Contains a set of advanced transitions to be used with any of the Fx Classes.

license: MIT-style license.

credits:
  - Easing Equations by Robert Penner, <http://www.robertpenner.com/easing/>, modified and optimized to be used with MooTools.

requires: Fx

provides: Fx.Transitions

...
*/

Fx.implement({

	getTransition: function(){
		var trans = this.options.transition || Fx.Transitions.Sine.easeInOut;
		if (typeof trans == 'string'){
			var data = trans.split(':');
			trans = Fx.Transitions;
			trans = trans[data[0]] || trans[data[0].capitalize()];
			if (data[1]) trans = trans['ease' + data[1].capitalize() + (data[2] ? data[2].capitalize() : '')];
		}
		return trans;
	}

});

Fx.Transition = function(transition, params){
	params = Array.from(params);
	return Object.append(transition, {
		easeIn: function(pos){
			return transition(pos, params);
		},
		easeOut: function(pos){
			return 1 - transition(1 - pos, params);
		},
		easeInOut: function(pos){
			return (pos <= 0.5) ? transition(2 * pos, params) / 2 : (2 - transition(2 * (1 - pos), params)) / 2;
		}
	});
};

Fx.Transitions = {

	linear: function(zero){
		return zero;
	}

};



Fx.Transitions.extend = function(transitions){
	for (var transition in transitions) Fx.Transitions[transition] = new Fx.Transition(transitions[transition]);
};

Fx.Transitions.extend({

	Pow: function(p, x){
		return Math.pow(p, x && x[0] || 6);
	},

	Expo: function(p){
		return Math.pow(2, 8 * (p - 1));
	},

	Circ: function(p){
		return 1 - Math.sin(Math.acos(p));
	},

	Sine: function(p){
		return 1 - Math.sin((1 - p) * Math.PI / 2);
	},

	Back: function(p, x){
		x = x && x[0] || 1.618;
		return Math.pow(p, 2) * ((x + 1) * p - x);
	},

	Bounce: function(p){
		var value;
		for (var a = 0, b = 1; 1; a += b, b /= 2){
			if (p >= (7 - 4 * a) / 11){
				value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
				break;
			}
		}
		return value;
	},

	Elastic: function(p, x){
		return Math.pow(2, 10 * --p) * Math.cos(20 * p * Math.PI * (x && x[0] || 1) / 3);
	}

});

['Quad', 'Cubic', 'Quart', 'Quint'].each(function(transition, i){
	Fx.Transitions[transition] = new Fx.Transition(function(p){
		return Math.pow(p, [i + 2]);
	});
});


/*
---

name: Request

description: Powerful all purpose Request Class. Uses XMLHTTPRequest.

license: MIT-style license.

requires: [Object, Element, Chain, Events, Options, Browser]

provides: Request

...
*/

(function(){

var progressSupport = ('onprogress' in new Browser.Request);

var Request = this.Request = new Class({

	Implements: [Chain, Events, Options],

	options: {/*
		onRequest: function(){},
		onLoadstart: function(event, xhr){},
		onProgress: function(event, xhr){},
		onComplete: function(){},
		onCancel: function(){},
		onSuccess: function(responseText, responseXML){},
		onFailure: function(xhr){},
		onException: function(headerName, value){},
		onTimeout: function(){},
		user: '',
		password: '',*/
		url: '',
		data: '',
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
			'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
		},
		async: true,
		format: false,
		method: 'post',
		link: 'ignore',
		isSuccess: null,
		emulation: true,
		urlEncoded: true,
		encoding: 'utf-8',
		evalScripts: false,
		evalResponse: false,
		timeout: 0,
		noCache: false
	},

	initialize: function(options){
		this.xhr = new Browser.Request();
		this.setOptions(options);
		this.headers = this.options.headers;
	},

	onStateChange: function(){
		var xhr = this.xhr;
		if (xhr.readyState != 4 || !this.running) return;
		this.running = false;
		this.status = 0;
		Function.attempt(function(){
			var status = xhr.status;
			this.status = (status == 1223) ? 204 : status;
		}.bind(this));
		xhr.onreadystatechange = function(){};
		clearTimeout(this.timer);
		
		this.response = {text: this.xhr.responseText || '', xml: this.xhr.responseXML};
		if (this.options.isSuccess.call(this, this.status))
			this.success(this.response.text, this.response.xml);
		else
			this.failure();
	},

	isSuccess: function(){
		var status = this.status;
		return (status >= 200 && status < 300);
	},

	isRunning: function(){
		return !!this.running;
	},

	processScripts: function(text){
		if (this.options.evalResponse || (/(ecma|java)script/).test(this.getHeader('Content-type'))) return Browser.exec(text);
		return text.stripScripts(this.options.evalScripts);
	},

	success: function(text, xml){
		this.onSuccess(this.processScripts(text), xml);
	},

	onSuccess: function(){
		this.fireEvent('complete', arguments).fireEvent('success', arguments).callChain();
	},

	failure: function(){
		this.onFailure();
	},

	onFailure: function(){
		this.fireEvent('complete').fireEvent('failure', this.xhr);
	},
	
	loadstart: function(event){
		this.fireEvent('loadstart', [event, this.xhr]);
	},
	
	progress: function(event){
		this.fireEvent('progress', [event, this.xhr]);
	},
	
	timeout: function(){
		this.fireEvent('timeout', this.xhr);
	},

	setHeader: function(name, value){
		this.headers[name] = value;
		return this;
	},

	getHeader: function(name){
		return Function.attempt(function(){
			return this.xhr.getResponseHeader(name);
		}.bind(this));
	},

	check: function(){
		if (!this.running) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.pass(arguments, this)); return false;
		}
		return false;
	},
	
	send: function(options){
		if (!this.check(options)) return this;

		this.options.isSuccess = this.options.isSuccess || this.isSuccess;
		this.running = true;

		var type = typeOf(options);
		if (type == 'string' || type == 'element') options = {data: options};

		var old = this.options;
		options = Object.append({data: old.data, url: old.url, method: old.method}, options);
		var data = options.data, url = String(options.url), method = options.method.toLowerCase();

		switch (typeOf(data)){
			case 'element': data = document.id(data).toQueryString(); break;
			case 'object': case 'hash': data = Object.toQueryString(data);
		}

		if (this.options.format){
			var format = 'format=' + this.options.format;
			data = (data) ? format + '&' + data : format;
		}

		if (this.options.emulation && !['get', 'post'].contains(method)){
			var _method = '_method=' + method;
			data = (data) ? _method + '&' + data : _method;
			method = 'post';
		}

		if (this.options.urlEncoded && ['post', 'put'].contains(method)){
			var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
			this.headers['Content-type'] = 'application/x-www-form-urlencoded' + encoding;
		}

		if (!url) url = document.location.pathname;
		
		var trimPosition = url.lastIndexOf('/');
		if (trimPosition > -1 && (trimPosition = url.indexOf('#')) > -1) url = url.substr(0, trimPosition);

		if (this.options.noCache)
			url += (url.contains('?') ? '&' : '?') + String.uniqueID();

		if (data && method == 'get'){
			url += (url.contains('?') ? '&' : '?') + data;
			data = null;
		}

		var xhr = this.xhr;
		if (progressSupport){
			xhr.onloadstart = this.loadstart.bind(this);
			xhr.onprogress = this.progress.bind(this);
		}

		xhr.open(method.toUpperCase(), url, this.options.async, this.options.user, this.options.password);
		if (this.options.user && 'withCredentials' in xhr) xhr.withCredentials = true;
		
		xhr.onreadystatechange = this.onStateChange.bind(this);

		Object.each(this.headers, function(value, key){
			try {
				xhr.setRequestHeader(key, value);
			} catch (e){
				this.fireEvent('exception', [key, value]);
			}
		}, this);

		this.fireEvent('request');
		xhr.send(data);
		if (!this.options.async) this.onStateChange();
		if (this.options.timeout) this.timer = this.timeout.delay(this.options.timeout, this);
		return this;
	},

	cancel: function(){
		if (!this.running) return this;
		this.running = false;
		var xhr = this.xhr;
		xhr.abort();
		clearTimeout(this.timer);
		xhr.onreadystatechange = xhr.onprogress = xhr.onloadstart = function(){};
		this.xhr = new Browser.Request();
		this.fireEvent('cancel');
		return this;
	}

});

var methods = {};
['get', 'post', 'put', 'delete', 'GET', 'POST', 'PUT', 'DELETE'].each(function(method){
	methods[method] = function(data){
		return this.send({
			data: data,
			method: method
		});
	};
});

Request.implement(methods);

Element.Properties.send = {

	set: function(options){
		var send = this.get('send').cancel();
		send.setOptions(options);
		return this;
	},

	get: function(){
		var send = this.retrieve('send');
		if (!send){
			send = new Request({
				data: this, link: 'cancel', method: this.get('method') || 'post', url: this.get('action')
			});
			this.store('send', send);
		}
		return send;
	}

};

Element.implement({

	send: function(url){
		var sender = this.get('send');
		sender.send({data: this, url: url || sender.options.url});
		return this;
	}

});

})();

/*
---

name: Request.HTML

description: Extends the basic Request Class with additional methods for interacting with HTML responses.

license: MIT-style license.

requires: [Element, Request]

provides: Request.HTML

...
*/

Request.HTML = new Class({

	Extends: Request,

	options: {
		update: false,
		append: false,
		evalScripts: true,
		filter: false,
		headers: {
			Accept: 'text/html, application/xml, text/xml, */*'
		}
	},

	success: function(text){
		var options = this.options, response = this.response;

		response.html = text.stripScripts(function(script){
			response.javascript = script;
		});

		var match = response.html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
		if (match) response.html = match[1];
		var temp = new Element('div').set('html', response.html);

		response.tree = temp.childNodes;
		response.elements = temp.getElements('*');

		if (options.filter) response.tree = response.elements.filter(options.filter);
		if (options.update) document.id(options.update).empty().set('html', response.html);
		else if (options.append) document.id(options.append).adopt(temp.getChildren());
		if (options.evalScripts) Browser.exec(response.javascript);

		this.onSuccess(response.tree, response.elements, response.html, response.javascript);
	}

});

Element.Properties.load = {

	set: function(options){
		var load = this.get('load').cancel();
		load.setOptions(options);
		return this;
	},

	get: function(){
		var load = this.retrieve('load');
		if (!load){
			load = new Request.HTML({data: this, link: 'cancel', update: this, method: 'get'});
			this.store('load', load);
		}
		return load;
	}

};

Element.implement({

	load: function(){
		this.get('load').send(Array.link(arguments, {data: Type.isObject, url: Type.isString}));
		return this;
	}

});


/*
---

name: JSON

description: JSON encoder and decoder.

license: MIT-style license.

See Also: <http://www.json.org/>

requires: [Array, String, Number, Function]

provides: JSON

...
*/

if (!this.JSON) this.JSON = {};



Object.append(JSON, {

	$specialChars: {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'},

	$replaceChars: function(chr){
		return JSON.$specialChars[chr] || '\\u00' + Math.floor(chr.charCodeAt() / 16).toString(16) + (chr.charCodeAt() % 16).toString(16);
	},

	encode: function(obj){
		switch (typeOf(obj)){
			case 'string':
				return '"' + obj.replace(/[\x00-\x1f\\"]/g, JSON.$replaceChars) + '"';
			case 'array':
				return '[' + String(obj.map(JSON.encode).clean()) + ']';
			case 'object': case 'hash':
				var string = [];
				Object.each(obj, function(value, key){
					var json = JSON.encode(value);
					if (json) string.push(JSON.encode(key) + ':' + json);
				});
				return '{' + string + '}';
			case 'number': case 'boolean': return String(obj);
			case 'null': return 'null';
		}
		return null;
	},

	decode: function(string, secure){
		if (typeOf(string) != 'string' || !string.length) return null;
		if (secure && !(/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(string.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, ''))) return null;
		return eval('(' + string + ')');
	}

});


/*
---

name: Request.JSON

description: Extends the basic Request Class with additional methods for sending and receiving JSON data.

license: MIT-style license.

requires: [Request, JSON]

provides: Request.JSON

...
*/

Request.JSON = new Class({

	Extends: Request,

	options: {
		secure: true
	},

	initialize: function(options){
		this.parent(options);
		Object.append(this.headers, {
			'Accept': 'application/json',
			'X-Request': 'JSON'
		});
	},

	success: function(text){
		var secure = this.options.secure;
		var json = this.response.json = Function.attempt(function(){
			return JSON.decode(text, secure);
		});

		if (json == null) this.onFailure();
		else this.onSuccess(json, text);
	}

});


/*
---

name: Cookie

description: Class for creating, reading, and deleting browser Cookies.

license: MIT-style license.

credits:
  - Based on the functions by Peter-Paul Koch (http://quirksmode.org).

requires: Options

provides: Cookie

...
*/

var Cookie = new Class({

	Implements: Options,

	options: {
		path: '/',
		domain: false,
		duration: false,
		secure: false,
		document: document,
		encode: true
	},

	initialize: function(key, options){
		this.key = key;
		this.setOptions(options);
	},

	write: function(value){
		if (this.options.encode) value = encodeURIComponent(value);
		if (this.options.domain) value += '; domain=' + this.options.domain;
		if (this.options.path) value += '; path=' + this.options.path;
		if (this.options.duration){
			var date = new Date();
			date.setTime(date.getTime() + this.options.duration * 24 * 60 * 60 * 1000);
			value += '; expires=' + date.toGMTString();
		}
		if (this.options.secure) value += '; secure';
		this.options.document.cookie = this.key + '=' + value;
		return this;
	},

	read: function(){
		var value = this.options.document.cookie.match('(?:^|;)\\s*' + this.key.escapeRegExp() + '=([^;]*)');
		return (value) ? decodeURIComponent(value[1]) : null;
	},

	dispose: function(){
		new Cookie(this.key, Object.merge({}, this.options, {duration: -1})).write('');
		return this;
	}

});

Cookie.write = function(key, value, options){
	return new Cookie(key, options).write(value);
};

Cookie.read = function(key){
	return new Cookie(key).read();
};

Cookie.dispose = function(key, options){
	return new Cookie(key, options).dispose();
};


/*
---

name: DOMReady

description: Contains the custom event domready.

license: MIT-style license.

requires: [Browser, Element, Element.Event]

provides: [DOMReady, DomReady]

...
*/

(function(window, document){

var ready,
	loaded,
	checks = [],
	shouldPoll,
	timer,
	isFramed = true;

// Thanks to Rich Dougherty <http://www.richdougherty.com/>
try {
	isFramed = window.frameElement != null;
} catch(e){}

var domready = function(){
	clearTimeout(timer);
	if (ready) return;
	Browser.loaded = ready = true;
	document.removeListener('DOMContentLoaded', domready).removeListener('readystatechange', check);
	
	document.fireEvent('domready');
	window.fireEvent('domready');
};

var check = function(){
	for (var i = checks.length; i--;) if (checks[i]()){
		domready();
		return true;
	}

	return false;
};

var poll = function(){
	clearTimeout(timer);
	if (!check()) timer = setTimeout(poll, 10);
};

document.addListener('DOMContentLoaded', domready);

// doScroll technique by Diego Perini http://javascript.nwbox.com/IEContentLoaded/
var testElement = document.createElement('div');
if (testElement.doScroll && !isFramed){
	checks.push(function(){
		try {
			testElement.doScroll();
			return true;
		} catch (e){}

		return false;
	});
	shouldPoll = true;
}

if (document.readyState) checks.push(function(){
	var state = document.readyState;
	return (state == 'loaded' || state == 'complete');
});

if ('onreadystatechange' in document) document.addListener('readystatechange', check);
else shouldPoll = true;

if (shouldPoll) poll();

Element.Events.domready = {
	onAdd: function(fn){
		if (ready) fn.call(this);
	}
};

// Make sure that domready fires before load
Element.Events.load = {
	base: 'load',
	onAdd: function(fn){
		if (loaded && this == window) fn.call(this);
	},
	condition: function(){
		if (this == window){
			domready();
			delete Element.Events.load;
		}
		
		return true;
	}
};

// This is based on the custom load event
window.addEvent('load', function(){
	loaded = true;
});

})(window, document);


/*
---

name: Swiff

description: Wrapper for embedding SWF movies. Supports External Interface Communication.

license: MIT-style license.

credits:
  - Flash detection & Internet Explorer + Flash Player 9 fix inspired by SWFObject.

requires: [Options, Object]

provides: Swiff

...
*/

/*(function(){

var id = 0;

var Swiff = this.Swiff = new Class({

	Implements: Options,

	options: {
		id: null,
		height: 1,
		width: 1,
		container: null,
		properties: {},
		params: {
			quality: 'high',
			allowScriptAccess: 'always',
			wMode: 'window',
			swLiveConnect: true
		},
		callBacks: {},
		vars: {}
	},

	toElement: function(){
		return this.object;
	},

	initialize: function(path, options){
		this.instance = 'Swiff_' + id++;

		this.setOptions(options);
		options = this.options;
		var id = this.id = options.id || this.instance;
		var container = document.id(options.container);

		Swiff.CallBacks[this.instance] = {};
		var params = options.params, vars = options.vars, callBacks = options.callBacks;
		var properties = Object.append({height: options.height, width: options.width}, options.properties);

		var self = this;

		for (var callBack in callBacks){
			Swiff.CallBacks[this.instance][callBack] = (function(option){
				return function(){
					return option.apply(self.object, arguments);
				};
			})(callBacks[callBack]);
			vars[callBack] = 'Swiff.CallBacks.' + this.instance + '.' + callBack;
		}

		params.flashVars = Object.toQueryString(vars);
		if (Browser.ie){
			properties.classid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
			params.movie = path;
		} else {
			properties.type = 'application/x-shockwave-flash';
		}
		properties.data = path;

		var build = '<object id="' + id + '"';
		for (var property in properties) build += ' ' + property + '="' + properties[property] + '"';
		build += '>';
		for (var param in params){
			if (params[param]) build += '<param name="' + param + '" value="' + params[param] + '" />';
		}
		build += '</object>';
		this.object = ((container) ? container.empty() : new Element('div')).set('html', build).firstChild;
	},

	replaces: function(element){
		element = document.id(element, true);
		element.parentNode.replaceChild(this.toElement(), element);
		return this;
	},

	inject: function(element){
		document.id(element, true).appendChild(this.toElement());
		return this;
	},

	remote: function(){
		return Swiff.remote.apply(Swiff, [this.toElement()].extend(arguments));
	}

});

Swiff.CallBacks = {};

Swiff.remote = function(obj, fn){
	var rs = obj.CallFunction('<invoke name="' + fn + '" returntype="javascript">' + __flash__argumentsToXML(arguments, 2) + '</invoke>');
	return eval(rs);
};

})();
*/

(function(){

var Swiff = this.Swiff = new Class({

	Implements: Options,

	options: {
		id: null,
		height: 1,
		width: 1,
		container: null,
		properties: {},
		params: {
			quality: 'high',
			allowScriptAccess: 'always',
			wMode: 'window',
			swLiveConnect: true
		},
		callBacks: {},
		vars: {}
	},

	toElement: function(){
		return this.object;
	},

	initialize: function(path, options){
		this.instance = 'Swiff_' + String.uniqueID();

		this.setOptions(options);
		options = this.options;
		var id = this.id = options.id || this.instance;
		var container = document.id(options.container);

		Swiff.CallBacks[this.instance] = {};

		var params = options.params, vars = options.vars, callBacks = options.callBacks;
		var properties = Object.append({height: options.height, width: options.width}, options.properties);

		var self = this;

		for (var callBack in callBacks){
			Swiff.CallBacks[this.instance][callBack] = (function(option){
				return function(){
					return option.apply(self.object, arguments);
				};
			})(callBacks[callBack]);
			vars[callBack] = 'Swiff.CallBacks.' + this.instance + '.' + callBack;
		}

		params.flashVars = Object.toQueryString(vars);
		if (Browser.ie){
			properties.classid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
			params.movie = path;
		} else {
			properties.type = 'application/x-shockwave-flash';
		}
		properties.data = path;

		var build = '<object id="' + id + '"';
		for (var property in properties) build += ' ' + property + '="' + properties[property] + '"';
		build += '>';
		for (var param in params){
			if (params[param]) build += '<param name="' + param + '" value="' + params[param] + '" />';
		}
		build += '</object>';
		this.object = ((container) ? container.empty() : new Element('div')).set('html', build).firstChild;
	},

	replaces: function(element){
		element = document.id(element, true);
		element.parentNode.replaceChild(this.toElement(), element);
		return this;
	},

	inject: function(element){
		document.id(element, true).appendChild(this.toElement());
		return this;
	},

	remote: function(){
		return Swiff.remote.apply(Swiff, [this.toElement()].append(arguments));
	}

});

Swiff.CallBacks = {};

Swiff.remote = function(obj, fn){
	var rs = obj.CallFunction('<invoke name="' + fn + '" returntype="javascript">' + __flash__argumentsToXML(arguments, 2) + '</invoke>');
	return eval(rs);
};

})();// MooTools: the javascript framework.
// Load this file's selection again by visiting: http://mootools.net/more/b334bd4cedcf4f35146c62544c7c99b5 
// Or build this file again with packager using: packager build More/Form.Validator.Inline More/Fx.Scroll More/Slider
/*
---

script: More.js

name: More

description: MooTools More

license: MIT-style license

authors:
  - Guillermo Rauch
  - Thomas Aylott
  - Scott Kyle
  - Arian Stolwijk
  - Tim Wienk
  - Christoph Pojer
  - Aaron Newton
  - Jacob Thornton
requires:

  - Core/MooTools

provides: [MooTools.More]

...
*/

MooTools.More = {
	'version': '1.3.2.1',
	'build': 'e586bcd2496e9b22acfde32e12f84d49ce09e59d'
};


/*
---

script: Object.Extras.js

name: Object.Extras

description: Extra Object generics, like getFromPath which allows a path notation to child elements.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Object
  - /MooTools.More

provides: [Object.Extras]

...
*/

(function(){

var defined = function(value){
	return value != null;
};

var hasOwnProperty = Object.prototype.hasOwnProperty;

Object.extend({

	getFromPath: function(source, parts){
		if (typeof parts == 'string') parts = parts.split('.');
		for (var i = 0, l = parts.length; i < l; i++){
			if (hasOwnProperty.call(source, parts[i])) source = source[parts[i]];
			else return null;
		}
		return source;
	},

	cleanValues: function(object, method){
		method = method || defined;
		for (var key in object) if (!method(object[key])){
			delete object[key];
		}
		return object;
	},

	erase: function(object, key){
		if (hasOwnProperty.call(object, key)) delete object[key];
		return object;
	},

	run: function(object){
		var args = Array.slice(arguments, 1);
		for (var key in object) if (object[key].apply){
			object[key].apply(object, args);
		}
		return object;
	}

});

})();


/*
---

script: Locale.js  MORE 

name: Locale

description: Provides methods for localization.

license: MIT-style license

authors:
  - Aaron Newton
  - Arian Stolwijk

requires:
  - Core/Events
  - /Object.Extras
  - /MooTools.More

provides: [Locale, Lang]

...
*/

(function(){

var current = null,
	locales = {},
	inherits = {};

var getSet = function(set){
	if (instanceOf(set, Locale.Set)) return set;
	else return locales[set];
};

var Locale = this.Locale = {

	define: function(locale, set, key, value){
		var name;
		if (instanceOf(locale, Locale.Set)){
			name = locale.name;
			if (name) locales[name] = locale;
		} else {
			name = locale;
			if (!locales[name]) locales[name] = new Locale.Set(name);
			locale = locales[name];
		}

		if (set) locale.define(set, key, value);

		

		if (!current) current = locale;

		return locale;
	},

	use: function(locale){
		locale = getSet(locale);

		if (locale){
			current = locale;

			this.fireEvent('change', locale);

			
		}

		return this;
	},

	getCurrent: function(){
		return current;
	},

	get: function(key, args){
		return (current) ? current.get(key, args) : '';
	},

	inherit: function(locale, inherits, set){
		locale = getSet(locale);

		if (locale) locale.inherit(inherits, set);
		return this;
	},

	list: function(){
		return Object.keys(locales);
	}

};

Object.append(Locale, new Events);

Locale.Set = new Class({

	sets: {},

	inherits: {
		locales: [],
		sets: {}
	},

	initialize: function(name){
		this.name = name || '';
	},

	define: function(set, key, value){
		var defineData = this.sets[set];
		if (!defineData) defineData = {};

		if (key){
			if (typeOf(key) == 'object') defineData = Object.merge(defineData, key);
			else defineData[key] = value;
		}
		this.sets[set] = defineData;

		return this;
	},

	get: function(key, args, _base){
		var value = Object.getFromPath(this.sets, key);
		if (value != null){
			var type = typeOf(value);
			if (type == 'function') value = value.apply(null, Array.from(args));
			else if (type == 'object') value = Object.clone(value);
			return value;
		}

		// get value of inherited locales
		var index = key.indexOf('.'),
			set = index < 0 ? key : key.substr(0, index),
			names = (this.inherits.sets[set] || []).combine(this.inherits.locales).include('en-US');
		if (!_base) _base = [];

		for (var i = 0, l = names.length; i < l; i++){
			if (_base.contains(names[i])) continue;
			_base.include(names[i]);

			var locale = locales[names[i]];
			if (!locale) continue;

			value = locale.get(key, args, _base);
			if (value != null) return value;
		}

		return '';
	},

	inherit: function(names, set){
		names = Array.from(names);

		if (set && !this.inherits.sets[set]) this.inherits.sets[set] = [];

		var l = names.length;
		while (l--) (set ? this.inherits.sets[set] : this.inherits.locales).unshift(names[l]);

		return this;
	}

});



})();


/*
---

script: Class.Binds.js

name: Class.Binds

description: Automagically binds specified methods in a class to the instance of the class.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Class
  - /MooTools.More

provides: [Class.Binds]

...
*/

Class.Mutators.Binds = function(binds){
	if (!this.prototype.initialize) this.implement('initialize', function(){});
	return Array.from(binds).concat(this.prototype.Binds || []);
};

Class.Mutators.initialize = function(initialize){
	return function(){
		Array.from(this.Binds).each(function(name){
			var original = this[name];
			if (original) this[name] = original.bind(this);
		}, this);
		return initialize.apply(this, arguments);
	};
};


/*
---

script: Date.js

name: Date

description: Extends the Date native object to include methods useful in managing dates.

license: MIT-style license

authors:
  - Aaron Newton
  - Nicholas Barthelemy - https://svn.nbarthelemy.com/date-js/
  - Harald Kirshner - mail [at] digitarald.de; http://digitarald.de
  - Scott Kyle - scott [at] appden.com; http://appden.com

requires:
  - Core/Array
  - Core/String
  - Core/Number
  - MooTools.More
  - Locale
  - Locale.en-US.Date

provides: [Date]

...
*/

(function(){

var Date = this.Date;

var DateMethods = Date.Methods = {
	ms: 'Milliseconds',
	year: 'FullYear',
	min: 'Minutes',
	mo: 'Month',
	sec: 'Seconds',
	hr: 'Hours'
};

['Date', 'Day', 'FullYear', 'Hours', 'Milliseconds', 'Minutes', 'Month', 'Seconds', 'Time', 'TimezoneOffset',
	'Week', 'Timezone', 'GMTOffset', 'DayOfYear', 'LastMonth', 'LastDayOfMonth', 'UTCDate', 'UTCDay', 'UTCFullYear',
	'AMPM', 'Ordinal', 'UTCHours', 'UTCMilliseconds', 'UTCMinutes', 'UTCMonth', 'UTCSeconds', 'UTCMilliseconds'].each(function(method){
	Date.Methods[method.toLowerCase()] = method;
});

var pad = function(n, digits, string){
	if (digits == 1) return n;
	return n < Math.pow(10, digits - 1) ? (string || '0') + pad(n, digits - 1, string) : n;
};

Date.implement({

	set: function(prop, value){
		prop = prop.toLowerCase();
		var method = DateMethods[prop] && 'set' + DateMethods[prop];
		if (method && this[method]) this[method](value);
		return this;
	}.overloadSetter(),

	get: function(prop){
		prop = prop.toLowerCase();
		var method = DateMethods[prop] && 'get' + DateMethods[prop];
		if (method && this[method]) return this[method]();
		return null;
	}.overloadGetter(),

	clone: function(){
		return new Date(this.get('time'));
	},

	increment: function(interval, times){
		interval = interval || 'day';
		times = times != null ? times : 1;

		switch (interval){
			case 'year':
				return this.increment('month', times * 12);
			case 'month':
				var d = this.get('date');
				this.set('date', 1).set('mo', this.get('mo') + times);
				return this.set('date', d.min(this.get('lastdayofmonth')));
			case 'week':
				return this.increment('day', times * 7);
			case 'day':
				return this.set('date', this.get('date') + times);
		}

		if (!Date.units[interval]) throw new Error(interval + ' is not a supported interval');

		return this.set('time', this.get('time') + times * Date.units[interval]());
	},

	decrement: function(interval, times){
		return this.increment(interval, -1 * (times != null ? times : 1));
	},

	isLeapYear: function(){
		return Date.isLeapYear(this.get('year'));
	},

	clearTime: function(){
		return this.set({hr: 0, min: 0, sec: 0, ms: 0});
	},

	diff: function(date, resolution){
		if (typeOf(date) == 'string') date = Date.parse(date);

		return ((date - this) / Date.units[resolution || 'day'](3, 3)).round(); // non-leap year, 30-day month
	},

	getLastDayOfMonth: function(){
		return Date.daysInMonth(this.get('mo'), this.get('year'));
	},

	getDayOfYear: function(){
		return (Date.UTC(this.get('year'), this.get('mo'), this.get('date') + 1)
			- Date.UTC(this.get('year'), 0, 1)) / Date.units.day();
	},

	setDay: function(day, firstDayOfWeek){
		if (firstDayOfWeek == null){
			firstDayOfWeek = Date.getMsg('firstDayOfWeek');
			if (firstDayOfWeek === '') firstDayOfWeek = 1;
		}

		day = (7 + Date.parseDay(day, true) - firstDayOfWeek) % 7;
		var currentDay = (7 + this.get('day') - firstDayOfWeek) % 7;

		return this.increment('day', day - currentDay);
	},

	getWeek: function(firstDayOfWeek){
		if (firstDayOfWeek == null){
			firstDayOfWeek = Date.getMsg('firstDayOfWeek');
			if (firstDayOfWeek === '') firstDayOfWeek = 1;
		}

		var date = this,
			dayOfWeek = (7 + date.get('day') - firstDayOfWeek) % 7,
			dividend = 0,
			firstDayOfYear;

		if (firstDayOfWeek == 1){
			// ISO-8601, week belongs to year that has the most days of the week (i.e. has the thursday of the week)
			var month = date.get('month'),
				startOfWeek = date.get('date') - dayOfWeek;

			if (month == 11 && startOfWeek > 28) return 1; // Week 1 of next year

			if (month == 0 && startOfWeek < -2){
				// Use a date from last year to determine the week
				date = new Date(date).decrement('day', dayOfWeek);
				dayOfWeek = 0;
			}

			firstDayOfYear = new Date(date.get('year'), 0, 1).get('day') || 7;
			if (firstDayOfYear > 4) dividend = -7; // First week of the year is not week 1
		} else {
			// In other cultures the first week of the year is always week 1 and the last week always 53 or 54.
			// Days in the same week can have a different weeknumber if the week spreads across two years.
			firstDayOfYear = new Date(date.get('year'), 0, 1).get('day');
		}

		dividend += date.get('dayofyear');
		dividend += 6 - dayOfWeek; // Add days so we calculate the current date's week as a full week
		dividend += (7 + firstDayOfYear - firstDayOfWeek) % 7; // Make up for first week of the year not being a full week

		return (dividend / 7);
	},

	getOrdinal: function(day){
		return Date.getMsg('ordinal', day || this.get('date'));
	},

	getTimezone: function(){
		return this.toString()
			.replace(/^.*? ([A-Z]{3}).[0-9]{4}.*$/, '$1')
			.replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, '$1$2$3');
	},

	getGMTOffset: function(){
		var off = this.get('timezoneOffset');
		return ((off > 0) ? '-' : '+') + pad((off.abs() / 60).floor(), 2) + pad(off % 60, 2);
	},

	setAMPM: function(ampm){
		ampm = ampm.toUpperCase();
		var hr = this.get('hr');
		if (hr > 11 && ampm == 'AM') return this.decrement('hour', 12);
		else if (hr < 12 && ampm == 'PM') return this.increment('hour', 12);
		return this;
	},

	getAMPM: function(){
		return (this.get('hr') < 12) ? 'AM' : 'PM';
	},

	parse: function(str){
		this.set('time', Date.parse(str));
		return this;
	},

	isValid: function(date){
		return !isNaN((date || this).valueOf());
	},

	format: function(f){
		if (!this.isValid()) return 'invalid date';
		if (!f) f = '%x %X';

		var formatLower = f.toLowerCase();
		if (formatters[formatLower]) return formatters[formatLower](this); // it's a formatter!
		f = formats[formatLower] || f; // replace short-hand with actual format

		var d = this;
		return f.replace(/%([a-z%])/gi,
			function($0, $1){
				switch ($1){
					case 'a': return Date.getMsg('days_abbr')[d.get('day')];
					case 'A': return Date.getMsg('days')[d.get('day')];
					case 'b': return Date.getMsg('months_abbr')[d.get('month')];
					case 'B': return Date.getMsg('months')[d.get('month')];
					case 'c': return d.format('%a %b %d %H:%M:%S %Y');
					case 'd': return pad(d.get('date'), 2);
					case 'e': return pad(d.get('date'), 2, ' ');
					case 'H': return pad(d.get('hr'), 2);
					case 'I': return pad((d.get('hr') % 12) || 12, 2);
					case 'j': return pad(d.get('dayofyear'), 3);
					case 'k': return pad(d.get('hr'), 2, ' ');
					case 'l': return pad((d.get('hr') % 12) || 12, 2, ' ');
					case 'L': return pad(d.get('ms'), 3);
					case 'm': return pad((d.get('mo') + 1), 2);
					case 'M': return pad(d.get('min'), 2);
					case 'o': return d.get('ordinal');
					case 'p': return Date.getMsg(d.get('ampm'));
					case 's': return Math.round(d / 1000);
					case 'S': return pad(d.get('seconds'), 2);
					case 'T': return d.format('%H:%M:%S');
					case 'U': return pad(d.get('week'), 2);
					case 'w': return d.get('day');
					case 'x': return d.format(Date.getMsg('shortDate'));
					case 'X': return d.format(Date.getMsg('shortTime'));
					case 'y': return d.get('year').toString().substr(2);
					case 'Y': return d.get('year');
					case 'z': return d.get('GMTOffset');
					case 'Z': return d.get('Timezone');
				}
				return $1;
			}
		);
	},

	toISOString: function(){
		return this.format('iso8601');
	}

}).alias({
	toJSON: 'toISOString',
	compare: 'diff',
	strftime: 'format'
});

var formats = {
	db: '%Y-%m-%d %H:%M:%S',
	compact: '%Y%m%dT%H%M%S',
	'short': '%d %b %H:%M',
	'long': '%B %d, %Y %H:%M'
};

// The day and month abbreviations are standardized, so we cannot use simply %a and %b because they will get localized
var rfcDayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	rfcMonthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var formatters = {
	rfc822: function(date){
		return rfcDayAbbr[date.get('day')] + date.format(', %d ') + rfcMonthAbbr[date.get('month')] + date.format(' %Y %H:%M:%S %Z');
	},
	rfc2822: function(date){
		return rfcDayAbbr[date.get('day')] + date.format(', %d ') + rfcMonthAbbr[date.get('month')] + date.format(' %Y %H:%M:%S %z');
	},
	iso8601: function(date){
		return (
			date.getUTCFullYear() + '-' +
			pad(date.getUTCMonth() + 1, 2) + '-' +
			pad(date.getUTCDate(), 2) + 'T' +
			pad(date.getUTCHours(), 2) + ':' +
			pad(date.getUTCMinutes(), 2) + ':' +
			pad(date.getUTCSeconds(), 2) + '.' +
			pad(date.getUTCMilliseconds(), 3) + 'Z'
		);
	}
};


var parsePatterns = [],
	nativeParse = Date.parse;

var parseWord = function(type, word, num){
	var ret = -1,
		translated = Date.getMsg(type + 's');
	switch (typeOf(word)){
		case 'object':
			ret = translated[word.get(type)];
			break;
		case 'number':
			ret = translated[word];
			if (!ret) throw new Error('Invalid ' + type + ' index: ' + word);
			break;
		case 'string':
			var match = translated.filter(function(name){
				return this.test(name);
			}, new RegExp('^' + word, 'i'));
			if (!match.length) throw new Error('Invalid ' + type + ' string');
			if (match.length > 1) throw new Error('Ambiguous ' + type);
			ret = match[0];
	}

	return (num) ? translated.indexOf(ret) : ret;
};

var startCentury = 1900,
	startYear = 70;

Date.extend({

	getMsg: function(key, args){
		return Locale.get('Date.' + key, args);
	},

	units: {
		ms: Function.from(1),
		second: Function.from(1000),
		minute: Function.from(60000),
		hour: Function.from(3600000),
		day: Function.from(86400000),
		week: Function.from(608400000),
		month: function(month, year){
			var d = new Date;
			return Date.daysInMonth(month != null ? month : d.get('mo'), year != null ? year : d.get('year')) * 86400000;
		},
		year: function(year){
			year = year || new Date().get('year');
			return Date.isLeapYear(year) ? 31622400000 : 31536000000;
		}
	},

	daysInMonth: function(month, year){
		return [31, Date.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
	},

	isLeapYear: function(year){
		return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
	},

	parse: function(from){
		var t = typeOf(from);
		if (t == 'number') return new Date(from);
		if (t != 'string') return from;
		from = from.clean();
		if (!from.length) return null;

		var parsed;
		parsePatterns.some(function(pattern){
			var bits = pattern.re.exec(from);
			return (bits) ? (parsed = pattern.handler(bits)) : false;
		});

		if (!(parsed && parsed.isValid())){
			parsed = new Date(nativeParse(from));
			if (!(parsed && parsed.isValid())) parsed = new Date(from.toInt());
		}
		return parsed;
	},

	parseDay: function(day, num){
		return parseWord('day', day, num);
	},

	parseMonth: function(month, num){
		return parseWord('month', month, num);
	},

	parseUTC: function(value){
		var localDate = new Date(value);
		var utcSeconds = Date.UTC(
			localDate.get('year'),
			localDate.get('mo'),
			localDate.get('date'),
			localDate.get('hr'),
			localDate.get('min'),
			localDate.get('sec'),
			localDate.get('ms')
		);
		return new Date(utcSeconds);
	},

	orderIndex: function(unit){
		return Date.getMsg('dateOrder').indexOf(unit) + 1;
	},

	defineFormat: function(name, format){
		formats[name] = format;
		return this;
	},

	defineFormats: function(formats){
		for (var name in formats) Date.defineFormat(name, formats[name]);
		return this;
	},

	defineParser: function(pattern){
		parsePatterns.push((pattern.re && pattern.handler) ? pattern : build(pattern));
		return this;
	},

	defineParsers: function(){
		Array.flatten(arguments).each(Date.defineParser);
		return this;
	},

	define2DigitYearStart: function(year){
		startYear = year % 100;
		startCentury = year - startYear;
		return this;
	}

});

var regexOf = function(type){
	return new RegExp('(?:' + Date.getMsg(type).map(function(name){
		return name.substr(0, 3);
	}).join('|') + ')[a-z]*');
};

var replacers = function(key){
	switch (key){
		case 'T':
			return '%H:%M:%S';
		case 'x': // iso8601 covers yyyy-mm-dd, so just check if month is first
			return ((Date.orderIndex('month') == 1) ? '%m[-./]%d' : '%d[-./]%m') + '([-./]%y)?';
		case 'X':
			return '%H([.:]%M)?([.:]%S([.:]%s)?)? ?%p? ?%z?';
	}
	return null;
};

var keys = {
	d: /[0-2]?[0-9]|3[01]/,
	H: /[01]?[0-9]|2[0-3]/,
	I: /0?[1-9]|1[0-2]/,
	M: /[0-5]?\d/,
	s: /\d+/,
	o: /[a-z]*/,
	p: /[ap]\.?m\.?/,
	y: /\d{2}|\d{4}/,
	Y: /\d{4}/,
	z: /Z|[+-]\d{2}(?::?\d{2})?/
};

keys.m = keys.I;
keys.S = keys.M;

var currentLanguage;

var recompile = function(language){
	currentLanguage = language;

	keys.a = keys.A = regexOf('days');
	keys.b = keys.B = regexOf('months');

	parsePatterns.each(function(pattern, i){
		if (pattern.format) parsePatterns[i] = build(pattern.format);
	});
};

var build = function(format){
	if (!currentLanguage) return {format: format};

	var parsed = [];
	var re = (format.source || format) // allow format to be regex
	 .replace(/%([a-z])/gi,
		function($0, $1){
			return replacers($1) || $0;
		}
	).replace(/\((?!\?)/g, '(?:') // make all groups non-capturing
	 .replace(/ (?!\?|\*)/g, ',? ') // be forgiving with spaces and commas
	 .replace(/%([a-z%])/gi,
		function($0, $1){
			var p = keys[$1];
			if (!p) return $1;
			parsed.push($1);
			return '(' + p.source + ')';
		}
	).replace(/\[a-z\]/gi, '[a-z\\u00c0-\\uffff;\&]'); // handle unicode words

	return {
		format: format,
		re: new RegExp('^' + re + '$', 'i'),
		handler: function(bits){
			bits = bits.slice(1).associate(parsed);
			var date = new Date().clearTime(),
				year = bits.y || bits.Y;

			if (year != null) handle.call(date, 'y', year); // need to start in the right year
			if ('d' in bits) handle.call(date, 'd', 1);
			if ('m' in bits || bits.b || bits.B) handle.call(date, 'm', 1);

			for (var key in bits) handle.call(date, key, bits[key]);
			return date;
		}
	};
};

var handle = function(key, value){
	if (!value) return this;

	switch (key){
		case 'a': case 'A': return this.set('day', Date.parseDay(value, true));
		case 'b': case 'B': return this.set('mo', Date.parseMonth(value, true));
		case 'd': return this.set('date', value);
		case 'H': case 'I': return this.set('hr', value);
		case 'm': return this.set('mo', value - 1);
		case 'M': return this.set('min', value);
		case 'p': return this.set('ampm', value.replace(/\./g, ''));
		case 'S': return this.set('sec', value);
		case 's': return this.set('ms', ('0.' + value) * 1000);
		case 'w': return this.set('day', value);
		case 'Y': return this.set('year', value);
		case 'y':
			value = +value;
			if (value < 100) value += startCentury + (value < startYear ? 100 : 0);
			return this.set('year', value);
		case 'z':
			if (value == 'Z') value = '+00';
			var offset = value.match(/([+-])(\d{2}):?(\d{2})?/);
			offset = (offset[1] + '1') * (offset[2] * 60 + (+offset[3] || 0)) + this.getTimezoneOffset();
			return this.set('time', this - offset * 60000);
	}

	return this;
};

Date.defineParsers(
	'%Y([-./]%m([-./]%d((T| )%X)?)?)?', // "1999-12-31", "1999-12-31 11:59pm", "1999-12-31 23:59:59", ISO8601
	'%Y%m%d(T%H(%M%S?)?)?', // "19991231", "19991231T1159", compact
	'%x( %X)?', // "12/31", "12.31.99", "12-31-1999", "12/31/2008 11:59 PM"
	'%d%o( %b( %Y)?)?( %X)?', // "31st", "31st December", "31 Dec 1999", "31 Dec 1999 11:59pm"
	'%b( %d%o)?( %Y)?( %X)?', // Same as above with month and day switched
	'%Y %b( %d%o( %X)?)?', // Same as above with year coming first
	'%o %b %d %X %z %Y', // "Thu Oct 22 08:11:23 +0000 2009"
	'%T', // %H:%M:%S
	'%H:%M( ?%p)?' // "11:05pm", "11:05 am" and "11:05"
);

Locale.addEvent('change', function(language){
	if (Locale.get('Date')) recompile(language);
}).fireEvent('change', Locale.getCurrent());

})();


/*
---

script: String.Extras.js

name: String.Extras

description: Extends the String native object to include methods useful in managing various kinds of strings (query strings, urls, html, etc).

license: MIT-style license

authors:
  - Aaron Newton
  - Guillermo Rauch
  - Christopher Pitt

requires:
  - Core/String
  - Core/Array
  - MooTools.More

provides: [String.Extras]

...
*/

(function(){

var special = {
	'a': /[àáâãäåaa]/g,
	'A': /[ÀÁÂÃÄÅAA]/g,
	'c': /[ccç]/g,
	'C': /[CCÇ]/g,
	'd': /[dd]/g,
	'D': /[DÐ]/g,
	'e': /[èéêëee]/g,
	'E': /[ÈÉÊËEE]/g,
	'g': /[g]/g,
	'G': /[G]/g,
	'i': /[ìíîï]/g,
	'I': /[ÌÍÎÏ]/g,
	'l': /[lll]/g,
	'L': /[LLL]/g,
	'n': /[ñnn]/g,
	'N': /[ÑNN]/g,
	'o': /[òóôõöøo]/g,
	'O': /[ÒÓÔÕÖØ]/g,
	'r': /[rr]/g,
	'R': /[RR]/g,
	's': /[ššs]/g,
	'S': /[ŠSS]/g,
	't': /[tt]/g,
	'T': /[TT]/g,
	'ue': /[ü]/g,
	'UE': /[Ü]/g,
	'u': /[ùúûuµ]/g,
	'U': /[ÙÚÛU]/g,
	'y': /[ÿý]/g,
	'Y': /[ŸÝ]/g,
	'z': /[žzz]/g,
	'Z': /[ŽZZ]/g,
	'th': /[þ]/g,
	'TH': /[Þ]/g,
	'dh': /[ð]/g,
	'DH': /[Ð]/g,
	'ss': /[ß]/g,
	'oe': /[œ]/g,
	'OE': /[Œ]/g,
	'ae': /[æ]/g,
	'AE': /[Æ]/g
},

tidy = {
	' ': /[\xa0\u2002\u2003\u2009]/g,
	'*': /[\xb7]/g,
	'\'': /[\u2018\u2019]/g,
	'"': /[\u201c\u201d]/g,
	'...': /[\u2026]/g,
	'-': /[\u2013]/g,
//	'--': /[\u2014]/g,
	'&raquo;': /[\uFFFD]/g
};

var walk = function(string, replacements){
	var result = string, key;
	for (key in replacements) result = result.replace(replacements[key], key);
	return result;
};

var getRegexForTag = function(tag, contents){
	tag = tag || '';
	var regstr = contents ? "<" + tag + "(?!\\w)[^>]*>([\\s\\S]*?)<\/" + tag + "(?!\\w)>" : "<\/?" + tag + "([^>]+)?>",
		reg = new RegExp(regstr, "gi");
	return reg;
};

String.implement({

	standardize: function(){
		return walk(this, special);
	},

	repeat: function(times){
		return new Array(times + 1).join(this);
	},

	pad: function(length, str, direction){
		if (this.length >= length) return this;

		var pad = (str == null ? ' ' : '' + str)
			.repeat(length - this.length)
			.substr(0, length - this.length);

		if (!direction || direction == 'right') return this + pad;
		if (direction == 'left') return pad + this;

		return pad.substr(0, (pad.length / 2).floor()) + this + pad.substr(0, (pad.length / 2).ceil());
	},

	getTags: function(tag, contents){
		return this.match(getRegexForTag(tag, contents)) || [];
	},

	stripTags: function(tag, contents){
		return this.replace(getRegexForTag(tag, contents), '');
	},

	tidy: function(){
		return walk(this, tidy);
	},

	truncate: function(max, trail, atChar){
		var string = this;
		if (trail == null && arguments.length == 1) trail = '…';
		if (string.length > max){
			string = string.substring(0, max);
			if (atChar){
				var index = string.lastIndexOf(atChar);
				if (index != -1) string = string.substr(0, index);
			}
			if (trail) string += trail;
		}
		return string;
	}

});

})();


/*
---

script: Element.Forms.js

name: Element.Forms

description: Extends the Element native object to include methods useful in managing inputs.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Element
  - /String.Extras
  - /MooTools.More

provides: [Element.Forms]

...
*/

Element.implement({

	tidy: function(){
		this.set('value', this.get('value').tidy());
	},

	getTextInRange: function(start, end){
		return this.get('value').substring(start, end);
	},

	getSelectedText: function(){
		if (this.setSelectionRange) return this.getTextInRange(this.getSelectionStart(), this.getSelectionEnd());
		return document.selection.createRange().text;
	},

	getSelectedRange: function(){
		if (this.selectionStart != null){
			return {
				start: this.selectionStart,
				end: this.selectionEnd
			};
		}

		var pos = {
			start: 0,
			end: 0
		};
		var range = this.getDocument().selection.createRange();
		if (!range || range.parentElement() != this) return pos;
		var duplicate = range.duplicate();

		if (this.type == 'text'){
			pos.start = 0 - duplicate.moveStart('character', -100000);
			pos.end = pos.start + range.text.length;
		} else {
			var value = this.get('value');
			var offset = value.length;
			duplicate.moveToElementText(this);
			duplicate.setEndPoint('StartToEnd', range);
			if (duplicate.text.length) offset -= value.match(/[\n\r]*$/)[0].length;
			pos.end = offset - duplicate.text.length;
			duplicate.setEndPoint('StartToStart', range);
			pos.start = offset - duplicate.text.length;
		}
		return pos;
	},

	getSelectionStart: function(){
		return this.getSelectedRange().start;
	},

	getSelectionEnd: function(){
		return this.getSelectedRange().end;
	},

	setCaretPosition: function(pos){
		if (pos == 'end') pos = this.get('value').length;
		this.selectRange(pos, pos);
		return this;
	},

	getCaretPosition: function(){
		return this.getSelectedRange().start;
	},

	selectRange: function(start, end){
		if (this.setSelectionRange){
			this.focus();
			this.setSelectionRange(start, end);
		} else {
			var value = this.get('value');
			var diff = value.substr(start, end - start).replace(/\r/g, '').length;
			start = value.substr(0, start).replace(/\r/g, '').length;
			var range = this.createTextRange();
			range.collapse(true);
			range.moveEnd('character', start + diff);
			range.moveStart('character', start);
			range.select();
		}
		return this;
	},

	insertAtCursor: function(value, select){
		var pos = this.getSelectedRange();
		var text = this.get('value');
		this.set('value', text.substring(0, pos.start) + value + text.substring(pos.end, text.length));
		if (select !== false) this.selectRange(pos.start, pos.start + value.length);
		else this.setCaretPosition(pos.start + value.length);
		return this;
	},

	insertAroundCursor: function(options, select){
		options = Object.append({
			before: '',
			defaultMiddle: '',
			after: ''
		}, options);

		var value = this.getSelectedText() || options.defaultMiddle;
		var pos = this.getSelectedRange();
		var text = this.get('value');

		if (pos.start == pos.end){
			this.set('value', text.substring(0, pos.start) + options.before + value + options.after + text.substring(pos.end, text.length));
			this.selectRange(pos.start + options.before.length, pos.end + options.before.length + value.length);
		} else {
			var current = text.substring(pos.start, pos.end);
			this.set('value', text.substring(0, pos.start) + options.before + current + options.after + text.substring(pos.end, text.length));
			var selStart = pos.start + options.before.length;
			if (select !== false) this.selectRange(selStart, selStart + current.length);
			else this.setCaretPosition(selStart + text.length);
		}
		return this;
	}

});


/*
---

script: Element.Shortcuts.js

name: Element.Shortcuts

description: Extends the Element native object to include some shortcut methods.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Element.Style
  - /MooTools.More

provides: [Element.Shortcuts]

...
*/

Element.implement({

	isDisplayed: function(){
		return this.getStyle('display') != 'none';
	},

	isVisible: function(){
		var w = this.offsetWidth,
			h = this.offsetHeight;
		return (w == 0 && h == 0) ? false : (w > 0 && h > 0) ? true : this.style.display != 'none';
	},

	toggle: function(){
		return this[this.isDisplayed() ? 'hide' : 'show']();
	},

	hide: function(){
		var d;
		try {
			//IE fails here if the element is not in the dom
			d = this.getStyle('display');
		} catch(e){}
		if (d == 'none') return this;
		return this.store('element:_originalDisplay', d || '').setStyle('display', 'none');
	},

	show: function(display){
		if (!display && this.isDisplayed()) return this;
		display = display || this.retrieve('element:_originalDisplay') || 'block';
		return this.setStyle('display', (display == 'none') ? 'block' : display);
	},

	swapClass: function(remove, add){
		return this.removeClass(remove).addClass(add);
	}

});

Document.implement({

	clearSelection: function(){
		if (window.getSelection){
			var selection = window.getSelection();
			if (selection && selection.removeAllRanges) selection.removeAllRanges();
		} else if (document.selection && document.selection.empty){
			try {
				//IE fails here if selected element is not in dom
				document.selection.empty();
			} catch(e){}
		}
	}

});


/*
---

script: Form.Validator.js

name: Form.Validator

description: A css-class based form validation system.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Options
  - Core/Events
  - Core/Slick.Finder
  - Core/Element.Event
  - Core/Element.Style
  - Core/JSON
  - /Locale
  - /Class.Binds
  - /Date
  - /Element.Forms
  - /Locale.en-US.Form.Validator
  - /Element.Shortcuts

provides: [Form.Validator, InputValidator, FormValidator.BaseValidators]

...
*/
if (!window.Form) window.Form = {};

var InputValidator = this.InputValidator = new Class({

	Implements: [Options],

	options: {
		errorMsg: 'Validation failed.',
		test: Function.from(true)
	},

	initialize: function(className, options){
		this.setOptions(options);
		this.className = className;
	},

	test: function(field, props){
		field = document.id(field);
		return (field) ? this.options.test(field, props || this.getProps(field)) : false;
	},

	getError: function(field, props){
		field = document.id(field);
		var err = this.options.errorMsg;
		if (typeOf(err) == 'function') err = err(field, props || this.getProps(field));
		return err;
	},

	getProps: function(field){
		field = document.id(field);
		return (field) ? field.get('validatorProps') : {};
	}

});

Element.Properties.validators = {

	get: function(){
		return (this.get('data-validators') || this.className).clean().split(' ');
	}

};

Element.Properties.validatorProps = {

	set: function(props){
		return this.eliminate('$moo:validatorProps').store('$moo:validatorProps', props);
	},

	get: function(props){
		if (props) this.set(props);
		if (this.retrieve('$moo:validatorProps')) return this.retrieve('$moo:validatorProps');
		if (this.getProperty('data-validator-properties') || this.getProperty('validatorProps')){
			try {
				this.store('$moo:validatorProps', JSON.decode(this.getProperty('validatorProps') || this.getProperty('data-validator-properties')));
			}catch(e){
				return {};
			}
		} else {
			var vals = this.get('validators').filter(function(cls){
				return cls.test(':');
			});
			if (!vals.length){
				this.store('$moo:validatorProps', {});
			} else {
				props = {};
				vals.each(function(cls){
					var split = cls.split(':');
					if (split[1]){
						try {
							props[split[0]] = JSON.decode(split[1]);
						} catch(e){}
					}
				});
				this.store('$moo:validatorProps', props);
			}
		}
		return this.retrieve('$moo:validatorProps');
	}

};

Form.Validator = new Class({

	Implements: [Options, Events],

	Binds: ['onSubmit'],

	options: {/*
		onFormValidate: function(isValid, form, event){},
		onElementValidate: function(isValid, field, className, warn){},
		onElementPass: function(field){},
		onElementFail: function(field, validatorsFailed){}, */
		fieldSelectors: 'input, select, textarea',
		ignoreHidden: true,
		ignoreDisabled: true,
		useTitles: false,
		evaluateOnSubmit: true,
		evaluateFieldsOnBlur: true,
		evaluateFieldsOnChange: true,
		serial: true,
		stopOnFailure: true,
		warningPrefix: function(){
			return Form.Validator.getMsg('warningPrefix') || 'Warning: ';
		},
		errorPrefix: function(){
			return Form.Validator.getMsg('errorPrefix') || 'Error: ';
		}
	},

	initialize: function(form, options){
		this.setOptions(options);
		this.element = document.id(form);
		this.element.store('validator', this);
		this.warningPrefix = Function.from(this.options.warningPrefix)();
		this.errorPrefix = Function.from(this.options.errorPrefix)();
		if (this.options.evaluateOnSubmit) this.element.addEvent('submit', this.onSubmit);
		if (this.options.evaluateFieldsOnBlur || this.options.evaluateFieldsOnChange) this.watchFields(this.getFields());
		
	},

	toElement: function(){
		return this.element;
	},

	getFields: function(){
		return (this.fields = this.element.getElements(this.options.fieldSelectors));
	},

	watchFields: function(fields){
		fields.each(function(el){
			if (this.options.evaluateFieldsOnBlur)
				el.addEvent('blur', this.validationMonitor.pass([el, false], this));
			if (this.options.evaluateFieldsOnChange)
				el.addEvent('change', this.validationMonitor.pass([el, true], this));
		}, this);
	},

	validationMonitor: function(){
		clearTimeout(this.timer);
		this.timer = this.validateField.delay(50, this, arguments);
	},

	onSubmit: function(event){
		if (this.validate(event)) this.reset();
	},

	reset: function(){
		this.getFields().each(this.resetField, this);
		return this;
	},

	validate: function(event){
		var result = this.getFields().map(function(field){
			return this.validateField(field, true);
		}, this).every(function(v){
			return v;
		});
		this.fireEvent('formValidate', [result, this.element, event]);
		if (this.options.stopOnFailure && !result && event) event.preventDefault();
		return result;
	},

	validateField: function(field, force){
		if (this.paused) return true;
		field = document.id(field);
		var passed = !field.hasClass('validation-failed');
		var failed, warned;
		if (this.options.serial && !force){
			failed = this.element.getElement('.validation-failed');
			warned = this.element.getElement('.warning');
		}
		if (field && (!failed || force || field.hasClass('validation-failed') || (failed && !this.options.serial))){
			var validationTypes = field.get('validators');
			var validators = validationTypes.some(function(cn){
				return this.getValidator(cn);
			}, this);
			var validatorsFailed = [];
			validationTypes.each(function(className){
				if (className && !this.test(className, field)) validatorsFailed.include(className);
			}, this);
			passed = validatorsFailed.length === 0;
			if (validators && !this.hasValidator(field, 'warnOnly')){
				if (passed){
					field.addClass('validation-passed').removeClass('validation-failed');
					this.fireEvent('elementPass', [field]);
				} else {
					field.addClass('validation-failed').removeClass('validation-passed');
					this.fireEvent('elementFail', [field, validatorsFailed]);
				}
			}
			if (!warned){
				var warnings = validationTypes.some(function(cn){
					if (cn.test('^warn'))
						return this.getValidator(cn.replace(/^warn-/,''));
					else return null;
				}, this);
				field.removeClass('warning');
				var warnResult = validationTypes.map(function(cn){
					if (cn.test('^warn'))
						return this.test(cn.replace(/^warn-/,''), field, true);
					else return null;
				}, this);
			}
		}
		return passed;
	},

	test: function(className, field, warn){
		field = document.id(field);
		if ((this.options.ignoreHidden && !field.isVisible()) || (this.options.ignoreDisabled && field.get('disabled'))) return true;
		var validator = this.getValidator(className);
		if (warn != null) warn = false;
		if (this.hasValidator(field, 'warnOnly')) warn = true;
		var isValid = this.hasValidator(field, 'ignoreValidation') || (validator ? validator.test(field) : true);
		if (validator && field.isVisible()) this.fireEvent('elementValidate', [isValid, field, className, warn]);
		if (warn) return true;
		return isValid;
	},

	hasValidator: function(field, value){
		return field.get('validators').contains(value);
	},

	resetField: function(field){
		field = document.id(field);
		if (field){
			field.get('validators').each(function(className){
				if (className.test('^warn-')) className = className.replace(/^warn-/, '');
				field.removeClass('validation-failed');
				field.removeClass('warning');
				field.removeClass('validation-passed');
			}, this);
		}
		return this;
	},

	stop: function(){
		this.paused = true;
		return this;
	},

	start: function(){
		this.paused = false;
		return this;
	},

	ignoreField: function(field, warn){
		field = document.id(field);
		if (field){
			this.enforceField(field);
			if (warn) field.addClass('warnOnly');
			else field.addClass('ignoreValidation');
		}
		return this;
	},

	enforceField: function(field){
		field = document.id(field);
		if (field) field.removeClass('warnOnly').removeClass('ignoreValidation');
		return this;
	}

});

Form.Validator.getMsg = function(key){
	return Locale.get('FormValidator.' + key);
};

Form.Validator.adders = {

	validators:{},

	add : function(className, options){
		this.validators[className] = new InputValidator(className, options);
		//if this is a class (this method is used by instances of Form.Validator and the Form.Validator namespace)
		//extend these validators into it
		//this allows validators to be global and/or per instance
		if (!this.initialize){
			this.implement({
				validators: this.validators
			});
		}
	},

	addAllThese : function(validators){
		Array.from(validators).each(function(validator){
			this.add(validator[0], validator[1]);
		}, this);
	},

	getValidator: function(className){
		return this.validators[className.split(':')[0]];
	}

};

Object.append(Form.Validator, Form.Validator.adders);

Form.Validator.implement(Form.Validator.adders);

Form.Validator.add('IsEmpty', {

	errorMsg: false,
	test: function(element){
		if (element.type == 'select-one' || element.type == 'select')
			return !(element.selectedIndex >= 0 && element.options[element.selectedIndex].value != '');
		else
			return ((element.get('value') == null) || (element.get('value').length == 0));
	}

});

Form.Validator.addAllThese([

	['required', {
		errorMsg: function(){
			return Form.Validator.getMsg('required');
		},
		test: function(element){
			return !Form.Validator.getValidator('IsEmpty').test(element);
		}
	}],

	['minLength', {
		errorMsg: function(element, props){
			if (typeOf(props.minLength) != 'null')
				return Form.Validator.getMsg('minLength').substitute({minLength:props.minLength,length:element.get('value').length });
			else return '';
		},
		test: function(element, props){
			if (typeOf(props.minLength) != 'null') return (element.get('value').length >= (props.minLength || 0));
			else return true;
		}
	}],

	['maxLength', {
		errorMsg: function(element, props){
			//props is {maxLength:10}
			if (typeOf(props.maxLength) != 'null')
				return Form.Validator.getMsg('maxLength').substitute({maxLength:props.maxLength,length:element.get('value').length });
			else return '';
		},
		test: function(element, props){
			return element.get('value').length <= (props.maxLength || 10000);
		}
	}],

	['validate-integer', {
		errorMsg: Form.Validator.getMsg.pass('integer'),
		test: function(element){
			return Form.Validator.getValidator('IsEmpty').test(element) || (/^(-?[1-9]\d*|0)$/).test(element.get('value'));
		}
	}],

	['validate-numeric', {
		errorMsg: Form.Validator.getMsg.pass('numeric'),
		test: function(element){
			return Form.Validator.getValidator('IsEmpty').test(element) ||
				(/^-?(?:0$0(?=\d*\.)|[1-9]|0)\d*(\.\d+)?$/).test(element.get('value'));
		}
	}],

	['validate-digits', {
		errorMsg: Form.Validator.getMsg.pass('digits'),
		test: function(element){
			return Form.Validator.getValidator('IsEmpty').test(element) || (/^[\d() .:\-\+#]+$/.test(element.get('value')));
		}
	}],

	['validate-alpha', {
		errorMsg: Form.Validator.getMsg.pass('alpha'),
		test: function(element){
			return Form.Validator.getValidator('IsEmpty').test(element) || (/^[a-zA-Z]+$/).test(element.get('value'));
		}
	}],

	['validate-alphanum', {
		errorMsg: Form.Validator.getMsg.pass('alphanum'),
		test: function(element){
			return Form.Validator.getValidator('IsEmpty').test(element) || !(/\W/).test(element.get('value'));
		}
	}],

	['validate-date', {
		errorMsg: function(element, props){
			if (Date.parse){
				var format = props.dateFormat || '%x';
				return Form.Validator.getMsg('dateSuchAs').substitute({date: new Date().format(format)});
			} else {
				return Form.Validator.getMsg('dateInFormatMDY');
			}
		},
		test: function(element, props){
			if (Form.Validator.getValidator('IsEmpty').test(element)) return true;
			var dateLocale = Locale.getCurrent().sets.Date,
				dateNouns = new RegExp([dateLocale.days, dateLocale.days_abbr, dateLocale.months, dateLocale.months_abbr].flatten().join('|'), 'i'),
				value = element.get('value'),
				wordsInValue = value.match(/[a-z]+/gi);

				if (wordsInValue && !wordsInValue.every(dateNouns.exec, dateNouns)) return false;

				var date = Date.parse(value),
					format = props.dateFormat || '%x',
					formatted = date.format(format);

				if (formatted != 'invalid date') element.set('value', formatted);
				return date.isValid();
		}
	}],

	['validate-email', {
		errorMsg: Form.Validator.getMsg.pass('email'),
		test: function(element){
			/*
			var chars = "[a-z0-9!#$%&'*+/=?^_`{|}~-]",
				local = '(?:' + chars + '\\.?){0,63}' + chars,

				label = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?',
				hostname = '(?:' + label + '\\.)*' + label;

				octet = '(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)',
				ipv4 = '\\[(?:' + octet + '\\.){3}' + octet + '\\]',

				domain = '(?:' + hostname + '|' + ipv4 + ')';

			var regex = new RegExp('^' + local + '@' + domain + '$', 'i');
			*/
			return Form.Validator.getValidator('IsEmpty').test(element) || (/^(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]\.?){0,63}[a-z0-9!#$%&'*+\/=?^_`{|}~-]@(?:(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\])$/i).test(element.get('value'));
		}
	}],

	['validate-url', {
		errorMsg: Form.Validator.getMsg.pass('url'),
		test: function(element){
			return Form.Validator.getValidator('IsEmpty').test(element) || (/^(https?|ftp|rmtp|mms):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i).test(element.get('value'));
		}
	}],

	['validate-currency-dollar', {
		errorMsg: Form.Validator.getMsg.pass('currencyDollar'),
		test: function(element){
			return Form.Validator.getValidator('IsEmpty').test(element) || (/^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/).test(element.get('value'));
		}
	}],

	['validate-one-required', {
		errorMsg: Form.Validator.getMsg.pass('oneRequired'),
		test: function(element, props){
			var p = document.id(props['validate-one-required']) || element.getParent(props['validate-one-required']);
			return p.getElements('input').some(function(el){
				if (['checkbox', 'radio'].contains(el.get('type'))) return el.get('checked');
				return el.get('value');
			});
		}
	}]

]);

Element.Properties.validator = {

	set: function(options){
		this.get('validator').setOptions(options);
	},

	get: function(){
		var validator = this.retrieve('validator');
		if (!validator){
			validator = new Form.Validator(this);
			this.store('validator', validator);
		}
		return validator;
	}

};

Element.implement({

	validate: function(options){
		if (options) this.set('validator', options);
		return this.get('validator').validate();
	}

});







/*
---

script: Form.Validator.Inline.js

name: Form.Validator.Inline

description: Extends Form.Validator to add inline messages.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - /Form.Validator

provides: [Form.Validator.Inline]

...
*/

Form.Validator.Inline = new Class({

	Extends: Form.Validator,

	options: {
		showError: function(errorElement){
			if (errorElement.reveal) errorElement.reveal();
			else errorElement.setStyle('display', 'block');
		},
		hideError: function(errorElement){
			if (errorElement.dissolve) errorElement.dissolve();
			else errorElement.setStyle('display', 'none');
		},
		scrollToErrorsOnSubmit: true,
		scrollToErrorsOnBlur: false,
		scrollToErrorsOnChange: false,
		scrollFxOptions: {
			transition: 'quad:out',
			offset: {
				y: -20
			}
		}
	},

	initialize: function(form, options){
		this.parent(form, options);
		this.addEvent('onElementValidate', function(isValid, field, className, warn){
			var validator = this.getValidator(className);
			if (!isValid && validator.getError(field)){
				if (warn) field.addClass('warning');
				var advice = this.makeAdvice(className, field, validator.getError(field), warn);
				this.insertAdvice(advice, field);
				this.showAdvice(className, field);
			} else {
				this.hideAdvice(className, field);
			}
		});
	},

	makeAdvice: function(className, field, error, warn){
		var errorMsg = (warn) ? this.warningPrefix : this.errorPrefix;
			errorMsg += (this.options.useTitles) ? field.title || error:error;
		var cssClass = (warn) ? 'warning-advice' : 'validation-advice';
		var advice = this.getAdvice(className, field);
		if (advice){
			advice = advice.set('html', errorMsg);
		} else {
			advice = new Element('div', {
				html: errorMsg,
				styles: { display: 'none' },
				id: 'advice-' + className.split(':')[0] + '-' + this.getFieldId(field)
			}).addClass(cssClass);
		}
		field.store('$moo:advice-' + className, advice);
		return advice;
	},

	getFieldId : function(field){
		return field.id ? field.id : field.id = 'input_' + field.name;
	},

	showAdvice: function(className, field){
		var advice = this.getAdvice(className, field);
		if (
			advice &&
			!field.retrieve('$moo:' + this.getPropName(className)) &&
			(
				advice.getStyle('display') == 'none' ||
				advice.getStyle('visiblity') == 'hidden' ||
				advice.getStyle('opacity') == 0
			)
		){
			field.store('$moo:' + this.getPropName(className), true);
			this.options.showError(advice);
			this.fireEvent('showAdvice', [field, advice, className]);
		}
	},

	hideAdvice: function(className, field){
		var advice = this.getAdvice(className, field);
		if (advice && field.retrieve('$moo:' + this.getPropName(className))){
			field.store('$moo:' + this.getPropName(className), false);
			this.options.hideError(advice);
			this.fireEvent('hideAdvice', [field, advice, className]);
		}
	},

	getPropName: function(className){
		return 'advice' + className;
	},

	resetField: function(field){
		field = document.id(field);
		if (!field) return this;
		this.parent(field);
		field.get('validators').each(function(className){
			this.hideAdvice(className, field);
		}, this);
		return this;
	},

	getAllAdviceMessages: function(field, force){
		var advice = [];
		if (field.hasClass('ignoreValidation') && !force) return advice;
		var validators = field.get('validators').some(function(cn){
			var warner = cn.test('^warn-') || field.hasClass('warnOnly');
			if (warner) cn = cn.replace(/^warn-/, '');
			var validator = this.getValidator(cn);
			if (!validator) return;
			advice.push({
				message: validator.getError(field),
				warnOnly: warner,
				passed: validator.test(),
				validator: validator
			});
		}, this);
		return advice;
	},

	getAdvice: function(className, field){
		return field.retrieve('$moo:advice-' + className);
	},

	insertAdvice: function(advice, field){
		//Check for error position prop
		var props = field.get('validatorProps');
		//Build advice
		if (!props.msgPos || !document.id(props.msgPos)){
			if (field.type && field.type.toLowerCase() == 'radio' || field.type.toLowerCase() == 'checkbox') field.getParent().adopt(advice);
			else advice.inject(document.id(field), 'after');
		} else {
			document.id(props.msgPos).grab(advice);
		}
	},

	validateField: function(field, force, scroll){
		var result = this.parent(field, force);
		if (((this.options.scrollToErrorsOnSubmit && scroll == null) || scroll) && !result){
			var failed = document.id(this).getElement('.validation-failed');
			var par = document.id(this).getParent();
			while (par != document.body && par.getScrollSize().y == par.getSize().y){
				par = par.getParent();
			}
			var fx = par.retrieve('$moo:fvScroller');
			if (!fx && window.Fx && Fx.Scroll){
				fx = new Fx.Scroll(par, this.options.scrollFxOptions);
				par.store('$moo:fvScroller', fx);
			}
			if (failed){
				if (fx) fx.toElement(failed);
				else par.scrollTo(par.getScroll().x, failed.getPosition(par).y - 20);
			}
		}
		return result;
	},

	watchFields: function(fields){
		fields.each(function(el){
		if (this.options.evaluateFieldsOnBlur){
			el.addEvent('blur', this.validationMonitor.pass([el, false, this.options.scrollToErrorsOnBlur], this));
		}
		if (this.options.evaluateFieldsOnChange){
				el.addEvent('change', this.validationMonitor.pass([el, true, this.options.scrollToErrorsOnChange], this));
			}
		}, this);
	}

});



/*
---

script: Form.Validator.Extras.js

name: Form.Validator.Extras

description: Additional validators for the Form.Validator class.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - /Form.Validator

provides: [Form.Validator.Extras]

...
*/
Form.Validator.addAllThese([

	['validate-enforce-oncheck', {
		test: function(element, props){
			var fv = element.getParent('form').retrieve('validator');
			if (!fv) return true;
			(props.toEnforce || document.id(props.enforceChildrenOf).getElements('input, select, textarea')).map(function(item){
				if (element.checked){
					fv.enforceField(item);
				} else {
					fv.ignoreField(item);
					fv.resetField(item);
				}
			});
			return true;
		}
	}],

	['validate-ignore-oncheck', {
		test: function(element, props){
			var fv = element.getParent('form').retrieve('validator');
			if (!fv) return true;
			(props.toIgnore || document.id(props.ignoreChildrenOf).getElements('input, select, textarea')).each(function(item){
				if (element.checked){
					fv.ignoreField(item);
					fv.resetField(item);
				} else {
					fv.enforceField(item);
				}
			});
			return true;
		}
	}],

	['validate-nospace', {
		errorMsg: function(){
			return Form.Validator.getMsg('noSpace');
		},
		test: function(element, props){
			return !element.get('value').test(/\s/);
		}
	}],

	['validate-toggle-oncheck', {
		test: function(element, props){
			var fv = element.getParent('form').retrieve('validator');
			if (!fv) return true;
			var eleArr = props.toToggle || document.id(props.toToggleChildrenOf).getElements('input, select, textarea');
			if (!element.checked){
				eleArr.each(function(item){
					fv.ignoreField(item);
					fv.resetField(item);
				});
			} else {
				eleArr.each(function(item){
					fv.enforceField(item);
				});
			}
			return true;
		}
	}],

	['validate-reqchk-bynode', {
		errorMsg: function(){
			return Form.Validator.getMsg('reqChkByNode');
		},
		test: function(element, props){
			return (document.id(props.nodeId).getElements(props.selector || 'input[type=checkbox], input[type=radio]')).some(function(item){
				return item.checked;
			});
		}
	}],

	['validate-required-check', {
		errorMsg: function(element, props){
			return props.useTitle ? element.get('title') : Form.Validator.getMsg('requiredChk');
		},
		test: function(element, props){
			return !!element.checked;
		}
	}],

	['validate-reqchk-byname', {
		errorMsg: function(element, props){
			return Form.Validator.getMsg('reqChkByName').substitute({label: props.label || element.get('type')});
		},
		test: function(element, props){
			var grpName = props.groupName || element.get('name');
			var oneCheckedItem = $$(document.getElementsByName(grpName)).some(function(item, index){
				return item.checked;
			});
			var fv = element.getParent('form').retrieve('validator');
			if (oneCheckedItem && fv) fv.resetField(element);
			return oneCheckedItem;
		}
	}],

	['validate-match', {
		errorMsg: function(element, props){
			return Form.Validator.getMsg('match').substitute({matchName: props.matchName || document.id(props.matchInput).get('name')});
		},
		test: function(element, props){
			var eleVal = element.get('value');
			var matchVal = document.id(props.matchInput) && document.id(props.matchInput).get('value');
			return eleVal && matchVal ? eleVal == matchVal : true;
		}
	}],

	['validate-after-date', {
		errorMsg: function(element, props){
			return Form.Validator.getMsg('afterDate').substitute({
				label: props.afterLabel || (props.afterElement ? Form.Validator.getMsg('startDate') : Form.Validator.getMsg('currentDate'))
			});
		},
		test: function(element, props){
			var start = document.id(props.afterElement) ? Date.parse(document.id(props.afterElement).get('value')) : new Date();
			var end = Date.parse(element.get('value'));
			return end && start ? end >= start : true;
		}
	}],

	['validate-before-date', {
		errorMsg: function(element, props){
			return Form.Validator.getMsg('beforeDate').substitute({
				label: props.beforeLabel || (props.beforeElement ? Form.Validator.getMsg('endDate') : Form.Validator.getMsg('currentDate'))
			});
		},
		test: function(element, props){
			var start = Date.parse(element.get('value'));
			var end = document.id(props.beforeElement) ? Date.parse(document.id(props.beforeElement).get('value')) : new Date();
			return end && start ? end >= start : true;
		}
	}],

	['validate-custom-required', {
		errorMsg: function(){
			return Form.Validator.getMsg('required');
		},
		test: function(element, props){
			return element.get('value') != props.emptyValue;
		}
	}],

	['validate-same-month', {
		errorMsg: function(element, props){
			var startMo = document.id(props.sameMonthAs) && document.id(props.sameMonthAs).get('value');
			var eleVal = element.get('value');
			if (eleVal != '') return Form.Validator.getMsg(startMo ? 'sameMonth' : 'startMonth');
		},
		test: function(element, props){
			var d1 = Date.parse(element.get('value'));
			var d2 = Date.parse(document.id(props.sameMonthAs) && document.id(props.sameMonthAs).get('value'));
			return d1 && d2 ? d1.format('%B') == d2.format('%B') : true;
		}
	}],


	['validate-cc-num', {
		errorMsg: function(element){
			var ccNum = element.get('value').replace(/[^0-9]/g, '');
			return Form.Validator.getMsg('creditcard').substitute({length: ccNum.length});
		},
		test: function(element){
			// required is a different test
			if (Form.Validator.getValidator('IsEmpty').test(element)) return true;

			// Clean number value
			var ccNum = element.get('value');
			ccNum = ccNum.replace(/[^0-9]/g, '');

			var valid_type = false;
			
			if (ccNum.test(/^4[0-9]{12}([0-9]{3})?$/)) valid_type = 'Visa';
			else if (ccNum.test(/^5[1-5]([0-9]{14})$/)) valid_type = 'Master Card';
			else if (ccNum.test(/^3[47][0-9]{13}$/)) valid_type = 'American Express';
			else if (ccNum.test(/^6011[0-9]{12}$/)) valid_type = 'Discover';
			else if (ccNum.test(/^[0-9]{16}$/)) valid_type = 'Gift Card';

			if(valid_type=='Gift Card'){return true;} else
			if (valid_type){
				var sum = 0;
				var cur = 0;

				for (var i=ccNum.length-1; i>=0; --i){
					cur = ccNum.charAt(i).toInt();
					if (cur == 0) continue;

					if ((ccNum.length-i) % 2 == 0) cur += cur;
					if (cur > 9){
						cur = cur.toString().charAt(0).toInt() + cur.toString().charAt(1).toInt();
					}

					sum += cur;
				}
				if ((sum % 10) == 0) return true;
			}

			var chunks = '';
			while (ccNum != ''){
				chunks += ' ' + ccNum.substr(0,4);
				ccNum = ccNum.substr(4);
			}

			element.getParent('form').retrieve('validator').ignoreField(element);
			element.set('value', chunks.clean());
			element.getParent('form').retrieve('validator').enforceField(element);
			return false;
		}
	}]


]);


/*
---

script: Fx.Scroll.js

name: Fx.Scroll

description: Effect to smoothly scroll any element, including the window.

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Fx
  - Core/Element.Event
  - Core/Element.Dimensions
  - /MooTools.More

provides: [Fx.Scroll]

...
*/

(function(){

Fx.Scroll = new Class({

	Extends: Fx,

	options: {
		offset: {x: 0, y: 0},
		wheelStops: true
	},

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);

		if (typeOf(this.element) != 'element') this.element = document.id(this.element.getDocument().body);

		if (this.options.wheelStops){
			var stopper = this.element,
				cancel = this.cancel.pass(false, this);
			this.addEvent('start', function(){
				stopper.addEvent('mousewheel', cancel);
			}, true);
			this.addEvent('complete', function(){
				stopper.removeEvent('mousewheel', cancel);
			}, true);
		}
	},

	set: function(){
		var now = Array.flatten(arguments);
		if (Browser.firefox) now = [Math.round(now[0]), Math.round(now[1])]; // not needed anymore in newer firefox versions
		this.element.scrollTo(now[0], now[1]);
		return this;
	},

	compute: function(from, to, delta){
		return [0, 1].map(function(i){
			return Fx.compute(from[i], to[i], delta);
		});
	},

	start: function(x, y){
		if (!this.check(x, y)) return this;
		var scroll = this.element.getScroll();
		return this.parent([scroll.x, scroll.y], [x, y]);
	},

	calculateScroll: function(x, y){
		var element = this.element,
			scrollSize = element.getScrollSize(),
			scroll = element.getScroll(),
			size = element.getSize(),
			offset = this.options.offset,
			values = {x: x, y: y};

		for (var z in values){
			if (!values[z] && values[z] !== 0) values[z] = scroll[z];
			if (typeOf(values[z]) != 'number') values[z] = scrollSize[z] - size[z];
			values[z] += offset[z];
		}

		return [values.x, values.y];
	},

	toTop: function(){
		return this.start.apply(this, this.calculateScroll(false, 0));
	},

	toLeft: function(){
		return this.start.apply(this, this.calculateScroll(0, false));
	},

	toRight: function(){
		return this.start.apply(this, this.calculateScroll('right', false));
	},

	toBottom: function(){
		return this.start.apply(this, this.calculateScroll(false, 'bottom'));
	},

	toElement: function(el, axes){
		axes = axes ? Array.from(axes) : ['x', 'y'];
		var scroll = isBody(this.element) ? {x: 0, y: 0} : this.element.getScroll();
		var position = Object.map(document.id(el).getPosition(this.element), function(value, axis){
			return axes.contains(axis) ? value + scroll[axis] : false;
		});
		return this.start.apply(this, this.calculateScroll(position.x, position.y));
	},

	toElementEdge: function(el, axes, offset){
		axes = axes ? Array.from(axes) : ['x', 'y'];
		el = document.id(el);
		var to = {},
			position = el.getPosition(this.element),
			size = el.getSize(),
			scroll = this.element.getScroll(),
			containerSize = this.element.getSize(),
			edge = {
				x: position.x + size.x,
				y: position.y + size.y
			};

		['x', 'y'].each(function(axis){
			if (axes.contains(axis)){
				if (edge[axis] > scroll[axis] + containerSize[axis]) to[axis] = edge[axis] - containerSize[axis];
				if (position[axis] < scroll[axis]) to[axis] = position[axis];
			}
			if (to[axis] == null) to[axis] = scroll[axis];
			if (offset && offset[axis]) to[axis] = to[axis] + offset[axis];
		}, this);

		if (to.x != scroll.x || to.y != scroll.y) this.start(to.x, to.y);
		return this;
	},

	toElementCenter: function(el, axes, offset){
		axes = axes ? Array.from(axes) : ['x', 'y'];
		el = document.id(el);
		var to = {},
			position = el.getPosition(this.element),
			size = el.getSize(),
			scroll = this.element.getScroll(),
			containerSize = this.element.getSize();

		['x', 'y'].each(function(axis){
			if (axes.contains(axis)){
				to[axis] = position[axis] - (containerSize[axis] - size[axis]) / 2;
			}
			if (to[axis] == null) to[axis] = scroll[axis];
			if (offset && offset[axis]) to[axis] = to[axis] + offset[axis];
		}, this);

		if (to.x != scroll.x || to.y != scroll.y) this.start(to.x, to.y);
		return this;
	}

});



function isBody(element){
	return (/^(?:body|html)$/i).test(element.tagName);
}

})();


/*
---

script: Drag.js

name: Drag

description: The base Drag Class. Can be used to drag and resize Elements using mouse events.

license: MIT-style license

authors:
  - Valerio Proietti
  - Tom Occhinno
  - Jan Kassens

requires:
  - Core/Events
  - Core/Options
  - Core/Element.Event
  - Core/Element.Style
  - Core/Element.Dimensions
  - /MooTools.More

provides: [Drag]
...

*/

var Drag = new Class({

	Implements: [Events, Options],

	options: {/*
		onBeforeStart: function(thisElement){},
		onStart: function(thisElement, event){},
		onSnap: function(thisElement){},
		onDrag: function(thisElement, event){},
		onCancel: function(thisElement){},
		onComplete: function(thisElement, event){},*/
		snap: 6,
		unit: 'px',
		grid: false,
		style: true,
		limit: false,
		handle: false,
		invert: false,
		preventDefault: false,
		stopPropagation: false,
		modifiers: {x: 'left', y: 'top'}
	},

	initialize: function(){
		var params = Array.link(arguments, {
			'options': Type.isObject,
			'element': function(obj){
				return obj != null;
			}
		});

		this.element = document.id(params.element);
		this.document = this.element.getDocument();
		this.setOptions(params.options || {});
		var htype = typeOf(this.options.handle);
		this.handles = ((htype == 'array' || htype == 'collection') ? $$(this.options.handle) : document.id(this.options.handle)) || this.element;
		this.mouse = {'now': {}, 'pos': {}};
		this.value = {'start': {}, 'now': {}};

		this.selection = (Browser.ie) ? 'selectstart' : 'mousedown';


		if (Browser.ie && !Drag.ondragstartFixed){
			document.ondragstart = Function.from(false);
			Drag.ondragstartFixed = true;
		}

		this.bound = {
			start: this.start.bind(this),
			check: this.check.bind(this),
			drag: this.drag.bind(this),
			stop: this.stop.bind(this),
			cancel: this.cancel.bind(this),
			eventStop: Function.from(false)
		};
		this.attach();
	},

	attach: function(){
		this.handles.addEvent('mousedown', this.bound.start);
		return this;
	},

	detach: function(){
		this.handles.removeEvent('mousedown', this.bound.start);
		return this;
	},

	start: function(event){
		var options = this.options;

		if (event.rightClick) return;

		if (options.preventDefault) event.preventDefault();
		if (options.stopPropagation) event.stopPropagation();
		this.mouse.start = event.page;

		this.fireEvent('beforeStart', this.element);

		var limit = options.limit;
		this.limit = {x: [], y: []};

		var z, coordinates;
		for (z in options.modifiers){
			if (!options.modifiers[z]) continue;

			var style = this.element.getStyle(options.modifiers[z]);

			// Some browsers (IE and Opera) don't always return pixels.
			if (style && !style.match(/px$/)){
				if (!coordinates) coordinates = this.element.getCoordinates(this.element.getOffsetParent());
				style = coordinates[options.modifiers[z]];
			}

			if (options.style) this.value.now[z] = (style || 0).toInt();
			else this.value.now[z] = this.element[options.modifiers[z]];

			if (options.invert) this.value.now[z] *= -1;

			this.mouse.pos[z] = event.page[z] - this.value.now[z];

			if (limit && limit[z]){
				var i = 2;
				while (i--){
					var limitZI = limit[z][i];
					if (limitZI || limitZI === 0) this.limit[z][i] = (typeof limitZI == 'function') ? limitZI() : limitZI;
				}
			}
		}

		if (typeOf(this.options.grid) == 'number') this.options.grid = {
			x: this.options.grid,
			y: this.options.grid
		};

		var events = {
			mousemove: this.bound.check,
			mouseup: this.bound.cancel
		};
		events[this.selection] = this.bound.eventStop;
		this.document.addEvents(events);
	},

	check: function(event){
		if (this.options.preventDefault) event.preventDefault();
		var distance = Math.round(Math.sqrt(Math.pow(event.page.x - this.mouse.start.x, 2) + Math.pow(event.page.y - this.mouse.start.y, 2)));
		if (distance > this.options.snap){
			this.cancel();
			this.document.addEvents({
				mousemove: this.bound.drag,
				mouseup: this.bound.stop
			});
			this.fireEvent('start', [this.element, event]).fireEvent('snap', this.element);
		}
	},

	drag: function(event){
		var options = this.options;

		if (options.preventDefault) event.preventDefault();
		this.mouse.now = event.page;

		for (var z in options.modifiers){
			if (!options.modifiers[z]) continue;
			this.value.now[z] = this.mouse.now[z] - this.mouse.pos[z];

			if (options.invert) this.value.now[z] *= -1;

			if (options.limit && this.limit[z]){
				if ((this.limit[z][1] || this.limit[z][1] === 0) && (this.value.now[z] > this.limit[z][1])){
					this.value.now[z] = this.limit[z][1];
				} else if ((this.limit[z][0] || this.limit[z][0] === 0) && (this.value.now[z] < this.limit[z][0])){
					this.value.now[z] = this.limit[z][0];
				}
			}

			if (options.grid[z]) this.value.now[z] -= ((this.value.now[z] - (this.limit[z][0]||0)) % options.grid[z]);

			if (options.style) this.element.setStyle(options.modifiers[z], this.value.now[z] + options.unit);
			else this.element[options.modifiers[z]] = this.value.now[z];
		}

		this.fireEvent('drag', [this.element, event]);
	},

	cancel: function(event){
		this.document.removeEvents({
			mousemove: this.bound.check,
			mouseup: this.bound.cancel
		});
		if (event){
			this.document.removeEvent(this.selection, this.bound.eventStop);
			this.fireEvent('cancel', this.element);
		}
	},

	stop: function(event){
		var events = {
			mousemove: this.bound.drag,
			mouseup: this.bound.stop
		};
		events[this.selection] = this.bound.eventStop;
		this.document.removeEvents(events);
		if (event) this.fireEvent('complete', [this.element, event]);
	}

});

Element.implement({

	makeResizable: function(options){
		var drag = new Drag(this, Object.merge({
			modifiers: {
				x: 'width',
				y: 'height'
			}
		}, options));

		this.store('resizer', drag);
		return drag.addEvent('drag', function(){
			this.fireEvent('resize', drag);
		}.bind(this));
	}

});


/*
---

script: Element.Measure.js

name: Element.Measure

description: Extends the Element native object to include methods useful in measuring dimensions.

credits: "Element.measure / .expose methods by Daniel Steigerwald License: MIT-style license. Copyright: Copyright (c) 2008 Daniel Steigerwald, daniel.steigerwald.cz"

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Element.Style
  - Core/Element.Dimensions
  - /MooTools.More

provides: [Element.Measure]

...
*/

(function(){

var getStylesList = function(styles, planes){
	var list = [];
	Object.each(planes, function(directions){
		Object.each(directions, function(edge){
			styles.each(function(style){
				list.push(style + '-' + edge + (style == 'border' ? '-width' : ''));
			});
		});
	});
	return list;
};

var calculateEdgeSize = function(edge, styles){
	var total = 0;
	Object.each(styles, function(value, style){
		if (style.test(edge)) total = total + value.toInt();
	});
	return total;
};

var isVisible = function(el){
	return !!(!el || el.offsetHeight || el.offsetWidth);
};


Element.implement({

	measure: function(fn){
		if (isVisible(this)) return fn.call(this);
		var parent = this.getParent(),
			toMeasure = [];
		while (!isVisible(parent) && parent != document.body){
			toMeasure.push(parent.expose());
			parent = parent.getParent();
		}
		var restore = this.expose(),
			result = fn.call(this);
		restore();
		toMeasure.each(function(restore){
			restore();
		});
		return result;
	},

	expose: function(){
		if (this.getStyle('display') != 'none') return function(){};
		var before = this.style.cssText;
		this.setStyles({
			display: 'block',
			position: 'absolute',
			visibility: 'hidden'
		});
		return function(){
			this.style.cssText = before;
		}.bind(this);
	},

	getDimensions: function(options){
		options = Object.merge({computeSize: false}, options);
		var dim = {x: 0, y: 0};

		var getSize = function(el, options){
			return (options.computeSize) ? el.getComputedSize(options) : el.getSize();
		};

		var parent = this.getParent('body');

		if (parent && this.getStyle('display') == 'none'){
			dim = this.measure(function(){
				return getSize(this, options);
			});
		} else if (parent){
			try { //safari sometimes crashes here, so catch it
				dim = getSize(this, options);
			}catch(e){}
		}

		return Object.append(dim, (dim.x || dim.x === 0) ? {
				width: dim.x,
				height: dim.y
			} : {
				x: dim.width,
				y: dim.height
			}
		);
	},

	getComputedSize: function(options){
		

		options = Object.merge({
			styles: ['padding','border'],
			planes: {
				height: ['top','bottom'],
				width: ['left','right']
			},
			mode: 'both'
		}, options);

		var styles = {},
			size = {width: 0, height: 0},
			dimensions;

		if (options.mode == 'vertical'){
			delete size.width;
			delete options.planes.width;
		} else if (options.mode == 'horizontal'){
			delete size.height;
			delete options.planes.height;
		}

		getStylesList(options.styles, options.planes).each(function(style){
			styles[style] = this.getStyle(style).toInt();
		}, this);

		Object.each(options.planes, function(edges, plane){

			var capitalized = plane.capitalize(),
				style = this.getStyle(plane);

			if (style == 'auto' && !dimensions) dimensions = this.getDimensions();

			style = styles[plane] = (style == 'auto') ? dimensions[plane] : style.toInt();
			size['total' + capitalized] = style;

			edges.each(function(edge){
				var edgesize = calculateEdgeSize(edge, styles);
				size['computed' + edge.capitalize()] = edgesize;
				size['total' + capitalized] += edgesize;
			});

		}, this);

		return Object.append(size, styles);
	}

});

})();


/*
---

script: Slider.js

name: Slider

description: Class for creating horizontal and vertical slider controls.

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Element.Dimensions
  - /Class.Binds
  - /Drag
  - /Element.Measure

provides: [Slider]

...
*/

var Slider = new Class({

	Implements: [Events, Options],

	Binds: ['clickedElement', 'draggedKnob', 'scrolledElement'],

	options: {/*
		onTick: function(intPosition){},
		onChange: function(intStep){},
		onComplete: function(strStep){},*/
		onTick: function(position){
			this.setKnobPosition(position);
		},
		initialStep: 0,
		snap: false,
		offset: 0,
		range: false,
		wheel: false,
		steps: 100,
		mode: 'horizontal'
	},

	initialize: function(element, knob, options){
		this.setOptions(options);
		options = this.options;
		this.element = document.id(element);
		knob = this.knob = document.id(knob);
		this.previousChange = this.previousEnd = this.step = -1;

		var limit = {},
			modifiers = {x: false, y: false};

		switch (options.mode){
			case 'vertical':
				this.axis = 'y';
				this.property = 'top';
				this.offset = 'offsetHeight';
				break;
			case 'horizontal':
				this.axis = 'x';
				this.property = 'left';
				this.offset = 'offsetWidth';
		}

		this.setSliderDimensions();
		this.setRange(options.range);

		if (knob.getStyle('position') == 'static') knob.setStyle('position', 'relative');
		knob.setStyle(this.property, -options.offset);
		modifiers[this.axis] = this.property;
		limit[this.axis] = [-options.offset, this.full - options.offset];

		var dragOptions = {
			snap: 0,
			limit: limit,
			modifiers: modifiers,
			onDrag: this.draggedKnob,
			onStart: this.draggedKnob,
			onBeforeStart: (function(){
				this.isDragging = true;
			}).bind(this),
			onCancel: function(){
				this.isDragging = false;
			}.bind(this),
			onComplete: function(){
				this.isDragging = false;
				this.draggedKnob();
				this.end();
			}.bind(this)
		};
		if (options.snap) this.setSnap(dragOptions);

		this.drag = new Drag(knob, dragOptions);
		this.attach();
		if (options.initialStep != null) this.set(options.initialStep);
	},

	attach: function(){
		this.element.addEvent('mousedown', this.clickedElement);
		if (this.options.wheel) this.element.addEvent('mousewheel', this.scrolledElement);
		this.drag.attach();
		return this;
	},

	detach: function(){
		this.element.removeEvent('mousedown', this.clickedElement)
			.removeEvent('mousewheel', this.scrolledElement);
		this.drag.detach();
		return this;
	},

	autosize: function(){
		this.setSliderDimensions().setKnobPosition(this.toPosition(this.step));
		this.drag.options.limit[this.axis] = [-this.options.offset, this.full - this.options.offset];
		if (this.options.snap) this.setSnap();
		return this;
	},

	setSnap: function(options){
		if (!options) options = this.drag.options;
		options.grid = Math.ceil(this.stepWidth);
		options.limit[this.axis][1] = this.full;
		return this;
	},

	setKnobPosition: function(position){
		
		if (this.options.snap) position = this.toPosition(this.step);
		if(!isNaN(position)) this.knob.setStyle(this.property, position);
		return this;
	},

	setSliderDimensions: function(){
		this.full = this.element.measure(function(){
			this.half = this.knob[this.offset] / 2;
			return this.element[this.offset] - this.knob[this.offset] + (this.options.offset * 2);
		}.bind(this));
		return this;
	},

	set: function(step){
		if (!((this.range > 0) ^ (step < this.min))) step = this.min;
		if (!((this.range > 0) ^ (step > this.max))) step = this.max;

		this.step = Math.round(step);
		return this.checkStep()
			.fireEvent('tick', this.toPosition(this.step))
			.end();
	},

	setRange: function(range, pos){
		this.min = Array.pick([range[0], 0]);
		this.max = Array.pick([range[1], this.options.steps]);
		this.range = this.max - this.min;
		this.steps = this.options.steps || this.full;
		this.stepSize = Math.abs(this.range) / this.steps;
		this.stepWidth = this.stepSize * this.full / Math.abs(this.range);
		if (range) this.set(Array.pick([pos, this.step]).floor(this.min).max(this.max));
		return this;
	},

	clickedElement: function(event){
		if (this.isDragging || event.target == this.knob) return;

		var dir = this.range < 0 ? -1 : 1,
			position = event.page[this.axis] - this.element.getPosition()[this.axis] - this.half;

		position = position.limit(-this.options.offset, this.full - this.options.offset);

		this.step = Math.round(this.min + dir * this.toStep(position));

		this.checkStep()
			.fireEvent('tick', position)
			.end();
	},

	scrolledElement: function(event){
		var mode = (this.options.mode == 'horizontal') ? (event.wheel < 0) : (event.wheel > 0);
		this.set(this.step + (mode ? -1 : 1) * this.stepSize);
		event.stop();
	},

	draggedKnob: function(){
		var dir = this.range < 0 ? -1 : 1,
			position = this.drag.value.now[this.axis];

		position = position.limit(-this.options.offset, this.full -this.options.offset);

		this.step = Math.round(this.min + dir * this.toStep(position));
		this.checkStep();
	},

	checkStep: function(){
		var step = this.step;
		if (this.previousChange != step){
			this.previousChange = step;
			this.fireEvent('change', step);
		}
		return this;
	},

	end: function(){
		var step = this.step;
		if (this.previousEnd !== step){
			this.previousEnd = step;
			this.fireEvent('complete', step + '');
		}
		return this;
	},

	toStep: function(position){
		var step = (position + this.options.offset) * this.stepSize / this.full * this.steps;
		return this.options.steps ? Math.round(step -= step % this.stepSize) : step;
	},

	toPosition: function(step){
		return (this.full * Math.abs(this.min - step)) / (this.steps * this.stepSize) - this.options.offset;
	}

});/*
---

script: Assets.js

name: Assets

description: Provides methods to dynamically load JavaScript, CSS, and Image files into the document.

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Element.Event
  - /MooTools.More

provides: [Assets]

...
*/

var Asset = {

	javascript: function(source, properties){
		if (!properties) properties = {};

		var script = new Element('script', {src: source, type: 'text/javascript'}),
			doc = properties.document || document,
			loaded = 0,
			loadEvent = properties.onload || properties.onLoad;

		var load = loadEvent ? function(){ // make sure we only call the event once
			if (++loaded == 1) loadEvent.call(this);
		} : function(){};

		delete properties.onload;
		delete properties.onLoad;
		delete properties.document;

		return script.addEvents({
			load: load,
			readystatechange: function(){
				if (['loaded', 'complete'].contains(this.readyState)) load.call(this);
			}
		}).set(properties).inject(doc.head);
	},

	css: function(source, properties){
		if (!properties) properties = {};

		var link = new Element('link', {
			rel: 'stylesheet',
			media: 'screen',
			type: 'text/css',
			href: source
		});

		var load = properties.onload || properties.onLoad,
			doc = properties.document || document;

		delete properties.onload;
		delete properties.onLoad;
		delete properties.document;

		if (load) link.addEvent('load', load);
		return link.set(properties).inject(doc.head);
	},

	image: function(source, properties){
		if (!properties) properties = {};

		var image = new Image(),
			element = document.id(image) || new Element('img');

		['load', 'abort', 'error'].each(function(name){
			var type = 'on' + name,
				cap = 'on' + name.capitalize(),
				event = properties[type] || properties[cap] || function(){};

			delete properties[cap];
			delete properties[type];

			image[type] = function(){
				if (!image) return;
				if (!element.parentNode){
					element.width = image.width;
					element.height = image.height;
				}
				image = image.onload = image.onabort = image.onerror = null;
				event.delay(1, element, element);
				element.fireEvent(name, element, 1);
			};
		});

		image.src = element.src = source;
		if (image && image.complete) image.onload.delay(1);
		return element.set(properties);
	},

	images: function(sources, options){
		sources = Array.from(sources);

		var fn = function(){},
			counter = 0;

		options = Object.merge({
			onComplete: fn,
			onProgress: fn,
			onError: fn,
			properties: {}
		}, options);

		return new Elements(sources.map(function(source, index){
			return Asset.image(source, Object.append(options.properties, {
				onload: function(){
					counter++;
					options.onProgress.call(this, counter, index, source);
					if (counter == sources.length) options.onComplete();
				},
				onerror: function(){
					counter++;
					options.onError.call(this, counter, index, source);
					if (counter == sources.length) options.onComplete();
				}
			}));
		}));
	}

};

/** 
	mootools-ext.js
	contiene los validadores custom que se añaden a las librerías de mootools
	(no se incluyen en el more estandar)
**/

Form.Validator.addAllThese(
	[
	 ["validate-cp",
	 {
	    errorMsg: Form.Validator.getMsg.pass("cp"),
	    test: function(a)
		{
			var cps = {
				ES:'^[0-9]{5}$',
				IC:'^[0-9]{5}$',
				FR:'^[0-9]{5}$',
				DE:'^[0-9]{5}$',
				IT:'^[0-9]{5}$',
				PT:'^[0-9]{4}(-[0-9]{3})$',
				GB:'^(GIR 0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]|[A-HK-Y][0-9]([0-9]|[ABEHMNPRV-Y]))|[0-9][A-HJKS-UW]) [0-9][ABD-HJLNP-UW-Z]{2})$',
				AT:'^[0-9]{4}$',
				BE:'^[0-9]{4}$',
				NL:'^[0-9]{4}[A-Z]{2}$',
				PL:'^[0-9]{2}-[0-9]{3}$',
				DK:'^[0-9]{4}$',
				SE:'^(SE-)?[0-9]{3}[ ]?[0-9]{2}$',
				IE:'^[D][0-9]{1,2}[W]{0,1}$',
				MC:'^98[0-9]{3}$',
				LU:'^[0-9]{4}$',
				CH:'^[0-9]{4}$',
				GR:'^[0-9]{5}$',
				HN:'^[0-9]{5}|[A-Z]{2}[0-9]{4}$'
			};
			
			var er = new RegExp(cps[$('storeCountryABBR').get('value')], 'gi');
			
			//Caso especial para Irlanda
			if($('storeCountryABBR').get('value')=='IE'&&a.get('value').trim()=='')
			{
				a.set('value','-');
				return (true);
			}
			//Caso especial para Suecia
			else if($('storeCountryABBR').get('value')=='SE')
			{
				a.set('value', a.get('value').replace(' ',''));
				return Form.Validator.getValidator("IsEmpty").test(a)||er.test(a.get("value"));
			}
			else
			{
				return Form.Validator.getValidator("IsEmpty").test(a)||er.test(a.get("value"));
			}
		}
		
	}],

	["validate-phone",
	  {errorMsg:Form.Validator.getMsg.pass("phone"),
		test:function(a){
		 	var prePhone = a.getPrevious('input');
		 	var phone = a;
		 	var valPrePhone = (/^\+[0-9]{1,3}$/.test(prePhone.get("value")));
		 	var valPhone = (/^[0-9]+$/.test(a.get("value")));
			if(a.get("value")&&prePhone.get("value"))
				return valPrePhone && valPhone;
			else
				return true;
			//return (Form.Validator.getValidator("IsEmpty").test(prePhone)&&Form.Validator.getValidator("IsEmpty").test(phone)) || 
		 	//		(valPrePhone && valPhone);
	 	}
	}],
	 
	["validate-cvv", 
	{ 
		errorMsg: function(element){
			return Form.Validator.getMsg("cvv");
			},
		test: function(element){
			var typePayment = $('typePayment').get('value').toUpperCase();
			if(typePayment=='VISA' || typePayment=='MASTERCARD')
			{
				return Form.Validator.getValidator('IsEmpty').test(element) || (/^[0-9]{3}$/.test(element.get('value')));
			}
			else if (typePayment=='AMEX')
			{
				return Form.Validator.getValidator('IsEmpty').test(element) || (/^[0-9]{4}$/.test(element.get('value')));
			}
			else if(typePayment=='GIFTCARD')
			{
				return Form.Validator.getValidator('IsEmpty').test(element) || (/^[0-9]{2,3}$/.test(element.get('value')));
			}
		}
	  }],
	  
	["validate-groupDate",
	  {
		errorMsg: Form.Validator.getMsg.pass("dateInFormatMDY"),
		//errorMsg: Form.Validator.getMsg.pass("required"),
		test: function(a) {
			var day = a.getParent().getElement('#day').get('value');
			var month = a.getParent().getElement('#month').get('value');
			var year = a.getParent().getElement('#year').get('value');
			
			//Si está vacío: fecha incorrecta
			if(day.trim()=='' || month.trim()=='' || year.trim()=='')
			{
				return(false);
			} 
		
			// test year range
			if (year < 1000 || year > 3000) {return (false);}
			
			if(month==12)
				month =0;
			else
				month = month-1;
			
			// convert txtDate to milliseconds
			var mSeconds = (new Date(year, month, day)).getTime();
			// initialize Date() object from calculated milliseconds
			var objDate = new Date();
			objDate.setTime(mSeconds);
			
			// compare input date and parts from Date() object
			// if difference exists then date isn't valid
			if (objDate.getFullYear().toInt() !== year.toInt() ||
				objDate.getMonth().toInt() !== month.toInt() ||
				objDate.getDate().toInt() !== day.toInt()) {
				return(false);
			}
			
			// otherwise return true
			return(true);
		}
	}],
	  
	["validate-numBox",
	  {
		errorMsg: Form.Validator.getMsg.pass("numBox"),
		test: function(a) {
			var tempValue = a.get('value');
			return(Form.Validator.getValidator('required').test(a) && Form.Validator.getValidator('validate-integer').test(a) &&  tempValue>0);
		}			
	}],
	  
	["validate-dropBox",
	  {
		errorMsg: Form.Validator.getMsg.pass("dropBox"),
		test: function(a) {
			var retorno = false;
			var tempValue = a.get('value');
			
			while(tempValue.length<10)
			{
				tempValue="0"+tempValue;
			}
			
			if (tempValue.length != 10 || isNaN(tempValue))
			{
				retorno = false;
			}
			else
			{
				// Paso 1
				var valorPaso1 = 0;
				for (var i=8; i>=0; i=i-2)
				{
					valorPaso1 = valorPaso1 + parseInt(tempValue.charAt(i));
				}

				// Paso 2
				var valorPaso2 = valorPaso1 * 4;

				// Paso 3
				var valorPaso3 = 0;
				for (var i=7; i>=1; i=i-2)
				{
					valorPaso3 = valorPaso3 + parseInt(tempValue.charAt(i));
				}
				
				// Paso 4
				var valorPaso4 = valorPaso3 * 9;
				
				// Paso 5
				var valorPaso5 = valorPaso2 + valorPaso4;
				var valorPaso6 = parseInt(valorPaso5) + parseInt(tempValue.charAt(9));
				if (valorPaso6 % 10 == 0)
				{
					retorno = true;
				}
				else
				{
					retorno = false;
				}
			}
			return(Form.Validator.getValidator('IsEmpty').test(a) || retorno);
		}			
	   }]
	]
);
/** 
	mootools-langext.js
	
	Contiene las cadenas de internacionalización para mootools. 
	Se añaden en este fichero aparte para evitar problemas al bajarse futuras versiones del mootools more
	IMPORTANTE: Al actualizar la librería mootools-more no será necesario bajarse los locale de ningún idioma, ya se incluyen aquí	
			Aquí también se fija el Locale (idioma actual)
**/
	
// English - USA
Locale.define('en-US', 'Date', {
	months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	months_abbr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	days_abbr: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

	// Culture's date order: MM/DD/YYYY
	dateOrder: ['month', 'date', 'year'],
	shortDate: '%m/%d/%Y',
	shortTime: '%I:%M%p',
	AM: 'AM',
	PM: 'PM',
	firstDayOfWeek: 0,

	// Date.Extras
	ordinal: function(dayOfMonth){
		// 1st, 2nd, 3rd, etc.
		return (dayOfMonth > 3 && dayOfMonth < 21) ? 'th' : ['th', 'st', 'nd', 'rd', 'th'][Math.min(dayOfMonth % 10, 4)];
	},

	lessThanMinuteAgo: 'less than a minute ago',
	minuteAgo: 'about a minute ago',
	minutesAgo: '{delta} minutes ago',
	hourAgo: 'about an hour ago',
	hoursAgo: 'about {delta} hours ago',
	dayAgo: '1 day ago',
	daysAgo: '{delta} days ago',
	weekAgo: '1 week ago',
	weeksAgo: '{delta} weeks ago',
	monthAgo: '1 month ago',
	monthsAgo: '{delta} months ago',
	yearAgo: '1 year ago',
	yearsAgo: '{delta} years ago',

	lessThanMinuteUntil: 'less than a minute from now',
	minuteUntil: 'about a minute from now',
	minutesUntil: '{delta} minutes from now',
	hourUntil: 'about an hour from now',
	hoursUntil: 'about {delta} hours from now',
	dayUntil: '1 day from now',
	daysUntil: '{delta} days from now',
	weekUntil: '1 week from now',
	weeksUntil: '{delta} weeks from now',
	monthUntil: '1 month from now',
	monthsUntil: '{delta} months from now',
	yearUntil: '1 year from now',
	yearsUntil: '{delta} years from now'
});

Locale.define('en-US', 'FormValidator', {
	required: 'This field is required.',
	minLength: 'Please enter at least {minLength} characters (you entered {length} characters).',
	maxLength: 'Please enter no more than {maxLength} characters (you entered {length} characters).',
	integer: 'Please enter an integer in this field. Numbers with decimals (e.g. 1.25) are not permitted.',
	numeric: 'Please enter only numeric values in this field (i.e. "1" or "1.1" or "-1" or "-1.1").',
	digits: 'Please use numbers and punctuation only in this field (for example, a phone number with dashes or dots is permitted).',
	alpha: 'Please use only letters (a-z) within this field. No spaces or other characters are allowed.',
	alphanum: 'Please use only letters (a-z) or numbers (0-9) in this field. No spaces or other characters are allowed.',
	dateSuchAs: 'Please enter a valid date such as {date}',
	dateInFormatMDY: 'Please enter a valid date such as MM/DD/YYYY (i.e. "12/31/1999")',	
	email: 'Please enter a valid email address. For example "fred@domain.com".',
	url: 'Please enter a valid URL such as http://www.example.com.',
	currencyDollar: 'Please enter a valid $ amount. For example $100.00 .',
	oneRequired: 'Please enter something for at least one of these inputs.',
	errorPrefix: 'Error: ',
	warningPrefix: 'Warning: ',
	
	// Form.Validator.Extras
	noSpace: 'There can be no spaces in this input.',
	reqChkByNode: 'No items are selected.',
	requiredChk: 'This field is required.',
	reqChkByName: 'Please select a {label}.',
	match: 'This field needs to match the {matchName} field',
	startDate: 'the start date',
	endDate: 'the end date',
	currendDate: 'the current date',
	afterDate: 'The date should be the same or after {label}.',
	beforeDate: 'The date should be the same or before {label}.',
	startMonth: 'Please select a start month',
	sameMonth: 'These two dates must be in the same month - you must change one or the other.',
	creditcard: 'The credit card number entered is invalid',
	
	//Custom
	cp: 'Incorrect postal code',
	cvv: 'Incorrect CVV2 code',
	phone: 'Incorrect telephone number',
	password:'8 character minimun, including at least one letter and one number',
	numBox: 'At least one box should be entered',
	dropBox: 'Identification number is not valid. Please try again.'
});


//Español - ESPAÑA
Locale.define('es-ES', 'Date', {

	months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
	months_abbr: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
	days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
	days_abbr: ['dom', 'lun', 'mar', 'mié', 'juv', 'vie', 'sáb'],

	// Culture's date order: DD/MM/YYYY
	dateOrder: ['date', 'month', 'year'],
	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M',
	AM: 'AM',
	PM: 'PM',
	firstDayOfWeek: 1,

	// Date.Extras
	ordinal: '',

	lessThanMinuteAgo: 'hace menos de un minuto',
	minuteAgo: 'hace un minuto',
	minutesAgo: 'hace {delta} minutos',
	hourAgo: 'hace una hora',
	hoursAgo: 'hace unas {delta} horas',
	dayAgo: 'hace un día',
	daysAgo: 'hace {delta} días',
	weekAgo: 'hace una semana',
	weeksAgo: 'hace unas {delta} semanas',
	monthAgo: 'hace un mes',
	monthsAgo: 'hace {delta} meses',
	yearAgo: 'hace un año',
	yearsAgo: 'hace {delta} años',

	lessThanMinuteUntil: 'menos de un minuto desde ahora',
	minuteUntil: 'un minuto desde ahora',
	minutesUntil: '{delta} minutos desde ahora',
	hourUntil: 'una hora desde ahora',
	hoursUntil: 'unas {delta} horas desde ahora',
	dayUntil: 'un día desde ahora',
	daysUntil: '{delta} días desde ahora',
	weekUntil: 'una semana desde ahora',
	weeksUntil: 'unas {delta} semanas desde ahora',
	monthUntil: 'un mes desde ahora',
	monthsUntil: '{delta} meses desde ahora',
	yearUntil: 'un año desde ahora',
	yearsUntil: '{delta} años desde ahora'

});

Locale.define('es-ES', 'FormValidator', {
	required: 'Este campo es obligatorio.',
	minLength: 'Por favor introduce al menos {minLength} caracteres (has introducido {length} caracteres).',
	maxLength: 'Por favor introduce no m&aacute;s de {maxLength} caracteres (has introducido {length} caracteres).',
	integer: 'Por favor introduce un n&uacute;mero entero en este campo. N&uacute;meros con decimales (p.e. 1,25) no se permiten.',
	numeric: 'Por favor introduce solo valores num&eacute;ricos en este campo (p.e. "1" o "1,1" o "-1" o "-1,1").',
	digits: 'Por favor usa solo n&uacute;meros y signos de puntuaci&oacute;n en este campo (por ejemplo, un n&uacute;mero de tel&eacute;fono con guiones y puntos no est&aacute; permitido).',
	alpha: 'Por favor usa letras solo (a-z) en este campo. No se admiten espacios ni otros caracteres.',
	alphanum: 'Por favor, usa solo letras (a-z) o n&uacute;meros (0-9) en este campo. No se admiten espacios ni otros caracteres.',
	dateSuchAs: 'Por favor introduce una fecha v&aacute;lida como {date}',
	dateInFormatMDY: 'Por favor introduce una fecha v&aacute;lida como DD/MM/AAAA (p.e. "31/12/1999")',
	email: 'Por favor, introduce una direcci&oacute;n de email v&aacute;lida. Por ejemplo, "fred@domain.com".',
	url: 'Por favor introduce una URL v&aacute;lida como http://www.example.com.',
	currencyDollar: 'Por favor introduce una cantidad v&aacute;lida de €. Por ejemplo €100,00 .',
	oneRequired: 'Por favor introduce algo para por lo menos una de estas entradas.',
	errorPrefix: 'Error: ',
	warningPrefix: 'Aviso: ',
	
	// Form.Validator.Extras
	noSpace: 'No puede haber espacios en esta entrada.',
	reqChkByNode: 'No hay elementos seleccionados.',
	requiredChk: 'Este campo es obligatorio.',
	reqChkByName: 'Por favor selecciona una {label}.',
	match: 'Este campo necesita coincidir con el campo {matchName}',
	startDate: 'la fecha de inicio',
	endDate: 'la fecha de fin',
	currendDate: 'la fecha actual',
	afterDate: 'La fecha debe ser igual o posterior a {label}.',
	beforeDate: 'La fecha debe ser igual o anterior a {label}.',
	startMonth: 'Por favor selecciona un mes de origen',
	sameMonth: 'Estas dos fechas deben estar en el mismo mes - debes cambiar una u otra.',
	creditcard: 'El número de tarjeta de crédito introducido no es válido',
	
	//Custom
	cp: 'El código postal es incorrecto',
	cvv: 'Código CVV incorrecto',
	phone: 'Número de teléfono incorrecto',
	password:'Mínimo 8 caracteres, incluyendo al menos una letra y un número',
	numBox: 'Debes introducir al menos una caja',
	dropBox: 'Identification number not valid'
});


//Francés - FRANCIA
Locale.define('fr-FR', 'Date', {

	months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
	months_abbr: ['jan', 'fev', 'mar', 'avr', 'mai', 'jun', 'jul', 'aou', 'sep', 'oct', 'nov', 'dec'],
	days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
	days_abbr: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'],

	// Culture's date order: DD/MM/YYYY
	dateOrder: ['date', 'month', 'year'],
	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M',
	AM: 'AM',
	PM: 'PM',
	firstDayOfWeek: 1,

	// Date.Extras
	ordinal: 'º',

	lessThanMinuteAgo: 'Il y a moins d’une minute',
	minuteAgo: 'Il y a une minute',
	minutesAgo: 'Il y a {delta} minutes',
	hourAgo: 'Il y a une heure',
	hoursAgo: 'Il y a {delta} heures',
	dayAgo: 'Il y a un jour',
	daysAgo: 'Il y a {delta} jours',
	weekAgo: 'Il y a une semaine',
	weeksAgo: 'Il y a {delta} semaines',
	monthAgo: 'Il y a un mois',
	monthsAgo: 'Il y a {delta} mois',
	yearAgo: 'Il y a un an',
	yearsAgo: 'Il y a {delta} ans',

	lessThanMinuteUntil: 'moins d’une minute à partir de maintenant',
	minuteUntil: 'une minute à partir de maintenant',
	minutesUntil: '{delta} minutes à partir de maintenant',
	hourUntil: 'une heure à partir de maintenant',
	hoursUntil: ' {delta} heures à partir de maintenant',
	dayUntil: 'un jour à partir de maintenant',
	daysUntil: '{delta} jours à partir de maintenant',
	weekUntil: 'une semaine à partir de maintenant',
	weeksUntil: '{delta} semaines à partir de maintenant',
	monthUntil: 'un mois à partir de maintenant',
	monthsUntil: '{delta} mois à partir de maintenant',
	yearUntil: 'un an à partir de maintenant',
	yearsUntil: '{delta} ans à partir de maintenant'

});

Locale.define('fr-FR', 'FormValidator', {
	required: 'Ce champ est obligatoire.',
	minLength: 'Introduisez au moins {minLength} caractères (vous avez introduit {length} caractères).',
	maxLength: 'N’introduisez pas plus de {maxLength} caractères (Vous avez introduit {length} caractères).',
	integer: 'Introduisez un numéro entier dans ce champ. Les numéros décimaux (ex. 1,25) ne sont pas autorisés.',
	numeric: 'Introduisez seulement des valeurs numériques dans ce champ (ex. "1" o "1,1" o "-1" o "-1,1").',
	digits: 'Introduisez seulement des numéros et de la ponctuation dans ce champ (Les numéros de téléphones avec des symboles et des points ne sont pas autorisés).',
	alpha: 'Utilisez seulement les lettres (a-z) dans ce champ. Les espaces et autres caractères ne sont pas autorisés.',
	alphanum: 'Utilisez seulement les lettres (a-z) ou les numéros (0-9) dans ce champ. Les espaces et autres caractères ne sont pas autorisés.',
	dateSuchAs: 'Introduisez une date valide comme {date}',
	dateInFormatMDY: 'Introduisez une date valide comme DD/MM/YYYY (ex. "31/12/1999")',
	email: 'Introduisez une adresse e-mail valide. Par exemple, "fred@domain.com".',
	url: 'Introduisez une URL valide comme http://www.example.com.',
	currencyDollar: 'Introduisez une quantité valide de €. Par exemple  €100,00 .',
	oneRequired: 'Introduisez quelque chose pour au moins une de ces entrées.',
	errorPrefix: 'Erreur: ',
	warningPrefix: 'Avertissement: ',

	// Form.Validator.Extras
	noSpace: 'Il ne peut pas y avoir d’espace dans cette entrée.',
	reqChkByNode: 'Il n’y a pas d’éléments sélectionnés.',
	requiredChk: 'Ce champ est obligatoire.',
	reqChkByName: 'Sélectionnez une {label}.',
	match: 'Ce champ doit être le même que le champ {matchName}',
	startDate: 'Date de début',
	endDate: 'Date de fin',
	currendDate: 'Date actuelle',
	afterDate: 'La date doit être égale ou postérieure a {label}.',
	beforeDate: 'La date doit être égale ou antérieure a {label}.',
	startMonth: 'Sélectionnez un mois d’origine',
	sameMonth: 'Ces deux dates doivent être dans le même mois – vous devez changer l’une ou l’autre.',
	creditcard: 'le numéro de la carte de crédit que vous avez introduit n’est pas valide',
	
	//Custom
	cp: 'Le code postal est incorrect',
	cvv: 'le code CVV est incorrect',
	phone: 'Le numéro de téléphone est incorrect',
	password:'8 caractères mínimum, avec au moins une lettre et un numéro',
	numBox: 'Vous devez introduire au moins une boîte',
	dropBox: 'Identification number not valid'
});


//Portugués - PORTUGAL
Locale.define('pt-PT', 'Date', {
months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
	months_abbr: ['jan', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
	days: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta- feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
	days_abbr: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],

	// Culture's date order: DD/MM/YYYY
	dateOrder: ['date', 'month', 'year'],
	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M',
	AM: 'AM',
	PM: 'PM',
	firstDayOfWeek: 1,

	// Date.Extras
	ordinal: 'º',

	lessThanMinuteAgo: 'há menos de um minuto atrás',
	minuteAgo: 'há um minuto atrás',
	minutesAgo: 'há {delta} minutos atrás ',
	hourAgo: 'há uma hora atrás',
	hoursAgo: ' há algumas{delta} horas atrás ',
	dayAgo: 'há um dia atrás',
	daysAgo: 'há uns {delta} dias atrás',
	weekAgo: 'há uma semana atrás',
	weeksAgo: 'há umas {delta} semanas atrás',
	monthAgo: 'há um mês atrás',
	monthsAgo: 'há uns  {delta} meses atrás',
	yearAgo: 'há um ano atrás',
	yearsAgo: 'há alguns {delta} anos atrás',

	lessThanMinuteUntil: 'menos de um minuto, desde agora',
	minuteUntil: 'um minuto, desde agora',
	minutesUntil: '{delta} minutos, desde agora',
	hourUntil: 'uma hora, desde agora',
	hoursUntil: 'umas {delta} horas, desde agora',
	dayUntil: 'um dia, desde agora',
	daysUntil: '{delta} dias, desde agora',
	weekUntil: 'uma semana, desde agora',
	weeksUntil: 'umas {delta} semanas, desde agora',
	monthUntil: 'um mês ,desde agora',
	monthsUntil: '{delta} meses, desde agora',
	yearUntil: 'um ano, desde agora',
	yearsUntil: '{delta} anos, desde agora'
});



Locale.define('pt-PT', 'FormValidator', {
	required: 'Este campo é obrigatório.',
	minLength: 'Por favor introduza pelo menos {minLength} caractéres (introduziu {length} caractéres).',
	maxLength: 'Por favor não introduza mais que {maxLength} caractéres (introduziu {length} caractéres).',
	integer: 'Por favor introduza um número inteiro neste campo. Números com décimais (p.e. 1,25) não são permitidos.',
	numeric: 'Por favor introduza os valores numéricos neste  campo (p.e. "1" o "1,1" o "-1" o "-1,1").',
	digits: 'Por favor use somente números e pontuação  neste campo (por exemplo, um número de telefone com guião y pontos não está permitido).',
	alpha: 'Por favor, use letras somente (a-z) neste  campo. Não são permitidos espaços nem outros caractéres.',
	alphanum: 'Por favor, use somente letras (a-z) ou números (0-9) neste  campo. Não são permitidos espaços nem outros caractéres.',
	dateSuchAs: 'Por favor introduza uma data válida como {date}',
	dateInFormatMDY: 'Por favor, introduza uma data válida como DD/MM/YYYY (p.e. "31/12/1999")',
	email: 'Por favor, introduza uma direcção de e-mail válida. Por exemplo, "fred@domain.com".',
	url: 'Por favor, introduza uma URL válida como http://www.example.com.',
	currencyDollar: 'Por favor, introduza uma quantidade válida de €. Por exemplo €100,00 .',
	oneRequired: 'Por favor, introduza algo em uma destas entradas.',
	errorPrefix: 'Erro: ',
	warningPrefix: 'Aviso: ',

	// Form.Validator.Extras
	noSpace: 'Não pode haver espaços nesta entrada.',
	reqChkByNode: 'Não há elementos seleccionados.',
	requiredChk: 'Este campo é obrigatório.',
	reqChkByName: 'Por favor, seleccione uma {label}.',
	match: 'Este campo, necessita coincidir com o seguinte campo {matchName}',
	startDate: 'A data de início',
	endDate: 'A data de finalização',
	currendDate: 'A data actual',
	afterDate: 'A data deve ser igual ou posterior a {label}.',
	beforeDate: 'A data deve ser igual ou anterior a {label}.',
	startMonth: 'Por favor selecione um mês de origem',
	sameMonth: 'Estas duas datas devem estar no mesmo mês - deve trocar uma e outra.',
	creditcard: 'O número do cartão de crédito introduzido não é válido',
	
	//Custom
	cp: 'O código postal está incorrecto',
	cvv: 'Código CVV incorrecto',
	phone: 'Número de telefone incorrecto',
	password:'Mínimo 8 caracteres, inluindo pelo menos uma letra e um número',
	numBox: 'Deve introduzir no mínimo uma caixa',
	dropBox: 'Identification number not valid'
});


// Italiano - ITALIA
Locale.define('it-IT', 'Date', {
	months: ['Gennatio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
	months_abbr: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
	days: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sábato'],
	days_abbr: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],

	// Culture's date order: DD/MM/YYYY
	dateOrder: ['date', 'month', 'year'],
	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M',
	AM: 'AM',
	PM: 'PM',
	firstDayOfWeek: 1,

	// Date.Extras
	ordinal: 'º',

	lessThanMinuteAgo: 'da meno di un minuto',
	minuteAgo: 'da un minuto',
	minutesAgo: 'da {delta} minuti',
	hourAgo: 'da un’ ora',
	hoursAgo: 'da alcune {delta} ore',
	dayAgo: 'da un giorno',
	daysAgo: 'da {delta} giorni',
	weekAgo: 'da una settimana',
	weeksAgo: 'da alcune {delta} settimane',
	monthAgo: 'da un mese',
	monthsAgo: 'da {delta} mesi',
	yearAgo: 'da un anno',
	yearsAgo: 'da {delta} anni',

	lessThanMinuteUntil: 'meno di un minuto da adesso',
	minuteUntil: 'un minuto da adesso',
	minutesUntil: '{delta} minuti da adesso',
	hourUntil: 'un’ ora da adesso',
	hoursUntil: 'alcune {delta} ore da adesso',
	dayUntil: 'un giorno da adesso',
	daysUntil: '{delta} giorni da adesso',
	weekUntil: 'una settimana da adesso',
	weeksUntil: 'alcune {delta} settimane da adesso',
	monthUntil: 'un mese da adesso',
	monthsUntil: '{delta} mesi da adesso',
	yearUntil: 'un anno da adesso',
	yearsUntil: '{delta} anni da adesso'
});


Locale.define('it-IT', 'FormValidator', {
	required: 'Questo campo è obbligatorio.',
	minLength: 'Per favore introduci almeno {minLength} caratteri (hai introdotto {length} caratteri).',
	maxLength: 'Per favore introduci non più di {maxLength} caratteri (hai introdotto {length} caratteri).',
	integer: 'Per favore introduci un numero intero in questo campo. Numeri decimali (p.e. 1,25) non sono permessi.',
	numeric: 'Per favore introduci solo valori numerici in questo campo (p.e. "1" o "1,1" o "-1" o "-1,1").',
	digits: 'Per favore usa solo numeri e punteggiatura in questo campo (per esempio, un numero di telefono con trattini e punti non è permesso).',
	alpha: 'Per favore usa solo lettere (a-z) in questo campo. Non si ammettono spazi ne altri caratteri.',
	alphanum: 'Per favore, usa solo lettere (a-z) o numeri (0-9) in questo campo. Non si amemttono spazi ne altri caratteri.',
	dateSuchAs: 'Per favore introduci una data valida come {date}',
	dateInFormatMDY: 'Per favore introduci una data valida come DD/MM/YYYY (p.e. "31/12/1999")',
	email: 'Per favore, introduci un indirizzo e-mail valido. Per esempio, "fred@domain.com".',
	url: 'Per favore introduci una URL valida come http://www.example.com.',
	currencyDollar: 'Per favore introduci una quantità valida di €. Per esempio €100,00 .',
	oneRequired: 'Per favore introduci qualcosa  almeno per una di questa entrata.',
	errorPrefix: 'Errore: ',
	warningPrefix: 'Avviso: ',

	// Form.Validator.Extras
	noSpace: 'Non ci possono essere spazi per questa entrata.',
	reqChkByNode: 'Non ci sono elementi selezionati.',
	requiredChk: 'Questo campo è obbligatorio.',
	reqChkByName: 'Per favore seleziona una {label}.',
	match: 'Questo campo deve coincidire con il campo {matchName}',
	startDate: 'la data di inizio',
	endDate: 'la data di fine',
	currendDate: 'la data attuale',
	afterDate: 'La data deve essere uguale o posteriore a {label}.',
	beforeDate: 'La data deve essere uguale o anteriore a {label}.',
	startMonth: 'Per favore seleziona un mese di origine',
	sameMonth: 'Queste due date devono essere nello stesso mese - devi cambiare una o l’altra.',
	creditcard: 'Il numero di carta di credito introdotto non è valido',
	
	//Custom
	cp: 'Il códice postale è incorretto',
	cvv: 'Codice CVV incorretto',
	phone: 'Numero di telefono incorretto',
	password:'Minimo 8 caratteri, includendo almeno una lettera ed un numero',
	numBox: 'Devi introdurre almeno un pacco',
	dropBox: 'Identification number not valid'

});

//Alemán - ALEMANIA
Locale.define('de-DE', 'Date', {
months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember '],
	months_abbr: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'],
	days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
	days_abbr: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],

	// Culture's date order: DD/MM/YYYY
	dateOrder: ['date', 'month', 'year'],
	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M',
	AM: 'AM',
	PM: 'PM',
	firstDayOfWeek: 1,

	// Date.Extras
	ordinal: 'º',

	lessThanMinuteAgo: 'vor weniger als eine Minute',
	minuteAgo: 'vor einer Minute',
	minutesAgo: 'vor {delta} Minuten',
	hourAgo: 'vor einer Stunde',
	hoursAgo: 'vor {delta} Stunden',
	dayAgo: 'vor einem Tag',
	daysAgo: 'vor {delta} Tagen',
	weekAgo: 'vor einer Woche',
	weeksAgo: 'vor {delta} Wochen',
	monthAgo: 'vor einem Monat',
	monthsAgo: 'vor {delta} Monaten',
	yearAgo: 'vor einem Jahr',
	yearsAgo: 'vor {delta} Jahren',

	lessThanMinuteUntil: 'weniger als eine Minute von jetzt an',
	minuteUntil: 'eine Minute von jetzt an',
	minutesUntil: '{delta} Minuten von jetzt an',
	hourUntil: 'eine Stunde von jetzt an',
	hoursUntil: '{delta} Stunden von  jetzt an',
	dayUntil: 'ein Tag von jetzt an',
	daysUntil: '{delta} Tage von jetzt an',
	weekUntil: 'eine Woche von jetzt an',
	weeksUntil: '{delta} Wochen von jetzt an',
	monthUntil: 'ein Monat von jetzt an',
	monthsUntil: '{delta} Monaten von jetzt an',
	yearUntil: 'ein Jahr von jetzt an',
	yearsUntil: '{delta} Jahren von jetzt an'
});

Locale.define('de-DE', 'FormValidator', {
	required: 'Dieses Feld muss ausgefüllt werden.',
	minLength: 'Bitte geben Sie mindestens {minLength} Zeichensätze (eingegebene {length} Zeichensätze).',
	maxLength: 'Bitte geben Sie nicht mehr als {maxLength} Zeichensätze (eingegeben haben {length} Zeichensätze).',
	integer: 'Bitte geben Sie eine ganze Zahl in diesem Bereich. Zahlen mit Dezimalstellen (z.B. 1,25) sind nicht erlaubt.',
	numeric: 'Bitte geben Sie nur numerische Werte in diesem Feld (z.B. "1" o "1,1" o "-1" o "-1,1").',
	digits: 'Bitte verwenden Sie nur Zahlen und Satzzeichen in diesem Feld (zum Beispiel, eine Telefonnummer mit Strichen und Punkten ist nicht erlaubt).',
	alpha: 'Bitte verwenden Sie nur Buchstaben (a-z) in diesem Feld. Leerzeichen oder andere Zeichensätze sind nicht erlaubt.',
	alphanum: 'Bitte verwenden Sie nur Buchstaben (a-z) oder Zahlen (0-9) in diesem Feld. Leerzeichen oder andere Zeichen sind nicht erlaubt.',
	dateSuchAs: 'Bitte geben Sie ein gültiges Datum ein, so wie {date}',
	dateInFormatMDY: 'Bitte geben Sie ein gültiges Datum ein, so wie DD/MM/YYYY (z.B. "31/12/1999")',
	email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein. Zum Beispiel, "fred@domain.com".',
	url: 'Bitte geben Sie eine gültige URL ein, so wie http://www.example.com.',
	currencyDollar: 'Bitte geben Sie eine gültigen Betrag € ein. Zum Beispiel €100,00 .',
	oneRequired: 'Bitte geben Sie etwas, für mindestens einen dieser Felder, ein.',
	errorPrefix: 'Fehler: ',
	warningPrefix: 'Meldung: ',

	// Form.Validator.Extras
	noSpace: 'Es darf keine Leerzeichen in diesem Feld haben.',
	reqChkByNode: 'Keine Artikel ausgewählt.',
	requiredChk: 'Dieses Feld muss ausgefüllt werden.',
	reqChkByName: 'Bitte wählen Sie eine {label}.',
	match: 'Dieses Feld muss mit dem Feld {matchName} übereinstimmen.',
	startDate: 'Startdatum',
	endDate: ' Enddatum ',
	currendDate: 'das aktuelle Datum',
	afterDate: 'Das Datum muss gleich oder später sein als {label}.',
	beforeDate: 'Das Datum muss gleich oder früher sein als {label}.',
	startMonth: 'Bitte wählen Sie einen anfangs Monat',
	sameMonth: 'Diese beiden Daten müssen im selben Monat sein – Eine der zwei Daten muss geändert werden.',
	creditcard: 'Die eingefügte Kreditkartennummer ist ungültig',
	
	//Custom
	cp: 'Die Postleitzahl ist falsch',
	cvv: 'falscher CVV Code',
	phone: 'Falsche Telefonnummer',
	password:'Minimum 8 Stellen, mit mindestens einem Buchstaben und eine Ziffer',
	numBox: 'Sie müssen mindestens ein Paket eingeben',
	dropBox: 'Falsche Postnummer. Bitte nochmal versuchen.'

});


//Catalán - ESPAÑA
Locale.define('ca-ES', 'Date', {
	months: ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'],
	months_abbr: ['gen', 'feb', 'març', 'abr', 'maig', 'juny', 'jul', 'ago', 'set', 'oct', 'nov', 'des'],
	days: ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'],
	days_abbr: ['dg', 'dl', 'dm', 'dc', 'dj', 'dv', 'ds'],

	// Culture's date order: DD/MM/YYYY
	dateOrder: ['date', 'month', 'year'],
	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M',
	AM: 'AM',
	PM: 'PM',
	firstDayOfWeek: 1,

	// Date.Extras
	ordinal: 'º',

	lessThanMinuteAgo: 'fa menys d’un minut',
	minuteAgo: 'fa un minut',
	minutesAgo: 'fa {delta} minuts',
	hourAgo: 'fa una hora',
	hoursAgo: 'fa {delta} hores',
	dayAgo: 'fa un dia',
	daysAgo: 'fa {delta} dies',
	weekAgo: 'fa una setmana',
	weeksAgo: 'fa {delta} setmanes',
	monthAgo: 'fa un mes',
	monthsAgo: 'fa {delta} mesos',
	yearAgo: 'fa un any',
	yearsAgo: 'fa {delta} anys',

	lessThanMinuteUntil: 'd’aquí a menys d’un minut',
	minuteUntil: 'd’aquí a un minut',
	minutesUntil: 'd’aquí a {delta} minuts',
	hourUntil: 'd’aquí a una hora',
	hoursUntil: 'd’aquí a {delta} hores',
	dayUntil: 'd’aquí a un dia',
	daysUntil: 'd’aquí a {delta} dies',
	weekUntil: 'd’aquí a una setmana',
	weeksUntil: 'd’aquí a {delta} setmanes',
	monthUntil: 'd’aquí a un mes',
	monthsUntil: 'd’aquí a {delta} mesos',
	yearUntil: 'd’aquí a un any',
	yearsUntil: 'd’aquí a {delta} anys'

});

Locale.define('ca-ES', 'FormValidator', {
	required: 'Aquest camp és obligatori.',
	minLength: 'Cal introduir almenys {minLength} caràcters (hi ha {length} caràcters introduïts).',
	maxLength: 'Cal introduir no més de {maxLength} caràcters (hi ha {length} caràcters introduïts).',
	integer: 'Cal introduir un nombre enter en aquest camp. No estan permesos els nombres amb decimals (ex: 1,25) .',
	numeric: 'Cal introduir únicament valors numèrics en aquest camp (ex.: "1" o "1,1" o "-1" o "-1,1").',
	digits: 'Cal utilitzar únicament números i puntuació en aquest camp (per exemple, un número de telèfon amb guions i punts no està permès).',
	alpha: 'Cal utilitzar només lletres (a-z) en aquest camp. No s’admeten espais ni altres caràcters.',
	alphanum: 'Cal utilitzar només lletres (a-z) o números (0-9) en aquest camp. No s’admeten espais ni altres caràcters.',
	dateSuchAs: 'Cal introduir una data vàlida com a {date}',
	dateInFormatMDY: 'Cal introduir una data vàlida com a DD/MM/YYYY (ex.: "31/12/1999")',
	email: 'Cal introduir una adreça de correu electrònic vàlida. Per exemple, "fred@domain.com".',
	url: 'Cal introduir una URL vàlida com a http://www.example.com.',
	currencyDollar: 'Cal introduir una quantitat vàlida de €. Per exemple 100,00 €.',
	oneRequired: 'Cal introduir com a mínima alguna dada per a una d’aquestes entrades.',
	errorPrefix: 'Error: ',
	warningPrefix: 'Avís: ',
	
	// Form.Validator.Extras
	noSpace: 'No hi pot haver espais en aquesta entrada.',
	reqChkByNode: 'No hi ha cap element seleccionat.',
	requiredChk: 'Aquest camp és obligatori.',
	reqChkByName: 'Cal seleccionar una {label}.',
	match: 'Aquest camp ha de coincidir amb el camp {matchName}',
	startDate: 'data d’inici',
	endDate: 'data de final',
	currendDate: 'data actual',
	afterDate: 'La data ha de ser igual o posterior a {label}.',
	beforeDate: 'La data ha de ser igual o anterior a {label}.',
	startMonth: 'Cal seleccionar un mes d’origen',
	sameMonth: 'Aquestes dues dates han d’estar en el mateix mes. Cal canviar-ne una de les dues.',
	creditcard: 'El número de targeta de crèdit introduït no és vàlid',
	
	//Custom
	cp: 'El codi postal és incorrecte',
	cvv: 'El codi CVV és incorrecte',
	phone: 'El número de telèfon és incorrecte',
	password:'Mínim 8 caracters, incloent coma mínim una lletra i un número',
	numBox: 'Debes introducir al menos una caja Deus introduir com a mínim una caixa',
	dropBox: 'Identification number not valid'
});


//galego - ESPAÑA
Locale.define('gl-ES', 'Date', {
	months: ['Xaneiro', 'Febreiro', 'Marzo', 'Abril', 'Maio', 'Xuño', 'Xullo', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Decembro'],
	months_abbr: ['xan', 'feb', 'mar', 'abr', 'mai', 'xun', 'xul', 'ago', 'set', 'out', 'nov', 'dec'],
	days: ['Domingo', 'Luns', 'Martes', 'Mércores', 'Xoves', 'Venres', 'Sábado'],
	days_abbr: ['dom', 'lun', 'mar', 'mér', 'xov', 'ven', 'sáb'],

	// Culture's date order: DD/MM/YYYY
	dateOrder: ['date', 'month', 'year'],
	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M',
	AM: 'AM',
	PM: 'PM',
	firstDayOfWeek: 1,

	// Date.Extras
	ordinal: 'º',

	lessThanMinuteAgo: 'fai menos dun minuto',
	minuteAgo: 'fai un minuto',
	minutesAgo: 'fai {delta} minutos',
	hourAgo: 'fai unha hora',
	hoursAgo: 'fai unhas {delta} horas',
	dayAgo: 'fai un día',
	daysAgo: 'fai {delta} días',
	weekAgo: 'fai unha semana',
	weeksAgo: 'fai unhas {delta} semanas',
	monthAgo: 'fai un mes',
	monthsAgo: 'fai {delta} meses',
	yearAgo: 'fai un ano',
	yearsAgo: 'fai {delta} anos',

	lessThanMinuteUntil: 'menos dun minuto desde agora',
	minuteUntil: 'un minuto desde agora',
	minutesUntil: '{delta} minutos desde agora',
	hourUntil: 'unha hora desde agora',
	hoursUntil: 'unhas {delta} horas desde agora',
	dayUntil: 'un día desde agora',
	daysUntil: '{delta} días desde agora',
	weekUntil: 'unha semana desde agora',
	weeksUntil: 'unhas {delta} semanas desde agora',
	monthUntil: 'un mes desde agora',
	monthsUntil: '{delta} meses desde agora',
	yearUntil: 'un ano desde agora',
	yearsUntil: '{delta} anos desde agora'


});

Locale.define('gl-ES', 'FormValidator', {
	required: 'Este campo é obligatorio.',
	minLength: 'Por favor introduce polo menos {minLength} caracteres (introduciches {length} caracteres).',
	maxLength: 'Por favor introduce non máis de {maxLength} caracteres (introduciches {length} caracteres).',
	integer: 'Por favor introduce un número enteiro neste campo. Números con decimáis (p.e. 1,25) non se permiten.',
	numeric: 'Por favor introduce só valores numéricos neste campo (p.e. "1" o "1,1" o "-1" o "-1,1").',
	digits: 'Por favor usa só números e puntuación neste campo (por exemplo, un número de teléfono con guións e puntos non está permitido).',
	alpha: 'Por favor usa letras só (a-z) neste campo. Non se admiten espazos nin outros caracteres.',
	alphanum: 'Por favor, usa só letras (a-z) ou números (0-9) neste campo. Non se admiten espazos nin outros caracteres.',
	dateSuchAs: 'Por favor introduce unha data válida como {date}',
	dateInFormatMDY: 'Por favor introduce unha data válida como DD/MM/YYYY (p.e. "31/12/1999")',
	email: 'Por favor, introduce unha dirección de e-mail válida. Por exemplo, "fred@domain.com".',
	url: 'Por favor introduce unha URL válida como http://www.example.com.',
	currencyDollar: 'Por favor introduce unha cantidad válida de €. Por exemplo €100,00 .',
	oneRequired: 'Por favor introduce algo para polo menos unha destas entradas.',
	errorPrefix: 'Erro: ',
	warningPrefix: 'Aviso: ',

	// Form.Validator.Extras
	noSpace: 'Non pode haber espazos nesta entrada.',
	reqChkByNode: 'Non hai elementos seleccionados.',
	requiredChk: 'Este campo é obligatorio.',
	reqChkByName: 'Por favor selecciona unha {label}.',
	match: 'Este campo necesita coincidir co campo {matchName}',
	startDate: 'A data de inicio',
	endDate: 'A data de fin',
	currendDate: 'A data actual',
	afterDate: 'A data debe ser igual ou posterior a {label}.',
	beforeDate: 'A data debe ser igual ou anterior a {label}.',
	startMonth: 'Por favor selecciona un mes de orixe',
	sameMonth: 'Estas dúas datas deben estar no mesmo mes - debes cambiar unha ou outra.',
	creditcard: 'O número de tarxeta de crédito introducido non é válido',
	
	//Custom
	cp: 'O código postal é incorrecto',
	cvv: 'Código CVV incorrecto',
	phone: 'Número de teléfono incorrecto',
	password:'Mínimo 8 caracteres, inluíndo polo menos unha letra e un número',
	numBox: 'Debes introducir polo menos un bulto',
	dropBox: 'Identification number not valid'
});
	

//euskera - ESPAÑA (traducir-EUSKERA)
Locale.define('es-ES', 'Date', {
	months: ['Urtarrila', 'Otsaila', 'Martxoa', 'Apirila', 'Maiatza', 'Ekaina', 'Uztaila', 'Abuztua', 'Iraila', 'Urria', 'Azaroa', 'Abendua'],
	months_abbr: ['urt.', 'ots.', 'mar.', 'api.', 'mai.', 'eka.', 'uzt.', 'abuz.', 'ira.', 'urr.', 'aza.', 'abe.'],
	days: ['Igandea', 'Astelehena', 'Asteartea', 'Asteazkena', 'Osteguna', 'Ostirala', 'Larunbata'],
	days_abbr: ['ig.', 'al.', 'ar.', 'az.', 'og.', 'ol.', 'lr.'],

	// Culture's date order: DD/MM/YYYY
	dateOrder: ['date', 'month', 'year'],
	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M',
	AM: 'AM',
	PM: 'PM',
	firstDayOfWeek: 1,

	// Date.Extras
	ordinal: 'º',

	lessThanMinuteAgo: 'duela minutu bat baino gutxiago',
	minuteAgo: 'duela minutu bat',
	minutesAgo: 'duela {delta} minutu',
	hourAgo: 'duela ordubete',
	hoursAgo: 'duela {delta} ordu',
	dayAgo: 'duela egun bat',
	daysAgo: 'duela {delta} egun',
	weekAgo: 'duela astebete',
	weeksAgo: 'duela {delta} aste',
	monthAgo: 'duela hilabete',
	monthsAgo: 'duela {delta} hilabete',
	yearAgo: 'duela urtebete',
	yearsAgo: 'duela {delta} urte',

	lessThanMinuteUntil: 'minutu bat baino gutxiago, oraintxe hasita',
	minuteUntil: 'minutu bat, oraintxe hasita',
	minutesUntil: '{delta} minutu, oraintxe hasita',
	hourUntil: 'ordubete, oraintxe hasita',
	hoursUntil: '{delta} ordu, oraintxe hasita',
	dayUntil: 'egun bat, oraintxe hasita',
	daysUntil: '{delta} egun, oraintxe hasita',
	weekUntil: 'astebete, oraintxe hasita',
	weeksUntil: '{delta} aste, oraintxe hasita',
	monthUntil: 'hilabete, oraintxe hasita',
	monthsUntil: '{delta} hilabete, oraintxe hasita',
	yearUntil: 'urtebete, oraintxe hasita',
	yearsUntil: '{delta} urte, oraintxe hasita'
});

Locale.define('eu-ES', 'FormValidator', {
	required: 'Eremu hau nahitaezkoa da.',
	minLength: 'Mesedez, sar itzazu, gutxienez, {minLength} karaktere ({length} karaktere sartu dituzu).',
	maxLength: 'Mesedez, ez itzazu sartu {maxLength} karaktere baino gehiago ({length} karaktere sartu dituzu).',
	integer: 'Mesedez, sar ezazu zenbaki oso bat eremu honetan. Ez dira dezimalak dituzten zenbakiak onartzen (adib.: 1,25).',
	numeric: 'Mesedez, zenbakizko balioak bakarrik sartu eremu honetan (adib.: "1" edo "1,1" edo "-1" edo "-1,1").',
	digits: 'Mesedez, zenbakiak eta puntuazioa bakarrik erabili eremu honetan (adibidez, ez da onartzen telefono zenbaki bat marratxo edo puntuekin).',
	alpha: 'Mesedez, letrak (a-z) bakarrik erabili eremu honetan. Ez dira espazioak eta bestelako karaktereak onartzen.',
	alphanum: 'Mesedez, letrak (a-z) edo zenbakiak (0-9) bakarrik erabili eremu honetan. Ez dira espazioak eta bestelako karaktereak onartzen.',
	dateSuchAs: 'Mesedez, sar ezazu baliozko data bat {date} gisa',
	dateInFormatMDY: 'Mesedez, sar ezazu baliozko data bat, EE/HH/UUU formatuan (adib.: "31/12/1999")',
	email: 'Mesedez, sar ezazu baliozko e-posta helbide bat. Adibidez, "fred@domain.com".',
	url: 'Mesedez, sar ezazu baliozko URL bat, http://www.example.com formatuan.',
	currencyDollar: 'Mesedez, sar ezazu baliozko € kopuru bat. Adibidez, 100,00 € .',
	oneRequired: 'Mesedez, sar ezazu zerbait, gutxienez, honako sarrera hauetako batean.',
	errorPrefix: 'Errorea: ',
	warningPrefix: 'Oharra: ',

	// Form.Validator.Extras
	noSpace: 'Sarrera honetan ezin daiteke espaziorik egon.',
	reqChkByNode: 'Ez da elementurik hautatu.',
	requiredChk: 'Eremu hau nahitaezkoa da.',
	reqChkByName: 'Mesedez, aukera ezazu {label} bat.',
	match: 'Eremu honek bat etorri behar du {matchName} eremuarekin',
	startDate: 'hasiera data',
	endDate: 'amaiera data',
	currendDate: 'gaurko data',
	afterDate: 'Datak {label}-ren berdina edo ondorengoa behar du izan.',
	beforeDate: 'Datak {label}-ren berdina edo lehenagokoa behar du izan.',
	startMonth: 'Mesedez, aukera ezazu jatorrizko hilabete bat',
	sameMonth: 'Bi data hauek hilabete berean egon behar dute - bietakoren bat aldatu behar duzu.',
	creditcard: 'Sartutako kreditu txartelaren zenbakia ez da baliozkoa',
	
	//Custom
	cp: 'Posta kodea ez da zuzena',
	cvv: 'CVV kodea ez da zuzena',
	phone: 'Telefono zenbakia ez da zuzena',
	password:'Gutxienez 8 barne gutuna eta kopurua pertsonaiak',
	numBox: 'Behintzat pakete bat sartu behar duzu',
	dropBox: 'Identification number not valid'
});

//Polaco - POLONIA
Locale.define('pl-PL', 'Date', {

	months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
	months_abbr: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
	days: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
	days_abbr: ['ndz', 'pon', 'wt', 'śr', 'czw', 'pt', 'sob'],

	// Culture's date order: DD/MM/YYYY
	dateOrder: ['date', 'month', 'year'],
	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M',
	AM: 'AM',
	PM: 'PM',
	firstDayOfWeek: 1,

	// Date.Extras
	ordinal: 'º',

	lessThanMinuteAgo: 'mniej niż minutę temu',
	minuteAgo: 'minutę temu',
	minutesAgo: '{delta} minut/y temu',
	hourAgo: 'godzinę temu',
	hoursAgo: '{delta} godzin/y temu',
	dayAgo: 'wczoraj',
	daysAgo: '{delta} dni temu',
	weekAgo: 'tydzień temu',
	weeksAgo: '{delta} tygodni/e temu',
	monthAgo: 'miesiąc temu',
	monthsAgo: '{delta} miesiące/ęcy temu',
	yearAgo: 'rok temu',
	yearsAgo: '{delta} lat/a temu',

	lessThanMinuteUntil: 'za mniej niż minutę',
	minuteUntil: 'za minutę',
	minutesUntil: 'za {delta} minut/y',
	hourUntil: 'za godzinę',
	hoursUntil: 'za {delta} godzin/y',
	dayUntil: 'jutro',
	daysUntil: 'za {delta} dni',
	weekUntil: 'za tydzień',
	weeksUntil: 'za {delta} tygodni/e',
	monthUntil: 'za miesiąc',
	monthsUntil: 'za {delta} miesiące/ęcy',
	yearUntil: 'za rok',
	yearsUntil: 'za {delta} lat/a'

});

Locale.define('pl-PL', 'FormValidator', {
	required: 'To pole jest obowiązkowe.',
	minLength: 'Proszę wprowadzić przynajmniej {minLength} znaków (wprowadzono {length} znaki/znaków).',
	maxLength: 'Proszę wprowadzić mniej niż {maxLength} znaków (wprowadzono {length} znaków).',
	integer: 'Proszę wprowadzić w to pole liczbę całkowitą. Liczby dziesiętne (np. 1,25) są niedozwolone.',
	numeric: 'Proszę wprowadzić w to pole wyłącznie wartości numeryczne (np. "1" lub "1,1" lub "-1" lub "-1,1").',
	digits: 'Proszę wprowadzić w to pole wyłącznie litery i cyfry.',
	alpha: 'Proszę wprowadzić w to pole wyłącznie litery (a-z). Spacje i inne znaki są niedozwolone.',
	alphanum: 'Proszę wprowadzić w to pole wyłącznie litery (a-z) lub cyfry (0-9). Spacje i inne znaki są niedozwolone.',
	dateSuchAs: 'Proszę podać prawidłową datę jako {date}',
	dateInFormatMDY: 'Proszę wprowadzić datę w prawidłowym formacie DD/MM/RRRR (np. "31/12/1999")',
	email: 'Proszę wprowadzić prawidłowy adres email, na przykład "nazwa@domena.com".',
	url: 'Proszę wprowadzić prawidłowy adres URL, na przykład http://www.przyklad.com.',
	currencyDollar: 'Proszę wprowadzić prawidłową kwotę w złotych. Na przykład 100,00 zł.',
	oneRequired: 'Proszę wprowadzic dane do przynajmniej jednego z pól',
	errorPrefix: 'Błąd: ',
	warningPrefix: 'Ostrzeżenie: ',
	
	// Form.Validator.Extras
	noSpace: 'Wprowadzone dane nie mogą zawierać spacji.',
	reqChkByNode: 'Nie wybrano żadnych elementów.',
	requiredChk: 'To pole jest obowiązkowe.',
	reqChkByName: 'Proszę wybrać {label}.',
	match: 'To pole musi być zgodne z polem {matchName}',
	startDate: 'data początkowa',
	endDate: 'data końcowa',
	currendDate: 'dzisiejsza data',
	afterDate: 'Data musi być taka sama lub późniejsza od {label}.',
	beforeDate: 'Data musi być taka sama lub wcześniejsza od {label}.',
	startMonth: 'Proszę wybrać miesiąc początkowy',
	sameMonth: 'Te dwie daty muszą znajdować się w tym samym miesiącu - jedną z nich należy zmienić.',
	creditcard: 'Wprowadzony numer karty płatniczej jest nieprawidłowy',
	
	//Custom
	cp: 'Kod pocztowy jest nieprawidłowy',
	cvv: 'Kod CVV jest nieprawidłowy',
	phone: 'Numer telefonu jest nieprawidłowy',
	password:'Przynajmniej 8 znaków, w tym przynajmniej jedna litera i jedna cyfra',
	numBox: 'Należy wprowadzić przynajmniej jedną paczkę',
	dropBox: 'Numer identyfikacyjny jest nieprawidłowy'
});

//Adapta el formato de la variable locale para obviar el código del país
function setLocale(locale)
{
	var idioma = locale.substr(0,2);
	var locale2 = null;
	
	switch(idioma)
	{
		case 'en':
			locale2 = "en-US";
			break;
		case 'es':
			locale2 = "es-ES";
			break;
		case 'fr':
			locale2 = "fr-FR";
			break;
		case 'pt':
			locale2 = "pt-PT";
			break;
		case 'it':
			locale2 = "it-IT";
			break;
		case 'de':
			locale2 = "de-DE";
			break;		
		case 'ca':
			locale2 = "ca-ES";
			break;
		case 'gl':
			locale2 = "gl-ES";
			break;
		case 'eu':
			locale2 = "eu-ES";
			break;
		case 'pl':
			locale2 = "pl-PL";
			break;
	}
	Locale.use(locale2);
};

//Fijar idioma JS (localeActual definida en ItxHeaderJSON.jspf)
setLocale(HeaderJSON.locale);Class.refactor = function(original, refactors){
	Object.each(refactors, function(item, name){
		var origin = original.prototype[name];
		origin = (origin && origin.$origin) || origin || function(){};
		original.implement(name, (typeof item == 'function') ? function(){
			var old = this.previous;
			this.previous = origin;
			var value = item.apply(this, arguments);
			this.previous = old;
			return value;
		} : item);
	});
	return original;
};/*
---
description: A Class that provides a cross-browser history-management functionaility, using the browser hash to store the application's state

license: MIT-style

authors:
- Arieh Glazer
- Dave De Vos
- Digitarald

requires:
- core/1.3: [Object,Class,Class.Extras,Element,Element.Event,Element.Style]

provides: [HashListener]

...
*/
(function($){

Element.NativeEvents['hashchange'] =  2;

HashListener = new Class({
    Implements : [Options,Events],
    options : {
        blank_page : 'blank.html',
        start : false
    },
    iframe : null,
    currentHash : '',
    firstLoad : true,
    handle : false,
    useIframe : (Browser.ie && (typeof(document.documentMode)=='undefined' || document.documentMode < 8)),
    ignoreLocationChange : false,
    initialize : function(options)
    {
        var $this=this;
        this.setOptions(options);

        // Disable Opera's fast back/forward navigation mode
        if (Browser.opera && window.history.navigationMode) {
            window.history.navigationMode = 'compatible';
        }

         // IE8 in IE7 mode defines window.onhashchange, but never fires it...
        if (('onhashchange' in window) && (typeof(document.documentMode) == 'undefined' || document.documentMode > 7))
        {
            // The HTML5 way of handling DHTML history...
            window.addEvent('hashchange' , function ()
            {
                var hash = $this.getHash();
                if (hash == $this.currentHash)
                {
                    return;
                }

                $this.fireEvent('hashChanged',hash);
                $this.fireEvent('hash-changed',hash);
            });
        }
        else
        {
            if (this.useIframe)
            {
                this.initializeHistoryIframe();
            }
        }

        window.addEvent('unload', function(event) {
            $this.firstLoad = null;
        });

        if (this.options.start) this.start();
    },
    initializeHistoryIframe : function(){
        var hash = this.getHash(), doc;
        this.iframe = new IFrame({
            src     : this.options.blank_page,
            styles  : {
                'position'  : 'absolute',
                'top'       : 0,
                'left'      : 0,
                'width'     : '1px',
                'height'    : '1px',
                'visibility': 'hidden'
            }
        }).inject(document.body);

        doc = (this.iframe.contentDocument) ? this.iframe.contentDocument  : this.iframe.contentWindow.document;
        doc.open();
        doc.write('<html><body id="state">' + hash + '</body></html>');
        doc.close();
        return;
    },
    checkHash : function(){
        var hash = this.getHash(), ie_state, doc;
        if (this.ignoreLocationChange) {
            this.ignoreLocationChange = false;
            return;
        }

        if (this.useIframe){
            doc = (this.iframe.contentDocument) ? this.iframe.contentDocumnet  : this.iframe.contentWindow.document;
            ie_state = doc.body.innerHTML;

            if (ie_state!=hash){
                this.setHash(ie_state);
                hash = ie_state;
            }
        }

        if (this.currentLocation == hash) {
            return;
        }

        this.currentLocation = hash;

        this.fireEvent('hashChanged',hash);
        this.fireEvent('hash-changed',hash);
    },
    setHash : function(newHash){
        window.location.hash = this.currentLocation = newHash;

        if (('onhashchange' in window) &&
            (typeof(document.documentMode) == 'undefined' || document.documentMode > 7)
           ) return;

        this.fireEvent('hashChanged',newHash);
        this.fireEvent('hash-changed',newHash);
    },
    getHash : function(){
        var m;
        if (Browser.firefox){
            m = /#(.*)$/.exec(window.location.href);
            return m && m[1] ? m[1] : '';
        }else if (Browser.safari || Browser.chrome){
            return decodeURI(window.location.hash.substr(1));
        }else{
            return window.location.hash.substr(1);
        }
    },
    setIframeHash: function(newHash) {
        var doc = (this.iframe.contentDocument) ? this.iframe.contentDocumnet  : this.iframe.contentWindow.document;
        doc.open();
        doc.write('<html><body id="state">' + newHash + '</body></html>');
        doc.close();

    },
    updateHash : function (newHash){
        if (document.id(newHash)) {
            this.debug_msg(
                "Exception: History locations can not have the same value as _any_ IDs that might be in the document,"
                + " due to a bug in IE; please ask the developer to choose a history location that does not match any HTML"
                + " IDs in this document. The following ID is already taken and cannot be a location: "
                + newHash
            );
        }

        this.ignoreLocationChange = true;

        if (this.useIframe) this.setIframeHash(newHash);
        else this.setHash(newHash);
    },
    start : function(){
        this.handle = this.checkHash.periodical(100, this);
    },
    stop : function(){
        clearInterval(this.handle);
    }
});

})(document.id);
var hasFlash= Browser.Plugins.Flash && (Browser.Plugins.Flash.version > 8);var userAgentAppleMobile = (navigator && navigator.platform && navigator.platform.match(/^(iPad|iPod|iPhone)$/));
var userAgentAndroid = (navigator.userAgent.toLowerCase()).indexOf("android") > -1;
var isTouchingScreen = userAgentAndroid || userAgentAppleMobile;
if (isTouchingScreen) 
{
	(function() {
	  try {
	    document.createEvent("TouchEvent");
	  } catch(e) {
	    return;
	  }

	  ['touchstart', 'touchmove', 'touchend'].each(function(type){
	      Element.NativeEvents[type] = 2;
	  });

	  var mapping = {
		'mousedown': 'touchstart',
		'mousemove': 'touchmove',
		'mouseup': 'touchend'
	  };

	  var condition = function(event) {
	    var touch = event.event.changedTouches[0];
	    event.page = {
	      x: touch.pageX,
	      y: touch.pageY
	    };
	    return true;
	  };

	  for (var e in mapping) {
	    Element.Events[e] = {
	      base: mapping[e],
	      condition: condition
	    };
	  }
	})();
}var ResizeController=new Class
({
	Implements: Chain,
	arFunctions: null,
	timer: null,
	initialize: function()
	{
		this.arFunctions=new Array();
	},
	addFunction: function(_function)
	{
		this.arFunctions.push(_function);
	},
	removeFunction: function(_function)
	{
		if(this.arFunctions.contains(_function)) this.arFunctions.erase(_function);
	},
	executeDelayed: function()
	{
		this.chain.apply(this, this.arFunctions);
		while(this.callChain()!=false);
	},
        execute: function()
	{
		clearTimeout(this.timer);
		this.timer=this.executeDelayed.bind(this).delay(1);
        }
});
var resizeController=new ResizeController();
window.addEvent('resize', function() {resizeController.execute();});

/*
---

name: Element.Dimensions

description: Contains methods to work with size, scroll, or positioning of Elements and the window object.

license: MIT-style license.

credits:
  - Element positioning based on the [qooxdoo](http://qooxdoo.org/) code and smart browser fixes, [LGPL License](http://www.gnu.org/licenses/lgpl.html).
  - Viewport dimensions based on [YUI](http://developer.yahoo.com/yui/) code, [BSD License](http://developer.yahoo.com/yui/license.html).

requires: [Element, Element.Style]

provides: [Element.Dimensions]

...
*/
/*Modificacion del getSize de Mootools para incluir unos tamaños minimos de escalado*/

(function(){
	
[Document, Window].invoke('implement', {

	getSize: function(){
		var doc = getCompatElement(this);
		
		var newHeight=(doc.clientHeight<400)? 400 : doc.clientHeight;
		var newWidth=(doc.clientWidth<1016)? 1016 : doc.clientWidth;
		return {x: newWidth, y: newHeight};
	}
	
});

function getCompatElement(element){
	var doc = element.getDocument();
	return (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
};

})();var LoadController=new Class
({
	Implements: Chain,
	arFunctions: null,
	initialize: function()
	{
		this.arFunctions=new Array();
	},
	addFunction: function(_function)
	{
		this.arFunctions.push(_function);
	},
	removeFunction: function(_function)
	{
		if(this.arFunctions.contains(_function)) this.arFunctions.erase(_function);
	},
        execute: function()
	{
		this.chain.apply(this, this.arFunctions);
		while(this.callChain()!=false);
        }
});
var loadController=new LoadController();

window.addEvent('load', function() 
{
	$(document.body).setStyle('display','block');
	loadController.execute();
});var ErrorPanel=new Class(
{
	element:null,
	initialize:function(_title,_message)
	{
		this.element=new Element('table',{'id':'ErrorPanel'});
		
		var fondo = new Element('div',{'id':'FondoErrorPanel'});
		fondo.setStyle('width','100%');
		fondo.setStyle('height','100%');
		fondo.setStyle('position','absolute');
		
		this.element.set('html',
		'<tbody>'+
		'<tr>'+
			'<td id="PanelContainer">'+
				'<center>'+
					'<table id="Panel">'+
					'<tbody>'+
						'<tr>'+
							'<td>'+
								'<p id="Title">'+_title+'</p>'+
								'<p id="Message">'+_message+'</p>'+
								'<p>'+'<input type="button" id="Accept" class="Button" value="'+CommonMessageLabels.acceptButton+'" />'+'</p>'+
							'</td>'+
						'</tr>'+
					'</tbody>'+
					'</table>'+
				'</center>'+
			'</td>'+
		'</tr>'+
		'</tbody>'
		);

		this.element.getElement('#Accept').addEvent('click',function()
		{
			$('FondoErrorPanel').destroy();
			//delete(this);
		}.bind(this));
		
		$(document.body).adopt(fondo);
		fondo.adopt(this.element);
	}
});

function fnShowErrorPanel(_title,_message)
{
	new ErrorPanel(_title,_message);
};
var DynamicErrorController=new Class
({	
	initialize:function()
	{
		try
		{
			if(ErrorJSON!=null)
			{
				if(ErrorJSON.status!=null)
				{
					if(ErrorJSON.status!=0)
					{
						if(ErrorJSON.data!=null)
						{
							ItxAnalytics.trackPage("/Errores/Error_dinamico/"+ErrorJSON.data.message);
							new ErrorPanel(ErrorJSON.data.title,ErrorJSON.data.message);
							ErrorJSON.status = 0;
						}
						else
						{
							//new ErrorPanel("Error","No se ha recibido la variable data del error");
						}
					}	
				}
				else
				{
					//new ErrorPanel("Error","No se ha recibido la variable status");
				}
			}
			else
			{
				//new ErrorPanel("Error","El JSON de errores está vacío");
			}
		}
		catch(e)
		{
			//new ErrorPanel("Error","No se ha recibido el JSON de errores");
		}
        }
});
loadController.addFunction(function(){new DynamicErrorController()});;var AjaxHelper = new Class({

	Implements: [Chain, Options],
		
	/**
	 * Funcion que devuelve las opciones predeterminadas que utilizamos en 
	 * nuestras peticiones AJAX mezcladas con las que se proporcionan. 
	 * En caso de querer utilizar solo las predeterminadas no es necesario 
	 * pasar ningun parametro.
	 * @param Object options -> opciones de la Request para mezclar con las predeterminadas
	 *							Opciones propias:
	 *								+ noLoading (boolean = false) -> se utiliza para indicar que no queremos mostrar la 
	 *										animacion de carga mientras se ejecuta la llamada.
	 *								+ navigatePlain (boolean = false) -> indica si estamos haciendo una llamada desde ajax
	 *										a una página completa
	 */
	getReqDefOpts: function(options) {
		var c = this;
		options = (options) ? options : {};
		var defOpts = {
				method: 'get',
				noLoading: false,
				navigatePlain: false,
				evalScripts:true,
				onRequest: function() {
					//if (!this.options.noLoading) c.showLoading();
				},
				onComplete: function() {
					//c.hideLoading();
				},
				onCancel: function() {
					//c.hideLoading();
				},
				onFailure: function(xhr) {
					//c.hideLoading();
				},
				onException: function(headerName, value){
					//c.hideLoading();
				}
		};
		return Object.merge(defOpts, options);
	},
	
	/**
	 * Esta funcion sirve para comprobar si la url que vamos a utilizar 
	 * para realizar una llamada Ajax supone un cambio a protocolo seguro.
	 * 
	 * @param ajaxCallUrl (String) url que se va a utilizar para la llamada 
	 */
	checkAjaxProtocolChangeSecure: function(ajaxCallUrl) {		 
		return ((location.protocol == 'http:' && ajaxCallUrl.test(/^https:/))||(location.protocol == 'https:' && ajaxCallUrl.test(/^http:/)));
	},
	
	/**
	 * Funcion interna utilizada para realizar una llamada Ajax 
	 * especializada en HTML, JSON o una llamada generica
	 * @param String type -> tipo de la llamada ('html' | 'json')
	 * @param Object options -> las opciones proporcionadas se mezclaran con las predeterminadas
	 */
	_sendRequest: function(type, options) {		
				options = (options) ? Object.merge(this.getReqDefOpts(), options)
						: this.getReqDefOpts();
		var req = null;
		if ('html' == type) {
			req = new Request.HTML(options);
		} else if ('json' == type) {
			req = new Request.JSON(options);
		} else if ('jsonp' == type) { 
			req = new Request.JSONP(options);
		} else {
			req = new Request(options);
		}
		
		// Comprobamos si hay cambio de protocolo a seguro
		if (this.checkAjaxProtocolChangeSecure(options.url)) {
			// TODO Realizamos la llamada mediate el iFrame auxiliar
			this._sendCrossAjaxRequest(req, {
				'onComplete': options.onComplete,
				'onSuccess': options.onSuccess, 
				'type': type
			});
		} else {
			req.send();
		}
	},
	
	/**
	 * Funcion para realizar una peticion AJAX estandar.
	 * Si no se proporcionan unas opciones, se utilizaran las predeterminadas 
	 * que se establecen en este mismo objeto.
	 * Si se proporcionan, se mezclaran con las predeterminadas.
	 * @param Onject options
	 */
	request: function(options) {
		options.onComplete=function(){new DynamicErrorController();}
		this._sendRequest('generic', options);		
	},
	
	/**
	 * Funcion para realizar una peticion AJAX especializada en recibir HTML.
	 * Si no se proporcionan unas opciones, se utilizaran las predeterminadas 
	 * que se establecen en este mismo objeto.
	 * Si se proporcionan, se mezclaran con las predeterminadas.
	 * @param Onject options
	 */
	requestHtml: function(options) {
		options.onComplete=function(){new DynamicErrorController();}
		this._sendRequest('html', options);		
	},
	
	/**
	 * Funcion para realizar una peticion AJAX especializada en recibir JSON.
	 * Si no se proporcionan unas opciones, se utilizaran las predeterminadas 
	 * que se establecen en este mismo objeto.
	 * Si se proporcionan, se mezclaran con las predeterminadas.
	 * @param Onject options
	 */
	requestJson: function(options) {
		this._sendRequest('json', options);		
	},
		
	/**
	 * Funcion para realizar una peticion AJAX a un dominio distinto 
	 * del actual (el cambio de http a https se considera cambio de dominio).
	 * Si no se proporcionan unas opciones, se utilizaran las predeterminadas 
	 * que se establecen en este mismo objeto.
	 * Si se proporcionan, se mezclaran con las predeterminadas.
	 * @param Object options
	 */
	requestJsonP: function(options) {
		this._sendRequest('jsonp', options);
	},

	/**
	 * Envia una peticion con cambio de dominio.
	 * @param request
	 * @param options
	 * 			+ type        -> tipo de peticion
	 * 			+ onSuccess	
	 * 			+ onComplete
	 */
	_sendCrossAjaxRequest: function(request, options) {
		
		var onSuccess = options.onSuccess;	
		var type = options.type;
				
		// Mostramos el loading
		//if (!request.options.noLoading) this.showLoading();
		
		// Preparamos los datos para la llamada
		var reqData = '';
		if (request.options.data) {
			switch (typeOf(request.options.data)){
				case 'element': reqData = document.id(request.options.data).toQueryString(); break;
				case 'object': case 'hash': reqData = Hash.toQueryString(request.options.data);
			}
		}		
		var req = JSON.encode({
			url: request.options.url,
			data: reqData,
			method: request.options.method,
			reqType: type
		});
		
		// Metemos en la cadena los callback para esta llamada
		this.chain(options.onComplete); // Primero siempre tiene que ir el onComplete
		this.chain(onSuccess);
		
		// Compronamos si ya existe el socket en la ventana
		if (this.crossAjaxSocket) {
			this.crossAjaxSocket.postMessage(req);
		} else {
			//var iFrameUrl = baseFolder + "ItxAjaxIFrameTool.html";
			var iFrameUrl = ajaxIFrameToolHtmlUrl;
			if (iFrameUrl.test(/^http:/) && request.options.url.test(/^https:/)) {
				iFrameUrl = iFrameUrl.replace("http:", "https:");
			} else if (iFrameUrl.test(/^https:/) && request.options.url.test(/^http:/)) {
				iFrameUrl = iFrameUrl.replace("https:", "http:");
			}
			var self = this;
			this.crossAjaxSocket = new easyXDM.Socket({	
				remote: iFrameUrl, 
				swf: PULL_STORE_PATH + "/easyxdm.swf",
				container: $(document.body),
				props: {
					style: {
						width: '0px',
						height: '0px',
						'z-index': '-100'
					}
				},
				onMessage: function(resp, origin) {
					
					self.callChain(); // Ejecutamos el onComplete
									
					var resp = JSON.decode(resp);
					var msg = resp.text;

					// Llamamos a la siguiente funcion de la cadena
					if ('-1' != msg) {
						
						if (resp.itxHeader == 'ERROR_RESPONSE') {
							// Si el serv nos devuelve una página de error
							//self.showError(resp.text, resp.type);
							//alert(resp.text);
							self.removeFirst();
							
						} else if ("LOGON_REQUIRED" == resp.itxHeader) {
							
							var js, tree, elements;
							msg = msg.stripScripts(function(script) {
								js = script;
							});
//							self.callChain(tree, elements, msg, js);
							
							/*
							 *  FIXME: limpiamos la cadena de funciones, ya que en este punto todavia falta ejecutarse 
							 *  el onSuccess, aunque en el caso del login, queremos reemplazar el onSuccess por la funcion 
							 *  handleLoginRequest.
							 */ 
							self.clearChain();
							request.handleLoginRequest(resp.text, resp.xml);
							
						} else if (resp.itxHeader == 'TIMEOUT_ERROR') { 
							
							/* En caso de un timeout, cambiamos el location de 
							 * la página */
							var el = new Element('div', { 'html': msg }).getElement('input');			
							window.location.href = el.get('value');
							
						} else {
							// Nos devuelve datos normales
							if ('html' == resp.type) {
								var js, tree, elements;
								msg = msg.stripScripts(function(script) {
									js = script;
								});
								self.callChain(tree, elements, msg, js);
							} else if ('json' == resp.type) {
								result = JSON.decode(msg);
								self.callChain(result, msg);
							} else {
								self.callChain(msg);
							}
							//self.showError(resp.text, resp.type);							
							//alert(resp.text);
						}
					} else {
						// Mostrar mensaje de error porque fallo el transporte (onFailure, onException)
						alertPanel.show({
			  				title: ajaxHelper.getI18nMsg('crodoErrorTitle'),
			  				message: ajaxHelper.getI18nMsg('crodoErrorTitle')
			  			});
						self.removeFirst();
					}
					
					// Ocultar el loading					
					//if (!request.options.noLoading) self.hideLoading();
					
				},
				onReady: function() {
					// Una vez que este socket este listo para trabajar, enviamos el mensaje
					self.crossAjaxSocket.postMessage(req);
				}
			});
		}		
	}
});
var ajaxHelper = new AjaxHelper();
/*custom Select*/
var getCustomSelectValue=function(item)
{
	var returnValue='';
	if(item.get('title')!=null)
	{
		returnValue=item.get('title');
		if(item.options.length>0)
		{
			if(item.options[item.selectedIndex].value!='null')
			{
				returnValue='<b>'+returnValue+':</b> '+item.options[item.selectedIndex].text;
			}
			else if(item.hasClass('required'))
			{
				returnValue+=" *";
			}
		}
	}
	else if(item.options.length>0)
	{
		returnValue=item.options[item.selectedIndex].text;
	}
	return(returnValue);
}

function addCustomSelects(_idForm)
{
	$(_idForm).getElements('select.styled').each(function(item)
	{
		item.store('Element',
			new Element("span",
			{
				'id':"select"+item.get("name"),
				'class':"select",
				'html':getCustomSelectValue(item)
			})
		);
		if(item.options.length<=0) {item.retrieve('Element').setStyle('display','none');}
		//item.getParent().grab(item.retrieve('Element'),'before');
		item.grab(item.retrieve('Element'),'before');
		item.addEvent('change',function(e){this.retrieve('Element').set('html',getCustomSelectValue(this));});
		item.resize=function()
		{
			if(this.getStyle('min-width').toInt()==0 || this.getStyle('min-width')=='auto')
			{
				var tempDisplay=false;
				var tempVisibility=false;
				if(this.getStyle('display')=='none') {tempDisplay=true; this.setStyle('display','block');}
				if(this.getStyle('visibility')=='hidden') {tempVisibility=true; this.setStyle('visibility','visible');}
				this.setStyle('width','');
				this.retrieve('Element').setStyle('width',this.getSize().x +'px');
				this.setStyle('width',this.retrieve('Element').getStyle('width').toInt()+this.retrieve('Element').getStyle('padding-left').toInt());
				if(tempDisplay) {this.setStyle('display','none');}
				if(tempVisibility) {this.setStyle('visibility','hidden');}
			}
			else
			{
				item.setStyle('width',  this.getParent().getSize().x + ' px');
				this.retrieve('Element').setStyle('width', this.getParent().getSize().x - 2 + 'px');
				//this.retrieve('Element').setStyle('width',this.getSize().x-5+'px');
			}
		}
		item.resize();
		item.adopt=function(_element)
		{
			_element.inject(this);
			this.retrieve('Element').set('html',getCustomSelectValue(this));
			this.retrieve('Element').setStyle('display','');
			if(this.getStyle('min-width').toInt()==0) this.resize();
		};
		
		item.addEvent('blur', function(event)
		{
			$(_idForm).get('validator').validateField(item);
		});
	});
};


/*
    customForms
        Librería para customizar aspecto de formularios
    Contiene:
        customScrollbar (clase) - barra de scroll formateable
        customTextBox (clase)   - textbox con textos formateables, ayuda y validación
        customForm (clase)      - constructor de formularios (automatiza validación y creación de componentes custom)
    Requiere:
        Librería 'more' mootools, incluyendo 'slider', 'Fx.scroll' y 'Form.Validator.Inline'
*/



Element.implement({
isVisible: function(){
        return (this.offsetWidth > 0 || this.offsetHeight > 0);
    },
getNextFormElement: function(){
        var formEls = $A(this.form.elements),
            initialIndex = formEls.indexOf(this)+1,
            i, formLength = formEls.length;
        for(i = initialIndex; i < formLength; i++)
            if(formEls[i] && formEls[i].isVisible() && formEls[i].get('tag')!='fieldset')
                return formEls[i];
        return this;
    }});



/*
    customTextBox : Textbox con formato
    Uso:
        HTML para cada caja de texto a crear:
            <div>
                <input type='text' id='<idInput>' title='<titulo>' tabindex='<tabindex>'>
                <div id='<idInput>Help'> Mensaje de ayuda </div>
            </div>
        Para instanciar:
        var firstName = new textBox(<idInput>, <nombreFormContenedor>);
*/
var customTextBox = new Class
({
	divCampoFormateado: null,
	campoTexto: null,
	capaAyuda: null,
	campoCompuesto: null,
	camposHijos: null,
	mostrandoCampoFormateado: null,
	callback:null,
	campoFecha:null,

	initialize: function(_idTextInput, _idForm, _callback)
	{
		if(typeof _callback!='undefined') this.callback=_callback;
		//Obtener el campo de texto
		this.campoTexto = $(_idTextInput).getElement($(_idTextInput));
		this.mostrandoCampoFormateado = false;

		//CustomTextBox
		if (this.campoTexto.hasClass('customTextBox'))
		{
			//Generar capa que mostrará el texto formateado
			var cssCampo = this.campoTexto.getProperty('class');
			this.divCampoFormateado = new Element('div', {'id': _idTextInput + 'fake'});
			this.divCampoFormateado.addClass(cssCampo);
			this.divCampoFormateado.addClass('fake');
			//this.divCampoFormateado.setStyle('float','left');
			//this.divCampoFormateado.setStyle('width', this.campoTexto.getStyle('width'));
	    
			if(this.campoTexto.getParent().hasClass('customGroupBox'))
			{
				//Capa con el texto de ayuda
				this.campoCompuesto = true;

				if (this.campoTexto.getParent().hasClass('fecha'))
						    this.campoFecha = true;
				    
				//Campos grupo (contenidos dentro de un div con la clase 'customGroupBox'), solo 1 capa con texto formateado
				//Obtener capa padre y todos los hijos del grupo
				var capaPadre = this.campoTexto.getParent();
				if (capaPadre.getChildren('div.group').length>0)
				{
					//Si ya se ha tratado antes, salir
					return; 
				}
				else
				{
					this.divCampoFormateado.addClass('group');
					//var width = (capaPadre.getCoordinates().width-5).toString();
					this.camposHijos = capaPadre.getChildren('[type=text]');
					var width = (this.camposHijos.getLast().getCoordinates().left + this.camposHijos.getLast().getCoordinates().width) - this.camposHijos[0].getCoordinates().left - 5;
					//Arreglo ipad para campos compuestos
					if(isTouchingScreen)
					{
						width = width +5;
						this.camposHijos[this.camposHijos.length-1].setStyle('width', this.camposHijos[this.camposHijos.length-1].getStyle('margin-right').toInt() +  this.camposHijos[this.camposHijos.length-1].getStyle('width').toInt() - this.camposHijos[this.camposHijos.length-1].getStyle('margin-left').toInt() );
						this.camposHijos[this.camposHijos.length-1].setStyle('margin-right', "-10px");
					}
					this.capaAyuda = capaPadre.getChildren('div.ayudaCampo');
				}
			}
			else
			{
				//Campo simple
				var width = (this.campoTexto.getCoordinates().width-5).toString();
				
				if(width.toInt()<0)
				{
					width ="0";
					if(this.campoTexto.getStyle('width')!=null)
					{
						width=this.campoTexto.getStyle('width').toInt().toString();
					}
				}
				this.capaAyuda = $(_idTextInput + 'Help');	//Capa con el texto de ayuda
				this.campoCompuesto = false;
			}
	    
			this.divCampoFormateado.setStyle('text-align','justify');
			//this.divCampoFormateado.setStyle('overflow','hidden');
			this.divCampoFormateado.setStyle('width', width + 'px');
			this.divCampoFormateado.setStyle('height', this.campoTexto.getStyle('height'));
	    
			if(this.campoTexto.getProperty('type')!='textarea')
				this.divCampoFormateado.setStyle('line-height', this.campoTexto.getStyle('height'));
			
			this.campoTexto.getParent().grab(this.divCampoFormateado, 'top');
	    
			//Al pinchar en el campo formateado, mostrar inmediatamente el campo de texto y la ayuda
			this.divCampoFormateado.addEvent('mousedown', function(event)
			{
				event.stop();
				this.mostrarCampoTexto(this.callback);
			}.bind(this));
	    
			//Al salir el foco del campo de texto, mostrar el div formateado y ocultar el input
			if(this.campoCompuesto)
			{
				var firstField = this.camposHijos[0];
				var lastField = this.camposHijos.getLast();
			}
			else
			{
				var lastField = this.campoTexto;
			}
	    
			//Evento onBlur de los campos de texto
			var self = this;
			if (this.campoCompuesto)
			{
				var len = this.camposHijos.length;
				
				//alert('campo '  + this.camposHijos[0].getProperty('id') + ' length: ' + len.toString());
				for(var i=0;i<len;i++)
				{
					this.timeout=null;
					this.camposHijos[i].addEvents({
						blur: function(event)
						{
							self.timeout=self.mostrarCampoFormateado.delay(0,self);
						},
						
						focus: function(event)
						{
							if(self.timeout!=null) {clearTimeout(self.timeout); self.timeout=null;}
							else {self.mostrarCampoTexto();}
						}
					});
				}
			}
			else
			{
				lastField.addEvent('blur', function(event)
					{ 
						//event.stop();
						self.mostrarCampoFormateado(self.callback);
					});
			}
	    
			//Inicialmente se muestra con formato
			this.mostrarCampoFormateado(this.callback);
		}
	},


	//Muestra el texto con formato (capa). Oculta el input
	mostrarCampoFormateado: function(_callback)
	{
		var required = false;
		var campoFecha = this.campoFecha;
	    
		//Texto a mostrar en la capa formateada
		if(this.campoCompuesto)
		{
			//Obtener título, valor (se concatenan todos) y 'required'
			var valorCampo = '';
			var tituloCampo = '';
			var day,month, year;
			
			this.camposHijos.each
			(
				function(item,index)
				{
					if (item.getProperty('title')!=null)
					{
						tituloCampo = item.getProperty('title');
					}
					
					if(campoFecha)
					{
						if (item.getProperty('id')=='day')
						{
							day = item.getProperty('value');
						}
						if (item.getProperty('id')=='month')
						{
							month = item.getProperty('value');
						}
						if (item.getProperty('id')=='year')
						{
							year = item.getProperty('value');
						}
						
					}
					valorCampo = valorCampo + item.get('value');
					required = item.hasClass('required')  && (!required);
					item.setStyle('visibility','hidden'); //Ocultar textboxes originales
					//item.setStyle('max-height','0px'); //Ocultar textboxes originales
					item.setStyle('display','none');
				}
			);
			
			if (campoFecha)
			{
				if (day.trim()!='' && month.trim()!='' && year.trim()!='')
				{
					valorCampo = day + '/' + month + '/' + year;
				}
				else
				{
					valorCampo = '';
				}
			}
		}
		else
		{
			//Obtener título, valor y 'required'
			var tituloCampo = this.campoTexto.getProperty('title');
			required = this.campoTexto.hasClass('required');
			
			this.campoTexto.setStyle('visibility','hidden');		//Ocultar textbox original
			this.campoTexto.setStyle('position','absolute');
			this.campoTexto.setStyle('top','0px');
			
			if(this.campoTexto.getProperty('type')=='password')
			{
				var valorCampo = this.campoTexto.getProperty('value').replace(/./g, '*');
			}
			else
			{
				var valorCampo = this.campoTexto.getProperty('value');
			}             
		}

		var textoCapa = '';
		if (valorCampo.trim()=='')
		{
			textoCapa = tituloCampo;
			if(required)
				textoCapa += ' *';
		}
		else
		{
			textoCapa = '<b>' + tituloCampo + ': </b>' + valorCampo;
		}
		
		this.divCampoFormateado.setProperty('html', textoCapa);
		this.divCampoFormateado.setStyle('visibility','visible');
		this.divCampoFormateado.setStyle('max-height','');
		
		//Ocultar la capa de ayuda
		if(this.capaAyuda)
		{
			//this.capaAyuda.fade('hide'); REVISAR: no funciona bien al cambiar muy rápido de campo con TAB
			this.capaAyuda.setStyle('display','none');
		}
		this.mostrandoCampoFormateado = true;
		if(typeof _callback=='function') {_callback.apply();/*$('LogonLink').appendText('1');*/}
	},

	//Muestra el input. Oculta la capa de texto formateado
	mostrarCampoTexto: function(_callback, _id)
	{
		//Ocultar capa formateada y mostrar campos originales
		if(this.campoCompuesto)
		{
			var campoPrincipal = null;  //Guarda la referencia al campo que incluye el atributo 'title' (al que saltará el foco incialmente al pulsar sobre el campo)
			this.camposHijos.each
			(
				function(item, index)
				{
					item.setStyle('visibility','visible');
					//item.setStyle('max-height','');
					item.setStyle('display','');
						
					if(item.getProperty('title')!= null)
					{
						campoPrincipal = item;
					}
				}.bind(this)
			)
			if(_id!=null)
			{
				this.camposHijos.each
				(
					function(item, index)
					{
						if(item.get('id')==_id)
						{	
							//item.focus();
							setTimeout(function() { item.focus(); }, 10);
						}
					}
				)
			}
			else
			{
				//Fijar el foco en el campo principal
				//campoPrincipal.focus();
				setTimeout(function() { campoPrincipal.focus(); }, 10);
			}
		}
		else
		{
			this.campoTexto.setStyle('visibility','visible');
			//this.campoTexto.setStyle('max-height','');
			this.campoTexto.setStyle('position','');
			//this.campoTexto.focus();
			
			var campo = this.campoTexto;
			
			setTimeout(function() { campo.focus(); }, 10);
		}

		this.divCampoFormateado.setStyle('visibility','hidden');
		this.divCampoFormateado.setStyle('max-height','0px');
		
		//Mostrar mensaje de ayuda
		if(this.capaAyuda)
		{
			this.capaAyuda.setStyle('display','');
			//this.capaAyuda.fade(1); REVISAR: no funciona bien al cambiar muy rápido de campo con TAB
		}

		this.mostrandoCampoFormateado = false;
		if(typeof _callback=='function') {_callback.apply();/*$('LogonLink').appendText('2');*/}
	}
});


/*
    avForm: formulario con formato
    Uso:
        var miForm = new avForm(<idForm>, <validar>, <formatearTextBoxes>, <callbackFunction> );
*/
var customForm = new Class
( {
    validar: null,
    formatearTB: null,
    validator: null,
    callback: null,
	controls: null, //Array de controles del formulario

    initialize: function (_idForm, validar, formatearTB, _callback)
    {
        this.validar = validar;
        this.formatearTB = formatearTB;
		this.controls = new Array();
        if(typeof _callback!='undefined') this.callback = _callback;
        $(_idForm).store('customForm',this);
        if (this.validar)
        {
            //Configurar el validador
            this.validator = new Form.Validator.Inline($(_idForm),{
                stopOnFailure: true,
                useTitles: false,
                errorPrefix: '',
                evaluateFieldsOnBlur: false,
                evaluateFieldsOnChange: false,
                serial: false,
                scrollToErrorsOnSubmit: false,
                scrollToErrorsOnBlur: false,
                scrollToErrorsOnChange: false,
		ignoreHidden: false,
		
		onElementFail: function(element, validators)
		{
			if(element.hasClass('required')&&element.getParent().hasClass('customGroupBox'))
			{
				if(element.getStyle('display')=='none'&&element.getStyle('visibility')=='hidden')
				{
					element.setStyle('display','block');
					element.setStyle('visibility','visible');
					element.store('forceHidden',true);
					validador.validateField(element.getProperty('id'));
				}
				else if(element.retrieve('forceHidden'))
				{
					element.setStyle('display','none');
					element.setStyle('visibility','hidden');
					element.store('forceHidden',false);
				}
			}
		}, 
	
                onElementPass: function(element)
                {
                    var tick = $(element.getProperty('id') + 'Tick');
                    if(tick)
                    {
			if(element.isVisible())
			{
				tick.addClass('validation-tickOK');
			} 
                    }
                },
                onElementValidate: function(passed, element, validator, is_warn) {
                    if (!passed)
                    {
                        //var tick = $(element.getProperty('id') + 'Tick');
                        var tick = $(_idForm).getElementById(element.getProperty('id') + 'Tick');
                        if(tick)
                        {
                            tick.removeClass('validation-tickOK');
                        }
                    }
                },
                onFormValidate: function(passed, element, event){
			if(element.retrieve('customForm').callback!=null) {element.retrieve('customForm').callback.apply();}
                }.bind(this)
            });
            var validador = this.validator;
        }
        
        if (this.formatearTB)
        {
            //Simular el comportamiento del tabindex (REVISAR PARA EXPLORER Y CHROME)
            //Obtener todos los controles del formulario y ordenarlos por tabindex
            var inputs  = $(_idForm).getElements('[type=text], [type=password], textarea, select, [type=radio], [type=checkbox]');
            //inputs.sortOn('tabIndex', Array.NUMERIC);
            
            //Recorrer los controles en orden inverso
            var max = inputs.indexOf(inputs.getLast()); //Para poder usar for
            var lastTextInputRef = null;
            var ctb = null;
            var idFakeRef = null;
	
            for(var i=max;i>=0;i--) 
            {
		inputs[i].store('idForm',_idForm);
		inputs[i].addEvent('change',function(){ItxAnalytics.trackPage('/PaginasVirtuales/Formularios/'+this.retrieve('idForm')+'/'+this.getProperty('id'));});
		if(inputs[i].getProperty('type')=='text' || inputs[i].getProperty('type')=='password' ||inputs[i].getProperty('type')=='textarea')
		{   //Si es textInput, crear el customTextBox y guardar la referencia a dicho textbox
			lastTextInputRef = inputs[i];
			lastTextInputRef.addEvent('blur', function(event)
			{
				validador.validateField(this.getProperty('id'));
			}.bind(lastTextInputRef));
			lastTextInputRef.addEvent('focus', function(event)
			{
				//Esto es para que al ponerse encima del campo, desaparezca el advice de validación y aparezca el help
				if(this.getParent().hasClass('customGroupBox'))
				{
					this.getParent().getElements('input').each(function(item, index)
					{
						validador.resetField(item);
					});
				}
				
				validador.resetField(this.getProperty('id'));
				var tick = $(this.getProperty('id') + 'Tick');
				if(tick)
				{
					tick.removeClass('validation-tickOK');
				}
			}.bind(lastTextInputRef));
			//ctb = new customTextBox(inputs[i].getProperty('id'), _idForm, this.callback);
			this.controls.push(new customTextBox(inputs[i].getProperty('id'), _idForm, this.callback));
                }
            }
        }
	addCustomSelects(_idForm);
	if(this.callback!=null) {this.callback.apply();/*$('LogonLink').appendText('4');*/}
    }
});

/* 
	configuraTab : configura la secuencia del foco en un form al pulsar los tabuladores
	uso: configuraTab(<idControlOrigen>, <idControlDestino>)
		<idControlOrigen>: control origen del foco
		<idControlDestino>: control en el que se situará el foco al pulsar tab
*/
function configuraTab (idControlOrigen, idControlDestino)
{
	var ctrlOrigen = $(idControlOrigen);
	var ctrlDestino = $(idControlDestino);
	
	ctrlOrigen.removeEvent('keydown');
	ctrlDestino.removeEvent('keydown');
	
	ctrlOrigen.store('nextControl', idControlDestino);
	ctrlDestino.store('prevControl', idControlOrigen);
	
	
	ctrlOrigen.addEvent('keydown', function(e)
	{
		if(e.code == 9 && !e.shift)
		{
			e.stop();

			if(ctrlDestino.hasClass('customTextBox'))
			{
				if(ctrlDestino.getParent().hasClass('customGroupBox'))
				{
					var capaFake = ctrlDestino.getParent().getChildren('div.fake');
				}
				else
				{
					var capaFake = $(idControlDestino + 'fake');
				}
				capaFake.fireEvent('mousedown', [{stop: function(){}}], 1);
				ctrlDestino.fireEvent('click');	
			}
			else
			{
				ctrlDestino.focus();
				ctrlOrigen.fireEvent('blur');
			}	
			
		}
	});

	ctrlDestino.addEvent('keydown', function(e)
	{
		if(e.code == 9 && e.shift)
		{	
			if(ctrlOrigen.hasClass('customTextBox'))
			{
				if(!ctrlDestino.getParent().hasClass('customGroupBox'))
				{
					//Si es customTextBox, lanzar evento click sobre la capa 'fake'
					var capaFake = $(idControlOrigen + 'fake');
					capaFake.fireEvent('mousedown', [{stop: function(){}}], 1);	
					ctrlOrigen.fireEvent('click');	
				}
			}
			else
			{
				ctrlOrigen.focus();
			}	
			ctrlDestino.fireEvent('blur');
		}
	});	
}


/*
    customForms
        Librería para customizar aspecto de formularios
    Contiene:
        customScrollbar (clase) - barra de scroll formateable
        customTextBox (clase)   - textbox con textos formateables, ayuda y validación
        customForm (clase)      - constructor de formularios (automatiza validación y creación de componentes custom)
    Requiere:
        Librería 'more' mootools, incluyendo 'slider', 'Fx.scroll' y 'Form.Validator.Inline'
*/
var customScrollbar = new Class
({
	divContenido: null,
	divBarra: null,
	divKnob: null,
	horizontal: null,
	rangoInf: null,
	rangoSup: null,
	sld: null, 
	scr: null,
	sizeWrapper: null,
	sizeContenido: null,
	velocidadRueda: null,
	active:false,
	
	/*
		divContenido: elemento div del contenido
			      El div Contenido debe tener un max-height o max width(por css) que define el tamaño de visualizacion .
		divBarra: elemento div de la barra de scroll
		divKnob: elemento div del knob
		horizontal: configura scroll horizontal/vertical
		velocidadRueda: [10..60], para fijar la velocidad con la que se escrola el contenido con la rueda del ratón. Por defecto: 25
	*/
	initialize: function(_divContenido, _divBarra, _divKnob, _horizontal, _velocidadRueda)
	{
		//Inicializar propiedades
		this.divContenido = _divContenido;
		this.divBarra = _divBarra;
		this.divKnob = _divKnob;
		this.horizontal = _horizontal;
		if (!_velocidadRueda)
			_velocidadRueda = 25;
		else
			_velocidadRueda = _velocidadRueda.limit(10,60);
		this.velocidadRueda = _velocidadRueda;
		this.scr = new Fx.Scroll(_divContenido);
		var scr = this.scr;
		var cont = this.divContenido;
		
		//Para 'encoger' bordes del knob
		var selBorderInf = (_horizontal)? 'border-left': 'border-top';
		var selBorderSup = (_horizontal)? 'border-right': 'border-bottom';
		
		//Generar la barra
		this.sld = new Slider(this.divBarra, this.divKnob, {
			snap: false,
			mode: (this.horizontal?'horizontal':'vertical'),
			initialStep:0,
			//wheel: false,
			onChange: function(step)
			{
				/* 'encoger' bordes */
				if (step==0) { _divKnob.setStyle(selBorderInf, 'none');}
				else { _divKnob.setStyle(selBorderInf, ''); }
				if (step==this.options.steps) { _divKnob.setStyle(selBorderSup, 'none');}
				else { _divKnob.setStyle(selBorderSup, ''); } /*no se por qué, pero esto no hace falta!*//*GER:si que hace falta..*/
				if (step<=this.options.steps)
				{
					if(this._horizontal)
					{
						scr.set(step,0);
					}
					else
					{
						//$('LogonLink').set('text',_divKnob.getStyle('top'));
						scr.set(0,step);
					}
					//info(this.sizeWrapper, this.sizeContenido, '(onChange):' + this.steps, step);
				}
			}
		});
		//info(this.sizeOrigContenido, _divContenido.getSize().y, this.rangoInf, this.rangoSup, this.sld.options.steps, this.sld.step);
		
		var sl = this.sld;
		_divContenido.addEvent('mousewheel', function(event){
			var st = sl.step - (event.wheel * _velocidadRueda);
			sl.set(st);});
			
		if(isTouchingScreen)
		{
			var mouseini=0;
			_divContenido.addEvent('mousedown', function(evt) {
				mouseini = evt.page.y;
				this.addEvent('mousemove', function(e){
					e.preventDefault();
					var diff =  -(e.page.y -mouseini);
					var st = sl.step + (diff *2);
					sl.set(st);
					mouseini = e.page.y;
				});
			});
			_divContenido.addEvent('mouseup', function(e) {
				this.removeEvents('mousemove');
			});
		}
	},
    
	setPosition: function(step)
	{
		this.sld.set(step);
	},
    
	resize: function(size)
	{
		//Operaciones cuando el slider existe
		if(this.sld)
		{
			var divContenidoScrollSize = this.divContenido.getScrollSize();
			var divContenidoSize = this.divContenido.getSize();
			
			//Actualizar tamaños capas
			if(this.horizontal)
			{
				this.sizeContenido = divContenidoScrollSize.x;
				this.sizeWrapper = divContenidoSize.x;
			}
			else
			{
				this.sizeContenido = divContenidoScrollSize.y;
				this.sizeWrapper = divContenidoSize.y;
			}
			
			//alert(this.sizeContenido+"::"+this.sizeWrapper);
			//Si no es necesario escrolar, se oculta barra y knob
			if(this.sizeContenido<=this.sizeWrapper+1)
			{
				this.active=false;
				this.divBarra.setStyle('display','none');
				this.divKnob.setStyle('display','none');
			}
			else
			{
				this.active=true;
				this.divBarra.setStyle('display','');
				this.divKnob.setStyle('display','');
			}
		
			//Actualizar Steps de la barra
			this.sld.steps = this.sizeContenido - this.sizeWrapper;
			this.sld.options.steps = this.sizeContenido - this.sizeWrapper;
			this.sld.min = 0;				//OJO!! Esto de min y max no aparece en la doc. del more, pero si no, no funciona bien el mover el scroll con la rueda!!
			this.sld.max = this.sld.options.steps;
		
			//info(this.sizeWrapper, this.sizeContenido, this.sld.options.steps, this.sld.step);
		
			//reescalar la barra = tamaño del wrapper
			if(!size)
			{
				if(this.horizontal)
				{
					this.divBarra.setStyle('width', this.sizeWrapper);
				}
				else
				{
					this.divBarra.setStyle('height', this.sizeWrapper);
				}
			}
			else
			{
				if(this.horizontal)
				{
					this.divBarra.setStyle('width', size);
				}
				else
				{
					this.divBarra.setStyle('height', size);
				}
			}
			
			//reescalar el tirador en proporción al contenido y al wrapper			
			var barSize = this.divBarra.getSize().y;
			var knobSize = (((barSize / this.sizeContenido)) * barSize).round();
			if(!isNaN(knobSize)) this.divKnob.setStyle('height', knobSize+"px");
			
			//Evitar que el handler se salga del límite superior de la barra (cuando se ha reducido el tamaño del contenido)
			var divKnobCoord = this.divKnob.getCoordinates();
			var divBarraCoord = this.divBarra.getCoordinates();
			if (this.horizontal)
			{
				var limiteSuperiorHandler = divKnobCoord.left + divKnobCoord.width;
				var limiteSuperiorBarra = divBarraCoord.left + divBarraCoord.width;
				var propiedadCss = 'width';
				var valorCss = (divBarraCoord.left + divBarraCoord.width) - divKnobCoord.left;
				if(valorCss<0) valorCss=divBarraCoord.left;
			}
			else
			{
				var limiteSuperiorHandler = divKnobCoord.top + divKnobCoord.height;
				var limiteSuperiorBarra = divBarraCoord.top + divBarraCoord.height;
				var propiedadCss = 'height';
				var valorCss = (divBarraCoord.top + divBarraCoord.height) - divKnobCoord.top;
				if(valorCss<0) valorCss=divBarraCoord.top;
			}

			//Si el handler se sale de la barra, posicionar al final y reescalar handler
			if(limiteSuperiorHandler >= limiteSuperiorBarra)
			{
				this.divKnob.setStyle(propiedadCss, valorCss );
				this.sld.set(this.sld.options.steps);			//Situarlo en el final y lanzar evento 'onChange'
				this.sld.fireEvent('change', this.sld.options.steps);
			}
			
			this.sld.autosize();
			
			//Si después del autosize, el knob aún se sale de la barra, situarla al final
			var divKnobCoord = this.divKnob.getCoordinates();
			var divBarraCoord = this.divBarra.getCoordinates();
			if (this.horizontal)
				if (divKnobCoord.left + divKnobCoord.width > divBarraCoord.left + divBarraCoord.width)
					this.sld.fireEvent('change', this.sld.options.steps);
			else
			{
				if (divKnobCoord.top + divKnobCoord.height > divBarraCoord.top + divBarraCoord.height)
					this.sld.fireEvent('change', this.sld.options.steps);
			}
			this.sld.fireEvent('change', this.sld.step);
		}
	},
	isActive: function()
	{
		return this.active;
	}
});
var PopupWindowClose=new Class
({
	element:null,
	normalicon:null,
	initialize:function()
	{
		this.element=new Element('div',{'id':'Close'});
		this.element.normalicon=new Element('img',{'id':'Normal','src':jspStoreImgDir+'img/PopupWindow/close_normal.gif'});
		this.element.activeicon=new Element('img',{'id':'Active','src':jspStoreImgDir+'img/PopupWindow/close_active.gif'});
		this.element.adopt(this.element.normalicon);
		this.element.adopt(this.element.activeicon);
		this.element.activeicon.setStyle('display','none');
		
		this.element.addEvent('click',function()
		{
			popupWindow.close();
		});
		if(!isTouchingScreen)
		{
			this.element.addEvent('mouseover',function()
			{
				this.normalicon.setStyle('display','none');
				this.activeicon.setStyle('display','inline');
			});
			this.element.addEvent('mouseout',function()
			{
				this.normalicon.setStyle('display','inline');
				this.activeicon.setStyle('display','none');
			});
		}
		return(this.element);
	}
});
var PopupWindow=new Class
({
	element:null,
	container:null,
	scroller:null,
	callback:null,
	closeel:null,
	isPopup:false,
	iframe:null,
	
	initialize:function(_callback)
	{
		this.isPopup=document.location.href.contains('popup=true');
		this.element=new Element('div',{'id':'PopupWindow'});
		this.element.set('html','<table cellpadding="0" cellspacing="0"><tbody><tr><td id="tdContainer"></td><td id="tdScroll"></td></tr></tbody></table>');
		this.closeel=new PopupWindowClose();
		this.element.adopt(this.closeel);
		this.container=new Element('div',{'id':'Container'});
		this.element.getElement('#tdContainer').adopt(this.container);
		var scrollbar=new Element('div',{'class':'scrBarYbold','id':'scrollbarRegister'});
		var knob=new Element('div',{'class':'scrKnobYbold','id':'handlerRegister'});
		/*
		<div id="scrollbar" class="scrBarYlight" style="height: 561px; display: none;">
                            <div id="handler" class="scrKnobYlight" style="position: relative; top: -563px; height: 0px; display: none;"></div>
                       </div>
		*/
		scrollbar.adopt(knob);
		this.element.getElement('#tdScroll').adopt(scrollbar);
		this.scroller = new customScrollbar(this.container, scrollbar, knob, false);
		$('layout_front').adopt(this.element);
	},
	show:function(_content)
	{
		$('layout_filter').setStyle('display','block');
		$('layout_front').setStyle('display','block');
		this.resize();
		
		/*
		OJO SI SE DESCOMENTA ESTO PORQUE ALGUNAS COSAS PETAN COMO EL SELECT DE CONTACTO ONLINE
		this.container.fade('hide');
		this.container.fade('in');
		*/
		
		/* PARA ARREGLAR EL ERROR 18
		var self = this;
		this.element.getElements('input').each(function(item, index)
		{
			item.addEvent('focus', function(event){
				event.stop();
				//self.scroller.setPosition(item.getPosition().top);
				//self.container.scrollTo(0,100);
				//alert(item.getPosition().y);
				self.scroller.resize();
					//self.scroller.setPosition(item.getPosition().y);
				//alert(item.getCoordinates().top);
				});
		});*/
	},
	close:function()
	{
		$('layout_filter').setStyle('display','none');
		$('layout_front').setStyle('display','none');
		
		if(this.callback!=null) 
		{
			this.callback.apply();
			this.callback=null;
		}
	},
	hideClose:function()
	{
		this.closeel.hide();
	},
	showClose:function()
	{
		this.closeel.show();
	},
	load:function(_page,_evalScripts)
	{
		this.container.set('load', {method:'get',  evalScripts: (_evalScripts!=null&&_evalScripts==true), onComplete: function()
		{
			popupWindow.show();
			//popupWindow.center();
		}});
		this.container.load(_page);
	},
	loadProduct:function(_page)
	{
		if(typeof PBCategoryJSON!='undefined') ItxAnalytics.setSource("Mag_"+PBCategoryJSON.categoryIdentifier);
		if(_page.contains('?')) {_page+='&';} else {_page+='?';}
		_page+='iframe=true&popup=true';
		this.container.set('html','<iframe border="0px" src="'+_page+'" width="690px" height="460px" frameborder="0" scrolling="no" allowtransparency="true" style="border:none; overflow:hidden;"></iframe>');
		this.container.setStyle('padding-right','0px');
		this.element.setStyle('padding','20px');
		this.callback=function()
		{
			this.container.setStyle('padding-right','20px');
			this.element.setStyle('padding','40px 12px 40px 40px');
			this.container.getElement('iframe').destroy();
		}.bind(this);
		popupWindow.show();
		/*this.container.set('load', {method:'get',  evalScripts: (_evalScripts!=null&&_evalScripts==true), onComplete: function()
		{
			popupWindow.show();
			popupWindow.center();
		}});
		this.container.load(_page);*/
	},
	updateContent:function(_content,_evalScripts)
	{
		this.container.empty();
		this.container.set('html',_content);
		if(_evalScripts!=null&&_evalScripts==true) _content.stripScripts(true);
		this.scroller.setPosition(0);
		this.show();
	},
	loadOnIframe:function(_src)
	{
		this.container.empty();
		this.iframe = new Element('iframe', {'id':'iframe_popup', 'class':'resizable_iframe','frameborder':'0','scrolling':'no'}).inject(this.container);
		this.iframe.setStyles({'border':'0' , 'background-color':'white'});
		this.iframe.set('src',_src);
		//this.iframe.addEvent('load',this.onIframeLoaded.bind(this));
		this.show();
	},
	resizeIframe:function(_width,_height)
	{
		this.iframe.setStyles({'width':_width , 'height':_height});
		this.resize();
	},
	/*showShare:function(_image,_link)
	{
		var content = ''+
		'<div>'+
			'<div style= float:left; " >'+
				'<img src="'+_image+'" height="380px" width="auto" />'+
			'</div>'+
			'<div style="width:320px; float:left; height:380x; padding-left:34px;">'+
				'SHARE'+
			'</div>'+
		'</div>';
		
		this.container.empty();
		this.container.set('html',content);
		this.scroller.setPosition(0);
		this.show();
	},*/
	resize:function()
	{
		if($('layout_front').getStyle('display')!='none')
		{
			if(this.container.getElement('iframe')!=null)
			{
				if(this.container.getElement('iframe').get('class') != "resizable_iframe") this.container.getElement('iframe').setStyle('height','460px');
			}
			
			//this.container.setStyle('max-width','800px');
			this.container.setStyle('width','');
			if(this.container.getSize().x>800)
			this.container.setStyle('width','800px');
			
			//this.container.setStyle('max-height',window.getSize().y-200+"px");
			this.container.setStyle('height','');
			if(this.container.getSize().y>window.getSize().y-200)
			this.container.setStyle('height',window.getSize().y-200+'px');
			
			if(this.container.getElement('iframe')!=null)
			{
				if(this.container.getElement('iframe').get('class') != "resizable_iframe")
				{
					if(this.container.getSize().y<460)
					{
						this.container.setStyle('height').setStyle('height','360px');
						this.container.getElement('iframe').setStyle('height','360px');
					}
				}
			}
			this.scroller.resize();
			this.center();
		}
	},
	center:function()
	{
		$('layout_front').setStyle('margin-left',-$('layout_front').getSize().x/2+"px");
		$('layout_front').setStyle('margin-top',-$('layout_front').getSize().y/2+"px");
	},
	//Callback que se ejecutará al cerrar el popup
	addCallback: function(_callback)
	{
		this.callback = _callback;
	}
});

function fnResizePoupWindow()
{
	popupWindow.resize();
}

var popupWindow;
loadController.addFunction(function()
{
	popupWindow=new PopupWindow();
	resizeController.addFunction(function(){popupWindow.resize();});
	//resizeController.addFunction(fnResizePoupWindow);
	//resizeController.addFunction(function(){popupWindow.resize.delay(100,popupWindow);});
});var topMenuHeight=30;
var bottomMenuHeight=25;
var isIframe=false;
function fnIntializeLayout(_isIframe)
{
	if(typeof _isIframe!='undefined') isIframe=_isIframe;
	//alert('fnIntializeLayout('+isIframe+')');
	if(isIframe)
	{
		$('layout_back').setStyles({'height':window.getSize().y,'top':'0px'});
	}
	else
	{
		$('layout_back').setStyles({'height':window.getSize().y-topMenuHeight-bottomMenuHeight,'top':topMenuHeight});
	}
}
loadController.addFunction(function()
{
	fnIntializeLayout();
	//alert('resizeController>fnIntializeLayout('+isIframe+')');
	resizeController.addFunction(fnIntializeLayout);
});var AlertPanel=new Class(
{
	show:function(_title,_message)
	{
		alert(_message);
	}
});
var alertPanel=new AlertPanel();var Currency=new Class(
{
	decimals:null,
	decimalSymbol:null,
	groupingSymbol:null,
	symbolPrefix:null,
	symbol:null,
	
	initialize:function()
	{
		this.decimals=Number(HeaderJSON.currencyDecimalPlaces);
		this.decimalSymbol=HeaderJSON.currencyDecimalSymbol;
		this.groupingSymbol=HeaderJSON.currencyGroupingSymbol;
		this.symbolPosition=HeaderJSON.currencyPrefix.length==0;
		this.symbol=HeaderJSON.currencySymbol;
	},
	format:function(_price)
	{
		_price=Number(_price);
		if(_price==0)
		{
			_price='0';
			for(cont=0;cont<this.decimals;cont++){_price+='0';}
		}
		else
		{
			for(cont=0;cont<this.decimals;cont++){_price*=10;}
			_price=String(Math.round(_price));
		}
		if(_price.length>this.decimals+3){_price=_price.substring(0,_price.length-this.decimals-3)+this.groupingSymbol+_price.substring(_price.length-this.decimals-3);}
		_price='<span class="integer">'+_price.substring(0,_price.length-this.decimals)+'</span><span class="decimals">'+this.decimalSymbol+_price.substring(_price.length-this.decimals)+'</span>';
		if(this.symbolPosition) {_price+='<span class="currency">&nbsp;'+this.symbol+'</span>';} else {_price='<span class="currency">'+this.symbol+'&nbsp;</span>'+_price;}
		return(_price);
	}
});
var currency;
loadController.addFunction(function(){currency=new Currency();});function staticRegisterViewBeginProcess()
{
	//Botón 'atrás'
	$('backLink').addEvent('click', function(e)
	{
		accountController.openLogonForm();
	});
	
	//Formatear formulario
	var frm = new customForm('formRegister', true, true, popupWindow.resize.bind(popupWindow));
	
	//Comportamiento del botón particular/empresa
	if($('individual')!=null) $('individual').addEvent('click', function() {actualizaFormRegistro()});
	if($('company')!=null) $('company').addEvent('click', function() {actualizaFormRegistro()});
	actualizaFormRegistro();
	
	configuraTabuladores();
	
	
};

function actualizaFormRegistro()
{
	if($('individual')!=null && $('company')!=null)
	{
		var tipoDatos = $('formRegister').getElement('input[name=typeData]:checked').value;
		if(tipoDatos == 'individual')
		{
			$('campoNif').setStyle('display','none');
			$('campoNombreEmpresa').setStyle('display','none');
			$('nif').set('disabled','true');
			$('company_name').set('disabled','true');
			configuraTab( 'logonPasswordVerify', 'individual');		
			configuraTab( 'individual', 'firstName');
			//configuraTab( 'company', 'firstName');
		}
		else if(tipoDatos=='company')
		{
			$('campoNif').setStyle('display','');
			$('campoNombreEmpresa').setStyle('display','');
			$('nif').set('disabled');
			$('company_name').set('disabled');
			//configuraTab( 'individual', 'nif');
			configuraTab( 'logonPasswordVerify', 'company');
			configuraTab( 'company', 'nif');
			configuraTab( 'nif', 'company_name');
			configuraTab( 'company_name', 'firstName');
		}
	}
    
	if($('man')!=null && $('woman')!=null)
	{
		var sexoSel = $('formRegister').getElement('input[name=sexo]:checked').value; 
    
		if(sexoSel == 'man')
		{
			configuraTab( 'year', 'man');
			configuraTab( 'man', 'address1');
		}
		if(sexoSel == 'woman')
		{
			configuraTab( 'year', 'woman');
			configuraTab( 'woman', 'address1');
		}
	}

	//Parche para Irlanda
	if($('storeCountryABBR').get('value')=='IE')
	{
		if($('zipCode').hasClass('required'))
		{
			$('zipCode').removeClass('required');
		}
	}
	
    popupWindow.resize();
}


function configuraTabuladores()
{	
	configuraTab('email1', 'emailVerify');
	configuraTab('emailVerify', 'logonPassword');
	configuraTab( 'logonPassword', 'logonPasswordVerify');
	//configuraTab( 'logonPasswordVerify', 'individual'); 
	//configuraTab( 'logonPasswordVerify', 'company');

	configuraTab( 'firstName', 'lastName');
	configuraTab( 'lastName', 'year');
	//configuraTab( 'year', 'man');
	
	//configuraTab( 'woman', 'address1');
	//configuraTab( 'man', 'address1');
	
	configuraTab( 'address1', 'zipCode');
	configuraTab( 'zipCode', 'city');
	configuraTab( 'city', 'state');
	configuraTab( 'state', 'phone1');
	configuraTab( 'phone1', 'phone2');
	configuraTab( 'phone2', 'newsletter');
	configuraTab( 'newsletter', 'privacy');
	configuraTab( 'privacy', 'nextBt');
	configuraTab( 'nextBt', 'email1');
}var activeTopMenuElement=null;
var defaultCategoryId=null;
var itemDesplegado = false;

function fnIntitializeTopMenu()
{
	if(TopMenuJSON.extra!=null)
	{
		TopMenuJSON.extra.each(function(item)
		{
			TopMenuJSON.menu.each(function(item2)
			{
				if(item.categoryPrincipalId==item2.categoryPrincipalId)
				{
					item2.items=item2.items.append(item.items);
				}
			});
		});
	}

	if(TopMenuJSON.breadcrumbs.length>0)
	defaultCategoryId=TopMenuJSON.breadcrumbs[0].categoryId;
	var div_top_menu=$('top_menu');
	TopMenuJSON.menu.each(function(item,index)
	{
		if(index>0) {div_top_menu.adopt(new Element('div', {'class':'top_menu_separator', 'text':'|'}));}
		var elemento=new Element('div', {'class':'top_menu_option'});
		var elementotexto=new Element('div', {'class':'top_menu_option_header', 'html':item.categoryPrincipalName, 'value':item.categoryPrincipalUrl});
		elemento.adopt(elementotexto);
		if(item.categoryPrincipalId==defaultCategoryId) {activeTopMenuElement=elemento;}
		
		
		elemento.addEvent('click',function()
		{
		
				if(this.getElement('div.top_menu_submenu').getStyle('display') == 'none')
				{
					if(!itemDesplegado)
					{
						this.getElement('div.top_menu_option_header').setStyle('background-color','#333333');
						this.getElement('div.top_menu_option_header').setStyle('color','#cccccc');
						this.getElement('div.top_menu_submenu').setStyle('display','');
						if(this.getPrevious('.top_menu_separator')!=null) this.getPrevious('.top_menu_separator').setStyle('color','transparent');
						if(this.getNext('.top_menu_separator')!=null) this.getNext('.top_menu_separator').setStyle('color','transparent');
						itemDesplegado = true;
					}
				}
				else
				{
					this.getElement('div.top_menu_option_header').setStyle('background-color','');
					this.getElement('div.top_menu_option_header').setStyle('color','');
					this.getElement('div.top_menu_submenu').setStyle('display','none');
					if(this.getPrevious('.top_menu_separator')!=null) this.getPrevious('.top_menu_separator').setStyle('color','');
					if(this.getNext('.top_menu_separator')!=null) this.getNext('.top_menu_separator').setStyle('color','');
					itemDesplegado = false;
				}
		});

		if(!isTouchingScreen)
		{
			elemento.addEvent('mouseover',function()
			{
				this.getElement('div.top_menu_option_header').setStyle('background-color','#333333');
				this.getElement('div.top_menu_option_header').setStyle('color','#cccccc');
				this.getElement('div.top_menu_submenu').setStyle('display','');
				if(this.getPrevious('.top_menu_separator')!=null) this.getPrevious('.top_menu_separator').setStyle('color','transparent');
				if(this.getNext('.top_menu_separator')!=null) this.getNext('.top_menu_separator').setStyle('color','transparent');
				itemDesplegado = true;
			});
		}
		elemento.addEvent('mouseleave',function()
		{
			this.getElement('div.top_menu_option_header').setStyle('background-color','');
			this.getElement('div.top_menu_option_header').setStyle('color','');
			this.getElement('div.top_menu_submenu').setStyle('display','none');
			if(this.getPrevious('.top_menu_separator')!=null) this.getPrevious('.top_menu_separator').setStyle('color','');
			if(this.getNext('.top_menu_separator')!=null) this.getNext('.top_menu_separator').setStyle('color','');
			itemDesplegado = false;
		});
	
		if(item.categoryPrincipalUrl!=null&&item.categoryPrincipalUrl.trim()!='')
		{
			if(item.categoryPrincipalUrl.contains(':BLANK'))
			{
				elemento.store('href',item.categoryPrincipalUrl.replace(':BLANK',''));
				elemento.store('target','BLANK');
			}
			else if(item.categoryPrincipalUrl.contains(':POPUPWINDOW'))
			{
				elemento.store('href',item.categoryPrincipalUrl.replace(':POPUPWINDOW',''));
				elemento.store('target','POPUPWINDOW');
			}
			else
			{
				elemento.store('href',item.categoryPrincipalUrl);
			}
			
			elemento.addEvent('click',function()
			{
				if(this.retrieve('target')!=null)
				{
					if(this.retrieve('target')=='POPUPWINDOW')
					{
						popupWindow.load(this.retrieve('href'),true);
					}
					else if(this.retrieve('target')=='BLANK')
					{
						window.open(this.retrieve('href'));
					}
					else document.location.href=this.retrieve('href');
				}
				else document.location.href=this.retrieve('href');
			});
		}
		
		var elemento1=new Element('div', {'class':'top_menu_submenu'});
		item.items.each(function(item,index)
		{
			var elemento2=new Element('div', {'class':'top_menu_submenu_option', 'html':item.categoryName});
			if(item.categoryUrl!=null&&item.categoryUrl.trim()!='')
			{
				if(item.categoryUrl.contains(':BLANK'))
				{
					elemento2.store('href',item.categoryUrl.replace(':BLANK',''));
					elemento2.store('target','BLANK');
				}
				else if(item.categoryUrl.contains(':POPUPWINDOW'))
				{
					elemento2.store('href',item.categoryUrl.replace(':POPUPWINDOW',''));
					elemento2.store('target','POPUPWINDOW');
				}
				else
				{
					elemento2.store('href',item.categoryUrl);
				}
				elemento2.addEvent('mouseover',function(){this.setStyle('background-color','#7f7f7f');});
				elemento2.addEvent('mouseout',function(){this.setStyle('background-color','');});
				elemento2.addEvent('click',function(e)
				{
					
					e.stop();
					this.getParent().getParent().fireEvent('mouseleave',e);
					if(this.retrieve('target')!=null)
					{
						if(this.retrieve('target')=='POPUPWINDOW')
						{
							popupWindow.load(this.retrieve('href'),true);
						}
						else if(this.retrieve('target')=='BLANK')
						{
							window.open(this.retrieve('href'));
						}
						else document.location.href=this.retrieve('href');
					}
					else document.location.href=this.retrieve('href');
				
				});
			}
			else elemento2.setStyle('cursor','default');
			elemento1.adopt(elemento2);
		});
		elemento.adopt(elemento1);
		elemento1.setStyle('display','none');
		div_top_menu.adopt(elemento);
	});
	fnResizeTopMenu();
}

function fnResizeTopMenu()
{	
	//$('LogonLink').set('text', $('top_logo').getSize().x + ' ' + $('top_menu').getCoordinates().width + ' ' + $('top_account').getSize().x  + ' -- ' + $('layout_top').getSize().y);	
	$('LogonLink').setStyle('display', '');
	$('WishListLink').setStyle('display', '');
	$('ShopCartLink').setStyle('display', '');
	$('LogonIcon').setStyles({'padding-top':'0px', 'padding-bottom': '0px'});
	$('AccountIcon').setStyles({'padding-top':'0px', 'padding-bottom': '0px'});
	$('WishListIcon').setStyles({'padding-top':'0px', 'padding-bottom': '0px'});
	$('MiniShopCartNormalBasket').setStyles({'padding-top':'0px', 'padding-bottom': '0px'});
	$('MiniShopCartActiveBasket').setStyles({'padding-top':'0px', 'padding-bottom': '0px'});
	
	$('NotLoggedIn').removeEvents('mouseover');
	$('NotLoggedIn').removeEvents('mouseout');
	
	$('WishListOption').removeEvents('mouseover');
	$('WishListOption').removeEvents('mouseout');
	if(typeof UserHeaderJSON!='undefined'&&UserHeaderJSON.userType!='G')
	{
		$('AccountText').show();
	}
	fnFoldTopMenu();
}


function fnFoldTopMenu()
{
	if($('layout_top').getSize().y > 30)
	{
		$('top_account').setStyle('display','none');
		
		//Ocultar textos y dejar solo los links
		$('LogonLink').setStyle('display', 'none');
		$('WishListLink').setStyle('display', 'none');
		$('ShopCartLink').setStyle('display', 'none');
		
		$('LogonIcon').setStyles({'padding-top':'10px', 'padding-bottom': '10px'});
		$('AccountIcon').setStyles({'padding-top':'10px', 'padding-bottom': '10px'});
		$('WishListIcon').setStyles({'padding-top':'10px', 'padding-bottom': '10px'});
		
		$('MiniShopCartNormalBasket').setStyles({'padding-top':'7px', 'padding-bottom': '7px'});
		$('MiniShopCartActiveBasket').setStyles({'padding-top':'7px', 'padding-bottom': '7px'});
		
		if(typeof UserHeaderJSON!='undefined'&&UserHeaderJSON.userType!='G')
		{
			$('AccountText').hide();
		}
		$('NotLoggedIn').addEvent('mouseover', function(e) {
			e.stop();
			$('LogonLink').setStyle('display', '');
			$('LogonIcon').setStyles({'padding-top':'0px', 'padding-bottom': '0px'});
		} );
		$('NotLoggedIn').addEvent('mouseout', function(e) {
			e.stop();
			$('LogonLink').setStyle('display', 'none');
			$('LogonIcon').setStyles({'padding-top':'10px', 'padding-bottom': '10px'});
		} );
		$('WishListOption').addEvent('mouseover', function(e) {
			e.stop();
			$('WishListLink').setStyle('display', '');
			$('WishListIcon').setStyles({'padding-top':'0px', 'padding-bottom': '0px'});
		} );
		$('WishListOption').addEvent('mouseout', function(e) {
			e.stop();
			$('WishListLink').setStyle('display', 'none');
			$('WishListIcon').setStyles({'padding-top':'10px', 'padding-bottom': '10px'});
		} );
		$('top_account').setStyle('display','');
	}
}

loadController.addFunction(function(){fnIntitializeTopMenu();});
resizeController.addFunction(function(){fnResizeTopMenu();});


/************************************* FUNCIONES SUMARIO **************************************************/
var PBSummary=null;
var PBSummaryFirstTimeView=true;

//Busca en el JSON del PBSummary el nº de post superiores a una fecha dada
//Devuelve en lastDate la fecha más reciente de los post del sumario
function numPostByDate(fecha, lastDate)
{
	var fecRef = Date.parse(fecha);
	if(fecha=="")
		fecRef = Date.parse('01/01/1975');
	else
		fecha = Date.parse(fecha);
	
	var newPosts = 0;
	summaryContentsJSON.items.each(function(item,index){
		if(Date.parse(item.fecha) > fecha)
		{
			newPosts++;
		}
		if(Date.parse(item.fecha) > fecRef)
		{
			fecRef = Date.parse(item.fecha);
		}
	});
	
	lastDate.data = fecRef;
	if(fecha=="")
	{
		return summaryContentsJSON.items.length;
	}
	else
	{
		return newPosts;
	}
}

var PBSummaryClass = new Class(
{
	element:$('pbSummary'),
	container: null,
	wrapper: null,
	content: null,
	availWidth: null,
	availHeight: null,
	maxColWidth: 328,
	minColWidth: 228,
	actBlockWidth: 310,
	marginExt: 18,
	marginInt: 18,
	scrollBarWidth: 14, 
	scrollbar: null,
	customScrollBar: null,
	slider: null,
	closeButton: null,
	posts: null,
	numBloques: 0,
	actImgLoaded: 0,
	isVisible: false,
	newContents: 0,
	firstTimeView: true,
	blink: null,
	accesButton:null,
	altoBarras: 60,
	
	
	initialize: function()
	{
		if(typeof(summaryContentsJSON)!='undefined')
		{
			//Comprobar contenidos no vistos del sumario (sin actualizar cookie)
			this.newContents = this.checkSummaryUpdates(false);
			
			this.element.getPrevious('.bottom_utils_separator').setStyle('visibility', 'hidden');
			
			this.accessButton = $('pbSummary');
			$('pbSummary').grab(new Element('div', {'id': 'newContents', 'text': this.newContents, 'style': 'text-align: center;'}), 'top');
			if(this.newContents==0)
				this.element.getElement('#newContents').setStyle('display','none');
			
			if(this.newContents>0)
			{
				//Activar parpadeo del boton
				$('pbSummary').setStyle('background-image', 'url("' + jspStoreImgDir + 'img/bottom/summaryfade.gif")');
			}
			
			if($('wnContainer'))
			{
				//loadController.removeFunction(fnInitializeWhatsNew);
				$('wnContainer').setStyle('display','none');
			}
		
			this.container = this.element.getFirst('#wnContainer');
			this.container = this.container.dispose();
			//$('layout_bottom').grab(this.container, 'before'); 
			$('layout_back').grab(this.container, 'after'); 
		
			this.wrapper = this.container.getFirst('#wnWrapper');
			this.content = this.wrapper.getFirst('#wnContent');
			
			/*this.container.setStyles({'display':'none', 'bottom': window.getSize().y * (-1)});*/
			this.container.setStyles({'height':'0px', 'bottom': '0px'});
			
			this.element.set('id', 'Summary');
			this.container.set('id', 'summaryContainer');
			this.wrapper.set('id', 'summaryWrapper');
			this.content.set('id', 'summaryContent');
			this.content.empty();
			this.setHTMLElements();
			
			resizeController.addFunction(this.resize.bind(this));
		}
		else
		{
			$('pbSummary').setStyle('display','none');
		}
	},
	
	//Genera los componentes HTML del sumario
	setHTMLElements: function()
	{
		this.closeButton = new Element('div', {'id':'closeButton', 'class': 'closeButton', 'width': 18, 'height': 18, 'style': 'position:absolute; top: 15px; right: 13px'}).adopt(new Element('img', {'src': jspStoreImgDir + 'img/bottom/close_news.png'}));
		this.scrollbar = new Element('div',{'class':'scrBarYminWn','id':'wnScrollbar','style':'position:absolute;top:45px;right:14px'});
		this.slider = new Element('div',{'class':'scrKnobYmin','id':'wnHandler'});
		this.scrollbar.adopt(this.slider);
		
		this.container.adopt(this.scrollbar);
		this.container.adopt(this.closeButton);
		
		this.customScrollBar = new customScrollbar(this.wrapper, this.scrollbar, this.slider, false);
		
		//Eventos
		this.accessButton.removeEvents('click');
		
		//Abrir sumario
		this.accessButton.addEvent('click', function(e) {
			e.stop();
			if(!this.isVisible)
			{
				if(this.firstTimeView)
				{
					this.newContents = this.checkSummaryUpdates(true);
					this.element.getElement('#newContents').destroy();
					this.firstTimeView = false;
					$('Summary').setStyle('background-image',''); //Desactivar parpadeo
					this.element.setStyle('background-color', '#FFFFFF');
				}
				this.show();
				this.cargarImagenes(0);
			}
			else
				this.hide();
		}.bind(this));
		
		//Cerrar sumario
		this.closeButton.addEvent('click', function(e) {
			e.stop();
			if(this.isVisible)
			{
				this.hide();
			}
		}.bind(this));
		
		//Rollover close button
		this.closeButton.addEvent('mouseenter', function(e)
		{
			e.stop();
			this.getElement('img').set('src', jspStoreImgDir + 'img/bottom/close_news_over.png');
		});
		this.closeButton.addEvent('mouseout', function(e)
		{
			e.stop();
			this.getElement('img').set('src', jspStoreImgDir + 'img/bottom/close_news.png');
		});
		
		this.generarArrayPosts();
		this.resize();
	},
	
	//Comprueba el nº de contenidos nuevos del sumario desde la última visita
	checkSummaryUpdates: function(updateCookie)
	{
		var cookieName='PB_ldSumContent' + StoreLocatorJSON.country;
		var lastPostDate = Cookie.read(cookieName);
		if(lastPostDate==null) lastPostDate="";
		
		//Buscar contenidos nuevos del sumario
		var newLastPostDate = new Object();
		var newContents = numPostByDate(lastPostDate, newLastPostDate);
		
		//Almacenar la nueva fecha en la cookie
		if(updateCookie)
		{
			Cookie.dispose(cookieName);
			Cookie.write(cookieName,Date.parse(newLastPostDate.data).format('db'),{'duration':365});
		}
			
		return newContents;
	},
	
	generarArrayPosts: function()
	{
		this.posts = new Array();
		
		var cookieName='PB_ldSumContent' + StoreLocatorJSON.country;
		var lastPostDate = Cookie.read(cookieName);
		if(lastPostDate==null) lastPostDate="";
		
		summaryContentsJSON.items.each(function(item,index)
		{
			//Comprobar si hay que mostrar el post, según el país
			var criterioPaises = null;
			var visualizarPost = true;

			if(item.paisesIn!=undefined  && item.paisesIn.length>0 )
			{
				visualizarPost = ( item.paisesIn.contains(StoreLocatorJSON.country)) ||  (item.paisesIn.contains("onlineStores") && storeIsOpen);
			}
			
			if(item.paisesOut!=undefined && item.paisesOut.length>0)
			{
				if(visualizarPost)
				{
					visualizarPost = ( !item.paisesOut.contains(StoreLocatorJSON.country)) || (item.paisesIn.contains("onlineStores") && !storeIsOpen);
				}	
			}
			
			
			if(visualizarPost)
			{
				
				var newContent = (lastPostDate=='') || (lastPostDate!='' && Date.parse(lastPostDate)<Date.parse(item.fecha));
					
				var imgWidth = this.actBlockWidth - this.marginInt;
				
				var ratioImg = eval("summaryImgRatiosJSON." + item.ratioImg + ".w").toFloat() / eval("summaryImgRatiosJSON." + item.ratioImg + ".h").toFloat();
				var imgHeight = (imgWidth / ratioImg).toInt();
				
				var contentElement = new Element('div', {'class': 'contentBlock', 'style': 'width: ' + imgWidth + 'px;'});
				var imgContainer = new Element('div', {'class': 'imgContainer', 'style': 'width: ' + imgWidth + '; height: ' + imgHeight}).adopt(new Element('img', {'id':'imgPost' + index}));
				var imgRoContainer = new Element('div', {'class': 'imgContainerRo', 'style': 'width:' + imgWidth + '; height:' + imgHeight });
				if(item.link.trim()=="")
				{
					imgRoContainer.setStyle('cursor', 'default');
				}
				imgContainer.fade('hide');
				imgRoContainer.fade('hide');
				
				//abrir link
				imgRoContainer.addEvent('click', function(e)
				{
					e.stop(); this.openLink(item);
				}.bind(this));
				
				contentElement.adopt(imgContainer);
				contentElement.adopt(imgRoContainer);
				
				//Etiqueta new encima de la imagen
				if(newContent)
				{
					var newLabel = new Element('div', {'style': 'position: absolute; top:0px; left:0px; width:31px; height:13px; border: 0px none;'});
					var imgNew = new Element('img', {'src': jspStoreImgDir + 'img/bottom/new.gif'});
					newLabel.adopt(imgNew);
					imgContainer.adopt(newLabel);
				}
				
				var infoBlock = new Element('div', {'class': 'infoBlock'});
				
				if(item.category!="")
					infoBlock.adopt(new Element('div', {'class': 'category', 'html': item.category, 'style': 'width: ' + imgWidth + 'px;'}));
				
				if(item.title!="")
				{
					if(item.link.trim()=="")
						var styleCursor = "default";
					else
						var styleCursor = "pointer";
					
					var titulo = new Element('div', {'class': 'title', 'html': item.title, 'style': 'width: ' + imgWidth + 'px;cursor:' + styleCursor});
					titulo.addEvent('click', function(e)
					{
						e.stop(); this.openLink(item);
					}.bind(this));
					infoBlock.adopt(titulo);			
				}
				/* else
				{
					contentElement.setStyle('border-bottom','0');
				} */
				
				if(item.body!="")
					infoBlock.adopt(new Element('div', {'class': 'text', 'html': item.body, 'style': 'width: ' + imgWidth + 'px;'}));

				contentElement.store('ratioImg', ratioImg);
				
				//eventos rollover de la imagen
				if(item.img2!=undefined && item.img2.trim()!="")
				{
					imgRoContainer.adopt(new Element('img', {'class':'imgRo'}));
					contentElement.addEvent('mouseenter', function(e) {e.stop(); imgContainer.setStyle('visibility','hidden'); imgRoContainer.fade('show');});
					contentElement.addEvent('mouseleave', function(e) {e.stop(); imgContainer.setStyle('visibility','visible'); imgRoContainer.fade('hide');});
					
				}
				else
				{
					imgRoContainer.setStyle('background','url("' + staticContentPath + '/img/Summary/common/bgPattern.png")');
					contentElement.addEvent('mouseenter', function(e) {e.stop(); imgRoContainer.fade('show');});
					contentElement.addEvent('mouseleave', function(e) {e.stop(); imgRoContainer.fade('hide');	});
				}
				
				if(newContent)
					{
						newLabel = new Element('div', {'style': 'position: absolute; top:0px; left:0px; width:31px; height:13px; border: 0px none;'});
						imgNew = new Element('img', {'src': jspStoreImgDir + 'img/bottom/new.gif'});
						newLabel.adopt(imgNew);
						imgRoContainer.adopt(newLabel);
					}
				
				contentElement.adopt(infoBlock);
				
				
				
				this.posts.push(contentElement);
			}
			else
			{
				this.posts.push(null);
			}
		}.bind(this));
	},
	
	colocarBloquesContenido: function()
	{
		var currentBlock = 0 ;
		this.posts.each(function(item,index)
		{
			if(item!=null)
			{
				this.content.getElement('div#summaryCol' + currentBlock).adopt(item);
				
				if(currentBlock+1 < this.numBloques)
				{
					currentBlock++
				}
				else
				{
					currentBlock = 0;
				}
			}
		}.bind(this));
	},
	
	cargarImagenes: function(n)
	{
		if(n==this.posts.length)
		{
			return;
		}
		else
		{
			if(this.posts[n]!=null)
			{
				var imageLoader = new Image();
				imageLoader.onload = function()
				{
					//alert(imageLoader.src);
					var ratioImg = this.posts[n].retrieve('ratioImg');
					var imgEl = $('imgPost' + n);
					imgEl.set('src', imageLoader.src);
					imgEl.set('style', 'width: ' + this.actBlockWidth - this.marginExt + '; height: ' + ((this.actBlockWidth - this.marginExt) / ratioImg) + 'px;');
					if(this.isVisible)
					{
						imgEl.getParent('div').fade(0,1);
					}
					else
						imgEl.getParent('div').fade('show');
					this.actImgLoaded++;
					var sig=n+1;
					this.cargarImagenes.delay(0,this,sig);
				}.bind(this);
				imageLoader.src = staticContentPath + "/img/Summary/" + summaryContentsJSON.items[n].img1;
				
				//Cargar imagen de rollover si existe
				if(summaryContentsJSON.items[n].img2!=undefined && summaryContentsJSON.items[n].img2.trim()!="")
				{
					var imageRoLoader=new Image();
					imageRoLoader.onload = function()
					{
						var imgRo = this.posts[n].getElement('div.imgContainerRo').getElement('img');
						imgRo.set('src', imageRoLoader.src);
						imgRo.set('style', 'width: ' + this.actBlockWidth - this.marginExt + '; height: ' + ((this.actBlockWidth - this.marginExt) / this.posts[n].retrieve('ratioImg')) + 'px;');
					}.bind(this);
					imageRoLoader.src = staticContentPath + "/img/Summary/" + summaryContentsJSON.items[n].img2;
				}
			}
			else
			{
				n++
				this.cargarImagenes.delay(0,this,n);
			}
		}
	},
	
	resize: function()
	{
		//Adaptar contenedores principales al tamaño disponible
		if(window.getSize().x>1000)
			this.availWidth = window.getSize().x - 8 - (this.marginExt) - this.scrollBarWidth;
		else
			this.availWidth = 1000 - 8 - (2* this.marginExt) - this.scrollBarWidth;

		this.availHeight = window.getSize().y - this.altoBarras;
		if(!this.isVisible)
		{
			//this.container.setStyle('bottom',window.getSize().y * (-1));
			this.container.setStyles({'height':'0px', 'display':'none', 'padding': '0px'});
			this.wrapper.setStyles({'height': '0px', 'width': this.availWidth});
			this.content.setStyles({'width': this.availWidth});
		}
		else
		{
			this.container.setStyles({'height':this.availHeight, 'display': '', 'padding': '15px'});
			this.wrapper.setStyles({'height': this.availHeight, 'width': this.availWidth});
			this.content.setStyles({'width': this.availWidth});
		}
		
		this.container.setStyle('width',window.getSize().x-30);
		
		//Generar las columnas contenedoras necesarias
		this.actBlockWidth = this.minColWidth;
		this.numBloques = (this.availWidth / this.actBlockWidth).toInt();
		var resto = this.availWidth - (this.numBloques  * this.actBlockWidth);
		if(resto>0)
		{
			if(this.actBlockWidh + (resto/this.numBloques ).toInt() > this.maxColWidth)
			{
				this.numBloques  = this.numBloques  + 1;
				this.actBlockWidth = this.availWidth / this.numBloques ;
			}
			else
				this.actBlockWidth = this.actBlockWidth + (resto/this.numBloques ).toInt();
		}
		this.content.getElements('div.summaryCol').dispose();			
		var left = 0;
		for(var bloq=0; bloq<this.numBloques ; bloq++)
		{
			this.content.adopt(new Element('div', {'id': 'summaryCol' + bloq, 'class': 'summaryCol'}));
			$('summaryCol' + bloq).setStyles({'top': '0px', 'left': left, 'width': this.actBlockWidth, 'height': this.availHeight});
			left = left + this.actBlockWidth;
		}

		//Resize de cada elemento
		if(this.posts!=null)
		{
			this.posts.each(function(item,index){
				if(item!=null)
					this.resizeContent(item);
			}.bind(this));
		}
	
		//Distribuír los contenidos en las columnas
		this.colocarBloquesContenido();
		if(this.wrapper.getCoordinates().height>0)
			this.customScrollBar.resize(this.wrapper.getCoordinates().height - this.altoBarras);
			
		//$('NotLoggedIn').set('text', this.container.getSize().y);
	},
	
	resizeContent: function(el)
	{
		var width = this.actBlockWidth - this.marginInt;
		var imgHeight = (width / el.retrieve('ratioImg')).toInt();
			
		el.setStyle('width', width);
		el.getElement('div.imgContainer').setStyles({'width':width, 'height': imgHeight});
		el.getElement('div.imgContainer').getFirst('img').setStyles({'width':width, 'height': imgHeight});
		el.getElement('div.imgContainerRo').setStyles({'width':width, 'height': imgHeight});
		
		if(el.getElement('div.imgContainerRo').getElement('img.imgRo')!=null)
			el.getElement('div.imgContainerRo').getElement('img.imgRo').setStyles({'width':width, 'height': imgHeight});
		
		if(el.getElement('div.category')!=null)
			el.getElement('div.category').setStyle('width',width);
		if(el.getElement('div.title')!=null)
			el.getElement('div.title').setStyle('width',width);
		if(el.getElement('div.text')!=null)
			el.getElement('div.text').setStyle('width',width);
	},
	
	show: function()
	{
		var efx = new Fx.Tween(this.container,
		{
			property: 'height',
			duration: 700,
			transition: 'quad:out',
			onStart: function() {this.container.setStyles({'display':'', 'padding': '15px'}); this.wrapper.setStyles({'height': window.getSize().y-this.altoBarras}); }.bind(this),
			onComplete: function() {this.isVisible = true; this.resize(); efx.cancel(); this.element.setStyle('background-color', '#FFFFFF');}.bind(this)
		});
		
		//this.container.setStyle('display','');
		
		var from = 0;
		var to = window.getSize().y - this.altoBarras;
		efx.start(from, to);
		
		//this.resize();
		
		//this.element.setStyle('background-color', '#FFFFFF');
	},
	
	hide: function()
	{
		//this.container.setStyle('display','');
		var efx = new Fx.Tween(this.container,
		{
			property: 'height',
			duration: 500,
			transition: Fx.Transitions.Quad.easeOut, 
			onComplete: function(){this.container.setStyles({'display':'none', 'padding': '0px'});}.bind(this)
		});
		var from = this.container.getSize().y;
		var to = 0;
		
		efx.start(from, to);
		
		this.isVisible = false;
		this.element.setStyle('background-color', '#e4e4e4');
	},
	
	openLink: function(item)
	{
		if(item.link!=undefined && item.link.trim()!="")
		{
			if(item.target!=undefined && item.target!="popup")
			{
				if(item.target=='_self')
					this.hide();
				window.open(item.link, item.target);
			}
			else
			{	
				popupWindow.load(item.link, true);
			}
		}
	}
});

function fnInitializePBSummary()
{	
	//Inicialización del sumario
	if(PBSummary==null)
	{
		PBSummary = new PBSummaryClass();
	}
}

loadController.addFunction(fnInitializePBSummary);

/*************************************** FIN FUNCIONES SUMARIO ***************************************************/

var AccountController=new Class
({
	element:null,
	redirectURL:null,
	callback:null,
	
	initialize:function()
	{
		
		if(!storeIsOpen)
		{
			//Sin venta online
			$('Account').setStyle('display', 'none');
			$('MiniShopCartOption').setStyle('display', 'none');
		}	
		else
		{
			if(UserHeaderJSON.userType!='G')
			{
				/*USER IS ALREADY LOGGED*/
				this.logon();
			}
			else
			{
				/*USER IS NOT LOGGED*/
				$('LogonLink').addEvent('click',function(e)
				{
					if(typeof e!='undefined') e.stop();
					accountController.openLogonForm();
				});
				$('LoggedIn').setStyle('display','none');
				$('NotLoggedIn').setStyle('display','block');
			}
			$('AccountLink').addEvent('click',function(e)
			{
				if(typeof e!='undefined') e.stop();
				accountController.openMyAccount();
			});
		}
		//Plegado barra menú
		fnFoldTopMenu();
	},
	openLogonForm:function(_redirectURL, _callback)
	{
		if(storeIsOpen)
		{
			if(typeof _redirectURL!="undefined") this.redirectURL=_redirectURL; else this.redirectURL=null;
			if(typeof _callback!="undefined") this.callback=_callback; else this.callback=null;
			ajaxHelper.request(
			{/*LOAD LOGON FORM*/
				'url':HeaderJSON.logonLink,
				'onSuccess':function(response)
				{
					popupWindow.updateContent(response);
					$('userLogon').addEvent('submit', function(e)
					{
						/*SEND FORM*/
						e.stop();
						ajaxHelper.requestJson(
						{
							method:'post',
							evalResponse:false,
							evalScripts:false,
							data:this,
							url:this.get('action'),
							onSuccess:function(responseJSON)
							{
								/*$('userLogon').getElement('.privacyPolicyLink').addEvent('click',function(e)
								{e.stop();window.open(this.get('href'),'_blank','width=450,height=500,scrollbars=yes,status=1,toolbar=0,menubar=0,location=0,resizable=1,scrollbars=1');});*/
								/*MANAGE RESPONSE*/
								if(responseJSON!=null&&responseJSON.status==1)
								{/*SUCCESS LOGON*/
									ItxAnalytics.trackPage("/MiCuenta/Acceso/Envio_OK");
									if(accountController.redirectURL!=null)
									{
										document.location.href=accountController.redirectURL;
									}
									else
									{
										UserHeaderJSON.userType='R';
										popupWindow.close();
										/*accountController.refresh();
										miniShopCart.reload();*/
										Inditex.getPBUserJSON(function()
										{
											accountController.logon();
											miniShopCart.update();
											if(typeof shopCart!='undefined') shopCart.reload();
											//Ejecutar callback o redireccionar si todo va bien
											if(accountController.callback!=null) {accountController.callback.apply();accountController.callback=null;}
										});
									}
									//fnResizeTopMenu();
								}
								/*else
								{  EL USUARIO DEBE ACEPTAR LA NUEVA POLITICA DE PRIVACIDAD
									if(responseJSON.key=="DynamicError.notAcceptedPolicy")
									{
										new ErrorPanel(MessageLabelsStaticLogin.errorPolicyTitle, MessageLabelsStaticLogin.errorPolicyDescription);
										$('newPrivatePolicy').setStyle('display','');
										popupWindow.resize();
									}
										else
									{
										new ErrorPanel(responseJSON.title, responseJSON.message);
									}
								}*/
								/*FAIL LOGON DEVUELVE JSON ERROR*/
								else if(responseJSON!=null)
								{
									ItxAnalytics.trackPage("/MiCuenta/Acceso/Envio_Error_"+responseJSON.message);
									new ErrorPanel(responseJSON.title, responseJSON.message);
								}
							}
						});
					});
					
					$('userRegister').addEvent('submit', function(e)
					{
						e.stop();
						ajaxHelper.request(
						{/*LOAD REGISTER FORM*/
							'url':this.get('action'),
							'onSuccess':function(response)
							{
								popupWindow.updateContent(response);
								$('backLink').addEvent('click',function(e){e.stop();$('LogonLink').fireEvent('click');});
								$('formRegister').getElement('.privacyPolicyLink').addEvent('click',function(e)
								{e.stop();window.open(this.get('href'),'_blank','width=450,height=500,scrollbars=yes,status=1,toolbar=0,menubar=0,location=0,resizable=1,scrollbars=1');});
								staticRegisterViewBeginProcess();
								
								$('formRegister').addEvent('submit', function(e)
								{
									/*SEND FORM*/
									e.stop();
									
									//validación especial para el check de privacidad
									if($('formRegister').get('validator').validate())
									{
										if(!($('privacy').getProperty('checked')))
										{
											//new ErrorPanel('ATENCIÓN', 'Debes aceptar la política de privacidad para registrarte en pullandbear');
											new ErrorPanel(MessageLabelsStaticRegister.errorPolicyTitle, MessageLabelsStaticRegister.errorPolicyDescription);
											return(false);
										}
									}
									else
									{
										return(false);
									}
									
									ajaxHelper.requestJson(
									{
										method:'post',
										evalResponse:false,
										evalScripts:false,
										data:this,
										url:this.get('action'),
										onSuccess:function(responseJSON)
										{
											/*MANAGE RESPONSE*/
											if(responseJSON!=null&&responseJSON.status==1)
											{/*SUCCESS LOGON*/
												ItxAnalytics.trackPage("/MiCuenta/Registro/Envio_OK");
												if(accountController.redirectURL!=null)
												{
													document.location.href=accountController.redirectURL;
												}
												else
												{
													UserHeaderJSON.userType='R';
													popupWindow.close();
													/*accountController.refresh();
													miniShopCart.reload();*/
													Inditex.getPBUserJSON(function()
													{
														accountController.logon();
														miniShopCart.update();
														if(typeof shopCart!='undefined') shopCart.reload();
														//Ejecutar callback o redireccionar si todo va bien
														if(accountController.callback!=null) {accountController.callback.apply();accountController.callback=null;}
													});
												}
											}
											else
											{/*FAIL REGISTER DEVUELVE JSON ERROR*/
												ItxAnalytics.trackPage("/MiCuenta/Registro/Envio_Error_"+responseJSON.key);
												new ErrorPanel(responseJSON.title, responseJSON.message);
											}
										}
									});
								});
							}
						});
					});
					
					$('forgetPasswordLink').addEvent('click', function(e)
					{
						e.stop();
						ajaxHelper.request(
						{/*LOAD PASSWORD FORM*/
							'url':this.get('href'),
							'onSuccess':function(response)
							{
								popupWindow.updateContent(response,true);
								$('backLink').addEvent('click',function(e){e.stop();$('LogonLink').fireEvent('click');});
								//staticRegisterViewBeginProcess();
								
								$('formRestorePassword').addEvent('submit', function(e)
								{
									/*SEND PASSWORD FORM*/
									e.stop();
									ajaxHelper.requestJson(
									{
										method:'post',
										data:this,
										url:this.get('action'),
										onSuccess:function(responseJSON)
										{
											/*MANAGE RESPONSE*/
											if(responseJSON!=null&&responseJSON.status==0)
											{/*SUCCESS LOGON*/
												//$('LogonLink').fireEvent('click');
												ItxAnalytics.trackPage("/MiCuenta/RecordarPassword/Envio_OK");
												popupWindow.close();
												new ErrorPanel(MessageLabelsPasswordForget.successMessageTitle,MessageLabelsPasswordForget.successMessageDescription);
											}
											else
											{
												ItxAnalytics.trackPage("/MiCuenta/RecordarPassword/Envio_Error_".responseJSON.data.message);
												new ErrorPanel(responseJSON.data.title, responseJSON.data.message);
											}
										}
									});
								});
							}
						});
					});
				}
			});
		}
	},
	logon:function()
	{
		$('LoggedIn').setStyle('display','block');
		$('NotLoggedIn').setStyle('display','none');
		$('AccountText').set('text',UserHeaderJSON.firstName.toUpperCase()/*+" "+UserHeaderJSON.lastName.toUpperCase()*/);
		$('AccountLink').set('href',UserHeaderJSON.accountLink);
		$('LogoffLink').set('href',UserHeaderJSON.logOffLink);
		$('LogoffLink').removeEvents('click');
		$('LogoffLink').addEvent('click',function(e)
		{
			if(typeof e!='undefined') e.stop();
			document.location.href=this.get('href');
		});
		
		$('Account').addEvent('mouseover',function()
		{
			this.setStyle('background-color','#333333');
			this.setStyle('color','#cccccc');
			this.getElement('div.top_menu_submenu').setStyle('display','');
			if(this.getNext('.top_account_separator')!=null) this.getNext('.top_account_separator').setStyle('background-color','#333333');
			if(this.getNext('.top_account_separator')!=null) this.getNext('.top_account_separator').setStyle('color','transparent');
			/*
			this.getLast('div.top_account_option_header').setStyle('background-color','#333333');
			this.getLast('div.top_account_option_header').setStyle('color','#cccccc');
			this.getElement('div.top_menu_submenu').setStyle('display','');
			if(this.getNext('.top_account_separator')!=null) this.getNext('.top_account_separator').setStyle('background-color','#333333');
			if(this.getNext('.top_account_separator')!=null) this.getNext('.top_account_separator').setStyle('color','transparent');
			*/
		});
		
		$('Account').addEvent('mouseleave',function()
		{
			this.setStyle('background-color','');
			this.setStyle('color','');
			/*
			this.getLast('div.top_account_option_header').setStyle('background-color','');
			this.getLast('div.top_account_option_header').setStyle('color','');
			*/
			this.getElement('div.top_menu_submenu').setStyle('display','none');
			if(this.getNext('.top_account_separator')!=null) this.getNext('.top_account_separator').setStyle('background-color','');
			if(this.getNext('.top_account_separator')!=null) this.getNext('.top_account_separator').setStyle('color','');
		});
		
		$('Account').getElements('.top_account_submenu_option').each(function(item)
		{
			item.addEvent('click',function(e){e.stop(); this.getElement('a').fireEvent('click');});
		});
	},
	
	openMyAccount:function(_fts)
	{
		if(storeIsOpen)
		{
			if(UserHeaderJSON.userType!='G')
			{
				ajaxHelper.requestHtml(
				{
					/*LOAD MY ACCOUNT*/
					'url':UserHeaderJSON.accountLink + ((typeof _fts!='undefined')?((UserHeaderJSON.accountLink.contains('?')?'&':'?')+'fts='+_fts):''),
					'evalScripts':false,
					'onSuccess':function(responseTree, responseElements, responseHTML, responseJavaScript)
					{
						popupWindow.updateContent(responseHTML);
						var tempAccountContent=popupWindow.container.getFirst();
						this.element=new Element('table',{'id':'MyAccountLayout','cellpadding':'0','cellspacing':'0','html':
							'<tr><td id="MyAccountMainTitle" class="h1"></td><td id="MyAccountUserName" class="h1"></td></tr>'+
							'<tr><td id="MyAccountMenu"></td><td id="MyAccountContent"></td></tr>'
						});
						var MyAccountContainer=new Element('div',{'id':'MyAccountContainer'});
						MyAccountContainer.adopt(this.element);
						popupWindow.container.adopt(MyAccountContainer);
						this.element.getElement('#MyAccountMenu').set('html',tempAccountContent.getElement('#MyAccountUpdateMenu').get('html'));
						this.element.getElement('#MyAccountContent').set('html',tempAccountContent.getElement('#MyAccountUpdateContent').get('html'));
						tempAccountContent.destroy();
						this.configureSideMenu();
						Browser.exec(responseJavaScript);
						this.configureContent();
						new DynamicErrorController();
					}.bind(this)
				});
			}
			else
			{	
				//SIN LOGIN
				this.openLogonForm(null,this.openMyAccount.pass(_fts,this));
			}	
		}
	},
	configureSideMenu:function()
	{
		this.element.getElement('#MyAccountMenu').getElements('a').each(function(item)
		{
			item.addEvent('click',function(e)
			{
				e.stop();
				accountController.element.getElement('#MyAccountMenu').getElement('.act').removeClass('act');
				this.getParent().addClass('act');
				accountController.loadContent(this.get('href'));
			});
		});
	},
	loadContent:function(_url)
	{
		ajaxHelper.requestHtml(
		{/*LOAD MY ACCOUNT CONTENT*/
			'url':_url,
			evalScripts:false,
			evalResponse:false,
			'onSuccess':function(responseTree, responseElements, responseHTML, responseJavaScript)
			{
				this.element.getElement('#MyAccountContent').empty();
				this.element.getElement('#MyAccountContent').set('html',responseHTML);
				Browser.exec(responseJavaScript);
				this.configureContent();
				new DynamicErrorController();
			}.bind(this)
		});
	},
	configureContent:function()
	{
		this.element.getElement('#MyAccountMainTitle').set('html',
		'<table cellpading="0" cellspacing="0" width="100%">'+
		'<tr><td style="width:1px"><span style="white-space:nowrap">'+this.element.getElement('#MyAccountMenu').getFirst('div').getFirst('a').get('text')+'</span></td>'+
		'<td style="text-align:center">&nbsp;/&nbsp;</td></tr></table>');
		if(this.element.getElement('#MyAccountContent').getElement('#MyAccountName')) this.element.getElement('#MyAccountUserName').set('html',this.element.getElement('#MyAccountContent').getElement('#MyAccountName').dispose().get('html'));
		if(this.element.getElement('#MyAccountContent').getElement('#MyAccountTitle')) this.element.getElement('#MyAccountContent').getElement('#MyAccountTitle').destroy();
		
		this.element.getElement('#MyAccountContent').getElements('form').each(function(item)
		{
			if(!item.hasClass('invoice'))
			{
				//if(item.retrieve('validator')) item.get('validator').set({evaluateOnSubmit:false});
				item.addEvent('submit', function(e)
				{
					/*SEND FORM*/
					e.stop();
					var tempSend=true;
					if(this.retrieve('validator')) {tempSend=this.get('validator').validate();}
					if(tempSend)
					{
						ajaxHelper.requestHtml(
						{
							method:'post',
							evalScripts:false,
							evalResponse:false,
							data:this,
							url:this.get('action'),
							'onSuccess':function(responseTree, responseElements, responseHTML, responseJavaScript)
							{
								accountController.element.getElement('#MyAccountContent').empty();
								accountController.element.getElement('#MyAccountContent').set('html',responseHTML);
								Browser.exec(responseJavaScript);
								accountController.configureContent();
								new DynamicErrorController();
							}
						});
					}
				});
			}
		});
		
		this.element.getElement('#MyAccountContent').getElements('input').each(function(item)
		{
			if(item.get('type')=='button'&&item.get('href')!=null)
			item.addEvent('click', function(e)
			{
				/*SEND LINK*/
				e.stop();
				ajaxHelper.requestHtml(
				{
					method:'post',
					evalScripts:false,
					evalResponse:false,
					data:this,
					url:this.get('href'),
					onSuccess:function(responseTree, responseElements, responseHTML, responseJavaScript)
					{
						accountController.element.getElement('#MyAccountContent').empty();
						accountController.element.getElement('#MyAccountContent').set('html',responseHTML);
						Browser.exec(responseJavaScript);
						accountController.configureContent();
						new DynamicErrorController();
					}
				});
			});
		});
		
		this.element.getElement('#MyAccountContent').getElements('.MyAccountHref').each(function(item)
		{
			item.addEvent('click', function(e)
			{
				/*SEND LINK*/
				e.stop();
				if(accountController.element.getElement('#MyAccountMenu').getElement('#'+this.get('id')+'Li'))
				{
					accountController.element.getElement('#MyAccountMenu').getElement('.act').removeClass('act');
					accountController.element.getElement('#MyAccountMenu').getElement('#'+this.get('id')+'Li').addClass('act');
				}
				ajaxHelper.requestHtml(
				{
					method:'post',
					evalScripts:false,
					evalResponse:false,
					url:this.get('href'),
					onSuccess:function(responseTree, responseElements, responseHTML, responseJavaScript)
					{
						accountController.element.getElement('#MyAccountContent').empty();
						accountController.element.getElement('#MyAccountContent').set('html',responseHTML);
						Browser.exec.delay(0,Browser,responseJavaScript);
						accountController.configureContent();
						new DynamicErrorController();
					}
				});
			});
		});
		
		popupWindow.resize();
	}/*,
	refresh:function()
	{
		ajaxHelper.requestJson({
			method:'get',
			url:UserHeaderJSON.refreshLink,
			onSuccess:function(responseJSON) {
				if(responseJSON.firstName!=null) {
					UserHeaderJSON=responseJSON;
					accountController.logon();
				} else if(response.status==0){
					//alertPanel.show('Error JSON','The account JSON seems to be invalid');
					new ErrorPanel(response.title,response.message);
				}
			}
		});
	}*/
});
var accountController;
function fnInitializeAccountController()
{
	accountController=new AccountController();
}

var GiftCardController=new Class
({
	element:null,
	redirectURL:null,
	callback:null,
	
	initialize:function()
	{
	},
	openGiftCard:function(_fts)
	{
		ajaxHelper.requestHtml(
		{
			'url':GIFTCARD_POPUP_VIEW_URL + ((typeof _fts!='undefined')?((GIFTCARD_POPUP_VIEW_URL.contains('?')?'&':'?')+'fts='+_fts):''),
			'evalScripts':false,
			'onSuccess':function(responseTree, responseElements, responseHTML, responseJavaScript)
			{
				popupWindow.updateContent(responseHTML);
				var tempGiftCardContent=popupWindow.container.getFirst();
				this.element=new Element('table',{'id':'GiftCardLayout','cellpadding':'0','cellspacing':'0','html':
					'<tr><td id="GiftCardMainTitle" class="h1">GiftCard</td><td id="GiftCardSubtitle" class="h1"></td></tr>'+
					'<tr><td id="GiftCardMenu"></td><td id="GiftCardContent"></td></tr>'
				});
				var GiftCardContainer=new Element('div',{'id':'GiftCardContainer'});
				GiftCardContainer.adopt(this.element);
				popupWindow.container.adopt(GiftCardContainer);
				this.element.getElement('#GiftCardMenu').set('html',tempGiftCardContent.getElement('#GiftCardUpdateMenu').get('html'));
				this.element.getElement('#GiftCardContent').set('html',tempGiftCardContent.getElement('#GiftCardUpdateContent').get('html'));
				tempGiftCardContent.destroy();
				this.configureSideMenu();
				Browser.exec(responseJavaScript);
				this.configureContent();
				new DynamicErrorController();
			}.bind(this)
		});
	},
	configureSideMenu:function()
	{
		this.element.getElement('#GiftCardMenu').getElements('a').each(function(item)
		{
			item.addEvent('click',function(e)
			{
				e.stop();
				giftCardController.element.getElement('#GiftCardMenu').getElement('.act').removeClass('act');
				this.getParent().addClass('act');
				giftCardController.loadContent(this.get('href'));
			});
		});
	},
	loadContent:function(_url)
	{
		ajaxHelper.requestHtml(
		{
			'url':_url,
			evalScripts:false,
			evalResponse:false,
			'onSuccess':function(responseTree, responseElements, responseHTML, responseJavaScript)
			{
				this.element.getElement('#GiftCardContent').empty();
				this.element.getElement('#GiftCardContent').set('html',responseHTML);
				Browser.exec(responseJavaScript);
				this.configureContent();
				new DynamicErrorController();
			}.bind(this)
		});
	},
	configureContent:function()
	{
		this.element.getElement('#GiftCardMainTitle').set('html',
		'<table cellpading="0" cellspacing="0" width="100%">'+
		'<tr><td style="width:1px"><span style="white-space:nowrap">GIFTCARDS</span></td>'+
		'<td style="text-align:center">&nbsp;/&nbsp;</td></tr></table>');
		if(this.element.getElement('#GiftCardContent').getElement('#GiftCardSubtitleText')) this.element.getElement('#GiftCardSubtitle').set('html',this.element.getElement('#GiftCardContent').getElement('#GiftCardSubtitleText').dispose().get('html'));
		if(this.element.getElement('#GiftCardContent').getElement('#GiftCardTitle')) this.element.getElement('#GiftCardContent').getElement('#GiftCardTitle').destroy();
		popupWindow.resize();
	}
});
var giftCardController;
function fnInitializeGiftCardController()
{
	giftCardController=new GiftCardController();
	if(document.location.hash.contains("GiftCard"))
	{
		var tempFts=document.location.hash.replace('#','').replace('GiftCard','');
		if(Number(tempFts)>0&&Number(tempFts)<4)
		{giftCardController.openGiftCard(tempFts);}
		else
		{giftCardController.openGiftCard();}
	}
}
loadController.addFunction(function(){fnInitializeGiftCardController()});

var MiniShopCartItem = new Class
({
	element: null,
	parent: null,
	item:null,
	link:null,
	
	initialize: function(_parent, _index, _item)
	{
		this.parent=_parent;
		this.item=_item;
		this.link = this.generateItemLink();
		this.element=new Element('tr', {'class':'Item'});
		this.element.set('html',
			'<td class="Thumb"><img src="'+this.item.image+'" alt="product icon" class="ThumbImage" /></td>'+
			'<td class="Info">'+
				'<span>'+Math.floor(this.item.quantity)+'</span> x<br>'+
				'<a href="' + this.link + '">' + this.item.description.toLowerCase().capitalize() + '</a><br>' + 
				//'<span style="color:#999999">'+this.item.description.toLowerCase().capitalize() +'</span><br>'+
				'<span class="Price">'+currency.format(this.item.unitPrice)+'</span>'+
			'</td>'
		);
		/*this.element=new Element('div', {'class':'Item'});
		this.element.set('html',
			'<div class="Thumb"><img src="'+this.item.image+'" alt="product icon" class="ThumbImage" /></div>'+
			'<div class="Info">'+
				'<span>'+Math.floor(this.item.quantity)+'</span> x<br>'+
				'<span><a href="'+this.item.url+'">'+this.item.description.toLowerCase().capitalize().substring(0,20)+'</a></span><br>'+
				'<span class="Price">'+currency.format(this.item.unitPrice)+'</span>'+
			'</div>'
		);*/
		this.element.store('Class', this);
		this.parent.containerelement.getFirst('tbody').adopt(this.element);
		//this.enable();
	},
	generateItemLink: function()
	{	
		return (this.item.linkCategory+ '/#/' + this.item.productId + "/" + this.item.description);
	}
});

var MiniShopCart = new Class
({
	element: $('MiniShopCart'),
	containerelement: $('MiniShopCart').getElement('#MiniShopCartItems'),
	menuelement: $('MiniShopCartOption'),
	upelement: $('MiniShopCart').getChildren('#ArrowUp'),
	downelement: $('MiniShopCart').getChildren('#ArrowDown'),
	wrapperelement: $('MiniShopCart').getChildren('#ItemsWrapper'),
	items: [],
	total:0,
	lock:null,
	scroll:0,
	scrollHeight:null,
	callback:null,
	autoHide:null,
	
	scrollDown:function(e)
	{
		e.stop();
		this.scroll-=this.scrollHeight;
		if(this.containerelement.getSize().y+this.scroll<this.scrollHeight)
		{
			this.scroll=-(this.containerelement.getSize().y-this.scrollHeight);
			this.downelement.setStyle('display','none');
		}
		this.upelement.setStyle('display','');
		this.containerelement.tween('top',this.scroll);
	},
	
	scrollUp:function(e)
	{
		e.stop();
		this.scroll+=this.scrollHeight;
		if(this.scroll>0)
		{
			this.scroll=0;
			this.upelement.setStyle('display','none');
		}
		this.downelement.setStyle('display','');
		this.containerelement.tween('top',this.scroll);
	},
	
	initialize: function()
	{
		this.containerelement.setStyle('position','relative');
		
		this.downelement.addEvent('click',this.scrollDown.bind(this));
		this.upelement.addEvent('click',this.scrollUp.bind(this));
		
		this.lock=(typeof( window[ 'lockMiniShopCart' ] ) != "undefined");
		
		if(this.lock)
		{
			this.menuelement.getPrevious('div').destroy();
			this.menuelement.addClass('active');
			this.menuelement.getElementById('MiniShopCartActiveBasket').setStyle('display','inline');
			this.menuelement.getElementById('MiniShopCartNormalBasket').setStyle('display','none');
		}
		else
		{
			var self = this;
			//this.element.getElementById('ShopCartButton').getElement('a').set('href',MiniShopCartJSON.urlShopCart);
			this.menuelement.addEvents(
			{
				'mouseenter':function()
				{
					if(miniShopCart.items.length>0)
					{
						self.show();
						if(miniShopCart.autoHide!=null)
						{
							clearInterval(miniShopCart.autoHide);
							miniShopCart.autoHide = null;
						}
					}
					
					if(typeof( window[ 'lockMiniWishCart' ] ) != "undefined")
					{
						$('MiniShopCartOption').setStyle('border-left','none');
					}
				},
				'mouseleave':function()
				{
					self.hide();
				}
			});
		}
		this.update();
	},
	cleanItems:function()
	{
		this.items.each(function(item){item.element.dispose();});
		this.items.empty();
	},
	update:function()
	{
		this.element.getElementById('ShopCartButton').getElement('a').set('href',MiniShopCartJSON.urlShopCart);
		var tempQuantity=0;
		MiniShopCartJSON.items.each(function(item){tempQuantity+=Number(item.quantity);});
		//this.menuelement.getElementById('NumItems').set('text',MiniShopCartJSON.items.length);
		this.menuelement.getElementById('NumItems').set('text',tempQuantity);
		if(!this.lock)
		{
			this.cleanItems();
			MiniShopCartJSON.items.each(function(item,index){this.addItem(item);},this);
			this.element.getElementById('Total').getElementById('Ammount').set('html',currency.format(MiniShopCartJSON.productPrice));
		}
		
		//Plegado barra menú
		fnFoldTopMenu();
	},
	addItem:function(_item)
	{
		var link = 
		this.items.push(new MiniShopCartItem(this, this.items.length, _item));
		this.resize();
	},
	reload:function(_callback)
	{
		if(typeof _callback!='undefined') this.callback=_callback;
		Inditex.getPBUserJSON(function()
		{
			miniShopCart.update();
			if(miniShopCart.callback!=null)
			{
				miniShopCart.callback.apply();
				miniShopCart.callback=null;
			}
		});
		/*ajaxHelper.requestHtml(
		{
			'url':MiniShopCartJSON.urlRefreshMiniShopCart,
			'onSuccess':function(response, responseElements, responseHTML, responseJavaScript)
			{
				Browser.exec(responseJavaScript);
				miniShopCart.update();
				if(miniShopCart.callback!=null)
				{
					miniShopCart.callback.apply();
					miniShopCart.callback=null;
				}
			},
			'onFailure':function()
			{
				alert('failureMiniShopCart');
			}
		});*/
	},
	resize:function()
	{
		this.scroll=0;
		this.containerelement.setStyle('top',0);
		this.upelement.setStyle('display','none');
		if(this.items.length*70>(window.getSize().y-100)*2/3)
		{
			this.scrollHeight=(window.getSize().y-100)*2/3;
			this.downelement.setStyle('display','');
			this.wrapperelement.setStyle('height',this.scrollHeight);
			this.wrapperelement.setStyle('overflow','hidden');
		}
		else
		{
			this.downelement.setStyle('display','none');
			this.wrapperelement.setStyle('height','');
		}
	},
			
	autoShow:function()
	{
		if(miniShopCart.items.length>0)
		{
			miniShopCart.show();
			miniShopCart.autoHide=miniShopCart.hide.delay(2000);
		}
	},
	
	show: function()
	{
		if(miniShopCart.items.length>0)
		{
			this.menuelement.getPrevious('div').setStyle('color','transparent');
			this.menuelement.addClass('active');
			this.menuelement.getElementById('MiniShopCartActiveBasket').setStyle('display','inline');
			this.menuelement.getElementById('MiniShopCartNormalBasket').setStyle('display','none');
			this.menuelement.getElementById('MiniShopCart').setStyle('display','block');
		}
			
		//Si está bloqueado el miniWishCart, hay que incluír una línea superior
		if(typeof( window[ 'lockMiniWishCart' ] ) != "undefined")
		{
			//Si estamos en la página del wishCart: crear el borde superior del miniShopCart
			$('bordeFake').setStyle('display', '');
			$('bordeFake').setStyle('width', $('ItemsWrapper').getSize().x - $('MiniShopCartOption').getSize().x);
		}
		else
		{
			$('bordeFake').setStyle('display', 'none');
		}
	},
	
	hide: function()
	{
		//alert(this.menuelement.get('id'));
		 $('MiniShopCartOption').getPrevious('div').setStyle('color','');
		 $('MiniShopCartOption').removeClass('active');
		 $('MiniShopCartOption').getElementById('MiniShopCartActiveBasket').setStyle('display','none');
		 $('MiniShopCartOption').getElementById('MiniShopCartNormalBasket').setStyle('display','inline');
		 $('MiniShopCartOption').getElementById('MiniShopCart').setStyle('display','none');
	}
	
});

var miniShopCart;
function fnInitializeMiniShopCart()
{
	miniShopCart=new MiniShopCart();
	resizeController.addFunction(function()
	{
		miniShopCart.resize();
	});
}
/*loadController.addFunction(function(){fnInitializeMiniShopCart()});*/var MiniWishCart = new Class
({
	menuelement: $('WishListOption'),
	numItems: $('NumItemsWishList'),
	detailLink: $('WishListLink'),
	lock: null,
	
	initialize: function()
	{
		this.detailLink.setProperty('href', MiniShopCartJSON.WishCartURL);
		this.lock=(typeof( window[ 'lockMiniWishCart' ] ) != "undefined");
		
		if(this.lock)
		{
			this.menuelement.getPrevious('div.top_account_separator').destroy();
			this.menuelement.getNext('div.top_account_separator').destroy();
			this.menuelement.addClass('active');
			this.menuelement.setStyle('height','29px');
			$('WishListIcon').setProperty('src', jspStoreImgDir + 'img/account/favorites_black.gif');
			$('WishListLink').setStyles({'color':'#333333', 'text-decoration':'none', 'cursor':'default', '_cursor':'pointer !important'});
			$('WishListLink').removeEvents('click');
			$('WishListOption').removeEvents('click');
		}
		this.update();
	},
	
	update: function(n)
	{	
		if(n != undefined)
		{
			this.numItems.setProperty('text', n);
			var wishFx = new Fx.Tween(this.menuelement, {'property':'background-color', 'duration':'short', 'transition':'sine'});
			wishFx.start('#FFFFFF', '#0D0D0D');
		}
		else
		{
			//Petición para obtener número de unidades en el carrito
			this.numItems.setProperty('text',  MiniShopCartJSON.WishCartNumItems);
		}
		
		if(this.numItems.get('text')=='0')
		{
			this.hide();
		}
		else
			this.show();
		
		//Plegado de la barra de menú
		fnFoldTopMenu();
	},
	
	hide: function()
	{
		$('WishListOption').setStyle('display','none');
		if($('WishListOption').getPrevious('.top_account_separator')!=null)
			$('WishListOption').getPrevious('.top_account_separator').setStyle('display','none');
	},
	show: function()
	{
		$('WishListOption').setStyle('display','');
		if($('WishListOption').getPrevious('.top_account_separator')!=null)
			$('WishListOption').getPrevious('.top_account_separator').setStyle('display','');
	},
	addItem: function()
	{
	}
})


var miniWishCart;
function fnInitializeMiniWishCart()
{
	miniWishCart=new MiniWishCart();
}
/*loadController.addFunction(function(){fnInitializeMiniWishCart()});*/var totalBottomSubmenus=0;
var totalOpenBottomSubmenus=0;
var lockBottomMenu=false;
function fnIntitializeBottomMenu()
{
	if(!storeIsOpen)
	{
		//Eliminamos la guía de compra
		BottomMenuJSON.options.shift();
		//Eliminamos el contacto de tienda online
		BottomMenuJSON.options[BottomMenuJSON.options.length-1].suboptions.shift();
	}
	BottomMenuJSON.options.each(function(item)
	{
		var newMenu=new Element('div',{'class':'bottom_menu_block'});
		var newOption=new Element('div',{'class':'bottom_menu_option','html':item.name});
		if(!isTouchingScreen)
		{
			newOption.addEvent('click',function(e)
			{this.getParent().getFirst('.bottom_menu_submenu_wrapper').getFirst('.bottom_menu_submenu').getFirst('.bottom_menu_suboption').fireEvent('click',e);});
		}
		newMenu.adopt(newOption);
		var newWrapper=new Element('div',{'class':'bottom_menu_submenu_wrapper'});
		newMenu.adopt(newWrapper);
		var newSubmenu=new Element('div',{'class':'bottom_menu_submenu'});
		newWrapper.adopt(newSubmenu);
		item.suboptions.each(function(item)
		{
			var tempSuboption=new Element('div',{'class':'bottom_menu_suboption','html':item.name});
			if(item.categoryUrl!=null)
			{
				if(item.categoryUrl.contains(':BLANK'))
				{
					tempSuboption.store('href',item.categoryUrl.replace(':BLANK',''));
					tempSuboption.store('target','BLANK');
				}
				else if(item.categoryUrl.contains(':POPUPWINDOW'))
				{
					tempSuboption.store('href',item.categoryUrl.replace(':POPUPWINDOW',''));
					tempSuboption.store('target','POPUPWINDOW');
				}
				else
				{
					tempSuboption.store('href',item.categoryUrl);
				}
			}
			newSubmenu.adopt(tempSuboption);
		});
		if(item.foot!=null) newSubmenu.adopt(new Element('div',{'class':'bottom_menu_footer','html':item.foot}));
		$('bottom_menu').adopt(newMenu);
	});
	totalBottomSubmenus=$('layout_bottom').getElements('.bottom_menu_submenu_wrapper').length;
	$('layout_bottom').getElements('.bottom_menu_block').each(function(item,index)
	{
		item.getElement('.bottom_menu_submenu_wrapper').optionwidth=item.getElement('.bottom_menu_option').getSize().x;
	});
	$('layout_bottom').getElements('.bottom_menu_submenu_wrapper').each(function(item,index)
	{
		item.itemwidth = item.getElement('.bottom_menu_submenu').getSize().x+20;
		item.itemheight = item.getElement('.bottom_menu_submenu').getSize().y+10;
		item.getElement('.bottom_menu_submenu').setStyle('width',item.itemwidth);
		item.getElement('.bottom_menu_submenu').setStyle('height',item.itemheight);
		item.setStyle('width',item.optionwidth);
		item.setStyle('height',0);
	});
	$('bottom_menu').set('tween',{duration:50,transition:'linear',link:'cancel'});
	$('bottom_menu').addEvent('mouseenter',function(e)
	{
		e.stop();
		if(!lockBottomMenu)
		{
			totalOpenBottomSubmenus=totalBottomSubmenus;
			this.tween('padding','20px');
			$('bottom_utils').setStyle('display','none');
			this.getElements('.bottom_menu_option').setStyle('font-weight','bold');
			this.getElements('.bottom_menu_option').setStyle('color','#999999');
			this.getElements('.bottom_menu_submenu_wrapper').each(function(item)
			{
				if(item.retrieve('tween2')!=null) item.retrieve('tween2').cancel();
				item.store('tween1',
					new Fx.Tween(item,
					{
						duration: 250,
						transition: Fx.Transitions.Quad.easeOut,
						link: 'cancel',
						property:'width',
						onComplete: function()
						{
							this.store('tween1',
								new Fx.Tween(this,
								{
									duration: 300,
									transition: Fx.Transitions.Quad.easeOut,
									link: 'cancel',
									property:'height'
								})
							);
							this.retrieve('tween1').start(this.itemheight);
						}.bind(item)
					})
				);
				item.retrieve('tween1').start(item.itemwidth);
			});
		}
	});
	$('bottom_menu').addEvent('mouseleave',function(e)
	{
		if(e!=null) e.stop();
		if(!lockBottomMenu)
		{
			this.tween('padding','6px');
			this.getElements('.bottom_menu_submenu_wrapper').each(function(item,index)
			{
				if(item.retrieve('tween1')!=null) item.retrieve('tween1').cancel();
				item.store('tween2',
					new Fx.Tween(item,
					{
						duration: 200,
						transition: Fx.Transitions.Quad.easeOut,
						link: 'cancel',
						property:'width',
						onComplete: function()
						{
							totalOpenBottomSubmenus--;
							if(totalOpenBottomSubmenus<=0)
							{
								$('bottom_utils').setStyle('display','');
								$('bottom_menu').getElements('.bottom_menu_option').setStyle('font-weight','');
								$('bottom_menu').getElements('.bottom_menu_option').setStyle('color','');
							}
							this.store('tween2',
								new Fx.Tween(this,
								{
									duration: 150,
									transition: Fx.Transitions.Quad.easeOut,
									link: 'cancel',
									property:'height'
								})
							);
							this.retrieve('tween2').start(0);
						}.bind(item)
					})
				);
				item.retrieve('tween2').start(item.optionwidth);
			});
		}
	});
	$('layout_bottom').getElements('.bottom_menu_suboption').addEvent('mouseover',function(e)
	{
		e.stop();
		this.setStyle('color','#999999');
	});
	$('layout_bottom').getElements('.bottom_menu_suboption').addEvent('mouseout',function(e)
	{
		e.stop();
		this.setStyle('color','');
	});
	$('layout_bottom').getElements('.bottom_menu_suboption').addEvent('click',function(e)
	{
		e.stop();
		if(this.retrieve('href')!=null&&this.retrieve('href').trim()!='')
		{
			if(this.retrieve('target')!=null)
			{
				if(this.retrieve('target')=='POPUPWINDOW')
				{
					popupWindow.load(this.retrieve('href'),true);
				}
				else if(this.retrieve('target')=='BLANK')
				{
					window.open(this.retrieve('href'));
				}
				else document.location.href=this.retrieve('href');
			}
			else document.location.href=this.retrieve('href');
		}
		$('bottom_menu').fireEvent('mouseleave');
	});
};
loadController.addFunction(function(){fnIntitializeBottomMenu();});function fnIntitializeBottomUtils()
{
	$('CountryName').set('text',HeaderJSON.countryName.toUpperCase());
	$('CountryName').store('link',HeaderJSON.worldWideUrl);
	$('CountryName').addEvent('click',function()
	{
		document.location.href=this.retrieve('link');
	});
	$('LanguageName').set('text',HeaderJSON.currentLanguageName.toUpperCase());
	//$('CountryName').set('text',HeaderJSON.countryName.toUpperCase());
	HeaderJSON.languages.each(function(item)
	{
		var newLanguage=new Element('div',{'class':'bottom_utils_submenu_option','text':item.languageName.toUpperCase()});
		newLanguage.store('link',item.languageUrl);
		newLanguage.addEvent('click',function(e)
		{
			e.stop();
			var idproducto ='';
			if(window.location.hash) 
			{
				idproducto = '/#/'+window.location.hash.split("/")[1];
			}
			document.location.href=this.retrieve('link')+idproducto;
		});
		$('bottom_utils_submenu').adopt(newLanguage);
	});
	$('LangSelector').getElement('#bottom_utils_submenu').setStyle('display','none');
	$('LangSelector').addEvent('mouseenter',function(e)
	{
		e.stop();
		this.getElement('#bottom_utils_submenu').setStyle('display','');
		this.getNext('.bottom_utils_separator').setStyle('color','transparent');
		this.getPrevious('.bottom_utils_separator').setStyle('color','transparent');
	});
	$('LangSelector').addEvent('mouseleave',function(e)
	{
		e.stop();
		this.getElement('#bottom_utils_submenu').setStyle('display','none');
		this.getNext('.bottom_utils_separator').setStyle('color','');
		this.getPrevious('.bottom_utils_separator').setStyle('color','');
	});
};
loadController.addFunction(fnIntitializeBottomUtils);/*
 * Controlador de la cookie que maneja las cookies, de tal forma que almacena una lista de elementos.
 * A este manejador es necesario indicarle obligatoriamente el nombre de la cookie que queremos leer.
 * 
 * Esta clas js es extendida por ItxCookierecentlyViewProducts. De tal forma que solo le damos el nombre de la cookie a leer.
 */
;var ItxCookieHandler = new Class({
	
	Implements: [Options],

	cookieOptions: {
		path: '/',   // path de la cookie
		duration: true // duracion de la cookie en dias; false caduca al cerrar el navegador
	},
	
	options: {
		cookiePath: '/',   // path de la cookie
		cookieDuration: 365 * 24 * 60 * 60, // duracion de la cookie en dias; false caduca al cerrar el navegador
		cookieName: null,	// nombre de la cookie, parametro obligatorio
		valueSeparator: ',', // separador a usar para separar los ids
		maxValues: -1 //numero maximo de valores a mostrar,
	},

	initialize: function(options) {
		var controller = this;
		if (options) this.setOptions(options);
		
		this.cookieOptions.duration=this.options.cookieDuration;
		this.cookieOptions.path=this.options.cookiePath;
		
	},

	/*
	 * Añade un valor a la cookie, separado por el separador. Primero borra el valor, si existe, y lo añade
	 * al principio.
	 */
	addValue: function(idValue) {
		this.deleteValue(idValue);
		var values = this.readValues();

		if(values!=''){
			values = this.options.valueSeparator + values;
		}
		values = idValue + values ;

		this.writeCookie(values);
		
		
		// comprobamos si nos pasamos de los valores
		var currentLength = this.readValuesAsArray().length;
		if(this.options.maxValues>=0 && (currentLength > this.options.maxValues)) {
			for(var c1=0; c1<=currentLength-this.options.maxValues; c1++) {
				this.deleteValue(this.getOlderAddedValue());
			}
		}
	},
	
	/*
	 * Borra un id del producto de la cookie
	 * return: void
	 */
	deleteValue: function(value) {
		var result = '';
		result = this.readValuesWithOutIds([value]);
		
		this.writeCookie(result);
	},
	
	/*
	 * Lee todos los productos como un string: ej 11111,11113,11116,
	 * return: String
	 */
	readValues: function () {
		var cookieValue = Cookie.read(this.options.cookieName);
		if(cookieValue==null) {
			cookieValue='';
		}

		return unescape(cookieValue);
	},
	
	/*
	 * Lee todos los productos, y los devuelve en un array de Strings
	 * return Array de Strings
	 */
	readValuesAsArray: function () {
		var values = this.readValues();
		if(values!=null && values!='')
			return values.split(this.options.valueSeparator);
		
		return [];
	},
	
	/*
	 * Recupera un String con los arrays sin el indicado en el array de Strings que le pasamos por parametro
	 */
	readValuesWithOutIds: function (arrIds) {
		var result = '';
		var arrReadedValues = this.readValuesAsArray();
		
		for(var c1=0; c1<arrIds.length; c1++){
			arrReadedValues.erase(arrIds[c1]);
		}
		
		result = arrReadedValues.join(this.options.valueSeparator);

		return result;
	},
	
	/**
	 * Escribe el contenido de la cookie
	 * return : void
	 */
	writeCookie: function(value) {
		Cookie.write(this.options.cookieName, value, this.cookieOptions);
	},

	/*
	 * Devuelve el ultimo producto añadido a la cookie 
	 * return String
	 */
	lastAddValue: function(){
		var arrValues = this.readValuesAsArray();
		if (arrValues.length>0)	return arrValues[0];
		else return '';
	},
	
	/*
	 * Recupera el valor mas viejo que se ha añadido
	 */
	getOlderAddedValue: function () {
		var arrValues = this.readValuesAsArray();
		if (arrValues.length>0)	return arrValues[arrValues.length-1];
		else return '';
	},
	
	/*
	 * Comprueba si existe el valor
	 */
	containsValue: function(value) {
		var arrValues = this.readValuesAsArray();
		
		for(var c1=0; c1<arrValues.length; c1++) {
			if(value==arrValues[c1]){
				return true;
			}
		}
		return false;
	},
	
	/**
	 * Borra una la cookie.
	 */
	deleteCookie: function() {
		Cookie.dispose(this.options.cookieName, this.cookieOptions);
	}

});
(function(){var b;
function g(a){this.extend(g,google.maps.OverlayView);this.b=[];this.d=null;this.h=100;this.m=false;a=a||{};if(a.backgroundColor==undefined)a.backgroundColor=this.z;if(a.borderColor==undefined)a.borderColor=this.A;if(a.borderRadius==undefined)a.borderRadius=this.B;if(a.borderWidth==undefined)a.borderWidth=this.C;if(a.padding==undefined)a.padding=this.F;if(a.arrowPosition==undefined)a.arrowPosition=this.u;if(a.disableAutoPan==undefined)a.disableAutoPan=false;if(a.disableAnimation==undefined)a.disableAnimation=false;
if(a.minWidth==undefined)a.minWidth=this.D;if(a.shadowStyle==undefined)a.shadowStyle=this.G;if(a.arrowSize==undefined)a.arrowSize=this.v;if(a.arrowStyle==undefined)a.arrowStyle=this.w;k(this);this.setValues(a)}window.InfoBubble=g;b=g.prototype;b.v=15;b.w=0;b.G=1;b.D=50;b.u=50;b.F=10;b.C=1;b.A="#ccc";b.B=10;b.z="#fff";b.extend=function(a,c){return function(d){for(var f in d.prototype)this.prototype[f]=d.prototype[f];return this}.apply(a,[c])};
function k(a){var c=a.c=document.createElement("DIV");c.style.position="absolute";c.style.zIndex=a.h;(a.i=document.createElement("DIV")).style.position="relative";var d=a.l=document.createElement("IMG");d.style.position="absolute";d.style.width=l(a,12);d.style.height=l(a,12);d.style.border=0;d.style.zIndex=a.h+1;d.style.cursor="pointer";d.src=jspStoreImgDir + 'img/StoreLocator/gmx.gif';google.maps.event.addDomListener(d,"click",function(){a.close();google.maps.event.trigger(a,"closeclick")});
var f=a.e=document.createElement("DIV");f.style.overflowX="auto";f.style.overflowY="auto";f.style.cursor="default";f.style.clear="both";f.style.position="relative";var e=a.j=document.createElement("DIV");f.appendChild(e);e=a.L=document.createElement("DIV");e.style.position="relative";var h=a.n=document.createElement("DIV"),i=a.k=document.createElement("DIV"),j=p(a);h.style.position=i.style.position="absolute";h.style.left=i.style.left="50%";h.style.height=i.style.height="0";h.style.width=i.style.width=
"0";h.style.marginLeft=l(a,-j);h.style.borderWidth=l(a,j);h.style.borderBottomWidth=0;j=a.a=document.createElement("DIV");j.style.position="absolute";c.style.display=j.style.display="none";c.appendChild(a.i);c.appendChild(d);c.appendChild(f);e.appendChild(h);e.appendChild(i);c.appendChild(e);c=document.createElement("style");c.setAttribute("type","text/css");a.g="_ibani_"+Math.round(Math.random()*1E4);c.textContent="."+a.g+"{-webkit-animation-name:"+a.g+";-webkit-animation-duration:0.5s;-webkit-animation-iteration-count:1;}@-webkit-keyframes "+
a.g+" {from {-webkit-transform: scale(0)}50% {-webkit-transform: scale(1.2)}90% {-webkit-transform: scale(0.95)}to {-webkit-transform: scale(1)}}";document.getElementsByTagName("head")[0].appendChild(c)}b.da=function(a){this.set("backgroundClassName",a)};g.prototype.setBackgroundClassName=g.prototype.da;g.prototype.M=function(){this.j.className=this.get("backgroundClassName")};g.prototype.backgroundClassName_changed=g.prototype.M;g.prototype.pa=function(a){this.set("tabClassName",a)};
g.prototype.setTabClassName=g.prototype.pa;g.prototype.sa=function(){s(this)};g.prototype.tabClassName_changed=g.prototype.sa;g.prototype.ca=function(a){this.set("arrowStyle",a)};g.prototype.setArrowStyle=g.prototype.ca;g.prototype.K=function(){this.p()};g.prototype.arrowStyle_changed=g.prototype.K;function p(a){return parseInt(a.get("arrowSize"),10)||0}g.prototype.ba=function(a){this.set("arrowSize",a)};g.prototype.setArrowSize=g.prototype.ba;g.prototype.p=function(){this.r()};
g.prototype.arrowSize_changed=g.prototype.p;g.prototype.aa=function(a){this.set("arrowPosition",a)};g.prototype.setArrowPosition=g.prototype.aa;g.prototype.J=function(){this.n.style.left=this.k.style.left=(parseInt(this.get("arrowPosition"),10)||0)+"%";t(this)};g.prototype.arrowPosition_changed=g.prototype.J;g.prototype.setZIndex=function(a){this.set("zIndex",a)};g.prototype.setZIndex=g.prototype.setZIndex;
g.prototype.ua=function(){this.c.style.zIndex=this.h=this.va();this.l.style.zIndex=zIndex_+1};g.prototype.zIndex_changed=g.prototype.ua;g.prototype.na=function(a){this.set("shadowStyle",a)};g.prototype.setShadowStyle=g.prototype.na;
g.prototype.qa=function(){var a="",c="",d="";switch(parseInt(this.get("shadowStyle"),10)||0){case 0:a="none";break;case 1:c="40px 15px 10px rgba(33,33,33,0.3)";d="transparent";break;case 2:c="0 0 2px rgba(33,33,33,0.3)";d="rgba(33,33,33,0.35)"}this.a.style.boxShadow=this.a.style.webkitBoxShadow=this.a.style.MozBoxShadow=c;this.a.style.backgroundColor=d;if(this.m){this.a.style.display=a;this.draw()}};g.prototype.shadowStyle_changed=g.prototype.qa;
g.prototype.ra=function(){this.set("hideCloseButton",false)};g.prototype.showCloseButton=g.prototype.ra;g.prototype.Q=function(){this.set("hideCloseButton",true)};g.prototype.hideCloseButton=g.prototype.Q;g.prototype.R=function(){this.l.style.display=this.get("hideCloseButton")?"none":""};g.prototype.hideCloseButton_changed=g.prototype.R;g.prototype.ea=function(a){a&&this.set("backgroundColor",a)};g.prototype.setBackgroundColor=g.prototype.ea;
g.prototype.N=function(){var a=this.get("backgroundColor");this.e.style.backgroundColor=a;this.k.style.borderColor=a+" transparent transparent";s(this)};g.prototype.backgroundColor_changed=g.prototype.N;g.prototype.fa=function(a){a&&this.set("borderColor",a)};g.prototype.setBorderColor=g.prototype.fa;
g.prototype.O=function(){var a=this.get("borderColor"),c=this.e,d=this.n;c.style.borderColor=a;d.style.borderColor=a+" transparent transparent";c.style.borderStyle=d.style.borderStyle=this.k.style.borderStyle="solid";s(this)};g.prototype.borderColor_changed=g.prototype.O;g.prototype.ga=function(a){this.set("borderRadius",a)};g.prototype.setBorderRadius=g.prototype.ga;function u(a){return parseInt(a.get("borderRadius"),10)||0}
g.prototype.q=function(){var a=u(this),c=v(this);this.e.style.borderRadius=this.e.style.MozBorderRadius=this.e.style.webkitBorderRadius=this.a.style.borderRadius=this.a.style.MozBorderRadius=this.a.style.webkitBorderRadius=l(this,a);this.i.style.paddingLeft=this.i.style.paddingRight=l(this,a+c);t(this)};g.prototype.borderRadius_changed=g.prototype.q;function v(a){return parseInt(a.get("borderWidth"),10)||0}g.prototype.ha=function(a){this.set("borderWidth",a)};g.prototype.setBorderWidth=g.prototype.ha;
g.prototype.r=function(){var a=v(this);this.e.style.borderWidth=l(this,a);this.i.style.top=l(this,a);a=v(this);var c=p(this),d=parseInt(this.get("arrowStyle"),10)||0,f=l(this,c),e=l(this,Math.max(0,c-a)),h=this.n,i=this.k;this.L.style.marginTop=l(this,-a);h.style.borderTopWidth=f;i.style.borderTopWidth=e;if(d==0||d==1){h.style.borderLeftWidth=f;i.style.borderLeftWidth=e}else h.style.borderLeftWidth=i.style.borderLeftWidth=0;if(d==0||d==2){h.style.borderRightWidth=f;i.style.borderRightWidth=e}else h.style.borderRightWidth=
i.style.borderRightWidth=0;if(d<2){h.style.marginLeft=l(this,-c);i.style.marginLeft=l(this,-(c-a))}else h.style.marginLeft=i.style.marginLeft=0;h.style.display=a==0?"none":"";s(this);this.q();t(this)};g.prototype.borderWidth_changed=g.prototype.r;g.prototype.ma=function(a){this.set("padding",a)};g.prototype.setPadding=g.prototype.ma;function w(a){return parseInt(a.get("padding"),10)||0}g.prototype.Y=function(){this.e.style.padding=l(this,w(this));s(this);t(this)};g.prototype.padding_changed=g.prototype.Y;
function l(a,c){if(c)return c+"px";return c}function y(a){var c=["mousedown","mousemove","mouseover","mouseout","mouseup","mousewheel","DOMMouseScroll","touchstart","touchend","touchmove","dblclick","contextmenu","click"],d=a.c;a.s=[];for(var f=0,e;e=c[f];f++)a.s.push(google.maps.event.addDomListener(d,e,function(h){h.cancelBubble=true;h.stopPropagation&&h.stopPropagation()}))}g.prototype.onAdd=function(){this.c||k(this);y(this);var a=this.getPanes();if(a){a.floatPane.appendChild(this.c);a.floatShadow.appendChild(this.a)}};
g.prototype.onAdd=g.prototype.onAdd;
g.prototype.draw=function(){var a=this.getProjection();if(a){var c=this.get("position");if(c){var d=0;if(this.d)d=this.d.offsetHeight;var f=z(this),e=p(this),h=parseInt(this.get("arrowPosition"),10)||0;h/=100;a=a.fromLatLngToDivPixel(c);if(c=this.e.offsetWidth){var i=a.y-(this.c.offsetHeight+e);if(f)i-=f;var j=a.x-c*h;this.c.style.top=l(this,i);this.c.style.left=l(this,j);switch(parseInt(this.get("shadowStyle"),10)){case 1:this.a.style.top=l(this,i+d-1);this.a.style.left=l(this,j);this.a.style.width=
l(this,c);this.a.style.height=l(this,this.e.offsetHeight-e);break;case 2:c*=0.8;this.a.style.top=f?l(this,a.y):l(this,a.y+e);this.a.style.left=l(this,a.x-c*h);this.a.style.width=l(this,c);this.a.style.height=l(this,2)}}}else this.close()}};g.prototype.draw=g.prototype.draw;g.prototype.onRemove=function(){this.c&&this.c.parentNode&&this.c.parentNode.removeChild(this.c);this.a&&this.a.parentNode&&this.a.parentNode.removeChild(this.a);for(var a=0,c;c=this.s[a];a++)google.maps.event.removeListener(c)};
g.prototype.onRemove=g.prototype.onRemove;g.prototype.S=function(){return this.m};g.prototype.isOpen=g.prototype.S;g.prototype.close=function(){if(this.c){this.c.style.display="none";this.c.className=this.c.className.replace(this.g,"")}if(this.a){this.a.style.display="none";this.a.className=this.a.className.replace(this.g,"")}this.m=false};g.prototype.close=g.prototype.close;
g.prototype.open=function(a,c){a&&this.setMap(a);if(c){this.set("anchor",c);this.bindTo("anchorPoint",c);this.bindTo("position",c)}this.c.style.display=this.a.style.display="";if(!this.get("disableAnimation")){this.c.className+=" "+this.g;this.a.className+=" "+this.g}t(this);this.m=true;if(!this.get("disableAutoPan")){var d=this;window.setTimeout(function(){d.o()},200)}};g.prototype.open=g.prototype.open;g.prototype.setPosition=function(a){a&&this.set("position",a)};g.prototype.setPosition=g.prototype.setPosition;
g.prototype.getPosition=function(){return this.get("position")};g.prototype.getPosition=g.prototype.getPosition;g.prototype.Z=function(){this.draw()};g.prototype.position_changed=g.prototype.Z;
g.prototype.o=function(){var a=this.getProjection();if(a)if(this.c){var c=this.c.offsetHeight+z(this),d=this.get("map"),f=d.getDiv().offsetHeight,e=this.getPosition(),h=a.fromLatLngToContainerPixel(d.getCenter());e=a.fromLatLngToContainerPixel(e);c=h.y-c;f=f-h.y;h=0;if(c<0){c*=-1;h=(c+f)/2}e.y-=h;e=a.fromContainerPixelToLatLng(e);d.getCenter()!=e&&d.panTo(e)}};g.prototype.panToView=g.prototype.o;
function A(a,c){c=c.replace(/^\s*([\S\s]*)\b\s*$/,"$1");var d=document.createElement("DIV");d.innerHTML=c;if(d.childNodes.length==1)return d.removeChild(d.firstChild);else{for(var f=document.createDocumentFragment();d.firstChild;)f.appendChild(d.firstChild);return f}}function B(a,c){if(c)for(var d;d=c.firstChild;)c.removeChild(d)}g.prototype.setContent=function(a){this.set("content",a)};g.prototype.setContent=g.prototype.setContent;g.prototype.getContent=function(){return this.get("content")};
g.prototype.getContent=g.prototype.getContent;g.prototype.P=function(){if(this.j){B(this,this.j);var a=this.getContent();if(a){if(typeof a=="string")a=A(this,a);this.j.appendChild(a);var c=this;a=this.j.getElementsByTagName("IMG");for(var d=0,f;f=a[d];d++)google.maps.event.addDomListener(f,"load",function(){var e=!c.get("disableAutoPan");t(c);if(e&&(c.b.length==0||c.d.index==0))c.o()});google.maps.event.trigger(this,"domready")}t(this)}};g.prototype.content_changed=g.prototype.P;
function s(a){if(a.b&&a.b.length){for(var c=0,d;d=a.b[c];c++)C(a,d.f);a.d.style.zIndex=a.h;c=v(a);d=w(a)/2;a.d.style.borderBottomWidth=0;a.d.style.paddingBottom=l(a,d+c)}}
function C(a,c){var d=a.get("backgroundColor"),f=a.get("borderColor"),e=u(a),h=v(a),i=w(a),j=l(a,-Math.max(i,e));e=l(a,e);var o=a.h;if(c.index)o-=c.index;d={cssFloat:"left",position:"relative",cursor:"pointer",backgroundColor:d,border:l(a,h)+" solid "+f,padding:l(a,i/2)+" "+l(a,i),marginRight:j,whiteSpace:"nowrap",borderRadiusTopLeft:e,MozBorderRadiusTopleft:e,webkitBorderTopLeftRadius:e,borderRadiusTopRight:e,MozBorderRadiusTopright:e,webkitBorderTopRightRadius:e,zIndex:o,display:"inline"};for(var m in d)c.style[m]=
d[m];m=a.get("tabClassName");if(m!=undefined)c.className+=" "+m}function D(a,c){c.T=google.maps.event.addDomListener(c,"click",function(){E(a,this)})}g.prototype.oa=function(a){(a=this.b[a-1])&&E(this,a.f)};g.prototype.setTabActive=g.prototype.oa;
function E(a,c){if(c){var d=w(a)/2,f=v(a);if(a.d){var e=a.d;e.style.zIndex=a.h-e.index;e.style.paddingBottom=l(a,d);e.style.borderBottomWidth=l(a,f)}c.style.zIndex=a.h;c.style.borderBottomWidth=0;c.style.marginBottomWidth="-10px";c.style.paddingBottom=l(a,d+f);a.setContent(a.b[c.index].content);a.d=c;t(a)}else a.setContent("")}g.prototype.ja=function(a){this.set("maxWidth",a)};g.prototype.setMaxWidth=g.prototype.ja;g.prototype.V=function(){t(this)};g.prototype.maxWidth_changed=g.prototype.V;
g.prototype.ia=function(a){this.set("maxHeight",a)};g.prototype.setMaxHeight=g.prototype.ia;g.prototype.U=function(){t(this)};g.prototype.maxHeight_changed=g.prototype.U;g.prototype.la=function(a){this.set("minWidth",a)};g.prototype.setMinWidth=g.prototype.la;g.prototype.X=function(){t(this)};g.prototype.minWidth_changed=g.prototype.X;g.prototype.ka=function(a){this.set("minHeight",a)};g.prototype.setMinHeight=g.prototype.ka;g.prototype.W=function(){t(this)};g.prototype.minHeight_changed=g.prototype.W;
g.prototype.H=function(a,c){var d=document.createElement("DIV");d.innerHTML=a;C(this,d);D(this,d);this.i.appendChild(d);this.b.push({label:a,content:c,f:d});d.index=this.b.length-1;d.style.zIndex=this.h-d.index;this.d||E(this,d);d.className=d.className+" "+this.g;t(this)};g.prototype.addTab=g.prototype.H;
g.prototype.ta=function(a,c,d){if(!(!this.b.length||a<0||a>=this.b.length)){a=this.b[a];if(c!=undefined)a.f.innerHTML=a.label=c;if(d!=undefined)a.content=d;this.d==a.f&&this.setContent(a.content);t(this)}};g.prototype.updateTab=g.prototype.ta;
g.prototype.$=function(a){if(!(!this.b.length||a<0||a>=this.b.length)){var c=this.b[a];c.f.parentNode.removeChild(c.f);google.maps.event.removeListener(c.f.T);this.b.splice(a,1);delete c;for(var d=0,f;f=this.b[d];d++)f.f.index=d;if(c.f==this.d){this.d=this.b[a]?this.b[a].f:this.b[a-1]?this.b[a-1].f:undefined;E(this,this.d)}t(this)}};g.prototype.removeTab=g.prototype.$;
function F(a,c,d,f){var e=document.createElement("DIV");e.style.display="inline";e.style.position="absolute";e.style.visibility="hidden";if(typeof c=="string")e.innerHTML=c;else e.appendChild(c.cloneNode(true));document.body.appendChild(e);c=new google.maps.Size(e.offsetWidth,e.offsetHeight);if(d&&c.width>d){e.style.width=l(a,d);c=new google.maps.Size(e.offsetWidth,e.offsetHeight)}if(f&&c.height>f){e.style.height=l(a,f);c=new google.maps.Size(e.offsetWidth,e.offsetHeight)}document.body.removeChild(e);
delete e;return c}
function t(a){var c=a.get("map");if(c){var d=w(a);v(a);u(a);var f=p(a),e=c.getDiv(),h=f*2;c=e.offsetWidth-h;e=e.offsetHeight-h-z(a);h=0;var i=a.get("minWidth")||0,j=a.get("minHeight")||0,o=a.get("maxWidth")||0,m=a.get("maxHeight")||0;o=Math.min(c,o);m=Math.min(e,m);var x=0;if(a.b.length)for(var q=0,n;n=a.b[q];q++){var r=F(a,n.f,o,m);n=F(a,n.content,o,m);if(i<r.width)i=r.width;x+=r.width;if(j<r.height)j=r.height;if(r.height>h)h=r.height;if(i<n.width)i=n.width;if(j<n.height)j=n.height}else{q=a.get("content");
if(typeof q=="string")q=A(a,q);if(q){n=F(a,q,o,m);if(i<n.width)i=n.width;if(j<n.height)j=n.height}}if(o)i=Math.min(i,o);if(m)j=Math.min(j,m);i=Math.max(i,x);if(i==x)i+=2*d;f*=2;i=Math.max(i,f);if(i>c)i=c;if(j>e)j=e-h;if(a.i){a.t=h;a.i.style.width=l(a,x)}a.e.style.width=l(a,i);a.e.style.height=l(a,j)}u(a);c=v(a);f=d=2;if(a.b.length&&a.t)f+=a.t;f+=c;d+=c;if((c=a.e)&&c.clientHeight<c.scrollHeight)d+=15;a.l.style.right=l(a,d);a.l.style.top=l(a,f);a.draw()}
function z(a){if(a.get("anchor"))if(a=a.get("anchorPoint"))return-1*a.y;return 0}g.prototype.I=function(){this.draw()};g.prototype.anchorPoint_changed=g.prototype.I;
})();var scrollBarSL;
var StoreLocator = {
	map: null,
	zoom: 10,
	markers:[],
	bubbles:[],
	onSelect: null,
	callback: null,
	fullPage: null, 
	show: function(options) {
		
		var self = this;
		self.zoom = options.zoom;
		self.onSelect = options.onSelect;
		self.markers = [];
		self.bubbles =[];
		if(typeof options.callback!='undefined') self.callback=options.callback;
		if(typeof options.fullPage != 'undefined') 
			self.fullPage = options.fullPage;
		else
			self.fullPage = false;
		
		var status = window.retrieve("googleMapsStatus");
		
		if (!status) {
			window.store("googleMapsStatus", 1);
			var script = new Asset.javascript(StoreLocatorJSON.googleMapsUrl, {
				onload: function() {
					google.load("maps", "3", {
						other_params: (StoreLocatorJSON.secure ? "sensor=false&client=" + StoreLocatorJSON.user : "sensor=false") + "&channel=" + StoreLocatorJSON.googleMapsChannel,
						callback: function(){
							window.store("googleMapsStatus", 2);
						}
					});
				}
			});
			
			setTimeout(function() {
				StoreLocator.show(options);
			}, 200);
		} else if (status == 1) {
			setTimeout(function() { 
				StoreLocator.show(options);
			}, 200);
		} else if (status == 2) {
			var url = StoreLocatorJSON.locatorUrl + "&mode=" + options.mode;
			if (options.order)
				url += "&orderShippingPage=true";
			else
				url += "&orderShippingPage=false";
			if (options.fullPage) url = url + "&fullPage=true";
			ajaxHelper.requestHtml({
				'evalScripts':false,
				'evalResponse':false,
				'url': url,
				onSuccess:function(responseTree, responseElements, responseHTML, responseJavaScript){
					if(options.fullPage)
					{
						$('layout_back').setProperty('html', responseHTML);
						Browser.exec(responseJavaScript);
						scrollBarSL = new customScrollbar($('iStoreLocatorResultContainer'), $('scrollbarSL'), $('handlerSL'), false);
					}
					else
					{
						popupWindow.updateContent(responseHTML);
						if(StoreLocator.callback!=null) popupWindow.addCallback(StoreLocator.callback);
						Browser.exec(responseJavaScript);
						scrollBarSL = new customScrollbar($('iFunctionContainer'), $('scrollbarSL'), $('handlerSL'), false);
					}
						
					var opcionesEstilo= [{ featureType: "all", elementType: "all", stylers: [ { saturation: -88 } ] }];
					
					self.map = new google.maps.Map(document.getElementById("iMapContainer"), {
						zoom: self.zoom,
						center: new google.maps.LatLng(0, 0),
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						mapTypeControl: false,
						navigationControlOptions:{
							style: 'DEFAULT'
						},
						zoomControlOptions: {
							style: google.maps.ZoomControlStyle.SMALL
							}
					});
					
					var estiloMapa = new google.maps.StyledMapType(opcionesEstilo, {map: self.map, name: 'mimapa'});
					self.map.mapTypes.set('mimapa', estiloMapa);
					self.map.setMapTypeId('mimapa');
					
					if (options.mode == "search") {
						self.moveToAddress(StoreLocatorJSON.address, StoreLocatorJSON.country);
					}
					else if (options.mode == "view") {
						self.moveToCoords(options.latitude, options.longitude);
						self.addMark(options.latitude, options.longitude, options.text, true);
						/*self.markers[0].infoWindow.open(self.map, self.markers[0]);*/
						/* Mostrar datos de la tienda en la ventana */
						var storeInfoContainer = $("iStoreInfoContainer");
						if (storeInfoContainer) {
							storeInfoContainer.set("html", options.text);
						}
					}
					/* Comportamiento de la caja de texto para buscar */
					var storeLocatorTextInput = $("iStoreLocatorTextInput");
					if (storeLocatorTextInput) {
						storeLocatorTextInput.addEvent("keyup", function(event) {
							event.stop();
							if (event.key == "enter") {
								if ($("localizarTienda")){
									var onclick = $("localizarTienda").get("onclick");
									if (onclick.indexOf("true") != -1)
										self.search(true);
									else
										self.search();
								
								}
							}
						});
					}
					self.adaptarPagina();
				}
				,
				'onFailure': function(response) {
					//alert('error');
				} 
			});
		}
	},
	search: function(order) {
		var isAnOrder = (typeof order == 'undefined') ? false : order;	
		var self = this;
		var storeLocatorTextInput = $("iStoreLocatorTextInput");
		if (!storeLocatorTextInput) {
			return;
		}

		//Obtención del país y región
		if(this.fullPage)
		{
			//Store Locator Page: se coge del combo
			var country = $('country').getSelected()[0].value;
			var region = null;
		}
		else
		{
			//StoreLocator Popup: se coge del json
			var tokens = StoreLocatorJSON.country.split("_");
			var country = tokens[0];
			var region = null;
			if (tokens.length > 1) {
				region = tokens[1];
			}
		}
		
		self.getCoords(country, region, storeLocatorTextInput.get("value"), function(status, latitude, longitude) {
			if (status == 1) {
				ajaxHelper.requestJson({
					"url": StoreLocatorJSON.searchUrl + "&orderShippingPage="+ isAnOrder +  "&latitude=" + latitude + "&longitude=" + longitude + "&country=" + country,
					"onSuccess": function(responseJson) {
						self.updateResults(responseJson);
					}
				});
			}
		});
		self.adaptarPagina();
	},
	updateResults: function(data) {
		var self = this;
		var items = data.near;
		self.bubbles.empty();			//Limpia el array de infoWindows de las tiendas
		var storeLocatorResultContainer = $("iStoreLocatorResultContainer");
		if (!storeLocatorResultContainer) {
			return;
		}
		
		for (var i = 0; i < self.markers.length; i++) {
			self.markers[i].setMap(null);
		}
		self.markers.length = 0;
		
		storeLocatorResultContainer.empty();
		
		var bounds = new google.maps.LatLngBounds();
		
		//Leer tiendas favoritas
		var favShopsCookie = "WC_favPhysicalShops";
		var tiendasFavoritas = Cookie.read(favShopsCookie);
		
		
		for (var i = 0; i < items.length; i++) 
		{
			if(this.fullPage)
			{
				var elTituloHeader = new Element ("span", {'class': 'tituloResultado', 'style': 'cursor:pointer', 'html': '+ ' + items[i].name});
				var elResultHeader = new Element("div", {id: "storeLocatorResult" + i });
				elResultHeader.adopt(elTituloHeader);
					
				//Oculta/muestra los datos de la tienda en los resultados de búsqueda
				elTituloHeader.addEvent("click", function(event) {
						event.stop();
						var container = this.getNext('div');
						if (container) {
							$('layout_back').getElements('div.SLResultContainer ').setStyle('display', 'none');
							$('layout_back').getElements('span.selected').setStyle('font-weight', 'normal');
							
							$('layout_back').getElements('span.tituloResultado').each
							(
								function(item, index){item.set('html', item.get('html').replace('-','+'));}
							)

							this.toggleClass('selected');

							if(!this.hasClass('selected'))
							{
								this.set('html', this.get('html').replace('-','+'));
								this.setStyle('font-weight', 'normal');
								container.setStyle("display", "none");
							}
							else
							{
								this.set('html', this.get('html').replace('+','-'));
								this.setStyle('font-weight', 'bold');
								container.setStyle("display", "block");
							}
						}
				});
					
				
				elResultHeader.grab(new Element("br"));
			}
			else
			{
				var elResultHeader = new Element("div", {
					id: "storeLocatorResult" + i, 
					html: "<span class='tituloInfoWindow' style='cursor:pointer'>+ " + items[i].city + "</span><span class='subTituloInfoWindow'>" + items[i].name + "</span>", 
					events: {
						"click": function(event) {
							event.stop();
							var container = $(this.id + "Container");
							if (container) {
								container.setStyle("display", container.getStyle("display") == "none" ? "block" : "none");
								self.adaptarPagina();
							}
						}
					}});
					
			}
			
			var html = formatearDireccionInfoWindow(items[i].name, items[i].sections, items[i].address, "", items[i].postalCode, items[i].city,items[i].phone1, items[i].phone2, true);
			//var html = items[i].addressLine1 + " " + items[i].addressLine2 + "<br/>" + items[i].postalCode + " " + items[i].city + "<br/>tel. " + items[i].phone1 + "<br/>";
			var html2 = formatearDireccionInfoWindow(items[i].name, items[i].sections, items[i].address, "", items[i].postalCode, items[i].city, items[i].phone1, items[i].phone2, false);
			self.addMark(items[i].latitude, items[i].longitude, html, false);	
			bounds.extend(new google.maps.LatLng(items[i].latitude, items[i].longitude));
		
			//Comprobar si la tienda ya está añadida a favoritos
			
			if(self.fullPage)
			{
				var estiloSelector="";
				var nombreSelector="";
			}
			else
			{
				if(tiendasFavoritas!=null && tiendasFavoritas.indexOf(items[i].physicalStoreId)!=-1)
				{
					var estiloSelector = "font-family: georgia; font-size: 11px; font-weight: normal; color:#dd0000; padding: 3px 0px 3px 0px; margin-bottom:10px; margin-top: 2px; display: inline-block;"
					var nombreSelector = storeLocatorMessageLabels.addStore; 	//Tienda añadida a favoritos
				}
				else
				{
					var estiloSelector = "font-family: georgia; font-size: 11px; font-weight: bold; color:#666666; background:#CCCCCC; padding: 3px 15px 3px 15px; margin-bottom:10px; margin-top: 2px; cursor:pointer; display: inline-block;"
					var nombreSelector = storeLocatorMessageLabels.select;
				}
			}
			
			elResultHeader.grab(new Element("div", {
				id: "storeLocatorResult" + i + "Container",
				'class': 'SLResultContainer',
				html: html2,
				style: "padding-left: 10px; display:none; margin-bottom:10px"
			}).grab(new Element("a", {
				href: "#",
				html: storeLocatorMessageLabels.viewOnMap,
				events: {
					click: function(event) {
						event.stop();
						var index = this.retrieve("index");
						self.showMarker(self.markers[index]);
					}
				}
			}).store("index", i)).grab(new Element("br")).grab(new Element("div", {
				style: estiloSelector,
				html: nombreSelector,
				id: "selShop" + items[i].physicalStoreId,
				events: {
					click: function(event) {
						
						event.stop();
						
						if(self.fullPage)
						{
							this.set('html','');
							var favShopsCookie = "WC_favPhysicalShops";
							var tiendasFavoritas = Cookie.read(favShopsCookie);
							if(tiendasFavoritas!=null && tiendasFavoritas!="")
							{
								tiendasFavoritas += "%2C" + this.id.replace("selShop","");
							}
							else
							{
								tiendasFavoritas = this.id.replace("selShop","");
							}
							this.set('html', storeLocatorMessageLabels.addStore);
							this.set('style', 'font-family: georgia; font-size: 11px; font-weight: normal; color:#DD0000; padding: 3px 0px 3px 0px; margin-bottom:10px; margin-top: 2px; display: inline-block');
							this.removeEvents('click');
						}
						if (self.onSelect) {
							self.onSelect.apply(null, [this.retrieve("data")]);
							this.set('html', storeLocatorMessageLabels.addStore);
							this.set('style', 'font-family: georgia; font-size: 11px; font-weight: normal; color:#DD0000; padding: 3px 0px 3px 0px; margin-bottom:10px; margin-top: 2px; display: inline-block');
							this.removeEvents('click');
						}
					}
				}
			}).store("data", items[i])));
			
			storeLocatorResultContainer.grab(elResultHeader);
		}
		
		if (items.length > 0) {
			self.map.fitBounds(bounds);
		}
		self.adaptarPagina();
	},
	showMarker: function(marker) {
		var self = this;
		for(var i = 0; i < self.markers.length; i++) {
			if (marker == self.markers[i]) {
				
				self.bubbles[i].open(self.map, marker);
				//self.addMark(marker.getPosition().lat(),marker.getPosition().lng(), 'text', true);
				if (!self.map.getBounds().contains(marker.getPosition())) {
					self.moveToCoords(marker.getPosition().lat(), marker.getPosition().lng());
				}
			} else {
				self.bubbles[i].close();
			}
		}
	},
	addMark: function(latitude, longitude, text, mostrarInfoWindow) {
		var self = this;
		var imagen = jspStoreImgDir + 'img/StoreLocator/pullmarker.gif';
		
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(latitude, longitude),
			map: self.map,
			icon: imagen
		});
		
		var ibInfo = new InfoBubble(
			{
			 content: text,
			 borderRadius: 5,
			 borderWidth: 1,
			 borderColor: '#A6A6A6',
			 minWidth: 100,
			 arrowSize: 20,
			 arrowStyle: 1,
			 shadowStyle: 1,
			 arrowPosition: 25,
			 disableAutoPan: true
			 });
		
		/*
		google.maps.event.addListener(marker, 'click', function(e) {
			ibInfo.open(self.map, marker)
		});*/
		google.maps.event.addListener(marker, 'mouseover', function(e) {
			ibInfo.open(self.map, marker);
		});
		google.maps.event.addListener(marker, 'mouseout', function(e) {
			ibInfo.close(); 
		});
		
		self.markers.push(marker);
		self.bubbles.push(ibInfo);
		
		if(mostrarInfoWindow)
			ibInfo.open(self.map, marker);
	},
	moveToCoords: function(latitude, longitude) {
		this.map.panTo(new google.maps.LatLng(latitude, longitude));
	},
	moveToAddress: function(address, country) {
		var self = this;
		var geocoder = new google.maps.Geocoder();
		if (country == 'ES') {
			address = 'Spain';
		}
		if (country == 'IC') {
			country = 'ES';
		}
		if (address == 'IC') {
			address = 'Canarias';
		}
		geocoder.geocode({address: address, country: country}, function(results, status) {
			if(status = google.maps.GeocoderStatus.OK) {
				var result = null;
				
				for (var i = 0; result == null && i < results.length; i++) {
					var components = results[i].address_components;
					
					for (var j = components.length - 1; result == null && j >= 0; j--) {
						var component = components[j];
						if(!country || (component.types[0] == 'country' && component.types[1]=='political' && component.short_name == country)){
							result = results[i];
						}
					}
				}
				
				if (result) {
					self.map.panTo(result.geometry.location);
					self.map.fitBounds(result.geometry.viewport);
				}
			}
		});
	},
	getCoords: function(country, region, address, callback) {
		var self = this;
		var geocoder = new google.maps.Geocoder();
		if (country == 'ES' && address == 'ES') 
		{
			address = 'Spain';
		}
		if (country == 'IC') {
			country = 'ES';
		}
		if (address == 'IC') {
			address = 'Canarias';
		}
		geocoder.geocode({address: address, country: country}, function(results, status) {
			if(status = google.maps.GeocoderStatus.OK) {
				var result = null;
				for(var i = 0; i < results.length && result == null; i++){
					var components = results[i].address_components;
						
					var equalsCountry = false;  // si es igual al pais
					var equalsRegion = region ? false : true;   // si es igual a la region
						
					for(var j = components.length - 1; j >= 0; j--) {
						var component = components[j];
							
						if(!country || (component.types[0] == 'country' && component.types[1] == 'political' && component.short_name == country)) {
							equalsCountry = true;
						}
							
						if((component.types[0]=='administrative_area_level_1' && component.types[1]=='political' && component.short_name == region)) {
							equalsRegion = true;
						}
							
						if(equalsCountry && equalsRegion){
							result = results[i];
							break;
						}
					}
				}
				
				if (result) {
					callback.apply(null,[1, result.geometry.location.lat(), result.geometry.location.lng()]);
				} else {
					callback.apply(null, [0]);
				}
			}
		});
	},
	
	adaptarPagina: function()
	{
		if(scrollBarSL==null)
		{
			if(this.fullPage)
				scrollBarSL = new customScrollbar($('iStoreLocatorResultContainer'), $('scrollbarSL'), $('handlerSL'), false);
			else
				scrollBarSL = new customScrollbar($('iFunctionContainer'), $('scrollbarSL'), $('handlerSL'), false);
		}
		scrollBarSL.resize();
		
		if(this.map!=null)
		{
			google.maps.event.trigger(this.map, 'resize');
			//this.map.getContainer().lastChild.style.zIndex = "-1";
		}
	}
};


function formatearDireccionInfoWindow(name, sections, addressLine1, addressLine2, postalCode, city, phone1, phone2, conTitulo)
{
	var desc = '';
	if(conTitulo)
	{
		desc = '<span class="tituloInfoWindow">' + name;
		if (addressLine2.trim()!="")
			desc = desc + addressLine2
		desc = desc + '</span>';
	}
	if(name!=addressLine1) desc = desc + '<span class="parrafoInfoWindow">' + addressLine1 + '</span>';
	desc = desc + '<span class="parrafoInfoWindow">' + postalCode + ' ' + city + '</span>';
	if(phone1!=null)
		if(phone1.trim()!="")
			desc = desc + '<span class="parrafoInfoWindow">' + 'tel.- ' + phone1 + '</span>';
	if(phone2!=null)
		if(phone2.trim()!="")
			desc = desc + '<span class="parrafoInfoWindow">' + 'tel2.- ' + phone2 + '</span>';
	desc = desc + '<span class="parrafoInfoWindow">(' + sections + ')</span>';
	return(desc);
};

function buscarTiendas(order)
{
    var isAnOrder = (typeof order == 'undefined') ? false : order;
    StoreLocator.search(isAnOrder);
};
var _gaq = _gaq || [];

(function() {

	var itxQueryOne = null;
	var itxQueryMulti = null;
	var itxDomReady = null;
	var itxReadCookie = null;
	var itxWriteCookie = null;
	
	if (window.jQuery) {
		// Si tenemos jQuery...
		
		// Helpers
		itxQueryOne = jQuery;
		itxQueryMulti = jQuery;
		
		itxDomReady = function(fn) {
			return jQuery(document).ready(fn);
		};
		
		itxReadCookie = function(aCookieName) {
			return jQuery.cookie(aCookieName);
		};
		
		itxWriteCookie = function(aCookieName, aValue) {
			jQuery.cookie(aCookieName, aValue, {path: "/"});
		};
		
		// Extensiones de framework
		jQuery.fn.itxSetProperty = function(property, value){
			return this.attr(property, value);
		};
		jQuery.fn.itxGetProperty = function(property){
			return this.attr(property);
		};
		jQuery.fn.itxAddEvent = function(eventName, fn){
			return this.bind(eventName, fn);
		};
		
		jQuery.fn.itxEach = function(callback) {
			return this.each(function(index, item) {
				callback(jQuery(item), index);
			});
		};
		
	} else {
		// Sino suponemos por defecto Mootools
		
		// Helpers
		itxQueryOne = $;
		itxQueryMulti = $$;
		itxDomReady = function (fn) {
			window.addEvent("domready", fn);
		};
		
		itxReadCookie = function(aCookieName) {
			return Cookie.read(aCookieName);
		};
		
		itxWriteCookie = function(aCookieName, aValue) {
			Cookie.write(aCookieName, aValue, {path: "/"});
		};

		// Extensiones de framework
		Element.implement({
			itxGetProperty: function(attribute){
				return this.getProperty(attribute);
			},
			itxSetProperty: function(attribute, value){
				return this.setProperty(attribute, value);
			},
			itxAddEvent: function(eventName, fn) {
				return this.addEvent(eventName, fn);
			}
		});
		
		Array.implement({
			itxEach: function(callback) {
				return this.each(callback);
			}
		});
	}
	
	var ItxAnalyticsClass = function() {
		var self = this;
		
		self.iAccount = null;
		self.iDomain = null;
		self.iIsoStore = null;
		self.iIsoLang = null;
		self.iIsoCountry = null;
		self.iLogic = null;
		self.iExternalOnly = null;
		self.iReferer = null;
		self.iUrl = null;
		self.iGaPageHandler = null;
		self.iGaEventHandler = null;
		self.iGaSourceHandler = null;
		self.iSource = null;
	};
	
	/**
	 * Este método inicializa el API. Debe de llamarse cuando la página esté cargada (domready) 
	 * y sólamente una vez.
	 */
	ItxAnalyticsClass.prototype.init = function() {
		
		var self = this;
		var body = itxQueryOne(document.body);
		
		self.iUrl = location.hostname + location.pathname + location.search; 
		if (self.iUrl.match(/\?/)) {
			self.iUrl += '&'; 
		} else {
			self.iUrl += '?';
		}
		
		self.iAccount = body.itxGetProperty("data-ga-account");
		self.iDomain = body.itxGetProperty("data-ga-domain");
		self.iIsoStore = body.itxGetProperty("data-ga-iso-store");
		self.iIsoLang = body.itxGetProperty("data-ga-iso-lang");
		self.iIsoCountry = body.itxGetProperty("data-ga-iso-country");
		self.iLogic = body.itxGetProperty("data-ga-logic");
		self.iExternalOnly = body.itxGetProperty("data-ga-external-only");
		self.iReferer = body.itxGetProperty("data-ga-referer");
		self.iSource = body.itxGetProperty("data-ga-source");
		
		self.iGaPageHandler = function(event) {
			var logic = itxQueryOne(this).itxGetProperty("data-ga-page-logic");
			if (logic) {
				self.trackPage(logic);
			}
		};
		
		self.iGaEventHandler = function(event) {
			var source = itxQueryOne(this).itxGetProperty("data-ga-source");
			var action = itxQueryOne(this).itxGetProperty("data-ga-action");
			
			self.trackEvent(source, action);
		};
		
		self.iGaSourceHandler = function(event) {
			var source = itxQueryOne(this).itxGetProperty("data-ga-source-value");
			
			self.setSource(source);
		};
		
		if (self.iAccount) {
			
			(function() { 
				var ga = document.createElement('script'); 
				ga.type = 'text/javascript'; 
				ga.async = true; 
				ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js'; 
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s); 
			})();
			
			_gaq.push(['_setAccount', self.iAccount]); 
			_gaq.push(['_setDomainName', self.iDomain]); 
			_gaq.push(['_setCampaignCookieTimeOut', 2628000000]); 
			_gaq.push(['_setCustomVar', 2, 'Idioma', self.iIsoLang, 2]); 
			_gaq.push(['_setCustomVar', 5, 'Pais', self.iIsoCountry, 2]);
			
			var buyerId = body.itxGetProperty("data-ga-buyer-id");
			if (buyerId) {
				_gaq.push(['_setCustomVar', 1, 'Comprador', 'ID_' + buyerId, 1]);
			}
			
			var logic = self.iUrl + "mxr=";
			if (self.iIsoStore) {
				logic += "/" + self.iIsoStore;
			}
			logic += self.iLogic;
			
			if (self.iSource == "cookie") {
				var source = itxReadCookie("WC_GASource");
				if (source) {
					logic += "/Origen_" + source;
				} else {
					var domain = self.iDomain[0] == '.' ? self.iDomain.substr('1') : self.iDomain;
					if (new RegExp("^(http(s)?://)?(www\\.)?.*(" + domain + ").*","i").test(document.referrer)) {
						logic += "/Origen_Interno";
					} else {
						logic += "/Origen_Externo";
					}
				}
			} else if (self.iSource == "referer") {
				logic += "/Origen_" + (document.referrer ? document.referrer : "Desconocido");
			}
			
			itxWriteCookie("WC_GASource", "");
			
			_gaq.push(['_trackPageview', logic]);
				
			var transId = body.itxGetProperty("data-ga-trans-id");
			var method = body.itxGetProperty("data-ga-trans-method");
			var total = body.itxGetProperty("data-ga-trans-total");
			var totalEuro = body.itxGetProperty("data-ga-trans-total-euro");
			var shipping = body.itxGetProperty("data-ga-trans-shipping");
			var shippingEuro = body.itxGetProperty("data-ga-trans-shipping-euro");
			var city = body.itxGetProperty("data-ga-trans-city");
			var state = body.itxGetProperty("data-ga-trans-state");
			var country = body.itxGetProperty("data-ga-trans-country");
			var currency = body.itxGetProperty("data-ga-trans-currency");
				
			if (transId) {
				itxQueryMulti(".gaItem").itxEach(function(aItem, aIndex) {
					var product = aItem.itxGetProperty("data-ga-product");
					self.trackPage("/Paginas_Virtuales/Look_to_book/" + product + "/Confirmacion");
				});
				
				if (currency != 'EUR') {
					_gaq.push([
					           '_addTrans',
					           transId + '-' + self.iIsoStore + '-EUR',
					           method,
					           totalEuro,
					           '',
					           shippingEuro,
					           city,
					           state,
					           country
					]);
					
					itxQueryMulti(".gaItem").itxEach(function(aItem, aIndex) {
						var sku = aItem.itxGetProperty("data-ga-sku");
						var product = aItem.itxGetProperty("data-ga-product");
						var category = aItem.itxGetProperty("data-ga-category");
						var price = aItem.itxGetProperty("data-ga-price");
						var priceEuro = aItem.itxGetProperty("data-ga-price-euro");
						var quantity = aItem.itxGetProperty("data-ga-quantity");
					
						_gaq.push([
						           '_addItem',
						           transId + '-' + self.iIsoStore + '-EUR',
						           sku,
						           product,
						           category,
						           priceEuro,
						           quantity
						]);
					});
				}
				
				_gaq.push([
				           '_addTrans',
				           transId + '-' + self.iIsoStore + '-' + currency,
				           method,
				           total,
				           '',
				           shipping,
				           city,
				           state,
				           country
				]);
				
				itxQueryMulti(".gaItem").itxEach(function(aItem, aIndex) {
					var sku = aItem.itxGetProperty("data-ga-sku");
					var product = aItem.itxGetProperty("data-ga-product");
					var category = aItem.itxGetProperty("data-ga-category");
					var price = aItem.itxGetProperty("data-ga-price");
					var quantity = aItem.itxGetProperty("data-ga-quantity");
				
					_gaq.push([
					           '_addItem',
					           transId + '-' + self.iIsoStore + '-' + currency,
					           sku,
					           product,
					           category,
					           price,
					           quantity
					]);
				});
				
				_gaq.push(['_trackTrans']);
			}
		}
		
		self.initHtml();
	};
	
	/**
	 * Este método se encarga de inicializar el html de la página para monitorizar todos los eventos relacionados con
	 * google analytics.
	 * Debe llamarse cada vez que cambie el html de la página.
	 */
	ItxAnalyticsClass.prototype.initHtml = function() {

		var self = this;
		
		itxQueryMulti(".gaPage").itxEach(function(aItem, aIndex) {
			var event = aItem.itxGetProperty("data-ga-page-event");
			
			if (event) {
				aItem.itxAddEvent(event, self.iGaPageHandler);
			}
		});
		
		itxQueryMulti(".gaEvent").itxEach(function(aItem, aIndex) {
			var event = aItem.itxGetProperty("data-ga-event");
			if (event) {
				aItem.itxAddEvent(event, self.iGaEventHandler);
			}
		});
		
		itxQueryMulti(".gaSource").itxEach(function(aItem, aIndex) {
			var event = aItem.itxGetProperty("data-ga-source-event");
			if (event) {
				aItem.itxAddEvent(event, self.iGaSourceHandler);
			}
		});
	};
	
	/**
	 * Este método sirve para hacer el seguimiento de las interacciones del usuario.
	 */
	ItxAnalyticsClass.prototype.trackEvent = function(aSource, aAction) {
		var self = this;
		
		_gaq.push(['_trackEvent', aSource, aAction]);
	};
	
	/**
	 * Este método sirve para hacer el seguimiento de una página vista.
	 */
	ItxAnalyticsClass.prototype.trackPage = function(aLogic) {
		var self = this;
		
		_gaq.push(['_trackPageview', '&mxr=' + (self.iIsoStore ? '/' + self.iIsoStore : '') + aLogic]);
	};
	
	/**
	 * Este método establece el origen a utilizar en el seguimiento.
	 */
	ItxAnalyticsClass.prototype.setSource = function(aSource) {
		itxWriteCookie("WC_GASource", aSource);
	};
	
	window.ItxAnalytics = new ItxAnalyticsClass();
})();
loadController.addFunction(function() {
	ItxAnalytics.init();
});


function InditexClass() {
	this.iReadyArray = [];
	this.iResizeArray = [];
}

var Inditex = new InditexClass();

InditexClass.prototype.readCookie = function(name) {
	var cookies = document.cookie.split(";");
	var i, key, value, index;

	for (i = 0; i < cookies.length; i++) {
		index = cookies[i].indexOf("=");
		key = cookies[i].substr(0, index).replace(/^\s+|\s+$/g, "");
		value = cookies[i].substr(index + 1);
		if (key == name) {
			return unescape(value);
		}
	}

	return null;
};

InditexClass.prototype.writeCookie = function(name, data) {
	document.cookie = name + "=" + escape(data) + "; path=/";
};

InditexClass.prototype.evalJSON = function(text) {
	if (window.MooTools)
		return JSON.decode(text, true);
	else if (window.jQuery)
		return jQuery.evalJSON(text);
};

InditexClass.prototype.serializeJSON = function(json) {
	if (window.MooTools)
		return JSON.encode(json);
	else if (window.jQuery)
		return jQuery.toJSON(json);
};

InditexClass.prototype.getPendingJSON = function() {
	var self = this;
	var pending = new Object();
	var tmp = self.readCookie("WC_ITX_PENDINGDATA");

	var CATENTRY_RX =  "[0-9]+";
	var QUANTITY_RX =  "[\\-]?[0-9]+";

	var ORDERITEMPROPERTY_SEPARATOR = "_";
	var ORDERITEM_SEPARATOR = ",";

	var CATENTRY_WITH_QUANTITY_RX =  CATENTRY_RX + "_" + QUANTITY_RX;
	var CATENTRY_WITH_QUANTITY_AND_COMPONENTS_WITH_QUANTITY_RX =  CATENTRY_WITH_QUANTITY_RX + "(?:_" + CATENTRY_WITH_QUANTITY_RX +")*";
	var ORDERITEMS_IN_COOKIE =  CATENTRY_WITH_QUANTITY_AND_COMPONENTS_WITH_QUANTITY_RX + "(,"+CATENTRY_WITH_QUANTITY_AND_COMPONENTS_WITH_QUANTITY_RX+")*";

	var completeRx = '[0-9]+:[0-9]+:('+ORDERITEMS_IN_COOKIE+')?:('+ORDERITEMS_IN_COOKIE+')?';

	if (tmp && (new RegExp(completeRx,'g')).test(tmp)) {

		tmp = tmp.split(":");

		pending.timestamp = tmp[0];
		pending.storeId = tmp[1];
		pending.shopCart = new Array();
		pending.wishCart = new Array();
		if (pending.storeId == self.getStoreId()) {

			var orderItemInCookieFromShopCartRx = new RegExp(ORDERITEMS_IN_COOKIE,'g');
			var orderItemInCookieFromWishCartRx = new RegExp(ORDERITEMS_IN_COOKIE,'g');

			tmp[2] = orderItemInCookieFromShopCartRx.test(tmp[2]) ? tmp[2].split(",") : [];
			tmp[3] = orderItemInCookieFromWishCartRx.test(tmp[3]) ? tmp[3].split(",") : [];

			for (var i = 0; i < tmp[2].length; i++) {
				var item = new Object();
				var tokens = tmp[2][i].split("_");
				if (tokens.length % 2 == 0) {
					item.id = tokens[0];
					item.quantity = parseFloat(tokens[1]);
					if (tokens.length > 2) {
						item.components = [];
						for (var j = 2; j<tokens.length; j+=2)
							item.components.push({"id": tokens[j], "quantity": parseFloat(tokens[j+1])});
					}
					pending.shopCart.push(item);
				}
			}

			for (var i = 0; i < tmp[3].length; i++) {
				var item = new Object();
				var tokens = tmp[3][i].split("_");
				if (tokens.length % 2 == 0) {
					item.id = tokens[0];
					item.quantity = parseFloat(tokens[1]);
					if (tokens.length > 2) {
						item.components = [];
						for (var j = 2; j<tokens.length; j+=2)
							item.components.push({"id": tokens[j], "quantity": parseFloat(tokens[j+1])});
					}
					pending.wishCart.push(item);
				}
			}
		} else {
			pending.storeId = self.getStoreId();
			self.setPendingJSON(pending);
		}
	} else {
		pending.timestamp = "0";
		pending.storeId = self.getStoreId();
		pending.shopCart = new Array();
		pending.wishCart = new Array();
		self.setPendingJSON(pending);
	}

	return pending;
};

InditexClass.prototype.setPendingJSON = function(json) {
	var self = this;
	var tmp = json.timestamp + ":" + json.storeId + ":";

	for (i = 0; i < json.shopCart.length; i++) {

		if (i > 0) {
			tmp += ",";
		}

		tmp += json.shopCart[i].id;
		tmp += "_";
		tmp += json.shopCart[i].quantity;
		if (json.shopCart[i].components) {
			for (var j=0; j<json.shopCart[i].components.length; j++) {
				tmp += "_";
				tmp += json.shopCart[i].components[j].id;
				tmp += "_";
				tmp += json.shopCart[i].components[j].quantity;
			}
		}
	}

	tmp += ":";

	for (i = 0; i < json.wishCart.length; i++) {

		if (i > 0) {
			tmp += ",";
		}

		tmp += json.wishCart[i].id;
		tmp += "_";
		tmp += json.wishCart[i].quantity;
		if (json.wishCart[i].components) {
			for (var j=0; j<json.wishCart[i].components.length; j++) {
				tmp += "_";
				tmp += json.wishCart[i].components[j].id;
				tmp += "_";
				tmp += json.wishCart[i].components[j].quantity;
			}
		}
	}

	self.writeCookie("WC_ITX_PENDINGDATA", tmp);
};

InditexClass.prototype.addItem = function(options) {
	var self = this;
	var pending = self.getPendingJSON();
	var i, found, item;
	var json = self._readUserJSON();
	var timestamp = 0;
	var cart = (options.type == 'Shop') ? 'shopCart' : 'wishCart';

	found = false;
	for (i = 0; i < pending[cart].length && !found; i++) {
		if (pending[cart][i].id == options.id) {
			if (options.components) {
				// Comprobamos si la configuracion del dynamic kit previamente anhadido se corresponde con el que vamos a anhadir.
				if (options.components.length != pending[cart][i].components.length)
					break;
				var foundComponent = false;
				for (var j=0; j<pending[cart][i].components.length; j++) {
					foundComponent = false;
					for (var k=0; k<pending[cart][i].components.length; k++) {
						if (options.components[j].id == pending[cart][i].components[k].id) {
							foundComponent = (options.components[j].quantity == pending[cart][i].components[k].quantity);
							break;
						}
					}
					if (!foundComponent)
						break;
				}
				if (!foundComponent)
					break;
			}
			found = true;
			pending[cart][i].quantity = Number(pending[cart][i].quantity) + Number(options.quantity);
		}
	}

	if (!found) {
		var o = new Object();
		o.id = options.id;
		o.quantity = options.quantity;
		if (options.components)
			o.components = options.components;
		pending[cart].push(o);
	}

	pending.timestamp = 1;
	self.setPendingJSON(pending);

	if (json) {

		item = null;
		for (i = 0; i < json[cart].items.length && item == null; i++) {
			if (json[cart].items[i].id == options.id) {
				item = json[cart].items[i];
				item.quantity = Number(item.quantity) + Number(options.quantity);
				if (options.components) {
					item.components = [];
					for (var j = 0; j<options.components; j++) {
						item.components.push({
							id: options.components[j].id,
							quantity: options.components[j].quantity
						});
					}
				}
			}
		}

		if (item == null) {
			if (options.quantity > 0) {
				json[cart].items.push(options);
			}
		}

		json[cart].productPrice = Number(json[cart].productPrice) + options.quantity * options.unitPrice;
		json[cart].units = Number(json[cart].units) + Number(options.quantity);

		for (i = json[cart].items.length -1 ; i >= 0; i--)
			if (json[cart].items[i].quantity <= 0)
				json[cart].items.splice(i,1);

		json.timestamp = 1;
		self._writeUserJSON(json);

		if (window.ItxAnalytics && options.quantity > 0) {
			window.ItxAnalytics.trackPage((options.type=='Shop' ? "/Cesta_de_Compra" : "/Wishlist") + "/Anadir_Cesta/" + options.partNumber);
		}
	}
};

InditexClass.prototype.getCatEntryImagePath = function(partNumber, section, imageType, imageIndex, imageSize) {
	var self = this;
	var image = self.getImagePath().replace(/^http[s]?:/, window.location.protocol);

	image += "/";
	image += partNumber.substring(15, 19);
	image += "/";
	image += partNumber.substring(14, 15);
	image += "/";
	image += partNumber.substring(0, 1);
	image += "/";
	image += section;
	image += "/p/";
	image += partNumber.substring(1, 5);
	image += "/";
	image += partNumber.substring(5, 8);
	image += "/";
	image += partNumber.substring(8, 11);
	image += "/";
	image += partNumber.substring(1, 8);
	image += partNumber.substring(8, 11);
	image += "_";
	image += imageType;
	image += "_";
	image += imageIndex;
	image += "_";
	image += imageSize;
	image += ".jpg";

	return image;
};

InditexClass.prototype.getProductUrl = function(catEntryId, categoryId, name) {
	var self = this;
	return self.getProductTemplateUrl()
		.replace("{0}", categoryId)
		.replace("{1}", catEntryId)
		.replace("{2}", encodeURIComponent(name))
	;
};

InditexClass.prototype._readUserJSON = function() {
	var self = this;
	var text = self.retrieve("WC_ITX_HEADERDATA");

	return text ? self.evalJSON(text) : null;
};

InditexClass.prototype._writeUserJSON = function(json) {
	var self = this;

	if (json) {
		self.store("WC_ITX_HEADERDATA", self.serializeJSON(json));
	}
};

InditexClass.prototype.getUserJSON = function(callback) {
	var self = this;
	var storeId = self.getStoreId();
	var langId = self.getLangId();
	var json = self._readUserJSON();
	var url = self.getUserJsonUrl();
	var pending = self.getPendingJSON();

	if (pending.timestamp == "0" && pending.shopCart.length == 0 && pending.wishCart.length == 0) {
		json = {
			"docName": "ItxUserJSON",
			"docVersion": "0.1",
			"timestamp": "0",
			"storeId": storeId,
			"langId": langId,
			"UserHeaderJSON":{
				"userType": "G",
				"accountLink": "",
				"userId": "-1002",
				"firstName": "",
				"lastName": "",
				"mail": "",
				"prefix": "",
				"phonenumber": "",
				"logOffLink": HeaderJSON.logOffLink,
				"refreshLink": HeaderJSON.refreshLink,
				"state": "",
				"zipcode": ""
			},
			"shopCart": {
				"doc": {
				    "name": "miniShopCart",
				    "version": "0.2"
				},
				"items": [],
				"promotions": [],
				"discounts": [],
				"productPrice": "0",
				"units": "0",
				"shippingPrice": "0",
				"discountPrice": "0",
				"totalPrice": "0",
				"urlShopCart": HeaderJSON.urlShopCart,
				"urlRefreshMiniShopCart": HeaderJSON.urlRefreshMiniShopCart,
				"WishCartURL": HeaderJSON.WishCartURL,
				"WishCartNumItems": "0"
			},
			"wishCart": {
				"items": [],
				"productPrice": "0",
				"units": "0",
				"itemsLength": "0",
				"maxItemsToShow" : "-1"
			}
		};
		self._writeUserJSON(json);
		callback(json);
	} else if (json && json.storeId == storeId && json.timestamp == pending.timestamp && json.langId == langId) {
		json.shopCart.WishCartNumItems=json.wishCart.items.length;
		callback(json);
	} else if (url) {
		self.request({
			"url": pending.shopCart.length > 0 || pending.wishCart.length > 0 ? self.getPersistentUserJsonUrl() : self.getUserJsonUrl(),
			"method": "get",
			"onSuccess": function(text) {
				var json = self.evalJSON(text);
				if (json && json.docName == 'ItxUserJSON') {
					pending = self.getPendingJSON();
					json.timestamp = pending.timestamp;
					self._writeUserJSON(json);
					callback(json);
				}
			}
		});
	}
};

InditexClass.prototype.hasLocalStorage = function() {
	try {
		localStorage.setItem("ItxTestLocalStorage", "test");
		localStorage.removeItem("ItxTestLocalStorage");
		return true;
	} catch (error) {}
	return false;
};

InditexClass.prototype.store = function(name, value) {
	var self = this;

	if (self.hasLocalStorage()) {
		localStorage.setItem(name, value);
	}
};

InditexClass.prototype.retrieve = function(name) {
	var self = this;

	if (self.hasLocalStorage()) {
		return localStorage.getItem(name);
	} else {
		return null;
	}
};

InditexClass.prototype.hasFlash = function() {
	var self = this;
	var hasFlash = false;

	if(navigator.plugins && navigator.plugins.length > 0) {
        var type = 'application/x-shockwave-flash';
        var mimeTypes = navigator.mimeTypes;
        if(mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description) {
            hasFlash = true;
        }
    } else if(navigator.appVersion.indexOf("Mac") == -1 && window.execScript) {
    	var activeXDetectRules = ["ShockwaveFlash.ShockwaveFlash.7", "ShockwaveFlash.ShockwaveFlash.6","ShockwaveFlash.ShockwaveFlash"];

        for(var i = 0; i < activeXDetectRules.length && !hasFlash; i++) {
        	var obj = -1;
            try {
            	obj = new ActiveXObject(activeXDetectRules[i]);
           	} catch(err) {
           		obj = {activeXError:true};
          	}

           	if(!obj.activeXError) {
                hasFlash = true;
            }
        }
    }

	return hasFlash;
};

InditexClass.prototype.popupUrl = function(aUrl, aWidth, aHeight, aCallback) {
	var self = this;

	self.request({
		"url": aUrl,
		"onSuccess": function(aText) {
			self.popupHtml(aText, aWidth, aHeight, aCallback);
		}
	});
};

Inditex.iReadyArray.push(function() {
	if (Inditex.hasToDrawHeaderOnReady()) {
		Inditex.drawHeader();
	}
});

InditexClass.prototype.initHtml = function() {
	var self = this;

	for (var i = 0; i < self.iInitHtmlArray.length; i++) {
		try {
			self.iInitHtmlArray[i]();
		} catch (err) {
		}
	}
};

Inditex.iReadyArray.push(function() {
	Inditex.initHtml();
});

InditexClass.prototype.onReady = function() {
	var self = this;

	for (var i = 0; i < self.iReadyArray.length; i++) {
		try {
			self.iReadyArray[i]();
		} catch (err) {
		}
	}
};

InditexClass.prototype.onResize = function() {
	var self = this;

	for (var i = 0; i < self.iResizeArray.length; i++) {
		try {
			self.iResizeArray[i]();
		} catch (err) {
		}
	}
};

InditexClass.prototype.getNumOfProducts = function(cart) {
	if (cart == undefined)
		cart='shopCart';
	var self = this;
	var json =self._readUserJSON();
	if (json) {
		return json[cart].items.length;
	}
	return 0;
};

InditexClass.prototype.hasProductInCart = function(cart, item) {
	var self = this;
	var json =self._readUserJSON();
	if (json) {
		var arrayItems= json[cart].items;
		for ( var i = 0; i < arrayItems.length; i++) {
			if (arrayItems[i].id == item) {
				return true;
			}
		}
	}
	return false;

};

InditexClass.prototype.hasProductInShopCart = function(item) {
	return this.hasProductInCart('shopCart', item);
};

InditexClass.prototype.drawHeader = function() {
	if(typeof(lockMiniShopCart)!='undefined'
	&&typeof(UserHeaderJSON)!='undefined'
	&&typeof(MiniShopCartJSON)!='undefined')
	{
		fnInitializeAccountController();
		fnInitializeMiniShopCart();
		fnInitializeMiniWishCart();
		$('top_account').setStyle('display','');
		fnFoldTopMenu();
	}
	else
	{
		Inditex.getPBUserJSON(function()
		{
			fnInitializeAccountController();
			fnInitializeMiniShopCart();
			fnInitializeMiniWishCart();
			$('top_account').setStyle('display','');
			fnFoldTopMenu();
		});
	}
};

InditexClass.prototype.getUserJsonUrl = function() {
	return window.PULL_USER_JSON_URL;
};

InditexClass.prototype.getPersistentUserJsonUrl = function() {
	return window.PERSISTENT_USER_JSON_URL;
};

InditexClass.prototype.getImagePath = function() {
	return window.ITX_IMAGE_PATH;
};

InditexClass.prototype.getProductTemplateUrl = function() {
	return null;
};

InditexClass.prototype.getStoreId = function() {
	return ITX_STORE_ID;
};

InditexClass.prototype.getLangId = function() {
	return TopMenuJSON.langId;
};

InditexClass.prototype.hasToDrawHeaderOnReady = function() {
	return true;
};

InditexClass.prototype.popupHtml = function(aHtml, aWidth, aHeight, aCallback) {
	throw "popupHtml: Not implemented!";
};

InditexClass.prototype.popupVideo = function(aVideo, aIVideo, aWidth, aHeight, aCallback) {
	throw "popupVideo: Not implemented!";
};

$('top_account').setStyle('display','none');
var UserHeaderJSON;
var MiniShopCartJSON;

InditexClass.prototype.request = function(options) {
	ajaxHelper.request(options);
};

InditexClass.prototype.getBaseFolder = function() {
	return jspStoreImgDir;
};

InditexClass.prototype.isOpenStore = function() {
	return storeIsOpen;
};

InditexClass.prototype.formatPBUserJSON = function(json) {
	top.UserHeaderJSON=json.UserHeaderJSON;
	top.MiniShopCartJSON=json.shopCart;
	UserHeaderJSON=json.UserHeaderJSON;
	MiniShopCartJSON=json.shopCart;
	Inditex.getPBUserJSONCallback(json);
};

InditexClass.prototype.getPBUserJSON = function(callback) {
	Inditex.getPBUserJSONCallback=callback;
	this.getUserJSON(this.formatPBUserJSON);
};

loadController.addFunction(function()
{
	Inditex.onReady();
});