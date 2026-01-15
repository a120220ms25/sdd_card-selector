# 前端模組 API 合約

**版本**: 1.0.0
**日期**: 2026-01-15
**說明**: 此文件定義前端各模組之間的介面合約（純前端應用，無後端 API）

## 模組架構

```
app.js
├── ProductParser      # 商品解析模組
├── PriceFetcher       # 價格爬取模組
├── CreditCardMatcher  # 信用卡匹配模組
├── DealCalculator     # 最佳方案計算模組
└── UIRenderer         # UI 渲染模組
```

---

## 1. ProductParser（商品解析模組）

### 1.1 parseProductUrl()

**用途**: 解析使用者輸入的商品 URL，提取平台和商品資訊

**輸入**:
```typescript
interface ParseProductUrlInput {
  url: string;  // 使用者輸入的商品網址
}
```

**輸出**:
```typescript
interface ParseProductUrlOutput {
  success: boolean;
  product?: {
    id: string;
    name: string;
    originalUrl: string;
    sourcePlatform: string;
    keywords: string[];
    createdAt: number;
  };
  error?: string;  // 錯誤訊息（若 success = false）
}
```

**錯誤情況**:
- 無效的 URL 格式
- 不支援的平台
- 無法解析商品資訊

**範例**:
```javascript
const result = await ProductParser.parseProductUrl({
  url: 'https://shopee.tw/product/123456'
});

if (result.success) {
  console.log(result.product.name);  // "iPhone 15 Pro 256GB"
} else {
  console.error(result.error);  // "不支援的平台"
}
```

---

## 2. PriceFetcher（價格爬取模組）

### 2.1 fetchPricesFromAllPlatforms()

**用途**: 爬取多個電商平台的商品價格

**輸入**:
```typescript
interface FetchPricesInput {
  product: Product;
  platforms: string[];  // 要查詢的平台列表（如 ["shopee", "momo", "pchome"]）
}
```

**輸出**:
```typescript
interface FetchPricesOutput {
  success: boolean;
  prices: PlatformPrice[];  // 成功爬取的價格列表
  errors: {
    platform: string;
    error: string;
  }[];  // 失敗的平台及錯誤訊息
}
```

**範例**:
```javascript
const result = await PriceFetcher.fetchPricesFromAllPlatforms({
  product: currentProduct,
  platforms: ['shopee', 'momo', 'pchome']
});

console.log(`成功爬取 ${result.prices.length} 個平台`);
console.log(`失敗 ${result.errors.length} 個平台`);
```

---

### 2.2 fetchSinglePlatform()

**用途**: 爬取單一平台的商品價格（內部函數）

**輸入**:
```typescript
interface FetchSinglePlatformInput {
  platform: string;
  productKeywords: string[];
}
```

**輸出**:
```typescript
interface FetchSinglePlatformOutput {
  success: boolean;
  price?: PlatformPrice;
  error?: string;
}
```

---

## 3. CreditCardMatcher（信用卡匹配模組）

### 3.1 findBestCards()

**用途**: 根據平台和價格，找出最適合的信用卡

**輸入**:
```typescript
interface FindBestCardsInput {
  platform: string;
  price: number;
}
```

**輸出**:
```typescript
interface FindBestCardsOutput {
  success: boolean;
  cards: {
    card: CreditCard;
    calculatedBenefit: {
      discountAmount: number;  // 實際折扣金額
      finalPrice: number;      // 使用此卡後的最終價格
      description: string;     // 優惠說明
    };
  }[];
}
```

**排序規則**:
- 依照 `finalPrice` 由低到高排序
- 相同價格時，依照 `discountAmount` 由高到低排序

**範例**:
```javascript
const result = CreditCardMatcher.findBestCards({
  platform: 'momo',
  price: 35900
});

result.cards.forEach(item => {
  console.log(`${item.card.name}: 省 $${item.calculatedBenefit.discountAmount}`);
});
```

---

### 3.2 calculateBenefit()

**用途**: 計算特定信用卡的實際優惠金額（內部函數）

**輸入**:
```typescript
interface CalculateBenefitInput {
  card: CreditCard;
  price: number;
}
```

**輸出**:
```typescript
interface CalculateBenefitOutput {
  discountAmount: number;
  finalPrice: number;
}
```

**計算邏輯**:
```javascript
function calculateBenefit(card, price) {
  let discount = 0;

  if (card.benefits.type === 'cashback') {
    discount = price * (card.benefits.rate / 100);
    if (card.benefits.maxAmount) {
      discount = Math.min(discount, card.benefits.maxAmount);
    }
  } else if (card.benefits.type === 'discount') {
    discount = price * (card.benefits.rate / 100);
  }

  return {
    discountAmount: Math.round(discount),
    finalPrice: price - discount
  };
}
```

---

## 4. DealCalculator（最佳方案計算模組）

### 4.1 calculateBestDeal()

**用途**: 計算所有「平台 + 信用卡」組合，找出最佳方案

**輸入**:
```typescript
interface CalculateBestDealInput {
  product: Product;
  prices: PlatformPrice[];
}
```

**輸出**:
```typescript
interface CalculateBestDealOutput {
  success: boolean;
  bestDeal?: BestDeal;
  allDeals: BestDeal[];  // 所有可能的組合，依最終價格排序
}
```

**計算流程**:
1. 對每個 `PlatformPrice`，查詢該平台適用的信用卡
2. 計算每個組合的最終價格
3. 排序並選出最優方案
4. 返回最佳方案 + 所有組合清單

**範例**:
```javascript
const result = DealCalculator.calculateBestDeal({
  product: currentProduct,
  prices: fetchedPrices
});

if (result.success) {
  console.log(`最佳方案：${result.bestDeal.platform} + ${result.bestDeal.creditCardId}`);
  console.log(`最終價格：$${result.bestDeal.finalPrice}`);
}
```

---

## 5. UIRenderer（UI 渲染模組）

### 5.1 renderPriceComparison()

**用途**: 渲染價格比較清單

**輸入**:
```typescript
interface RenderPriceComparisonInput {
  prices: PlatformPrice[];
}
```

**輸出**: 無（直接更新 DOM）

**渲染規則**:
- 依照價格由低到高排序
- 最便宜的項目標記為「最划算」
- 每個項目顯示：平台名稱、價格、「前往購買」按鈕

---

### 5.2 renderCreditCardRecommendations()

**用途**: 渲染信用卡推薦清單

**輸入**:
```typescript
interface RenderCreditCardRecommendationsInput {
  cards: {
    card: CreditCard;
    calculatedBenefit: {
      discountAmount: number;
      finalPrice: number;
      description: string;
    };
  }[];
}
```

**輸出**: 無（直接更新 DOM）

**渲染規則**:
- 顯示前 5 張最優惠的卡片
- 每張卡片顯示：卡片名稱、回饋金額、最終價格、「立即辦卡」按鈕

---

### 5.3 renderBestDeal()

**用途**: 渲染最佳方案區塊

**輸入**:
```typescript
interface RenderBestDealInput {
  bestDeal: BestDeal;
}
```

**輸出**: 無（直接更新 DOM）

**渲染規則**:
- 顯示在頁面頂部，醒目樣式
- 包含：平台名稱、信用卡名稱、原價、折扣、最終價格
- 同時提供「前往購買」和「立即辦卡」按鈕

---

## 6. StorageManager（資料儲存模組）

### 6.1 saveRecentSearch()

**用途**: 儲存最近查詢記錄到 LocalStorage

**輸入**:
```typescript
interface SaveRecentSearchInput {
  product: Product;
  timestamp: number;
}
```

**輸出**: 無

**儲存規則**:
- 最多保留 10 筆記錄
- 超過 10 筆時，移除最舊的記錄

---

### 6.2 getRecentSearches()

**用途**: 從 LocalStorage 讀取最近查詢記錄

**輸入**: 無

**輸出**:
```typescript
interface GetRecentSearchesOutput {
  searches: {
    product: Product;
    timestamp: number;
  }[];
}
```

---

## 7. ConfigLoader（設定載入模組）

### 7.1 loadCreditCards()

**用途**: 載入信用卡資料（從靜態 JSON 檔案）

**輸入**: 無

**輸出**:
```typescript
interface LoadCreditCardsOutput {
  success: boolean;
  cards: CreditCard[];
  error?: string;
}
```

---

### 7.2 loadPlatformRules()

**用途**: 載入平台解析規則

**輸入**: 無

**輸出**:
```typescript
interface LoadPlatformRulesOutput {
  success: boolean;
  rules: Record<string, PlatformRule>;
  error?: string;
}
```

---

### 7.3 loadAffiliateTemplates()

**用途**: 載入聯盟連結模板

**輸入**: 無

**輸出**:
```typescript
interface LoadAffiliateTemplatesOutput {
  success: boolean;
  templates: Record<string, AffiliateTemplate>;
  error?: string;
}
```

---

## 錯誤處理規範

所有模組的函數應遵循以下錯誤處理規範：

1. **不拋出例外**: 使用 `{ success: boolean, error?: string }` 格式返回錯誤
2. **錯誤訊息使用正體中文**: 便於直接顯示給使用者
3. **記錄錯誤**: 使用 `console.error()` 記錄詳細錯誤資訊
4. **優雅降級**: 部分功能失敗時，不影響其他功能

**範例**:
```javascript
async function someFunction() {
  try {
    // 執行操作
    return { success: true, data: result };
  } catch (error) {
    console.error('詳細錯誤:', error);
    return { success: false, error: '使用者友善的錯誤訊息' };
  }
}
```

---

## 效能考量

### 快取策略

- **信用卡資料**: 啟動時載入一次，儲存在記憶體中
- **平台規則**: 啟動時載入一次，儲存在記憶體中
- **價格資料**: 不快取（每次查詢都即時爬取）

### 並行處理

- **價格爬取**: 使用 `Promise.all()` 並行爬取多個平台
- **逾時控制**: 每個爬取請求設定 10 秒逾時

**範例**:
```javascript
async function fetchPricesFromAllPlatforms({ product, platforms }) {
  const promises = platforms.map(platform =>
    fetchSinglePlatform({ platform, productKeywords: product.keywords })
      .then(result => ({ platform, result }))
      .catch(error => ({ platform, error }))
  );

  const results = await Promise.allSettled(promises);
  // 處理結果...
}
```

---

## 測試合約（手動測試用）

每個模組完成後，應進行以下手動測試：

### ProductParser
- [ ] 測試 Shopee 網址解析
- [ ] 測試 momo 網址解析
- [ ] 測試無效網址錯誤處理

### PriceFetcher
- [ ] 測試爬取單一平台
- [ ] 測試並行爬取多平台
- [ ] 測試爬取失敗的容錯處理

### CreditCardMatcher
- [ ] 測試現金回饋計算
- [ ] 測試折扣計算
- [ ] 測試回饋上限邏輯

### DealCalculator
- [ ] 測試最佳方案計算
- [ ] 測試所有組合排序

### UIRenderer
- [ ] 測試價格清單渲染
- [ ] 測試信用卡推薦渲染
- [ ] 測試最佳方案區塊渲染
