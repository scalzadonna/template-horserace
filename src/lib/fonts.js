// Primary font and secondary font
// Each font has a dropdown_other with links to Google Fonts
// You can also fill in a direct url to the google font
// The weights are being specified on template level
// What to do for system fonts?


var google_fonts_url = "https://fonts.googleapis.com/css?family=";
var stylesheet;
var old_css_string;

var state;

var FONT_DEFAULTS = {
	fonts_primary_family: "",
	fonts_primary_other_bool: false,
	fonts_primary_other: "",

	fonts_secondary_family: "",
	fonts_secondary_other_bool: false,
	fonts_secondary_other: ""
};

function initFonts(project_state, config) {
	if (!config.primary) config.primary = {};
	if (!config.secondary) config.secondary = {};

	FONT_DEFAULTS.fonts_primary_family = config.primary.family || "Source Sans Pro";
	FONT_DEFAULTS.fonts_primary_weights = config.primary.weights || [400, 700];
	FONT_DEFAULTS.fonts_primary_target = config.primary.target || "body";

	FONT_DEFAULTS.fonts_secondary_family = config.secondary.family || "Source Sans Pro";
	FONT_DEFAULTS.fonts_secondary_weights = config.secondary.weights || [400];
	FONT_DEFAULTS.fonts_secondary_target = config.secondary.target || "svg";

	state = project_state;
	appendState();

	stylesheet = document.createElement("style");
	stylesheet.id = "flourish-fonts";
	document.body.appendChild(stylesheet);
	updateFonts();
}

function updateFonts() {
	var css_string = "";

	if (state.fonts_primary_other_bool) {
		css_string += state.fonts_primary_other;
	}
	else {
		css_string += "@import url(" + google_fonts_url;
		css_string += state.fonts_primary_family.split(" ").join("+");
		css_string += state.fonts_primary_weights ? ":" + state.fonts_primary_weights.join(",") : "";
		css_string += ");\n\n";
		css_string += state.fonts_primary_target + " { font-family: " + state.fonts_primary_family + " }";
	}

	css_string += "\n\n";

	if (state.fonts_secondary_other_bool) {
		css_string += state.fonts_secondary_other;
	}
	else {
		css_string += "@import url(" + google_fonts_url;
		css_string += state.fonts_secondary_family.split(" ").join("+");
		css_string += state.fonts_secondary_weights ? ":" + state.fonts_secondary_weights.join(",") : "";
		css_string += ");\n\n";
		css_string += state.fonts_secondary_target + " { font-family: " + state.fonts_secondary_family + " }";
	}

	if (css_string == old_css_string) return;
	stylesheet.innerHTML = css_string;
	old_css_string = css_string;

	document.fonts.ready.then(function () {

	});
}

function appendState() {
	for (var key in FONT_DEFAULTS) {
		if (!state[key]) state[key] = FONT_DEFAULTS[key];
	}
}

export { initFonts, updateFonts };
