import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '请至少选择一张图片' },
        { status: 400 }
      );
    }

    const dataFilePath = path.join(process.cwd(), 'data/images.json');
    if (!(await fs.pathExists(dataFilePath))) {
      return NextResponse.json({ error: '数据文件不存在' }, { status: 404 });
    }

    const data = await fs.readJson(dataFilePath);
    const idsSet = new Set(ids);

    const deletedImages: any[] = [];
    const remainingData = data.filter((item: any) => {
      if (idsSet.has(item.id)) {
        deletedImages.push(item);
        return false;
      }
      return true;
    });

    for (const img of deletedImages) {
      const mainPath = path.join(process.cwd(), 'public', img.image_url);
      if (await fs.pathExists(mainPath)) {
        await fs.remove(mainPath);
      }
      if (img.blur_image_url) {
        const blurPath = path.join(process.cwd(), 'public', img.blur_image_url);
        if (await fs.pathExists(blurPath)) {
          await fs.remove(blurPath);
        }
      }
    }

    await fs.writeJson(dataFilePath, remainingData, { spaces: 2 });

    return NextResponse.json({
      success: true,
      message: `成功删除 ${deletedImages.length} 张图片`,
      deletedCount: deletedImages.length,
    });
  } catch (error: any) {
    console.error('批量删除失败:', error);
    return NextResponse.json(
      { error: '批量删除失败: ' + (error.message || '未知错误') },
      { status: 500 }
    );
  }
}