<template>
    <div></div>
</template>
<script>
    export default {
        mounted(){
            this.$openapi.request('user/login', {}, function (res) {
                
            });
        }
    }
</script>