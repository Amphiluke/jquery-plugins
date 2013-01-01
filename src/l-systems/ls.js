/*!
 * L-system manager
 * ls.js (core and base logic implementation)
 *
 * https://github.com/Amphiluke/jquery-plugins/blob/master/src/l-systems/ls.js
 *
 * Copyright (c) 2012-2013 Amphiluke
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
var ls = (function () {

"use strict";

var axiom = "",
	rules = Object.create(Object.prototype, {
		// define non-configurable properties for an L-system code control characters
		// (used internally in genLSCode() routine)
		"+": { value: "+" },
		"-": { value: "-" },
		"[": { value: "[" },
		"]": { value: "]" }
	}),
	ls = Object.create(Object.prototype, {
		axiom: {
			get: function () { return axiom; },
			set: function (value) { setAxiom(value); },
			enumerable: true,
			configurable: true
		},
		rules: { // a set of productions for each symbol from A to Z
			get: function () { return rules; },
			enumerable: true,
			configurable: true
		},
		alpha: { // initial angle in radians
			value: 0,
			writable: true,
			enumerable: true,
			configurable: true
		},
		theta: { // angle increment in radians
			value: 0,
			writable: true,
			enumerable: true,
			configurable: true
		},
		step: {
			value: 10,
			writable: true,
			enumerable: true,
			configurable: true
		},
		iterCount: {
			value: 3,
			writable: true,
			enumerable: true,
			configurable: true
		},

		code: { // resulting codeword for the turtle (read only)
			value: "",
			enumerable: true,
			configurable: true
		},
		init: {
			value: initLS,
			configurable: true
		},
		addRules: {
			value: addRules,
			configurable: true
		},
		reset: {
			value: resetLS,
			configurable: true
		},
		draw: {
			value: draw,
			configurable: true
		},
		_calcCode: {
			value: genLSCode
		}
	});

// reset L-system parameters into default values
function resetLS() {
	ls.axiom = "";
	ls.alpha = ls.theta = 0;
	ls.step = 10;
	ls.iterCount = 3;
	// delete all enumerable own properties (possible rules added with previous initialisations)
	Object.keys(rules).forEach(function (rule) {
		delete rules[rule];
	});
}

// a short way to initialise the ls object (instead of assigning properties one by one).
function initLS(props) {
	var ordinalProps = ["axiom", "alpha", "theta", "step", "iterCount"];
	ls.reset();
	Object.keys(props).forEach(function (prop) {
		if (ordinalProps.indexOf(prop) > -1) {
			ls[prop] = props[prop];
		}
	});
	if (props.hasOwnProperty("rules")) {
		ls.addRules(props.rules);
	}
	return this;
}

function validateRule(rule) {
	return !(rule && /[^A-Z\+\-\[\]]/.test(rule));
}

function setAxiom(value) {
	if (validateRule(value)) {
		axiom = value;
	} else {
		throw new Error("Illegal character found in the Axiom. The only allowed characters are: A-Z, +, -, [, ]");
	}
}

function addRules(value) {
	var productions = Object(value);
	Object.keys(productions).forEach(function (key) {
		if (key.length == 1 && validateRule(key)) {
			rules[key] = productions[key];
		}
	});
	return this;
}

function genLSCode() {
	var code = axiom;
	for (var i = 0; i < ls.iterCount; i++) {
		code = code.split("").map(function (symbol) {
			// in fact, control characters "+", "-", "[", "]" are not replaced
			// due to non-configurable properties of the same name in the rules object
			return rules[symbol] || "";
		}).join("");
	}
	Object.defineProperty(ls, "code", { value: code });
	return code;
}

function draw(canvas) {
	var c = canvas.getContext("2d"),
		code = genLSCode(),
		len = code.length,
		step = ls.step,
		pos = {
			x: 0,
			y: 0,
			a: -ls.alpha
		},
		stack = [],
		rect = { left: Number.MAX_VALUE, top: Number.MAX_VALUE, right: -Number.MAX_VALUE, bottom: -Number.MAX_VALUE },
		run = function (actObj) {
			for (var i = 0; i < len; i++) {
				if (actObj.hasOwnProperty([code[i]])) {
					actObj[code[i]]();
				}
			}
		},
		act = { // actions for real drawing
			B: function () {
				pos.x += step * Math.cos(pos.a);
				pos.y += step * Math.sin(pos.a);
				c.moveTo(pos.x, pos.y);
			},
			F: function () {
				pos.x += step * Math.cos(pos.a);
				pos.y += step * Math.sin(pos.a);
				c.lineTo(pos.x, pos.y);
			},
			"+": function () {
				pos.a += ls.theta;
			},
			"-": function () {
				pos.a -= ls.theta;
			},
			"[": function () {
				stack.push({ x: pos.x, y: pos.y, a: pos.a });
			},
			"]": function () {
				pos = stack.pop();
				c.moveTo(pos.x, pos.y);
			}
		},
		actTest = { // actions for system size estimation (without drawing)
			F: function () {
				pos.x += step * Math.cos(pos.a);
				pos.y += step * Math.sin(pos.a);
				rect.left = Math.min(rect.left, pos.x);
				rect.right = Math.max(rect.right, pos.x);
				rect.top = Math.min(rect.top, pos.y);
				rect.bottom = Math.max(rect.bottom, pos.y)
			},
			"+": act["+"],
			"-": act["-"],
			"[": act["["],
			"]": function () {
				pos = stack.pop();
			}
		};
		actTest.B = actTest.F;

	// make a nonprocess run to obtain an initial point to start draw with
	run(actTest);
	pos.x = Math.abs(rect.left) + (canvas.width - rect.right + rect.left) / 2;
	pos.y = Math.abs(rect.top) + (canvas.height - rect.bottom + rect.top) / 2;
	pos.a = -ls.alpha;
	stack.length = 0; // clear stack JIC

	// draw per se
	c.clearRect(0, 0, canvas.width, canvas.height);
	c.fillRect(0, 0, canvas.width, canvas.height);
	c.beginPath();
	c.moveTo(pos.x, pos.y);
	run(act);
	c.stroke();

	return this;
}

return ls;

})();