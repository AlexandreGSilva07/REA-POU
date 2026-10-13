/* Trackshift: independent stylized 3D city and runner, procedural geometry. */
(function(g){'use strict';
const G=g.Metro3D,E=g.MetroEngine;
const C={ballast:G.rgba('#405069'),ballast2:G.rgba('#455b70'),rail:G.rgba('#dceef0'),railSide:G.rgba('#718ea0'),wood:G.rgba('#9b7060'),woodSide:G.rgba('#5b4852'),platform:G.rgba('#dbb881'),platformTop:G.rgba('#f8ce96'),platformStripe:G.rgba('#fff4b9'),teal:G.rgba('#1f778c'),navy:G.rgba('#243c60'),orange:G.rgba('#f96c44'),aqua:G.rgba('#8bdce1'),sun:G.rgba('#ffd36b'),steel:G.rgba('#a0bdc9'),brick:G.rgba('#d86765'),window:G.rgba('#274c71'),lit:G.rgba('#ffe29d'),white:G.rgba('#fff6dc'),black:G.rgba('#202e42')};
const rand=(i)=>{let n=Math.sin(i*12.9898+78.233)*43758.5453;return n-Math.floor(n)};
function buildingChunk(id){let b=new G.Builder();const colors=['#efa875','#f1cc9b','#73bec1','#88a6cb','#e17a70','#f3b067','#96bd9b','#9189af'];
 for(let side of [-1,1]){
  // Promenade, benches, planters, facades & signage.
  b.box(side*6.04,-.005,-15,2.55,.22,30,G.rgba('#d7b78d'));
  b.box(side*5.0,.05,-15,.18,.25,30,G.rgba('#fff0c3'));
  b.box(side*7.45,-.1,-15,.25,.12,30,G.rgba('#76a6a0'));
  for(let q=0;q<3;q++){
   const seed=id*103+q*11+side*3+400;const z=-3-q*10.5;const tall=7.5+rand(seed)*10.5;const width=5+rand(seed+1)*2.2;const depth=9.3;const x=side*(11.2+rand(seed+4)*1.2),col=G.rgba(colors[Math.floor(rand(seed+5)*colors.length)]);
   b.box(x,tall/2-.1,z,width,tall,depth,col);
   b.box(x,tall+.2,z,width+.35,.4,depth+.15,G.rgba('#f9dcb1'));
   b.box(x,tall+.55,z,width-.7,.18,depth-.3,G.rgba('#37647c'));
   // Windows on facades turned toward runner (the x-facing wall).
   let toward=x-side*(width/2+.04);
   for(let y=2.1;y<tall-1.1;y+=1.8){for(let k=-1;k<=1;k++){
     let wz=z+k*2.42;let dark=rand(seed+y*8+k*4)>.67;
     b.box(toward,y,wz,.09,.94,1.28,G.rgba('#34516a'));
     b.box(toward-side*.065,y,wz,.075,.74,1.02,dark?G.rgba('#fee4a6'):G.rgba('#80cfd2'));
     b.box(toward-side*.105,y+.16,wz-.13,.08,.15,.6,G.rgba('#fff0b9'));
     b.box(toward-side*.08,y-.48,wz,.21,.1,1.4,G.rgba('#f9d6a1'));
   }}
   // Lateral front sign / awning and ground floor entry.
   b.box(toward-side*.14,1.8,z,.22,.31,3.6,G.rgba(['#f37068','#57abc1','#d4b75e'][q]));
   b.box(toward-side*.19,.93,z,.11,1.46,1.4,G.rgba('#365268'));
   b.box(toward-side*.27,.95,z,.1,1.19,1.13,G.rgba('#6ba4a6'));
   // Glowing billboard shape.
   b.box(toward-side*.32,3.55,z+1.55,.27,1.05,1.25,G.rgba('#fff1b8'));
   b.box(toward-side*.38,3.55,z+1.55,.10,.69,.92,G.rgba('#e57a79'));
  }
  // Street lamps and planters.
  for(let q=0;q<3;q++){
    let z=-2-q*10.3;
    b.box(side*5.55,2.6,z,.14,5.2,.14,G.rgba('#456a75'));
    b.box(side*5.2,5.2,z,.75,.12,.16,G.rgba('#4b6b7e'));
    b.box(side*5.0,5.09,z,.34,.12,.42,G.rgba('#ffe4a4'));
    b.box(side*6.27,.48,z-2.2,.98,.8,1.08,G.rgba('#d8a079'));
    b.box(side*6.27,1.0,z-2.2,1.08,.18,1.18,G.rgba('#f3ce90'));
    b.sphere(side*6.27,1.42,z-2.2,.65,G.rgba(q===1?'#468b7c':'#4a9e80'),7,10);
    b.sphere(side*6.38,1.73,z-2.42,.32,G.rgba('#62b68a'),7,10);
    // Alternating palms soften the urban canyons; every part is actual 3D.
    if((q+id)%2===0){const px=side*7.46,pz=z-5.8;
      b.cylinder(px,2.07,pz,.115,4.14,G.rgba('#a87756'),9);
      b.cylinder(px,3.27,pz,.18,.18,G.rgba('#c5a06e'),9);
      for(let k=0;k<7;k++){let a=k/7*Math.PI*2;let lx=px+Math.cos(a)*.82,lz=pz+Math.sin(a)*.82;
        b.sphere(lx,4.00-Math.abs(Math.cos(a))*.19,lz,.49,G.rgba(k%2?'#4fae83':'#2e917b'),7,10);
      }
      b.sphere(px,4.23,pz,.45,G.rgba('#62ba83'),8,12);
    }
  }
 }
 // Overhead supports and glow hanging lights.
 for(let q=0;q<1;q++){let z=-11.4-q*14;
   b.box(0,7.2,z,11.8,.075,.11,G.rgba('#527e89'));
   b.box(-5.6,3.55,z,.19,7.1,.22,G.rgba('#4f7484'));
   b.box(5.6,3.55,z,.19,7.1,.22,G.rgba('#4f7484'));
   for(let k=-2;k<=2;k++)b.box(k*2.1,7.1,z+.15,.3,.12,.27,G.rgba('#ffe5a1'));
 }
 return b;}
function trackChunk(){const b=new G.Builder();
 b.box(0,-.27,-15,10.25,.6,30,G.rgba('#2d4255'));
 for(let l=0;l<3;l++){let x=E.LANES[l];
  b.box(x,-.014,-15,2.12,.15,30,G.rgba('#556575'));
  b.box(x,-.015,-15,1.88,.08,30,G.rgba('#806b63'));
  for(let z=-29.2;z<0;z+=1.55){b.box(x,.044,z,2.33,.13,.38,C.woodSide);b.box(x,.136,z,2.24,.072,.33,C.wood)}
  for(let side of [-1,1]){
    b.box(x+side*.76,.19,-15,.15,.25,30,C.railSide);
    b.box(x+side*.76,.32,-15,.10,.12,30,C.rail);
    b.box(x+side*.76,.397,-15,.025,.03,30,G.rgba('#ffffff'));
  }
 }
 // Yellow curb & raised platform edges.
 for(let side of [-1,1]){
    b.box(side*4.62,.31,-15,.58,.61,30,G.rgba('#dbaa76'));
    b.box(side*4.35,.64,-15,.09,.08,30,G.rgba('#fff0ad'));
    b.box(side*4.89,.61,-15,.12,.08,30,G.rgba('#b78a61'));
    for(let z=-28;z<0;z+=2.8)b.box(side*4.35,.68,z,.1,.035,.87,G.rgba('#fce6b0'));
 }
 return b;}
function trainMesh(seed=0){const b=new G.Builder();let white=G.rgba('#f7e7c8'),paint=G.rgba(['#71bec6','#f18b6e','#acc9cd','#edce7b'][seed%4]),darker=G.rgba(['#24657b','#ae4e60','#607f9a','#98765a'][seed%4]);
 // Body starts on front z=0; extends away toward -z. Upper corners are chamfered using layered body segments.
 b.box(0,1.69,-4.65,2.03,3.02,9.2,white);
 b.box(0,3.06,-4.66,2.05,.46,9.25,paint);
 b.box(0,3.34,-4.66,1.87,.16,9.22,G.rgba('#d8f3e4'));
 b.box(0,.39,-4.65,2.13,.43,9.18,darker);
 b.box(0,1.09,-4.65,2.08,.34,9.2,paint);
 b.box(0,1.25,-4.65,2.12,.12,9.25,G.rgba('#f7d477'));
 // Front-facing beveled face and windshield.
 b.box(0,1.95,.024,1.89,2.36,.14,white);
 b.box(0,2.46,.12,1.69,1.13,.1,G.rgba('#243f5f'));
 b.box(0,2.48,.181,1.51,.92,.03,G.rgba('#65aab5'));
 b.polygon([[-.70,2.79,.204],[-.23,2.88,.204],[-.52,2.10,.204],[-.76,2.10,.204]],G.rgba('#a9dfdd'));
 b.box(0,1.67,.123,1.62,.16,.05,darker);
 b.box(0,.84,.129,1.7,.17,.05,G.rgba('#ef705e'));
 b.box(0,.57,.138,1.78,.17,.06,G.rgba('#384f66'));
 for(let sx of [-1,1]){
   b.box(sx*.74,1.02,.165,.24,.16,.08,G.rgba('#fff4b8')); b.box(sx*.74,1.02,.206,.12,.09,.02,G.rgba('#fffefa'));
   b.box(sx*.85,3.04,.14,.12,.15,.09,G.rgba('#eec57c'));
   // Side windows, door seams and reflected highlights.
   for(let i=0;i<5;i++){
     let z=-1.03-i*1.7;
     b.box(sx*1.07,2.35,z,.10,.98,1.2,G.rgba('#3a6280'));
     b.box(sx*1.124,2.38,z,.035,.80,1.0,G.rgba('#75bac2'));
     b.box(sx*1.149,2.5,z-.20,.02,.12,.44,G.rgba('#bce7db'));
     b.box(sx*1.095,1.21,z,.035,.13,1.42,G.rgba('#ead27e'));
   }
   for(let i=0;i<2;i++){
     const z=-2.15-i*3.3;
     b.box(sx*1.075,1.34,z,.03,2.45,.08,G.rgba('#6d8a94'));
     b.box(sx*1.12,1.25,z+.21,.05,.09,.1,G.rgba('#e9c472'));
   }
 }
 // Rounded rooftop ventilation. Wheels and base.
 b.box(0,3.51,-4.55,1.08,.21,3.3,G.rgba('#91bac1'));
 for(let z of [-1.9,-7.2])for(let sx of [-1,1]){
   b.cylinder(sx*.80,.28,z,.32,.35,G.rgba('#2b3447'),12);
 }
 return b;}
function barrierMesh(){let b=new G.Builder();b.box(0,.70,-.25,2.06,1.3,.27,G.rgba('#ffe2a5'));b.box(0,.72,-.07,2.2,.92,.10,G.rgba('#fff7e8'));
 for(let i=-2;i<=2;i++)b.box(i*.44,.73,-.001,.25,.91,.09,G.rgba('#ef6951'));
 for(let sx of [-1,1]){b.box(sx*.77,.24,-.35,.17,.52,.39,G.rgba('#4c6882'));b.box(sx*.77,1.43,-.32,.18,.2,.28,G.rgba('#fff0a8'))}
 return b;}
function archMesh(){let b=new G.Builder();let iron=G.rgba('#d86f6a');for(let sx of [-1,1])b.box(sx*.88,1.53,-.17,.2,3.05,.42,G.rgba('#456b7b'));
 b.box(0,2.62,-.15,1.83,.38,.38,iron);b.box(0,2.35,.11,1.86,.21,.16,G.rgba('#ffda8a'));
 for(let i=-2;i<=2;i++)b.box(i*.35,2.61,.12,.20,.24,.07,G.rgba('#fff4ca'));return b;}
function coneMesh(){let b=new G.Builder();b.box(0,.08,0,.8,.14,.77,G.rgba('#394e64'));b.cylinder(0,.40,0,.32,.61,G.rgba('#fa8152'),9);b.cylinder(0,.49,0,.24,.13,G.rgba('#fff7d8'),9);return b;}
function coinMesh(){let b=new G.Builder();b.torus(0,0,0,.42,.12,G.rgba('#f9b83f'),24,8);b.cylinder(0,0,0,.34,.08,G.rgba('#ffe482'),24);b.box(0,.046,0,.24,.052,.24,G.rgba('#fff2a2'));return b;}
function dotMesh(){let b=new G.Builder();b.sphere(0,0,0,1,G.rgba('#fbd981'),8,12);return b;}
function platformMesh(){let b=new G.Builder();b.box(0,1,0,1,1,1,G.rgba('#5ea59a'));return b;}
function heroParts(){let p={};const mesh=(name,fn)=>{const b=new G.Builder();fn(b);p[name]=b};
 mesh('hair',b=>b.sphere(0,0,0,1,G.rgba('#5a3841'),14,20));
 mesh('head',b=>b.sphere(0,0,0,1,G.rgba('#f6b182'),20,28));
 mesh('nose',b=>b.sphere(0,0,0,1,G.rgba('#e99572'),9,12));
 mesh('body',b=>b.sphere(0,0,0,1,G.rgba('#f06956'),18,28));
 mesh('shirt',b=>b.sphere(0,0,0,1,G.rgba('#fff0c9'),12,18));
 mesh('hood',b=>b.torus(0,0,0,.65,.20,G.rgba('#fa9872'),18,7));
 mesh('pack',b=>{b.box(0,0,0,1.72,1.65,.84,G.rgba('#eca94b'));b.box(0,.48,.07,1.55,.43,.91,G.rgba('#ffc66b'));b.box(0,-.14,.46,1.41,.07,.06,G.rgba('#c97e3d'));});
 mesh('packEdge',b=>b.box(0,0,0,1,1,1,G.rgba('#a96354')));
 mesh('packPatch',b=>b.box(0,0,0,1,1,1,G.rgba('#fff0c4')));
 mesh('strap',b=>b.box(0,0,0,1,1,1,G.rgba('#c77747')));
 mesh('cap',b=>b.sphere(0,0,0,1,G.rgba('#285071'),20,28));
 mesh('bill',b=>b.sphere(0,0,0,1,G.rgba('#1b425e'),9,16));
 mesh('hatDot',b=>b.sphere(0,0,0,1,G.rgba('#fbd785'),7,10));
 mesh('denim',b=>b.sphere(0,0,0,1,G.rgba('#254e7c'),11,16));
 mesh('sneaker',b=>b.sphere(0,0,0,1,G.rgba('#fbf5e9'),9,14));
 mesh('sole',b=>b.box(0,0,0,1,1,1,G.rgba('#3e5e70')));
 mesh('skin',b=>b.sphere(0,0,0,1,G.rgba('#f3ab7d'),10,12));
 mesh('shadow',b=>b.sphere(0,0,0,1,G.rgba('#152c39',.34),10,16));
 return p;}
class CityScene{
 constructor(canvas){this.r=new G.Renderer(canvas);this.mesh={};for(let i=0;i<4;i++)this.mesh['train'+i]=this.r.mesh(trainMesh(i));this.mesh.track=this.r.mesh(trackChunk());for(let i=0;i<5;i++)this.mesh['town'+i]=this.r.mesh(buildingChunk(i));this.mesh.barrier=this.r.mesh(barrierMesh());this.mesh.arch=this.r.mesh(archMesh());this.mesh.cone=this.r.mesh(coneMesh());this.mesh.coin=this.r.mesh(coinMesh());this.mesh.dot=this.r.mesh(dotMesh());const pp=heroParts();for(const [name,b] of Object.entries(pp))this.mesh[name]=this.r.mesh(b);
 this.last=0;this.canvas=canvas;this.framerate=0;this.debug={};}
 part(id,x,y,z,sx,sy,sz,parent=G.M(),ry=0,rx=0,rz=0,opacity=1){this.r.render(this.mesh[id],G.mul(parent,G.transform(x,y,z,sx,sy,sz,ry,rx,rz)),opacity)}
 hero(s,t){let bob=Math.abs(Math.sin(t*10.8))*.075,jump=s.y*.87,bend=s.rolling>0?.55:1;let angle=Math.sin(t*10.8)*.62,sideTilt=(E.LANES[s.lane]-s.laneX)*.06;
 let root=G.transform(s.laneX,0,4.45,1,1,1,0,0,sideTilt);
 this.part('shadow',0,.015,.12,.66,.019,.42,root,0,0,0,.44);
 let core=G.mul(root,G.move(0,jump+bob,0));
 let posture=s.rolling>0?G.mul(core,G.move(0,-.38,0)):core;
 if(s.boardTime>0){this.part('packEdge',0,.19,.07,1.23,.12,2.03,posture);this.part('hatDot',0,.13,.4,.35,.09,.44,posture)}
 this.part('body',0,1.10,0,.46,.53,.30,posture,0,s.rolling>0?.75:.12);
 this.part('shirt',0,1.25,-.235,.44,.24,.16,posture);
 this.part('head',0,1.94,-.055,.345,.395,.325,posture);
 // Hair hidden below the cap, avoiding overlapping coplanar surfaces.
 this.part('hair',0,1.99,-.18,.31,.18,.27,posture);
 this.part('cap',0,2.235,-.035,.393,.194,.36,posture);
 this.part('bill',0,2.18,-.355,.32,.072,.22,posture);
 this.part('hatDot',0,2.45,.0,.065,.065,.063,posture);
 this.part('pack',0,1.10,.38,.34,.39,.19,posture);
 this.part('packEdge',0,.89,.52,.39,.12,.08,posture);
 this.part('packPatch',0,1.14,.508,.22,.13,.05,posture);this.part('strap',-.28,1.29,.18,.10,.50,.12,posture,0,0,-.26);this.part('strap',.28,1.29,.18,.10,.50,.12,posture,0,0,.26);
 // Animated arms with pivot at shoulder.
 for(let side of [-1,1]){
   let p=G.mul(posture,G.mul(G.move(side*.46,1.40,0),G.rotX(side*angle)));
   this.part('body',side*.04,-.28,0,.14,.27,.15,p);
   this.part('skin',side*.04,-.55,.02,.12,.15,.13,p);
   let leg=G.mul(posture,G.mul(G.move(side*.25,.70,0),G.rotX(-side*angle*.78)));
   this.part('denim',0,-.27,0,.20,.34,.22,leg);
   let knee=G.mul(leg,G.mul(G.move(0,-.55,.0),G.rotX(Math.max(0,side*angle)*.55)));
   this.part('denim',0,-.16,.02,.178,.28,.20,knee);
   this.part('sneaker',0,-.45,-.12,.245,.16,.37,knee);
   this.part('sole',0,-.56,-.10,.42,.10,.52,knee);
 }
 }
 draw(s,dt=0){const now=performance.now()/1000;let active=s.mode==='run',speed=active?s.speed:14;
 const camera={eye:[s.laneX*.18,4.1+(active?Math.sin(now*10)*.024:0),16.6],at:[s.laneX*.07,1.2,-21]};this.r.viewport(camera);
 let scroll=active?s.meters:now*1.8,mod=scroll%30;const r=this.r;
 // Sky-to-horizon color tinted fog and oversize perspective geometry.
 for(let i=0;i<9;i++){let z=24-30*i+mod;r.render(this.mesh.track,G.move(0,0,z));r.render(this.mesh['town'+(i%5)],G.move(0,0,z-12));}
 // Far parked show trains at sides, offset to skyline rhythm.
 for(let i=0;i<8;i++){const z=3-29*i+(scroll%29);if(z<12){this.r.render(this.mesh['train'+((i+2)%4)],G.transform(-5.96,.40,z,1,1,1));if(i%3===0)this.r.render(this.mesh['train'+((i+1)%4)],G.transform(5.95,.40,z-13,1,1,1));}}
 // A train on an outer lane frames the menu as an environmental preview, not a collision object.
 if(!active && s.mode==='menu'){r.render(this.mesh.train2,G.move(E.LANES[2],.38,-18));r.render(this.mesh.barrier,G.move(E.LANES[0],0,-14));r.render(this.mesh.train0,G.move(-6.95,.42,-13));}
 // Interactive objects, mapped engine camera-relative depth.
 let obstacles=s.obstacles||[],coins=s.collectibles||[];
 for(const o of obstacles){let z=9.35-o.z;if(z>13||z< -150)continue;let x=E.LANES[o.lane];if(o.kind==='train')r.render(this.mesh['train'+((o.lane+Math.floor(o.z)%4+4)%4)],G.move(x,.38,z));
 else r.render(this.mesh[o.kind],G.move(x,0,z));}
 for(const c of coins){if(c.got)continue;let z=9.35-c.z;if(z>13||z< -140)continue;let x=E.LANES[c.lane];let bounce=.17*Math.sin(now*4+c.z);r.render(this.mesh.coin,G.transform(x,.97+bounce,z,.74,.74,.74,now*2));}
 this.hero(s,now);
 r.finish();this.debug.draws=r.draws;this.debug.meshes=this.r.meshes.length;this.debug.current=s.mode;
 }
}
g.TrackshiftScene=CityScene;
})(window);
