# Louis Armstrong International Airport's Operation and Hurricane Katrina

## Summary
The visualization provided by this project demonstrates how big of an impact Hurricane Katrina had on New Orleans's primary 
port of air transportation. Some weather data are also provided for reference.

The data was gathered from two different sources (check Resources for more info). Most of the data processing were done in R
(This includes filtering, merging, cleaning, and some aggregations). The rest of the processing was done in D3 so that I could practice data manipulation using this library.

The chart was drawn using pure D3. No other graphing libraries were incorporated.

The UI used JQuery UI for buttons and Bootstrap for layout.

## Design
The 20 years worth of data is grouped into years, months and days. For each period of time, one flight feature can be shown.
The flight data are represented as columns. Each data entry is presented by two columns: One presenting flights to land at the airport,
the other represents flights to take off at the airport. Additionally, the user can also select a weather feature to accompany 
the graph. This feature is only supplementary and is presented as a dot for each data entry.

### MAIN DESIGN CHOICES:
* There are two different categories of data to be shown on the chart: Flight Data (which include, Flight In and Flight Out data), and Weather Data.
Hence, it's best to have two different types of charts overlaying each other to differentiate between the two.
* Different hues of colors were used to differentiate different flight and weather features. The color of the left and right y axis labels
also match the hue of the bars and dots they represents to help the viewer quickly identify which label is for which feature.
* Bar chart was chosen for the Flight In and Flight Out data because it's suitable for encoding more than one data point per column of data on the chart.
* For each column on the chart, one bar represents Flight In (Flights heading to New Orleans) while the other represents Flight Out (Flights leaving New Orleans).
These two bars overlap each other to save space, and to reduce the size of the gap between two columns of data without creating confusion. This helps the viewer
observer the change in the length of the bars from one data entry to the next easier. The two bars also share the same color hue but with different saturations
(e.g. Blue and Light Blue) to indicate that even though they represent different data, they are of the same type.
* While both a scatter plot and a line chart can be displayed nicely on top of a bar chart, I didn't go for the line chart to encode 
the weather features because the lines it creates would be quite distracting. I want the focus to be on the bar chart.
Moreover, the columns of data are pretty close to each other. It's easy to see the shift in weather from one column to another without the aid of the lines.



### DESIGN CHANGES AFTER RECEIVING FEEDBACK:
* A narration will play automatically when the page is loaded to guide the user through the chart and show the effects Katrina had
on the operation of the airport. This narration can be skipped. After the narration, the user is free to explore the chart.
* Dropdown Boxes were originally used to select data features. They were later replace with Radio Buttons, which are transformed
into Buttons Sets using JQuery UI. This change halves the number of mouse clicks needed to change a feature on the graph.
* The size of the chart was reduced. The feature selectors were moved to from the bottom to the left of the chart. This was to avoid
the vertical scrollbar.
* Bootstrap were also used to accommodate smaller displays.

## Feedback

#### First Sketch:
* Coworker: Colorful and clear looking chart. There are so many graphs. What should the viewer focus on?
* Friend: A legend box is needed. It's impossible to tell what the different colored bars mean.The graph is unnecessarily big. 
It does not look nice on smaller or low-resolution screens.
* Husband: Other than refreshing the page, there's no way to return to the previous view.

#### Final Product:
* Coworker: The narration is nice. Automatic transition during narration is really cool.
* Friend: You could add Next/Prev buttons for the Narration (Note: Though this is a valid point, I'm not adding these buttons due
to time constrain)
* Husband: The chart is a lot cleaner. The message is also clear. I think you're ready!

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
