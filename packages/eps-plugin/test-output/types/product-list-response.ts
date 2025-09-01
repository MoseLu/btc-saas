export interface ProductListResponse {
  data?: any[];
  total?: number; /** 总数量 */
  page?: number; /** 当前页码 */
  pageSize?: number; /** 每页数量 */
}
