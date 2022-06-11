import { strict as assert } from 'assert';
import { readFileSync } from 'fs';

const loadFromEnv = (varName) => {
    const value = process.env[varName];
    if (typeof value !== 'string') {
        throw new Error(`Environment var "${varName}" is unset`);
    }
    const data = Buffer.from(value, 'base64').toString('utf8');

    return JSON.parse(data);
};

const loadFromFile = (filePath) => {
    const data = readFileSync(filePath, 'utf8');

    return JSON.parse(data);
};

const load = () => {
    const defaultEnvironmentVariable = 'GOOGLE_KEY';
    const defaultFilePath = './key.json';

    console.error('Loading the key from env');
    return loadFromEnv(defaultEnvironmentVariable);

    console.error('Loading the key from file');
    return loadFromFile(defaultFilePath);
};

export {
    loadFromEnv,
    loadFromFile,
    load,
};