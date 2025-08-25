<script setup lang="ts">
defineOptions({
  // name 作为一种规范最好必须写上并且和路由的name保持一致
  name: "rule"
});

import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Upload, Edit, Delete, View } from "@element-plus/icons-vue";

interface Rule {
  id?: number;
  name: string;
  summary: string;
  type: string;
  creator: string;
  createTime?: string;
  enabled: boolean;
  content?: string; // 规则详情内容
}

const loading = ref(false);
const tableData = ref<Rule[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const multipleSelection = ref<Rule[]>([]);

// 新增 / 编辑 弹窗
const dialogVisible = ref(false);
const isEdit = ref(false);

// 详情弹窗
const detailDialogVisible = ref(false);
const detailData = ref<Rule | null>(null);

// 文件解析弹窗
const uploadDialogVisible = ref(false);
const parsedRules = ref<Rule[]>([]); // AI解析后的规则列表
const selectedParsedRules = ref<Rule[]>([]);

const formData = reactive<Rule>({
  name: "",
  summary: "",
  type: "",
  creator: "admin",
  enabled: true
});

const fetchData = () => {
  loading.value = true;
  setTimeout(() => {
    tableData.value = Array.from({ length: 10 }, (_, i) => ({
      id: (currentPage.value - 1) * pageSize.value + i + 1,
      name: `规则_${i + 1}`,
      summary: `这是规则 ${i + 1} 的摘要信息`,
      type: ["类型A", "类型B", "类型C"][i % 3],
      creator: "admin",
      createTime: "2025-08-13 10:00:00",
      enabled: i % 2 === 0,
      content: `规则 ${i + 1} 的详细内容...`
    }));
    total.value = 50;
    loading.value = false;
  }, 500);
};

const handleAdd = () => {
  isEdit.value = false;
  Object.assign(formData, {
    name: "",
    summary: "",
    type: "",
    creator: "admin",
    enabled: true
  });
  dialogVisible.value = true;
};

const handleEdit = (row: Rule) => {
  isEdit.value = true;
  Object.assign(formData, row);
  dialogVisible.value = true;
};

const handleDelete = (row?: Rule) => {
  const names = row ? [row.name] : multipleSelection.value.map(r => r.name);
  if (!names.length) {
    ElMessage.warning("请选择要删除的规则");
    return;
  }
  ElMessageBox.confirm(`确认删除规则 ${names.join("、")} 吗？`, "提示", {
    type: "warning"
  })
    .then(() => {
      ElMessage.success("删除成功");
      fetchData();
    })
    .catch(() => {});
};

const handleSave = () => {
  if (isEdit.value) {
    ElMessage.success("规则修改成功");
  } else {
    ElMessage.success("规则新增成功");
  }
  dialogVisible.value = false;
  fetchData();
};

const handleEnableChange = (row: Rule) => {
  ElMessage.success(`${row.name} 已${row.enabled ? "启用" : "停用"}`);
};

const handleDetail = (row: Rule) => {
  detailData.value = row;
  detailDialogVisible.value = true;
};

const handleUploadFile = () => {
  uploadDialogVisible.value = true;
  parsedRules.value = [];
  selectedParsedRules.value = [];
};

const handleFileChange = (file: File) => {
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error("文件大小不能超过 2MB");
    return false;
  }
  ElMessage.info("正在调用AI解析文件，请稍候...");
  // 模拟AI解析
  setTimeout(() => {
    parsedRules.value = Array.from({ length: 5 }, (_, i) => ({
      name: `解析规则_${i + 1}`,
      summary: `这是解析出来的规则 ${i + 1} 的摘要`,
      type: ["类型A", "类型B", "类型C"][i % 3],
      creator: "admin",
      enabled: true,
      content: `解析出的规则 ${i + 1} 的详细内容...`
    }));
    ElMessage.success("文件解析完成，请选择要导入的规则");
  }, 1000);
};

const handleImportParsedRules = () => {
  if (!selectedParsedRules.value.length) {
    ElMessage.warning("请选择要导入的规则");
    return;
  }
  ElMessage.success(`成功导入 ${selectedParsedRules.value.length} 条规则`);
  uploadDialogVisible.value = false;
  fetchData();
};

const handleSelectionChange = (selection: Rule[]) => {
  multipleSelection.value = selection;
};

onMounted(fetchData);
</script>

<template>
  <div class="p-4">
    <el-card shadow="hover">
      <div class="flex justify-between mb-4">
        <h2 class="text-lg font-bold">规则管理</h2>
        <div class="space-x-2">
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            新增单条规则
          </el-button>
          <el-button type="success" :icon="Upload" @click="handleUploadFile">
            从文件解析规则
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="规则名称" min-width="120" />
        <el-table-column prop="summary" label="规则摘要" min-width="180" />
        <el-table-column prop="type" label="规则类型" min-width="120" />
        <el-table-column prop="creator" label="创建人" min-width="100" />
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="是否启用" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              @change="handleEnableChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <el-space>
              <el-button
                type="info"
                size="small"
                :icon="View"
                @click="handleDetail(row)"
              >
                详情
              </el-button>
              <el-button
                type="primary"
                size="small"
                :icon="Edit"
                @click="handleEdit(row)"
              >
                修改
              </el-button>
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-between">
        <el-button
          type="danger"
          size="small"
          :icon="Delete"
          @click="handleDelete()"
        >
          批量删除
        </el-button>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          background
          layout="total, prev, pager, next"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 新增 / 修改规则弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '修改规则' : '新增规则'"
      width="500px"
      draggable
    >
      <el-form :model="formData" label-width="90px">
        <el-form-item label="规则名称">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="规则摘要">
          <el-input v-model="formData.summary" />
        </el-form-item>
        <el-form-item label="规则类型">
          <el-input v-model="formData.type" />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="formData.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 规则详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="规则详情"
      width="600px"
      draggable
    >
      <div v-if="detailData">
        <p><strong>规则名称：</strong>{{ detailData.name }}</p>
        <p><strong>规则摘要：</strong>{{ detailData.summary }}</p>
        <p><strong>规则类型：</strong>{{ detailData.type }}</p>
        <p><strong>创建人：</strong>{{ detailData.creator }}</p>
        <p><strong>创建时间：</strong>{{ detailData.createTime }}</p>
        <p><strong>规则内容：</strong></p>
        <el-card shadow="never">
          {{ detailData.content }}
        </el-card>
      </div>
    </el-dialog>

    <!-- 上传文件解析规则弹窗 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="从文件解析规则"
      width="600px"
      draggable
    >
      <el-upload
        drag
        action=""
        :auto-upload="false"
        :before-upload="handleFileChange"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">文件大小不能超过 2MB</div>
        </template>
      </el-upload>

      <div v-if="parsedRules.length" class="mt-4">
        <el-table
          :data="parsedRules"
          @selection-change="selectedParsedRules = $event"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="规则名称" />
          <el-table-column prop="summary" label="规则摘要" />
          <el-table-column prop="type" label="规则类型" />
        </el-table>
      </div>

      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImportParsedRules">
          导入所选规则
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
