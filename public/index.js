Vue.createApp({
	data: () => ({
		showInstructions: true,
		currentClimber: null,
		idCode: '',
		isLoading: false,
		showMobileInstructions: false,
	}),
	computed: {
		// a computed getter
		isSubmitDisabled() {
			console.log(this.idCode.length);
			return !this.idCode || this.idCode.length !== 11;
		}
	},
	created() {
	},
	computed:{
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
			return result;
    },
		toggleMobileInstructions: function (){
			this.showMobileInstructions = !this.showMobileInstructions;
		},
	}
}).mount('#app');
