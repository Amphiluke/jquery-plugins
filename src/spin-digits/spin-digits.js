/*!
 * spin-digits.js by Amphiluke, 2013 (c)
 * jQuery plugin to animate dynamic changes of numeric data on the web-page
 *
 * https://github.com/Amphiluke/jquery-plugins/tree/master/src/spin-digits
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
	this.currentValueStr = $el.text();
	this._setMarkup();
}

$.extend(SpinDigits.prototype, {

	_setMarkup: function () {
		var html = this.$el.html(),
			prefix = "<span class='spin-digit-prefix'>$1</span>",
			suffix = "<span class='spin-digit-suffix'>$4</span>",
			sheetBegin = "<span class='spin-digit-sheet'><samp class='spin-digit'></samp><samp class='spin-digit'>",
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
	 * Update a value within the spinner.
	 * Note that the argument should be a string (!), not a number, since we don't know here
	 * what type of number format the user wants to apply. So, let him decide for himself
	 * @param {String} newValueStr A new string-formatted value to set
	 */
	setValue: function (newValueStr) {
		var newValue, newValueParts,
			prevValue, prevValueParts,
			spinInc, spinSheets, spinDigits, spinClass;
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
		spinSheets = this.$el.find(".spin-digit-sheet");
		spinDigits = this.$el.find(".spin-digit");
		spinClass = spinInc ? "spin-digit-sheet-spin-inc" : "spin-digit-sheet-spin-dec";
		if (newValueParts[2] !== prevValueParts[2]) {
			spinDigits.eq(spinInc ? 0 : 2).text(newValueParts[2]);
			spinSheets.eq(0).addClass(spinClass);
		}
		if (newValueParts[3] !== prevValueParts[3]) {
			spinDigits.eq(spinInc ? 3 : 5).text(newValueParts[3]);
			spinSheets.eq(1).addClass(spinClass);
		}
		this.prefix.html(newValueParts[1]);
		this.suffix.html(newValueParts[4]);
		this.currentValueStr = newValueStr;
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
 * @param {*} [data] Additional parameters depending on what operation is requested
 * @returns {jQuery} A jQuery object, the initial set of elements
 */
$.fn.spinDigits = function (op, data) {
	this.each(function () {
		var $el = $(this),
			inst = $el.data("spinDigits");
		if (!inst) {
			$el.data("spinDigits", new SpinDigits($el));
		}
		if ((op === "set") && (typeof data !== "undefined")) {
			inst.setValue(data);
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
