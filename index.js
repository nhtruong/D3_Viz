/* global d3 */
"use strict";

/* ------------------- LOAD THE DATA ---------------------------------------- */

var flyIn, flyOut, weather;
var remaining_files = 3;
var flyIn_file = "data/fly_in.csv";
var flyOut_file = "data/fly_out.csv";
var weather_file = "data/fly_weather.csv";

console.log("Start Loading Files");
d3.csv(flyIn_file, function (data) {
    flyIn = data;
    remaining_files--;
});
d3.csv(flyOut_file, function (data) {
    flyOut = data;
    remaining_files--;
});
d3.csv(weather_file, function (data) {
    weather = data;
    remaining_files--;
});

var wait2load = setInterval(function () {
    if (remaining_files)
        return;
    clearInterval(wait2load);
    console.log("All Files Have Been Loaded");
    process_data();
    init();
}, 50);

var flyIn_year, flyOut_year, weather_year;
var flyIn_month, flyOut_month, weather_month;
var flyIn_day, flyOut_day, weather_day;

function process_data() {
    var agg_year = d3.nest()
            .rollup(function (d){return aggregate_flights(d);})
            .key(function (d) {return d.Year;});
    var agg_month = d3.nest()
            .rollup(function (d){return aggregate_flights(d);})
            .key(function (d) {return [d.Year,d.Month];});
    var agg_day = d3.nest().rollup(function (d){return aggregate_flights(d);})
            .key(function (d) {return [d.Year,d.Month,d.Day];});
    
    flyIn_year = agg_year.entries(flyIn);
    flyIn_month = agg_month.entries(flyIn);
    flyIn_day = agg_day.entries(flyIn);
    
    flyOut_year = agg_year.entries(flyOut);
    flyOut_month = agg_month.entries(flyOut);
    flyOut_day = agg_day.entries(flyOut);
    
    weather_year = d3.nest()
            .rollup(function (d){return aggregate_weather(d);})
            .key(function (d) {return d.Year;}).entries(weather);
    weather_month = d3.nest()
            .rollup(function (d){return aggregate_weather(d);})
            .key(function (d) {return [d.Year,d.Month];}).entries(weather);
    weather_day = d3.nest()
            .rollup(function (d){return aggregate_weather(d);})
            .key(function (d) {return [d.Year,d.Month,d.Day];}).entries(weather);
}
function aggregate_flights(d){
    var r = {};
    
    r.Flights = d3.sum(d, function(g){return g.Flights;});
    r.Total_Cancelled = d3.sum(d, function(g){return g.Cancelled;});
    r.Total_Diverted = d3.sum(d, function(g){return g.Diverted;});
    r.Total_Delayed = d3.sum(d, function(g){return g.Delayed;});
    r.Total_Taxi = d3.sum(d, function(g){return g.Taxi;})/100;
    r.Total_DelCan = r.Total_Cancelled + r.Total_Delayed;
    
    r.Perc_Cancelled = r.Total_Cancelled / r.Flights * 100;
    r.Perc_Diverted = r.Total_Diverted / r.Flights * 100;
    r.Perc_Delayed = r.Total_Delayed / r.Flights * 100;
    r.Perc_DelCan = r.Total_DelCan / r.Flights * 100;
    r.Avrg_Taxi = r.Total_Taxi / r.Flights * 100;
    
    return r;
}
function aggregate_weather(d){
    var r = {};
    
    r.Days_Fog = d3.sum(d, function(g){return g.Fog;});
    r.Days_Mist = d3.sum(d, function(g){return g.Mist;});
    r.Days_Rain = d3.sum(d, function(g){return g.Rain;});
    r.Days_Hail = d3.sum(d, function(g){return g.Hail;});
    r.Days_Thunder = d3.sum(d, function(g){return g.Thunder;});
    r.Days_Tornado = d3.sum(d, function(g){return g.Tornado;});
    
    r.Avrg_Precipication = d3.mean(d, function(g){return g.PRCP;});
    r.Avrg_MaxTemperature = d3.mean(d, function(g){return g.TMAX;});
    r.Avrg_MinTemperature = d3.mean(d, function(g){return g.TMIN;});
    r.Avrg_MinTemperature = d3.mean(d, function(g){return g.TMIN;});
    r.Avrg_WindSpeed = d3.mean(d, function(g){return g.AWND;});
    r.Avrg_Top2MinsWindSpeed = d3.mean(d, function(g){return g.WSF2;});
    r.Avrg_Top5SecsWindSpeed = d3.mean(d, function(g){return g.WSF2;});
    
    return r;
}

var flight_labels = {
    Flights: ["Number of Flights",20],
    Total_Cancelled:["Flights Cancelled",30],
    Total_Diverted: ["Flights Diverted",30],
    Total_Delayed: ["Flights Delayed",30],
    Total_DelCan: ["Flights Delayed or Cancelled",30],
    Total_Taxi: ["Total Taxi Time (In Hundred Minutes)",30],
    
    Perc_Cancelled: ["Percent of Cancelled Flights",30],
    Perc_Diverted: ["Percent of Diverted Flights",30],
    Perc_Delayed: ["Percent of Delayed Flights",30],
    Perc_DelCan: ["Percent of Delayed and Cancelled Flights",30],
    Avrg_Taxi: ["Average Taxi Time (In Minutes)",30]
};
var month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var colorSet_1 = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c',
    '#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99'];
var colorSet_2 = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462',
    '#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5'];
/* --------------------------  Setup Layout  -------------------------------- */

var w = 1200, h = 640;
var pt = 20, pr = 70, pb = 40, pl = 70;
var xRange = [pl,w-pr];
var yRange = [h-pb,pt];
var xCenter = (w-pr-pl)/2+pl;
var yCenter = (h-pt-pb)/2+pt;
var xCushion = .75;
var yCushion = 1.1;
var colWidth_ratio = 0.50;
var colShift_ratio = 0.25;

var svg = d3.select("body").append("svg").style("width", w).style("height", h);

var header = $('<div>').prependTo($('body')).addClass("header");
var footer = $('<div>').appendTo($('body')).addClass("footer");

var flySelector = $('<select>').appendTo(footer).change(function(){
    draw_flight($(this).val(),"2006","3");
});
for(var val in flight_labels)
    $('<option>').val(val).text(flight_labels[val][0]).appendTo(flySelector);

var yearSelector = $('<select>').appendTo(footer).change(function(){
    draw_flight(curr_field_left,$(this).val(),curr_month);
});
for(var year = 2002; year <= 2008; year++)
    $('<option>').val(year).text(year).appendTo(yearSelector);

var monthSelector = $('<select>').appendTo(footer).change(function(){
    draw_flight(curr_field_left,curr_year,$(this).val());
});
for(var year = 1; year <= 12; year++)
    $('<option>').val(year).text(year).appendTo(monthSelector);

curr_month = 1;
curr_year = 2002;
/* ----------------------- SETUP SVG ---------------------------------------- */

var xValue_year = function(d){return +d.key;};
var xValue_month = function(d){return +d.key.split(",")[1];};
var xValue_day = function(d){return +d.key.split(",")[2];};



function init() {
    draw_flight("Perc_DelCan","2002");
    
}

function filter_year(data, year){
    return data.filter(function(d){return d.key.split(",")[0]===year;});
};
function filter_month(data,year, month){
    return data.filter(function(d){
        var YMD = d.key.split(",");
        return YMD[0]===year && YMD[1]===month;
    });
};


var curr_mode, curr_field_left, curr_field_right;
var curr_year, curr_month;
var xScale, yScaleLeft, yScaleRight;
var xAxis, yAxisLeft, yAxisRight;
var xLabel, yLabelLeft, yLabelRight;
var colorIn, colorOut;

function draw_flight(field,year,month) {
    var mode, data_flyIn, data_flyOut, key;
    
    if (year === undefined) {
        mode = "Year";
        data_flyIn = flyIn_year;
        data_flyOut = flyOut_year;
        key = xValue_year;
    } else if (month === undefined) {
        mode = "Month";
        data_flyIn = filter_year(flyIn_month,year);
        data_flyOut = filter_year(flyOut_month,year);
        key = xValue_month;
    } else {
        mode = "Day";
        data_flyIn = filter_month(flyIn_day,year,month);
        data_flyOut = filter_month(flyOut_day,year,month);
        key = xValue_day;
    }
    
    draw_xAxis(mode);
    draw_yAxisLeft(mode,field);
     
    draw_bars(data_flyIn, key, field, +colShift_ratio, "flyIn", colorSet_1);
    draw_bars(data_flyOut, key, field, -colShift_ratio, "flyOut", colorSet_2);
    
    curr_mode = mode;
    curr_field_left = field;
    curr_month = month;
    curr_year = year;

}

function draw_bars(data,key, field, shift_ratio, exClass, colors) {
    var col_width = (xScale(2) - xScale(1)) * colWidth_ratio;
    var col_bottom = yScaleLeft(0);
    var col_shift = col_width * shift_ratio;
    
    var bars = svg.selectAll('rect.bar.' + exClass)
            .data(data,key);
    
    bars.exit().transition().duration(500)
            .attr("y", col_bottom).attr("height", 0)
            .style("fill-opacity",0).style("stroke-opacity",0).remove();
    
        
    bars.enter().append('rect')
            .attr("class", "bar " + exClass)
            .attr("y", col_bottom).attr("height", 0);

    bars.attr("x", function (d) {
        return xScale(key(d)) - col_width / 2 + col_shift;
    }).attr("width", col_width);      
            
    var trans = bars.transition().duration(function (d, i) {
        return 100 + i * 50;
    })
            .attr("y", function (d) {
                return yScaleLeft(d.values[field]);
            }).attr("height", function (d) {
        return col_bottom - yScaleLeft(d.values[field]);
    }).style("fill-opacity", 1).style("stroke-opacity", 1);
            
    
    if(field !== curr_field_left) {
        var color = colors.sort(function(){return 0.5 - Math.random();})[0]; 
        trans.style("fill",color);
    } else {
        var color = bars.style("fill");
        bars.style("fill",color);
    }
    
}
function draw_xAxis(mode){
    if(mode === curr_mode) return;
    if(xAxis !== undefined) xAxis.remove();
    
    var ticksCount = {Year:flyIn_year.length, Month: 12, Day: 31};
    var domain = {
        Year:[d3.min(flyIn_year,xValue_year),d3.max(flyIn_year,xValue_year)], 
        Month: [1,12], 
        Day: [1,31]};
    var ticketFormat = {
        Year: function(d){return d;},
        Month: function(d){return month_names[d-1];},
        Day: function(d){return d;}
    };
    
    xScale = d3.scale.linear().range(xRange)
            .domain([
                domain[mode][0] - xCushion,
                domain[mode][1] + xCushion]);
    
    var axis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(ticksCount[mode]).
            tickFormat(ticketFormat[mode]);
    xAxis = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (h - pb) + ")")
            .call(axis);
}


function draw_yAxisLeft(mode, field){
    if(mode === curr_mode && field === curr_field_left) return;
    if(yAxisLeft !== undefined) yAxisLeft.remove();
    if(yLabelLeft !== undefined) yLabelLeft.remove();
    
    var data = {
        Year: flyIn_year.concat(flyOut_year), 
        Month: flyIn_month.concat(flyOut_month), 
        Day: flyIn_day.concat(flyOut_day)};
    
    yScaleLeft = d3.scale.linear().range(yRange)
            .domain([0,
        yCushion * d3.max(data[mode], function (d) {return d.values[field];})]);

    
    var axis = d3.svg.axis()
            .scale(yScaleLeft)
            .orient("left");
    yAxisLeft = svg.append("g")
            .attr("class", "y axis left")
            .attr("transform", "translate("+pl+",0)")
            .call(axis);
    
    var label = flight_labels[field][0];
    var xAnchor = flight_labels[field][1];
    yLabelLeft = draw_label(label, xAnchor, yCenter, -90, 'y left');
}

function draw_yAxisRight(mode, field) {}

function draw_label(text, xAnchor, yAnchor, rotation, exClass) {
    var ele = svg.append('text').text(text)
            .attr("class", "label " + exClass)
            .attr("text-anchor", "middle")
            .attr("x", xAnchor)
            .attr("y", yAnchor)
            .attr("transform",
                    "rotate(" + rotation + "," + xAnchor + "," + yAnchor + ")");
    return ele;
} 








