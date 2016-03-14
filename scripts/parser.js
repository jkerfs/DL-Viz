function parseConcept(str) {
  if (str.indexOf("(") >= str.indexOf(")"))
    return {};

  var re = /(.*)\((.*)\)/;
  var parts = str.match(re);

  return {
    "concept": parts[1],
    "individual": parts[2]
  }
}

function parseRole(str) {
  if (str.indexOf("(") >= str.indexOf(")"))
    return {};
  if (str.indexOf(",") == -1)
    return {};

  var re = /(.*)\((.*)\)/;
  var parts = str.match(re);

  parts[2].replace(" ", "");
  var individuals = parts[2].split(",");
  return {
    "role": parts[1],
    "individuals": individuals
  };
}

function parseSubset(parts) {
  parts[0].replace(" ", "");
  parts[1].replace(" ", "");

  return {
    "left": parts[0].replace(" ", ""),
    "right": parts[1].replace(" ", "")
  };
}

// Assumes already checked that str contains equals.
function parseEquivalent(parts) {
  var right;
  var operator = null;
  var operators = ["AND", "OR", "LTE", "LT", "GTE", "GT", "EQ"];

  for (var op in operators) {
    if (operators.hasOwnProperty(op) && ~parts[1].indexOf(op)) {
      operator = op;
      right = parts[1].split(op);
      break;
    }
  }

  if (!operator)
    return {};

  right[0].trim();
  right[1].trim();

  return {
    "left": parts[0].trim(),
    "right": right,
    "operator": operator
  };
}

function parseRelation(str) {
  if (~str.indexOf("SUBSET"))
    return parseSubset(str.split("SUBSET"));
  //else if (~str.indexOf("EQUIV"))
  //  return parseEquivalent(str.split("EQUIV"));
  else
    return {};
}