<template>
    <div style="height: 300px; width:100%;"></div>
</template>

<script>
    // 引入 ECharts 主模块
    var echarts = require('echarts/lib/echarts');
    // 引入柱状图
    require('echarts/lib/chart/bar');
    // 引入提示框和标题组件
    require('echarts/lib/component/tooltip');
    require('echarts/lib/component/title');

    export default {
        props: {
            resize: Boolean
        },
        data () {
            return {
                myChart: null,
                width: '100%'
            }
        },
        watch: {
            resize (val) {
                this.myChart.resize();
            }
        },
        mounted () {
//            this.width = this.$el.offsetWidth;
            // 基于准备好的dom，初始化echarts实例
            this.myChart = echarts.init(this.$el);
            // 绘制图表
            this.myChart.setOption({
                title: { text: 'ECharts 入门示例' },
                tooltip: {},
                xAxis: {
                    data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
                },
                yAxis: {},
                series: [{
                    name: '销量',
                    type: 'bar',
                    data: [5, 20, 36, 10, 10, 20]
                }]
            });
        },
        methods: {
        }
    }
</script>
<style>

</style>