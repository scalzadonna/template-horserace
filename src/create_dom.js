import { select } from "d3-selection";
import state from "./state";
import update from "./update";

var svg, plot, g_lines, g_labels, g_start_circles;

function clearHighlighting() {
	state.selected_horse = null;
	update();
}

function createDom() {
	var body = select("body");

	svg = body.append("svg").on("click", clearHighlighting);

	plot = svg.append("g").attr("id", "plot");
	plot.append("clipPath").attr("id", "clip").append("rect").attr("width", 0);
	plot.append("clipPath").attr("id", "circleClip").append("circle")
	plot.append("g").attr("class", "x axis");
	plot.append("g").attr("class", "y axis");
	plot.append("g").attr("class", "highlight-line").style("display", "none")
		.append("line")
		.attr("stroke", "#ccc")
		.attr("stroke-width", "2px")
		.attr("x1", 0.5).attr("x2", 0.5).attr("y1", -30).attr("y2", 400)

	g_lines = plot.append("g").attr("class", "g-lines");
	g_start_circles = plot.append("g").attr("class", "g-start-circles");
	g_labels = plot.append("g").attr("class", "g-labels");

	var toggle = body.append("div").attr("id", "rank-toggle");
	toggle.append("button").html(state.label_ranks)
	toggle.append("button").html(state.label_scores)
	toggle.selectAll("button")
		.on("click", function(e) {
			state.ranks_view = this.innerText === state.label_ranks;
			update();
		})
		.classed("selected", function() {
			return this.innerText === (state.ranks_view ? state.label_ranks : state.label_scores);
		});
}

export { createDom, svg, plot, g_lines, g_labels, g_start_circles }; 