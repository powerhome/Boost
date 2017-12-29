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

	browser.runtime.sendMessage({greeting: "get PLC"}
		).then(response => {
      patternLinkerContainer = response.patternLinkerContainer;
    }).catch(onError);




	let form = document.getElementById('smart_search');
	form.onsubmit = e => {

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
	browser.runtime.sendMessage({greeting: "hello from sidebar", value: form.childNodes[1].value}
		).then(response => {
      console.log(response.response);
    }).catch(onError);

	console.log("processing " + form.name);
	console.log(form.childNodes[1].value);

}