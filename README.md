# 今日はC&Aの何の日？ — Ver.1.1 データ更新

CHAGE and ASKA・Chage・ASKA・MULTI MAXの歴史カレンダーです。

## 更新概要（2026年11月17日）

- 既存 **1,795件** を保持し、新規 **156件**（live 108件, release 37件, media 3件, other 4件, milestone 4件）を追加。
- 合計 **1,951件**：ライブ関連 1,719件・作品発売 205件・その他 27件。
- 2011年のASKA「FACES」後半8公演、Chage「まわせ大きな地球儀」後半7公演、「茶会2011」6公演、「細道2011」19公演。
- 2012年の「昭和が見ていたクリスマス!?」2公演、Chage Live Tour2012 5公演、トークライブ4公演、「茶会2012」6公演、「ROCKET」2012年分5公演。
- 2013年の「ROCKET」後半とNHKホール追加公演、「茶会2013」6公演。
- 2013年「On Your Mark」予定日3件は **中止（当日公演なし）** として登録し、開催済み公演には算入しない。
- 2011年ASKA「FACES」1月9日・11日・12日の当初日程は延期記録として登録し、振替の2月14日・3月1日・3月2日と区別。
- 既存データの2010年末2公演にあった誤解を招く「ツアー最終日」注記を「2010年内最終公演」に修正。公演IDは維持。
- **要照合**：2011年「FACES」日本ガイシホールの日付は公式Historyでは2月5日、別資料に2月25日表記あり。2013年「ROCKET」3月29日NHKホールは公式History本文で全31公演の最終日だが、詳細日程表には記載なし。
- 未収録の日付は「出来事がなかった」ことを意味しません。一次資料による全件照合は引き続き進めます。

## 主な出典

- [CHAGE and ASKA 公式HISTORY（2010年〜）](https://www.chage-aska.net/history/2010.php)
- [Chage 公式Biography（2011年）](https://chage.jp/biography/2011.php)
- [Chage 公式Biography（2012年）](https://chage.jp/biography/2012.php)
- [Chage 公式Biography（2013年）](https://chage.jp/biography/2013.php)
- [2013年On Your Mark延期に関する当時の報道](https://news.mynavi.jp/article/20130612-a104/)

## GitHub Pagesへの更新手順

1. `data/events.js`、`data/events.json`、`data/events.csv` をGitHubリポジトリの `data/` フォルダーで上書き。
2. `README.md` をリポジトリのトップ階層で上書き。
3. `Commit changes` して、公開サイトを再読み込み（必要なら `Ctrl + F5`）。

今回は `index.html` / `app.js` / `styles.css` を変更しません。
