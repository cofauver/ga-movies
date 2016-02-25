var input = document.getElementById('movie-input');
var xmlhttp = new XMLHttpRequest();

function displayList(resultsList){
	resultsList = JSON.stringify(resultsList);
	document.getElementsByTagName('rbl-repeater')[0].setAttribute('content', resultsList);
};

function requestApiSearch(query, page){
	query = query.replace(' ', '+');
	var url  = 'http://www.omdbapi.com/?s=' + query;
	if(page){
		url = url + '&page=' + page;
	}	
	xmlhttp.open('GET', url, true);
	xmlhttp.send();
};

xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var response = JSON.parse(xmlhttp.responseText)
        // console.log(response); //for checking the details of the API response 
        var results = response.Search; 
                			// ^ Search is the name of the attribute in the API response.
        displayList(results);
    }
};

input.addEventListener('input', function(){
	requestApiSearch(input.value);
});

