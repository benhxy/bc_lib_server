//a server to store and return node list

//express and middleware
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var ip_checker = require("is-ip"); //to check ipv4 or ipv6
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var config = require("../config");

//data structures
var cache_capacity = config.cache_capacity;
var node_list = [];

app.post("/api/nodes", function(req, res) {

  console.log("Entered POST /api/nodes");

  //check incomplete information
  if (!req.body.username || !req.body.public_key) {
    console.log("Missing username or pk");
    res.status(400);
    return res.json({
      success: false,
      message: "Missing node information. Please provide username and public_key."
    });
  }

  //get node username and pk
  var new_node = {
    username: req.body.username,
    public_key: req.body.public_key
  };

  //deep copy node list for sending response
  var node_list_copy = JSON.parse(JSON.stringify(node_list));

  //analyze ip address
  if (ip_checker.v6(req.connection.remoteAddress)) {
    new_node.address = "[" + req.connection.remoteAddress + "]:" + req.connection.remotePort;
  } else {
    new_node.address = req.connection.remoteAddress + ":" + req.connection.remotePort;
  }

  //enqueue node information, trim cache
  node_list.push(new_node);
  while (node_list.length > cache_capacity) {
    node_list.shift();
  }

  //send node list
  return res.json({
    success: true,
    list : node_list_copy
  });

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({message: "An error occurred", error: err});
});

module.exports = app;
