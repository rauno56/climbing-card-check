import { validate } from './_auth.js';
import { certificateCodeToRegistryValue, isIdCodeValid } from './_db.data-utils.js';
import * as db from './_db.js';
import { climberAddedNextSteps, climberAddedNotification } from './_email.js';
import * as key from './_key.js';

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { username, password, idCode, name, email, cardType, examDate, comment } = req.body;
	const authUser = await validate(username, password);

	if (!authUser) {
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

	try {
		const secretKey = key.load();
		const sheetsClient = await db.connect(secretKey.client_email, secretKey.private_key);

		// Row data matching header: formFillTime, id, name, certificate, examDate, expiryDate, daysUntilExpiry, examiner, email, phone, comment, formFillerEmail, formPassword, dataConsent, responsiblityConsent
		const rowData = [
			new Date().toISOString(), // formFillTime
			idCode, // id
			name, // name
			certificateCodeToRegistryValue(cardType), // certificate
			examDate, // examDate
			record.expiryTime, // expiryDate
			'', // daysUntilExpiry - calculated field, left empty (formulas don't work with append API)
			authUser.name, // examiner
			email, // email
			'', // phone - not collected in this form
			comment || '', // comment
			'', // formFillerEmail - not applicable for automatic entry
			'', // formPassword - not applicable for automatic entry
			'', // dataConsent - not collected in this form
			'' // responsiblityConsent - not collected in this form
		];

		await db.addRow(sheetsClient, rowData);
		await Promise.all([
			climberAddedNotification(authUser.name, name),
			climberAddedNextSteps(email, name),
		]);

		return res.status(200).json({
			success: true,
			message: 'Climber added successfully',
			record: record
		});
	} catch (error) {
		console.error('Error adding climber:', error);
		return res.status(500).json({
			success: false,
			error: 'Failed to add climber'
		});
	}
}

function calculateExpiryDate(examDate) {
	// Add 3 years to exam date for certificate expiry
	const date = new Date(examDate);
	date.setFullYear(date.getFullYear() + 3);
	return date.toISOString().split('T')[0];
}
