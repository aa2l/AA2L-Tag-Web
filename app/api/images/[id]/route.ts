// app/api/images/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

// 静态导出必需的配置
export const dynamic = 'force-static';
export const revalidate = false;

// 关键：添加 generateStaticParams 并返回空数组
export function generateStaticParams() {
  return [];
}
// PUT 
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    const body = await request.json();
    const { author, model, params: newParams, nsfw } = body;

    if (!author || !model) {
      return NextResponse.json({ error: '作者和模型为必填项' }, { status: 400 });
    }

    const dataFilePath = path.join(process.cwd(), 'data/images.json');
    if (!await fs.pathExists(dataFilePath)) {
      return NextResponse.json({ error: '数据文件不存在' }, { status: 404 });
    }

    const data = await fs.readJson(dataFilePath);
    const index = data.findIndex((item: any) => item.id === idNum);
    if (index === -1) {
      return NextResponse.json({ error: '图片不存在' }, { status: 404 });
    }

    //  更新记录
    const updated = {
      ...data[index],
      author,
      model,
      params: newParams,
      nsfw: nsfw ?? false,
    };
    data[index] = updated;

    await fs.writeJson(dataFilePath, data, { spaces: 2 });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('更新失败:', error);
    return NextResponse.json({ error: '更新失败: ' + error.message }, { status: 500 });
  }
}

// DELETE 删除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);

    const dataFilePath = path.join(process.cwd(), 'data/images.json');
    if (!await fs.pathExists(dataFilePath)) {
      return NextResponse.json({ error: '数据文件不存在' }, { status: 404 });
    }

    const data = await fs.readJson(dataFilePath);
    const index = data.findIndex((item: any) => item.id === idNum);
    if (index === -1) {
      return NextResponse.json({ error: '图片不存在' }, { status: 404 });
    }

    const imageUrl = data[index].image_url;
    const imagePath = path.join(process.cwd(), 'public', imageUrl);
    if (await fs.pathExists(imagePath)) {
      await fs.remove(imagePath);
    }

    data.splice(index, 1);
    await fs.writeJson(dataFilePath, data, { spaces: 2 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('删除失败:', error);
    return NextResponse.json({ error: '删除失败: ' + error.message }, { status: 500 });
  }
}