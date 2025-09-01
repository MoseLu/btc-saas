export interface User {
  id: string; /** 用户ID */
  username: string; /** 用户名 */
  email: string; /** 邮箱 */
  name?: string; /** 姓名 */
  avatar?: string; /** 头像URL */
  status?: string; /** 用户状态 */
  createdAt?: string; /** 创建时间 */
  updatedAt?: string; /** 更新时间 */
}
