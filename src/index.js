import * as d3 from "d3";
import { select as $, selectAll as $$ } from "d3";

var svg, plot, g_lines, g_labels, g_start_circles, h, w, x, y;

var line = d3.line()
	.x(function(d, i) { return x(i); })
	.y(function(d) { return y(d); })
	.curve(d3.curveLinear);

export var data = {};

export var state = {
	margin_top: 100,
	margin_right: 120,
	margin_bottom: 50,
	margin_left: 50,
	start_circle_r: 2,
	end_circle_r: 20,
	label_font_size: 12,
	rank_font_size: 14,
	palette: "schemeCategory20c",
	shade: true,
	shade_opacity: 0.1,
	shade_width: 20,
	line_opacity: 1,
	line_width: 2,
	timeslice: 0,
	selected_horse: null,
	mouseover_horse: null,
	button_text: "Replay",
	target_position: 5,
	duration: 200,
	bgcolor: "#FFFFFF",
	is_rank: true,
	use_image:false
};

var current_position = 0;

var palettes = {
  "schemeCategory10": d3.schemeCategory10,
  "schemeCategory20": d3.schemeCategory20,
  "schemeCategory20b": d3.schemeCategory20b,
  "schemeCategory20c": d3.schemeCategory20c
};

export function update() {
	svg.attr("width", window.innerWidth).attr("height", window.innerHeight);
	svg.style("background-color", state.bgcolor);
	plot.attr("transform", "translate(" + state.margin_left + "," + state.margin_top + ")");

	w = window.innerWidth - state.margin_left - state.margin_right;
	h = window.innerHeight - state.margin_top - state.margin_bottom;

	x = d3.scaleLinear().range([0, w]).domain([0,d3.max(data.horserace,function(d){return d.times.length })]);
	y = d3.scaleLinear().range([h, 0]).domain([
		d3.max(data.horserace, function(d) { return d3.max(d.times, function(v) { return +v; }); }),
		d3.min(data.horserace, function(d) { return d3.min(d.times, function(v) { return +v; }); })
	]);

	if(state.is_rank){
		y.domain([data.horserace.length,1])
	}

	$('.highlight-line line').attr('y2',h)

	$("#clip rect")
		.attr("transform", "translate(0,-" + state.shade_width/2 + ")")
		.attr("height", h + state.shade_width)
		.attr("width", x(current_position));

	$("#replay").text(state.button_text);

	var colors = palettes[state.palette];
	if (!colors) throw new Error("Unknown color scheme: " + state.palette);

	function color(d, i) { return colors[i % colors.length]; }
	
	var xAxis = d3.axisTop(x).tickFormat(function(d) { return data.horserace.column_names.times[d] ? data.horserace.column_names.times[d] : ""; });

	$(".x.axis").call(xAxis)
		.selectAll(".tick")
		.each(function() {
			var tick = $(this);
			tick.selectAll("rect").remove();

			tick.insert("rect", "text")
				.attr('y',-65)
				.attr('x',0)
				.attr('fill',state.bgcolor)
				.attr('height',65)
				.attr('width',function(){
					return this.parentElement.getBoundingClientRect().width
				})

			tick.insert("rect", "text")
				.attr('class','text-outline')
				.attr('height','20px')
				.attr('width',function(d){
					return this.parentElement.querySelector('text').getComputedTextLength() + 10
				})
				.attr('y','-32px')
				.attr('x','21px')
				.attr('transform','rotate(-45)')
				.attr('rx','10px')
				.attr('stroke','#ccc')
				.attr('stroke-width','2px')
				.style('display',function(d){
					if(state.highlight !== d){
						return 'none'
					}
				})
		})
		.on('mouseenter',function(d){
			$(this).select('.text-outline').style('display','inherit');
			state.highlight = d;

			$('.highlight-line')
				.style('display','inherit')
				.attr('transform','translate(' + x(d) + ',0)')
		})
		.on('mouseleave',function(){
			state.highlight = null;
			$(this).select('.text-outline').style('display','none');
			$('.highlight-line').style('display','none')
		})
		.on('click',function(d){
			state.target_position = d;
			update();
		})
		.selectAll("text")
		.style("text-anchor","start")
		.attr("dx", "2.3em")
		.attr("dy", "-0.9em")
		.attr("transform", "rotate(-45)");

	var yAxis = d3.axisLeft(y).tickSize(-w).tickPadding(10);
	if(state.is_rank){
		yAxis.tickFormat(function(d){
			return d % 1 === 0 ? d : "";
		})
	}
	$(".y.axis").call(yAxis);

	var horses = data.horserace.map(function(d){
		if(state.is_rank){
			d.ranks = d.times.map(function(curr_score,i) {
				var ranks_per_stage = [curr_score];
				data.horserace.forEach(function(horse,j) {
					if(i !== j){
						ranks_per_stage.push(horse.times[i])
					}
				})
				return ranks_per_stage.sort(function(a,b) { return Number(a) > Number(b) }).indexOf(curr_score) + 1;
			})
		}else{
			d.ranks = d.times;
		}
		
		return d;
	});

	var highlights = d3.select(".highlight-targets").selectAll('rect').data(data.horserace);
	var highlights_enter = highlights.enter().append('rect').attr('fill','#fff').attr('height',40)
		.on('click',function(d,i){
			state.target_position = Number(d.timeslice) - 1;
		})
		.on('mouseenter',function(d,i){
			d3.select('.highlight-line')
				.transition()
				.attr('transform', "translate(" + x(d.timeslice - 1) + ",0)");
		})
	var highlights_update = highlights.merge(highlights_enter)
		.attr('x',function(d){
			return x(d.timeslice - 1) - x(.5);
		})
		.attr('width',x(1)  - 2)

	var lines = g_lines.selectAll(".line-group").data(horses);
	var lines_enter = lines.enter().append("g").attr("class", "horse line-group")
		.on("mouseover", mouseover)
		.on("mouseout", mouseout)
		.on("click", clickHorse);
	lines_enter.append("path").attr("class", "shade")
		.attr("clip-path", "url(#clip)")
		.attr("fill", "none");
	lines_enter.append("path").attr("class", "line")
		.attr("clip-path", "url(#clip)")
		.attr("fill", "none");
	var lines_update = lines.merge(lines_enter).attr("opacity", horseOpacity);
	lines_update
		.select(".line")
		.attr("d", function(d) { return line(d.ranks); })
		.attr("stroke", color)
		.attr("opacity", state.line_opacity)
		.attr("stroke-width", state.line_width);
	lines_update
		.select(".shade")
		.attr("d", function(d) { return line(d.ranks); })
		.attr("stroke", color)
		.attr("display", state.shade ? "block" : "none")
		.attr("opacity", state.shade_opacity)
		.attr("stroke-width", state.shade_width);
	lines.exit().remove();

	var start_circles = g_start_circles.selectAll(".start-circle").data(horses);
	var start_circles_enter = start_circles.enter().append("circle").attr("class", "horse start-circle")
		.attr("cx", 0)
		.attr("r", 5)
		.attr("fill", color);
	start_circles.merge(start_circles_enter)
		.attr("cy", function(d) { return y(d.ranks[0]); })
		.attr("opacity", horseOpacity)
		.select(".start.circle")
		.attr("r", state.start_circle_r);
	start_circles.exit().remove();

	var labels = g_labels.selectAll(".labels-group").data(horses);
	var labels_enter = labels.enter().append("g").attr("class", "horse labels-group")
		.on("mouseover", mouseover).on("mouseout",mouseout).on("click", clickHorse);
	var end_circle = labels_enter.append("g").attr("class","end-circle-container")
	end_circle.append("circle").attr("class", "end circle");
	end_circle.append("image");
	end_circle.append("text").attr("class", "rank-number")
		.attr("alignment-baseline", "central").attr("fill", "white")
		.attr("text-anchor", "middle");
	labels_enter.append("rect").attr("class","name-background");
	labels_enter.append("text").attr("class", "name").attr("alignment-baseline", "central");
	var labels_update = labels.merge(labels_enter).attr("fill", color).attr("opacity", horseOpacity);
	labels_update.attr("transform", function(d) {
		return "translate(" + x(current_position) + "," + y(d.ranks[Math.floor(current_position)]) + ")";
	});
	labels_update.select(".end-circle-container").attr("transform",null)
	labels_update.select(".end.circle").attr("r", state.end_circle_r).attr("fill", color);
	
	if(state.use_image){
		labels_update.select("image")
			.attr('xlink:href',function(d){
				return "http://static2.giroditalia.it/wp-content/uploads/2016/04/Tom_Dumoulin.jpg"
				// return Flourish.static_prefix + '/team_logos/' + d.icon
			})
			.style("display","inherit")
			.attr('height',(state.end_circle_r * 2) - 2)
			.attr('width',(state.end_circle_r * 2) - 2)
			.attr('y',-((state.end_circle_r * 2)-2) / 2)
			.attr('x',-((state.end_circle_r * 2)-2) / 2)
			.attr('clip-path','url(#circleClip)')
	}else{
		labels_update.select("image").style("display","none")
	}
	
	labels_update.select(".rank-number")
		.attr("font-size", state.rank_font_size)
		.text(function(d) { return d.ranks[Math.floor(current_position)]; });

	labels_update.select(".name").attr("font-size", state.label_font_size)
		.attr("x", state.end_circle_r + 4)
		.attr("y", 0)
		.text(function(d) { return d.name; });
	labels_update.select(".name-background")
		.attr("fill",state.bgcolor)
		.attr("width",function(){ return this.parentElement.querySelector('.name').getComputedTextLength() + 4; })
		.attr("height",state.label_font_size)
		.attr("x", state.end_circle_r)
		.attr("y", -state.label_font_size/2);
	labels.exit().remove();

	if (current_position != getTargetPosition()) play();
	else tieBreak();
}

function mouseover(d, i) {
	state.mouseover_horse = i;
	update();
}

function mouseout() {
	state.mouseover_horse = null;
	update();
}

function clearHighlighting() {
	state.selected_horse = null;
	update();
}

function horseOpacity(d, i) {
	if (state.selected_horse != null) {
		return +(i == state.selected_horse);
	}
	if (state.mouseover_horse != null) {
		return (i == state.mouseover_horse) ? 1 : 0.05;
	}
	return 1;
}

function clickHorse(d, i) {
	d3.event.stopPropagation();
	if (state.selected_horse == null) state.selected_horse = i;
	else state.selected_horse = null;
	update();
}

function createDom() {
	var body = $("body");
	svg = body.append("svg").on("click", clearHighlighting);

	plot = svg.append("g").attr("id", "plot");
	plot.append("clipPath").attr("id", "clip").append("rect").attr("width", 0);
	plot.append("clipPath").attr("id", "circleClip").append("circle").attr("r", state.end_circle_r - 2);
	plot.append("g").attr("class", "x axis");
	plot.append("g").attr("class", "y axis");

	plot.append("g").attr("class","highlight-line")
		.style("display","none")
		.append("line")
		.attr('stroke','#ccc')
		.attr('stroke-width','2px')
		.attr('x1',0.5).attr('x2',0.5).attr('y1',-30).attr('y2',400)

	g_lines = plot.append("g").attr("class", "g-lines");
	g_start_circles = plot.append("g").attr("class", "g-start-circles");
	g_labels = plot.append("g").attr("class", "g-labels");

	body.append("div").attr("id", "replay").text(state.button_text).on("click", function() {
		current_position = 0;
		play();
	});
}

export function draw() {
	current_position = 0;
	createDom();
	update();

	window.onresize = function() {
		update();
	};
}

function tieBreak() {
	var labels_by_rank = {};
	var target_position = getTargetPosition();
	$$(".labels-group").each(function(d) {
		var rank = d.ranks[target_position];
		if (!(rank in labels_by_rank)) labels_by_rank[rank] = [this];
		else labels_by_rank[rank].push(this);
	});
	for (var rank in labels_by_rank) {
		var labels = labels_by_rank[rank];
		var labelStep = state.label_font_size * 1.2
		if (labels.length > 1) {
			for (var i = 0; i < labels.length; i++) {
				var shift = state.end_circle_r * 0.5 * (i - 1/2);
				$(labels[i]).select(".end-circle-container")
					.attr("transform","translate(" + shift + ",0)")

				$(labels[i]).select(".name-background")
					.attr('x',state.end_circle_r * 0.75 * (labels.length - 0.5))
					.attr('y',(labelStep * i) - (state.label_font_size/2))
				
				$(labels[i]).select(".name")
					.attr('x',state.end_circle_r * 0.75 * (labels.length - 0.5) + 4)
					.attr('y',(labelStep * i) - (((labels.length - 1) * labelStep)/2))

				labels[i].dataset.shift = shift;
			}

		}
	}
}

function getRank(d, p) {
	var floor_p = Math.floor(p);
	if (p == floor_p) return d.ranks[p];
	var frac_p = p - floor_p;
	return (1 - frac_p) * d.ranks[floor_p] + frac_p * d.ranks[floor_p + 1];
}

function getTargetPosition() {
	if (typeof state.target_position === "undefined") {
		return data.horserace.length - 1;
	}
	return state.target_position;
}

var prev_timestamp,
    af = null,
    target_is_ahead;

function frame(t) {
	var target_position = getTargetPosition();

	if (!prev_timestamp) {
		prev_timestamp = t;
		af = requestAnimationFrame(frame);
		target_is_ahead = (current_position < target_position);
		return;
	}

	var reached_target;
	if (target_is_ahead) {
		
		current_position += (t - prev_timestamp) / state.duration;
		reached_target = (current_position > target_position);
	}
	else {
		current_position -= (t - prev_timestamp) / state.duration;
		reached_target = (current_position < target_position);
	}
	if (reached_target) current_position = target_position;

	$("#clip rect").attr("width", x(current_position));
	$$(".labels-group")
		.attr("transform", function(d) {
			return "translate(" + x(current_position) + "," + y(getRank(d, current_position)) + ")";
		})
		.select(".rank-number").text(function(d) { return d.ranks[Math.floor(current_position)]; });

	if (reached_target) {
		af = null;
		tieBreak();
	}
	else {
		af = requestAnimationFrame(frame);
		prev_timestamp = t;
	}
}

function play() {
	prev_timestamp = null;
	if (af) cancelAnimationFrame(af);
	af = requestAnimationFrame(frame);
}

//animate lines
// interpolation/ step beforeafter
// ranks instead of values
// custom x-ticks and y ticks for ranking
// dedaanify
