console.log("sidebar.js loaded");

/*
Called when there was an error.
We'll just log the error here.
*/
function onError(error) {
  console.log(`Error: ${error}`);
}

window.onload = () =>  {


	let gettingRecent = browser.runtime.sendMessage({greeting: "get Recent"});
	gettingRecent.then(response => {
		console.log(response.value);
		if(response.value[0]){
			addResults(response.value);
		}
	});


	let button = document.getElementById("clearButton");
	button.onclick = () => {
		document.getElementById("smart_search_results").innerHTML = "";
		let clearingRecent = browser.runtime.sendMessage({greeting: "clear Recent"});

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
	

	//gets value from input field
	let value =  form.childNodes[1].value;

	//let links = linksFromText(value);
	let gettingLinks = getLinksFromBG(value);
	
	gettingLinks.then(response => {
       links = response.links;

       if(links.length > 0) {
			addResults(links);
			form.reset();
		}
		else {
			noMatches(value);
		}

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
function noMatches(value)
{
	let msgForNoMatches = ["No Matches found for: " + value];
	addResults(msgForNoMatches);
}

/*
	adds the links in array "links" to the result div
*/
function addResults(links) {
	let resultDiv = document.getElementById("smart_search_results");
	showClearResultsButton();

	for(let i = 0; i < links.length; i++)
	{
		let resultLink = document.createElement("DIV");
		resultLink.innerHTML = links[i];
		resultDiv.insertBefore(resultLink, resultDiv.firstChild);
	}
}
