import { validate } from './_auth.js';

export default function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { username, password } = req.body;

	// Validate required fields
	if (!username || !password) {
		return res.status(400).json({ error: 'Username and password required', success: false });
	}

	if (!validate(username, password)) {
		return res.status(401).json({ error: 'Invalid credentials', success: false });
	}

	return res.status(200).json({
		success: true,
		message: 'Authentication successful',
		username: username
	});
}
