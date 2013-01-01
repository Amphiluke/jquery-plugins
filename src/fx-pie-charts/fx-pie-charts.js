/*!
 * fx-pie-charts.js
 * JavaScript module for pie charts plotting
 *
 * The module may work both as a standalone script and as a jQuery plugin. It automatically detects whether
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
 *   width      - the desired width of the chart. Default to container's client width
 *   height     - the desired height of the chart. Default to container's client height
 *
 * When used as a jQuery plugin, the "fxPieChart" method may take a function as an argument. This function
 * will be called for each element in the matched set. It receives the current element as the only argument
 * (you may use "this" keyword instead) and should return the object to use as the "params" argument for the
 * current element.
 */

(function ($) {

"use strict";

/**
 * Implementation
 */

var doc = document,
	hasVML = doc.namespaces && doc.namespaces.add,
	hasCanvas = "getContext" in doc.createElement("canvas"),
	drawChart = (hasCanvas) ? drawCanvasChart : drawVMLChart,

	// "constants"
	DEG2RAD = Math.PI / 180,
	DEF_COLORS = ["#000000", "#800000", "#008000", "#000080", "#C0C0C0", "#FF0000", "#00FF00", "#0000FF",
		"#808080", "#800080", "#808000", "#008080", "#FFFFFF", "#FF00FF", "#FFFF00", "#00FFFF", "#FFA500"];

if (!(hasVML || hasCanvas)) {
	return;
}

if (hasVML) {
	doc.namespaces.add("vml", "urn:schemas-microsoft-com:vml");
	doc.createStyleSheet().cssText = "vml\\:group, vml\\:shape " +
		"{ behavior:url(#default#VML); position:absolute; }";
}

function calcAngles(data) {
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
}

function drawCanvasChart(params) {
	var container = (typeof params.container == "string") ? doc.getElementById(params.container) : params.container,
		chartWidth = params.width || container.clientWidth,
		chartHeight = params.height || container.clientHeight,
		rx = chartWidth / 2,
		ry = chartHeight / 2,
		colors = params.colors || DEF_COLORS,
		colorCount = colors.length,
		angles = calcAngles(params.data || container.getAttribute("data-fx-chart").split(/\s*,\s*/)),
		startAngle = -90 * DEG2RAD,
		canvas = doc.createElement("canvas"),
		ctx = canvas.getContext("2d"),
		style = canvas.style;
	canvas.width = chartWidth;
	canvas.height = chartHeight;
	style.width = chartWidth + "px";
	style.height = chartHeight + "px";
	style.position = "absolute";
	for (var i = 0, len = angles.length; i < len; i++) {
		ctx.beginPath();
		ctx.moveTo(rx, ry);
		ctx.fillStyle = colors[i % colorCount];
		ctx.arc(rx, ry, rx, startAngle, (startAngle -= angles[i] * DEG2RAD), true);
		ctx.fill();
	}
	container.appendChild(canvas);
}

function drawVMLChart(params) {
	var container = (typeof params.container == "string") ? doc.getElementById(params.container) : params.container,
		chartWidth = params.width || container.clientWidth,
		chartHeight = params.height || container.clientHeight,
		rx = chartWidth >> 1,
		ry = chartHeight >> 1,
		colors = params.colors || DEF_COLORS,
		colorCount = colors.length,
		angles = calcAngles(params.data || container.getAttribute("data-fx-chart").split(/\s*,\s*/)),
		startAngle = 90,
		group = doc.createElement("vml:group"),
		shape,
		pathPiece = "m " + rx + " " + ry + " ae " + rx + " " + ry + " " + rx + " " + ry + " ",
		setStyles = function (elem) {
			var style = elem.style;
			style.width = chartWidth + "px";
			style.height = chartHeight + "px";
		};
	setStyles(group);
	group.setAttribute("coordsize", chartWidth + " " + chartHeight);
	for (var i = 0, len = angles.length; i < len; i++) {
		shape = group.appendChild(doc.createElement("vml:shape"));
		setStyles(shape);
		shape.setAttribute("fillcolor", colors[i % colorCount]);
		shape.setAttribute("stroked", "false");
		shape.setAttribute("path", pathPiece + Math.round(startAngle * 65535) + " " + Math.round(angles[i] * 65535) + " x e");
		startAngle += angles[i];
	}
	container.appendChild(group);
}


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
			drawChart(getParams(this));
		});
	};
} else {
	window.fxPieChart = drawChart;
}

})(window.jQuery);