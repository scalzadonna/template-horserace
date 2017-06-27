import update from "./update";

import { createDom } from "./create_dom";
import { updateGraphic } from "./update_graphic";

function draw() {
	window.onresize = function() { updateGraphic(0); };
	createDom();
	update();
}

export default draw;