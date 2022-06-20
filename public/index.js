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
    fetchResult: function(id) {
      fetch(`/api/check?id=${id}`)
        .then((response) => {
          if (!response.ok) {
            this.currentClimber = null;
            return;
          }
          return response.json()
        })
        .then((data) => {
          if (!data) return;
          this.showInstructions = false;
          this.currentClimber = data.success ? data : null;
          this.isLoading = false;
        });
    },
    submit: function(event) {
      if (!this.idCode) return;
      this.isLoading = true;
      const result = this.fetchResult(this.idCode);
    },
    goBack: function() {
      this.currentClimber = null;
    }
  }
}).mount('#app');
