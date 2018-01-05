# menu-demo

WIP of boost for a particular web page


## how to
The default key to active is MacCommand+B, this is set in the manifest.
The script listens for this command and when found, checks the text at the target element on the page
In the target element and its children, if a match is found against one of the patterns, a link is created to that item and shown on the page

MacCtrl+Z opens the side bar, which has a search that uses similar logic to the text search on the page. It builds links for input that matches patterns, links that work in a proprietary system. 

This addon is mostly for personal use.

## What it does

This Addon finds common patterns for various things(projects, homes, phone numbers) and creates an easily clicked link related to that number.

## What it shows

a link to the item it found in text.

## how the pattern linker object is structured 

patternLinkerContainer: {
	
	//when trying to find a match, this obj is iterated over. Each pattern is checked against the target
	//text, when matches are found, links are build using the related link and link text
	patternLinkers: {
		"some pattern linker": {
			pattern: Regex pattern,
			link: link text to fill,
			linkText: link text to display
		},

		"some other pattern linker": {
			pattern: Regex pattern,
			link: link text to fill,
			linkText: link text to display
		}
	},

	//text put into link to be replaced when pattern is matched
	placeholder: "#placeholder#",

	//domain of the site, used to build link
	domain: domain_pulled_from_page

}