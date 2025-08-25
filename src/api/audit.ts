import { http } from "@/utils/http";
import { baseUrlApi } from "./util";

export type AuditResult = {
  code: number;
  message: string;
  data: {
    tableName: string;
    score: number;
    optimizableItems: number;
    rawResult: string;
    dimensionalScores: {
      [dimension: string]: number;
    };
  };
};

/** 获取实例列表 */
export const getInstances = () => {
  return http.request<any>("get", baseUrlApi("ddlAudit/instances"));
};

/** 获取数据库列表 */
export const getDatabases = (instanceId: number | string) => {
  return http.request<any>(
    "get",
    baseUrlApi(`ddlAudit/databases/${instanceId}`)
  );
};

/** 获取数据表列表 */
export const getTables = (dbId: string) => {
  return http.request<any>("get", baseUrlApi("ddlAudit/tables"), {
    params: { dbId }
  });
};

/** 审核SQL */
export const ddlAuditApi = (data: { sqlText: string }) => {
  return http.request<AuditResult>("post", baseUrlApi("review/ddl"), { data });
};

// 管理员DDL审核
export const adminAuditDdl = (data?: object) => {
  return http.request<AuditResult>("post", baseUrlApi("review/admin/ddl"), {
    data
  });
};

// 管理员DML审核
export const adminAuditDml = (data?: object) => {
  return http.request<AuditResult>("post", baseUrlApi("review/admin/dml"), {
    data
  });
};

// 普通用户DDL审核
export const userAuditDdl = (data?: object) => {
  return http.request<AuditResult>("post", baseUrlApi("review/common/ddl"), {
    data
  });
};

// 普通用户DML审核
export const userAuditDml = (data?: object) => {
  return http.request<AuditResult>("post", baseUrlApi("review/common/dml"), {
    data
  });
};

// export const getInstances() {
//   return http.get("/ddlAudit/instances");
// }

// export function getDatabases(instanceId: string) {
//   return http.get(`/ddlAudit/databases?instanceId=${instanceId}`);
// }

// export function getTables(dbId: string) {
//   return http.get(`/ddlAudit/tables?dbId=${dbId}`);
// }

// export function auditSql(data: { sql: string; user: string }) {
//   return http.post("/ddlAudit/audit", data);
// }

// export function getAuditHistory(params: any) {
//   return http.get("/ddlAudit/history", { params });
// }

// export function getAuditDetail(id: string) {
//   return http.get(`/ddlAudit/detail/${id}`);
// }
