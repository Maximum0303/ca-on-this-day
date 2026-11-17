#!/usr/bin/env python3
"""Create the pilot archive from transcribed, published wiki rows.
Source: https://w.atwiki.jp/canda/pages/424.html
The structured rows are intentionally explicit so that they can be reviewed.
"""
from pathlib import Path
import json, csv, re

ROOT = Path(__file__).resolve().parent
SOURCE = 'https://w.atwiki.jp/canda/pages/424.html'
TOUR_ID = 'longest-tour-1993-1994'
TOUR = '史上最大の作戦 THE LONGEST TOUR 1993-1994'
ROWS = '''
1993-10-10|岩手県|盛岡市アイスアリーナ
1993-10-13|北海道|真駒内アイスアリーナ
1993-10-14|北海道|真駒内アイスアリーナ
1993-10-16|北海道|真駒内アイスアリーナ
1993-10-17|北海道|真駒内アイスアリーナ
1993-10-20|秋田県|秋田県立体育館
1993-10-21|秋田県|秋田県立体育館
1993-11-02|福島県|郡山市総合体育館
1993-11-04|栃木県|宇都宮市文化会館
1993-11-05|栃木県|宇都宮市文化会館
1993-11-11|石川県|石川厚生年金会館
1993-11-12|石川県|石川厚生年金会館
1993-11-15|京都府|京都会館第一ホール
1993-11-16|京都府|京都会館第一ホール
1993-11-18|岡山県|岡山市総合文化体育館
1993-11-19|岡山県|岡山市総合文化体育館
1993-11-27|群馬県|群馬県民会館
1993-11-28|群馬県|群馬県民会館
1993-11-30|新潟県|新潟産業振興センター
1993-12-01|新潟県|新潟産業振興センター
1993-12-04|愛媛県|愛媛県民文化会館
1993-12-05|愛媛県|愛媛県民文化会館
1993-12-07|香川県|香川県県民ホール
1993-12-08|香川県|香川県県民ホール
1993-12-13|福岡県|福岡国際センター
1993-12-14|福岡県|福岡国際センター
1993-12-16|福岡県|福岡国際センター
1993-12-17|福岡県|福岡国際センター
1993-12-20|福岡県|福岡国際センター
1993-12-21|福岡県|福岡国際センター
1994-01-07|青森県|青森市文化会館
1994-01-08|青森県|青森市文化会館
1994-01-11|宮城県|仙台市体育館
1994-01-12|宮城県|仙台市体育館
1994-01-17|鹿児島県|鹿児島アリーナ
1994-01-18|鹿児島県|鹿児島アリーナ
1994-01-22|沖縄県|沖縄コンベンションセンター
1994-01-23|沖縄県|沖縄コンベンションセンター
1994-01-25|沖縄県|沖縄コンベンションセンター
1994-01-26|沖縄県|沖縄コンベンションセンター
1994-02-08|千葉県|幕張メッセイベントホール
1994-02-09|千葉県|幕張メッセイベントホール
1994-02-11|千葉県|幕張メッセイベントホール
1994-02-12|千葉県|幕張メッセイベントホール
1994-02-16|愛知県|名古屋市総合体育館レインボーホール
1994-02-17|愛知県|名古屋市総合体育館レインボーホール
1994-02-19|愛知県|名古屋市総合体育館レインボーホール
1994-02-20|愛知県|名古屋市総合体育館レインボーホール
1994-02-22|愛知県|名古屋市総合体育館レインボーホール
1994-02-23|愛知県|名古屋市総合体育館レインボーホール
1994-02-27|大阪府|大阪城ホール
1994-02-28|大阪府|大阪城ホール
1994-03-02|大阪府|大阪城ホール
1994-03-03|大阪府|大阪城ホール
1994-03-09|神奈川県|横浜アリーナ
1994-03-10|神奈川県|横浜アリーナ
1994-03-12|神奈川県|横浜アリーナ
1994-03-13|神奈川県|横浜アリーナ
1994-03-16|静岡県|浜松アリーナ
1994-03-17|静岡県|浜松アリーナ
1994-03-25|広島県|広島グリーンアリーナ
1994-03-26|広島県|広島グリーンアリーナ
1994-03-29|大阪府|大阪城ホール
1994-03-30|大阪府|大阪城ホール
1994-04-01|大阪府|大阪城ホール
1994-04-02|大阪府|大阪城ホール
1994-04-06|東京都|国立代々木競技場第一体育館
1994-04-07|東京都|国立代々木競技場第一体育館
1994-04-09|東京都|国立代々木競技場第一体育館
1994-04-10|東京都|国立代々木競技場第一体育館
'''
rows = [r.split('|') for r in ROWS.strip().splitlines()]
assert len(rows) == 70, f'Expected 70 concerts; got {len(rows)}'
assert len({r[0]+'|'+r[2] for r in rows}) == 70

items=[]
for n, (date, prefecture, venue) in enumerate(rows, 1):
    note = 'ツアー初日' if n == 1 else ('ツアー最終日' if n == 70 else '')
    items.append({
        'id': f'live-{TOUR_ID}-{n:03}', 'date': date, 'artist': 'CHAGE and ASKA',
        'category': 'live', 'title': TOUR, 'tourId': TOUR_ID,
        'venue': venue, 'prefecture': prefecture, 'country': '日本',
        'performanceNo': n, 'status': 'recorded', 'verification': 'secondary',
        'note': note, 'sources': [{'label':'CHAGE and ASKA archives wiki｜公演日程','url':SOURCE}]
    })
for d, name, rid in [
    ('1993-10-10', 'RED HILL', 'album-red-hill-1993'),
    ('1993-11-19', 'You are free', 'single-you-are-free-1993'),
    ('1993-11-19', 'なぜに君は帰らない', 'single-nazeni-kimi-wa-kaeranai-1993'),
]:
    items.append({
        'id': f'release-{rid}', 'date':d, 'artist':'CHAGE and ASKA',
        'category':'release', 'title':f'『{name}』発売', 'releaseTitle':name,
        'status':'released', 'verification':'secondary', 'note':'',
        'sources':[{'label':'CHAGE and ASKA archives wiki｜ツアー概要・備考','url':SOURCE}]
    })

items.sort(key=lambda x:(x['date'],{'release':0,'live':1}.get(x['category'],2),x['id']))
archive = {'schemaVersion':1,
           'notice':'試験収録：1993～1994年の史上最大の作戦70公演＋関連作品発売3件。網羅済みではありません。掲載資料をもとに整備し、一次資料での照合は順次実施します。',
           'lastUpdated':'2026-11-17',
           'events':items}
(ROOT/'data').mkdir(exist_ok=True)
(ROOT/'data'/'events.json').write_text(json.dumps(archive, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
with (ROOT/'data'/'events.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f)
    w.writerow(['ID','日付','名義','種類','タイトル','都道府県','会場','公演番号','備考','照合状況','出典URL'])
    for x in items:
        w.writerow([x['id'],x['date'],x['artist'],x['category'],x['title'],x.get('prefecture',''),x.get('venue',''),x.get('performanceNo',''),x.get('note',''),x['verification'],SOURCE])
print('Created',len(items),'events,',sum(x['category']=='live' for x in items),'live,',sum(x['category']=='release' for x in items),'release')
