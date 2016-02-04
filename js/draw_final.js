/* global d3,all_data, flight_features, weather_features, 
 * global month_names, colorSets, xValue_funs, month_names, month_fullnames */

"use strict";

var temp; // test variable used to pass value from within a function

var w = 1000, h = 520; // width and height of the main SVG
var pt = 110, pr = 70, pb = 50, pl = 70; // padding top/right/bottom/left
var bottom = h - pb; // the bottom line of the chart (i.e. the x-axis)
var xRange = [pl, w - pr]; // horizonal drawing limit of the chart
var yRange = [h - pb, pt]; // vertical drawing limit of the chart
var xCenter = (w - pr - pl) / 2 + pl; // Center point of the chart
var yCenter = (h - pt - pb) / 2 + pt; // Center point of the chart
var xCushion = .75; // Extra padding for first and last bars
var yCushion = 1.06; // Extra padding for legend
var colWidth_ratio = 0.50; // Bar-width : Max-width ratio
var colShift_ratio = 0.50; // Bar-shift : Max-width ratio

var svg = d3.select("#chart").append("svg").classed("master", true)
        .style("width", w).style("height", h);

// This function is called when the data is done loading.
function init() {
    setup_UI();
    narrate_start();
}


// Generate GUI elements like Title and Buttons
function setup_UI() {
    var header = $('div.header');

    var title = "Louis Armstrong New Orleans International Airport<br/>" +
            "How Katrina Affected the Airport's Operation";
    $('<div>').html(title).addClass("main_title").appendTo(header);

    var selector_flight = $('<div>').appendTo($('#left_panel'));
    var selector_weather = $('<div>').appendTo($('#right_panel'));

    $('<div>').prependTo($('#left_panel')).addClass("selector")
            .text("Operation Parameters:");
    $('<div>').prependTo($('#right_panel')).addClass("selector")
            .text("Weather Features:");

    // Pull out and format labels for the buttons
    var get_label = function (feature, collection) {
        var label = collection[feature][0]
                .replace("Average", "Avrg.")
                .replace("Percent", "Perc.");
        return label.split("(")[0].trim();
    };

    // Generate flight feature buttons
    for (var feature in flight_features) {
        var name = "selector_flight";
        var id = name + feature;
        $("<input>").appendTo(selector_flight)
                .attr("type", "radio").val(feature)
                .attr("name", name)
                .attr("id", id)
                .prop('checked', feature === curr_flight)
                .click(function () {
                    draw({flight: $(this).val(),
                        year: curr_year, month: curr_month});
                });
        $('<label>').appendTo(selector_flight)
                .attr("for", id)
                .text(get_label(feature, flight_features));
    }
    selector_flight.buttonset();
    
    // Generate weather feature buttons
    for (var feature in weather_features) {
        var name = "selector_weather";
        var id = name + feature;
        $("<input>").appendTo(selector_weather)
                .attr("type", "radio").val(feature)
                .attr("name", name)
                .attr("id", id)
                .prop('checked', feature === curr_weather)
                .click(function () {
                    draw({weather: $(this).val(),
                        year: curr_year, month: curr_month});
                });
        $('<label>').appendTo(selector_weather)
                .attr("for", id)
                .text(get_label(feature, weather_features));

    }
    selector_weather.buttonset();
    
    $("#left_panel,#right_panel").hide();
}

// Variables for Narration
var narrating = true; // Flag indicating of the narration is going on
var idx = 0; // index of current line
var timers = []; // collection of timers from setTimout calls
var highlight = []; // collection of highlighted columns
var lines = [ // naration script with text, duration, chart params, and callback
["Hurricane Katrina was the most catastrophic natural disaster that\n\
has ever passed through New Orleans. In this graph, we will examine how this\n\
hurrican affected Louis Armstrong International Airport, or MSY -\n\
New Orlean's main hub of air transportation.", 
8000, {flight: "Flights"}, function () {}], 
["From 1988 to 2004, the number of flight to and from New Orleans was on the\n\
the rise. When Katrina hit the city in late 2005, the total number of flights\n\
took a nose dive in 2005, and slowly recovered in 2007 and 2008.", 
8000, {flight: "Flights"}, function () {}],
["If we take a closer look at the year 2005, the number of flights\n\
scheduled for MSY dropped dramatically after August",
7000,{flight: "Flights",year:2005},function(){}],
["Let's have a look at the number of flights cancelled. There were big spikes\n\
in August and September.",
7000,{flight: "Total_Cancelled",year:2005},function(){}],
["We can also examine the number of diverted flights in 2005. A large amount \n\
of flights heading to New Orleans were diverted away from the area in August,\n\
and September.",
8000,{flight: "Total_Diverted",year:2005},function(){}],
["Looking closer at August, there were about 15 flights that were diverted on\n\
the 28th, the day before the hurricane, and 35 diverted flights the next day.\n\
we also observe similar numbers on the 30th and 31st of the month.\n\
Meanwhile, no flights leaving the area were diverted those days.",
10000,{flight: "Total_Diverted",year:2005,month:8},function(){}],
["The chart now shows the percent of flights cancelled each day. We see that\n\
all flights leaving New Orleans were cancelled on the day Katrina hit, as\n\
well as many days later.",
9000,{flight: "Perc_Cancelled",year:2005,month:8},function(){}],
["Feel free to explore on your own other aspects of MSY's operation between\n\
1988 and 2008. Some weather data were also added for reference.",
8000,{flight: "Perc_Delayed"},function(){narrating = false;}],
["Note that you can click one the year and month columns to zoom in and \n\
see the monthly or daily data of that year or month. Use the RETURN button \n\
to zoom out.",
9000,{flight: "Perc_Delayed", year:2000},function(){
    var delay = 300;
    var month = 1;
    for(var i = 0; i < 12; i++){
        var timer = setTimeout(function(){
            clear_Highlight();
            highlight_add('2000_'+month);
            month++;
        }, i*delay);
        timers.push(timer);
    }
}]
];

// Start & Stop buttons for Narration
$('#btn_start').button().click(function(){narrate_start();}).hide();
$('#btn_skip').button().click(function(){narrate_stop();});

// Start narration
function narrate_start() {
    narrating = true;
    idx = 0;
    $("#left_panel,#right_panel").fadeOut(500);
    $('#btn_start').slideUp(500);
    $('#narrator').html('');
    $("#btn_skip, #narrator").slideDown(500);
    
    // Uncomment to test the last narration line
    //var len = lines.length;
    //idx = len-1;
    
    setTimeout(narrate,500);
}

// narrate the next line in the script
var narrate = function narrate() {
    if(idx >= lines.length){
        narrate_stop();
        return;
    } 

    var msg = lines[idx][0];
    var duration = lines[idx][1];
    var params = lines[idx][2];
    var trailer = lines[idx][3];
    idx++;
    draw(params);
    clear_Highlight();
    timers.push(setTimeout(trailer, 1500));
    $('#narrator').fadeOut(250,function(){$(this).html(msg).fadeIn(500);});

    var timer = setTimeout(function(){narrate();}, duration);
    timers.push(timer);
};

// stop the narration
function narrate_stop() {
    narrating = false;
    $("#btn_skip, #narrator").slideUp(500);
    $('#btn_start').slideDown(600);
    $('#left_panel, #right_panel').delay(600).fadeIn(1200);
    svg.selectAll('#mouse_shield').remove();
    
    $('#selector_flight'+curr_flight).next().find('span').click();
    draw({});
    clear_Highlight();
    while(timers.length>0)
        clearTimeout(timers.pop());
}

// hightlight a column of data entry using mouseover event
var highlight_add = function(ids){
    ids = ids.split(" ");
    while(ids.length>0) {
        var id = 'svg#'+ids.pop();
        highlight.push(id);
        $(id).triggerSVGEvent("mouseover");
    }
};

// remove call highlights
var clear_Highlight = function(){
    while(highlight.length > 0){
        $(highlight.pop()).triggerSVGEvent("mouseout");
    }
};

// Current Chart parameters
var curr_flight = "Flights";
var curr_weather = "Avrg_Precipitation";
var curr_mode, curr_year, curr_month;

// Drawn components
var legend, buttons;
var xAxis, yAxisL, yAxisR;
var xScale, yScaleL, yScaleR;

function draw(params) {
    var year = params.year + '';
    var month = params.month + '';
    var flight = params.flight;
    var weather = params.weather;
    var mode;
    if (year === 'undefined') {
        mode = "year";
    } else if (month === 'undefined') {
        mode = "month";
    } else {
        mode = "day";
    }
    var data = get_data(mode, year, month);
    // (Re)draw X-axis if there's a change in mode, year, or month.
    if (mode !== curr_mode || year !== curr_year || month !== curr_month)
        draw_xAxis(mode, data, year, month);
    
    // (Re)draw Left Y-axis if there's a change in mode or flight feature.
    if (mode !== curr_mode || flight !== curr_flight) {
        flight = get_default(flight, curr_flight);
        draw_yAxisL(all_data[mode], flight);
    }
    // (Re)draw Right Y-axis if there's a change in mode or weather feature.
    if (mode !== curr_mode || weather !== curr_weather) {
        weather = get_default(weather, curr_weather);
        draw_yAxisR(all_data[mode], weather);
    }

    draw_legend(flight, weather);
    draw_buttons(mode, year, month);
    draw_data(mode, data, flight, weather);

    // update current params
    curr_flight = flight;
    curr_weather = weather;
    curr_mode = mode;
    curr_year = year;
    curr_month = month;
}

// draw the x Axis
function draw_xAxis(mode, data, year, month) {
    fadeOut(xAxis, 750, 0, true);

    var tickCount = {year: data.length, month: 12, day: 31};
    var domain = {
        year: [d3.min(data, xValue_funs[mode]), d3.max(data, xValue_funs[mode])],
        month: [1, 12],
        day: [1, 31]};
    var tickFormat = {
        year: function (d) {
            return d;
        },
        month: function (d) {
            return month_names[d - 1];
        },
        day: function (d) {
            return d;
        }
    };
    
    // Make x scale
    xScale = d3.scale.linear().range(xRange)
            .domain([
                domain[mode][0] - xCushion,
                domain[mode][1] + xCushion]);

    var axis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(tickCount[mode]).
            tickFormat(tickFormat[mode]);
    
    // delay drawing of the xAxis so that it will be drawn last to avoid
    // being obstructed by data elements. 
    setTimeout(function () {
        xAxis = svg.append("g");
        xAxis.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (h - pb) + ")")
                .call(axis);
        fadeIn(xAxis, 750, 250);
        
        var text = '';
        if (mode === "day")
            text = month_fullnames[month - 1];
        text += " " + year;
        if (mode === 'year')
            text = 'Year';

        draw_label(xAxis, text, 0, xCenter, h - 5, 'x');
    }, 25);

}

// draw left y axis for Flight Feature
function draw_yAxisL(data, feature) {
    fadeOut(yAxisL, 1000, 0, true);
    
    var in_feature = "in_" + feature; // key for flights into New Orleans
    var out_feature = "out_" + feature; // key for flights out of New Orleans
    
    // Make y scale for flight feature
    yScaleL = d3.scale.linear().range(yRange)
            .domain([0, yCushion * d3.max(data,
                        function (d) {
                            var a = d.values[in_feature];
                            var b = d.values[out_feature];
                            return a > b ? a : b; // get the bigger data
                        })]);

    var axis = d3.svg.axis()
            .scale(yScaleL)
            .orient("left");

    yAxisL = svg.append("g");
    yAxisL.append("g")
            .attr("class", "y axis left")
            .attr("transform", "translate(" + pl + ",0)")
            .call(axis);

    var text = flight_features[feature][0];
    var xAnchor = flight_features[feature][1];

    draw_label(yAxisL, text, -90, xAnchor, yCenter, 'y left',
            flight_features[feature][3]);
    fadeIn(yAxisL, 1000, 0, true);
}

// draw right y axis for Weathre Feature
function draw_yAxisR(data, feature) {
    fadeOut(yAxisR, 1000, 0, true);
    if (narrating)
        return;
    
    // Make y scale for weather feature
    yScaleR = d3.scale.linear().range(yRange)
            .domain([0, yCushion * d3.max(data,
                        function (d) {
                            return d.values[feature];
                        })]);

    var axis = d3.svg.axis()
            .scale(yScaleR)
            .orient("right");

    yAxisR = svg.append("g");
    yAxisR.append("g")
            .attr("class", "y axis right")
            .attr("transform", "translate(" + (w - pr) + ",0)")
            .call(axis);

    var text = weather_features[feature][0];
    var xAnchor = w - weather_features[feature][1];

    draw_label(yAxisR, text, 90, xAnchor, yCenter, 'y right',
            weather_features[feature][2]);
    fadeIn(yAxisR, 1000, 0, true);
}

// draw label (mainly for the 3 axises)
function draw_label(target, text, rotation, xAnchor, yAnchor, exClass, color) {
    if (color === undefined)
        color = "black";
    target.append('text').text(text)
            .style("fill", color)
            .attr("class", "label " + exClass)
            .attr("text-anchor", "middle")
            .attr("x", xAnchor)
            .attr("y", yAnchor)
            .attr("transform",
                    "rotate(" + rotation + "," + xAnchor + "," + yAnchor + ")");
}

// draw data columns
function draw_data(mode, data, flight, weather) {
    var colW = (xScale(2) - xScale(1)); // column width
    var colH = h - pt - pb; // column height
    var key = xValue_funs[mode]; // column key
    var xShift = function (d) { // X value of each column
        return xScale(key(d)) - colW / 2;
    };
    var count = data.length;
    var delay_scale = 300 / count;
    
    // Clean the chart if there's a change in mode
    if (mode !== curr_mode) {
        svg.selectAll('svg.entry.' + curr_mode)
                .transition().duration(750).ease('linear')
                .style("fill-opacity", 0).style("stroke-opacity", 0)
                .remove();
    }
    
    // Function returning the root selection of data entries
    var selection = function () {
        return svg.selectAll('svg.entry.' + mode);
    };
    
    // Create a svg tag for each data entry
    // The bars and dot of each entry are drawn inside these svg elements
    var entries = svg.selectAll('svg.entry.' + mode).data(data, key);
    entries.exit().transition().duration(750).ease('linear')
            .style("fill-opacity", 0).style("stroke-opacity", 0)
            .remove();
    
    var new_entries = entries.enter().append('svg')
            .attr("id", function (d) {
                return d.key.split(",").join("_");
            })
            .attr("class", "entry " + mode).attr("x", xShift)
            .on("mouseover", function () {
                d3.select(this).select('.bg_bar')
                        .transition().ease("linear").duration(75)
                        .style("opacity", 0.20);
            }).on("mouseout", function () {
        d3.select(this).select('.bg_bar')
                .transition().duration(150)
                .style("opacity", 0.0);
    }).on("click", function (d) {
        var val = key(d) + '';
        if (mode === "year")
            draw({year: val});
        else if (mode === "month")
            draw({year: curr_year, month: val});
        if (mode !== "day")
            d3.selectAll('.bg_bar').transition().duration(250)
                    .style("opacity", 0);
    });


    // Delay the creation of hover element so that it won't interfere
    // with the graph's transition/animation
    setTimeout(function () {
        new_entries.append('rect')
                .attr("class", "bg_bar")
                .attr("y", pt).attr("height", colH)
                .attr("x", 0).attr("width", colW);
    }, 1000);
    
    // Start Drawing Bars for Flight Features
    var barW = colW * colWidth_ratio;
    var barS = barW / 2 * colShift_ratio;
    var barX = (colW - barW) / 2;

    function draw_flight(feature, shift, idClass, color) {
        new_entries.append('rect')
                .attr("class", "data " + idClass)
                .attr("y", bottom).attr("height", 0)
                .attr("x", barX + shift).attr("width", barW);
        selection().selectAll('rect.data.' + idClass).data(data, key)
                .transition()
                .delay(function (d, i) {
                    return i * delay_scale;
                })
                .duration(750)
                .style("fill", color)
                .attr("y", function (d) {
                    return yScaleL(d.values[feature]);
                })
                .attr("height", function (d) {
                    return bottom - yScaleL(d.values[feature]);
                });
    }

    draw_flight("in_" + flight, barS, "in_bar", flight_features[flight][3]);
    draw_flight("out_" + flight, -barS, "out_bar", flight_features[flight][2]);
    
    
    // add an invisible layer on top of data elements to prevent mouseover
    // events and skip drawing weather data during narration mode
    if (narrating) {
        svg.append('rect').attr("id","mouse_shield")
                .attr('opacity', 0).attr('height', h).attr('width', w);
        return;
    }
    
    // Draw Circles for Weather Features
    var radius = colW / 5;
    var dotS = colW / 2;

    selection().append('circle')
            .attr("class", "data wea_dot")
            .attr("cx", dotS)
            .attr("cy", 0)
            .attr("r", radius);

    selection().selectAll('circle.data.wea_dot').data(data, key)
            .transition()
            .delay(function (d, i) {
                return (data.length - i) * delay_scale;
            })
            .duration(750)
            .style("fill", weather_features[weather][2])
            .style("stroke", "black")
            .attr("cy", function (d) {
                var val = d.values[weather];
                return val === undefined ? yScaleR(0) : yScaleR(val);
            });
}

// draw legend
function draw_legend(flight, weather) {
    fadeOut(legend, 1000, 0, true);

    var midpoint = 50; // point between text and legend figures

    legend = svg.append('svg').attr("class", "legend")
            .attr("x", pl).attr("y", 40);

    // draw flight legend
    var lineHeight = 30;
    var barH = lineHeight / 1.6;
    var barW = 30;
    var barX = midpoint + 20;
    
    legend.append('rect').attr("class", "in_bar")
            .style("fill", flight_features[flight][3])
            .attr("x", barX).attr("y", 0)
            .attr("height", barH).attr("width", barW);
    
    legend.append('rect').attr("class", "out_bar")
            .style("fill", flight_features[flight][2])
            .attr("x", barX).attr("y", barH + 10)
            .attr("height", barH).attr("width", barW);
    
    // text for flight legend
    legend.append('text').text('Flights headed to New Orleans')
            .attr("x", barX + barW + 10).attr("y", lineHeight / 2);
    legend.append('text').text('Flights leaving New Orleans')
            .attr("x", barX + barW + 10).attr("y", lineHeight / 2 + barH + 10);

    // skip drawing weather legend during narration mode        
    if (narrating)
        return;

    // draw weather legend
    midpoint = 400;
    var circleR = barH / 2 + 2;
    var circleX = midpoint - circleR - 5;
    var circleY = circleR+2;

    legend.append('text').text("Weather Feature")
            .attr("text-anchor", "start")
            .attr("x", midpoint)
            .attr("y", lineHeight / 2);

    legend.append('circle').attr("class", "wea_dot")
            .attr("r", circleR).attr("cx", circleX).attr("cy", circleY)
            .style("fill", weather_features[weather][2])
            .style("stroke","black");
    fadeIn(legend, 750, 0, true);
}

// draw next/prev/return buttons on the chart
function draw_buttons(mode, year, month) {
    fadeOut(buttons, 1000, 250, true);
    
    // dont draw buttons during narration or in Year mode
    if (narrating || mode === 'year')
        return;
    
    
    var rx = 30, ry = 25; // radii of the buttons
    var rxl = 40; // x radius of the large button
    var pad = 10; // button padding
    var cx = w - rx - pr - 10; // button center
    var cy = 40 + ry; // button center
    
    buttons = svg.append('g');

    if (mode === 'month') { // setup params for Month Mode buttons
        var max_year = d3.max(get_data('year'), xValue_funs['year']);
        var min_year = d3.min(get_data('year'), xValue_funs['year']);
        
        // hover text for prev and next year
        var prev = +year <= min_year ? null : +year - 1;
        var next = +year >= max_year ? null : +year + 1;
        
        // click event handlers
        var prev_click = function () {
            draw({year: prev});
        };
        var next_click = function () {
            draw({year: next});
        };
        var return_click = function () {
            draw({});
        };
    } else { // setup params for Day Mode buttons
        var prev_ = +month <= 1 ? null : +month - 1;
        var next_ = +month >= 12 ? null : +month + 1;
        
        // hover text for prev and next month
        prev = month_names[prev_ - 1];
        next = month_names[next_ - 1];
        
        // click event handlers
        var prev_click = function () {
            draw({year: year, month: prev_});
        };
        var next_click = function () {
            draw({year: year, month: next_});
        };
        var return_click = function () {
            draw({year: year});
        };
    }
    
    if (next !== null && next_ !== null)
        make_button("Next", next, next_click);

    cx = cx - (2 * rx + 2 * pad + 2 * rxl);
    if (prev !== null && prev_ !== null)
        make_button("Prev", prev, prev_click);

    cx = cx + 2 * rxl;
    rx = rxl;
    if (return_click !== undefined)
        make_button("RETURN", "RETURN", return_click);

    // draw a button with original text, hover text, and click handler
    function make_button(text, hover, click) {
        var btn = buttons.append('g').classed('button', true);
        
        var bg = btn.append('ellipse')
                .attr("rx", rx).attr("ry", ry)
                .attr("cx", cx).attr("cy", cy);
        var txt = btn.append('text').text(text)
                .attr("text-anchor", "middle")
                .attr("x", cx).attr("y", function () {
            var height = d3.select(this).style("height").split("px")[0];
            return height / 3 + cy;
        });
        
        // Setup Event Handlers
        btn.on("mouseover", function () {
            btn.classed("hover", true);
            txt.text(hover);
            bg.transition().duration(250).attr("ry",
                    function () {
                        return d3.select(this).attr("rx");
                    });
        }).on("mouseout", function () {
            btn.classed("hover", false);
            txt.text(text);
            bg.transition().duration(250).ease('linear').attr("ry", ry);
        }).on("click", click);
        return btn;
    }
}