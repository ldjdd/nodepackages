<template>
    <el-container :style="{height: height}">
        <el-header class="app-header" height="80px">
            <a class="logo"></a>
            <h1 class="app-name">后台管理模板</h1>
            <ul class="nav navbar-nav ml-auto">
                <el-badge value="3" class="item">
                    <i class="el-icon-message"></i>
                </el-badge>
            </ul>
        </el-header>
        <el-container>
            <el-aside class="sidebar" width="250px">
                <al-nav></al-nav>
            </el-aside>
            <el-main>
                <router-view class="view"></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    import AlNav from '~/components/AlNav.vue'
    export default {
        components: {
            AlNav
        },
        data () {
            return {
                height: '',
                msg: 'This is a template'
            }
        },
        mounted (){
            this.height = document.documentElement.clientHeight + 'px';
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