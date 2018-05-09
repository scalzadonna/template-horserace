import { select, event } from "d3-selection";
import { createFooter } from "@flourish/footer";
import { createHeader, header_el } from "@flourish/header";

import state from "./state";
import update from "./update";
import { replay } from "./play";

var svg, plot, g_lines, g_labels, g_start_circles, g_checks, viz_ui;

function clearHighlighting() {
	if (event.target) {
		event.target.getAttribute("class");
		if (event.target.getAttribute("class") == "check-rect") return;
	}
	state.selected_horse = null;
	update();
}

function createDom() {
	var body = select("body");
	createHeader(body.node(), state);
	viz_ui = select(header_el).append("div").attr("id", "viz-ui");
	svg = body.append("svg").on("click", clearHighlighting);
	createFooter(body.node(), state);

	plot = svg.append("g").attr("id", "plot");
	plot.append("clipPath").attr("id", "clip").append("rect").attr("width", 0);
	plot.append("clipPath").attr("id", "circleClip").append("circle");
	g_checks = plot.append("g").attr("class", "g-checks");
	plot.append("g").attr("class", "x axis").style("pointer-events", "none");
	plot.append("g").attr("class", "y axis").style("pointer-events", "none");

	g_lines = plot.append("g").attr("class", "g-lines");
	g_start_circles = plot.append("g").attr("class", "g-start-circles");
	g_labels = plot.append("g").attr("class", "g-labels");
	viz_ui.append("button").attr("id", "replay").text(state.label_replay).on("click", replay);
	var toggle = viz_ui.append("div").attr("id", "rank-toggle");
	toggle.append("button").attr("id", "ranks").text(state.label_ranks).attr("data-type", "ranks");
	toggle.append("button").attr("id", "scores").text(state.label_scores).attr("data-type", "scores");
	toggle.selectAll("button")
		.on("click", function() {
			state.value_type = select(this).attr("data-type");
			update();
		})
		.classed("selected", function() {
			return select(this).attr("data-type") === (state.value_type == "ranks" ? state.label_ranks : state.label_scores);
		});
}

export { createDom, svg, plot, g_lines, g_labels, g_start_circles, g_checks, viz_ui };
