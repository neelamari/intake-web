var h=100;
var w=350;
var padding = 20;             
    

function getDate(d){
    
    //20150101
    var strDate = new String(d);
    
    var year = strDate.substr(0,4);
    var month = strDate.substr(4,2)-1; //zero based index
    var day = strDate.substr(6,2);
    
    return new Date(year, month, day);
}

function getTickFormat(d){
    if (d=="3") {
        return d3.time.format("%x");
    } else {
        return d3.time.format("%b");
    }
        
}
    
//build line
function buildLine(ds) {

    // console.log('xscale-max: '+ d3.max(ds.monthlyprojectCount, function (d){ return d.month; }));
    // console.log('yscale-max: '+ d3.max(ds.monthlyprojectCount, function (d){ return d.projectcount; }));

    var minDate = getDate(ds.monthlyprojectCount[0]['month']);
    var maxDate = getDate(ds.monthlyprojectCount[ds.monthlyprojectCount.length-1]['month']);
    
    // console.log("min: " +minDate);
    // console.log("max: " +maxDate);

    //tooltip
    var tooltip = d3.select("body").append("div")   
                .attr("class", "tooltip")               
                .style("opacity", 0);



    

    //scales
    var xScale = d3.time.scale()
                .domain([minDate, maxDate])                
                .range([padding+5, w-padding])
                .nice();
    

    var yScale = d3.scale.linear()
                .domain([0, d3.max(ds.monthlyprojectCount, function(d){ return d.projectcount;})])
                .range([h-padding,10])
                .nice();
    
    var xAxisGen = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.time.format("%b"));
    var yAxisGen = d3.svg.axis().scale(yScale).orient("left").ticks(4);
    
    var lineFun = d3.svg.line()
        .x(function (d) {return xScale(getDate(d.month)); } )
        .y(function (d) {return yScale(d.projectcount); })
        .interpolate("linear");
        

    var svg = d3.select("body").append("svg").attr({ width:w, height:h, "id":"svg-"+ds.category});
    
    var yAxis = svg.append("g").call(yAxisGen)
                .attr("class", "y-axis")
                .attr("transform", "translate(" + padding + ", 0)");
                
    var xAxis = svg.append("g").call(xAxisGen)                        
                .attr("class","x-axis")
                .attr("transform", "translate(0," + (h-padding) + ")");
                

    var viz = svg.append("path")
            .attr({
                d: lineFun(ds.monthlyprojectCount),
                "stroke" : "#abdda4",
                "stroke-width": 2,
                "fill" : "none",
                "class": "path-"+ds.category
            });

        var dots = svg.selectAll("circle")                            
                    .data(ds.monthlyprojectCount)
                    .enter()
                    .append("circle")
                    .attr({
                        cx: function(d) {return xScale(getDate(d.month)); },
                        cy: function (d) {return yScale(d.projectcount); },
                        r:  4,
                        "fill": "#abd9e9",                                
                        class: "circle-"+ds.category
                    }) 
                    .on("mouseover", function(d) {      
                        tooltip.transition()        
                            .duration(500)      
                            .style("opacity", .9);      
                        tooltip.html("<strong>projectcount " + d.projectcount + "</strong>")  
                            .style("left", (d3.event.pageX) + "px")     
                            .style("top", (d3.event.pageY - 28) + "px");    
                    })                  
                    .on("mouseout", function(d) {       
                        tooltip.transition()        
                            .duration(500)      
                            .style("opacity", 0);   
                    });
    

    }

function updateLine(ds) {

    var minDate = getDate(ds.monthlyprojectCount[0]['month']);
    var maxDate = getDate(ds.monthlyprojectCount[ds.monthlyprojectCount.length-1]['month']);
    
    //scales
    var xScale = d3.time.scale()
                .domain([minDate, maxDate])                
                .range([padding+5, w-padding]);
    

    var yScale = d3.scale.linear()
                .domain([0, d3.max(ds.monthlyprojectCount, function(d){ return d.projectcount;})])
                .range([h-padding,10]);
    
    var xAxisGen = d3.svg.axis().scale(xScale).orient("bottom")
                    .tickFormat(d3.time.format("%b"))
                    .ticks(ds.monthlyprojectCount.length-1); //adjust number of ticks

    var yAxisGen = d3.svg.axis().scale(yScale).orient("left")
                    .ticks(4);
    
    var lineFun = d3.svg.line()                
        .x(function (d) {return xScale(getDate(d.month)); } )
        .y(function (d) {return yScale(d.projectcount); })
        .interpolate("linear");
        

    var svg = d3.select("body").select("#svg-"+ds.category);
    
    var yAxis = svg.selectAll("g.y-axis").call(yAxisGen);
                
    var xAxis = svg.selectAll("g.x-axis").call(xAxisGen);                       

    var viz = svg.selectAll(".path-"+ds.category) 
            .transition() //add the transition and you're done!
            .duration(500) //set the duration for more control
            .ease("linear") //choose the type of animation linear, elastic, bounce, circle
            .attr({
                d: lineFun(ds.monthlyprojectCount)                        
            });

    //fix for moving dots on update
    var dots = svg.selectAll(".circle-"+ds.category)                                                   
            .transition() 
            .duration(500)
            .ease("linear")
            .attr({
                cx: function(d) {return xScale(getDate(d.month)); },
                cy: function (d) {return yScale(d.projectcount); }                              
            });                             

}
    
//show header
function showHeader(ds) {
    d3.select("body").append("h1")
        .text(ds.category + " projectcount (2015)");
}


//get data and draw things  
//d3.json("https://api.github.com/repos/bsullins/d3js-resources/contents/monthlyprojectCountbyCategoryMultiple.json", function(error, data) {
    
d3.json("https://api.github.com/repos/neelamari/intake-web/contents/public/MonthlyCountByStatus2.json", function(error, data) {
    
    if(error) {
        console.log(error);
    } else {
        // console.log(data); //we're golden!
    }

    var decodedData = JSON.parse(window.atob(data.content));

    // console.log(decodedData.contents);

    
    decodedData.contents.forEach(function(ds){
        // console.log(ds);
        showHeader(ds);
        buildLine(ds);

    })

    
    //filter dates
    //add an event listener
    d3.select("select")
        .on("change", function(d,i){

        //get selected option
        var sel = d3.select('#date-option').node().value;

        // console.log(ds.monthlyprojectCount.length-sel);
        // console.log(sel);

        var decodedData = JSON.parse(window.atob(data.content));

            decodedData.contents.forEach(function(ds){

            ds.monthlyprojectCount.splice(0,ds.monthlyprojectCount.length-sel);

            updateLine(ds);
            
        });


    })

});  

    