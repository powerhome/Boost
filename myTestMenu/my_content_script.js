console.log("Content Script Loaded");

var domain = /https?:\/\/(?:www.)?\S*.com|file:\/\/\/\S*.html/i.exec(document.URL)[0];

var replaceWithNum = "#placeholder#";


var homePatt = /H#(\d{1,8})/ig;
var phonePatt = /\(?(\d{3})\)?(?:\s|\-)*(\d{3})\-?(\d{4})/ig;
//testing this
var homePattern = new PatternLinker(homePatt, domain + "/homes/" + replaceWithNum);

var phonePattern = new PatternLinker(phonePatt, domain + "/phones/" + replaceWithNum);


const patterns = {	home_pattern: homePattern, 
//todo fix
	phone_pattern: phonePattern					
				};




browser.runtime.onMessage.addListener(request => {
	console.log("from bg: " + request.greeting);
	
	var response = "response: ";

	if(request.greeting == "action clicked")	
	{
		response += "action click recieved";
		console.log("action click conf");
	}
	if(request.greeting == "command pressed")
	{
		response += "command pressed recieved";
		//addTextAtMouse();
		console.log("command press conf");
		linkifyAtMouseover();
	}


	return Promise.resolve({answer: response});
});


/* 
holds a regex pattern and the proper way to link to that item if it matches
*/ 
function PatternLinker(pattern, link)
{
	this.pattern = pattern;
	this.link = link;
}



function onError(error) {
  console.log(`Error: ${error}`);
}



//TODO
function linkifyAtMouseover() {

	console.log("Linkify running");

	let target = getMouseoverElement();

	let text = target.textContent;
	
	//var result = homePatt.exec(text);
	//var matches = getAllMatches(text);
	
	//var links = linkifyHomes(matches);

	var links = getAllMatches(text);

	console.log("Links: " + links.length + "\n Adding links to DOM");


	for(let i = 0; i < links.length; i++)
	{
		let item = links[i];

		let resultDiv = document.createElement("DIV");
		resultDiv.innerHTML = item;

		target.parentNode.insertBefore(resultDiv, target.nextSibling);


	}
	
}

/*
	returns the most specific element at the mouse
*/
function getMouseoverElement() {
	var items = document.querySelectorAll( ":hover" );
		
	if(items.length > 0) {

		console.log("item at mouseover: " + items[items.length - 1].tagName);
		return items[items.length - 1];
	}

	return null;

}




/*
finds matches for all the patterns and returns them in one array
*/
function getAllMatches(text) {
	console.log("Getting matches from text and making links");
	var	matches = [];
	//accumulate all the matches
	var results = [];

	console.log("matching patterns");
	for(patt in patterns) {
		let thisPatt = patterns[patt];
		//gets all the matches for the pattern in the text

		matches = getMatchesFromText(text, thisPatt.pattern);

		// for every match, replace the placeholder with the actual number
		for(let i = 0; i < matches.length; i++)
		{
			
			//replace REPLACE WITH NUM in link for patt with num from matches
			let res = thisPatt.link.replace(replaceWithNum, matches[i]);
			results.push(res);
		}

	}

	console.log("matches made: " + results.length);
	return results;
}

/*
	gets all the matches for pattern from text
	returns the first capture group from the matches
*/
function getMatchesFromText(text, pattern) {

	let resultArray;
	let results = [];

	//finds all the  matches in the text
	while ((resultArray = pattern.exec(text)) !== null) {
		if(resultArray !== null) {
		  var msg = "Found " + resultArray[0] + ".  ";
		  msg += "Next match starts at " + pattern.lastIndex;

		  result = "";

		  for(let i = 1; typeof resultArray[i] !== 'undefined'; i++)
		  {

			result += resultArray[i];

		  }
		  results.push(result);
	
		  //console.log(msg);
		}
		else {
			console.log("no matches");
		}

	}


	return results;

}




function linkifyResult(result){





}






