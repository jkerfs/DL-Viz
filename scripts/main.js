//Constants for the SVG
var width = 980,
    height = 640;

//Set up the colour scale
var color = d3.scale.category20();

//Set up the force layout
var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);

//Append a SVG to the body of the html page. Assign this SVG as an object to svg
//var svg = d3.select("body").append("svg")
//    .attr("width", width)
//    .attr("height", height);
var svg = d3.select("#graph-viz");

//Read the data from the mis element
var mis = document.getElementById('mis').innerHTML;
graph = JSON.parse(mis);
graphRec=JSON.parse(JSON.stringify(graph));

//Creates the graph data structure out of the json data
force.nodes(graph.nodes)
    .links(graph.links)
    .start();

//Create all the line svgs but without locations yet
var link = svg.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link")
    .style("stroke-width", function (d) {
    return Math.sqrt(d.value);
});


    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);
    node.append("circle")
        .attr("r", 8)
        .style("fill", function (d) {
        return color(d.group);
    })
    node.append("text")
          .attr("dx", 10)
          .attr("dy", ".35em")
          .text(function(d) { return d.name })
          .style("stroke", "white");
    //Now we are giving the SVGs co-ordinates - the force layout is generating the co-ordinates which this code is using to update the attributes of the SVG elements
    force.on("tick", function () {
      // link label

        link.attr("x1", function (d) {
            return d.source.x;
        })
            .attr("y1", function (d) {
            return d.source.y;
        })
            .attr("x2", function (d) {
            return d.target.x;
        })
            .attr("y2", function (d) {
            return d.target.y;
        });
        d3.selectAll("circle").attr("cx", function (d) {
            return d.x;
        })
            .attr("cy", function (d) {
            return d.y;
        });
        d3.selectAll("text").attr("x", function (d) {
            return d.x;
        })
            .attr("y", function (d) {
            return d.y;
        });
    });


//adjust threshold
function threshold(thresh) {
    graph.links.splice(0, graph.links.length);
		for (var i = 0; i < graphRec.links.length; i++) {
			if (graphRec.links[i].value > thresh) {graph.links.push(graphRec.links[i]);}
		}
    restart();
}
//Restart the visualisation after any node and link changes
function restart() {
	link = link.data(graph.links);
  console.log(link);
	link.exit().remove();
	link.enter().append("g");
  link.enter().append("line", ".node").attr("class", "link");

	node = node.data(graph.nodes);
  node.exit().remove();


	node.enter().append("g")
    .attr("class", "node")
    .call(force.drag);

  node.append("circle")
      .attr("r", 8)
      .style("fill", function (d) {
      return color(d.group);
    });

  node.enter().append("text")
        .attr("dx", 10)
        .attr("dy", ".35em")
        .text(function(d) { return d.name });
        //.style("stroke", "white");
	force.start();
}

function parseLine(str) {
  var re = /(.*)\((.*)\)/;
  var parts = str.match(re);

  if (parts[2].includes(",")) {
    parts[2].replace(" ", "");
    var individuals = parts[2].split(",")
    return {
      "role": parts[1],
      "individuals": individuals
    };
  }
  else {
    return {
      "concept": parts[1],
      "individual": parts[2]
    }
  }
}

$("#refresh").click(function() {
  var lines = $("#abox").val().split("\n");

  for(var x = 0; x < lines.length; x++) {
    var item = parseLine(lines[x]);
    if (item.concept) {
      var concept_index = -1;
      for(var y = 0; y < graph.nodes.length; y++) {
        if (graph.nodes[y].name == item.concept) {
          concept_index = y;
        }
      }
      if(concept_index < 0) {
        graph.nodes.push({"name": item.concept,"group": 1, "weight" : 2});
        concept_index = graph.nodes.length - 1;
      }

      var individual_index = -1;
      for(var y = 0; y < graph.nodes.length; y++) {
        if (graph.nodes[y].name == item.individual) {
          individual_index = y;
        }
      }
      if(individual_index < 0) {
        graph.nodes.push({"name": item.individual,"group": 2, "weight": 2});
        individual_index = graph.nodes.length - 1;
      }

      exists = false
      for(var y = 0; y < graph.links.length; y++) {
        exists |= graph.links[y].source == item.concept && graph.links[y].target == item.individual
      }
      if(!exists) {
        graph.links.push({"source" : graph.nodes[concept_index], "target": graph.nodes[individual_index]});
      }

    }

  }
  restart();

});
