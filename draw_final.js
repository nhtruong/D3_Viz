/* global d3,all_data, flight_features, weather_features, 
 * global month_names, colorSets, xValue_funs, month_names, month_fullnames */

"use strict";

var temp;

var w = 1200, h = 640;
var pt = 110, pr = 70, pb = 50, pl = 70;
var bottom = h-pb;
var xRange = [pl,w-pr];
var yRange = [h-pb,pt];
var xCenter = (w-pr-pl)/2+pl;
var yCenter = (h-pt-pb)/2+pt;
var xCushion = .75;
var yCushion = 1.06;
var colWidth_ratio = 0.50;
var colShift_ratio = 0.50;

var svg = d3.select("body").append("svg").style("width", w).style("height", h);

setup_UI();
function setup_UI(){
    var header = $('<div>').prependTo($('body')).addClass("header");
    var footer = $('<div>').appendTo($('body')).addClass("footer");
    
    var title = "Louis Armstrong New Orleans International Airport<br/>"+
            "How Much Does Weather Affect Its Operation?";
    $('<div>').html(title).addClass("main_title").appendTo(header);

    var flySelector = $('<select>').appendTo(footer).change(function () {
        draw({flight: $(this).val(), year: curr_year, month: curr_month});
    });
    for (var val in flight_features)
        $('<option>').val(val).text(flight_features[val][0]).appendTo(flySelector);
    var weaSelector = $('<select>').appendTo(footer).change(function () {
        draw({weather: $(this).val(), year: curr_year, month: curr_month});
    });
    for (var val in weather_features)
        $('<option>').val(val).text(weather_features[val][0]).appendTo(weaSelector);
}



var curr_flight = "Flights";
var curr_weather = "Avrg_Precipitation";
var curr_mode, curr_year, curr_month;
var legend, buttons;

function init() {
    draw({year:1998});
}

var xAxis, yAxisL, yAxisR;
var xScale, yScaleL, yScaleR;
function draw(params){
    var year = params.year + '';
    var month = params.month + '';
    var flight = params.flight;
    var weather = params.weather;
    var mode;
    if(year === 'undefined'){mode = "year";} 
    else if (month === 'undefined'){mode = "month";} 
    else {mode = "day";}
    var data = get_data(mode, year, month);
    if(mode !== curr_mode || year !== curr_year || month !== curr_month)
        draw_xAxis(mode,data, year, month);
        
    if(mode !== curr_mode || flight !== curr_flight) {
        flight = get_default(flight, curr_flight);
        draw_yAxisL(data, flight);
    }
    if(mode !== curr_mode || weather !== curr_weather) {
        weather = get_default(weather, curr_weather);
        draw_yAxisR(data, weather);
    }
    
    draw_legend(flight,weather);
    draw_buttons(mode,year,month);
    draw_data(mode, data, flight, weather);
    
    curr_flight = flight;
    curr_weather = weather;
    curr_mode = mode;
    curr_year = year;
    curr_month = month;
}
function fadeOut(element, duration, delay, removed){
    if(element ===  undefined) return;
    var trans = element.transition().delay(delay).duration(duration)
            .style("opacity",0).attr("opacity",0);
    if(removed === true) trans.remove();
}
function fadeIn(element, duration, delay, hide){
    if(element ===  undefined) return;
    if(hide === undefined || hide) 
        element.style("opacity",0).attr("opacity",0);
    element.transition().delay(delay).duration(duration)
            .style("opacity",1).attr("opacity",1);
}
function draw_xAxis(mode, data, year, month) {
    fadeOut(xAxis, 750, 0, true);
   
    var tickCount = {year:data.length, month: 12, day: 31};
    var domain = {
        year:[d3.min(data,xValue_funs[mode]),d3.max(data,xValue_funs[mode])], 
        month: [1,12], 
        day: [1,31]};
    var tickFormat = {
        year: function(d){return d;},
        month: function(d){return month_names[d-1];},
        day: function(d){return d;}
    };

    xScale = d3.scale.linear().range(xRange)
            .domain([
                domain[mode][0] - xCushion,
                domain[mode][1] + xCushion]);
    
    var axis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(tickCount[mode]).
            tickFormat(tickFormat[mode]);
    setTimeout(function(){
        xAxis = svg.append("g");
        xAxis.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (h - pb) + ")")
                .call(axis);
        fadeIn(xAxis, 750, 250);
        
        if(mode === "year") return;
        var text = '';
        if(mode === "day")
            text = month_fullnames[month-1];
        text += " " + year;
        
        draw_label(xAxis, text, 0, xCenter, h-5, 'x');
    },25);

}
function draw_yAxisL(data, feature){
    fadeOut(yAxisL, 1000, 0, true);
    var in_feature = "in_" + feature;
    var out_feature = "out_" + feature;
    yScaleL = d3.scale.linear().range(yRange)
            .domain([0,yCushion * d3.max(data, 
        function (d) {
            var a = d.values[in_feature];
            var b = d.values[out_feature];
            return a > b ? a : b;
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
function draw_yAxisR(data, feature){
    fadeOut(yAxisR, 1000, 0, true);
    
    yScaleR = d3.scale.linear().range(yRange)
            .domain([0,yCushion * d3.max(data, 
        function (d) {return d.values[feature];})]);
    
    var axis = d3.svg.axis()
            .scale(yScaleR)
            .orient("right");
    
    yAxisR = svg.append("g");
    yAxisR.append("g")
            .attr("class", "y axis right")
            .attr("transform", "translate(" + (w-pr) + ",0)")
            .call(axis);
    
    var text = weather_features[feature][0];
    var xAnchor = w - weather_features[feature][1];
    
    draw_label(yAxisR, text, 90, xAnchor, yCenter, 'y right',
        weather_features[feature][2]);
    fadeIn(yAxisR, 1000, 0, true);
}
function draw_data(mode,data, flight, weather) {
    var colW = (xScale(2) - xScale(1));
    var colH = h-pt-pb;
    var key = xValue_funs[mode];
    var xShift = function(d){return xScale(key(d)) - colW/2;};
    var count = data.length;
    var delay_scale = 500 / count;
    

    
    if(mode !== curr_mode) {
        temp = svg.selectAll('svg.entry.'+curr_mode)
            .transition().duration(750).ease('linear')
            .style("fill-opacity",0).style("stroke-opacity",0)
            .remove();
    }
    
    var selection = function(){return svg.selectAll('svg.entry.'+mode);};
    
    var entries = svg.selectAll('svg.entry.'+mode).data(data,key);
    entries.exit().transition().duration(750).ease('linear')
            .style("fill-opacity",0).style("stroke-opacity",0)
            .remove();
    
    var new_entries = entries.enter().append('svg')
            .attr("class","entry " + mode).attr("x",xShift)
            .on("mouseover",function(){
                d3.select(this).select('.bg_bar')
                .transition().ease("linear").duration(75)
                .style("opacity",0.20);
            }).on("mouseout",function(){
                d3.select(this).select('.bg_bar')
                .transition().duration(150)
                .style("opacity",0.0);
            }).on("click",function(d){
                var val = key(d)+'';
                if(mode === "year")
                    draw({year:val});
                else if (mode === "month")
                    draw({year:curr_year, month: val});
                if(mode !== "day")
                    d3.selectAll('.bg_bar').transition().duration(250)
                            .style("opacity",0);
            });
    
    
    setTimeout(function(){
        new_entries.append('rect')
            .attr("class", "bg_bar")
            .attr("y", pt).attr("height", colH)
            .attr("x",0).attr("width", colW);
    },1000);

    var barW = colW * colWidth_ratio;
    var barS = barW / 2 * colShift_ratio;
    var barX = (colW-barW) / 2;
    
    function draw_flight(feature, shift, idClass, color) {
        new_entries.append('rect')
                .attr("class","data " + idClass)
                .attr("y", bottom).attr("height", 0)
                .attr("x", barX + shift).attr("width", barW);
        selection().selectAll('rect.data.'+idClass).data(data,key)
                .transition()
                .delay(function(d,i){return i*delay_scale;})
                .duration(750)
                .style("fill",color)
                .attr("y", function (d) {return yScaleL(d.values[feature]);})
                .attr("height",function (d) {
                    return bottom - yScaleL(d.values[feature]);
                });
    }
    
    draw_flight("in_" + flight, barS, "in_bar", flight_features[flight][3]);
    draw_flight("out_" + flight, -barS, "out_bar", flight_features[flight][2]);
    
    var radius = colW/5;
    var dotS = colW/2;
    
    new_entries.append('circle')
            .attr("class","data wea_dot")
            .attr("cx",dotS)
            .attr("cy",0)
            .attr("r", radius);
    
    selection().selectAll('circle.data.wea_dot').data(data,key)
                .transition()
                .delay(function(d,i){return (data.length-i)*delay_scale;})
                .duration(750)
                .style("fill",weather_features[weather][2])
            .attr("cy", function (d) {
                var val = d.values[weather];
                return val === undefined ? yScaleR(0) : yScaleR(val);
            });
}
function draw_label(target, text,rotation, xAnchor, yAnchor, exClass, color) {
    if(color === undefined) color = "black";
    target.append('text').text(text)
            .style("fill", color)
            .attr("class", "label " + exClass)
            .attr("text-anchor", "middle")
            .attr("x", xAnchor)
            .attr("y", yAnchor)
            .attr("transform",
                    "rotate(" + rotation + "," + xAnchor + "," + yAnchor + ")");
}
function draw_legend(flight,weather) {
    fadeOut(legend, 1000, 0, true);
    
    var midpoint = 100;
    var lineHeight = 30;
    var barH = lineHeight/1.6;
    var barW = 30;
    var barX = midpoint + 20;

    legend = svg.append('svg').attr("class","legend")
            .attr("x",pl).attr("y",40);
    legend.append('rect').attr("class","bg_legend")
            .attr("height", 300).attr("width", 400);
    legend.append('rect').attr("class","in_bar")
            .style("fill",flight_features[flight][2])
            .attr("x",barX).attr("y",0)
            .attr("height",barH).attr("width",barW);
    legend.append('rect').attr("class","out_bar")
            .style("fill",flight_features[flight][3])
            .attr("x",barX).attr("y",barH+10)
            .attr("height",barH).attr("width",barW);
    legend.append('text').text('Flights leaving New Orleans')
            .attr("x",barX+barW+10).attr("y",lineHeight/2);
    legend.append('text').text('Flights heading to New Orleans')
            .attr("x",barX+barW+10).attr("y",lineHeight/2+barH+10);
    
    
    midpoint = 800;
    var circleR = barH/2+2;
    var circleX = midpoint -circleR - 10;
    var circleY = circleR;
    
    legend.append('text').text("Weather Feature")
            .attr("text-anchor","start")
            .attr("x",midpoint)
            .attr("y",lineHeight/2);
    
    legend.append('circle').attr("class","wea_dot")
            .attr("r",circleR).attr("cx", circleX).attr("cy",circleY)
            .style("fill",weather_features[weather][2]);
    fadeIn(legend, 750, 0, true);
}
function draw_buttons(mode,year,month) {
    fadeOut(buttons, 500, 0, true);
    if(mode === 'year') return;
    var rx = 30, ry = 25;
    var cx = pl/2 + rx;
    var cy = 30 + ry;
    buttons = svg.append('g');
    
    if(mode === 'month'){
        var max_year = d3.max(get_data('year'),xValue_funs['year']);
        var min_year = d3.min(get_data('year'),xValue_funs['year']);
        var prev = +year <= min_year? null : +year-1;
        var next = +year >= max_year? null : +year+1;
        var prev_click = function(){draw({year:prev});};
        var next_click = function(){draw({year:next});};
        var return_click = function(){draw({});};
    }else{
        var prev = +month <= 1? null : +month-1;
        var next = +month >= 12? null : +month+1;
        var prev_ = prev;
        var next_ = next;
        var prev_click = function(){draw({year:year,month:prev_});};
        var next_click = function(){draw({year:year,month:next_});};
        var return_click = function(){draw({year:year});};
        prev = month_names[prev-1];
        next = month_names[next-1];
    }
    
    if(prev !== null && prev_ !== null)
        make_button("PREV",prev, prev_click);
    
    cx = w-rx-pr/2;
    if(next !== null && next_ !== null)
        make_button("NEXT",next, next_click);
    
    cx = xCenter;
    rx = 40;
    if(return_click !== undefined)
    make_button("RETURN","RETURN", return_click);
    
    function make_button(text, hover, click){
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
        
        btn.on("mouseover",function(){
           btn.classed("hover",true);
           txt.text(hover);
           bg.transition().duration(250).attr("ry",
           function(){return d3.select(this).attr("rx");});
        }).on("mouseout",function(){
           btn.classed("hover",false);
           txt.text(text);
           bg.transition().duration(250).ease('linear').attr("ry",ry);
        }).on("click",click);
        return btn;
    }
}