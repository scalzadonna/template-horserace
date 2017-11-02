import { select, selectAll } from "d3-selection";

import state from "./state";

import { x } from "./size";
import { getTargetPosition, transformLabel, displayValue, labels_update } from "./update_graphic";

var current_position = 0;

function tieBreak() {
	var labels_by_rank = {};
	var target_position = getTargetPosition();
	selectAll(".labels-group").each(function(d) {
		var rank = d.ranks[target_position];
		if (rank == null) return;
		if (!(rank in labels_by_rank)) labels_by_rank[rank] = [this];
		else labels_by_rank[rank].push(this);
	});

	var label_font_size = window.innerWidth > 420 ? state.label_font_size : Math.min(state.label_font_size, 12);

	for (var rank in labels_by_rank) {
		var labels = labels_by_rank[rank];
		var label_step = label_font_size * 1.2;
		if (labels.length > 1) {
			for (var i = 0; i < labels.length; i++) {
				var shift = state.end_circle_r * 0.5 * (i - 1/2);
				select(labels[i]).select(".end-circle-container")
					.attr("transform", "translate(" + shift + ",0)");
				select(labels[i]).select(".name-background")
					.attr("x", state.end_circle_r * 0.75 * (labels.length - 0.5))
					.attr("y", ((label_step * i) - (((labels.length - 1) * label_step)/2)) - (label_font_size / 2));
				select(labels[i]).select(".name")
					.attr("x", state.end_circle_r * 0.75 * (labels.length - 0.5) + 4)
					.attr("y", (label_step * i) - (((labels.length - 1) * label_step)/2));
				labels[i].dataset.shift = shift;
			}
		}
	}
}

var prev_timestamp, target_is_ahead, af = null;
function frame(t) {
	var target_position = getTargetPosition();
	if (!prev_timestamp) {
		prev_timestamp = t;
		af = requestAnimationFrame(frame);
		target_is_ahead = (current_position < target_position);
		return;
	}
	var reached_target;
	if (target_is_ahead) {
		current_position += (t - prev_timestamp) / state.stage_duration;
		reached_target = (current_position > target_position);
	}
	else {
		current_position -= (t - prev_timestamp) / state.stage_duration;
		reached_target = (current_position < target_position);
	}
	if (reached_target) current_position = target_position;

	select("#clip rect")
		.attr("width", x(current_position) + state.margin_left)
		.attr("x", -state.margin_left);
	labels_update
		.interrupt()
		.attr("transform", transformLabel)
		.select(".rank-number")
		.text(function(d) {
			return state.rank_outside_picture ? "" : displayValue(d) + state.rank_label_suffix + " ";
		});

	labels_update.select(".name-rank")
		.text(function(d) {
			return state.rank_outside_picture ? displayValue(d) + state.rank_label_suffix + " " : "";
		});

	if (reached_target) {
		af = null;
		tieBreak();
	}
	else {
		af = requestAnimationFrame(frame);
		prev_timestamp = t;
	}
}

function play() {
	prev_timestamp = null;
	if (af) cancelAnimationFrame(af);
	af = requestAnimationFrame(frame);
}

export { play, af, tieBreak, current_position };
