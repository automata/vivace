var express = require('express'),
    sharejs = require('share').server;
var app = express();

// attach the sharejs REST and Socket.io interfaces to the server
var options = {db: {type: 'none'}};
sharejs.attach(app, options);

app.use("/", express.static(__dirname + '/'));
var port = process.env.PORT || 5000;
app.listen(port);
console.log('Server running at http://127.0.0.1');
