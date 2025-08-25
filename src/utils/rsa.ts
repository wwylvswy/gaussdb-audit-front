import JSEncrypt from "jsencrypt";

// 后端给的 RSA 公钥（建议在系统配置接口获取，这里写死示例）
const PUBLIC_KEY = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwZ7pQv6V6Uo2fM9iM0MT
ZQXjFZplPO4X5mM4CV6A3EvQ5tF+n4gF3ah6a2mAkOadn5U5FOzoygJ3jUoyrM3m
...省略若干...
p0sM4c6l7LXaVQIDAQAB
-----END PUBLIC KEY-----
`;

// 加密函数
export function encryptPassword(password: string): string {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(PUBLIC_KEY);
  const encrypted = encryptor.encrypt(password);
  if (!encrypted) {
    throw new Error("RSA 加密失败");
  }
  return encrypted;
}
