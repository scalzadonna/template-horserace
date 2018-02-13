import { select, selectAll } from "d3-selection";
import { axisLeft, axisTop } from "d3-axis";

import { y_min_score, y_max_score, w } from "./size";
import state from "./state";
import data from "./data";
import update from "./update";

var highlighted_stage;

function updateXAxis(x) {
	var xAxis = axisTop(x).tickFormat(function(d) {
		return data.horserace.column_names.stages[d] || "";
	});

	var min_space = 45;
	var max_ticks = Math.floor(w / min_space);

	select(".x.axis").call(xAxis)
		.selectAll(".tick")
		.each(function() {
			var tick = select(this);
		})
		.selectAll("text")
		.style("text-anchor", "start")
		.attr("dx", "2.3em")
		.attr("dy", "-0.9em")
		.attr("transform", "rotate(-45)");

	if (selectAll(".x.axis .tick").size() > max_ticks) {
		xAxis.ticks(max_ticks);
		select(".x.axis").call(xAxis)
			.selectAll("text")
			.style("text-anchor", "start")
			.attr("dx", "2.3em")
			.attr("dy", "-0.9em")
			.attr("transform", "rotate(-45)");
	}
}

function updateYAxis(y, w, duration) {
	var yAxis = axisLeft(y)
		.tickSize(-w)
		.tickFormat(function(d) { return state.y_axis_tick_prefix + d + state.y_axis_tick_suffix; })
		.tickPadding(10);

	if (state.value_type == "ranks") {
		yAxis.ticks(data.horserace.length).tickFormat(function(d) { return d % 1 == 0 ? d : ""; });
	}

	select(".y.axis").transition().duration(duration).call(yAxis);

	if (state.value_type == "scores" && state.y_axis_rounding) {
		if (selectAll(".y.axis .tick").size() > y_max_score - y_min_score) {
			yAxis.ticks(y_max_score - y_min_score);
			select(".y.axis").call(yAxis);
		}
	}
}

function updateAxes(x, y, w, duration) {
	updateXAxis(x);
	updateYAxis(y, w, duration);
}

export { updateAxes };
