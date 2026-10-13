/* TRACKSHIFT 0.2 — original, procedural perspective art. No external game assets. */
(function(global){
'use strict';
const C=document.getElementById('game'),ctx=C.getContext('2d',{alpha:false});
const E=global.MetroEngine,W=420,H=840,LANES=E.LANES;
let camX=0,camY=0,now=0;
const TAU=Math.PI*2;
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function P(x,y,z){const f=820/(Math.max(.55,z)+6.9);return{x:W*.5+(x-camX)*f,y:245+(4.45-y+camY)*f,f};}
function fillpoly(points,color,stroke,sw=1){if(points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return;ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.closePath();ctx.fillStyle=color;ctx.fill();if(stroke){ctx.lineWidth=sw;ctx.strokeStyle=stroke;ctx.stroke()}}
function Q(a,b,c,d,col){fillpoly([P(...a),P(...b),P(...c),P(...d)],col)}
function line(a,b,col,w=2){const p=P(...a),q=P(...b);ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}
function rect(x,y,w,h,col,r=0){ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function circ(x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
function cube(x,y,z,w,h,d,front,side,top){const l=x-w/2,r=x+w/2,b=z+d;Q([l,y,z],[l,y,b],[l,y+h,b],[l,y+h,z],side);Q([r,y,z],[r,y,b],[r,y+h,b],[r,y+h,z],side);Q([l,y+h,z],[r,y+h,z],[r,y+h,b],[l,y+h,b],top);Q([l,y,z],[r,y,z],[r,y+h,z],[l,y+h,z],front)}
function gradient(x,y,w,h,c1,c2){const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,c1);g.addColorStop(1,c2);return g}
const facades=[
  {front:'#e98a72',side:'#945277',top:'#ffd4a0',trim:'#ffcb87'},
  {front:'#7bc9ba',side:'#357b8e',top:'#b8f4d4',trim:'#e4ffe3'},
  {front:'#d49bbf',side:'#6f6497',top:'#f4bfe6',trim:'#ffecbd'},
  {front:'#efc676',side:'#9b8368',top:'#fff0aa',trim:'#ffefd4'},
  {front:'#8ca6d2',side:'#526b9d',top:'#d6dfff',trim:'#e4fffd'},
  {front:'#a8af87',side:'#637a7a',top:'#e2e7ad',trim:'#f0ffd6'}
];
function background(s){
 const sky=ctx.createLinearGradient(0,0,0,580);sky.addColorStop(0,'#162c60');sky.addColorStop(.34,'#316eac');sky.addColorStop(.70,'#86ccda');sky.addColorStop(1,'#ffe0bd');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 // Huge hazy sun and atmospheric perspective; no flat white cloud blobs.
 const sx=308,sy=153,gl=ctx.createRadialGradient(sx,sy,5,sx,sy,190);gl.addColorStop(0,'#fff7cd55');gl.addColorStop(.45,'#fce8aa23');gl.addColorStop(1,'#ffe0bb00');ctx.fillStyle=gl;ctx.fillRect(0,0,W,450);circ(sx,sy,30,'#ffecc1');
 ctx.globalAlpha=.15;for(let i=0;i<6;i++){let x=((i*133+s.animTime*2.2)%620)-100,y=100+i%3*24;ctx.fillStyle='#defbff';ctx.beginPath();ctx.ellipse(x,y,68,11,.05,0,TAU);ctx.fill()}ctx.globalAlpha=1;
 // Layers of distant city skyline and atmospheric haze.
 let t=s.meters*.012+s.animTime*.15;for(let layer=0;layer<3;layer++){
 for(let i=0;i<37;i++){
 const x=i*17-17-(t*(layer+1))%17;let hh=25+((i*11+layer*29)%65),y=255-hh+(2-layer)*8;
 rect(x,y,13+layer*2,hh+40,['#6ca0c2','#5886b0','#4a81a6'][layer]);
 if(layer>0){ctx.fillStyle='#e6f5d23c';for(let k=0;k<3;k++)ctx.fillRect(x+3+k*4,y+9,2,3)}
 }}
 const mist=ctx.createLinearGradient(0,214,0,285);mist.addColorStop(0,'#b8e8e500');mist.addColorStop(.6,'#bce1cf5a');mist.addColorStop(1,'#ffdfc300');ctx.fillStyle=mist;ctx.fillRect(0,214,W,71);
}
function building(x,z,w,h,facade,seed){const sign=seed%4===0,face=facade.front;
 cube(x,0,z,w,h,8,face,facade.side,facade.top);
 // Roof detail and cornice as colored real geometry
 cube(x,h-.25,z-.12,w+.24,.26,8.2,facade.trim,facade.side,facade.top);
 if(z>105)return;
 const winRows=Math.min(9,Math.floor(h/1.15)),cols=3;
 for(let rr=0;rr<winRows;rr++)for(let cc=0;cc<cols;cc++){
   const xp=x+(cc-1)*w*.28,yp=1.3+rr*1.13;
   const bright=(seed*7+cc*13+rr*5)%7<3,ww=w*.16;
   Q([xp-ww/2,yp,z-.12],[xp+ww/2,yp,z-.12],[xp+ww/2,yp+.60,z-.12],[xp-ww/2,yp+.60,z-.12],bright?'#ffe7a2':'#264c79');
   line([xp,yp,z-.15],[xp,yp+.60,z-.15],bright?'#ffdba049':'#8ccadb55',Math.max(.6,1.1*P(xp,0,z).f/28));
 }
 if(sign&&z<70){
   const yr=Math.min(h-1.4,3.8),dist=z-.22;
   Q([x-w*.4,yr,dist],[x+w*.4,yr,dist],[x+w*.4,yr+.75,dist],[x-w*.4,yr+.75,dist],'#1c355b');
   const text=P(x,yr+.5,dist);const f=P(x,yr,dist).f;
   ctx.save();ctx.shadowBlur=Math.min(20,f*.6);ctx.shadowColor='#67f4ee';ctx.fillStyle='#bafaf5';ctx.font=`900 ${clamp(f*.30,5,26)}px system-ui`;ctx.textAlign='center';ctx.fillText(['STATION','CITY','URBAN','METRO'][seed%4],text.x,text.y);ctx.restore();
 }
}
function sceneBuildings(s){const traveled=s.meters+(s.mode==='menu'?s.animTime*12:0);
 // Sidewalks and streets form clear perspective edges, not flat trapezoids.
 Q([-25,-.1,0],[-25,-.1,170],[-3.95,-.1,170],[-3.95,-.1,0],'#ad8f92');
 Q([3.95,-.1,0],[3.95,-.1,170],[25,-.1,170],[25,-.1,0],'#78aca8');
 for(let z=145-(traveled%20);z>.75;z-=20){const id=Math.floor((traveled+z)/20),cc=facades[(id%6+6)%6];
  for(const side of [-1,1]){
    const x=side*(6.35+(id%3)*.7),w=3.7+(id%3)*.45,h=5.3+((id*13+5)%7);
    building(x,z+3,w,h,facades[(id+((side+1)*2)+600)%6],Math.abs(id+((side+1)*17)));
    // Side pavement planters and street trees (ellipses stacked in perspective).
    if(id%2===0&&z<97){const tx=side*4.97,p=P(tx,2.05,z),f=p.f;
      line([tx,.25,z],[tx,2.2,z],'#3d605d',Math.max(1,f*.13));
      ctx.fillStyle='#296d69';ctx.beginPath();ctx.ellipse(p.x,p.y,f*.84,f*.96,.13,0,TAU);ctx.fill();
      ctx.fillStyle='#5ba77b';ctx.beginPath();ctx.ellipse(p.x-f*.20,p.y-f*.22,f*.6,f*.7,0,0,TAU);ctx.fill();
      ctx.fillStyle='#a7d8a0aa';ctx.beginPath();ctx.ellipse(p.x+f*.06,p.y-f*.41,f*.25,f*.19,0,0,TAU);ctx.fill();
    }
  }
 }
}
function railway(s){let run=s.meters+(s.mode==='menu'?s.animTime*12:0);
 // Depth layering & asphalt under track.
 Q([-4.2,0,0],[-4.2,0,170],[4.2,0,170],[4.2,0,0],'#343f56');
 Q([-3.48,.01,0],[-3.48,.01,170],[3.48,.01,170],[3.48,.01,0],'#53637a');
 // Three distinct colored ballast strips
 for(let i=0;i<3;i++){const x=LANES[i];Q([x-1.015,.025,0],[x-1.015,.025,170],[x+1.015,.025,170],[x+1.015,.025,0],i===1?'#55677d':'#4b5f72')}
 // Hundreds of perspective sleepers, crisp highlights and cast shadows
 for(let z=169-(run%3.15);z>.2;z-=3.15){for(const lx of LANES){
   Q([lx-.95,.04,z],[lx-.95,.04,z+.39],[lx+.95,.04,z+.39],[lx+.95,.04,z],'#24364a');
   Q([lx-.94,.065,z],[lx-.94,.065,z+.23],[lx+.94,.065,z+.23],[lx+.94,.065,z],'#9a6857');
   Q([lx-.90,.08,z],[lx-.90,.08,z+.07],[lx+.90,.08,z+.07],[lx+.90,.08,z],'#c98e63');
 }}
 for(const lx of LANES)for(const sign of [-1,1]){const r=lx+sign*.73;
  Q([r-.09,.155,0],[r-.09,.155,170],[r+.09,.155,170],[r+.09,.155,0],'#96a9bc');
  Q([r-.034,.215,0],[r-.034,.215,170],[r+.034,.215,170],[r+.034,.215,0],'#f3f2e9');
  Q([r-.06,.22,0],[r-.06,.22,170],[r+.06,.22,170],[r+.06,.22,0],'#c8e5e2a8');
 }
 for(let side of [-1,1]){
  const x=side*4.07;Q([x-.16,.12,0],[x-.16,.12,170],[x+.16,.12,170],[x+.16,.12,0],'#f3ba79');
  const xx=side*4.35;Q([xx-.10,.16,0],[xx-.10,.16,170],[xx+.10,.16,170],[xx+.10,.16,0],'#293c56');
 }
 // Platform columns, electrical gantries, neon signals and signal lights.
 for(let z=150-(run%23);z>2;z-=23){
  for(const side of [-1,1]){const x=side*4.65;
    line([x,.1,z],[x,6.2,z],'#dde8da',Math.max(1,P(x,0,z).f*.10));
    line([x,6.2,z],[x-side*1.35,6.2,z],'#536f86',Math.max(1,P(x,0,z).f*.09));
    const lp=P(x-side*1.35,6.05,z),r=clamp(lp.f*.10,1,15);circ(lp.x,lp.y,r,'#fff3c4');
    if(z<50){ctx.save();ctx.globalAlpha=.18;const g=ctx.createRadialGradient(lp.x,lp.y,2,lp.x,lp.y,r*6);g.addColorStop(0,'#ffebb8');g.addColorStop(1,'#ffe9a000');ctx.fillStyle=g;ctx.fillRect(lp.x-r*6,lp.y-r*6,12*r,12*r);ctx.restore()}
  }
  if(z<85&&Math.floor((run+z)/23)%4===0){line([-4.7,6.4,z],[4.7,6.4,z],'#41536a',Math.max(1,P(0,0,z).f*.14));
    const p=P(0,6.5,z);ctx.fillStyle='#edc872';ctx.font=`900 ${clamp(p.f*.16,5,22)}px system-ui`;ctx.textAlign='center';ctx.fillText('CITY LINE',p.x,p.y-1)}
 }
}
function train(o){const z=o.z,x=LANES[o.lane];if(z>152||z+o.length<.5)return;
 const d=Math.max(.55,z),len=o.length;
 // Extruded modern subway carriage, large windows and strip lights.
 cube(x,.13,d,1.88,3.95,len,'#e1e9e8','#3d8799','#f4f2e6');
 Q([x-.95,.4,d-.05],[x+.95,.4,d-.05],[x+.95,3.8,d-.05],[x-.95,3.8,d-.05],'#eef0e8');
 Q([x-.88,.42,d-.08],[x+.88,.42,d-.08],[x+.88,.65,d-.08],[x-.88,.65,d-.08],'#de7856');
 Q([x-.94,2.85,d-.09],[x+.94,2.85,d-.09],[x+.94,3.31,d-.09],[x-.94,3.31,d-.09],'#e9b24c');
 Q([x-.72,1.32,d-.1],[x+.72,1.32,d-.1],[x+.66,2.75,d-.1],[x-.66,2.75,d-.1],'#17385b');
 Q([x-.62,2.55,d-.13],[x+.04,2.55,d-.13],[x-.26,1.43,d-.13],[x-.73,1.43,d-.13],'#91d7db62');
 const badge=P(x,3.11,d-.15);ctx.fillStyle='#233f53';ctx.font=`900 ${clamp(badge.f*.20,5,18)}px system-ui`;ctx.textAlign='center';ctx.fillText('M  •  01',badge.x,badge.y+badge.f*.04);
 for(const dx of [-.6,.6]){let a=P(x+dx,.8,d-.18),r=clamp(a.f*.13,1,15);circ(a.x,a.y,r,'#fff8c3');circ(a.x,a.y,r*.55,'#ffffff');}
 for(let k=1;k<Math.min(6,Math.floor(len/1.5));k++){let zk=d+k*1.3;Q([x-.968,1.30,zk],[x-.968,1.30,zk+.76],[x-.968,2.95,zk+.76],[x-.968,2.95,zk],'#204b68');Q([x+.969,1.30,zk],[x+.969,1.30,zk+.76],[x+.969,2.95,zk+.76],[x+.969,2.95,zk],'#2c5c76');}
}
function barrier(o){const x=LANES[o.lane],z=o.z;if(z>151||z<.52)return;
 for(const side of [-1,1])cube(x+side*.58,.05,z,.16,1.35,.42,'#4a556a','#29394f','#7b95a9');
 cube(x,.36,z,1.7,.85,.4,'#f8c167','#be664d','#fff0a7');
 for(let i=-2;i<=2;i++){const x1=x+i*.27;Q([x1-.11,.5,z-.03],[x1+.06,.5,z-.03],[x1+.13,1.09,z-.03],[x1-.04,1.09,z-.03],i%2?'#ef694d':'#fbf9df')}
 for(const dx of [-.65,.65]){const p=P(x+dx,1.1,z-.06);circ(p.x,p.y,clamp(p.f*.055,1,8),'#fff4a8')}
}
function cone(o){const x=LANES[o.lane],z=o.z;if(z>150||z<.5)return;
 Q([x-.55,.02,z],[x-.55,.02,z+.48],[x+.55,.02,z+.48],[x+.55,.02,z],'#34364c');
 fillpoly([P(x-.41,.08,z),P(x,.99,z),P(x+.41,.08,z)],'#f0864a','#f5c18c',Math.max(1,P(x,0,z).f*.015));
 Q([x-.25,.35,z-.02],[x+.25,.35,z-.02],[x+.17,.50,z-.02],[x-.17,.50,z-.02],'#f9f2d8');
}
function arch(o){const x=LANES[o.lane],z=o.z;if(z>150||z<.5)return;
 for(const lr of [-.85,.85])cube(x+lr,0,z,.18,3.75,.5,'#ffcc78','#a75b6f','#fff0bd');
 cube(x,2.55,z,2.0,.55,.65,'#ef685a','#ac4055','#ffbe8d');
 let p=P(x,2.92,z-.07);ctx.font=`900 ${clamp(p.f*.33,8,38)}px system-ui`;ctx.textAlign='center';ctx.fillStyle='#fff9df';ctx.fillText('↓',p.x,p.y);
}
function coin(c,t){if(c.z<.56||c.z>150)return;let h=c.height+Math.sin(t*7+c.z*.5)*.07,p=P(LANES[c.lane],h,c.z),r=clamp(p.f*.27,1,33);ctx.save();ctx.shadowColor='#ffcf5e';ctx.shadowBlur=clamp(r*.8,1,17);
 ctx.fillStyle='#d38224';ctx.beginPath();ctx.ellipse(p.x,p.y,r*.92,r,0,0,TAU);ctx.fill();ctx.fillStyle='#ffe570';ctx.beginPath();ctx.ellipse(p.x-1,p.y,r*.82,r*.89,0,0,TAU);ctx.fill();ctx.strokeStyle='#fff7b1';ctx.lineWidth=clamp(r*.13,1,3);ctx.stroke();ctx.restore();
 ctx.font=`900 ${r*.95}px system-ui`;ctx.fillStyle='#c38529';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✦',p.x,p.y);ctx.textBaseline='alphabetic';
 if(c.type!=='coin'){ctx.strokeStyle=c.type==='magnet'?'#be75ff':'#79e8ff';ctx.lineWidth=clamp(r*.23,2,7);ctx.beginPath();ctx.arc(p.x,p.y,r*1.25,0,TAU);ctx.stroke();ctx.font=`${r*1.3}px sans-serif`;ctx.fillText(c.type==='magnet'?'🧲':'🛡',p.x,p.y+r*.38)}
}
function hero(s){const skin=E.CATALOG.find(x=>x.id===s.skin)||E.CATALOG[0];const p=P(s.laneX,s.y,5),size=p.f/69,x=p.x,y=p.y;
 ctx.save();ctx.translate(x,y);ctx.scale(size,size);
 const running=s.mode==='run'&&s.y<.07&&s.rolling<=0;const bob=running?Math.sin(s.animTime*21)*2:0,step=running?Math.sin(s.animTime*21)*20:0;
 const ground=P(s.laneX,0,5);let sh=(ground.y-p.y)/size;
 ctx.fillStyle='#132b3f83';ctx.beginPath();ctx.ellipse(0,sh-4,30,8,0,0,TAU);ctx.fill();
 if(s.boardTime>0){ctx.save();ctx.shadowColor='#c16dff';ctx.shadowBlur=18;rect(-34,-6,68,10,'#a258df',5);rect(-24,-4,48,3,'#9df8e8',2);ctx.restore()}
 ctx.translate(0,bob);
 if(s.rolling>0){ctx.translate(0,31);ctx.scale(1.03,.6)}
 else if(s.y>0){ctx.rotate(-.075)}
 // Rear camera, runner faces the rails. Shoulder and foot animation remain readable even at tiny scales.
 const lineBody=(coords,wide,body,edge='#1c3553')=>{ctx.beginPath();ctx.moveTo(...coords[0]);for(let i=1;i<coords.length;i++)ctx.lineTo(...coords[i]);ctx.lineWidth=wide+4;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=edge;ctx.stroke();ctx.lineWidth=wide;ctx.strokeStyle=body;ctx.stroke()};
 const legL=clamp(step,-19,19),legR=-legL;
 lineBody([[-10,-54],[-12+legL*.25,-29],[-13+legL*.6,-8]],15,'#243b63');
 lineBody([[11,-54],[12+legR*.22,-27],[13+legR*.62,-9]],15,'#29436a');
 // Dynamic sneakers with rubber sole, shadows.
 for(const [xx,jj] of [[-14,legL],[14,legR]]){ctx.save();ctx.translate(xx+jj*.59,-8);ctx.rotate(jj*.018);rect(-12,-7,25,14,'#edf6ec',5);rect(-13,0,25,5,'#263c58',2);rect(-10,-7,18,4,xx>0?'#62e7d6':'#ffce67',2);ctx.restore()}
 // Upper limbs in front/back order.
 lineBody([[18,-91],[29,-70+step*.38],[23,-53+step*.38]],13,skin.jacket);
 lineBody([[-18,-91],[-29,-70-step*.38],[-25,-55-step*.38]],13,skin.jacket);
 for(const xh of [-25,23]){circ(xh,-53+(xh<0?-step:step)*.38,7,'#db976d')}
 // Shirt with volume/shadows, hood, seam and folded hem.
 const shirt=gradient(-20,-97,49,65,skin.jacket,'#25324a');ctx.fillStyle=shirt;ctx.strokeStyle='#263454';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(-15,-100);ctx.quadraticCurveTo(-31,-88,-27,-57);ctx.quadraticCurveTo(0,-47,28,-57);ctx.quadraticCurveTo(30,-90,16,-100);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#ffffff1e';ctx.beginPath();ctx.moveTo(-19,-86);ctx.lineTo(-12,-66);ctx.lineTo(-10,-60);ctx.lineTo(-15,-62);ctx.closePath();ctx.fill();
 // Large sculpted backpack: iconic silhouette from behind, not flat pouch.
 ctx.save();ctx.shadowColor='#16253899';ctx.shadowBlur=7;ctx.shadowOffsetY=4;
 const bag=ctx.createLinearGradient(-20,-87,22,-43);bag.addColorStop(0,'#f8cf67');bag.addColorStop(.6,'#e89c3f');bag.addColorStop(1,'#c57739');ctx.fillStyle=bag;ctx.strokeStyle='#925334';ctx.lineWidth=3;
 ctx.beginPath();ctx.roundRect(-16,-88,32,41,10);ctx.fill();ctx.stroke();ctx.restore();
 rect(-12,-70,24,17,'#efbe5c',6);rect(-8,-64,16,4,'#bd7442',2);rect(-3,-86,6,5,'#ffebaa',2);
 // Neck, head volume back-facing, dark brown hair underneath cap.
 rect(-8,-112,16,16,'#d18d64',5);
 const head=ctx.createLinearGradient(-25,-151,28,-112);head.addColorStop(0,'#ffdb9c');head.addColorStop(.52,'#d59972');head.addColorStop(1,'#a46853');
 ctx.fillStyle=head;ctx.strokeStyle='#875c56';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-128,27,29,0,0,TAU);ctx.fill();ctx.stroke();
 ctx.fillStyle='#372c40';ctx.beginPath();ctx.ellipse(0,-147,26,13,0,Math.PI,TAU);ctx.fill();
 // Baseball cap 3D, back panel, seams, rear adjustment strap.
 ctx.fillStyle=skin.hat;ctx.strokeStyle='#213754';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-29,-137);ctx.quadraticCurveTo(-30,-168,0,-165);ctx.quadraticCurveTo(28,-166,28,-137);ctx.quadraticCurveTo(2,-145,-29,-137);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.strokeStyle='#ffffff55';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,-162);ctx.quadraticCurveTo(-8,-149,0,-138);ctx.stroke();
 rect(-7,-143,14,5,'#243950',3);rect(-4,-142,8,3,'#f5ce7a',2);
 if(s.magnetTime>0){ctx.save();ctx.shadowColor='#9ddaff';ctx.shadowBlur=20;ctx.strokeStyle='#affcfe';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-86,59,0,TAU);ctx.stroke();ctx.restore()}
 ctx.restore();
}
function render(s){now=s.animTime;camX=s.laneX*.13;camY=0;
 ctx.save();ctx.clearRect(0,0,W,H);
 if(s.cameraShake>0)ctx.translate(Math.sin(s.animTime*110)*s.cameraShake*3,Math.sin(s.animTime*135)*s.cameraShake*2);
 background(s);sceneBuildings(s);railway(s);
 let objects=[];for(const o of s.obstacles)objects.push({z:o.z,type:'o',v:o});for(const o of s.collectibles)objects.push({z:o.z,type:'c',v:o});objects.push({z:5,type:'hero'});objects.sort((a,b)=>b.z-a.z);
 for(const item of objects){if(item.type==='hero'){hero(s);continue}if(item.type==='c'){coin(item.v,s.animTime);continue}const o=item.v;if(o.z>155||o.z<-2)continue;if(o.kind==='train')train(o);else if(o.kind==='barrier')barrier(o);else if(o.kind==='cone')cone(o);else if(o.kind==='arch')arch(o)}
 for(const fx of s.particles){ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,fx.life*2));circ(fx.x,fx.y,3+Math.sin(fx.life*12)*1.5,'#ffdc68');ctx.restore()}
 // In-camera motion streaks at high speeds and atmospheric vignette.
 if(s.mode==='run'&&s.speed>23){const alpha=clamp((s.speed-23)/60,0,.18);ctx.strokeStyle=`rgba(221,245,246,${alpha})`;ctx.lineWidth=1;for(let i=0;i<17;i++){const lx=(i*91+13)%W,ly=270+(i*69%580);ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+(lx-210)*.045,ly+18+s.speed*.2);ctx.stroke()}}
 const v=ctx.createRadialGradient(210,440,240,210,420,585);v.addColorStop(0,'#09173700');v.addColorStop(1,'#07152a5a');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
 ctx.restore();
}
const api={render,project:P,dimensions:{width:W,height:H}};
if(typeof module!=='undefined'&&module.exports)module.exports=api;global.MetroRender=api;
})(typeof window==='undefined'?globalThis:window);
