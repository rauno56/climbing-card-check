import { strict as assert } from 'assert';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { describe, it } from 'node:test';

import * as utils from '../api/_db.data-utils.js';

const getFixture = () => {
	return readFileSync(join(fileURLToPath(import.meta.url), '../fixture.txt'), 'utf8')
		.split('\n')
		.map((row) => row.split('\t'));
};

const testCases = {
	'10000000000': {
		id: '10000000000',
		certificate: 'green',
		name: 'Robert Roheline',
		examiner: 'Ilmar Instruktor',
		examTime: '2021-08-20',
		expiryTime: '2025-08-20'
	},
	'20000000000': {
		id: '20000000000',
		certificate: 'red',
		name: 'Pulvi Punane',
		examiner: 'Eerik Eksamineerija',
		examTime: '2020-12-15',
		expiryTime: '2024-12-15'
	},
	'30000000000': {
		id: '30000000000',
		certificate: 'red',
		name: 'Kaarel Kehtetu',
		examiner: 'Tiit Testija',
		examTime: '2017-11-15',
		expiryTime: '2021-03-06'
	},
	'50000000000': {
		id: '50000000000',
		certificate: 'green',
		name: 'Agnes Aegumas',
		examiner: 'Andrei Popov',
		examTime: '2012-12-01',
		expiryTime: '2022-10-11'
	},
	'80000000000': {
		id: '80000000000',
		certificate: 'green',
		name: 'Viktor Vormiga',
		examiner: 'Eerik Eksamineerija',
		examTime: '2023-12-01',
		expiryTime: '2030-12-01'
	},
	'90000000000': {
		id: '90000000000',
		certificate: 'green',
		name: 'Kaspar Katsejänes',
		examiner: 'Eerik Eksamineerija',
		examTime: '2023-01-30',
		expiryTime: '2029-12-08'
	},
};

const invalidCases = {
	'00000000000': /not found/i,
	'40000000000': /invalid certificate/i,
	'70000000000': /invalid certificate/i,
	'60000000000': /invalid date/i,
};

describe('DB', () => {
	for (const [id, expected] of Object.entries(testCases)) {
		it(`should find ${id}`, () => {
			const result = utils.findById(getFixture(), id);
			assert.deepEqual(result, expected);
		});
	}

	for (const [id, expectedError] of Object.entries(invalidCases)) {
		it(`should error with ${id}`, () => {
			assert.throws(() => utils.findById(getFixture(), id), expectedError);
		});
	}
});
