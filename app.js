/*
 * A web application using the Express framework where a user can Create, Read,
 * Update, or Delete entries in a MongoDB database.
 * Jason Keane
*/
var express = require('express');
var path = require('path');
var mongo = require('mongodb');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// body-parser from form processing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// index page redirects to the list page
app.get('/', function(req, res) {
  res.redirect('/list');
});

// List the entries in the database
app.get('/list', function(req, res) {
  var MongoClient = mongo.MongoClient;
  var url = 'mongodb://localhost/';

  MongoClient.connect(url, function(err, db) {
    if (err) {
      throw err;
    } else {
      var dbo = db.db('sampsite');
      var collection = dbo.collection('users');

      // find all entries
      collection.find({}).toArray(function(err, result) {
        if (err) {
          throw err;
        } else {
          res.render('list', {
            userList: result
          });
        }
      });
    }
  });

});

app.get('/adduser', function(req, res) {
    res.render('adduser');
});

/* add a new user to the databases. This is run when the form on
   the adduser page is submitted */
app.post('/adduser', function(req, res) {
  var MongoClient = mongo.MongoClient;
  var url = 'mongodb://localhost/';

  MongoClient.connect(url, function(err, db) {
    if (err) {
      throw err;
    } else {
      //store the values from the request in an object
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

      var dbo = db.db('sampsite');
      // insert the object into the database
      dbo.collection('users').insert([user], function(err, result) {
        if (err) {
          throw err;
        } else {
          res.redirect("/list"); // display the list of users
        }
        db.close();
      });
    }
  });
});

// the page where a user can be modified
app.get('/modifyuser', function(req, res) {
    var MongoClient = mongo.MongoClient;
    var url = "mongodb://localhost/";

    /* Connect to the database, get all of the names and ids,
     * store them in an object. Store all of those objects in an
     * array. Pass this object when rendering the page. On the
     * page the user you want to modify can be selected. */
    MongoClient.connect(url, function(err, db) {
      if (err) {
        throw err;
      } else {
        var dbo = db.db("sampsite");
        var collection = dbo.collection('users');
        var names = [];
        // get all entries
        collection.find({}).toArray(function(err, result) {
          for(var i = 0; i < result.length; i++) {
            var nameObject = {
              first_name: result[i].first_name,
              last_name: result[i].last_name,
              id: result[i]._id
            }
            // append the object to the names array
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

/*
 * This is run when the form on the modifyuser page is submitted
 * The ID of the selected user, the field to be modified, and what
 * to put in that field are sent from the form.
*/
app.post('/modifyuser', function(req, res) {
  var MongoClient = mongo.MongoClient;
  var url = "mongodb://localhost/";

  MongoClient.connect(url, function(err, db) {
    if (err) {
      throw err;
    } else {
      var dbo = db.db('sampsite');
      var collection = dbo.collection('users');

      // put the ID in the correct format
      var oID = new mongo.ObjectID(req.body.nameSelect);

      // put the update value in an object - {field:value}
      var addressFields = ["street", "town", "county", "country"];
      var updateValue = {};

      var field = req.body.field;
      var value = req.body.value;

      // if part of address
      if (addressFields.includes(req.body.field)) {
        var loc = "address."+field;
        updateValue[loc] = value;
      } else {
        updateValue[req.body.field] = req.body.value;
      }

      // update the entry
      collection.update({"_id": oID}, { $set: updateValue}, function(err, result) {
        if (err) {
          throw err;
        } else {
          console.log("1 document updated")
          res.redirect('/list');
          db.close();
        }
      });
    }
  });
});

/*
 * removeuser page. This is very similar to the modify page, all of
 * the names an ID's are fetched and displayed on the page
 */
app.get('/removeuser', function(req, res) {
  var MongoClient = mongo.MongoClient;
  var url = "mongodb://localhost/";

  MongoClient.connect(url, function(err, db) {
    if (err) {
      throw err;
    } else {
      var dbo = db.db("sampsite");
      var collection = dbo.collection('users');
      var names = [];

      // find all names and store in the names array
      collection.find({}).toArray(function(err, result) {
        for(var i = 0; i < result.length; i++) {
          var nameObject = {
            first_name: result[i].first_name,
            last_name: result[i].last_name,
            id: result[i]._id
          }
          names.push(nameObject);
        }
        res.render('removeuser', {
          names: names
        });
      });
      db.close();
    }
  });
});

/* This is run when the form on the removeuser page is submitted.
 * The ID of the user is recieved from the form and used to delete
 * the user.
 */
app.post('/removeuser', function(req, res) {
  var MongoClient = mongo.MongoClient;
  var url = "mongodb://localhost/";

  MongoClient.connect(url, function(err, db) {
    if (err) {
      throw err;
    } else {
      var dbo = db.db("sampsite");
      var collection = dbo.collection("users");

      // put the ID in the correct format
      var oID = new mongo.ObjectID(req.body.nameSelect);

      // remove the entry
      collection.remove({"_id":oID}, function(err, result) {
        if (err) {
          throw err;
        } else {
          console.log("1 user removed");
          res.redirect('/list');
        }
      });
    }
  });
});

/* MONGOOSE Testing */
var schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  first_name:String,
  last_name: String,
  age: Number,
  occupation: String,
  address: {
    street: String,
    town: String,
    county: String,
    country: String
  }
});

mongoose.model('users', schema);

app.get('/mongoose', function(req, res) {
  mongoose.connect("mongodb://localhost/sampsite");

  mongoose.model('users').find({"first_name":"Jason"}, function(err, users) {
    res.send(users);
  });

  mongoose.model('users').update({"first_name":"Jason"}, {})
});

// listen for requests on port 20000
app.listen(20000, function() {
  console.log("Started on 20000");
});
