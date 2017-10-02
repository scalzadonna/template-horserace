import { select, event } from "d3-selection";
import { axisLeft, axisTop } from "d3-axis";

import state from "./state";
import data from "./data";
import update from "./update";

var highlighted_stage;

function updateXAxis(x, w) {
	var xAxis = axisTop(x).tickFormat(function(d) {
		return data.horserace.column_names.stages[d] || "";
	});

	select(".x.axis").call(xAxis)
		.selectAll(".tick")
		.each(function() {
			var tick = select(this);
			tick.selectAll("rect").remove();

			tick.insert("rect", "text")
				.attr("class", "text-hitarea")
				.attr("x", 0).attr("y", -65)
				.attr("fill", state.bg_color)
				.attr("opacity", 0.1)
				.attr("height", 65)
				.attr("width", function() {
					return this.parentNode.getBoundingClientRect().width;
				});

			tick.insert("rect", "text")
				.attr("class", "text-outline")
				.attr("height", "20px")
				.attr("width", function(d) {
					return this.parentNode.querySelector("text").getComputedTextLength() + 10;
				})
				.attr("x", "21px").attr("y", "-32px")
				.attr("transform", "rotate(-45)")
				.attr("rx", "10px")
				.attr("stroke", "#ccc")
				.attr("stroke-width", "2px")
				.style("display", function(d) {
					return highlighted_stage == d ? "block" : "none";
				});
		})
		.on("mouseenter", function(d) {
			select(this).select(".text-outline").style("display", "inherit");
			highlighted_stage = d;
			select(".highlight-line")
				.style("display", "inherit")
				.attr("transform", "translate(" + x(d) + ",0)");
		})
		.on("mouseleave", function() {
			highlighted_stage = null;
			select(this).select(".text-outline").style("display", "none");
			select(".highlight-line").style("display", "none");
		})
		.on("click",function(d) {
			event.stopPropagation();
			state.target_position = d + 1;
			update();
		})
		.selectAll("text")
		.style("text-anchor", "start")
		.attr("dx", "2.3em")
		.attr("dy", "-0.9em")
		.attr("transform", "rotate(-45)");
}

function updateYAxis(y, w, duration) {
	var yAxis = axisLeft(y)
		.tickSize(-w)
		.tickFormat(function(d) {return d + state.y_axis_tick_suffix})
		.tickPadding(10);

	if (state.value_type == "ranks") {
		yAxis.ticks(data.horserace.length).tickFormat(function(d) {return d + ""});
	}

	select(".y.axis").transition().duration(duration).call(yAxis);
}

function updateAxes(x, y, w, duration) {
	updateXAxis(x);
	updateYAxis(y, w, duration);
}

export { updateAxes };
