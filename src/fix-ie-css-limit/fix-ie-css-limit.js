/*!
 * fix-ie-css-limit.js by Amphiluke, 2012-2016 (c)
 * Script to fix IE limitation on style sheet number (31 as a maximum)
 *
 * https://github.com/Amphiluke/jquery-plugins/tree/master/src/fix-ie-css-limit
 * http://amphiluke.github.io/pure-js/fix-ie-css-limit/
 *
 * Attach the script in the HEAD section of the document after all the LINK tags
 */

/*@cc_on

(function ($) {

	@if (@_jscript_version >= 10) return; @end
	if (document.styleSheets.length < ($.cssFixCountIE || 31)) return;
	var tmpA = document.createElement("a"),
		links = $("link[rel='stylesheet']"),
		paths = links.map(function () {
			var mediaAttr = this.getAttribute("media");
			if (!mediaAttr || (mediaAttr.indexOf("print") == -1)) {
				tmpA.href = this.href; // workaround for obtaining an absolute URL (independent of where the @import directive will be placed)
				return tmpA.href;
			}
		}).get(),
		len = paths.length,
		importsPerStyle = 15; // a number of @import directives per one CSS file
	links.slice(Math.ceil(len / importsPerStyle)).remove();
	links = $("link[rel='stylesheet']");
	links.each(function () {
		try {
			if (this.styleSheet && this.styleSheet.cssText != "") {
				this.styleSheet.cssText = "";
			}
		} catch (e) {
			// exceptions may be rarely thrown, e.g. when a stylesheet uses
			// non-typical referencing method (like data:uri)
		}
	});
	for (var i = 0; i < len; i++) {
		links[Math.floor(i / importsPerStyle)].styleSheet.addImport(paths[i]);
	}

})(jQuery);

@*/