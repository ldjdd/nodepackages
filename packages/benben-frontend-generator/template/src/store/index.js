import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        layout: 'defaultLayout'
    },
    mutations: {
        setLayout (state, layout) {
            state.layout = layout
        }
    }
})

export default store