Vue.createApp({
	data: () => ({
		// Authentication state
		isAuthenticated: false,
		authCredentials: null,
		loginData: {
			username: '',
			password: ''
		},
		loginError: '',
		isLoggingIn: false,

		// Form data
		formData: {
			idCode: '',
			name: '',
			email: '',
			cardType: '',
			examDate: new Date().toISOString().split('T')[0],
			comment: ''
		},
		submitted: false,
		submittedData: null,
		isLoading: false,
		showMobileInstructions: false,
	}),
	created() {
	},
	computed: {
		isLoginDisabled() {
			return !this.loginData.username || !this.loginData.password || this.isLoggingIn;
		},
		isSubmitDisabled() {
			return !this.formData.idCode ||
				   this.formData.idCode.length !== 11 ||
				   !this.formData.name ||
				   !this.formData.email ||
				   !this.formData.cardType ||
				   !this.formData.examDate ||
				   !this.isValidEmail(this.formData.email) ||
				   this.isLoading;
		}
	},
	methods: {
		login: function () {
			if (this.isLoginDisabled) return;

			this.isLoggingIn = true;
			this.loginError = '';

			fetch('/api/auth', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(this.loginData)
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					this.isAuthenticated = true;
					this.authCredentials = { ...this.loginData };
					this.loginData = { username: '', password: '' };
					this.$nextTick(() => {
						document.getElementById('idCode')?.focus();
					});
				} else {
					this.loginError = data.error || 'Vale kasutajanimi või parool';
				}
			})
			.catch(() => {
				this.loginError = 'Sisselogimine ebaõnnestus';
			})
			.finally(() => {
				this.isLoggingIn = false;
			});
		},
		logout: function () {
			this.isAuthenticated = false;
			this.authCredentials = null;
			this.submitted = false;
			this.submittedData = null;
			this.resetForm();
		},
		isValidEmail(email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return emailRegex.test(email);
		},
		submit: function () {
			if (this.isSubmitDisabled) return;

			this.isLoading = true;

			const payload = {
				...this.formData,
				...this.authCredentials
			};

			fetch('/api/add-climber', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload)
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					this.submittedData = { ...this.formData };
					this.submitted = true;
					this.resetForm();
					this.$nextTick(() => {
						document.getElementById('idCode')?.focus();
					});
				} else {
					alert('Viga andmete lisamisel: ' + (data.error || 'Tundmatu viga'));
				}
			})
			.catch(() => {
				alert('Viga andmete lisamisel');
			})
			.finally(() => {
				this.isLoading = false;
			});
		},
		goBack: function () {
			this.submitted = false;
			this.submittedData = null;
			this.showMobileInstructions = false;
			this.resetForm();
		},
		addAnother: function () {
			this.submitted = false;
			this.submittedData = null;
			this.resetForm();
		},
		resetForm: function() {
			this.formData = {
				idCode: '',
				name: '',
				email: '',
				cardType: '',
				examDate: new Date().toISOString().split('T')[0],
				comment: ''
			};
		},
		toggleMobileInstructions: function () {
			this.showMobileInstructions = !this.showMobileInstructions;
		},
		getCardTypeName: function (cardType) {
			switch (cardType) {
				case 'green':
					return 'Roheline';
				case 'red':
					return 'Punane';
				default:
					return cardType;
			}
		},
		formatDate: function (dateString) {
			if (!dateString) return 'N/A';
			const date = new Date(dateString);
			return date.toLocaleDateString('et-EE');
		}
	},
}).mount('#app');
