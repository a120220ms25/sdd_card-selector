/**
 * Service Worker for 智慧選卡器
 * 提供離線支援和快取功能
 */

const CACHE_NAME = 'smart-card-selector-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/styles.css',
    '/manifest.json',
    '/data/credit-cards.json',
    '/data/platform-rules.json',
    '/data/affiliate-links.json'
];

// 安裝事件：快取靜態資源
self.addEventListener('install', (event) => {
    console.log('[Service Worker] 安裝中...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] 快取靜態資源');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('[Service Worker] 快取失敗:', error);
            })
    );
    self.skipWaiting();
});

// 啟動事件：清理舊快取
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] 啟動中...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] 刪除舊快取:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
    self.clients.claim();
});

// Fetch 事件：網路優先策略（動態內容），快取回退
self.addEventListener('fetch', (event) => {
    // 排除 CORS proxy 和外部 API 請求
    if (event.request.url.includes('allorigins.win') ||
        event.request.url.includes('corsproxy.io')) {
        return; // 不快取 CORS proxy 請求
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 克隆回應並存入快取
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                return response;
            })
            .catch(() => {
                // 網路失敗時，從快取取得
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('[Service Worker] 從快取提供:', event.request.url);
                            return cachedResponse;
                        }

                        // 如果快取中也沒有，返回離線頁面
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// 訊息事件：手動更新快取
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
