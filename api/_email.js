import assert from 'node:assert';
import nodemailer from 'nodemailer';
import { email, emailAuth, registrationFee } from './_config.js';

// Assume Google App Password
const pass = emailAuth.pass;
assert.equal(pass?.length, 16, `Invalid SMTP password: ${typeof pass} of length ${pass?.length}.`);

const transport = nodemailer.createTransport({
	service: 'gmail',
	auth: emailAuth,
});

export const send = async (to, subject, text, html = text) => {
	assert.equal(typeof subject, 'string', 'Subject must be a string');
	assert.equal(typeof text, 'string', 'Text must be a string');
	assert.equal(typeof html, 'string', 'HTML must be a string');

	const message = {
		from: emailAuth.user,
		to,
		replyTo: email.replyTo,
		subject,
		text: text.replace(/\r?\n/g, '\r\n'),
	};

	const info = await transport.sendMail(message);
	console.log({ ts: new Date(), msg: 'email sent', subject: message.subject });
	return info;
};

export const climberAddedNotification = async (by, name) => {
	assert.equal(typeof by, 'string', 'Examiner name must be a string');
	assert.equal(typeof name, 'string', 'Climber name must be a string');

	const subject = 'Registrisse lisati uus ronija';
	const text = `Tere!

Registrisse on lisatud uus ronija.
Eksamineerija: ${by}
Nimi: ${name}`;

	// TODO: use ronimisliit's CS
	return await send(email.testTo, subject, text);
};

export const climberAddedNextSteps = async (climberEmail, climberName) => {
	assert.equal(typeof climberEmail, 'string', 'Climber email must be a string');

	const subject = 'Teid lisati julgestajakaartide registrisse';
	const text = `Tere!


Teid lisati julgestajakaartide registrisse. Kaardi aktiviseerimiseks
1. Kinnitage nõusolek andmekaitse tingimuste ja omavastutusdeklaratsiooniga siin: {{TODO}};
2. Makske registreerimistasu ${registrationFee}€ Ronimisliidu kontole EE867700771001351184 selgitusega "${climberName} registreerimistasu".

Tänades
Ronimisliidu meeskond`;

	// TODO: use climber email
	return await send(email.testTo, subject, text);
};
