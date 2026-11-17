# 今日はC&Aの何の日？ — Ver.1.2 データ更新

## 件数

- **登録総数：2,086件**（既存1,951件 + 新規135件）
- ライブ関連：**1,818件**、発売：**221件**、メディア：**27件**、記念日：**10件**、その他：**10件**
- 今回の追加内訳：ライブ 99件、作品発売 16件、メディア 17件、記念日 1件、その他 2件。
- 既存1,951件のIDと内容は維持、ID重複なし。

## 2014〜2016年の確認内容

- Chage LiveTour2014 ～equal～：**10公演**（うち10/8は映像収録ライブ）
- Chage Fan Meeting 2014：**31公演／21開催日**。昼夜を含む31件として登録。公式BiographyとWikipediaの個別公演一覧を照合。**昼夜の開演時刻は未確認**。
- Chage Live Tour 2015 ～天使がくれたハンマー～：**8公演**
- Chage Fan Meeting 2015：公式は**16公演／9開催日**と記載。**9開催日だけを登録**（同日の公演回数は資料不足）。残り7回相当の振り分けは保留、架空の昼夜公演を作っていません。記録上の9件は「開催日単位」であり、ツアーの公演総数を意味しません。
- Chage Live Tour 2016 ～もうひとつのLOVE SONG～：**4公演**
- Chage Fan Meeting 2016：**11公演／7開催日**、公式の開演時刻を含め11件として登録
- 2014〜2016年のディナーショー、ライブ出演、シングル・アルバム・映像作品・ライブ音源配信、テレビ・ラジオ出演を追加。
- ASKA「FUKUOKA」は2016年12月24日のYouTube公開であり、CDや配信シングル発売日と混同しないよう記念日分類で記録。

## 主な出典

- [Chage公式 Biography 2014](https://chage.jp/biography/2014.php)
- [Chage公式 Biography 2015](https://chage.jp/biography/2015.php)
- [Chage公式 Biography 2016](https://chage.jp/biography/2016.php)
- [2016年ファンミーティング公式公演時刻](https://chage.jp/staffmemo/%E3%83%95%E3%82%A1%E3%83%B3%E3%83%9F%E3%83%BC%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0%E6%83%85%E5%A0%B1-5/)
- [Chage リリース履歴（Universal Music）](https://www.universal-music.co.jp/chage/release-history/)
- [Chage Wikipedia（2014年ファンミ昼夜区別）](https://ja.wikipedia.org/wiki/Chage)
- [MULTI MAX公式DVD再発売情報](https://chage.jp/discography/multi_max/bd/002.php)

## 反映手順

1. `data/` フォルダーの `events.js`・`events.json`・`events.csv` をGitHub上で上書きしてください。
2. リポジトリ直下の `README.md` も上書きしてください。
3. `index.html`・`app.js`・`styles.css` は変更不要です。
4. Commit changes後、公開サイトの総登録件数を確認してください。

## 検証と今後の課題

- JSON・JavaScript・CSVの件数整合、JSON構文、ID一意性を検査済み。
- 2015年ファンミの複数公演の内訳と、その他未掲載の単発公演は追加調査対象です。
- 本サイトは非公式ファン制作の資料であり、すべての歴史記録の網羅・一次資料確認が完了したわけではありません。
