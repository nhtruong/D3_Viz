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

/* ----------------------- SETUP SVG ---------------------------------------- */

var w = 1200, h = 640;
var pt = 20, pr = 70, pb = 40, pl = 70;
var xRange = [pl,w-pr];
var yRange = [h-pb,pt];
var xCenter = (w-pr-pl)/2+pl;
var yCenter = (h-pt-pb)/2+pt;
var xCushion = .75;
var yCushion = 1.0;
var colWidth_ratio = 0.50;
var colShift_ratio = 0.25;

var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

/* ----------------------- SETUP SVG ---------------------------------------- */

var key_year = function(d){return +d.key;};
var key_month = function(d){return +d.key.split(",")[1];};
var key_day = function(d){return +d.key.split(",")[2];};



function init() {
    draw_flight_day("Perc_DelCan","2005","3");
    
}

function draw_flight_year(field){
    var params = {};
    params.field = field;
    params.data_flyIn = flyIn_year;
    params.data_flyOut = flyOut_year;
    params.data = flyIn_year.concat(flyOut_year);
    params.key = key_year;
    params.by = "Year";
    draw_flight(params);
}
function draw_flight_month(field,year) {
    var params = {};
    params.field = field;
    params.data_flyIn = filter_year(flyIn_month,year);
    params.data_flyOut = filter_year(flyOut_month,year);
    params.data = flyIn_month.concat(flyOut_month);
    params.key = key_month;
    params.by = "Month";
    draw_flight(params);
}
function draw_flight_day(field,year,month) {
    var params = {};
    params.field = field;
    params.data_flyIn = filter_month(flyIn_day,year,month);
    params.data_flyOut = filter_month(flyOut_day,year,month);
    params.data = flyIn_day.concat(flyOut_day);
    params.key = key_day;
    params.by = "Day";
    draw_flight(params);
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

var mode;
var xScale, yScale;
var xAxis, yAxisLeft, yAxisRight;


function draw_flight(params) {
    var data_flyIn = params.data_flyIn;
    var data_flyOut = params.data_flyOut;
    var data = params.data;
    var field = params.field;
    var label = flight_labels[field][0];
    var lbl_pad = flight_labels[field][1];
    var by = params.by;
    var key = params.key;
    
    mode = by;
    
    var xScale = d3.scale.linear().rangeRound(xRange)
            .domain([
        d3.min(data, key)-xCushion,
        d3.max(data, key)-(-xCushion)
    ]);

    var yScale = d3.scale.linear().rangeRound(yRange)
            .domain([
        0,
        yCushion * d3.max(data, function (d) {return d.values[field];})]);
                                        
    xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(data_flyIn.length).
            tickFormat(function(d){ 
                if(by === "Month")
                    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d-1];
                else
                    return d;
            });
    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (h - pb) + ")")
            .call(xAxis);
    
    yAxisLeft = d3.svg.axis()
            .scale(yScale)
            .orient("left");
    svg.append("g")
            .attr("class", "y axis left")
            .attr("transform", "translate("+pl+",0)")
            .call(yAxisLeft);
    
    draw_bars(data_flyIn,key, field, xScale, yScale, +colShift_ratio, "flyIn");
    draw_bars(data_flyOut,key, field, xScale, yScale,-colShift_ratio, "flyOut");
    draw_label(label, lbl_pad, yCenter, -90, 'y');

}

function draw_bars(data,key, field, xScale, yScale, shift_ratio, exClass) {
    var col_width = (xScale(2) - xScale(1)) * colWidth_ratio;
    var col_bottom = yScale(0);
    var col_shift = col_width * shift_ratio;
    
    var bars = svg.selectAll('rect.' + exClass).data(data,key);
    
    bars.enter()
            .append('rect')
            .attr("class", "bar " + exClass)
            .attr("x", function (d) {
                return xScale(key(d)) - col_width/2 + col_shift;
            }).attr("width", function () {
                return col_width;
            }).attr("y", col_bottom).attr("height", 0);
            
    bars.transition().duration(function(d,i){return 100+i*50;})
            .attr("y", function (d) {
                return yScale(d.values[field]);
            }).attr("height", function (d) {
        return col_bottom - yScale(d.values[field]);
    }).style("fill-opacity", 1).style("stroke-opacity", 1);
            
    bars.exit().transition().duration(1000)
            .style("fill-opacity",0).style("stroke-opacity",0);
    bars.exit().transition().delay(1000).remove();
}

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








