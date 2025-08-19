import { validate } from "./_auth.js";
import { isIdCodeValid } from "./_db.data-utils.js";

export default function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { username, password, idCode, name, email, cardType, examDate, comment } = req.body;

	if (!validate(username, password)) {
		return res.status(401).json({ error: 'Unauthorized', success: false });
	}

	// Validate required fields
	if (!idCode || !name || !email || !cardType || !examDate) {
		return res.status(400).json({ error: 'Missing required fields', success: false });
	}

	// Validate idCode format (11 digits)
	if (!/^\d{11}$/.test(idCode)) {
		return res.status(400).json({ error: 'Invalid ID code format', success: false });
	}

	if (!isIdCodeValid(idCode)) {
		return res.status(400).json({ error: 'Invalid ID code', success: false });
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return res.status(400).json({ error: 'Invalid email format', success: false });
	}

	// Validate card type
	if (!['green', 'red'].includes(cardType)) {
		return res.status(400).json({ error: 'Invalid card type', success: false });
	}

	// Create the record with audit info
	const record = {
		idCode,
		name,
		email,
		cardType,
		examDate,
		comment: comment || '',
		addedBy: username,
		addedAt: new Date().toISOString(),
		certificate: cardType,
		examTime: examDate,
		expiryTime: calculateExpiryDate(examDate),
		examiner: username
	};

	// TODO: Here you would save to your data store (Google Sheets, etc.)
	// For now, just log the record
	console.log('New climber record:', record);

	return res.status(200).json({
		success: true,
		message: 'Climber added successfully',
		record: record
	});
}

function calculateExpiryDate(examDate) {
	// Add 3 years to exam date for certificate expiry
	const date = new Date(examDate);
	date.setFullYear(date.getFullYear() + 3);
	return date.toISOString().split('T')[0];
}
