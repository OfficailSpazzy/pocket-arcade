
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

reg('runner','Runner','Arcade','Tap anywhere on the screen, or press space, to jump the cacti. It keeps getting faster.',ctx=>{
  const W=400,H=200,GY=160,{cv,g}=ctx.canvas(W,H);let y=GY,vy=0,obs=[],t=1,dist=0,run=0,parts=[],dead=0,mile=1,air=false;
  const stars=Array.from({length:40},()=>({x:R(W),y:R(110),s:Math.random()}));
  const jump=()=>{if(dead)return;if(y>=GY){vy=-580;air=true;beep(300,.12,'square',.04,0,620)}};ctx.on(window,'pointerdown',e=>{if(e.target.closest&&e.target.closest('#bar,#over,button,a,input'))return;if(e.cancelable)e.preventDefault();jump()},{passive:false});ctx.keys(k=>{if(k==='space'||k==='up')jump()});
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

reg('hop','Sky Hop','Arcade','You bounce on your own. Drag your finger left or right anywhere on the screen, or use the arrow keys, to land on the next cloud. Climb into space.',ctx=>{
  const W=320,H=460,{cv,g}=ctx.canvas(W,H),p={x:W/2};let drag=null;
  const skip=e=>e.target.closest&&e.target.closest('#bar,#over,button,a,input');
  ctx.on(window,'pointerdown',e=>{if(skip(e))return;if(e.cancelable)e.preventDefault();drag={fx:e.clientX,px:x,id:e.pointerId}},{passive:false});
  ctx.on(window,'pointermove',e=>{if(!drag||e.pointerId!==drag.id||ctx.paused)return;const r=cv.getBoundingClientRect();p.x=clamp(drag.px+(e.clientX-drag.fx)*W/r.width*1.15,10,W-10)});
  const end=e=>{if(drag&&e.pointerId===drag.id)drag=null};ctx.on(window,'pointerup',end);ctx.on(window,'pointercancel',end);let pl=[],x=W/2,y=H-60,vy=-470,sc=0,top,squash=0,face=1,mile=1,falling=false;
  for(let yy=H-20;yy>-20;yy-=62)pl.push({x:yy===H-20?W/2-27:R(W-54),y:yy});top=pl[pl.length-1].y;
  const stars=Array.from({length:60},()=>({x:R(W),y:R(H),s:Math.random()}));
  const lerp=(a,b,k)=>a.map((v,i)=>Math.round(v+(b[i]-v)*k));
  const cloud=(q)=>{g.fillStyle='rgba(0,0,0,.08)';g.beginPath();g.ellipse(q.x+27,q.y+9,27,5,0,0,7);g.fill();g.fillStyle='#fff';[[10,2,9],[24,-2,12],[40,2,9],[27,4,10]].forEach(([dx,dy,r])=>{g.beginPath();g.arc(q.x+dx,q.y+dy,r,0,7);g.fill()});g.fillStyle='#dfe9ff';g.fillRect(q.x+4,q.y+6,46,3)};
  ctx.loop(dt=>{if(ctx.held.left)p.x=x-90;else if(ctx.held.right)p.x=x+90;else if(!drag&&(ctx.held.left===false||ctx.held.right===false)){p.x=x;ctx.held.left=ctx.held.right=undefined}const dx=clamp(p.x-x,-(drag?900:330)*dt,(drag?900:330)*dt);if(Math.abs(dx)>.5)face=Math.sign(dx);x+=dx;x=clamp(x,10,W-10);squash=Math.max(0,squash-dt*4);
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

reg('racer','Lane Racer','Arcade','Drag left or right anywhere on the screen, or use the arrow keys, to steer through traffic. Pass cars by a hair for close-call points, and thread the gap between two cars for a split.',ctx=>{
  const W=300,H=440,LX=[50,150,250],PY=H-90,{cv,g}=ctx.canvas(W,H);let px=150,tx=150,cars=[],gap=0,passed=0,sc=0,road=0,tilt=0,dead=0,parts=[],pops=[],combo=0,comboT=0,gid=0,drag=null,lastPx=150,streaks=[];
  const COLS=['#ff5d7a','#5aa9ff','#2fd6b5','#b48cff','#ff9f43','#e6ebf7'];
  const skip=e=>e.target.closest&&e.target.closest('#bar,#over,button,a,input');
  ctx.on(window,'pointerdown',e=>{if(skip(e))return;if(e.cancelable)e.preventDefault();drag={fx:e.clientX,px:tx,id:e.pointerId}},{passive:false});
  ctx.on(window,'pointermove',e=>{if(!drag||e.pointerId!==drag.id||ctx.paused)return;const r=cv.getBoundingClientRect();tx=clamp(drag.px+(e.clientX-drag.fx)*W/r.width*1.2,24,W-24)});
  const end=e=>{if(drag&&e.pointerId===drag.id)drag=null};ctx.on(window,'pointerup',end);ctx.on(window,'pointercancel',end);
  const style=(label,pts,x,col)=>{combo=comboT>0?Math.min(combo+1,5):1;comboT=3;const tot=pts*combo;sc+=tot;ctx.score(sc);
    pops.push({x,y:PY-14,t:label+(combo>1?' x'+combo:''),s:'+'+tot,l:1.1,c:col});ctx.info(combo>1?'Style combo x'+combo:'')};
  const car=(x,y,col,me,tl)=>{g.save();g.translate(x,y+22);g.rotate(tl*.12);
    g.fillStyle='rgba(0,0,0,.35)';rrect(g,-17,-20,36,46,8);g.fill();
    g.fillStyle='#111';g.fillRect(-19,-15,4,10);g.fillRect(15,-15,4,10);g.fillRect(-19,8,4,10);g.fillRect(15,8,4,10);
    g.fillStyle=col;rrect(g,-16,-22,32,44,8);g.fill();g.fillStyle='rgba(255,255,255,.25)';rrect(g,-13,-20,26,6,3);g.fill();
    g.fillStyle='#1d2a44';rrect(g,-12,me?-12:4,24,9,3);g.fill();rrect(g,-11,me?6:-12,22,6,3);g.fill();
    if(me){g.fillStyle='#1b1326';g.fillRect(-3,-22,6,44);g.fillStyle='#fff6c4';g.fillRect(-13,-23,6,3);g.fillRect(7,-23,6,3)}else{g.fillStyle='#ff4040';g.fillRect(-13,20,6,3);g.fillRect(7,20,6,3)}
    g.restore()};
  ctx.loop(dt=>{comboT-=dt;if(comboT<=0&&combo){combo=0;ctx.info('')}
    if(!dead){if(ctx.held.left)tx=clamp(tx-300*dt,24,W-24);if(ctx.held.right)tx=clamp(tx+300*dt,24,W-24);
      const mv=clamp(tx-px,-(drag?1100:400)*dt,(drag?1100:400)*dt);px+=mv;tilt+=(clamp(mv/dt/500,-1,1)-tilt)*Math.min(1,dt*12);
      const v=210+passed*5;road=(road+v*dt)%40;gap-=v*dt;
      if(gap<=0){gap=190;const a=R(3),id=++gid;cars.push({l:a,y:-50,n:true,c:R(6),g:id,min:99});if(Math.random()<.4){const b=(a+1+R(2))%3;cars.push({l:b,y:-50,n:true,c:R(6),g:id,min:99})}}
      for(const c of cars){c.y+=v*dt;const cx=LX[c.l];
        if(c.y+44>PY&&c.y<PY+44){const edge=Math.abs(cx-px)-34;if(edge<0){dead=1;burst(parts,px,PY+22,'#ffd84a',24,200);burst(parts,px,PY+22,'#ff5d5d',16,160);SFX.boom();break}c.min=Math.min(c.min,edge);
          const mates=cars.filter(o=>o.g===c.g&&o!==c);if(mates.length&&Math.abs(mates[0].l-c.l)===1){const lo=Math.min(cx,LX[mates[0].l]),hi=Math.max(cx,LX[mates[0].l]);if(px>lo&&px<hi)c.split=1}}
        if(c.n&&c.y>=PY+44){c.n=false;passed++;sc++;ctx.score(sc);beep(1000,.03,'square',.02);if(passed%10===0)SFX.ok();
          const mates=cars.filter(o=>o.g===c.g&&o!==c);
          if(c.split&&mates.length&&mates[0].split&&!mates[0].n&&!c.g_done){c.g_done=mates[0].g_done=1;style('SPLIT',15,px,'#ffd84a');[880,1175,1568].forEach((f,i)=>beep(f,.08,'square',.05,i*.06));streaks.push({x:px,l:.5})}
          else if(c.min<10&&!c.g_done){style(c.min<4?'INSANE':'CLOSE CALL',c.min<4?10:5,(px+LX[c.l])/2,c.min<4?'#ff7ac6':'#2fd6b5');noise(.18,.12,0,2200);beep(c.min<4?1300:900,.07,'square',.04);streaks.push({x:px,l:.4})}}}
      cars=cars.filter(c=>c.y<H+60)}else{dead+=dt;if(dead>1)return ctx.over('Crash',undefined,'lose')}
    g.fillStyle='#2b2d3a';g.fillRect(0,0,W,H);g.fillStyle='#33364a';g.fillRect(14,0,W-28,H);
    for(let y=-40+road;y<H;y+=40){g.fillStyle=Math.floor((y-road)/40)%2?'#ff5d5d':'#f4eeff';g.fillRect(0,y,8,20);g.fillRect(W-8,y,8,20);g.fillStyle=Math.floor((y-road)/40)%2?'#f4eeff':'#ff5d5d';g.fillRect(0,y+20,8,20);g.fillRect(W-8,y+20,8,20)}
    g.fillStyle='rgba(255,255,255,.75)';for(let y=-40+road;y<H;y+=40){g.fillRect(98,y,4,22);g.fillRect(198,y,4,22)}
    cars.forEach(c=>car(LX[c.l],c.y,COLS[c.c],false,0));
    streaks.forEach(s=>{s.l-=dt;g.strokeStyle=`rgba(255,255,255,${Math.max(0,s.l)})`;g.lineWidth=2;for(const o of[-20,20]){g.beginPath();g.moveTo(s.x+o,PY+50);g.lineTo(s.x+o,PY+50+70*s.l*2);g.stroke()}});streaks=streaks.filter(s=>s.l>0);
    if(!dead||Math.floor(dead*10)%2)car(px,PY,'#ffd84a',true,tilt);
    parts=drawParts(g,parts,dt,0);
    pops.forEach(q=>{q.l-=dt;q.y-=50*dt;g.globalAlpha=Math.max(0,Math.min(1,q.l*1.5));g.textAlign='center';g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.6)';g.font=FONT(15,700);g.fillStyle=q.c;g.strokeText(q.t,q.x,q.y);g.fillText(q.t,q.x,q.y);g.font=FONT(13,700);g.fillStyle='#fff';g.strokeText(q.s,q.x,q.y+16);g.fillText(q.s,q.x,q.y+16)});g.globalAlpha=1;pops=pops.filter(q=>q.l>0);
    g.fillStyle='rgba(0,0,0,.4)';rrect(g,W/2-40,8,80,26,8);g.fill();g.fillStyle='#fff';g.font=FONT(13,700);g.textAlign='center';g.fillText((210+passed*5)/2|0,W/2-8,26);g.fillStyle=C.mut;g.font=FONT(9,700);g.fillText('KM/H',W/2+22,26);
    if(combo>1&&comboT>0){g.fillStyle='rgba(0,0,0,.4)';rrect(g,W-64,8,56,26,8);g.fill();g.fillStyle=C.yel;g.font=FONT(13,700);g.fillText('x'+combo,W-36,26);g.fillStyle='rgba(255,216,74,.8)';g.fillRect(W-60,30,48*Math.max(0,comboT)/3,2)}});
});

reg('slice','Fruit Slice','Arcade','Swipe across the fruit to slice it. Slice three or more in one swipe for a combo. Miss three fruit and you are out, and never slice a bomb.',ctx=>{
  const W=320,H=460,{cv,g}=ctx.canvas(W,H);let items=[],halves=[],stains=[],parts=[],pops=[],trail=[],down=false,stroke=[],sc=0,lives=3,spawnT=.8,time=0,dead=0,flash=0,lastWhoosh=0,xs=[];
  const FR=[{n:'apple',o:'#e8413c',i:'#fff3d6',r:20,j:'#f5e6b8'},{n:'orange',o:'#ff9f2a',i:'#ffc46a',r:21,j:'#ffb347'},{n:'melon',o:'#2f9e4a',i:'#ff4d5e',r:28,j:'#ff4d5e'},
    {n:'lemon',o:'#ffe14a',i:'#fff6b0',r:18,j:'#fff07a'},{n:'plum',o:'#7b3fc4',i:'#f0c94a',r:18,j:'#b06cf0'},{n:'kiwi',o:'#8a6a3a',i:'#7ccf3a',r:18,j:'#9be060'}];
  const toG=e=>cv.pos(e);
  ctx.on(cv,'pointerdown',e=>{e.preventDefault();if(ctx.paused||dead)return;down=true;stroke=[];const q=toG(e);trail=[{x:q.x,y:q.y,t:time}]});
  ctx.on(window,'pointermove',e=>{if(!down||ctx.paused||dead)return;const q=toG(e),p=trail[trail.length-1];trail.push({x:q.x,y:q.y,t:time});if(p)cut(p,q)});
  const up=()=>{if(!down)return;down=false;if(stroke.length>=3){const bonus=stroke.length*2;sc+=bonus;ctx.score(sc);const cx=stroke.reduce((a,o)=>a+o.x,0)/stroke.length,cy=stroke.reduce((a,o)=>a+o.y,0)/stroke.length;
      pops.push({x:clamp(cx,60,W-60),y:cy,t:stroke.length+' FRUIT COMBO',s:'+'+bonus,l:1.3,c:'#ffd84a'});[784,988,1175,1568].slice(0,Math.min(4,stroke.length)).forEach((f,i)=>beep(f,.09,'square',.05,i*.06))}stroke=[]};
  ctx.on(window,'pointerup',up);ctx.on(window,'pointercancel',up);
  const segDist=(p,q,c)=>{const dx=q.x-p.x,dy=q.y-p.y,l2=dx*dx+dy*dy||1;const t=clamp(((c.x-p.x)*dx+(c.y-p.y)*dy)/l2,0,1);return Math.hypot(p.x+dx*t-c.x,p.y+dy*t-c.y)};
  const cut=(p,q)=>{const len=Math.hypot(q.x-p.x,q.y-p.y);if(len<3)return;if(len>14&&time-lastWhoosh>.18){lastWhoosh=time;noise(.12,.06,0,3000)}
    for(const o of items){if(o.cut||segDist(p,q,o)>o.r)continue;o.cut=true;const ang=Math.atan2(q.y-p.y,q.x-p.x);
      if(o.bomb){dead=1;flash=1;SFX.boom();burst(parts,o.x,o.y,'#ffd84a',30,260);burst(parts,o.x,o.y,'#ff5d3a',24,220);return}
      const f=FR[o.k];sc++;ctx.score(sc);stroke.push({x:o.x,y:o.y});const nx=-Math.sin(ang),ny=Math.cos(ang);
      halves.push({x:o.x,y:o.y,vx:o.vx+nx*70,vy:o.vy+ny*70,a:ang,va:2.5,k:o.k,s:1},{x:o.x,y:o.y,vx:o.vx-nx*70,vy:o.vy-ny*70,a:ang+Math.PI,va:-2.5,k:o.k,s:-1});
      stains.push({x:o.x,y:o.y,r:f.r*1.4,c:f.j,l:3,seed:Math.random()*6});burst(parts,o.x,o.y,f.j,12,180);
      noise(.08,.16,0,1200);beep(260+R(80),.07,'triangle',.08,0,140)}};
  const throwWave=()=>{const n=1+R(Math.min(4,1+Math.floor(time/15)));for(let i=0;i<n;i++){const x=40+R(W-80),bomb=Math.random()<Math.min(.25,.1+time*.002);
    items.push({x,y:H+30,vx:(W/2-x)*(.4+Math.random()*.5)+(Math.random()-.5)*60,vy:-(560+R(120)),a:Math.random()*6,va:(Math.random()-.5)*4,k:R(FR.length),bomb,r:bomb?18:FR[0].r,cut:false,fuse:0})}
    items.forEach(o=>{if(!o.bomb)o.r=FR[o.k].r});beep(180,.06,'triangle',.06,0,320)};
  const drawFruit=(o)=>{const f=FR[o.k],r=f.r;g.save();g.translate(o.x,o.y);g.rotate(o.a);
    if(o.bomb){g.fillStyle='#1d1a24';g.beginPath();g.arc(0,0,18,0,7);g.fill();g.strokeStyle='#ff3b3b';g.lineWidth=2;g.beginPath();g.arc(0,0,13,0,7);g.stroke();g.fillStyle='#ff3b3b';g.font=FONT(16,700);g.textAlign='center';g.textBaseline='middle';g.fillText('✖',0,1);
      g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.arc(-6,-7,4,0,7);g.fill();g.strokeStyle='#a07a4a';g.lineWidth=3;g.beginPath();g.moveTo(8,-14);g.quadraticCurveTo(14,-24,20,-22);g.stroke();
      g.fillStyle=Math.floor(time*14)%2?'#ffd84a':'#ff7b2e';g.beginPath();g.arc(20,-22,4,0,7);g.fill();g.restore();g.textBaseline='alphabetic';return}
    const gr=g.createRadialGradient(-r*.35,-r*.35,r*.1,0,0,r);gr.addColorStop(0,'#ffffff66');gr.addColorStop(.25,f.o);gr.addColorStop(1,f.o);g.fillStyle=f.o;g.beginPath();g.arc(0,0,r,0,7);g.fill();
    if(f.n==='melon'){g.strokeStyle='#1d6b32';g.lineWidth=3;for(let k=-2;k<=2;k++){g.beginPath();g.ellipse(k*8,0,3,r*.95,0,0,7);g.stroke()}}
    if(f.n==='orange'){g.fillStyle='rgba(0,0,0,.08)';for(let k=0;k<10;k++){g.beginPath();g.arc(Math.cos(k)*r*.6,Math.sin(k*1.7)*r*.6,1.5,0,7);g.fill()}}
    if(f.n==='kiwi'){g.fillStyle='rgba(0,0,0,.12)';for(let k=0;k<14;k++){g.fillRect(Math.cos(k*2.1)*r*.7,Math.sin(k*1.3)*r*.7,1.5,3)}}
    g.fillStyle=gr;g.beginPath();g.arc(0,0,r,0,7);g.fill();
    if(f.n==='apple'||f.n==='orange'||f.n==='plum'){g.fillStyle='#5a3a1f';g.fillRect(-1.5,-r-5,3,7);g.fillStyle='#3fae4f';g.beginPath();g.ellipse(6,-r-2,7,3,-.4,0,7);g.fill()}
    g.restore()};
  const drawHalf=(h)=>{const f=FR[h.k],r=f.r;g.save();g.translate(h.x,h.y);g.rotate(h.a);g.fillStyle=f.o;g.beginPath();g.arc(0,0,r,0,Math.PI);g.closePath();g.fill();
    g.fillStyle=f.i;g.beginPath();g.ellipse(0,0,r*.84,r*.84,0,0,Math.PI);g.closePath();g.fill();g.fillStyle=f.n==='melon'?'#1b1326':f.n==='kiwi'?'#1b1326':'rgba(120,80,30,.6)';
    for(let k=0;k<(f.n==='melon'||f.n==='kiwi'?7:3);k++){const a=.4+k*(2.3/(f.n==='melon'||f.n==='kiwi'?7:3));g.beginPath();g.ellipse(Math.cos(a)*r*.45,Math.sin(a)*r*.45,1.6,2.6,a,0,7);g.fill()}g.restore()};
  ctx.loop(dt=>{time+=dt;flash=Math.max(0,flash-dt*1.5);
    if(!dead){spawnT-=dt;if(spawnT<=0){spawnT=Math.max(.75,1.6-time*.012);throwWave()}}
    else{dead+=dt;if(dead>1.4)return ctx.over(lives<=0?'Too many missed':'Sliced a bomb',undefined,'lose')}
    items.forEach(o=>{o.vy+=600*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.a+=o.va*dt;if(o.bomb&&!o.cut&&o.y<H&&Math.random()<dt*3)beep(1400,.015,'square',.01);
      if(!o.cut&&o.vy>0&&o.y>H+o.r+10){o.cut=true;if(!o.bomb&&!dead){lives--;xs.push({l:1});SFX.thud();beep(200,.2,'sawtooth',.04,0,100);if(lives<=0){dead=1;SFX.lose()}}}});
    items=items.filter(o=>!o.cut);
    halves.forEach(h=>{h.vy+=600*dt;h.x+=h.vx*dt;h.y+=h.vy*dt;h.a+=h.va*dt});halves=halves.filter(h=>h.y<H+60);
    trail=trail.filter(p=>time-p.t<.12);
    // wooden board
    g.fillStyle='#5a3a22';g.fillRect(0,0,W,H);for(let i=0;i<6;i++){const y=i*H/6;g.fillStyle=i%2?'#6b4528':'#62402a';g.fillRect(0,y,W,H/6-2);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,y+H/6-2,W,2);
      g.strokeStyle='rgba(0,0,0,.08)';g.lineWidth=1;for(let k=0;k<4;k++){g.beginPath();g.moveTo(0,y+12+k*15);g.bezierCurveTo(W*.3,y+6+k*15,W*.7,y+20+k*15,W,y+10+k*15);g.stroke()}}
    stains.forEach(s=>{s.l-=dt;g.globalAlpha=Math.max(0,Math.min(.55,s.l/3*.55));g.fillStyle=s.c;g.beginPath();g.arc(s.x,s.y,s.r,0,7);g.fill();for(let k=0;k<6;k++){const a=s.seed+k;g.beginPath();g.arc(s.x+Math.cos(a)*s.r*1.3,s.y+Math.sin(a)*s.r*1.3,s.r*.22,0,7);g.fill()}});g.globalAlpha=1;stains=stains.filter(s=>s.l>0);
    halves.forEach(drawHalf);items.forEach(drawFruit);parts=drawParts(g,parts,dt,500);
    if(trail.length>1){g.lineCap='round';g.lineJoin='round';for(let i=1;i<trail.length;i++){const k=i/trail.length;g.strokeStyle=`rgba(255,255,255,${k})`;g.lineWidth=2+k*7;g.shadowColor='#bfe8ff';g.shadowBlur=10;g.beginPath();g.moveTo(trail[i-1].x,trail[i-1].y);g.lineTo(trail[i].x,trail[i].y);g.stroke()}g.shadowBlur=0}
    pops.forEach(q=>{q.l-=dt;q.y-=30*dt;g.globalAlpha=Math.max(0,Math.min(1,q.l*1.5));g.textAlign='center';g.lineWidth=5;g.strokeStyle='rgba(0,0,0,.6)';g.font='400 18px "Bungee",Impact,sans-serif';g.fillStyle=q.c;g.strokeText(q.t,q.x,q.y);g.fillText(q.t,q.x,q.y);g.font=FONT(15,700);g.fillStyle='#fff';g.strokeText(q.s,q.x,q.y+20);g.fillText(q.s,q.x,q.y+20)});g.globalAlpha=1;pops=pops.filter(q=>q.l>0);
    g.textAlign='left';g.lineWidth=5;g.strokeStyle='rgba(0,0,0,.5)';g.fillStyle='#ffd84a';g.font='400 30px "Bungee",Impact,sans-serif';g.strokeText(sc,12,42);g.fillText(sc,12,42);
    for(let i=0;i<3;i++){const lost=i>=lives;g.font='400 22px "Bungee",Impact,sans-serif';g.textAlign='center';g.fillStyle=lost?'#ff3b3b':'rgba(255,255,255,.25)';g.strokeText('✖',W-20-i*26,38);g.fillText('✖',W-20-i*26,38)}
    if(flash>0){g.fillStyle=`rgba(255,255,255,${flash})`;g.fillRect(0,0,W,H)}
    if(time<1.2&&!sc){g.globalAlpha=1-time/1.2;g.fillStyle='#fff';g.font=FONT(16,700);g.textAlign='center';g.fillText('Swipe to slice',W/2,H/2);g.globalAlpha=1}});
});

