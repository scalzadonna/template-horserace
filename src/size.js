import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { min, max } from "d3-array";

import state from "./state";
import data from "./data";

import { svg, plot } from "./create_dom";

var w, h, x, y;

function updateSizesAndScales(current_position) {
	svg.attr("width", window.innerWidth).attr("height", window.innerHeight);
	svg.style("background-color", state.bg_color);
	plot.attr("transform", "translate(" + state.margin_left + "," + state.margin_top + ")");

	w = Math.max(0, window.innerWidth - state.margin_left - state.margin_right);
	h = Math.max(0, window.innerHeight - state.margin_top - state.margin_bottom);
	x = scaleLinear().range([0, w]).domain([0, data.horserace.column_names.stages.length - 1]);

	var y_domain;
	if (state.ranks_view) y_domain = [data.horserace.length, 1];
	else {
		var y_max_score = max(data.horserace, function(d) { return max(d.stages, function(v) { return +v; }); }),
		    y_min_score = min(data.horserace, function(d) { return min(d.stages, function(v) { return +v; }); });

		if (state.y_axis_min) y_min_score = state.y_axis_min;
		if (state.higher_scores_win) y_domain = [y_min_score, y_max_score];
		else y_domain = [y_max_score, y_min_score]
	}
	y = scaleLinear().range([h, 0]).domain(y_domain);

	select(".highlight-line line").attr("y2", h);
	select("#clip rect")
		.attr("transform", "translate(0,-" + state.margin_top + ")")
		.attr("height", h + state.margin_top + state.margin_bottom)
		.attr("width", x(current_position) + state.margin_left)
		.attr("x", -state.margin_left);
}

export { updateSizesAndScales, w, h, x, y };