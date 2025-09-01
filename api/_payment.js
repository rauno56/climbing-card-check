import assert from 'node:assert';
import jwt from 'jsonwebtoken';

import { montonio, registrationFee, siteBase } from './_config.js';

assert.equal(typeof montonio.accessKey, 'string', 'Montonio access key required');
assert.equal(typeof montonio.secretKey, 'string', 'Montonio secret key required');

export const verifyOrderNotification = (montonioOrderId, orderToken) => {
	const decoded = jwt.verify(orderToken, montonio.secretKey);

	// TODO: check for match
	// if (decoded.uuid !== montonioOrderId) {
	// 	return null;
	// }

	if (decoded.accessKey !== montonio.accessKey) {
		return null;
	}

	if (decoded.paymentStatus !== 'PAID') {
		return null;
	}

	return decoded;
};

const splitName = (name) => {
	const parts = name.split(' ');
	const lastname = parts.pop();
	return [parts.join(' '), lastname];
};

export const createPaymentLink = async (customerEmail, customerName, idCode) => {
	assert.equal(typeof customerEmail, 'string', 'Customer email must be a string');
	assert.equal(typeof customerName, 'string', 'Customer name must be a string');
	assert.equal(typeof idCode, 'string', 'ID code must be a string');

	const [firstName, lastName] = splitName(customerName);

	const contacts = {
		firstName,
		lastName,
		email: customerEmail,
		addressLine1: 'Energia tn 6a',
		locality: 'Tallinn',
		region: 'Harjumaa',
		country: 'EE',
		postalCode: '13415',
	};

	const payload = {
		accessKey: montonio.accessKey,
		merchantReference: `${idCode}-${Date.now()}`,
		returnUrl: `${siteBase}/payment-success.html`,
		notificationUrl: `${siteBase}/api/payment-webhook`,
		currency: 'EUR',
		grandTotal: registrationFee,
		locale: 'et',
		billingAddress: contacts,
		shippingAddress: contacts,
		lineItems: [
			{
				name: 'Registration',
				quantity: 1,
				finalPrice: registrationFee,
			},
		],
		payment: {
			method: 'paymentInitiation',
			methodDisplay: 'Pay with your bank',
			methodOptions: {
				paymentDescription: `${customerName} registritasu`,
				// For international banks (e.g., Revolut, N26), ensure this matches
				// the country of the bank list you displayed to the customer.
				preferredCountry: 'EE',
				// This is the code of the bank that the customer chose at checkout.
				// See the GET /stores/payment-methods endpoint for the list of available banks.
				preferredProvider: 'LHVBEE22'
			},
			amount: registrationFee, // Yes, this is the same as the grandTotal
			currency: 'EUR', // This must match the currency of the order.
		}
	};

	// 3. Generate the token
	const token = jwt.sign(
		payload,
		montonio.secretKey,
		{ algorithm: 'HS256', expiresIn: '10m' }
	);

	console.log('token', token);

	const response = await fetch(`${montonio.api}/orders`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			data: token,
		}),
	});

	if (!response.ok) {
		console.log(await response.json());
		throw new Error(`Montonio API error: ${response.status} ${response.statusText}`);
	}

	const result = await response.json();
	console.log({ ts: new Date(), msg: 'payment link created', reference: result.merchantReference });

	return {
		paymentUrl: result.paymentUrl,
		payload,
		result,
	};
};
