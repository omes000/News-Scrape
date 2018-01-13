
if (window.location.pathname === "/") {
	$("#navi").append("<li><button type='button' class='btn btn-default navbar-btn' id ='scraper'>Scrape</button></li>")
	displayArticles();
}

if (window.location.pathname === "/saved") {
	savedArticles();
}

function displayArticles(){
	$.getJSON("/articles", function(data) {
		for (var i = 0; i < data.length; i++) {
		$("#scraped-articles").append("<div class='panel panel-default' data-id='"+ data[i]._id +"'><div class='panel-heading'><h3 class='panel-title'>" + data[i].title + "</h3><button type = 'button' class = 'btn btn-default pull-right save-article' id ='" + data[i]._id +"'>Save Article</button></div><div class='panel-body'><a href ='" + data[i].link + "'>"+ data[i].link +"</a></div></div>");
		}
	})
}

function savedArticles () {
	$.get("/api/saved").then((data) => {
		console.log(data);

		for(var i = 0; i < data.length; i++){
			$("#saved-articles").append("<div class='panel panel-default' data-id='"+ data[i]._id +"'><div class='panel-heading'><h3 class='panel-title'>" + data[i].title + "</h3><button type = 'button' class = 'btn btn-default pull-right remove-article' id ='" + data[i]._id +"'>Remove Article</button></div><div class='panel-body'><a href ='" + data[i].link + "'>"+ data[i].link +"</a></div></div>")
		}
	})
}

function scrapeArticles() {
	$.get('/scrape').then((data) => {
		displayArticles();
	});
}


$("#scraper").on('click', function(){
	scrapeArticles();
})

$(document).on("click", ".remove-article", function(){
	var articleId = $(this).attr("id");
	console.log(articleId);
	$("[data-id="+ articleId + "]").remove();
	$.post('/remove/' + articleId).done(function(data){
		console.log(data);

	})
})

$(document).on("click", ".save-article", function(){
	var articleId = $(this).attr("id");
	console.log(articleId);
	$("[data-id="+ articleId + "]").remove();
	$.post('/save/' + articleId).done(function(data){
		console.log(data);

	})
})

$(document).on("click", "p", function() {

	$("#notes").empty();

	var thisId = $(this).attr("data-id");

	$.ajax({
		method: "GET",
		url: "/articles/" + thisId
	})
	// With that done, add the note information to the page
		.done(function(data) {
			console.log(data);
			// The title of the article
			$("#notes").append("<h2>" + data.title + "</h2>");
			// An input to enter a new title
			$("#notes").append("<input id='titleinput' name='title' >");
			// A textarea to add a new note body
			$("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
			// A button to submit a new note, with the id of the article saved to it
			$("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

			// If there's a note in the article
			if (data.note) {
			// Place the title of the note in the title input
			$("#titleinput").val(data.note.title);
			// Place the body of the note in the body textarea
			$("#bodyinput").val(data.note.body);
		}
	});
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
// Grab the id associated with the article from the submit button
var thisId = $(this).attr("data-id");

// Run a POST request to change the note, using what's entered in the inputs
$.ajax({
method: "POST",
url: "/articles/" + thisId,
data: {
// Value taken from title input
title: $("#titleinput").val(),
// Value taken from note textarea
body: $("#bodyinput").val()
}
})
// With that done
.done(function(data) {
// Log the response
console.log(data);
// Empty the notes section
$("#notes").empty();
});

// Also, remove the values entered in the input and textarea for note entry
$("#titleinput").val("");
$("#bodyinput").val("");
});
