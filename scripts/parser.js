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
  var individuals = parts[2].split(",")
  return {
    "role": parts[1],
    "individuals": individuals
  };
}

function parseRelation(str) {
  if (str.indexOf("SUBSET") == -1)
    return {};

  var parts = str.split("SUBSET");
  parts[0].replace(" ", "");
  parts[1].replace(" ", "");
  return {
    "left": parts[0].replace(" ", ""),
    "right": parts[1].replace(" ", "")
  };
}
