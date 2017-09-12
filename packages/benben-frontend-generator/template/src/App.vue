<template>
    <el-row :gutter="0">
        <el-row class="header">
            <div class="grid-content bg-purple">
                <h1 class="app-name">This is project name</h1>
            </div>
        </el-row>
        <el-row class="body">
            <el-col :span="4" class="slide-menu">

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