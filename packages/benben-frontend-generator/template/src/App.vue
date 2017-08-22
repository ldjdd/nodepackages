<template>
    <el-row :gutter="0">
        <el-row class="header">
            <div class="grid-content bg-purple">
                <h1 class="app-name">This is project name</h1>
            </div>
        </el-row>
        <el-row class="body">
            <el-col :span="4" class="slide-menu">
                <el-menu default-active="2" theme="dark" :router="true">
                    <el-submenu index="1">
                        <template slot="title">导航一</template>
                        <el-menu-item-group title="分组一">
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
                    <el-menu-item index="2">导航二</el-menu-item>
                    <el-menu-item index="3">导航三</el-menu-item>
                </el-menu>
            </el-col>
            <el-col :span="19"></el-col>
        </el-row>
    </el-row>
</template>

<script>
    export default {
        components: {},
        data () {
            return {
                msg: 'This is a template'
            }
        },
        methods: {
        }
    }
</script>

<style>
</style>