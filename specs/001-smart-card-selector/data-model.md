# 資料模型：智慧選卡器

**日期**: 2026-01-15
**來源**: 從功能規格 (spec.md) 提取的實體

## 核心實體

### 1. Product（商品）

**用途**: 代表使用者查詢的商品

**欄位**:
- `id` (string): 唯一識別碼（使用時間戳 + 隨機數）
- `name` (string): 商品名稱
- `originalUrl` (string): 使用者輸入的原始網址
- `sourcePlatform` (string): 來源平台（如 "shopee", "momo"）
- `category` (string, optional): 商品類別（如 "3C", "美妝"）
- `keywords` (string[]): 提取的關鍵字（用於跨平台匹配）
- `createdAt` (timestamp): 查詢時間

**驗證規則**:
- `name`: 必填，長度 1-200 字元
- `originalUrl`: 必填，必須為有效 URL
- `sourcePlatform`: 必填，必須是支援的平台之一

**範例**:
```json
{
  "id": "prod_1705123456789_xyz",
  "name": "iPhone 15 Pro 256GB",
  "originalUrl": "https://shopee.tw/product/123456",
  "sourcePlatform": "shopee",
  "category": "3C",
  "keywords": ["iPhone", "15", "Pro", "256GB"],
  "createdAt": 1705123456789
}
```

---

### 2. PlatformPrice（平台價格）

**用途**: 代表某個電商平台上該商品的售價資訊

**欄位**:
- `id` (string): 唯一識別碼
- `productId` (string): 關聯的商品 ID
- `platform` (string): 平台名稱（如 "shopee", "momo", "pchome"）
- `platformProductUrl` (string): 該平台的商品頁面網址
- `price` (number): 價格（新台幣）
- `available` (boolean): 是否可購買
- `affiliateUrl` (string): 含聯盟追蹤參數的連結
- `imageUrl` (string, optional): 商品圖片網址
- `fetchedAt` (timestamp): 資料抓取時間

**關聯**:
- 多對一關聯到 `Product`（一個商品可能在多個平台有價格）

**驗證規則**:
- `price`: 必須 > 0
- `affiliateUrl`: 必須為有效 URL
- `available`: 預設為 true

**範例**:
```json
{
  "id": "price_1705123457000_abc",
  "productId": "prod_1705123456789_xyz",
  "platform": "momo",
  "platformProductUrl": "https://momo.com.tw/goods/123456",
  "price": 35900,
  "available": true,
  "affiliateUrl": "https://momo.dm/affiliate?u=...",
  "imageUrl": "https://cdn.momo.com/image.jpg",
  "fetchedAt": 1705123457000
}
```

---

### 3. CreditCard（信用卡優惠）

**用途**: 代表某張信用卡在特定平台的優惠資訊

**欄位**:
- `id` (string): 信用卡 ID（如 "cc001"）
- `name` (string): 信用卡名稱（如 "玉山 Pi 拍錢包信用卡"）
- `bank` (string): 發卡銀行
- `platforms` (string[]): 適用的平台列表
- `benefits` (object): 優惠資訊
  - `type` (string): 優惠類型（"cashback" | "discount" | "points"）
  - `rate` (number): 回饋率或折扣百分比
  - `maxAmount` (number, optional): 每月回饋上限（新台幣）
  - `description` (string): 優惠說明
- `applyUrl` (string): 辦卡聯盟連結
- `conditions` (string, optional): 適用條件說明
- `expiryDate` (string, optional): 優惠到期日（ISO 8601 格式）

**驗證規則**:
- `name`: 必填
- `platforms`: 至少包含一個平台
- `benefits.rate`: 0 < rate <= 100
- `applyUrl`: 必須為有效 URL

**範例**:
```json
{
  "id": "cc001",
  "name": "玉山 Pi 拍錢包信用卡",
  "bank": "玉山銀行",
  "platforms": ["shopee", "momo", "pchome"],
  "benefits": {
    "type": "cashback",
    "rate": 5,
    "maxAmount": 500,
    "description": "指定通路 5% 回饋，每月上限 $500"
  },
  "applyUrl": "https://affiliate-link.com/apply-pi-card",
  "conditions": "需綁定 Pi 拍錢包",
  "expiryDate": "2026-12-31"
}
```

---

### 4. BestDeal（最佳方案）

**用途**: 代表經過計算後的最優「平台 + 信用卡」組合

**欄位**:
- `id` (string): 方案 ID
- `productId` (string): 關聯的商品 ID
- `platform` (string): 推薦的購買平台
- `platformPriceId` (string): 對應的平台價格 ID
- `creditCardId` (string, optional): 推薦的信用卡 ID（可能為空）
- `originalPrice` (number): 原始價格
- `discount` (number): 折扣或回饋金額
- `finalPrice` (number): 最終實付價格
- `savings` (number): 節省金額
- `calculatedAt` (timestamp): 計算時間

**關聯**:
- 關聯到 `Product`, `PlatformPrice`, `CreditCard`

**驗證規則**:
- `finalPrice` = `originalPrice` - `discount`
- `savings` >= 0
- `finalPrice` > 0

**範例**:
```json
{
  "id": "deal_1705123458000_def",
  "productId": "prod_1705123456789_xyz",
  "platform": "momo",
  "platformPriceId": "price_1705123457000_abc",
  "creditCardId": "cc001",
  "originalPrice": 35900,
  "discount": 1795,
  "finalPrice": 34105,
  "savings": 1795,
  "calculatedAt": 1705123458000
}
```

---

## 衍生實體（設定檔）

### 5. PlatformRule（平台解析規則）

**用途**: 儲存各電商平台的 HTML 解析規則

**檔案位置**: `data/platform-rules.json`

**結構**:
```json
{
  "shopee": {
    "domain": "shopee.tw",
    "selectors": {
      "name": ".product-title",
      "price": ".product-price",
      "image": ".product-image img"
    }
  }
}
```

---

### 6. AffiliateTemplate（聯盟連結模板）

**用途**: 儲存各平台的聯盟連結格式

**檔案位置**: `data/affiliate-links.json`

**結構**:
```json
{
  "shopee": {
    "template": "https://shope.ee/{productId}?afid={affiliateId}",
    "params": {
      "affiliateId": "YOUR_AFFILIATE_ID"
    }
  }
}
```

---

## 資料流與狀態轉換

### 使用者查詢流程

1. **輸入階段**: 使用者輸入商品 URL
   - 建立 `Product` 實體
   - 解析來源平台和商品資訊

2. **爬取階段**: 系統爬取多平台價格
   - 為每個平台建立 `PlatformPrice` 實體
   - 標記爬取成功/失敗狀態

3. **匹配階段**: 查詢信用卡優惠
   - 從 `CreditCard` 資料中篩選適用的卡片
   - 計算每個組合的實付價格

4. **計算階段**: 產生最佳方案
   - 建立 `BestDeal` 實體
   - 排序並選出最優方案

5. **展示階段**: 渲染結果給使用者
   - 顯示價格比較清單
   - 顯示信用卡推薦
   - 顯示最佳組合

### 資料持久化策略

**LocalStorage 儲存**:
- `recentSearches`: 最近查詢記錄（最多 10 筆）
- `favoriteDeals`: 使用者收藏的方案（未來功能）

**靜態檔案載入**:
- `credit-cards.json`: 啟動時載入所有信用卡資料
- `platform-rules.json`: 啟動時載入解析規則
- `affiliate-links.json`: 啟動時載入聯盟模板

---

## 資料驗證與錯誤處理

### 必要的驗證函數

```javascript
function validateProduct(product) {
  if (!product.name || product.name.length < 1) {
    throw new Error('商品名稱不可為空');
  }
  if (!isValidUrl(product.originalUrl)) {
    throw new Error('無效的商品網址');
  }
  if (!supportedPlatforms.includes(product.sourcePlatform)) {
    throw new Error('不支援的平台');
  }
}

function validatePrice(price) {
  if (price <= 0) {
    throw new Error('價格必須大於 0');
  }
}

function validateCreditCard(card) {
  if (!card.name || card.platforms.length === 0) {
    throw new Error('信用卡資料不完整');
  }
  if (card.benefits.rate <= 0 || card.benefits.rate > 100) {
    throw new Error('回饋率必須在 0-100 之間');
  }
}
```

---

## 資料庫 Schema（未來擴充）

若未來需要後端資料庫，可使用以下 Schema：

### Products Table
```sql
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  original_url TEXT NOT NULL,
  source_platform VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  keywords JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Platform_Prices Table
```sql
CREATE TABLE platform_prices (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id),
  platform VARCHAR(50) NOT NULL,
  platform_product_url TEXT,
  price DECIMAL(10, 2) NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  affiliate_url TEXT,
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Credit_Cards Table
```sql
CREATE TABLE credit_cards (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  bank VARCHAR(50) NOT NULL,
  platforms JSON NOT NULL,
  benefits JSON NOT NULL,
  apply_url TEXT NOT NULL,
  conditions TEXT,
  expiry_date DATE
);
```

**注意**: MVP 階段不實作資料庫，僅使用 LocalStorage 和靜態 JSON。
