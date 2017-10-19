<template>
    <el-row class="body-wrap" type="flex" justify="center" align="middle" :style="{height: height}">
        <el-col :span="6" class="login-wrap">
            <h1 class="project-name">{{ projectName }}</h1>
            <h3 class="title">账号登录</h3>
            <el-form :model="form" :rules="rules" ref="loginForm" class="loginForm">
                <el-form-item label="" prop="uname">
                    <el-input type="text" v-model="form.uname" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="" prop="pass">
                    <el-input type="password" v-model="form.pass" placeholder="请输入密码" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button class="login-btn" type="primary" @click="submitForm('loginForm')">提交</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>
<script>
    export default {
        data() {
            return {
                projectName: this.$config.projectName,
                height: 0,
                form: {
                    uname: '',
                    pass: ''
                },
                rules: {
                    uname: [
                        { required: true, message: '用户名不能为空！', trigger: 'blur' }
                    ],
                    pass: [
                        { required: true, message: '密码不能为空！', trigger: 'blur' }
                    ]
                }
            };
        },
        mounted (){
            this.height = document.documentElement.clientHeight + 'px';
            console.info(this.$el.querySelector('.login-wrap').offsetWidth);
        },
        methods: {
            submitForm(formName) {
                var ctx = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.$openapi.request('account/login', this.form, function (err, res) {
                            if(err || res.ret !== 0) // 有错误产生
                            {
                                ctx.$message.error('用户名或账号不正确！');
                            }
                            else
                            {
                                ctx.$user.setIdentity({uid: res.data.uid, token: res.data.token});
                                ctx.$router.push({path: '/'});
                            }
                        });
                    } else {
                        return false;
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .body-wrap{
        width: 100%;
        background: url('../../images/login-bg.jpg') #000 no-repeat;
    }
    .login-wrap{
        position: relative;
        background: rgba(255, 255, 255, 0.95);
        padding: 30px;
        border-radius: 4px;
    }
    .project-name{
        position: absolute;
        top: -80px;
        left: 0px;
        width: 100%;
        margin: 0px;
        text-align: center;
        color: #fff;
    }
    .title{
        color: #999;
        font-weight: normal;
        margin-top: 0px;
        margin-bottom: 50px;
        text-align: center;
    }
    .el-form-item{
        margin-bottom: 30px;
    }
    .login-btn{
        width: 100%;
    }
</style>