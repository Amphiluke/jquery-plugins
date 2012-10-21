(function () {

"use strict";

var DEG2RAD = Math.PI / 180,
	assert = function (expression, message) {
		if (!expression) {
			throw new Error(message);
		}
	};

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
				if (Array.prototype.indexOf.call(element, e.target) !== -1) {
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

lsElements = {
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
		lsElements.collections.innerHTML = Object.keys(this.bank).reduce(function (html, name) {
			var selected = (name == active) ? " selected='selected'" : "";
			return html + "<option" + selected + ">" + name + "</option>";
		}, "");
		this.listLSystems();
	},

	listLSystems: function () {
		var name = this.current = lsElements.collections.value;
		lsElements.collectionButtons.del.disabled = lsElements.collectionButtons.store.disabled = (name == "bundled");
		lsElements.collectionList.innerHTML = Object.keys(this.bank[name]).reduce(function (html, name) {
			return html + "<option>" + name + "</option>";
		}, "");
	},

	addLSystem: function () {
		assert(this.current != "bundled", "Unable to add new L-systems the bundled collection");
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
				var lSystem = c.bank[c.current][this.value];
				if (!lSystem) return;
				lsElements.axiom.value = lSystem.axiom;
				lsElements.alpha.value = lSystem.alpha;
				lsElements.theta.value = lSystem.theta;
				lsElements.step.value = lSystem.step;
				lsElements.iterCount.value = lSystem.iterCount;
				rules.fill(lSystem.rules);
				if (e.ctrlKey) {
					form.plotLSystem();
				}
			};
		dom.on("dblclick", lsElements.collectionList, setLS);
		dom.on("keyup", lsElements.collectionList, setLS);
		dom.on("change", lsElements.collections, function () { c.listLSystems(); });
		dom.on("click", lsElements.collectionButtons.create, function () { c.create(); });
		dom.on("click", lsElements.collectionButtons.del, function () { c.del(); });
		dom.on("click", lsElements.collectionButtons.store, function () { c.addLSystem(); });
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
		var lis = dom.findAll("li", lsElements.rulesList),
			li = dom.frag.appendChild(lis[lis.length - 2].cloneNode(true)),
			label = dom.find("label", li),
			input = lsElements.rules[letter] = dom.find("input", li);
		label.textContent = letter;
		label.className = label.htmlFor = input.id = "ls-rule-" + letter;
		this.setDisabled(letter, true);
		input.value = "";
		lsElements.rulesList.insertBefore(dom.frag, lis[lis.length - 1]);
	},

	replace: function (from, to) {
		this.letters.swap(from, to);
		lsElements.rules[to] = lsElements.rules[from];
		delete lsElements.rules[from];
		this.popupOwner.textContent = to;
		this.popupOwner.className = this.popupOwner.htmlFor = lsElements.rules[to].id = "ls-rule-" + to;
		this.setDisabled(to, true);
		this.setDisabled(from, false);
	},

	del: function (letter) {
		var target = lsElements.rules[letter];
		if (!target || /[FB]/.test(letter)) return;
		this.letters.put(letter);
		target.parentNode.parentNode.removeChild(target.parentNode);
		delete lsElements.rules[letter];
		this.setDisabled(letter, false);
	},

	fill: function (data) {
		lsElements.rules.F.value = lsElements.rules.B.value = "";
		Object.keys(lsElements.rules).forEach(function (letter) {
			if (!data.hasOwnProperty(letter)) {
				this.del(letter);
			}
		}, this);
		Object.keys(data).forEach(function (letter) {
			this.add(letter);
			lsElements.rules[letter].value = data[letter];
		}, this);
	},

	build: function () {
		var result = {};
		Object.keys(lsElements.rules).forEach(function (letter) {
			if (lsElements.rules[letter].value) {
				result[letter] = lsElements.rules[letter].value;
			}
		});
		return result;
	},

	addHandlers: function () {
		var inst = this;
		inst.createPopup();
		// pass a "live" collection of LABEL element is the 2nd parameter, since the rules are added dynamically
		dom.on("click", lsElements.rulesList.getElementsByTagName("label"), function () {
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
		}, lsElements.rulesList);
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
	collectParams: function (inDeg) {
		var factor = (inDeg) ? 1 : DEG2RAD;
		return {
			axiom: lsElements.axiom.value,
			alpha: lsElements.alpha.value * factor,
			theta: lsElements.theta.value * factor,
			iterCount: +lsElements.iterCount.value,
			step: +lsElements.step.value,
			rules: rules.build()
		};
	},

	plotLSystem: function (params) {
		var ctx = lsElements.canvas.getContext("2d");
		ctx.strokeStyle = lsElements.colors.fg.value || "#080";
		ctx.fillStyle = lsElements.colors.bg.value || "#fff";
		ls.init(params || this.collectParams()).draw(lsElements.canvas, true);
	},

	addPlotHandler: function () {
		var f = this;
		dom.on("submit", ".ls-form", function (e) {
			e.preventDefault();
			f.plotLSystem();
		});
	},

	checkQuery: function () {
		var queryParams = location.search.match(/[\?&]ls=(.+?)(?:$|&)/);
		if (queryParams) {
			try {
				this.plotLSystem(JSON.parse(decodeURIComponent(queryParams[1])));
			} catch (e) { /* do nothing */ }
		}
	},

	addPanelHandlers: function () {
		var arrow = {};
		arrow[true.toString()] = "\u25b2";
		arrow[false.toString()] = "\u25bc";
		dom.on("click", "legend", function () {
			var collapsed = this.parentNode.classList.toggle("collapsed-fieldset");
			this.textContent = this.textContent.replace(arrow[collapsed], arrow[!collapsed]);
		}, ".ls-form");
	},

	addExportHandler: function () {
		var f = this;
		dom.on("click", "#ls-export", function () {
			var wnd = window.open("about:blank", "lsystempng", "width=550,height=550,menubar=yes,resizable=yes"),
				doc = wnd.document;
			doc.open();
			doc.write(
				"<!DOCTYPE html><html><head><meta charset='UTF-8'/><title>L-system</title></head><body>" +
				"<img width='500' height='500' alt='' src='" + lsElements.canvas.toDataURL() + "'/></body></html>"
			);
			doc.close();
		});
		dom.on("click", "#ls-link-btn", function () {
			var params = JSON.stringify(f.collectParams()),
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
		f.addExportHandler();
		dom.on("load", window, function () { f.checkQuery(); });
	}
};

function initLSInterface() {
	lsElements.cacheElements();
	collection.init();
	form.addHandlers();
	rules.addHandlers();
}

dom.on("DOMContentLoaded", document, initLSInterface);

})();