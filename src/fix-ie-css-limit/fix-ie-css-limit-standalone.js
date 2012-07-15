/*!
 * fix-ie-css-limit.js by Amphiluke, 2012 (c)
 * Script to fix IE limitation on style sheet number (31 as a maximum)
 * [standalone version: no jQuery required]
 *
 * https://github.com/Amphiluke/jquery-plugins/tree/master/src/fix-ie-css-limit
 * http://diapeira.1gb.ru/diapeira/other/fix-ie-css-limit.html
 *
 * Attach the script in the HEAD section of the document after all the LINK tags
 */

/*@cc_on

(function () {

    if (document.styleSheets.length < 31) return;

    var links,
        paths = [],
        importsPerStyle = 15, // a number of @import directives per one CSS file
        tmpA = document.createElement("a"),
        sheet, i, len, media, href, remain, allLinks;

    if (typeof document.querySelectorAll == "function") { // IE 9+
        links = Array.prototype.slice.call(document.querySelectorAll("link[rel='stylesheet']"));
    } else { // IE <9
        links = [];
        allLinks = document.getElementsByTagName("link");
        for (i = 0, len = allLinks.length; i < len; i++) {
            if (allLinks[i].rel.toLowerCase() == "stylesheet") {
                links.push(allLinks[i]);
            }
        }
    }
    len = links.length;
    for (i = 0; i < len; i++) {
        href = links[i].href || "";
        media = links[i].media || "";
        if (href && media.indexOf("print") == -1) {
             // workaround for obtaining an absolute URL (independent of where the @import directive will be placed)
            tmpA.href = href;
            paths.push(tmpA.href);
        }
    }
    remain = Math.ceil(paths.length / importsPerStyle);
    for (i = 0; i < len; i++) {
        if (i < remain) {
            sheet = links[i].styleSheet;
            if (sheet && sheet.cssText != "") {
                sheet.cssText = "";
            }
        } else {
            links[i].parentNode.removeChild(links[i]);
        }
    }
    links.splice(remain);
    for (i = 0, len = paths.length; i < len; i++) {
        links[Math.floor(i / importsPerStyle)].styleSheet.addImport(paths[i]);
    }

})();

@*/