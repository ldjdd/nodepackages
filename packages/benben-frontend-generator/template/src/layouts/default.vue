<template>
    <el-row :gutter="0">
        <el-row class="header">
            <div class="grid-content bg-purple">
                <h1 class="app-name">This is project name</h1>
            </div>
        </el-row>
        <el-row class="body">
            <el-col :span="4" class="slide-menu">
                <al-nav></al-nav>
            </el-col>
            <el-col :span="19" class="main-content"><router-view class="view"></router-view></el-col>
        </el-row>
    </el-row>
</template>

<script>
    import AlNav from '~/components/AlNav.vue'
    export default {
        components: {
            AlNav
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