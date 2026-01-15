/**
 * 智慧選卡器 - 主應用程式
 * 純前端網頁應用，無需後端伺服器
 */

// ============================================================================
// 全域變數和常數
// ============================================================================

const SUPPORTED_PLATFORMS = ['shopee', 'momo', 'pchome'];
const DEFAULT_PLATFORMS = ['shopee', 'momo', 'pchome'];
const CORS_PROXIES = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
];
let currentProxyIndex = 0;

// 全域資料儲存
let creditCardsData = [];
let platformRulesData = {};
let affiliateTemplatesData = {};

// ============================================================================
// 模組：ConfigLoader - 設定載入模組
// ============================================================================

const ConfigLoader = {
    /**
     * 載入信用卡資料
     */
    async loadCreditCards() {
        try {
            const response = await fetch('data/credit-cards.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const cards = await response.json();
            creditCardsData = cards;
            return { success: true, cards };
        } catch (error) {
            console.error('載入信用卡資料失敗:', error);
            return { success: false, error: '無法載入信用卡資料' };
        }
    },

    /**
     * 載入平台解析規則
     */
    async loadPlatformRules() {
        try {
            const response = await fetch('data/platform-rules.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const rules = await response.json();
            platformRulesData = rules;
            return { success: true, rules };
        } catch (error) {
            console.error('載入平台規則失敗:', error);
            return { success: false, error: '無法載入平台規則' };
        }
    },

    /**
     * 載入聯盟連結模板
     */
    async loadAffiliateTemplates() {
        try {
            const response = await fetch('data/affiliate-links.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const templates = await response.json();
            affiliateTemplatesData = templates;
            return { success: true, templates };
        } catch (error) {
            console.error('載入聯盟模板失敗:', error);
            return { success: false, error: '無法載入聯盟模板' };
        }
    }
};

// ============================================================================
// 模組：StorageManager - 資料儲存模組
// ============================================================================

const StorageManager = {
    /**
     * 儲存最近查詢記錄
     */
    saveRecentSearch(product, timestamp) {
        try {
            const searches = this.getRecentSearches().searches || [];
            searches.unshift({ product, timestamp });

            // 只保留最近 10 筆
            const recentSearches = searches.slice(0, 10);

            localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        } catch (error) {
            console.error('儲存查詢記錄失敗:', error);
        }
    },

    /**
     * 讀取最近查詢記錄
     */
    getRecentSearches() {
        try {
            const data = localStorage.getItem('recentSearches');
            if (!data) {
                return { searches: [] };
            }
            return { searches: JSON.parse(data) };
        } catch (error) {
            console.error('讀取查詢記錄失敗:', error);
            return { searches: [] };
        }
    }
};

// ============================================================================
// 模組：ProductParser - 商品解析模組
// ============================================================================

const ProductParser = {
    /**
     * 解析商品 URL，提取平台和商品資訊
     * T013 實作
     */
    async parseProductUrl({ url }) {
        try {
            // 驗證 URL 格式
            let parsedUrl;
            try {
                parsedUrl = new URL(url);
            } catch (e) {
                return { success: false, error: '無效的網址格式' };
            }

            // 識別平台
            const hostname = parsedUrl.hostname.toLowerCase();
            let sourcePlatform = null;

            for (const platform of SUPPORTED_PLATFORMS) {
                const rule = platformRulesData[platform];
                if (rule && hostname.includes(rule.domain)) {
                    sourcePlatform = platform;
                    break;
                }
            }

            if (!sourcePlatform) {
                return {
                    success: false,
                    error: `不支援的平台。目前支援：蝦皮、momo、PChome`
                };
            }

            // 嘗試從 URL 提取商品名稱（簡化版，實際需要爬取頁面）
            // MVP 階段：使用 URL 路徑作為商品識別
            const pathParts = parsedUrl.pathname.split('/').filter(p => p);
            const productId = pathParts[pathParts.length - 1] || 'unknown';

            // 生成商品物件
            const product = {
                id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: `商品 ${productId.substr(0, 10)}`, // 暫時使用 ID，實際需爬取
                originalUrl: url,
                sourcePlatform: sourcePlatform,
                keywords: [productId], // 簡化版關鍵字
                createdAt: Date.now()
            };

            console.log('商品解析成功:', product);
            return { success: true, product };

        } catch (error) {
            console.error('解析商品 URL 失敗:', error);
            return { success: false, error: '解析商品資訊失敗' };
        }
    }
};

// ============================================================================
// 模組：PriceFetcher - 價格爬取模組
// ============================================================================

const PriceFetcher = {
    /**
     * 爬取單一平台的商品價格（內部函數）
     * T014 實作
     */
    async fetchSinglePlatform({ platform, productKeywords }) {
        try {
            console.log(`開始爬取平台: ${platform}`);

            // MVP 簡化版：模擬價格資料（實際需要使用 CORS proxy 爬取）
            // 真實實作需要使用 CORS proxy + HTML 解析
            const mockPrices = {
                shopee: Math.floor(Math.random() * 10000) + 20000,
                momo: Math.floor(Math.random() * 10000) + 22000,
                pchome: Math.floor(Math.random() * 10000) + 21000
            };

            // 模擬網路延遲
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

            const rule = platformRulesData[platform];
            if (!rule) {
                throw new Error(`找不到平台規則: ${platform}`);
            }

            // 生成價格物件
            const priceData = {
                id: `price_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                productId: null, // 將由調用方設定
                platform: platform,
                platformProductUrl: `${rule.urlPattern}product/${productKeywords[0]}`,
                price: mockPrices[platform] || 25000,
                available: true,
                affiliateUrl: null, // 將由 T016 生成
                imageUrl: null,
                fetchedAt: Date.now()
            };

            console.log(`${platform} 價格爬取成功:`, priceData.price);
            return { success: true, price: priceData };

        } catch (error) {
            console.error(`爬取 ${platform} 失敗:`, error);
            return { success: false, error: error.message };
        }
    },

    /**
     * 並行爬取多個平台的價格
     * T015 實作
     */
    async fetchPricesFromAllPlatforms({ product, platforms }) {
        console.log('開始並行爬取多個平台...', platforms);

        const fetchPromises = platforms.map(platform =>
            this.fetchSinglePlatform({
                platform,
                productKeywords: product.keywords
            }).then(result => ({
                platform,
                ...result
            }))
        );

        const results = await Promise.allSettled(fetchPromises);

        const prices = [];
        const errors = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.success) {
                const priceData = result.value.price;
                priceData.productId = product.id;
                prices.push(priceData);
            } else {
                const platform = platforms[index];
                const errorMsg = result.status === 'fulfilled'
                    ? result.value.error
                    : result.reason?.message || '未知錯誤';
                errors.push({ platform, error: errorMsg });
            }
        });

        console.log(`爬取完成: 成功 ${prices.length} 個，失敗 ${errors.length} 個`);

        return {
            success: prices.length > 0,
            prices,
            errors
        };
    }
};

// ============================================================================
// 模組：AffiliateLinkGenerator - 聯盟連結生成模組
// ============================================================================

const AffiliateLinkGenerator = {
    /**
     * 生成聯盟連結
     * T016 實作
     */
    generateAffiliateLink({ platform, productUrl }) {
        try {
            const template = affiliateTemplatesData[platform];
            if (!template) {
                console.warn(`找不到 ${platform} 的聯盟連結模板`);
                return productUrl; // 回退到原始網址
            }

            // 根據模板生成聯盟連結
            let affiliateUrl = template.template;

            // 替換 {productUrl} 占位符
            if (affiliateUrl.includes('{productUrl}')) {
                affiliateUrl = affiliateUrl.replace('{productUrl}', productUrl);
            }

            // 替換 {encodedProductUrl} 占位符
            if (affiliateUrl.includes('{encodedProductUrl}')) {
                affiliateUrl = affiliateUrl.replace('{encodedProductUrl}', encodeURIComponent(productUrl));
            }

            console.log(`生成 ${platform} 聯盟連結:`, affiliateUrl);
            return affiliateUrl;

        } catch (error) {
            console.error('生成聯盟連結失敗:', error);
            return productUrl; // 回退到原始網址
        }
    }
};

// ============================================================================
// 模組：CreditCardMatcher - 信用卡匹配模組
// ============================================================================

const CreditCardMatcher = {
    // 將在 T023, T024 實作
};

// ============================================================================
// 模組：DealCalculator - 最佳方案計算模組
// ============================================================================

const DealCalculator = {
    // 將在 T029 實作
};

// ============================================================================
// 模組：UIRenderer - UI 渲染模組
// ============================================================================

const UIRenderer = {
    /**
     * 渲染價格比較結果
     * T017 實作
     */
    renderPriceComparison({ product, prices }) {
        const section = document.getElementById('priceComparisonSection');
        if (!section) {
            console.error('找不到價格比較區塊');
            return;
        }

        // 清空區塊
        section.innerHTML = '<h2>價格比較</h2><div id="priceComparisonResults"></div>';

        const container = document.getElementById('priceComparisonResults');

        // 找出最低價格
        const lowestPrice = Math.min(...prices.map(p => p.price));

        // 為每個平台生成卡片
        prices.forEach(priceData => {
            const isCheapest = priceData.price === lowestPrice;

            // 生成聯盟連結
            const affiliateUrl = AffiliateLinkGenerator.generateAffiliateLink({
                platform: priceData.platform,
                productUrl: priceData.platformProductUrl
            });

            // 更新 priceData
            priceData.affiliateUrl = affiliateUrl;

            // 取得平台規則資料
            const platformRule = platformRulesData[priceData.platform];
            const platformName = platformRule ? platformRule.name : priceData.platform;

            // 建立卡片元素
            const card = document.createElement('div');
            card.className = `platform-card ${isCheapest ? 'cheapest' : ''}`;

            card.innerHTML = `
                ${isCheapest ? '<div class="cheapest-badge">最划算</div>' : ''}
                <h3 class="platform-name">${platformName}</h3>
                <div class="price-display">NT$ ${priceData.price.toLocaleString()}</div>
                <div class="card-actions">
                    <a href="${affiliateUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary">
                        前往購買
                    </a>
                </div>
            `;

            container.appendChild(card);
        });

        // 顯示結果區塊
        const resultsContainer = document.getElementById('resultsContainer');
        if (resultsContainer) {
            resultsContainer.classList.remove('hidden');
        }

        console.log('價格比較結果已渲染');
    }
};

// ============================================================================
// 應用程式初始化
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('智慧選卡器已載入');

    // 載入設定檔案
    const loadingTasks = [
        ConfigLoader.loadCreditCards(),
        ConfigLoader.loadPlatformRules(),
        ConfigLoader.loadAffiliateTemplates()
    ];

    const results = await Promise.all(loadingTasks);
    const allSuccess = results.every(r => r.success);

    if (!allSuccess) {
        console.error('部分設定檔案載入失敗');
        showError('系統初始化失敗，請重新整理頁面');
    } else {
        console.log('所有設定檔案載入成功');
    }

    // 綁定表單提交事件
    const form = document.getElementById('productForm');
    form.addEventListener('submit', handleFormSubmit);
});

// ============================================================================
// 輔助函數
// ============================================================================

/**
 * 顯示錯誤訊息
 * @param {string} message - 錯誤訊息
 * @param {number} duration - 顯示時長（毫秒），預設 5000
 */
function showError(message, duration = 5000) {
    const errorDiv = document.getElementById('errorMessage');
    if (!errorDiv) {
        console.error('找不到錯誤訊息容器');
        return;
    }

    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');

    // 自動隱藏
    if (duration > 0) {
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, duration);
    }
}

/**
 * 顯示載入指示器
 */
function showLoading(show = true) {
    const loadingDiv = document.getElementById('loadingIndicator');
    const submitBtn = document.getElementById('submitBtn');

    if (show) {
        loadingDiv.classList.remove('hidden');
        submitBtn.disabled = true;
    } else {
        loadingDiv.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

/**
 * 表單提交處理
 * T021 實作：整合主流程
 * T022 實作：錯誤處理
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const url = document.getElementById('productUrl').value.trim();

    // 驗證輸入
    if (!url) {
        showError('請輸入商品網址');
        return;
    }

    console.log('開始處理商品網址:', url);
    showLoading(true);

    try {
        // 步驟 1: 解析商品 URL
        console.log('步驟 1: 解析商品網址...');
        const parseResult = await ProductParser.parseProductUrl({ url });

        if (!parseResult.success) {
            showError(parseResult.error || '解析商品網址失敗');
            showLoading(false);
            return;
        }

        const product = parseResult.product;
        console.log('商品解析成功:', product);

        // 步驟 2: 爬取各平台價格
        console.log('步驟 2: 爬取各平台價格...');
        const platforms = DEFAULT_PLATFORMS.filter(p => p !== product.sourcePlatform);
        platforms.unshift(product.sourcePlatform); // 原平台放在第一個

        const fetchResult = await PriceFetcher.fetchPricesFromAllPlatforms({
            product,
            platforms
        });

        if (!fetchResult.success || fetchResult.prices.length === 0) {
            const errorMsg = fetchResult.errors && fetchResult.errors.length > 0
                ? `爬取價格失敗: ${fetchResult.errors.map(e => e.error).join(', ')}`
                : '無法取得任何平台的價格資訊';
            showError(errorMsg);
            showLoading(false);
            return;
        }

        console.log('價格爬取成功:', fetchResult.prices);

        // 顯示部分失敗的警告
        if (fetchResult.errors && fetchResult.errors.length > 0) {
            console.warn('部分平台爬取失敗:', fetchResult.errors);
            const failedPlatforms = fetchResult.errors.map(e => e.platform).join('、');
            showError(`注意：${failedPlatforms} 的價格無法取得`, 3000);
        }

        // 步驟 3: 渲染價格比較結果
        console.log('步驟 3: 渲染價格比較結果...');
        UIRenderer.renderPriceComparison({
            product,
            prices: fetchResult.prices
        });

        // 儲存到最近查詢
        StorageManager.saveRecentSearch(product, Date.now());

        console.log('流程完成！');

    } catch (error) {
        console.error('處理過程發生錯誤:', error);
        showError('系統錯誤，請稍後再試');
    } finally {
        showLoading(false);
    }
}
