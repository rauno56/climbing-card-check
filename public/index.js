Vue.createApp({
	data: () => ({
		showInstructions: true,
		currentClimber: null,
		idCode: '',
		isLoading: false,
	}),
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
			return this.currentClimber && this.currentClimber.certificate !== "none";
		},
		showNoCertClimberInfo(){
			return this.currentClimber && this.currentClimber.certificate === "none";
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
					this.showInstructions = false;
					this.currentClimber = data.success ? data : null;
				})
				.finally(()=>{this.isLoading = false;});
		},
		goBack: function () {
			this.currentClimber = null;
		}
	}
}).mount('#app');
