<template>
    <div>
        <ul>
            <li>温度：{{ wendu }}</li>
            <li>空气质量：{{ quality }}</li>
        </ul>
    </div>
</template>
<script>
    export default {
        data(){
          return {
              wendu: '',
              quality: ''
          }
        },
        mounted(){
            this.$openapi.request('weather', {city: '济南'}, function (err, res) {
                if(err) // 有错误产生
                {

                }
                else
                {
                    this.quality = res.data.quality;
                    this.wendu = res.data.wendu;
                }
            });
        }
    }
</script>