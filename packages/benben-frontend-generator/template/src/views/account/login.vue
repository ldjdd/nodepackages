<template>
    <el-container direction="vertical">
        <el-main>
            <h1>登录后台</h1>
            <el-form :model="form" :rules="rules" ref="loginForm" label-width="100px" class="loginForm">
                <el-form-item label="用户名" prop="pass">
                    <el-input type="text" v-model="form.uname"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="pass">
                    <el-input type="password" v-model="form.pass" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('loginForm')">提交</el-button>
                    <el-button @click="resetForm('loginForm')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-main>
    </el-container>
</template>
<script>
    export default {
        data() {
            return {
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
        methods: {
            submitForm(formName) {
                var ctx = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.$openapi.request('account/login', this.form, function (err, res) {
                            if(err) // 有错误产生
                            {

                            }
                            else
                            {
                                ctx.$user.setIdentity({uid: res.data.uid, token: res.data.token});
                            }
                        });
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            }
        }
    }
</script>

<style>
    body{
        background: #333;
    }
    .el-main{
        width: 450px;
        background: #fff;
        padding: 30px;
        margin: 200px auto 0px auto;
        border-radius: 4px;
    }
    .el-main h1{
        margin-top: 0px;
        margin-bottom: 50px;
        text-align: center;
    }
</style>