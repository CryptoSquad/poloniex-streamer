var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('ticks.db');

var CREATE_DB = 'CREATE TABLE ticks (currency TEXT, price REAL, sma REAL, ema REAL)';
var INSERT = 'INSERT INTO ticks VALUES (?, ?, ?, ?)';

function create() {
	db.serialize(function() {
	  db.run(CREATE_DB);
	});
	db.close();
}

exports.insertTick = function insertTick(currency, price, sma, ema) {
	db.serialize(function() {
	  var stmt = db.prepare(INSERT);
	  stmt.run(currency, price, sma, ema);
	  stmt.finalize();
	});
}

var args = process.argv;
if (args[2] == 'create') {
	create();
	console.log('db created.')
}

exports.create = create;