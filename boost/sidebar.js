console.log("sidebar.js loaded");

/*
Called when there was an error.
We'll just log the error here.
*/
function onError(error) {
  console.log(`Error: ${error}`);
}

window.onload = () =>  {

	let button = document.getElementById("clearButton");
	button.onclick = () => {
		document.getElementById("smart_search_results").innerHTML = "";
	}


	let form = document.getElementById('smart_search');
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
	let resultDiv = document.getElementById("smart_search_results");

	//gets value from input field
	let value =  form.childNodes[1].value;

	//let links = linksFromText(value);
	let gettingLinks = getLinksFromBG(value);
	
	gettingLinks.then(response => {
       links = response.links;

       if(links.length > 0) {
			addResultsToDiv(resultDiv, links);
			form.reset();
		}
		else {
			noMatches(resultDiv, value);
		}

		showClearResultsButton();
    }).catch(onError);

}

//sets the clearResults button to show
function showClearResultsButton() {
	let button = document.getElementById("clearButton");
	if(button.style.display == "none")
	{
		button.style.display = "inline";
	}
}

//gets links made from matches for target value
function getLinksFromBG(targetValue) {

	let msg = {greeting: "get links", value: targetValue};

	return browser.runtime.sendMessage(msg);
}

//helper method to put message in for no matches
//uses same code as adding result 
function noMatches(div, value)
{
	let msgForNoMatches = ["No Matches found for: " + value];
	addResultsToDiv(div, msgForNoMatches);
}

/*
	adds the links in array "links" to the result div
*/
function addResultsToDiv(div, links) {

	for(let i = 0; i < links.length; i++)
	{
		let resultLink = document.createElement("DIV");
		resultLink.innerHTML = links[i];
		div.insertBefore(resultLink, div.firstChild);
	}
}
