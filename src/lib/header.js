var state;
var header_el, title_el, subtitle_el;

var HEADER_DEFAULTS = {
	header_title: "German Elections 2017",
	header_subtitle: "A closer look at the polling data",
	header_color: "#333333",
	header_align: "left",
	header_margin: "10",
	header_margin_advanced: true,
	header_margin_top: 20,
	header_margin_right: 20,
	header_margin_bottom: 20,
	header_margin_left: 20,
};

function createHeader(el, project_state) {
	state = project_state;
	appendState();

	header_el = document.createElement("div");
	header_el.className = "flourish-header";

	title_el = document.createElement("h1");
	subtitle_el = document.createElement("h2");

	header_el.appendChild(title_el);
	header_el.appendChild(subtitle_el);

	el.appendChild(header_el);
	appendStyles();
}

function updateHeader() {
	header_el.style.color = state.header_color;
	header_el.style.padding = updateHeaderMargins();
	header_el.style.textAlign = state.header_align;

	title_el.innerHTML = state.header_title ? state.header_title : "";
	subtitle_el.innerHTML = state.header_subtitle ? state.header_subtitle : "";

	title_el.style.padding = !state.header_title ? 0 : null;
	subtitle_el.style.padding = !state.header_subtitle ? 0 : null;
}

function updateHeaderMargins() {
	if (!state.header_title && !state.header_subtitle) {
		if (state.header_margin_advanced) return "0 " + state.header_margin_right + "px 0 " + state.header_margin_left + "px";
		else return "0 " + state.header_margin + "px";
	}
	else if (state.header_margin_advanced) {
		return state.header_margin_top + "px " + state.header_margin_right + "px " + state.header_margin_bottom + "px " + state.header_margin_left + "px ";
	}
	else {
		return state.header_margin + "px";
	}
}

function appendState() {
	for (var key in HEADER_DEFAULTS) {
		if (!state[key]) {
			state[key] = HEADER_DEFAULTS[key];
		}
	}
}

function appendStyles() {
	var css = document.createElement("style");
	css.type = "text/css";
	css.innerHTML = ".flourish-header {margin-bottom: 0; } .flourish-header h1, .flourish-header h2 {margin:0; } .flourish-header h1 {font-weight: 700; margin: 0; font-size: 21px; line-height: 24px; } .flourish-header h2 {font-weight: 400; font-size: 18px; line-height: 21px; opacity: 0.75; } @media(min-width: 480px) {.flourish-header h1 {font-size: 24px; line-height: 30px; } .flourish-header h2 {font-size: 21px; line-height: 27px; } }";
	document.body.appendChild(css);
}

function getHeaderHeight() {
	return header_el.getBoundingClientRect().height + (state.header_margin * 2);
}

export { createHeader, updateHeader, getHeaderHeight, header_el, HEADER_DEFAULTS };
