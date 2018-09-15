var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27018/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.createCollection("mumbleDev", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
});