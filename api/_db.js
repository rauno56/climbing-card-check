import { strict as assert } from 'node:assert';
import process from 'node:process';
import { inspect } from 'node:util';
import { google } from 'googleapis';

import { findById } from './_db.data-utils.js';

const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetRange = 'Andmebaas';
const sheets = google.sheets('v4');

assert.equal(typeof spreadsheetId, 'string', 'Expected SPREADSHEET_ID env var to be set');

const connect = (serviceAccountEmail, privateKey) => {
	assert.equal(typeof serviceAccountEmail, 'string', '"serviceAccountEmail" required');
	assert.equal(typeof privateKey, 'string', '"serviceAccountEmail" required');

	const jwtClient = new google.auth.JWT(
		serviceAccountEmail,
		null,
		privateKey,
		['https://www.googleapis.com/auth/spreadsheets']
	);
	return jwtClient.authorize().then(() => jwtClient);
};

const fetchAllData = async (client) => {
	assert(client instanceof google.auth.JWT, '"client" required');

	return sheets.spreadsheets.values.get({
		auth: client,
		spreadsheetId: spreadsheetId,
		range: sheetRange
	});
};

const fetchOne = async (client, id) => {
	assert(client instanceof google.auth.JWT, `"client" required got ${inspect(client)}`);

	const { data: { values: data } } = await fetchAllData(client);

	console.log({ ts: new Date(), msg: 'data loaded', length: data.length });

	try {
		const result = findById(data, id);

		return {
			success: true,
			...result,
		};
	} catch (err) {
		return {
			id,
			success: false,
			message: err.message,
		};
	}
};

const addRow = async (client, rowData) => {
	assert(client instanceof google.auth.JWT, '"client" required');
	assert(Array.isArray(rowData), '"rowData" must be an array');

	const values = [rowData];

	const result = await sheets.spreadsheets.values.append({
		auth: client,
		spreadsheetId: spreadsheetId,
		range: sheetRange,
		valueInputOption: 'USER_ENTERED',
		resource: {
			values: values
		}
	});

	console.log({ ts: new Date(), msg: 'row added', updatedCells: result.data.updates.updatedCells });
	return result;
};

export { connect, fetchAllData, fetchOne, addRow };
