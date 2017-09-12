<template>
    <el-row :gutter="0">
        <el-row class="header">
            <div class="grid-content bg-purple">
                <h1 class="app-name">This is project name</h1>
            </div>
        </el-row>
        <el-row class="body">
            <el-col :span="4" class="slide-menu">
                <app-menu-side></app-menu-side>
            </el-col>
            <el-col :span="19" class="main-content"><router-view class="view"></router-view></el-col>
        </el-row>
    </el-row>
</template>

<script>
    import sideMenu from  './components/menu-side/index.vue'
    export default {
        components: {
            'app-menu-side': sideMenu
        },
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
    .main-content{
        padding-top: 16px;
    }
</style>