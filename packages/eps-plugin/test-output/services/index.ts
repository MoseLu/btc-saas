import { 用户管理Service } from './用户管理service'
import { 产品管理Service } from './产品管理service'

export { 用户管理Service }
export { 产品管理Service }

// 默认导出所有服务
export const services = {
  用户管理Service: 用户管理Service,
  产品管理Service: 产品管理Service,
}
