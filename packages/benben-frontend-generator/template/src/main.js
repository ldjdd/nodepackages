import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import App from './App.vue'
import routes from './config/routes'

// 引用API文件
import openapi from 'benben-openapi'
openapi.server('http://127.0.0.1');
// 将API方法绑定到全局
Vue.prototype.$openapi = openapi;

Vue.use(ElementUI);


// 3. Create the router
const router = new VueRouter({
    mode: 'history',
    base: __dirname,
    routes: routes
})

new Vue({
    router,
    el: '#app',
    render: h => h(App)
})
