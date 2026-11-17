# 今日はC&Aの何の日？ — 試作版

CHAGE and ASKA / Chage / ASKA / MULTI MAXの出来事を、月日から振り返るファン制作の歴史カレンダーです。

## 初期データ

- 『史上最大の作戦 THE LONGEST TOUR 1993-1994』の全70公演（開催日・都道府県・当時の会場名）
- 1993年10月10日発売のアルバム『RED HILL』
- 1993年11月19日発売のシングル『You are free』『なぜに君は帰らない』
- **計73件**。ツアー全70公演は試験収録済みですが、**サイト全体の出来事を網羅した状態ではありません**。
- 出典：CHAGE and ASKA archives wiki の[当該ツアーページ](https://w.atwiki.jp/canda/pages/424.html)。一次資料との照合は別途実施するため、データには `verification: "secondary"` を付与しています。

## 試作版の使い方

1. `index.html` をブラウザーで開きます。`data/events.js` を読み込むため、ローカルでも閲覧できます。
2. 今日の日付が自動表示されます。カレンダー、前後の日付移動、キーワード検索、名義・分類・年代フィルタを使用できます。
3. 収録日を試すには **10月10日・11月19日・4月10日** を選択します。
4. 管理用の `admin.html` で出来事を追加・修正し、**events.js をダウンロード**できます。ローカルの編集内容は公開サイトへ自動反映されません。

## GitHub Pagesへの掲載

1. GitHubで `ca-on-this-day` という新しい公開リポジトリを作ります。
2. このZIPの**中身**（`index.html` が最上位にある構成）をリポジトリへアップロードします。
3. GitHub `Settings` → `Pages` → `Build and deployment` → `Deploy from a branch` を選び、`main` / `/(root)` を指定します。
4. GitHub Pagesの公開が有効になったら `https://maximum0303.github.io/ca-on-this-day/` でアクセスできる構成です。実際のURLの公開可否はGitHub側の設定に依存します。

## データの編集と追加

- `admin.html` は**オフライン用の編集補助画面**です。ログインやサーバー書き込みはありません。`admin.html` をネット公開する必要はありません。
- 追加・修正後、`events.js を書き出す` ボタンを押し、出力されたファイルでリポジトリの `data/events.js` を置き換えればサイトの表示が更新されます。
- JSON形式の控えも書き出せます。最新の `events.json` を読み込むこともできます。
- 参考資料のURLと確認状態は必ず入力・確認してください。未確認の情報を確認済みと表示しないようにしてください。
- 同日の昼夜2回公演は、それぞれ独立したIDで登録します。延期・中止などは別途ステータスで区別してください。
- 初期データの再生成スクリプト `build_sample_data.py` は**初期73件を上書き**するため、追加編集後は実行しないでください。

## ファイル構成

- `index.html` : 公開トップページ
- `styles.css` : デザイン
- `app.js` : 日付選択・検索・絞り込み・詳細表示
- `data/events.js` : 公開ページが参照する記録
- `data/events.json` : 初期データの控え
- `data/events.csv` : 初期データの一覧（Excelなどで確認可能）
- `admin.html`, `admin.js`, `admin.css` : ローカル用データ編集補助
- `build_sample_data.py` : 初期データを生成する再現用スクリプト

## 注意

当サイトは非公式ファン制作物です。CHAGE and ASKA、Chage、ASKAおよび関係各社の公式サイトではありません。
