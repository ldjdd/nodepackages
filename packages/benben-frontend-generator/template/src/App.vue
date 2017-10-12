<template>
    <component v-bind:is="layout">
        <!-- component changes when vm.currentView changes! -->
    </component>
</template>

<script>
    import AlNav from './components/AlNav.vue'
    import defaultLayout from '~/layouts/default.vue'
    import emptyLayout from '~/layouts/empty.vue'
    export default {
        components: {
            AlNav,
            defaultLayout,
            emptyLayout
        },
        data () {
            return {
                msg: 'This is a template'
            }
        },
        computed: {
            layout: {
                get () {
                    return this.$store.state.layout;
                }
            }
        }
    }
</script>

<style>
    .main-content{
        padding-top: 16px;
    }
</style>