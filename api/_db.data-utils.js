import { inspect } from 'util';
import { strict as assert } from 'assert';

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

const assertValidId = (id) => {
	assert.equal(typeof id, 'string', 'Expected ID to be a string');
	assert.match(id, /[0-9]{11}/, 'Expected ID to consist of 11 digits');
};

const assertValidDate = (parsed) => {
	assert(parsed instanceof Date && !isNaN(parsed.valueOf()), `Invalid Date: "${inspect(parsed)}"`);
};

const formatDate = (parsed) => {
	if (!parsed) {
		return null;
	}
	assertValidDate(parsed);
	return parsed.toISOString().substr(0, 10);
};

const parseDate = (rawValue) => {
	if (!rawValue) {
		return null;
	}
	const parsed = new Date(rawValue);
	assert(!isNaN(parsed), `Invalid date: "${inspect(rawValue)}"`);
	return parsed;
};

const findHighestValidCertificate = (certificates) => {
	// find the certificate that is not expired and has the highest value (red is higher than green).
	// nonexpired green has to beat expired red, but red with shorter expiryTime has to beat any green.
	return certificates.reduce((previous, current) =>{
		if (!previous) {
			return current;
		}
		if (parseDate(current.expiryTime) > Date.now()){
			// TODO: maybe we should find the certificate with the longest expiry time
			// currently the first valid one is kept
			if (previous.certificate != CODE.RED && current.certificate == CODE.RED){
				return current;
			}
			if (previous.certificate == CODE.GREEN && current.certificate == CODE.GREEN){
				return current;
			}
		}
		return previous;
	},null);
}

const S = 1000;
const MIN = 60 * S;
const HR = 60 * MIN;
const D = 24 * HR;
const getExpiryTimeFromFormFillTime = (normDate) => {
	if (!normDate) {
		return null;
	}
	assertValidDate(normDate);
	// Add 6 weeks
	const exp = normDate.valueOf() + 6 * 7 * D;
	return new Date(exp);
};

// column keys are stored in the second row of the DB
const filterColumnHeader = 'id';
const certificateHeader = 'certificate';
const nameHeader = 'name';
const examinerHeader = 'examiner';
const examDateHeader = 'examDate';
const expiryDateHeader = 'expiryDate';
const formFillTimeHeader = 'formFillTime';

export const findById = (data, id) => {
	assertValidId(id);

	// ignore human-readable headers(the first row), because those can change any time
	// form is changed. Will use the second row to key the columns
	const headers = data[1];

	const filterColumnIdx = headers.indexOf(filterColumnHeader);
	const certificateColumnIdx = headers.indexOf(certificateHeader);
	const nameColumnIdx = headers.indexOf(nameHeader);
	const examinerColumnIdx = headers.indexOf(examinerHeader);
	const examDateColumnIdx = headers.indexOf(examDateHeader);
	const expiryDateColumnIdx = headers.indexOf(expiryDateHeader);
	const formFillTimeColumnIdx = headers.indexOf(formFillTimeHeader);

	assert(~filterColumnIdx, `Filter column not found. Looked for "${filterColumnHeader}"`);
	assert(~certificateColumnIdx, `Certificate column not found. Looked for "${certificateHeader}"`);
	assert(~nameColumnIdx, `Certificate column not found. Looked for "${nameHeader}"`);
	assert(~examinerColumnIdx, `Examiner column not found. Looked for "${examinerHeader}"`);
	assert(~examDateColumnIdx, `Exam time column not found. Looked for "${examDateHeader}"`);
	assert(~expiryDateColumnIdx, `Expiry time column not found. Looked for "${expiryDateHeader}"`);
	if (formFillTimeColumnIdx === -1) {
		console.warn(`Form fill time column not found. Looked for "${formFillTimeHeader}"`);
	}

	const filteredRows = data.filter((row) => {
		return row[filterColumnIdx] === id;
	});

	const parsedCertificates = filteredRows.map((row) => {
		const certificate = normalizeCertificate(row[certificateColumnIdx] ?? '');

		const formFillDate = parseDate(row[formFillTimeColumnIdx]);
		const expiryDate = parseDate(row[expiryDateColumnIdx]) || getExpiryTimeFromFormFillTime(formFillDate) || null;

		return {
			id,
			certificate,
			name: row[nameColumnIdx],
			examiner: row[examinerColumnIdx] || null,
			examTime: formatDate(parseDate(row[examDateColumnIdx])),
			expiryTime: formatDate(expiryDate),
		};

	// remove certificates without expiryTime set
	// the front-end does not handle this case, so we handle it here
	}).filter((row) => row.expiryTime);

	// no valid certificates are found
	assert(parsedCertificates.length, 'Not found');

	const highestValueCertificate = findHighestValidCertificate(parsedCertificates);

	return highestValueCertificate;
};
