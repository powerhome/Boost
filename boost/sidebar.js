console.log("sidebar.js loaded");

window.onload = () =>  {
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
	console.log("processing " + form.name);
	console.log(form.childNodes[1].value);

}