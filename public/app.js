 async function fetchResult(id) {
	const res = await fetch(`/api/check?id=${id}`);
	const data = await res.text();
	return data;
}

async function logSubmit(event) {
	event.preventDefault();

	log.textContent = `Response: `;
	console.log(event);
	const result = await fetchResult(idCodeInput.value);

	log.textContent += result;
}

const form = document.getElementById('form');
const log = document.getElementById('log');
const idCodeInput = document.getElementById('idCode');

form.addEventListener('submit', logSubmit);
