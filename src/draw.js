import update from "./update";
import state from "./state";

import { createDom } from "./create_dom";
import { updateGraphic } from "./update_graphic";
import { initFonts } from "./lib/fonts";

var font_config = {
	primary: {
		target: "body",
		family: "Merriweather",
		weights: [400, 700]
	},
	secondary: {
		target: "svg text",
		family: "Source Sans Pro",
		weights: [400]
	}
};

function draw() {
	window.onresize = function() { updateGraphic(0); };
	initFonts(state, font_config);
	createDom();
	update();
}

export default draw;
