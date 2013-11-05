/*!
 * jQuery overplaceholder Plugin 1.1.2
 *
 * https://github.com/Amphiluke/jquery-plugins/tree/master/src/overplaceholder
 * http://diapeira.1gb.ru/diapeira/jquery-plugins/overplaceholder.html
 *
 * Copyright (c) 2011-2013 Amphiluke
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
;(function ($) {

"use strict";

function wrapFld(lbl, fld) {
	var wrapper = $("<span class='oph-wrapper'></span>"),
		fldId = fld.attr("id");
	if (fldId) {
		wrapper.attr("id", "oph-" + fldId);
	}
	fld.wrap(wrapper);
	lbl.insertAfter(fld);
}

function correctOPHPos(lbl, fld) {
	var fldpos, wrppos;
	if (!fld) {
		fld = $("#" + lbl.attr("for"));
	}
	fldpos = fld.offset();
	wrppos = fld.parent().offset();
	lbl.css({
		left: (fldpos.left - wrppos.left) + "px",
		top: (fldpos.top + ((fld.outerHeight() - lbl.outerHeight()) >> 1) - wrppos.top) + "px"
	});
}

function checkIfEmpty(fld, reEmpty) {
	if (fld.is("select")) {
		return $("option:selected", fld).text().replace(reEmpty, "");
	}
	if (fld.val().replace(reEmpty, "") === "") {
		fld.val("");
	}
	return fld.val();
}

function bindLblEvents(lbl, fld, opts) {
	var lblDOM = lbl[0];
	lbl.click(function () {
		opts.onhide.call(lblDOM);
	})
	.bind("parentformreset", function () {
		// it is important to check exactly the defaultValue property
		// (do not call the .val() method), since the form is about to reset
		var defVal = fld[0].defaultValue || "";
		opts[(defVal.replace(opts.reEmpty, "") === "") ? "onshow" : "onhide"].call(lblDOM);
	})
	.bind("adjustPos", function () {
		correctOPHPos(lbl, fld);
	});
	// Prevent placeholder text select in IE and Opera. Other browsers use CSS (see jquery.overplaceholder.css)
	// In IE the UNSELECTABLE attribute is implemented as an expando.
	if (("unselectable" in lblDOM) || ("expando" in document)) {
		lbl.attr("unselectable", "on");
	}
}

function bindFldEvents(lbl, fld, opts) {
	fld.bind("focus blur", function (e) {
		if (!checkIfEmpty(fld, opts.reEmpty)) {
			opts[(e.type === "blur") ? "onshow" : "onhide"].call(lbl[0]);
		}
	})
	.bind("progvalchange", function () { // trigger this event after programmatic value change
		opts[(checkIfEmpty(fld, opts.reEmpty)) ? "onhide" : "onshow"].call(lbl[0]);
	});
}

function processOPH(lbl, opts) {
	var fld = $("#" + lbl.attr("for"));
	if (fld.length !== 0) {
		lbl.addClass("overplaceholder");
		wrapFld(lbl, fld);
		if ($.isFunction(opts.onafterWrap)) {
			opts.onafterWrap(lbl, fld);
		}
		correctOPHPos(lbl, fld);
		bindLblEvents(lbl, fld, opts);
		bindFldEvents(lbl, fld, opts);
		if (checkIfEmpty(fld, opts.reEmpty)) { // hide placeholders for the pre-filled fields
			opts.onhide.call(lbl[0]);
		}
	}
}

$.fn.overplaceholder = function (opts) {
	var _sets = {
			onhide: function () { $(this).hide(); },
			onshow: function () { $(this).show(); },
			onafterWrap: null,
			reEmpty: ""
		};
	$.extend(_sets, opts);
	return this.each(function () {
		processOPH($(this), _sets);
	});
};

$(document).ready(function () {
	// restore overplaceholders' initial state when their parent form is being resetted.
	// Use event delegation, since overplaceholder may be applied to dynamically created forms.
	// Old IE versions don't bubble the "reset" event, so let them go without delegation
	var respondent = $.support.submitBubbles ? $(document) : $("form");
	respondent.bind("reset", function (e) {
		$(".overplaceholder", e.target).trigger("parentformreset");
	});
});

})(jQuery);