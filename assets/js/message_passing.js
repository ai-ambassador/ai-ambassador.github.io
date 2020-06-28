// <!DOCTYPE html>
// <meta charset="utf-8">
// <head>
//     <link href="http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" rel="stylesheet"/>
//     <!-- <link href="//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css" rel="stylesheet"> -->
// </head>
// <body>
// <script src="//d3js.org/d3.v3.min.js"></script>
// <script>

var width = screen.width,
    height = screen.height,
    radius = 32;

var node_color = '#5a5a5a'
    edge_color = node_color,
    message_color = 'black';
var sample = poissonDiscSampler(width, height, radius);

var svg = d3.select("#landing").append("svg")
    .attr("width", width)
    .attr("height", height)
    .classed('bg-img parallax', true);


var fails = 0;
var stop_drawing_at_k_fails = 3;

var points = [];
var neighbors = {}

var t = d3.timer(function(elapsed) {
  // set up graph
  if (fails < stop_drawing_at_k_fails) {
    for (var i = 0; i < 50; ++i) {
        var s_edges = sample();
        if (!s_edges) {
            fails = fails + 1;
            return true;
        }
        var s = s_edges[0];
        var edges = s_edges[1]; 
        for (target of edges){
            svg.append('line')
                .style("stroke", edge_color)
                .attr({
                    x1: target[0],
                    y1: target[1],
                    x2: target[0],
                    y2: target[1]
                })
                .transition()
                .duration(200)
                .attr({
                    x2: s[0],
                    y2: s[1]
                });
        }
        // svg.append("circle")
        //     .style("stroke", '#666666')
        //     .style("fill", '#666666')
        //     .attr("cx", s[0])
        //     .attr("cy", s[1])
        //     .attr("r", 0)
        // .transition()
        //     .attr("r", 5)
        svg.append('text')
            .attr("x", s[0])
            .attr("y", s[1])
            // .style("stroke", '#ffffff')
            .style("fill", node_color)
            .attr("text-anchor", 'middle')
            .attr("alignment-baseline", 'middle')
            .attr('font-family', 'FontAwesome')
            .attr('font-size', '0em' )
            .text('\uf19d')
            .transition()
                .attr('font-size', '1em' )
            ;
    }
  }

});

// Draw little messages being passsed
var s = d3.timer(function(elapsed) {
    landingboxrect = d3.select("#landing").node().getBoundingClientRect();
    // width = landingboxrect
    avg_density = radius * radius * 100
    num_messages = Math.ceil(landingboxrect.width * landingboxrect.height / avg_density)
    for (link of animateMessages(num_messages)) {
        svg.append("circle")
            .style("stroke", message_color)
            .style("fill", message_color)
            .attr("cx", link[0][0])
            .attr("cy", link[0][1])
            .attr("r", 0)
            .transition()
                .attr("r", 2)
            .transition()
                .attr("cx", link[1][0])
                .attr("cy", link[1][1])
            .remove();
    }
});


function animateMessages(n_messages = 2) {
    landingboxrect = d3.select("#landing").node().getBoundingClientRect();
    viable_points = []
    for (point of points) {
        if (point[0] < landingboxrect.width + 50 && point[1] < landingboxrect.height + 50) {
            viable_points.push(point);
        }
    }
    var links = [];
    for (i = 0; i < n_messages; ++i){
        var s = viable_points[Math.floor(Math.random() * viable_points.length)];
        var neighbors_s = neighbors[s];
        if (!neighbors_s) continue;
        var target = neighbors_s[Math.floor(Math.random() * neighbors_s.length)]
        links.push([s, target]);
    }
    return links;
}

// Based on https://www.jasondavies.com/poisson-disc/
function poissonDiscSampler(width, height, radius) {
  var k = 30, // maximum number of samples before rejection
      radius2 = radius * radius,
      R = 3 * radius2,
      edge_thresh = 2 * R,
      cellSize = radius * Math.SQRT1_2,
      gridWidth = Math.ceil(width / cellSize),
      gridHeight = Math.ceil(height / cellSize),
      grid = new Array(gridWidth * gridHeight),
      queue = [],
      queueSize = 0,
      sampleSize = 0;

  return function() {
    if (!sampleSize) return sample(Math.random() * width, Math.random() * height);

    // Pick a random existing sample and remove it from the queue.
    while (queueSize) {
      var i = Math.random() * queueSize | 0,
          s = queue[i];

      // Make a new candidate between [radius, 2 * radius] from the existing sample.
      for (var j = 0; j < k; ++j) {
        var a = 2 * Math.PI * Math.random(),
            r = Math.sqrt(Math.random() * R + radius2),
            x = s[0] + r * Math.cos(a),
            y = s[1] + r * Math.sin(a);

        // Reject candidates that are outside the allowed extent,
        if (0 <= x && x < width && 0 <= y && y < height) {
            // or closer than 2 * radius to any existing sample.
            edges = far(x, y, edge_thresh)
            if (edges == false) continue;
            // Find all nearby points in order to draw edges 
            return sample(x, y, edges);
        }
      }

      queue[i] = queue[--queueSize];
      queue.length = queueSize;
    }
  };

  function far(x, y, edge_thresh) {
    var i = x / cellSize | 0,
        j = y / cellSize | 0,
        i0 = Math.max(i - 2, 0),
        j0 = Math.max(j - 2, 0),
        i1 = Math.min(i + 3, gridWidth),
        j1 = Math.min(j + 3, gridHeight);

    edges = []
    for (j = j0; j < j1; ++j) {
      var o = j * gridWidth;
      for (i = i0; i < i1; ++i) {
        if (s = grid[o + i]) {
          var s,
              dx = s[0] - x,
              dy = s[1] - y;
          if (dx * dx + dy * dy < radius2) return false;
          if (dx * dx + dy * dy < edge_thresh) edges.push(s);          
        }
      }
    }

    return edges;
  }

  function sample(x, y, edges = []) {
    var s = [x, y];
    queue.push(s);
    grid[gridWidth * (y / cellSize | 0) + (x / cellSize | 0)] = s;
    ++sampleSize;
    ++queueSize;
    points.push(s);
    neighbors[s] = edges;
    for (target of edges) {
        neighbors[target].push(s);
    }
    return [s, edges];
  }
}

// </script>

