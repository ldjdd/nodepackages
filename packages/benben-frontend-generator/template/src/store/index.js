import Vue from 'vue'
import Vuex from 'vuex'
import config from '~/config/main'

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        layout: config.layout ? config.layout + 'Layout' : 'defaultLayout'
    },
    mutations: {
        setLayout (state, layout) {
            state.layout = layout
        }
    }
})

export default store