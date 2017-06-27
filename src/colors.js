import { schemeCategory20c, schemeCategory20b, schemeCategory20, schemeCategory10 } from "d3-scale";

import state from "./state";

var PALETTES = {
  "schemeCategory10": schemeCategory10,
  "schemeCategory20": schemeCategory20,
  "schemeCategory20b": schemeCategory20b,
  "schemeCategory20c": schemeCategory20c
};

var color;

function updateColors() {
	var colors = PALETTES[state.palette];
	if (!colors) throw new Error("Unknown color scheme: " + state.palette);
	color = function(d, i) {
		return colors[i % colors.length];
	}
}

export { updateColors, color };