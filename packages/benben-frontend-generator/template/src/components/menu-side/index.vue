<template>
    <el-menu default-active="2" class="el-menu-vertical-demo" :router="true">
        <el-menu-item index="/"><i class="el-icon-setting"></i>主面板</el-menu-item>
        <el-submenu index="1">
            <template slot="title"><i class="el-icon-setting"></i>账号设置</template>
            <el-menu-item index="/account">个人信息</el-menu-item>
            <el-menu-item index="/account/reset">密码修改</el-menu-item>
        </el-submenu>
        <el-menu-item index="2"><i class="el-icon-menu"></i>导航二</el-menu-item>
    </el-menu>
</template>

<script>
    export default {
        methods: {

        }
    }
</script>