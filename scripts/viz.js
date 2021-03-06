(function test() {

  var width = Number(d3.select("svg#venn-viz").style("width").replace("px", "")) - 50,
    height = Number(d3.select("svg#venn-viz").style("height").replace("px", "")) - 50,
    colors = d3.scale.category10();

  var venn_id = 0;
  var linkData = [];

  var opts = {
    dataLength: 3,
    setLength: 4,
    duration: 800,
    circleOpacity: 0.4,
    innerOpacity: 0.2
  };

  var svg = d3.select("svg#venn-viz").append("g")
      .attr("transform", "translate(" + 25 + "," + 25 + ")");

  d3.select("svg#venn-viz").append("svg:defs").selectAll("marker")
    .data(["end"]) // Different link/path types can be defined here
    .enter().append("svg:marker") // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("fill", "white")
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

  // Build simple getter and setter Functions
  for (var key in opts) {
    if (opts.hasOwnProperty(key))
      test[key] = getSet(key, test).bind(opts);
  }

  function getSet(option, component) {
    return function(_) {
      if (!arguments.length) {
        return this[option];
      }
      this[option] = _;
      return component;
    };
  }

  function readData() {
    var i, j, item;
    linkData = [];
    var globalData = [];
    var lines = $("#concepts").val().split("\n");
    for (i = 0; i < lines.length; i++) {
      item = parseConcept(lines[i]);
      if (item.concept != undefined) {
        var found = false;
        for (j = 0; j < globalData.length; j++) {
          if (globalData[j].name == item.individual) {
            found = true;
            globalData[j].set.push(item.concept);
            break;
          }
        }
        if (!found) {
          globalData.push({
            set: [item.concept],
            r: 8,
            name: item.individual
          });
        }
      }
    }
    lines = $("#roles").val().split("\n");
    for (i = 0; i < lines.length; i++) {
      item = parseRole(lines[i]);
      if (item.role != undefined) {
        var firstIndex = -1;
        var secondIndex = -1;
        for (j = 0; j < globalData.length; j++) {
          if (globalData[j].name == item.individuals[0]) {
            firstIndex = j;
          } else if (globalData[j].name == item.individuals[1]) {
            secondIndex = j;
          }
        }
        if (firstIndex >= 0 && secondIndex >= 0) {
          linkData.push({
            "source": globalData[firstIndex],
            "target": globalData[secondIndex],
            "name": item.role,
            "orientation" : (1.0 - 0.5 * Math.random())
          });
        }
      }
    }
    lines = $("#tbox").val().split("\n");
    for (i = 0; i < lines.length; i++) {
      var relation = parseRelation(lines[i]);
      for(j = 0; j < globalData.length; j++) {
        if($.inArray(relation.left, globalData[j].set) >= 0) {
          if($.inArray(relation.right, globalData[j].set) < 0) {
            globalData[j].set.push(relation.right);
	        }
        }
      }
    }

    //TRANSITIVE Property that would work with textbox. (at moment super inefficient)
    /*
    lines = $("#transitive").val().split("\n");
    // Runs through each line in textbox
    for (var line = 0; line < lines.length; i++) {
      var relation = lines[line].trim();
      // Runs through all links
      for(var rel1 = 0; j < linkData.length; j++) {
        // Checks to see if the link is of correct relation
        if(linkData[rel1].name === relation) {
          // Looks through array for potential transitive matches
          for(var rel2 = 0; rel2 < linkData.length; k++) {
            // Checks to see if of correct relation, and that orig target is source
            if(linkDara[rel2].name === relation && linkData[rel1].target === linkData[rel2].source)
            {
              linkData.push({
                "source": linkData[rel1].source,
                "target": linkData[rel2].target,
                "name": relation
              });
            }
          }
        }
      }
    }
    */
    if(globalData.length > 0) {
      refresh(globalData);
    }
  }


  d3.select("button#refresh").on('click', function() {
    readData();
  });


  var layout = d3.layout.venn()
    .size([width, height])
    .padding(0)
    .packingStragegy(d3.layout.venn.force);

  /*svg = d3.select('svg#venn-viz')
    .attr('width', width)
    .attr('height', height);*/

  function refresh(data) {
    if (data) {
      // we recalculate the layout for new data only
      layout.nodes(data)
    }

    svg.selectAll(".venn-circle-container").remove();

    var vennArea = svg.selectAll("g.venn-area")
      .data(layout.sets().values(), function(d) {
        return d.__key__;
      });

    var vennEnter = vennArea.enter()
      .append('g')
      .attr("class", function(d) {
        return "venn-area venn-" +
          (d.sets.length == 1 ? "circle" : "intersection");
      })
      .attr('fill', function(d, i) {
        return colors(i)
      });

    vennEnter.append('path')
      .attr('class', 'venn-area-path');

    vennEnter.append('circle')
      .attr('class', 'inner')
      .attr('fill', 'grey');

    vennEnter.filter(function(d) {
        return d.__key__.split(",").length == 1;
      }).append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em");


    vennArea.selectAll('path.venn-area-path').transition()
      .duration(test.duration())
      .attr('opacity', test.circleOpacity())
      .attrTween('d', function(d) {
        return d.d
      });
    //we need to rebind data so that parent data propagates to child nodes (otherwise, updating parent has no effect on child.__data__ property)
    vennArea.selectAll("text.label").data(function(d) {
        return [d];
      })
      .text(function(d) {
        return d.__key__;
      })
      .attr("x", function(d) {
        return d.center.x
      })
      .attr("y", function(d) {
        return d.center.y - d.innerRadius
      });

    //we need to rebind data so that parent data propagates to child nodes (otherwise, updating parent has no effect on child.__data__ property)
    vennArea.selectAll('circle.inner').data(function(d) {
        return [d];
      }).transition()
      .duration(test.duration())
      .attr('opacity', test.innerOpacity())
      .attr("cx", function(d) {
        return d.center.x
      })
      .attr("cy", function(d) {
        return d.center.y
      })
      .attr('r', function(d) {
        return d.innerRadius
      });

    vennArea.exit().transition()
      .duration(test.duration())
      .attrTween('d', function(d) {
        return d.d
      })
      .remove();


    svg.selectAll("path.curvelink").remove();

    // add the links and the arrows
    var path = svg.append("svg:g").selectAll("path")
      .data(linkData)
      .enter().append("svg:path")
      .attr("id", function(d) {
        return d.name + "-" + d.source.name + "-" + d.target.name;
      })
      .attr("class", "curvelink")
      .attr("marker-end", "url(#end)");


    svg.selectAll(".link").remove();
    svg.selectAll("text.linkdesc").remove();

    var linkdesc = svg.selectAll(".linkdesc")
      .data(linkData)
      .enter().append("text")
      .attr("class", "linkdesc")
      .attr("font-size", "18px")
      .attr("fill", "white")
      .append("textPath")
      .attr("xlink:href", function(d) {
        return "#" + d.name + "-" + d.source.name + "-" + d.target.name;
      })
      .attr("startOffset", "40%")
      .text(function(d) {
        return d.name
      })
      .attr("x", function(d) {
        return d.source.px;
      })
      .attr("y", function(d) {
        return d.source.py;
      })
      .attr("opacity", 0);

    // need this so that nodes always on top
    var circleContainer = svg.selectAll("g.venn-circle-container")
      .data(layout.sets().values(), function(d) {
        return d.__key__;
      });

    circleContainer.enter()
      .append('g')
      .attr("class", "venn-circle-container")
      .attr('fill', function(d, i) {
        return colors(i)
      });
    circleContainer.exit().remove();

    circleContainer.selectAll("g.node").remove();
    var points = circleContainer.selectAll("g.node")
      .data(function(d) {
        return d.nodes
      }, function(d) {
        return d.name
      });

    var pointsEnter = points.enter()
      .append('g')
      .attr('class', 'node')
      .on('mouseover', function(d, i) {

        // Show the name of the node in the sidebar
        d3.select("span#individual-name").text(d.name);

        // Show the role membership of the node in the sidebar
        d3.select("span#member-of").text(d.__setKey__);
        var subs = {};
        var obs = {};
        var related_nodes = [d.name];
        for (var i2 = 0; i2 < linkData.length; i2++) {
          if (linkData[i2].source.name == d.name) {
            subs[linkData[i2].name] = 1 + (subs[linkData[i2].name] || 0);
            related_nodes.push(linkData[i2].target.name);
          }
          if (linkData[i2].target.name == d.name) {
            obs[linkData[i2].name] = 1 + (subs[linkData[i2].name] || 0);
            related_nodes.push(linkData[i2].source.name);
          }
        }
        var subject_str = JSON.stringify(subs)
          .replace(/["{}]/g, "")
          .replace(/:/g, ": ")
          .replace(/,/g, ", ");
        var object_str = JSON.stringify(obs)
          .replace(/["{}]/g, "")
          .replace(/:/g, ": ")
          .replace(/,/g, ", ");
        d3.select("span#subject-of").text(subject_str);
        d3.select("span#object-of").text(object_str);

        // Show the names of the roles
        svg.selectAll(".linkdesc").filter(function(l) {
          return l.source.name == d.name || l.target.name == d.name;
        }).select("textPath").attr("opacity", 1);

        // Show the names of the related nodes
        svg.selectAll(".node").filter(function(j) {
          return $.inArray(j.name, related_nodes) >= 0;
        }).append("text")
          .attr("class", "node-name")
          .attr("stroke-width", "0px")
          .attr("fill", "white")
          .text(function(k) { return k.name})
          .attr("x", d.x + 12)
          .attr("y", d.y)
          .attr("dx", "12");
      })
      .on('mouseout', function() {
        d3.selectAll("textPath").attr("opacity", 0);
        d3.selectAll("span.hover-data").text("");
        d3.selectAll(".node-name").remove()
          .transition()
          .duration(200);
      }).call(layout.packer().drag);

    var pointsInner = points.append('circle').attr('r', 0);

    pointsInner.transition()
      .duration(test.duration())
      .attr('r', function(d) {
        return d.r
      });

    points.exit().transition()
      .remove();

    //set the force ticker
    layout.packingConfig({
        ticker: function() {

          path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = d.orientation * Math.sqrt(dx * dx + dy * dy);
            return "M" +
              d.source.x + "," +
              d.source.y + "A" +
              dr + "," + dr + " 0 0,1 " +
              d.target.x + "," +
              d.target.y;
          });


          pointsEnter.select('text').attr('x', function(d) {
            return d.x;
          }).attr('y', function(d) {
            return d.y;
          });
          pointsInner.attr("cx", function(d) {
              return d.x
            })
            .attr("cy", function(d) {
              return d.y
            });
        }
      });

    // pull .venn-circle text out of their circle and to the bottom of the child nodes
    // this results in the text always being on top
    setTimeout(function () {
      d3.selectAll('text.label[fill]').each(function () {
        var oldParent = $('#venn-id-' + this.id.split('-')[2] + ' circle');
        console.log(oldParent.attr('cx'));
        if (oldParent && oldParent.attr('cx')) {
          this.setAttribute('x', parseFloat(oldParent.attr('cx')));
          this.setAttribute('y', parseFloat(oldParent.attr('cy')) - parseFloat(oldParent.attr('r')));
        }
        else
          this.parentNode.removeChild(this);
        return this;
      });
      // first time we have processed this label
      d3.selectAll('.venn-circle text.label').each(function () {
        var grandparent = this.parentNode.parentNode;
        var fill = this.parentNode.getAttribute('fill');
        this.parentNode.id = 'venn-id-' + venn_id;
        this.id = 'text-id-' + venn_id;
        venn_id += 1;
        this.parentNode.removeChild(this);
        grandparent.appendChild(this);
        this.setAttribute('fill', fill);
      })
    }, 1000);

    layout.packer().start();
    return test
  }

  readData();
})();
