<template>
    <el-menu
            :router="true"
            default-active="2"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
            style="height: 100%;">
        <el-submenu index="1">
            <template slot="title">
                <i class="el-icon-setting"></i>
                <span>账号设置</span>
            </template>
            <el-menu-item-group>
                <el-menu-item index="/account">个人信息</el-menu-item>
                <el-menu-item index="/account/reset">密码修改</el-menu-item>
            </el-menu-item-group>
        </el-submenu>
        <el-menu-item index="2">
            <i class="el-icon-menu"></i>
            <span slot="title">导航二</span>
        </el-menu-item>
        <el-menu-item index="3">
            <i class="el-icon-setting"></i>
            <span slot="title">导航三</span>
        </el-menu-item>
    </el-menu>
</template>

<script>
    export default {
        methods: {

        }
    }
</script>
<style>
    .slide-menu .el-menu-vertical-demo .el-menu{
        min-height: 400px;
    }
</style>