# 🛒 智慧選卡器

一款純前端網頁應用程式，幫助您找到最划算的購物方案。輸入商品網址，自動比較多平台價格，並推薦最優惠的信用卡組合。

## ✨ 功能特色

### 📊 多平台價格比較
- 支援蝦皮購物、momo購物網、PChome 24h購物
- 並行爬取價格，快速顯示結果
- 自動標示最便宜的平台
- 生成聯盟行銷連結

### 💳 信用卡優惠推薦
- 智慧計算信用卡回饋金額
- 考慮回饋率上限和過期日期
- 按優惠金額排序推薦
- 顯示可省金額和實付價格
- 直接導向銀行申辦頁面

### 👑 最佳方案顯示
- 自動計算所有「平台 + 信用卡」組合
- 找出最終實付價格最低的方案
- 醒目的視覺設計，一目了然
- 完整的價格明細展示
- 一鍵購買和申辦

## 🚀 快速開始

### 線上使用

直接開啟網頁即可使用，無需安裝：

```bash
# 使用 Python 啟動本地伺服器
python3 -m http.server 8000

# 或使用 Node.js
npx http-server
```

然後在瀏覽器中開啟 `http://localhost:8000`

### 部署到 GitHub Pages

1. Fork 此專案到您的 GitHub 帳號
2. 前往 Settings > Pages
3. 選擇 main 分支作為來源
4. 儲存後即可透過 `https://your-username.github.io/sdd_card-selector/` 訪問

## 📖 使用方式

1. **貼上商品連結**
   - 複製蝦皮、momo 或 PChome 的商品網址
   - 貼到輸入框中
   - 點擊「開始比價」按鈕

2. **查看價格比較**
   - 系統會顯示各平台的價格
   - 最便宜的選項會標示「最划算」標記
   - 點擊「前往購買」即可跳轉到該平台

3. **查看信用卡推薦**
   - 系統會自動推薦適用的信用卡
   - 顯示回饋率、可省金額和實付價格
   - 點擊「立即申辦」可前往銀行官網

4. **查看最佳方案**
   - 頂部會顯示最划算的「平台 + 信用卡」組合
   - 包含完整的價格明細
   - 提供一鍵購買和申辦按鈕

## 🏗️ 技術架構

### 前端技術
- **HTML5** - 網頁結構
- **CSS3** - 樣式設計（漸層、動畫、響應式）
- **Vanilla JavaScript** - 核心邏輯（無框架）

### 資料儲存
- **LocalStorage** - 查詢記錄
- **靜態 JSON** - 設定檔案（信用卡、平台規則、聯盟模板）

### 爬蟲方案
- **CORS Proxy** - 跨域爬取價格
- **自動切換機制** - 多個 proxy 備援
- **模擬資料** - MVP 階段使用

### 零成本部署
- **GitHub Pages** - 免費靜態網站託管
- **無需後端** - 純前端運行
- **無需資料庫** - 使用 JSON 檔案

## 📁 專案結構

```
sdd_card-selector/
├── index.html              # 主頁面
├── app.js                  # 主應用程式邏輯
├── styles.css              # 樣式表
├── data/                   # 資料檔案
│   ├── credit-cards.json   # 信用卡資料
│   ├── platform-rules.json # 平台解析規則
│   └── affiliate-links.json# 聯盟連結模板
├── specs/                  # 設計文件
│   └── 001-smart-card-selector/
│       ├── spec.md         # 功能規格
│       ├── plan.md         # 實作計畫
│       ├── tasks.md        # 任務清單
│       └── ...
└── README.md               # 本檔案
```

## 🔧 開發指南

### 新增信用卡

編輯 `data/credit-cards.json`：

```json
{
  "id": "cc006",
  "name": "新卡片名稱",
  "bank": "銀行名稱",
  "platforms": ["shopee", "momo", "pchome"],
  "benefits": {
    "type": "cashback",
    "rate": 3.5,
    "maxAmount": 500,
    "description": "指定通路 3.5% 回饋"
  },
  "applyUrl": "https://...",
  "conditions": "活動條件",
  "expiryDate": "2026-12-31"
}
```

### 新增平台支援

1. 編輯 `data/platform-rules.json` 新增平台規則
2. 更新 `app.js` 中的 `SUPPORTED_PLATFORMS` 陣列
3. 在 `data/affiliate-links.json` 新增聯盟連結模板

### 修改樣式

所有樣式都在 `styles.css` 中：
- CSS 變數定義在 `:root`
- 使用 BEM 命名規範
- 完整的響應式支援（768px、480px 斷點）

## 🎯 核心模組

### ConfigLoader
載入設定檔案（信用卡、平台規則、聯盟模板）

### ProductParser
解析商品 URL，識別平台和提取商品資訊

### PriceFetcher
並行爬取多平台價格（目前使用模擬資料）

### CreditCardMatcher
計算信用卡優惠，找出最佳推薦

### DealCalculator
計算所有「平台 + 信用卡」組合，找出最佳方案

### UIRenderer
渲染所有 UI 元件（價格比較、信用卡推薦、最佳方案）

### StorageManager
管理 LocalStorage 的查詢記錄

### ProxyManager
管理 CORS proxy，自動切換和重試機制

## 📝 開發狀態

### ✅ 已完成功能

- [x] 階段 1：專案設定
- [x] 階段 2：基礎設施
- [x] 階段 3：使用者故事 1 - 價格比較
- [x] 階段 4：使用者故事 2 - 信用卡推薦
- [x] 階段 5：使用者故事 3 - 最佳方案顯示
- [x] 階段 6：潤色與優化

### 🚧 未來改進

- [ ] 真實爬蟲實作（目前使用模擬資料）
- [ ] 商品名稱和圖片爬取
- [ ] 價格歷史追蹤
- [ ] 使用者偏好設定
- [ ] 社群分享功能
- [ ] PWA 支援（離線使用）

## 📄 授權

MIT License

## 🙏 致謝

- 使用 Claude Code 開發
- 遵循 MVP 優先原則
- 採用純前端零成本架構

## 📞 聯絡方式

如有問題或建議，歡迎開 Issue 或 Pull Request！
