/**
 * Created by ldj on 2017/10/09.
 */

// 返回在vue模板中的调用接口
export default {
    getUid () {
        return localStorage.getItem('uid');
    },
    getToken () {
        return localStorage.getItem('token');
    },
    logined () {
        return this.getUid() && this.getToken();
    },
    setIdentity (identity) {
        localStorage.setItem('uid', identity.uid);
        localStorage.setItem('token', identity.token);
    }
}