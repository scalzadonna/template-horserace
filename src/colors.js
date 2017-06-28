import { schemeCategory20c, schemeCategory20b, schemeCategory20, schemeCategory10 } from "d3-scale";
import { schemeAccent, schemeDark2, schemePaired, schemePastel1, schemePastel2, schemeSet1, schemeSet2, schemeSet3 } from "d3-scale-chromatic";

import state from "./state";

var PALETTES = {
	"schemeCategory10": schemeCategory10,
	"schemeCategory20": schemeCategory20,
	"schemeCategory20b": schemeCategory20b,
	"schemeCategory20c": schemeCategory20c,
	"schemeAccent": schemeAccent,
	"schemeDark2": schemeDark2,
	"schemePaired": schemePaired,
	"schemePastel1": schemePastel1,
	"schemePastel2": schemePastel2,
	"schemeSet1": schemeSet1,
	"schemeSet2": schemeSet2,
	"schemeSet3": schemeSet3
};

var color;

function updateColors() {
	var colors = PALETTES[state.palette];
	if (!colors) throw new Error("Unknown color scheme: " + state.palette);

	if (state.custom_colors != "") {
		colors = state.custom_colors.replace(/\s/g, "").split(",");
	}
	color = function(d, i) {
		return colors[i % colors.length];
	}
}

export { updateColors, color };