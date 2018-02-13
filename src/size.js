import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { min, max } from "d3-array";

import state from "./state";
import data from "./data";

import { is_mobile } from "./update_graphic";
import { svg, plot, viz_ui } from "./create_dom";

var w, h, x, y, y_max_score, y_min_score;

function updateSizesAndScales(current_position, max_rank) {
	var window_height = Flourish.fixed_height ? window.innerHeight : Math.max(500, window.innerHeight); //Setting min 500 for iOS bug
	var svg_height = window_height - viz_ui.node().getBoundingClientRect().height; 

	svg.attr("width", window.innerWidth).attr("height", svg_height);
	svg.style("background-color", state.bg_color);
	plot.attr("transform", "translate(" + state.margin_left + "," + state.margin_top + ")");
	var margin_right = !is_mobile ? state.margin_right : state.end_circle_r;
	var margin_bottom = Math.max(Math.max(state.end_circle_r + 2,state.start_circle_r), state.margin_bottom)

	w = Math.max(0, window.innerWidth - state.margin_left - margin_right);
	h = Math.max(0, svg_height - state.margin_top - margin_bottom);
	x = scaleLinear().range([0, w]).domain([0, data.horserace.column_names.stages.length - 1]);

	var y_domain;
	if (state.value_type == "ranks") y_domain = [state.y_axis_max_rank || max_rank, state.y_axis_min_rank || 1];
	else {
		y_max_score = max(data.horserace, function(d) { return max(d.stages, function(v) { return +v; }); }),
		y_min_score = min(data.horserace, function(d) { return min(d.stages, function(v) { return +v; }); });

		if (state.y_axis_min !== "" && state.y_axis_min !== null) y_min_score = state.y_axis_min;
		if (state.y_axis_max !== "" && state.y_axis_max !== null) y_max_score = state.y_axis_max;
		if (state.higher_scores_win) y_domain = [y_min_score, y_max_score];
		else y_domain = [y_max_score, y_min_score];
	}
	y = scaleLinear().range([h, 0]).domain(y_domain);

	select("#clip rect")
		.attr("transform", "translate(0,-" + state.margin_top + ")")
		.attr("height", h + state.margin_top + margin_bottom)
		.attr("width", x(current_position) + state.margin_left)
		.attr("x", -state.margin_left);
}

export { updateSizesAndScales, w, h, x, y, y_max_score, y_min_score };
