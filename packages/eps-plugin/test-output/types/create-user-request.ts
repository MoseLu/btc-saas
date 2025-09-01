export interface CreateUserRequest {
  username: string; /** 用户名 */
  email: string; /** 邮箱 */
  name?: string; /** 姓名 */
  password: string; /** 密码 */
}
