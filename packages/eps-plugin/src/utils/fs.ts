import fs from 'fs-extra'
import path from 'path'

export interface FileInfo {
  name: string
  path: string
  content: string
  size: number
  modified: Date
}

export class FileUtils {
  /**
   * 确保目录存在
   */
  static async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath)
  }

  /**
   * 创建目录
   */
  static async createDir(dirPath: string): Promise<void> {
    await fs.mkdirp(dirPath)
  }

  /**
   * 写入文件
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(filePath))
    await fs.writeFile(filePath, content, 'utf8')
  }

  /**
   * 读取文件
   */
  static async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf8')
  }

  /**
   * 检查文件是否存在
   */
  static async exists(filePath: string): Promise<boolean> {
    return await fs.pathExists(filePath)
  }

  /**
   * 删除文件
   */
  static async removeFile(filePath: string): Promise<void> {
    if (await this.exists(filePath)) {
      await fs.remove(filePath)
    }
  }

  /**
   * 删除目录
   */
  static async removeDir(dirPath: string): Promise<void> {
    if (await this.exists(dirPath)) {
      await fs.remove(dirPath)
    }
  }

  /**
   * 复制文件
   */
  static async copyFile(src: string, dest: string): Promise<void> {
    await fs.ensureDir(path.dirname(dest))
    await fs.copy(src, dest)
  }

  /**
   * 复制目录
   */
  static async copyDir(src: string, dest: string): Promise<void> {
    await fs.copy(src, dest)
  }

  /**
   * 获取文件信息
   */
  static async getFileInfo(filePath: string): Promise<FileInfo> {
    const stats = await fs.stat(filePath)
    const content = await this.readFile(filePath)
    
    return {
      name: path.basename(filePath),
      path: filePath,
      content,
      size: stats.size,
      modified: stats.mtime
    }
  }

  /**
   * 列出目录内容
   */
  static async listDir(dirPath: string): Promise<string[]> {
    return await fs.readdir(dirPath)
  }

  /**
   * 递归列出目录内容
   */
  static async listDirRecursive(dirPath: string): Promise<string[]> {
    const files: string[] = []
    
    const listFiles = async (currentPath: string) => {
      const items = await fs.readdir(currentPath)
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item)
        const stat = await fs.stat(fullPath)
        
        if (stat.isDirectory()) {
          await listFiles(fullPath)
        } else {
          files.push(fullPath)
        }
      }
    }
    
    await listFiles(dirPath)
    return files
  }

  /**
   * 查找文件
   */
  static async findFiles(dirPath: string, pattern: RegExp): Promise<string[]> {
    const files = await this.listDirRecursive(dirPath)
    return files.filter(file => pattern.test(file))
  }

  /**
   * 备份文件
   */
  static async backupFile(filePath: string, suffix: string = '.backup'): Promise<string> {
    const backupPath = filePath + suffix
    await this.copyFile(filePath, backupPath)
    return backupPath
  }

  /**
   * 恢复文件
   */
  static async restoreFile(filePath: string, suffix: string = '.backup'): Promise<void> {
    const backupPath = filePath + suffix
    if (await this.exists(backupPath)) {
      await this.copyFile(backupPath, filePath)
      await this.removeFile(backupPath)
    }
  }

  /**
   * 获取相对路径
   */
  static getRelativePath(from: string, to: string): string {
    return path.relative(from, to)
  }

  /**
   * 获取绝对路径
   */
  static getAbsolutePath(filePath: string): string {
    return path.resolve(filePath)
  }

  /**
   * 获取文件扩展名
   */
  static getExtension(filePath: string): string {
    return path.extname(filePath)
  }

  /**
   * 获取文件名（不含扩展名）
   */
  static getBasename(filePath: string): string {
    return path.basename(filePath, path.extname(filePath))
  }

  /**
   * 获取目录名
   */
  static getDirname(filePath: string): string {
    return path.dirname(filePath)
  }

  /**
   * 连接路径
   */
  static join(...paths: string[]): string {
    return path.join(...paths)
  }

  /**
   * 格式化路径
   */
  static normalize(filePath: string): string {
    return path.normalize(filePath)
  }

  /**
   * 检查是否为绝对路径
   */
  static isAbsolute(filePath: string): boolean {
    return path.isAbsolute(filePath)
  }

  /**
   * 获取文件大小（人类可读格式）
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  /**
   * 创建临时目录
   */
  static async createTempDir(prefix: string = 'eps-'): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp', `${prefix}${Date.now()}`)
    await this.createDir(tempDir)
    return tempDir
  }

  /**
   * 清理临时目录
   */
  static async cleanupTempDir(tempDir: string): Promise<void> {
    if (await this.exists(tempDir)) {
      await this.removeDir(tempDir)
    }
  }
}
