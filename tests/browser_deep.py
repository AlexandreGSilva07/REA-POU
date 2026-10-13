from playwright.sync_api import sync_playwright
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
errors=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 context=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
 page=context.new_page()
 page.on('pageerror',lambda e:errors.append(str(e)))
 html=(root/'index.html').read_text()
 for link in ('<link rel="stylesheet" href="src/style.css">','<script src="src/engine.js"></script>','<script src="src/render.js"></script>','<script src="src/main.js"></script>'):
  html=html.replace(link,'')
 page.set_content(html)
 page.add_style_tag(content=(root/'src/style.css').read_text())
 # storage fake with deterministic state for access via localStorage on about:blank
 page.evaluate('''() => {const kv={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>kv[k]??null,setItem:(k,v)=>kv[k]=v,removeItem:k=>delete kv[k]}});window.__fakeStore=kv;}''')
 for n in ['engine.js','render.js','main.js']:page.add_script_tag(content=(root/'src'/n).read_text())
 page.wait_for_timeout(350)
 assert page.locator('#menuScreen').is_visible()
 page.locator('#garageBtn').click(); assert page.locator('#garageScreen').is_visible()
 assert page.locator('.skin-card').count()>=5
 page.locator('[data-go="menu"]').first.click()
 page.locator('#helpBtn').click();assert page.locator('#helpScreen').is_visible()
 page.locator('[data-go="menu"]').last.click()
 page.locator('#startBtn').click();page.wait_for_timeout(250)
 S=lambda:page.evaluate('({mode:window.__TRACKSHIFT__.state.mode,lane:window.__TRACKSHIFT__.state.lane,y:window.__TRACKSHIFT__.state.y,meters:window.__TRACKSHIFT__.state.meters})')
 before=S();assert before['mode']=='run'
 # mobile swipe right / up / down directly on canvas
 box=page.locator('#game').bounding_box()
 x=box['x']+box['width']/2;y=box['y']+box['height']*.60
 page.touchscreen.tap(x,y)
 # touch swipes with native events via CDP (true touchscreen gestures)
 session=context.new_cdp_session(page)
 def swipe(x1,y1,x2,y2):
  session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':int(x1),'y':int(y1)}]})
  for k in (0.30,0.70,1.0):session.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':int(x1+(x2-x1)*k),'y':int(y1+(y2-y1)*k)}]})
  session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 swipe(x,y,x+88,y)
 page.wait_for_timeout(120)
 assert S()['lane']==2, S()
 swipe(x,y,x,y-90)
 page.wait_for_timeout(90)
 assert S()['y']>0, S()
 # force safe game end, with coins earned, rendering over dialog and save
 page.evaluate('''() => {let s=window.__TRACKSHIFT__.state;s.runCoins=29;s.score=8324;s.meters=425;s.obstacles=[{id:'force_train',lane:s.lane,kind:'train',z:5.1,length:8,checked:false}];s.y=0;s.vy=0;s.rolling=0;s.boardTime=0;s.shields=0;s.stumble=0;}''')
 page.wait_for_timeout(300)
 assert page.locator('#overScreen').is_visible(), S()
 assert page.locator('#resultCoins').inner_text()=='+29'
 save=page.evaluate('JSON.parse(window.__fakeStore["trackshift-save-v1"])')
 assert save['wallet']==29 and save['best']>=1000,save
 page.locator('#endHomeBtn').click()
 assert page.locator('#walletMain').inner_text()=='29'
 page.locator('#startBtn').click()
 page.wait_for_timeout(120)
 assert S()['mode']=='run'
 assert not errors,errors
 print(json.dumps({'tests':['menu','help','garage','character catalog','native swipe right','native swipe jump','game over','coins persistence','record','replay'],'saved':save,'errors':errors},ensure_ascii=False))
 browser.close()
