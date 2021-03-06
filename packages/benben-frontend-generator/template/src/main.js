import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

import store from '~/store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import defaultLayout from '~/layouts/default.vue'
import App from '~/App.vue'
import routes from './config/routes'
import config from '~/config/main'

// 引用API文件
import user from './libs/user'
import openapi from './libs/openapi'

// 将API方法绑定到全局
Vue.prototype.$config = config;
Vue.prototype.$openapi = openapi;
Vue.prototype.$user = user;

// var layout = defaultLayout;

Vue.use(ElementUI);


// 3. Create the router
const router = new VueRouter({
    mode: 'history',
    base: __dirname,
    routes: routes
})

router.beforeEach((to, from, next) => {
    if(!user.logined() && to.path !== config.loginRouter){
        next(config.loginRouter)
    } else {
        next();
    }
});

router.afterEach((to, from) => {
    if(to.meta.layout){
        store.commit('setLayout', to.meta.layout + 'Layout');
    } else {
        store.commit('setLayout', 'defaultLayout');
    }
});


var core = new Vue({
    store,
    router,
    el: '#app',
    render: function(h){
        return h(App);
    }
});