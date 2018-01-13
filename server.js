var express = require("express");
var bodyParser = require("body-parser");
const exphbs = require('express-handlebars');
const path = require("path");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
//var mongojs = require("mongojs");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/public')));
app.engine("handlebars", exphbs({
	defaultLayout: "main"
}));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
	useMongoClient: true
});

// Routes
app.get("/", function (req, res) {
	res.render("index")
})

app.get("/scrape", function(req, res) {

  axios.get("http://www.gizmodo.com/").then(function(response) {

	var $ = cheerio.load(response.data);

	$("article h1").each(function(i, element) {

	  var result = {};


	  result.saveIt = false;
	  result.title = $(this)
	  .children("a")
	  .text();
	  result.link = $(this)
	  .children("a")
	  .attr("href");

	  db.Article
	  .create(result)
	  .then(function(dbArticle) {
		  res.json(dbArticle);
		})
	  .catch(function(err) {
		  res.json(err);
		  return;
		});
	});
});
});

app.get("/articles", function(req, res) {

  db.Article.find({saveIt: false}).then(function(dbArticle){
  	res.json(dbArticle)
  }).catch(function(err){
  	res.json(err);
  });
});


app.get("/articles/:id", function(req, res) {
	console.log(req.params.id);

	db.Article.findOne({_id: req.params.id}).populate("note").then(function(dbArticle){
		res.json(dbArticle)
	}).then(function(err){
		res.json(err)
	})
});

app.get("/saved", function (req, res){
	res.render("saved");
})

app.get("/api/saved", function(req, res){
	db.Article.find({saveIt: true}).then(function(dbSaved){
		res.json(dbSaved)
	}).then(function(err){
		res.json(err)
	})
})

app.post("/save/:id", function(req, res){
	db.Article.update({_id: req.params.id}, {$set:{saveIt: true}}, function(error, data){
		if (error) {
			console.log(error);
			res.json(error);
		}
		else {
			console.log(data);
	}
})
})

app.post("/remove/:id", function(req, res){
	db.Article.update({_id: req.params.id}, {$set:{saveIt: false}}, function(error, data){
		if (error) {
			console.log(error);
			res.json(error);
		}
		else {
			console.log(data);

		}
	})
})

app.post("/articles/:id", function(req, res) {
	db.Note.create(req.body).then(function(dbNote){
		return db.Article.findOneAndUpdate({_id: req.params.id}, {$set: {note:dbNote._id}}, {new: true})
	}).then(function(dbArticle){
		res.json(dbArticle);
	}).catch(function(err){
		res.json(err);
	})
});


app.listen(PORT, function() {
	console.log("App running on port " + PORT + "!");
});
