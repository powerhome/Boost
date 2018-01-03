console.log("sidebar.js loaded");

/*
Called when there was an error.
We'll just log the error here.
*/
function onError(error) {
  console.log(`Error: ${error}`);
}

var patternLinkerContainer;

window.onload = () =>  {

	//gets patterns to search from from BG
	browser.runtime.sendMessage({greeting: "get PLC"}
		).then(response => {
      patternLinkerContainer = response.patternLinkerContainer;
    }).catch(onError);

	let form = document.getElementById('smart_search');
	form.onsubmit = e => {
		e.preventDefault();

		console.log("form submitted");
		formSubmitted(e.target);

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


	let value =  form.childNodes[1].value;
	console.log(value);
	let links = linksFromText(value);
	console.log(form.parentNode);

	if(links.length > 0) {
		addResultsToDiv(resultDiv, links);
	}
	else {
		noMatches(resultDiv, value);
		// let noMatches = document.createElement("DIV");
		// noMatches.innerHTML = "No Matches found for: " + value;
		// resultDiv.append(noMatches);
	}

}

//helper method to put message in for no matches
//uses same code as adding result 
function noMatches(div, value)
{
	let msgForNoMatches = ["No Matches found for: " + value];
	addResultsToDiv(div, msgForNoMatches);
}

/*

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

/*
	Checks all patternLinkers in patternLinkers obj against text and returns links for those matches
*/
function linksFromText(text) {
	//accumulate all the matches
	let results = [];
	//patternLinkers in PLC holds the patterns to match
	for(patt in patternLinkers = patternLinkerContainer.patternLinkers) {
		let thisPatt = patternLinkers[patt];
		let matches = getMatchesFromText(text, thisPatt.pattern);
		// for every match, replace the placeholder with the actual number
		for(let i = 0; i < matches.length; i++)
		{
			//replace placeholder value in link with num from matches
			let res = thisPatt.link.replace(patternLinkerContainer.placeholder, matches[i]);
			res = thisPatt.linkText + linkify(res,  matches[i]);
			results.push(res);
		}
	}
	console.log("matches made: " + results.length);
	return results;

	/*
		gets all the matches for pattern from text
		returns a concatenation of the capture groups for the patter
		assumes that the capture group collectively concat to the proper number
	*/
	function getMatchesFromText(text, pattern) {

		let resultArray;
		let results = [];

		//finds all the  matches in the text for this pattern
		while ((resultArray = pattern.exec(text)) !== null) {
			  result = "";

			  //index 1,2,3... correspond to capture groups in regex
			  for(let i = 1; typeof resultArray[i] !== 'undefined'; i++)
			  {
			  	if(i == 2) { result += "-"; }
				result += resultArray[i];

			  }
			  results.push(result);
		}
		return results;
	}

	/*
		Takes an address and text for link and builds the tag accordingly
	*/
	function linkify(linkAddress, textToLink) {
		result = "<a target=\"_blank\" href =\"" + linkAddress + "\">" + textToLink + "</a>";

		return result;
	}
}
