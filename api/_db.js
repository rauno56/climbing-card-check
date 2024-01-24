import { inspect } from 'util';
import { strict as assert } from 'assert';

import { google } from 'googleapis';

const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetRange = 'Andmebaas v2';
const sheets = google.sheets('v4');

assert.equal(typeof spreadsheetId, 'string', 'Expected SPREADSHEET_ID env var to be set');

const CODE = {
	GREEN: 'green',
	RED: 'red',
	INSTRUCTOR: 'instructor',
	NONE: 'none',
	UNKNOWN: 'unknown',
};

const RAW_VALUE_TO_CODE = {
	roheline: CODE.GREEN,
	punane: CODE.RED,
	instruktor: CODE.INSTRUCTOR,
	'': CODE.NONE
};

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
	assert.equal(typeof rawCertificate, 'string', `Expected "rawCertificate" to be a string, got ${inspect(rawCertificate)}`);
	const certificate = RAW_VALUE_TO_CODE[rawCertificate.toLowerCase()];

	if (certificate) {
		return certificate;
	}

	console.error(`Invalid certificate input: ${rawCertificate}`);
	return CODE.UNKNOWN;
};

// Forms provides TS that is in US format, normalize that to the same format as others
const transformFormFillTime = (rawValue) => {
	if (!rawValue || typeof rawValue !== 'string') {
		return null;
	}
	const [MM, DD, YYYY] = rawValue.replace(/ .*$/, '').split('/');
	return `${YYYY}-${MM}-${DD}`;
};

const S = 1000;
const MIN = 60 * S;
const HR = 60 * MIN;
const D = 24 * HR;
const getExpiryTimeFromFormFillTime = (normDate) => {
	if (!normDate || typeof normDate !== 'string') {
		return null;
	}
	// Add 6 weeks
	const exp = Date.parse(normDate) + 6 * 7 * D;
	return (new Date(exp)).toISOString().replace(/T.*$/, '');
};

// have to either map by the position or header name, doing the latter
const filterColumnHeader = 'Ronija isikukood';
const certificateHeader = 'Eksami tüüp';
const nameHeader = 'Ronija täisnimi';
const examinerHeader = 'Eksamineerija nimi';
const examTimeHeader = 'Eksami kuupäev';
const expiryTimeHeader = 'Aegumise kuupäev';
const formFillTimeHeader = 'Timestamp';

const fetchOne = async (client, id) => {
	assert(client instanceof google.auth.JWT, `"client" required got ${inspect(client)}`);

	assertValidId(id);

	const { data: { values: data } } = await fetchAllData(client);

	const headers = data.shift();

	const filterColumnIdx = headers.indexOf(filterColumnHeader);
	const certificateColumnIdx = headers.indexOf(certificateHeader);
	const nameColumnIdx = headers.indexOf(nameHeader);
	const examinerColumnIdx = headers.indexOf(examinerHeader);
	const examTimeColumnIdx = headers.indexOf(examTimeHeader);
	const expiryTimeColumnIdx = headers.indexOf(expiryTimeHeader);
	const formFillTimeColumnIdx = headers.indexOf(formFillTimeHeader);

	assert(~filterColumnIdx, `Filter column not found. Looked for "${filterColumnHeader}"`);
	assert(~certificateColumnIdx, `Certificate column not found. Looked for "${certificateHeader}"`);
	assert(~nameColumnIdx, `Certificate column not found. Looked for "${nameHeader}"`);
	assert(~examinerColumnIdx, `Examiner column not found. Looked for "${examinerHeader}"`);
	assert(~examTimeColumnIdx, `Exam time column not found. Looked for "${examTimeHeader}"`);
	assert(~expiryTimeColumnIdx, `Expiry time column not found. Looked for "${expiryTimeHeader}"`);
	if (~formFillTimeColumnIdx) {
		console.warn(`Form fill time column not found. Looked for "${formFillTimeHeader}"`);
	}

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
	const certificate = normalizeCertificate(row[certificateColumnIdx] ?? '');

	const formFillTime = transformFormFillTime(row[formFillTimeColumnIdx]);
	const expiryTime = row[expiryTimeColumnIdx] || getExpiryTimeFromFormFillTime(formFillTime) || null;

	return {
		id,
		success: true,
		certificate,
		name: row[nameColumnIdx],
		examiner: row[examinerColumnIdx] || null,
		examTime: row[examTimeColumnIdx] || null,
		formFillTime,
		expiryTime,
	};
};

export { connect, fetchAllData, fetchOne };
