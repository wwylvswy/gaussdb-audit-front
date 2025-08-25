<!-- 由audit/index.vue简化而来 -->

<script setup lang="ts">
defineOptions({ name: "dmlaudit" });

import { ref, reactive, nextTick, onMounted, watch } from "vue";
import * as echarts from "echarts";

/* ------------------ STYLES (JS) ------------------ */
/* 你要求把样式放到 script 中，下面是样式对象，模板用 :style 绑定 */
const styles = {
  page: { padding: "18px" },
  topRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "16px"
  },
  editorWrapper: {
    height: "300px",
    flex: 1,
    background: "#ffffff",
    border: "1px solid #eaeaea",
    borderRadius: "6px",
    padding: "12px"
  },
  editorInner: { height: "270px", position: "relative" },
  textarea: {
    width: "100%",
    height: "100%",
    resize: "none",
    padding: "12px",
    fontFamily: "monospace",
    fontSize: "13px",
    border: "0",
    outline: "none"
  },
  btnRow: {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
    marginTop: "16px"
  },
  radarContainer: {
    width: "360px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center"
  },
  radarBox: {
    width: "360px",
    height: "300px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
  },
  summaryRow: {
    display: "flex",
    gap: "12px",
    width: "100%",
    justifyContent: "center"
  },
  scoreCardBlue: {
    flex: 1,
    background: "#4a90e2",
    color: "white",
    padding: "16px",
    textAlign: "center",
    borderRadius: "6px"
  },
  scoreCardLight: {
    flex: 1,
    background: "#6bb3ff",
    color: "white",
    padding: "16px",
    textAlign: "center",
    borderRadius: "6px"
  },
  historyBox: {
    marginTop: "18px",
    background: "#fff",
    padding: "12px",
    borderRadius: "6px"
  },
  historyTitle: { fontSize: "16px", fontWeight: 600, marginBottom: "12px" }
};

/* -------------- 级联下拉框 ---------------------*/
import { ElMessage } from "element-plus";
import {
  getAllDatasources,
  getAllDatabases,
  getTables,
  getSQLByMetaData
} from "@/api/ogdl";

// 状态管理
const isDirectConnectionEnabled = ref(false);
const datasources = ref([]);
const databases = ref([]);
const tables = ref([]);
const ddlContent = ref("");

const form = reactive({
  datasourceId: null,
  databaseName: "",
  tableName: ""
});

// 获取所有数据源实例列表
const fetchDataSources = async () => {
  try {
    const res = await getAllDatasources();
    datasources.value = res.data;
    console.log(res);
  } catch (error) {
    ElMessage.error("获取数据源列表失败");
  }
};

const fetchDatabases = async datasourceId => {
  if (!datasourceId) return;
  databases.value = []; // 清空旧数据
  tables.value = []; // 清空表列表
  ddlContent.value = ""; // 清空DDL
  form.databaseName = ""; // 重置表单
  form.tableName = "";

  try {
    const response = await getAllDatabases(datasourceId);
    databases.value = response.data;
  } catch (error) {
    ElMessage.error("获取数据库列表失败");
  }
};

const fetchTables = async (datasourceId, databaseName) => {
  if (!datasourceId || !databaseName) return;
  tables.value = []; // 清空旧数据
  ddlContent.value = ""; // 清空DDL
  form.tableName = "";

  try {
    // const response = await axios.get(
    //   `/api/datasources/${datasourceId}/databases/${databaseName}/tables`
    // );
    const res = await getTables(datasourceId, databaseName);
    tables.value = res.data;
  } catch (error) {
    console.log("error:", error);
    ElMessage.error("获取表列表失败");
  }
};

const fetchTableDDL = async (datasourceId, databaseName, tableName) => {
  if (!datasourceId || !databaseName || !tableName) return;

  try {
    // const response = await axios.get(
    //   `/api/datasources/${datasourceId}/databases/${databaseName}/tables/${tableName}/ddl`
    // );
    const res = await getSQLByMetaData(datasourceId, databaseName, tableName);
    sqlContent.value = res.data.ddl || "无法获取建表语句";
  } catch (error) {
    ElMessage.error("获取建表语句失败");
  }
};

// 事件处理函数
const toggleDirectConnection = () => {
  // 使用el-switch需要注释这句代码
  // isDirectConnectionEnabled.value = !isDirectConnectionEnabled.value;
  if (isDirectConnectionEnabled.value) {
    // 开启直连
    fetchDataSources(); // 加载数据源
  } else {
    // 关闭直连 - 清空所有相关状态和数据
    datasources.value = [];
    databases.value = [];
    tables.value = [];
    sqlContent.value = "";
    form.datasourceId = null;
    form.databaseName = "";
    form.tableName = "";
  }
};

const onDatasourceChange = val => {
  form.databaseName = "";
  form.tableName = "";
  databases.value = [];
  tables.value = [];
  sqlContent.value = "";
  if (val) {
    fetchDatabases(val);
  }
};

const onDatabaseChange = val => {
  form.tableName = "";
  tables.value = [];
  sqlContent.value = "";
  if (val && form.datasourceId) {
    fetchTables(form.datasourceId, val);
  }
};

const onTableChange = val => {
  sqlContent.value = "";
  if (val && form.datasourceId && form.databaseName) {
    fetchTableDDL(form.datasourceId, form.databaseName, val);
  }
};

/* ------------- 数据分析的柱状图和饼状图 -------- */
import AlarmCharts from "@/components/ReAnalisys/AlarmCharts.vue";

// 图表数据
const categories = ref([]);
const warningData = ref([]);
const errorData = ref([]);

// 是否显示图表
const showCharts = ref(false);

const fetchData = async () => {
  try {
    // 模拟请求延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO：这里是模拟数据，实际应从后端接口获取
    const mockData = {
      categories: ["字段", "索引", "分区", "约束", "命名"],
      warningData: [2, 1, 0, 1, 0],
      errorData: [1, 0, 0, 0, 0]
    };

    // 将模拟数据赋值给响应式变量
    categories.value = mockData.categories;
    warningData.value = mockData.warningData;
    errorData.value = mockData.errorData;

    // 显示图表
    showCharts.value = true;
  } catch (err) {
    console.error("获取数据失败", err);
  }
};

import { useUserStoreHook } from "@/store/modules/user";

// 获取用户角色信息
const userStore = useUserStoreHook();
const userRoles = userStore.roles;

// TODO: 实际数据应该由后端接口返回
const modelTypes = ref([
  { label: "DeepSeek", value: "deepseek" },
  { label: "通义千问", value: "qwen" }
]);

const selectedModel = ref<string>(modelTypes.value[0].value);

// 编辑器（默认使用 textarea，按需加载 monaco）
const sqlContent = ref<string>("");
const editorReady = ref(false);
const editorRef = ref<any>(null); // monaco instance or null
const editorContainer = ref<HTMLElement | null>(null);
// 控制是否自动加载 monaco（如果你确认 monaco 配置没问题可设为 true）
const autoLoadEditor = ref(true);

// 载入/审核状态
const loadingAudit = ref(false);

const detailData = ref<any>(null);

/* ---------- 生命周期 ---------- */
onMounted(async () => {
  await nextTick();
  // 如果明确希望自动加载 monaco（不推荐默认启用），可以打开下面：
  if (autoLoadEditor.value) {
    safeInitMonaco(); // 按需、带超时保护的初始化
  }
});

// 文件上传读取
async function handleUploadFile(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const text = await file.text();
  sqlContent.value = text;
  setEditorContent(text);
  input.value = "";
}

// 编辑器 get/set
function getEditorContent() {
  if (editorReady.value && editorRef.value && editorRef.value.getValue) {
    return editorRef.value.getValue();
  }
  return sqlContent.value;
}
function setEditorContent(val: string) {
  sqlContent.value = val;
  if (editorReady.value && editorRef.value && editorRef.value.setValue) {
    editorRef.value.setValue(val);
  }
}

// 清空/格式化
function clearEditor() {
  setEditorContent("");
}
function formatSql() {
  const v = getEditorContent().trim();
  setEditorContent(v);
}

// 审核结果
const markdownContent = ref<string>("");
watch(
  [loadingAudit, totalScore],
  () => {
    if (loadingAudit.value) {
      markdownContent.value = "";
      return;
    }
    // 这里可以根据实际接口返回内容设置 markdownContent
    // 示例：假设 detailData.value.details.items 是审核详情
    if (
      detailData.value &&
      detailData.value.details &&
      detailData.value.details.items
    ) {
      markdownContent.value = detailData.value.details.items
        .map((item: any) => `- **${item.msg}**（严重性：${item.severity}）`)
        .join("\n");
    } else if (totalScore.value !== null) {
      markdownContent.value = `**综合得分：${totalScore.value}**\n\n无详细优化项。`;
    } else {
      markdownContent.value = "";
    }
  },
  { immediate: true }
);

import { adminAuditDml, userAuditDml } from "@/api/audit";

/* ---------- Monaco 安全加载（按需） ---------- */
/**
 * safeInitMonaco - 动态 import monaco-editor，带超时保护
 * 如果 monaco 加载失败或超时，会回退到 textarea（editorReady = false）
 */
async function safeInitMonaco(timeout = 3000) {
  if (editorReady.value) return; // 已就绪
  // 防 SSR
  if (typeof window === "undefined") return;
  console.log("[ddlaudit] try loading monaco...");
  const importPromise = import("monaco-editor");
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("monaco load timeout")), timeout)
  );
  try {
    const monacoPkg = await Promise.race([importPromise, timeoutPromise]);
    await nextTick();
    if (!editorContainer.value) {
      console.warn("[ddlaudit] editorContainer not found, abort monaco init");
      editorReady.value = false;
      return;
    }
    const ed = monacoPkg.editor.create(editorContainer.value, {
      value: sqlContent.value,
      language: "sql",
      automaticLayout: true,
      minimap: { enabled: false },
      lineNumbers: "on",
      theme: "vs"
    });
    editorRef.value = ed;
    editorReady.value = true;
    console.log("[ddlaudit] monaco init success");
  } catch (err) {
    console.warn("[ddlaudit] monaco init failed or timed out:", err);
    editorReady.value = false;
    editorRef.value = null;
  }
}

import { onUnmounted } from "vue";
import { marked } from "marked";
import "github-markdown-css/github-markdown.css"; // 引入 GitHub 风格的 Markdown CSS

// 定义组件的响应式状态
const isLoading = ref(false);
const renderedMarkdown = ref("评审报告");
const contentRef = ref(null);
let resizeObserver = null;

function processString(str) {
  return (
    str
      // 第一步：将 "## 1. 优点总结" 之前的内容替换为 "# 评审报告\r\n\r\n"
      // 使用非贪婪匹配，找到第一个 "## 1. 优点总结" 之前的所有内容
      .replace(/^[\s\S]*?(?=##\s*1\s*\.\s*优点总结)/, "# 评审报告\r\n\r\n")

      // 第二步：去除从 "## 4. 综合评分" 以及之后的所有内容
      // 匹配 "## 4. 综合评分" 及其后所有字符
      .replace(/\s*##\s*4\s*\.\s*综合评分[\s\S]*/g, "")
  );
}

// 评审的主方法入口
const triggerReview = async () => {
  if (isLoading.value) return; // 防止重复点击
  isLoading.value = true;
  renderedMarkdown.value = ""; // 清空之前的内容、
  let res;
  try {
    const sqlText = getEditorContent().trim();
    if (userRoles.includes("admin")) {
      res = await adminAuditDml({
        sqlText: sqlText,
        version: "测试DML"
      });
    } else {
      res = await userAuditDml({
        sqlText: sqlText,
        version: "用户DML"
      });
    }

    const cleanData = processString(res.data.rawResult);
    const htmlContent = marked.parse(cleanData);
    // 插入数据分析图
    const any = await fetchData();
    renderedMarkdown.value = htmlContent;
    // DOM 更新后，markdown-body 会自动根据内容调整大小
    // 因为 .markdown-body 没有固定 height，它会自然伸展
    if (res.code == 200) {
      window.$message?.success?.("审核完成");
    }
  } catch (error) {
    console.error("获取 Markdown 数据失败:", error);
    // 这里可以设置错误状态并在模板中显示错误信息
  } finally {
    isLoading.value = false;
  }
};

// 暴露方法给父组件
defineExpose({ triggerReview });

// 组件卸载时清理（如果用了 ResizeObserver）
onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<template>
  <div :style="styles.page">
    <!-- 顶部控制 -->
    <div style="display: flex; align-items: center; gap: 20px">
      <div :style="styles.topRow">
        <el-select
          v-model="selectedModel"
          placeholder="选择大模型类型"
          style="width: 200px"
        >
          <el-option
            v-for="m in modelTypes"
            :key="m.value"
            :label="m.label"
            :value="m.value"
          />
        </el-select>
      </div>
    </div>

    <!-- 主体：编辑器 + 雷达 -->
    <div style="display: flex; gap: 24px; margin-bottom: 20px">
      <div :style="styles.editorWrapper" style="height: 415px">
        <div
          :style="styles.editorInner"
          style="height: 340px; border: 1px solid #eee; font-size: medium"
        >
          <!-- editorContainer 用于 monaco 挂载；否则显示 textarea -->
          <div
            v-if="editorReady"
            ref="editorContainer"
            style="height: 100%; width: 100%"
          />
          <textarea
            v-else
            v-model="sqlContent"
            placeholder="在此输入或粘贴 SQL 或上传 .sql/.txt 文件"
            :style="styles.textarea"
            style="font-size: large"
          />
        </div>

        <div :style="styles.btnRow">
          <!-- 上传按钮（原生 input + label） -->
          <label class="el-button el-button--primary" style="cursor: pointer">
            + 上传SQL文件
            <input
              type="file"
              accept=".sql,.txt"
              style="display: none"
              @change="handleUploadFile"
            />
          </label>

          <el-button @click="clearEditor">清空</el-button>
          <el-button @click="formatSql">格式化</el-button>

          <!-- 启用高级编辑器（按需加载 monaco） -->
          <!-- <el-button v-if="!editorReady" type="info" @click="safeInitMonaco">
            启用高级编辑器
          </el-button> -->

          <!-- <el-button type="primary" :loading="loadingAudit" @click="submitAudit" -->
          <el-button
            type="primary"
            :loading="loadingAudit"
            @click="triggerReview"
            >审核</el-button
          >
        </div>
      </div>
    </div>

    <!-- 数据分析柱状图 -->
    <div class="data_analysis_container">
      <!-- 只有在 showCharts = true 时才渲染 AlarmCharts -->
      <AlarmCharts
        v-if="showCharts"
        :categories="categories"
        :warningData="warningData"
        :errorData="errorData"
      />
    </div>

    <div class="markdown-review-container">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner" />
        <p class="loading-text">查询中...</p>
      </div>

      <!-- Markdown 内容显示区 -->
      <div
        v-show="!isLoading && renderedMarkdown"
        ref="contentRef"
        class="markdown-body"
        v-html="renderedMarkdown"
      />

      <!-- 初始状态或无内容时的占位 -->
      <div v-if="!isLoading && !renderedMarkdown" class="placeholder">
        <!-- 可以放一个提示图标或文字 -->
      </div>
    </div>
  </div>
</template>

<!-- 我已把样式放到 script 中，保持 <style scoped> 最小 -->
<style scoped>
.ddlaudit-page .el-button[disabled] {
  opacity: 0.6;
}

/* 容器样式：固定宽度，最小高度 */
.markdown-review-container {
  position: relative;
  /* width: 700px; 固定宽度 */
  width: 100%; /* 固定宽度 */
  min-height: 160px; /* 设置一个最小高度 */
  border: 1px solid #d0d7de;
  border-radius: 6px;
  overflow: hidden; /* 防止内容溢出 */
  background-color: #ffffff; /* 确保背景是白色 */
}

/* 加载动画覆盖层 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
  backdrop-filter: blur(2px);
}

.spinner {
  border: 4px solid #eaecef;
  border-top: 4px solid #0969da;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.data_analysis_container {
  margin-bottom: 20px;
}

.loading-text {
  margin-top: 10px;
  color: #57606a;
  font-size: 14px;
}

/* Markdown 内容区 */
/* 注意：我们引入了 github-markdown-css，它会给 .markdown-body 提供样式 */
/* 这里我们只需要设置宽度和最大样式覆盖即可 */
.markdown-body {
  padding: 16px; /* GitHub CSS 默认有 padding */
  box-sizing: border-box;
  /* 宽度由父容器控制，高度自适应内容 */
  /* overflow-wrap 和 word-break 已由 GitHub CSS 处理 */
}

/* 占位符样式 (可选) */
.placeholder {
  min-height: 150px; /* 与 min-height 一致 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #656d76;
  font-size: 14px;
  background-color: #f6f8fa; /* GitHub 背景色 */
}

/* 确保代码块在容器内滚动 */
.markdown-body pre {
  overflow-x: auto;
}
</style>
