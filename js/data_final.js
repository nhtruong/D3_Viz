/* global d3 */
"use strict";

/* ------------------- LOAD THE DATA ---------------------------------------- */

var all_data = {};
var dataSource = "data/MSY.csv";

// Read the csv file. Process the data and call init function when done.
d3.csv(dataSource, function (d) {
    dataSource = d;
    process_data();
    init();
});

// Group data by day/month/year to calculate the aggregated data
function process_data() {
    var agg_year = d3.nest().rollup(function (d){return aggregate(d);})
            .key(function (d) {return d.Year;});
    var agg_month = d3.nest().rollup(function (d){return aggregate(d);})
            .key(function (d) {return [d.Year,d.Month];});
    var agg_day = d3.nest().rollup(function (d){return aggregate(d);})
            .key(function (d) {return [d.Year,d.Month,d.Day];});
    
    all_data["year"] = agg_year.entries(dataSource);
    all_data["month"] = agg_month.entries(dataSource);
    all_data["day"] = agg_day.entries(dataSource);
}


// Aggregate Grouped Data
function aggregate(d){
    var r = {};
    
    r.out_Flights = d3.sum(d, function(g){return g.out_Flights;});
    
    r.out_Total_Cancelled = d3.sum(d, function(g){return g.out_Cancelled;});
    r.out_Total_Diverted = d3.sum(d, function(g){return g.out_Diverted;});
    r.out_Total_Delayed = d3.sum(d, function(g){return g.out_Delayed;});
    
    r.out_Perc_Cancelled = r.out_Total_Cancelled / r.out_Flights * 100;
    r.out_Perc_Diverted = r.out_Total_Diverted / r.out_Flights * 100;
    r.out_Perc_Delayed = r.out_Total_Delayed / r.out_Flights * 100;
    
    
    r.in_Flights = d3.sum(d, function(g){return g.in_Flights;});
    
    r.in_Total_Cancelled = d3.sum(d, function(g){return g.in_Cancelled;});
    r.in_Total_Diverted = d3.sum(d, function(g){return g.in_Diverted;});
    r.in_Total_Delayed = d3.sum(d, function(g){return g.in_Delayed;});
    
    r.in_Perc_Cancelled = r.in_Total_Cancelled / r.in_Flights * 100;
    r.in_Perc_Diverted = r.in_Total_Diverted / r.in_Flights * 100;
    r.in_Perc_Delayed = r.in_Total_Delayed / r.in_Flights * 100;
    
    r.Avrg_Precipitation = d3.mean(d, function(g){return g.PRCP;});
    r.Avrg_MaxTemperature = d3.mean(d, function(g){return g.TMAX;});
    r.Avrg_MinTemperature = d3.mean(d, function(g){return g.TMIN;});
    r.Avrg_WindSpeed = d3.mean(d, function(g){return g.AWND;});
    
    return r;
}

// Retrieve data depending on mode of a certain year and/or month
function get_data(mode,year,month){
    var data = all_data[mode];
    if(mode === "year")
        return data;
    if(mode === "month")
        return data.filter(function(d){return d.key.split(",")[0]===year;});
    if(mode === "day")
        return data.filter(function(d){
            var YMD = d.key.split(",");
            return YMD[0] === year && YMD[1] === month;
        });
    return ["nada"];
}

// Functions to get X Value of each data entry
var xValue_funs = {
    year: function(d){return +d.key;},
    month:function(d){return +d.key.split(",")[1];},
    day: function(d){return +d.key.split(",")[2];}
};

var flight_features = {
    Flights: ["Number of Flights",15],
    Total_Cancelled:["Flights Cancelled",20],
    Total_Diverted: ["Flights Diverted",25],
    Total_Delayed: ["Flights Delayed",20],
    
    Perc_Cancelled: ["Percent of Cancelled Flights",30],
    Perc_Diverted: ["Percent of Diverted Flights",30],
    Perc_Delayed: ["Percent of Delayed Flights",30]
};

var weather_features = {
    Avrg_Precipitation: ["Average Precipitation (in Millimeters)",25],
    Avrg_WindSpeed: ["Average Windspeed (in Meters per Second)",25],
    Avrg_MinTemperature: ["Average Min Temperature (in Celcius)",30],
    Avrg_MaxTemperature:["Average Max Temperature (in Celcius)",30]
};

var colorSets = [
    ['#b3cde3','#ccebc5','#decbe4','#fed9a6'
        ,'#e5d8bd','#fddaec','#fbb4ae'],
    ['#377eb8','#4daf4a','#984ea3','#ff7f00'
        ,'#a65628','#f781bf','#e41a1c'],
    ['#e41a1c','#377eb8','#984ea3','#4daf4a']
    ];
    

// Assign colors to flight and weather features
for(var key in flight_features){
    flight_features[key].push(colorSets[0].pop());
    flight_features[key].push(colorSets[1].pop());
}
for(var key in weather_features){
    weather_features[key].push(colorSets[2].pop());
}


var month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; 

var month_fullnames = ["January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"];  
 
 
 

// Test if a value (val) is empty and assign the default value (def) accordingly
function get_default(val, def){
    if(val === null || val === undefined)
        return def;
    return val;
}

// Helper function to trigger SVG events
$.fn.triggerSVGEvent = function (eventName) {
    if($(this) === undefined) return;
    var event = document.createEvent('SVGEvents');
    event.initEvent(eventName, true, true);
    this[0].dispatchEvent(event);
    return $(this);
};

// Helper function to write to console;
function log(msg){console.log(msg);}

// Helper funtion to fade out D3 elements
function fadeOut(element, duration, delay, removed) {
    if (element === undefined)
        return;
    var trans = element.transition().delay(delay).duration(duration)
            .style("opacity", 0).attr("opacity", 0);
    if (removed === true)
        trans.remove();
}
// Helper funtion to fade in D3 elements
function fadeIn(element, duration, delay, hide) {
    if (element === undefined)
        return;
    if (hide === undefined || hide)
        element.style("opacity", 0).attr("opacity", 0);
    element.transition().delay(delay).duration(duration)
            .style("opacity", 1).attr("opacity", 1);
}