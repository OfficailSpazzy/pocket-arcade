
const rrect=(g,x,y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h)};
const burst=(list,x,y,c,n,sp=170)=>{for(let i=0;i<n;i++){const a=Math.random()*7,s=30+Math.random()*sp;list.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.5+Math.random()*.4,c})}};
const drawParts=(g,ps,dt,grav=0)=>{ps.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=grav*dt;q.l-=dt;g.globalAlpha=Math.max(0,q.l*1.8);g.fillStyle=q.c;g.fillRect(q.x-2,q.y-2,4,4)});g.globalAlpha=1;return ps.filter(q=>q.l>0)};

reg('dodge','Dodge','Arcade','Drag or use the arrow keys. A meteor storm is coming down. Stay clear for as long as you can.',ctx=>{
  const W=320,H=440,PY=H-40,{cv,g}=ctx.canvas(W,H),p=ctx.follow(cv,W/2);let bl=[],t=0,time=0,parts=[],dead=0,lastSec=0,shake=0,spawn=0;
  const stars=Array.from({length:50},()=>({x:R(W),y:R(H-80),s:Math.random()}));
  const city=Array.from({length:14},(_,i)=>({x:i*24-4,w:18+R(10),h:22+R(46)}));
  ctx.loop(dt=>{t+=dt;shake=Math.max(0,shake-dt);
    if(!dead){if(ctx.held.left)p.x-=340*dt;if(ctx.held.right)p.x+=340*dt;p.x=clamp(p.x,12,W-12);time+=dt;ctx.score(Math.floor(time));
      if(Math.floor(time)>lastSec){lastSec=Math.floor(time);if(lastSec%10===0)SFX.ok();else beep(1200,.015,'square',.012)}}
    spawn-=dt;if(spawn<=0&&!dead){spawn=Math.max(.14,.55-time*.008);const w=18+R(34);bl.push({x:R(W-w),y:-30,w,v:150+time*4+R(80),r:Math.random()*6})}
    for(const b of bl){b.y+=b.v*dt;if(!dead&&b.y+22>PY+4&&b.y<PY+26&&p.x+10>b.x&&p.x-10<b.x+b.w){dead=1;shake=.4;burst(parts,p.x,PY+11,'#2fd6b5',26,220);burst(parts,p.x,PY+11,'#ffd84a',16,160);SFX.boom()}
      if(b.y>H-26&&!b.hit){b.hit=1;burst(parts,b.x+b.w/2,H-24,'#ff9f43',6,90)}}
    bl=bl.filter(b=>b.y<H-20);
    if(dead){dead+=dt;if(dead>1.1)return ctx.over('Flattened',undefined)}
    g.save();if(shake)g.translate((Math.random()-.5)*shake*20,(Math.random()-.5)*shake*20);
    const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#120a24');sky.addColorStop(.7,'#3a1640');sky.addColorStop(1,'#6b2a3a');g.fillStyle=sky;g.fillRect(-10,-10,W+20,H+20);
    stars.forEach(s=>{g.fillStyle=`rgba(255,240,255,${.2+s.s*.6})`;g.fillRect(s.x,s.y,1.4,1.4)});
    g.fillStyle='#1a0d22';city.forEach(c=>{g.fillRect(c.x,H-22-c.h,c.w,c.h);g.fillStyle='rgba(255,210,120,.5)';for(let y=H-18-c.h;y<H-28;y+=8)for(let x=c.x+3;x<c.x+c.w-3;x+=6)if((x*7+y*3)%5===0)g.fillRect(x,y,2,3);g.fillStyle='#1a0d22'});
    g.fillStyle='#24101e';g.fillRect(0,H-22,W,22);g.fillStyle='rgba(255,159,67,.35)';g.fillRect(0,H-22,W,2);
    bl.forEach(b=>{const cx=b.x+b.w/2,cy=b.y+11;const tr=g.createLinearGradient(0,cy-60,0,cy);tr.addColorStop(0,'rgba(255,120,40,0)');tr.addColorStop(1,'rgba(255,160,60,.65)');g.fillStyle=tr;g.beginPath();g.moveTo(b.x+3,cy);g.lineTo(cx,cy-55-b.w);g.lineTo(b.x+b.w-3,cy);g.fill();
      g.shadowColor='#ff7b2e';g.shadowBlur=14;g.fillStyle='#6b4a3a';rrect(g,b.x,b.y,b.w,22,8);g.fill();g.shadowBlur=0;g.fillStyle='#4a3128';g.beginPath();g.arc(b.x+b.w*.3,b.y+8,3.5,0,7);g.arc(b.x+b.w*.68,b.y+14,2.5,0,7);g.fill();g.fillStyle='rgba(255,180,90,.5)';g.fillRect(b.x+3,b.y+18,b.w-6,3)});
    parts=drawParts(g,parts,dt,120);
    if(!dead){g.shadowColor='#2fd6b5';g.shadowBlur=18;g.fillStyle='#2fd6b5';g.beginPath();g.arc(p.x,PY+11,11,0,7);g.fill();g.shadowBlur=0;g.fillStyle='#0b2a26';rrect(g,p.x-7,PY+6,14,6,3);g.fill();g.fillStyle='#bffff3';g.fillRect(p.x-4,PY+8,3,2);g.fillRect(p.x+1,PY+8,3,2);
      g.fillStyle='rgba(47,214,181,.25)';g.beginPath();g.ellipse(p.x,PY+28,12,3,0,0,7);g.fill()}
    g.restore();g.fillStyle='rgba(255,255,255,.85)';g.font='400 30px "Bungee",Impact,sans-serif';g.textAlign='center';g.fillText(Math.floor(time),W/2,46)});
},{sl:'Seconds'});

reg('runner','Runner','Arcade','Tap or press space to jump the cacti. It keeps getting faster.',ctx=>{
  const W=400,H=200,GY=160,{cv,g}=ctx.canvas(W,H);let y=GY,vy=0,obs=[],t=1,dist=0,run=0,parts=[],dead=0,mile=1,air=false;
  const stars=Array.from({length:40},()=>({x:R(W),y:R(110),s:Math.random()}));
  const jump=()=>{if(dead)return;if(y>=GY){vy=-580;air=true;beep(300,.12,'square',.04,0,620)}};ctx.on(cv,'pointerdown',e=>{e.preventDefault();jump()});ctx.keys(k=>{if(k==='space'||k==='up')jump()});
  const cactus=o=>{const x=o.x,w=o.w,h=o.h;g.fillStyle='#2f9e5a';rrect(g,x+w*.3,GY-h,w*.4,h,4);g.fill();if(h>28){rrect(g,x,GY-h*.7,w*.3,4,2);g.fill();rrect(g,x,GY-h*.85,4,h*.2,2);g.fill();rrect(g,x+w*.7,GY-h*.55,w*.3,4,2);g.fill();rrect(g,x+w-4,GY-h*.72,4,h*.2,2);g.fill()}
    g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x+w*.38,GY-h+3,2,h-6)};
  const runner=(x,yy)=>{const ph=air?0:Math.sin(run*18);g.fillStyle='#ffd84a';rrect(g,x-11,yy-30,22,20,6);g.fill();g.fillStyle='#1b1326';g.fillRect(x+3,yy-25,3,3);g.fillStyle='#ff9f43';g.fillRect(x+7,yy-20,6,3);
    g.strokeStyle='#ffd84a';g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(x-4,yy-10);g.lineTo(x-4-ph*5,yy-1);g.moveTo(x+4,yy-10);g.lineTo(x+4+ph*5,yy-1);g.stroke();g.lineCap='butt'};
  ctx.loop(dt=>{if(!dead){const sp=230+dist*.02;dist+=sp*dt;run+=dt;const s=Math.floor(dist/20);ctx.score(s);if(s>=mile*100){mile++;SFX.ok()}
      vy+=1900*dt;y+=vy*dt;if(y>GY){if(air){burst(parts,60,GY,'#c9a26b',5,60);beep(140,.05,'triangle',.08)}y=GY;vy=0;air=false}
      t-=dt;if(t<=0){t=.85+Math.random()*.9;obs.push({x:W+10,w:14+R(12),h:22+R(22)})}
      for(const o of obs){o.x-=sp*dt;if(60+9>o.x&&60-9<o.x+o.w&&y>GY-o.h){dead=1;burst(parts,60,y-15,'#ffd84a',20,180);SFX.boom()}}
      obs=obs.filter(o=>o.x>-40)}else{dead+=dt;if(dead>.9)return ctx.over('Tripped')}
    const sc=dist*.02;const sky=g.createLinearGradient(0,0,0,GY);sky.addColorStop(0,'#1b1440');sky.addColorStop(1,'#d9775a');g.fillStyle=sky;g.fillRect(0,0,W,H);
    stars.forEach(s=>{g.fillStyle=`rgba(255,255,255,${s.s*.6})`;g.fillRect(s.x,s.y,1.3,1.3)});
    g.fillStyle='#fff2c4';g.beginPath();g.arc(320,48,18,0,7);g.fill();g.fillStyle='rgba(255,242,196,.15)';g.beginPath();g.arc(320,48,30,0,7);g.fill();
    const dune=(c,b,a,per,spd)=>{g.fillStyle=c;g.beginPath();g.moveTo(0,GY);for(let x=0;x<=W;x+=10)g.lineTo(x,b-a*Math.sin((x+dist*spd)/per));g.lineTo(W,GY);g.fill()};
    dune('#7a3b4a',GY-30,10,60,.15);dune('#a0524a',GY-14,7,40,.35);
    g.fillStyle='#d9a066';g.fillRect(0,GY,W,H-GY);g.fillStyle='#b5824e';for(let x=-(dist%30);x<W;x+=30){g.fillRect(x,GY+10,8,2);g.fillRect(x+15,GY+22,5,2)}g.fillStyle='#f0c08a';g.fillRect(0,GY,W,2);
    obs.forEach(cactus);parts=drawParts(g,parts,dt,300);if(!dead||Math.floor(dead*10)%2)runner(60,y)});
});

reg('hop','Sky Hop','Arcade','You bounce on your own. Drag or use the arrow keys to land on the next cloud. Climb into space.',ctx=>{
  const W=320,H=460,{cv,g}=ctx.canvas(W,H),p=ctx.follow(cv,W/2);let pl=[],x=W/2,y=H-60,vy=-470,sc=0,top,squash=0,face=1,mile=1,falling=false;
  for(let yy=H-20;yy>-20;yy-=62)pl.push({x:yy===H-20?W/2-27:R(W-54),y:yy});top=pl[pl.length-1].y;
  const stars=Array.from({length:60},()=>({x:R(W),y:R(H),s:Math.random()}));
  const lerp=(a,b,k)=>a.map((v,i)=>Math.round(v+(b[i]-v)*k));
  const cloud=(q)=>{g.fillStyle='rgba(0,0,0,.08)';g.beginPath();g.ellipse(q.x+27,q.y+9,27,5,0,0,7);g.fill();g.fillStyle='#fff';[[10,2,9],[24,-2,12],[40,2,9],[27,4,10]].forEach(([dx,dy,r])=>{g.beginPath();g.arc(q.x+dx,q.y+dy,r,0,7);g.fill()});g.fillStyle='#dfe9ff';g.fillRect(q.x+4,q.y+6,46,3)};
  ctx.loop(dt=>{if(ctx.held.left)p.x=x-90;if(ctx.held.right)p.x=x+90;const dx=clamp(p.x-x,-330*dt,330*dt);if(Math.abs(dx)>.5)face=Math.sign(dx);x+=dx;x=clamp(x,10,W-10);squash=Math.max(0,squash-dt*4);
    const py=y;vy+=900*dt;y+=vy*dt;if(vy>0)for(const q of pl)if(py<=q.y&&y>=q.y&&x>q.x-8&&x<q.x+62){y=q.y;vy=-470;squash=1;beep(260+Math.min(sc/40,300),.1,'square',.04,0,520+Math.min(sc/40,300));break}
    if(y<190){const s=190-y;y=190;sc+=s;const sv=Math.floor(sc/10);ctx.score(sv);if(sv>=mile*100){mile++;SFX.ok()}pl.forEach(q=>q.y+=s);stars.forEach(st=>{st.y+=s*.2;if(st.y>H)st.y-=H});top+=s;pl=pl.filter(q=>q.y<H+10);
      while(top>-10){top-=56+R(34);pl.push({x:R(W-54),y:top})}}
    if(y>H-40&&vy>0&&!falling){falling=true;beep(900,.6,'triangle',.05,0,150)}
    if(y>H+30)return ctx.over('Fell');
    const k=Math.min(1,sc/9000),top_=lerp([110,190,255],[6,4,24],k),bot=lerp([210,240,255],[40,30,90],k);
    const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,`rgb(${top_})`);sky.addColorStop(1,`rgb(${bot})`);g.fillStyle=sky;g.fillRect(0,0,W,H);
    if(k>.25)stars.forEach(s=>{g.fillStyle=`rgba(255,255,255,${(k-.25)*s.s})`;g.fillRect(s.x,s.y,1.5,1.5)});
    pl.forEach(cloud);
    const sq=squash*.35;g.save();g.translate(x,y);g.scale(1+sq,1-sq);g.fillStyle='#ff7ac6';rrect(g,-11,-22,22,22,9);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.fillRect(-7,-19,6,3);
    g.fillStyle='#fff';g.beginPath();g.arc(-3+face*3,-13,4,0,7);g.arc(5+face*3,-13,4,0,7);g.fill();g.fillStyle='#1b1326';g.beginPath();g.arc(-2+face*4,-13,2,0,7);g.arc(6+face*4,-13,2,0,7);g.fill();g.restore();
    g.fillStyle='rgba(255,255,255,.9)';g.font=FONT(11,700);g.textAlign='left';g.fillText(Math.floor(sc/10)+' m',10,20)});
},{sl:'Height'});

reg('stack','Stack','Arcade','Tap or press space to drop each block. Whatever hangs over the edge gets cut off. Land it dead on for a perfect.',ctx=>{
  const W=320,H=440,BH=22,{cv,g}=ctx.canvas(W,H);let st=[{x:80,w:160}],c,mv=1,sc=0,falls=[],perfect=0,ptxt=0,camY=0;
  const hue=i=>(200+i*9)%360;
  const next=()=>{const t=st[st.length-1];mv=sc%2?-1:1;c={x:mv>0?-t.w*.5:W-t.w*.5,w:t.w}};next();
  const drop=()=>{if(ctx.paused)return;const t=st[st.length-1];let l=Math.max(c.x,t.x),r=Math.min(c.x+c.w,t.x+t.w);
    if(r-l<3){falls.push({x:c.x,w:c.w,y:0,vy:0,i:st.length,lvl:st.length});SFX.boom();return ctx.over('Missed')}
    if(Math.abs(c.x-t.x)<4){l=t.x;r=t.x+t.w;perfect++;ptxt=1;[784,988,1175].forEach((f,i)=>beep(f+perfect*30,.07,'square',.045,i*.05))}
    else{perfect=0;const cut=c.x<t.x?{x:c.x,w:t.x-c.x}:{x:r,w:c.x+c.w-r};falls.push({...cut,y:0,vy:0,lvl:st.length});beep(200+st.length*12,.08,'triangle',.1)}
    st.push({x:l,w:r-l});ctx.score(++sc);next()};
  ctx.on(cv,'pointerdown',e=>{e.preventDefault();drop()});ctx.keys(k=>{if(k==='space')drop()});
  ctx.loop(dt=>{c.x+=mv*(150+sc*7)*dt;if(c.x>W-c.w*.4)mv=-1;if(c.x<-c.w*.6)mv=1;ptxt=Math.max(0,ptxt-dt);
    const want=Math.max(0,st.length-11)*BH;camY+=(want-camY)*Math.min(1,dt*6);
    const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,`hsl(${hue(sc)} 45% 14%)`);sky.addColorStop(1,`hsl(${hue(sc+10)} 50% 26%)`);g.fillStyle=sky;g.fillRect(0,0,W,H);
    const Y=i=>H-(i+1)*BH+camY;
    const blk=(x,y,w,i,a=1)=>{g.globalAlpha=a;g.fillStyle=`hsl(${hue(i)} 70% 58%)`;g.fillRect(x,y,w,BH-2);g.fillStyle=`hsl(${hue(i)} 80% 72%)`;g.fillRect(x,y,w,4);g.fillStyle=`hsl(${hue(i)} 60% 42%)`;g.fillRect(x,y+BH-6,w,4);g.globalAlpha=1};
    st.forEach((b,i)=>{const y=Y(i);if(y<H+BH)blk(b.x,y,b.w,i)});
    falls.forEach(f=>{f.vy+=900*dt;f.y+=f.vy*dt;blk(f.x,Y(f.lvl)+f.y,f.w,f.lvl,.85)});falls=falls.filter(f=>f.y<H);
    if(!ctx.done){blk(c.x,Y(st.length),c.w,st.length);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(c.x,Y(st.length)+BH-2,c.w,H)}
    g.fillStyle='rgba(255,255,255,.92)';g.font='400 40px "Bungee",Impact,sans-serif';g.textAlign='center';g.fillText(sc,W/2,60);
    if(ptxt>0){g.globalAlpha=ptxt;g.fillStyle=C.yel;g.font=FONT(18,700);g.fillText(perfect>1?'PERFECT x'+perfect:'PERFECT',W/2,88);g.globalAlpha=1}});
});

reg('racer','Lane Racer','Arcade','Tap the left or right side, or use the arrow keys, to change lanes and avoid traffic.',ctx=>{
  const W=300,H=440,LX=[50,150,250],{cv,g}=ctx.canvas(W,H);let lane=1,px=150,cars=[],gap=0,sc=0,road=0,tilt=0,dead=0,parts=[];
  const COLS=['#ff5d7a','#5aa9ff','#2fd6b5','#b48cff','#ff9f43','#e6ebf7'];
  const go=d=>{if(dead)return;const n=clamp(lane+d,0,2);if(n!==lane){lane=n;tilt=d;beep(500,.08,'triangle',.05,0,300)}};
  ctx.on(cv,'pointerdown',e=>{e.preventDefault();go(cv.pos(e).x<W/2?-1:1)});ctx.keys(k=>{if(k==='left')go(-1);if(k==='right')go(1)});
  const car=(x,y,col,me,tl)=>{g.save();g.translate(x,y+22);g.rotate(tl*.12);
    g.fillStyle='rgba(0,0,0,.35)';rrect(g,-17,-20,36,46,8);g.fill();
    g.fillStyle='#111';g.fillRect(-19,-15,4,10);g.fillRect(15,-15,4,10);g.fillRect(-19,8,4,10);g.fillRect(15,8,4,10);
    g.fillStyle=col;rrect(g,-16,-22,32,44,8);g.fill();g.fillStyle='rgba(255,255,255,.25)';rrect(g,-13,-20,26,6,3);g.fill();
    g.fillStyle='#1d2a44';rrect(g,-12,me?-12:4,24,9,3);g.fill();rrect(g,-11,me?6:-12,22,6,3);g.fill();
    if(me){g.fillStyle='#1b1326';g.fillRect(-3,-22,6,44);g.fillStyle='#fff6c4';g.fillRect(-13,-23,6,3);g.fillRect(7,-23,6,3)}else{g.fillStyle='#ff4040';g.fillRect(-13,20,6,3);g.fillRect(7,20,6,3)}
    g.restore()};
  ctx.loop(dt=>{tilt*=Math.pow(.02,dt);
    if(!dead){const v=210+sc*5;road=(road+v*dt)%40;gap-=v*dt;if(gap<=0){gap=190;const a=R(3);cars.push({l:a,y:-50,n:true,c:R(6)});if(Math.random()<.4){cars.push({l:(a+1+R(2))%3,y:-50,c:R(6)})}}
      px+=clamp(LX[lane]-px,-700*dt,700*dt);
      for(const c of cars){c.y+=v*dt;if(c.y+44>H-90&&c.y<H-46&&Math.abs(LX[c.l]-px)<34){dead=1;burst(parts,px,H-68,'#ffd84a',24,200);burst(parts,px,H-68,'#ff5d5d',16,160);SFX.boom()}if(c.n&&c.y>H){c.n=false;ctx.score(++sc);beep(1000,.03,'square',.025);if(sc%10===0)SFX.ok()}}
      cars=cars.filter(c=>c.y<H+60)}else{dead+=dt;if(dead>1)return ctx.over('Crash')}
    g.fillStyle='#2b2d3a';g.fillRect(0,0,W,H);g.fillStyle='#33364a';g.fillRect(14,0,W-28,H);
    for(let y=-40+road;y<H;y+=40){g.fillStyle=Math.floor((y-road)/40)%2?'#ff5d5d':'#f4eeff';g.fillRect(0,y,8,20);g.fillRect(W-8,y,8,20);g.fillStyle=Math.floor((y-road)/40)%2?'#f4eeff':'#ff5d5d';g.fillRect(0,y+20,8,20);g.fillRect(W-8,y+20,8,20)}
    g.fillStyle='rgba(255,255,255,.75)';for(let y=-40+road;y<H;y+=40){g.fillRect(98,y,4,22);g.fillRect(198,y,4,22)}
    cars.forEach(c=>car(LX[c.l],c.y,COLS[c.c],false,0));
    if(!dead||Math.floor(dead*10)%2)car(px,H-90,'#ffd84a',true,tilt);
    parts=drawParts(g,parts,dt,0);
    g.fillStyle='rgba(0,0,0,.4)';rrect(g,W/2-40,8,80,26,8);g.fill();g.fillStyle='#fff';g.font=FONT(13,700);g.textAlign='center';g.fillText((210+sc*5)/2|0,W/2-8,26);g.fillStyle=C.mut;g.font=FONT(9,700);g.fillText('KM/H',W/2+22,26)});
});

reg('catch','Fruit Catch','Arcade','Drag or use the arrow keys to catch the fruit in your basket. Bombs end the game. Drop three fruit and you are out.',ctx=>{
  const W=320,H=440,BY=H-40,{cv,g}=ctx.canvas(W,H),p=ctx.follow(cv,W/2);let it=[],t=0,sc=0,miss=0,parts=[],tt=0,dead=0,pops=[];
  const fruit=(o)=>{const x=o.x,y=o.y;g.save();g.translate(x,y);g.rotate(Math.sin(tt*3+o.x)*.3);
    if(o.bad){g.fillStyle='#24202e';g.beginPath();g.arc(0,1,10,0,7);g.fill();g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.arc(-3,-3,3,0,7);g.fill();g.strokeStyle='#a07a4a';g.lineWidth=2;g.beginPath();g.moveTo(3,-8);g.quadraticCurveTo(7,-14,10,-12);g.stroke();
      g.fillStyle=Math.floor(tt*12)%2?'#ffd84a':'#ff5d5d';g.beginPath();g.arc(10,-12,2.5,0,7);g.fill()}
    else if(o.c===0){g.fillStyle='#e8413c';g.beginPath();g.arc(-4,1,8,0,7);g.arc(4,1,8,0,7);g.fill();g.fillStyle='#6b3f22';g.fillRect(-1,-11,2,6);g.fillStyle='#3fae4f';g.beginPath();g.ellipse(4,-9,5,2.5,-.5,0,7);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(-6,-2,2.5,0,7);g.fill()}
    else if(o.c===1){g.fillStyle='#ff9f2a';g.beginPath();g.arc(0,0,10,0,7);g.fill();g.fillStyle='#ffc06a';g.beginPath();g.arc(-3,-3,3,0,7);g.fill();g.fillStyle='#3fae4f';g.beginPath();g.ellipse(2,-10,4,2,.4,0,7);g.fill()}
    else{g.fillStyle='#8e4fd6';[[-5,-4],[5,-4],[0,-4],[-3,2],[3,2],[0,8]].forEach(([a,b])=>{g.beginPath();g.arc(a,b,4.4,0,7);g.fill()});g.fillStyle='#3fae4f';g.fillRect(-1,-12,2,5)}
    g.restore()};
  const heart=(x,y,on)=>{g.fillStyle=on?'#ff5d7a':'rgba(255,255,255,.25)';g.beginPath();g.arc(x-3,y,4,0,7);g.arc(x+3,y,4,0,7);g.moveTo(x-7,y+1);g.lineTo(x,y+9);g.lineTo(x+7,y+1);g.fill()};
  ctx.loop(dt=>{tt+=dt;if(!dead){if(ctx.held.left)p.x-=360*dt;if(ctx.held.right)p.x+=360*dt;p.x=clamp(p.x,34,W-34);
    t-=dt;if(t<=0){t=Math.max(.3,.8-sc*.01);it.push({x:16+R(W-32),y:-12,v:150+sc*3+R(60),bad:Math.random()<.22,c:R(3)})}
    for(const o of it){o.y+=o.v*dt;if(!o.hit&&o.y>BY-6&&o.y<BY+18&&Math.abs(o.x-p.x)<36){o.hit=true;if(o.bad){dead=1;burst(parts,o.x,o.y,'#ffd84a',26,220);burst(parts,o.x,o.y,'#ff5d5d',20,180);SFX.boom();break}
        ctx.score(++sc);beep(520+Math.min(sc,30)*15,.06,'square',.045,0,900+Math.min(sc,30)*15);burst(parts,o.x,BY,['#e8413c','#ff9f2a','#8e4fd6'][o.c],8,110);pops.push({x:o.x,y:BY-10,l:.7})}
      else if(!o.hit&&o.y>H-14){o.hit=true;if(!o.bad){miss++;SFX.thud();burst(parts,o.x,H-16,'#c9a26b',6,80);if(miss>=3){SFX.lose();dead=.6}}}}
    it=it.filter(o=>!o.hit)}else{dead+=dt;if(dead>1.2)return ctx.over(miss>=3?'Too many drops':'Caught a bomb')}
    const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#8fd3ff');sky.addColorStop(1,'#e6f8ff');g.fillStyle=sky;g.fillRect(0,0,W,H);
    g.fillStyle='#9ed99a';g.beginPath();g.moveTo(0,H-60);for(let x=0;x<=W;x+=10)g.lineTo(x,H-70-10*Math.sin(x/50));g.lineTo(W,H);g.lineTo(0,H);g.fill();
    g.fillStyle='#5aa04f';g.fillRect(0,H-16,W,16);g.fillStyle='#4c8f44';for(let x=0;x<W;x+=14)g.fillRect(x,H-16,7,3);
    g.fillStyle='#2f7a3a';for(let x=-10;x<W+20;x+=34){g.beginPath();g.arc(x,-6,26,0,7);g.fill()}g.fillStyle='#3e9443';for(let x=7;x<W+20;x+=34){g.beginPath();g.arc(x,6,20,0,7);g.fill()}
    it.forEach(fruit);parts=drawParts(g,parts,dt,260);
    const bx=p.x;g.fillStyle='#a0682e';g.beginPath();g.moveTo(bx-34,BY);g.lineTo(bx+34,BY);g.lineTo(bx+26,BY+22);g.lineTo(bx-26,BY+22);g.closePath();g.fill();
    g.strokeStyle='#7a4c1f';g.lineWidth=2;for(let i=-24;i<=24;i+=12){g.beginPath();g.moveTo(bx+i,BY+2);g.lineTo(bx+i*.8,BY+21);g.stroke()}g.beginPath();g.moveTo(bx-30,BY+9);g.lineTo(bx+30,BY+9);g.stroke();
    g.fillStyle='#c4864a';rrect(g,bx-36,BY-4,72,6,3);g.fill();
    pops.forEach(q=>{q.l-=dt;q.y-=40*dt;g.globalAlpha=Math.max(0,q.l);g.fillStyle='#fff';g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=3;g.font=FONT(14,700);g.textAlign='center';g.strokeText('+1',q.x,q.y);g.fillText('+1',q.x,q.y)});g.globalAlpha=1;pops=pops.filter(q=>q.l>0);
    for(let i=0;i<3;i++)heart(W-18-i*20,46,i>=miss);g.fillStyle='#1b3a2a';g.font='400 26px "Bungee",Impact,sans-serif';g.textAlign='left';g.fillText(sc,12,54)});
});
