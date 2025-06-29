// Process polyfill for browser environment
// This provides a minimal polyfill for the Node.js process object

declare global {
  interface Window {
    process: any;
  }
}

if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: {},
    nextTick: (callback: Function) => setTimeout(callback, 0),
    cwd: () => '/',
    platform: 'browser',
    version: 'v16.0.0',
    versions: {
      node: '16.0.0'
    },
    argv: [],
    pid: 1,
    title: 'browser',
    browser: true,
    stdout: {
      write: () => {}
    },
    stderr: {
      write: () => {}
    }
  };
}

// Also set global process for modules that check for it
if (typeof globalThis !== 'undefined' && !globalThis.process) {
  globalThis.process = window?.process || {
    env: {},
    nextTick: (callback: Function) => setTimeout(callback, 0),
    cwd: () => '/',
    platform: 'browser',
    version: 'v16.0.0',
    versions: {
      node: '16.0.0'
    },
    argv: [],
    pid: 1,
    title: 'browser',
    browser: true,
    stdout: {
      write: () => {}
    },
    stderr: {
      write: () => {}
    }
  };
}

export {};