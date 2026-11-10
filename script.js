const cv=document.getElementById('c'),W=900,H=620;let g=cv.getContext('2d');
const ITEMS=['🍨','☕','🥤','🍰','🍹','🥧'],COLORS=['#d33','#7c3','#c5b','#37c','#e92','#4bb','#a5c'];
const TABLES=[[300,230],[620,230],[460,345],[250,445],[650,445]];
const SEATS=[];TABLES.forEach(([x,y],i)=>SEATS.push({x:x-90,y:y+25,c:null,m:0},{x:x+90,y:y+25,c:null,m:0}));
const STATIONS=ITEMS.map((_,i)=>({x:80+i*85,y:578,i})),TRASH={x:600,y:575},BASE={day:1};
let G={st:'menu',hero:'f',day:1,earned:0,goal:100,time:90,cs:[],tray:[],spawn:2,sel:null,w:{x:450,y:500,goal:null},msg:'',mt:0,tv:0};
const UP={tray:0,speed:0,pat:0},BANK={v:0};
function start(day){if(day===1){UP.tray=UP.speed=UP.pat=0;BANK.v=0}G={...G,st:'play',day,earned:0,goal:80+day*40,time:90,cs:[],tray:[],spawn:1,sel:null,combo:0,w:{x:450,y:500,goal:null}};SEATS.forEach(s=>{s.c=null;s.m=0;s.d=0})}
const say=t=>{G.msg=t;G.mt=2};
const maxPat=()=>Math.max(18,40-G.day*3)+UP.pat*5;
function spawn(){const c={h:Math.random()*5|0,sc:COLORS[Math.random()*7|0],col:COLORS[Math.random()*7|0],item:Math.random()*ITEMS.length|0,st:'queue',p:maxPat(),mp:maxPat(),t:0,seat:null};c.need=[c.item];if(G.day>1&&Math.random()<.3)c.need.push(Math.random()*ITEMS.length|0);c.n=c.need.length;if(Math.random()<.12){c.vip=1;c.sc='#fc0';c.mp=c.p=c.mp*.7}G.cs.push(c)}
const queue=()=>G.cs.filter(c=>c.st==='queue');
function qpos(c){const i=queue().indexOf(c);return{x:45+(i%3)*38,y:310+(i/3|0)*42}}
function walk(x,y,fn){G.w.goal={x,y,fn}}
function update(dt){
 if(G.mt>0)G.mt-=dt;G.tv+=dt;for(const p of P){p.y+=p.v*dt;p.x+=Math.sin(G.tv+p.ph)*12*dt;if(p.y>H){p.y=-5;p.x=Math.random()*W}}for(const f of FX){f.l-=dt;f.y-=40*dt}while(FX.length&&FX[0].l<=0)FX.shift();if(G.st!=='play')return;
 G.time=Math.max(0,G.time-dt);
 G.spawn-=dt;if(G.time>0&&G.spawn<=0&&queue().length<6){spawn();G.spawn=Math.max(3,9-G.day)+Math.random()*3}
 const w=G.w;w.mv=0;if(w.goal){const dx=w.goal.x-w.x,dy=w.goal.y-w.y,d=Math.hypot(dx,dy),s=(300+UP.speed*60)*dt;
  if(d<=s){w.x=w.goal.x;w.y=w.goal.y;const f=w.goal.fn;w.goal=null;f&&f()}else{w.x+=dx/d*s;w.y+=dy/d*s;w.mv=1;if(Math.abs(dx)>3)w.dir=dx>0?1:-1}}
 for(const c of G.cs){c.t+=dt;
  if(['queue','sitting','ordered'].includes(c.st)){c.p-=dt*(c.st==='queue'?.6:1);if(c.p<=0){c.st='leave';c.angry=1;G.combo=0;sfx(150,.3,'sawtooth');if(c.seat){c.seat.c=null;c.seat=null}if(G.sel===c)G.sel=null}}
  else if(c.st==='eating'){c.eat-=dt;if(c.eat<=0){c.st='pay';c.seat.m=Math.round((12+Math.round(c.p/c.mp*10)+c.item*2+(c.n-1)*12+Math.min(10,G.combo*2))*(c.vip?2:1));sfx(880,.12)}}
  else if(c.st==='leave'){c.lt=(c.lt||0)+dt}}
 G.cs=G.cs.filter(c=>!(c.st==='leave'&&c.lt>1));
 if(G.time<=0&&!G.cs.length){G.st=G.earned>=G.goal?'win':'lose'}
}
const P=[],FX=[];for(let i=0;i<28;i++)P.push({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2.5,v:15+Math.random()*30,ph:Math.random()*6});
function fx(x,y,t,col){FX.push({x,y,t,col,l:1.3})}
const rr=(x,y,w,h,r)=>{g.beginPath();g.roundRect(x,y,w,h,r)};
let AC=null,MUTE=false,K=1,PORT=false,SC=1,QS=1,EMA=16,FN=0;
function sfx(f,d=.1,ty='sine'){if(MUTE)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),v=AC.createGain();o.type=ty;o.frequency.value=f;v.gain.value=.06;o.connect(v);v.connect(AC.destination);o.start();v.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.stop(AC.currentTime+d)}catch(e){}}
function fit(){const dpr=Math.min(devicePixelRatio||1,3),vw=innerWidth,vh=window.visualViewport?visualViewport.height:innerHeight;PORT=vh>vw*1.05;const sc=Math.min((PORT?vh:vw)/W,(PORT?vw:vh)/H);SC=sc;cv.style.width=W*sc+'px';cv.style.height=H*sc+'px';cv.style.transform='translate(-50%,-50%)'+(PORT?' rotate(90deg)':'');K=Math.min(sc*dpr,1.8)*QS;cv.width=Math.round(W*K);cv.height=Math.round(H*K)}
function pos(e){const r=cv.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);return PORT?[(dy+W*SC/2)/SC,(-dx+H*SC/2)/SC]:[(dx+W*SC/2)/SC,(dy+H*SC/2)/SC]}
const SH=[['tray','🍽️ Bandeja maior (+1)',2,60],['speed','👟 Penny mais rápida',3,60],['pat','💖 Clientes pacientes',3,70]],cost=(k,b)=>b*(UP[k]+1);
function drawShop(){txt('LOJA DA PENNY',450,110,48,'#ffd23a');txt('Banco: $'+BANK.v,450,155,26,'#9f9');
 SH.forEach((o,i)=>{const y=190+i*80,mx=UP[o[0]]>=o[2],c=cost(o[0],o[3]),ok=!mx&&BANK.v>=c;g.fillStyle=ok?'#2a8f5a':'#34495e';rr(200,y,500,64,14);g.fill();txt(o[1],220,y+30,22,'#fff','left');txt('Nível '+UP[o[0]]+'/'+o[2],220,y+54,14,'#cde','left');txt(mx?'MÁXIMO':'$'+c,680,y+40,24,ok?'#ffd23a':'#999','right')});
 g.fillStyle='#e8a317';rr(300,450,300,60,16);g.fill();txt('Começar dia '+(G.day+1),450,490,26,'#fff')}
function shopClick(x,y){SH.forEach((o,i)=>{const yy=190+i*80,c=cost(o[0],o[3]);if(x>200&&x<700&&y>yy&&y<yy+64&&UP[o[0]]<o[2]&&BANK.v>=c){BANK.v-=c;UP[o[0]]++;sfx(900,.15)}});if(x>300&&x<600&&y>450&&y<510)start(G.day+1)}
function pen(x,y,col,o={}){const s=o.s||1,t=G.tv+(o.ph||0),mv=o.mv,bob=mv?Math.abs(Math.sin(t*10))*5:Math.sin(t*2)*1.2,d=o.dir||1,sw=mv?Math.sin(t*10)*7:0;
 g.fillStyle='rgba(0,229,255,.2)';g.beginPath();g.ellipse(x,y+28*s,27*s,7*s,0,0,7);g.fill();
 g.save();g.translate(x,y-bob);g.scale(s*d,s);g.lineJoin='round';
 g.fillStyle='#222';g.beginPath();g.moveTo(-18,22);g.lineTo(-30,30);g.lineTo(-14,30);g.fill();
 const ft=g.createLinearGradient(0,22,0,30);ft.addColorStop(0,'#ffb52e');ft.addColorStop(1,'#f07a00');g.fillStyle=ft;g.strokeStyle='#b55a00';g.lineWidth=1.5;
 for(const k of[-1,1]){g.beginPath();g.ellipse(k*9+sw*k+4,27,12,5.5,0,0,7);g.fill();g.stroke()}
 let b=g.createRadialGradient(-8,-2,3,0,8,34);b.addColorStop(0,'#5c5c66');b.addColorStop(1,'#1d1d22');g.fillStyle=b;g.strokeStyle='#0d0d10';g.lineWidth=2;g.beginPath();g.ellipse(0,8,23,27,0,0,7);g.fill();g.stroke();
 let bl=g.createLinearGradient(0,-10,0,30);bl.addColorStop(0,'#fff');bl.addColorStop(1,'#dfeaf2');g.fillStyle=bl;g.beginPath();g.ellipse(5,11,15,21,0,0,7);g.fill();
 g.fillStyle=col;g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1.5;g.beginPath();g.ellipse(3,14,20,14,0,0,7);g.fill();g.stroke();
 g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.ellipse(-4,9,8,4,-.4,0,7);g.fill();
 g.fillStyle='#fff';g.beginPath();g.moveTo(-7,0);g.lineTo(3,10);g.lineTo(13,0);g.lineTo(13,5);g.lineTo(3,14);g.lineTo(-7,5);g.fill();
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(3,18,1.6,0,7);g.arc(3,24,1.6,0,7);g.fill();
 g.save();g.translate(-18,4);g.rotate(Math.sin(t*(mv?10:2.5))*(mv?.5:.12));g.fillStyle='#2b2b32';g.strokeStyle='#0d0d10';g.beginPath();g.ellipse(0,9,7,17,.2,0,7);g.fill();g.stroke();g.restore();
 if(o.sc){g.fillStyle=o.sc;g.strokeStyle='rgba(0,0,0,.3)';rr(-17,-2,38,9,4);g.fill();g.stroke();g.fillRect(10,4,8,17);g.fillStyle='rgba(255,255,255,.35)';for(let k=-12;k<20;k+=8)g.fillRect(k,-2,3,9)}
 let hd=g.createRadialGradient(-4,-26,3,2,-17,24);hd.addColorStop(0,'#666670');hd.addColorStop(1,'#1c1c21');g.fillStyle=hd;g.strokeStyle='#0d0d10';g.lineWidth=2;g.beginPath();g.arc(2,-17,20,0,7);g.fill();g.stroke();
 g.fillStyle='#fff';g.beginPath();g.ellipse(11,-14,13,12,0,0,7);g.fill();
 g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.ellipse(-5,-28,8,4,-.5,0,7);g.fill();
 const bk=(t%4)<.13;
 for(const ex of[6,18]){g.fillStyle='#111';g.beginPath();g.ellipse(ex,-18,4.2,bk?1:5.6,0,0,7);g.fill();if(!bk){g.fillStyle='#fff';g.beginPath();g.arc(ex+1.3,-20.2,1.7,0,7);g.arc(ex-1,-16.5,.9,0,7);g.fill()}}
 if(o.bon){g.strokeStyle='#111';g.lineWidth=1.8;for(const ex of[6,18]){g.beginPath();g.moveTo(ex-3,-23);g.lineTo(ex-6,-26);g.moveTo(ex,-24.5);g.lineTo(ex-1,-28);g.stroke()}}
 if(o.mood===2){g.strokeStyle='#111';g.lineWidth=2.6;g.beginPath();g.moveTo(2,-29);g.lineTo(10,-23);g.moveTo(24,-29);g.lineTo(15,-23);g.stroke()}
 g.fillStyle='rgba(255,105,140,.55)';g.beginPath();g.ellipse(3,-9,4.5,3,0,0,7);g.ellipse(22,-8,3.5,2.6,0,0,7);g.fill();
 let bk2=g.createLinearGradient(0,-14,0,-4);bk2.addColorStop(0,'#ffc040');bk2.addColorStop(1,'#f08000');g.fillStyle=bk2;g.strokeStyle='#b55a00';g.lineWidth=1.5;g.beginPath();g.moveTo(10,-13);g.quadraticCurveTo(24,-15,30,-8);g.quadraticCurveTo(22,-3,10,-6);g.closePath();g.fill();g.stroke();
 g.strokeStyle='#b55a00';g.beginPath();g.moveTo(12,-9);g.quadraticCurveTo(21,-9,28,-8);g.stroke();
 const h=o.h;g.lineWidth=1.5;
 if(h===1){g.fillStyle='#4bd';g.beginPath();g.arc(2,-26,18,Math.PI,0);g.fill();g.fillStyle='#fe5';for(const k of[-8,0,8])g.fillRect(2+k-2,-43,4,17);g.fillStyle='#fff';g.beginPath();g.arc(2,-45,5,0,7);g.fill()}
 if(h===2){g.fillStyle='#f48';g.beginPath();g.moveTo(-8,-36);g.lineTo(-22,-44);g.lineTo(-22,-28);g.fill();g.beginPath();g.moveTo(-8,-36);g.lineTo(6,-44);g.lineTo(6,-28);g.fill();g.fillStyle='#d26';g.beginPath();g.arc(-8,-36,4,0,7);g.fill()}
 if(h===3){g.fillStyle='#fd2';g.beginPath();g.arc(2,-26,18,Math.PI,0);g.fill();g.beginPath();g.moveTo(-14,-24);g.lineTo(-27,-16);g.lineTo(-16,-14);g.fill()}
 if(h===4){g.fillStyle='#111';g.fillRect(-14,-32,32,5);g.fillRect(-8,-54,20,24);g.fillStyle='#c33';g.fillRect(-8,-36,20,5)}
 if(o.bon){g.fillStyle='#f9c';g.strokeStyle='#d7a';g.lineWidth=1.5;g.beginPath();g.arc(2,-26,20,Math.PI,0);g.fill();g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(2,-43,4,0,7);g.fill()}
 if(o.wt){g.fillStyle='#2a5bd7';g.strokeStyle='#173a9c';g.beginPath();g.arc(2,-26,19,Math.PI,0);g.fill();g.fillRect(-17,-28,38,5);g.fillStyle='#173a9c';g.beginPath();g.ellipse(25,-26,10,3,0,0,7);g.fill();g.fillStyle='#fc3';g.beginPath();g.arc(2,-36,3,0,7);g.fill();
  g.fillStyle='#d22';g.beginPath();g.moveTo(3,9);g.lineTo(-8,3);g.lineTo(-8,15);g.fill();g.beginPath();g.moveTo(3,9);g.lineTo(14,3);g.lineTo(14,15);g.fill();g.fillStyle='#a11';g.beginPath();g.arc(3,9,3,0,7);g.fill()}
 g.restore()}
function bubble(x,y,t,k){const n=[...t].length,rx=n>1?14+n*17:28;g.save();g.translate(x,y);g.scale(k,k);g.fillStyle='#fff';g.strokeStyle='#456';g.lineWidth=2.5;g.beginPath();g.ellipse(0,0,rx,24,0,0,7);g.fill();g.stroke();g.beginPath();g.moveTo(-6,20);g.lineTo(-14,34);g.lineTo(6,22);g.fill();g.font=(n>1?24:28)+'px serif';g.textAlign='center';g.fillStyle='#000';g.fillText(t,0,10+Math.sin(G.tv*4)*1.5);g.restore()}
function bar(x,y,r){g.fillStyle='#0004';rr(x-22,y,44,7,3);g.fill();g.fillStyle=r>.5?'#4c4':r>.25?'#fc3':'#e33';rr(x-21,y+1,Math.max(2,42*r),5,2);g.fill()}
function txt(t,x,y,sz,col,al){g.font='bold '+sz+'px Rajdhani,"Segoe UI",Arial,sans-serif';g.fillStyle=col||'#fff';g.textAlign=al||'center';g.fillText(t,x,y)}
function mount(x,w,hh,c){g.fillStyle=c;g.beginPath();g.moveTo(x,130);g.lineTo(x+w/2,130-hh);g.lineTo(x+w,130);g.fill();g.strokeStyle='rgba(0,255,255,.55)';g.lineWidth=1.5;g.stroke()}
const STARS=Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*150,p:Math.random()*6}));
const glow=()=>{},noglow=()=>{};
function layer(c,fn,iv){if(c.width!==cv.width||c.height!==cv.height){c.width=cv.width;c.height=cv.height;c._t=-9}
 if(G.tv-c._t>iv||G.tv<c._t){c._t=G.tv;const m=g;g=c.getContext('2d');g.setTransform(K,0,0,K,0,0);g.clearRect(0,0,W,H);fn();g=m}
 g.setTransform(1,0,0,1,0,0);g.drawImage(c,0,0);g.setTransform(K,0,0,K,0,0)}
const BC=document.createElement('canvas'),FC=document.createElement('canvas');
function bg(){
 let gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#040b1f');gr.addColorStop(.26,'#0a2145');gr.addColorStop(.27,'#0e2d52');gr.addColorStop(1,'#071a33');g.fillStyle=gr;g.fillRect(0,0,W,H);
 for(const s of STARS){g.fillStyle='rgba(180,240,255,'+(.35+.35*Math.sin(G.tv*2+s.p))+')';g.fillRect(s.x,s.y,1.6,1.6)}
 g.strokeStyle='rgba(0,229,255,.18)';g.lineWidth=1;for(const yy of[14,146]){g.beginPath();g.moveTo(0,yy);g.lineTo(W,yy);g.stroke();for(let x=30;x<W;x+=90){g.fillStyle='rgba(0,229,255,'+(.3+.3*Math.sin(G.tv*3+x))+')';g.beginPath();g.arc(x,yy,2.5,0,7);g.fill()}}
 for(let i=0;i<3;i++){const x=70+i*290;g.save();g.beginPath();g.rect(x,30,200,100);g.clip();
  let sk=g.createLinearGradient(0,30,0,130);sk.addColorStop(0,'#030a22');sk.addColorStop(1,i==1?'#1a6a9a':'#1c4f86');g.fillStyle=sk;g.fillRect(x,30,200,100);
  for(let k=0;k<14;k++){g.fillStyle='rgba(200,250,255,'+(.4+.4*Math.sin(G.tv*2+k+i))+')';g.fillRect(x+(k*53%200),32+(k*29%60),1.5,1.5)}
  if(i==1){g.fillStyle='rgba(60,255,190,.28)';g.beginPath();g.moveTo(x,60);for(let k=0;k<=200;k+=20)g.lineTo(x+k,55+Math.sin(G.tv+k/30)*10);g.lineTo(x+200,95);g.lineTo(x,95);g.fill()}
  if(i==0){glow('#9ff',18);g.fillStyle='#e8ffff';g.beginPath();g.arc(x+150,62,15,0,7);g.fill();noglow()}
  mount(x-10,110,60,'#0c3a5c');mount(x+70,140,80,'#0a2f4f');
  if(i==2){g.font='22px serif';g.textAlign='center';g.fillText('🛸',x+((G.tv*14)%260)-30,70+Math.sin(G.tv*2)*6)}
  g.fillStyle='#0a5a8f';g.fillRect(x,122,200,10);g.fillStyle='rgba(0,255,255,.35)';g.fillRect(x,122,200,1.5);
  g.fillStyle='rgba(255,255,255,.04)';for(let k=30;k<130;k+=4)g.fillRect(x,k,200,1);g.restore();
  glow('#0ff',12);g.strokeStyle='#38e8ff';g.lineWidth=3;g.strokeRect(x,30,200,100);noglow();
  g.strokeStyle='#fff';g.lineWidth=2;for(const[cx,cy,dx,dy]of[[x,30,1,1],[x+200,30,-1,1],[x,130,1,-1],[x+200,130,-1,-1]]){g.beginPath();g.moveTo(cx+dx*14,cy);g.lineTo(cx,cy);g.lineTo(cx,cy+dy*14);g.stroke()}}
 for(const cx of[30,315,605,880]){let m=g.createLinearGradient(cx-8,0,cx+8,0);m.addColorStop(0,'#0b1b30');m.addColorStop(.5,'#3a5675');m.addColorStop(1,'#0b1b30');g.fillStyle=m;g.fillRect(cx-8,10,16,145);glow('#0ff',8);g.fillStyle='#4ff';g.fillRect(cx-1,14,2,137);noglow()}
 g.fillStyle='#0a2038';g.fillRect(0,150,W,10);glow('#0ff',10);g.fillStyle='#35e6ff';g.fillRect(0,158,W,2);noglow();
 // piso com grade em perspectiva
 let fl=g.createLinearGradient(0,160,0,H);fl.addColorStop(0,'#0d3358');fl.addColorStop(1,'#061a30');g.fillStyle=fl;g.fillRect(0,160,W,H-160);
 g.strokeStyle='rgba(0,229,255,.14)';g.lineWidth=1;for(let i=-14;i<=14;i++){g.beginPath();g.moveTo(450+i*45,160);g.lineTo(450+i*140,H);g.stroke()}
 const f=0;for(let k=0;k<14;k++){const yy=160+Math.pow((k+f)/14,1.9)*460;g.strokeStyle='rgba(0,229,255,'+(.06+.12*(k/14))+')';g.beginPath();g.moveTo(0,yy);g.lineTo(W,yy);g.stroke()}
 // TV holográfica
 g.fillStyle='#07162b';rr(398,164,76,58,6);g.fill();glow('#0ff',10);g.strokeStyle='#38e8ff';g.lineWidth=2;g.stroke();noglow();
 g.fillStyle='#06263f';g.fillRect(405,171,62,40);g.strokeStyle='#4ff';g.lineWidth=1.5;g.beginPath();for(let k=0;k<=62;k+=3){const yy=191+Math.sin(G.tv*4+k/6)*8;k?g.lineTo(405+k,yy):g.moveTo(405+k,yy)}g.stroke();
 g.font='20px serif';g.textAlign='center';g.fillStyle='#000';g.fillText('🐧',436+Math.sin(G.tv*2)*18,206);g.fillStyle='rgba(255,255,255,.06)';for(let k=171;k<211;k+=3)g.fillRect(405,k,62,1);
 // cronômetro digital
 const a=(1-G.time/90)*Math.PI*2;g.strokeStyle='#0c2a48';g.lineWidth=7;g.beginPath();g.arc(60,70,30,0,7);g.stroke();glow('#0ff',12);g.strokeStyle=G.time<15?'#ff4d6d':'#35e6ff';g.beginPath();g.arc(60,70,30,-Math.PI/2,-Math.PI/2+(Math.PI*2-a));g.stroke();noglow();
 const tl=Math.ceil(G.time);txt((tl/60|0)+':'+String(tl%60).padStart(2,'0'),60,76,17,G.time<15?'#ff7b93':'#bff');
 // plataforma de entrada
 g.fillStyle='rgba(0,229,255,.1)';g.fillRect(0,290,125,110);glow('#0ff',10);g.strokeStyle='#38e8ff';g.lineWidth=2;g.strokeRect(4,294,117,102);noglow();g.strokeStyle='rgba(0,229,255,.35)';g.strokeRect(14,304,97,82);
 for(let k=0;k<3;k++){g.globalAlpha=.25+.5*((k*.33+G.tv)%1<.5?1:.2);txt('›',34+k*28,356,34,'#6ff');g.globalAlpha=1}txt('ENTRADA',62,284,12,'#6ff');
 // mesas
 TABLES.forEach(([x,y],i)=>{glow('#0ff',10);g.strokeStyle='rgba(0,255,255,.45)';g.lineWidth=2;g.beginPath();g.ellipse(x,y+62,44,9,0,0,7);g.stroke();noglow();
  let pd=g.createLinearGradient(x-6,0,x+6,0);pd.addColorStop(0,'#1a3552');pd.addColorStop(.5,'#6d8db0');pd.addColorStop(1,'#1a3552');g.fillStyle=pd;g.fillRect(x-6,y+20,12,42);
  g.fillStyle='#0a2038';g.beginPath();g.ellipse(x,y+9,72,28,0,0,7);g.fill();
  let tp=g.createRadialGradient(x-20,y-10,5,x,y,76);tp.addColorStop(0,'#15507f');tp.addColorStop(1,'#09243f');g.fillStyle=tp;glow('#0ff',12);g.strokeStyle='#38e8ff';g.lineWidth=2.5;g.beginPath();g.ellipse(x,y,72,28,0,0,7);g.fill();g.stroke();noglow();
  g.strokeStyle='rgba(0,255,255,.3)';g.lineWidth=1;g.beginPath();g.ellipse(x,y,52,19,0,0,7);g.stroke();
  for(let k=0;k<8;k++){const an=k*Math.PI/4;g.fillStyle='rgba(120,255,255,.8)';g.fillRect(x+Math.cos(an)*62-1.5,y+Math.sin(an)*23-1.5,3,3)}
  if(i==2){glow('#f0f',10);g.fillStyle='rgba(255,100,255,.85)';g.beginPath();const r=8;g.moveTo(x,y-22);g.lineTo(x+r,y-12);g.lineTo(x,y-2);g.lineTo(x-r,y-12);g.fill();noglow()}})
 SEATS.forEach((s,i)=>{glow(i%2?'#f0f':'#0ff',10);g.strokeStyle=i%2?'#f6f':'#4ff';g.lineWidth=2;g.fillStyle='#0a2038';g.beginPath();g.ellipse(s.x,s.y+38,24,8,0,0,7);g.fill();g.stroke();noglow();
  let q=g.createLinearGradient(0,s.y+15,0,s.y+38);q.addColorStop(0,'#3d8bff');q.addColorStop(1,'#12358f');g.fillStyle=q;g.beginPath();g.ellipse(s.x,s.y+30,28,12,0,0,7);g.fill();g.strokeStyle='rgba(160,230,255,.6)';g.lineWidth=1.5;g.stroke()})}
function front(){
 let ct=g.createLinearGradient(0,545,0,H);ct.addColorStop(0,'#143458');ct.addColorStop(1,'#050f1c');g.fillStyle=ct;g.fillRect(0,548,W,H-548);glow('#0ff',12);g.fillStyle='#35e6ff';g.fillRect(0,546,W,3);noglow();
 g.fillStyle='rgba(0,229,255,.12)';for(let x=0;x<W;x+=60)g.fillRect(x,560,30,1.5);
 STATIONS.forEach(s=>{const hu=190+s.i*28,bb=Math.sin(G.tv*3+s.i)*2;g.fillStyle='#06182c';g.beginPath();g.ellipse(s.x,s.y+10,34,10,0,0,7);g.fill();glow('hsl('+hu+',100%,60%)',10);g.strokeStyle='hsl('+hu+',100%,65%)';g.lineWidth=2.5;g.stroke();noglow();
  g.font='36px serif';g.textAlign='center';g.fillStyle='#000';g.fillText(ITEMS[s.i],s.x,s.y+6+bb);
  if(s.i===1){g.fillStyle='rgba(180,255,255,.7)';for(let k=0;k<3;k++){g.beginPath();g.arc(s.x+Math.sin(G.tv*3+k*2)*5,s.y-28-((G.tv*25+k*12)%24),3,0,7);g.fill()}}})
 g.fillStyle='#0b1a2c';g.beginPath();g.moveTo(572,540);g.lineTo(628,540);g.lineTo(622,612);g.lineTo(578,612);g.fill();glow('#f46',10);g.strokeStyle='#ff5a7a';g.lineWidth=2;g.stroke();noglow();g.fillStyle='#142a44';rr(566,530,68,12,5);g.fill();g.stroke();txt('LIXO',600,583,13,'#ff8aa0');
 g.fillStyle='#0b1a2c';rr(735,552,160,62,8);g.fill();g.strokeStyle='#38e8ff';g.lineWidth=2;g.stroke();
 g.fillStyle='#02080f';rr(745,494,140,30,5);g.fill();rr(745,528,140,30,5);g.fill();
 glow('#fa0',8);txt('$ '+G.goal,876,517,21,'#ffb02e','right');glow('#0f8',8);txt('$ '+G.earned,876,551,21,'#4dffa0','right');noglow();txt('META',752,517,11,'#c88a20','left');txt('HOJE',752,551,11,'#2fa66a','left');
 g.fillStyle='#35e6ff';for(let i=0;i<5;i++)g.fillRect(752+i*14,590,10,6);g.fillStyle='#ff4d9d';g.fillRect(822,590,10,6);
 txt('DIA '+G.day,700,512,18,'#7ff','right');txt('BANCO $'+BANK.v,700,534,14,'#7ff','right');if(G.combo>1){glow('#fa0',8);txt('COMBO x'+G.combo,12,532,16,'#ffb02e','left');noglow()}
 g.fillStyle='rgba(2,14,30,.85)';glow('#0ff',8);g.strokeStyle='#38e8ff';g.lineWidth=2;rr(740,5,40,34,10);g.fill();g.stroke();noglow();g.font='20px serif';g.textAlign='center';g.fillStyle='#000';g.fillText(MUTE?'🔇':'🔊',760,29);
 g.fillStyle='rgba(2,14,30,.85)';glow('#fa0',8);g.strokeStyle='#ffb02e';rr(790,5,105,34,10);g.fill();g.stroke();noglow();txt('PAUSE',842,29,20,'#ffc65a')}
function drawSelect(){txt('ESCOLHA SEU PERSONAGEM',450,110,44,'#ffd23a');
 [[290,'f','Garçonete','Penny','#f9c',{bon:1,sc:'#fff'}],[610,'m','Garçom','Pedro','#3a4a7a',{wt:1}]].forEach(([cx,k,n,nm,col,o],i)=>{const b=Math.sin(G.tv*3+i*2)*4;g.fillStyle='#1f5f86';g.strokeStyle='#ffd23a';g.lineWidth=G.hero===k?5:2;rr(cx-155,200,310,300,22);g.fill();g.stroke();
  pen(cx,330+b,col,Object.assign({s:2.2,ph:i*2,dir:1},o));txt(n,cx,450,30,'#fff');txt(nm,cx,482,18,'#9ef')});txt('Toque no personagem para começar',450,550,20,'#9ef')}
function draw(){g.setTransform(K,0,0,K,0,0);g.clearRect(0,0,W,H);layer(BC,bg,.1);
 const cs=[...G.cs.map(c=>{let p;if(c.st==='queue')p=qpos(c);else if(c.seat)p=c.seat;else p={x:-40,y:300};return{c,p}}),{w:1,p:G.w}].sort((a,b)=>a.p.y-b.p.y);
 for(const o of cs){if(o.w){const w=G.w;pen(w.x,w.y,G.hero==='m'?'#3a4a7a':'#f9c',Object.assign({mv:w.mv,dir:w.dir||1,ph:1.3},G.hero==='m'?{wt:1}:{bon:1,sc:'#fff'}));
   G.tray.forEach((t,i)=>{g.fillStyle='#fff';g.strokeStyle='#89a';g.lineWidth=2;g.beginPath();g.ellipse(w.x-30+i*30,w.y-54+Math.sin(G.tv*5+i)*1.5+22,15,5,0,0,7);g.fill();g.stroke();g.font='26px serif';g.textAlign='center';g.fillStyle='#000';g.fillText(ITEMS[t],w.x-30+i*30,w.y-48+Math.sin(G.tv*5+i)*1.5)});continue}
  const c=o.c,{x,y}=o.p,side=c.seat&&c.seat.x>450?-1:1,r=c.p/c.mp,sit=c.seat&&['sitting','ordered','eating','pay'].includes(c.st);
  pen(x,y,c.col,{h:c.h,sc:c.sc,dir:side,ph:c.t*0+c.col.length,mood:c.angry||r<.3?2:0});
  if(G.sel===c){g.strokeStyle='#ff0';g.lineWidth=3;g.setLineDash([6,4]);g.lineDashOffset=-G.tv*20;g.beginPath();g.ellipse(x,y,34,40,0,0,7);g.stroke();g.setLineDash([])}
  if(c.st==='ordered')bubble(x+side*36,y-62,c.need.map(i=>ITEMS[i]).join(''),Math.min(1,(c.t-(c.ot||0))*5)*(1+Math.sin(G.tv*6)*(r<.3?.06:0)));
  if(c.st==='sitting'&&r>.01){txt('!',x+side*30,y-48+Math.sin(G.tv*6)*3,26,'#f90')}
  if(c.st==='eating'){g.fillStyle='#fff';g.strokeStyle='#89a';g.beginPath();g.ellipse(x+side*58,y+14,20,6,0,0,7);g.fill();g.stroke();g.font='22px serif';g.textAlign='center';g.fillStyle='#000';g.fillText(ITEMS[c.item],x+side*58,y+10);if(c.item===1){g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(x+side*58+Math.sin(G.tv*4)*3,y-10-(G.tv*20%14),3,0,7);g.fill()}if(((G.tv*3)|0)%2)txt('♪',x+side*20,y-48,20,'#e48')}
  if(c.angry)txt('💢',x+14,y-44,24);
  if(['queue','sitting','ordered'].includes(c.st))bar(x,y-(c.h?58:46),r)}
 SEATS.forEach(s=>{if(s.d){const px=s.x+(s.x<450?55:-55);g.fillStyle='#f6f6f6';g.strokeStyle='#89a';g.lineWidth=2;g.beginPath();g.ellipse(px,s.y+8,18,6,0,0,7);g.fill();g.stroke();g.fillStyle='#b8793a';g.fillRect(px-6,s.y+5,4,3);g.fillRect(px+3,s.y+6,3,2);g.font='18px serif';g.textAlign='center';g.fillStyle='#000';g.fillText('🧽',px,s.y-4+Math.sin(G.tv*5)*2)}});
 SEATS.forEach(s=>{if(s.m){const bb=Math.abs(Math.sin(G.tv*4))*6,tx=s.x+(s.x<450?60:-60);g.font='26px serif';g.textAlign='center';g.fillStyle='#000';g.fillText('💵',tx,s.y-10-bb);txt('$'+s.m,tx,s.y+14,16,'#7fff9a')}});
 layer(FC,front,.13);
 g.fillStyle='rgba(120,255,255,.7)';for(const p of P){g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill()}
 for(const f of FX){g.globalAlpha=Math.max(0,f.l);txt(f.t,f.x,f.y,24,f.col);g.globalAlpha=1}
 if(G.mt>0)txt(G.msg,450,500,22,'#ff6b6b');
 if(G.st!=='play'){g.fillStyle='#04182acc';g.fillRect(0,0,W,H);
  const T={menu:['POLAR DINER','Ajude a servir os pinguins famintos!','Clique para começar'],pause:['PAUSADO','','Clique para continuar'],
  win:['DIA '+G.day+' CONCLUÍDO! '+'⭐'.repeat(G.earned>=G.goal*1.8?3:G.earned>=G.goal*1.4?2:1),'Você ganhou $'+G.earned+' (meta $'+G.goal+')','Clique para ir à loja'],shop:['','',''],select:['','',''],lose:['FIM DE JOGO','Você ganhou $'+G.earned+' (meta $'+G.goal+')','Clique para recomeçar']}[G.st];
  if(G.st==='shop'){drawShop();return}
  if(G.st==='select'){drawSelect();return}
  if(G.st!=='menu')pen(450,150+Math.sin(G.tv*3)*4,'#f9c',{bon:1,s:1.6,sc:'#fff',ph:2});
  g.shadowColor='#0ff';g.shadowBlur=20;txt(T[0],450,260,54+Math.sin(G.tv*3)*2,'#8ff');g.shadowBlur=0;txt(T[1],450,305,24);txt(T[2],450,365+Math.sin(G.tv*4)*3,22,'#9ef');
  if(G.st==='menu'){const L=['1. Clique num pinguim na carpete e depois numa cadeira vazia.','2. Clique no cliente sentado para anotar o pedido.','3. Pegue o item no balcão (até 3) e clique no cliente.','4. Recolha o dinheiro da mesa. Lixo limpa a bandeja.'];L.forEach((l,i)=>txt(l,450,430+i*28,18,'#fff'))}}}
function click(e){
 const [x,y]=pos(e);
 if(G.st==='menu'||G.st==='lose'){G.st='select';return}
 if(G.st==='select'){if(y>200&&y<500){if(x>130&&x<440)G.hero='f';else if(x>460&&x<770)G.hero='m';else return;start(1)}return}
 if(G.st==='win'){BANK.v+=G.earned;G.st='shop';return}
 if(G.st==='shop'){shopClick(x,y);return}
 if(x>735&&x<785&&y<40){MUTE=!MUTE;return}
 if(G.st==='pause'){G.st='play';return}
 if(x>790&&y<40){G.st='pause';return}
 for(const c of queue())if(Math.hypot(x-qpos(c).x,y-qpos(c).y)<30){G.sel=c;return}
 for(const s of SEATS)if(Math.hypot(x-s.x,y-s.y)<45){seat(s);return}
 for(const s of STATIONS)if(Math.hypot(x-s.x,y-s.y)<36){if(G.tray.length>=3+UP.tray){say('Bandeja cheia!');return}walk(s.x,500,()=>{G.tray.push(s.i);sfx(400,.06)});return}
 if(x>560&&x<640&&y>520)walk(600,500,()=>{G.tray=[]})}
function seat(s){
 if(!s.c&&s.m===0){if(s.d){walk(s.x+(s.x<450?50:-50),s.y+30,()=>{s.d=0;fx(s.x,s.y-20,'✨','#fff');sfx(300,.1)});return}if(G.sel&&G.sel.st==='queue'){const c=G.sel;c.st='sitting';c.seat=s;s.c=c;c.p=c.mp;G.sel=null;sfx(500,.08)}else say('Escolha um pinguim na carpete!');return}
 const near={x:s.x+(s.x<450?50:-50),y:s.y+30};
 if(s.m){walk(near.x,near.y,()=>{G.earned+=s.m;fx(s.x,s.y-30,'+$'+s.m,'#7fff9a');s.m=0;s.d=1;sfx(1000,.1);if(s.c&&s.c.st==='pay'){s.c.st='leave';s.c.lt=0;s.c=null}})}
 else if(s.c.st==='sitting')walk(near.x,near.y,()=>{if(s.c&&s.c.st==='sitting'){s.c.st='ordered';s.c.ot=s.c.t;sfx(520,.08);s.c.p=Math.min(s.c.mp,s.c.p+8)}});
 else if(s.c.st==='ordered')walk(near.x,near.y,()=>{const c=s.c;if(!c)return;const i=G.tray.findIndex(t=>c.need.includes(t));if(i<0){say('Item errado!');return}const t=G.tray.splice(i,1)[0];c.need.splice(c.need.indexOf(t),1);c.p=Math.min(c.mp,c.p+5);sfx(660,.1);if(!c.need.length){c.st='eating';c.eat=4;G.combo++;if(G.combo>1)fx(c.seat.x,c.seat.y-60,'Combo x'+G.combo+'!','#e60')}else c.ot=c.t}) }
cv.addEventListener('pointerdown',e=>{e.preventDefault();click(e)});cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,200));if(window.visualViewport)visualViewport.addEventListener('resize',fit);document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.st==='play')G.st='pause'});fit();
addEventListener('keydown',e=>{if(e.key==='p'&&G.st==='play')G.st='pause'});
let last=performance.now();(function loop(n){const d=n-last;update(Math.min(.05,d/1000));last=n;EMA=EMA*.95+d*.05;if(++FN>90&&EMA>27&&QS>.5){QS*=.85;FN=0;EMA=16;fit()}draw();requestAnimationFrame(loop)})(last);
