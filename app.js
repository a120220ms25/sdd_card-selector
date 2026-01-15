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
    // 將在 T013 實作
};

// ============================================================================
// 模組：PriceFetcher - 價格爬取模組
// ============================================================================

const PriceFetcher = {
    // 將在 T014, T015 實作
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
    // 將在 T017, T025, T030 實作
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
 */
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');

    // 3 秒後自動隱藏
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
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
 * 表單提交處理（將在 T021 完整實作）
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const url = document.getElementById('productUrl').value;
    console.log('開始處理商品網址:', url);

    showLoading(true);
    showError('功能開發中...');
    showLoading(false);
}
