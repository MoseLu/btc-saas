export interface Product {
  id: string; /** 产品ID */
  name: string; /** 产品名称 */
  description?: string; /** 产品描述 */
  price: number; /** 产品价格 */
  category?: string; /** 产品分类 */
  stock?: number; /** 库存数量 */
  status?: string; /** 产品状态 */
  createdAt?: string; /** 创建时间 */
  updatedAt?: string; /** 更新时间 */
}
