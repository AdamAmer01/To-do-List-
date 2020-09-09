//jshint esversion:6
// Were using a Module here, more info in Docs from Node
exports.getDate = function() {

  const today = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  return today.toLocaleDateString("en-US", options);

};
// We can have more than one function to export from the same Module

// This function will just get the current day of the week
exports.getDay = function () {

  const today = new Date();

  const options = {
    weekday: "long"
  };

  return today.toLocaleDateString("en-US", options);

};
