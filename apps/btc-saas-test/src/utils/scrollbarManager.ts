/**
 * 滚动条激活类管理工具
 * 主要用于Firefox的滚动条状态管理
 */

// 为滚动容器绑定激活类
export function wireActiveClass(el: HTMLElement) {
  let timeoutId: number;
  
  const onEnter = () => el.classList.add('is-active');
  const onLeave = () => el.classList.remove('is-active');
  const onScroll = () => {
    el.classList.add('is-active');
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => el.classList.remove('is-active'), 350);
  };
  
  el.addEventListener('mouseenter', onEnter);
  el.addEventListener('mouseleave', onLeave);
  el.addEventListener('scroll', onScroll, { passive: true });
  
  return () => {
    el.removeEventListener('mouseenter', onEnter);
    el.removeEventListener('mouseleave', onLeave);
    el.removeEventListener('scroll', onScroll);
    clearTimeout(timeoutId);
  };
}

// 初始化所有滚动容器
export function initScrollbars() {
  const scrollContainers = document.querySelectorAll('.cool-scrollbar');
  const cleanups: Array<() => void> = [];
  
  scrollContainers.forEach(container => {
    const el = container as HTMLElement;
    cleanups.push(wireActiveClass(el));
  });
  
  return cleanups;
}

// 自动初始化
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollbars);
  } else {
    initScrollbars();
  }
  
  // 监听动态添加的元素
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.classList.contains('cool-scrollbar')) {
              // 为新添加的滚动容器初始化
              const timeoutId = window.setTimeout(() => {
                const el = element as HTMLElement;
                wireActiveClass(el);
              }, 100);
            }
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
