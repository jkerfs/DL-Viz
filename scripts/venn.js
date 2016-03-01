(function test() {

  var width = Number(d3.select("svg#venn-viz").style("width").replace("px","")),
    height = Number(d3.select("svg#venn-viz").style("height").replace("px","")),
    colors = d3.scale.category10();

    var linkData = [];

  var setChar = 'ABCDEFGHIJKLMN',
    charFn = i => setChar[i],
    setLength = 4,
    sets = d3.range(setLength).map(function(d, i) {
      return setChar[i]
    })

  var opts = {
    dataLength: 3,
    setLength: 4,
    duration: 800,
    circleOpacity: 0.4,
    innerOpacity: 0.2
  };

  d3.select("svg#venn-viz").append("svg:defs").selectAll("marker")
      .data(["end"])      // Different link/path types can be defined here
    .enter().append("svg:marker")    // This section adds in the arrows
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

  function refreshInput() {
    var sel = d3.select(this),
      name = sel.attr("name"),
      value = sel.property("value")
    test[name](value);
    if (name == 'dataLength' || name == 'setLength') {
      if (name == 'setLength') {
        globalData = [] // we reshuffle everything
      }
      return refresh(generateData())
    }
    refresh();
  }

  function parseConcept(str) {
    if(str.indexOf("(") >= str.indexOf(")"))
      return {};

    var re = /(.*)\((.*)\)/;
    var parts = str.match(re);

    return {
      "concept": parts[1],
      "individual": parts[2]
    }
  }

  function parseRole(str) {
    if(str.indexOf("(") >= str.indexOf(")"))
      return {};
    if(str.indexOf(",") == -1)
      return {};

    var re = /(.*)\((.*)\)/;
    var parts = str.match(re);

    parts[2].replace(" ", "");
    var individuals = parts[2].split(",")
    return {
      "role": parts[1],
      "individuals": individuals
    };
  }
  d3.select("button#refresh").on('click', function() {
    linkData = [];
    globalData = [];
    var lines = $("#concepts").val().split("\n");
    for (var i = 0; i < lines.length; i++) {
      var item = parseConcept(lines[i]);
      if(item.concept != undefined) {
        var found = false;
        for(var j = 0; j < globalData.length; j++) {
          if (globalData[j].name == item.individual) {
            found = true;
            globalData[j].set.push(item.concept);
            break;
          }
        }
        if(!found) {
          globalData.push({set: [item.concept], r: 8, name: item.individual});
        }
      }
    }
    lines = $("#roles").val().split("\n");
    for(var i = 0; i < lines.length; i++) {
      var item = parseRole(lines[i]);
      if(item.role != undefined) {
        var firstIndex = -1;
        var secondIndex = -1;
        for(var j = 0; j < globalData.length; j++) {
          if (globalData[j].name == item.individuals[0]) {
            firstIndex = j;
          }
          else if (globalData[j].name == item.individuals[1]) {
            secondIndex = j;
          }
        }
        if(firstIndex >= 0 && secondIndex >= 0) {
          linkData.push({"source": globalData[firstIndex], "target" : globalData[secondIndex], "name": item.role});
        }
      }
    }
    refresh(globalData);
  });

  //set input value accorging to options and handle change of input
  d3.selectAll('#inputs input')
    .each(function() {
      var sel = d3.select(this),
        name = sel.attr("name");
      sel.property("value", test[name]())
    })
    .on('input', refreshInput)

  var layout = d3.layout.venn()
    .size([width, height])
    .padding(0)
    .packingStragegy(d3.layout.venn.force)

  // .setsSize(x => (Math.log(x) ))
  // .value(x => 1),
  svg = d3.select('svg#venn-viz')
    .attr('width', width)
    .attr('height', height),
    isFirstLayout = true;

  var globalData = [],
    generator = 0;

  function generateData() {
    var dataLength = test.dataLength(),
      setLength = test.setLength(),
      diff = dataLength - globalData.length;

    if (diff > 0) {
      globalData = globalData.concat(d3.range(diff).map((d, i) => {
        var l = Math.floor((Math.random() * setLength / 3) + 1),
          set = [],
          c,
          i;
        for (i = -1; ++i < l;) {
          c = charFn(Math.floor((Math.random() * setLength)));
          if (set.indexOf(c) == -1) {
            set.push(c)
          }
        }
        return {
          set: set,
          r: 8,
          name: 'node_' + generator++
        }
      }))
    } else {
      globalData.splice(0, -diff);
    }
    console.log(globalData);
    return globalData;
  }

  function refresh(data) {
    if (data) {
      // we recalculate the layout for new data only
      layout.nodes(data)
    }

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
      })

    vennEnter.append('path')
      .attr('class', 'venn-area-path');

    vennEnter.append('circle')
      .attr('class', 'inner')
      .attr('fill', 'grey');

    vennEnter.append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")


    vennArea.selectAll('path.venn-area-path').transition()
      .duration(isFirstLayout ? 0 : test.duration())
      .attr('opacity', test.circleOpacity())
      .attrTween('d', function(d) {
        return d.d
      });
    //we need to rebind data so that parent data propagetes to child nodes (otherwise, updating parent has no effect on child.__data__ property)
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
        return d.center.y
      });

    //we need to rebind data so that parent data propagetes to child nodes (otherwise, updating parent has no effect on child.__data__ property)
    vennArea.selectAll('circle.inner').data(function(d) {
        return [d];
      }).transition()
      .duration(isFirstLayout ? 0 : test.duration())
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
      .remove()


      svg.selectAll("path.curvelink").remove();

      // add the links and the arrows
      var path = svg.append("svg:g").selectAll("path")
          .data(linkData)
        .enter().append("svg:path")
          .attr("id", function(d) { return d.name + "-" + d.source.name + "-" + d.target.name; })
          .attr("class", "curvelink")
          .attr("marker-end", "url(#end)");


          svg.selectAll(".link").remove();
          svg.selectAll("text.linkdesc").remove();

          var linkdesc = svg.selectAll(".linkdesc")
            .data(linkData)
            .enter().append("text")
            .attr("class", "linkdesc")
            .attr("fill", "white")
            .append("textPath")
            .attr("xlink:href", function(d) { return "#" + d.name + "-" + d.source.name + "-" + d.target.name;})
            .attr("startOffset", "40%")
            .text(function(d) {return d.name} )
            .attr("x", function (d) {
                return d.source.px;
            })
                .attr("y", function (d) {
                return d.source.py;
            });

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
      })



    var pointsEnter = points.enter()
      .append('g')
      .attr('class', 'node')
      .on('mouseover', function(d,i) {
        d3.select("span#individual-name").text(d.name);
        d3.select("span#member-of").text(d.set.toString());
        subs = []
        obs = []
        for(var i = 0; i < linkData.length; i++) {
          if(linkData[i].source.name == d.name)
            subs.push(linkData[i].name);
          if(linkData[i].target.name == d.name)
            obs.push(linkData[i].name);
        }
        d3.select("span#subject-of").text(subs.toString());
        d3.select("span#object-of").text(obs.toString());
        d3.select(this).select('text')
          .transition()
          .duration(200)
          .style('opacity', 1)
      })
      .on('mouseout', function() {
        d3.selectAll("span.hover-data").text("");
        d3.select(this).select('text')
          .transition()
          .duration(200)
          .style('opacity', 0)
      }).call(layout.packer().drag);

    pointsEnter
      .append('text')
      .text(function(d) {return d.name})
      .attr("dx", 12)
      .attr("dy", ".35em")
      .style('opacity', 0);

    var pointsInner = points.append('circle').attr('r', 0);






    pointsInner.transition()
      .duration(isFirstLayout ? 0 : test.duration())
      .attr('r', function(d) {
        return d.r
      })

    points.exit().transition()
      .remove()

    isFirstLayout = false;

    //set the force ticker
    layout.packingConfig({
        ticker: function() {

          path.attr("d", function(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
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
            })

        }
      })
      //start the force layout
    layout.packer().start()
    return test
  }

  var content = window.location.href.split('?content=');
  if(content.length == 2) {
    $.getJSON( "examples/" + content[1], function( data ) {
      console.log(data);
      $.each(data.concepts,function(i,d) {
        $("#concepts").val(function(ind, val) {
          return val + d + "\n";
        });
      });
      $.each(data.roles, function(i,d) {
        $("#roles").val(function(ind, val) {
          return val + d + "\n";
        });
      });
    });
  }

  $('.masthead-nav li a').click(function()
  {
    $('.masthead-nav li').removeClass('active');
    $(this).parent().addClass('active');
  });
  
})();
