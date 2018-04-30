var footer_el, source_el, note_el;
var has_footer;
var state;

var FOOTER_DEFAULTS = {
	footer_source_label: "Source: ",
	footer_source_name: "",
	footer_source_url: "",
	footer_source_name_2: "",
	footer_source_url_2: "",
	footer_source_name_3: "",
	footer_source_url_3: "",
	footer_note: "",
	footer_size: "12",
	footer_color: "#333333",
	footer_align: "left",
	footer_margin: "10",
	footer_margin_advanced: false,
	footer_margin_top: 10,
	footer_margin_right: 10,
	footer_margin_bottom: 0,
	footer_margin_left: 10
};

function createFooter(el) {
	footer_el = document.createElement("div");
	footer_el.className = "flourish-footer";

	source_el = document.createElement("p");
	source_el.className = "flourish-footer-source";

	note_el = document.createElement("p");
	note_el.className = "flourish-footer-note";

	footer_el.appendChild(source_el);
	footer_el.appendChild(note_el);

	el.appendChild(footer_el);
}

function updateFooter(new_state) {
	state = new_state;
	var sources = [
		{ name: state.footer_source_name, url: state.footer_source_url },
		{ name: state.footer_multiple_sources ? state.footer_source_name_2 : "", url: state.footer_multiple_sources ? state.footer_source_url_2 : "" },
		{ name: state.footer_multiple_sources ? state.footer_source_name_3 : "", url: state.footer_multiple_sources ? state.footer_source_url_3 : "" }
	].filter(function(source) {
		return source.name || source.url;
	});

	has_footer = sources.length > 0;

	footer_el.style.height = has_footer ? null : 0;
	footer_el.style.margin = updateFooterMargin();
	footer_el.style.fontSize = state.footer_size + "px";
	footer_el.style.textAlign = state.footer_align;
	footer_el.style.color = state.footer_color;

	var source_container = document.createElement("span");
	sources.forEach(function(source, i) {
		var link_container = document.createElement("p");
		if (i > 0) link_container.innerText = ", ";
		if (source.url) {
			var link_el = document.createElement("a");
			link_el.innerText = source.name || source.url;
			link_el.href = addHttp(source.url);
			link_el.target = "_blank";
			link_container.appendChild(link_el);
		}
		else {
			link_container.innerText += source.name || source.url;
		}

		source_container.appendChild(link_container);
	});

	source_el.innerHTML = source_container.innerHTML !== "" ? state.footer_source_label + " " + source_container.outerHTML : "";
	note_el.innerHTML = state.footer_note ? (source_container.innerHTML !== "" ? "• " : "") + state.footer_note : "";
}

function updateFooterMargin() {
	if (!has_footer) return 0;
	else if (state.footer_margin_advanced) {
		return state.footer_margin_top + "px " + state.footer_margin_right + "px " + state.footer_margin_bottom + "px " + state.footer_margin_left + "px";
	}
	else return state.footer_margin + "px " + state.footer_margin + "px " + "0 " + state.footer_margin + "px";
}

function getFooterHeight() {
	return footer_el.getBoundingClientRect().height + getFooterMarginHeight();
}

function getFooterMarginHeight() {
	if (!has_footer) return 0;
	return state.footer_margin_advanced ? state.footer_margin_top + state.footer_margin_bottom : +state.footer_margin;
}

function addHttp(url) {
	if (url.indexOf("http://") !== 0 && url.indexOf("https://") !== 0) return "http://" + url;
	else return url;
}

export { createFooter, updateFooter, getFooterHeight, FOOTER_DEFAULTS };
