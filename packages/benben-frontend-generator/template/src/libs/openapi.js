/**
 * Created by ldj on 2017/10/09.
 */

import axios from 'axios'
import config from '~/config/main'
import user from '~/libs/user'

/* 非get接口调整放在这里做配置 */
var apis = {
    'account/login': 'post',
    'article/delete': 'delete'
};

// 返回在vue模板中的调用接口
export default {
    _router: null,
    setRouter (router) {
        this._router = router;
    },
    _responseCallback (err, response, callback) {
        // Go to login page if `ret` is -24 .
        if(response.data.ret === -24){
            this._router.push({path: config.loginRouter});
            return;
        }
        callback(err, response.data);
    },
    request: function(api, data, callback) {
        /*下面的代码是自动生成的，要根据自己的接口URL规则做调整*/
        var ctx = this;
        var apiUrl = config.api.host + '/' + api;

        if(typeof data == 'function' && typeof callback == 'undefined'){
            callback = data;
            data = {};
        }

        var method = apis.hasOwnProperty(api) ? apis[api] : 'get';

        // User's identity
        var uid = localStorage.getItem('uid');
        var token = localStorage.getItem('token');

        if(uid && token){
            data.uid = uid;
            data.token = token;
        }

        if(method == 'post')
        {
            // Comments these lines in product environment.
            if(apiUrl === 'http://demo.com/account/login'){
                if(data.uname === 'demo' && data.pass === 'demo'){
                    ctx._responseCallback(null, {data: {ret: 0, data: {uid: 1, token: 'fd81d9fe9er434er37d33fd54'}}}, callback);
                } else {
                    ctx._responseCallback(null, {data: {ret: -24, msg: '用户名或密码不正确！'}}, callback);
                }

                return;
            }

            axios.post(apiUrl,  data)
                .then(function (response) {
                    ctx._responseCallback(null, response, callback);
                })
                .catch(function (error) {
                    ctx._responseCallback(error, null, callback);
                });
        }
        else if(method == 'delete')
        {
            axios.delete(apiUrl,  {params: data})
                .then(function (response) {
                    ctx._responseCallback(null, response, callback);
                })
                .catch(function (error) {
                    ctx._responseCallback(error, null, callback);
                });
        }
        else
        {
            axios.get(apiUrl, {'params': data})
                .then(function (response) {
                    ctx._responseCallback(null, response, callback);
                })
                .catch(function (error) {
                    ctx._responseCallback(error, null, callback);
                });
        }
    }
}