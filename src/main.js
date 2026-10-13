(function(){'use strict';
const $=id=>document.getElementById(id),E=MetroEngine;let scene;const S=E.init(314159);S.mode='menu';let wallet=0,best=0,seenHint=false,shownOver=false,tickToast=0,pauseMode=false;
try{const data=JSON.parse(localStorage.getItem('trackshift-3d-original-v1')||'{}');wallet=Math.max(0,Number(data.wallet)||0);best=Math.max(0,Number(data.best)||0)}catch{}
function persist(){try{localStorage.setItem('trackshift-3d-original-v1',JSON.stringify({wallet,best}))}catch{}}
function ui(){const mode=S.mode,playing=mode==='run';$('menu').hidden=mode!=='menu';$('hud').hidden=!playing;$('boardWrap').hidden=!playing||S.powerups.board<1;$('over').hidden=mode!=='over';$('pauseModal').hidden=!pauseMode;$('score').textContent=Math.floor(S.score).toString().padStart(5,'0');$('coins').textContent=S.runCoins;$('distance').textContent=Math.round(S.meters)+' m';$('wallet').textContent=wallet;$('best').textContent=best;$('boards').textContent=S.powerups.board;$('speedOverlay').classList.toggle('active',playing)}
function start(){E.reset(S);S.obstacles.push({id:'opening_train',lane:2,kind:'train',z:37,length:8,checked:false,cleared:false});S.obstacles.push({id:'opening_barrier',lane:0,kind:'barrier',z:31,length:1.4,checked:false,cleared:false});S.powerups.board=1;shownOver=false;pauseMode=false;ui();if(!seenHint){$('hint').classList.add('visible');setTimeout(()=>$('hint').classList.remove('visible'),3000);seenHint=true}}
function exit(){S.mode='menu';pauseMode=false;ui()}
function showOver(){if(shownOver)return;shownOver=true;const bonus=E.bonusEnd(S);wallet+=bonus.coins;best=Math.max(best,bonus.score);persist();$('endScore').textContent=bonus.score.toLocaleString('pt-BR');$('endCoins').textContent='+'+bonus.coins+' ★';ui()}
function toast(str){$('toast').textContent=str;$('toast').classList.add('show');tickToast=1.25}
function applyMove(type){if(S.mode==='run'&&!pauseMode){E.input(S,type);if(type==='board')ui()}}
$('start').onclick=start;$('retry').onclick=start;$('exitOver').onclick=exit;$('exitPause').onclick=exit;$('resume').onclick=()=>{pauseMode=false;S.mode='run';ui()};$('board').onclick=()=>applyMove('board');$('pause').onclick=()=>{pauseMode=true;S.mode='pause';ui()};
let down=null;const canvas=$('scene');
canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,t:performance.now()};canvas.setPointerCapture?.(e.pointerId)});
canvas.addEventListener('pointerup',e=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;down=null;if(Math.max(Math.abs(dx),Math.abs(dy))<23)return;if(Math.abs(dx)>Math.abs(dy)){applyMove(dx>0?'right':'left')}else applyMove(dy>0?'roll':'jump')});
canvas.addEventListener('pointercancel',()=>{down=null});
window.addEventListener('keydown',e=>{const binds={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump',ArrowDown:'roll',KeyS:'roll',KeyB:'board'};if(binds[e.code]){e.preventDefault();applyMove(binds[e.code])}else if(e.code==='Escape'){if(S.mode==='run')$('pause').click();else if(S.mode==='pause')$('resume').click()}});
try{scene=new TrackshiftScene(canvas)}catch(err){$('error').hidden=false;$('error').textContent='Falha ao iniciar WebGL: '+err.message;console.error(err);return}
let prev=0,frames=0;
function frame(time){requestAnimationFrame(frame);let dt=Math.min(.05,(time-prev)/1000||0);prev=time;frames++;E.tick(S,dt);if(S.mode==='over')showOver();if(S.events?.length)for(const e of S.events){if(e.type==='coin')toast('+1 MOEDA');else if(e.type==='saved')toast('SALVO!');else if(e.type==='power')toast('PODER ATIVADO!')}
if(tickToast>0){tickToast-=dt;if(tickToast<=0)$('toast').classList.remove('show')}
scene.draw(S,dt);if(frames%9===0)ui();}
requestAnimationFrame(frame);ui();window.__TRACKSHIFT3D__={state:S,scene,start,exit,ui,applyMove,quality:'webgl-original-meshes'};
})();
