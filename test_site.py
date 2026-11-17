from pathlib import Path
import json,threading,functools,http.server,socketserver
from playwright.sync_api import sync_playwright
base=Path(__file__).resolve().parent
handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(base))
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
site=f'http://127.0.0.1:{server.server_port}/index.html'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1440,'height':900}, device_scale_factor=1)
    errs=[]
    page.on('pageerror',lambda e:errs.append(str(e)))
    page.goto(site,wait_until='load')
    page.screenshot(path=str(base/'desktop-preview.png'),full_page=True)
    assert page.locator('#record-total').inner_text()=='試験収録 73 件',page.locator('#record-total').inner_text()
    page.goto(site+'?date=11-19',wait_until='load')
    assert page.locator('#day-summary').inner_text().startswith('3件'),page.locator('#day-summary').inner_text()
    assert page.locator('#day-events').inner_text().count('1993年')>=3
    assert page.locator('#results-count').inner_text().startswith('該当 73 件')
    page.locator('#keyword').fill('横浜アリーナ')
    assert page.locator('#results-count').inner_text().startswith('該当 4 件'),page.locator('#results-count').inner_text()
    page.locator('#reset-filters').click()
    page.locator('#all-day').click()
    assert page.locator('#results-count').inner_text().startswith('該当 3 件'),page.locator('#results-count').inner_text()
    page.locator('#today-btn').click()
    assert page.locator('#hero-date-ja').inner_text()!='', 'today empty'
    page.locator('#category-filter').select_option('release')
    assert page.locator('#results-count').inner_text().startswith('該当 3 件')
    assert not errs,errs
    mobile=browser.new_page(viewport={'width':375,'height':812},device_scale_factor=1)
    mobile.on('pageerror',lambda e:errs.append(str(e)))
    mobile.goto(site+'?date=11-19',wait_until='load')
    mobile.screenshot(path=str(base/'mobile-preview.png'),full_page=True)
    assert mobile.evaluate('document.documentElement.scrollWidth<=window.innerWidth'),'mobile horizontal overflow'
    assert not errs,errs
    editor=browser.new_page(viewport={'width':1440,'height':900})
    editor.on('pageerror',lambda e:errs.append(str(e)))
    editor.goto(site.replace('index.html','admin.html'),wait_until='load')
    assert '73件' in editor.locator('#admin-total').inner_text()
    editor.locator('#f-date').fill('2000-01-01')
    editor.locator('#f-artist').select_option('ASKA')
    editor.locator('#f-category').select_option('milestone')
    editor.locator('#f-title').fill('表示試験用のイベント')
    editor.locator('#f-source').fill('https://example.org/test')
    editor.locator('#f-source-label').fill('表示テスト')
    editor.locator('#save-event').click()
    assert '74件' in editor.locator('#admin-total').inner_text()
    assert not errs,errs
    print(json.dumps({'passed':['73 events','11/19 three events','keyword search','filtered day results','today button','category filter','mobile no overflow','admin create'],'errors':errs,'screenshots':['desktop-preview.png','mobile-preview.png']},ensure_ascii=False,indent=2))
    browser.close()
