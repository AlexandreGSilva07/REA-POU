export const ROOMS = ['Hall','Kitchen','Lab','Game Room','Bedroom','Bathroom','Outside'];
export const ROOM_COLORS = ['#ffa44e','#ff8594','#b29df7','#70ed69','#faf06a','#4ce7ea','#78d3ff'];
export const FOODS = {
  apple:{label:'Maçã',symbol:'🍎',price:8,food:12,xp:5},
  carrot:{label:'Cenoura',symbol:'🥕',price:7,food:10,xp:4},
  burger:{label:'Hambúrguer',symbol:'🍔',price:16,food:24,xp:6},
  pizza:{label:'Pizza',symbol:'🍕',price:14,food:20,xp:6},
  water:{label:'Água',symbol:'🥤',price:6,food:7,xp:3},
  cake:{label:'Bolo',symbol:'🍰',price:22,food:27,xp:7},
  strawberry:{label:'Morango',symbol:'🍓',price:10,food:14,xp:5},
  sushi:{label:'Sushi',symbol:'🍣',price:20,food:22,xp:8}
};
export const COLORS = [{id:'caramel',label:'Caramelo',value:'#c99a59',price:0},{id:'choco',label:'Chocolate',value:'#8c553b',price:95},{id:'mint',label:'Menta',value:'#6eb99b',price:110},{id:'lavender',label:'Lilás',value:'#b38fcb',price:110},{id:'rose',label:'Rosa',value:'#e59aae',price:125},{id:'blue',label:'Azul',value:'#80add0',price:125}];
export const HATS = [{id:'none',label:'Sem chapéu',symbol:'×',price:0},{id:'cap',label:'Boné',symbol:'🧢',price:80},{id:'bow',label:'Laço',symbol:'🎀',price:65},{id:'crown',label:'Coroa',symbol:'👑',price:190}];
export const DECORS = [{id:'plain',label:'Original',value:'',price:0},{id:'dots',label:'Bolinha',value:'◌',price:60},{id:'stars',label:'Estrelas',value:'✦',price:85}];
const defaults=()=>({version:2,room:0,coins:300,level:1,xp:0,fullness:76,health:91,fun:79,energy:82,clean:70,inventory:{apple:3,carrot:2,burger:1,pizza:1,water:2},selectedFood:'apple',skin:'caramel',hat:'none',decor:'plain',ownedSkins:['caramel'],ownedHats:['none'],ownedDecors:['plain'],lightOff:false,mic:false,ballCount:0,flowers:0,flowerLast:0,lastTick:Date.now(),tutorialSeen:false});
export function clamp(v,min=0,max=100){return Math.max(min,Math.min(max,v));}
export function initialState(){return defaults();}
export function loadState(storage){
  let state=defaults();
  try {const raw=storage?.getItem('rea-pou-v2');if(raw){const saved=JSON.parse(raw);if(saved&&saved.version===2){state={...state,...saved,inventory:{...state.inventory,...saved.inventory}};}}}
  catch { /* ignore corrupt local saves */ }
  state.coins=clamp(Number(state.coins)||0,0,10000000);
  state.room=clamp(Number(state.room)||0,0,ROOMS.length-1);
  for(const key of ['fullness','health','fun','energy','clean']) state[key]=clamp(Number(state[key])||0);
  if(!COLORS.some(c=>c.id===state.skin))state.skin='caramel';
  if(!HATS.some(h=>h.id===state.hat))state.hat='none';
  state.ownedSkins=Array.isArray(state.ownedSkins)?state.ownedSkins:['caramel'];
  state.ownedHats=Array.isArray(state.ownedHats)?state.ownedHats:['none'];
  state.ownedDecors=Array.isArray(state.ownedDecors)?state.ownedDecors:['plain'];
  tick(state, Date.now());
  return state;
}
export function saveState(state,storage){if(!storage)return;try{storage.setItem('rea-pou-v2',JSON.stringify(state));}catch{ /* storage unavailable */ }}
export function tick(state,now){
  const seconds=clamp((now-(state.lastTick||now))/1000,0,8*60*60);
  state.lastTick=now;
  state.fullness=clamp(state.fullness-seconds/180);
  state.fun=clamp(state.fun-seconds/240);
  state.clean=clamp(state.clean-seconds/400);
  state.energy=clamp(state.energy+(state.lightOff?seconds/4:-seconds/340));
  if(state.fullness<14||state.energy<12||state.clean<15) state.health=clamp(state.health-seconds/250);
  return state;
}
export function addXP(s,amount){
  s.xp+=Math.max(0,Math.floor(amount));let levels=0;
  while(s.xp>=60+s.level*25){s.xp-=60+s.level*25;s.level+=1;s.coins+=35+s.level*5;levels++}
  return levels;
}
export function feed(s,id){
  const f=FOODS[id];if(!f)return {ok:false,message:'Comida desconhecida'};
  if(s.fullness>=98)return {ok:false,message:'Já estou satisfeito!'};
  if((s.inventory[id]||0)<1)return {ok:false,message:'Sem estoque — visite a loja!'};
  s.inventory[id]-=1;s.fullness=clamp(s.fullness+f.food);s.health=clamp(s.health+1);s.clean=clamp(s.clean-2);
  return {ok:true,xp:addXP(s,f.xp),message:'Que delícia! +'+f.food+' comida'};
}
export function buyFood(s,id){const f=FOODS[id];if(!f)return {ok:false,message:'Item inválido'};if(s.coins<f.price)return {ok:false,message:'Moedas insuficientes'};s.coins-=f.price;s.inventory[id]=(s.inventory[id]||0)+1;return {ok:true,message:'Comprou '+f.label+'!'};}
export function usePotion(s,type){const config={health:{key:'health',gain:28,price:28,name:'Saúde'},energy:{key:'energy',gain:32,price:32,name:'Energia'},hunger:{key:'fullness',gain:27,price:26,name:'Alimento'}}[type];
  if(!config)return {ok:false,message:'Poção desconhecida'};
  if(s.coins<config.price)return {ok:false,message:'Moedas insuficientes'};
  if(s[config.key]>=98)return {ok:false,message:'Não precisa agora'};
  s.coins-=config.price;s[config.key]=clamp(s[config.key]+config.gain);addXP(s,5);return {ok:true,message:'Poção de '+config.name+' utilizada!'};}
export function purchaseCosmetic(s,kind,id){const type=kind==='skin'?{items:COLORS,owned:'ownedSkins'}:kind==='hat'?{items:HATS,owned:'ownedHats'}:{items:DECORS,owned:'ownedDecors'};
  const item=type.items.find(x=>x.id===id);if(!item)return {ok:false,message:'Item inválido'};
  if(!s[type.owned].includes(id)){if(s.coins<item.price)return {ok:false,message:'Moedas insuficientes'};s.coins-=item.price;s[type.owned].push(id)}
  s[kind]=id;return {ok:true,message:item.label+' equipado!'};
}
export function rewardGame(s,score){let coins=Math.max(2,Math.min(70,Math.floor(score/7)));s.coins+=coins;s.fun=clamp(s.fun+Math.max(8,Math.min(32,score/5)));s.energy=clamp(s.energy-7);const levels=addXP(s,Math.max(4,Math.floor(score/3)));return {coins,levels};}
export function nextRoom(s,delta){s.room=(s.room+delta+ROOMS.length)%ROOMS.length;s.lightOff=false;return s.room;}


