<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 饼状图 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <div ref="pieChart" class="chart" />
        </el-card>
      </el-col>
      <!-- 柱状图 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <div ref="barChart" class="chart" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import * as echarts from "echarts";

// 接收父组件传入的数据
const props = defineProps({
  categories: { type: Array, required: true }, // 类别，例如 ["模块A", "模块B"...]
  warningData: { type: Array, required: true }, // warning 数组
  errorData: { type: Array, required: true } // error 数组
});

const pieChart = ref(null);
const barChart = ref(null);
let pieInstance = null;
let barInstance = null;

// 渲染饼状图
const initPieChart = () => {
  if (!pieInstance) {
    pieInstance = echarts.init(pieChart.value);
  }
  pieInstance.setOption({
    title: {
      text: "告警统计",
      left: "center"
    },
    tooltip: { trigger: "item" },
    legend: { bottom: "0%", left: "center" },
    series: [
      {
        type: "pie",
        radius: "60%",
        color: ["#EEE685", "#F08080"],
        data: [
          {
            value: props.warningData.reduce((a, b) => a + b, 0),
            name: "警告"
          },
          { value: props.errorData.reduce((a, b) => a + b, 0), name: "错误" }
        ]
      }
    ]
  });
};

// 渲染柱状图
const initBarChart = () => {
  if (!barInstance) {
    barInstance = echarts.init(barChart.value);
  }
  barInstance.setOption({
    title: { text: "分类告警分布", left: "center" },
    tooltip: { trigger: "axis" },
    legend: { data: ["Warning", "Error"], bottom: "0%" },
    xAxis: { type: "category", data: props.categories },
    yAxis: { type: "value" },
    series: [
      {
        name: "警告",
        type: "bar",
        data: props.warningData,
        itemStyle: { color: "#EEE685" }
      },
      {
        name: "错误",
        type: "bar",
        data: props.errorData,
        itemStyle: { color: "#F08080" }
      }
    ]
  });
};

// 监听 props 变化，父组件传入新数据时重新渲染
watch(
  () => [props.categories, props.warningData, props.errorData],
  () => {
    nextTick(() => {
      initPieChart();
      initBarChart();
    });
  },
  { deep: true, immediate: true }
);
</script>

<style scoped>
.chart {
  width: 100%;
  height: 400px;
}
</style>
