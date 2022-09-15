Vue.createApp({
	data: () => ({
		showInstructions: true,
		currentClimber: null,
		idCode: '',
		isLoading: false,
		showMobileInstructions: false,
	}),
	created() {
	},
	computed: {
		isSubmitDisabled() {
			return !this.idCode || this.idCode.length !== 11;
		},
		resultCardHeaderContent(){
			if(!this.currentClimber) return null;
			switch (this.currentClimber.certificate) {
			case 'green':
				return 'ROHELINE KAART';
			case 'red':
				return 'PUNANE KAART';
			case 'instructor':
				return 'INSTRUKTOR';
			default:
				return null;
			}
		},
		certificateDescription(){
			if(!this.currentClimber) return null;
			switch (this.currentClimber.certificate) {
			case 'green':
				return 'Sellel isikul on õigus iseseisvalt ülaltjulgestuses ronida ja julgestada.';
			case 'red':
				return 'Sellel isikul on õigus iseseisvalt altjulgestuses ronida ja julgestada.';
			case 'expired':
				return 'Selle isiku julgestajakaart on aegnud. Sellel isikul ei ole õigust iseseisvalt ronida enne kaardi uuendamist.';
			default:
				return 'Seda isikukoodi ei ole registrisse lisatud. Sellel isikul ei ole õigust iseseisvalt ronida.';
			}
		},
		showNoInfo(){
			return !this.currentClimber;
		},
		showClimberInfo(){
			return this.currentClimber && this.currentClimber.certificate !== 'none';
		},
		showNoCertClimberInfo(){
			return this.currentClimber && this.currentClimber.certificate === 'none';
		},
	},
	methods: {
		fetchResult: function (id) {
			return fetch(`/api/check?id=${id}`)
				.then((response) => {
					if (!response.ok) {
						this.currentClimber = null;
						return;
					}
					return response.json();
				});
		},
		submit: function () {
			if (!this.idCode) return;
			this.isLoading = true;
			this.fetchResult(this.idCode)
				.then((data) => {
					if (!data) return;
					this.currentClimber = data.success ? this.formatClimberData(data) : null;
				})
				.finally(()=>{
					this.showInstructions = false;
					this.isLoading = false;
				});
		},
		goBack: function () {
			this.currentClimber = null;
		},
		formatClimberData: function (raw){
			let result = raw;
			result.formattedExamTime = result.examTime?.replaceAll('-','/');
			result.certificate = this.invalidateCertificateIfExpired(result)
			return result;
		},
		toggleMobileInstructions: function (){
			this.showMobileInstructions = !this.showMobileInstructions;
		},
		invalidateCertificateIfExpired: function (climberData){
			if(new Date(climberData.expiryTime) < Date.now()){
				return 'expired'
			}
			return climberData.certificate;
		},
	},
}).mount('#app');
