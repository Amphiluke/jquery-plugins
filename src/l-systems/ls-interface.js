/*!
 * L-system manager
 * ls-interface.js (user interface)
 *
 * https://github.com/Amphiluke/jquery-plugins/blob/master/src/l-systems/ls-interface.js
 *
 * Copyright (c) 2012 Amphiluke
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function () {

"use strict";

var DEG2RAD = Math.PI / 180,
	assert = function (expression, message) {
		if (!expression) {
			throw new Error(message);
		}
	},
	indexOf = Array.prototype.indexOf;

var dom = {
	frag: document.createDocumentFragment(),

	$: document.querySelector.bind(document),

	find: function (selector, context) {
		return context.querySelector(selector);
	},

	findAll: function (selector, context) {
		return context.querySelectorAll(selector);
	},

	on: function (type, element, listener, delegatee) {
		if (delegatee) {
			if (typeof delegatee == "string") {
				delegatee = this.$(delegatee);
			}
			if (typeof element == "string") {
				element = this.findAll(element, delegatee);
			}
			delegatee.addEventListener(type, function (e) {
				if (indexOf.call(element, e.target) !== -1) {
					listener.apply(e.target, arguments);
				}
			}, false);
		} else {
			if (typeof element == "string") {
				element = this.$(element);
			}
			element.addEventListener(type, listener, false);
		}
	}
},

lsUI = {
	cacheElements: function () {
		var $ = dom.$;
		this.axiom = $("#ls-axiom");
		this.alpha = $("#ls-alpha");
		this.theta = $("#ls-theta");
		this.step = $("#ls-step");
		this.iterCount = $("#ls-iterCount");
		this.rulesList = $(".ls-rules-list");
		this.rules = {
			F: $("#ls-rule-F"),
			B: $("#ls-rule-B")
		};
		this.colors = {
			fg: $("#ls-color"),
			bg: $("#ls-background")
		};
		this.collections = $("#ls-collections"),
		this.collectionList = $("#ls-collection-list");
		this.collectionButtons = {
			create: $("#ls-collection-create"),
			del: $("#ls-collection-delete"),
			store: $("#ls-collection-store")
		};
		this.canvas = $("#ls-canvas");
	}
},

collection = {
	init: function () {
		if (!localStorage.lsCollections) return;
		this.bank = JSON.parse(localStorage.lsCollections);
		this.listCollections("bundled"); // the bundled collection is created within ls-collection.js
		this.addHandlers();
	},

	listCollections: function (active) {
		var select = lsUI.collections;
		form.fillSelect(select, Object.keys(this.bank));
		select.selectedIndex = indexOf.call(select.options, select.querySelector("option[value='" + active + "']"));
		this.listLSystems();
	},

	listLSystems: function () {
		var name = this.current = lsUI.collections.value;
		lsUI.collectionButtons.del.disabled = lsUI.collectionButtons.store.disabled = (name == "bundled");
		form.fillSelect(lsUI.collectionList, Object.keys(this.bank[name]));
	},

	addLSystem: function () {
		assert(this.current != "bundled", "Unable to add new L-systems to the bundled collection");
		var name = window.prompt("Specify a new L-system name", "");
		if (!name) return;
		assert(!this.bank[this.current].hasOwnProperty(name), "L-system with the same name already exists");
		this.bank[this.current][name] = form.collectParams(true);
		localStorage.lsCollections = JSON.stringify(this.bank);
		this.listLSystems();
	},

	create: function () {
		var name = window.prompt("Specify a new collection name", "");
		if (!name) return;
		assert(!this.bank.hasOwnProperty(name), "Collection with the same name already exists");
		this.bank[name] = {};
		localStorage.lsCollections = JSON.stringify(this.bank);
		this.listCollections(name);
	},

	del: function () {
		assert(this.current != "bundled", "Unable to delete the bundled collection");
		delete this.bank[this.current];
		localStorage.lsCollections = JSON.stringify(this.bank);
		this.listCollections("bundled");
	},

	addHandlers: function () {
		var c = this,
			setLS = function (e) {
				if (e.type == "keyup" && e.keyCode != 13) return;
				form.fillParams(c.bank[c.current][this.value]);
				if (e.ctrlKey) {
					form.plotLSystem();
				}
			};
		dom.on("dblclick", lsUI.collectionList, setLS);
		dom.on("keyup", lsUI.collectionList, setLS);
		dom.on("change", lsUI.collections, function () { c.listLSystems(); });
		dom.on("click", lsUI.collectionButtons.create, function () { c.create(); });
		dom.on("click", lsUI.collectionButtons.del, function () { c.del(); });
		dom.on("click", lsUI.collectionButtons.store, function () { c.addLSystem(); });
	}
},

rules = {
	letters: (function () {
		var vacantLetters = "ACDEGHIJKLMNOPQRSTUVWXYZ".split("");
		return {
			get: function (letter) {
				if (!letter) {
					return vacantLetters.shift();
				} else if (!this.used(letter)) {
					return vacantLetters.splice(vacantLetters.indexOf(letter), 1)[0];
				}
			},
			put: function (letter) {
				if (this.used(letter)) {
					vacantLetters.push(letter);
					vacantLetters.sort();
				}
			},
			used: function (letter) {
				return (vacantLetters.indexOf(letter) == -1);
			},
			swap: function (from, to) {
				assert(this.used(from) && !this.used(to), "Illegal parameters passed during attempt to swap rules");
				vacantLetters.splice(vacantLetters.indexOf(to), 1, from);
				vacantLetters.sort();
			},
			get rest() {
				return vacantLetters.slice(0);
			},
			get length() {
				return vacantLetters.length;
			}
		};
	})(),

	createPopup: function () {
		this.popup = document.body.appendChild(document.createElement("ul"));
		this.popup.className = "ls-letters-popup";
		this.popup.innerHTML = this.letters.rest.reduce(function (html, letter) {
			return html + "<li class='ls-rule-" + letter + "'>" + letter + "</li>";
		}, "") + "<li class='ls-rule-del'>X</li>";
	},

	showPopup: function (label) {
		var style = this.popup.style,
			rect = label.getBoundingClientRect();
		style.display = "block";
		style.left = rect.left + window.pageXOffset + "px";
		style.top = rect.top + window.pageYOffset + label.offsetHeight + 1 + "px";
		this.popupOwner = label;
	},

	hidePopup: function () {
		this.popup.style.display = "none";
		this.popupOwner = null;
	},

	setDisabled: function (letter, disable) {
		var btn = dom.find(".ls-rule-" + letter, this.popup);
		if (disable) {
			btn.setAttribute("data-disabled", "1");
		} else {
			btn.removeAttribute("data-disabled");
		}
	},

	isDisabled: function (letter) {
		return !!dom.find(".ls-rule-" + letter, this.popup).getAttribute("data-disabled");
	},

	add: function (letter) {
		if (this.letters.length < 1) return;
		letter = this.letters.get(letter);
		if (!letter) return;
		var lis = dom.findAll("li", lsUI.rulesList),
			li = dom.frag.appendChild(lis[lis.length - 2].cloneNode(true)),
			label = dom.find("label", li),
			input = lsUI.rules[letter] = dom.find("input", li);
		label.textContent = letter;
		label.className = label.htmlFor = input.id = "ls-rule-" + letter;
		this.setDisabled(letter, true);
		input.value = "";
		lsUI.rulesList.insertBefore(dom.frag, lis[lis.length - 1]);
	},

	replace: function (from, to) {
		this.letters.swap(from, to);
		lsUI.rules[to] = lsUI.rules[from];
		delete lsUI.rules[from];
		this.popupOwner.textContent = to;
		this.popupOwner.className = this.popupOwner.htmlFor = lsUI.rules[to].id = "ls-rule-" + to;
		this.setDisabled(to, true);
		this.setDisabled(from, false);
	},

	del: function (letter) {
		var target = lsUI.rules[letter];
		if (!target || /[FB]/.test(letter)) return;
		this.letters.put(letter);
		target.parentNode.parentNode.removeChild(target.parentNode);
		delete lsUI.rules[letter];
		this.setDisabled(letter, false);
	},

	fill: function (data) {
		lsUI.rules.F.value = lsUI.rules.B.value = "";
		Object.keys(lsUI.rules).forEach(function (letter) {
			if (!data.hasOwnProperty(letter)) {
				this.del(letter);
			}
		}, this);
		Object.keys(data).forEach(function (letter) {
			this.add(letter);
			lsUI.rules[letter].value = data[letter];
		}, this);
	},

	build: function () {
		var result = {};
		Object.keys(lsUI.rules).forEach(function (letter) {
			if (lsUI.rules[letter].value) {
				result[letter] = lsUI.rules[letter].value;
			}
		});
		return result;
	},

	addHandlers: function () {
		var inst = this;
		inst.createPopup();
		// pass a "live" collection of LABEL elements in the 2nd parameter, since the rules are added dynamically
		dom.on("click", lsUI.rulesList.getElementsByTagName("label"), function () {
			switch (this.htmlFor) {
				case "ls-rule-add":
					inst.add();
					break;
				case "ls-rule-B":
				case "ls-rule-F":
					break;
				default:
					inst.showPopup(this);
					break;
			}
		}, lsUI.rulesList);
		dom.on("click", "li", function () {
			if (!inst.popupOwner) return;
			if (this.className == "ls-rule-del") {
				inst.del(inst.popupOwner.textContent);
			} else if (!inst.isDisabled(this.textContent)) {
				inst.replace(inst.popupOwner.textContent, this.textContent);
			}
			inst.hidePopup();
		}, inst.popup);
	}
},

form = {
	fillSelect: function (select, options) {
		var frag = dom.frag, option;
		options.forEach(function (name) {
			option = frag.appendChild(document.createElement("option"));
			option.text = option.value = name;
		});
		select.options.length = 0;
		select.appendChild(frag);
	},

	collectParams: function (inDeg) {
		var factor = (inDeg) ? 1 : DEG2RAD;
		return {
			axiom: lsUI.axiom.value,
			alpha: lsUI.alpha.value * factor,
			theta: lsUI.theta.value * factor,
			iterCount: +lsUI.iterCount.value,
			step: +lsUI.step.value,
			rules: rules.build()
		};
	},

	fillParams: function (params) {
		if (!params) return;
		lsUI.axiom.value = params.axiom;
		lsUI.alpha.value = params.alpha;
		lsUI.theta.value = params.theta;
		lsUI.step.value = params.step;
		lsUI.iterCount.value = params.iterCount;
		rules.fill(params.rules);
	},

	plotLSystem: function (params) {
		var ctx = lsUI.canvas.getContext("2d");
		ctx.strokeStyle = lsUI.colors.fg.value || "#080";
		ctx.fillStyle = form.pattern || lsUI.colors.bg.value || "#fff";
		ls.init(params || this.collectParams()).draw(lsUI.canvas);
	},

	addPlotHandler: function () {
		var f = this;
		dom.on("submit", ".ls-form", function (e) {
			e.preventDefault();
			f.plotLSystem();
		});
	},

	checkQuery: function () {
		var queryParams = location.search.match(/[\?&]ls=(.+?)(?:$|&)/),
			params;
		if (queryParams) {
			try {
				params = JSON.parse(decodeURIComponent(queryParams[1]));
				this.fillParams(params);
				params.alpha *= DEG2RAD;
				params.theta *= DEG2RAD;
				this.plotLSystem(params);
			} catch (e) { /* do nothing */ }
		}
	},

	addPanelHandlers: function () {
		dom.on("click", "legend", function () {
			this.parentNode.classList.toggle("collapsed-fieldset");
		}, ".ls-form");
	},

	addPatternHandler: function () {
		var img, ctx, url = window.URL || window.webkitURL || window;
		if (!url.createObjectURL || !url.revokeObjectURL) {
			dom.$("#ls-pattern").disabled = true;
			return;
		}
		img = document.createElement("img");
		ctx = lsUI.canvas.getContext("2d");
		dom.on("load", img, function () {
			form.pattern = ctx.createPattern(img, "repeat");
			url.revokeObjectURL(this.src);
		});
		dom.on("change", "#ls-pattern", function () {
			img.src = url.createObjectURL(this.files[0]);
		});
	},

	addExportHandler: function () {
		var f = this;
		dom.on("click", "#ls-export", function () {
			var wnd = window.open("about:blank", "lsystempng", "width=550,height=550,menubar=yes,resizable=yes"),
				doc = wnd.document;
			doc.open();
			doc.write(
				"<!DOCTYPE html><html><head><meta charset='UTF-8'/><title>L-system</title></head><body>" +
				"<img width='500' height='500' alt='' src='" + lsUI.canvas.toDataURL() + "'/></body></html>"
			);
			doc.close();
		});
		dom.on("click", "#ls-link-btn", function () {
			var params = JSON.stringify(f.collectParams(true)),
				field = dom.$("#ls-link-field");
			field.value = location.protocol + "//" + location.hostname + location.pathname +
				"?ls=" + encodeURIComponent(params);
			field.focus();
			field.select();
		});
	},

	addHandlers: function () {
		var f = this;
		f.addPlotHandler();
		f.addPanelHandlers();
		f.addPatternHandler();
		f.addExportHandler();
		dom.on("load", window, function () { f.checkQuery(); });
	}
};

function initLSInterface() {
	lsUI.cacheElements();
	collection.init();
	form.addHandlers();
	rules.addHandlers();
}

dom.on("DOMContentLoaded", document, initLSInterface);

})();