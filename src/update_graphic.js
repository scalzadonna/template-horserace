import "d3-transition";
import { select, selectAll } from "d3-selection";
import * as shape from "d3-shape";

import state from "./state";
import data from "./data";
import update from "./update";

import { plot, g_lines, g_labels, g_start_circles } from "./create_dom";
import { getProcessedData } from "./process_data";
import { updateSizesAndScales, w, x, y } from "./size";
import { updateAxes } from "./axis";
import { updateColors, color } from "./colors";
import { play, tieBreak, current_position, updateCurrentPosition } from "./play";

var line = shape.line()
	.x(function(d) { return x(d.i); })
	.y(function(d) { return y(d.value); })
	.defined(function(d) { return d.value != null; });

var labels_update;

function updateLines(horses, duration) {
	var lines = g_lines.selectAll(".line-group").data(horses);
	var lines_enter = lines.enter().append("g").attr("class", "horse line-group")
		.on("mouseover", mouseover)
		.on("mouseout", mouseout)
		.on("click", clickHorse)
		.attr("clip-path", "url(#clip)")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("fill", "none");
	lines_enter.append("path").attr("class", "shade");
	lines_enter.append("path").attr("class", "line");

	var lines_update = lines.merge(lines_enter);
	lines_update
		.attr("opacity", horseOpacity)
		.attr("stroke", color);
	lines_update
		.select(".line")
		.transition().duration(duration)
		.attr("d", function(d) { return line(d.line); })
		.attr("opacity", state.line_opacity)
		.attr("stroke-width", state.line_width);
	lines_update
		.select(".shade")
		.transition().duration(duration)
		.attr("d", function(d) { return line(d.line); })
		.attr("display", state.shade ? "block" : "none")
		.attr("opacity", state.shade_opacity)
		.attr("stroke-width", state.shade_width);
	lines.exit().remove();
}

function updateStartCircles(horses, duration) {
	var start_circles = g_start_circles.selectAll(".start-circle").data(horses);
	var start_circles_enter = start_circles.enter().append("circle").attr("class", "horse start-circle")
		.attr("cy", function(d) { return y(d.start_circle.value); })
		.attr("cx", function(d) { return x(d.start_circle.i); })
		.attr("clip-path", "url(#clip)");
	start_circles.merge(start_circles_enter)
		.transition().duration(duration)
		.attr("cy", function(d) { return y(d.start_circle.value); })
		.attr("cx", function(d) { return x(d.start_circle.i); })
		.attr("opacity", horseOpacity)
		.attr("r", state.start_circle_r)
		.attr("fill", color);
	start_circles.exit().remove();
}

function displayValue(d) {
	var rounder = Math.pow(10, state.label_decimals),
	    val = d.line[Math.floor(current_position)].value || d.line[lastValidStage(d)].value;
	return val == "" ? "" : Math.round(val * rounder)/rounder;
}

function lastValidStage(d) {
	var valid_index = 0;
	for (var i = Math.floor(current_position); i > 0; i--) {
		if (d.line[i].value != null) { valid_index = i; break; }
	}
	return valid_index;
}

function transformLabel(d) {
	var scale = current_position < d.start_circle.i ? 0 : 1,
	    last_x = Math.floor(current_position),
	    last_y_value = d.line[last_x].value,
	    next_y_value = d.line[last_x+1] ? d.line[last_x+1].value : null,
	    stage_fraction = current_position - Math.floor(current_position),
	    current_x_value = Math.floor(current_position),
	    current_y_value = last_y_value;
	if (
		last_y_value == null ||
		((last_x < d.stages.length) && (next_y_value == null && stage_fraction > 0))
	) {
		var last_valid_index = lastValidStage(d);
		current_x_value = last_valid_index;
		current_y_value = d.line[last_valid_index].value;
	}
	else {
		current_x_value = current_position;
		current_y_value = last_y_value + (next_y_value - last_y_value)*stage_fraction;
	}
	return "translate(" + x(current_x_value) + "," + y(current_y_value) + ") scale(" + scale + ")";
}

function updateLabels(horses, duration) {
	var labels = g_labels.selectAll(".labels-group").data(horses);
	var labels_enter = labels.enter().append("g").attr("class", "horse labels-group")
		.on("mouseover", mouseover).on("mouseout", mouseout).on("click", clickHorse)
		.attr("transform", transformLabel);

	var end_circle_r = window.innerWidth > 420 ? state.end_circle_r : Math.min(state.end_circle_r, 12);
	var end_circle = labels_enter.append("g").attr("class", "end-circle-container");
	end_circle.append("circle").attr("class", "circle bg");
	end_circle.append("circle").attr("class", "end circle");
	end_circle.append("image")
		.attr("clip-path", "url(#circleClip)")
		.attr("preserveAspectRatio", "xMidYMid slice");
	end_circle.append("text").attr("class", "rank-number")
		.attr("alignment-baseline", "central").attr("fill", "white")
		.attr("dominant-baseline", "central")
		.attr("text-anchor", "middle");
	labels_enter.append("rect").attr("class", "name-background");
	labels_enter.append("text").attr("class", "name")
		.attr("alignment-baseline", "central").attr("dominant-baseline", "central");
	labels_enter.select(".name").append("tspan").attr("class", "name-rank")
		.attr("font-weight", "bold");
	labels_enter.select(".name").append("tspan").attr("class", "name-label");

	labels_update = labels.merge(labels_enter).attr("fill", color);
	labels_update.transition().duration(duration).attr("transform", transformLabel);

	labels_update.select(".end-circle-container").attr("transform", null);
	labels_update.select(".end.circle").attr("r", end_circle_r).attr("fill", color).attr("opacity", horseOpacity);
	labels_update.select(".bg.circle").attr("r", end_circle_r).attr("fill", state.bg_color);

	if (state.horse_images) {
		var pic_w = end_circle_r * 2 - 2;
		labels_update.select("image")
			.attr("xlink:href", function(d) { return d.pic; })
			.style("display", "inherit")
			.transition().duration(duration)
			.attr("height", pic_w).attr("width", pic_w)
			.attr("x", -pic_w/2).attr("y", -pic_w/2);
		plot.select("#circleClip circle")
			.transition().duration(duration)
			.attr("r", end_circle_r - 2);
	}
	else { labels_update.select("image").style("display", "none"); }

	var rank_font_size = window.innerWidth > 420 ? state.rank_font_size : Math.min(state.rank_font_size, 12);
	var label_font_size = window.innerWidth > 420 ? state.label_font_size : Math.min(state.label_font_size, 12);

	labels_update.select(".rank-number")
		.attr("font-size", rank_font_size)
		.text(function(d) {
			return state.rank_outside_picture ? "" : displayValue(d) + state.rank_label_suffix + " ";
		});
	labels_update.select(".name").attr("font-size", label_font_size)
		.attr("x", end_circle_r + 4)
		.attr("y", 0)
		.attr("opacity", horseOpacity);
	labels_update.select(".name-rank")
		.attr("font-size", rank_font_size)
		.text(function(d) {
			return state.rank_outside_picture ? displayValue(d) + state.rank_label_suffix + " " : "";
		});
	labels_update.select(".name-label")
		.text(function(d) { return d.name; });
	labels_update.select(".name-background")
		.attr("fill", state.bg_color)
		.attr("width", function() {
			return this.parentNode && this.parentNode.querySelector(".name").getComputedTextLength() + 4;
		})
		.attr("height", label_font_size)
		.attr("x", end_circle_r)
		.attr("y", -label_font_size/2);

	labels.exit().remove();
}

function updateHorses(data, duration) {
	updateCurrentPosition();
	updateLines(data, duration);
	updateStartCircles(data, duration);
	updateLabels(data, duration);
}

function horseOpacity(d, i) {
	var selected_horses = state.selected_horse ? state.selected_horse.split(",") : [];
	if (selected_horses.length > 0) return (selected_horses.indexOf(String(i)) > -1) ? 1 : 0.1;
	if (state.mouseover_horse != null) return (i == state.mouseover_horse) ? 1 : 0.1;
	return 1;
}

function mouseover(d, i) {
	state.mouseover_horse = i;
	updateGraphic(true);
}

function mouseout() {
	state.mouseover_horse = null;
	updateGraphic(true);
}

function clickHorse(d, i) {
	event.stopPropagation();
	var selected_horses;
	if (state.selected_horse == null) {
		selected_horses = [i];
	}
	else {
		selected_horses = state.selected_horse.split(",");
		var is_selected = selected_horses.indexOf(String(i)) > -1;

		if (is_selected) {
			if (selected_horses.length > 1) {
				selected_horses.splice(selected_horses.indexOf(String(i)), 1);
			}
			else {
				selected_horses = [];
			}
		}
		else {
			selected_horses.push(String(i));
		}
	}
	state.selected_horse = selected_horses.join();

	update();
}

function getTargetPosition() {
	var num_timeslices = data.horserace.column_names.stages.length;
	if (state.target_position == null) return num_timeslices - 1;
	else return Math.max(0, Math.min(num_timeslices - 1, state.target_position - 1));
}

function updateUI() {
	selectAll("#rank-toggle button")
		.classed("selected", function() {
			return select(this).attr("data-type") === (state.value_type == "ranks" ? "ranks" : "scores");
		})
		.style("display", function() {
			if (state.show_buttons) return "inline-block";
			else return "none";
		});
}

function updateLineStyle() {
	line.curve(shape[state.curve]);
}

function updateGraphic(duration) {
	var horses = getProcessedData();
	updateSizesAndScales(current_position, horses.max_rank);
	updateLineStyle();
	updateColors();
	updateUI();
	updateAxes(x, y, w, 0);
	updateHorses(horses, duration);
	if (current_position != getTargetPosition()) play();
	else tieBreak();
}

export { updateGraphic, getTargetPosition, transformLabel, displayValue, labels_update };
