# 研究文件：智慧選卡器

**日期**: 2026-01-15
**目的**: 解決技術選擇和實作方式的不確定性

## 研究主題

### 1. 網頁爬蟲解決方案（免費/低成本）

**決策**: 使用 CORS Proxy + 原生 JavaScript Fetch API

**理由**:
1. **零成本**: 使用免費的 CORS proxy 服務（如 `https://corsproxy.io/` 或 `https://api.allorigins.win/`）
2. **無需後端**: 純前端方案，直接在瀏覽器執行
3. **簡單實作**: 使用標準 Fetch API + DOM Parser 解析 HTML
4. **快速開發**: 符合 MVP 優先和快速迭代原則

**考慮的替代方案**:
- **ScraperAPI**（免費額度 1000 次/月）：需要註冊和 API key，增加複雜度
- **Puppeteer/Playwright**：需要後端伺服器，成本高，不符合簡捷原則
- **自建後端爬蟲**：開發成本高，部署需要伺服器，不符合零成本要求

**實作細節**:
```javascript
// 使用 CORS proxy 爬取網頁內容
async function fetchProductPage(url) {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  const data = await response.json();
  return data.contents; // HTML 內容
}
```

**限制與風險**:
- CORS proxy 服務可能不穩定或限速
- 電商平台可能封鎖 proxy IP
- 備案：準備 2-3 個備用 proxy 服務

---

### 2. 商品資訊提取策略

**決策**: 使用簡單的 DOM 選擇器 + 平台特定解析規則

**理由**:
1. **簡單有效**: 每個電商平台的商品頁面結構相對穩定
2. **可維護**: 規則集中在單一 JSON 設定檔，易於更新
3. **無需 AI**: 避免使用 NLP 或 AI API（成本高）

**平台解析規則範例**（儲存在 `data/platform-rules.json`）:
```json
{
  "shopee": {
    "domain": "shopee.tw",
    "selectors": {
      "name": ".product-title",
      "price": ".product-price",
      "image": ".product-image img"
    }
  },
  "momo": {
    "domain": "momo.com.tw",
    "selectors": {
      "name": ".prdName",
      "price": ".price",
      "image": ".prdMainPic img"
    }
  }
}
```

**考慮的替代方案**:
- **AI/ML 模型**：成本高，過度設計
- **正則表達式**：脆弱，難以維護
- **第三方產品資料 API**：可能需要付費，且涵蓋範圍有限

**容錯處理**:
- 若選擇器失效，顯示「無法解析此平台」訊息
- 提供使用者回報功能，收集失效案例

---

### 3. 跨平台商品匹配邏輯

**決策**: 使用簡單的關鍵字匹配 + 手動調整

**理由**:
1. **MVP 階段夠用**: 使用商品名稱的核心關鍵字（去除品牌、顏色等）
2. **實作簡單**: 字串相似度比對（Levenshtein Distance 或簡單的 includes()）
3. **避免過度設計**: 不使用複雜的語意分析或圖像識別

**實作邏輯**:
```javascript
function extractKeywords(productName) {
  // 移除品牌、顏色、尺寸等修飾詞
  // 保留核心商品類型關鍵字
  return productName
    .toLowerCase()
    .replace(/(\d+ml|\d+g|黑色|白色|大|小|新品)/g, '')
    .trim();
}

function matchProducts(sourceProduct, targetProducts) {
  const sourceKeywords = extractKeywords(sourceProduct.name);
  return targetProducts.filter(p => {
    const targetKeywords = extractKeywords(p.name);
    return targetKeywords.includes(sourceKeywords) ||
           sourceKeywords.includes(targetKeywords);
  });
}
```

**考慮的替代方案**:
- **商品條碼 (Barcode) 匹配**：理想但大部分網頁不提供
- **圖像識別**：成本高，需要 API 或 ML 模型
- **商品 ID 跨平台資料庫**：不存在此類免費資源

**限制**:
- 準確率可能 70-80%（MVP 階段可接受）
- 後續可透過使用者反饋優化匹配邏輯

---

### 4. 聯盟行銷連結生成

**決策**: 使用靜態 URL 模板 + 參數替換

**理由**:
1. **簡單直接**: 大部分聯盟平台提供標準 URL 格式
2. **無需 API**: 避免整合複雜的聯盟平台 API
3. **配置化**: 連結模板儲存在 JSON，易於更新

**聯盟連結模板範例**（`data/affiliate-links.json`）:
```json
{
  "shopee": {
    "template": "https://shope.ee/XXXXX?afid=YOUR_AFFILIATE_ID&utm_source=smart-card-selector",
    "params": {
      "productId": "XXXXX"
    }
  },
  "momo": {
    "template": "https://momo.dm/YOUR_AFFILIATE_ID?u=PRODUCT_URL",
    "params": {
      "productUrl": "PRODUCT_URL"
    }
  }
}
```

**實作函數**:
```javascript
function generateAffiliateLink(platform, productUrl) {
  const template = affiliateLinks[platform];
  return template.replace('PRODUCT_URL', encodeURIComponent(productUrl));
}
```

**考慮的替代方案**:
- **動態 API 生成**：增加複雜度，不必要
- **短網址服務**：可選，但非必要（可後續加入）

**注意事項**:
- 需要先申請各平台的聯盟會員資格
- MVP 階段可以先使用測試連結或空參數

---

### 5. 信用卡優惠資料來源與維護

**決策**: 手動維護靜態 JSON 檔案

**理由**:
1. **零成本**: 無需訂閱付費資料源
2. **完全控制**: 可自訂優惠格式和規則
3. **快速啟動**: 先整理 10-20 張常見信用卡優惠即可

**資料結構範例**（`data/credit-cards.json`）:
```json
[
  {
    "id": "cc001",
    "name": "玉山 Pi 拍錢包信用卡",
    "bank": "玉山銀行",
    "platforms": ["shopee", "momo", "pchome"],
    "benefits": {
      "type": "cashback",
      "rate": 5,
      "description": "指定通路 5% 回饋，每月上限 $500"
    },
    "applyLink": "https://affiliate-link.com/apply-pi-card",
    "conditions": "需綁定 Pi 拍錢包"
  }
]
```

**維護流程**:
1. 每月檢查一次各銀行官網
2. 更新優惠資訊到 JSON 檔案
3. 透過 Git commit 推送更新

**考慮的替代方案**:
- **爬取銀行官網**：結構複雜且易變動，不划算
- **第三方資料 API**：可能需付費，且涵蓋不完整
- **使用者眾包**：初期沒有使用者基礎

**擴充計畫**:
- 後續可開發簡易的後台編輯介面（仍使用靜態生成）
- 或整合 Google Sheets + GitHub Actions 自動更新

---

### 6. 前端 UI 框架選擇

**決策**: 原生 HTML/CSS + Vanilla JavaScript（無框架）

**理由**:
1. **零學習成本**: 團隊熟悉的基礎技術
2. **無建置工具**: 不需要 Webpack, Vite 等打包工具
3. **效能最佳**: 無額外框架載入負擔
4. **符合簡潔架構**: 避免不必要的抽象層

**UI 樣式方案**:
- 使用輕量級 CSS 框架（如 **Pico.css** 或 **Water.css**）
- 或使用 Tailwind CDN（無需建置）

**考慮的替代方案**:
- **React/Vue**：過度設計，需要建置工具
- **jQuery**：已過時，不必要的依賴
- **Web Components**：可考慮，但增加學習成本

---

### 7. 部署方案

**決策**: GitHub Pages（免費靜態網站託管）

**理由**:
1. **完全免費**: 無需任何費用
2. **自動部署**: Git push 即自動更新
3. **自訂網域**: 可綁定自己的域名
4. **穩定可靠**: GitHub 基礎設施

**部署流程**:
1. 將專案推送到 GitHub repository
2. 啟用 GitHub Pages（設定 branch: main, folder: root）
3. 訪問 `https://username.github.io/repo-name`

**考慮的替代方案**:
- **Netlify/Vercel**: 功能更多，但 GitHub Pages 已足夠
- **Firebase Hosting**: 需要 Google 帳號設定，較複雜
- **自架伺服器**: 成本高，違反零成本原則

---

## 技術決策總結

| 項目 | 選擇 | 成本 | 符合原則 |
|------|------|------|----------|
| 爬蟲方案 | CORS Proxy + Fetch API | 免費 | ✅ MVP 優先、簡潔架構 |
| 商品匹配 | 關鍵字比對 | 免費 | ✅ 簡捷、快速迭代 |
| 聯盟連結 | 靜態模板 | 免費 | ✅ 簡潔架構 |
| 信用卡資料 | 手動維護 JSON | 免費 | ✅ MVP 優先 |
| 前端框架 | Vanilla JS | 免費 | ✅ 簡潔架構 |
| 部署方案 | GitHub Pages | 免費 | ✅ 零成本 |

**總計成本**: $0（完全免費）

---

## 風險與緩解策略

### 風險 1: CORS Proxy 不穩定
**緩解**: 準備 3 個備用 proxy 服務，實作自動切換邏輯

### 風險 2: 電商平台封鎖爬蟲
**緩解**:
- 加入 User-Agent 模擬真實瀏覽器
- 限制請求頻率（避免過度爬取）
- 提供手動輸入商品資訊作為備案

### 風險 3: 平台 HTML 結構變更
**緩解**:
- 設計易於更新的選擇器規則檔案
- 監控解析失敗率，及時調整
- 使用者回報系統收集問題

### 風險 4: 信用卡優惠過時
**緩解**:
- 在 UI 標註資料更新日期
- 提供「資料可能過時」免責聲明
- 建立每月更新流程

---

## 下一步行動

1. ✅ 完成技術決策
2. ➡️ 進入階段 1：設計資料模型
3. ➡️ 定義 API 合約（前端內部模組介面）
4. ➡️ 撰寫快速入門指南
