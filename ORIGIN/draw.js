/* global d3,all_data, flight_features, weather_features, 
 * global month_names, colorSets, xValue_funs, month_names */

"use strict";

var temp;

var w = 1200, h = 640;
var pt = 20, pr = 70, pb = 40, pl = 70;
var bottom = h-pb;
var xRange = [pl,w-pr];
var yRange = [h-pb,pt];
var xCenter = (w-pr-pl)/2+pl;
var yCenter = (h-pt-pb)/2+pt;
var xCushion = .75;
var yCushion = 1.1;
var colWidth_ratio = 0.50;
var colShift_ratio = 0.50;

var svg = d3.select("body").append("svg").style("width", w).style("height", h);
var header = $('<div>').prependTo($('body')).addClass("header");
var footer = $('<div>').appendTo($('body')).addClass("footer");

var curr_weather = "Avrg_Precipitation";
var curr_flight = "Perc_DivCan";
var curr_mode, curr_year, curr_month;

function init() {
    draw();
}

var xAxis, yAxisL, yAxisR;
var xScale, yScaleL, yScaleR;
function draw(year, month,flight,weather){
    var mode;
    if(year === undefined){mode = "year";} 
    else if (month === undefined){mode = "month";} 
    else {mode = "day";}
    
    var data = get_data(mode, year, month);
    
    if(mode !== curr_mode)
        draw_xAxis(mode,data);
    
    if(mode !== curr_mode || flight !== curr_flight) {
        flight = get_default(flight, curr_flight);
        draw_yAxisL(data, flight);
    }
    
    if(mode !== curr_mode || weather !== curr_weather) {
        weather = get_default(weather, curr_weather);
        draw_yAxisR(data, weather);
    }
    
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

function draw_xAxis(mode, data) {
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
    
    xAxis = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (h - pb) + ")")
            .call(axis);
    fadeIn(xAxis,750,250);
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
    
    draw_label(yAxisL, text, -90, xAnchor, yCenter, 'y left');
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
    
    draw_label(yAxisR, text, 90, xAnchor, yCenter, 'y right');
    fadeIn(yAxisR, 1000, 0, true);
}
function draw_label(target, text,rotation, xAnchor, yAnchor, exClass) {
    target.append('text').text(text)
            .attr("class", "label " + exClass)
            .attr("text-anchor", "middle")
            .attr("x", xAnchor)
            .attr("y", yAnchor)
            .attr("transform",
                    "rotate(" + rotation + "," + xAnchor + "," + yAnchor + ")");
}

function draw_data(mode,data, flight, weather) {
    var colW = (xScale(2) - xScale(1));
    var colH = h-pt-pb;
    var key = xValue_funs[mode];
    var xShift = function(d){return xScale(key(d)) - colW/2;};
    var count = data.length;
    var delay_scale = 1000 / count;
    
    var entries = svg.selectAll('svg.entry').data(data,key);

    entries.exit().transition().duration(750).ease('linear')
            .style("fill-opacity",0).style("stroke-opacity",0)
            .remove();
    
    var new_entries = entries.enter().append('svg')
            .attr("class","entry")
            .attr("x",xShift)
            .on("mouseover",function(){
                d3.select(this).select('.bg_bar')
                .transition().ease("linear").duration(75)
                .style("opacity",0.4);
            }).on("mouseout",function(){
                d3.select(this).select('.bg_bar')
                .transition().duration(150)
                .style("opacity",0.0);
            }).on("click",function(d){
                var val = key(d)+'';
                if(mode === "year")
                    draw(val);
                else if (mode === "month")
                    draw(curr_year, val);
                d3.selectAll('.bg_bar').transition().duration(250)
                        .style("opacity",0)
                        .remove();
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
    
    function draw_flight(feature, shift, idClass) {
        new_entries.append('rect')
                .attr("class", idClass)
                .attr("y", bottom).attr("height", 0)
                .attr("x", barX + shift).attr("width", barW);
        
        svg.selectAll('rect.'+idClass).data(data,key)
                .transition()
                .delay(function(d,i){return i*delay_scale;})
                .duration(750)
                .attr("y", function (d) {return yScaleL(d.values[feature]);})
                .attr("height",function (d) {
                    return bottom - yScaleL(d.values[feature]);
                });
    }
    
    draw_flight("in_" + flight, barS, "in_bar");
    draw_flight("out_" + flight, -barS, "out_bar");
    
    


}