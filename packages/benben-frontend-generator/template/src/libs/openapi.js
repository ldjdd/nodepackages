/**
 * Created by ldj on 2017/9/11.
 */

import axios from 'axios'
import config from '../config/main'


// 返回在vue模板中的调用接口
export default {
    request: function(api, params, callback) {
        /*下面的代码是自动生成的，要根据自己的接口URL规则做调整*/
        var apiUrl = config.api.host + '/json.shtml';
        params.api = api;

        axios.get(apiUrl, params)
            .then(function (response) {
                callback(null, response);
            })
            .catch(function (error) {
                callback(error);
            });
    }
}