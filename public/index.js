Vue.createApp({
    data: () => ({
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
                    this.currentClimber = data
                    console.log(this.currentClimber)
                });
        },
        submit: function(event) {
            if (!this.idCode) return;
            const result = this.fetchResult(this.idCode);
        },
    }
}).mount('#app')