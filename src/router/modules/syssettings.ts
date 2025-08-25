// 最简代码，也就是这些字段必须有
// 平台设置
export default {
  path: "/syssettings",
  meta: {
    title: "平台设置",
    icon: "ep:setting"
  },
  children: [
    {
      path: "/syssettings/index",
      name: "datasource",
      component: () => import("@/views/syssettings/index.vue"),
      meta: {
        title: "数据源管理",
        icon: "majesticons:data-line"
      }
    },
    {
      path: "/syssettings/rule",
      name: "rule",
      component: () => import("@/views/syssettings/rule.vue"),
      meta: {
        title: "规则管理",
        icon: "ic:baseline-rule"
      }
    },
    {
      path: "/syssettings/user",
      name: "user",
      component: () => import("@/views/syssettings/user.vue"),
      meta: {
        title: "用户管理",
        icon: "uil:user"
      }
    }
  ]
};
