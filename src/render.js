(function(global){
'use strict';
const W=420,H=840, E=global.MetroEngine, road=E.LANES;
const ctx=document.getElementById('game').getContext('2d',{alpha:false});
const colors={skyTop:'#3090d2',skyBottom:'#d1f5ec',road:'#2d4b60',edge:'#f6c666',left:'#ff8f73',right:'#6ccad5'};
let bgOffset=0, camOffset=0;
function P(x,y,z){let f=855/(Math.max(0.4,z)+6.25);return {x:210+(x-camOffset)*f,y:238+(4.25-y)*f,f};}
function polygon(pts,fill,stroke,width=1){if(!pts.length)return;ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.lineWidth=width;ctx.strokeStyle=stroke;ctx.stroke();}}
function seg(x1,y1,z1,x2,y2,z2,color,width=3){const a=P(x1,y1,z1),b=P(x2,y2,z2);ctx.lineCap='round';ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
function quad(x1,y1,z1,x2,y2,z2,x3,y3,z3,x4,y4,z4,fill){polygon([P(x1,y1,z1),P(x2,y2,z2),P(x3,y3,z3),P(x4,y4,z4)],fill)}
function cuboid(x,y,z,w,h,d,front,side,top,edge){if(z<.3)z=.3;const xl=x-w/2,xr=x+w/2,zb=z+d;
 quad(xl,y,zb,xr,y,zb,xr,y+h,zb,xl,y+h,zb,'#25354e');
 quad(xl,y,z,xl,y,zb,xl,y+h,zb,xl,y+h,z,side);
 quad(xr,y,z,xr,y,zb,xr,y+h,zb,xr,y+h,z,side);
 quad(xl,y+h,z,xr,y+h,z,xr,y+h,zb,xl,y+h,zb,top);
 quad(xl,y,z,xr,y,z,xr,y+h,z,xl,y+h,z,front);
 if(edge){seg(xl,y+h,z,xr,y+h,z,edge,2.0);seg(xr,y,z,xr,y+h,z,edge,1.2)}
}
const bldColors=[['#fba46f','#d87569','#ffd8a1'],['#5b8caa','#375b87','#9ad7d8'],['#b57ca9','#7a5e99','#e1aad4'],['#f6c56c','#bc8468','#fae7ad'],['#77bb9d','#408e93','#b5e6cb']];
function city(s){const sk=ctx.createLinearGradient(0,0,0,610);sk.addColorStop(0,'#1d74bf');sk.addColorStop(.48,'#6bc3e0');sk.addColorStop(.8,'#c8f3ed');sk.addColorStop(1,'#ffe4be');ctx.fillStyle=sk;ctx.fillRect(0,0,W,H);
 const glow=ctx.createRadialGradient(315,145,9,310,150,190);glow.addColorStop(0,'#fff7c5df');glow.addColorStop(.3,'#fff3b84b');glow.addColorStop(1,'#fff3b800');ctx.fillStyle=glow;ctx.fillRect(0,0,W,390);
 ctx.fillStyle='#fff9d3';ctx.beginPath();ctx.arc(320,141,32,0,Math.PI*2);ctx.fill();
 let t=s.animTime*.32;for(let i=0;i<6;i++){let x=(i*95+(t*12)%(W+125))-65,y=85+i%3*43;ctx.fillStyle='rgba(255,255,255,.46)';ctx.beginPath();ctx.ellipse(x,y,36+i%2*12,11,0,0,Math.PI*2);ctx.ellipse(x+20,y+5,28,10,0,0,Math.PI*2);ctx.fill();}
 // Distant skyline panels.
 ctx.fillStyle='#7dbac6';for(let i=0;i<27;i++){const x=i*19-10,h=28+((i*23+7)%50);ctx.fillRect(x,245-h,16,h+18);}
 ctx.fillStyle='#92ccc9';ctx.fillRect(0,250,420,15);
 // avenue shoulders, converge to horizon
 polygon([P(-11,0,0),P(-11,0,165),P(-3.85,0,165),P(-3.85,0,0)],'#d8a79d');
 polygon([P(3.85,0,0),P(3.85,0,165),P(11,0,165),P(11,0,0)],'#a6cdbc');
 // colorful repeated scenery, clip foreground naturally
 const traveled=s.meters+(s.mode==='menu'?s.animTime*11:0);
 const stride=22;let off=(traveled%stride);for(let z=161-off;z>=1;z-=stride){let idx=Math.floor((traveled+z)/stride),set=bldColors[((idx%5)+5)%5];
  for(let side of [-1,1]){let x=side*(6.2+(idx%3)*.7),w=3.5+(idx%3)*.7,h=6+(idx*7%6);drawBuilding(x,z+3,w,h,set,side,idx);}}
}
function drawBuilding(x,z,w,h,cc,side,idx){if(z<2||z>157)return;
 cuboid(x,0,z,w,h,8,cc[0],cc[1],cc[2],'#fff2d358');
 if(z>78)return;
 // building facade window grid, recedes with projection
 for(let col=0;col<3;col++)for(let row=0;row<Math.min(5,Math.floor(h/1.4));row++){
 let xp=x-w*.34+col*w*.34,yp=1.1+row*1.35;
 let a=P(xp-.21,yp,z-.04),b=P(xp+.21,yp+.58,z-.04);
 ctx.fillStyle=(idx+col+row)%4===0?'#ffe9a3':'#3178a8';ctx.fillRect(a.x,b.y,b.x-a.x,a.y-b.y);
 }
}
function path(s){let traveled=s.meters+(s.mode==='menu'?s.animTime*11:0);
 // base track bed and side pavement
 quad(-4.23,0,0,-4.23,0,175,4.23,0,175,4.23,0,0,'#264b63');
 quad(-3.55,.02,0,-3.55,.02,175,3.55,.02,175,3.55,.02,0,'#657688');
 for(let lane=0;lane<3;lane++){
  let lx=road[lane];quad(lx-1,.025,0,lx-1,.025,175,lx+1,.025,175,lx+1,.025,0,(lane%2===0?'#5e6a76':'#64747e'));
 }
 for(let z=164-(traveled%3.6);z>0.3;z-=3.6){
  for(let lane=0;lane<3;lane++){
    let x=road[lane];quad(x-.89,.09,z,x-.89,.09,z+.47,x+.89,.09,z+.47,x+.89,.09,z,'#785b4b');
    quad(x-.85,.1,z,x-.85,.1,z+.12,x+.85,.1,z+.12,x+.85,.1,z,'#b4895e');
  }
 }
 for(let lane=0;lane<3;lane++)for(let lr of [-.73,.73]){
 let x=road[lane]+lr;quad(x-.072,.155,0,x-.072,.155,175,x+.072,.155,175,x+.072,.155,0,'#d5eff5');
 quad(x-.05,.21,0,x-.05,.21,175,x+.05,.21,175,x+.05,.21,0,'#698c98');
 }
 for(let lr of [-4.2,4.2])quad(lr-.16,.12,0,lr-.16,.12,175,lr+.16,.12,175,lr+.16,.12,0,'#ffd46d');
 // Station lamps
 for(let z=160-(traveled%24);z>3;z-=24){for(let side of [-1,1]){
  let x=side*4.75;seg(x,.1,z,x,5,z,'#e0f9f9',Math.max(1,3*60/(z+8)));
  quad(x-.11,4.8,z,x+.11,4.8,z,x+.11,5.14,z,x-.11,5.14,z,'#faf7d8');
  quad(x,5,z,x-side*1.65,5,z,x-side*1.65,4.88,z,x,4.88,z,'#bfdff1');
  const a=P(x-side*1.65,4.88,z);ctx.fillStyle='#fff1a1';ctx.beginPath();ctx.arc(a.x,a.y,Math.max(1,a.f*.17),0,Math.PI*2);ctx.fill();
 }}
}
function drawTrain(o){let x=road[o.lane],z=o.z;if(z>155||z+o.length<.7)return;z=Math.max(.5,z);const front=z;
 cuboid(x,.15,z,1.72,3.6,o.length,'#ffca3d','#2d819a','#ef836b','#fff0a8');
 // Side green shadow along length
 quad(x-.84,.85,z,x-.84,.85,z+o.length,x-.84,2.68,z+o.length,x-.84,2.68,z,'#237a90');
 quad(x+.84,.85,z,x+.84,.85,z+o.length,x+.84,2.68,z+o.length,x+.84,2.68,z,'#247991');
 const a=P(x-.58,1.69,front-.013),b=P(x+.58,2.97,front-.013);
 ctx.fillStyle='#20486b';ctx.beginPath();ctx.roundRect(a.x,b.y,b.x-a.x,a.y-b.y,Math.max(3,a.f*.13));ctx.fill();
 ctx.strokeStyle='#d5f7fb';ctx.lineWidth=Math.max(1,2.5*a.f/25);ctx.stroke();
 const windowshine=P(x-.19,2.5,front-.025),reflect=P(x+.36,2.84,front-.025);
 ctx.fillStyle='#90cadb77';polygon([P(x-.52,2.5,front-.02),P(x-.3,2.9,front-.02),P(x-.03,2.9,front-.02),P(x-.25,2.5,front-.02)],'#9defff60');
 quad(x-.70,.72,front-.03,x+.70,.72,front-.03,x+.70,1.2,front-.03,x-.70,1.2,front-.03,'#f08058');
 for(let lr of [-.54,.54]){let p=P(x+lr,.52,front-.035);ctx.fillStyle='#f9f7ca';ctx.beginPath();ctx.arc(p.x,p.y,Math.max(1,p.f*.125),0,Math.PI*2);ctx.fill();}
 let q=P(x,1.36,front-.04);ctx.fillStyle='#31566d';ctx.fillRect(q.x-q.f*.43,q.y-q.f*.03,q.f*.86,q.f*.09);
}
function drawBarrier(o){let x=road[o.lane],z=o.z;if(z>157||z<.6)return;const a=P(x,0,z),scale=a.f;
 cuboid(x,.18,z,1.55,.93,.35,'#f39e3a','#ad5c3d','#ffe0a4','#fff5cb');
 quad(x-.74,.5,z-.03,x+.74,.5,z-.03,x+.74,.81,z-.03,x-.74,.81,z-.03,'#f7ede0');
 for(let i=-2;i<=2;i++){let xx=x+i*.31;quad(xx-.11,.5,z-.05,xx+.04,.5,z-.05,xx+.11,.81,z-.05,xx-.04,.81,z-.05,'#f26b4c');}
 for(let sx of [-.55,.55])cuboid(x+sx,0,z,.14,.26,.3,'#354862','#354862','#668e9c');
}
function drawCone(o){let x=road[o.lane],z=o.z;if(z>157||z<.5)return;
 const a=P(x,0,z),f=a.f;ctx.fillStyle='#0f315f6a';ctx.beginPath();ctx.ellipse(a.x,a.y,f*.53,f*.14,0,0,Math.PI*2);ctx.fill();
 polygon([P(x-.48,0,z),P(x,1.02,z),P(x+.48,0,z)],'#ff883c','#ffe5ad',Math.max(1,f*.035));
 quad(x-.31,.27,z-.03,x+.31,.27,z-.03,x+.24,.41,z-.03,x-.24,.41,z-.03,'#ffe9bb');
}
function drawArch(o){let x=road[o.lane],z=o.z;if(z>157||z<.6)return;
 for(let lr of [-.81,.81])cuboid(x+lr,.1,z,.17,3.65,.25,'#547fb0','#284e82','#98bdde');
 cuboid(x,2.27,z,1.72,.54,.48,'#ef685a','#aa3b55','#ffb37b','#fff');
 let p=P(x,2.53,z-.04);ctx.fillStyle='#fff8de';ctx.font=`900 ${Math.max(8,Math.min(39,p.f*.33))}px system-ui`;ctx.textAlign='center';ctx.fillText('↓',p.x,p.y+4);
}
function drawCoin(c,t){if(c.z<.8||c.z>145)return;const p=P(road[c.lane],c.height+Math.sin(t*6+c.z*.5)*.09,c.z),r=Math.min(40,p.f*.31);
 ctx.fillStyle='#ffcf48';ctx.strokeStyle='#fff3a4';ctx.lineWidth=Math.max(1,r*.19);ctx.beginPath();ctx.ellipse(p.x,p.y,r*(.78+.2*Math.cos(t*4+c.z)),r,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#a86516';ctx.font=`900 ${r*.94}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',p.x,p.y+1);ctx.textBaseline='alphabetic';
 if(c.type!=='coin'){ctx.fillStyle=c.type==='magnet'?'#ad70e2':'#4ebce2';ctx.beginPath();ctx.arc(p.x,p.y,r*1.3,0,Math.PI*2);ctx.fill();ctx.font=`${r*1.5}px sans-serif`;ctx.fillText(c.type==='magnet'?'🧲':'🛡',p.x,p.y+r*.5);}
}
function runner(s){const skin=E.CATALOG.find(c=>c.id===s.skin)||E.CATALOG[0];const p=P(s.laneX,s.y,5.0),size=p.f/70;const x=p.x,y=p.y;
 ctx.save();ctx.translate(x,y);ctx.scale(size,size);
 if(s.cameraShake>0)ctx.translate(Math.sin(s.animTime*91)*s.cameraShake*5,0);
 // Shadow at ground
 const ground=P(s.laneX,0,5.0),yd=(ground.y-p.y)/size;
 ctx.fillStyle=s.boardTime>0?'#8d48ef70':'#032f4f51';ctx.beginPath();ctx.ellipse(0,yd-5,31+s.y*2.4,9,0,0,Math.PI*2);ctx.fill();
 let run=s.mode==='run'&&s.y<=0.04&&s.rolling<.1;const swing=run?Math.sin(s.animTime*23)*12:0;let lean=(E.LANES[s.lane]-s.laneX)*.13;
 if(s.rolling>0){ctx.translate(0,18);ctx.scale(1.1,.68);}else if(s.y>0){ctx.rotate(-.12*Math.sin(s.animTime*11));}
 ctx.rotate(E.clamp(lean,-.25,.25));
 if(s.boardTime>0){ctx.fillStyle='#772eaf';ctx.beginPath();ctx.roundRect(-34,-7,68,11,6);ctx.fill();ctx.strokeStyle='#84e0f3';ctx.lineWidth=3;ctx.stroke();for(let a of [-23,23]){ctx.fillStyle='#fee687';ctx.beginPath();ctx.arc(a,5,7,0,Math.PI*2);ctx.fill();}}
 // back arm, with skin color
 function limb(points,width,color,outline='#245068'){ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.strokeStyle=outline;ctx.lineWidth=width+3;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
 limb([[16,-73],[29,-58+swing*.23],[27,-40+swing*.44]],11,'#e8a16e');
 limb([[-13,-40],[-15+swing*.18,-19],[-20+swing*.29,-6]],13,'#222b53');
 limb([[13,-40],[15-swing*.18,-21],[20-swing*.3,-6]],13,'#232c56');
 // shoes
 ctx.fillStyle='#fcffec';ctx.strokeStyle='#283d59';ctx.lineWidth=3;for(let sx of [-1,1]){let sh=sx*20-sx*swing*.3;ctx.beginPath();ctx.roundRect(sh-15,-13,29,13,6);ctx.fill();ctx.stroke();}
 // hoodie torso
 ctx.fillStyle=skin.jacket;ctx.strokeStyle='#23405e';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-23,-86,46,52,14);ctx.fill();ctx.stroke();
 ctx.fillStyle='#ffffff62';ctx.beginPath();ctx.roundRect(-15,-81,8,40,4);ctx.fill();
 ctx.fillStyle='#ffda9f';ctx.beginPath();ctx.roundRect(-5,-94,11,13,4);ctx.fill();
 // arms in foreground
 limb([[-17,-76],[-32,-65-swing*.25],[-29,-47-swing*.5]],12,skin.jacket);ctx.fillStyle='#efb489';ctx.beginPath();ctx.arc(-29,-44-swing*.5,7,0,Math.PI*2);ctx.fill();
 // Head, neck and ear
 const face=ctx.createLinearGradient(-25,-127,27,-99);face.addColorStop(0,'#ffe0a4');face.addColorStop(.67,'#edb482');face.addColorStop(1,'#cd8661');
 ctx.fillStyle=face;ctx.strokeStyle='#a36658';ctx.lineWidth=2.3;ctx.beginPath();ctx.ellipse(0,-116,28,31,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#9a6247';ctx.beginPath();ctx.ellipse(20,-116,5,8,0,0,Math.PI*2);ctx.fill();
 // Hair/cap brim with pop color
 ctx.fillStyle=skin.hat;ctx.strokeStyle='#163952';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-28,-128);ctx.quadraticCurveTo(-26,-154,1,-151);ctx.quadraticCurveTo(28,-153,30,-128);ctx.quadraticCurveTo(11,-138,-28,-128);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.ellipse(12,-132,28,6,.14,0,Math.PI*2);ctx.fill();
 // Face eyes and brows
 ctx.fillStyle='#28324b';for(let q of [-9,11]){ctx.beginPath();ctx.ellipse(q,-118,2.3,3.4,0,0,Math.PI*2);ctx.fill();}
 ctx.lineWidth=1.3;ctx.strokeStyle='#974b49';ctx.beginPath();ctx.arc(3,-104,6,.18,Math.PI-.15);ctx.stroke();
 ctx.fillStyle='#ffeda7';ctx.beginPath();ctx.moveTo(-3,-148);ctx.lineTo(4,-148);ctx.lineTo(0,-137);ctx.closePath();ctx.fill();
 // Backpack
 ctx.fillStyle='#f7c74e';ctx.beginPath();ctx.roundRect(17,-74,14,34,5);ctx.fill();ctx.strokeStyle='#e48d48';ctx.lineWidth=2;ctx.stroke();
 ctx.restore();
}
function gameScene(s){camOffset=s.laneX*.38;ctx.save();ctx.clearRect(0,0,W,H);if(s.cameraShake>0)ctx.translate(Math.sin(s.animTime*110)*s.cameraShake*2,Math.sin(s.animTime*133)*s.cameraShake*1.5);
 city(s);path(s);
 let entities=[];for(const o of s.obstacles)entities.push({z:o.z,kind:'obs',o});for(const c of s.collectibles)entities.push({z:c.z,kind:'coin',o:c});entities.push({z:5,kind:'player'});entities.sort((a,b)=>b.z-a.z);
 for(const ent of entities){if(ent.kind==='player'){runner(s);continue;}if(ent.kind==='coin'){drawCoin(ent.o,s.animTime);continue;}const o=ent.o;if(o.z<-2||o.z>160)continue;if(o.kind==='train')drawTrain(o);if(o.kind==='barrier')drawBarrier(o);if(o.kind==='cone')drawCone(o);if(o.kind==='arch')drawArch(o);}
 for(const fx of s.particles){ctx.save();ctx.globalAlpha=Math.min(1,Math.max(0,fx.life*2));ctx.fillStyle='#ffe69b';ctx.beginPath();ctx.arc(fx.x,fx.y,3.1+Math.sin(fx.life*16)*1.3,0,Math.PI*2);ctx.fill();ctx.restore();}
 ctx.restore();
}
const api={render:gameScene,project:P,dimensions:{width:W,height:H}};
if(typeof module!=='undefined'&&module.exports)module.exports=api;global.MetroRender=api;
})(typeof window==='undefined'?globalThis:window);
