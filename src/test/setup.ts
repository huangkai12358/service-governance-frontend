import { vi } from 'vitest';

/**
 * 创建内存版 localStorage，避免 Node 运行参数影响 jsdom 的存储实现。
 */
function createMemoryStorage(): Storage {
  let data: Record<string, string> = {};

  return {
    get length() {
      return Object.keys(data).length;
    },
    clear() {
      data = {};
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    key(index: number) {
      return Object.keys(data)[index] ?? null;
    },
    removeItem(key: string) {
      delete data[key];
    },
    setItem(key: string, value: string) {
      data[key] = value;
    }
  };
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: createMemoryStorage()
});

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: globalThis.localStorage
});

/**
 * 为组件测试补齐 jsdom 尚未完整实现的浏览器尺寸监听能力。
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});
