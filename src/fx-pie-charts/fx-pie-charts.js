/*!
 * fx-pie-charts.js by Amphiluke, 2013 (c)
 * JavaScript module for pie charts plotting
 *
 * https://github.com/Amphiluke/jquery-plugins/tree/master/src/fx-pie-charts
 *
 * The script may work both as a standalone module and as a jQuery plugin. It automatically detects whether
 * jQuery is available and registers the "fxPieChart" method either in $.fn or in global namespace.
 *
 * Using the module in jQuery environment:
 *   a. $(selector).fxPieChart(params);
 *   b. $(selector).fxPieChart(function (Element) {});
 * Using the module as a standalone script
 *   a. fxPieChart(params);
 *
 * The allowed properties of the "params" object are:
 *   data       - [required if no "data-fx-chart" attribute is specified] an array of values to be used as
 *                the chart construction data. If the "data-fx-chart" attribute is defined for the target
 *                element then the attribute value may be used as the "data" property value. The format of the
 *                "data-fx-chart" attribute is a comma-separated list of values
 *                (e.g. <div data-fx-chart="12.2,44.5,18,8"></div> means that params.data will be [12.2, 44.5, 18, 8])
 *   container  - [required in standalone mode] either a target DOM element the chart inserted into
 *                or a string (interpreted as id attribute of the target element). In case of jQuery
 *                environment the matched elements are used as containers if this property is not specified
 *   colors     - an array of CSS-formatted colors to be used to fill chart pies
 *   outline    - color of the chart's outline. If this parameter is not specified, then no outline is drawn
 *   width      - the desired width of the chart. Default to container's client width
 *   height     - the desired height of the chart. Default to container's client height
 *   handlers   - an object which maps DOM event types (object keys) into event handlers (object values).
 *                A handler is called for a pie the event is initialized by. The target pie's zero-based index
 *                is passed into the user-defined handler as an additional argument together with Event object
 *
 * When used as a jQuery plugin, the "fxPieChart" method may take a function as the argument. This function
 * will be called for each element in the matched set. It receives the current element as the only argument
 * (you may use "this" keyword instead) and should return the object to use as the "params" argument for the
 * current element.
 */

(function ($) {

"use strict";

/**
 * Implementation
 */

var DEG2RAD = Math.PI / 180,
	DEF_COLORS = [
		"#F0F8FF","#FAEBD7","#00FFFF","#7FFFD4","#F0FFFF","#F5F5DC","#FFE4C4","#000000","#FFEBCD","#0000FF",
		"#8A2BE2","#A52A2A","#DEB887","#5F9EA0","#7FFF00","#D2691E","#FF7F50","#6495ED","#FFF8DC","#DC143C",
		"#00FFFF","#00008B","#008B8B","#B8860B","#A9A9A9","#006400","#BDB76B","#8B008B","#556B2F","#FF8C00",
		"#9932CC","#8B0000","#E9967A","#8FBC8F","#483D8B","#2F4F4F","#00CED1","#9400D3","#FF1493","#00BFFF",
		"#696969","#1E90FF","#B22222","#FFFAF0","#228B22","#FF00FF","#DCDCDC","#F8F8FF","#FFD700","#DAA520",
		"#808080","#008000","#ADFF2F","#F0FFF0","#FF69B4","#CD5C5C","#4B0082","#FFFFF0","#F0E68C","#E6E6FA",
		"#FFF0F5","#7CFC00","#FFFACD","#ADD8E6","#F08080","#E0FFFF","#FAFAD2","#D3D3D3","#90EE90","#FFB6C1",
		"#FFA07A","#20B2AA","#87CEFA","#778899","#B0C4DE","#FFFFE0","#00FF00","#32CD32","#FAF0E6","#FF00FF",
		"#800000","#66CDAA","#0000CD","#BA55D3","#9370DB","#3CB371","#7B68EE","#00FA9A","#48D1CC","#C71585",
		"#191970","#F5FFFA","#FFE4E1","#FFE4B5","#FFDEAD","#000080","#FDF5E6","#808000","#6B8E23","#FFA500",
		"#FF4500","#DA70D6","#EEE8AA","#98FB98","#AFEEEE","#DB7093","#FFEFD5","#FFDAB9","#CD853F","#FFC0CB",
		"#DDA0DD","#B0E0E6","#800080","#FF0000","#BC8F8F","#4169E1","#8B4513","#FA8072","#F4A460","#2E8B57",
		"#FFF5EE","#A0522D","#C0C0C0","#87CEEB","#6A5ACD","#708090","#FFFAFA","#00FF7F","#4682B4","#D2B48C",
		"#008080","#D8BFD8","#FF6347","#40E0D0","#EE82EE","#F5DEB3","#FFFFFF","#F5F5F5","#FFFF00","#9ACD32"
	],
	SVG_NS = "http://www.w3.org/2000/svg",

	doc = document,
	hasSVG = doc.createElementNS && doc.createElementNS(SVG_NS, "svg").createSVGRect,
	hasVML = doc.namespaces && doc.namespaces.add,
	hasCanvas = doc.createElement("canvas").getContext;

if (!(hasSVG || hasVML || hasCanvas)) {
	return;
}

var bases = {

svg: {
	init: function () {
		this.Chart.prototype = this.chartProto;
	},
	Chart: function (params) {
		var inst = this;
		inst.container = (typeof params.container == "string") ? doc.getElementById(params.container) : params.container,
		inst.chartWidth = params.width || inst.container.clientWidth,
		inst.chartHeight = params.height || inst.container.clientHeight,
		inst.colors = params.colors || DEF_COLORS,
		inst.angles = inst.getAngles(params.data || inst.container.getAttribute("data-fx-chart").split(/\s*,\s*/));
		inst.svg = inst.createCanvas();
		inst.plot(params.outline);
		inst.container.appendChild(inst.svg);
		if (params.handlers) {
			inst.addHandlers(params.handlers);
		}
	},
	chartProto: {
		createCanvas: function () {
			var inst = this,
				canvas = doc.createElementNS(SVG_NS, "svg:svg");
			inst.attr(canvas, {
				width: inst.chartWidth,
				height: inst.chartHeight,
				viewBox: "0 0 " + inst.chartWidth + " " + inst.chartHeight
			});
			return canvas;
		},
		addHandlers: function (handlers) {
			var inst = this,
				indexOf = Array.prototype.indexOf,
				addHandler = function (event) {
					inst.svg.addEventListener(event, function (e) {
						var index = indexOf.call(this.getElementsByTagNameNS(SVG_NS, "path"), e.target);
						if (index > -1) {
							handlers[event].call(e.target, e, index);
						}
					}, false);
				};
			for (var event in handlers) {
				if (handlers.hasOwnProperty(event)) {
					addHandler(event);
				}
			}
		},
		plot: function (outline) {
			var inst = this,
				rx = inst.chartWidth / 2,
				ry = inst.chartHeight / 2,
				startAngle = 0,
				colorCount = inst.colors.length,
				pathPiece = "M " + rx + " " + ry + " L ",
				path, d;
			for (var i = 0, len = inst.angles.length; i < len; i++) {
				path = inst.svg.appendChild(doc.createElementNS(SVG_NS, "path"));
				d = pathPiece + (rx - rx * Math.sin(startAngle * DEG2RAD)) + " " +
					(ry - ry * Math.cos(startAngle * DEG2RAD));
				startAngle += inst.angles[i];
				d += " A " + rx + " " + ry + " 0 " + ((inst.angles[i] > 180) ? "1" : "0") + " 0 " +
					(rx - rx * Math.sin(startAngle * DEG2RAD)) + " " +
					(ry - ry * Math.cos(startAngle * DEG2RAD)) + " Z";
				inst.attr(path, {
					fill: inst.colors[i % colorCount],
					d: d
				});
			}
			if (outline) {
				inst.attr(inst.svg.appendChild(doc.createElementNS(SVG_NS, "ellipse")), {
					cx: rx,
					cy: ry,
					rx: rx - 0.5,
					ry: ry - 0.5,
					fill: "none",
					stroke: outline
				});
			}
		}
	}
},

vml: {
	init: function () {
		doc.namespaces.add("fxpc", "urn:schemas-microsoft-com:vml");
		doc.createStyleSheet().cssText = "fxpc\\:group, fxpc\\:shape { behavior:url(#default#VML); position:absolute; }";
		this.Chart.prototype = this.chartProto;
	},
	Chart: function (params) {
		var inst = this;
		inst.container = (typeof params.container == "string") ? doc.getElementById(params.container) : params.container,
		inst.chartWidth = params.width || inst.container.clientWidth,
		inst.chartHeight = params.height || inst.container.clientHeight,
		inst.colors = params.colors || DEF_COLORS,
		inst.angles = inst.getAngles(params.data || inst.container.getAttribute("data-fx-chart").split(/\s*,\s*/)),
		inst.group = inst.createCanvas();
		inst.setStyles(inst.group);
		inst.plot(params.outline);
		inst.container.appendChild(inst.group);
		if (params.handlers) {
			inst.addHandlers(params.handlers);
		}
	},
	chartProto: {
		createCanvas: function () {
			var inst = this,
				canvas = doc.createElement("fxpc:group");
			inst.attr(canvas, { coordsize: inst.chartWidth + " " + inst.chartHeight});
			return canvas;
		},
		addHandlers:function (handlers) {
			var inst = this,
				addHandler = function (event) {
					inst.group.attachEvent("on" + event, function (e) {
						var target = e.srcElement;
						handlers[event].call(target, e, target.sourceIndex - inst.group.sourceIndex - 1);
					});
				};
			for (var event in handlers) {
				if (handlers.hasOwnProperty(event)) {
					addHandler(event);
				}
			}
		},
		plot: function (outline) {
			var inst = this,
				rx = inst.chartWidth >> 1,
				ry = inst.chartHeight >> 1,
				startAngle = 90,
				colors = inst.colors,
				colorCount = colors.length,
				shape,
				pathPiece = "m " + rx + " " + ry + " ae " + rx + " " + ry + " " + rx + " " + ry + " ";
			for (var i = 0, len = inst.angles.length; i < len; i++) {
				shape = inst.group.appendChild(doc.createElement("fxpc:shape"));
				inst.setStyles(shape);
				inst.attr(shape, {
					fillcolor: colors[i % colorCount],
					stroked: false,
					path: pathPiece + Math.round(startAngle * 65535) + " " + Math.round(inst.angles[i] * 65535) + " x e"
				});
				startAngle += inst.angles[i];
			}
			if (outline) {
				shape = inst.group.appendChild(doc.createElement("fxpc:shape"));
				inst.setStyles(shape);
				inst.attr(shape, {
					filled: false,
					stroked: true,
					strokecolor: outline,
					path: "ar 0 0 " + inst.chartWidth + " " + inst.chartHeight + " 0 " + ry + " 0 " + ry + " x e"
				});
			}
		},
		setStyles: function (elem) {
			var style = elem.style;
			style.width = this.chartWidth + "px";
			style.height = this.chartHeight + "px";
		}
	}
},

canvas: {
	init: function () {
		this.Chart.prototype = this.chartProto;
	},
	Chart: function (params) {
		var inst = this;
		inst.container = (typeof params.container == "string") ? doc.getElementById(params.container) : params.container;
		inst.chartWidth = params.width || inst.container.clientWidth;
		inst.chartHeight = params.height || inst.container.clientHeight;
		inst.angles = inst.getAngles(params.data || inst.container.getAttribute("data-fx-chart").split(/\s*,\s*/));
		inst.canvas = inst.createCanvas();
		inst.plot(inst.canvas.getContext("2d"), params.colors || DEF_COLORS, params.outline);
		inst.container.appendChild(inst.canvas);
		if (params.handlers) {
			inst.addHandlers(params.handlers);
		}
	},
	chartProto: {
		createCanvas: function () {
			var inst = this,
				canvas = doc.createElement("canvas");
			inst.attr(canvas, {
				width: inst.chartWidth,
				height: inst.chartHeight
			});
			canvas.style.width = inst.chartWidth + "px";
			canvas.style.height = inst.chartHeight + "px";
			canvas.style.position = "absolute";
			return canvas;
		},
		addHandlers: function (handlers) {
			var inst = this,
				rect = inst.canvas.getBoundingClientRect(),
				// helper canvas has each pie with unique color and is used to find a pie by coordinates
				helperCanvas = doc.body.appendChild(inst.createCanvas()),
				ctx = helperCanvas.getContext("2d"),
				getPieIndex = function (e) {
					var data = ctx.getImageData(e.pageX - rect.left, e.pageY - rect.top, 1, 1).data,
						color = "#";
					if (data[3] == 0) return -1;
					for (var i = 0; i < 3; i++) {
						color += (data[i] > 0xF) ? data[i].toString(16) : "0" + data[i].toString(16);
					}
					return DEF_COLORS.indexOf(color.toUpperCase());
				},
				addOrdinalHandler = function (event) {
					inst.canvas.addEventListener(event, function (e) {
						var index = getPieIndex(e);
						if (index > -1) {
							handlers[event].call(this, e, index);
						}
					}, false);
				},
				// In case of canvas, we cannot detect mouseover/mouseout events for pies directly.
				// Emulate these through the mousemove event of the entire canvas
				addOverOutHandler = function (event) {
					var prevIndex = -1;
					inst.canvas.addEventListener("mousemove", function (e) {
						var index = getPieIndex(e);
						if (index == prevIndex) return;
						if ((event == "mouseover" && index != -1) || (event == "mouseout" && prevIndex != -1)) {
							handlers[event].call(this, e, index);
						}
						prevIndex = index;
					}, false);
				};
			helperCanvas.style.left = helperCanvas.style.top = "-9999px";
			inst.plot(ctx, DEF_COLORS);
			for (var event in handlers) {
				if (handlers.hasOwnProperty(event)) {
					if (event == "mouseover" || event == "mouseout") {
						addOverOutHandler(event);
					} else {
						addOrdinalHandler(event);
					}
				}
			}
		},
		plot: function (ctx, colors, outline) {
			var inst = this,
				rx = inst.chartWidth / 2,
				ry = inst.chartHeight / 2,
				colorCount = colors.length,
				startAngle = -90 * DEG2RAD;
			for (var i = 0, len = inst.angles.length; i < len; i++) {
				ctx.beginPath();
				ctx.moveTo(rx, ry);
				ctx.fillStyle = colors[i % colorCount];
				ctx.arc(rx, ry, rx, startAngle, (startAngle -= inst.angles[i] * DEG2RAD), true);
				ctx.fill();
			}
			if (outline) {
				ctx.strokeStyle = outline;
				ctx.beginPath();
				ctx.moveTo(inst.chartWidth, ry);
				ctx.arc(rx, ry, rx - 0.5, 0, 360 * DEG2RAD);
				ctx.stroke();
			}
		}
	}
}

},

base = (hasSVG) ? bases.svg : ((hasVML) ? bases.vml : bases.canvas);
base.init();
base.Chart.prototype.getAngles = function (data) {
	var angles = [],
		total = 0,
		factor;
	for (var i = 0, len = data.length; i < len; i++) {
		total += +data[i];
	}
	factor = 360 / total;
	for (i = 0; i < len; i++) {
		angles.push(data[i] * factor);
	}
	return angles;
};
base.Chart.prototype.attr = function (elem, attrs) {
	for (var i in attrs) {
		if (attrs.hasOwnProperty(i)) {
			elem.setAttribute(i, attrs[i]);
		}
	}
};


/**
 * Interface
 */

// if jQuery is available, then add a method into its prototype, else make a global method
if ($) {
	$.fn.fxPieChart = function (params) {
		if (!params) params = {};
		var isCallback = (typeof params == "function"),
			getParams = function (self) {
				var result = (isCallback) ? params.call(self, self) : params;
				return (result.container) ? result : $.extend({ container: self }, result);
			};
		return this.each(function () {
			new base.Chart(getParams(this));
		});
	};
} else {
	window.fxPieChart = function (params) {
		new base.Chart(params);
	};
}

})(window.jQuery);