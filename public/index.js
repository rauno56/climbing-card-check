Vue.createApp({
    data: () => ({
        idCode: '',
    }),
    created() {

    },
    methods: {
        fetchResult: function(id) {
            const res = fetch(`/api/check?id=${id}`);
            console.log(res)
        },
        submit: function(event) {
            const result = this.fetchResult(this.idCode);
        },
    }
}).mount('#app')