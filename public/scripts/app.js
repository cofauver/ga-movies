/***************************************************
				VARIABLE DECLARATIONS
****************************************************/

var input = document.getElementById('movie-input');
var form = document.getElementById('movie-form');
var moreResultsButton = document.getElementById('more-results');
var favoriteButtons;
var xmlhttp = new XMLHttpRequest();
var currentQuery, currentQueryPage, totalResults;
var currentResults = [];


/***************************************************
		CONTACTING APIs (BACKEND AND OMDB)

These are the methods that contact outside resources
to make sure that the app has all of the info that 
it needs.
****************************************************/

/* 
This function makes a request for the results of a 
search from the Open Movie Database api.
	query(string, required): the text to search in omdb
	page(number, not required): the page that you want to get.
	Requests return pages of 10 results at a time.
*/ 
function requestApiSearch(query, page){
	query = query.replace(' ', '+');
	var url  = 'http://www.omdbapi.com/?s=' + query + '&type=movie';
	if(page){
		url = url + '&page=' + page;
	}	
	xmlhttp.open('GET', url, true);
	xmlhttp.send();
};

/* 
This function makes the request for the details of a single
movie from the Open Movie Database api.
	id: the imdbID of the desired movie.
*/ 
function getMovieDetails(id){
	var url  = 'http://www.omdbapi.com/?i=' + id + '&plot=full';
	xmlhttp.open('GET', url, true);
	xmlhttp.send();
};

/*
This pings the backend for the list of stored favorites.
*/
function getFavorites(){
	var url  = 'favorites';
	xmlhttp.open('GET', url,  true);
	xmlhttp.send();
};

/*
This pings the backend to add a new movie to the favorites data file.
*/
function postFavorite(movie){
	var url  = 'favorites';
	xmlhttp.open('POST', url,  true);
	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlhttp.send(JSON.stringify(movie));
};

/***************************************************
				HANDLING API RESPONSES

This section listens for API responses (onreadystatechange)
and then executes the proper functionality (defined
in the additional methods).
****************************************************/

/* 
onreadystatechange watches for changes in the state of
xmlhttp. When the readyState is 4 (request finished 
and response is ready) and when the status code is 200,
we check the response to see if its a search for many 
movies, the details of just one movie, or the list of 
favorite movies. We also catch errors from the OMDB
database because it doesn't use proper status codes. 
*/ 
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var response = JSON.parse(xmlhttp.responseText);
        if(response.Error){
        	console.log('Movie database error: ' + response.Error);
        }else if(response.Search){
						// ^ Search is the name of the attribute 
						// containing the movie list in the API response.
			totalResults = response.totalResults;
 			updateSearchDisplay(response.Search);
        }else if(response.Plot){
        				// ^ Plot is an attribute only available
        				// on the detailed movie search result.
        	openDetailsView(response ,response.imdbID + 'details');
        }else{
        	updateFavorites(response);
        }   						
    }
};

/*
Updates the list of displayed searches.
*/
function updateSearchDisplay(newResults){
    Array.prototype.push.apply(currentResults, newResults); 
    /* ^ takes Array's push function and applies it to 
    currentResults with newResults as the list of arguments.
    This trick allows us to avoid repeating through all of 
    new results and pushing them one by one to the currentResults.
    */
	var listHtml = createResultsListHtml(currentResults);        						
	insertHtml('search-results', listHtml);
	toggleMoreResultsButton();
	addFavoriteButtonListeners(); 
	addTitleClickListeners();
}

/*
Updates the list of favorite movies. Executes when
the page loads as well as when
*/
function updateFavorites(favs){
	var favoritesHtml = createFavoritesHtml(favs);
	insertHtml('favorites', favoritesHtml);
}

/*
Adds the detail view below a movie with specified id.
*/
function openDetailsView(movieDetails, elementId){
	var detailHtml = createDetailsHtml(movieDetails);
	insertHtml(elementId, detailHtml);
}

/*
Show or hide the more results button based on whether 
there are more 
*/
function toggleMoreResultsButton(){
	if(currentResults.length < totalResults){
		moreResultsButton.style.visibility = 'visible';
	}else{
		moreResultsButton.style.visibility = 'hidden';
	}
};


/***************************************************
					LISTENERS
****************************************************/

/* 
This listener detects changes in the input box. Any change in the text
will trigger the query data to reset and clear the currentResults.
Then it requests an api search for the new, changed query.
*/ 
form.addEventListener('submit', function(event){
	event.preventDefault();
	currentQuery = input.value;
	currentQueryPage = 1;
	currentResults = [];
	requestApiSearch(currentQuery);
});

/* 
This listener detects clicks on the "See more results" button. When clicked,
it increments the page that is being shown and searches for the next
ten results (OMDB returns pages of 10 results at a time)
*/ 
moreResultsButton.addEventListener('click',function(){
	currentQueryPage += 1;
	requestApiSearch(currentQuery, currentQueryPage);
});

/*
Add listeners to each "favorite" button.
*/ 
function addFavoriteButtonListeners(){
	var favoriteButtons = document.getElementsByClassName('favorite');
	var len = favoriteButtons.length;
	for(var i = 0; i<len; i++){
		var button = favoriteButtons[i];
		button.addEventListener('click', function(event){
			var movie = getClickedMovie(event);
			postFavorite(movie);
		});	
	};
};

/*
Add listeners to each title so that clicking them will open
up a detail view.
*/
function addTitleClickListeners(){
	var titles = document.getElementsByClassName('movie-title');
	var len = titles.length;
	for(var i = 0; i<len; i++){
		var currentTitle = titles[i];
		currentTitle.addEventListener('click', function(event){
			var movie = getClickedMovie(event);
			getMovieDetails(movie.imdbID);
		});	
	};
};


/*
Given an event, find the movie that was clicked on
*/
function getClickedMovie(event){
	var currentElementIndex = event.path[1].dataset.listIndex; //event has a "path" property that is the list of elements in the DOM tree at and above the point of the click. The li has a data property that I want to access. Maybe there's a less hacky way to store this data.
	return currentResults[currentElementIndex];
};
			
/***************************************************
				BUILDING OUT HTML
****************************************************/

/* 
This function takes the formatted HTML
and inserts it into the document as
'child' HTML of the specified element.
	id: the id of the element which will house the new html as children.
	html: string of html to insert
*/
function insertHtml(id, html) {
    var el = document.getElementById(id);
    if(!el) {
        console.log('Element with id ' + id + ' not found.');
    }
    el.innerHTML = html;
};

/*
This function formats the search data list
into an HTML string to render on the page.
	data: an array of movie objects
*/
function createResultsListHtml(data) {
    var html = '<ul>';
    // Step through the rows of the data.
    for(var item in data) {
        var itemData = data[item];
        html += '<li data-list-index="' + item + '">'
        if(itemData.Poster === 'N/A'){
        	html += '<img class="movie-poster" src="images/bobines-video-icon.png">';
        }else{
        	html += '<img class="movie-poster" src="' + itemData.Poster + '">';
        }
        html += '<div class="favorite"></div>';
        html += '<h3 class="movie-title">' + itemData.Title +'</h3>';
        html += '<div id="' + itemData.imdbID + 'details"><div>';
        html += '</li>';
    }  
    html += '</ul>';
    return html;
};

/*
This function formats the favorite movies
into an HTML string to render on the page.
	data: an array of movie objects
*/
function createFavoritesHtml(data){
var html = '<ul>';
    // Step through the rows of the data.
    for(var item in data) {
        var itemData = data[item];
        html += '<li data-list-index="' + item + '">'
        if(itemData.Poster === 'N/A'){
        	html += '<img class="movie-poster" src="images/bobines-video-icon.png">';
        }else{
        	html += '<img class="movie-poster" src="' + itemData.Poster + '">';
        }
        html += '<h5 class="movie-title">' + itemData.Title +'</h5>';
        html += '<div id="' + itemData.imdbID + 'details"><div>';
        html += '</li>';
    }  
    html += '</ul>';
    return html;
};

/*
Builds the detail text HTML that is revealed
when a user clicks on a specific movie.
*/
function createDetailsHtml(movie){
	var html = '';
	html += '<p>'+ movie.Plot + '</p>';
    return html;
};


// to be run when the page loads.
window.onload = getFavorites;
