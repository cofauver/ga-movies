var input = document.getElementById('movie-input');
var moreResultsButton = document.getElementById('more-results');
var favoriteButtons;
var xmlhttp = new XMLHttpRequest();
var currentQuery, currentQueryPage;
var currentResults = [];

/* 
This function makes the request for resources from the
Open Movie Database api.
	query(string, required): the text to search in omdb
	page(number, not required): the page that you want to get.
	Requests return pages of 10 results at a time.
*/ 
function requestApiSearch(query, page){
	query = query.replace(' ', '+');
	var url  = 'http://www.omdbapi.com/?s=' + query;
	if(page){
		url = url + '&page=' + page;
	}	
	xmlhttp.open('GET', url, true);
	xmlhttp.send();
};

function getMovieDetails(title){
	title = title.replace(' ', '+');
	var url  = 'http://www.omdbapi.com/?t=' + title + '&plot=full';
	xmlhttp.open('GET', url, true);
	xmlhttp.send();
};

/* 
This watches for changes in the state of xmlhttp. When
the readyState is 4 (request finished and response is ready) 
and when the status code is 200, we read in the response and
push the results to the current list of movies.
*/ 
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var response = JSON.parse(xmlhttp.responseText);
        if(response.Search){
        	var newResults = response.Search;
        						// ^ Search is the name of the attribute containing the movie list in the API response.
	        Array.prototype.push.apply(currentResults, newResults); 
	        /* ^ takes Array's push function and applies it to 
	        currentResults with newResults as the list of arguments.
	        This trick allows us to avoid repeating through all of 
	        new results and pushing them one by one to the currentResults.
	        */

			var listHtml = createResultsListHTML(currentResults);        						
			insertHTML('search-results', listHtml); 
			addFavoriteButtonListeners(); 
			addTitleClickListeners(); 	
        }else if(response.Plot){
        	var elementId = response.imdbID + 'details';
        	console.log(elementId);
        	var detailHtml = createDetailsHTML(response);
        	insertHTML(elementId, detailHtml);
        }    						
    }
};


/* 
This listener detects changes in the input box. Any change in the text
will trigger the query data to reset and clear the currentResults.
Then it requests an api search for the new, changed query.
*/ 
input.addEventListener('input', function(){
	currentQuery = input.value;
	currentQueryPage = 1;
	currentResults = [];
	requestApiSearch(currentQuery);
});

/* 
This listeners detects clicks on the "See more results" button. When clicked,
it increments the page that is being shown and searches for the next
ten results (OMDB returns pages of 10 results at a time)
*/ 
moreResultsButton.addEventListener('click',function(){
	currentQueryPage += 1;
	requestApiSearch(currentQuery, currentQueryPage);
});

/*
Here we add listeners to each favorite button after it's created
*/ 
function addFavoriteButtonListeners(){
	var favoriteButtons = document.getElementsByClassName('favorite');
	var len = favoriteButtons.length;
	for(var i = 0; i<len; i++){
		var button = favoriteButtons[i];
		button.addEventListener('click', function(){
			console.log('success');
		});	
	};
};

function addTitleClickListeners(){
	var titles = document.getElementsByClassName('movie-title');
	var len = titles.length;
	for(var i = 0; i<len; i++){
		var currentTitle = titles[i];
		currentTitle.addEventListener('click', function(event){
			var currentElement = event.path[0];
			getMovieDetails(currentElement.innerHTML);
		});	
	};
};

/*
This function formats the search data list
into an HTML string to render on the page.
*/
function createResultsListHTML(data) {
    var html = '';
    
    // Assume data is an array of objects,
    // containing strings.
    html += '<ul class="data">';
    
    // Step through the rows of the data.
    for(var item in data) {
        var itemData = data[item];
        html += '<li>'
        if(itemData.Poster === 'N/A'){
        	html += '<img class="movie-poster" src="images/bobines-video-icon.png">';
        }else{
        	html += '<img class="movie-poster" src="' + itemData.Poster + '">';
        }
        html += '<h3 class="movie-title">' + itemData.Title +'</h3>';
        html += '<button class="favorite"> <3 </button>'
        html += '<div id="' + itemData.imdbID + 'details"><div>';
        html += '</li>';
    }
    
    html += '</ul>';
    return html;
};

function createDetailsHTML(movie){
	console.log(movie);
	var html = '';
	html += '<p>'+ movie.Plot + '</p>';
    return html;
};


/* 
This function takes the formatted HTML
and inserts it into the document as
'child' HTML of the specified element.
*/
function insertHTML(id, html) {
    var el = document.getElementById(id);
    if(!el) {
        console.log('Element with id ' + id + ' not found.');
    }
    el.innerHTML = html;
};
