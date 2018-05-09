import "d3-transition";
import { select, selectAll, event } from "d3-selection";
import { ascending } from "d3-array";
import * as shape from "d3-shape";
import { updateFooter } from "@flourish/footer";
import { updateHeader } from "@flourish/header";

import state from "./state";
import data from "./data";
import update from "./update";

import { plot, g_lines, g_labels, g_start_circles, g_checks } from "./create_dom";
import { getProcessedData } from "./process_data";
import { updateSizesAndScales, w, h, x, y } from "./size";
import { updateAxes } from "./axis";
import { updateColors, color } from "./colors";
import { play, tieBreak, current_position, updateCurrentPosition } from "./play";

var is_mobile;
var selected_check = null;
var selected_horses = [];
var end_circle_r;
var line = shape.line()
	.x(function(d) { return x(d.i); })
	.y(function(d) { return y(d.value); })
	.defined(function(d) { return d.value != null; });

var labels_update, lines_update;

function updateLines(horses, duration) {
	var lines = g_lines.selectAll(".line-group").data(horses, function(d) { return d.index; });
	var lines_enter = lines.enter().append("g").attr("class", "horse line-group")
		.on("mouseenter", mouseover)
		.on("mouseleave", mouseout)
		.on("click", clickHorse)
		.attr("clip-path", "url(#clip)")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("fill", "none");
	lines_enter.append("path").attr("class", "missing");
	lines_enter.append("path").attr("class", "line");
	lines_enter.append("path").attr("class", "shade");

	lines_update = lines.merge(lines_enter);
	lines_update
		.attr("opacity", horseOpacity)
		.attr("stroke", color);
	lines_update
		.select(".line")
		.transition().duration(duration)
		.attr("d", function(d) { return line(d.line); })
		.attr("opacity", state.line_opacity)
		.attr("stroke-width", !is_mobile ? state.line_width : Math.max(Math.round(state.line_width/2), 2));
	lines_update
		.select(".shade")
		.transition().duration(duration)
		.attr("d", function(d) { return line(d.line); })
		.attr("display", state.shade ? "block" : "none")
		.attr("opacity", state.shade_opacity)
		.attr("stroke-width", !is_mobile ? state.shade_width : Math.max(Math.round(state.shade_width/2), 2));
	lines_update
		.select(".missing")
		.transition().duration(duration)
		.attr("d", function(d) { return line(d.missing_line); })
		.attr("opacity", state.missing ? state.missing_opacity : 0)
		.attr("stroke-dasharray", state.missing_dash_width + "," + state.missing_dash_space)
		.attr("stroke-width", (!is_mobile ? state.missing_width : Math.max(Math.round(state.missing_width / 2), 2)));

	lines.exit().remove();
}

function updateStartCircles(horses, duration) {
	var start_circles = g_start_circles.selectAll(".start-circle").data(horses, function(d) { return d.index; });
	var start_circles_enter = start_circles.enter().append("circle").attr("class", "horse start-circle")
		.attr("cy", function(d) { return y(d.start_circle.value); })
		.attr("cx", function(d) { return x(d.start_circle.i); })
		.attr("clip-path", "url(#clip)");
	start_circles.merge(start_circles_enter)
		.attr("opacity", horseOpacity)
		.transition().duration(duration)
		.attr("cy", function(d) { return y(d.start_circle.value); })
		.attr("cx", function(d) { return x(d.start_circle.i); })
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

function updateChecks() {
	var check_width = x(1);
	var check_margin = 60;
	var check_inner_margin = check_margin - 20;
	var checks = g_checks.selectAll(".check").data(data.horserace.column_names.stages);

	var checks_enter = checks.enter().append("g").attr("class", "check");
	checks_enter.append("rect").attr("class", "check-rect");
	checks_enter.append("line");
	checks_enter.append("circle");
	var checks_update = checks.merge(checks_enter);

	checks_update.attr("transform", function(d, i) {
		return "translate(" + (x(i) - (check_width / 2)) + ", " + "-" + check_margin + ")";
	})
	.on("mouseenter", function(d) {
		selected_check = d;
		select(this).select("line").attr("opacity", "1");
		select(this).select("circle").attr("opacity", "1");
	})
	.on("mouseleave", function() {
		selected_check = null;
		select(this).select("line").attr("opacity", "0");
		select(this).select("circle").attr("opacity", "0");
	})
	.on("click", function(d, i) {
		state.target_position = i + 1;
		update();
	});

	checks_update.select("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("height", h + check_margin)
		.attr("fill", state.bg_color)
		.attr("width", check_width);

	checks_update.select("line")
		.attr("x1", check_width/2)
		.attr("x2", check_width/2)
		.attr("y1", check_inner_margin)
		.attr("y2", h + check_margin)
		.attr("stroke", "#e1e1e1")
		.attr("opacity", function(d) { return d == selected_check ? 1 : 0; })
		.style("pointer-events", "none");

	checks_update.select("circle")
		.attr("r", 3)
		.attr("cx", check_width / 2)
		.attr("cy", check_inner_margin)
		.attr("fill", "#e1e1e1")
		.attr("opacity", function(d) { return d == selected_check ? 1 : 0; })
		.style("pointer-events", "none");

	checks.exit().remove();
}

function updateLabels(horses, duration) {
	var labels = g_labels.selectAll(".labels-group").data(horses, function(d) { return d.index; });

	var labels_enter = labels.enter().append("g").attr("class", "horse labels-group")
		.on("mouseenter", mouseover).on("mouseleave", mouseout).on("click", clickHorse)
		.attr("transform", transformLabel);

	end_circle_r = !is_mobile ? state.end_circle_r : Math.min(state.end_circle_r, 14);
	var end_circle_stroke = !is_mobile ? state.end_circle_stroke : Math.min(state.end_circle_stroke, 2);
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
	labels_enter.append("g").attr("class", "name");
	labels_enter.select(".name").append("text").attr("class", "name-bg")
		.attr("alignment-baseline", "central").attr("dominant-baseline", "central")
		.attr("stroke-width", "5px");
	labels_enter.select(".name").append("text").attr("class", "name-fg")
		.attr("alignment-baseline", "central").attr("dominant-baseline", "central");
	labels_enter.selectAll(".name-fg, .name-bg").append("tspan").attr("class", "name-rank")
		.attr("font-weight", "bold");
	labels_enter.selectAll(".name-fg, .name-bg").append("tspan").attr("class", "name-label");
	labels_update = labels.merge(labels_enter);
	labels_update
		.attr("fill", color)
		.classed("tied", false)
		.each(function(d, i) {
			var is_selected = false;
			if (selected_horses.length > 0 && selected_horses.indexOf(String(i)) > -1) is_selected = true;
			if (selected_horses.length == 0 && state.mouseover_horse != null && i == state.mouseover_horse) is_selected = true;
			if (is_selected) this.parentNode.appendChild(this);
		})
		.transition().duration(duration).attr("transform", transformLabel);

	labels_update.select(".end-circle-container").attr("transform", null);
	labels_update.select(".end.circle").attr("r", end_circle_r)
		.attr("fill", color)
		.attr("opacity", horseOpacity)
		.attr("stroke-width", end_circle_stroke)
		.attr("stroke", state.end_circle_stroke_bg ? state.bg_color : color);
	labels_update.select(".bg.circle").attr("r", end_circle_r).attr("fill", state.bg_color);
	labels_update.select(".name-bg").attr("stroke", state.bg_color);

	if (state.horse_images) {
		var pic_w = end_circle_r * 2 - (end_circle_stroke/2);
		labels_update.select("image")
			.attr("xlink:href", function(d) { return d.pic; })
			.style("display", "inherit")
			.attr("opacity", horseOpacity)
			.transition().duration(duration)
			.attr("height", pic_w).attr("width", pic_w)
			.attr("x", -pic_w/2).attr("y", -pic_w/2);
		plot.select("#circleClip circle")
			.transition().duration(duration)
			.attr("r", end_circle_r - (end_circle_stroke/2));
	}
	else { labels_update.select("image").style("display", "none"); }

	var rank_font_size = !is_mobile ? state.rank_font_size : Math.min(state.rank_font_size, 12);
	var label_font_size = !is_mobile ? state.label_font_size : Math.min(state.label_font_size, 12);

	labels_update.selectAll(".rank-number")
		.attr("font-size", rank_font_size)
		.text(function(d) {
			return state.rank_outside_picture ? "" : displayValue(d) + state.rank_label_suffix + " ";
		});
	labels_update.select(".name-bg .name-label")
		.text(function(d) { return d.name; });
	labels_update.select(".name-fg .name-label")
		.text(function(d) { return d.name; });

	labels_update.select(".name-bg .name-rank")
		.attr("font-size", rank_font_size)
		.text(function(d) {
			return state.rank_outside_picture ? displayValue(d) + state.rank_label_suffix + " " : "";
		});
	labels_update.select(".name-fg .name-rank")
		.attr("font-size", rank_font_size)
		.text(function(d) {
			return state.rank_outside_picture ? displayValue(d) + state.rank_label_suffix + " " : "";
		});

	labels_update.selectAll(".name-fg, .name-bg").attr("font-size", label_font_size)
		.attr("x", function() {
			if (!is_mobile) return end_circle_r + 4;
			else {
				var text_width = this.getBBox().width;
				return -end_circle_r - 4 - text_width;
			}
		})
		.attr("y", 0);
	labels_update.select(".name-fg").attr("opacity", horseOpacity);
	labels_update.select(".name-bg").attr("opacity", horseOpacity);

	labels.exit().remove();
}

function updateHorses(data, duration) {
	updateCurrentPosition();
	updateLines(data, duration);
	updateStartCircles(data, duration);
	updateLabels(data, duration);
	updateChecks(data);
}

function horseOpacity(d, i) {
	if (selected_horses.length > 0) return (selected_horses.indexOf(String(i)) > -1) ? 1 : 0.1;
	if (state.mouseover_horse != null) return (i == state.mouseover_horse) ? 1 : 0.1;

	if (state.hide_labels) {
		if (select(this).classed("name-bg") || select(this).classed("name-fg")) {
			return i == state.mouseover_horse ? 1 : 0;
		}
	}
	return 1;
}

function mouseover(d, i) {
	if (i === state.mouseover_horse) return;
	state.mouseover_horse = i;

	if (selected_horses.length == 0) {
		labels_update.select(".end.circle").attr("opacity", horseOpacity);
		labels_update.select("image").attr("opacity", horseOpacity);
		labels_update.select(".name-fg").attr("opacity", horseOpacity);
		labels_update.select(".name-bg").attr("opacity", horseOpacity);
		labels_update
			.each(function(e, j) {
				if (i === j) {
					this.parentNode.appendChild(this);
				}
			});
		lines_update.attr("opacity", horseOpacity);

		selectAll(".start-circle").attr("opacity", horseOpacity);
	}
}

function mouseout() {
	state.mouseover_horse = null;
	if (selected_horses.length == 0) {
		labels_update.select(".end.circle").attr("opacity", horseOpacity);
		labels_update.select("image").attr("opacity", horseOpacity);
		labels_update.select(".name-fg").attr("opacity", horseOpacity);
		labels_update.select(".name-bg").attr("opacity", horseOpacity);

		lines_update.attr("opacity", horseOpacity);

		var tied_labels = [];
		labels_update.each(function(e) {
			if (select(this).classed("tied")) tied_labels.push([e.index, this]);
		});

		tied_labels.sort(function(a, b) {
			return ascending(a[0], b[0]);
		}).forEach(function(el) {
			el[1].parentNode.appendChild(el[1]);
		});

		selectAll(".start-circle").attr("opacity", horseOpacity);
	}
}

function clickHorse(d, i) {
	state.mouseover_horse = null;
	event.stopPropagation();
	if (state.selected_horse == null) {
		selected_horses = [String(i)];
	}
	else {
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
	select("body").style("background-color", state.bg_color);
	select("#viz-ui").style("margin-top", !state.show_buttons && !state.show_replay ? 0 : null);
	select("#rank-toggle")
		.style("display", state.show_buttons ? null : "none")
		.selectAll("button")
		.classed("selected", function() {
			return select(this).attr("data-type") === (state.value_type == "ranks" ? "ranks" : "scores");
		});
	select("#ranks").text(state.label_ranks);
	select("#scores").text(state.label_scores);
	select("#replay").style("display", state.show_replay ? null : "none").text(state.label_replay);
	updateHeader();
	updateFooter(state);
}

function updateLineStyle() {
	line.curve(shape[state.curve]);
}

function updateGraphic(duration) {
	is_mobile = window.innerWidth <= 420;
	var horses = getProcessedData();
	selected_horses = state.selected_horse ? state.selected_horse.split(",") : [];
	updateUI();
	updateSizesAndScales(current_position, horses.max_rank);
	updateLineStyle();
	updateColors();
	updateAxes(x, y, w, 0);
	updateHorses(horses, duration);
	if (current_position != getTargetPosition()) play();
	else tieBreak();
}

export { updateGraphic, getTargetPosition, transformLabel, displayValue, labels_update, end_circle_r, is_mobile };
