<template>
    <el-menu default-active="2" class="el-menu-vertical-demo" :router="true">
        <el-menu-item index="/"><i class="el-icon-setting"></i>主面板</el-menu-item>
        <el-submenu index="1">
            <template slot="title"><i class="el-icon-message"></i>账号设置</template>
            <el-menu-item-group>
                <template slot="title">账号</template>
                <el-menu-item index="1-1">选项1</el-menu-item>
                <el-menu-item index="1-2">选项2</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="分组2">
                <el-menu-item index="1-3">选项3</el-menu-item>
            </el-menu-item-group>
            <el-submenu index="1-4">
                <template slot="title">选项4</template>
                <el-menu-item index="1-4-1">选项1</el-menu-item>
            </el-submenu>
        </el-submenu>
        <el-menu-item-group title="账号设置">
            <el-menu-item>个人信息</el-menu-item>
            <el-menu-item index="/account/reset">密码修改</el-menu-item>
        </el-menu-item-group>
        <el-menu-item index="2"><i class="el-icon-menu"></i>导航二</el-menu-item>
    </el-menu>
</template>

<script>
    export default {
        methods: {
            handleOpen(key, keyPath) {
                console.log(key, keyPath);
            },
            handleClose(key, keyPath) {
                console.log(key, keyPath);
            }
        }
    }
</script>