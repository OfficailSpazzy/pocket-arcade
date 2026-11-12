
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

reg('slice','Fruit Slice','Arcade','Swipe across the fruit to slice it. Slice three or more in one swipe for a combo. Missing fruit is fine, but hit three bombs and you are out.',ctx=>{
  const W=320,H=460,{cv,g}=ctx.canvas(W,H),SS=3;
  const mk=(w,h,fn)=>{const c=document.createElement('canvas');c.width=Math.ceil(w*SS);c.height=Math.ceil(h*SS);const x=c.getContext('2d');x.scale(SS,SS);fn(x);return c};
  const rng=seed=>{let s=seed;return()=>{s=(s*9301+49297)%233280;return s/233280}};
  const ell=(x,rx,ry,cx=0,cy=0)=>{x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,7)};
  const body=(x,rx,ry,c1,c2,c3)=>{const q=x.createRadialGradient(-rx*.35,-ry*.4,rx*.05,0,0,Math.max(rx,ry)*1.05);q.addColorStop(0,c1);q.addColorStop(.5,c2);q.addColorStop(1,c3);x.fillStyle=q;ell(x,rx,ry);x.fill()};
  const gloss=(x,rx,ry,k=1)=>{let q=x.createRadialGradient(-rx*.36,-ry*.44,0,-rx*.36,-ry*.44,rx*.6);q.addColorStop(0,`rgba(255,255,255,${.8*k})`);q.addColorStop(.3,`rgba(255,255,255,${.22*k})`);q.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=q;ell(x,rx,ry);x.fill();
    q=x.createRadialGradient(rx*.15,ry*.2,Math.min(rx,ry)*.55,0,0,Math.max(rx,ry));q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(.85,'rgba(0,0,0,.16)');q.addColorStop(1,'rgba(0,0,0,.38)');x.fillStyle=q;ell(x,rx,ry);x.fill();
    x.fillStyle=`rgba(255,255,255,${.85*k})`;ell(x,rx*.11,ry*.07,-rx*.42,-ry*.5);x.fill()};
  const dots=(x,rx,ry,n,col,sz,seed)=>{const r=rng(seed);x.fillStyle=col;for(let i=0;i<n;i++){const a=r()*6.283,d=Math.sqrt(r())*.95;x.beginPath();x.arc(Math.cos(a)*rx*d,Math.sin(a)*ry*d,sz*(.4+r()),0,7);x.fill()}};
  const clipE=(x,rx,ry,fn)=>{x.save();ell(x,rx,ry);x.clip();fn();x.restore()};
  const segs=(x,R,n,c1,c2,mem)=>{for(let i=0;i<n;i++){const a0=i/n*6.283,a1=(i+1)/n*6.283;x.fillStyle=i%2?c1:c2;x.beginPath();x.moveTo(0,0);x.arc(0,0,R,a0+.03,a1-.03);x.closePath();x.fill()}
    x.strokeStyle=mem;x.lineWidth=R*.05;for(let i=0;i<n;i++){const a=i/n*6.283;x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a)*R,Math.sin(a)*R);x.stroke()}};
  const teardrop=(x,cx,cy,a,len,w,col)=>{x.save();x.translate(cx,cy);x.rotate(a);x.fillStyle=col;x.beginPath();x.moveTo(0,-len*.5);x.quadraticCurveTo(w,len*.2,0,len*.5);x.quadraticCurveTo(-w,len*.2,0,-len*.5);x.fill();x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.arc(-w*.25,len*.05,w*.25,0,7);x.fill();x.restore()};
  const FR=[
   {n:'apple',r:22,rx:1,ry:.95,juice:'#f3e2a0',flesh:'#fff6d6',
    skin:(x,rx,ry)=>{body(x,rx,ry,'#ff7a6a','#d41f2b','#6a0811');clipE(x,rx,ry,()=>{let q=x.createRadialGradient(rx*.45,ry*.4,0,rx*.45,ry*.4,rx*.7);q.addColorStop(0,'rgba(255,196,70,.45)');q.addColorStop(1,'rgba(255,196,70,0)');x.fillStyle=q;x.fillRect(-rx,-ry,rx*2,ry*2);
      x.strokeStyle='rgba(255,170,150,.13)';x.lineWidth=1.2;for(let k=-4;k<=4;k++){x.beginPath();x.moveTo(k*rx*.22,-ry);x.quadraticCurveTo(k*rx*.3,0,k*rx*.2,ry);x.stroke()}
      dots(x,rx,ry,60,'rgba(255,235,180,.45)',.35,7);q=x.createRadialGradient(0,-ry*.82,0,0,-ry*.82,rx*.45);q.addColorStop(0,'rgba(60,0,0,.55)');q.addColorStop(1,'rgba(60,0,0,0)');x.fillStyle=q;x.fillRect(-rx,-ry,rx*2,ry);});gloss(x,rx,ry);
      x.strokeStyle='#5a3418';x.lineWidth=rx*.1;x.lineCap='round';x.beginPath();x.moveTo(0,-ry*.72);x.quadraticCurveTo(rx*.05,-ry*1.05,rx*.18,-ry*1.22);x.stroke();
      x.save();x.translate(rx*.42,-ry*1.05);x.rotate(-.5);const q=x.createLinearGradient(0,-4,0,4);q.addColorStop(0,'#7fd65a');q.addColorStop(1,'#2e8a2e');x.fillStyle=q;x.beginPath();x.ellipse(0,0,rx*.36,rx*.15,0,0,7);x.fill();x.strokeStyle='rgba(20,70,20,.6)';x.lineWidth=.6;x.beginPath();x.moveTo(-rx*.34,0);x.lineTo(rx*.34,0);x.stroke();x.restore()},
    inside:(x,rx,ry)=>{x.fillStyle='#b5121f';ell(x,rx,ry);x.fill();const q=x.createRadialGradient(0,0,0,0,0,rx);q.addColorStop(0,'#fffbe6');q.addColorStop(.7,'#fbefc2');q.addColorStop(1,'#f0dc98');x.fillStyle=q;ell(x,rx*.93,ry*.93);x.fill();
      x.fillStyle='rgba(225,210,140,.55)';x.beginPath();for(let i=0;i<10;i++){const a=i/10*6.283-1.57,d=i%2?rx*.12:rx*.32;x.lineTo(Math.cos(a)*d,Math.sin(a)*d)}x.fill();for(let i=0;i<5;i++){const a=i/5*6.283-1.57;teardrop(x,Math.cos(a)*rx*.22,Math.sin(a)*ry*.22,a+1.57,rx*.22,rx*.08,'#4a2a12')}}},
   {n:'orange',r:22,rx:1,ry:1,juice:'#ff9a1a',flesh:'#ffb340',
    skin:(x,rx,ry)=>{body(x,rx,ry,'#ffd27a','#ff8f12','#a84400');clipE(x,rx,ry,()=>{dots(x,rx,ry,220,'rgba(255,235,170,.3)',.45,3);dots(x,rx,ry,200,'rgba(110,40,0,.2)',.5,11)});gloss(x,rx,ry,.85);
      x.fillStyle='#4f7a1e';for(let i=0;i<5;i++){const a=i/5*6.283;x.beginPath();x.ellipse(Math.cos(a)*rx*.06,-ry*.9+Math.sin(a)*rx*.06,rx*.07,rx*.03,a,0,7);x.fill()}},
    inside:(x,rx,ry)=>{x.fillStyle='#f07c06';ell(x,rx,ry);x.fill();x.fillStyle='#fff3dc';ell(x,rx*.91,ry*.91);x.fill();segs(x,rx*.84,10,'#ffa327','#ff9214','#ffe8bf');dots(x,rx*.8,ry*.8,90,'rgba(255,230,160,.45)',.45,5);x.fillStyle='#fff3dc';ell(x,rx*.1,ry*.1);x.fill()}},
   {n:'melon',r:28,rx:1.15,ry:.9,juice:'#ff2d4a',flesh:'#ff4a5c',
    skin:(x,rx,ry)=>{body(x,rx,ry,'#9ee07d','#3a9f45','#123f1f');clipE(x,rx,ry,()=>{x.fillStyle='#174d25';for(let k=-4;k<=4;k++){x.beginPath();const cx=k*rx*.25,w=rx*.075,bend=y=>Math.sqrt(Math.max(0,1-(y/ry)*(y/ry)));for(let y=-ry;y<=ry;y+=1.5)x.lineTo((cx-w)*bend(y)+Math.sin(y*.32+k*1.7)*1.6,y);for(let y=ry;y>=-ry;y-=1.5)x.lineTo((cx+w)*bend(y)+Math.sin(y*.29+k*2.3)*1.6,y);x.fill()}
      dots(x,rx,ry,50,'rgba(200,255,180,.18)',.6,9)});gloss(x,rx,ry,.9)},
    inside:(x,rx,ry)=>{x.fillStyle='#1d5e2c';ell(x,rx,ry);x.fill();x.fillStyle='#8fd16a';ell(x,rx*.95,ry*.94);x.fill();x.fillStyle='#eef7cf';ell(x,rx*.9,ry*.88);x.fill();
      const q=x.createRadialGradient(0,0,0,0,0,rx*.86);q.addColorStop(0,'#ff2440');q.addColorStop(.75,'#ff4a5a');q.addColorStop(1,'#ff8a86');x.fillStyle=q;ell(x,rx*.86,ry*.83);x.fill();dots(x,rx*.8,ry*.78,70,'rgba(255,200,200,.25)',.6,2);
      for(let i=0;i<12;i++){const a=i/12*6.283;teardrop(x,Math.cos(a)*rx*.55,Math.sin(a)*ry*.52,a+1.57,rx*.13,rx*.05,'#1b1210')}}},
   {n:'lemon',r:19,rx:1.15,ry:.85,juice:'#ffe94a',flesh:'#fff07a',
    skin:(x,rx,ry)=>{x.fillStyle='#e8b800';ell(x,rx*.16,ry*.28,rx*1.02,0);x.fill();ell(x,rx*.16,ry*.28,-rx*1.02,0);x.fill();body(x,rx,ry,'#fff6a6','#ffdc2e','#c48f00');clipE(x,rx,ry,()=>{dots(x,rx,ry,160,'rgba(255,255,210,.35)',.4,4);dots(x,rx,ry,140,'rgba(150,110,0,.18)',.45,13)});gloss(x,rx,ry,.9)},
    inside:(x,rx,ry)=>{x.fillStyle='#f2c400';ell(x,rx,ry);x.fill();x.fillStyle='#fffbe6';ell(x,rx*.9,ry*.88);x.fill();x.save();x.scale(1,ry/rx);segs(x,rx*.82,9,'#fff27a','#ffe955','#fffbe0');x.restore();dots(x,rx*.78,ry*.74,60,'rgba(255,255,230,.5)',.4,8)}},
   {n:'kiwi',r:19,rx:1.12,ry:.9,juice:'#8ad83a',flesh:'#7cc93a',
    skin:(x,rx,ry)=>{body(x,rx,ry,'#c9a46e','#8b6637','#3f2a14');clipE(x,rx,ry,()=>{const r=rng(21);x.strokeStyle='rgba(60,38,16,.45)';x.lineWidth=.5;for(let i=0;i<260;i++){const a=r()*6.283,d=Math.sqrt(r())*.98,px=Math.cos(a)*rx*d,py=Math.sin(a)*ry*d;x.beginPath();x.moveTo(px,py);x.lineTo(px+(r()-.5)*2.4,py+(r()-.5)*2.4);x.stroke()}});gloss(x,rx,ry,.35)},
    inside:(x,rx,ry)=>{x.fillStyle='#6b4a22';ell(x,rx,ry);x.fill();const q=x.createRadialGradient(0,0,rx*.2,0,0,rx);q.addColorStop(0,'#e4f7a0');q.addColorStop(.45,'#8fd645');q.addColorStop(1,'#4c9e22');x.fillStyle=q;ell(x,rx*.94,ry*.93);x.fill();
      x.strokeStyle='rgba(230,255,180,.35)';x.lineWidth=.7;for(let i=0;i<36;i++){const a=i/36*6.283;x.beginPath();x.moveTo(Math.cos(a)*rx*.3,Math.sin(a)*ry*.3);x.lineTo(Math.cos(a)*rx*.88,Math.sin(a)*ry*.86);x.stroke()}
      x.fillStyle='#fdfbe6';ell(x,rx*.26,ry*.2);x.fill();x.fillStyle='#1a1408';for(let i=0;i<34;i++){const a=i/34*6.283,d=.36+(i%3)*.05;x.beginPath();x.ellipse(Math.cos(a)*rx*d,Math.sin(a)*ry*d,.9,.5,a,0,7);x.fill()}}},
   {n:'coconut',r:22,rx:1,ry:.95,juice:'#f3efe4',flesh:'#fffaf0',
    skin:(x,rx,ry)=>{body(x,rx,ry,'#b07d4a','#6b4423','#26150a');clipE(x,rx,ry,()=>{const r=rng(31);for(let i=0;i<180;i++){const a=r()*6.283,d=Math.sqrt(r()),px=Math.cos(a)*rx*d,py=Math.sin(a)*ry*d;x.strokeStyle=r()<.5?'rgba(30,16,6,.5)':'rgba(200,150,100,.25)';x.lineWidth=.6;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+(r()-.5)*5,py+(r()-.5)*5,px+(r()-.5)*7,py+(r()-.5)*7);x.stroke()}});
      x.fillStyle='#24140a';[[-.18,-.62],[.18,-.62],[0,-.45]].forEach(([a,b])=>{ell(x,rx*.08,ry*.1,rx*a,ry*b);x.fill()});gloss(x,rx,ry,.3)},
    inside:(x,rx,ry)=>{x.fillStyle='#4a2c14';ell(x,rx,ry);x.fill();x.fillStyle='#fffaf0';ell(x,rx*.86,ry*.86);x.fill();const q=x.createRadialGradient(0,0,0,0,0,rx*.6);q.addColorStop(0,'#e9f1f6');q.addColorStop(1,'#c9d6de');x.fillStyle=q;ell(x,rx*.6,ry*.6);x.fill()}},
   {n:'plum',r:18,rx:.95,ry:1,juice:'#b82a6a',flesh:'#ffc23a',
    skin:(x,rx,ry)=>{body(x,rx,ry,'#c88aec','#6a2c9c','#22083a');clipE(x,rx,ry,()=>{x.fillStyle='rgba(225,215,255,.16)';x.fillRect(-rx,-ry,rx*2,ry*2);x.strokeStyle='rgba(30,0,50,.35)';x.lineWidth=1;x.beginPath();x.moveTo(-rx*.05,-ry);x.quadraticCurveTo(rx*.35,0,-rx*.05,ry);x.stroke()});gloss(x,rx,ry,.8);
      x.strokeStyle='#4a3418';x.lineWidth=rx*.08;x.lineCap='round';x.beginPath();x.moveTo(0,-ry*.9);x.lineTo(rx*.05,-ry*1.12);x.stroke()},
    inside:(x,rx,ry)=>{x.fillStyle='#4a0f5e';ell(x,rx,ry);x.fill();const q=x.createRadialGradient(0,0,rx*.2,0,0,rx);q.addColorStop(0,'#ffd75a');q.addColorStop(.7,'#ffb52a');q.addColorStop(1,'#d8505a');x.fillStyle=q;ell(x,rx*.93,ry*.94);x.fill();
      x.fillStyle='#8a5a2a';ell(x,rx*.32,ry*.42);x.fill();x.strokeStyle='rgba(60,30,10,.6)';x.lineWidth=.6;for(let k=-2;k<=2;k++){x.beginPath();x.moveTo(-rx*.25,k*ry*.12);x.quadraticCurveTo(0,k*ry*.12+2,rx*.25,k*ry*.12);x.stroke()}}},
  ];
  FR.forEach(f=>{const rx=f.r*f.rx,ry=f.r*f.ry,D=Math.max(rx,ry)*2.8;f.D=D;
    f.whole=mk(D,D,x=>{x.translate(D/2,D/2);x.save();x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=7;x.shadowOffsetY=5;x.fillStyle='#000';ell(x,rx*.98,ry*.98);x.fill();x.restore();f.skin(x,rx,ry)});
    f.half=mk(D,D,x=>{x.translate(D/2,D/2);x.save();x.beginPath();x.rect(-D,-D,D*2,D);x.clip();x.save();x.shadowColor='rgba(0,0,0,.45)';x.shadowBlur=6;x.shadowOffsetY=4;x.fillStyle='#000';ell(x,rx,ry);x.fill();x.restore();f.inside(x,rx,ry);
      const q=x.createLinearGradient(0,-ry,0,0);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(.75,'rgba(255,255,255,0)');q.addColorStop(1,'rgba(255,255,255,.35)');x.fillStyle=q;ell(x,rx,ry);x.fill();x.restore();x.fillStyle='rgba(255,255,255,.6)';x.fillRect(-rx*.9,-.6,rx*1.8,.8)});
    f.splats=[1,2,3].map(v=>mk(100,100,x=>{const r=rng(v*97+f.r*13);x.translate(50,50);x.fillStyle=f.juice;
      x.beginPath();const N=36;for(let i=0;i<=N;i++){const a=i/N*6.283,rad=15*(1+(r()-.5)*.55);x.lineTo(Math.cos(a)*rad,Math.sin(a)*rad)}x.fill();
      for(let k=0;k<8;k++){const a=r()*6.283,len=20+r()*26,w=2.5+r()*4.5,ca=Math.cos(a),sa=Math.sin(a),nx=-sa,ny=ca;x.beginPath();x.moveTo(ca*8+nx*w,sa*8+ny*w);x.quadraticCurveTo(ca*len*.6+nx*w*.6,sa*len*.6+ny*w*.6,ca*len,sa*len);x.quadraticCurveTo(ca*len*.6-nx*w*.6,sa*len*.6-ny*w*.6,ca*8-nx*w,sa*8-ny*w);x.fill();x.beginPath();x.arc(ca*len,sa*len,w*.55,0,7);x.fill()}
      for(let k=0;k<22;k++){const a=r()*6.283,d=22+r()*26;x.beginPath();x.arc(Math.cos(a)*d,Math.sin(a)*d,.8+r()*2.6,0,7);x.fill()}
      x.globalCompositeOperation='source-atop';const q=x.createRadialGradient(-4,-5,0,0,0,40);q.addColorStop(0,'rgba(255,255,255,.35)');q.addColorStop(.5,'rgba(255,255,255,0)');q.addColorStop(1,'rgba(0,0,0,.25)');x.fillStyle=q;x.fillRect(-50,-50,100,100)}));
  });
  const bombImg=mk(56,56,x=>{x.translate(28,28);x.save();x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=7;x.shadowOffsetY=5;body(x,17,17,'#5a5568','#25222e','#08070c');x.restore();gloss(x,17,17,.7);
    x.strokeStyle='#ff3b3b';x.lineWidth=2;ell(x,12,12);x.stroke();x.fillStyle='#ff3b3b';x.font='700 15px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText('✖',0,1);
    x.fillStyle='#3a3644';x.fillRect(-4,-20,8,5);x.strokeStyle='#b08a5a';x.lineWidth=2.5;x.lineCap='round';x.beginPath();x.moveTo(0,-20);x.quadraticCurveTo(6,-27,12,-24);x.stroke()});
  const wood=mk(W,H,x=>{x.fillStyle='#4a2f1b';x.fillRect(0,0,W,H);const r=rng(77);for(let i=0;i<6;i++){const y=i*H/6,h=H/6;const q=x.createLinearGradient(0,y,0,y+h);q.addColorStop(0,i%2?'#6e4829':'#64412a');q.addColorStop(1,i%2?'#5e3c22':'#573823');x.fillStyle=q;x.fillRect(0,y,W,h-2);
      x.strokeStyle='rgba(30,15,5,.18)';x.lineWidth=1;for(let k=0;k<7;k++){x.beginPath();const yy=y+6+k*h/7;x.moveTo(0,yy);for(let xx=0;xx<=W;xx+=20)x.lineTo(xx,yy+Math.sin(xx*.02+k+i)*3+(r()-.5)*1.5);x.stroke()}
      if(r()<.7){x.fillStyle='rgba(40,20,8,.35)';ell(x,6+r()*4,3+r()*2,r()*W,y+h/2);x.fill()}x.fillStyle='rgba(0,0,0,.45)';x.fillRect(0,y+h-2,W,2);x.fillStyle='rgba(255,220,180,.06)';x.fillRect(0,y,W,1)}
    const v=x.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,H*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=v;x.fillRect(0,0,W,H)});

  let shake=0,items=[],halves=[],decals=[],drops=[],slashes=[],pops=[],trail=[],down=false,stroke=[],sc=0,lives=3,spawnT=.8,time=0,dead=0,flash=0,lastWhoosh=0;
  const toG=e=>cv.pos(e);
  ctx.on(cv,'pointerdown',e=>{e.preventDefault();if(ctx.paused||dead)return;down=true;stroke=[];const q=toG(e);trail=[{x:q.x,y:q.y,t:time}]});
  ctx.on(window,'pointermove',e=>{if(!down||ctx.paused||dead)return;const q=toG(e),p=trail[trail.length-1];trail.push({x:q.x,y:q.y,t:time});if(p)cut(p,q)});
  const up=()=>{if(!down)return;down=false;if(stroke.length>=3){const bonus=stroke.length*2;sc+=bonus;ctx.score(sc);const cx=stroke.reduce((a,o)=>a+o.x,0)/stroke.length,cy=stroke.reduce((a,o)=>a+o.y,0)/stroke.length;
      pops.push({x:clamp(cx,70,W-70),y:cy,t:stroke.length+' FRUIT COMBO',s:'+'+bonus,l:1.3,c:'#ffd84a'});[784,988,1175,1568].slice(0,Math.min(4,stroke.length)).forEach((f,i)=>beep(f,.09,'square',.05,i*.06))}stroke=[]};
  ctx.on(window,'pointerup',up);ctx.on(window,'pointercancel',up);
  const segDist=(p,q,c)=>{const dx=q.x-p.x,dy=q.y-p.y,l2=dx*dx+dy*dy||1;const t=clamp(((c.x-p.x)*dx+(c.y-p.y)*dy)/l2,0,1);return Math.hypot(p.x+dx*t-c.x,p.y+dy*t-c.y)};
  const splat=()=>{noise(.09,.22,0,1100);noise(.22,.1,.03,420);beep(220+R(60),.12,'triangle',.09,0,70)};
  const cut=(p,q)=>{const len=Math.hypot(q.x-p.x,q.y-p.y);if(len<3)return;if(len>14&&time-lastWhoosh>.18){lastWhoosh=time;noise(.14,.07,0,3200)}
    for(const o of items){const rr=o.bomb?17:FR[o.k].r;if(o.cut||segDist(p,q,o)>rr)continue;o.cut=true;const ang=Math.atan2(q.y-p.y,q.x-p.x);
      if(o.bomb){lives--;flash=.8;shake=.35;SFX.boom();for(let i=0;i<40;i++){const a=Math.random()*6.283,s=60+Math.random()*260;drops.push({x:o.x,y:o.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.7,c:i%2?'#ffd84a':'#ff5d3a',s:2+Math.random()*3,chunk:false})}
        pops.push({x:clamp(o.x,60,W-60),y:o.y,t:lives>0?'BOMB!':'',s:lives>0?(lives+(lives>1?' lives left':' life left')):'',l:1,c:'#ff5d5d'});if(lives<=0)dead=1;return}
      const f=FR[o.k];sc++;ctx.score(sc);stroke.push({x:o.x,y:o.y});const nx=-Math.sin(ang),ny=Math.cos(ang);
      halves.push({x:o.x+nx*2,y:o.y+ny*2,vx:o.vx*.6+nx*80+Math.cos(ang)*30,vy:o.vy*.5+ny*80-40,a:ang+Math.PI,va:2+Math.random()*2,k:o.k},{x:o.x-nx*2,y:o.y-ny*2,vx:o.vx*.6-nx*80+Math.cos(ang)*30,vy:o.vy*.5-ny*80-40,a:ang,va:-2-Math.random()*2,k:o.k});
      decals.push({x:o.x,y:o.y,a:ang,s:f.r/15,img:f.splats[R(3)],l:4.5});if(decals.length>24)decals.shift();
      slashes.push({x:o.x,y:o.y,a:ang,len:f.r*2.6,l:.14});
      for(let i=0;i<26;i++){const side=i%2?1:-1,a=ang+side*Math.PI/2+(Math.random()-.5)*1.3,s=90+Math.random()*320;drops.push({x:o.x,y:o.y,vx:Math.cos(a)*s+o.vx*.3,vy:Math.sin(a)*s+o.vy*.2,l:.55+Math.random()*.35,c:f.juice,s:1.6+Math.random()*3.2,chunk:false})}
      for(let i=0;i<10;i++){const a=ang+(Math.random()<.5?0:Math.PI)+(Math.random()-.5)*.6,s=120+Math.random()*260;drops.push({x:o.x,y:o.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.4+Math.random()*.3,c:f.juice,s:1.4+Math.random()*2,chunk:false})}
      for(let i=0;i<6;i++){const a=Math.random()*6.283,s=60+Math.random()*160;drops.push({x:o.x,y:o.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-60,l:.8,c:f.flesh,s:2.5+Math.random()*2.5,chunk:true,r:Math.random()*6,vr:(Math.random()-.5)*14})}
      splat()}};
  const throwWave=()=>{const n=1+R(Math.min(4,1+Math.floor(time/15)));for(let i=0;i<n;i++){const x=40+R(W-80),bomb=Math.random()<Math.min(.25,.1+time*.002);
    items.push({x,y:H+30,vx:(W/2-x)*(.4+Math.random()*.5)+(Math.random()-.5)*60,vy:-(560+R(120)),a:Math.random()*6,va:(Math.random()-.5)*4,k:R(FR.length),bomb,cut:false})}beep(180,.06,'triangle',.06,0,320)};
  const spr=(img,x,y,a,D)=>{g.save();g.translate(x,y);g.rotate(a);g.drawImage(img,-D/2,-D/2,D,D);g.restore()};
  ctx.loop(dt=>{time+=dt;flash=Math.max(0,flash-dt*1.5);shake=Math.max(0,shake-dt);g.save();if(shake)g.translate((Math.random()-.5)*shake*24,(Math.random()-.5)*shake*24);
    if(!dead){spawnT-=dt;if(spawnT<=0){spawnT=Math.max(.75,1.6-time*.012);throwWave()}}
    else{dead+=dt;if(dead>1.4){g.restore();return ctx.over('Three bombs hit',undefined,'lose')}}
    items.forEach(o=>{o.vy+=600*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.a+=o.va*dt;if(o.bomb&&!o.cut&&o.y<H&&Math.random()<dt*3)beep(1400,.015,'square',.01);if(!o.cut&&o.vy>0&&o.y>H+50)o.cut=true});
    items=items.filter(o=>!o.cut);
    halves.forEach(h=>{h.vy+=650*dt;h.x+=h.vx*dt;h.y+=h.vy*dt;h.a+=h.va*dt});halves=halves.filter(h=>h.y<H+60);
    trail=trail.filter(p=>time-p.t<.2);
    g.drawImage(wood,-12,-12,W+24,H+24);
    decals.forEach(d=>{d.l-=dt;g.save();g.globalAlpha=Math.max(0,Math.min(.85,d.l/1.5*.85));g.translate(d.x,d.y);g.rotate(d.a);g.scale(d.s*1.35,d.s*.95);g.drawImage(d.img,-50,-50,100,100);g.restore()});g.globalAlpha=1;decals=decals.filter(d=>d.l>0);
    halves.forEach(h=>{const f=FR[h.k];spr(f.half,h.x,h.y,h.a,f.D)});
    items.forEach(o=>{if(o.bomb){spr(bombImg,o.x,o.y,o.a*.3,56);const fx=o.x+Math.cos(o.a*.3-1.1)*26,fy=o.y+Math.sin(o.a*.3-1.1)*26;g.fillStyle=Math.floor(time*14)%2?'#fff6a0':'#ff7b2e';g.shadowColor='#ffb347';g.shadowBlur=10;g.beginPath();g.arc(fx,fy,3+Math.random()*1.5,0,7);g.fill();g.shadowBlur=0}else{const f=FR[o.k];spr(f.whole,o.x,o.y,o.a,f.D)}});
    drops.forEach(p=>{p.vy+=700*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;g.globalAlpha=Math.max(0,Math.min(1,p.l*2.2));
      if(p.chunk){p.r+=p.vr*dt;g.save();g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.fillRect(-p.s/2,-p.s/2,p.s,p.s*.8);g.restore()}
      else{g.strokeStyle=p.c;g.lineWidth=p.s;g.lineCap='round';g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*.022,p.y-p.vy*.022);g.stroke()}});g.globalAlpha=1;drops=drops.filter(p=>p.l>0);
    slashes.forEach(s=>{s.l-=dt;g.save();g.translate(s.x,s.y);g.rotate(s.a);g.globalAlpha=Math.max(0,s.l/.14);g.fillStyle='#fff';g.shadowColor='#fff';g.shadowBlur=12;g.beginPath();g.ellipse(0,0,s.len/2,1.8,0,0,7);g.fill();g.restore()});g.shadowBlur=0;g.globalAlpha=1;slashes=slashes.filter(s=>s.l>0);
    if(trail.length>1){const n=trail.length,L=[],Rr=[];for(let i=0;i<n;i++){const p=trail[i],q=trail[Math.min(n-1,i+1)],o=trail[Math.max(0,i-1)];let dx=q.x-o.x,dy=q.y-o.y;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;const w=(i/(n-1))*5.5*(1-(time-p.t)/.2);L.push([p.x-dy*w,p.y+dx*w]);Rr.push([p.x+dy*w,p.y-dx*w])}
      const path=()=>{g.beginPath();L.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));for(let i=Rr.length-1;i>=0;i--)g.lineTo(Rr[i][0],Rr[i][1]);g.closePath()};
      g.save();g.shadowColor='#8fdcff';g.shadowBlur=16;g.fillStyle='rgba(160,225,255,.55)';path();g.fill();g.shadowBlur=0;g.fillStyle='#ffffff';g.translate(0,0);path();g.fill();g.restore()}
    pops.forEach(q=>{q.l-=dt;q.y-=30*dt;g.globalAlpha=Math.max(0,Math.min(1,q.l*1.5));g.textAlign='center';g.lineWidth=5;g.strokeStyle='rgba(0,0,0,.6)';g.font='400 18px "Bungee",Impact,sans-serif';g.fillStyle=q.c;g.strokeText(q.t,q.x,q.y);g.fillText(q.t,q.x,q.y);g.font=FONT(15,700);g.fillStyle='#fff';g.strokeText(q.s,q.x,q.y+20);g.fillText(q.s,q.x,q.y+20)});g.globalAlpha=1;pops=pops.filter(q=>q.l>0);
    g.restore();
    g.textAlign='left';g.lineWidth=5;g.strokeStyle='rgba(0,0,0,.5)';g.fillStyle='#ffd84a';g.font='400 30px "Bungee",Impact,sans-serif';g.strokeText(sc,12,42);g.fillText(sc,12,42);
    for(let i=0;i<3;i++){const hit=i>=lives,bx=W-22-i*28,by=30;g.globalAlpha=hit?1:.4;g.drawImage(bombImg,bx-14,by-14,28,28);if(hit){g.strokeStyle='#ff3b3b';g.lineWidth=3;g.beginPath();g.moveTo(bx-8,by-8);g.lineTo(bx+8,by+8);g.moveTo(bx+8,by-8);g.lineTo(bx-8,by+8);g.stroke()}g.globalAlpha=1}
    if(flash>0){g.fillStyle=`rgba(255,255,255,${flash})`;g.fillRect(0,0,W,H)}
    if(time<1.2&&!sc){g.globalAlpha=1-time/1.2;g.fillStyle='#fff';g.font=FONT(16,700);g.textAlign='center';g.fillText('Swipe to slice',W/2,H/2);g.globalAlpha=1}});
});

