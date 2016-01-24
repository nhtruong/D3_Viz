/* global d3 */
"use strict";

/* ------------------- LOAD THE DATA ---------------------------------------- */

var data = {};
var dataSource = "../data/MSY.csv";

d3.csv(dataSource, function (d) {
    dataSource = d;
    process_data();
    init();
});

function process_data() {
    var agg_year = d3.nest().rollup(function (d){return aggregate(d);})
            .key(function (d) {return d.Year;});
    var agg_month = d3.nest().rollup(function (d){return aggregate(d);})
            .key(function (d) {return [d.Year,d.Month];});
    var agg_day = d3.nest().rollup(function (d){return aggregate(d);})
            .key(function (d) {return [d.Year,d.Month,d.Day];});
    
    data["year"] = agg_year.entries(dataSource);
    data["month"] = agg_month.entries(dataSource);
    data["day"] = agg_day.entries(dataSource);
}

function aggregate(d){
    var r = {};
    
    r.out_Flights = d3.sum(d, function(g){return g.out_Flights;});
    r.out_Total_Cancelled = d3.sum(d, function(g){return g.out_Cancelled;});
    r.out_Total_Diverted = d3.sum(d, function(g){return g.out_Diverted;});
    r.out_Total_Delayed = d3.sum(d, function(g){return g.out_Delayed;});
    r.out_Total_DivCan = r.out_Total_Cancelled + r.out_Total_Diverted;
    
    r.out_Perc_Cancelled = r.out_Total_Cancelled / r.out_Flights * 100;
    r.out_Perc_Diverted = r.out_Total_Diverted / r.out_Flights * 100;
    r.out_Perc_Delayed = r.out_Total_Delayed / r.out_Flights * 100;
    r.out_Perc_DivCan = r.out_Total_DivCan / r.out_Flights * 100;
    
    
    r.in_Flights = d3.sum(d, function(g){return g.in_Flights;});
    r.in_Total_Cancelled = d3.sum(d, function(g){return g.in_Cancelled;});
    r.in_Total_Diverted = d3.sum(d, function(g){return g.in_Diverted;});
    r.in_Total_Delayed = d3.sum(d, function(g){return g.in_Delayed;});
    r.in_Total_DivCan = r.in_Total_Cancelled + r.in_Total_Diverted;
    
    r.in_Perc_Cancelled = r.in_Total_Cancelled / r.in_Flights * 100;
    r.in_Perc_Diverted = r.in_Total_Diverted / r.in_Flights * 100;
    r.in_Perc_Delayed = r.in_Total_Delayed / r.in_Flights * 100;
    r.in_Perc_DivCan = r.in_Total_DivCan / r.in_Flights * 100;
    
    
    r.Days_Fog = d3.sum(d, function(g){return g.Fog;});
    r.Days_Mist = d3.sum(d, function(g){return g.Mist;});
    r.Days_Rain = d3.sum(d, function(g){return g.Rain;});
    r.Days_Hail = d3.sum(d, function(g){return g.Hail;});
    r.Days_Thunder = d3.sum(d, function(g){return g.Thunder;});
    r.Days_Tornado = d3.sum(d, function(g){return g.Tornado;});
    
    r.Avrg_Precipitation = d3.mean(d, function(g){return g.PRCP;});
    r.Avrg_MaxTemperature = d3.mean(d, function(g){return g.TMAX;});
    r.Avrg_MinTemperature = d3.mean(d, function(g){return g.TMIN;});
    r.Avrg_WindSpeed = d3.mean(d, function(g){return g.AWND;});
    
    return r;
}

var flight_labels = {
    Flights: ["Number of Flights",20],
    Total_Cancelled:["Flights Cancelled",30],
    Total_Diverted: ["Flights Diverted",30],
    Total_Delayed: ["Flights Delayed",30],
    Total_DivCan: ["Flights Diverted or Cancelled",30],
    
    Perc_Cancelled: ["Percent of Cancelled Flights",30],
    Perc_Diverted: ["Percent of Diverted Flights",30],
    Perc_Delayed: ["Percent of Delayed Flights",30],
    Perc_DivCan: ["Percent of Diverted and Cancelled Flights",30]
};

var weather_labels = {
    Days_Fog: ["Days with Fog or Smoke",20],
    Days_Mist:["Days with Mist or Haze",30],
    Days_Rain: ["Days with Rain",30],
    Days_Hail: ["Days with Hail or Sleet",30],
    Days_Thunder: ["Days with Thunder",30],
    Days_Tornado: ["Days with Tornado, or Damaging Wind",30],
    
    Avrg_Precipitation: ["Average Precipitation (in Millimeters)",20],
    Avrg_MaxTemperature:["Average Max Temperature (in Celcius)",30],
    Avrg_MinTemperature: ["Average Min Temperature (in Celcius)",30],
    Avrg_WindSpeed: ["Average Windspeed (in Meters per Second)",30]
};
var month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var colorSet_1 = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c',
    '#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99'];
var colorSet_2 = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462',
    '#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5'];