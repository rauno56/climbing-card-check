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
		'arrow-spacing': ['error', { before: true, after: true }],
		'comma-spacing': ['error', { after: true }],
		'eol-last': ['error', 'always'],
		'eqeqeq': ['error', 'always'],
		'indent': ['error', 'tab'],
		'keyword-spacing': ['error', { before: true, after: true }],
		'linebreak-style': ['error', 'unix'],
		'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
		'quotes': ['error', 'single'],
		'semi': ['error', 'always'],
		'space-before-blocks': ['error', 'always'],
		'space-before-function-paren': ['error', { 'anonymous': 'always', 'named': 'ignore', 'asyncArrow': 'always' }],
	}
};
