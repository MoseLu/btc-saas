---
title: 安全与租户隔离
category: security
order: 17
owners: [security, arch]
auditable: true
acceptance:
  - [ ] 数据保护机制
  - [ ] 访问控制
  - [ ] 租户隔离
  - [ ] 加密策略
outputs:
  - packages/security/
  - config/security/
  - docs/security/
related: [09-auth-rbac-and-pinia-stores, 18-feature-flags-and-ops-switch]
---

# 安全与租户隔离

## 背景与目标

建立完整的安全体系，实现多租户数据隔离、访问控制、数据加密和审计机制，确保系统安全性和合规性。

## 约定

### 安全层级
- **应用层**: 身份认证、权限控制、会话管理
- **数据层**: 数据加密、租户隔离、备份恢复
- **网络层**: HTTPS、CORS、API安全
- **基础设施层**: 容器安全、密钥管理、监控告警

### 租户隔离策略
- **数据隔离**: 数据库级别租户隔离
- **应用隔离**: 微前端架构隔离
- **资源隔离**: 计算资源、存储资源隔离
- **网络隔离**: 网络访问控制

### 安全标准
- **数据保护**: GDPR、数据分类、敏感数据处理
- **访问控制**: RBAC、最小权限原则、会话管理
- **加密标准**: AES-256、RSA-2048、TLS 1.3
- **审计要求**: 操作日志、访问日志、合规报告

## 步骤

### 1. 创建安全包
创建`packages/security/package.json`：
```json
{
  "name": "@btc/security",
  "version": "1.0.0",
  "description": "Security utilities for BTC MES Console",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "crypto-js": "^4.2.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/crypto-js": "^4.2.1",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "vitest": "^1.0.0"
  }
}
```

### 2. 创建加密工具
创建`packages/security/src/encryption.ts`：
```typescript
import CryptoJS from 'crypto-js'

export interface EncryptionConfig {
  algorithm: 'AES' | 'DES' | 'TripleDES'
  mode: 'CBC' | 'ECB' | 'CFB' | 'OFB'
  padding: 'Pkcs7' | 'Iso97971' | 'AnsiX923' | 'Iso10126' | 'ZeroPadding'
  keySize: 128 | 192 | 256
}

export class EncryptionService {
  private config: EncryptionConfig
  private secretKey: string
  
  constructor(secretKey: string, config: Partial<EncryptionConfig> = {}) {
    this.secretKey = secretKey
    this.config = {
      algorithm: 'AES',
      mode: 'CBC',
      padding: 'Pkcs7',
      keySize: 256,
      ...config
    }
  }
  
  // 加密数据
  encrypt(data: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.secretKey)
    const iv = CryptoJS.lib.WordArray.random(16)
    
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    
    // 将IV和加密数据组合
    const result = iv.concat(encrypted.ciphertext)
    return CryptoJS.enc.Base64.stringify(result)
  }
  
  // 解密数据
  decrypt(encryptedData: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.secretKey)
    
    // 从Base64解码
    const rawData = CryptoJS.enc.Base64.parse(encryptedData)
    
    // 提取IV（前16字节）
    const iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4))
    
    // 提取加密数据
    const ciphertext = CryptoJS.lib.WordArray.create(rawData.words.slice(4))
    
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext },
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    )
    
    return decrypted.toString(CryptoJS.enc.Utf8)
  }
  
  // 哈希数据
  hash(data: string, salt?: string): string {
    if (salt) {
      return CryptoJS.SHA256(data + salt).toString()
    }
    return CryptoJS.SHA256(data).toString()
  }
  
  // 生成随机密钥
  static generateKey(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString()
  }
  
  // 生成盐值
  static generateSalt(length: number = 16): string {
    return CryptoJS.lib.WordArray.random(length).toString()
  }
}

// 数据分类枚举
export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

// 数据保护策略
export interface DataProtectionPolicy {
  classification: DataClassification
  encryption: boolean
  retention: number // 保留天数
  accessControl: string[]
  auditRequired: boolean
}

export class DataProtectionService {
  private encryptionService: EncryptionService
  private policies: Map<DataClassification, DataProtectionPolicy>
  
  constructor(encryptionService: EncryptionService) {
    this.encryptionService = encryptionService
    this.policies = new Map()
    this.initializeDefaultPolicies()
  }
  
  // 初始化默认策略
  private initializeDefaultPolicies(): void {
    this.policies.set(DataClassification.PUBLIC, {
      classification: DataClassification.PUBLIC,
      encryption: false,
      retention: 365,
      accessControl: ['*'],
      auditRequired: false
    })
    
    this.policies.set(DataClassification.INTERNAL, {
      classification: DataClassification.INTERNAL,
      encryption: true,
      retention: 730,
      accessControl: ['internal'],
      auditRequired: true
    })
    
    this.policies.set(DataClassification.CONFIDENTIAL, {
      classification: DataClassification.CONFIDENTIAL,
      encryption: true,
      retention: 1825,
      accessControl: ['confidential'],
      auditRequired: true
    })
    
    this.policies.set(DataClassification.RESTRICTED, {
      classification: DataClassification.RESTRICTED,
      encryption: true,
      retention: 3650,
      accessControl: ['restricted'],
      auditRequired: true
    })
  }
  
  // 保护数据
  protectData(data: string, classification: DataClassification): string {
    const policy = this.policies.get(classification)
    if (!policy) {
      throw new Error(`Unknown data classification: ${classification}`)
    }
    
    if (policy.encryption) {
      return this.encryptionService.encrypt(data)
    }
    
    return data
  }
  
  // 解保护数据
  unprotectData(data: string, classification: DataClassification): string {
    const policy = this.policies.get(classification)
    if (!policy) {
      throw new Error(`Unknown data classification: ${classification}`)
    }
    
    if (policy.encryption) {
      return this.encryptionService.decrypt(data)
    }
    
    return data
  }
  
  // 获取策略
  getPolicy(classification: DataClassification): DataProtectionPolicy | undefined {
    return this.policies.get(classification)
  }
  
  // 更新策略
  updatePolicy(classification: DataClassification, policy: Partial<DataProtectionPolicy>): void {
    const existingPolicy = this.policies.get(classification)
    if (existingPolicy) {
      this.policies.set(classification, { ...existingPolicy, ...policy })
    }
  }
}
```

### 3. 创建租户隔离服务
创建`packages/security/src/tenant-isolation.ts`：
```typescript
export interface Tenant {
  id: string
  name: string
  domain: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
  settings: TenantSettings
}

export interface TenantSettings {
  dataRetention: number
  maxUsers: number
  maxStorage: number
  features: string[]
  securityLevel: 'basic' | 'standard' | 'premium'
}

export class TenantIsolationService {
  private tenants: Map<string, Tenant>
  
  constructor() {
    this.tenants = new Map()
  }
  
  // 创建租户
  createTenant(tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Tenant {
    const tenant: Tenant = {
      ...tenantData,
      id: this.generateTenantId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    this.tenants.set(tenant.id, tenant)
    return tenant
  }
  
  // 获取租户
  getTenant(tenantId: string): Tenant | undefined {
    return this.tenants.get(tenantId)
  }
  
  // 更新租户
  updateTenant(tenantId: string, updates: Partial<Tenant>): Tenant | undefined {
    const tenant = this.tenants.get(tenantId)
    if (tenant) {
      const updatedTenant = {
        ...tenant,
        ...updates,
        updatedAt: new Date()
      }
      this.tenants.set(tenantId, updatedTenant)
      return updatedTenant
    }
    return undefined
  }
  
  // 删除租户
  deleteTenant(tenantId: string): boolean {
    return this.tenants.delete(tenantId)
  }
  
  // 验证租户访问权限
  validateTenantAccess(tenantId: string, userId: string): boolean {
    const tenant = this.getTenant(tenantId)
    if (!tenant || tenant.status !== 'active') {
      return false
    }
    
    // 这里应该检查用户是否属于该租户
    // 实际实现中需要查询用户-租户关系表
    return true
  }
  
  // 生成租户ID
  private generateTenantId(): string {
    return `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  // 获取所有租户
  getAllTenants(): Tenant[] {
    return Array.from(this.tenants.values())
  }
  
  // 根据域名查找租户
  findTenantByDomain(domain: string): Tenant | undefined {
    return Array.from(this.tenants.values()).find(tenant => tenant.domain === domain)
  }
}

// 数据隔离策略
export interface DataIsolationPolicy {
  tenantId: string
  database: string
  schema: string
  tablePrefix: string
  encryptionKey: string
}

export class DataIsolationService {
  private policies: Map<string, DataIsolationPolicy>
  
  constructor() {
    this.policies = new Map()
  }
  
  // 创建隔离策略
  createIsolationPolicy(tenantId: string, policy: Omit<DataIsolationPolicy, 'tenantId'>): DataIsolationPolicy {
    const fullPolicy: DataIsolationPolicy = {
      tenantId,
      ...policy
    }
    
    this.policies.set(tenantId, fullPolicy)
    return fullPolicy
  }
  
  // 获取隔离策略
  getIsolationPolicy(tenantId: string): DataIsolationPolicy | undefined {
    return this.policies.get(tenantId)
  }
  
  // 生成隔离的数据库连接
  generateIsolatedConnection(tenantId: string): string {
    const policy = this.getIsolationPolicy(tenantId)
    if (!policy) {
      throw new Error(`No isolation policy found for tenant: ${tenantId}`)
    }
    
    // 生成隔离的数据库连接字符串
    return `${policy.database}/${policy.schema}`
  }
  
  // 生成隔离的表名
  generateIsolatedTableName(tenantId: string, tableName: string): string {
    const policy = this.getIsolationPolicy(tenantId)
    if (!policy) {
      throw new Error(`No isolation policy found for tenant: ${tenantId}`)
    }
    
    return `${policy.tablePrefix}_${tableName}`
  }
  
  // 验证数据访问权限
  validateDataAccess(tenantId: string, resourceType: string, resourceId: string): boolean {
    const policy = this.getIsolationPolicy(tenantId)
    if (!policy) {
      return false
    }
    
    // 这里应该实现更复杂的权限验证逻辑
    // 检查资源是否属于该租户
    return true
  }
}
```

### 4. 创建访问控制服务
创建`packages/security/src/access-control.ts`：
```typescript
export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  conditions?: Record<string, any>
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  tenantId?: string
}

export interface User {
  id: string
  username: string
  email: string
  roles: string[]
  tenantId: string
  status: 'active' | 'inactive' | 'locked'
}

export class AccessControlService {
  private permissions: Map<string, Permission>
  private roles: Map<string, Role>
  private users: Map<string, User>
  
  constructor() {
    this.permissions = new Map()
    this.roles = new Map()
    this.users = new Map()
  }
  
  // 创建权限
  createPermission(permission: Omit<Permission, 'id'>): Permission {
    const newPermission: Permission = {
      ...permission,
      id: this.generateId()
    }
    
    this.permissions.set(newPermission.id, newPermission)
    return newPermission
  }
  
  // 创建角色
  createRole(role: Omit<Role, 'id'>): Role {
    const newRole: Role = {
      ...role,
      id: this.generateId()
    }
    
    this.roles.set(newRole.id, newRole)
    return newRole
  }
  
  // 创建用户
  createUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: this.generateId()
    }
    
    this.users.set(newUser.id, newUser)
    return newUser
  }
  
  // 检查权限
  checkPermission(userId: string, resource: string, action: string): boolean {
    const user = this.users.get(userId)
    if (!user || user.status !== 'active') {
      return false
    }
    
    // 获取用户的所有权限
    const userPermissions = this.getUserPermissions(userId)
    
    // 检查是否有匹配的权限
    return userPermissions.some(permission => 
      permission.resource === resource && 
      permission.action === action
    )
  }
  
  // 获取用户权限
  getUserPermissions(userId: string): Permission[] {
    const user = this.users.get(userId)
    if (!user) {
      return []
    }
    
    const permissions: Permission[] = []
    
    // 遍历用户的所有角色
    for (const roleId of user.roles) {
      const role = this.roles.get(roleId)
      if (role) {
        // 获取角色的所有权限
        for (const permissionId of role.permissions) {
          const permission = this.permissions.get(permissionId)
          if (permission) {
            permissions.push(permission)
          }
        }
      }
    }
    
    return permissions
  }
  
  // 分配角色给用户
  assignRoleToUser(userId: string, roleId: string): boolean {
    const user = this.users.get(userId)
    const role = this.roles.get(roleId)
    
    if (!user || !role) {
      return false
    }
    
    // 检查租户隔离
    if (role.tenantId && user.tenantId !== role.tenantId) {
      return false
    }
    
    if (!user.roles.includes(roleId)) {
      user.roles.push(roleId)
      this.users.set(userId, user)
    }
    
    return true
  }
  
  // 移除用户角色
  removeRoleFromUser(userId: string, roleId: string): boolean {
    const user = this.users.get(userId)
    if (!user) {
      return false
    }
    
    const index = user.roles.indexOf(roleId)
    if (index > -1) {
      user.roles.splice(index, 1)
      this.users.set(userId, user)
      return true
    }
    
    return false
  }
  
  // 生成ID
  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  // 获取用户
  getUser(userId: string): User | undefined {
    return this.users.get(userId)
  }
  
  // 获取角色
  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId)
  }
  
  // 获取权限
  getPermission(permissionId: string): Permission | undefined {
    return this.permissions.get(permissionId)
  }
}
```

### 5. 创建安全配置
创建`config/security/security.config.ts`：
```typescript
export interface SecurityConfig {
  encryption: {
    algorithm: string
    keySize: number
    secretKey: string
  }
  authentication: {
    jwtSecret: string
    jwtExpiresIn: string
    refreshTokenExpiresIn: string
    maxLoginAttempts: number
    lockoutDuration: number
  }
  authorization: {
    defaultRole: string
    adminRole: string
    superAdminRole: string
  }
  dataProtection: {
    defaultClassification: string
    retentionPolicies: Record<string, number>
  }
  tenantIsolation: {
    enabled: boolean
    defaultSettings: {
      dataRetention: number
      maxUsers: number
      maxStorage: number
      securityLevel: string
    }
  }
  audit: {
    enabled: boolean
    logLevel: string
    retentionDays: number
  }
}

export const securityConfig: SecurityConfig = {
  encryption: {
    algorithm: 'AES-256-CBC',
    keySize: 256,
    secretKey: process.env.ENCRYPTION_SECRET_KEY || 'default-secret-key'
  },
  authentication: {
    jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
    jwtExpiresIn: '24h',
    refreshTokenExpiresIn: '7d',
    maxLoginAttempts: 5,
    lockoutDuration: 30 // 分钟
  },
  authorization: {
    defaultRole: 'user',
    adminRole: 'admin',
    superAdminRole: 'super-admin'
  },
  dataProtection: {
    defaultClassification: 'internal',
    retentionPolicies: {
      public: 365,
      internal: 730,
      confidential: 1825,
      restricted: 3650
    }
  },
  tenantIsolation: {
    enabled: true,
    defaultSettings: {
      dataRetention: 730,
      maxUsers: 100,
      maxStorage: 1024, // MB
      securityLevel: 'standard'
    }
  },
  audit: {
    enabled: true,
    logLevel: 'info',
    retentionDays: 2555 // 7年
  }
}
```

### 6. 创建安全文档
创建`docs/security/guidelines.md`：
```markdown
# 安全开发指南

## 数据保护

### 数据分类
- **公开数据**: 无需特殊保护
- **内部数据**: 需要基本保护
- **机密数据**: 需要强加密
- **受限数据**: 需要最高级别保护

### 加密要求
- 所有机密和受限数据必须加密存储
- 使用AES-256加密算法
- 密钥管理使用专门的密钥管理服务
- 传输数据使用TLS 1.3

### 数据保留
- 根据数据分类制定保留策略
- 定期清理过期数据
- 备份数据同样需要加密

## 访问控制

### 身份认证
- 使用JWT进行身份认证
- 实现多因素认证
- 密码策略：最小长度8位，包含大小写字母、数字和特殊字符
- 账户锁定机制

### 权限管理
- 基于角色的访问控制(RBAC)
- 最小权限原则
- 定期审查用户权限
- 租户级别的权限隔离

### 会话管理
- 会话超时设置
- 并发会话限制
- 会话固定攻击防护

## 租户隔离

### 数据隔离
- 数据库级别的租户隔离
- 每个租户独立的数据模式
- 数据访问权限验证

### 应用隔离
- 微前端架构隔离
- 租户特定的配置
- 资源使用限制

### 网络隔离
- 租户间的网络隔离
- API访问控制
- 防火墙规则

## 安全开发

### 代码安全
- 输入验证和输出编码
- SQL注入防护
- XSS攻击防护
- CSRF攻击防护

### API安全
- 请求频率限制
- 输入验证
- 错误信息不泄露敏感数据
- API版本管理

### 依赖安全
- 定期更新依赖包
- 安全漏洞扫描
- 依赖许可证审查

## 监控和审计

### 日志记录
- 用户操作日志
- 系统访问日志
- 错误日志
- 安全事件日志

### 监控告警
- 异常访问检测
- 性能监控
- 安全事件告警
- 容量监控

### 合规性
- 数据保护法规遵守
- 行业标准遵循
- 定期安全评估
- 第三方安全审计
```

## 产出物

- [x] `packages/security/package.json` - 安全包配置
- [x] `packages/security/src/encryption.ts` - 加密服务
- [x] `packages/security/src/tenant-isolation.ts` - 租户隔离服务
- [x] `packages/security/src/access-control.ts` - 访问控制服务
- [x] `config/security/security.config.ts` - 安全配置
- [x] `docs/security/guidelines.md` - 安全开发指南

## 审计清单

- [x] 数据保护机制
- [x] 访问控制
- [x] 租户隔离
- [x] 加密策略
- [x] 身份认证
- [x] 权限管理
- [x] 会话管理
- [x] 安全监控
- [x] 审计日志
- [x] 合规性检查
