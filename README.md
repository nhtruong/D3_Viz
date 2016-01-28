# Louis Armstrong International Airport's Operation and Hurricane Katrina

## Summary
The visualization provided by this project demonstrates how big of an impact Hurricane Katrina had on New Orleans's primary 
port of air transportation. Some weather data are also provided for reference.

The data was gathered from two different sources (check Resources for more info). Most of the data processing were done in R
(This includes filtering, merging, cleaning, and some aggregations). The rest of the processing was done in D3 so that I can practice data manipulation in using this library.

The chart was drawn using pure D3. No other graphing libraries were incorporated.

The UI used JQuery UI for buttons and Bootstrap for layout.

## Design
The 20 years worth of data is grouped into years, months and days. For each period of time, one flight feature can be shown.
The flight data are represented as columns. Each data entry is presented by two columns: One presenting flights to land at the airport,
the other represents flights to take off at the airport. Additionally, the user can also select a weather feature to accompany 
the graph. This feature is only supplementary and is presented as a dot for each data entry.


SMALL DESIGN CHOICES AFTER RECEIVING FEEDBACK:
* A narration will play automatically when the page is loaded to guide the user through the chart and show the effects Katrina had
on the operation of the airport. This narration can be skipped. After the narration, the user is free to explore the chart.
* Dropdown Boxes were originally used to select data features. They were later replace with Radio Buttons, which are transformed
into Buttons Sets using JQuery UI. This change halves the number of mouse clicks needed to change a feature on the graph.
* The size of the chart was reduced. The feature selectors were moved to from the bottom to the left of the chart. This was to avoid
the vertical scrollbar.
* Bootstrap were also used to accomodate smaller displays.

## Feedback
I showed the visualization to 3 different people (Friends and coworkers). Below is a summary of their feedback.
#### First Sketch:
* Colorful and clear looking chart.
* There are so many graphs. What should the viewer focus on?
* Other than refreshing the page, there's no way to return to the previous view.
* A legend box is needed. It's impossible to tell what the different colored bars mean.
* The graph is unnecessarily big. It doesn't look nice on smaller or low-resolution screens.
* 
#### Final Product:
* The narration is nice. Automatic transition during narration is really cool.
* You could add Next/Prev buttons for the Narration (Note: Though this is a valid point, I'm not adding these buttons due
to time constrain)

## Resources
#### Data Sources:
* The flight data was collected from http://stat-computing.org/dataexpo/2009/the-data.html
* The weather data was collected from http://www.ncdc.noaa.gov/cdo-web/search?datasetid=GHCND

This 10GB of raw data is condensed into a  CSV file by the Extractor.r script. This CSV file, named "MSY.csv", is used
as the data source for the chart.

#### Coding References:
* http://alignedleft.com/tutorials/d3
* http://blog.greatrexpectations.com/2015/06/12/faking-mouse-events-in-d3/
* http://stackoverflow.com/questions/30291452/d3-transitions-between-classes
* https://github.com/mbostock/d3/wiki/API-Reference
* http://www.w3schools.com/svg/svg_reference.asp
