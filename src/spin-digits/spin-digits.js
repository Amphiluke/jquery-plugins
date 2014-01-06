/*!
 * spin-digits.js by Amphiluke, 2013-2014 (c)
 * jQuery plugin to animate dynamic changes of numeric data on the web-page
 *
 * https://github.com/Amphiluke/jquery-plugins/tree/master/src/spin-digits
 * http://amphiluke.github.io/jquery-plugins/spin-digits/
 */
(function ($) {

"use strict";

var re = {
		intFrac: /^(\D*)(\d[^\.]*)\.(\d+)(\D*)$/,
		nonNum: /[^\d\+\-\.]/g
	},
	// detect CSS3 transitions support
	transitionSupported = (function () {
		var style = (document.body || document.documentElement).style;
		return ("transition" in style || "WebkitTransition" in style || "MozTransition" in style || "MsTransition" in style || "OTransition" in style);
	})();


function SpinDigits($el) {
	this.$el = $el;
	this.currentValueStr = $.trim($el.text());
	this._setMarkup();
}

$.extend(SpinDigits.prototype, {

	_setMarkup: function () {
		var html = this.$el.html(),
			prefix = "<span class='spin-digit-prefix'>$1</span>",
			suffix = "<span class='spin-digit-suffix'>$4</span>",
			sheetBegin = "<samp class='spin-digit-stat'></samp><span class='spin-digit-sheet'><samp class='spin-digit'></samp><samp class='spin-digit'>",
			sheetEnd = "</samp><samp class='spin-digit'></samp></span>",
			intPart = sheetBegin + "$2" + sheetEnd,
			fracPart = sheetBegin + "$3" + sheetEnd;
		html = html.replace(re.intFrac, prefix + intPart + "." + fracPart + suffix);
		html = "<span class='spin-digit-wrap'>" + html + "</span>";
		this.$el.html(html);
		// cache immutable elements to have quick access to them
		this.prefix = this.$el.find(".spin-digit-prefix");
		this.suffix = this.$el.find(".spin-digit-suffix");
	},

	/**
	 * Compare string representation of two values and separate the modified parts of a number from the static part.
	 * Note that changes in higher digit position results in that all the lower positions will be considered modified.
	 * Say, the previous number representation is "1234.56" and the new one is "1235.56". Then the static part
	 * would be "123" while the dynamic (modified) part would be "5.56"
	 * @param {String} prevInt
	 * @param {String} prevFrac
	 * @param {String} newInt
	 * @param {String} newFrac
	 * @returns {Object} A hash containing the static and dynamic parts of a string representation of a number
	 * @private
	 */
	_splitParts: function (prevInt, prevFrac, newInt, newFrac) {
		var parts = {
				intg: {stat: newInt, dyn: ""},
				frac: {stat: newFrac, dyn: ""}
			},
			len, i;
		if (prevInt.length !== newInt.length) {
			parts.intg.dyn = newInt;
			parts.frac.dyn = newFrac;
			parts.intg.stat = parts.frac.stat = "";
			return parts;
		}
		for (i = 0, len = newInt.length; i < len; i++) {
			if (prevInt[i] !== newInt[i]) {
				parts.intg.stat = newInt.slice(0, i);
				parts.intg.dyn = newInt.slice(i);
				parts.frac.stat = "";
				parts.frac.dyn = newFrac;
				return parts;
			}
		}
		for (i = 0, len = newFrac.length; i < len; i++) {
			if (prevFrac[i] !== newFrac[i]) {
				parts.frac.stat = newFrac.slice(0, i);
				parts.frac.dyn = newFrac.slice(i);
				return parts;
			}
		}
		return parts;
	},

	/**
	 * Update a value within the spinner.
	 * Note that the argument should be a string (!), not a number, since we don't know here
	 * what type of number format the user wants to apply. So, let him decide for himself
	 * @param {String} newValueStr A new string-formatted value to set
	 */
	setValue: function (newValueStr) {
		var newValue, newValueParts,
			prevValue, prevValueParts,
			spinInc, spinStats, spinSheets, spinDigits, spinClass,
			splitParts;
		if (this.currentValueStr === newValueStr) {
			return;
		}
		newValue = parseFloat(newValueStr.replace(re.nonNum, ""));
		newValueParts = newValueStr.match(re.intFrac);
		prevValue = parseFloat(this.currentValueStr.replace(re.nonNum, ""));
		prevValueParts = this.currentValueStr.match(re.intFrac);
		if (isNaN(newValue) || !newValueParts || isNaN(prevValue) || !prevValueParts) {
			throw new Error("Unable to parse the value");
		}
		spinInc = (newValue >= prevValue);
		spinStats = this.$el.find(".spin-digit-stat");
		spinSheets = this.$el.find(".spin-digit-sheet");
		spinDigits = this.$el.find(".spin-digit");
		spinClass = spinInc ? "spin-digit-sheet-spin-inc" : "spin-digit-sheet-spin-dec";
		splitParts = this._splitParts(prevValueParts[2], prevValueParts[3], newValueParts[2], newValueParts[3]);
		if (splitParts.intg.dyn) { // do update only if the integer part was modified
			spinStats.eq(0).text(splitParts.intg.stat);
			spinDigits.eq(1).text(prevValueParts[2].slice(splitParts.intg.stat.length));
			spinDigits.eq(spinInc ? 0 : 2).text(splitParts.intg.dyn);
			spinSheets.eq(0).addClass(spinClass);
		}
		if (splitParts.frac.dyn) {
			spinStats.eq(1).text(splitParts.frac.stat);
			spinDigits.eq(4).text(prevValueParts[3].slice(splitParts.frac.stat.length));
			spinDigits.eq(spinInc ? 3 : 5).text(splitParts.frac.dyn);
			spinSheets.eq(1).addClass(spinClass);
		}
		this.$el.attr("data-dynamics", spinInc ? "pos" : "neg"); // may be used for stylization as well
		this.prefix.html(newValueParts[1]);
		this.suffix.html(newValueParts[4]);
		this.currentValueStr = newValueStr;
	},

	/**
	 * Update current value without animation. May be used to correct the displayed value when the page becomes visible
	 * after some period of inactivity (browsers stop CSS3 animation when the page is not visible)
	 * @param {String} updateValueStr An updated string-formatted value
	 */
	forceUpdate: function (updateValueStr) {
		var updateValueParts = updateValueStr.match(re.intFrac),
			spinSheets, spinDigits, spinSheet, index;
		if (!updateValueParts) {
			throw new Error("Unable to parse the value");
		}
		spinSheets = this.$el.find(".spin-digit-sheet");
		spinDigits = this.$el.find(".spin-digit");
		spinSheet = spinSheets.eq(0);
		// animation may be currently in progress, so choose a correct digit group to update
		index = spinSheet.hasClass("spin-digit-sheet-spin-inc") ? 0 : (spinSheet.hasClass("spin-digit-sheet-spin-dec") ? 2 : 1);
		spinDigits.eq(index).text(updateValueParts[2]);
		spinSheet = spinSheets.eq(1);
		index = spinSheet.hasClass("spin-digit-sheet-spin-inc") ? 3 : (spinSheet.hasClass("spin-digit-sheet-spin-dec") ? 5 : 4);
		spinDigits.eq(index).text(updateValueParts[3]);
		this.$el.find(".spin-digit-stat").text("");
		this.prefix.html(updateValueParts[1]);
		this.suffix.html(updateValueParts[4]);
		this.currentValueStr = updateValueStr;
	},

	/**
	 * Plugin re-initialization
	 */
	reset: function () {
		var wrap = this.$el.find(".spin-digit-wrap");
		wrap.replaceWith(document.createTextNode(wrap.text()));
		this.$el.data("spinDigits", new SpinDigits(this.$el));
	}

});

/**
 * Rebuild a digit sheet after the animation is complete
 * @param {jQuery} sheet A digit sheet being rebuilt
 */
SpinDigits._rebuild = function (sheet) {
	var sheetClone = sheet.clone(),
		spinDigits = sheetClone.find(".spin-digit");
	if (sheet.hasClass("spin-digit-sheet-spin-inc")) {
		spinDigits.eq(-1).prependTo(sheetClone);
	} else {
		spinDigits.eq(0).appendTo(sheetClone);
	}
	// need to construct a new set of ".spin-digit" elements due to recent changes in DOM
	spinDigits = sheetClone.find(".spin-digit");
	spinDigits.not(spinDigits.eq(1)).text("");
	sheetClone.removeClass("spin-digit-sheet-spin-inc spin-digit-sheet-spin-dec");
	sheet.replaceWith(sheetClone);
};


if (!transitionSupported) {
	SpinDigits.prototype.origSetValue = SpinDigits.prototype.setValue;
	SpinDigits.prototype.setValue = function () {
		var inst = this,
			top = inst.$el.find(".spin-digit-sheet").css("top") || "-16px",
			uTop = top.replace("-", ""),
			rebuild = function () {
				SpinDigits._rebuild($(this));
				inst.$el.find(".spin-digit-sheet").css("top", top);
			};
		inst.origSetValue.apply(this, arguments);
		inst.$el.find(".spin-digit-sheet-spin-inc").stop().animate({top: "+=" + uTop}, 1000, "linear", rebuild);
		inst.$el.find(".spin-digit-sheet-spin-dec").stop().animate({top: "-=" + uTop}, 1000, "linear", rebuild);
	};
}


/**
 * The spinDigits plugin method per se
 * @param {String} [op] An operation to perform (e.g. "init" or "set")
 * @param {*} [data] Additional parameter depending on what operation is requested or a callback returning the
 *   parameter for an element in the set of matched elements
 * @returns {jQuery} A jQuery object, the initial set of elements
 */
$.fn.spinDigits = function (op, data) {
	var dataType = typeof data;
	this.each(function () {
		var $el = $(this),
			inst = $el.data("spinDigits"),
			arg;
		if (!inst) {
			inst = new SpinDigits($el);
			$el.data("spinDigits", inst);
		}
		if (dataType !== "undefined") {
			arg = (dataType === "function") ? data.call(this, inst) : data;
			if (op === "set") {
				inst.setValue(arg);
			} else if (op === "update") {
				inst.forceUpdate(arg);
			}
		}
	});
	return this;
};

$.expr[":"].spinned = function (elem) {
	return /(?:^|\s)spin\-digit\-sheet\-spin\-(?:inc|dec)(?:\s|$)/.test(elem.className);
};

$(document).on("transitionend webkitTransitionEnd", ".spin-digit-sheet", function () {
	SpinDigits._rebuild($(this));
});

})(window.jQuery);
