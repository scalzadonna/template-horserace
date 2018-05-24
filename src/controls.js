import { select } from "d3-selection";
import { set as d3_set } from "d3-collection";
import createControlsGroup from "@flourish/controls";
import state from "./state";
import data from "./data";
import update from "./update";
import { viz_ui } from "./create_dom";

var filter_control, container;
var viz_ui_node, horse_controls_node;


function setControlWidth() {
	var viz_ui_width = viz_ui_node.getBoundingClientRect().width;
	var horse_controls_width = horse_controls_node.getBoundingClientRect().width;
	container.style("width", Math.min(state.filter_width, viz_ui_width - horse_controls_width) + "px");
	if (container.node().getBoundingClientRect().width + horse_controls_width > viz_ui_width) {
		container.style("width", Math.min(state.filter_width, viz_ui_width) + "px");
	}
}


function getFilterNames() {
	if (data.horserace.column_names.filter === undefined) return null;
	var filter_set = d3_set(data.horserace, function(d) { return d.filter; });
	var filter_array = [];
	filter_set.each(function(d) { filter_array.push(d); });
	if (filter_array.length && state.filter_include_all) filter_array.unshift(state.filter_all_label);
	return filter_array;
}


function initFilterControls() {
	var selector = "#filter-control";
	filter_control = createControlsGroup(selector)
		.on("change", function(val) {
			state.filter = val;
			update();
		});
	container = select(selector);
	viz_ui_node = viz_ui.node();
	horse_controls_node = viz_ui.select("#horse-controls").node();
}


function updateFilterControls() {
	setControlWidth();
	var filter_names = getFilterNames();
	if (!filter_names) filter_control.options([]).update();
	else {
		filter_control
			.options(filter_names)
			.value(state.filter)
			.type(state.filter_control_type)
			.update();
	}
	state.filter = filter_control.value();
}


export { initFilterControls, updateFilterControls };
