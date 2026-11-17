# 今日はC&Aの何の日？ — Ver.1.6 データ更新

CHAGE and ASKA・Chage・ASKA・MULTI MAXの歴史カレンダー。2026年11月17日時点の情報です。

## 更新概要

- Ver.1.5の既存 **2,810件を完全保持**し、2026年の記録を **146件追加**しました。
- **総登録件数：2,956件**。
- 内訳：ライブ関連 2,315件、発売・公開 306件、メディア 239件、記念日 25件、その他 71件。
- 今回の追加内訳：ライブ 72件、作品・MV 11件、メディア 23件、記念日 1件、その他 39件。
- 今回追加したライブ記録：**開催済み 53件**／**開催予定 18件**／**延期前予定 1件**。
- すべて2026年の暦日を採用。2027年にまたがる公演の予定日は今回の対象外です。

## 主な収録内容

- ASKA「Lock-on」2026年分 **29公演**：11月17日までの14公演は開催実績、11月21日以降の15公演は【開催予定】。公式公演日程・会場・開演時間を登録。2027年分は次版の対象。
- ASKA「昭和が見ていたクリスマス!?」2月東京・大阪、計4公演。
- Chage「Chageのずっと細道」2026年開催予定日を網羅（3/22渋谷の追加公演も別登録）。8/1鹿児島公演は**開催見送り、2027年1月29日に振替**のため、延期前予定として記録。11/23山梨は開催予定。
- Chage「One Love」4公演・ビルボードライブ（1月大阪・東京4ステージ、12月横浜2ステージ予定）・『Mr.November: One More Time』・ゲスト出演・「ニクオン町田BASE」等。
- Chageの『Ko』、ASKAと玉置浩二の「音銀河」、Chageの吉田山田柴田・シシド・チャゲとしての配信、ライブ映像・音源作品・MV公開日。
- TV・ラジオ・動画配信の各出演日、Chageオンラインファンミーティング（12開催日×昼夜2回＝24件、`other` 分類）、8月Chageアート展、5月・12月FCイベント、C&Aデビュー47周年記念日。
- Chageライブ映像「バリカタ上映会」：上映日と会場別に6件（いずれも `other`、生演奏ライブとは区別）。
- ASKA「昭和が見ていたクリスマス!?」コンサート映画：9月1日上映開始、9月5日お台場の舞台挨拶、9月13日札幌の舞台挨拶（札幌は当日実施の一次確認待ち）を`other`分類で追加。
- Chageの5月30〜31日および12月19〜20日の宿泊型FCイベントは**それぞれ開始日の1件**として登録。2公演との意味ではありません。
- 8月1日のChage鹿児島リアルファンミも公演同様に延期前の記録として登録。

## 予定・延期の扱い（重要）

- データ項目 `status` は開催済み=`recorded`、今後の開催予定=`scheduled`、延期前の日程=`postponed` を区別。
- 現行のサイト表示は `status` が目立たない場合があるため、**今後の公演は `note` に `【開催予定・2026年11月17日時点】` を必ず明記**。
- ライブ分類の件数は延期・開催予定を含み、実際に終わったライブ数とは一致しません。
- 発売日と発売発表日、映像収録公演日とその放送日・配信日、会期と開催公演数は区別。
- 演奏曲目・セットリストなど、開催中のツアーのネタバレは収録しません。
- 未確認の公演時刻は推測で補っていません。

## 主な参考資料

- ASKA公式：<https://www.fellows.tokyo/feature/lock_on_2026>
- ASKA公式：<https://www.fellows.tokyo/news/detail/488>
- Chage公式：<https://chage.jp/information/live/detail-770.php>
- Chage公式：<https://chage.jp/information/live/detail-868.php>
- Chage公式（鹿児島延期）：<https://chage.jp/information/live/detail-857.php>
- Chage公式：<https://chage.jp/information/live/detail-817.php>
- Chage公式（ビルボード横浜）：<https://chage.jp/information/live/detail-884.php>
- Chage公式オンラインファンミ日程：<https://fanclub.chage.jp/sitenews_det.php?id=19304>
- Chage公式（5月FCイベント）：<https://chage.jp/information/fanclub/detail-807.php>
- Chage公式（作品リリース・映画上映）：<https://chage.jp/information/release/detail-800.php>
- ASKA公式（作品リリース）：<https://www.fellows.tokyo/news/list/1/7/>
- ASKA公式（映画館先行上映）：<https://www.fellows.tokyo/news/detail/737>
- ASKA本人ブログ（上映舞台挨拶）：<https://www.fellows.tokyo/blog/detail/1436/?page=2>
- 映像情報メディア管理センター（cavc、補助資料）：<https://w.atwiki.jp/cavc/pages/363.html>

個々の記録に、可能な限り直接の公式案内URLを格納しています。補助資料のみの場合は照合状況を `secondary` としました。

## GitHubへのアップロード

1. ZIPを展開し、`data/events.js`、`data/events.json`、`data/events.csv` をリポジトリの `data` フォルダーへ上書き。
2. ルートの `README.md` を上書き。
3. GitHubで Commit changes。
4. 公開ページに反映されない場合は `Ctrl + F5` を実行。

`index.html`、`app.js`、`styles.css` の変更はありません。
