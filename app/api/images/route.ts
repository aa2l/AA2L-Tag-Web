import { NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export async function GET() {
  try {
    const dataFilePath = path.join(process.cwd(), 'data/images.json');
    if (!await fs.pathExists(dataFilePath)) {
      return NextResponse.json([]);
    }
    const data = await fs.readJson(dataFilePath);
    return NextResponse.json(data);
  } catch (error) {
    console.error('读取图片列表失败:', error);
    return NextResponse.json({ error: '读取失败' }, { status: 500 });
  }
}