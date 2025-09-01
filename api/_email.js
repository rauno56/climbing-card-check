import assert from 'node:assert';
import process from 'node:process';
import nodemailer from 'nodemailer';

const { GOOGLE_APP_PASSWORD } = process.env;
assert.equal(GOOGLE_APP_PASSWORD?.length, 16, `Invalid GOOGLE_APP_PASSWORD: ${typeof GOOGLE_APP_PASSWORD} of length ${GOOGLE_APP_PASSWORD?.length}.`);

const transport = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'taavi@ronimisliit.ee',
		pass: process.env.GOOGLE_APP_PASSWORD,
	},
});

export const send = async (to, subject, text, html = text) => {
	assert.equal(typeof subject, 'string', 'Subject must be a string');
	assert.equal(typeof text, 'string', 'Text must be a string');
	assert.equal(typeof html, 'string', 'HTML must be a string');

	const message = {
		from: 'taavi@ronimisliit.ee',
		to,
		replyTo: 'julgestajakaart@ronimisliit.ee',
		subject,
		text: text.replace(/\r?\n/g, '\r\n'),
	};

	const info = await transport.sendMail(message);
	console.log({ ts: new Date(), msg: 'email sent', subject: message.subject });
	return info;
};

export const climberAddedNotification = async (by, name) => {
	assert.equal(typeof by, 'string', 'Examiner name must be a string');
	assert.equal(typeof name, 'string', 'First name must be a string');

	const subject = 'Registrisse lisati uus ronija';
	const text = `Tere!

Registrisse on lisatud uus ronija.
Eksamineerija: ${by}
Nimi: ${name}`;

	return await send('ronimisliit@viskus.io,taavi@ronimisliit.ee', subject, text);
};
