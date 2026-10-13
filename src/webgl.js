/* Lightweight genuine WebGL renderer. Geometry and shader implementation are original. */
(function(g){'use strict';
const TAU=Math.PI*2;
const V=(r,g,b,a=1)=>[r/255,g/255,b/255,a];
const PALETTE={teal:V(43,164,177),ink:V(24,52,80),cream:V(255,224,166)};
function rgba(hex,a=1){const n=parseInt(hex.replace('#',''),16);return V((n>>16)&255,(n>>8)&255,n&255,a)}
function M(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}
function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){o[c*4+r]=0;for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k]};return o}
function move(x=0,y=0,z=0){const m=M();m[12]=x;m[13]=y;m[14]=z;return m}
function scale(x=1,y=1,z=1){const m=M();m[0]=x;m[5]=y;m[10]=z;return m}
function rotX(a){const m=M(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[9]=-s;m[6]=s;m[10]=c;return m}
function rotY(a){const m=M(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[8]=s;m[2]=-s;m[10]=c;return m}
function rotZ(a){const m=M(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[4]=-s;m[1]=s;m[5]=c;return m}
function transform(x,y,z,sx=1,sy=1,sz=1,ry=0,rx=0,rz=0){return mul(move(x,y,z),mul(rotY(ry),mul(rotX(rx),mul(rotZ(rz),scale(sx,sy,sz)))))}
function persp(fov,aspect,near,far){const f=1/Math.tan(fov/2),m=new Float32Array(16);m[0]=f/aspect;m[5]=f;m[10]=(far+near)/(near-far);m[11]=-1;m[14]=2*far*near/(near-far);return m}
function lookAt(eye,target){let z=[eye[0]-target[0],eye[1]-target[1],eye[2]-target[2]];let n=Math.hypot(...z);z=z.map(v=>v/n);let x=[z[2],0,-z[0]];n=Math.hypot(...x);x=x.map(v=>v/n);let y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];const m=M();m[0]=x[0];m[1]=y[0];m[2]=z[0];m[4]=x[1];m[5]=y[1];m[6]=z[1];m[8]=x[2];m[9]=y[2];m[10]=z[2];m[12]=-x[0]*eye[0]-x[1]*eye[1]-x[2]*eye[2];m[13]=-y[0]*eye[0]-y[1]*eye[1]-y[2]*eye[2];m[14]=-z[0]*eye[0]-z[1]*eye[1]-z[2]*eye[2];return m}
function compile(gl,type,src){let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
class Builder{
 constructor(){this.v=[];this.i=[]}
 tri(a,b,c,col){let n=[(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1]),(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]),(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])];const len=Math.hypot(...n)||1;n=n.map(v=>v/len);const at=this.v.length/10;for(const p of [a,b,c])this.v.push(...p,...n,...col);this.i.push(at,at+1,at+2);return this}
 quad(a,b,c,d,col){this.tri(a,b,c,col);this.tri(a,c,d,col);return this}
 box(x,y,z,w,h,d,col){const A=[x-w/2,y-h/2,z-d/2],B=[x+w/2,y-h/2,z-d/2],C=[x+w/2,y+h/2,z-d/2],D=[x-w/2,y+h/2,z-d/2],E=[x-w/2,y-h/2,z+d/2],F=[x+w/2,y-h/2,z+d/2],G=[x+w/2,y+h/2,z+d/2],H=[x-w/2,y+h/2,z+d/2];
 const shade=(k)=>[Math.min(1,col[0]*k),Math.min(1,col[1]*k),Math.min(1,col[2]*k),col[3]];
 this.quad(E,F,G,H,shade(1.07));this.quad(B,A,D,C,shade(.79));this.quad(A,E,H,D,shade(.89));this.quad(F,B,C,G,shade(.88));this.quad(D,H,G,C,shade(1.16));this.quad(A,B,F,E,shade(.7));return this}
 cylinder(x,y,z,r,h,col,n=12){const a=this.v.length;for(let i=0;i<n;i++){const t=i/n*TAU,t2=(i+1)/n*TAU;const a=[x+Math.cos(t)*r,y-h/2,z+Math.sin(t)*r],b=[x+Math.cos(t2)*r,y-h/2,z+Math.sin(t2)*r],c=[x+Math.cos(t2)*r,y+h/2,z+Math.sin(t2)*r],d=[x+Math.cos(t)*r,y+h/2,z+Math.sin(t)*r];this.quad(a,d,c,b,col);this.tri([x,y+h/2,z],c,d,col);this.tri([x,y-h/2,z],a,b,col)}return this}
 sphere(x,y,z,r,col,rows=10,cols=16){const rr=Math.max(3,rows),cc=Math.max(6,cols);for(let i=0;i<rr;i++){let phi=i/rr*Math.PI,phi2=(i+1)/rr*Math.PI;for(let j=0;j<cc;j++){let theta=j/cc*TAU,theta2=(j+1)/cc*TAU;let f=(p,t)=>[x+r*Math.sin(p)*Math.cos(t),y+r*Math.cos(p),z+r*Math.sin(p)*Math.sin(t)];let a=f(phi,theta),b=f(phi2,theta),c=f(phi2,theta2),d=f(phi,theta2);this.quad(a,d,c,b,col)}}return this}
 torus(x,y,z,major,tube,col,segments=22,rings=6){const v=(a,b)=>{let R=major+tube*Math.cos(b);return [x+Math.sin(a)*R,y+Math.sin(b)*tube,z+Math.cos(a)*R]};for(let i=0;i<segments;i++){let t=i/segments*TAU,u=(i+1)/segments*TAU;for(let j=0;j<rings;j++){let p=j/rings*TAU,q=(j+1)/rings*TAU;this.quad(v(t,p),v(u,p),v(u,q),v(t,q),col)}}return this}
 polygon(points,col){for(let i=1;i<points.length-1;i++)this.tri(points[0],points[i],points[i+1],col);return this}
}
class Renderer{
 constructor(canvas){this.canvas=canvas;const gl=canvas.getContext('webgl',{antialias:true,alpha:true,depth:true,powerPreference:'high-performance'})||canvas.getContext('experimental-webgl');if(!gl){this.software=new SoftwareRenderer(canvas);this.meshes=[];this.draws=0;return}this.gl=gl;
 const vs=`attribute vec3 position;attribute vec3 normal;attribute vec4 color;uniform mat4 projection,view,model;varying vec3 vNormal;varying vec4 vColor;varying float vDepth;varying vec3 vWorld;void main(){vec4 world=model*vec4(position,1.);vWorld=world.xyz;vNormal=mat3(model)*normal;vColor=color;vec4 clip=view*world;vDepth=length(clip.xyz);gl_Position=projection*clip;}`;
 const fs=`precision mediump float;varying vec3 vNormal;varying vec4 vColor;varying float vDepth;varying vec3 vWorld;uniform float opacity;uniform vec3 fogColor;uniform float fogStart,fogEnd;uniform vec3 sunDir;void main(){vec3 n=normalize(vNormal);float key=max(0.,dot(n,sunDir));float wrap=max(0.,dot(n,-sunDir));float up=clamp(n.y*.5+.5,0.,1.);vec3 light=vec3(.59,.67,.81)+vec3(.42,.34,.19)*key+vec3(.12,.11,.22)*wrap+up*vec3(.07,.06,.04);float spec=pow(max(0.,dot(reflect(-sunDir,n),normalize(vec3(0.,1.,1.)))),28.)*.09;vec3 base=vColor.rgb*light+vec3(1.,.77,.45)*spec;float fog=clamp((vDepth-fogStart)/(fogEnd-fogStart),0.,1.);fog=fog*fog*(3.-2.*fog);base=mix(base,fogColor,fog*.88);gl_FragColor=vec4(base,vColor.a*opacity);}`;
 const program=gl.createProgram();gl.attachShader(program,compile(gl,gl.VERTEX_SHADER,vs));gl.attachShader(program,compile(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);this.prog=program;
 const attr=n=>gl.getAttribLocation(program,n),unif=n=>gl.getUniformLocation(program,n);this.aPos=attr('position');this.aNormal=attr('normal');this.aColor=attr('color');this.uProjection=unif('projection');this.uView=unif('view');this.uModel=unif('model');this.uOpacity=unif('opacity');this.uFog=unif('fogColor');this.uFogStart=unif('fogStart');this.uFogEnd=unif('fogEnd');this.uSun=unif('sunDir');this.meshes=[];this.draws=0;
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0.,0.,0.,0.);
 }
 mesh(b){if(this.software){const m={verts:new Float32Array(b.v),count:b.v.length/10};this.meshes.push(m);return m}const gl=this.gl,data=new Float32Array(b.v);const vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);const count=b.v.length/10;const m={vbo,count};this.meshes.push(m);return m}
 viewport(camera){if(this.software){this.software.viewport(camera);this.draws=0;return}const gl=this.gl,w=this.canvas.clientWidth||400,h=this.canvas.clientHeight||800;const dpr=Math.min(window.devicePixelRatio||1,1.7);const ww=Math.round(w*dpr),hh=Math.round(h*dpr);if(this.canvas.width!==ww||this.canvas.height!==hh){this.canvas.width=ww;this.canvas.height=hh}gl.viewport(0,0,ww,hh);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.prog);gl.uniformMatrix4fv(this.uProjection,false,persp(Math.PI/3.25,ww/hh,.1,280));gl.uniformMatrix4fv(this.uView,false,lookAt(camera.eye,camera.at));gl.uniform3f(this.uFog,.80,.82,.75);gl.uniform1f(this.uFogStart,48);gl.uniform1f(this.uFogEnd,158);gl.uniform3f(this.uSun,.54,.87,.35);this.draws=0}
 render(m,model=M(),opacity=1){if(this.software){this.software.render(m,model,opacity);this.draws++;return}const gl=this.gl;gl.uniformMatrix4fv(this.uModel,false,model);gl.uniform1f(this.uOpacity,opacity);gl.bindBuffer(gl.ARRAY_BUFFER,m.vbo);for(const [attr,size,offset] of [[this.aPos,3,0],[this.aNormal,3,12],[this.aColor,4,24]]){gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,size,gl.FLOAT,false,40,offset)}gl.drawArrays(gl.TRIANGLES,0,m.count);this.draws++}
 finish(){if(this.software)this.software.finish()}
 dispose(){if(!this.software)for(const m of this.meshes)this.gl.deleteBuffer(m.vbo);this.meshes.length=0}
}
// Software raster preview uses identical 3D mesh positions, depth and perspective.
// It is deliberately only a fallback: normal mobile playback uses GPU WebGL.
class SoftwareRenderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.calls=[];this.w=0;this.h=0;this.frame=0;}
 viewport(camera){this.w=this.canvas.clientWidth||400;this.h=this.canvas.clientHeight||800;this.canvas.width=Math.round(this.w);this.canvas.height=Math.round(this.h);this.eye=camera.eye;this.view=lookAt(camera.eye,camera.at);this.proj=persp(Math.PI/3.25,this.w/this.h,.1,280);this.calls=[];}
 render(mesh,model,opacity){this.calls.push({mesh,model,opacity})}
 finish(){let ctx=this.ctx,w=this.w,h=this.h;let sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#668fb6');sky.addColorStop(.4,'#a4cad2');sky.addColorStop(.62,'#e0d4b1');sky.addColorStop(1,'#b9a58b');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);const triangles=[];
 for(let {mesh,model,opacity} of this.calls){const verts=mesh.verts,mvp=mul(this.proj,mul(this.view,model));let tx=model[12],ty=model[13],tz=model[14];if(tz<-165||tz>22)continue;for(let i=0;i<verts.length;i+=30){const points=[];let d=0;let behind=false;for(let q=0;q<3;q++){let j=i+q*10,x=verts[j],y=verts[j+1],z=verts[j+2];const cx=mvp[0]*x+mvp[4]*y+mvp[8]*z+mvp[12],cy=mvp[1]*x+mvp[5]*y+mvp[9]*z+mvp[13],cz=mvp[2]*x+mvp[6]*y+mvp[10]*z+mvp[14],cw=mvp[3]*x+mvp[7]*y+mvp[11]*z+mvp[15];if(cw<.13){behind=true;break}points.push([w/2*(1+cx/cw),h/2*(1-cy/cw)]);d+=cw;}if(behind||points.length<3)continue;d/=3;let a=(points[1][0]-points[0][0])*(points[2][1]-points[0][1])-(points[1][1]-points[0][1])*(points[2][0]-points[0][0]);if(a>=0||Math.abs(a)<.21)continue;
 if(points.every(p=>p[0]<-30)||points.every(p=>p[0]>w+30)||points.every(p=>p[1]<-35)||points.every(p=>p[1]>h+35))continue;
 let nx=verts[i+3],ny=verts[i+4],nz=verts[i+5];let normal=[model[0]*nx+model[4]*ny+model[8]*nz,model[1]*nx+model[5]*ny+model[9]*nz,model[2]*nx+model[6]*ny+model[10]*nz];let light=.60+Math.max(0,normal[0]*.42+normal[1]*.85+normal[2]*.4)*.55+Math.max(0,normal[1])*.08;let fog=Math.max(0,Math.min(1,(d-38)/102))*.73;
 let rr=verts[i+6]*255*light,gg=verts[i+7]*255*light,bb=verts[i+8]*255*light;rr=rr*(1-fog)+158*fog;gg=gg*(1-fog)+197*fog;bb=bb*(1-fog)+211*fog;triangles.push({p:points,z:d,col:`rgba(${Math.min(255,rr)|0},${Math.min(255,gg)|0},${Math.min(255,bb)|0},${Math.min(1,verts[i+9]*opacity)})`});
 }}
 triangles.sort((a,b)=>b.z-a.z);for(const o of triangles){ctx.fillStyle=o.col;ctx.beginPath();ctx.moveTo(o.p[0][0],o.p[0][1]);ctx.lineTo(o.p[1][0],o.p[1][1]);ctx.lineTo(o.p[2][0],o.p[2][1]);ctx.closePath();ctx.fill()}
 this.triangles=triangles.length;
 }
}
g.Metro3D={V,rgba,M,mul,move,scale,rotX,rotY,rotZ,transform,lookAt,persp,Builder,Renderer,PALETTE};
})(window);
