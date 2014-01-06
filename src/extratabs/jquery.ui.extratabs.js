/*!
 * jquery.ui.extratabs.js by Amphiluke, 2013-2014 (c)
 * jQuery UI widget extending tabs UI functionality
 *
 * https://github.com/Amphiluke/jquery-plugins/tree/master/src/extratabs
 * http://amphiluke.github.io/jquery-plugins/extratabs/
 */

(function ($) {

"use strict";

var fn = "ui-extratabs", // widgetFullName
extraData = {
	thumb: {
		frame: null,
		thumbnail: null,
		arrow: null,
		tid: null,
		beforeActivate: null
	},
	scroll: {
		wrapper: null,
		btns: null,
		tid: null,
		_origWidth: null
	},
	multiline: {
		tabRows: null
	}
},
nonempty = function (elem) {
	return (elem && elem.length > 0);
};

$.widget("ui.extratabs", $.ui.tabs, {

	options: {
		multiline: false,
		/* rowHeight: <default to tab height>, */
		thumbnails: false,
		thumbDelay: 150
	},

	_create: function () {
		var inst = this;
		if (inst.options.thumbnails) {
			extraData.thumb.beforeActivate = inst.options.beforeActivate; // store user-defined callback (or null)
			inst.options.beforeActivate = inst._thumbBeforeActivate(); // define specific callback for thumbnails
			inst._super();
			inst._initThumbnails();
		} else {
			inst._super();
		}
		if (inst.options.multiline) {
			inst._initMultiline();
		} else {
			inst._initScroll();
		}
		inst.element.addClass(fn);
	},

	_setOption: function (key, value) {
		var inst = this;
		switch (key) {
			case "beforeActivate":
				if (this.options.thumbnails) {
					extraData.thumb.beforeActivate = value;
					return;
				}
				break;
			case "thumbnails":
				inst._thumbCleanup();
				if (value) {
					extraData.thumb.beforeActivate = inst.options.beforeActivate;
					inst.options.beforeActivate = inst._thumbBeforeActivate();
					inst._initThumbnails();
				}
				break;
			case "multiline":
				if (value) {
					inst._scrollCleanup();
					inst._initMultiline();
				} else {
					inst._multilineCleanup();
					inst._initScroll();
				}
				break;
		}
		this._super(key, value);
	},

	_destroy: function () {
		var inst = this,
			options = inst.options;
		if (options.thumbnails) {
			inst._thumbCleanup();
		}
		if (options.multiline) {
			inst._multilineCleanup();
		} else {
			inst._scrollCleanup();
		}
		inst._super();
	},


	/**
	 * Thumbnail processing routines
	 */

	_initThumbnails: function () {
		var inst = this,
			thumb = extraData.thumb,
			prefix = fn + "-thumb",
			scale, frameWidth, frameHeight, panelWidth, thumbClip, thumbBox, thumbStyle;
		thumb.frame = $("<div class='" + prefix + "-frame'></div>");
		thumbClip = $("<div class='" + prefix + "-clip'></div>").appendTo(thumb.frame);
		thumb.arrow = $("<span class='" + prefix + "-arrow'></span>").appendTo(thumb.frame);
		thumbBox = $("<div class='" + prefix + "-box'></div>").appendTo(thumbClip);
		thumb.thumbnail = $("<div class='" + prefix + "'></div>").appendTo(thumbBox);
		thumb.frame.appendTo(inst.element);
		frameWidth = thumb.frame.width();
		frameHeight = thumb.frame.height();
		thumb.frame.hide();
		panelWidth = inst.panels.eq(0).width();
		scale = Math.min(frameWidth / panelWidth, 1);
		thumbStyle = thumbBox[0].style;
		thumbStyle.WebkitTransform = thumbStyle.MozTransform = thumbStyle.OTransform =
			thumbStyle.msTransform = thumbStyle.transform = "scale(" + scale + ")";
		thumbStyle.WebkitTransformOrigin = thumbStyle.MozTransformOrigin = thumbStyle.OTransformOrigin =
			thumbStyle.msTransformOrigin = thumbStyle.transformOrigin = "0 0";
		thumbStyle.width = thumb.thumbnail[0].style.width = (frameWidth / scale) + "px";
		thumbStyle.height = (frameHeight / scale) + "px";
		/*@cc_on @if (@_jscript_version < 9)
			thumb.frame.addClass(prefix + "-frame-ie"); // to apply the Matrix filter
			thumbStyle.zoom = scale;
			thumbStyle.overflow = "hidden"; // IE6 needs this explicit statement
		@end @*/

		inst._on(inst.tabs, { mouseenter: "_tabShowThumbnail" });
		inst._on(inst.tabs, { mouseleave: "_tabHideThumbnail" });
		inst._on(thumb.frame, { mouseenter: "_hoverThumbnail" });
		inst._on(thumb.frame, { mouseleave: "_hoverThumbnail" });
		inst._on(thumbBox, { click: "_clickThumbnail" });
		thumb.thumbnail.on("mousedown selectstart", false); // prevent text select
	},

	_tabShowThumbnail: function (e) {
		var inst = this,
			tab = $(e.currentTarget),
			thumb = extraData.thumb,
			thumbWidth, pos, thumbRightLimit, arrowLeft, panel;
		if (tab[0] === inst.active[0]) {
			return;
		}
		thumbWidth = thumb.frame.outerWidth();
		arrowLeft = thumbWidth / 2;
		thumbRightLimit = inst.element.outerWidth() - thumbWidth;
		pos = tab.position(); // this.element is relatively-positioned, so use .position(), not .offset()
		pos.top += tab.outerHeight();
		pos.left += (tab.outerWidth() - thumbWidth) / 2; // center thumbnail horizontally relative to a tab
		if (pos.left < 0) { // ... but prevent it from showing outside the container (i.e. this.element)
			arrowLeft = Math.max(arrowLeft + pos.left, 15);
			pos.left = 0;
		} else if (pos.left > thumbRightLimit) {
			arrowLeft = Math.min(arrowLeft + pos.left - thumbRightLimit, thumbWidth - 15);
			pos.left = thumbRightLimit;
		}
		thumb.arrow.css("left", arrowLeft + "px");
		panel = inst._getPanelForTab(tab);
		inst._emptyThumbnail();
		if (thumb.frame.is(":visible")) { // thumbnail is visible when mouse pointer moves from one tab to another
			panel.appendTo(thumb.thumbnail).show();
			thumb.frame.stop().animate(
				{ left: pos.left + "px", top: pos.top + "px" },
				// create a separate queue to translate thumbnail
				// (this allows stopping the fade effect without affecting translation)
				{ queue: "thumbMove" }
			).dequeue("thumbMove").fadeTo("_default", 1);
		} else {
			if (thumb.tid) {
				clearTimeout(thumb.tid);
			}
			thumb.tid = setTimeout(function () {
				panel.appendTo(thumb.thumbnail).show();
				thumb.frame.stop().css({
					left: pos.left + "px",
					top: pos.top + "px"
				}).fadeIn();
				thumb.tid = null;
			}, inst.options.thumbDelay);
		}
	},

	_tabHideThumbnail: function () {
		var inst = this,
			thumb = extraData.thumb;
		if (thumb.tid) {
			clearTimeout(thumb.tid);
			thumb.tid = null;
		} else {
			thumb.frame.stop("fx").fadeOut(function () {
				inst._emptyThumbnail();
			});
		}
	},

	_clickThumbnail: function () {
		var inst = this, panel;
		extraData.thumb.frame.hide();
		panel = this._emptyThumbnail();
		inst.option("active", inst._getTabForPanel(panel).index());
		return false; // prevent hyperlinking within the thumbnail
	},

	_hoverThumbnail: function (e) {
		if (e.type == "mouseenter") {
			// stop effects in fx queue only (thumbnail may proceed with moving in its custom queue "thumbMove")
			extraData.thumb.frame.stop("fx").fadeTo("fast", 1);
		} else {
			this._tabHideThumbnail();
		}
	},

	_emptyThumbnail: function () {
		var panel = extraData.thumb.thumbnail.children(".ui-tabs-panel");
		if (nonempty(panel)) {
			panel.appendTo(this.element);
			if (this.active.attr("aria-labelledby") != panel.attr("aria-labelledby")) {
				panel.hide(); // hide panel if the thumbnail is for tab which is not currently active
			}
		}
		return panel;
	},

	_thumbBeforeActivate: function () {
		var inst = this,
			thumb = extraData.thumb;
		return function () {
			var ret = ($.isFunction(thumb.beforeActivate)) ? thumb.beforeActivate.apply(this, arguments) : true;
			if (ret !== false) {
				thumb.frame.hide();
				inst._emptyThumbnail();
			}
			return ret;
		};
	},

	_thumbCleanup: function () {
		var inst = this,
			thumb = extraData.thumb;
		inst._off(inst.tabs, "mouseenter mouseleave");
		if (thumb.tid) {
			clearTimeout(thumb.tid);
		}
		if (nonempty(thumb.frame)) {
			thumb.frame.remove();
		}
		inst.options.beforeActivate = thumb.beforeActivate; // required even if thumb.beforeActivate == null
		thumb.tid = thumb.frame = thumb.beforeActivate = null;
	},


	/**
	 * Tabs scroll processing
	 */

	_initScroll: function () {
		this._createBtns();
		this._wrapTabs();
	},

	_createBtns: function () {
		var inst = this,
			scroll = extraData.scroll,
			prefix = fn + "-scroll";
		scroll.btns = $("." + prefix + "-btns", inst.element); // first try to find buttons in user's markup
		if (!nonempty(scroll.btns)) { // if nothing found, create default buttons dynamically
			scroll.btns = $( // @TODO: too much markup in scripting
				"<ul class='" + prefix + "-btns ui-corner-right'>" +
					"<li class='ui-state-default ui-corner-all " + prefix + "-left'>" +
						"<span class='ui-icon ui-icon-triangle-1-w'></span>" +
					"</li>" +
					"<li class='ui-state-default ui-corner-all " + prefix + "-right'>" +
						"<span class='ui-icon ui-icon-triangle-1-e'></span>" +
					"</li>" +
				"</ul>"
			).prependTo(inst.element);
		}
		scroll.btns.on("mousedown mouseup", "li", function (e) {
			inst._scrollTabs(e.type == "mouseup", $(this).hasClass(prefix + "-left"));
		})
		.on("mouseenter mouseleave", "li", function (e) {
			$(this).toggleClass("ui-state-hover", e.type == "mouseenter");
			if (scroll.tid) {
				inst._scrollTabs(true);
			}
		});
		// @TODO: scroll tabs on mouse wheel?
	},

	_wrapTabs: function () {
		var inst = this,
			tablist = inst.tablist,
			totalTabsWidth = 0,
			scroll = extraData.scroll;
		inst.tabs.each(function () {
			totalTabsWidth += $(this).outerWidth(true);
		});
		tablist.wrap("<div class='" + fn + "-nav-wrapper'></div>");
		scroll.wrapper = tablist.parent();
		if (tablist.width() < totalTabsWidth) {
			scroll._origWidth = tablist[0].style.width; // store original width from the style attribute (or an empty string)
			tablist.width(totalTabsWidth + scroll.btns.outerWidth());
			scroll.btns.show();
		}
		inst._makeActiveVisible();
		inst._on(inst.element, { extratabsactivate: "_makeActiveVisible" });
	},

	_scrollTabs: function (stop, toLeft) {
		var scroll = extraData.scroll,
			scrollDelta = (toLeft) ? -10 : 10;
		if (stop) {
			clearInterval(scroll.tid);
			scroll.tid = null;
		} else if (!scroll.tid) {
			scroll.tid = setInterval(function () {
				scroll.wrapper[0].scrollLeft += scrollDelta;
			}, 50);
		}
	},

	_makeActiveVisible: function () {
		var scroll = extraData.scroll,
			tabLeft = this.active.position().left,
			offset = (tabLeft < 0) ? tabLeft : tabLeft + this.active.outerWidth(true) - scroll.btns.position().left;
		if (tabLeft < 0 || offset > 0) {
			scroll.wrapper[0].scrollLeft += offset;
		}
	},

	_scrollCleanup: function () {
		var inst = this,
			scroll = extraData.scroll;
		inst._off(inst.element, "extratabsactivate"); // BE SURE THAT NO OTHER OPTIONS REGISTER HANDLERS OF THIS EVENT
		if (scroll.tid) {
			clearInterval(scroll.tid);
		}
		if (nonempty(scroll.btns)) {
			scroll.btns.remove();
		}
		if (nonempty(scroll.wrapper)) {
			this.tablist.unwrap();
		}
		if (scroll._origWidth !== null) {
			this.tablist[0].style.width = scroll._origWidth;
		}
		scroll.tid = scroll.btns = scroll.wrapper = scroll._origWidth = null;
	},


	/**
	 * Multiline tabs processing
	 * NOTE that multiline tabs are incompatible with fluid tabs layout
	 * Use the "multiline" option for fixed width containers only
	 */

	_initMultiline: function () {
		var inst = this;
		inst.tablist.addClass(fn + "-multiline");
		if (!inst.options.rowHeight) {
			inst.options.rowHeight = inst.tabs.outerHeight();
		}
		// delay is required to ensure the styles of .ui-extratabs-multiline have time to take effect
		setTimeout(function () { inst._collectRows(); }, 0);
		inst._on(inst.element, { extratabsactivate: "_activateMultiline" });
	},

	_collectRows: function () {
		var tabs = this.tabs,
			tabLast = tabs.eq(-1),
			top = tabLast.offset().top,
			height = tabLast.outerHeight(),
			getRowIndex = function (tab) {
				return Math.round((top - tab.offset().top) / height);
			},
			tabRows = extraData.multiline.tabRows = new Array(getRowIndex(tabs.eq(0)) + 1),
			dataKey = fn + "-row";
		tabs.each(function () {
			var tab = this,
				$tab = $(tab),
				rowIndex = getRowIndex($tab);
			$tab.data(dataKey, rowIndex);
			if (tabRows[rowIndex]) {
				tabRows[rowIndex].push(tab);
			} else {
				tabRows[rowIndex] = [tab];
			}
		});
		this._activateMultiline();
	},

	_removeRowClasses: function () {
		var re = new RegExp("\\s*" + fn + "\\-(?:shift|row)\\-{1,2}\\d+\\s*");
		this.tabs.attr("class", function () {
			return $.trim(this.className.split(re).join(" "));
		});
	},

	_activateMultiline: function () {
		var inst = this,
			tabRows = extraData.multiline.tabRows,
			rowIndex, tabs, tabs0;
		if (inst.active.hasClass(fn + "-row-0")) {
			return; // do nothing when switch between tabs in the first (bottommost) row
		}
		rowIndex = inst.active.data(fn + "-row");
		tabs = $(tabRows[rowIndex]);
		tabs0 = $(tabRows[0]);
		inst._removeRowClasses();
		tabs.addClass(fn + "-shift-" + rowIndex + " " + fn + "-row-0");
		tabs0.addClass(fn + "-shift--" + rowIndex + " " + fn + "-row-" + rowIndex);
		inst.tabs.not(tabs.add(tabs0)).attr("class", function (i, cn) {
			return cn + " " + fn + "-row-" + $(this).data(fn + "-row");
		});
	},

	_multilineCleanup: function () {
		var inst = this;
		inst._off(inst.element, "extratabsactivate"); // BE SURE THAT NO OTHER OPTIONS REGISTER HANDLERS OF THIS EVENT
		inst._removeRowClasses();
		inst.tabs.removeData(fn + "-row");
	},

	/**
	 * Auxiliary & service routines
	 */

	_getTabForPanel: function(panel) {
		var id = $(panel).attr("aria-labelledby");
		return this.element.find(this._sanitizeSelector("#" + id)).closest("li");
	}

});

})(jQuery);