library(dplyr)
library(sqldf)

output_processed_data <- function(dat, filename){
  if(missing(filename))
    filename = paste(substitute(dat),"csv",sep=".")
  filepath = paste(original_folder, filename, sep="/")
  write.csv(dat, filepath, row.names = FALSE)
}

original_folder <-  "E:/Downloads"
original_files <- list.files(original_folder, pattern ="^[[:digit:]]{4}.csv$")
original_files <- paste(original_folder, original_files, sep="/")

airport_code = "MSY"
f_airport_code = paste("'",airport_code,"'",sep="")

selected_Columns = 
  paste("Origin, Dest, Year, Month, DayofMonth, DayOfWeek",
        "Cancelled/1 as Cancelled, Diverted/1 as Diverted",
        "DepDelay/1 > 15 as DepDelay, ArrDelay/1 > 15 as ArrDelay",
        sep = ", ")

read_SQL = paste("select",selected_Columns,"from file",
                 "where Origin =",f_airport_code,
                 "or Dest =",f_airport_code)

fly_in <- NULL
fly_out <- NULL

extract_file <- function (filepath) {
  print(paste("Processing ",filepath))
  dat <- read.csv.sql(filepath
                      , sql=read_SQL
                      , eol="\n") %>% tbl_df()
  
  fly_in <<- dat %>% filter(Dest==airport_code) %>% 
    select(Year, Month, Day=DayofMonth, DayOfWeek, Cancelled, Diverted,
           ArrDelay) %>% 
    group_by(Year,Month,Day,DayOfWeek) %>% 
    summarise(in_Flights=n(), in_Cancelled=sum(Cancelled), 
              in_Diverted=sum(Diverted),in_Delayed=sum(ArrDelay)) %>% 
    bind_rows(fly_in)
  
  fly_out <<- dat %>% filter(Origin==airport_code) %>% 
    select(Year, Month, Day=DayofMonth, DayOfWeek, Cancelled, Diverted,
           DepDelay) %>% 
    group_by(Year,Month,Day,DayOfWeek) %>% 
    summarise(out_Flights=n(), out_Cancelled=sum(Cancelled), 
              out_Diverted=sum(Diverted), out_Delayed=sum(DepDelay)) %>%
    bind_rows(fly_out)
}

lapply(original_files, extract_file)


################################################################################
################################################################################

weather_file <- "E:/Downloads/weather.csv"

extract_time <- function(dt, tpy) {
  dt <- as.character(dt)
  if(tpy=="year")
    result <- substr(dt,1,4)
  else if(tpy=="month")
    result <- substr(dt,5,6)
  else
    result <- substr(dt,7,8)
  as.integer(result)
}

standarized_unit <- function(num){
  if(num == -9999)
    NA
  else
    num/10
}

weather <- read.csv(weather_file) %>% tbl_df() %>% select(-STATION)
weather <- weather %>% 
  mutate(Year=extract_time(DATE,"year"),
         Month=extract_time(DATE,"month"),
         Day=extract_time(DATE,"day")) %>% select(-DATE)

weather[,6:21] <- lapply(weather[,6:21], function(x) as.integer(x > 0))
weather[,1:5] <- lapply(weather[,1:5],function(x) sapply(x,standarized_unit))

weather <- weather %>% 
  mutate(Fog=as.integer(WT01|WT02|WT21),
         Mist=as.integer(WT08|WT13),
         Rain=as.integer(WT14|WT16),
         Hail=as.integer(WT04|WT05|WT06),
         Thunder=WT03,
         Tornado=as.integer(WT10|WT11)) %>%
  select(-(WT14:WV03)) %>% select(Year:Tornado,PRCP:AWND)

################################################################################
################################################################################


all_data <- left_join(fly_out,fly_in,by=c("Year","Month","Day","DayOfWeek")) %>%
  left_join(weather, by=c("Year","Month","Day"))

output_processed_data(all_data,"MSY.csv")
