# 今日はC&Aの何の日？ — Ver.0.7 データ更新

既存の1043件を保持し、1998〜2001年の公演・発売情報を追加しました。

## 今回の件数

- 総登録：**1219件**（ライブ関連1099件、発売記録119件、その他・記念日1件）
- 新規：**176件**（ライブ145件、作品発売31件）
- 同一ID重複なし、日付形式確認済み。

## 新規ライブの内訳

- ASKA CONCERT TOUR kicks（1998年）：32件
- CHAGE 上海之行演唱会（1998年）：2件
- CHAGE“大いに唄う”in 武道館（1998年）：1件
- CHAGE CONCERT TOUR Feeling Place（1998年）：13件
- CHAGE 1998 FINAL COUNT DOWN（1998年）：1件
- 赤坂BLITZ special MTV PROGRAM LIVE（1999年）：2件
- CHAGE and ASKA 20th Anniversary Premium Live（1999年）：6件
- CONCERT TOUR 1999 TUG OF C&A PRESENTS PREVIEW（1999年）：2件
- CHAGE and ASKA CONCERT TOUR 電光石火（1999年）：21件
- CHAGE and ASKA ASIAN TOUR NO DOUBT（1999年）：4件
- 千年夜一夜ライブ ～福岡ドーム 僕らがホーム～（1999年）：1件
- CHAGE and ASKA LIVE IN KOREA（2000年）：2件
- ASKA CONCERT TOUR GOOD TIME（2000年）：20件
- ASKA PRE-FINAL at The Garden Hall（2000年）：1件
- CHAGE and ASKA CONCERT TOUR 01>>02 NOT AT ALL（2001年）：31件
- ASKA「MTV Music Summit’98」出演（1998年8月30日）：1件。**会場未詳のため未入力**。
- CHAGE and ASKA 2001年野外イベント：5件。

※1999年の20th Anniversary Premium Liveは6公演（6月10日と13日は各2公演）として記録。
※「NOT AT ALL」は2001年分のみ収録し、2002年の残りは次回以降に追加。したがって現段階ではツアーの全日程ではありません。
※2000年の5.1ch体感イベント（公式記載の開催数に不一致あり）は詳細な会場別日程の照合が済むまで未追加。

## 出典と照合

- [CHAGE and ASKA 公式 HISTORY 1990〜1999](https://www.chage-aska.net/history/1990.php)
- [CHAGE and ASKA 公式 HISTORY 2000〜2009](https://www.chage-aska.net/history/2000.php)
- 二次参考：[アーカイブWiki](https://w.atwiki.jp/canda/)、[ladomi.net](https://ca.ladomi.net/live_ca)、[Wikipediaコンサート一覧](https://ja.wikipedia.org/wiki/CHAGE_and_ASKAのコンサート一覧)
- 新規レコードは公式HISTORY記載の日時・会場を直接転記したため `verification: primary`。既存データの照合状況は変更していません。

## 公開サイトの更新手順

1. ZIPを展開し、GitHubリポジトリの `data/` に `events.js`、`events.json`、`events.csv` の3ファイルをアップロードして既存ファイルを置換。
2. リポジトリ最上位で `README.md` を同様に置換。
3. GitHubでコミットし、GitHub Pagesの反映後にページを再読み込み。

`index.html` や `app.js` の変更はありません。一般公開ページが読むのは `data/events.js` です。`admin.html` はローカル編集補助ツールであり、サーバー上での編集保存機能ではありません。

## 掲載ルール

確認済みの出演・発売のみ収録し、同日に複数公演がある場合は個別に記録。公演中止・延期は開催済みとして数えず状態を明記。未収録日について、出来事がなかったとは断定しません。非公式ファンサイトです。
