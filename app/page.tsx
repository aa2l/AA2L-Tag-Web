'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/gallery');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-secondary">正在跳转到图片画廊...</p>
    </div>
  );
}