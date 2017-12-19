console.log("Content Script Loaded");

var domain = /https?:\/\/(?:www.)?\S*.com|file:\/\/\/\S*.html/i.exec(document.URL)[0];
console.log("domain: " + domain);


var replaceWithNum = "#placeholder#";

var homePatt = /H#(\d{1,8})/ig;
//testing this
var homePattern = new PatternLinker(homePatt, domain + "/homes/" + replaceWithNum);

var patterns = {"home_pattern": homePattern};




browser.runtime.onMessage.addListener(request => {
	console.log("listener code running:");
	
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

	console.log("from bg: " + request.greeting);
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

function getMouseoverElement() {
	var items = document.querySelectorAll( ":hover" );
		
	if(items.length > 0) {

		console.log("item at mouseover: ");
		console.log(items[items.length - 1]);
		return items[items.length - 1];
	}

	return null;

}


//TODO
function linkifyAtMouseover() {

	console.log("Linkify running");

	let target = getMouseoverElement();

	let text = target.textContent;
	console.log(text);
	
	//var result = homePatt.exec(text);
	var matches = getAllMatches(text);
	
	var links = linkifyHomes(matches);

	console.log("Links: " + links);

	for(let i = 0; i < matches.length; i++)
	{
		let item = matches[i];

		let resultDiv = document.createElement("DIV");
		console.log(item);
		resultDiv.innerHTML = item;

		target.parentNode.insertBefore(resultDiv, target.nextSibling);


	}




	
	//
	// if(result !== null)
	// {

	// 	
	// 	console.log("match found: " + result[0]);
	// }
	// else
	// {
	// 	console.log("no match at mouse over");
	// }
	
}




function linkifyHomes(homes)
{
	console.log("Making links from homes");

	linkedHomes = new Array(10);

	//TODO ERROR HERE

	for(let i = 0; i < homes.length; i++)
	{


		linkedhome = domain + "/homes/" + homes[i];

		console.log(linkedHome);

		linkedHomes.push(linkedHome);



	}

	return linkedHomes;	
}

/*
finds matches for all the patterns and returns them in one array
*/
function getAllMatches(text) {

	var	matches = [];
	var finalResults = [];

	for(patt in patterns) {
		//gets all the matches for the pattern in the text
		matches = getMatchesFromText(text, patt);

		for(let i = 0; i < matches.length; i++)
		{
			//replace REPLACE WITH NUM in link for patt with num from matches
			matches[i].
		}

	}





//this bit works - blocking to try new pattern
	// //get home pattern matches
	// let homeResults = getMatchesFromText(text, homePatt);

	// console.log("results: " + homeResults);
	// return homeResults;
}

function getMatchesFromText(text, pattern) {

	let resultArray;
	let results = [];

	while ((resultArray = pattern.exec(text)) !== null) {
	  var msg = "Found " + resultArray[0] + ".  ";
	  msg += "Next match starts at " + pattern.lastIndex;
	  results.push(resultArray[1]);
	
	  console.log(msg);
	}


	return results;

}




function linkifyResult(result){





}






