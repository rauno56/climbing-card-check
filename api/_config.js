import process from 'node:process';

export const registrationFee = 10;
export const emailAuth = {
	user: 'taavi@ronimisliit.ee',
	pass: process.env.GOOGLE_APP_PASSWORD,
};

const { EMAIL_TEST_TO } = process.env;

export const email = {
	replyTo: 'julgestajakaart@ronimisliit.ee',
	testTo: EMAIL_TEST_TO.split(',')
		.map((rec) => rec.trim())
		.filter((rec) => rec.length),
};

const { MONTONIO_ACCESS_KEY, MONTONIO_SECRET_KEY } = process.env;
export const montonio = {
	api: 'https://sandbox-stargate.montonio.com/api',
	accessKey: MONTONIO_ACCESS_KEY,
	secretKey: MONTONIO_SECRET_KEY,
};

const { SITE_BASE, VERCEL_URL } = process.env;
export const siteBase = SITE_BASE || VERCEL_URL;

export default {
	siteBase,
	registrationFee,
	emailAuth,
	email,
	montonio,
};
