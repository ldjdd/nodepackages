<template>
    <el-row>
        <el-col :span="6">
            <el-carousel indicator-position="outside" class="carousel">
                <el-carousel-item v-for="item in 4" :key="item">
                    <echart-bar ref="echartBar" :resize="resizeEchart"></echart-bar>
                </el-carousel-item>
            </el-carousel>
        </el-col>
    </el-row>
</template>
<script>
    import EchartBar from '~/components/EchartBar.vue';

    export default {
        components: {
            EchartBar
        },
        data(){
          return {
              resizeEchart: false
          }
        },
        mounted(){
            this.resizeEchart = true;
        },
        methods: {
            ccc () {
                console.info('ddd');
            }
        }
    }
</script>