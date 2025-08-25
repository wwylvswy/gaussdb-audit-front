// 最简代码，也就是这些字段必须有
// 平台设置
export default {
  path: "/audit",
  meta: {
    title: "SQL审核",
    icon: "oui:nav-judgements"
  },
  children: [
    {
      path: "/audit/index",
      name: "ddlaudit",
      component: () => import("@/views/audit/index.vue"),
      meta: {
        title: "DDL审核",
        icon: "tdesign:edit-off"
      }
    },
    {
      path: "/audit/dmlaudit",
      name: "dmlaudit",
      component: () => import("@/views/audit/dmlaudit.vue"),
      meta: {
        title: "DML审核",
        icon: "hugeicons:audit-02"
      }
    }
  ]
};
