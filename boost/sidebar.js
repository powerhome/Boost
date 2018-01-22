console.log("sidebar.js loaded");

/*
Called when there was an error.
We'll just log the error here.
*/
function onError(error) {
  console.log(`Error: ${error}`);
}

window.onload = () =>  {


	browser.runtime.sendMessage({greeting: "get Recent"}, function(response) {

		console.log(response.value);
		if(response.value[0]){
			addResults(response.value);
		}



	});


	let button = document.getElementById("clearResultsBtn");
	button.onclick = () => {
		document.getElementById("smartSearchResults").innerHTML = "";
		chrome.runtime.sendMessage({greeting: "clear Recent"});

	}

	let form = document.getElementById('smartSearchForm');
	form.onsubmit = e => {
		e.preventDefault();

		formSubmitted(e.target);
		//prevents the normal form submission
		return false;
	}
};


/*
	gets the value from the input field in the form and processes it
*/
function formSubmitted(form)
{
	

	//gets value from input field
	let value =  form.childNodes[1].value;

	//let links = linksFromText(value);
	getLinksFromBG(value);
	
	form.reset();
	

}


//gets links made from matches for target value
function getLinksFromBG(targetValue) {
	console.log("getting Links");
	let msg = {greeting: "get links", value: targetValue};

	chrome.runtime.sendMessage(msg, function(response) {
		console.log("callback");
		links = response.links;
		console.log(links);
		if(links.length > 0) {
			addResults(links);
			return true;
		}
		else {
			noMatches(targetValue);
		}

		return false

	})
}

//helper method to put message in for no matches
//uses same code as adding result 
function noMatches(value)
{
	let msgForNoMatches = ["No Matches found for: " + value];
	addResults(msgForNoMatches);
}

/*
	adds the links in array "links" to the result div
*/
function addResults(links) {
	let resultDiv = document.getElementById("smartSearchResults");

	for(let i = 0; i < links.length; i++)
	{
		let resultLink = document.createElement("DIV");
		resultLink.innerHTML = links[i];
		resultDiv.insertBefore(resultLink, resultDiv.firstChild);
	}
}
