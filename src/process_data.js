import { ascending, descending, min, max } from "d3-array";

import data from "./data";
import state from "./state";

function getProcessedData() {
	var timeslices = [];
	data.horserace.column_names.stages.forEach(function(stage, stage_index) {
		var timeslice = [];

		// Pull out the names and raw scores
		data.horserace.forEach(function(horse, horse_index) {
			timeslice.push({
				name: horse.name,
				index: horse_index,
				score: horse.stages[stage_index].replace(/\s/g,"") == "" ? null : +horse.stages[stage_index]
			});
		});

		// Sort asc or desc based on score type
		timeslice.sort(function(a, b) {
			if (!state.higher_scores_win) return ascending(a.score, b.score);
			else return descending(a.score, b.score);
		});

		// Compute ranks
		var prev_score = undefined, prev_rank = 0;
		timeslice.forEach(function(d, i) {
			if (d.score == null) d.rank = null;
			else if (d.score == prev_score) d.rank = prev_rank;
			else d.rank = ++prev_rank;
			prev_score = d.score;
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
				"value": state.ranks_view ? timeslices[stage_index][horse_index].rank : timeslices[stage_index][horse_index].score
			}
		});
		horse.start_circle = horse.line.filter(function(d) { return d.value != null})[0];
		return horse;
	});
	return horses;
}

export { getProcessedData };