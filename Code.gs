// スプレッドシートIDを定数に設定
const SPREADSHEET_ID = 'ここにあなたのスプレッドシートIDを貼り付けます';
const CONFIG_SHEET_NAME = 'Config';
const DATA_SHEET_NAME = 'Data';

// ----------------------------------------------------
// 1. Webアプリの公開エントリーポイント (doGet)
// ----------------------------------------------------
function doGet() {
  // HTMLテンプレートを読み込み
  const template = HtmlService.createTemplateFromFile('Index');
  
  // HTMLをMIMEタイプを指定して表示（レスポンシブ対応のためビューポートを設定）
  return template.evaluate()
      .setTitle('チェックリスト管理')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

// ----------------------------------------------------
// 2. データ取得・保存関数（クライアントJSから呼び出される）
// ----------------------------------------------------

/**
 * 項目設定データ（マスター）を取得
 */
function getConfigItems() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  
  if (!sheet) {
      Logger.log('Config sheet not found.');
      return []; // 安全な空の配列
  }
  
  const range = sheet.getDataRange();
  // ヘッダー行のみ（1行以下）の場合は、空の配列を返す
  if (range.getNumRows() <= 1) { 
      return [];
  }
  
  const data = range.getValues().slice(1);
  console.log(`data: ${data}`);
  
  // 常に配列を返すように保証
  return data.map((row, index) => ({
    id: index + 1, 
    name: row[0] 
  })).filter(item => item.name && item.name.trim() !== '');
}

/**
 * 新しいチェックリストの登録
 * @param {Object} formData - 登録日, メモ, チェック状態を含むフォームデータ
 */
function saveChecklist(formData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(DATA_SHEET_NAME);
  
  const configItems = getConfigItems();
  const header = ['登録日', 'メモ'].concat(configItems.map(item => `Check_${item.id}`));
  
  // 登録する行データを作成
  let rowData = [
    formData.date,
    formData.memo
  ];
  
  // チェック状態をヘッダーの順番に合わせて追加
  configItems.forEach(item => {
    // formData.checksはIDの配列を想定
    rowData.push(formData.checks.includes(String(item.id)) ? '✔' : '');
  });
  
  sheet.appendRow(rowData);
  return { status: 'success', message: '登録が完了しました。' };
}

/**
 * 登録履歴の取得 (仕様: 登録順に表示)
 */
function getHistory() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(DATA_SHEET_NAME);
  
  if (!sheet) {
    // シートが見つからない場合は空の配列を返す
    Logger.log('Error: Data sheet not found.');
    return [];
  }
  
  // getDataRange()の挙動により、データがない場合もgetValues()は[['']]などを返すため、
  // ヘッダー行を除去する前に、データ行が存在するかを確認します。
  const allValues = sheet.getDataRange().getValues();
  
  // データがヘッダー行しかない、または空の場合は、空の配列を返す
  if (allValues.length <= 1) {
      return [];
  }
  
  // 1行目をヘッダーとして除外し、残りの行をrowsとする
  const rows = allValues.slice(1);
  
  // 履歴データと設定項目を組み合わせて、扱いやすい形式でクライアントに返す
  // ここでrowsは必ず配列であり、要素を持っているか、空配列のいずれかであるため、
  // .map()の呼び出しは安全です。
  const configItems = getConfigItems();
  
  // 【必須のチェック】configItemsが配列であり、要素を持っているか確認
  if (!Array.isArray(configItems) || configItems.length === 0) {
      Logger.log('Error: Config items not loaded or empty.');
      // 履歴データを正しく作成できないため、空の配列を返す
      return []; 
  }
  
  return rows.map((row, rowIndex) => {
      
      // 【修正点1】日付データを row[0] から取得し、Dateオブジェクトかチェックして文字列に変換する
      const dateValue = row[0]; 
      const safeDate = dateValue instanceof Date ? dateValue.toISOString() : dateValue;
      
      // 【修正点2】メモデータを row[1] から取得し、nullやundefinedを空文字列に変換する
      const memoValue = row[1];
      const safeMemo = String(memoValue ?? '');
      
      const historyEntry = {
        rowNumber: rowIndex + 2,
        date: safeDate, // 安全な日付文字列を使用
        memo: safeMemo, // 安全なメモ文字列を使用
        checks: []
      };
      
      // Configで定義されたチェック項目と状態を結合
      const configItems = getConfigItems();
      configItems.forEach((item, index) => {
        // Dataシートは登録日, メモの次からチェック項目が並ぶ
        const checkValue = row[2 + index]; 
        historyEntry.checks.push({
          id: item.id,
          name: item.name,
          isChecked: checkValue === '✔'
        });
      });
      return historyEntry;
  });
  // }).filter(entry => entry !== null); // nullを返した不正なデータをフィルタリング
}

/**
 * 項目設定の保存
 * @param {Array<string>} itemNames - 新しい項目名の配列
 */
function saveConfigItems(itemNames) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    
    // データクリア（既存データを全て上書き）
    sheet.clearContents();
    
    // ヘッダーを追加
    sheet.appendRow(['項目名']);

    // フィルターして有効な項目名のみをスプレッドシートに書き込み
    const validItems = itemNames.filter(name => name && name.trim() !== '');

    // 仕様: 最低3個登録必須のチェックはクライアント側で行うが、念のためサーバー側でもチェック
    if (validItems.length < 3) {
        return { status: 'error', message: '項目は最低3個登録してください。' };
    }
    
    validItems.forEach(name => {
        sheet.appendRow([name]);
    });
    
    return { status: 'success', message: '項目設定を保存しました。' };
}

/**
 * 履歴データを編集・更新
 * @param {number} rowNumber - スプレッドシートの行番号 (2以上)
 * @param {Object} formData - 登録日, メモ, チェック状態を含むフォームデータ
 */
function updateChecklist(rowNumber, formData) {
    if (rowNumber < 2) {
        return { status: 'error', message: '無効な行番号です。' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(DATA_SHEET_NAME);
    
    const configItems = getConfigItems();

    // 登録する新しい行データを作成
    let newRowData = [
        formData.date,
        formData.memo
    ];
    
    // チェック状態をConfigの順番に合わせて追加
    configItems.forEach(item => {
        // formData.checksはIDの配列を想定
        newRowData.push(formData.checks.includes(String(item.id)) ? '✔' : '');
    });
    
    // データのある範囲を指定して上書き (A列からConfig項目の最終列まで)
    const range = sheet.getRange(rowNumber, 1, 1, 2 + configItems.length);
    range.setValues([newRowData]);

    return { status: 'success', message: '履歴を更新しました。' };
}

/**
 * 履歴データを削除
 * @param {number} rowNumber - スプレッドシートの行番号 (2以上)
 */
function deleteChecklist(rowNumber) {
    if (rowNumber < 2) {
        return { status: 'error', message: '無効な行番号です。' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(DATA_SHEET_NAME);
    
    // 行全体を削除
    sheet.deleteRow(rowNumber);
    
    return { status: 'success', message: '履歴を削除しました。' };
}

/**
 * HTMLファイルを読み込み、内容をそのまま出力するヘルパー関数
 * (GASのテンプレートエンジンでインクルードタグを処理させる)
 * @param {string} filename - HTMLファイル名 (例: 'Styles')
 * @returns {HtmlOutput} - ファイルの内容
 */
function include(filename) {
    // getContent() を使用し、HTMLの内容を文字列として取得
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent(); 
}

