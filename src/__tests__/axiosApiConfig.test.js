import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import api, { axios as globalAxios, API_BASE_URL } from '../api/axios';

describe('Centralized Axios API Backend Routing Verification', () => {
  const expectedDomain = 'my-project-backend.ethiodeploy.app';
  const unexpectedDomain = 'khaam-poshak.vercel.app';

  // Mock in-memory localStorage for Node test runner
  let storage = {};
  const mockLocalStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, val) => { storage[key] = String(val); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { storage = {}; },
  };

  beforeEach(() => {
    storage = {};
    globalThis.localStorage = mockLocalStorage;
  });

  afterEach(() => {
    storage = {};
    vi.restoreAllMocks();
  });

  it('configures baseURL to point to the dedicated Laravel backend, not the Vercel frontend', () => {
    expect(API_BASE_URL).toContain(expectedDomain);
    expect(API_BASE_URL).not.toContain(unexpectedDomain);
    expect(api.defaults.baseURL).toBe('https://my-project-backend.ethiodeploy.app/api');
    expect(globalAxios.defaults.baseURL).toBe('https://my-project-backend.ethiodeploy.app/api');
  });

  it('normalizes relative /api/ paths to prevent duplicate /api/api/ segments in requests', async () => {
    const testConfig = {
      url: '/api/products',
      headers: {},
    };

    const interceptorHandler = api.interceptors.request.handlers[0].fulfilled;
    const transformedConfig = interceptorHandler(testConfig);

    expect(transformedConfig.url).toBe('/products');
  });

  it('normalizes root /api path cleanly to empty string', () => {
    const testConfig = {
      url: '/api',
      headers: {},
    };

    const interceptorHandler = api.interceptors.request.handlers[0].fulfilled;
    const transformedConfig = interceptorHandler(testConfig);

    expect(transformedConfig.url).toBe('');
  });

  it('leaves standard non-prefixed paths as-is', () => {
    const testConfig = {
      url: '/categories',
      headers: {},
    };

    const interceptorHandler = api.interceptors.request.handlers[0].fulfilled;
    const transformedConfig = interceptorHandler(testConfig);

    expect(transformedConfig.url).toBe('/categories');
  });

  it('attaches Sanctum Bearer token automatically from localStorage', () => {
    mockLocalStorage.setItem('flexi_token', 'test_sanctum_token_123');

    const testConfig = {
      url: '/api/customer/orders',
      headers: {},
    };

    const interceptorHandler = api.interceptors.request.handlers[0].fulfilled;
    const transformedConfig = interceptorHandler(testConfig);

    expect(transformedConfig.headers.Authorization).toBe('Bearer test_sanctum_token_123');
  });

  it('preserves absolute URLs for external services', () => {
    const testConfig = {
      url: 'https://images.unsplash.com/photo-example',
      headers: {},
    };

    const interceptorHandler = api.interceptors.request.handlers[0].fulfilled;
    const transformedConfig = interceptorHandler(testConfig);

    expect(transformedConfig.url).toBe('https://images.unsplash.com/photo-example');
  });
});
