# 📝 チェックリスト管理アプリケーション

Google Apps Script（GAS）と Google スプレッドシートで構築された、軽量な Web ベースのチェックリスト管理アプリです。  
日々のタスクや定期的なチェック項目をシンプルに管理できます。

---

## 📘 概要

このアプリケーションは Google スプレッドシートをデータベースとして使用し、GAS の HTML Service を利用して Web UI を提供する、個人または小規模チーム向けの軽量なチェックリスト管理ツールです。

---

## 🔑 特徴と使用技術

### 🧩 使用技術

| 技術 | 役割 |
| :--- | :--- |
| **Google Apps Script (GAS)** | CRUD 処理と HTML 描画を担当するバックエンド |
| **Google スプレッドシート** | 設定項目と履歴データの保存先 |
| **HTML / CSS / JavaScript** | フロントエンド UI の実装 |

---

## 🛠 コア機能

アプリケーションは主に次の 3 つの画面で構成されています。

### 1. **新規登録**
- 日付を選択し、チェック項目を入力  
- 任意のメモを追加  
- 入力内容を履歴シートに保存  

### 2. **履歴**
- これまでの入力履歴を一覧表示  
- 個別の記録を編集・削除  
- 編集モーダルで日付・メモ・項目の状態を変更可能  

### 3. **項目設定**
- チェック項目の名前を自由に設定  
- 項目は設定シートに保存  
- 更新された項目は「新規登録」画面に自動反映  

---

## ✔️ 現在の状態（解決済みの問題）

### 1. **GAS HTML Service における構文エラー**
CSS が正しく読み込まれず、JavaScript と誤認されてしまう問題を修正しました。

### 2. **編集時のデータ整合性の問題**
履歴データを編集すると、すべてのチェック項目が未選択になる不具合を修正。  
フロントエンドとバックエンド間で固有の項目 ID が正しく渡されるよう改善しました。

---

## 📄 ライセンス

MIT License.

---

## 🙌 謝辞

このプロジェクトをご覧いただきありがとうございます。  
改善案や提案があればお気軽にお知らせください。

---
---
---

# 📝 Checklist Management Application

A lightweight web-based checklist manager built with **Google Apps Script (GAS)** and **Google Sheets**.  
This application provides a simple and efficient way to manage daily or recurring checklist tasks.

---

## 📘 Overview

This application uses a Google Sheet as its backend database and a GAS-powered HTML interface to provide an intuitive and lightweight checklist management tool for personal or small-team use.

---

## 🔑 Key Features and Technologies

### 🧩 Technologies Used

| Technology | Role |
| :--- | :--- |
| **Google Apps Script (GAS)** | Backend logic for CRUD operations and HTML rendering |
| **Google Sheets** | Database for configuration and history data |
| **HTML / CSS / JavaScript** | Frontend UI implementation |

---

## 🛠 Core Functionality

The application consists of three main views:

### 1. **New Entry**
- Select a date and complete the current checklist items  
- Add an optional memo  
- Save the entry to the History sheet  

### 2. **History**
- View all previously submitted entries  
- Edit or delete specific records  
- Edit modal allows modifying the date, memo, and item statuses  

### 3. **Settings**
- Configure checklist item names  
- Items are stored in a configuration sheet  
- Updated items automatically appear in the “New Entry” screen  

---

## ✔️ Current Status (Resolved Issues)

### 1. **Syntax Error in GAS HTML Service**
Fixed an issue where CSS was misinterpreted as JavaScript due to an incorrect file inclusion method.

### 2. **Data Consistency Fix**
Resolved a bug in which editing a history record caused all checklist items to become unchecked.  
The system now correctly passes unique item IDs between the frontend and the backend.

---

## 📄 License

MIT License.

---

## 🙌 Acknowledgements

Thank you for checking out this project!  
Contributions and suggestions are welcome.
