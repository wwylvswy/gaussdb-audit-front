<script setup lang="ts">
defineOptions({
  // name 作为一种规范最好必须写上并且和路由的name保持一致
  name: "user"
});

import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
import {
  userLogin,
  refreshTokenApi,
  addUserApi,
  getUserApi,
  updateUserApi,
  deleteUserApi,
  enableUserApi,
  listUsersApi
} from "@/api/user";

interface User {
  id?: number;
  account: string;
  department: string;
  phone: string;
  email: string;
  password?: string;
  creator: string;
  createTime?: string;
  updateTime?: string;
  enabled: boolean;
}

const loading = ref(false);
const tableData = ref<User[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const dialogVisible = ref(false);
const isEdit = ref(false);

const formData = reactive<User>({
  account: "",
  password: "",
  department: "",
  phone: "",
  email: "",
  creator: "admin",
  enabled: true
});

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    };
    const res = await listUsersApi(params);
    if (res && res.data) {
      tableData.value = res.data.records || [];
      total.value = res.data.total || 0;
    } else {
      tableData.value = [];
      total.value = 0;
    }
  } catch (e) {
    ElMessage.error("获取用户列表失败");
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  isEdit.value = false;
  Object.assign(formData, {
    account: "",
    department: "",
    phone: "",
    email: "",
    password: "",
    creator: "admin",
    enabled: true
  });
  dialogVisible.value = true;
};

const handleSave = async () => {
  if (isEdit.value) {
    try {
      // ✅ 修正：传入 id 和 formData 作为 data
      await updateUserApi(formData.id, formData);
      ElMessage.success("修改成功");
      dialogVisible.value = false;
      fetchData();
    } catch (error) {
      ElMessage.error("修改失败，请稍后重试");
    }
  } else {
    try {
      await addUserApi(formData);
      ElMessage.success("新增成功");
      dialogVisible.value = false;
      fetchData();
    } catch (e) {
      ElMessage.error("新增失败");
    }
  }
};

const handleEdit = (row: User) => {
  isEdit.value = true;
  Object.assign(formData, row);
  dialogVisible.value = true;
};

const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(`确认删除用户 ${row.account} 吗？`, "提示", {
      type: "warning"
    });
    const res = await deleteUserApi(row.id);
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

// const handleEnableChange = (row: User) => {
//   ElMessage.success(`${row.account} 已${row.enabled ? "启用" : "停用"}`);
// };

const handleEnableChange = async (row: User) => {
  try {
    await enableUserApi(row.id, row.enabled);

    // 2. 成功：显示成功消息
    ElMessage.success(`${row.account} 已${row.enabled ? "启用" : "停用"}`);
  } catch (error) {
    // 给用户反馈，并**回滚状态**
    ElMessage.error(`操作失败，${row.account} 状态未改变`);

    // 将 Switch 组件的状态回滚到操作前的状态
    // 因为在 UI 上 Switch 已经切换了，但后端操作失败了，所以需要手动回滚
    row.enabled = !row.enabled;
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="p-4">
    <el-card shadow="hover">
      <div class="flex justify-between mb-4">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增用户
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
      >
        <el-table-column prop="account" label="用户账号" min-width="120" />
        <el-table-column prop="password" label="用户密码" min-width="120">
          <template #default="{ row }">
            <span>{{
              row.password ? "*".repeat(row.password.length) : ""
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" min-width="120" />
        <el-table-column prop="phone" label="电话" min-width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
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

    <!-- 新增 / 修改用户弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '修改用户' : '新增用户'"
      width="500px"
      draggable
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="账号">
          <el-input v-model="formData.account" />
        </el-form-item>
        <!-- <el-form-item v-if="!isEdit" label="密码">
          <el-input v-model="formData.password" type="password" />
        </el-form-item> -->
        <el-form-item label="密码">
          <el-input v-model="formData.password" />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="formData.department" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="创建人">
          <el-input v-model="formData.creator" />
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
  </div>
</template>
