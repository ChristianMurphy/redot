"use strict";

function utilProcessChildType(node, func, sep) {
  if (!node || !node.children) {
    return "";
  }
  if (!sep) {
    // TODO make default seperator configurable
    sep = "\n";
  }
  return node.children
    .filter(function(child) {
      return child.type === func.name;
    })
    .map(func)
    .join(sep);
}

function attribute(node) {
  return node.name + "=" + node.value;
}

function attributeStatement(node) {
  var result = node.target + "[";
  result += utilProcessChildType(node, attribute, ",");
  result += "]\n";
  return result;
}

function nodeStatement(node) {
  return (
    utilProcessChildType(node, nodeId) +
    "[" +
    utilProcessChildType(node, attribute) +
    "]"
  );
}

function port(node) {
  var result = ":";
  result += node.id;
  if (node.compass) {
    result += ":" + node.compass;
  }
  return result;
}

function nodeId(node) {
  var result = "";

  if (node.id.indexOf(" ") > 0) {
    result += '"' + node.id + '"';
  } else {
    result += node.id;
  }

  result += utilProcessChildType(node, port);
  return result;
}

function edgeRightHandSide(node) {
  return node.edgeop + edgeStatement(node);
}

function edgeStatement(node) {
  return (
    utilProcessChildType(node, subgraph) +
    utilProcessChildType(node, nodeId) +
    utilProcessChildType(node, edgeRightHandSide)
  );
}

function graph(node) {
  var result = "";
  if (node.strict) {
    result += "strict ";
  }

  result += node.type;

  if (node.id) {
    // TODO make indent configurable
    result += " " + nodeId(node);
  }

  result += " {\n";

  result += [
    utilProcessChildType(node, attribute),
    utilProcessChildType(node, attributeStatement),
    utilProcessChildType(node, nodeStatement),
    utilProcessChildType(node, edgeStatement),
    utilProcessChildType(node, subgraph)
  ]
    .filter(function(value) {
      return value !== "";
    })
    .join("\n")
    .split("\n")
    .map(function(value) {
      return "  " + value;
    })
    .join("\n");

  result += "\n}\n";

  return result;
}

function digraph(node) {
  return graph(node);
}

function subgraph(node) {
  return graph(node);
}

function root(node) {
  return (
    utilProcessChildType(node, digraph) + utilProcessChildType(node, graph)
  );
}

var compile = function compile(doc) {
  return root(doc);
};

function parserFactory() {
  this.Compiler = compile;
}

parserFactory.Compiler = compile;

module.exports = parserFactory;
