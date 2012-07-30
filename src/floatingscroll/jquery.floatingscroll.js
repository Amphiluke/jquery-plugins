/*!
 * jQuery floatingscroll Plugin 1.1.2
 * supported by jQuery v1.3+
 *
 * https://github.com/Amphiluke/jquery-plugins/tree/master/src/floatingscroll
 * http://diapeira.1gb.ru/diapeira/jquery-plugins/floatingscroll.html
 *
 * Copyright (c) 2011-2012 Amphiluke
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
;(function ($) {

    var scrlEl = document.documentElement,
        getWorkHeight = function () { return scrlEl.clientHeight; };
    (function () {
        // jQuery v1.3 is the earliest jQuery version this plugin is supported by
        var webkit = ($.fn.jquery >= "1.4") ? $.browser.webkit : /(webkit)[ \/]([\w.]+)/i.exec(navigator.userAgent);
        if (webkit) {
            // WebKit browsers do not update the scrollTop property on documentElement object, so use body instead
            $(document).ready(function () { scrlEl = document.body; });
            getWorkHeight = function () { return window.innerHeight; };
        }
    })();

    function FScroll(cont) {
        var inst = this;
        inst.cont = { block: cont[0], left: 0, top: 0, bottom: 0, height: 0, width: 0 };
        inst.sbar = inst.initScroll();
        inst.resetBoundaries();
        inst.visible = true;
        inst.winScrollHandler(); // hide floating scrolls for containers which are out of sight
        $(window).bind("scroll", function () { inst.winScrollHandler(); });
        inst.sbar.bind("scroll", function () { inst.sbarScrollHandler(this); });
        cont.bind("scroll", function () { inst.contScrollHandler(this); });
    }

    $.extend(FScroll.prototype, {

        initScroll: function () {
            var flscroll = $("<div/>");
            flscroll.attr("class", "fl-scrolls");
            $("<div/>").appendTo(flscroll).css({ width: this.cont.block.scrollWidth + "px" });
            $(document.body).append(flscroll);
            return flscroll;
        },

        winScrollHandler: function () {
            var inst = this,
                maxVisibleY = getWorkHeight() + scrlEl.scrollTop,
                mustHide = ((inst.cont.bottom - maxVisibleY <= 0) || (inst.cont.top - maxVisibleY > 0));
            if (inst.visible == mustHide) {
                inst.visible = !inst.visible;
                // we cannot simply hide a floating scroll bar since its scrollLeft property will not update in that case
                inst.sbar.toggleClass("fl-scrolls-hidden");
            }
        },

        sbarScrollHandler: function (sender) {
            this.cont.block.scrollLeft = sender.scrollLeft;
        },

        contScrollHandler: function (sender) {
            this.sbar[0].scrollLeft = sender.scrollLeft;
        },

        // trigger the "adjustScroll" event to call this method and recalculate scroll width and container boundaries
        resetBoundaries: function () {
            var inst = this,
                cont = $(inst.cont.block),
                pos = cont.offset();
            inst.cont.height = cont.outerHeight();
            inst.cont.width = cont.outerWidth();
            inst.cont.left = pos.left;
            inst.cont.top = pos.top;
            inst.cont.bottom = pos.top + inst.cont.height;
            inst.sbar.width(inst.cont.width).css("left", pos.left + "px");
            $("div", inst.sbar).width(cont[0].scrollWidth);
        }

    });

    $.fn.attachScroll = function () {
        var $this = this;
        // IE 6 is not supported owing to its lack of position:fixed support
        /*@cc_on if (@_jscript_version <= 5.7 && !window.XMLHttpRequest) return this; @*/
        $(window).resize(function () { $this.trigger("adjustScroll"); });
        return $this.each(function () {
            var elem = $(this),
                inst = new FScroll(elem);
            elem.bind("adjustScroll", function () { inst.resetBoundaries(); });
        });
    };

})(jQuery);