/**
 * BTC Overlay 滚动条系统
 * 实现"原生隐藏 + 自绘覆盖条"的滚动条效果
 * 特点：只有一段加长的椭圆、没有轨道、没有两端限位器、悬浮/滚动才出现
 */

export interface OverlayScrollbarOptions {
  horizontal?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export class OverlayScrollbar {
  private el: HTMLElement;
  private bar: HTMLDivElement;
  private thumb: HTMLDivElement;
  private isHorizontal: boolean;
  private hideTimeout: number | null = null;
  private dragging = false;
  private startPos = 0;
  private startScroll = 0;
  private resizeObserver: ResizeObserver;

  constructor(el: HTMLElement, options: OverlayScrollbarOptions = {}) {
    this.el = el;
    this.isHorizontal = !!options.horizontal;
    
    // 创建覆盖条 DOM
    this.bar = document.createElement('div');
    this.bar.className = 'osbar' + (this.isHorizontal ? ' osbar--x' : '');
    
    this.thumb = document.createElement('div');
    this.thumb.className = 'osbar__thumb';
    this.bar.appendChild(this.thumb);
    this.el.appendChild(this.bar);

    // 绑定事件
    this.bindEvents();
    
    // 监听尺寸变化
    this.resizeObserver = new ResizeObserver(() => this.refresh());
    this.resizeObserver.observe(this.el);
    
    // 初始化
    this.refresh();
  }

  private getMinThumbSize(): number {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--os-min')) || 24;
  }

  private refresh(): void {
    const view = this.isHorizontal ? this.el.clientWidth : this.el.clientHeight;
    const scroll = this.isHorizontal ? this.el.scrollWidth : this.el.scrollHeight;
    const pos = this.isHorizontal ? this.el.scrollLeft : this.el.scrollTop;

    // 没有滚动就隐藏覆盖条
    if (scroll <= view + 1) {
      this.bar.style.display = 'none';
      return;
    }
    this.bar.style.display = '';

    const frac = view / scroll;
    const min = this.getMinThumbSize();
    const len = Math.max(min, Math.round(view * frac));
    const range = view - len;
    const start = range > 0 ? Math.round((pos / (scroll - view)) * range) : 0;

    if (this.isHorizontal) {
      this.thumb.style.width = `${len}px`;
      (this.thumb.style as any).left = `${start}px`;
      this.thumb.style.height = '';
      this.thumb.style.top = '';
    } else {
      this.thumb.style.height = `${len}px`;
      (this.thumb.style as any).top = `${start}px`;
      this.thumb.style.width = '';
      this.thumb.style.left = '';
    }
  }

  private onScroll = (): void => {
    this.el.classList.add('os-scrolling');
    this.refresh();
    
    if (this.hideTimeout) {
      cancelAnimationFrame(this.hideTimeout);
    }
    
    this.hideTimeout = window.setTimeout(() => {
      this.el.classList.remove('os-scrolling');
    }, 800) as unknown as number;
  };

  private onMouseDown = (ev: MouseEvent): void => {
    this.dragging = true;
    this.startPos = this.isHorizontal ? ev.clientX : ev.clientY;
    this.startScroll = this.isHorizontal ? this.el.scrollLeft : this.el.scrollTop;
    
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp, { once: true });
    ev.preventDefault();
  };

  private onMouseMove = (ev: MouseEvent): void => {
    if (!this.dragging) return;
    
    const view = this.isHorizontal ? this.el.clientWidth : this.el.clientHeight;
    const scroll = this.isHorizontal ? this.el.scrollWidth : this.el.scrollHeight;
    const cs = getComputedStyle(this.thumb);
    const len = this.isHorizontal ? parseFloat(cs.width) : parseFloat(cs.height);
    const range = Math.max(1, view - len);
    const deltaPx = (this.isHorizontal ? ev.clientX : ev.clientY) - this.startPos;
    const deltaFrac = deltaPx / range;
    const target = this.startScroll + deltaFrac * (scroll - view);
    
    if (this.isHorizontal) {
      this.el.scrollLeft = target;
    } else {
      this.el.scrollTop = target;
    }
  };

  private onMouseUp = (): void => {
    this.dragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
  };

  private bindEvents(): void {
    this.thumb.addEventListener('mousedown', this.onMouseDown);
    this.el.addEventListener('scroll', this.onScroll, { passive: true });
  }

  public destroy(): void {
    this.resizeObserver.disconnect();
    this.el.removeEventListener('scroll', this.onScroll);
    this.thumb.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    
    if (this.bar.parentNode) {
      this.bar.parentNode.removeChild(this.bar);
    }
  }

  public update(): void {
    this.refresh();
  }
}

/**
 * 便捷函数：为指定容器启用 overlay 滚动条
 */
export function enhanceOverlayScrollbar(
  el: HTMLElement, 
  options: OverlayScrollbarOptions = {}
): OverlayScrollbar {
  return new OverlayScrollbar(el, options);
}

/**
 * 批量启用：为所有 .scrollarea 容器启用 overlay 滚动条
 */
export function enhanceAllScrollbars(): OverlayScrollbar[] {
  const containers = document.querySelectorAll<HTMLElement>('.scrollarea');
  return Array.from(containers).map(el => enhanceOverlayScrollbar(el));
}

/**
 * 为侧栏容器启用 overlay 滚动条
 */
export function enhanceSidebarScrollbars(): OverlayScrollbar[] {
  const sidebars = document.querySelectorAll<HTMLElement>('.scrollarea--side');
  return Array.from(sidebars).map(el => enhanceOverlayScrollbar(el));
}

/**
 * 为主区域容器启用 overlay 滚动条
 */
export function enhanceMainScrollbars(): OverlayScrollbar[] {
  const mains = document.querySelectorAll<HTMLElement>('.scrollarea--main');
  return Array.from(mains).map(el => enhanceOverlayScrollbar(el));
}
