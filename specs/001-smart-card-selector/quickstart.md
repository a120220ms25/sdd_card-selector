# 快速入門指南：智慧選卡器

**版本**: 1.0.0
**日期**: 2026-01-15
**目標受眾**: 開發者

## 專案概述

智慧選卡器是一個純前端網頁應用，幫助使用者比較商品價格並推薦最優信用卡。特色：
- ✅ 零成本啟動（無需伺服器和資料庫）
- ✅ 純前端技術（HTML/CSS/JavaScript）
- ✅ 快速部署（GitHub Pages）

---

## 環境需求

### 開發環境
- 現代瀏覽器（Chrome, Firefox, Safari, Edge）
- 文字編輯器（VS Code 推薦）
- Git（用於版本控制）

### 無需安裝
- ❌ 不需要 Node.js
- ❌ 不需要套件管理器（npm/yarn）
- ❌ 不需要建置工具（Webpack/Vite）
- ❌ 不需要資料庫

---

## 專案結構

```
sdd_card_selector/
├── index.html              # 主頁面
├── styles.css              # 樣式表
├── app.js                  # 主應用邏輯
├── data/
│   ├── credit-cards.json      # 信用卡優惠資料
│   ├── platform-rules.json    # 平台解析規則
│   └── affiliate-links.json   # 聯盟連結模板
├── assets/
│   └── images/                # 圖示資源
├── specs/                     # 功能規格文件
└── README.md                  # 專案說明
```

---

## 快速開始（5 分鐘）

### 步驟 1: 下載專案

```bash
git clone https://github.com/your-username/sdd-card-selector.git
cd sdd-card-selector
```

### 步驟 2: 開啟網頁

**方法 A: 直接開啟檔案**
- 在檔案管理器中，雙擊 `index.html`
- 瀏覽器會自動開啟應用

**方法 B: 使用本地伺服器（推薦）**
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
然後訪問 `http://localhost:8000`

**方法 C: VS Code Live Server**
- 安裝 "Live Server" 擴充套件
- 右鍵點擊 `index.html` → "Open with Live Server"

### 步驟 3: 測試功能

1. 在輸入框貼上商品網址（例如蝦皮連結）
2. 點擊「開始比價」按鈕
3. 等待 5-10 秒，查看結果

---

## 開發工作流程

### 1. 修改信用卡資料

編輯 `data/credit-cards.json`，新增或更新信用卡優惠：

```json
{
  "id": "cc002",
  "name": "新的信用卡",
  "bank": "XX銀行",
  "platforms": ["shopee", "momo"],
  "benefits": {
    "type": "cashback",
    "rate": 3,
    "maxAmount": 300,
    "description": "全通路 3% 回饋"
  },
  "applyUrl": "https://your-affiliate-link.com",
  "conditions": "無門檻",
  "expiryDate": "2026-12-31"
}
```

儲存後，重新整理瀏覽器即可看到更新。

### 2. 新增支援的電商平台

編輯 `data/platform-rules.json`，新增平台解析規則：

```json
{
  "yahoo": {
    "domain": "tw.buy.yahoo.com",
    "selectors": {
      "name": ".product-name h1",
      "price": ".price-number",
      "image": ".product-image img"
    }
  }
}
```

並在 `app.js` 中的 `SUPPORTED_PLATFORMS` 陣列新增 `"yahoo"`。

### 3. 修改樣式

編輯 `styles.css`，自訂外觀：

```css
/* 修改主題色 */
:root {
  --primary-color: #ff6b6b;
  --secondary-color: #4ecdc4;
}

/* 修改按鈕樣式 */
.btn-primary {
  background-color: var(--primary-color);
  border-radius: 8px;
  /* 更多樣式... */
}
```

### 4. 除錯技巧

**開啟瀏覽器開發者工具**:
- Chrome/Edge: `F12` 或 `Ctrl+Shift+I`
- Firefox: `F12` 或 `Ctrl+Shift+I`
- Safari: `Cmd+Option+I`

**常用除錯方法**:
```javascript
// 在 app.js 中加入除錯訊息
console.log('商品資訊:', product);
console.error('爬取失敗:', error);
console.table(prices);  // 以表格顯示陣列
```

---

## 部署到 GitHub Pages（5 分鐘）

### 步驟 1: 建立 GitHub Repository

1. 登入 GitHub
2. 點擊 "New repository"
3. 輸入專案名稱：`smart-card-selector`
4. 選擇 "Public"
5. 點擊 "Create repository"

### 步驟 2: 推送程式碼

```bash
# 初始化 Git（如果尚未初始化）
git init

# 新增所有檔案
git add .

# 提交
git commit -m "初始化智慧選卡器專案"

# 連結到 GitHub
git remote add origin https://github.com/your-username/smart-card-selector.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

### 步驟 3: 啟用 GitHub Pages

1. 在 GitHub repository 頁面，點擊 "Settings"
2. 左側選單點擊 "Pages"
3. 在 "Source" 下拉選單選擇 "main" 分支
4. 資料夾選擇 "/ (root)"
5. 點擊 "Save"
6. 等待 1-2 分鐘，網站會自動部署

### 步驟 4: 訪問網站

網站網址：`https://your-username.github.io/smart-card-selector`

**後續更新流程**:
```bash
# 修改程式碼後
git add .
git commit -m "更新信用卡資料"
git push

# GitHub Pages 會自動重新部署（約 1 分鐘）
```

---

## 常見問題（FAQ）

### Q1: 為什麼爬蟲無法取得價格？

**可能原因**:
- CORS proxy 服務不穩定
- 電商平台封鎖了 proxy IP
- 平台 HTML 結構改變

**解決方法**:
1. 檢查瀏覽器 Console 的錯誤訊息
2. 嘗試更換 CORS proxy 服務（在 `app.js` 修改 `PROXY_URL`）
3. 更新 `data/platform-rules.json` 的選擇器

### Q2: 如何新增更多信用卡？

編輯 `data/credit-cards.json`，參考現有格式新增項目。必填欄位：
- `id`, `name`, `bank`, `platforms`, `benefits`, `applyUrl`

### Q3: 可以更換成其他 CSS 框架嗎？

可以！在 `index.html` 的 `<head>` 加入 CDN 連結：

```html
<!-- 使用 Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- 或使用 Bootstrap -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
```

### Q4: 如何申請聯盟行銷帳號？

各平台申請連結：
- **蝦皮**: [https://affiliate.shopee.tw/](https://affiliate.shopee.tw/)
- **momo**: [https://affiliate.momo.com.tw/](https://affiliate.momo.com.tw/)
- **信用卡**: 搜尋「{銀行名稱} 聯盟行銷」

申請後，將你的聯盟 ID 填入 `data/affiliate-links.json`。

### Q5: 網站載入很慢怎麼辦？

**優化建議**:
1. 壓縮圖片（使用 TinyPNG）
2. 減少爬取的平台數量（在 `app.js` 的 `DEFAULT_PLATFORMS` 調整）
3. 加入載入動畫，改善使用者體驗

---

## 進階設定

### 自訂 CORS Proxy

如果預設的 proxy 不穩定，可以更換：

```javascript
// 在 app.js 中修改
const PROXY_SERVICES = [
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/'
];

// 自動切換邏輯
let currentProxyIndex = 0;

function getProxyUrl() {
  return PROXY_SERVICES[currentProxyIndex];
}

function switchToNextProxy() {
  currentProxyIndex = (currentProxyIndex + 1) % PROXY_SERVICES.length;
}
```

### 加入 Google Analytics

在 `index.html` 的 `</head>` 前加入：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 自訂網域

在 GitHub Pages 設定中，可以綁定自己的網域：
1. 購買網域（如 Namecheap, GoDaddy）
2. 在 DNS 設定中新增 CNAME 記錄指向 `your-username.github.io`
3. 在 GitHub Pages 設定中輸入自訂網域
4. 等待 DNS 生效（可能需要幾小時）

---

## 開發路線圖（未來功能）

### MVP 完成後的優化方向

**階段 1: 穩定性提升**
- [ ] 加入更多備用 CORS proxy
- [ ] 改進商品匹配演算法
- [ ] 增加錯誤回報機制

**階段 2: 功能擴充**
- [ ] 支援更多電商平台（10+ 平台）
- [ ] 加入價格歷史追蹤
- [ ] 使用者收藏功能

**階段 3: 體驗優化**
- [ ] 響應式設計（手機版）
- [ ] 深色模式
- [ ] 分享功能（社群媒體）

**階段 4: 進階功能**
- [ ] 後端 API（若使用者增長需要）
- [ ] 使用者帳號系統
- [ ] 推薦演算法優化

---

## 取得協助

### 文件連結
- 功能規格：`specs/001-smart-card-selector/spec.md`
- 資料模型：`specs/001-smart-card-selector/data-model.md`
- API 合約：`specs/001-smart-card-selector/contracts/frontend-api.md`

### 回報問題
如遇到 bug 或有功能建議，請在 GitHub Issues 回報。

### 貢獻指南
歡迎貢獻！請遵循以下步驟：
1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/new-feature`)
3. 提交變更 (`git commit -m '新增某功能'`)
4. 推送分支 (`git push origin feature/new-feature`)
5. 開啟 Pull Request

---

## 授權

本專案採用 MIT 授權條款。詳見 LICENSE 檔案。
