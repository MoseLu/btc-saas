import { createApp, h } from 'vue';
import ThemeMirrorLayer from '@/components/ThemeMirrorLayer.vue';

function applyTheme(next: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', next === 'dark');
}

function origin(dir: 'tr' | 'bl') {
  return dir === 'tr' ? { cx: '100%', cy: '0%' } : { cx: '0%', cy: '100%' };
}

export function useThemeWaveSwitch() {
  let running = false;

  async function start(next: 'light' | 'dark', duration = 720) {
    if (running) return;
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    if (isDark === (next === 'dark')) return;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyTheme(next);
      return;
    }

    running = true;
    console.log('开始主题切换:', next, isDark ? 'dark->light' : 'light->dark');

    const mode: 'reveal' | 'conceal' = (!isDark && next === 'dark') ? 'reveal' : 'conceal';
    const o = mode === 'reveal' ? origin('tr') : origin('bl');

    // 创建镜像层
    const host = document.createElement('div');
    document.body.appendChild(host);
    const app = createApp({
      render: () => h(ThemeMirrorLayer, {
        nextTheme: next,
        origin: o,
        mode,
        duration
      })
    });
    app.mount(host);

    // 等动画完成
    await new Promise(r => setTimeout(r, duration));

    console.log('动画完成，切换主题');
    applyTheme(next);

    app.unmount();
    host.remove();

    running = false;
  }

  return { start };
}