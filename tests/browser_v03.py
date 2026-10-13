from pathlib import Path
from playwright.sync_api import sync_playwright
import re, json
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text().replace('<link rel="stylesheet" href="./src/style.css">','<style>'+(root/'src/style.css').read_text()+'</style>').replace('<script type="module" src="./src/app.js"></script>','')
state=re.sub(r'\bexport (?=(?:const|function)\b)','',(root/'src/state.js').read_text())
arcade=re.sub(r'\bexport (?=(?:const|function)\b)','',(root/'src/arcade.js').read_text())
app=re.sub(r'^import .*?;\n','',(root/'src/app.js').read_text(),flags=re.M)
script=state+'\nconst {ARCADE_GAMES,DIFFICULTIES,startArcade} = (() => {\n'+arcade+'\nreturn {ARCADE_GAMES,DIFFICULTIES,startArcade}\n})();\n'+app
errors=[];failures=[]
with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--no-proxy-server'])
  context=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
  page=context.new_page();page.set_default_timeout(3000)
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded')
  page.evaluate("window.__save={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__save[k]??null,setItem:(k,v)=>window.__save[k]=v}})")
  page.add_script_tag(content=script)
  page.wait_for_timeout(250)
  assert not errors, errors
  page.locator('#startBtn').click()
  page.screenshot(path=str(root/'home_v03.png'),full_page=True)
  page.locator('[data-action=shop]').click()
  assert page.locator('.shop-banner').is_visible()
  assert page.locator('.boutique-card').count()>=8
  page.screenshot(path=str(root/'shop_v03.png'),full_page=True)
  page.locator('[data-tab=skin]').click()
  page.locator('[data-product=choco]').click()
  page.locator('[data-buy=choco]').click()
  assert 'choco' in page.evaluate('window.__save["rea-pou-v2"]')
  page.locator('[data-tab=glasses]').click()
  assert page.locator('.boutique-card').count()>=5
  page.locator('#modalClose').click()
  for _ in range(3): page.locator('#nextRoom').click()
  page.locator('[data-action=games]').click()
  assert page.locator('[data-game]').count()==26
  page.screenshot(path=str(root/'arcade_v03.png'),full_page=True)
  page.locator('[data-difficulty=hard]').click()
  assert page.locator('[data-difficulty=hard]').get_attribute('class')=='selected'
  ids=page.locator('[data-game]').evaluate_all('(els)=>els.map(el=>el.dataset.game)')
  assert len(ids)==26
  for idx,gid in enumerate(ids):
    try:
      page.locator(f'[data-game="{gid}"]').click(timeout=3000)
      if gid not in ('memory','stars','colors'):
        assert page.locator('canvas[aria-label="Área interativa do minijogo"]').is_visible()
        rect=page.locator('.arcade-stage canvas').bounding_box()
        assert rect['width']>130 and rect['height']>100
        page.mouse.click(rect['x']+rect['width']*.5,rect['y']+rect['height']*.55)
        page.wait_for_timeout(65)
      elif gid=='memory': assert page.locator('.memory-cell').count()==16
      if gid=='road':page.screenshot(path=str(root/'race_v03.png'),full_page=True)
      if gid=='basket':page.screenshot(path=str(root/'basket_v03.png'),full_page=True)
      if gid=='potions':page.screenshot(path=str(root/'potions_v03.png'),full_page=True)
      # exit to catalog
      page.locator('#gameExit').click()
      assert page.locator('[data-game]').count()==26
    except Exception as e:
      failures.append({'game':gid,'error':str(e)[:240]})
      # recover if possible
      if page.locator('#gameExit').is_visible():page.locator('#gameExit').click()
    if errors:break
  # Deterministic earned-coins integration: score 10 penalties, verify record + save.
  page.locator('[data-game=penalty]').click()
  cv=page.locator('.arcade-stage canvas')
  r=cv.bounding_box()
  for k in range(10):
    page.mouse.click(r['x']+r['width']*.88,r['y']+r['height']*.25)
  assert page.locator('.game-result').is_visible(), 'Penalty game should finish after 10 shots'
  result=page.locator('.game-result').inner_text()
  assert 'MOEDAS GANHAS' in result
  assert 'penalty' in page.evaluate('window.__save["rea-pou-v2"]')
  page.locator('#playAgain').click()
  assert page.locator('[data-game]').count()==26
  print(json.dumps({'games_seen':len(ids),'tested':len(ids)-len(failures),'failures':failures,'pageerrors':errors,'screenshots':[str(p.name) for p in root.glob('*v03.png')]},ensure_ascii=False))
  browser.close()
if errors or failures:raise SystemExit(1)
