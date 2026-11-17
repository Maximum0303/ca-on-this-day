# 今日はC&Aの何の日？ — Ver.0.9 データ更新

Ver.0.8の既存1,451件を保持し、2005〜2007年の公演・音源映像作品・出来事を124件追加しました。

## 収録件数

- **総登録：1,575件**（ライブ関連1,417、作品発売149、その他分類9）。
- 今回追加：ライブ関連110件（ASKA「My Game is ASKA」34、公演「DOUBLE」51、「alive in live」11、CHAGE博6、イベント・単独公演8）、作品発売11件、メディア1件、FCイベント開始記録2件。
- **注記**：ライブ関連には既存の延期予定記録も含まれ、すべて開催済み公演を意味しません。
- 2007年12月15日の「alive in live」札幌公演は昼14時と夜18時の**2公演**を別IDで記録（公式History掲載は日付1行）。
- 2005年Guam FCイベントは日程開始を記録。ミニライブの実施日が未確定につきライブ件数には含めていません。
- 2007年12月6日 FUYUON! 2007の会場詳細は照合待ち。
- 出典付きとはいえ全アーカイブの原本確認・完全網羅は未了です。

## 主な出典

- 公式HISTORY: https://www.chage-aska.net/history/2000.php
- ASKA My Game is ASKA: https://w.atwiki.jp/cavc/pages/95.html
- CHAGE博2005: https://w.atwiki.jp/canda/pages/383.html
- alive in live: https://w.atwiki.jp/cavc/pages/434.html
- Short Shorts Film Festival 2005: https://www.shortshorts.org/ja/about/2005.php
- Point Green Live 2006: https://w.atwiki.jp/cavc/pages/453.html
- 服部良一100周年出演: https://tower.jp/article/news/2007/08/22/100010666

## GitHub Pagesへの反映

1. `data/events.js`, `data/events.json`, `data/events.csv` を既存の同名ファイルと置き換える。
2. ルートの `README.md` を置き換える。`index.html` とその他プログラムは変更しない。
3. GitHubでコミット後、サイトの絞り込みに2005〜2007年の記録が増えたことを確認する。

**重要**：`build_sample_data.py` は古い初期73件を再生成するものです。追加後に実行すると最新データが上書きされるため使用しないでください。
