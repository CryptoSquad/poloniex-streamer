var autobahn = require('autobahn');
var fs = require('fs');
var db = require('./db')

var FRAME_SIZE = 10;
var wsuri = "wss://api.poloniex.com";

var dataStore = {};

function writeFile(data, fileName) {
	fs.appendFile("./output/" + fileName, data, function(err) {
	    if (err) {
	        return console.log(err);
	    }
	    console.log("The file was saved!");
	}); 
}

function updateRollingAvg(currency, newPrice) {
	// Get queue. Initialize if not present.
	var priceQueue = dataStore[currency];
	if (!priceQueue) {
		dataStore[currency] = [];
	}
	
	// Add it to the queue, pop out the old one if it's full.
	priceQueue.push(parseFloat(newPrice));
	if (priceQueue.length > FRAME_SIZE) {
		priceQueue.shift();
	}
	
	// Log it.
	writeFile(new Date() + ", " + newPrice + "\n", currency + ".csv");
	
	
	// Calculate and print rolling avg.
	var rollingAvg = priceQueue.reduce(function(x, sum) { 
		return x + sum; 
	}) / FRAME_SIZE;
	console.log('Rolling avg: ' + rollingAvg);
	
	db.insertTick(currency, newPrice, rollingAvg, 1000);
}

var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});

connection.onopen = function (session) {
	function tickerEvent (args, kwargs) {
		updateRollingAvg(args[0], args[1]);
	}
	session.subscribe('ticker', tickerEvent);
	
	/* Other API calls.
		session.subscribe('BTC_XMR', marketEvent);
		session.subscribe('trollbox', trollboxEvent);
	*/
}

connection.onclose = function () {
  console.log("Websocket connection closed");
}
		       
connection.open();