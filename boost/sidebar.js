console.log("sidebar.js loaded");

/*
Called when there was an error.
We'll just log the error here.
*/
function onError(error) {
  console.log(`Error: ${error}`);
}

window.onload = () =>  {

	let form = document.getElementById('smart_search');
	form.onsubmit = e => {
		e.preventDefault();

		console.log("form submitted");
		if(formSubmitted(e.target))
		{
			e.target.reset();
		}

		//prevents the normal form submission
		return false;
	}
};


/*
	takes an htmlformelement and parses it
*/
function formSubmitted(form)
{
	console.log("processing " + form.name);

	let resultDiv = document.getElementById("smart_search_results");

	//gets value from input field
	let value =  form.childNodes[1].value;

	//let links = linksFromText(value);
	let gettingLinks = getLinksFromBG(value);
	
	gettingLinks.then(response => {
       links = response.links;
       console.log(links);

       if(links.length > 0) {
		addResultsToDiv(resultDiv, links);
		return true;
		}
		else {
			noMatches(resultDiv, value);
			return false;
		}

    }).catch(onError);

}

function getLinksFromBG(targetValue) {

	let msg = {greeting: "get links"};
	msg.value = targetValue;
	let links = "no links";
	msg.value = targetValue;

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
		console.log(links[i]);
		resultLink.innerHTML = links[i];
		div.insertBefore(resultLink, div.firstChild);
	}
}
