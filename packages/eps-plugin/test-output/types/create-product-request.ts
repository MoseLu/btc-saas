export interface CreateProductRequest {
  name: string; /** 产品名称 */
  description?: string; /** 产品描述 */
  price: number; /** 产品价格 */
  category?: string; /** 产品分类 */
  stock?: number; /** 库存数量 */
}
