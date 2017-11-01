import { ascending, descending } from "d3-array";

import data from "./data";
import state from "./state";

function getProcessedData() {
	var timeslices = [], max_rank = 0;
	data.horserace.column_names.stages.forEach(function(stage, stage_index) {
		var timeslice = [];

		// Pull out the names and raw scores
		data.horserace.forEach(function(horse, horse_index) {
			var stage = horse.stages[stage_index].replace(/[\s,]/g, ""),
			    score = stage == "" || isNaN(+stage) ? null : +stage;
			timeslice.push({
				name: horse.name,
				index: horse_index,
				score: score
			});
		});

		// Sort asc or desc based on score type
		timeslice.sort(function(a, b) {
			if (!state.higher_scores_win) return ascending(a.score, b.score);
			else return descending(a.score, b.score);
		});

		// Compute ranks
		var prev_score = undefined, prev_rank = 0;
		timeslice.forEach(function(d) {
			if (d.score == null) d.rank = null;
			else if (d.score == prev_score) d.rank = prev_rank;
			else d.rank = ++prev_rank;
			prev_score = d.score;
			max_rank = Math.max(max_rank, d.rank);
		});

		// Make look-up version
		var timeslice_by_horse_index = {};
		timeslice.forEach(function(horse) {
			timeslice_by_horse_index[horse.index] = horse;
		});
		timeslices.push(timeslice_by_horse_index);
	});
	var horses = data.horserace.map(function(horse, horse_index) {
		horse.ranks = horse.stages.map(function(stage, stage_index) {
			return timeslices[stage_index][horse_index].rank;
		});
		horse.line = horse.stages.map(function(stage, stage_index) {
			return {
				"i": stage_index,
				"value": state.value_type == "ranks" ? timeslices[stage_index][horse_index].rank : timeslices[stage_index][horse_index].score
			};
		});
		horse.start_circle = horse.line.filter(function(d) { return d.value != null; })[0];
		return horse;
	}).filter(function(d) {
		return d.start_circle;
	});
	horses.max_rank = max_rank;
	return horses;
}

export { getProcessedData };
