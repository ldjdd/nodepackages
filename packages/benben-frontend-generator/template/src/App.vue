<template>
    <div id="app">
        <el-row>
            <router-view class="view"></router-view>
        </el-row>
    </div>
</template>

<script>


    export default {
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
