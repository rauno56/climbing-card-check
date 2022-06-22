module.exports = {
	'globals': {
		'Vue': true,
	},
	'env': {
		'browser': true,
		'es2021': true,
		'node': true
	},
	'extends': [
		'eslint:recommended',
		'plugin:vue/essential'
	],
	'parserOptions': {
		'ecmaVersion': 'latest',
		'sourceType': 'module'
	},
	'plugins': [
		'vue'
	],
	'rules': {
		'eol-last': ['error', 'always'],
		'indent': ['error', 'tab'],
		'linebreak-style': ['error', 'unix'],
		'space-before-function-paren': ['error', { 'anonymous': 'always', 'named': 'ignore', 'asyncArrow': 'always' }],
		'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
		'quotes': ['error', 'single'],
		'semi': ['error', 'always'],
	}
};
