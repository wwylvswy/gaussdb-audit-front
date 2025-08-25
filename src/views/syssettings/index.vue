<script setup lang="ts">
defineOptions({
  // name 作为一种规范最好必须写上并且和路由的name保持一致
  name: "datasource"
});

import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
import {
  testConnectionApi,
  addDatasources,
  deleteDatasourceApi,
  batchDeleteDatasourceApi,
  updateDatasourceApi,
  getDatasourcePage,
  getDatasourceInfo,
  enableDatasourceApi
} from "@/api/ogdl";

interface DataSource {
  id?: number;
  datasourceName: string;
  host: string;
  port: string;
  databaseName: string;
  username: string;
  password?: string;
  creator: string;
  createTime?: string;
  status: boolean;
}

const loading = ref(false);
const tableData = ref<DataSource[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const dialogVisible = ref(false);
const isEdit = ref(false);

const formData = reactive<DataSource>({
  datasourceName: "",
  host: "",
  port: "",
  databaseName: "",
  username: "",
  password: "",
  creator: "admin",
  status: true
});

const multipleSelection = ref<DataSource[]>([]);
const testing = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    };
    const res = await getDatasourcePage(params);
    if (res.code == 200) {
      tableData.value = res.data.records || [];
      total.value = res.data.total || 0;
    } else {
      tableData.value = [];
      total.value = 0;
    }
  } catch (e) {
    ElMessage.error("获取数据源列表失败");
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  isEdit.value = false;
  Object.assign(formData, {
    datasourceName: "",
    host: "",
    port: "",
    databaseName: "",
    username: "",
    password: "",
    creator: "admin",
    status: true
  });
  dialogVisible.value = true;
};

const handleEdit = (row: DataSource) => {
  isEdit.value = true;
  Object.assign(formData, row);
  dialogVisible.value = true;
};

const handleDelete = async (row: DataSource) => {
  try {
    await ElMessageBox.confirm(
      `确认删除数据源 ${row.datasourceName} 吗？`,
      "提示",
      {
        type: "warning"
      }
    );
    const res = await deleteDatasourceApi(row.id);
    if (res.code == 200) {
      ElMessage.success("删除成功");
      fetchData();
    } else {
      ElMessage.error(res?.message || "删除失败");
      fetchData();
    }
  } catch {
    // 用户取消
  }
};

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${multipleSelection.value.length} 个数据源吗？`,
      "提示",
      {
        type: "warning"
      }
    );
    const res = await batchDeleteDatasourceApi(
      multipleSelection.value.map(item => item.id)
    );
    console.log(res);
    if (res.code == 200) {
      ElMessage.success("批量删除成功");
      fetchData();
    } else {
      ElMessage.error(res?.message || "批量删除失败");
      fetchData();
    }
  } catch (error) {
    // 用户取消
  }
};

const handleSave = async () => {
  if (isEdit.value) {
    try {
      await updateDatasourceApi(formData);
      ElMessage.success("修改成功");
      dialogVisible.value = false;
      fetchData();
    } catch (error) {
      ElMessage.error("修改失败");
    }
  } else {
    try {
      await addDatasources(formData);
      ElMessage.success("新增成功");
      dialogVisible.value = false;
      fetchData();
    } catch (error) {
      ElMessage.error("新增失败");
    }
  }
};

const handleEnableChange = async (row: DataSource) => {
  try {
    await enableDatasourceApi(row.id, !row.status);
    ElMessage.success(
      `${row.datasourceName} 已${row.status ? "启用" : "停用"}`
    );
  } catch (error) {
    ElMessage.error("操作失败");
  }
};

const handleSelectionChange = (val: DataSource[]) => {
  multipleSelection.value = val;
};

const handleTestConnection = async () => {
  testing.value = true;
  try {
    await testConnectionApi(formData);
    ElMessage.success("连接成功");
  } catch (error) {
    ElMessage.error("连接失败");
  } finally {
    testing.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="p-4">
    <el-card shadow="hover">
      <div class="flex justify-between mb-4">
        <h2 class="text-lg font-bold">数据源管理</h2>
        <div class="space-x-2">
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            新增数据源
          </el-button>
          <el-button
            type="danger"
            :icon="Delete"
            :disabled="multipleSelection.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="id" label="序号" width="70" align="center" />
        <el-table-column
          prop="datasourceName"
          label="数据源名称"
          min-width="150"
        />
        <el-table-column prop="host" label="主机IP" min-width="100" />
        <el-table-column prop="port" label="端口号" min-width="100" />
        <el-table-column prop="databaseName" label="数据库名" min-width="100" />
        <el-table-column prop="creator" label="创建人" min-width="100" />
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="是否启用" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" @change="handleEnableChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-space>
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

      <div class="mt-4 flex justify-end">
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

    <!-- 新增 / 修改数据源弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '修改数据源' : '新增数据源'"
      width="500px"
      draggable
    >
      <el-form :model="formData" label-width="90px">
        <el-form-item label="数据源名称">
          <el-input
            v-model="formData.datasourceName"
            placeholder="请输入数据源名称"
          />
        </el-form-item>
        <el-form-item label="主机">
          <el-input v-model="formData.host" placeholder="请输入服务器IP地址" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input-number
            v-model="formData.port"
            :min="1"
            :max="65535"
            placeholder="端口号"
          />
        </el-form-item>
        <el-form-item label="数据库名">
          <el-input
            v-model="formData.databaseName"
            placeholder="请输入数据库名"
          />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="formData.status" />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            plain
            :loading="testing"
            @click="handleTestConnection"
          >
            测试连接
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
