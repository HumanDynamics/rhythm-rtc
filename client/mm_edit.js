const _ = require('underscore')
const d3 = require('d3')

function MM (data, localParticipant, width, height) {
this.updateData = _.bind(this.updateData, this);
this.constantRotation = _.bind(this.constantRotation, this);
this.createLinks = _.bind(this.createLinks, this);
this.sphereTranslation = _.bind(this.sphereTranslation, this);
this.renderLinks = _.bind(this.renderLinks, this);
this.getNodeCoords = _.bind(this.getNodeCoords, this);
this.nodeTransform = _.bind(this.nodeTransform, this);
this.nodeColor = _.bind(this.nodeColor, this);
this.renderNodes = _.bind(this.renderNodes, this);
this.nodeRadius = _.bind(this.nodeRadius, this);
var p;
console.log("constructing MM with data:", data);
this.localParticipant = localParticipant;
this.fontFamily = "Futura,Helvetica Neue,Helvetica,Arial,sans-serif";
this.margin = {
top: 0,
right: 0,
bottom: 0,
left: 0
};
this.width = width - this.margin.right - this.margin.left;
this.height = height - this.margin.bottom - this.margin.top;
this.radius = 115;
this.data = data;
this.angle = d3.scale.ordinal().domain(this.data.participants).rangePoints([0, 360], 1);
this.linkStrokeScale = d3.scale.linear().domain([0, 1]).range([3, 15]);
this.sphereColorScale = d3.scale.linear().domain([0, data.participants.length * 10 * 3]).range(['#C8E6C9', '#2E7D32']).clamp(true);
this.nodes = (function() {
var i, len, ref, results;
ref = this.data.participants;
results = [];
for (i = 0, len = ref.length; i < len; i++) {
  p = ref[i];
  results.push({
    'participant': p
  });
}
return results;
}).call(this);
this.nodes.push({
'participant': 'energy'
});
this.nodeTransitionTime = 500;
this.linkTransitionTime = 500;
this.createLinks();
}

MM.prototype.nodeRadius = function(d) {
if (d.participant === "energy") {
return 30;
} else {
return 20;
}
};

MM.prototype.render = function(id) {
if (id == null) {
id = "#meeting-mediator";
}
this.chart = d3.select(id).append("svg").attr("class", "meeting-mediator").attr("width", this.width + this.margin.left + this.margin.right).attr("height", this.height + this.margin.top + this.margin.bottom).append("g").attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
this.chartBody = this.chart.append("g").attr("width", this.width).attr("height", this.height);
this.graphG = this.chart.append("g").attr("width", this.width).attr("height", this.height);
this.outline = this.chartBody.append("g").attr("id", "outline").append("circle").style("stroke", "#AFAFAF").attr("stroke-width", 3).style("stroke-dasharray", "10, 5").attr("fill", "transparent").attr("r", this.radius + 20 + 2);
this.linksG = this.graphG.append("g").attr("id", "links");
this.nodesG = this.graphG.append("g").attr("id", "nodes");
this.renderNodes();
this.renderLinks();
return this.graphG.transition().duration(250).attr("transform", this.constantRotation());
};

MM.prototype.renderNodes = function() {
this.node = this.nodesG.selectAll(".node").data(this.nodes, function(d) {
return d.participant;
});
this.nodeG = this.node.enter().append("g").attr("class", "node").attr("id", function(d) {
return d.participant;
});
this.nodeG.append("circle").attr("class", "nodeCircle").attr("fill", this.nodeColor).attr("r", this.nodeRadius);
this.nodeG.append("circle").attr("class", "nodeFill").attr("fill", "#FFFFFF").attr("r", (function(_this) {
return function(d) {
  if (d.participant === 'energy' || d.participant === _this.localParticipant) {
    return 0;
  } else {
    return _this.nodeRadius(d) - 3;
  }
};
})(this));
this.nodesG.selectAll(".node").transition().duration(500).attr("transform", this.nodeTransform).select('circle').attr("fill", this.nodeColor);
return this.node.exit().remove();
};

MM.prototype.nodeColor = function(d) {
if (d.participant === 'energy') {
return this.sphereColorScale(this.data.transitions);
} else if (d.participant === this.localParticipant) {
return '#092070';
} else {
return '#3AC4C5';
}
};

MM.prototype.nodeTransform = function(d) {
if (d.participant === "energy") {
return this.sphereTranslation();
} else {
return "rotate(" + this.angle(d.participant) + ")translate(" + this.radius + ",0)";
}
};

MM.prototype.getNodeCoords = function(id) {
var coords, transformText;
transformText = this.nodeTransform({
'participant': id
});
coords = d3.transform(transformText).translate;
return {
'x': coords[0],
'y': coords[1]
};
};

MM.prototype.renderLinks = function() {
this.link = this.linksG.selectAll("line.link").data(this.links);
this.link.enter().append("line").attr("class", "link").attr("stroke", "#646464").attr("fill", "none").attr("stroke-opacity", 0.8).attr("stroke-width", 7).attr("x1", (function(_this) {
return function(d) {
  return _this.getNodeCoords(d.source)['x'];
};
})(this)).attr("y1", (function(_this) {
return function(d) {
  return _this.getNodeCoords(d.source)['y'];
};
})(this)).attr("x2", (function(_this) {
return function(d) {
  return _this.getNodeCoords(d.target)['x'];
};
})(this)).attr("y2", (function(_this) {
return function(d) {
  return _this.getNodeCoords(d.target)['y'];
};
})(this));
this.link.transition().duration(this.linkTransitionTime).attr("stroke-width", (function(_this) {
return function(d) {
  return _this.linkStrokeScale(d.weight);
};
})(this));
this.link.attr("x1", (function(_this) {
return function(d) {
  return _this.getNodeCoords(d.source)['x'];
};
})(this)).attr("y1", (function(_this) {
return function(d) {
  return _this.getNodeCoords(d.source)['y'];
};
})(this)).attr("x2", (function(_this) {
return function(d) {
  return _this.getNodeCoords(d.target)['x'];
};
})(this)).attr("y2", (function(_this) {
return function(d) {
  return _this.getNodeCoords(d.target)['y'];
};
})(this));
return this.link.exit().remove();
};

MM.prototype.sphereTranslation = function() {
var coords, i, len, node_x, node_y, ref, turn, x, xDist, y, yDist;
x = 0;
y = 0;
ref = this.data.turns;
for (i = 0, len = ref.length; i < len; i++) {
turn = ref[i];
coords = this.getNodeCoords(turn.participant);
node_x = coords['x'];
node_y = coords['y'];
xDist = node_x - x;
yDist = node_y - y;
x += turn.turns * (xDist / 2);
y += turn.turns * (yDist / 2);
}
return "translate(" + x + "," + y + ")";
};

MM.prototype.createLinks = function() {
var i, len, participant, ref, results, turn;
this.links = (function() {
var i, len, ref, results;
ref = this.data.turns;
results = [];
for (i = 0, len = ref.length; i < len; i++) {
  turn = ref[i];
  results.push({
    'source': turn.participant,
    'target': 'energy',
    'weight': turn.turns
  });
}
return results;
}).call(this);
ref = this.data.participants;
results = [];
for (i = 0, len = ref.length; i < len; i++) {
participant = ref[i];
if (!_.find(this.links, (function(_this) {
  return function(link) {
    return link.source === participant;
  };
})(this))) {
  results.push(this.links.push({
    'source': participant,
    'target': 'energy',
    'weight': 0
  }));
} else {
  results.push(void 0);
}
}
return results;
};

MM.prototype.constantRotation = function() {
var a, angle, angle_diff, mod, targetAngle;
mod = function(a, n) {
return a - Math.floor(a / n) * n;
};
angle = this.angle(this.localParticipant);
targetAngle = -90;
a = targetAngle - angle;
a = (a + 180) % 360 - 180;
if (angle !== -90) {
angle_diff = a;
return "rotate(" + angle_diff + ")";
} else {
return "rotate(" + 0 + ")";
}
};

MM.prototype.updateData = function(data) {
var p;
console.log("updating MM viz with data:", data);
if (data.participants.length === this.data.participants.length) {
this.data = data;
this.createLinks();
this.renderLinks();
return this.renderNodes();
} else {
this.data = data;
this.angle.domain(this.data.participants);
this.nodes = (function() {
  var i, len, ref, results;
  ref = this.data.participants;
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    p = ref[i];
    results.push({
      'participant': p
    });
  }
  return results;
}).call(this);
this.nodes.push({
  'participant': 'energy'
});
this.sphereColorScale.domain([0, data.participants.length * 5]);
this.link = this.linksG.selectAll("line.link").data([]).exit().remove();
this.renderNodes();
return setTimeout(((function(_this) {
  return function() {
    _this.renderLinks();
    return _this.graphG.transition().duration(100).attr("transform", _this.constantRotation());
  };
})(this)), this.nodeTransitionTime + 100);
}
};

module.exports = MM
