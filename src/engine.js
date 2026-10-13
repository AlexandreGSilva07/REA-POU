/* Original arcade runner mechanics, independent of Android APK internals. */
(function(global){
'use strict';
const LANES=[-2.24,0,2.24], PLAYER_Z=5;
const CATALOG=[{id:'ember',name:'Explorador',cost:0,jacket:'#ee6846',hat:'#254968'}, {id:'mint',name:'Neon Mint',cost:180,jacket:'#44dfae',hat:'#124956'}, {id:'violet',name:'Cosmic',cost:450,jacket:'#ad76fa',hat:'#463068'}, {id:'gold',name:'Lenda Dourada',cost:1000,jacket:'#ffc95d',hat:'#805321'}, {id:'ruby',name:'Velocista',cost:750,jacket:'#ed4e6b',hat:'#263957'}];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}};
function init(seed=Date.now()){return {seed,random:rng(seed),mode:'menu',lane:1,laneX:0,vy:0,y:0,rolling:0,jumpPhase:0,speed:17,meters:0,score:0,runCoins:0,totalCoins:0,combos:0,obstacles:[],collectibles:[],particles:[],spawnZ:80,roadOffset:0,spawnStep:0,shields:0,boardTime:0,boostTime:0,magnetTime:0,stumble:0,nearMiss:0,lives:1,missions:[0,0,0],skin:'ember',powerups:{board:1,magnet:0},mute:false,animTime:0,stats:{jumps:0,slides:0,dodges:0,coins:0},events:[],cameraShake:0};}
function reset(s){s.mode='run';s.lane=1;s.laneX=0;s.vy=0;s.y=0;s.rolling=0;s.jumpPhase=0;s.speed=18;s.meters=0;s.score=0;s.runCoins=0;s.combos=0;s.obstacles=[];s.collectibles=[];s.particles=[];s.spawnZ=70;s.spawnStep=0;s.shields=0;s.boardTime=0;s.boostTime=0;s.magnetTime=0;s.stumble=0;s.nearMiss=0;s.lives=1;s.missions=[0,0,0];s.stats={jumps:0,slides:0,dodges:0,coins:0};s.events=[];s.cameraShake=0;for(let i=0;i<11;i++)generate(s);return s;}
function input(s,type){if(s.mode!=='run')return false;
 if(type==='left'||type==='right'){let to=clamp(s.lane+(type==='left'?-1:1),0,2);if(to===s.lane)return false;s.lane=to;s.events.push({type:'lane'});return true;}
 if(type==='jump'){if(s.y>0.015||s.rolling>0)return false;s.vy=8.8;s.y=0.02;s.stats.jumps++;s.events.push({type:'jump'});return true;}
 if(type==='roll'){if(s.y>0.07){s.vy=Math.min(s.vy,-10);return true;}s.rolling=0.82;s.stats.slides++;s.events.push({type:'slide'});return true;}
 if(type==='board'){if(s.boardTime>0||s.powerups.board<=0)return false;s.powerups.board--;s.boardTime=9;s.events.push({type:'board'});return true;}
 return false;
}
function generate(s){const R=s.random,depth=s.spawnZ-s.meters;let diff=clamp(s.meters/900,0,0.85),safe=Math.floor(R()*3);
 const configs=['train','barrier','arch','cone','train','barrier'];const density=s.spawnStep<3?0.26:clamp(0.43+diff*.31,0.43,0.78);
 // One passable lane is always deliberately left clear for a new spawn-wave.
 for(let lane=0;lane<3;lane++){
   if(lane===safe || R()>density)continue;
   let kind=configs[Math.floor(R()*configs.length)];
   if(s.spawnStep<3&&kind==='train')kind='barrier';
   s.obstacles.push({id:`o${s.spawnStep}_${lane}`,lane,kind,z:depth,length:kind==='train'?8:1.4,checked:false,cleared:false});
 }
 const coinLane=s.spawnStep<3?safe:(R()<.79?safe:Math.floor(R()*3));
 const count=3+Math.floor(R()*4);
 for(let j=0;j<count;j++)s.collectibles.push({id:`c${s.spawnStep}_${j}`,lane:coinLane,z:depth+3+j*2.2,height:0.86,got:false,type:'coin'});
 if(s.spawnStep>4&&R()<.12)s.collectibles.push({id:`p${s.spawnStep}`,lane:safe,z:depth+4,height:1.1,got:false,type:R()<.5?'magnet':'boost'});
 s.spawnZ+=21+R()*9;s.spawnStep++;
}
function tick(s,dt){dt=clamp(dt,0,0.05);s.animTime+=dt;if(s.mode!=='run')return;s.events=[];s.cameraShake=Math.max(0,s.cameraShake-dt*2.7);for(const fx of s.particles){fx.life-=dt;fx.x+=fx.vx*dt;fx.y+=fx.vy*dt;fx.vy+=dt*170;}s.particles=s.particles.filter(fx=>fx.life>0);
 s.speed=clamp(18+s.meters/145,18,36);s.meters+=s.speed*dt;s.score=Math.floor(s.meters*1.8+s.runCoins*11+s.nearMiss*20);s.roadOffset=(s.roadOffset+s.speed*dt)%4;
 s.laneX+=(LANES[s.lane]-s.laneX)*Math.min(1,dt*13);
 if(s.y>0||s.vy>0){s.y+=s.vy*dt;s.vy-=22*dt;if(s.y<=0){s.y=0;s.vy=0;s.events.push({type:'land'})}};
 s.rolling=Math.max(0,s.rolling-dt);s.boardTime=Math.max(0,s.boardTime-dt);s.magnetTime=Math.max(0,s.magnetTime-dt);s.boostTime=Math.max(0,s.boostTime-dt);s.stumble=Math.max(0,s.stumble-dt);
 for(const a of s.obstacles){let prev=a.z;a.z-=s.speed*dt;
 if(!a.checked&&prev>=PLAYER_Z&&a.z<PLAYER_Z){a.checked=true;const active=Math.abs(s.laneX-LANES[a.lane])<0.84;
 const collided=active&&(a.kind==='train'||(a.kind==='barrier'&&s.y<0.73)||(a.kind==='cone'&&s.y<0.40)||(a.kind==='arch'&&s.rolling<=0.04));
 if(collided){if(s.boardTime>0||s.shields>0){if(s.boardTime>0)s.boardTime=0;else s.shields--;s.stumble=.3;s.cameraShake=1;s.events.push({type:'saved'});}else{s.mode='over';s.cameraShake=1;s.events.push({type:'crash'});break;}}
 else if(active){s.nearMiss++;s.stats.dodges++;s.events.push({type:'dodge'});}
 }}
 if(s.mode==='run')for(const c of s.collectibles){c.z-=s.speed*dt;if(c.got||Math.abs(c.z-PLAYER_Z)>1.15)continue;
 if(s.magnetTime>0|| (c.lane===s.lane&&Math.abs(s.laneX-LANES[c.lane])<1.5)){
 c.got=true;
 if(c.type==='coin'){s.runCoins++;s.totalCoins++;s.stats.coins++;s.events.push({type:'coin',lane:c.lane})}
 else if(c.type==='magnet'){s.magnetTime=9;s.events.push({type:'power',name:'magnet'});}
 else {s.shields++;s.events.push({type:'power',name:'shield'});}
 }}
 s.obstacles=s.obstacles.filter(o=>o.z+o.length>-9);
 s.collectibles=s.collectibles.filter(c=>!c.got&&c.z>-7);
 while(s.spawnZ-s.meters<125){generate(s);} // spawnZ tracks absolute course progress; entities use camera-relative z
}
// Entities use relative depth; the generator maintains absolute course-distance scheduling.
function simulate(s,dt){tick(s,dt);}
function bonusEnd(s){return {distance:Math.floor(s.meters),score:s.score,coins:s.runCoins,multiplier:Math.min(5,1+Math.floor(s.meters/350))};}
const api={LANES,PLAYER_Z,CATALOG,clamp,rng,init,reset,input,generate,tick,simulate,bonusEnd};
if(typeof module!=='undefined'&&module.exports)module.exports=api;global.MetroEngine=api;
})(typeof window==='undefined'?globalThis:window);
