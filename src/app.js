//a server to store and return node list

//express and middleware
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//data structures
var cache_capacity = 50;
var node_list = [];

app.post("/api/nodes", function(req, res) {
  console.log("entered route");
  //deep copy request headers
  var new_node = JSON.parse(JSON.stringify(req.body));

  //check incomplete information
  if (!new_node.username || !new_node.public_key) {
    console.log("Missing username or pk")
    res.status(400);
    return res.json({
      success: false,
      message: "Missing node information. Please provide id, username, and public_key."
    });
  }

  //deep copy node list for sending response
  var node_list_copy = JSON.parse(JSON.stringify(node_list));

  //enqueue node information
  let new_node_obj = {};
  new_node_obj.ip = req.connection.remoteAddress;
  new_node_obj.port = req.connection.remotePort;
  new_node_obj.username = new_node.username;
  new_node_obj.public_key = new_node.public_key;
  node_list.push(new_node_obj);

  //trim cache
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
