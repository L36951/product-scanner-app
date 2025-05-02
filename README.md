# 📷 Product Scanner App (React Native + GPT)

The idea is not originated from me, just trying to build a similar application
這是一個可以分析商品圖片並以 JSON 回傳結構的 React Native App。

## 📥 測試 APK 下載

你可以直接下載 APK 安裝包並安裝在 Android 手機上：

👉 [點我下載 APK](https://expo.dev/accounts/l36951/projects/ProductDescriptionApp/builds/96746d88-c84c-44ce-b5ea-c1bbdd48c835)

⚠️ 安裝前請記得：

- 到手機 **設定 > 安全性** ➜ 啟用「允許未知來源」
- 點擊 APK 安裝後確認提示

## 🧠 使用方法

1. 到 [console.x.ai](https://console.x.ai) 註冊帳號
2. 在「API Keys」頁面建立一組 API 金鑰（每月提供 **免費 $150 USD 額度**）
3. 開啟 App，點擊右上角的選單圖示
4. 輸入你的 API Key 並儲存
5. 點擊「拍攝商品照片」或「從相簿選擇照片」
6. App 會將圖片傳送至 GPT 模型並顯示結構化的商品資訊（JSON 格式）

## 功能

- 使用者可拍照或從相簿選擇圖片
- 可自訂 prompt 與 GPT API 溝通
- 顯示 JSON 回傳結果於卡片介面

## 啟動方式

```bash
npm install
npx expo start
```
