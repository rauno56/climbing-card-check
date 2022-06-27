Vue.createApp({
	data: () => ({
		showInstructions: true,
		currentClimber: null,
		idCode: '',
		isLoading: false,
	}),
	created() {

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
