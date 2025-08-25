import { http } from "@/utils/http";
import { baseUrlApi } from "./util";

export type UserResult = {
  success: boolean;
  data: {
    /** 头像 */
    avatar: string;
    /** 账号 */
    account: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: string;
  };
};

export type Login = {
  success: boolean;
  data: {
    /** 账号 */
    account: string;
    /** 密码 */
    password: string;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: string;
  };
};

/** 登录 */
export const userLogin = (data?: object) => {
  return http.request<UserResult>("post", baseUrlApi("user/login"), { data });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>(
    "post",
    baseUrlApi("user/refresh-token"),
    {
      data
    }
  );
};

/** 新增用户 */
export const addUserApi = (data?: object) => {
  console.log(baseUrlApi);
  return http.request<UserResult>("post", baseUrlApi("user/addUser"), { data });
};

/** 获取用户信息 */
export const getUserApi = (id: number | string) => {
  return http.request<any>("get", baseUrlApi(`user/getUserInfo/${id}`));
};

/** 更新用户信息 */
export const updateUserApi = (id: number | string, data?: object) => {
  return http.request<any>("put", baseUrlApi(`user/updateUserInfo/${id}`), {
    data
  });
};

/** 删除用户 */
export const deleteUserApi = (id: number | string) => {
  return http.request<any>("delete", baseUrlApi(`user/deleteUser/${id}`));
};

/** 启用/禁用用户 */
export const enableUserApi = (id: number | string, enabled: boolean) => {
  return http.request<any>("patch", baseUrlApi(`user/enable/${id}`), {
    params: { enabled }
  });
};

/** 分页获取用户 */
export const listUsersApi = (params?: object) => {
  return http.request<any>("get", baseUrlApi("user/list"), { params });
};
