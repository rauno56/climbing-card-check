import process from 'node:process';
import assert from 'node:assert';

const validUsers = JSON.parse(process.env.AUTH_USERS ?? '[]');

assert(Array.isArray(validUsers));

if (validUsers.length === 0) {
	console.warn('No users configured');
}

export const validate = (username, password) => {
	if (typeof username !== 'string' || !username.length) {
		return false;
	}

	if (typeof password !== 'string' || !password.length) {
		return false;
	}

	// Check authentication
	const userPass = `${username}:${password}`;

	return validUsers.includes(userPass);
};
