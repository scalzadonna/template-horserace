import { state } from "../index.js";

var headerEl, titleEl, subtitleEl;
var header_margin;

function createHeader(el) {
	headerEl = document.createElement("div");
	headerEl.className = "flourish-header";

	titleEl = document.createElement("h1");
	subtitleEl = document.createElement("h2");

	headerEl.appendChild(titleEl);
	headerEl.appendChild(subtitleEl);

	el.appendChild(headerEl);
}

function updateHeader() {
	header_margin = !state.header_title && !state.header_subtitle ? 0 : state.header_margin + "px";

	headerEl.style.color = state.header_color;
	headerEl.style.margin = state.header_margin + "px";
	headerEl.style.marginTop = header_margin;
	headerEl.style.marginBottom = header_margin;
	headerEl.style.textAlign = state.header_align;

	titleEl.innerHTML = state.header_title ? state.header_title : "";
	subtitleEl.innerHTML = state.header_subtitle ? state.header_subtitle : "";

	titleEl.style.margin = !state.header_title ? 0 : null;
	subtitleEl.style.margin = !state.header_subtitle ? 0 : null;
}

function getHeaderHeight() {
	return headerEl.getBoundingClientRect().height + (header_margin * 2);
}

export { createHeader, updateHeader, getHeaderHeight, headerEl };
