'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================
// 配置：是否启用 IP 拦截
// 生产环境设置为 true，开发环境可设为 false
// ============================================================
const ENABLE_IP_BLOCK = true;

// ============================================================
// 支持的 API 列表（按优先级排序）
// 如果第一个失败，自动尝试下一个
// ============================================================
const IP_APIS = [
  'https://ip-api.com/json/',           // 主用，稳定
  'https://ipinfo.io/json',             // 备用1
  'https://api.ip.sb/geoip',            // 备用2
];

// ============================================================
// 检测 IP 是否来自中国大陆
// ============================================================
async function detectChinaIP(): Promise<boolean> {
  for (const api of IP_APIS) {
    try {
      const response = await fetch(api, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) continue;
      
      const data = await response.json();
      
      // ip-api.com 格式
      if (data.countryCode === 'CN') return true;
      // ipinfo.io 格式
      if (data.country === 'CN') return true;
      // api.ip.sb 格式
      if (data.country_code === 'CN') return true;
      
      // 如果请求成功但没有匹配 CN，直接返回 false（节省后续请求）
      return false;
    } catch (error) {
      // API 请求失败，尝试下一个
      console.warn('IP 检测 API 失败，尝试下一个:', api);
      continue;
    }
  }
  
  // 所有 API 都失败时，默认放行（避免误伤）
  console.warn('所有 IP 检测 API 均失败，默认放行');
  return false;
}

export default function Home() {
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 如果未启用拦截，直接跳转
    if (!ENABLE_IP_BLOCK) {
      router.push('/gallery');
      return;
    }

    // 执行 IP 检测
    detectChinaIP()
      .then((isChina) => {
        if (isChina) {
          setIsBlocked(true);
        } else {
          setIsBlocked(false);
          router.push('/gallery');
        }
      })
      .catch(() => {
        // 发生意外错误时默认放行
        setIsBlocked(false);
        router.push('/gallery');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  // 加载中状态
  if (isLoading && ENABLE_IP_BLOCK) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-pink-300 border-t-pink-500 rounded-full animate-spin mb-4" />
          <p className="text-secondary">加载中...</p>
        </div>
      </div>
    );
  }

  // 被拦截状态
  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center p-8 bg-card-soft rounded-3xl border-2 border-pink-100 dark:border-pink-900/30 shadow-lg">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">无法访问</h1>
          <p className="text-secondary text-sm leading-relaxed">
            该网站在您所在地区暂时无法访问。<br />
            如有疑问，请联系管理员。
          </p>
          <div className="mt-6 pt-6 border-t border-pink-100 dark:border-pink-900/20">
            <p className="text-xs text-secondary/50">AA2L学社</p>
          </div>
        </div>
      </div>
    );
  }

  // 正常情况（实际上已经跳转了，这里作为后备）
  return null;
}