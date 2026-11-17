# 今日はC&Aの何の日？ — Ver.0.8 データ更新

既存 **1,219件**（Ver.0.7）を保持し、2002〜2004年の公演と出来事 **232件**を追加しました。

## 収録件数（2026-11-17）

- **総計：1,451件**
- ライブ・公演・出演 **1307件**（今回+208件。延期公演等を含むため開催済み公演だけの数ではありません）
- 作品発売 **138件**（今回+19件）
- その他・メディア・記念日 **6件**（今回+5件）
- 重複IDなし。年月日の形式を全件検証済み。

## 今回の主な公演

- 2002年「NOT AT ALL」ホールツアー **43件**を追加。2001年の31公演と合わせて **74公演**（[ツアー資料](https://w.atwiki.jp/canda/pages/427.html)）。
- 2002年「NOT AT ALL」アリーナ追加公演 **10件**。各会場初日はファンクラブ会員向け（[ツアー資料](https://w.atwiki.jp/canda/pages/428.html)）。
- 2002〜2003年「THE LIVE」 **66公演**（[ツアー資料](https://w.atwiki.jp/canda/pages/429.html)）。
- 2004年「two-five」 **71公演**（[ツアー資料](https://w.atwiki.jp/canda/pages/430.html)）。
- その他：2002年学園祭・野外イベント、2003年フェス・「Thanks Festa」6公演・札幌ドームの公開リハーサルと本公演、2004年8月28日熱風コンサート・11月13日三田祭前夜祭など。
- 作品発売19件：DVD・アルバム・シングル・BOX盤等。ラジオ番組・出版物の記録も追加。

## 参考資料

- [CHAGE and ASKA 公式HISTORY 2000〜2009年](https://www.chage-aska.net/history/2000.php)（公演の集計数、イベント・発売日）
- [archives wiki：NOT AT ALL 本編](https://w.atwiki.jp/canda/pages/427.html)、[追加公演](https://w.atwiki.jp/canda/pages/428.html)、[THE LIVE](https://w.atwiki.jp/canda/pages/429.html)、[two-five](https://w.atwiki.jp/canda/pages/430.html)（個別日程・会場名）
- [ladomi.net コンサート一覧](https://ca.ladomi.net/live_ca)（横断照合）

## 公開サイトへの適用

`data` フォルダーの **events.json / events.js / events.csv** を3ファイルとも上書きし、ルートの **README.md** を上書きしてください。`index.html` は今回変更ありません。

`data/events.js` は公開画面が実際に読み込むファイルです。更新後に画面が古いままの場合、ブラウザーの再読み込みを試してください。

**注意：** 公開版の `admin.html` は保存しても自動的にGitHubに反映される仕組みではありません。管理画面の新規作業がある場合は今回の最新版データを元に行い、古いデータで上書きしないよう注意してください。検証状態 `primary` は公式HISTORY上の事実確認、`secondary` はツアー個別日程をアーカイブ資料と照合した状態を意味し、全項目の一次資料原本照合を示しません。
