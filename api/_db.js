import { inspect } from 'util';
import { strict as assert } from 'assert';

import { google } from 'googleapis';

const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetRange = 'Sheet1';
const sheets = google.sheets('v4');

assert.equal(typeof spreadsheetId, 'string', 'Expected SPREADSHEET_ID env var to be set');

const CODE = {
	GREEN: 'green',
	RED: 'red',
	INSTRUCTOR: 'instructor',
	UNKNOWN: 'unknown',
};

const RAW_VALUE_TO_CODE = {
	roheline: CODE.GREEN,
	punane: CODE.RED,
	instruktor: CODE.INSTRUCTOR
};

const testCodes = [
	'1',
	'2',
	'3',
];

const assertValidId = (id) => {
	assert.equal(typeof id, 'string', 'Expected ID to be a string');
	assert.match(id, /[0-9]{11}/, 'Expected ID to consist of 11 digits');
};

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

// raw input from the sheet => valueof CODE
const normalizeCertificate = (rawCertificate) => {
	assert.equal(typeof rawCertificate, 'string', '"rawCertificate" required');

	const certificate = RAW_VALUE_TO_CODE[rawCertificate.toLowerCase()];

	if (certificate) {
		return certificate;
	}

	console.error(`Invalid certificate input: ${rawCertificate}`);
	return CODE.UNKNOWN;
};

// have to either map by the position or header name, doing the latter
const filterColumnHeader = 'ID';
const certificateHeader = 'Pädevus';
const nameHeader = 'Nimi';

const fetchOne = async (client, id) => {
	assert(client instanceof google.auth.JWT, `"client" required got ${inspect(client)}`);

	if (!testCodes.includes(id)) {
		assertValidId(id);
	}

	const { data: { values: data } } = await fetchAllData(client);

	const headers = data.shift();

	const filterColumnIdx = headers.indexOf(filterColumnHeader);
	const certificateColumnIdx = headers.indexOf(certificateHeader);
	const nameColumnIdx = headers.indexOf(nameHeader);

	assert(~filterColumnIdx, `Filter column not found. Looked for ${filterColumnHeader}`);
	assert(~certificateColumnIdx, `Certificate column not found. Looked for ${certificateHeader}`);
	assert(~nameColumnIdx, `Certificate column not found. Looked for ${nameHeader}`);

	const filteredRows = data.filter((row) => {
		return row[filterColumnIdx] === id;
	});

	// no result
	if (!filteredRows.length) {
		return {
			id,
			success: false,
		};
	}

	// more than one result, assume an filtering error
	if (filteredRows.length > 1) {
		console.log('Filtered more than one row', filteredRows);
		return {
			id,
			success: false,
		};
	}

	const row = filteredRows[0];
	const certificate = normalizeCertificate(row[certificateColumnIdx]);

	return {
		id,
		success: true,
		certificate,
		name: row[nameColumnIdx],
	};
};

export { connect, fetchAllData, fetchOne };
