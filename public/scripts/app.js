var input = document.getElementById('movie-input');
var moreResultsButton = document.getElementById('more-results');
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

/* 
This watches for changes in the state of xmlhttp. When
the readyState is 4 (request finished and response is ready) 
and when the status code is 200, we read in the response and
push the results to the current list of movies.
*/ 
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var response = JSON.parse(xmlhttp.responseText)
        var newResults = response.Search;
        						// ^ Search is the name of the attribute containing the movie list in the API response.
        Array.prototype.push.apply(currentResults, newResults); 
        /* ^ takes Array's push function and applies it to 
        currentResults with newResults as the list of arguments.
        This trick allows us to avoid repeating through all of 
        new results and pushing them one by one to the currentResults.
        */

        console.log(currentResults);
		document.getElementsByTagName('rbl-repeater')[0].setAttribute('content', JSON.stringify(currentResults));
    }
};


/* 
This listens for changes in the input box. Any change in the text
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
This listens for clicks on the "See more results" button. When clicked,
it increments the page that is being shown and searches for the next
ten results (OMDB returns pages of 10 results at a time)
*/ 
moreResultsButton.addEventListener('click',function(){
	currentQueryPage += 1;
	requestApiSearch(currentQuery, currentQueryPage);
});

