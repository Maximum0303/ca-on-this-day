# 今日はC&Aの何の日？ — Ver.1.4 データ更新

CHAGE and ASKA・Chage・ASKA・MULTI MAXの歴史カレンダー。

## 登録件数（2026年11月17日）

- **総数：2,499件**（Ver.1.3の既存 **2,279件** を保持し **220件**を追加）
- ライブ関連 **2,035件**、作品発売・配信 **280件**、メディア **153件**、記念日 **18件**、その他 **13件**
- 今回追加：ライブ関連 **99件**、作品 **23件**、メディア **92件**、記念日 **3件**、その他 **3件**
- 年別：2020年 **64件**、2021年 **102件**、2022年 **54件**
- 今回のライブ関連には **中止予定16件、延期前の予定9件** が含まれ、実際に開催された公演数とは一致しません。

## 主な収録内容

- **ASKA 2020**：「higher ground」の2020年実施8公演と、開催に至らなかった大阪（当初・振替）・熊本の予定3件を区別。
- **Chage 2020**：ニューイヤーパーティー2開催日、FC限定ライブ、オンラインライブ、全中止となったファンミーティングの7開催日／公式11公演、同じく全中止のライブツアー5公演、クリスマス3会場×2ステージ＝6公演。
- **Chage 2021**：「Boot up!!」9公演、「Winter Event」12公演（いずれも公式開演時刻を記載）、配信イベント、特別ゲスト出演。
- **ASKA 2021**：6月23日の初配信ライブ、翌2022年に延期されたアンコール公演の旧日程9件、静岡中止公演1件。**旧ツアーの15公演すべてを確定したという意味ではありません**。
- **ASKA 2022**：「higher ground」アンコール全国13公演（主催者公式の日付・会場・開演時刻）。2021年の延期前日程を別々に保持。
- **Chage 2022**：「ずっと細道」2022年分6公演、「Billboard Live 64 to 65」2022年分4公演、単独ゲスト出演、配信ファンミーティング開始記録。
- **作品発売・配信**：C&Aの旧映像DVD復刻6作品とTUG DVDセット、ASKAの『Breath of Bless』『笑って歩こうよ』『PRIDE』など、Chage『Boot up!!』『チャゲクリ』『YOU’RE THE ONE』ほか。CD発売と先行配信、初出と再発売を区別。
- **放送**：Chage公式Biographyの放送日が明記されたテレビ・ラジオ出演を中心に収録。毎週のレギュラー放送全回を網羅するデータではありません。

## 特に注意すべき未確定事項

1. 2020年Chageファンミーティングは公式の「11公演・7開催日」を、**7件の開催日単位記録**として登録しました。中止された同日複数公演の回数は推測していません。
2. 2021年ASKAのアンコールツアーは公式「予定15公演」ですが、2022年の振替先を確認できた旧日程9件と、中止告知がある静岡1件のみ登録しています。差分は継続調査します。
3. 2020年1月6日のASKA大阪公演は咽頭炎で延期され、3月13日の振替も中止です。両日を開催実績には加えません。
4. Chageオンラインファンミーティング2021/2022はシリーズ開始記録のみ。全開催日を確証なく月ごとに生成していません。
5. `category=live` の件数は **実施済みのライブ回数ではありません**。`status=canceled`／`status=postponed` を区別しています。`status=recorded` でも開催日単位の記録を含む場合があります。
6. 個別の出典URLと `verification` を残しました。追加件数は当該3年間の完全網羅を保証するものではありません。

## 主な出典

- [Chage公式Biography 2020](https://chage.jp/biography/2020.php)、[2021](https://chage.jp/biography/2021.php)、[2022](https://chage.jp/biography/2022.php)
- [Chage公式「Boot up!!」日程](https://chage.jp/livetour2021/)
- [Chage公式「Winter Event」日程](https://chage.jp/2021winterevent/)
- [Chage公式「ずっと細道」過去日程](https://chage.jp/hosomichi/schedule/archive.php)
- [ASKA 2022主催者の公式日程・旧日程対応](https://classics-festival.com/rc/performance/aska-premium-concert-tour-higher-ground-%E3%82%A2%E3%83%B3%E3%82%B3%E3%83%BC%E3%83%AB%E5%85%AC%E6%BC%94/)
- [CHAGE and ASKA公式Information](https://www.chage-aska.net/information/)（DVD復刻の各回発売日）
- [CHAGE and ASKA archives wiki](https://w.atwiki.jp/canda/)（ASKA 2019–2020の実施/中止状況など）
- [映像情報メディア管理センター](https://w.atwiki.jp/cavc/)（補助照合用）

## 反映方法

1. ZIPを展開し、`data/events.js`、`data/events.json`、`data/events.csv` をGitHubリポジトリ内の同じパスへ上書き。
2. リポジトリ直下の `README.md` を上書きし、Commit changes を実行。
3. `index.html` / `app.js` / `styles.css` の更新は不要。
