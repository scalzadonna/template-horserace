import state from "./state";

import { updateGraphic } from "./update_graphic";

function update() {
	updateGraphic(state.update_duration);
}

export default update;