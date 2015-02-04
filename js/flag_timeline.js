var height=500;
var dayWidth=120;
var margin = {
      top: 40,
      bottom: 0,
      right: 200, 
      left: 40
    };
var radius = 10;

//beize cure contorl point
var ctlx = 10;
var ctly = 35;
function draw(jsonfname){
  d3.json(jsonfname, function(err, data){
    //var line = d3.svg.line()

    var dayRange = d3.extent(data.nodes, function(n, i){ return n.date; });
    dayRange = dayRange.map(function(d){return new Date(d);});
    var interval = (dayRange[1]- dayRange[0]) / 1000 / 60 / 60 / 24 + 1;
    var width = interval * dayWidth;

    var svg = d3.select("#svgContent")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
        //.attr('preserveAspectRatio', 'xMinYMin slice')
        //.append('g'); 
        console.log(data);
        
    /***********************
     * Axes
     * *********************/
    var x = d3.time.scale()
        .domain(dayRange)
        .rangeRound([margin.left, width - margin.left - margin.right]);

    var xAxisDays = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(d3.time.days, 1);
        //.tickFormat(d3.time.format('%a %-e'))
        //.tickSize(5)
        //.tickPadding(8);
    svg.append('g')
        .attr('class', 'x axis dayaxis')
        .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
        .call(xAxisDays);

    var types = [];
    data.nodes.forEach(function(n){
      if (types.indexOf(n.type) < 0){
        types.push(n.type);
      }
    });
    var y = d3.scale.ordinal()
        .rangeRoundBands([margin.top, height - margin.top - margin.bottom])
        .domain(types);

    /************************
     * Nodes
     * **********************/

    stackCount = {}
    data.nodes.forEach(function(n){
      n.x = x(new Date(n.date));
      //n.y = height/2;
      if (!stackCount.hasOwnProperty(n.x)){
        n.y = y(n.type);
        stackCount[n.x] = 1
      }
      else {
        n.y = y(n.type) + stackCount[n.x] + 2*radius;
        stackCount[n.x] += 1
      }
      //TODO: create a ordinal scale for types of y
    });

		var node = svg.selectAll(".node")
			.data(data.nodes)
			.enter().append("g")
			.attr("class", "node");

    var circle = node.append("svg:circle")
        .attr('id', function (d) {
            return "n" + d.id;
        })
        .attr('r', radius);

    node.append("svg:title")
        .text(function (d) {
            return d.name;
        });

		// text, centered in node, with white shadow for legibility
    /*
		node.append("text")
			.attr("text-anchor", "right")
			.attr("dy", radius / 2)
			.attr("dx", radius)
			.attr("class", "shadow")
			.text(function(d) { return d.action + d.name; });
      */

		node.append("text")
			.attr("text-anchor", "right")
			.attr("dy", radius / 2)
			.attr("dx", radius)
			.text(function(d) { return d.action + d.name; });
  
    node.transition().duration(1000)
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    /**************************
     * Links
     * ************************/

    function curve(d) {
      // Bezier curve
      // we assume source is earlier than target or on same day

      srcNode = data.nodes[d.source];
      targNode = data.nodes[d.target];
      dx = targNode.x - srcNode.x;
      dy = targNode.y - srcNode.y;
      M = "M" + srcNode.x + "," + srcNode.y + " "; //starting point
      //c = "c0,0, 0,0 "
      //TODO: alternative up and down
      c = "c0,50, " + dx + ",50 ";
      c += dx + "," + dy;
      //c = "C" + (srcNode.x + dx/10) + "," + (10000/dx) + " " + (targNode.x-dx/10) + "," + (10000/dx) + " ";
      //c += targNode.x + "," + targNode.y
      console.log(M + c);
      return M + c;
    }

		// Arrowheads
    /*
    svg.append("svg:defs").selectAll("marker")
    .data(["end"])
    .enter().append("svg:marker")
    .attr("id", String)
    .attr("class", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 25)
    .attr("refY", -1.5)
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");
    */

    var link = svg.selectAll(".link")
    .data(data.links)
    .enter().append("svg:path")
    .attr("d", function (d) {
      return curve(d);
    })
    .attr("class", "link");
    //.attr("marker-end", "url(#end)");

  });

}
