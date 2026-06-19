// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';

// ========== 配置 ==========
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
export const dynamic = 'force-static';
export const revalidate = false;

// WebP 压缩质量（统一 88，兼顾画质与体积）
const WEBP_QUALITY = 88;

// 模糊图配置（NSFW 保护）
const BLUR_CONFIG = {
  width: 200,        // 模糊图宽度（像素）
  quality: 20,       // 极低质量
  blurSigma: 15,     // 高斯模糊强度
};

// ========== 新增：文件名清理函数 ==========
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5_.-]/g, '_')  // 特殊字符替换为下划线
    .replace(/_+/g, '_')                              // 连续下划线合并
    .replace(/^_+|_+$/g, '');                         // 移除首尾下划线
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const author = formData.get('author') as string | null;
    const model = formData.get('model') as string | null;
    const paramsRaw = formData.get('params') as string | null;
    const nsfwRaw = formData.get('nsfw') as string | null;

    // ========== 参数校验 ==========
    if (!file) {
      return NextResponse.json({ error: '请选择图片文件' }, { status: 400 });
    }
    if (!author || author.trim() === '') {
      return NextResponse.json({ error: '作者为必填项' }, { status: 400 });
    }
    if (!model || !['nai', 'sd', 'anima', 'newbie'].includes(model)) {
      return NextResponse.json({ error: '无效的模型类型' }, { status: 400 });
    }
    if (!paramsRaw) {
      return NextResponse.json({ error: '参数信息缺失' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `图片大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '仅支持 JPG, PNG, WebP, GIF, SVG 格式' },
        { status: 400 }
      );
    }

    // ========== 读取原始文件 ==========
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    
    // ========== 修改：清理原始文件名 ==========
    const rawBaseName = path.basename(file.name, path.extname(file.name));
    const cleanBaseName = sanitizeFileName(rawBaseName);  // ← 新增清理
    
    const imagesDir = path.join(process.cwd(), 'public/images');
    await fs.ensureDir(imagesDir);

    // ============================================================
    // 1. 生成主图
    // ============================================================
    const mainBuffer = await sharp(fileBuffer)
      .webp({
        quality: WEBP_QUALITY,
        effort: 6,
      })
      .toColorspace('srgb')
      .toBuffer();

    // 使用清理后的文件名
    const mainFileName = `${timestamp}_${cleanBaseName}.webp`;
    const mainFilePath = path.join(imagesDir, mainFileName);
    await fs.writeFile(mainFilePath, mainBuffer);

    // ============================================================
    // 2. 生成模糊预览图
    // ============================================================
    const blurBuffer = await sharp(fileBuffer)
      .resize(BLUR_CONFIG.width, null, { fit: 'inside' })
      .webp({
        quality: BLUR_CONFIG.quality,
        effort: 1,
      })
      .blur(BLUR_CONFIG.blurSigma)
      .toColorspace('srgb')
      .toBuffer();

    // 使用清理后的文件名
    const blurFileName = `${timestamp}_${cleanBaseName}_blur.webp`;
    const blurFilePath = path.join(imagesDir, blurFileName);
    await fs.writeFile(blurFilePath, blurBuffer);

    // ============================================================
    // 3. 写入数据文件
    // ============================================================
    const dataFilePath = path.join(process.cwd(), 'data/images.json');
    let existingData = [];
    if (await fs.pathExists(dataFilePath)) {
      existingData = await fs.readJson(dataFilePath);
    }

    const params = JSON.parse(paramsRaw);
    let nsfw = false;
    if (nsfwRaw === 'true' || nsfwRaw === '1') {
      nsfw = true;
    }

    const newRecord = {
      id: timestamp,
      image_url: `/images/${mainFileName}`,
      blur_image_url: `/images/${blurFileName}`,
      author: author.trim(),
      model: model,
      params: params,
      nsfw: nsfw,
      created_at: new Date().toISOString(),
    };

    existingData.unshift(newRecord);
    await fs.writeJson(dataFilePath, existingData, { spaces: 2 });

    return NextResponse.json({
      success: true,
      message: '上传成功（主图 + 模糊图已生成）',
      data: newRecord,
    });
  } catch (error: any) {
    console.error('上传失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误: ' + (error.message || '未知错误') },
      { status: 500 }
    );
  }
}