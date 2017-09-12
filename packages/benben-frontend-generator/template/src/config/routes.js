// 引用模板
import index from '../views/index.vue'
import accountReset from '../views/account/reset.vue'


// 配置路由
export default [
    {
        path: '/',
        component: index
    },
    {
        path: '/account/reset',
        component: accountReset
    }
]