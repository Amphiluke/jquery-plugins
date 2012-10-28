(function () {

"use strict";

/* DOMTokenList emulation for IE 9 */

if ("DOMTokenList" in window) return;

function DOMTokenList(el, prop) {
	Object.defineProperties(this, {
		el: {
			get: function () { return el; }
		},
		prop: {
			get: function () { return prop; }
		},
		tokenList: {
			get: function () { return el[prop].split(/\s+/); }
		}
	});
	var tokenList = this.tokenList;
	for (var i = 0, len = tokenList.length; i < len; i++) {
		this[i] = tokenList[i];
	}
}

Object.defineProperties(DOMTokenList.prototype, {
	length: {
		get: function () { return this.tokenList.length; },
		enumerable: true,
		configurable: true
	},
	add: {
		value: function (token) {
			var tokenList = this.tokenList.slice(0);
			if (tokenList.indexOf(token) == -1) {
				tokenList.push(token);
				this.el[this.prop] = tokenList.join(" ");
			}
		},
		writable: true,
		enumerable: true,
		configurable: true
	},
	contains: {
		value: function (token) {
			return (this.tokenList.indexOf(token) > -1);
		},
		writable: true,
		enumerable: true,
		configurable: true
	},
	item: {
		value: function (index) {
			return this.tokenList[index];
		},
		writable: true,
		enumerable: true,
		configurable: true
	},
	remove: {
		value: function (token) {
			var tokenList = this.tokenList.slice(0),
				index = tokenList.indexOf(token);
			if (index == -1) return;
			tokenList.splice(index, 1);
			this.el[this.prop] = tokenList.join(" ").trim();
		},
		writable: true,
		enumerable: true,
		configurable: true
	},
	toString: {
		value: function () { return this.el[this.prop]; },
		writable: true,
		enumerable: true,
		configurable: true
	},
	toggle: {
		value: function (token) {
			this[(this.contains(token)) ? "remove" : "add"](token);
		},
		writable: true,
		enumerable: true,
		configurable: true
	}
});

Object.defineProperty(HTMLElement.prototype, "classList", {
	get: function () {
		return this.cachedClassList || (this.cachedClassList = new DOMTokenList(this, "className"));
	}
});

})();