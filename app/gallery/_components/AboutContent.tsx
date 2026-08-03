// app/gallery/_components/AboutContent.tsx
'use client';

import {
  Sparkles,
  Code,
  Users,
  Heart,
  Palette,
  Zap,
  BookOpen,
  Star,
  ExternalLink,
  Bot,
  Paintbrush,
  Layers,
  Terminal,
  PenTool,
} from 'lucide-react';


const BASE_PATH = process.env.NODE_ENV === 'production' ? '/AA2L-Tag-Web' : '';

interface AboutContentProps {
  isUnlocked: boolean;
}

export default function AboutContent({ isUnlocked }: AboutContentProps) {
  
  const contributors = [
    { name: 'aa2l', role: '开发运维 / 内容创作', avatar: '/images/team/aa2l.png' },
    { name: '花霖Flowerain', role: '内容创作', avatar: '/images/team/花.jpg' },
    { name: '海尔柑子猫', role: '内容创作', avatar: '/images/team/猫.jpg' },
    { name: '星野風禾', role: '内容创作', avatar: '/images/team/星.jpg' },
    { name: '泠雨', role: '内容创作', avatar: '/images/team/泠.png' },
    { name: '㿟君MrWhite', role: '内容创作', avatar: '/images/team/㿟.jpg' },
    { name: '狐狸猫', role: '内容创作', avatar: '/images/team/狐.png' },
    { name: '星海之浪', role: '内容创作', avatar: '/images/team/浪.jpg' },
    { name: '我小三七', role: '内容创作', avatar: '/images/team/三.jpg' },
    { name: 'Grazy鲨鱼', role: '内容创作', avatar: '/images/team/鲨.png' },
  ];

  // 领域分类
  const domains = [
    {
      icon: <Bot className="w-4 h-4" />,
      title: 'AI 模型',
      items: 'Anima · NAI · SD · NewBie · Flux · Z-image · GPT-Sovits · Qwen 系 · Wan 系 · GPT-image · banana · seed 系',
    },
    {
      icon: <Paintbrush className="w-4 h-4" />,
      title: '绘画',
      items: '纸绘 · 板绘 · Photoshop · CSP · SAI',
    },
    {
      icon: <Layers className="w-4 h-4" />,
      title: '后期 & 设计',
      items: 'Premiere · After Effects · Photoshop · Illustrator · InDesign',
    },
    {
      icon: <Terminal className="w-4 h-4" />,
      title: '开发',
      items: 'Transformer · Gradio · Ren.py · Next.js · Godot',
    },
    {
      icon: <PenTool className="w-4 h-4" />,
      title: '漫画 & 写作',
      items: '分镜脚本 · 漫画理论 · 漫符后期 · 美术 · 写作',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* ===== 头部：品牌头像 + 标题 ===== */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-pink-200 dark:border-pink-800/40 shadow-lg shadow-pink-200/30 dark:shadow-pink-900/20 bg-pink-50/50 dark:bg-pink-900/10 flex items-center justify-center">
            <img
              src={BASE_PATH + '/images/team/1121.png'}
              alt="1121 学社"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-pink-200 dark:bg-pink-800/40 rounded-full p-1.5 shadow-sm">
            <Sparkles className="w-5 h-5 text-pink-500" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 flex items-center justify-center gap-2">
          1121 学社
        </h1>
        <p className="text-secondary mt-2 text-sm sm:text-base">
          「为学，为作，为突破」
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <span className="inline-block px-3 py-1 bg-pink-50 dark:bg-pink-900/20 rounded-full text-xs text-pink-600 dark:text-pink-300 border border-pink-100 dark:border-pink-800/30">
            AI 参数画廊
          </span>
          <span className="inline-block px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-full text-xs text-primary-600 dark:text-primary-300 border border-primary-100 dark:border-primary-800/30">
            漫画平台
          </span>
          <span className="inline-block px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-full text-xs text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-800/30">
            技术社区
          </span>
        </div>
      </div>

      {/* ===== 分割装饰 ===== */}
      <div className="flex items-center justify-center gap-3 text-secondary/30">
        <div className="h-px w-12 bg-pink-200 dark:bg-pink-800/30" />
        <span className="text-xs tracking-widest">✦ ✦ ✦</span>
        <div className="h-px w-12 bg-pink-200 dark:bg-pink-800/30" />
      </div>

      {/* ===== 两栏卡片：项目简介 + 主创链接 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {/* 项目简介 */}
        <div className="bg-card-soft/80 dark:bg-card-soft/60 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 dark:border-pink-900/20 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-pink-400" />
            <h3 className="font-semibold text-foreground">网站简介</h3>
          </div>
          <p className="text-sm text-secondary leading-relaxed">
            AA2L图书馆是一个生图参数与 AIGC 漫画阅览平台。
            致力于为创作者 &amp; AIGC 研究者提供技术参考，以及展示社内作品。
            网站生态将作为插件 / 节点并入 Gradio UI / ComfyUI。
          </p>
        </div>

        {/* ===== 主创链接（按钮跳转） ===== */}
        <div className="bg-card-soft/80 dark:bg-card-soft/60 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 dark:border-pink-900/20 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold text-foreground">作者链接</h3>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href="https://space.bilibili.com/282195761"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between px-4 py-2 bg-pink-50 dark:bg-pink-900/10 rounded-lg text-sm text-secondary hover:bg-pink-100 dark:hover:bg-pink-900/30 transition border border-pink-100/50 dark:border-pink-900/20 group"
            >
              <span>Bilibili</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition" />
            </a>
            <a
              href="https://github.com/aa2l"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between px-4 py-2 bg-pink-50 dark:bg-pink-900/10 rounded-lg text-sm text-secondary hover:bg-pink-100 dark:hover:bg-pink-900/30 transition border border-pink-100/50 dark:border-pink-900/20 group"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition" />
            </a>
            <a
              href="https://www.pixiv.net/users/51042793"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between px-4 py-2 bg-pink-50 dark:bg-pink-900/10 rounded-lg text-sm text-secondary hover:bg-pink-100 dark:hover:bg-pink-900/30 transition border border-pink-100/50 dark:border-pink-900/20 group"
            >
              <span>Pixiv</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition" />
            </a>
          </div>
        </div>
      </div>

      {/* ===== 贡献者区域 ===== */}
      <div className="bg-card-soft/80 dark:bg-card-soft/60 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 dark:border-pink-900/20 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-pink-400" />
          <h3 className="font-semibold text-foreground">贡献者</h3>
          <span className="text-xs text-secondary/50 ml-auto">—— 吃水不忘挖井人</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {contributors.map((person) => (
            <div
              key={person.name}
              className="text-center group transition hover:-translate-y-0.5 duration-200"
            >
              <div className="w-14 h-14 mx-auto rounded-full overflow-hidden bg-pink-50/50 dark:bg-pink-900/10 border-2 border-pink-100 dark:border-pink-900/20 group-hover:border-pink-300 dark:group-hover:border-pink-600 transition flex items-center justify-center">
                {person.avatar ? (
                  <img
                    src={BASE_PATH + person.avatar}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl opacity-40">👤</span>
                )}
              </div>
              <p className="text-sm font-medium text-foreground mt-1.5">{person.name}</p>
              <p className="text-xs text-secondary">{person.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 底部：1121 学社简介（领域卡片网格） ===== */}
      <div className="text-center py-6 bg-gradient-to-r from-pink-50/30 to-primary-50/30 dark:from-pink-900/10 dark:to-primary-900/10 rounded-2xl border border-pink-100/50 dark:border-pink-900/20">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-sm text-secondary/80 font-medium">1121 学社 · 涉及领域</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 px-4 text-left">
          {domains.map((domain) => (
            <div
              key={domain.title}
              className="bg-card-soft/50 dark:bg-card-soft/30 rounded-xl px-4 py-3 border border-pink-100/30 dark:border-pink-900/10"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-pink-400">{domain.icon}</span>
                <span className="text-xs font-medium text-foreground">{domain.title}</span>
              </div>
              <p className="text-[11px] text-secondary/70 leading-relaxed">{domain.items}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-secondary/50 mt-4 tracking-wide">
          那么，欢迎各位 
        </p>
      </div>
    </div>
  );
}