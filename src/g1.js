
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
  const W=320,H=420,{cv,g}=ctx.canvas(W,H),p=ctx.follow(cv,W/2);let bx,by,vx=0,vy=0,bricks,sc=0,lives=3,lvl=1,stuck=true,t=0,trail=[],parts=[];
  const ROW=['#ff5d7a','#ff9f43','#ffd84a','#2fd6b5','#5aa9ff'];
  const stars=Array.from({length:46},()=>({x:R(W),y:R(H),s:Math.random()*1.2+.4,p:Math.random()*6}));
  const rr=(x,y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h)};
  const mk=()=>{bricks=[];for(let r=0;r<5;r++)for(let c=0;c<8;c++)bricks.push({x:8+c*38,y:50+r*18,c:r})};mk();
  const launch=()=>{if(stuck){stuck=false;vx=(Math.random()-.5)*180;vy=-(230+lvl*20);beep(440,.09,'square',.05,0,880)}};
  p.tap=launch;ctx.keys(k=>{if(k==='space'||k==='up')launch()});
  const burst=b=>{for(let i=0;i<9;i++)parts.push({x:b.x+17,y:b.y+7,vx:(Math.random()-.5)*190,vy:(Math.random()-.7)*170,l:.5,c:ROW[b.c]})};
  ctx.loop(dt=>{t+=dt;if(ctx.held.left)p.x-=340*dt;if(ctx.held.right)p.x+=340*dt;p.x=clamp(p.x,32,W-32);
    if(stuck){bx=p.x;by=H-36;trail.length=0}else{bx+=vx*dt;by+=vy*dt;
      if(bx<6){bx=6;vx=Math.abs(vx);beep(260,.04,'triangle',.08)}if(bx>W-6){bx=W-6;vx=-Math.abs(vx);beep(260,.04,'triangle',.08)}if(by<6){by=6;vy=Math.abs(vy);beep(260,.04,'triangle',.08)}
      if(vy>0&&by>H-34&&by<H-18&&Math.abs(bx-p.x)<38){vy=-Math.abs(vy);vx=(bx-p.x)*6.5;beep(330,.06,'square',.05)}
      for(let i=0;i<bricks.length;i++){const b=bricks[i];if(bx>b.x-5&&bx<b.x+39&&by>b.y-5&&by<b.y+19){burst(b);beep(520+(4-b.c)*90,.07,'square',.05);bricks.splice(i,1);vy=-vy;sc+=10;ctx.score(sc);break}}
      if(!bricks.length){lvl++;mk();stuck=true;[523,659,784,1047].forEach((f,i)=>beep(f,.11,'square',.06,i*.09))}
      if(by>H+10){lives--;if(!lives){beep(220,.5,'sawtooth',.07,0,45);return ctx.over('Out of balls')}beep(300,.25,'sawtooth',.06,0,110);stuck=true}
      trail.push({x:bx,y:by});if(trail.length>10)trail.shift()}
    parts.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=420*dt;q.l-=dt});parts=parts.filter(q=>q.l>0);
    // backdrop
    const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1b1238');bg.addColorStop(1,'#0a0714');g.fillStyle=bg;g.fillRect(0,0,W,H);
    stars.forEach(s=>{g.globalAlpha=.25+.3*Math.sin(t*1.5+s.p)**2;g.fillStyle='#cfc4ff';g.fillRect(s.x,s.y,s.s,s.s)});g.globalAlpha=1;
    // header strip: level and remaining balls
    g.fillStyle='rgba(255,255,255,.05)';g.fillRect(0,0,W,32);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(0,32,W,1);
    g.fillStyle=C.mut;g.font=FONT(12,700);g.textAlign='left';g.textBaseline='middle';g.fillText('LEVEL '+lvl,12,17);
    for(let i=0;i<3;i++){g.beginPath();g.arc(W-16-i*18,16,5.5,0,7);if(i<lives){g.fillStyle='#fff3c4';g.shadowColor='#ffd84a';g.shadowBlur=8;g.fill();g.shadowBlur=0}else{g.strokeStyle='rgba(255,255,255,.2)';g.lineWidth=1.5;g.stroke()}}
    // bricks: glossy rounded tiles
    bricks.forEach(b=>{const c=ROW[b.c];g.shadowColor=c;g.shadowBlur=7;g.fillStyle=c;rr(b.x,b.y,34,14,4);g.fill();g.shadowBlur=0;
      g.fillStyle='rgba(255,255,255,.34)';rr(b.x+2,b.y+2,30,4,2);g.fill();g.fillStyle='rgba(0,0,0,.2)';rr(b.x,b.y+10,34,4,[0,0,4,4]);g.fill()});
    parts.forEach(q=>{g.globalAlpha=Math.max(0,q.l*2);g.fillStyle=q.c;g.fillRect(q.x-2,q.y-2,4,4)});g.globalAlpha=1;
    // paddle
    const pg=g.createLinearGradient(0,H-29,0,H-19);pg.addColorStop(0,'#ffffff');pg.addColorStop(.45,'#b9a8ff');pg.addColorStop(1,'#6a4dff');
    g.shadowColor='#8f78ff';g.shadowBlur=14;g.fillStyle=pg;rr(p.x-32,H-29,64,10,5);g.fill();g.shadowBlur=0;g.fillStyle='rgba(255,255,255,.6)';rr(p.x-26,H-27,52,2,1);g.fill();
    // ball with trail
    trail.forEach((q,i)=>{g.globalAlpha=(i+1)/trail.length*.3;g.fillStyle='#ffd84a';g.beginPath();g.arc(q.x,q.y,5*(i+1)/trail.length+1,0,7);g.fill()});g.globalAlpha=1;
    g.shadowColor='#ffd84a';g.shadowBlur=16;g.fillStyle='#fff7d6';g.beginPath();g.arc(bx,by,6,0,7);g.fill();g.shadowBlur=0;
    if(stuck&&Math.floor(t*2)%2){g.fillStyle=C.ink;g.font=FONT(14,700);g.textAlign='center';g.fillText('TAP TO LAUNCH',W/2,H/2+40)}
    g.textBaseline='alphabetic'});
});

reg('duel','Paddle Duel','Arcade','Drag or use the arrow keys. First to 7 points beats the computer.',ctx=>{
  const W=320,H=440,{cv,g}=ctx.canvas(W,H),p=ctx.follow(cv,W/2);let b,ps=0,as=0,ax=W/2,wait=1.2,t=0,trail=[],parts=[],rally=0,flash=null;
  const ME='#2fd6b5',AI='#ff5d7a';
  const rr=(x,y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h)};
  const serve=dir=>{b={x:W/2,y:H/2,vx:(Math.random()-.5)*220,vy:dir*240};wait=1.2;trail.length=0;rally=0};serve(1);
  const spark=(x,y,c,n)=>{for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*240,vy:(Math.random()-.5)*240,l:.45,c})};
  const point=mine=>{if(mine){ps++;beep(660,.08,'square',.05);beep(990,.14,'square',.05,.08)}else{as++;beep(330,.25,'sawtooth',.05,0,140)}
    flash={c:mine?ME:AI,t:.5};spark(b.x,clamp(b.y,0,H),mine?ME:AI,16);
    if(ps>=7){[523,659,784,1047].forEach((f,i)=>beep(f,.12,'square',.06,i*.1));return ctx.over('You win')}
    if(as>=7){beep(260,.6,'sawtooth',.07,0,50);return ctx.over('Computer wins')}serve(mine?-1:1)};
  ctx.loop(dt=>{t+=dt;if(ctx.held.left)p.x-=340*dt;if(ctx.held.right)p.x+=340*dt;p.x=clamp(p.x,32,W-32);
    if(wait>0){const before=Math.ceil(wait);wait-=dt;if(wait>0&&Math.ceil(wait)!==before)beep(440,.05,'square',.04);if(wait<=0)beep(880,.07,'square',.05)}
    else{ax+=clamp(b.x-ax,-175*dt,175*dt);ax=clamp(ax,32,W-32);b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.x<6){b.x=6;b.vx=Math.abs(b.vx);beep(240,.04,'triangle',.08)}if(b.x>W-6){b.x=W-6;b.vx=-Math.abs(b.vx);beep(240,.04,'triangle',.08)}
      if(b.vy>0&&b.y>H-32&&b.y<H-10&&Math.abs(b.x-p.x)<38){b.vy=-Math.min(520,Math.abs(b.vy)*1.05);b.vx=(b.x-p.x)*7;rally++;spark(b.x,H-30,ME,7);beep(420+Math.min(rally,12)*20,.06,'square',.05)}
      if(b.vy<0&&b.y<32&&b.y>10&&Math.abs(b.x-ax)<38){b.vy=Math.min(520,Math.abs(b.vy)*1.05);b.vx=(b.x-ax)*7;rally++;spark(b.x,30,AI,7);beep(360+Math.min(rally,12)*20,.06,'square',.05)}
      trail.push({x:b.x,y:b.y});if(trail.length>9)trail.shift();
      if(b.y>H+12)return point(false);if(b.y<-12)return point(true)}
    parts.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.l-=dt});parts=parts.filter(q=>q.l>0);if(flash){flash.t-=dt;if(flash.t<=0)flash=null}
    // table
    const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#2a0f22');bg.addColorStop(.5,'#120c1f');bg.addColorStop(1,'#0b2321');g.fillStyle=bg;g.fillRect(0,0,W,H);
    g.strokeStyle='rgba(255,255,255,.06)';g.lineWidth=1;for(let x=40;x<W;x+=40){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()}
    g.strokeStyle='rgba(255,255,255,.18)';g.setLineDash([8,8]);g.beginPath();g.moveTo(0,H/2);g.lineTo(W,H/2);g.stroke();g.setLineDash([]);
    g.beginPath();g.arc(W/2,H/2,44,0,7);g.stroke();
    if(flash){g.globalAlpha=flash.t*.35;g.fillStyle=flash.c;g.fillRect(0,0,W,H);g.globalAlpha=1}
    // big scores on the table
    g.textAlign='center';g.textBaseline='middle';g.font='400 64px "Bungee",Impact,sans-serif';
    g.fillStyle=AI;g.globalAlpha=.22;g.fillText(as,W/2,H/2-70);g.fillStyle=ME;g.fillText(ps,W/2,H/2+74);g.globalAlpha=1;
    g.font=FONT(11,700);g.fillStyle=AI;g.globalAlpha=.6;g.fillText('COMPUTER',W/2,H/2-26);g.fillStyle=ME;g.fillText('YOU',W/2,H/2+28);g.globalAlpha=1;
    if(rally>2){g.fillStyle=C.yel;g.font=FONT(12,700);g.textAlign='right';g.fillText('RALLY '+rally,W-10,H/2-10)}
    // paddles
    const pad=(x,y,c)=>{const pg=g.createLinearGradient(0,y,0,y+10);pg.addColorStop(0,'#fff');pg.addColorStop(.5,c);pg.addColorStop(1,c);g.shadowColor=c;g.shadowBlur=16;g.fillStyle=pg;rr(x-32,y,64,10,5);g.fill();g.shadowBlur=0};
    pad(ax,16,AI);pad(p.x,H-26,ME);
    parts.forEach(q=>{g.globalAlpha=Math.max(0,q.l*2);g.fillStyle=q.c;g.fillRect(q.x-2,q.y-2,4,4)});g.globalAlpha=1;
    // ball
    trail.forEach((q,i)=>{g.globalAlpha=(i+1)/trail.length*.3;g.fillStyle='#fff';g.beginPath();g.arc(q.x,q.y,5*(i+1)/trail.length+1,0,7);g.fill()});g.globalAlpha=1;
    g.shadowColor='#fff';g.shadowBlur=14;g.fillStyle='#fff';g.beginPath();g.arc(b.x,b.y,6,0,7);g.fill();g.shadowBlur=0;
    if(wait>0&&!ctx.done){g.fillStyle=C.ink;g.font='400 34px "Bungee",Impact,sans-serif';g.textAlign='center';g.fillText(Math.ceil(wait),W/2,H/2+(b.vy>0?-110:110))}
    g.textBaseline='alphabetic'});
},{ns:true});

reg('flap','Flap','Arcade','Tap or press space to flap. Fly the duck through the gaps between the trees.',ctx=>{
  const W=320,H=440,GR=H-34,GAP=135,TW=44,{cv,g}=ctx.canvas(W,H);let y=H/2,vy=0,pipes=[],t=0,sc=0,go=false,clock=0,wing=0,scroll=0,dead=0,feathers=[];
  const clouds=Array.from({length:4},(_,i)=>({x:i*95+R(40),y:30+R(90),s:.7+Math.random()*.6}));
  const quack=()=>{beep(520,.05,'sawtooth',.05,0,380);beep(440,.07,'sawtooth',.045,.05,300)};
  const flap=()=>{if(dead)return;go=true;vy=-320;wing=.18;quack()};
  ctx.on(cv,'pointerdown',e=>{e.preventDefault();flap()});ctx.keys(k=>{if(k==='space'||k==='up')flap()});
  const crash=()=>{if(dead)return;dead=1;beep(180,.35,'sawtooth',.07,0,50);for(let i=0;i<10;i++)feathers.push({x:70,y,vx:(Math.random()-.5)*160,vy:-Math.random()*160,r:Math.random()*6,l:1})};
  const leaves=(cx,cy,r,dark)=>{g.fillStyle=dark?'#1f6b3a':'#2e8b4a';[[-r*.55,0],[r*.55,0],[0,-r*.35],[0,r*.3]].forEach(([dx,dy])=>{g.beginPath();g.arc(cx+dx,cy+dy,r*.62,0,7);g.fill()});
    g.fillStyle='rgba(180,255,160,.18)';g.beginPath();g.arc(cx-r*.3,cy-r*.3,r*.3,0,7);g.fill()};
  const tree=(x,gy)=>{const cx=x+TW/2;
    // hanging tree from the canopy
    g.fillStyle='#6b4423';g.fillRect(cx-9,0,18,gy-18);g.fillStyle='#55361b';g.fillRect(cx+3,0,6,gy-18);leaves(cx,gy-14,24,true);
    // standing tree from the ground
    const by=gy+GAP;g.fillStyle='#7a4e2a';g.fillRect(cx-9,by+18,18,GR-by-18);g.fillStyle='#5e3b1f';g.fillRect(cx+3,by+18,6,GR-by-18);leaves(cx,by+16,24,false)};
  const duck=(x,yy)=>{g.save();g.translate(x,yy);g.rotate(clamp(vy/600,-.45,1.1));
    g.fillStyle='#f6c945';g.beginPath();g.ellipse(0,2,13,10,0,0,7);g.fill();g.beginPath();g.arc(9,-7,7.5,0,7);g.fill();
    g.fillStyle='#f39c2a';g.beginPath();g.moveTo(15,-8);g.lineTo(24,-5);g.lineTo(15,-3);g.fill();
    g.fillStyle='#1b1326';g.beginPath();g.arc(11,-9,1.8,0,7);g.fill();
    g.fillStyle='#e0ad2c';g.beginPath();g.ellipse(-3,wing>0?-4:4,8,4.5,wing>0?-.6:.3,0,7);g.fill();g.restore()};
  ctx.loop(dt=>{t+=dt;wing-=dt;
    if(go&&!dead){vy+=1000*dt;y+=vy*dt;clock-=dt;scroll+=135*dt;if(clock<=0){clock=1.5;pipes.push({x:W,g:60+R(GR-60-GAP-40),p:false})}
      for(const p of pipes){p.x-=135*dt;if(!p.p&&p.x+TW<70){p.p=true;ctx.score(++sc);beep(880,.06,'square',.05);beep(1320,.09,'square',.05,.06)}if(80>p.x&&60<p.x+TW&&(y-10<p.g||y+10>p.g+GAP))crash()}
      pipes=pipes.filter(p=>p.x>-60);if(y>GR-10||y<-30)crash()}
    else if(dead){vy+=1000*dt;y=Math.min(GR-10,y+vy*dt);dead+=dt;if(dead>1.6)return ctx.over('Bonk')}
    else y=H/2+Math.sin(t*3)*6;
    feathers.forEach(f=>{f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=260*dt;f.l-=dt*.8});feathers=feathers.filter(f=>f.l>0);
    // sky, sun, clouds, hills
    const sky=g.createLinearGradient(0,0,0,GR);sky.addColorStop(0,'#7fc8f8');sky.addColorStop(.7,'#c9ecff');sky.addColorStop(1,'#e8f7e4');g.fillStyle=sky;g.fillRect(0,0,W,H);
    g.fillStyle='rgba(255,236,150,.5)';g.beginPath();g.arc(256,70,34,0,7);g.fill();g.fillStyle='#fff2b0';g.beginPath();g.arc(256,70,24,0,7);g.fill();
    clouds.forEach(c=>{const cx=((c.x-scroll*.15*c.s)%(W+90)+W+90)%(W+90)-60;g.fillStyle='rgba(255,255,255,.9)';[[0,0,16],[18,-6,20],[38,0,15],[18,4,16]].forEach(([dx,dy,r])=>{g.beginPath();g.arc(cx+dx*c.s,c.y+dy*c.s,r*c.s,0,7);g.fill()})});
    const hill=(col,base,amp,per,sp)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,GR);for(let x=0;x<=W;x+=8)g.lineTo(x,base-amp*Math.sin((x+scroll*sp)/per)-amp*.5*Math.sin((x+scroll*sp)/(per*.43)));g.lineTo(W,GR);g.fill()};
    hill('#a6d9a0',GR-70,22,70,.25);hill('#7cc47f',GR-36,16,50,.5);
    pipes.forEach(p=>tree(p.x,p.g));
    // ground: grass and dirt
    g.fillStyle='#8b5a2b';g.fillRect(0,GR,W,H-GR);g.fillStyle='#4caf50';g.fillRect(0,GR,W,9);g.fillStyle='#3e9443';
    for(let x=-(scroll%16);x<W;x+=16){g.beginPath();g.moveTo(x,GR+9);g.lineTo(x+4,GR+2);g.lineTo(x+8,GR+9);g.fill()}
    g.fillStyle='rgba(0,0,0,.12)';for(let x=-(scroll%28);x<W;x+=28)g.fillRect(x,GR+18,10,3);
    feathers.forEach(f=>{g.globalAlpha=Math.max(0,f.l);g.fillStyle='#fff6d8';g.beginPath();g.ellipse(f.x,f.y,4,1.8,f.r+t*4,0,7);g.fill()});g.globalAlpha=1;
    duck(70,y);
    if(go){g.fillStyle='#fff';g.strokeStyle='rgba(20,40,20,.55)';g.lineWidth=5;g.font='400 38px "Bungee",Impact,sans-serif';g.textAlign='center';g.strokeText(sc,W/2,62);g.fillText(sc,W/2,62)}
    else{g.fillStyle='rgba(20,50,25,.75)';g.font=FONT(16,700);g.textAlign='center';g.fillText('Tap to start',W/2,H/2+56)}});
});

reg('defender','Star Defender','Arcade','Drag or use the arrow keys to steer. Your fighter fires on its own. Stop the invaders reaching the ground.',ctx=>{
  const W=320,H=440,SY=H-30,{cv,g}=ctx.canvas(W,H),p=ctx.follow(cv,W/2);let inv=[],bul=[],eb=[],dir=1,wave=0,sc=0,lives=3,ft=0,hitT=0,t=0,parts=[],bank=0,lastX=W/2,banner=0;
  const ROW=['#ff5d7a','#ff9f43','#b48cff','#2fd6b5'];
  const stars=Array.from({length:70},()=>({x:Math.random()*W,y:Math.random()*H,z:Math.random()}));
  const mk=()=>{wave++;inv=[];for(let r=0;r<4;r++)for(let c=0;c<7;c++)inv.push({x:40+c*36,y:44+r*28,c:r});dir=1;banner=1.6};mk();
  const boom=(x,y,c,n)=>{for(let i=0;i<n;i++){const a=Math.random()*7,s=40+Math.random()*170;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.6,c})}};
  const laser=()=>beep(1400,.07,'square',.025,0,500);
  const ship=(x,y)=>{g.save();g.translate(x,y);g.rotate(bank*.25);
    // engine glow
    const fl=6+Math.sin(t*40)*2;g.fillStyle='rgba(90,169,255,.55)';g.beginPath();g.ellipse(-5,11+fl/2,3,fl,0,0,7);g.ellipse(5,11+fl/2,3,fl,0,0,7);g.fill();
    // swept wings with cannon tips
    g.fillStyle='#8c97b0';g.beginPath();g.moveTo(-3,-2);g.lineTo(-18,8);g.lineTo(-18,12);g.lineTo(-3,8);g.closePath();g.moveTo(3,-2);g.lineTo(18,8);g.lineTo(18,12);g.lineTo(3,8);g.closePath();g.fill();
    g.fillStyle='#d64545';g.fillRect(-18,4,2,6);g.fillRect(16,4,2,6);g.fillStyle='#c9d2e6';g.fillRect(-19.5,-2,2,10);g.fillRect(17.5,-2,2,10);
    // fuselage
    const hull=g.createLinearGradient(-6,0,6,0);hull.addColorStop(0,'#aab4cc');hull.addColorStop(.5,'#f1f4fb');hull.addColorStop(1,'#8f9ab3');
    g.fillStyle=hull;g.beginPath();g.moveTo(0,-20);g.lineTo(5,-6);g.lineTo(6,10);g.lineTo(-6,10);g.lineTo(-5,-6);g.closePath();g.fill();
    g.fillStyle='#d64545';g.fillRect(-1,-12,2,10);
    g.fillStyle='#1d2a44';g.beginPath();g.ellipse(0,-4,2.6,4.5,0,0,7);g.fill();g.fillStyle='rgba(140,200,255,.7)';g.fillRect(-.8,-7,1.3,3);
    g.restore()};
  const alien=(v)=>{const c=ROW[v.c],wob=Math.sin(t*6+v.x*.1)*1.5;g.save();g.translate(v.x,v.y);g.shadowColor=c;g.shadowBlur=8;g.fillStyle=c;
    if(v.c===0){g.beginPath();g.ellipse(0,1,11,5,0,0,7);g.fill();g.fillStyle='#ffd1db';g.beginPath();g.ellipse(0,-3,5,4,0,Math.PI,0);g.fill()}
    else if(v.c===1){g.beginPath();g.moveTo(0,-7);g.lineTo(10,0);g.lineTo(0,7);g.lineTo(-10,0);g.closePath();g.fill();g.fillRect(-12,-2+wob,3,6);g.fillRect(9,-2-wob,3,6)}
    else if(v.c===2){g.beginPath();g.arc(0,0,7,0,7);g.fill();g.fillRect(-11,-1,22,3);g.fillRect(-2,5,1.5,4+wob);g.fillRect(1,5,1.5,4-wob)}
    else{g.beginPath();g.moveTo(-10,-5);g.lineTo(10,-5);g.lineTo(6,6);g.lineTo(-6,6);g.closePath();g.fill()}
    g.shadowBlur=0;g.fillStyle='#120c1f';g.fillRect(-4,-1,3,3);g.fillRect(1,-1,3,3);g.restore()};
  ctx.loop(dt=>{t+=dt;banner-=dt;if(ctx.held.left)p.x-=320*dt;if(ctx.held.right)p.x+=320*dt;p.x=clamp(p.x,20,W-20);
    bank=clamp(bank+((p.x-lastX)/Math.max(dt,.001)/400-bank)*Math.min(1,dt*10),-1,1);lastX=p.x;
    ft-=dt;if(ft<=0){ft=.34;bul.push({x:p.x-17,y:SY-6},{x:p.x+17,y:SY-6});laser()}hitT-=dt;
    const sp=(22+wave*7)*(1+(28-inv.length)*.04);let edge=false;inv.forEach(i=>{i.x+=dir*sp*dt;if(i.x<14||i.x>W-14)edge=true});
    if(edge){dir=-dir;inv.forEach(i=>{i.x+=dir*4;i.y+=12})}
    if(inv.length&&Math.random()<dt*(.5+wave*.2)){const s=inv[R(inv.length)];eb.push({x:s.x,y:s.y+8});beep(200,.08,'square',.025,0,120)}
    bul.forEach(b=>b.y-=420*dt);eb.forEach(b=>b.y+=190*dt);
    for(const b of bul)for(let i=0;i<inv.length;i++){const v=inv[i];if(Math.abs(b.x-v.x)<13&&Math.abs(b.y-v.y)<11){boom(v.x,v.y,ROW[v.c],12);inv.splice(i,1);b.y=-99;sc+=10;ctx.score(sc);beep(300,.12,'sawtooth',.045,0,60);break}}
    for(const b of eb)if(hitT<=0&&Math.abs(b.x-p.x)<14&&Math.abs(b.y-SY)<14){b.y=H+99;lives--;hitT=1.2;boom(p.x,SY,'#5aa9ff',20);beep(160,.4,'sawtooth',.07,0,40);if(!lives){boom(p.x,SY,'#ffd84a',30);return ctx.over('Fighter lost')}}
    if(inv.some(v=>v.y>H-56)){beep(140,.6,'sawtooth',.07,0,40);return ctx.over('Invaded')}
    bul=bul.filter(b=>b.y>-10);eb=eb.filter(b=>b.y<H+10);if(!inv.length){[523,659,784,1047,1319].forEach((f,i)=>beep(f,.1,'square',.05,i*.08));mk()}
    parts.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.96;q.vy*=.96;q.l-=dt});parts=parts.filter(q=>q.l>0);
    // deep space
    g.fillStyle='#05040c';g.fillRect(0,0,W,H);
    const neb=g.createRadialGradient(80,130,10,80,130,190);neb.addColorStop(0,'rgba(120,60,200,.35)');neb.addColorStop(1,'rgba(120,60,200,0)');g.fillStyle=neb;g.fillRect(0,0,W,H);
    const neb2=g.createRadialGradient(270,330,10,270,330,160);neb2.addColorStop(0,'rgba(40,140,200,.25)');neb2.addColorStop(1,'rgba(40,140,200,0)');g.fillStyle=neb2;g.fillRect(0,0,W,H);
    stars.forEach(s=>{s.y+=(20+s.z*90)*dt;if(s.y>H){s.y=0;s.x=Math.random()*W}g.fillStyle=`rgba(230,235,255,${.3+s.z*.7})`;g.fillRect(s.x,s.y,s.z>.8?2:1,s.z>.8?3:1)});
    // planet horizon
    g.fillStyle='rgba(47,214,181,.08)';g.beginPath();g.ellipse(W/2,H+250,330,270,0,0,7);g.fill();g.strokeStyle='rgba(47,214,181,.35)';g.lineWidth=1.5;g.stroke();
    inv.forEach(alien);
    // player lasers: red bolts with glow
    g.shadowColor='#ff3b3b';g.shadowBlur=10;g.fillStyle='#ffd0d0';bul.forEach(b=>g.fillRect(b.x-1,b.y-9,2,12));g.shadowBlur=0;
    g.fillStyle='rgba(255,59,59,.6)';bul.forEach(b=>g.fillRect(b.x-2,b.y-10,4,14));
    // enemy shots: green plasma
    g.shadowColor='#7dff6b';g.shadowBlur=10;g.fillStyle='#c8ffb8';eb.forEach(b=>{g.beginPath();g.ellipse(b.x,b.y,2.5,5,0,0,7);g.fill()});g.shadowBlur=0;
    parts.forEach(q=>{g.globalAlpha=Math.max(0,q.l*1.6);g.fillStyle=q.c;g.fillRect(q.x-1.5,q.y-1.5,3,3)});g.globalAlpha=1;
    if(hitT<=0||Math.floor(hitT*12)%2){ship(p.x,SY)}
    if(hitT>.9){g.strokeStyle='rgba(90,169,255,.7)';g.lineWidth=2;g.beginPath();g.arc(p.x,SY-2,24+(1.2-hitT)*30,0,7);g.stroke()}
    // HUD: wave and remaining fighters
    g.fillStyle=C.mut;g.font=FONT(11,700);g.textAlign='left';g.fillText('WAVE '+wave,10,18);
    {const bk=bank;bank=0;for(let i=0;i<lives;i++){g.save();g.translate(W-16-i*22,15);g.scale(.5,.5);ship(0,0);g.restore()}bank=bk}
    if(banner>0){g.globalAlpha=Math.min(1,banner);g.fillStyle=C.ink;g.font='400 26px "Bungee",Impact,sans-serif';g.textAlign='center';g.fillText('WAVE '+wave,W/2,H/2+40);g.globalAlpha=1}});
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
