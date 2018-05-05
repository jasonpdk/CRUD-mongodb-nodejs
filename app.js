var express = require('express');
var path = require('path');
var mongo = require('mongodb');
var bodyParser = require('body-parser');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/list', function(req, res) {
  var MongoClient = mongo.MongoClient;
  var url = 'mongodb://localhost:27017/sampsite';

  MongoClient.connect(url, function(err, db) {
    if (err) {
      throw err;
    } else {
      var dbo = db.db('sampsite');
      var collection = dbo.collection('users');
      collection.find({}).toArray(function(err, result) {
        console.log(result);
        if (err) {
          throw err;
        } else {
          res.render('list', {
            studentList: result
          });
        }
      });
    }
  });

});

app.get('/adduser', function(req, res) {
    res.render('adduser');
});

app.post('/newuser', function(req, res) {
  //console.log(req.body);
  var MongoClient = mongo.MongoClient;
  var url = 'mongodb://localhost:27017/sampsite';

  MongoClient.connect(url, function(err, db) {
    if (err) {
      throw err;
    } else {
      var user = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        age: req.body.age,
        gender: req.body.gender,
        occupation: req.body.occupation,
        address: {
          street: req.body.street,
          town: req.body.town,
          county: req.body.county,
          country: req.body.country
        }
      }

      console.log(user);
      var dbo = db.db('sampsite');
      dbo.collection('users').insert([user], function(err, result) {
        if (err) {
          throw err;
        } else {
          res.redirect("/list");
        }
        db.close();
      });
    }
  });
});

app.get('/modifyuser', function(req, res) {
    var MongoClient = mongo.MongoClient;
    var url = "mongodb://localhost/sampsite";

    MongoClient.connect(url, function(err, db) {
      if (err) {
        throw err;
      } else {
        var dbo = db.db("sampsite");
        var collection = dbo.collection('users');
        var names = [];
        collection.find({}).toArray(function(err, result) {
          for(var i = 0; i < result.length; i++) {
            var nameObject = {
              first_name: result[i].first_name,
              last_name: result[i].last_name,
              id: result[i]._id
            }
            names.push(nameObject);
          }
          res.render('modifyuser', {
            names: names
          });
        });
        db.close();
      }
    });
});

app.post('/modifyuser', function(req, res) {
  var MongoClient = mongo.MongoClient;
  var url = "mongodb://localhost/sampsite";

  MongoClient.connect(url, function(err, db) {
    if (err) {
      throw err;
    } else {
      var dbo = db.db('sampsite');
      var collection = dbo.collection('users');
      var oID = new mongo.ObjectID(req.body.nameSelect);
      console.log(req.body);
      collection.find({"_id": oID}).toArray(function(err, result) {
        if (err) {
          throw err;
        } else {
          var updateValue = {};
          updateValue[req.body.field] = req.body.value;
          collection.updateOne({"_id": oID}, { $set: updateValue}, function(err, result) {
            if (err) {
              throw err;
            } else {
              console.log("1 document updated")
              res.redirect('/list');
            }
          });

          //res.redirect('/list');
        }
      });
    }
  });
});

app.listen(20000, function() {
  console.log("Started on 20000");
});
