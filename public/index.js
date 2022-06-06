Vue.createApp({
    data: () => ({
        showInstructions: true,
        currentClimber: null,
        idCode: '',
    }),
    created() {

    },
    methods: {
        fetchResult: function(id) {
            fetch(`/api/check?id=${id}`)
                .then((response) => response.json())
                .then((data) => {
                    this.showInstructions = false;
                    this.currentClimber = data.success ? data : null;
                });
        },
        submit: function(event) {
            if (!this.idCode) return;
            const result = this.fetchResult(this.idCode);
        },
    }
}).mount('#app')