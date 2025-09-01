import assert from 'node:assert';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import process from 'node:process';
import { promisify } from 'node:util';

export const ENC = 'base64url';
const KEYLEN = 32;
const scryptAsync = promisify(scrypt);

const validUsers = JSON.parse(process.env.AUTH_USERS ?? '[]')
	.map(([name, email, salt, hash]) => {
		return {
			name,
			email: email.toLowerCase(),
			salt: Buffer.from(salt, ENC),
			hash: Buffer.from(hash, ENC),
		};
	});

assert(Array.isArray(validUsers));

if (validUsers.length === 0) {
	console.warn('No users configured');
}

export const genHash = async (password) => {
	const salt = randomBytes(3);
	const hash = await scryptAsync(password, salt, KEYLEN);
	return {
		salt: salt.toString(ENC),
		hash: hash.toString(ENC)
	};
};

export const deriveHash = async (salt, password) => {
	return await scryptAsync(password, salt, KEYLEN);
};

const compare = async (salt, hash, password) => {
	const derivedHash = await deriveHash(salt, password);
	return timingSafeEqual(hash, derivedHash);
};

export const validate = async (email, password) => {
	email = email.toLowerCase();

	if (typeof email !== 'string' || !email.length) {
		return false;
	}

	if (typeof password !== 'string' || !password.length) {
		return false;
	}

	for (const compared of validUsers) {
		if (compared.email !== email) {
			continue;
		}
		const result = await compare(compared.salt, compared.hash, password);
		if (result) {
			return compared;
		}
		return result;
	}

	return null;
};
