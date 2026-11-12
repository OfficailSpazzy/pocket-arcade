
/* ================= two-player versions (play a friend) ================= */
const mpTurn=(ctx,mine,extra)=>ctx.info((mine?'YOUR TURN':"FRIEND'S TURN")+(extra?'   '+extra:''));
const mpEnd=(ctx,iWon,draw)=>ctx.over(draw?'Draw':iWon?'You win':'Friend wins',undefined,draw?'end':iWon?'win':'lose');

function mpTTT(ctx){const N2=mpWire(ctx),ME=N2.me;let turn=N2.first;const b=Array(9).fill(0),L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const cs=ctx.grid(3,9,330,10);boardBox(cs,'#120d1d',10);const sym=p=>p===0?1:-1,line=v=>L.find(l=>l.every(i=>b[i]===v));
  const draw=(hl,last)=>cs.forEach((c,i)=>{c.textContent=b[i]===1?'✕':b[i]===-1?'◯':'';c.style.color=b[i]===1?'#2fd6b5':'#ff5d7a';c.style.fontSize='clamp(40px,15vw,70px)';c.style.border='0';c.style.borderRadius='14px';
    c.style.background=hl&&hl.includes(i)?(b[i]===1?'#1d4a43':'#4a1d2a'):'#211a33';c.style.textShadow=b[i]?`0 0 16px ${b[i]===1?'#2fd6b5':'#ff5d7a'}`:'';if(i===last)anim(c,'pop')});
  const status=()=>mpTurn(ctx,turn===ME,'YOU ARE '+(ME===0?'X':'O'));
  const place=(i,p)=>{b[i]=sym(p);beep(p===ME?660:440,.07,'square',.045);draw(null,i);const l=line(sym(p));if(l){draw(l);return mpEnd(ctx,p===ME)}if(b.every(v=>v))return mpEnd(ctx,false,true);turn=1-p;status()};
  cs.forEach((c,i)=>{c.setAttribute('aria-label','Square '+(i+1));ctx.on(c,'click',()=>{if(ctx.paused||turn!==ME||b[i])return;N2.send('m',{i});place(i,ME)})});
  N2.on(m=>{if(m.t==='m'&&turn!==ME&&!b[m.i]&&!ctx.done)place(m.i,1-ME)});draw();status()}

function mpFour(ctx){const N2=mpWire(ctx),ME=N2.me;let turn=N2.first,busy=false;const W=7,H=6,b=Array(42).fill(0),lines=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)[[0,1],[1,0],[1,1],[1,-1]].forEach(([dr,dc])=>{const l=[];for(let k=0;k<4;k++){const y=r+dr*k,x=c+dc*k;if(y<0||y>=H||x<0||x>=W)return;l.push(y*W+x)}lines.push(l)});
  const low=c=>{for(let r=H-1;r>=0;r--)if(!b[r*W+c])return r*W+c;return -1},wl=p=>lines.find(l=>l.every(i=>b[i]===p)),v=p=>p===0?1:-1;
  const cs=ctx.grid(W,42,420,6);boardBox(cs,'linear-gradient(#2e5fd0,#1f46a8)',10);
  const draw=(drop,hl)=>cs.forEach((c,i)=>{c.style.borderRadius='50%';c.style.border='0';c.textContent='';c.style.background='#0e0a17';c.style.boxShadow='inset 0 4px 6px rgba(0,0,0,.6)';
    if(b[i]){const d=$('span','dot',c);d.style.width=d.style.height='86%';d.style.background=b[i]===1?'radial-gradient(circle at 35% 30%,#fff3b0,#ffd84a 45%,#c9940f)':'radial-gradient(circle at 35% 30%,#ffc0cc,#ff5d7a 45%,#c02a48)';
      if(hl&&hl.includes(i))d.style.boxShadow='0 0 0 3px #fff,0 0 14px #fff';if(i===drop){d.style.setProperty('--d',-(((i/W)|0)+1)*(c.offsetHeight+6)+'px');anim(d,'dropin')}}});
  const status=()=>mpTurn(ctx,turn===ME,'YOU ARE '+(ME===0?'YELLOW':'RED'));
  const drop=(col,p)=>{const j=low(col);if(j<0)return;b[j]=v(p);draw(j);ctx.after(300,()=>beep(110+((j/W)|0)*18,.1,'triangle',.14));busy=true;
    ctx.after(360,()=>{busy=false;const l=wl(v(p));if(l){draw(-1,l);return mpEnd(ctx,p===ME)}if(b.every(x=>x))return mpEnd(ctx,false,true);turn=1-p;status()})};
  cs.forEach((c,i)=>{c.setAttribute('aria-label','Column '+(i%W+1));ctx.on(c,'click',()=>{if(ctx.paused||busy||turn!==ME)return;const col=i%W;if(low(col)<0)return SFX.bad();N2.send('d',{c:col});drop(col,ME)})});
  N2.on(m=>{if(m.t==='d'&&!ctx.done){const go=()=>{if(turn!==ME)drop(m.c,1-ME)};busy?ctx.after(400,go):go()}});draw();status()}

function mpReversi(ctx){const N2=mpWire(ctx),ME=N2.me,MINE=ME===0?1:-1,N=8,b=Array(64).fill(0);b[27]=b[36]=-1;b[28]=b[35]=1;let cm=N2.first===0?1:-1,last=-1,flipped=new Set();
  const cs=ctx.grid(N,64,420,2);boardBox(cs,'#123d2b',6);
  const flips=(i,p)=>{if(b[i])return[];const x=i%N,y=(i/N)|0,out=[];for(let dy=-1;dy<2;dy++)for(let dx=-1;dx<2;dx++){if(!dx&&!dy)continue;const l=[];let a=x+dx,c=y+dy;while(a>=0&&c>=0&&a<N&&c<N&&b[c*N+a]===-p){l.push(c*N+a);a+=dx;c+=dy}if(l.length&&a>=0&&c>=0&&a<N&&c<N&&b[c*N+a]===p)out.push(...l)}return out};
  const moves=p=>{const o=[];for(let i=0;i<64;i++)if(flips(i,p).length)o.push(i);return o},count=p=>b.filter(v=>v===p).length;
  const draw=()=>{const mv=new Set(cm===MINE?moves(MINE):[]);cs.forEach((c,i)=>{c.textContent='';c.style.borderRadius='4px';c.style.border='0';c.style.background=(i+((i/N)|0))%2?'#2a7d58':'#2f8a61';
      if(b[i]){const d=$('span','dot',c);d.style.width=d.style.height='80%';d.style.background=b[i]===1?'radial-gradient(circle at 35% 30%,#fff3b0,#ffd84a 45%,#b8860b)':'radial-gradient(circle at 35% 30%,#ffc0cc,#ff5d7a 45%,#a82240)';d.style.boxShadow='0 2px 0 rgba(0,0,0,.4)'+(i===last?',0 0 0 2px #fff':'');if(flipped.has(i))anim(d,'flipx');if(i===last)anim(d,'pop')}
      else if(mv.has(i)){const d=$('span','dot',c);d.style.cssText='width:24%;height:24%;background:rgba(255,255,255,.45)'}});flipped=new Set();ctx.score(count(MINE));
    mpTurn(ctx,cm===MINE,'YOU '+count(MINE)+' : '+count(-MINE)+' FRIEND')};
  const doMove=(i,p)=>{const f=flips(i,p);if(!f.length)return;b[i]=p;f.forEach(k=>b[k]=p);last=i;flipped=new Set(f);beep(p===MINE?520:380,.06,'square',.045);f.forEach((_,k)=>noise(.03,.08,.05+k*.04,2600));
    const n=-p;if(moves(n).length)cm=n;else if(moves(p).length)cm=p;else{cm=0;draw();const a=count(MINE),o=count(-MINE);return mpEnd(ctx,a>o,a===o)}draw();if(cm===p&&n)ctx.info((n===MINE?'You have':'Your friend has')+' no move, so it passes.')};
  cs.forEach((c,i)=>{c.setAttribute('aria-label','Square '+(i+1));ctx.on(c,'click',()=>{if(ctx.paused||cm!==MINE)return;if(!flips(i,MINE).length){beep(150,.05,'triangle',.06);return}N2.send('r',{i});doMove(i,MINE)})});
  N2.on(m=>{if(m.t==='r'&&cm===-MINE&&!ctx.done)doMove(m.i,-MINE)});draw()}

function mpRPS(ctx){const N2=mpWire(ctx),NM=['Rock','Paper','Scissors'],EM=['✊','✋','✌️'],TO=3;let r=1,ws=0,ls=0,busy=false;const mine={},theirs={};
  const arena=$('div','row',ctx.stage);arena.style.cssText='gap:18px;align-items:center;padding:16px 10px;background:#211a33;border-radius:16px;max-width:360px;flex-wrap:nowrap';
  const side=lab=>{const d=$('div','',arena);d.style.cssText='display:flex;flex-direction:column;align-items:center;gap:4px;flex:1';const e=$('div','',d,'✊');e.style.cssText='font-size:clamp(54px,18vw,80px);line-height:1';$('span','note',d,lab);return e};
  const you=side('You');$('div','',arena,'vs').style.cssText='font:400 14px var(--body);color:#a297c0';const fr=side('Friend');fr.style.transform='scaleX(-1)';
  const out=$('p','big',ctx.stage,'Make a throw');const sub=$('p','note',ctx.stage,'First to '+TO+' wins. Ties replay.');const row=ctx.row();
  const tally=()=>ctx.info('YOU '+ws+' : '+ls+' FRIEND');
  const check=()=>{if(mine[r]==null||theirs[r]==null||busy)return;busy=true;const a=mine[r],b2=theirs[r];you.textContent=fr.textContent='✊';
    ['Rock','Paper','Scissors','Shoot!'].forEach((s,k)=>ctx.after(k*260,()=>{out.textContent=s;beep(k<3?440:880,.06,'square',.045);anim(you,'shake');anim(fr,'shake')}));
    ctx.after(1100,()=>{you.textContent=EM[a];fr.textContent=EM[b2];anim(you,'pop');anim(fr,'pop');
      if(a===b2){out.textContent='Tie';sub.textContent='You both threw '+NM[a].toLowerCase()+'.';beep(500,.1,'triangle',.06)}
      else if((a-b2+3)%3===1){ws++;out.textContent='You win the round';sub.textContent=NM[a]+' beats '+NM[b2].toLowerCase()+'.';SFX.ok()}
      else{ls++;out.textContent='Friend wins the round';sub.textContent=NM[b2]+' beats '+NM[a].toLowerCase()+'.';SFX.bad()}
      ctx.score(ws);tally();r++;busy=false;if(ws>=TO)return mpEnd(ctx,true);if(ls>=TO)return mpEnd(ctx,false);[...row.children].forEach(x=>x.disabled=false);if(theirs[r]!=null)sub.textContent+=' Your friend has already picked.'})};
  NM.forEach((n,i)=>{const b=ctx.btn(row,EM[i]+' '+n,()=>{if(busy||mine[r]!=null)return;mine[r]=i;N2.send('p',{r,i});[...row.children].forEach(x=>x.disabled=true);you.textContent=EM[i];out.textContent='Waiting for friend...';beep(600,.05,'square',.04);check()},'pri');b.style.fontSize='17px'});
  N2.on(m=>{if(m.t==='p'&&theirs[m.r]==null){theirs[m.r]=m.i;if(m.r===r&&mine[r]==null)sub.textContent='Your friend has picked!';check()}});tally()}

function mpDuel(ctx){const W=320,H=440,{cv,g}=ctx.canvas(W,H),p=ctx.follow(cv,W/2),N2=mpWire(ctx),HOST=N2.me===0,TO=7;
  let st={bx:W/2,by:H/2,hx:W/2,gx:W/2,hs:0,gs:0,wait:1.4,rally:0,hit:0,pt:0},vx=0,vy=0,remoteX=W/2,sendT=0,t=0,trail=[],shownBall={x:W/2,y:H/2},lastHit=0,lastPt=0,ended=false,lastWait=2;
  const ME_C='#2ee6b6',OP_C='#ff5d7a';const rr=(x,y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h)};
  const serve=dir=>{st.bx=W/2;st.by=H/2;vx=(Math.random()-.5)*220;vy=dir*240;st.wait=1.4;st.rally=0;trail.length=0};if(HOST)serve(N2.first===0?-1:1);
  N2.on(m=>{if(m.t==='x')remoteX=m.x;else if(m.t==='st'&&!HOST){st=m.s}else if(m.t==='end'&&!ended){ended=true;mpEnd(ctx,(m.w===0)===HOST)}});
  ctx.loop(dt=>{t+=dt;if(ctx.held.left)p.x-=340*dt;if(ctx.held.right)p.x+=340*dt;p.x=clamp(p.x,32,W-32);const myX=p.x;sendT-=dt;
    if(HOST){st.hx=myX;st.gx+=(remoteX-st.gx)*Math.min(1,dt*20);
      if(st.wait>0)st.wait-=dt;else if(!ended){st.bx+=vx*dt;st.by+=vy*dt;if(st.bx<6){st.bx=6;vx=Math.abs(vx)}if(st.bx>W-6){st.bx=W-6;vx=-Math.abs(vx)}
        if(vy>0&&st.by>H-32&&st.by<H-10&&Math.abs(st.bx-st.hx)<38){vy=-Math.min(520,Math.abs(vy)*1.05);vx=(st.bx-st.hx)*7;st.rally++;st.hit++}
        if(vy<0&&st.by<32&&st.by>10&&Math.abs(st.bx-st.gx)<38){vy=Math.min(520,Math.abs(vy)*1.05);vx=(st.bx-st.gx)*7;st.rally++;st.hit++}
        if(st.by>H+12){st.gs++;st.pt++;if(st.gs>=TO){ended=true;N2.send('end',{w:1});N2.send('st',{s:st});mpEnd(ctx,false)}else serve(1)}
        else if(st.by<-12){st.hs++;st.pt++;if(st.hs>=TO){ended=true;N2.send('end',{w:0});N2.send('st',{s:st});mpEnd(ctx,true)}else serve(-1)}}
      if(sendT<=0){sendT=.033;N2.send('st',{s:st})}}
    else if(sendT<=0){sendT=.033;N2.send('x',{x:myX})}
    // what this phone shows: you always play from the bottom
    const by=HOST?st.by:H-st.by,oppX=HOST?st.gx:st.hx,mine=HOST?st.hs:st.gs,theirs=HOST?st.gs:st.hs;
    shownBall.x+=(st.bx-shownBall.x)*Math.min(1,dt*(HOST?60:22));shownBall.y+=(by-shownBall.y)*Math.min(1,dt*(HOST?60:22));
    if(st.hit!==lastHit){lastHit=st.hit;beep(420+Math.min(st.rally,12)*20,.06,'square',.05)}if(st.pt!==lastPt){lastPt=st.pt;beep(330,.2,'sawtooth',.05,0,160)}
    if(st.wait>0&&Math.ceil(st.wait)!==lastWait){lastWait=Math.ceil(st.wait);beep(440,.05,'square',.04)}
    if(st.wait<=0)lastWait=2;trail.push({x:shownBall.x,y:shownBall.y});if(trail.length>9)trail.shift();
    const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#2a0f22');bg.addColorStop(.5,'#120c1f');bg.addColorStop(1,'#0b2321');g.fillStyle=bg;g.fillRect(0,0,W,H);
    g.strokeStyle='rgba(255,255,255,.18)';g.setLineDash([8,8]);g.beginPath();g.moveTo(0,H/2);g.lineTo(W,H/2);g.stroke();g.setLineDash([]);g.beginPath();g.arc(W/2,H/2,44,0,7);g.stroke();
    g.textAlign='center';g.textBaseline='middle';g.font='400 64px "Bungee",Impact,sans-serif';g.globalAlpha=.22;g.fillStyle=OP_C;g.fillText(theirs,W/2,H/2-70);g.fillStyle=ME_C;g.fillText(mine,W/2,H/2+74);g.globalAlpha=1;
    g.font='8px "Press Start 2P",monospace';g.globalAlpha=.7;g.fillStyle=OP_C;g.fillText('FRIEND',W/2,H/2-26);g.fillStyle=ME_C;g.fillText('YOU',W/2,H/2+28);g.globalAlpha=1;
    const pad=(x,y,c)=>{const pg=g.createLinearGradient(0,y,0,y+10);pg.addColorStop(0,'#fff');pg.addColorStop(.5,c);pg.addColorStop(1,c);g.shadowColor=c;g.shadowBlur=16;g.fillStyle=pg;rr(x-32,y,64,10,5);g.fill();g.shadowBlur=0};
    pad(oppX,16,OP_C);pad(myX,H-26,ME_C);
    trail.forEach((q,i)=>{g.globalAlpha=(i+1)/trail.length*.3;g.fillStyle='#fff';g.beginPath();g.arc(q.x,q.y,5*(i+1)/trail.length+1,0,7);g.fill()});g.globalAlpha=1;
    g.shadowColor='#fff';g.shadowBlur=14;g.fillStyle='#fff';g.beginPath();g.arc(shownBall.x,shownBall.y,6,0,7);g.fill();g.shadowBlur=0;
    if(st.wait>0&&!ctx.done){g.fillStyle='#f4eeff';g.font='400 34px "Bungee",Impact,sans-serif';g.fillText(Math.ceil(st.wait),W/2,H/2+(by>H/2?110:-110))}
    g.textBaseline='alphabetic';ctx.info('FIRST TO '+TO)})}

const MPF={ttt:mpTTT,four:mpFour,reversi:mpReversi,rps:mpRPS,duel:mpDuel};
GAMES.forEach(gm=>{const f=MPF[gm.id];if(f){const base=gm.fn;gm.fn=ctx=>ctx.mp?f(ctx):base(ctx)}});
