import { verifyOrderNotification } from './_payment.js';

const validSourceIps = ['35.156.245.42', '35.156.159.169'];

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	if (req.headers['x-forwarded-for']) {
		const ips = req.headers['x-forwarded-for'].split(',');
		if (!ips.some((ip) => validSourceIps.includes(ip))) {
			return res.status(400).json({
				success: false,
				message: 'Invalid source IP for webhook',
			});
		}
	} else {
		console.warn('No x-forwarded-for header');
	}

	const token = verifyOrderNotification(null, req.body.orderToken);

	console.log('=== MONTONIO WEBHOOK RECEIVED ===');
	console.log('Headers:', req.headers);
	console.log('Body:', req.body);
	console.log('Decoded:', token);
	console.log('Query:', req.query);
	console.log('Method:', req.method);
	console.log('URL:', req.url);
	console.log('================================');

	return res.status(200).json({
		success: true,
		message: 'Webhook received and logged',
	});
}
