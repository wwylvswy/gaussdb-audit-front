import { http } from "@/utils/http";
import { baseUrlApi } from "./util";

export type ConnectionInfo = {
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
};

export type DataSource = {
  id: number;
  datasourceName: string;
  host: string;
  port: string;
  databaseName: string;
  username: string;
  password: string;
  creator: string;
  createTime: string;
  status: boolean;
};

// 分页查询数据源
export const getDatasourcePage = (params: {
  page: number;
  pageSize: number;
}) => {
  return http.request("get", baseUrlApi("db/page"), { params });
};

// 查询数据源信息
export const getDatasourceInfo = (id: number) => {
  return http.request("get", baseUrlApi(`db/getDatasourceInfo/${id}`));
};

// 新增数据源
export const addDatasources = (data: DataSource) => {
  return http.request("post", baseUrlApi("db/addDatasource"), { data });
};

// 删除数据源
export const deleteDatasourceApi = (id: number) => {
  return http.request("delete", baseUrlApi(`db/deleteDatasource/${id}`));
};

// 批量删除数据源
export const batchDeleteDatasourceApi = (ids: number[]) => {
  return http.request("delete", baseUrlApi(`db/batchDeleteDatasource`), {
    data: { ids }
  });
};

// 启用数据源
export const enableDatasourceApi = (id: number | string, status: boolean) => {
  return http.request("patch", baseUrlApi(`db/enable/${id}`), {
    params: { status }
  });
};

// 修改数据源
export const updateDatasourceApi = (data: DataSource) => {
  return http.request("put", baseUrlApi(`db/updateDatasource/${data.id}`), {
    data
  });
};

// 测试数据源连接
export const testConnectionApi = (data: ConnectionInfo) => {
  return http.request("post", baseUrlApi("connect/test"), { data });
};

// 获取所有数据源实例名列表
export const getAllDatasources = () => {
  return http.request("get", baseUrlApi("db/getAllDatasource"));
};

// 获取数据源下的数据库列表
export const getAllDatabases = (datasourceId: number) => {
  return http.request(
    "get",
    baseUrlApi(`db/datasource/${datasourceId}/databases`)
  );
};

// 获取数据库下的表列表
export const getTables = (datasourceId: number, databaseName: string) => {
  return http.request(
    "get",
    baseUrlApi(`db/datasources/${datasourceId}/databases/${databaseName}/tables`)
  );
};

// 获取表的元数据并构建SQL语句
export const getSQLByMetaData = (datasourceId: number, databaseName: string, tableName: string) => {
  return http.request(
    "get",
    baseUrlApi(`db/datasources/${datasourceId}/databases/${databaseName}/tables/${tableName}/ddl`)
  );
};

// // 1. 测试连接
// export function testConnectionApi(data: {
//   host: string;
//   port: number;
//   database: string;
//   username: string;
//   password: string; // 前端加密后的密文
// }) {
//   return http.post("/api/connection/test", data);
// }

// // 2. 获取已保存的数据源
// export function getDatasources() {
//   return http.get("/api/datasources");
// }

// // 3. 获取某个数据源下的数据库列表
// export function getDatabases(datasourceId: number) {
//   return http.get(`/api/opengauss/${datasourceId}/databases`);
// }

// // 4. 获取某个数据库下的表列表
// export function getTables(datasourceId: number, database: string) {
//   return http.get(`/api/opengauss/${datasourceId}/${database}/tables`);
// }

// // 5. 获取某个表的元数据（返回DDL+列信息）
// export function getMetadata(datasourceId: number, tableName: string) {
//   return http.get(`/api/metadata/${datasourceId}/${tableName}`);
// }
