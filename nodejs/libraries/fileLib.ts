import fs from "fs";
import path from "path";
/**
 * The function `findFiles` recursively searches for files with a specific extension in a directory
 * while excluding specified directories.
 * @param {string} ext - The `ext` parameter in the `findFiles` function represents the file extension
 * that you want to search for in the specified directory and its subdirectories. For example, if you
 * pass 'txt' as the `ext` parameter, the function will search for all files with a '.txt' extension
 * @param {string} directoryPath - The `directoryPath` parameter in the `findFiles` function represents
 * the path to the directory where you want to search for files with a specific extension. It is the
 * starting point for the file search within the directory and its subdirectories.
 * @param {string[]} excludeDir - The `excludeDir` parameter in the `findFiles` function is used to
 * specify directories that should be excluded from the search for files with a specific extension. If
 * any directory names provided in the `excludeDir` array match the names of directories found during
 * the search, those directories and their contents will
 * @returns The `findFiles` function returns an array of strings containing the file paths of all files
 * with the specified extension (`ext`) within the specified directory (`directoryPath`), excluding any
 * directories listed in the `excludeDir` array.
 */
/**
 * 在指定目录中查找具有给定扩展名的文件
 * @param ext 文件扩展名
 * @param directoryPath 目录路径
 * @param excludeDir 要排除的目录列表
 * @returns 包含符合条件的文件路径的数组
 */
export function findFiles(ext: string, directoryPath: string, ...excludeDir: string[]): string[] {
  // 读取目录下的所有文件
  const files: string[] = fs.readdirSync(directoryPath);
  // 存储找到的文件路径
  const solFiles: string[] = [];
  // 遍历每个文件
  for (const file of files) {
    // 如果文件在排除列表中，则跳过
    if (excludeDir?.includes(file)) {
      continue;
    }
    // 构建文件路径
    const filePath = path.join(directoryPath, file);
    // 获取文件信息
    const stats = fs.statSync(filePath);
    // 如果是目录，则递归查找子目录中的文件
    if (stats.isDirectory()) {
      // 递归调用 findFiles 函数，查找子目录中的文件
      const subDirectoryFiles = findFiles(ext, filePath, ...excludeDir);
      // 将子目录中找到的文件路径添加到结果数组中
      solFiles.push(...subDirectoryFiles);
    } else if (path.extname(filePath) === ext) {
      // 如果是指定扩展名的文件，则将其路径添加到结果数组中
      solFiles.push(filePath);
    }
  }
  // 返回符合条件的文件路径数组
  return solFiles;
}
