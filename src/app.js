import {ROOMS,ROOM_COLORS,FOODS,COLORS,HATS,DECORS,initialState,loadState,saveState,clamp,tick,addXP,feed,buyFood,usePotion,purchaseCosmetic,rewardGame,nextRoom} from './state.js';
const $=id=>document.getElementById(id);
const canvas=$('petCanvas'), ctx=canvas.getContext('2d');
const device=$('device'), toolbar=$('toolbar'),modalLayer=$('modalLayer'),modalCard=$('modalCard');
const gameLayer=$('gameLayer'),gameBody=$('gameBody'),gameBottom=$('gameBottom');
let state=loadState(window.localStorage);let elapsed=0,noticeTimer,anim=null,bubbleUntil=0,soapUntil=0,showerUntil=0,blinkAt=Date.now()+1600,blinkUntil=0,joyUntil=0;
let currentGame=null,gameCleanup=()=>{},sound=true,micRecorder=null,micStream=null,micTimer=0;
let dragging=null,dragGhost=null;let gameSession=0;
const roomHints=['Toque no bichinho para fazer carinho!','Arraste a comida até a boca!','Cuide da saúde com poções!','Toque na bola ou escolha um jogo!','Apague a luz para descansar!','Esfregue sabonete e use o chuveiro!','Explore o jardim e ganhe moedas!'];
const needs=[['fullness','Comida','🍗'],['health','Saúde','✚'],['fun','Diversão','☻'],['energy','Energia','ϟ'],['clean','Limpeza','🧼']];
const safe=(text='')=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function persist(){saveState(state,window.localStorage)}
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
function openModal(title,contents,footer=''){if(currentGame)stopGame();modalCard.innerHTML=`<div class="modal-head"><h2>${safe(title)}</h2><button type="button" id="modalClose" class="close" aria-label="Fechar">×</button></div><div class="modal-content">${contents}</div>${footer?`<div class="modal-footer">${footer}</div>`:''}`;modalLayer.classList.remove('hidden');$('modalClose').addEventListener('click',closeModal);}
function closeModal(){modalLayer.classList.add('hidden');modalCard.innerHTML=''}
modalLayer.addEventListener('click',e=>{if(e.target===modalLayer)closeModal()});
function itemCard(symbol,name,desc,action,id,classes=''){return `<button class="item-card ${classes}" data-shop-action="${action}" data-id="${safe(id)}"><span class="item-icon">${symbol}</span><span class="name">${safe(name)}</span><span class="price">${safe(desc)}</span></button>`}
function renderShop(tab='food'){
 const tabs=[['food','🍔 Comidas'],['potion','🧪 Poções'],['skin','🎨 Cores'],['hat','👒 Roupas'],['decor','🪄 Paredes']];
 let contents=`<div class="tab-strip">${tabs.map(([id,text])=>`<button data-tab="${id}" class="${tab===id?'active':''}">${text}</button>`).join('')}</div><div class="item-grid">`;
 if(tab==='food')contents+=Object.entries(FOODS).map(([id,f])=>itemCard(f.symbol,f.label,'🪙 '+f.price+' · x'+(state.inventory[id]||0),'food',id)).join('');
 if(tab==='potion')contents+=[['health','❤️','Saúde',28],['energy','⚡','Energia',32],['hunger','🍗','Alimento',26]].map(([id,icon,name,price])=>itemCard(icon,name,'🪙 '+price,'potion',id)).join('');
 if(tab==='skin')contents+=COLORS.map(c=>itemCard(`<span class="color-chip" style="display:block;background:${c.value}"></span>`,c.label,state.ownedSkins.includes(c.id)?'✓ Adquirido':'🪙 '+c.price,'skin',c.id,state.skin===c.id?'active':'')).join('');
 if(tab==='hat')contents+=HATS.map(c=>itemCard(c.symbol,c.label,state.ownedHats.includes(c.id)?'✓ Adquirido':'🪙 '+c.price,'hat',c.id,state.hat===c.id?'active':'')).join('');
 if(tab==='decor')contents+=DECORS.map(c=>itemCard(c.value||'◻️',c.label,state.ownedDecors.includes(c.id)?'✓ Adquirido':'🪙 '+c.price,'decor',c.id,state.decor===c.id?'active':'')).join('');
 contents+='</div>';openModal('Loja · '+state.coins+' 🪙',contents,'Itens comprados ficam salvos neste navegador.');
 modalCard.querySelectorAll('[data-tab]').forEach(e=>e.onclick=()=>renderShop(e.dataset.tab));
 modalCard.querySelectorAll('[data-shop-action]').forEach(e=>e.onclick=()=>{const t=e.dataset.shopAction,id=e.dataset.id;const result=t==='food'?buyFood(state,id):t==='potion'?usePotion(state,id):purchaseCosmetic(state,t,id);success(result,t==='food'?'🛍️':'✨');if(result.ok){renderShop(tab);renderToolbar();}});
}
function renderFridge(){let html='<p class="modal-intro">Selecione um alimento. Depois, na cozinha, toque nele ou arraste-o até o bichinho.</p><div class="item-grid">'+Object.entries(FOODS).map(([id,f])=>itemCard(f.symbol,f.label,'Estoque: '+(state.inventory[id]||0),'selectFood',id,state.selectedFood===id?'active':'')).join('')+'</div>';openModal('Geladeira',html,'Precisa de mais comida? Visite a Loja.');modalCard.querySelectorAll('[data-shop-action]').forEach(e=>e.onclick=()=>{state.selectedFood=e.dataset.id;persist();renderToolbar();closeModal();toast(FOODS[e.dataset.id].label+' selecionado')});}
function renderWardrobe(){let contents='<p class="modal-intro">Personalize seu amigo com os itens comprados na Loja.</p><div class="tab-strip"><button data-w="skin" class="active">Cores</button><button data-w="hat">Acessórios</button></div><div id="wardrobeGrid" class="item-grid"></div>';
 openModal('Armário',contents,'Novos visuais podem ser adquiridos na Loja.');
 const update=type=>{modalCard.querySelectorAll('[data-w]').forEach(el=>el.classList.toggle('active',el.dataset.w===type));const list=type==='skin'?COLORS:HATS;const owned=type==='skin'?state.ownedSkins:state.ownedHats;$('wardrobeGrid').innerHTML=list.map(c=>itemCard(type==='skin'?`<span class="color-chip" style="display:block;background:${c.value}"></span>`:c.symbol,c.label,owned.includes(c.id)?'✓ Disponível':'🔒 Loja','equip',type+'|'+c.id,state[type]===c.id?'active':owned.includes(c.id)?'':'disabled')).join('');
 $('wardrobeGrid').querySelectorAll('[data-shop-action]').forEach(el=>el.onclick=()=>{const [t,id]=el.dataset.id.split('|');if(!(t==='skin'?state.ownedSkins:state.ownedHats).includes(id)){toast('Adquira na Loja primeiro!');return;}success(purchaseCosmetic(state,t,id),'✨');update(t)});
 };modalCard.querySelectorAll('[data-w]').forEach(el=>el.onclick=()=>update(el.dataset.w));update('skin');}
function renderStatus(){let contents='<p class="modal-intro">Cuide do seu amigo para manter seus indicadores altos e ganhar experiência.</p>'+needs.map(([key,label,icon])=>`<div class="status-row"><span>${icon} ${safe(label)}</span><div class="status-track"><div class="status-fill" style="width:${state[key]}%;background:${state[key]<30?'#ef6665':state[key]<65?'#efd769':'#65df75'}"></div></div><strong>${Math.round(state[key])}%</strong></div>`).join('')+`<div class="status-row"><span>⭐ Experiência</span><div class="status-track"><div class="status-fill" style="width:${state.xp/(60+state.level*25)*100}%"></div></div><strong>Nv ${state.level}</strong></div>`;
 openModal('Status do bichinho',contents,'As necessidades mudam com o tempo, mesmo fora do jogo.');}
function renderHelp(){openModal('Como jogar',`<p class="help-p"><strong>🏠 Salas:</strong> Use as setas para visitar Hall, Cozinha, Laboratório, Sala de Jogos, Quarto, Banheiro e Jardim.</p><p class="help-p"><strong>🍎 Alimentação:</strong> Na cozinha, escolha na Geladeira. Toque ou arraste o alimento até a boca do bichinho.</p><p class="help-p"><strong>🧼 Higiene:</strong> Use o sabonete e depois o chuveiro no banheiro.</p><p class="help-p"><strong>💡 Sono:</strong> Apague a luz no quarto, espere a energia subir e ligue novamente.</p><p class="help-p"><strong>🎮 Jogos:</strong> Ganhe moedas e diversão, evolua e compre roupas, poções, cores e papéis de parede.</p><p class="help-p"><strong>💾 Progresso:</strong> Salvamento automático no navegador deste dispositivo. O microfone, quando ativado, pede permissão e reproduz uma gravação curta localmente.</p>`,`<button class="modal-action" id="soundToggle">Som ${sound?'ligado 🔊':'desligado 🔇'}</button><button class="modal-action" id="resetProgress">Novo jogo</button>`);$('soundToggle').onclick=()=>{sound=!sound;$('soundToggle').textContent='Som '+(sound?'ligado 🔊':'desligado 🔇');};$('resetProgress').onclick=()=>{if(window.confirm('Reiniciar todo o progresso salvo neste navegador?')){state=initialState();persist();closeModal();renderToolbar();updateHUD();toast('Novo jogo iniciado');}};}
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
$('gameExit').onclick=()=>stopGame();
function cleanupGame(){gameCleanup();gameCleanup=()=>{};gameSession++;}
function stopGame(){cleanupGame();currentGame=null;gameLayer.classList.add('hidden');gameBody.innerHTML='';gameBottom.innerHTML='';renderToolbar();updateHUD();persist()}
function displayGame(title){closeModal();cleanupGame();currentGame=title;gameLayer.classList.remove('hidden');$('gameTitle').textContent=title;$('gameScore').textContent='0 pts';gameBody.innerHTML='';gameBottom.innerHTML='';}
function startGameMenu(){displayGame('Minijogos');gameBody.innerHTML='<div class="game-menu"><button class="game-choice" data-game="memory"><span class="symbol">🧠</span><span class="title">Memória</span></button><button class="game-choice" data-game="stars"><span class="symbol">⭐</span><span class="title">Caça Estrelas</span></button><button class="game-choice" data-game="colors"><span class="symbol">🎨</span><span class="title">Cor Certa</span></button></div>';gameBottom.textContent='Escolha um jogo e ganhe moedas para cuidar do seu amigo!';gameBody.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>{if(b.dataset.game==='memory')memoryGame();else if(b.dataset.game==='stars')starGame();else colorGame();});}
function finishGame(score,title,detail){cleanupGame();currentGame='result';const r=rewardGame(state,score);persist();updateHUD();soundFx(790,.25);gameBody.innerHTML=`<div class="game-result"><div class="result-icon">🏆</div><h2>${safe(title)}</h2><p>${safe(detail)}</p><p><b>⭐ ${score} pontos<br>🪙 +${r.coins} moedas${r.levels?'<br>🎉 Subiu de nível!':''}</b></p><button id="playAgain" class="primary">Mais jogos</button></div>`;gameBottom.textContent='Diversão e experiência adicionadas!';$('gameScore').textContent=score+' pts';$('playAgain').onclick=startGameMenu;}
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
 if(state.decor==='stars'){ctx.save();ctx.fillStyle='#ffffff55';for(let i=0;i<38;i++){let x=(i*87+27)%390,y=(i*111+130)%694;ctx.font='22px serif';ctx.fillText('✦',x,y)}ctx.restore()}
 if(room===6){const sky=ctx.createLinearGradient(0,115,0,580);sky.addColorStop(0,'#78d3ff');sky.addColorStop(1,'#f0fbff');ctx.fillStyle=sky;ctx.fillRect(0,115,390,580);ctx.fillStyle='#fff';for(let i=0;i<4;i++){let x=42+i*100;ctx.beginPath();ctx.ellipse(x,230+(i%2)*60,52,16,0,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#55c866';ctx.fillRect(0,489,390,205);ctx.fillStyle='#70dc76';ctx.beginPath();ctx.ellipse(130,508,270,45,0,0,Math.PI*2);ctx.fill();for(let i=0;i<7;i++){let x=22+i*58;ctx.fillStyle='#329b47';ctx.fillRect(x+1,468,5,50);ctx.font='27px serif';ctx.fillText('🌼',x-10,470)}}
 ctx.save();ctx.globalAlpha=.22;ctx.fillStyle=room===6?'#39754d':'#5a2b2b';ctx.fillRect(0,566,390,128);ctx.restore();
 if(room===4){ctx.fillStyle='#decc7a';roundRect(44,485,300,83,24);ctx.fill();ctx.fillStyle='#eee6b4';roundRect(70,488,250,56,20);ctx.fill();ctx.fillStyle='#fff7d5';roundRect(70,481,122,35,19);ctx.fill();}
 if(room===5){ctx.fillStyle='#ccfffa33';ctx.fillRect(0,535,390,50);ctx.strokeStyle='#1b9aaf99';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,565);ctx.lineTo(390,565);ctx.stroke()}
 if(room===3){ctx.fillStyle='#4fd05088';ctx.beginPath();ctx.ellipse(196,493,138,20,0,0,Math.PI*2);ctx.fill()}
}
function drawPet(now){ctx.save();let bob=Math.sin(now/500)*2;const sleepy=state.energy<28||state.room===4&&state.lightOff;let happy=state.fun>45||now<joyUntil;const centerY=362+bob+(state.room===4?11:0);ctx.translate(195,centerY);const scale=.91+Math.min(0.10,state.level*.009);ctx.scale(scale,scale);
 // contact shadow
 ctx.fillStyle='#31251125';ctx.beginPath();ctx.ellipse(0,110,111,18,0,0,Math.PI*2);ctx.fill();
 // body - original authored silhouette, gently uneven rounded sides
 let skin=COLORS.find(c=>c.id===state.skin)?.value||'#c99a59';ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=2.7;ctx.strokeStyle='#29251f';const grad=ctx.createLinearGradient(-40,-115,50,116);grad.addColorStop(0,skin);grad.addColorStop(.66,skin);grad.addColorStop(1,mixColor(skin,'#7e5638',.13));ctx.fillStyle=grad;
 ctx.beginPath();ctx.moveTo(-25,-117);ctx.bezierCurveTo(-57,-111,-74,-65,-92,-21);ctx.bezierCurveTo(-119,31,-123,62,-106,82);ctx.bezierCurveTo(-76,117,65,114,98,88);ctx.bezierCurveTo(125,67,105,23,87,-16);ctx.bezierCurveTo(68,-68,50,-115,17,-119);ctx.bezierCurveTo(0,-124,-12,-122,-25,-117);ctx.closePath();ctx.fill();ctx.stroke();
 // subtle warm cheek light
 ctx.fillStyle='#fff4be18';ctx.beginPath();ctx.ellipse(2,64,56,29,0,0,Math.PI*2);ctx.fill();
 if(state.clean<91){const dirtCount=Math.min(12,Math.max(1,Math.ceil((100-state.clean)/10)));ctx.save();ctx.fillStyle='#77533a50';for(let i=0;i<dirtCount;i++){const x=Math.sin(i*3.23)*73,y=Math.cos(i*4.55)*64-7;ctx.beginPath();ctx.ellipse(x,y,4+i%4,2+(i*2)%4,i*.48,0,Math.PI*2);ctx.fill()}ctx.restore()}
 // facial feature: eyes track touch and blink
 const blink=now<blinkUntil||sleepy;const eyes=[[-33,-83],[34,-83]];
 eyes.forEach(([x,y])=>{ctx.strokeStyle='#29251f';ctx.lineWidth=2.7;if(blink){ctx.beginPath();ctx.moveTo(x-25,y+2);ctx.quadraticCurveTo(x,y+9,x+25,y+2);ctx.stroke();return;}ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(x,y,27,31,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#111';let gx=state.room===1?3:0;ctx.beginPath();ctx.ellipse(x+gx+2,y+5,8.5,10,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffffb8';ctx.beginPath();ctx.arc(x+gx+5,y+1,2.6,0,Math.PI*2);ctx.fill();});
 ctx.strokeStyle='#29251f';ctx.lineWidth=3.4;ctx.beginPath();if(now<joyUntil){ctx.moveTo(-27,-4);ctx.quadraticCurveTo(-13,20,4,0)}else if(state.health<25){ctx.moveTo(-24,5);ctx.quadraticCurveTo(-12,-13,0,5)}else if(sleepy){ctx.moveTo(-17,1);ctx.quadraticCurveTo(-11,7,-3,1)}else if(happy){ctx.moveTo(-25,-10);ctx.quadraticCurveTo(-29,13,-8,10);ctx.quadraticCurveTo(0,9,1,4)}else{ctx.moveTo(-22,-1);ctx.lineTo(-4,-1)}ctx.stroke();
 if(state.hat==='cap'){ctx.fillStyle='#286fcb';ctx.strokeStyle='#222';ctx.lineWidth=2.8;ctx.beginPath();ctx.moveTo(-73,-115);ctx.quadraticCurveTo(-69,-159,-15,-157);ctx.quadraticCurveTo(35,-154,60,-118);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#1853ae';ctx.beginPath();ctx.ellipse(27,-114,69,14,.05,0,Math.PI*2);ctx.fill();ctx.stroke();}
 if(state.hat==='bow'){ctx.lineWidth=2.5;ctx.fillStyle='#ef66a6';ctx.strokeStyle='#292929';ctx.beginPath();ctx.ellipse(-3,-132,20,13,-.25,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(30,-132,20,13,.25,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#ffb0db';ctx.beginPath();ctx.arc(13,-132,9,0,Math.PI*2);ctx.fill();ctx.stroke()}
 if(state.hat==='crown'){ctx.fillStyle='#ffde49';ctx.strokeStyle='#292929';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-35,-142);ctx.lineTo(-46,-178);ctx.lineTo(-15,-160);ctx.lineTo(0,-194);ctx.lineTo(19,-159);ctx.lineTo(42,-178);ctx.lineTo(35,-140);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#eb5259';ctx.beginPath();ctx.arc(0,-158,5,0,Math.PI*2);ctx.fill()}
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
