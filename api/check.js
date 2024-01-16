import * as db from './_db.js';
import * as key from './_key.js';

export default async function handler(request, response) {
	const start = Date.now();
	const secretKey = key.load();
	const sheetsClient = await db.connect(secretKey.client_email, secretKey.private_key);

	const { id } = request.query;

	const result = await db.fetchOne(sheetsClient, id);

	console.log({ ts: new Date(), responseTime: Date.now() - start, id });
	return response.status(200).json(result);
}
