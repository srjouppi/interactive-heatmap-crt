function drawHeatMap(){

  // set the dimensions and margins of the graph
  // var margin = {top: 80, right: 25, bottom: 30, left: 200}
  var margin = {top: 100, right: 25, bottom: 30, left: 200},
  width = 1200 - margin.left - margin.right,
  height = 650 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("crt_words.csv", function(data) {

  // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
  var myGroups = d3.map(data, function(d){return d.month;}).keys()
  var myVars = d3.map(data, function(d){return d.word;}).keys()

  // Build X scales and axis:
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(myGroups)
    .padding(0.1);
    
  svg.append("g")
    .style("font-size", "14px")
    .style("font-family", "Roboto Mono")
    .attr("transform", "translate(0," + (height)+ ")")
    .call(d3.axisBottom(x)
              .tickFormat(d3.timeFormat("%Y-%m")))
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll("text")	
        .style("text-anchor", "end")
        .attr("dx", "-1em")
        .attr("dy", ".3em")
        .attr("transform", "rotate(-65)")
    .select(".domain").remove()

  // Build Y scales and axis:
  var y = d3.scaleBand()
    .range([ 0, height ])
    .domain(myVars)
    .padding(0.1);
  svg.append("g")
    .style("font-size", "14px")
    .style("font-family", "Roboto Mono")
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  // Build color scale
  var myColor = d3.scaleLinear()
    // .interpolator(d3.interpolateReds)
    .range(["white", "#FA4E26"])
    .domain([1,60])

  // create a tooltip
  var tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", ".5px")
    .style("border-radius", ".5px")
    .style("padding", "15px")
    .style("position", "absolute")
    .style("width", '200px')
    .style("pointer-events", "none");

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    // (d) => will not give you "this"

    tooltip
      .style("opacity", 1);

    let which_square = d3.select(this).attr('id').replace( /^\D+/g, '');

    d3.select("#actual-square-" + which_square)
      .style("stroke", "black")
      .style("stroke-width",1.5);
      //.style("opacity", 1);
  }
  var mousemove = function(d) {

    tooltip
      .html("<h2>" + d.month+"<br/>"+d.word +"</h2><hr/><h3>" + d.pct_of_clips +"% of " + d.num_clips + " clips</h3>")
      .style("left", (d3.mouse(this)[0] + margin.left + 100 + 50) +  "px")
      .style("top", (d3.mouse(this)[1])+ margin.top - 20 +"px")
  }
  var mouseleave = function(d) {
    tooltip
      .style("opacity", 0);

    let which_square = d3.select(this).attr('id').replace( /^\D+/g, '');


    d3.select("#actual-square-" + which_square)
      .style("stroke", "#cdcdcd");
      //.style("opacity", 0.8)
  }

  const all_clips = data.map(d=> +d.num_clips);

  //console.log(all_clips);

  //linear version, clamped with the smallest square of 10
//   var square_scale = d3.scaleLinear()
//             .domain([d3.min(all_clips), d3.max(all_clips)])
//             .range([10, x.bandwidth()]);

// bucketed versions
//console.log(x.bandwidth());
var square_scale = d3.scaleThreshold()
            .domain([50, 200, 800, 1000])
            .range([5, 13, 21, 29, x.bandwidth()]);

  //make sure you are taking the proportional sizes of area into account!!!

  // add the squares
  svg.selectAll()
    .data(data)
    .enter()
    .append("rect")
        .attr("id", (d,i)=> 'actual-square-'+ i)
      .attr("x", function(d) { return x(d.month) + (x.bandwidth() - square_scale(d.num_clips))/2 })
      .attr("y", function(d) { return y(d.word)  + (x.bandwidth() - square_scale(d.num_clips))/2})
      // .attr("rx", 4)
      // .attr("ry", 4)
      .attr("width", d=> square_scale(d.num_clips))
      .attr("height",  d=> square_scale(d.num_clips))
      .style("fill", function(d) { return myColor(d.pct_of_clips)} )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 1)
      .style("stroke", "#cdcdcd")
      .style("stroke-width", 1)
      
      svg.selectAll()
        .data(data)
        .enter()
        .append("rect")
        .attr("id", (d,i)=> 'fake-square-'+ i)
        .attr("width", x.bandwidth())
        .attr("height", x.bandwidth())
        .attr("x", function(d) { return x(d.month)  })
        .attr("y", function(d) { return y(d.word) })
        // .style('stroke', "#F0f")
        .style("fill-opacity", "0")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);




})

// Add title to graph
svg.append("text")
        .attr("x", 0)
        .attr("y", -50)
        .attr("text-anchor", "left")
        .style("font-size", "26px")
        .style("font-family", "Roboto Mono")
        .text("Fox News Focuses Critical Race Theory Coverage on Children");

// Add subtitle to graph
svg.append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("text-anchor", "left")
        .style("font-size", "20px")
        .style("font-family","Roboto Mono")
        .style("fill", "grey")
        .style("max-width", "400px")
        .text("Common words found in 15-second clips mentioning CRT from July 2020 - July 2022");

}  

drawHeatMap();
  