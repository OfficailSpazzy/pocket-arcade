
/* ================= ARCADE ================= */
const cls=(g,w,h)=>{g.fillStyle=C.bg;g.fillRect(0,0,w,h)};

reg('snake','Snake','Arcade','Swipe or use the arrow keys. Eat the pellets, grab the flashing bonus before it fades, and do not hit the walls or yourself.',ctx=>{
  const N=21,S=16,W=N*S,{cv,g}=ctx.canvas(W,W);
  const K={bg:'#061006',grid:'#0f2a12',edge:'#1f5a26',body:'#39d353',core:'#0c3d17',head:'#b6ff8a',food:'#ff4d4d',bonus:'#ffd84a',text:'#8dff7a'};
  const PIX=s=>`${s}px "Press Start 2P","Courier New",monospace`;
  const D={left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1},down:{x:0,y:1}};
  let sn=[{x:10,y:10},{x:9,y:10},{x:8,y:10}],d=D.right,q=[],food,bonus=null,sc=0,eaten=0,acc=0,state='ready',t=0,deadT=0;
  const lvl=()=>1+Math.floor(eaten/5);
  const free=()=>{let p;do{p={x:R(N),y:R(N)}}while(sn.some(s=>s.x===p.x&&s.y===p.y)||(food&&food.x===p.x&&food.y===p.y));return p};
  food=free();
  const hud=()=>ctx.info('Level '+lvl()+(bonus?'   Bonus '+Math.ceil(bonus.t):''));
  const turn=k=>{if(state==='dead')return;const nd=D[k];if(state==='ready'){if(nd||k==='tap'||k==='space'){state='play';if(nd&&nd.x!==-d.x)d=nd}return}
    if(!nd)return;const l=q.length?q[q.length-1]:d;if((nd.x!==-l.x||nd.y!==-l.y)&&(nd.x!==l.x||nd.y!==l.y)&&q.length<2)q.push(nd)};
  ctx.keys(turn);ctx.swipe(ctx.stage,turn);hud();
  const step=()=>{if(q.length)d=q.shift();const h={x:sn[0].x+d.x,y:sn[0].y+d.y};
    if(h.x<0||h.y<0||h.x>=N||h.y>=N||sn.slice(0,-1).some(s=>s.x===h.x&&s.y===h.y)){state='dead';deadT=.9;beep(220,.45,'sawtooth',.07,0,50);return}
    sn.unshift(h);
    if(h.x===food.x&&h.y===food.y){sc+=10;eaten++;ctx.score(sc);beep(660,.06);beep(990,.1,'square',.06,.06);if(sn.length<N*N-1)food=free();if(eaten%5===0&&!bonus){bonus=free();bonus.t=6}}
    else if(bonus&&h.x===bonus.x&&h.y===bonus.y){sc+=50;ctx.score(sc);bonus=null;[784,988,1175,1568].forEach((f,i)=>beep(f,.09,'square',.06,i*.07))}
    else sn.pop()};
  const block=(x,y,c,inner)=>{g.fillStyle=c;g.fillRect(x*S+1,y*S+1,S-2,S-2);if(inner){g.fillStyle=inner;g.fillRect(x*S+5,y*S+5,S-10,S-10)}};
  const draw=()=>{g.fillStyle=K.bg;g.fillRect(0,0,W,W);g.fillStyle=K.grid;for(let i=1;i<N;i++){g.fillRect(i*S,0,1,W);g.fillRect(0,i*S,W,1)}
    g.strokeStyle=K.edge;g.lineWidth=2;g.strokeRect(1,1,W-2,W-2);
    // pellet: a small pixel diamond that pulses
    const fx=food.x*S,fy=food.y*S,p=Math.floor(t*4)%2;g.fillStyle=K.food;g.fillRect(fx+6,fy+2+p,4,12-2*p);g.fillRect(fx+2+p,fy+6,12-2*p,4);g.fillRect(fx+4,fy+4,8,8);
    if(bonus&&(bonus.t>2||Math.floor(t*8)%2)){const bx=bonus.x*S,by=bonus.y*S;g.fillStyle=K.bonus;g.fillRect(bx+2,by+2,12,12);g.fillStyle=K.bg;g.fillRect(bx+6,by+6,4,4)}
    const show=state!=='dead'||Math.floor(deadT*8)%2;
    if(show)sn.forEach((s,i)=>{if(i){block(s.x,s.y,K.body,K.core)}else{block(s.x,s.y,K.head);g.fillStyle=K.bg;const ex=s.x*S,ey=s.y*S;
      if(d.x){const o=d.x>0?10:3;g.fillRect(ex+o,ey+3,3,3);g.fillRect(ex+o,ey+10,3,3)}else{const o=d.y>0?10:3;g.fillRect(ex+3,ey+o,3,3);g.fillRect(ex+10,ey+o,3,3)}}});
    // CRT scanlines
    g.fillStyle='rgba(0,0,0,.2)';for(let y=0;y<W;y+=3)g.fillRect(0,y,W,1);
    if(state==='ready'){g.fillStyle='rgba(6,16,6,.72)';g.fillRect(0,W/2-56,W,104);g.fillStyle=K.text;g.textAlign='center';g.font=PIX(22);g.fillText('SNAKE',W/2,W/2-18);
      if(Math.floor(t*2)%2){g.font=PIX(9);g.fillText('SWIPE OR PRESS AN ARROW',W/2,W/2+14)}g.font=PIX(8);g.fillStyle=K.body;g.fillText('PELLET 10   BONUS 50',W/2,W/2+36)}
    if(state==='dead'){g.fillStyle=K.food;g.textAlign='center';g.font=PIX(18);g.fillText('GAME OVER',W/2,W/2)}};
  ctx.loop(dt=>{t+=dt;
    if(state==='play'){acc+=dt;const iv=Math.max(.06,.17-(lvl()-1)*.012);if(acc>=iv){acc-=iv;step()}if(bonus){bonus.t-=dt;if(bonus.t<=0)bonus=null}hud()}
    else if(state==='dead'){deadT-=dt;if(deadT<=0){draw();return ctx.over('Game over')}}
    draw()});
});

reg('blocks','Block Drop','Arcade','Fill rows to clear them. The outline shows where the piece will land, and the side panel shows the next three. Arrow keys or the buttons: move, rotate, soft drop, hard drop.',ctx=>{
  const W=10,H=18,S=20,BW=W*S,BH=H*S,CW=BW+66,{cv,g}=ctx.canvas(CW,BH,90);
  const SH=['1111','11/11','010/111','100/111','001/111','110/011','011/110'].map(s=>s.split('/').map(r=>[...r].map(Number)));
  const rot=m=>m[0].map((_,i)=>m.map(r=>r[i]).reverse());
  let B=Array.from({length:H},()=>Array(W).fill(0)),p,sc=0,acc=0,lines=0,bag=[],queue=[],flash=0;
  const pull=()=>{if(!bag.length)bag=shuffle([0,1,2,3,4,5,6]);return bag.pop()};
  while(queue.length<3)queue.push(pull());
  const fits=(m,x,y)=>m.every((r,j)=>r.every((v,i)=>!v||(x+i>=0&&x+i<W&&y+j<H&&(y+j<0||!B[y+j][x+i]))));
  const hud=()=>ctx.info('Lines '+lines+'   Level '+(1+Math.floor(lines/10)));
  const spawn=()=>{const k=queue.shift();queue.push(pull());p={m:SH[k],c:k+1,x:0,y:0};p.x=(W-p.m[0].length)>>1;if(!fits(p.m,p.x,p.y)){beep(200,.5,'sawtooth',.07,0,45);ctx.over('Stacked out')}};
  const lock=()=>{p.m.forEach((r,j)=>r.forEach((v,i)=>{if(v&&p.y+j>=0)B[p.y+j][p.x+i]=p.c}));const keep=B.filter(r=>r.some(v=>!v));const n=H-keep.length;
    if(n){lines+=n;sc+=[0,100,300,500,800][n];ctx.score(sc);hud();flash=.18;B=[...Array.from({length:n},()=>Array(W).fill(0)),...keep];
      if(n===4)[523,659,784,1047,1319].forEach((f,i)=>beep(f,.1,'square',.06,i*.06));else for(let i=0;i<n;i++)beep(600+i*200,.09,'square',.06,i*.07)}
    else beep(140,.07,'triangle',.12);spawn()};
  const down=()=>{if(fits(p.m,p.x,p.y+1)){p.y++;return true}lock();return false};
  const ghostY=()=>{let y=p.y;while(fits(p.m,p.x,y+1))y++;return y};
  ctx.keys(k=>{if(k==='left'||k==='right'){const dx=k==='left'?-1:1;if(fits(p.m,p.x+dx,p.y)){p.x+=dx;beep(330,.025,'square',.03)}}
    else if(k==='up'){const m=rot(p.m);for(const o of[0,-1,1,-2,2])if(fits(m,p.x+o,p.y)){p.m=m;p.x+=o;beep(520,.04,'square',.04);break}}
    else if(k==='down'){down();acc=0}else if(k==='space'){let n=0;while(down())n++;sc+=n*2;ctx.score(sc);acc=0}});
  ctx.pad([['◀','left','Move left'],['⟳','up','Rotate'],['▶','right','Move right'],['▼','down','Soft drop'],['⤓','space','Hard drop']]);
  hud();spawn();
  const cell=(x,y,c)=>{g.fillStyle=PAL[c-1];g.fillRect(x*S+1,y*S+1,S-2,S-2);g.fillStyle='rgba(255,255,255,.22)';g.fillRect(x*S+1,y*S+1,S-2,3);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x*S+1,y*S+S-4,S-2,3)};
  ctx.loop(dt=>{acc+=dt;if(acc>Math.max(.08,.6-Math.floor(lines/10)*.055)){acc=0;down()}if(flash>0)flash-=dt;
    g.fillStyle=C.bg;g.fillRect(0,0,CW,BH);g.fillStyle='#1c1530';for(let i=1;i<W;i++)g.fillRect(i*S,0,1,BH);for(let j=1;j<H;j++)g.fillRect(0,j*S,BW,1);
    B.forEach((r,y)=>r.forEach((v,x)=>v&&cell(x,y,v)));
    if(!ctx.done){const gy=ghostY();g.strokeStyle=PAL[p.c-1];g.lineWidth=1.5;g.globalAlpha=.75;p.m.forEach((r,j)=>r.forEach((v,i)=>{if(v&&gy+j>=0)g.strokeRect((p.x+i)*S+2.5,(gy+j)*S+2.5,S-5,S-5)}));g.globalAlpha=1;
      p.m.forEach((r,j)=>r.forEach((v,i)=>v&&cell(p.x+i,p.y+j,p.c)))}
    if(flash>0){g.fillStyle=`rgba(255,255,255,${flash*2})`;g.fillRect(0,0,BW,BH)}
    // side panel: next three pieces
    g.fillStyle=C.panel;g.fillRect(BW,0,CW-BW,BH);g.fillStyle=C.line;g.fillRect(BW,0,2,BH);g.fillStyle=C.mut;g.font=FONT(12,700);g.textAlign='center';g.fillText('NEXT',BW+34,20);
    queue.forEach((k,n)=>{const m=SH[k],q=n?10:13,ox=BW+34-m[0].length*q/2,oy=40+n*62+(2-m.length)*q/2;g.globalAlpha=n?.7:1;m.forEach((r,j)=>r.forEach((v,i)=>{if(v){g.fillStyle=PAL[k];g.fillRect(ox+i*q,oy+j*q,q-1,q-1)}}));g.globalAlpha=1})});
});

reg('bricks','Brick Breaker','Arcade','Drag or use the arrow keys to move the paddle. Tap or press space to launch.',ctx=>{
  const W=320,H=420,{cv,g}=ctx.canvas(W,H),p=ctx.follow(cv,W/2);let bx,by,vx=0,vy=0,bricks,sc=0,lives=3,lvl=1,stuck=true;
  const mk=()=>{bricks=[];for(let r=0;r<5;r++)for(let c=0;c<8;c++)bricks.push({x:8+c*38,y:50+r*18,c:r})};mk();
  const launch=()=>{if(stuck){stuck=false;vx=(Math.random()-.5)*180;vy=-(230+lvl*20)}};
  p.tap=launch;ctx.keys(k=>{if(k==='space'||k==='up')launch()});ctx.info('Lives 3');
  ctx.loop(dt=>{if(ctx.held.left)p.x-=340*dt;if(ctx.held.right)p.x+=340*dt;p.x=clamp(p.x,32,W-32);
    if(stuck){bx=p.x;by=H-36}else{bx+=vx*dt;by+=vy*dt;
      if(bx<6){bx=6;vx=Math.abs(vx)}if(bx>W-6){bx=W-6;vx=-Math.abs(vx)}if(by<6){by=6;vy=Math.abs(vy)}
      if(vy>0&&by>H-34&&by<H-18&&Math.abs(bx-p.x)<38){vy=-Math.abs(vy);vx=(bx-p.x)*6.5}
      for(let i=0;i<bricks.length;i++){const b=bricks[i];if(bx>b.x-5&&bx<b.x+39&&by>b.y-5&&by<b.y+19){bricks.splice(i,1);vy=-vy;sc+=10;ctx.score(sc);break}}
      if(!bricks.length){lvl++;mk();stuck=true}
      if(by>H+10){lives--;ctx.info('Lives '+lives);if(!lives)return ctx.over('Out of balls');stuck=true}}
    cls(g,W,H);bricks.forEach(b=>{g.fillStyle=PAL[b.c];g.fillRect(b.x,b.y,34,14)});g.fillStyle=C.ink;g.fillRect(p.x-32,H-28,64,8);
    g.fillStyle=C.yel;g.beginPath();g.arc(bx,by,6,0,7);g.fill()});
});

reg('duel','Paddle Duel','Arcade','Drag or use the arrow keys. First to 7 points beats the computer.',ctx=>{
  const W=320,H=440,{cv,g}=ctx.canvas(W,H),p=ctx.follow(cv,W/2);let b,ps=0,as=0,ax=W/2,wait=.8;
  const serve=dir=>{b={x:W/2,y:H/2,vx:(Math.random()-.5)*220,vy:dir*240};wait=.8};serve(1);
  const show=()=>ctx.info('You '+ps+'  :  '+as+' Computer');show();
  ctx.loop(dt=>{if(ctx.held.left)p.x-=340*dt;if(ctx.held.right)p.x+=340*dt;p.x=clamp(p.x,32,W-32);
    if(wait>0)wait-=dt;else{ax+=clamp(b.x-ax,-175*dt,175*dt);ax=clamp(ax,32,W-32);b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.x<6){b.x=6;b.vx=Math.abs(b.vx)}if(b.x>W-6){b.x=W-6;b.vx=-Math.abs(b.vx)}
      if(b.vy>0&&b.y>H-32&&b.y<H-10&&Math.abs(b.x-p.x)<38){b.vy=-Math.min(520,Math.abs(b.vy)*1.05);b.vx=(b.x-p.x)*7}
      if(b.vy<0&&b.y<32&&b.y>10&&Math.abs(b.x-ax)<38){b.vy=Math.min(520,Math.abs(b.vy)*1.05);b.vx=(b.x-ax)*7}
      if(b.y>H+12){as++;show();if(as>=7)return ctx.over('Computer wins');serve(-1)}
      else if(b.y<-12){ps++;show();if(ps>=7)return ctx.over('You win');serve(1)}}
    cls(g,W,H);g.strokeStyle=C.line;g.setLineDash([6,8]);g.beginPath();g.moveTo(0,H/2);g.lineTo(W,H/2);g.stroke();g.setLineDash([]);
    g.fillStyle=C.red;g.fillRect(ax-32,18,64,8);g.fillStyle=C.teal;g.fillRect(p.x-32,H-26,64,8);g.fillStyle=C.ink;g.beginPath();g.arc(b.x,b.y,6,0,7);g.fill()});
},{ns:true});

reg('flap','Flap','Arcade','Tap or press space to flap. Fly through the gaps.',ctx=>{
  const W=320,H=440,{cv,g}=ctx.canvas(W,H);let y=H/2,vy=0,pipes=[],t=0,sc=0,go=false;
  const flap=()=>{go=true;vy=-320};ctx.on(cv,'pointerdown',e=>{e.preventDefault();flap()});ctx.keys(k=>{if(k==='space'||k==='up')flap()});
  ctx.loop(dt=>{if(go){vy+=1000*dt;y+=vy*dt;t-=dt;if(t<=0){t=1.5;pipes.push({x:W,g:60+R(H-260),p:false})}
      for(const p of pipes){p.x-=135*dt;if(!p.p&&p.x+44<70){p.p=true;ctx.score(++sc)}if(80>p.x&&60<p.x+44&&(y-10<p.g||y+10>p.g+135))return ctx.over('Bonk')}
      pipes=pipes.filter(p=>p.x>-50);if(y>H-10||y<-30)return ctx.over('Bonk')}
    cls(g,W,H);g.fillStyle=C.teal;pipes.forEach(p=>{g.fillRect(p.x,0,44,p.g);g.fillRect(p.x,p.g+135,44,H)});
    g.fillStyle=C.yel;g.beginPath();g.arc(70,y,10,0,7);g.fill();if(!go){g.fillStyle=C.mut;g.font=FONT(16);g.textAlign='center';g.fillText('Tap to start',W/2,H/2+50)}});
});

reg('defender','Star Defender','Arcade','Drag or use the arrow keys to steer. Your ship fires on its own. Stop the invaders reaching the ground.',ctx=>{
  const W=320,H=440,{cv,g}=ctx.canvas(W,H),p=ctx.follow(cv,W/2);let inv=[],bul=[],eb=[],dir=1,wave=0,sc=0,lives=3,ft=0,hitT=0;
  const mk=()=>{wave++;inv=[];for(let r=0;r<4;r++)for(let c=0;c<7;c++)inv.push({x:40+c*36,y:44+r*28,c:r});dir=1};mk();ctx.info('Lives 3');
  ctx.loop(dt=>{if(ctx.held.left)p.x-=320*dt;if(ctx.held.right)p.x+=320*dt;p.x=clamp(p.x,14,W-14);
    ft-=dt;if(ft<=0){ft=.34;bul.push({x:p.x,y:H-40})}hitT-=dt;
    const sp=(22+wave*7)*(1+(28-inv.length)*.04);let edge=false;inv.forEach(i=>{i.x+=dir*sp*dt;if(i.x<14||i.x>W-14)edge=true});
    if(edge){dir=-dir;inv.forEach(i=>{i.x+=dir*4;i.y+=12})}
    if(inv.length&&Math.random()<dt*(.5+wave*.2)){const s=inv[R(inv.length)];eb.push({x:s.x,y:s.y+8})}
    bul.forEach(b=>b.y-=420*dt);eb.forEach(b=>b.y+=190*dt);
    for(const b of bul)for(let i=0;i<inv.length;i++){const v=inv[i];if(Math.abs(b.x-v.x)<13&&Math.abs(b.y-v.y)<11){inv.splice(i,1);b.y=-99;sc+=10;ctx.score(sc);break}}
    for(const b of eb)if(hitT<=0&&Math.abs(b.x-p.x)<13&&Math.abs(b.y-(H-28))<10){b.y=H+99;lives--;hitT=1;ctx.info('Lives '+lives);if(!lives)return ctx.over('Ship lost')}
    if(inv.some(v=>v.y>H-56))return ctx.over('Invaded');
    bul=bul.filter(b=>b.y>-10);eb=eb.filter(b=>b.y<H+10);if(!inv.length)mk();
    cls(g,W,H);inv.forEach(v=>{g.fillStyle=PAL[v.c];g.fillRect(v.x-10,v.y-7,20,14);g.fillStyle=C.bg;g.fillRect(v.x-6,v.y-3,4,4);g.fillRect(v.x+2,v.y-3,4,4)});
    g.fillStyle=C.yel;bul.forEach(b=>g.fillRect(b.x-1.5,b.y-6,3,10));g.fillStyle=C.red;eb.forEach(b=>g.fillRect(b.x-2,b.y-5,4,10));
    if(hitT<=0||Math.floor(hitT*10)%2){g.fillStyle=C.ink;g.beginPath();g.moveTo(p.x,H-40);g.lineTo(p.x+13,H-18);g.lineTo(p.x-13,H-18);g.fill()}});
});

reg('dodge','Dodge','Arcade','Drag or use the arrow keys. Stay clear of the falling blocks for as long as you can.',ctx=>{
  const W=320,H=440,{cv,g}=ctx.canvas(W,H),p=ctx.follow(cv,W/2);let bl=[],t=0,time=0;
  ctx.loop(dt=>{if(ctx.held.left)p.x-=340*dt;if(ctx.held.right)p.x+=340*dt;p.x=clamp(p.x,12,W-12);time+=dt;ctx.score(Math.floor(time));
    t-=dt;if(t<=0){t=Math.max(.14,.55-time*.008);const w=18+R(34);bl.push({x:R(W-w),y:-30,w,v:150+time*4+R(80)})}
    for(const b of bl){b.y+=b.v*dt;if(b.y+22>H-36&&b.y<H-14&&p.x+10>b.x&&p.x-10<b.x+b.w)return ctx.over('Flattened')}
    bl=bl.filter(b=>b.y<H+30);cls(g,W,H);g.fillStyle=C.red;bl.forEach(b=>g.fillRect(b.x,b.y,b.w,22));g.fillStyle=C.teal;g.fillRect(p.x-11,H-36,22,22)});
},{sl:'Seconds'});

reg('runner','Runner','Arcade','Tap or press space to jump the obstacles. It keeps getting faster.',ctx=>{
  const W=400,H=200,GY=160,{cv,g}=ctx.canvas(W,H);let y=GY,vy=0,obs=[],t=1,dist=0;
  const jump=()=>{if(y>=GY){vy=-580}};ctx.on(cv,'pointerdown',e=>{e.preventDefault();jump()});ctx.keys(k=>{if(k==='space'||k==='up')jump()});
  ctx.loop(dt=>{const sp=230+dist*.02;dist+=sp*dt;ctx.score(Math.floor(dist/20));vy+=1900*dt;y+=vy*dt;if(y>GY){y=GY;vy=0}
    t-=dt;if(t<=0){t=.85+Math.random()*.9;obs.push({x:W+10,w:14+R(12),h:22+R(22)})}
    for(const o of obs){o.x-=sp*dt;if(60+9>o.x&&60-9<o.x+o.w&&y>GY-o.h)return ctx.over('Tripped')}
    obs=obs.filter(o=>o.x>-40);cls(g,W,H);g.fillStyle=C.line;g.fillRect(0,GY,W,2);g.fillStyle=C.red;obs.forEach(o=>g.fillRect(o.x,GY-o.h,o.w,o.h));
    g.fillStyle=C.yel;g.fillRect(49,y-24,22,24)});
});

reg('hop','Sky Hop','Arcade','You bounce on your own. Drag or use the arrow keys to land on the next platform.',ctx=>{
  const W=320,H=460,{cv,g}=ctx.canvas(W,H),p=ctx.follow(cv,W/2);let pl=[],x=W/2,y=H-60,vy=-470,sc=0,top;
  for(let yy=H-20;yy>-20;yy-=62)pl.push({x:yy===H-20?W/2-27:R(W-54),y:yy});top=pl[pl.length-1].y;
  ctx.loop(dt=>{if(ctx.held.left)p.x=x-90;if(ctx.held.right)p.x=x+90;x+=clamp(p.x-x,-330*dt,330*dt);x=clamp(x,10,W-10);
    const py=y;vy+=900*dt;y+=vy*dt;if(vy>0)for(const q of pl)if(py<=q.y&&y>=q.y&&x>q.x-8&&x<q.x+62){y=q.y;vy=-470;break}
    if(y<190){const s=190-y;y=190;sc+=s;ctx.score(Math.floor(sc/10));pl.forEach(q=>q.y+=s);top+=s;pl=pl.filter(q=>q.y<H+10);
      while(top>-10){top-=56+R(34);pl.push({x:R(W-54),y:top})}}
    if(y>H+30)return ctx.over('Fell');
    cls(g,W,H);g.fillStyle=C.teal;pl.forEach(q=>g.fillRect(q.x,q.y,54,8));g.fillStyle=C.pink;g.fillRect(x-10,y-20,20,20)});
});

reg('stack','Stack','Arcade','Tap or press space to drop each block. Whatever hangs over the edge gets cut off.',ctx=>{
  const W=320,H=440,BH=22,{cv,g}=ctx.canvas(W,H);let st=[{x:80,w:160}],c,mv=1,sc=0;
  const next=()=>{const t=st[st.length-1];mv=sc%2?-1:1;c={x:mv>0?-t.w*.5:W-t.w*.5,w:t.w}};next();
  const drop=()=>{if(ctx.paused)return;const t=st[st.length-1],l=Math.max(c.x,t.x),r=Math.min(c.x+c.w,t.x+t.w);if(r-l<3){c.fall=true;return ctx.over('Missed')}
    st.push({x:l,w:r-l});ctx.score(++sc);next()};
  ctx.on(cv,'pointerdown',e=>{e.preventDefault();drop()});ctx.keys(k=>{if(k==='space')drop()});
  ctx.loop(dt=>{c.x+=mv*(150+sc*7)*dt;if(c.x>W-c.w*.4)mv=-1;if(c.x<-c.w*.6)mv=1;
    cls(g,W,H);const off=Math.max(0,st.length-11);st.forEach((b,i)=>{if(i<off)return;g.fillStyle=PAL[i%7];g.fillRect(b.x,H-(i-off+1)*BH,b.w,BH-2)});
    g.fillStyle=C.ink;g.fillRect(c.x,H-(st.length-off+1)*BH,c.w,BH-2)});
});

reg('racer','Lane Racer','Arcade','Tap the left or right side, or use the arrow keys, to change lanes and avoid traffic.',ctx=>{
  const W=300,H=440,LX=[50,150,250],{cv,g}=ctx.canvas(W,H);let lane=1,px=150,cars=[],gap=0,sc=0,road=0;
  const go=d=>{lane=clamp(lane+d,0,2)};ctx.on(cv,'pointerdown',e=>{e.preventDefault();go(cv.pos(e).x<W/2?-1:1)});ctx.keys(k=>{if(k==='left')go(-1);if(k==='right')go(1)});
  ctx.loop(dt=>{const v=210+sc*5;road=(road+v*dt)%40;gap-=v*dt;if(gap<=0){gap=190;const a=R(3);cars.push({l:a,y:-50,n:true});if(Math.random()<.4){cars.push({l:(a+1+R(2))%3,y:-50})}}
    px+=clamp(LX[lane]-px,-700*dt,700*dt);
    for(const c of cars){c.y+=v*dt;if(c.y+44>H-90&&c.y<H-46&&Math.abs(LX[c.l]-px)<34)return ctx.over('Crash');if(c.n&&c.y>H){c.n=false;ctx.score(++sc)}}
    cars=cars.filter(c=>c.y<H+60);cls(g,W,H);g.fillStyle=C.line;for(let y=-40+road;y<H;y+=40){g.fillRect(98,y,4,20);g.fillRect(198,y,4,20)}
    g.fillStyle=C.red;cars.forEach(c=>g.fillRect(LX[c.l]-18,c.y,36,44));g.fillStyle=C.yel;g.fillRect(px-18,H-90,36,44);g.fillStyle=C.bg;g.fillRect(px-13,H-82,26,10)});
});

reg('catch','Fruit Catch','Arcade','Drag or use the arrow keys to catch the round fruit. Red squares end the game. Three drops and you are out.',ctx=>{
  const W=320,H=440,{cv,g}=ctx.canvas(W,H),p=ctx.follow(cv,W/2);let it=[],t=0,sc=0,miss=0;ctx.info('Dropped 0 / 3');
  ctx.loop(dt=>{if(ctx.held.left)p.x-=360*dt;if(ctx.held.right)p.x+=360*dt;p.x=clamp(p.x,34,W-34);
    t-=dt;if(t<=0){t=Math.max(.3,.8-sc*.01);it.push({x:16+R(W-32),y:-12,v:150+sc*3+R(60),bad:Math.random()<.22,c:R(3)})}
    for(const o of it){o.y+=o.v*dt;if(!o.hit&&o.y>H-44&&o.y<H-20&&Math.abs(o.x-p.x)<38){o.hit=true;if(o.bad)return ctx.over('Caught a bad one');ctx.score(++sc)}
      else if(!o.hit&&o.y>H+12){o.hit=true;if(!o.bad){miss++;ctx.info('Dropped '+miss+' / 3');if(miss>=3)return ctx.over('Too many drops')}}}
    it=it.filter(o=>!o.hit);cls(g,W,H);it.forEach(o=>{if(o.bad){g.fillStyle=C.red;g.fillRect(o.x-10,o.y-10,20,20)}else{g.fillStyle=[C.yel,C.teal,C.pink][o.c];g.beginPath();g.arc(o.x,o.y,10,0,7);g.fill()}});
    g.fillStyle=C.ink;g.fillRect(p.x-34,H-34,68,10);g.fillRect(p.x-34,H-44,6,12);g.fillRect(p.x+28,H-44,6,12)});
});
