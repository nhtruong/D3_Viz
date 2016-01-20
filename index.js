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
    init();
}, 50);

var flyIn_year, flyOut_year, weather_year;
var flyIn_month, flyOut_month, weather_month;

function init() {
    var agg_year = d3.nest()
            .rollup(function (d){return aggregate_fly(d);})
            .key(function (d) {return d.Year;});
    var agg_month = d3.nest()
            .rollup(function (d){return aggregate_fly(d);})
            .key(function (d) {return [d.Year,d.Month];});
    
    flyIn_year = agg_year.entries(flyIn);
    flyIn_month = agg_month.entries(flyIn);
    flyOut_year = agg_year.entries(flyOut);
    flyOut_month = agg_month.entries(flyOut);
    
    weather_year = d3.nest()
            .rollup(function (d){return aggregate_weather(d);})
            .key(function (d) {return d.Year;}).entries(weather);
    weather_month = d3.nest()
            .rollup(function (d){return aggregate_weather(d);})
            .key(function (d) {return [d.Year,d.Month];}).entries(weather);
}

function aggregate_fly(d){
    var r = {};
    
    r.Flights = d3.sum(d, function(g){return g.Flights;});
    r.Total_Cancelled = d3.sum(d, function(g){return g.Cancelled;});
    r.Total_Diverted = d3.sum(d, function(g){return g.Diverted;});
    r.Total_Delayed = d3.sum(d, function(g){return g.Delayed;});
    r.Total_Taxi = d3.sum(d, function(g){return g.Taxi;});
    
    r.Perc_Cancelled = r.Cancelled / r.Flights * 100;
    r.Perc_Diverted = r.Diverted / r.Flights * 100;
    r.Perc_Delayed = r.Delayed / r.Flights * 100;
    r.Avrg_Taxi = r.Taxi / r.Flights;
    
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

/* ----------------------- SETUP SVG ---------------------------------------- */

var w = 980, h = 640;

var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

/* ----------------------- SETUP SVG ---------------------------------------- */










