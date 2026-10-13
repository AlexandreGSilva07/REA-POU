/* REA-POU arcade: independent, asset-free Canvas games. No original game resources. */
export const ARCADE_GAMES = [
  {id:'road',name:'Turbo Trânsito',icon:'🏎️',genre:'Corrida',desc:'Troque de pista, fuja dos carros e colete moedas.',duration:40},
  {id:'skate',name:'Skate Street',icon:'🛹',genre:'Ação',desc:'Salte obstáculos e faça manobras no ar.',duration:38},
  {id:'jetpack',name:'Jetpack Lunar',icon:'🚀',genre:'Ação',desc:'Segure para voar e apanhe cristais.',duration:40},
  {id:'slalom',name:'Snow Slalom',icon:'⛷️',genre:'Corrida',desc:'Conduza o esquiador entre árvores e moedas.',duration:38},
  {id:'tunnel',name:'Túnel Neon',icon:'🌀',genre:'Reflexo',desc:'Mude de pista para atravessar os portais.',duration:38},
  {id:'penalty',name:'Pênalti Pro',icon:'⚽',genre:'Esporte',desc:'Mire longe do goleiro para marcar.',duration:38},
  {id:'basket',name:'Cesta Perfeita',icon:'🏀',genre:'Esporte',desc:'Acerte a força no instante ideal.',duration:36},
  {id:'goalie',name:'Super Goleiro',icon:'🧤',genre:'Esporte',desc:'Toque nas bolas antes de cruzarem a linha.',duration:38},
  {id:'volley',name:'Vôlei no Céu',icon:'🏐',genre:'Esporte',desc:'Mantenha a bola no ar com toques.',duration:32},
  {id:'golf',name:'Mini Golf',icon:'⛳',genre:'Esporte',desc:'Arraste para apontar e chegar à bandeira.',duration:65},
  {id:'fruit',name:'Chuva de Frutas',icon:'🍒',genre:'Arcade',desc:'Deslize a cesta, pegue frutas e evite bombas.',duration:38},
  {id:'bubbles',name:'Bolhas Coloridas',icon:'🫧',genre:'Arcade',desc:'Estoure somente a cor indicada.',duration:35},
  {id:'snake',name:'Cobra Pixel',icon:'🐍',genre:'Clássico',desc:'Controle a cobra e coma as estrelas.',duration:58},
  {id:'whack',name:'Tocas Malucas',icon:'🐹',genre:'Reflexo',desc:'Acerte os bichinhos, não as bombas.',duration:36},
  {id:'stack',name:'Torre de Blocos',icon:'🧱',genre:'Precisão',desc:'Solte os blocos no momento certo.',duration:48},
  {id:'merge',name:'Merge 2048',icon:'🔢',genre:'Puzzle',desc:'Deslize e combine números até 128.',duration:90},
  {id:'lights',name:'Luzes Mágicas',icon:'💡',genre:'Puzzle',desc:'Apague todas as luzes no tabuleiro.',duration:70},
  {id:'maze',name:'Labirinto',icon:'🧭',genre:'Puzzle',desc:'Colete estrelas e encontre a saída.',duration:68},
  {id:'kitchen',name:'Chef Express',icon:'🍳',genre:'Criativo',desc:'Prepare pedidos tocando ingredientes na ordem.',duration:48},
  {id:'potions',name:'Alquimia',icon:'🧪',genre:'Memória',desc:'Repita sequências de poções luminosas.',duration:68},
  {id:'asteroid',name:'Patrulha Espacial',icon:'🌌',genre:'Ação',desc:'Destrua asteroides e desvie dos destroços.',duration:42},
  {id:'fishing',name:'Pesca Zen',icon:'🎣',genre:'Precisão',desc:'Lance a linha quando o peixe estiver na zona.',duration:44},
  {id:'rhythm',name:'Beat Parade',icon:'🎵',genre:'Ritmo',desc:'Toque as colunas no tempo das notas.',duration:42},
];
export const ARCADE_COUNT = ARCADE_GAMES.length;
export const DIFFICULTIES = [{id:'easy',label:'Calmo',speed:.82,reward:.8},{id:'normal',label:'Normal',speed:1,reward:1},{id:'hard',label:'Insano',speed:1.32,reward:1.45}];
const rand=(a,b)=>a+Math.random()*(b-a);
const int=(a,b)=>Math.floor(rand(a,b+1));
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const round=(c,x,y,w,h,r=12)=>{c.beginPath();c.roundRect(x,y,w,h,r)};
function text(c,str,x,y,size=22,color='#fff',align='center'){c.font=`900 ${size}px system-ui`;c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;c.fillText(str,x,y)}
function box(c,x,y,w,h,color,r=12){c.fillStyle=color;round(c,x,y,w,h,r);c.fill()}
function circ(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()}
function line(c,x1,y1,x2,y2,color='#fff',width=4){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
function emoji(c,icon,x,y,size=31){text(c,icon,x,y,size)}
function drawCoins(c,n=9){for(let i=0;i<n;i++){circ(c,(i*91+11)%350,(i*72+53)%430,1.3,'#ffffff40')}}

/** A single active animation loop; all listeners are removed with cleanup. */
export function startArcade({id,body,bottom,setScore,finish,sfx=()=>{},difficulty='normal'}) {
 const info=ARCADE_GAMES.find(g=>g.id===id);if(!info)throw new Error('Unknown arcade game '+id);
 const diff=DIFFICULTIES.find(d=>d.id===difficulty)||DIFFICULTIES[1];
 const container=document.createElement('div');container.className='arcade-stage';
 container.innerHTML='<div class="arcade-meter"><span id="arcadeTime">00:40</span><span id="arcadeLives">♥ ♥ ♥</span><span id="arcadeCoins">🪙 0</span></div><canvas width="700" height="880" aria-label="Área interativa do minijogo"></canvas><div class="arcade-controls"><button class="arcade-btn" data-direction="left" aria-label="Esquerda">◀</button><span class="arcade-help" id="arcadeHelp"></span><button class="arcade-btn" data-direction="right" aria-label="Direita">▶</button></div>';
 body.innerHTML='';body.append(container);
 const canvas=container.querySelector('canvas'),c=canvas.getContext('2d');c.setTransform(2,0,0,2,0,0);
 const help=container.querySelector('#arcadeHelp');const timeLabel=container.querySelector('#arcadeTime'),livesLabel=container.querySelector('#arcadeLives'),coinsLabel=container.querySelector('#arcadeCoins');
 let running=true,raf=0,last=0,elapsed=0,score=0,coins=0,lives=3,ended=false,combo=0,keys=new Set(),pointerDown=false;
 const W=350,H=440;
 let mode;
 const api={
   get elapsed(){return elapsed},get score(){return score},get coins(){return coins},get speed(){return diff.speed*(1+elapsed/115)},get lives(){return lives},get down(){return pointerDown},get keys(){return keys},
   gain(amount=10,coin=0){if(!running)return;score+=Math.max(0,Math.round(amount));coins+=Math.max(0,Math.round(coin));combo++;setScore(score+' pts');if(coin)sfx(820,.07);else sfx(620,.04)},
   miss(penalty=0){combo=0;score=Math.max(0,score-penalty);setScore(score+' pts');sfx(155,.11,'sawtooth')},
   hit(){if(!running)return;lives--;combo=0;sfx(165,.13,'triangle');if(lives<=0)api.end(false,'Sem vidas!')},
   end(won,detail){if(ended)return;ended=true;running=false;finish(score,won?'Vitória!':'Fim de jogo',detail,{gameId:id,won,coinsCollected:coins,difficulty:diff.id, multiplier:diff.reward});},
   help(v){help.textContent=v},
   actionLabel(left,right){const b=container.querySelectorAll('.arcade-btn');b[0].textContent=left;b[1].textContent=right;},
 };
 mode=createMode(id,api);
 api.help(mode.help||info.desc);if(mode.controls===false)container.classList.add('arcade-no-controls');
 const getXY=e=>{const r=canvas.getBoundingClientRect();return{x:clamp((e.clientX-r.left)*W/r.width,0,W),y:clamp((e.clientY-r.top)*H/r.height,0,H)}};
 let downXY=null;
 const down=e=>{if(!running)return;e.preventDefault();pointerDown=true;try{canvas.setPointerCapture(e.pointerId)}catch{}downXY=getXY(e);mode.press?.(downXY);};
 const move=e=>{if(!running)return;if(pointerDown){e.preventDefault();mode.move?.(getXY(e));}};
 const up=e=>{if(!running)return;const p=getXY(e);if(downXY){mode.release?.(p,{dx:p.x-downXY.x,dy:p.y-downXY.y});downXY=null;}pointerDown=false;};
 const keydown=e=>{if(!running)return;let k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','arrowdown',' ','a','d','w','s'].includes(k)){e.preventDefault();if(!keys.has(k))mode.key?.(k);keys.add(k);}};
 const keyup=e=>keys.delete(e.key.toLowerCase());
 const controlDown=e=>{if(!running)return;e.preventDefault();const dir=e.currentTarget.dataset.direction;keys.add(dir);mode.key?.(dir);};
 const controlUp=e=>keys.delete(e.currentTarget.dataset.direction);
 const controls=Array.from(container.querySelectorAll('[data-direction]'));
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
 window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);
 function blur(){keys.clear();pointerDown=false}
 controls.forEach(el=>{el.addEventListener('pointerdown',controlDown);el.addEventListener('pointerup',controlUp);el.addEventListener('pointercancel',controlUp);el.addEventListener('pointerleave',controlUp)});
 const duration=mode.duration||info.duration;
 function frame(t){if(!running)return;const dt=Math.min(.05,last?(t-last)/1000:0);last=t;elapsed+=dt;
  c.clearRect(0,0,W,H);
  const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#15284e');bg.addColorStop(1,'#1c4475');c.fillStyle=bg;c.fillRect(0,0,W,H);drawCoins(c);
  mode.step?.(dt);if(!running)return;mode.draw?.(c);
  timeLabel.textContent='⏱ '+Math.max(0,Math.ceil(duration-elapsed))+'s';livesLabel.textContent='♥ '.repeat(Math.max(0,lives)).trim()||'♡';coinsLabel.textContent='🪙 '+coins;
  bottom.textContent=info.desc;
  if(elapsed>=duration){api.end(score>=mode.target,'Tempo encerrado · '+score+' pontos');return}raf=requestAnimationFrame(frame)}
 raf=requestAnimationFrame(frame);
 return ()=>{running=false;cancelAnimationFrame(raf);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);controls.forEach(el=>{el.removeEventListener('pointerdown',controlDown);el.removeEventListener('pointerup',controlUp);el.removeEventListener('pointercancel',controlUp);el.removeEventListener('pointerleave',controlUp)});};
}

export function createMode(id,a){
 if(['road','skate','jetpack','slalom','tunnel'].includes(id))return runners(id,a);
 if(['penalty','basket','goalie','volley','golf'].includes(id))return sports(id,a);
 if(['fruit','bubbles','snake','whack','stack'].includes(id))return reflexes(id,a);
 if(['merge','lights','maze','kitchen','potions'].includes(id))return puzzles(id,a);
 if(['asteroid','fishing','rhythm'].includes(id))return creative(id,a);
 throw new Error('Missing game implementation: '+id);
}

function runners(id,a){
 let x=175,lane=1,y=330,vy=0,jumps=0,spawn=0,objects=[],dist=0,shield=0,hold=false;
 const isSkate=id==='skate',isJet=id==='jetpack',isSnow=id==='slalom',isTunnel=id==='tunnel';
 const laneX=l=>73+l*102;
 const instruction=isSkate?'Toque para saltar • 2 saltos seguidos':isJet?'Pressione e segure para voar':'Arraste ou use ◀ ▶ para desviar';
 a.help(instruction);
 function change(step){lane=clamp(lane+step,0,2);x=laneX(lane)}
 function jump(){if(jumps<2){vy=-270-(jumps===1?20:0);jumps++;a.gain(jumps===2?3:0)}}
 return {target:85,help:instruction,
  press(p){if(isSkate)jump();else if(isJet)hold=true;else if(isSnow)x=p.x;else change(p.x<175?-1:1)},
  move(p){if(isSnow||isJet)x=clamp(p.x,34,316);if(isJet)hold=true},release(){hold=false},
  key(k){if(isSkate||isJet){if([' ','arrowup','w'].includes(k))jump();else if(k==='left'||k==='arrowleft')x=clamp(x-44,30,320);else if(k==='right'||k==='arrowright')x=clamp(x+44,30,320)}else change(['left','arrowleft','a'].includes(k)?-1:1)},
  step(dt){dist+=dt;shield=Math.max(0,shield-dt);
   if(isSkate){vy+=690*dt;y+=vy*dt;if(y>=330){y=330;vy=0;jumps=0}}
   else if(isJet){vy+=(hold||a.keys.has(' ')?-550:390)*dt;vy=clamp(vy,-220,230);y=clamp(y+vy*dt,35,375)}
   else if(!isSnow)x+=(laneX(lane)-x)*Math.min(1,dt*15);
   spawn-=dt;if(spawn<=0){spawn=rand(.5,1.0)/a.speed;let track=isSnow?rand(42,310):isSkate?rand(0,1):int(0,2),kind=Math.random()<.37?'coin':'hazard';objects.push({x:isSnow?track:isSkate?360:laneX(track),y:isSkate?(kind==='coin'?285:330):-35,kind,passed:false,spin:0})}
   const speed=(isSkate?185:158)*a.speed;
   for(const o of objects){o.spin+=dt*3;if(isSkate){o.x-=speed*dt;const hit=Math.abs(o.x-85)<28&&Math.abs(y-o.y)<34;if(hit&&!o.passed){o.passed=true;if(o.kind==='coin')a.gain(12,1);else if(y>287&&shield===0){a.hit();shield=1.3}}}
    else {o.y+=speed*dt;const hit=Math.abs(o.x-x)<(isSnow?27:38)&&Math.abs(o.y-y)<33;if(hit&&!o.passed){o.passed=true;if(o.kind==='coin')a.gain(12,1);else if(shield===0){a.hit();shield=1.15}}}
   }
   objects=objects.filter(o=>!o.passed&&(isSkate?o.x>-45:o.y<480));
   if(Math.floor(dist*2)!==Math.floor((dist-dt)*2))a.gain(1);
  },
  draw(c){
   if(isSkate){box(c,0,355,350,80,'#304563',0);for(let k=0;k<16;k++)box(c,(k*54-(dist*180)%54),359,28,6,'#f9dd76',2);line(c,0,354,350,354,'#bbdeed',5)}
   else{box(c,21,0,308,440,isSnow?'#ceeafb':'#233650',6);if(!isSnow){for(let l=0;l<4;l++){let xx=22+l*102;line(c,xx,0,xx,440,'#adc4dd44',3)}for(let i=0;i<6;i++)for(let l=1;l<3;l++)box(c,20+l*102-3,(i*90+dist*135)%500-60,6,44,'#ffdd8699',2)}else{for(let i=0;i<14;i++){emoji(c,'❄',(i*89+15)%350,(i*103+dist*90)%440,13)}}}
   for(const o of objects){if(o.kind==='coin'){circ(c,o.x,o.y-4,15,'#efb725');circ(c,o.x,o.y-4,11,'#ffeb79');text(c,'★',o.x,o.y-4,17,'#ac6d18')}else{emoji(c,isSkate?'🚧':isSnow?'🌲':isJet?'☄️':isTunnel?'⚡':'🚗',o.x,o.y,isSkate?32:35)}}
   if(shield>0&&Math.floor(shield*11)%2===0)c.globalAlpha=.4;
   emoji(c,isSkate?'🛹':isJet?'🚀':isSnow?'⛷️':isTunnel?'🛸':'🏎️',isSkate?85:x,y,45);c.globalAlpha=1;
   text(c,'DISTÂNCIA  '+Math.floor(dist*17)+'m',175,25,13,'#fff8da');
  }
 }
}

function sports(id,a){
 let target={x:rand(70,280),y:rand(100,250)},shots=0,misses=0,angle=0,ball={x:175,y:260,vx:110,vy:-130},moving=0,aim=null,rounds=0,position={x:58,y:345},hole={x:280,y:110},golfShots=0;
 const maxShots=10;
 return {target:70,duration:id==='golf'?72:undefined,controls:id==='basket'||id==='volley'?false:true,
  help:({penalty:'Toque na meta longe do goleiro',basket:'Toque na hora que a barra ficar verde',goalie:'Toque na bola antes do gol',volley:'Toque na bola para devolvê-la',golf:'Arraste a bola para definir direção e força'})[id],
  press(p){
   if(id==='penalty'){shots++;const keeper=175+Math.sin(a.elapsed*2.3)*91;let scored=p.y<285&&p.y>60&&Math.abs(p.x-keeper)>45;if(scored)a.gain(24,2);else{misses++;a.miss(2)}target={x:p.x,y:p.y};if(shots===maxShots)a.end(shots-misses>=5,'Gols: '+(shots-misses)+'/'+shots)}
   if(id==='basket'){shots++;const timing=(Math.sin(a.elapsed*2.8)+1)/2;if(timing>.67){a.gain(20+Math.round(timing*12),2)}else{misses++;a.miss(2)}if(shots===maxShots)a.end(shots-misses>=6,'Cestas: '+(shots-misses)+'/'+shots)}
   if(id==='goalie'){if(distance(p,target)<46&&target.y<360){a.gain(19,2);shots++;target={x:rand(52,298),y:35}}else{a.miss(3)}}
   if(id==='volley'){if(Math.abs(ball.x-p.x)<75&&Math.abs(ball.y-p.y)<80&&ball.vy>0){ball.vy=-Math.abs(rand(210,290));ball.vx=rand(-100,100);a.gain(12,1)}else a.miss(1)}
   if(id==='golf'){aim=p}
  },
  release(p){if(id==='golf'&&aim){golfShots++;const dx=aim.x-p.x,dy=aim.y-p.y,force=clamp(Math.hypot(dx,dy),10,130);const ang=Math.atan2(dy,dx);position.x=clamp(position.x+Math.cos(ang)*force*1.25,15,335);position.y=clamp(position.y+Math.sin(ang)*force*1.25,30,405);aim=null;
   if(distance(position,hole)<35){a.gain(Math.max(25,130-golfShots*9),7);rounds++;position={x:58,y:345};hole={x:rand(235,310),y:rand(75,170)};golfShots=0;if(rounds>=3)a.end(true,'Três buracos concluídos!')}
   else if(golfShots>=6){a.hit();golfShots=0;position={x:58,y:345}}}}
  ,step(dt){moving+=dt;
   if(id==='goalie'){target.y+=(130+a.elapsed*3)*a.speed*dt;target.x+=Math.sin(moving*2)*dt*20;if(target.y>387){shots++;misses++;a.hit();target={x:rand(52,298),y:35}}if(shots>=12)a.end(misses<=4,'Defesas: '+(shots-misses))}
   if(id==='volley'){ball.vy+=380*dt;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.x<28||ball.x>322)ball.vx*=-1;if(ball.y<45)ball.vy=50;if(ball.y>395){a.hit();ball={x:rand(85,270),y:100,vx:rand(-75,75),vy:75}}}
  },
  draw(c){
   if(id==='penalty'||id==='goalie'){box(c,18,62,314,228,'#3b9469',16);for(let k=0;k<7;k++)line(c,28+k*49,74,28+k*49,276,'#c7ffe85c',2);for(let k=0;k<6;k++)line(c,28,74+k*40,322,74+k*40,'#c7ffe85c',2);c.strokeStyle='#fff';c.lineWidth=9;round(c,35,65,280,224,8);c.stroke();emoji(c,'🧤',175+Math.sin(moving*2.3)*91,218,51);if(id==='goalie')emoji(c,'⚽',target.x,target.y,42);else{emoji(c,'⚽',175,367,46);text(c,'GOLS '+(shots-misses)+' / '+maxShots,175,30,18);if(shots) {circ(c,target.x,target.y,8,'#fff8')}}}
   if(id==='basket'){box(c,20,70,310,260,'#dfad70',20);line(c,255,90,255,237,'#eff7ff',9);box(c,220,108,70,8,'#fff',2);c.strokeStyle='#e54f37';c.lineWidth=7;c.beginPath();c.ellipse(225,170,52,15,0,0,Math.PI*2);c.stroke();emoji(c,'🏀',100,319,60);text(c,'TOQUE NA FAIXA VERDE!',175,40,17);box(c,24,360,302,34,'#ca4d62');box(c,226,360,100,34,'#40d18b');box(c,24+((Math.sin(a.elapsed*2.8)+1)/2)*285,353,9,49,'#fff',3);text(c,'CESTAS '+(shots-misses)+' / 10',175,421,15)}
   if(id==='volley'){box(c,0,385,350,65,'#d4a568',0);line(c,5,290,345,290,'#f5f9ff',5);for(let k=0;k<9;k++)line(c,k*40,292,k*40,348,'#fff7',2);emoji(c,'🏐',ball.x,ball.y,55);text(c,'TOQUE NA BOLA QUANDO CAIR',175,35,16)}
   if(id==='golf'){box(c,17,40,316,370,'#6eb974',20);for(let i=0;i<6;i++)circ(c,(i*77+31)%350,(i*93+80)%400,13,'#58a968');circ(c,hole.x,hole.y,19,'#2b5b40');line(c,hole.x,hole.y-5,hole.x,hole.y-64,'#fff',3);text(c,'🚩',hole.x+12,hole.y-62,30);circ(c,position.x,position.y,13,'#fff');circ(c,position.x-4,position.y-4,3,'#cdd4e1');text(c,'BURACO '+(rounds+1)+'/3',175,21,16);if(aim){line(c,position.x,position.y,position.x+(aim.x-position.x)/2,position.y+(aim.y-position.y)/2,'#fff8',3)}text(c,'Arraste da bola para longe',175,423,12)}
  }
 }
}

function reflexes(id,a){
 let items=[],spawn=0,x=175,segments=[{x:8,y:12},{x:7,y:12},{x:6,y:12}],dir={x:1,y:0},nextDir=null,food={x:12,y:12},moveT=0,blocks=[{x:70,w:210,y:390}],block={x:0,w:210,y:363,v:128},spawnT=0,chosen=int(0,3),colors=['#ef6e8e','#73c8ff','#fed774','#7fe2a4'],lastMole=-1;
 const isSnake=id==='snake',isStack=id==='stack';
 if(isSnake){a.actionLabel('↶','↷');a.help('Deslize para virar • não bata na cauda');}
 return {target:id==='lights'?1:80,duration:id==='snake'?68:undefined,help:id==='stack'?'Toque para soltar bloco • alinhe com a torre':id==='fruit'?'Arraste a cesta para apanhar frutas':id==='bubbles'?'Estoure as bolhas da cor pedida':id==='whack'?'Acerte os bichinhos, nunca 💣':'Deslize para mover',controls:!['bubbles','whack','stack'].includes(id),
  press(p){
   if(id==='fruit')x=p.x;
   if(id==='bubbles'){const ix=items.findIndex(o=>distance(p,o)<o.r+8);if(ix>=0){const o=items.splice(ix,1)[0];if(o.color===chosen)a.gain(13,2);else{a.miss(6);a.hit()}chosen=int(0,3)}}
   if(id==='whack'){const col=clamp(Math.floor((p.x-24)/102),0,2),row=clamp(Math.floor((p.y-75)/106),0,2);let ix=row*3+col;if(ix===lastMole&&items[0]){if(items[0].bomb){a.hit();a.miss(6)}else a.gain(16,2);items=[];lastMole=-1}else a.miss(2)}
   if(id==='stack'){const last=blocks.at(-1),left=Math.max(last.x,block.x),right=Math.min(last.x+last.w,block.x+block.w),overlap=right-left;if(overlap<16){a.end(false,'A torre caiu');return;}a.gain(15+Math.round(overlap/17),2);blocks.push({x:left,w:overlap,y:block.y});if(blocks.length>=10){a.end(true,'Torre com '+(blocks.length-1)+' andares');return}block={x:0,w:overlap,y:block.y-28,v:(120+blocks.length*22)*a.speed};if(block.y<125){a.end(true,'Torre terminada!')}}
  },move(p){if(id==='fruit')x=p.x},release(p,{dx,dy}={}){if(isSnake&&Math.hypot(dx||0,dy||0)>20){turn(Math.abs(dx)>Math.abs(dy)?{x:Math.sign(dx),y:0}:{x:0,y:Math.sign(dy)})}},
  key(k){if(id==='fruit'){x=clamp(x+(['left','arrowleft'].includes(k)?-45:45),30,320)}if(isSnake){if(['arrowleft','a','left'].includes(k))turn({x:-1,y:0});else if(['arrowright','d','right'].includes(k))turn({x:1,y:0});else if(['arrowup','w'].includes(k))turn({x:0,y:-1});else if(['arrowdown','s'].includes(k))turn({x:0,y:1})}},
  step(dt){if(id==='fruit'||id==='bubbles'){spawn-=dt;if(spawn<=0){spawn=rand(.30,.65)/a.speed;items.push({x:rand(30,318),y:id==='bubbles'?rand(90,410):-20,r:id==='bubbles'?rand(16,26):22,color:int(0,3),type:Math.random()<.18?'bomb':'fruit',speed:rand(100,190)*a.speed})}for(const o of items){o.y+=(id==='bubbles'?-25:o.speed)*dt;if(id==='fruit'&&o.y>345&&Math.abs(o.x-x)<44&&!o.hit){o.hit=true;if(o.type==='bomb')a.hit();else a.gain(13,2)}else if(id==='fruit'&&o.y>445&&!o.hit){o.hit=true;if(o.type==='fruit')a.miss(2)}}items=items.filter(o=>!o.hit&&o.y>-50&&o.y<460)}
   if(id==='whack'){spawn-=dt;if(spawn<=0){spawn=rand(.52,.97)/a.speed;lastMole=int(0,8);items=[{bomb:Math.random()<.22,ttl:rand(.55,1.1)/a.speed}]}if(items.length){items[0].ttl-=dt;if(items[0].ttl<=0){if(!items[0].bomb)a.miss(1);items=[];lastMole=-1}}}
   if(isSnake){moveT+=dt;if(moveT>.17/a.speed){moveT=0;if(nextDir)dir=nextDir;nextDir=null;let h={x:segments[0].x+dir.x,y:segments[0].y+dir.y};if(h.x<0||h.y<0||h.x>=16||h.y>=18||segments.slice(0,-1).some(s=>s.x===h.x&&s.y===h.y)){a.end(false,'Colidiu com a parede ou a cauda');return}segments.unshift(h);if(h.x===food.x&&h.y===food.y){a.gain(25,3);food={x:int(1,14),y:int(1,16)};if(segments.length>=11)a.end(true,'Cobra gigante!')}else segments.pop()}}
   if(isStack){block.x+=block.v*dt;if(block.x<0){block.x=0;block.v=Math.abs(block.v)}if(block.x+block.w>350){block.x=350-block.w;block.v=-Math.abs(block.v)}}
  },
  draw(c){
   if(id==='fruit'){emoji(c,'🧺',x,376,62);for(const o of items)emoji(c,o.type==='bomb'?'💣':['🍎','🍇','🍋','🍓'][o.color],o.x,o.y,37);text(c,'PEGUE AS FRUTAS, EVITE BOMBAS',175,35,15)}
   if(id==='bubbles'){text(c,'ESTOURE A COR',175,29,15);box(c,118,54,114,40,colors[chosen],10);for(const o of items){circ(c,o.x,o.y,o.r,colors[o.color]);circ(c,o.x-o.r/3,o.y-o.r/3,5,'#ffffffa0')}}
   if(id==='whack'){text(c,'TOCAS MALUCAS',175,35,21);for(let i=0;i<9;i++){let xx=74+(i%3)*102,yy=120+Math.floor(i/3)*104;circ(c,xx,yy+15,40,'#12253e');circ(c,xx,yy+11,35,'#60472b');if(i===lastMole&&items[0])emoji(c,items[0].bomb?'💣':'🐹',xx,yy-12,49)}}
   if(isSnake){for(let i=0;i<16;i++)for(let j=0;j<18;j++)box(c,15+i*20,38+j*20,19,19,(i+j)%2===0?'#203a58':'#284966',3);for(let i=segments.length-1;i>=0;i--){const s=segments[i];box(c,16+s.x*20,39+s.y*20,18,18,i===0?'#ffc15b':'#79db9c',5)}text(c,'★',25+food.x*20,49+food.y*20,22,'#ffe476');text(c,'COMIDAS '+(segments.length-3)+'/8',175,424,15)}
   if(isStack){text(c,'ALINHE OS BLOCOS',175,37,20);for(const b of blocks){box(c,b.x,b.y,b.w,26,'#70d5eb',3);line(c,b.x,b.y+23,b.x+b.w,b.y+23,'#234b75',3)}box(c,block.x,block.y,block.w,26,'#ffe184',3);text(c,'ANDARES '+(blocks.length-1)+'/9',175,424,16)}
  }};
 function turn(d){if(d.x===-dir.x&&d.y===-dir.y)return;nextDir=d;}
}

function puzzles(id,a){
 let size=4,grid=[],steps=0,recipes=['🍎','🥦','🍞','🧀','🥚','🥕'],recipe=[],progress=0,rounds=0,showUntil=0,mazeX=0,mazeY=0,mazes=mazePattern(),mazeStarTaken=false;
 const choose=()=>recipes[int(0,recipes.length-1)];
 if(id==='merge'){grid=Array(16).fill(0);spawnTile();spawnTile()}
 if(id==='lights'){grid=Array(16).fill(0);for(let i=0;i<9;i++)toggle(int(0,15));}
 if(id==='kitchen'){recipe=Array.from({length:3},choose)}
 if(id==='potions'){recipe=Array.from({length:2},()=>int(0,3));showUntil=3.5}
 const icon=(n)=>['🔴','🔵','🟢','🟡'][n];
 return{target:100,duration:['merge','lights','maze','potions'].includes(id)?80:undefined,
  controls:!['merge','lights','kitchen','potions'].includes(id),
  help:{merge:'Deslize para combinar peças iguais',lights:'Toque nos quadrados e apague todas',maze:'Use as setas ou deslize para chegar à saída',kitchen:'Toque os ingredientes do pedido na ordem',potions:'Observe a sequência, depois repita'}[id],
  press(p){if(id==='lights'){let ix=Math.floor((p.x-30)/73),iy=Math.floor((p.y-85)/73);if(ix>=0&&ix<4&&iy>=0&&iy<4){toggle(iy*4+ix);steps++;a.gain(2);if(grid.every(n=>n===0))a.end(true,'Todas as luzes apagadas em '+steps+' toques')}}
   if(id==='kitchen'){let ix=Math.floor((p.x-25)/102),iy=Math.floor((p.y-205)/82),n=iy*3+ix;if(n>=0&&n<6){if(recipes[n]===recipe[progress]){progress++;a.gain(8,1);if(progress===recipe.length){rounds++;a.gain(18,3);if(rounds>=8)a.end(true,'8 pedidos servidos!');recipe=Array.from({length:3+Math.floor(rounds/3)},choose);progress=0}}else{a.hit();a.miss(4)}}}
   if(id==='potions'&&a.elapsed>=showUntil){let ix=p.x<175?0:1,iy=p.y<220?0:1,n=iy*2+ix;if(n===recipe[progress]){a.gain(13,2);progress++;if(progress===recipe.length){rounds++;progress=0;if(rounds>=5){a.end(true,'5 fórmulas acertadas!');return}recipe.push(int(0,3));showUntil=a.elapsed+recipe.length*.73+1}}else{a.hit();a.miss(7);progress=0;showUntil=a.elapsed+recipe.length*.73+1}}
  },release(p,{dx,dy}={}){if(id==='merge'){if(Math.abs(dx)<16&&Math.abs(dy)<16)return;move(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up')}else if(id==='maze'){const k=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';navigate(k)}},
  key(k){const dirs={left:'left',right:'right',arrowleft:'left',arrowright:'right',a:'left',d:'right',up:'up',down:'down',arrowup:'up',arrowdown:'down',w:'up',s:'down'};if(id==='merge')move(dirs[k]);if(id==='maze')navigate(dirs[k])},
  step(dt){if(id==='potions'){/* replay is visualized by elapsed time */}},
  draw(c){
   if(id==='merge'){text(c,'FAÇA 128 PARA VENCER',175,36,18);for(let i=0;i<16;i++){const v=grid[i],x=27+(i%4)*76,y=65+Math.floor(i/4)*76;box(c,x,y,69,69,v?['#f8dc8e','#e2b6a7','#9ac8ef','#81dcb6','#ceacf2','#ed9aa7','#ffdd77'][Math.min(6,Math.log2(v)-1)]:'#7890a677',10);if(v)text(c,String(v),x+34,y+35,v>=128?25:30,'#202d44')}text(c,'DESLIZE PARA MOVER',175,409,15)}
   if(id==='lights'){text(c,'APAGUE TODAS',175,38,20);for(let i=0;i<16;i++){const x=28+(i%4)*77,y=80+Math.floor(i/4)*77;box(c,x,y,69,69,grid[i]?'#ffe07b':'#334e70',13);if(grid[i])circ(c,x+34,y+34,21,'#fff7bf');else circ(c,x+34,y+34,7,'#1b304c')}text(c,'TOQUES '+steps,175,417,16)}
   if(id==='maze'){for(let yy=0;yy<10;yy++)for(let xx=0;xx<10;xx++)box(c,25+xx*30,65+yy*30,29,29,mazes[yy][xx]?'#142e4a':'#77bdaf',1);emoji(c,'⭐',25+7*30+15,65+4*30+15,23);emoji(c,'🏁',25+9*30+15,65+9*30+15,25);circ(c,25+mazeX*30+15,65+mazeY*30+15,11,'#ffd572');text(c,'ENCONTRE A SAÍDA',175,34,18);text(c,'DESLIZE OU USE SETAS',175,397,15)}
   if(id==='kitchen'){text(c,'PEDIDO '+(rounds+1)+'/8',175,35,20);box(c,12,70,326,105,'#fff1dc',16);text(c,recipe.map((v,i)=>i<progress?'✅':v).join('  '),175,115,29,'#1d3850');text(c,'MONTE O PEDIDO',175,186,13);for(let i=0;i<6;i++){let x=28+(i%3)*102,y=215+Math.floor(i/3)*82;box(c,x,y,90,76,'#f1d69c',13);emoji(c,recipes[i],x+45,y+36,38)}text(c,'ERROS TIRAM VIDAS',175,412,15)}
   if(id==='potions'){text(c,'MEMORIZE E REPITA',175,37,18);let current=-1;if(a.elapsed<showUntil){let rest=showUntil-a.elapsed;if(rest>1){let index=Math.floor((showUntil-1-a.elapsed)/.73);current=recipe[clamp(recipe.length-1-index,0,recipe.length-1)]}}for(let i=0;i<4;i++){let x=30+(i%2)*148,y=85+Math.floor(i/2)*148;box(c,x,y,136,136,['#f06c7d','#70aff3','#7edd9a','#f7d86d'][i],20);text(c,icon(i),x+68,y+65,current===i?69:49)}text(c,a.elapsed<showUntil?'OBSERVE A SEQUÊNCIA':'SUA VEZ  '+progress+'/'+recipe.length,175,415,15)}
  }};
 function spawnTile(){let free=grid.map((v,i)=>v===0?i:-1).filter(i=>i>=0);if(!free.length)return;grid[free[int(0,free.length-1)]]=Math.random()<.88?2:4}
 function toggle(i){const x=i%4,y=Math.floor(i/4);for(let [dx,dy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){let xx=x+dx,yy=y+dy;if(xx>=0&&xx<4&&yy>=0&&yy<4)grid[yy*4+xx]^=1}}
 function move(dir){if(!dir)return;const before=grid.join(',');for(let fixed=0;fixed<4;fixed++){let indexes=[];for(let j=0;j<4;j++)indexes.push(dir==='left'?fixed*4+j:dir==='right'?fixed*4+3-j:dir==='up'?j*4+fixed:(3-j)*4+fixed);let values=indexes.map(i=>grid[i]).filter(Boolean);let merged=[];for(let j=0;j<values.length;j++){if(values[j]===values[j+1]){let v=values[j]*2;merged.push(v);a.gain(v,Math.min(6,v/8));j++;if(v>=128)a.end(true,'Bloco 128 conquistado!')}else merged.push(values[j])}indexes.forEach((ix,j)=>grid[ix]=merged[j]||0)}if(before!==grid.join(','))spawnTile();if(!grid.some(v=>!v)&&!canMerge())a.end(false,'Sem movimentos!')}
 function canMerge(){return grid.some((v,i)=>i%4<3&&v===grid[i+1]||i<12&&v===grid[i+4])}
 function navigate(k){const dir={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[k];if(!dir)return;let xx=mazeX+dir[0],yy=mazeY+dir[1];if(xx<0||yy<0||xx>9||yy>9||mazes[yy][xx])return;mazeX=xx;mazeY=yy;a.gain(2);if(xx===7&&yy===4&&!mazeStarTaken){mazeStarTaken=true;a.gain(30,5)}if(xx===9&&yy===9)a.end(true,'Saída encontrada!')}
}
function mazePattern(){return [
'0000100000','1100101100','0000000100','0111100100','0000000000',
'0010110110','0000100000','0110001100','0000100000','0110000000'].map(s=>s.split('').map(Number))}

function creative(id,a){
 let player={x:175,y:373},objects=[],projectiles=[],spawn=0,fire=0,cast=0,fishingZone=rand(.25,.7),catchCount=0,notes=[],beat=0;
 return{target:85,duration:id==='fishing'?47:undefined,
  help:id==='asteroid'?'Arraste a nave para atirar e desviar':id==='fishing'?'Toque quando o marcador cair sobre a faixa verde':'Toque a coluna quando a nota chegar na linha amarela',
  controls:id==='asteroid',
  press(p){if(id==='asteroid')player.x=clamp(p.x,20,330);
   if(id==='fishing'){cast++;let marker=(Math.sin(a.elapsed*4.8*a.speed)+1)/2;if(Math.abs(marker-fishingZone)<.12){a.gain(25,4);catchCount++;fishingZone=rand(.20,.80);if(catchCount>=8)a.end(true,'8 peixes pescados!')}else{a.miss(3);if(cast%4===0)a.hit()}}
   if(id==='rhythm'){let l=clamp(Math.floor(p.x/87.5),0,3);let index=notes.findIndex(n=>n.lane===l&&Math.abs(n.y-364)<47);if(index>=0){notes.splice(index,1);a.gain(17,2)}else a.miss(2)}
  },move(p){if(id==='asteroid')player.x=clamp(p.x,20,330)},key(k){if(id==='asteroid')player.x=clamp(player.x+(['left','a','arrowleft'].includes(k)?-44:44),20,330);if(id==='rhythm'){let ix=['a','s','d','f'].indexOf(k);if(ix>=0){let i=notes.findIndex(n=>n.lane===ix&&Math.abs(n.y-364)<47);if(i>=0){notes.splice(i,1);a.gain(17,2)}}}},
  step(dt){if(id==='asteroid'){spawn-=dt;fire-=dt;if(fire<=0){projectiles.push({x:player.x,y:player.y});fire=.18}if(spawn<=0){objects.push({x:rand(30,320),y:-20,r:rand(14,23),hp:1});spawn=rand(.25,.64)/a.speed}projectiles.forEach(o=>o.y-=430*dt);for(const o of objects){o.y+=rand(85,125)*a.speed*dt;if(distance(o,player)<32){o.y=500;a.hit()}for(const shot of projectiles){if(distance(o,shot)<o.r+5){o.y=500;shot.y=-40;a.gain(16,2);break}}}objects=objects.filter(o=>o.y<470);projectiles=projectiles.filter(o=>o.y>-5)}
   if(id==='rhythm'){spawn-=dt;if(spawn<=0){notes.push({lane:int(0,3),y:-15});spawn=rand(.42,.72)/a.speed}for(const n of notes)n.y+=145*a.speed*dt;let bad=notes.filter(n=>n.y>420);bad.forEach(()=>a.miss(4));notes=notes.filter(n=>n.y<=420)}
  },draw(c){
   if(id==='asteroid'){for(let i=0;i<35;i++)circ(c,(i*81+27)%350,(i*143+a.elapsed*70)%440,1.7,'#fff7');projectiles.forEach(o=>box(c,o.x-2,o.y,4,14,'#a4fbe3',3));objects.forEach(o=>emoji(c,'☄️',o.x,o.y,33));emoji(c,'🛸',player.x,player.y,55);text(c,'MOVA A NAVE PARA ATIRAR',175,30,16)}
   if(id==='fishing'){text(c,'PESQUE 8 PEIXES',175,31,21);emoji(c,'🎣',175,105,76);emoji(c,'🐟',175,230,74);box(c,25,330,300,27,'#b6d1e8',12);box(c,25+fishingZone*300-32,330,64,27,'#7ce8a9',5);let marker=(Math.sin(a.elapsed*4.8*a.speed)+1)/2;box(c,25+marker*300-4,323,8,41,'#fff',3);text(c,'ACERTOS '+catchCount+'/8',175,402,20)}
   if(id==='rhythm'){for(let i=0;i<4;i++){box(c,12+i*84,35,76,380,i%2?'#172f58':'#1e4268',9);text(c,['A','S','D','F'][i],50+i*84,411,19,'#fff8')}line(c,0,364,350,364,'#ffe286',8);notes.forEach(n=>{circ(c,50+n.lane*84,n.y,20,['#ff8594','#80d5fa','#ffd889','#89e9bc'][n.lane]);text(c,'♪',50+n.lane*84,n.y,24,'#19304a')});text(c,'TOQUE NA LINHA AMARELA',175,17,15)}
  }};
}
