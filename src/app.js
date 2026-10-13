import {ARCADE_GAMES,DIFFICULTIES,startArcade} from './arcade.js';
import {ROOMS,ROOM_COLORS,FOODS,COLORS,HATS,DECORS,GLASSES,OUTFITS,initialState,loadState,saveState,clamp,tick,addXP,feed,buyFood,usePotion,purchaseCosmetic,rewardGame,nextRoom} from './state.js';

const $=id=>document.getElementById(id);
function safeStorage(){try{return window.localStorage}catch{return null}}
const canvas=$('petCanvas'), ctx=canvas.getContext('2d');
const device=$('device'), toolbar=$('toolbar'),modalLayer=$('modalLayer'),modalCard=$('modalCard');
const gameLayer=$('gameLayer'),gameBody=$('gameBody'),gameBottom=$('gameBottom');
let state=loadState(safeStorage());let elapsed=0,noticeTimer,anim=null,bubbleUntil=0,soapUntil=0,showerUntil=0,blinkAt=Date.now()+1600,blinkUntil=0,joyUntil=0;
let currentGame=null,gameCleanup=()=>{},sound=true,micRecorder=null,micStream=null,micTimer=0;
let dragging=null,dragGhost=null;let gameSession=0;
const roomHints=['Toque no bichinho para fazer carinho!','Arraste a comida até a boca!','Cuide da saúde com poções!','Toque na bola ou escolha um jogo!','Apague a luz para descansar!','Esfregue sabonete e use o chuveiro!','Explore o jardim e ganhe moedas!'];
const needs=[['fullness','Comida','🍗'],['health','Saúde','✚'],['fun','Diversão','☻'],['energy','Energia','ϟ'],['clean','Limpeza','🧼']];
const safe=(text='')=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function persist(){saveState(state,safeStorage())}
function soundFx(frequency=440,duration=.09,type='sine'){
 if(!sound)return;try{const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
 window.__petAudio??=new AudioContext();const a=window.__petAudio;if(a.state==='suspended')a.resume();const o=a.createOscillator(),gain=a.createGain();o.type=type;o.frequency.setValueAtTime(frequency,a.currentTime);o.frequency.exponentialRampToValueAtTime(frequency*.78,a.currentTime+duration);gain.gain.setValueAtTime(.055,a.currentTime);gain.gain.exponentialRampToValueAtTime(.001,a.currentTime+duration);o.connect(gain);gain.connect(a.destination);o.start();o.stop(a.currentTime+duration);
 }catch{/* audio is optional */}}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('toast').classList.remove('show'),2400)}
function floating(icon,x=50,y=49){const s=document.createElement('span');s.className='floating';s.textContent=icon;s.style.left=x+'%';s.style.top=y+'%';$('floaters').append(s);setTimeout(()=>s.remove(),830)}
function success(result,symbol='✨'){if(!result)return;if(!result.ok){toast(result.message||'Não foi possível');soundFx(160,.13,'triangle');return;}soundFx(640,.09);floating(symbol);if(result.xp>0){toast('Novo nível! '+state.level+' 🎉');soundFx(880,.17)}else toast(result.message||'Pronto!');joyUntil=Date.now()+1200;persist();updateHUD()}
function updateHUD(){
 $('coinNum').textContent=state.coins.toLocaleString('pt-BR');$('levelNum').textContent=state.level;
 $('xpFill').style.width=(100*state.xp/(60+state.level*25)).toFixed(1)+'%';
 document.querySelectorAll('.stat[data-stat]').forEach(btn=>{let v=state[btn.dataset.stat];btn.classList.toggle('low',v<30);btn.classList.toggle('mid',v>=30&&v<65);btn.querySelector('i').style.height=(100-v)+'%';btn.title=btn.getAttribute('aria-label')+': '+Math.round(v)+'%';});
 $('roomTitle').textContent=ROOMS[state.room];$('roomHint').textContent=roomHints[state.room];$('sleepCover').classList.toggle('active',state.room===4&&state.lightOff);
}
const actions={
 'Hall':[['outside','🏡','Fora'],['mic','🎤','Micro'],['shop','🏪','Loja']],
 'Kitchen':[['fridge','🧊','Geladeira'],['feed',FOODS[state.selectedFood]?.symbol||'🍎','Comida'],['shop','🏪','Loja']],
 'Lab':[['potions','🧪','Poções'],['status','💚','Saúde'],['shop','🏪','Loja']],
 'Game Room':[['games','🎮','Jogos'],['ball','⚽','Bola'],['shop','🏪','Loja']],
 'Bedroom':[['wardrobe','👚','Armário'],['lamp','💡','Lâmpada'],['shop','🏪','Loja']],
 'Bathroom':[['shower','🚿','Chuveiro'],['soap','🧼','Sabonete'],['shop','🏪','Loja']],
 'Outside':[['garden','🌼','Jardim'],['ball','🏀','Bola'],['home','🏠','Casa']]
};
function renderToolbar(){let a=actions[ROOMS[state.room]].map(([key,icon,label])=>[key,key==='feed'?FOODS[state.selectedFood]?.symbol||'🍎':icon,label]);toolbar.innerHTML=a.map(([key,icon,label])=>`<button type="button" class="tool" data-action="${key}" aria-label="${safe(label)}"><span class="tool-icon">${icon}</span><span class="tool-label">${safe(label)}</span>${key==='feed'?`<small>${state.inventory[state.selectedFood]||0}</small>`:''}</button>`).join('');
 toolbar.querySelectorAll('button').forEach(btn=>{const action=btn.dataset.action;
 if(action==='feed'||action==='soap')attachDragTool(btn,action);else btn.addEventListener('click',()=>runAction(action));});
}
function navigate(delta){closeModal();if(currentGame)stopGame();nextRoom(state,delta);renderToolbar();updateHUD();persist();soundFx(370,.06)}
$('prevRoom').addEventListener('click',()=>navigate(-1));$('nextRoom').addEventListener('click',()=>navigate(1));
window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();if(currentGame)stopGame();}if(['ArrowLeft','ArrowRight'].includes(e.key)&&!currentGame&&modalLayer.classList.contains('hidden')){navigate(e.key==='ArrowLeft'?-1:1);e.preventDefault();}});
let swipeStart=null;
device.addEventListener('touchstart',e=>{if(e.touches.length===1&&e.target===canvas){swipeStart={x:e.touches[0].clientX,y:e.touches[0].clientY}}},{passive:true});
device.addEventListener('touchend',e=>{if(!swipeStart||!e.changedTouches[0])return;const dx=e.changedTouches[0].clientX-swipeStart.x;if(Math.abs(dx)>90&&Math.abs(e.changedTouches[0].clientY-swipeStart.y)<65)navigate(dx>0?-1:1);swipeStart=null},{passive:true});
function openModal(title,contents,footer=''){if(currentGame)stopGame();modalCard.classList.remove('boutique-modal');modalCard.innerHTML=`<div class="modal-head"><h2>${safe(title)}</h2><button type="button" id="modalClose" class="close" aria-label="Fechar">×</button></div><div class="modal-content">${contents}</div>${footer?`<div class="modal-footer">${footer}</div>`:''}`;modalLayer.classList.remove('hidden');$('modalClose').addEventListener('click',closeModal);}
function closeModal(){modalLayer.classList.add('hidden');modalCard.innerHTML=''}
modalLayer.addEventListener('click',e=>{if(e.target===modalLayer)closeModal()});
function itemCard(symbol,name,desc,action,id,classes=''){return `<button class="item-card ${classes}" data-shop-action="${action}" data-id="${safe(id)}"><span class="item-icon">${symbol}</span><span class="name">${safe(name)}</span><span class="price">${safe(desc)}</span></button>`}
function renderShop(tab='food',selected=null){
 const tabs=[['food','🍔','Comidas'],['potion','🧪','Poções'],['skin','🎨','Peles'],['hat','👒','Chapéus'],['glasses','🕶️','Óculos'],['outfit','👕','Roupas'],['decor','🏠','Decoração']];
 const potions=[{id:'health',label:'Cura+',symbol:'❤️',price:28,description:'Recupera 28 pontos de saúde.'},{id:'energy',label:'Energia+',symbol:'⚡',price:32,description:'Recupera 32 pontos de energia.'},{id:'hunger',label:'Nutrição+',symbol:'🍗',price:26,description:'Recupera 27 pontos de alimentação.'}];
 const cosmetics={skin:COLORS,hat:HATS,glasses:GLASSES,outfit:OUTFITS,decor:DECORS};
 const ownership={skin:'ownedSkins',hat:'ownedHats',glasses:'ownedGlasses',outfit:'ownedOutfits',decor:'ownedDecors'};
 const entries=tab==='food'?Object.entries(FOODS).map(([id,f])=>({id,...f,symbol:f.symbol,label:f.label,description:'+'+f.food+' alimentação · '+f.xp+' XP'})):tab==='potion'?potions:cosmetics[tab]?.map(item=>({...item,symbol:tab==='skin'?'<span class="shop-color" style="background:'+item.value+'"></span>':tab==='decor'?item.value||'◻️':item.symbol||'✨',description:tab==='skin'?'Cor de pele':tab==='decor'?'Decoração do cenário':'Visual para seu amigo'}))||[];
 const entry=entries.find(x=>x.id===selected)||entries[0];if(!entry)return;
 const owned=(e)=>tab==='food'?false:tab==='potion'?false:Boolean(state[ownership[tab]]?.includes(e.id));
 const equipped=(e)=>Boolean(cosmetics[tab]&&state[tab]===e.id);
 let productCard=e=>`<button type="button" class="boutique-card ${e.id===entry.id?'is-selected':''} ${equipped(e)?'is-equipped':''}" data-product="${safe(e.id)}"><span class="boutique-art">${e.symbol}</span><span class="boutique-product-name">${safe(e.label)}</span><span class="boutique-product-price">${equipped(e)?'✓ Equipado':owned(e)?'✓ Meu item':'🪙 '+e.price}</span></button>`;
 const actionText=equipped(entry)?'✓ Já equipado':owned(entry)?'Equipar agora':tab==='food'?'Comprar 1 item':tab==='potion'?'Usar poção':'Comprar por 🪙 '+entry.price;
 const canBuy=equipped(entry)||(!owned(entry)&&state.coins<entry.price);
 const preview=tab==='skin'?`<div class="shop-preview-pet" style="--skin:${entry.value}"><span>●　●</span><i>⌣</i></div>`:`<div class="shop-preview-art">${entry.symbol}</div>`;
 const content=`<div class="shop-banner"><div><small>✦ REA BOUTIQUE · SEU ESTILO</small><h3>Um mundo de novidades</h3><p>Personalize, cuide e colecione!</p></div><div class="shop-wallet"><small>SEU SALDO</small><strong>🪙 ${state.coins.toLocaleString('pt-BR')}</strong></div></div><div class="shop-tabs">${tabs.map(([id,icon,label])=>`<button data-tab="${id}" class="${id===tab?'active':''}">${icon}<span>${label}</span></button>`).join('')}</div><div class="shop-body"><div class="shop-feature"><div class="shop-preview">${preview}</div><div class="shop-feature-info"><div class="shop-eyebrow">ITEM SELECIONADO</div><h3>${safe(entry.label)}</h3><p>${safe(entry.description||'Nova opção para personalizar seu mundo.')}</p>${tab==='food'?'<div class="stock-badge">Na geladeira: '+(state.inventory[entry.id]||0)+'</div>':''}<button class="shop-purchase" data-buy="${safe(entry.id)}" ${canBuy?'disabled':''}>${actionText}</button>${!owned(entry)&&state.coins<entry.price?'<small class="shop-short">Faltam '+(entry.price-state.coins)+' moedas</small>':''}</div></div><div class="shop-section-title"><strong>${tabs.find(t=>t[0]===tab)?.[2]}</strong><span>${entries.length} itens</span></div><div class="boutique-grid">${entries.map(productCard).join('')}</div></div>`;
 openModal('✦ Boutique',content,'Ganhe moedas jogando! Itens e progresso ficam salvos no navegador.');modalCard.classList.add('boutique-modal');
 modalCard.querySelectorAll('[data-tab]').forEach(el=>el.onclick=()=>renderShop(el.dataset.tab));
 modalCard.querySelectorAll('[data-product]').forEach(el=>el.onclick=()=>renderShop(tab,el.dataset.product));
 modalCard.querySelector('[data-buy]').onclick=()=>{if(canBuy)return;const result=tab==='food'?buyFood(state,entry.id):tab==='potion'?usePotion(state,entry.id):purchaseCosmetic(state,tab,entry.id);success(result,tab==='food'?'🛍️':'✨');renderShop(tab,entry.id);renderToolbar()};
}
function renderFridge(){let html='<p class="modal-intro">Selecione um alimento. Depois, na cozinha, toque nele ou arraste-o até o bichinho.</p><div class="item-grid">'+Object.entries(FOODS).map(([id,f])=>itemCard(f.symbol,f.label,'Estoque: '+(state.inventory[id]||0),'selectFood',id,state.selectedFood===id?'active':'')).join('')+'</div>';openModal('Geladeira',html,'Precisa de mais comida? Visite a Loja.');modalCard.querySelectorAll('[data-shop-action]').forEach(e=>e.onclick=()=>{state.selectedFood=e.dataset.id;persist();renderToolbar();closeModal();toast(FOODS[e.dataset.id].label+' selecionado')});}
function renderWardrobe(){
 const groups=[['skin','Cores',COLORS,'ownedSkins'],['hat','Chapéus',HATS,'ownedHats'],['glasses','Óculos',GLASSES,'ownedGlasses'],['outfit','Roupas',OUTFITS,'ownedOutfits']];
 let contents='<p class="modal-intro">Seu estilo, do seu jeito! Os itens comprados na Boutique podem ser equipados gratuitamente.</p><div class="tab-strip">'+groups.map(([kind,name])=>`<button data-w="${kind}">${name}</button>`).join('')+'</div><div id="wardrobeGrid" class="item-grid"></div>';
 openModal('Meu Armário',contents,'Quer mudar de visual? Visite a Boutique.');
 const update=type=>{const group=groups.find(g=>g[0]===type)||groups[0];modalCard.querySelectorAll('[data-w]').forEach(el=>el.classList.toggle('active',el.dataset.w===type));const items=group[2],owned=state[group[3]]||[];
 $('wardrobeGrid').innerHTML=items.map(item=>itemCard(type==='skin'?`<span class="color-chip" style="display:block;background:${item.value}"></span>`:item.symbol||'✨',item.label,owned.includes(item.id)?'✓ Disponível':'🔒 Boutique','equip',type+'|'+item.id,state[type]===item.id?'active':owned.includes(item.id)?'':'disabled')).join('');
 $('wardrobeGrid').querySelectorAll('[data-shop-action]').forEach(el=>el.onclick=()=>{const [kind,id]=el.dataset.id.split('|');if(!owned.includes(id)){toast('Compre na Boutique primeiro!');return}success(purchaseCosmetic(state,kind,id),'✨');update(kind)});
 };modalCard.querySelectorAll('[data-w]').forEach(el=>el.onclick=()=>update(el.dataset.w));update('skin');}
function renderStatus(){let contents='<p class="modal-intro">Cuide do seu amigo para manter seus indicadores altos e ganhar experiência.</p>'+needs.map(([key,label,icon])=>`<div class="status-row"><span>${icon} ${safe(label)}</span><div class="status-track"><div class="status-fill" style="width:${state[key]}%;background:${state[key]<30?'#ef6665':state[key]<65?'#efd769':'#65df75'}"></div></div><strong>${Math.round(state[key])}%</strong></div>`).join('')+`<div class="status-row"><span>⭐ Experiência</span><div class="status-track"><div class="status-fill" style="width:${state.xp/(60+state.level*25)*100}%"></div></div><strong>Nv ${state.level}</strong></div>`;
 openModal('Status do bichinho',contents,'As necessidades mudam com o tempo, mesmo fora do jogo.');}
function renderHelp(){openModal('Como jogar',`<p class="help-p"><strong>🏠 Salas:</strong> Use as setas para visitar Hall, Cozinha, Laboratório, Sala de Jogos, Quarto, Banheiro e Jardim.</p><p class="help-p"><strong>🍎 Alimentação:</strong> Na cozinha, escolha na Geladeira. Toque ou arraste o alimento até a boca do bichinho.</p><p class="help-p"><strong>🧼 Higiene:</strong> Use o sabonete e depois o chuveiro no banheiro.</p><p class="help-p"><strong>💡 Sono:</strong> Apague a luz no quarto, espere a energia subir e ligue novamente.</p><p class="help-p"><strong>🎮 Jogos:</strong> Explore 26 minijogos com 3 dificuldades. Ganhe moedas por desempenho, desbloqueie roupas e bata recordes.</p><p class="help-p"><strong>💾 Progresso:</strong> Salvamento automático no navegador deste dispositivo. O microfone, quando ativado, pede permissão e reproduz uma gravação curta localmente.</p>`,`<button class="modal-action" id="soundToggle">Som ${sound?'ligado 🔊':'desligado 🔇'}</button><button class="modal-action" id="resetProgress">Novo jogo</button>`);$('soundToggle').onclick=()=>{sound=!sound;$('soundToggle').textContent='Som '+(sound?'ligado 🔊':'desligado 🔇');};$('resetProgress').onclick=()=>{if(window.confirm('Reiniciar todo o progresso salvo neste navegador?')){state=initialState();persist();closeModal();renderToolbar();updateHUD();toast('Novo jogo iniciado');}};}
async function toggleMic(){if(micRecorder){try{micRecorder.stop()}catch{}micRecorder=null;state.mic=false;persist();toast('Microfone desligado.');return;}
 try{if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){toast('Microfone indisponível neste navegador');return;}
  micStream=await navigator.mediaDevices.getUserMedia({audio:true});const chunks=[];micRecorder=new MediaRecorder(micStream);const recorder=micRecorder;recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>{micStream?.getTracks().forEach(t=>t.stop());micStream=null;state.mic=false;persist();if(chunks.length){const url=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType}));const audio=new Audio(url);audio.playbackRate=1.35;audio.onended=()=>URL.revokeObjectURL(url);audio.play().catch(()=>URL.revokeObjectURL(url));}micRecorder=null;};recorder.start();state.mic=true;toast('Gravando por até 4 segundos… fale!');micTimer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop()},4000);
 }catch{toast('Acesso ao microfone negado ou indisponível');}}
function runAction(action){switch(action){
 case 'outside':state.room=6;renderToolbar();updateHUD();persist();break;
 case 'home':state.room=0;renderToolbar();updateHUD();persist();break;
 case 'shop':renderShop();break;
 case 'fridge':renderFridge();break;
 case 'feed':success(feed(state,state.selectedFood),'💗');renderToolbar();break;
 case 'potions':renderShop('potion');break;
 case 'status':renderStatus();break;
 case 'wardrobe':renderWardrobe();break;
 case 'mic':toggleMic();break;
 case 'lamp':state.lightOff=!state.lightOff;persist();updateHUD();toast(state.lightOff?'Boa noite! 💤':'Bom dia! ☀️');soundFx(280,.13);break;
 case 'soap':doSoap(14);break;
 case 'shower':showerUntil=Date.now()+2000;state.clean=clamp(state.clean+26);state.health=clamp(state.health+3);addXP(state,4);success({ok:true,message:'Banho tomado! +26 limpeza'},'🫧');break;
 case 'ball':state.fun=clamp(state.fun+5);state.energy=clamp(state.energy-1);state.ballCount++;addXP(state,3);joyUntil=Date.now()+700;floating('⚽',45+Math.random()*20,46);soundFx(530,.07);if(state.ballCount%7===0){state.coins+=3;toast('Brincou muito! +3 moedas')};persist();updateHUD();break;
 case 'games':startGameMenu();break;
 case 'garden':{let age=Date.now()-state.flowerLast;if(age<6000){toast('As flores ainda estão crescendo…');return;}state.flowerLast=Date.now();state.flowers++;state.coins+=6;state.fun=clamp(state.fun+4);addXP(state,5);floating('🌻');success({ok:true,message:'Flores cuidadas! +6 moedas'},'🌼');break;}
}}
function doSoap(amount){soapUntil=Date.now()+1400;bubbleUntil=Date.now()+2200;state.clean=clamp(state.clean+amount);state.health=clamp(state.health+1);addXP(state,2);success({ok:true,message:'Espuma! +'+amount+' limpeza'},'🫧')}
function attachDragTool(btn,type){let start=null,moved=false,trackDist=0;
 btn.addEventListener('pointerdown',e=>{if(!modalLayer.classList.contains('hidden')||currentGame)return;e.preventDefault();start={x:e.clientX,y:e.clientY};moved=false;trackDist=0;dragging=type;btn.setPointerCapture(e.pointerId);dragGhost=document.createElement('div');dragGhost.textContent=type==='feed'?FOODS[state.selectedFood].symbol:'🧼';dragGhost.style.cssText='position:fixed;pointer-events:none;z-index:1000;font-size:45px;transform:translate(-50%,-50%);filter:drop-shadow(2px 3px 1px #3338);left:'+e.clientX+'px;top:'+e.clientY+'px;';document.body.append(dragGhost)});
 btn.addEventListener('pointermove',e=>{if(!start||!dragGhost)return;trackDist+=Math.hypot(e.clientX-start.x,e.clientY-start.y);moved=moved||trackDist>11;dragGhost.style.left=e.clientX+'px';dragGhost.style.top=e.clientY+'px';if(type==='soap'&&moved&&trackDist>30&&isOverPet(e.clientX,e.clientY)){doSoap(3);trackDist=0;}});
 const release=e=>{if(!start)return;let correct=isOverPet(e.clientX,e.clientY);dragGhost?.remove();dragGhost=null;dragging=null;start=null;if(type==='feed'&&(!moved||correct)){runAction('feed')}else if(type==='soap'&&!moved){runAction('soap')}else if(type==='feed'){toast('Arraste até a boca!')}};
 btn.addEventListener('pointerup',release);btn.addEventListener('pointercancel',()=>{dragGhost?.remove();dragGhost=null;start=null;dragging=null;});
}
function isOverPet(x,y){const bounds=device.getBoundingClientRect();const rx=(x-bounds.left)*390/bounds.width;const ry=(y-bounds.top)*694/bounds.height;return rx>82&&rx<308&&ry>223&&ry<518;}
$('petHotspot').addEventListener('pointerup',e=>{if(dragging||!modalLayer.classList.contains('hidden')||currentGame)return;joyUntil=Date.now()+700;state.fun=clamp(state.fun+.7);addXP(state,1);floating(Math.random()>.4?'💗':'✨',37+Math.random()*25,45);soundFx(480,.07);persist();updateHUD();});
$('openShopCoins').addEventListener('click',()=>renderShop());$('openShopCoins').addEventListener('keydown',e=>{if(e.key==='Enter')renderShop()});$('levelBtn').onclick=renderStatus;$('helpBtn').onclick=renderHelp;$('photoBtn').onclick=()=>{
  const capture=document.createElement('canvas');capture.width=390;capture.height=694;const cx=capture.getContext('2d');cx.drawImage(canvas,0,0);cx.fillStyle='#fff';cx.font='900 23px system-ui';cx.strokeStyle='#292929';cx.lineWidth=3;cx.textAlign='center';cx.strokeText(ROOMS[state.room],195,85);cx.fillText(ROOMS[state.room],195,85);const a=document.createElement('a');a.href=capture.toDataURL('image/png');a.download='rea-pou-'+state.room+'.png';a.click();toast('Imagem da cena salva!');};
$('gameExit').onclick=()=>{if(currentGame&&currentGame!=='Minijogos'&&currentGame!=='Arcade · 26 jogos'){startGameMenu()}else stopGame()};
function cleanupGame(){gameCleanup();gameCleanup=()=>{};gameSession++;}
function stopGame(){cleanupGame();gameBody.classList.remove('catalog-open');currentGame=null;gameLayer.classList.add('hidden');gameBody.innerHTML='';gameBottom.innerHTML='';renderToolbar();updateHUD();persist()}
function displayGame(title){closeModal();cleanupGame();gameBody.classList.remove('catalog-open');currentGame=title;gameLayer.classList.remove('hidden');$('gameTitle').textContent=title;$('gameScore').textContent='0 pts';gameBody.innerHTML='';gameBottom.innerHTML='';}
let arcadeDifficulty=safeStorage()?.getItem('rea-pou-difficulty')||'normal';
let gameFilter='Todos';
const CLASSIC_GAMES=[{id:'memory',name:'Memória',icon:'🧠',genre:'Clássico',desc:'Encontre os pares de cartas.'},{id:'stars',name:'Caça Estrelas',icon:'⭐',genre:'Arcade',desc:'Colete estrelas antes do tempo.'},{id:'colors',name:'Cor Certa',icon:'🎨',genre:'Reflexo',desc:'Acerte as cores pedidas.'}];
function startGameMenu(filter=gameFilter){displayGame('Arcade · 26 jogos');gameFilter=filter;
 const games=[...ARCADE_GAMES,...CLASSIC_GAMES];const genres=['Todos',...new Set(games.map(g=>g.genre))];const visible=filter==='Todos'?games:games.filter(g=>g.genre===filter);
 gameBody.classList.add('catalog-open');
 gameBody.innerHTML=`<div class="arcade-catalog"><div class="arcade-hero"><span class="arcade-hero-icon">🎮</span><div><strong>Play Zone</strong><p>26 jogos · Moedas, recordes e desafios</p></div></div><div class="arcade-difficulty"><span>⚡ Dificuldade</span>${DIFFICULTIES.map(d=>`<button data-difficulty="${d.id}" class="${arcadeDifficulty===d.id?'selected':''}">${d.label}</button>`).join('')}</div><div class="arcade-genres">${genres.map(genre=>`<button class="${filter===genre?'active':''}" data-genre="${safe(genre)}">${safe(genre)}</button>`).join('')}</div><div class="arcade-cards">${visible.map(g=>{let rec=state.gameRecords?.[g.id];return `<button class="arcade-card" data-game="${safe(g.id)}"><span class="arcade-card-art">${g.icon}</span><span class="arcade-card-copy"><strong>${safe(g.name)}</strong><small>${safe(g.desc)}</small><span>🏆 ${rec?.best||0} pontos ${rec?.wins?'· '+rec.wins+' vitórias':''}</span></span><span class="arcade-card-play">▶</span></button>`}).join('')}</div></div>`;
 gameBottom.textContent='Cada partida dá moedas por desempenho. A primeira vitória diária rende bônus!';
 gameBody.querySelectorAll('[data-genre]').forEach(el=>el.onclick=()=>startGameMenu(el.dataset.genre));
 gameBody.querySelectorAll('[data-difficulty]').forEach(el=>el.onclick=()=>{arcadeDifficulty=el.dataset.difficulty;try{safeStorage()?.setItem('rea-pou-difficulty',arcadeDifficulty)}catch{};startGameMenu(filter)});
 gameBody.querySelectorAll('[data-game]').forEach(el=>el.onclick=()=>{const id=el.dataset.game;gameBody.classList.remove('catalog-open');if(id==='memory')memoryGame();else if(id==='stars')starGame();else if(id==='colors')colorGame();else runArcade(id)});
}
function runArcade(id){const g=ARCADE_GAMES.find(g=>g.id===id);if(!g)return;displayGame(g.name);gameCleanup=startArcade({id,body:gameBody,bottom:gameBottom,setScore:value=>{$('gameScore').textContent=value},finish:(score,title,detail,meta)=>finishGame(score,title,detail,meta),sfx:soundFx,difficulty:arcadeDifficulty});}
function finishGame(score,title,detail,meta={}){cleanupGame();currentGame='result';const r=rewardGame(state,score,meta);persist();updateHUD();soundFx(790,.25);
 const medal=score>=450?'🥇':score>=180?'🥈':score>=65?'🥉':'🎖️';
 gameBody.innerHTML=`<div class="game-result upgraded-result"><div class="result-icon">${medal}</div><h2>${safe(title)}</h2><p>${safe(detail)}</p><div class="result-stats"><div><small>PONTUAÇÃO</small><strong>${Math.round(score)}</strong></div><div><small>MOEDAS GANHAS</small><strong>+${r.coins} 🪙</strong></div></div><p>${r.record?'🌟 Novo recorde pessoal!<br>':''}${r.daily?'🎁 Primeiro triunfo do dia: +'+r.daily+' moedas<br>':''}${r.levels?'🎉 Subiu de nível!':''}</p><button id="playAgain" class="primary">🎮 Escolher outro jogo</button></div>`;
 gameBottom.textContent='Partida salva · seu progresso é permanente neste navegador';$('gameScore').textContent=score+' pts';$('playAgain').onclick=()=>startGameMenu();}
function memoryGame(){displayGame('Memória');let icons=['🍎','🍋','🍒','🍇','🥝','🍊'],cards=[...icons,...icons].map((v,i)=>({v,id:i,found:false}));for(let i=cards.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
 let selected=[],moves=0,matched=0,locked=false,timeout=null;let session=gameSession;
 function draw(){if(gameSession!==session)return;gameBody.innerHTML=`<div class="memory-grid">${cards.map((c,i)=>`<button class="memory-cell ${c.found?'matched':selected.includes(i)?'revealed':''}" data-cell="${i}" ${c.found?'disabled':''}>${c.found||selected.includes(i)?c.v:'❔'}</button>`).join('')}</div>`;gameBody.querySelectorAll('[data-cell]').forEach(b=>b.onclick=()=>flip(Number(b.dataset.cell)));$('gameScore').textContent=matched*10+' pts';gameBottom.textContent='Combine os pares! · '+moves+' tentativas';}
 function flip(i){if(locked||cards[i].found||selected.includes(i))return;selected.push(i);soundFx(390,.05);if(selected.length===2){moves++;if(cards[selected[0]].v===cards[selected[1]].v){cards[selected[0]].found=true;cards[selected[1]].found=true;selected=[];matched++;soundFx(660,.11);if(matched===6){draw();setTimeout(()=>{if(gameSession===session)finishGame(Math.max(50,180-moves*7),'Tudo combinado!','Memória concluída em '+moves+' tentativas.')},360);return;}}else{locked=true;timeout=setTimeout(()=>{if(gameSession!==session)return;selected=[];locked=false;draw()},660);}}draw();}
 draw();gameCleanup=()=>clearTimeout(timeout);
}
function starGame(){displayGame('Caça Estrelas');let score=0,time=25,misses=0,alive=true,session=gameSession,targets=[];gameBody.innerHTML='<div class="game-timer"><div id="timerFill"></div></div><div id="starField" style="width:100%;height:84%;position:relative;overflow:hidden;border:2px dashed #d2edff59;border-radius:16px;background:#1c3b6a44"></div>';
 const field=$('starField');function addStar(){if(!alive||gameSession!==session)return;let b=document.createElement('button');b.className='tap-target';b.textContent=['⭐','🌟','✨'][Math.floor(Math.random()*3)];b.style.left=(6+Math.random()*68)+'%';b.style.top=(4+Math.random()*72)+'%';field.append(b);targets.push(b);b.onclick=()=>{score+=10;b.remove();soundFx(700,.06);$('gameScore').textContent=score+' pts';floating('⭐',35+Math.random()*25,34+Math.random()*25)};setTimeout(()=>{if(b.isConnected){b.remove();misses++;}},1250)}
 const spawn=setInterval(addStar,650),clock=setInterval(()=>{time--;$('timerFill')?.style.setProperty('width',time/25*100+'%');gameBottom.textContent='⏱ '+time+'s · acerte as estrelas antes que sumam!';if(time<=0){alive=false;finishGame(score,score>=140?'Que reflexos!':'Fim de jogo!',score/10+' estrelas apanhadas.')}} ,1000);addStar();gameBottom.textContent='⏱ 25s · Toque nas estrelas!';gameCleanup=()=>{alive=false;clearInterval(spawn);clearInterval(clock);targets.forEach(b=>b.remove())};
}
function colorGame(){displayGame('Cor Certa');let score=0,round=0,wrong=0,session=gameSession;
 const cs=[{name:'VERMELHO',color:'#f45b66'},{name:'AZUL',color:'#61bbff'},{name:'VERDE',color:'#66dd7d'},{name:'AMARELO',color:'#f7db60'}];
 function draw(){if(gameSession!==session)return;const goal=cs[Math.floor(Math.random()*4)];gameBody.innerHTML=`<div class="color-prompt">Toque na cor <b>${goal.name}</b></div><div class="color-board">${cs.slice().sort(()=>Math.random()-.5).map(c=>`<button class="color-tile" data-c="${c.name}" aria-label="${c.name}" style="background:${c.color}"></button>`).join('')}</div>`;
 gameBody.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{if(b.dataset.c===goal.name){score+=15;round++;soundFx(670,.07)}else{wrong++;soundFx(200,.12,'triangle');toast('Ops! Tente acertar!')};$('gameScore').textContent=score+' pts';gameBottom.textContent='Acertos: '+round+'/10 · Erros: '+wrong+'/3';if(round>=10||wrong>=3)finishGame(score,wrong>=3?'Fim de jogo!':'Cores dominadas!',round+' acertos e '+wrong+' erros.');else draw();});}
 gameBottom.textContent='Acerte 10 cores! Você tem 3 tentativas.';draw();
}
// ---- Original hand-authored Canvas pet and environments; nothing here is copied from APK art/code. ----
const roundRect=(x,y,w,h,r)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r)};
function renderBackground(t){let [w,h]=[390,694];const room=state.room;const base=ROOM_COLORS[room];ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.globalAlpha=.12;
 if(room===5){ctx.strokeStyle='#fff';ctx.lineWidth=3;for(let y=115;y<694;y+=48)for(let x=-10;x<420;x+=62){roundRect(x+(Math.floor(y/48)%2)*30,y,56,42,10);ctx.stroke()}}
 else if(room===1){ctx.fillStyle='#fff';for(let i=0;i<24;i++){ctx.beginPath();ctx.arc((i%8)*64+13,Math.floor(i/8)*165+190,5+(i%3)*3,0,Math.PI*2);ctx.fill()}}
 else if(room===2){ctx.strokeStyle='#fff';ctx.lineWidth=2;for(let y=160;y<530;y+=64){for(let x=0;x<400;x+=64){ctx.beginPath();ctx.arc(x+(y%128?25:0),y,19,0,Math.PI*2);ctx.stroke()}}}
 else if(room===3){for(let i=0;i<23;i++){ctx.fillStyle=i%2===0?'#fff':'#ffe567';const x=(i*79)%380,y=165+(i*43)%340;ctx.beginPath();ctx.arc(x,y,3+(i%3),0,Math.PI*2);ctx.fill()}}
 else if(room===4){ctx.fillStyle='#fff';for(let i=0;i<15;i++){const x=(i*79+39)%380,y=180+(i*63)%330;ctx.fillRect(x,y,2,12);ctx.fillRect(x-5,y+5,12,2)}}
 else if(room===0){ctx.strokeStyle='#fff';ctx.lineWidth=3;for(let y=155;y<560;y+=100){ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(65,y+25,130,y-25,195,y);ctx.bezierCurveTo(265,y+25,345,y-25,390,y);ctx.stroke()}}
 ctx.restore();
 if(state.decor==='dots'){ctx.save();ctx.globalAlpha=.13;ctx.fillStyle='#fff';for(let y=154;y<640;y+=70)for(let x=20;x<400;x+=70){ctx.beginPath();ctx.arc(x+(y%3)*8,y,14,0,Math.PI*2);ctx.fill()}ctx.restore()}
 if(state.decor==='stars'||['hearts','waves','cloud','music','moon','confetti'].includes(state.decor)){ctx.save();ctx.fillStyle='#ffffff55';for(let i=0;i<38;i++){let x=(i*87+27)%390,y=(i*111+130)%694;ctx.font='22px serif';ctx.fillText(state.decor==='stars'?'✦':DECORS.find(d=>d.id===state.decor)?.value||'✦',x,y)}ctx.restore()}
 if(room===6){const sky=ctx.createLinearGradient(0,115,0,580);sky.addColorStop(0,'#78d3ff');sky.addColorStop(1,'#f0fbff');ctx.fillStyle=sky;ctx.fillRect(0,115,390,580);ctx.fillStyle='#fff';for(let i=0;i<4;i++){let x=42+i*100;ctx.beginPath();ctx.ellipse(x,230+(i%2)*60,52,16,0,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#55c866';ctx.fillRect(0,489,390,205);ctx.fillStyle='#70dc76';ctx.beginPath();ctx.ellipse(130,508,270,45,0,0,Math.PI*2);ctx.fill();for(let i=0;i<7;i++){let x=22+i*58;ctx.fillStyle='#329b47';ctx.fillRect(x+1,468,5,50);ctx.font='27px serif';ctx.fillText('🌼',x-10,470)}}
 ctx.save();ctx.globalAlpha=.22;ctx.fillStyle=room===6?'#39754d':'#5a2b2b';ctx.fillRect(0,566,390,128);ctx.restore();
 if(room===4){ctx.fillStyle='#decc7a';roundRect(44,485,300,83,24);ctx.fill();ctx.fillStyle='#eee6b4';roundRect(70,488,250,56,20);ctx.fill();ctx.fillStyle='#fff7d5';roundRect(70,481,122,35,19);ctx.fill();}
 if(room===5){ctx.fillStyle='#ccfffa33';ctx.fillRect(0,535,390,50);ctx.strokeStyle='#1b9aaf99';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,565);ctx.lineTo(390,565);ctx.stroke()}
 if(room===3){ctx.fillStyle='#4fd05088';ctx.beginPath();ctx.ellipse(196,493,138,20,0,0,Math.PI*2);ctx.fill()}
}
function drawPet(now){ctx.save();let bob=Math.sin(now/500)*2;const sleepy=state.energy<28||state.room===4&&state.lightOff;let happy=state.fun>45||now<joyUntil;const centerY=362+bob+(state.room===4?11:0);ctx.translate(195,centerY);const scale=.91+Math.min(0.10,state.level*.009);ctx.scale(scale,scale);
 // contact shadow
 ctx.fillStyle='#31251125';ctx.beginPath();ctx.ellipse(0,110,111,18,0,0,Math.PI*2);ctx.fill();
 // symmetrical, smoothly sculpted silhouette. Hand-authored Bézier paths (no raster assets).
 let skin=COLORS.find(c=>c.id===state.skin)?.value||'#c99a59';
 ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=3;ctx.strokeStyle='#29251f';
 const grad=ctx.createLinearGradient(-80,-120,90,117);grad.addColorStop(0,mixColor(skin,'#ffffff',.23));grad.addColorStop(.4,skin);grad.addColorStop(.83,skin);grad.addColorStop(1,mixColor(skin,'#65472a',.24));ctx.fillStyle=grad;
 ctx.beginPath();ctx.moveTo(-22,-126);ctx.bezierCurveTo(-5,-132,5,-132,22,-126);ctx.bezierCurveTo(64,-119,82,-64,101,-5);ctx.bezierCurveTo(121,51,120,81,94,99);ctx.bezierCurveTo(68,119,-68,119,-94,99);ctx.bezierCurveTo(-120,81,-121,51,-101,-5);ctx.bezierCurveTo(-82,-64,-64,-119,-22,-126);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.save();ctx.globalAlpha=.10;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(-62,-34,17,45,-.28,0,Math.PI*2);ctx.fill();ctx.restore();
 // Subtle body shine and two cheek highlights, kept within the character.
 ctx.fillStyle='#ffdfb81e';ctx.beginPath();ctx.ellipse(0,78,65,25,0,0,Math.PI*2);ctx.fill();
 if(state.clean<91){const dirtCount=Math.min(12,Math.max(1,Math.ceil((100-state.clean)/10)));ctx.save();ctx.fillStyle='#77533a50';for(let i=0;i<dirtCount;i++){const x=Math.sin(i*3.23)*73,y=Math.cos(i*4.55)*64-7;ctx.beginPath();ctx.ellipse(x,y,4+i%4,2+(i*2)%4,i*.48,0,Math.PI*2);ctx.fill()}ctx.restore()}
 // Symmetrical eyes, eye highlights, pupils tracking mood, micro-expressions.
 const blink=now<blinkUntil||sleepy,eyes=[[-38,-74],[38,-74]];
 eyes.forEach(([x,y])=>{ctx.strokeStyle='#33271e';ctx.lineWidth=3.1;
  if(blink){ctx.beginPath();ctx.moveTo(x-25,y+2);ctx.quadraticCurveTo(x,y+13,x+25,y+2);ctx.stroke();return;}
  ctx.fillStyle='#fffdf9';ctx.beginPath();ctx.ellipse(x,y,27,30,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  const look=Math.sin(now/2050)*1.8;ctx.fillStyle='#241d1c';ctx.beginPath();ctx.ellipse(x+2+look,y+6,9,12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(x+5+look,y+1,3.6,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffffff78';ctx.beginPath();ctx.arc(x+1,y+14,1.5,0,Math.PI*2);ctx.fill();
 });
 ctx.fillStyle='#df8c8439';ctx.beginPath();ctx.ellipse(-81,-14,15,9,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(81,-14,15,9,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#352721';ctx.lineWidth=3.7;ctx.beginPath();
 if(state.health<25){ctx.moveTo(-22,18);ctx.quadraticCurveTo(0,1,22,18)}
 else if(sleepy){ctx.moveTo(-18,9);ctx.quadraticCurveTo(0,15,18,9)}
 else if(happy){ctx.moveTo(-25,3);ctx.bezierCurveTo(-11,30,11,30,25,3)}
 else{ctx.moveTo(-20,10);ctx.quadraticCurveTo(0,22,20,10)}ctx.stroke();
 if(happy&&!sleepy){ctx.fillStyle='#f29e8d';ctx.beginPath();ctx.ellipse(0,21,9,4,0,0,Math.PI*2);ctx.fill()}
 if(state.hat==='cap'){ctx.fillStyle='#286fcb';ctx.strokeStyle='#222';ctx.lineWidth=2.8;ctx.beginPath();ctx.moveTo(-73,-115);ctx.quadraticCurveTo(-69,-159,-15,-157);ctx.quadraticCurveTo(35,-154,60,-118);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#1853ae';ctx.beginPath();ctx.ellipse(27,-114,69,14,.05,0,Math.PI*2);ctx.fill();ctx.stroke();}
 if(state.hat==='bow'){ctx.lineWidth=2.5;ctx.fillStyle='#ef66a6';ctx.strokeStyle='#292929';ctx.beginPath();ctx.ellipse(-3,-132,20,13,-.25,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(30,-132,20,13,.25,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#ffb0db';ctx.beginPath();ctx.arc(13,-132,9,0,Math.PI*2);ctx.fill();ctx.stroke()}
 if(state.hat==='crown'){ctx.fillStyle='#ffde49';ctx.strokeStyle='#292929';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-35,-142);ctx.lineTo(-46,-178);ctx.lineTo(-15,-160);ctx.lineTo(0,-194);ctx.lineTo(19,-159);ctx.lineTo(42,-178);ctx.lineTo(35,-140);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#eb5259';ctx.beginPath();ctx.arc(0,-158,5,0,Math.PI*2);ctx.fill()}
 if(state.glasses==='round'||state.glasses==='sun'||state.glasses==='star'||state.glasses==='sport'){
  ctx.strokeStyle=state.glasses==='sun'?'#1b2333':state.glasses==='star'?'#ffe57a':'#31556b';ctx.lineWidth=state.glasses==='sport'?8:5;
  [[-38,-74],[38,-74]].forEach(([x,y])=>{if(state.glasses==='sun'){ctx.fillStyle='#25334baa';ctx.beginPath();ctx.ellipse(x,y,29,20,0,0,Math.PI*2);ctx.fill()}ctx.beginPath();ctx.ellipse(x,y,29,26,0,0,Math.PI*2);ctx.stroke()});ctx.beginPath();ctx.moveTo(-9,-76);ctx.quadraticCurveTo(0,-83,9,-76);ctx.stroke();
 }
 if(state.outfit==='scarf'){ctx.strokeStyle='#de555d';ctx.lineWidth=16;ctx.beginPath();ctx.arc(0,20,72,.20,2.95);ctx.stroke();ctx.fillStyle='#ea7a79';roundRect(34,32,20,66,7);ctx.fill()}
 if(state.outfit==='sailor'){ctx.fillStyle='#f4f9fc';ctx.beginPath();ctx.moveTo(-64,42);ctx.quadraticCurveTo(0,103,64,42);ctx.lineTo(39,84);ctx.quadraticCurveTo(0,101,-39,84);ctx.closePath();ctx.fill();ctx.strokeStyle='#498bb8';ctx.lineWidth=4;ctx.stroke()}
 if(state.outfit==='bowtie'){ctx.font='45px system-ui';ctx.textAlign='center';ctx.fillText('🎀',0,60)}
 if(state.outfit==='hero'){ctx.fillStyle='#dd626e';ctx.globalAlpha=.95;ctx.beginPath();ctx.moveTo(-83,16);ctx.lineTo(-126,80);ctx.lineTo(-49,90);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(83,16);ctx.lineTo(126,80);ctx.lineTo(49,90);ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.font='bold 29px system-ui';ctx.fillStyle='#ffeaa8';ctx.textAlign='center';ctx.fillText('★',0,72)}
 if(['headphones','wizard','straw','beanie','halo','party'].includes(state.hat)){
   ctx.font='67px system-ui';ctx.textAlign='center';ctx.fillText(HATS.find(h=>h.id===state.hat)?.symbol||'✨',0,-127);
 }
 if(now<soapUntil){for(let i=0;i<20;i++){let x=Math.sin(i*2.17+now/1000)*95;let y=Math.cos(i*2.43+now/1300)*100;ctx.strokeStyle='#dcffffc8';ctx.fillStyle='#fcffff4d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,7+i%5,0,Math.PI*2);ctx.fill();ctx.stroke()}}
 if(now<showerUntil){ctx.fillStyle='#abf5ffba';for(let i=0;i<24;i++){let x=-70+(i*37)%140,y=(-200+((now/11+i*29)%335));ctx.fillRect(x,y,2,17)}}
 if(sleepy){ctx.font='bold 25px system-ui';ctx.fillStyle='#fff';for(let i=0;i<3;i++)ctx.fillText('Z',80+i*18,-130-i*21+Math.sin(now/600+i)*7)}
 ctx.restore();}
function mixColor(a,b,part){const rgb=s=>s.match(/[a-f0-9]{2}/ig)?.slice(0,3).map(x=>parseInt(x,16))||[160,130,90];let x=rgb(a),y=rgb(b);return '#'+x.map((c,i)=>Math.round(c+(y[i]-c)*part).toString(16).padStart(2,'0')).join('')}
function frame(now){elapsed=now;renderBackground(now);drawPet(now);if(now>blinkAt){blinkUntil=now+110;blinkAt=now+2700+Math.random()*3400}requestAnimationFrame(frame)}
requestAnimationFrame(frame);
// Offline progression + animations; date jumps clamped to avoid runaway resource loss.
let lastPeriodic=Date.now();setInterval(()=>{const now=Date.now();tick(state,now);updateHUD();persist();lastPeriodic=now},1200);
window.addEventListener('pagehide',persist);
updateHUD();renderToolbar();
if(!state.tutorialSeen){$('welcome').classList.remove('hidden');$('startBtn').onclick=()=>{state.tutorialSeen=true;persist();$('welcome').classList.add('hidden');soundFx(670,.16)}}
