# BOOST

WIP of boost for a particular web page


## how to
There are two commands: Make Link at Mouse and Open Bottom Bar

Make link at mouse takes all the text at the most specific element at the mouse
It then tried to match patterns against the text to determine if it needs to build links

Open Bottom Bar opens the a bottom bar, which has a search field that checks the same patterns as the other command, and also displays all recent matches



## how to structure the JSON for config for patterns

	patternLinkers: {
		"some pattern linker": {
			pattern: Regex pattern with a capture group,
			link: "path/to/put/after/domain/#placeholder#",
			linkText: "text that is shown:"
		},

		"appointment pattern": {
			pattern: /some pattern that matches appointments A#(12345)/,
			link: "/search/appointments/#placeholder#/",
			linkText: "Appt #: "
		}
	}

	IE: if i tried to link to A#12345 the result would be 
	Appt #: 12345  where the 12345 is a link to DOMAIN/search/appointments/12345
	
