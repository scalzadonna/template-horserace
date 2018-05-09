var state = {
	margin_top: 60,
	margin_right: 80,
	margin_bottom: 0,
	margin_left: 10,

	bg_color: "#FFFFFF",
	palette: "flourish_default_1",
	custom_colors: "",

	start_circle_r: 5,
	end_circle_r: 20,
	end_circle_stroke: 4,
	end_circle_stroke_bg: true,
	horse_images: true,
	hide_labels: false,
	label_decimals: 1,
	label_font_size: 12,
	rank_font_size: 14,
	rank_outside_picture: true,
	rank_label_suffix: "",

	line_opacity: 1,
	line_width: 5,
	curve: "curveLinear",

	shade: true,
	shade_opacity: 0.1,
	shade_width: 20,

	missing: false,
	missing_opacity: 1,
	missing_dash_width: 0.2,
	missing_dash_space: 4,
	missing_width: 1.5,

	stage_duration: 500,
	update_duration: 500,

	label_ranks: "Ranks",
	label_scores: "Scores",
	label_replay: "Replay",

	value_type: "ranks",
	higher_scores_win: true,
	show_buttons: true,
	show_replay: true,

	target_position: null,

	selected_horse: null,
	mouseover_horse: null,

	y_axis_min: "",
	y_axis_max: "",
	y_axis_min_rank: "",
	y_axis_max_rank: "",
	y_axis_rounding: false,

	y_axis_tick_prefix: "",
	y_axis_tick_suffix: "%",

	header_title: "",
	header_subtitle: "",
	header_color: "#333333",
	header_margin: "10",
	header_align: "left",
};

export default state;
