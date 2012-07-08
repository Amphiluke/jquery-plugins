/*!
 * jQuery floatingscroll Plugin 1.0.1
 * supported by jQuery v1.3+
 *
 * http://plugins.jquery.com/project/floatingscroll
 * http://diapeira.1gb.ru/diapeira/jquery-plugins/floatingscroll.html
 *
 * Copyright (c) 2011-2012 Amphiluke
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
;(function($) {

    function FScroll(cont) {
        this.cont = { block:cont[0], left:0, top:0, bottom:0, height:0, width:0 };
        this.sbar = this.initScroll();
        this.resetBoundaries();
        this.visible = true;
        this.winScrollHandler(); // hide floating scrolls for containers which are out of sight
        $(window).bind("scroll", (function(inst) { return function() { inst.winScrollHandler(); }; })(this));
        this.sbar.bind("scroll", (function(inst) { return function() { inst.sbarScrollHandler(this); }; })(this));
        cont.bind("scroll", (function(inst) { return function() { inst.contScrollHandler(this); }; })(this));
    }

    // jQuery v1.3 is the earliest jQuery version this plugin is supported by
    FScroll.WEBKIT = ($.fn.jquery >= "1.4") ? $.browser.webkit : /(webkit)[ \/]([\w.]+)/i .exec(navigator.userAgent);
    FScroll.SCRL_EL = document.documentElement;
    FScroll.getWorkHeight = (FScroll.WEBKIT) ? function() { return window.innerHeight; } :
        function() { return FScroll.SCRL_EL.clientHeight };

    FScroll.prototype.initScroll = function() {
        var flscroll = $(document.createElement("div"));
        flscroll.attr("class", "fl-scrolls");
        $(document.createElement("div")).appendTo(flscroll).css({ "width": this.cont.block.scrollWidth + "px" });
        $(document.body).append(flscroll);
        return flscroll;
    };

    FScroll.prototype.winScrollHandler = function() {
        var maxVisibleY = FScroll.getWorkHeight() + FScroll.SCRL_EL.scrollTop,
            mustHide = ((this.cont.bottom - maxVisibleY <= 0) || (this.cont.top - maxVisibleY > 0));
        if (!(this.visible ^ mustHide)) {
            this.visible = !this.visible;
            // we cannot simply hide a floating scroll bar since its scrollLeft property will not update in that case
            this.sbar.toggleClass("fl-scrolls-hidden");
        }
    };

    FScroll.prototype.sbarScrollHandler = function(sender) {
        if (this.visible) this.cont.block.scrollLeft = sender.scrollLeft;
    };

    FScroll.prototype.contScrollHandler = function(sender) {
        if (!this.visible) this.sbar[0].scrollLeft = sender.scrollLeft;
    };

    // trigger the "adjustScroll" event to call this method and recalculate scroll width and container boundaries
    FScroll.prototype.resetBoundaries = function() {
        var cont = $(this.cont.block),
            pos  = cont.offset();
        this.cont.height = cont.outerHeight();
        this.cont.width  = cont.outerWidth();
        this.cont.left   = pos.left;
        this.cont.top    = pos.top;
        this.cont.bottom = pos.top + this.cont.height;
        this.sbar.width(this.cont.width).css("left", pos.left + "px");
        $("div", this.sbar).width(cont[0].scrollWidth);
    };

    $.fn.attachScroll = function() {
        var $this = this;
        $(window).resize(function() { $this.trigger("adjustScroll"); });
        return $this.each(function() {
            $(this).bind("adjustScroll",
                (function(inst) { return function() { inst.resetBoundaries(); }; })(new FScroll($(this))));
        });
    };

    $(document).ready(function() {
        // WebKit browsers do not update the scrollTop property on documentElement object, so use body instead
        if (FScroll.WEBKIT) FScroll.SCRL_EL = document.body;
    });

})(jQuery);