// app/lib/comic-utils.ts

/**
 * 生成一个简单的短ID（基于时间戳 + 随机数）
 */
export function generateComicId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `comic-${timestamp}-${random}`;
}

/**
 * 生成章节ID
 */
export function generateChapterId(index: number): string {
  return `ch-${String(index + 1).padStart(2, '0')}`;
}

/**
 * 获取当前ISO时间
 */
export function getNowISO(): string {
  return new Date().toISOString();
}