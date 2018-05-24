import { schemeCategory20c, schemeCategory20b, schemeCategory20, schemeCategory10 } from "d3-scale";
import { schemeAccent, schemeDark2, schemePaired, schemePastel1, schemePastel2, schemeSet1, schemeSet2, schemeSet3 } from "d3-scale-chromatic";

import state from "./state";

var d3_palettes = {
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
var flourish_palettes = {
	flourish_default_1: ["#1D6996", "#EDAD08", "#73AF48", "#94346E", "#38A6A5", "#E17C05", "#5F4690", "#0F8554", "#6F4070", "#CC503E", "#994E95", "#666666"],
	flourish_default_2: ["#11A579", "#CC503E", "#3969AC", "#F2B701", "#7F3C8D", "#80BA5A", "#E68310", "#CF1C90", "#008695", "#F97B72", "#4B4B8F", "#A5AA99"],
	carto_rainbow: ["#5F4690", "#1D6996", "#38A6A5", "#0F8554", "#73AF48", "#EDAD08", "#E17C05", "#CC503E", "#94346E", "#6F4070", "#994E95", "#666666"],
	carto_pastel: ["#66C5CC", "#F6CF71", "#F89C74", "#DCB0F2", "#87C55F", "#9EB9F3", "#FE88B1", "#C9DB74", "#8BE0A4", "#B497E7", "#D3B484", "#B3B3B3"],
	carto_antique: ["#855C75", "#D9AF6B", "#AF6458", "#736F4C", "#526A83", "#625377", "#68855C", "#9C9C5E", "#A06177", "#8C785D", "#467378", "#7C7C7C"]
};

var color;

function updateColors() {
	var colors;
	if (d3_palettes[state.palette]) colors = d3_palettes[state.palette];
	else if (flourish_palettes[state.palette]) colors = flourish_palettes[state.palette];
	else colors = state.palette.replace(/\s/g, "").split(",");
	if (!colors) throw new Error("Unknown color scheme: " + state.palette);

	if (state.custom_colors != "") {
		colors = state.custom_colors.replace(/\s/g, "").split(",");
	}
	color = function(d) {
		return colors[d.unfiltered_index % colors.length];
	};
}

export { updateColors, color };
