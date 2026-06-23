const resetTimeoutLength = 180000;

Vue.createApp({
	data: () => ({
		currentClimber: null,
		idCode: '',
		isLoading: false,
		showMobileInstructions: false,
		timer: null
	}),
	created() {
	},
	computed: {
		isSubmitDisabled() {
			return !this.idCode || this.idCode.length !== 11;
		},
		resultCardHeaderContent() {
			if (!this.currentClimber) return null;
			switch (this.currentClimber.certificate) {
			case 'green':
				return 'ROHELINE KAART';
			case 'red':
				return 'PUNANE KAART';
			default:
				return null;
			}
		},
		certificateDescription() {
			if (!this.currentClimber) return null;
			switch (this.currentClimber.certificate) {
			case 'green':
				return 'Sellel isikul on õigus iseseisvalt ülaltjulgestuses ronida ja julgestada.';
			case 'red':
				return 'Sellel isikul on õigus iseseisvalt altjulgestuses ronida ja julgestada.';
			case 'expired':
				return 'Selle isiku julgestajakaart on aegnud. Tal ei ole õigust iseseisvalt ronida enne kaardi uuendamist.';
			default:
				return 'Seda isikukoodi ei ole registrisse lisatud. Tal ei ole õigust iseseisvalt ronida.';
			}
		},
		showNoInfo() {
			return !this.currentClimber;
		},
		isClimberCertified() {
			return this.currentClimber && ['green', 'red'].includes(this.currentClimber.certificate);
		},
		noAccessReason() {
			if (this.currentClimber?.certificate === 'expired') return 'Selle isiku julgestajakaart on aegnud.';
			return 'Seda isikukoodi ei ole registrisse lisatud.';
		}
	},
	watch:{
		idCode(){
			if(!this.timer) return;
			clearTimeout(this.timer);
			this.timer = setTimeout(this.resetState, resetTimeoutLength);
		}
	},
	methods: {
		fetchClimberData: function (id) {
			return fetch(`/api/check?id=${id}`)
				.then((response) => {
					console.log(response);
					if (!response.ok) {
						throw new Error('Request error: ' + response.statusText);
					}
					return response.json();
				}).then((response) => {
					if (!response) {
						return null;
					}
					if (response.success) {
						return this.formatClimberData(response);
					}
					return {
						id,
						certificate: 'none',
					};
				});
		},
		submit: function () {
			if (!this.idCode) return;
			this.isLoading = true;
			this.fetchClimberData(this.idCode)
				.then((data) => {
					this.currentClimber = data;
				})
				.finally(() => {
					this.isLoading = false;
					this.timer = setTimeout(this.resetState, resetTimeoutLength);
				});
		},
		goBack: function () {
			this.currentClimber = null;
			this.showMobileInstructions = false;
		},
		formatClimberData: function (raw) {
			let result = raw;
			result.formattedExamTime = result.examTime?.replaceAll('-', '/') || 'N/A';
			result.certificate = this.invalidateCertificateIfExpired(result);
			return result;
		},
		toggleMobileInstructions: function () {
			this.showMobileInstructions = !this.showMobileInstructions;
		},
		invalidateCertificateIfExpired: function (climberData) {
			if (Date.parse(climberData.expiryTime) < Date.now()) {
				// If expiry time is in the past and there's no exam time it means that
				// the record was never updated from application to the real certificate
				// it that case we will rather show "no certificate" than "expired"
				if (!climberData.examTime) {
					return 'none';
				}
				return 'expired';
			}
			return climberData.certificate;
		},
		resetState() {
			Object.assign(this.$data, this.$options.data.call(this));
		},
	},
}).mount('#app');
