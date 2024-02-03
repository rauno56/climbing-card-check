#!/usr/bin/env node

const path = require('node:path');
const { readFileSync } = require('node:fs');

const [,, filePath = path.resolve(path.join(__dirname, '../key.json'))] = process.argv;

console.error(`Loading ${filePath}`);
const keyFile = readFileSync(filePath);

console.error('Add the following to your .env file:');
console.log(`GOOGLE_KEY="${keyFile.toString('base64')}"`);
