<template>
    <router-view class="view"></router-view>
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

<style scoped>
    .main-content{
        padding-top: 16px;
    }
</style>