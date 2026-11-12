
/* ================= PUZZLE ================= */
const boardBox=(cs,bg,pad)=>{const p=cs[0].parentNode;p.style.background=bg;p.style.padding=(pad||8)+'px';p.style.borderRadius='14px';return p};

reg('2048','2048','Puzzle','Swipe or use the arrow keys. Matching tiles slide together and merge. Reach 2048 and keep going.',ctx=>{
  const COL={2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e'};
  const bd=$('div','b48',ctx.stage);for(let i=0;i<16;i++){const c=$('div','bg',bd);c.style.setProperty('--c',i%4);c.style.setProperty('--r',i>>2)}
  let grid=Array.from({length:4},()=>Array(4).fill(null)),sc=0,won=false,pending=null;
  const paint=t=>{const v=t.v;t.in.textContent=v;t.in.style.background=COL[v]||'#3c3a32';t.in.style.color=v>4?'#fff':'#776e65';t.in.style.fontSize=v>999?'clamp(11px,3.6vw,17px)':v>99?'clamp(14px,4.6vw,22px)':'clamp(18px,6vw,28px)';t.in.style.boxShadow=v>=128?`0 0 ${Math.log2(v)*2}px ${COL[v]||'#edc22e'}`:''};
  const place=(t,r,c)=>{t.r=r;t.c=c;t.el.style.setProperty('--r',r);t.el.style.setProperty('--c',c)};
  const spawn=()=>{const e=[];for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(!grid[r][c])e.push([r,c]);if(!e.length)return;const [r,c]=e[R(e.length)];
    const t={v:Math.random()<.9?2:4};t.el=$('div','tl',bd);t.in=$('div','tv',t.el);place(t,r,c);paint(t);anim(t.in,'appear');grid[r][c]=t};
  const can=()=>{for(let r=0;r<4;r++)for(let c=0;c<4;c++){const t=grid[r][c];if(!t)return true;if(c<3&&grid[r][c+1]&&grid[r][c+1].v===t.v)return true;if(r<3&&grid[r+1][c]&&grid[r+1][c].v===t.v)return true}return false};
  const flush=()=>{if(pending){const f=pending;pending=null;f()}};
  const move=d=>{if(!['left','right','up','down'].includes(d)||ctx.paused)return;flush();let moved=false,gain=0,top=0;const dying=[],merged=[];
    for(let i=0;i<4;i++){const cells=[0,1,2,3].map(j=>d==='left'?[i,j]:d==='right'?[i,3-j]:d==='up'?[j,i]:[3-j,i]);const ts=cells.map(([r,c])=>grid[r][c]).filter(Boolean);cells.forEach(([r,c])=>grid[r][c]=null);
      let k=0,last=null;for(const t of ts){if(last&&!last.m&&last.v===t.v){last.m=true;gain+=last.v*2;top=Math.max(top,last.v*2);place(t,last.r,last.c);dying.push(t);merged.push(last);moved=true}
        else{const [r,c]=cells[k++];if(t.r!==r||t.c!==c)moved=true;place(t,r,c);grid[r][c]=t;last=t}}}
    if(!moved)return;sc+=gain;ctx.score(sc);dying.forEach(t=>t.el.classList.add('dying'));
    if(gain){const l=Math.log2(top);beep(260+l*55,.07,'square',.045,.08,400+l*70)}else noise(.06,.07,0,1400);
    pending=()=>{dying.forEach(t=>t.el.remove());merged.forEach(t=>{t.v*=2;t.m=false;paint(t);anim(t.in,'bump')});spawn();
      if(!won&&grid.flat().some(t=>t&&t.v===2048)){won=true;SFX.win();confetti();ctx.info('2048! Keep going for a higher score.')}
      if(!can())ctx.over('No moves left',undefined,'end')};
    ctx.after(125,()=>flush())};
  ctx.keys(move);ctx.swipe(ctx.stage,move);spawn();spawn();
});

reg('mines','Minesweeper','Puzzle','Tap to reveal. Numbers count the mines touching a square. Long-press, right-click or switch on Flag to mark a mine. Clear every safe square.',ctx=>{
  const N=9,M=10;let mine=null,open=Array(81).fill(false),flag=Array(81).fill(false),fm=false,left=81-M,t=0,started=false,boomAt=-1;
  const cs=ctx.grid(N,81,400,3);boardBox(cs,'#1a1428',6);const r=ctx.row();const fb=ctx.btn(r,'⚑ Flag: off',()=>{fm=!fm;fb.textContent='⚑ Flag: '+(fm?'on':'off');fb.classList.toggle('on',fm);SFX.tap()});
  const nb=i=>{const x=i%N,y=(i/N)|0,o=[];for(let dy=-1;dy<2;dy++)for(let dx=-1;dx<2;dx++){const a=x+dx,c=y+dy;if((dx||dy)&&a>=0&&c>=0&&a<N&&c<N)o.push(c*N+a)}return o};
  const cnt=i=>nb(i).filter(j=>mine[j]).length;const NC=[,'#5aa9ff','#2fd6b5','#ff5d7a','#b48cff','#ff9f43','#ff7ac6','#ffd84a','#f4eeff'];
  const info=()=>ctx.info('Mines left '+(M-flag.filter(Boolean).length));
  const draw=()=>cs.forEach((c,i)=>{c.style.borderRadius='5px';c.style.border='0';if(open[i]){c.style.background=i===boomAt?'#ff5d5d':'#191326';c.style.boxShadow='inset 0 0 0 1px #261d3b';const n=mine[i]?'✹':cnt(i);c.textContent=n||'';c.style.color=mine[i]?(i===boomAt?'#1b0a0a':'#ff5d5d'):NC[n]||''}
    else{c.style.background='linear-gradient(#54458a,#3d3166)';c.style.boxShadow='inset 0 2px 0 rgba(255,255,255,.18),inset 0 -2px 0 rgba(0,0,0,.25)';c.textContent=flag[i]?'⚑':'';c.style.color='#ffd84a'}});
  const reveal=i=>{if(open[i]||flag[i])return 0;open[i]=true;left--;let n=1;if(!cnt(i))nb(i).forEach(j=>n+=reveal(j));return n};
  const toggle=i=>{if(open[i])return;flag[i]=!flag[i];beep(flag[i]?880:500,.05,'square',.04);anim(cs[i],'pop');info();draw()};
  const tap=i=>{if(ctx.paused||open[i])return;if(fm)return toggle(i);if(flag[i])return;
    if(!mine){const ban=new Set([i,...nb(i)]);mine=Array(81).fill(false);let k=0;while(k<M){const j=R(81);if(!mine[j]&&!ban.has(j)){mine[j]=true;k++}}started=true}
    if(mine[i]){boomAt=i;mine.forEach((m,j)=>{if(m)open[j]=true});draw();anim(cs[0].parentNode,'shake');SFX.boom();return ctx.over('Boom',null)}
    const n=reveal(i);draw();if(n>1){noise(.12,.12,0,1800);beep(520,.06,'square',.03)}else SFX.tap();if(left===0)ctx.over('Field cleared',t,'win')};
  cs.forEach((c,i)=>{let lp=null,long=false;c.setAttribute('aria-label','Square '+(i+1));
    ctx.on(c,'contextmenu',e=>{e.preventDefault()});
    ctx.on(c,'pointerdown',e=>{long=false;clearTimeout(lp);if(e.button===2){if(!ctx.paused)toggle(i);long=true;return}lp=setTimeout(()=>{if(!ctx.dead&&!ctx.paused&&!open[i]){long=true;toggle(i);try{navigator.vibrate&&navigator.vibrate(20)}catch(x){}}},420)});
    const cancel=()=>clearTimeout(lp);ctx.on(c,'pointerup',cancel);ctx.on(c,'pointerleave',cancel);ctx.on(c,'pointercancel',cancel);
    ctx.on(c,'click',()=>{if(long){long=false;return}tap(i)})});
  ctx.every(1000,()=>{if(started)ctx.score(++t)});info();draw();
},{low:true,sl:'Seconds'});

reg('sudoku','Sudoku','Puzzle','Tap a square, then a number. Fill every row, column and 3x3 box with 1 to 9. Clashes show in red.',ctx=>{
  const sh3=()=>shuffle([0,1,2]),ord=()=>{const o=[];for(const b of sh3())for(const r of sh3())o.push(b*3+r);return o};
  const rows=ord(),cols=ord(),dig=shuffle([1,2,3,4,5,6,7,8,9]),v=[],fix=[];let sel=-1,t=0;
  for(let r=0;r<9;r++)for(let c=0;c<9;c++)v.push(dig[(3*(rows[r]%3)+((rows[r]/3)|0)+cols[c])%9]);
  shuffle([...Array(81).keys()]).slice(0,42).forEach(i=>v[i]=0);v.forEach((x,i)=>fix[i]=!!x);
  const cs=ctx.grid(9,81,430,2);boardBox(cs,'#0e0a17',6);
  cs.forEach((c,i)=>{c.style.borderRadius='3px';c.style.border='0';if(i%9%3===2&&i%9<8)c.style.marginRight='4px';if(((i/9)|0)%3===2&&i<72)c.style.marginBottom='4px';ctx.on(c,'click',()=>{if(ctx.paused)return;sel=i;SFX.tick();draw()})});
  const box=i=>((i/27)|0)*3+((i%9)/3|0);
  const clash=i=>{const r=(i/9)|0,c=i%9;for(let j=0;j<81;j++){if(j===i||v[j]!==v[i])continue;if((j/9|0)===r||j%9===c||box(j)===box(i))return true}return false};
  const pad=$('div','g',ctx.stage);pad.style.gridTemplateColumns='repeat(5,1fr)';pad.style.maxWidth='340px';const pb=[];
  const draw=()=>{let ok=true;const sv=sel>=0?v[sel]:0;cs.forEach((c,i)=>{c.textContent=v[i]||'';const bad=v[i]&&clash(i);if(bad||!v[i])ok=false;
      const rel=sel>=0&&((i/9|0)===(sel/9|0)||i%9===sel%9||box(i)===box(sel));c.style.background=i===sel?'#5a4a9a':sv&&v[i]===sv?'#3d3166':rel?'#2a2242':'#1d1730';
      c.style.color=bad?'#ff5d7a':fix[i]?'#a297c0':'#ffd84a';c.style.fontWeight=fix[i]?'600':'800'});
    const cnt=Array(10).fill(0);v.forEach(x=>cnt[x]++);pb.forEach((b,n)=>{if(n<9){b.disabled=cnt[n+1]>=9;b.dataset.left=9-cnt[n+1]}});
    if(ok)ctx.over('Solved',t,'win')};
  const put=n=>{if(sel<0||fix[sel])return SFX.bad();v[sel]=n;draw();if(n&&clash(sel)){SFX.bad();anim(cs[sel],'shake')}else if(n){beep(500+n*40,.05,'square',.04);anim(cs[sel],'pop')}else beep(260,.05,'triangle',.06)};
  for(let n=1;n<=10;n++){const b=$('button','btn',pad,n===10?'⌫':String(n));b.style.fontSize='20px';if(n===10)b.setAttribute('aria-label','Erase');pb.push(b);ctx.on(b,'click',()=>{if(!ctx.paused)put(n%10)})}
  ctx.keys(k=>{if(/^[1-9]$/.test(k))put(+k);else if(k==='back'||k==='0')put(0);else if(sel>=0&&['left','right','up','down'].includes(k)){const d={left:-1,right:1,up:-9,down:9}[k];sel=clamp(sel+d,0,80);draw()}});
  ctx.every(1000,()=>ctx.score(++t));draw();
},{low:true,sl:'Seconds'});

reg('lights','Lights Out','Puzzle','Tapping a light flips it and its four neighbours. Turn every light off in as few moves as you can.',ctx=>{
  const N=5,b=Array(25).fill(false);let mv=0;const cs=ctx.grid(N,25,360,10);boardBox(cs,'#120d1d',12);
  const flip=i=>{const x=i%N,y=(i/N)|0;[[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const a=x+dx,c=y+dy;if(a>=0&&c>=0&&a<N&&c<N)b[c*N+a]=!b[c*N+a]})};
  const draw=()=>{cs.forEach((c,i)=>{c.style.borderRadius='50%';c.style.border='0';c.style.transition='background .15s,box-shadow .15s';
    c.style.background=b[i]?'radial-gradient(circle at 40% 35%,#fffbe0,#ffd84a 45%,#d4920f)':'radial-gradient(circle at 40% 35%,#3a3152,#1d1730 70%)';c.style.boxShadow=b[i]?'0 0 22px rgba(255,216,74,.65)':'inset 0 2px 4px rgba(0,0,0,.6)'});ctx.info('Lights on '+b.filter(Boolean).length)};
  do{for(let k=0;k<10;k++)flip(R(25))}while(!b.some(x=>x));
  cs.forEach((c,i)=>{c.setAttribute('aria-label','Light '+(i+1));ctx.on(c,'click',()=>{if(ctx.paused)return;flip(i);ctx.score(++mv);beep(b[i]?620:420,.05,'square',.04);anim(c,'pop');draw();if(!b.some(x=>x))ctx.over('All dark',undefined,'win')})});draw();
},{low:true,sl:'Moves'});

reg('slide','Slide 15','Puzzle','Tap a tile next to the gap to slide it. Put the numbers in order, 1 to 15, with the gap last.',ctx=>{
  const b=[...Array(15).keys()].map(i=>i+1).concat(0);let mv=0;const cs=ctx.grid(4,16,360,6);boardBox(cs,'#4a2e1a',10);
  const adj=i=>{const x=i%4,y=(i/4)|0,o=[];if(x>0)o.push(i-1);if(x<3)o.push(i+1);if(y>0)o.push(i-4);if(y<3)o.push(i+4);return o};
  let e=15,last=-1;for(let k=0;k<200;k++){const o=adj(e).filter(j=>j!==last);const j=o[R(o.length)];b[e]=b[j];b[j]=0;last=e;e=j}
  const draw=mvd=>cs.forEach((c,i)=>{c.textContent=b[i]||'';c.style.border='0';c.style.borderRadius='10px';c.style.fontSize='clamp(20px,7vw,32px)';
    if(!b[i]){c.style.background='rgba(0,0,0,.35)';c.style.boxShadow='inset 0 3px 8px rgba(0,0,0,.5)';return}
    const ok=b[i]===i+1;c.style.background=ok?'linear-gradient(#d8efc4,#9fcf84)':'linear-gradient(#f0cf9c,#c99558)';c.style.color='#3b2410';c.style.boxShadow='inset 0 2px 0 rgba(255,255,255,.4),0 3px 0 rgba(0,0,0,.35)';if(i===mvd)anim(c,'pop')});
  cs.forEach((c,i)=>ctx.on(c,'click',()=>{if(ctx.paused)return;const z=b.indexOf(0);if(!adj(i).includes(z)){if(b[i])anim(c,'shake');return}b[z]=b[i];b[i]=0;ctx.score(++mv);noise(.07,.12,0,700);beep(180,.05,'triangle',.06);draw(z);
    ctx.info('In place '+b.filter((v,k)=>v===k+1).length+' / 15');if(b.every((v,k)=>v===(k+1)%16))ctx.over('In order',undefined,'win')}));draw();ctx.info('In place '+b.filter((v,k)=>v===k+1).length+' / 15');
},{low:true,sl:'Moves'});

reg('flood','Flood','Puzzle','Start from the top-left corner. Pick a colour to flood into matching neighbours. Fill the whole board in 22 moves.',ctx=>{
  const N=12,S=25,MAX=22,{cv,g}=ctx.canvas(300,300,120);const b=Array.from({length:N*N},()=>R(6));let mv=0,mine=new Set([0]);
  const region=()=>{const c=b[0],seen=new Set([0]),st=[0];while(st.length){const i=st.pop(),x=i%N,y=(i/N)|0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const a=x+dx,d=y+dy,j=d*N+a;if(a>=0&&d>=0&&a<N&&d<N&&!seen.has(j)&&b[j]===c){seen.add(j);st.push(j)}})}return seen};
  const draw=()=>{g.fillStyle='#0e0a17';g.fillRect(0,0,300,300);mine=region();b.forEach((c,i)=>{const x=(i%N)*S,y=((i/N)|0)*S;g.fillStyle=PAL[c];rrect(g,x+1,y+1,S-2,S-2,mine.has(i)?3:6);g.fill();if(mine.has(i)){g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x+1,y+1,S-2,3)}});
    ctx.info('Moves '+mv+' / '+MAX+'   Filled '+Math.round(mine.size/(N*N)*100)+'%')};
  const fill=c=>{const o=b[0];if(o===c||ctx.paused)return;mine.forEach(i=>b[i]=c);ctx.score(++mv);draw();const k=mine.size/(N*N);beep(240+k*700,.08,'square',.045,0,320+k*800);
    if(b.every(v=>v===c))ctx.over('Flooded',undefined,'win');else if(mv>=MAX)ctx.over('Out of moves',null,'lose')};
  const r=ctx.row();for(let c=0;c<6;c++){const k=ctx.btn(r,'',()=>fill(c));k.style.cssText+=`;background:${PAL[c]};border-color:${PAL[c]};width:46px;height:46px;border-radius:50%;box-shadow:inset 0 3px 0 rgba(255,255,255,.3)`;k.setAttribute('aria-label','Colour '+(c+1))}draw();
},{low:true,sl:'Moves'});

reg('hanoi','Tower Stack','Puzzle','Move all five rings to the right-hand peg. Tap a peg to lift its top ring, tap another to drop it. A bigger ring can never sit on a smaller one.',ctx=>{
  const N=5,pg=[[5,4,3,2,1],[],[]];let sel=-1,mv=0;const r=ctx.row();r.style.flexWrap='nowrap';r.style.maxWidth='460px';r.style.alignItems='stretch';r.style.gap='6px';
  const RC=['#ff5d7a','#ff9f43','#ffd84a','#2fd6b5','#5aa9ff'];
  const bs=[0,1,2].map(i=>{const b=$('button','btn',r);b.style.cssText='flex:1;min-width:0;height:210px;display:flex;flex-direction:column-reverse;align-items:center;gap:3px;padding:8px 4px 14px;position:relative;background:linear-gradient(#2b2242,#1d1730)';b.setAttribute('aria-label','Peg '+(i+1));
    ctx.on(b,'click',()=>{if(ctx.paused)return;if(sel<0){if(pg[i].length){sel=i;beep(520,.06,'square',.04,0,780)}}else{if(i!==sel){const d=pg[sel][pg[sel].length-1],t=pg[i][pg[i].length-1];if(!t||t>d){pg[i].push(pg[sel].pop());ctx.score(++mv);beep(140+d*30,.09,'triangle',.12)}else{SFX.bad();anim(bs[i],'shake')}}else beep(300,.05,'square',.03);sel=-1}
      draw();if(pg[2].length===N)ctx.over(mv===31?'Perfect solve':'Tower moved',undefined,'win')});return b});
  const draw=()=>{bs.forEach((b,i)=>{b.textContent='';b.style.borderColor=i===sel?'#ffd84a':'';const pole=$('span','',b);pole.style.cssText='position:absolute;left:50%;bottom:10px;width:8px;margin-left:-4px;height:82%;border-radius:4px;background:linear-gradient(90deg,#8a6a50,#5e4330)';
    const base=$('span','',b);base.style.cssText='position:absolute;left:8%;right:8%;bottom:6px;height:6px;border-radius:3px;background:#5e4330';
    pg[i].forEach((d,k)=>{const e=$('span','',b);const top=k===pg[i].length-1&&i===sel;e.style.cssText=`position:relative;display:block;height:22px;border-radius:11px;width:${22+d*15}%;background:linear-gradient(${RC[d-1]},${RC[d-1]}cc);box-shadow:inset 0 3px 0 rgba(255,255,255,.35),0 2px 0 rgba(0,0,0,.3);transition:transform .15s;${top?'transform:translateY(-26px)':''}`})});
    ctx.info('Moves '+mv+'   Fewest possible 31')};draw();
},{low:true,sl:'Moves'});

reg('maze','Maze Run','Puzzle','Swipe or use the arrow keys. You slide until the next junction. Reach the star before time runs out. Each maze adds time.',ctx=>{
  const {cv,g}=ctx.canvas(300,300);let N,m,x,y,vx,vy,sc=0,trail=[],t=0;const D={up:[0,-1,1,4],right:[1,0,2,8],down:[0,1,4,1],left:[-1,0,8,2]};
  const gen=()=>{N=Math.min(8+sc*2,16);m=Array(N*N).fill(0);const seen=Array(N*N).fill(false),st=[0];seen[0]=true;
    while(st.length){const i=st[st.length-1],cx=i%N,cy=(i/N)|0;const o=Object.values(D).filter(([dx,dy])=>{const a=cx+dx,b=cy+dy;return a>=0&&b>=0&&a<N&&b<N&&!seen[b*N+a]});
      if(!o.length){st.pop();continue}const [dx,dy,bit,opp]=o[R(o.length)],j=(cy+dy)*N+cx+dx;m[i]|=bit;m[j]|=opp;seen[j]=true;st.push(j)}x=y=vx=vy=0;trail=[[0,0]]};
  const pc=v=>(v&1)+((v>>1)&1)+((v>>2)&1)+((v>>3)&1);
  const ck=ctx.clock(60,()=>ctx.over('Time up',undefined,'end'));
  ctx.every(1000,()=>{if(ck.t<=10.5&&ck.t>0)beep(1000,.03,'square',.03)});
  const move=k=>{const d=D[k];if(!d)return;let n=0;while(m[y*N+x]&d[2]){x+=d[0];y+=d[1];n++;trail.push([x,y]);if((x===N-1&&y===N-1)||pc(m[y*N+x])!==2)break}
    if(!n){beep(140,.05,'triangle',.06);return}beep(420,.07,'triangle',.04,0,240+n*30);
    if(x===N-1&&y===N-1){ctx.score(++sc);ck.t+=20;SFX.ok();ctx.info('+20 seconds');ctx.after(60,()=>{gen()})}};
  ctx.keys(move);ctx.swipe(ctx.stage,move);gen();
  ctx.loop(dt=>{t+=dt;vx+=(x-vx)*Math.min(1,dt*18);vy+=(y-vy)*Math.min(1,dt*18);const S=300/N;g.fillStyle='#07061a';g.fillRect(0,0,300,300);
    g.strokeStyle='rgba(255,122,198,.35)';g.lineWidth=S*.28;g.lineCap='round';g.lineJoin='round';g.beginPath();trail.forEach(([a,b],i)=>{const px=a*S+S/2,py=b*S+S/2;i?g.lineTo(px,py):g.moveTo(px,py)});g.stroke();
    const gx=(N-1)*S+S/2,gy=(N-1)*S+S/2,pu=1+Math.sin(t*5)*.15;g.save();g.translate(gx,gy);g.rotate(t);g.scale(pu,pu);g.fillStyle='#ffd84a';g.shadowColor='#ffd84a';g.shadowBlur=14;g.beginPath();for(let k=0;k<10;k++){const r=k%2?S*.15:S*.34,a=k*Math.PI/5;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.fill();g.restore();
    g.shadowColor='#5aa9ff';g.shadowBlur=8;g.strokeStyle='#5aa9ff';g.lineWidth=2;g.lineCap='square';g.beginPath();
    m.forEach((v,i)=>{const a=(i%N)*S,b=((i/N)|0)*S;if(!(v&1)){g.moveTo(a,b);g.lineTo(a+S,b)}if(!(v&8)){g.moveTo(a,b);g.lineTo(a,b+S)}if(!(v&2)){g.moveTo(a+S,b);g.lineTo(a+S,b+S)}if(!(v&4)){g.moveTo(a,b+S);g.lineTo(a+S,b+S)}});g.stroke();g.shadowBlur=0;
    g.shadowColor='#ff7ac6';g.shadowBlur=12;g.fillStyle='#ff7ac6';g.beginPath();g.arc(vx*S+S/2,vy*S+S/2,S*.3,0,7);g.fill();g.shadowBlur=0;g.fillStyle='#fff';g.beginPath();g.arc(vx*S+S/2-S*.08,vy*S+S/2-S*.08,S*.08,0,7);g.fill()});
},{sl:'Mazes'});

reg('memory','Memory Match','Puzzle','Flip two cards at a time and find all eight pairs in as few turns as you can.',ctx=>{
  const SY=['★','◆','●','▲','■','♥','♣','☼'];const d=shuffle([...Array(16).keys()].map(i=>i>>1));
  const st=Array(16).fill(0);let a=-1,lock=false,mv=0,found=0,streak=0;const cs=ctx.grid(4,16,360,8);
  const draw=()=>cs.forEach((c,i)=>{c.style.border='0';c.style.borderRadius='12px';c.style.fontSize='clamp(24px,9vw,40px)';
    if(st[i]){c.textContent=SY[d[i]];c.style.color=PAL[d[i]%7];c.style.background=st[i]===2?'#16112a':'#f6f1ff';c.style.boxShadow=st[i]===2?`inset 0 0 0 2px ${PAL[d[i]%7]}55`:'0 3px 0 rgba(0,0,0,.35)';c.style.opacity=st[i]===2?.55:1}
    else{c.textContent='';c.style.opacity=1;c.style.background='repeating-linear-gradient(45deg,#5a4a9a 0 7px,#4a3b78 7px 14px)';c.style.boxShadow='inset 0 0 0 3px #6b5ab0,0 3px 0 rgba(0,0,0,.35)'}});
  cs.forEach((c,i)=>{c.setAttribute('aria-label','Card '+(i+1));ctx.on(c,'click',()=>{if(ctx.paused||lock||st[i])return;st[i]=1;SFX.flip();draw();anim(c,'flipx');if(a<0){a=i;return}ctx.score(++mv);const b=a;a=-1;
    if(d[b]===d[i]){streak++;ctx.after(250,()=>{st[b]=st[i]=2;draw();anim(cs[b],'pop');anim(cs[i],'pop');SFX.ok();ctx.info(streak>1?streak+' in a row':'');if(++found===8)ctx.over('All matched',undefined,'win')})}
    else{streak=0;lock=true;ctx.after(650,()=>{SFX.bad();anim(cs[b],'shake');anim(cs[i],'shake');ctx.after(250,()=>{st[b]=st[i]=0;lock=false;draw()})})}})});draw();
},{low:true,sl:'Turns'});

reg('code','Code Breaker','Puzzle','Crack the hidden four-colour code in ten guesses. Colours can repeat. Solid dots mean right colour, right place. Hollow dots mean right colour, wrong place.',ctx=>{
  const code=[0,1,2,3].map(()=>R(6));let cur=[],n=0;const log=$('div','',ctx.stage);log.style.cssText='display:flex;flex-direction:column;gap:6px;width:100%;max-width:340px';
  const peg=(p,c,sz=28)=>{const e=$('span','',p);e.style.cssText=`display:inline-block;width:${sz}px;height:${sz}px;border-radius:50%;background:${c==null?'rgba(255,255,255,.04)':`radial-gradient(circle at 35% 30%,#fff8,${PAL[c]} 45%)`};border:2px solid ${c==null?C.line:PAL[c]};box-shadow:${c==null?'inset 0 2px 4px #0008':'0 2px 0 #0006'}`;return e};
  const now=$('div','row',ctx.stage);now.style.padding='10px';now.style.background='#211a33';now.style.borderRadius='14px';now.style.maxWidth='340px';const draw=()=>{now.textContent='';for(let i=0;i<4;i++)peg(now,cur[i],34)};
  const r=ctx.row();for(let c=0;c<6;c++){const k=ctx.btn(r,'',()=>{if(cur.length<4){cur.push(c);beep(400+c*80,.05,'square',.04);draw();anim(now.children[cur.length-1],'pop')}});k.style.cssText+=`;background:radial-gradient(circle at 35% 30%,#fff8,${PAL[c]} 45%);border-color:${PAL[c]};width:44px;height:44px;border-radius:50%`;k.setAttribute('aria-label','Colour '+(c+1))}
  const r2=ctx.row();ctx.btn(r2,'Undo',()=>{cur.pop();SFX.tap();draw()});ctx.btn(r2,'Check',()=>{if(cur.length<4){anim(now,'shake');return SFX.bad()}let ex=0,cl=0;const a=[],b=[];cur.forEach((c,i)=>{if(c===code[i])ex++;else{a.push(c);b.push(code[i])}});a.forEach(c=>{const j=b.indexOf(c);if(j>=0){cl++;b.splice(j,1)}});
    const row=$('div','',log);row.style.cssText='display:flex;gap:10px;align-items:center;background:#1a1428;border-radius:10px;padding:6px 10px';$('span','',row,String(n+1)).style.cssText='width:18px;color:#a297c0;font-weight:700';
    const l=$('span','',row);l.style.cssText='display:flex;gap:6px;flex:1';cur.forEach(c=>peg(l,c,24));
    const fb=$('span','',row);fb.style.cssText='display:grid;grid-template-columns:repeat(2,10px);gap:3px';for(let i=0;i<4;i++){const d=$('span','',fb);d.style.cssText=`width:10px;height:10px;border-radius:50%;${i<ex?'background:#ffd84a':i<ex+cl?'border:2px solid #f4eeff':'background:#2b2242'}`}
    anim(row,'pop');for(let i=0;i<ex;i++)beep(800+i*120,.05,'square',.04,i*.07);if(!ex)beep(300,.08,'triangle',.06);
    ctx.score(++n);ctx.info('Guess '+n+' / 10');if(ex===4)return ctx.over('Code cracked',undefined,'win');if(n>=10){const s=$('div','row',ctx.stage);$('span','note',s,'The code was');code.forEach(c=>peg(s,c));return ctx.over('Locked out',null,'lose')}cur=[];draw()},'pri');
  ctx.info('Guess 0 / 10');draw();
},{low:true,sl:'Guesses'});

reg('pop','Block Pop','Puzzle','Tap a group of two or more touching blocks of the same colour to pop them. Bigger groups score far more.',ctx=>{
  const CW=10,CH=12,S=30,{cv,g}=ctx.canvas(300,360);let cols=Array.from({length:CW},()=>Array.from({length:CH},()=>R(4))),sc=0,parts=[],txt=[],hov=null,ending=false;
  const grp=(c,r)=>{const col=cols[c][r],seen=new Set([c+','+r]),st=[[c,r]];while(st.length){const [a,b]=st.pop();[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const x=a+dx,y=b+dy,k=x+','+y;if(cols[x]&&cols[x][y]===col&&!seen.has(k)){seen.add(k);st.push([x,y])}})}return seen};
  const any=()=>cols.some((cl,c)=>cl.some((v,r)=>cl[r+1]===v||(cols[c+1]&&cols[c+1][r]===v)));
  ctx.on(cv,'pointerdown',e=>{e.preventDefault();if(ctx.paused||ending)return;const q=cv.pos(e),c=(q.x/S)|0,r=((360-q.y)/S)|0;if(!cols[c]||cols[c][r]==null)return;const s=grp(c,r);if(s.size<2){beep(160,.06,'triangle',.06);return}
    s.forEach(k=>{const [x,y]=k.split(',').map(Number);burst(parts,x*S+S/2,360-y*S-S/2,PAL[cols[x][y]],3,140)});
    const pts=s.size*(s.size-1);txt.push({x:q.x,y:q.y,t:'+'+pts,l:.9});cols=cols.map((cl,x)=>cl.filter((_,y)=>!s.has(x+','+y))).filter(cl=>cl.length);sc+=pts;
    beep(300+Math.min(s.size,20)*30,.09,'square',.05,0,600+Math.min(s.size,20)*50);if(s.size>=8)noise(.15,.15,0,2000);
    if(!cols.length){sc+=500;txt.push({x:150,y:180,t:'BOARD CLEAR +500',l:1.6})}ctx.score(sc);
    if(!any()){ending=true;ctx.after(900,()=>ctx.over(cols.length?'No more groups':'Board cleared',undefined,cols.length?'end':'win'))}});
  ctx.loop(dt=>{g.fillStyle='#0e0a17';g.fillRect(0,0,300,360);g.fillStyle='rgba(255,255,255,.03)';for(let c=0;c<CW;c+=2)g.fillRect(c*S,0,S,360);
    cols.forEach((cl,c)=>cl.forEach((v,r)=>{const x=c*S,y=360-(r+1)*S;g.fillStyle=PAL[v];rrect(g,x+2,y+2,S-4,S-4,7);g.fill();g.fillStyle='rgba(255,255,255,.35)';rrect(g,x+5,y+4,S-10,5,3);g.fill();g.fillStyle='rgba(0,0,0,.18)';rrect(g,x+2,y+S-8,S-4,6,[0,0,7,7]);g.fill()}));
    parts=drawParts(g,parts,dt,400);txt.forEach(q=>{q.l-=dt;q.y-=30*dt;g.globalAlpha=Math.max(0,q.l);g.fillStyle='#fff';g.strokeStyle='#0008';g.lineWidth=4;g.font=FONT(16,700);g.textAlign='center';g.strokeText(q.t,q.x,q.y);g.fillText(q.t,q.x,q.y)});g.globalAlpha=1;txt=txt.filter(q=>q.l>0)});
});

/* ================= BOARD ================= */
reg('ttt','Tic-Tac-Toe','Board','You are X. Get three in a row before the computer does.',ctx=>{
  const b=Array(9).fill(0),L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];let busy=false;const cs=ctx.grid(3,9,330,10);boardBox(cs,'#120d1d',10);
  const line=p=>L.find(l=>l.every(i=>b[i]===p)),full=()=>b.every(v=>v);
  const mm=p=>{if(line(-p))return -1;if(full())return 0;let best=-2;for(let i=0;i<9;i++)if(!b[i]){b[i]=p;best=Math.max(best,-mm(-p));b[i]=0}return best};
  const draw=(hl,last)=>cs.forEach((c,i)=>{c.textContent=b[i]===1?'✕':b[i]===-1?'◯':'';c.style.color=b[i]===1?'#2fd6b5':'#ff5d7a';c.style.fontSize='clamp(40px,15vw,70px)';c.style.border='0';c.style.borderRadius='14px';
    c.style.background=hl&&hl.includes(i)?(b[i]===1?'#1d4a43':'#4a1d2a'):'#211a33';c.style.textShadow=b[i]?`0 0 16px ${b[i]===1?'#2fd6b5':'#ff5d7a'}`:'';if(i===last)anim(c,'pop')});
  const end=()=>{let l;if(l=line(1)){draw(l);ctx.over('You win',undefined,'win');return true}if(l=line(-1)){draw(l);ctx.over('Computer wins',undefined,'lose');return true}if(full()){ctx.over('Draw',undefined,'end');return true}return false};
  cs.forEach((c,i)=>{c.setAttribute('aria-label','Square '+(i+1));ctx.on(c,'click',()=>{if(ctx.paused||busy||b[i])return;b[i]=1;beep(660,.07,'square',.045);draw(null,i);if(end())return;busy=true;ctx.after(400,()=>{const free=b.map((v,k)=>v?-1:k).filter(k=>k>=0);let pick=free[R(free.length)];
    if(Math.random()>({easy:.65,medium:.25,hard:0}[ctx.diff]??.25)){let bs=-2;for(const k of free){b[k]=-1;const s=-mm(1);b[k]=0;if(s>bs){bs=s;pick=k}}}b[pick]=-1;busy=false;beep(440,.07,'square',.045);draw(null,pick);end()})})});draw();
},{ns:true});

reg('four','Four in a Row','Board','Tap a column to drop a disc. Line up four of yours in any direction before the computer does.',ctx=>{
  const W=7,H=6,b=Array(42).fill(0),lines=[];let busy=false;
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)[[0,1],[1,0],[1,1],[1,-1]].forEach(([dr,dc])=>{const l=[];for(let k=0;k<4;k++){const y=r+dr*k,x=c+dc*k;if(y<0||y>=H||x<0||x>=W)return;l.push(y*W+x)}lines.push(l)});
  const low=c=>{for(let r=H-1;r>=0;r--)if(!b[r*W+c])return r*W+c;return -1};
  const wl=p=>lines.find(l=>b[l[0]]===p&&b[l[1]]===p&&b[l[2]]===p&&b[l[3]]===p);
  const ev=p=>{let s=0;for(const l of lines){let a=0,o=0;for(const i of l){if(b[i]===p)a++;else if(b[i])o++}if(!o)s+=[0,1,5,40,0][a];if(!a)s-=[0,1,5,40,0][o]}return s};
  const nm=(d,al,be,p)=>{if(wl(-p))return -10000-d;if(!d)return ev(p);let best=-1e9,any=false;for(const c of[3,2,4,1,5,0,6]){const i=low(c);if(i<0)continue;any=true;b[i]=p;const v=-nm(d-1,-be,-al,-p);b[i]=0;if(v>best)best=v;if(v>al)al=v;if(al>=be)break}return any?best:0};
  const cs=ctx.grid(W,42,420,6);boardBox(cs,'linear-gradient(#2e5fd0,#1f46a8)',10);
  const draw=(drop,hl)=>cs.forEach((c,i)=>{c.style.borderRadius='50%';c.style.border='0';c.textContent='';c.style.background='#0e0a17';c.style.boxShadow='inset 0 4px 6px rgba(0,0,0,.6)';
    if(b[i]){const d=$('span','dot',c);d.style.width=d.style.height='86%';d.style.background=b[i]===1?'radial-gradient(circle at 35% 30%,#fff3b0,#ffd84a 45%,#c9940f)':'radial-gradient(circle at 35% 30%,#ffc0cc,#ff5d7a 45%,#c02a48)';
      if(hl&&hl.includes(i))d.style.boxShadow='0 0 0 3px #fff,0 0 14px #fff';if(i===drop){d.style.setProperty('--d',-(((i/W)|0)+1)*(c.offsetHeight+6)+'px');anim(d,'dropin')}}});
  const land=i=>ctx.after(300,()=>beep(110+(((i/W)|0))*18,.1,'triangle',.14));
  const end=()=>{let l;if(l=wl(1)){draw(-1,l);ctx.over('You win',undefined,'win');return true}if(l=wl(-1)){draw(-1,l);ctx.over('Computer wins',undefined,'lose');return true}if(b.every(v=>v)){ctx.over('Draw',undefined,'end');return true}return false};
  cs.forEach((c,i)=>{c.setAttribute('aria-label','Column '+(i%W+1));ctx.on(c,'click',()=>{if(ctx.paused||busy)return;const j=low(i%W);if(j<0){SFX.bad();return}b[j]=1;draw(j);land(j);busy=true;ctx.after(360,()=>{if(end())return;ctx.after(200,()=>{let bc=-1,bs=-1e9;const DP={easy:1,medium:4,hard:6}[ctx.diff]??4;if(ctx.diff==='easy'&&Math.random()<.3){const cs=[0,1,2,3,4,5,6].filter(c=>low(c)>=0);bc=low(cs[R(cs.length)])}else for(const col of[3,2,4,1,5,0,6]){const k=low(col);if(k<0)continue;b[k]=-1;const s=-nm(DP,-1e9,1e9,1)+Math.random()*(ctx.diff==='easy'?50:.5);b[k]=0;if(s>bs){bs=s;bc=k}}b[bc]=-1;draw(bc);land(bc);ctx.after(360,()=>{busy=false;end()})})})})});draw();
},{ns:true});

reg('reversi','Reversi','Board','You are yellow. Place a disc to trap the computer\'s discs between yours and flip them. Small dots show where you can play. Most discs wins.',ctx=>{
  const N=8,b=Array(64).fill(0);b[27]=b[36]=-1;b[28]=b[35]=1;let busy=false,last=-1,flipped=new Set();const cs=ctx.grid(N,64,420,2);boardBox(cs,'#123d2b',6);
  const flips=(i,p)=>{if(b[i])return[];const x=i%N,y=(i/N)|0,out=[];for(let dy=-1;dy<2;dy++)for(let dx=-1;dx<2;dx++){if(!dx&&!dy)continue;const l=[];let a=x+dx,c=y+dy;while(a>=0&&c>=0&&a<N&&c<N&&b[c*N+a]===-p){l.push(c*N+a);a+=dx;c+=dy}if(l.length&&a>=0&&c>=0&&a<N&&c<N&&b[c*N+a]===p)out.push(...l)}return out};
  const moves=p=>{const o=[];for(let i=0;i<64;i++){const f=flips(i,p);if(f.length)o.push([i,f])}return o};
  const wt=i=>{const x=i%N,y=(i/N)|0,ex=x===0||x===7,ey=y===0||y===7;if(ex&&ey)return 100;const nx=x===1||x===6,ny=y===1||y===6;if((nx||ex)&&(ny||ey)&&(nx||ny))return -25;return ex||ey?8:0};
  const count=p=>b.filter(v=>v===p).length;
  const draw=()=>{const mv=new Set(busy?[]:moves(1).map(m=>m[0]));cs.forEach((c,i)=>{c.textContent='';c.style.borderRadius='4px';c.style.border='0';c.style.background=(i+((i/N)|0))%2?'#2a7d58':'#2f8a61';
    if(b[i]){const d=$('span','dot',c);d.style.width=d.style.height='80%';d.style.background=b[i]===1?'radial-gradient(circle at 35% 30%,#fff3b0,#ffd84a 45%,#b8860b)':'radial-gradient(circle at 35% 30%,#ffc0cc,#ff5d7a 45%,#a82240)';d.style.boxShadow='0 2px 0 rgba(0,0,0,.4)'+(i===last?',0 0 0 2px #fff':'');if(flipped.has(i))anim(d,'flipx');if(i===last)anim(d,'pop')}
    else if(mv.has(i)){const d=$('span','dot',c);d.style.cssText='width:24%;height:24%;background:rgba(255,255,255,.45)'}});flipped=new Set();ctx.score(count(1));ctx.info('You '+count(1)+'  :  '+count(-1)+' Computer')};
  const play=(i,f,p)=>{b[i]=p;f.forEach(k=>b[k]=p);last=i;flipped=new Set(f);beep(p===1?520:380,.06,'square',.045);f.forEach((_,k)=>noise(.03,.08,.05+k*.04,2600))};
  const fin=()=>{const a=count(1),c=count(-1);ctx.over(a>c?'You win':a<c?'Computer wins':'Draw',undefined,a>c?'win':a<c?'lose':'end')};
  const ai=()=>{const m=moves(-1);if(!m.length){busy=false;if(!moves(1).length)return draw(),fin();ctx.info('Computer has no move. Your turn again.');return draw()}let best=m[0],bs=-1e9;for(const mv of m){let s;if(ctx.diff==='easy')s=Math.random()*10+mv[1].length*.5;else if(ctx.diff==='hard'){b[mv[0]]=-1;mv[1].forEach(k=>b[k]=-1);const om=moves(1);let worst=0;for(const o of om){const v=wt(o[0])*1.2+o[1].length;if(v>worst)worst=v}s=wt(mv[0])*1.5+mv[1].length*.6-worst-om.length*1.5+Math.random()*.3;b[mv[0]]=0;mv[1].forEach(k=>b[k]=1)}else s=wt(mv[0])+mv[1].length+Math.random();if(s>bs){bs=s;best=mv}}play(best[0],best[1],-1);
    if(!moves(1).length){if(!moves(-1).length){busy=false;draw();return fin()}draw();return ctx.after(700,ai)}busy=false;draw()};
  cs.forEach((c,i)=>{c.setAttribute('aria-label','Square '+(i+1));ctx.on(c,'click',()=>{if(ctx.paused||busy)return;const f=flips(i,1);if(!f.length){beep(150,.05,'triangle',.06);return}play(i,f,1);busy=true;draw();ctx.after(700,ai)})});draw();
},{sl:'Discs'});

reg('sea','Sea Battle','Board','Five ships hide on each grid. Tap the top grid to fire. Sink the whole enemy fleet before the computer sinks yours.',ctx=>{
  const N=8,SH=[4,3,3,2,2],NM=['Battleship','Cruiser','Submarine','Destroyer','Patrol boat'],TOT=14;
  const place=()=>{const g=Array(64).fill(0);SH.forEach((L,id)=>{for(;;){const h=R(2),x=R(h?N-L+1:N),y=R(h?N:N-L+1),cs=[];for(let k=0;k<L;k++)cs.push((y+(h?0:k))*N+x+(h?k:0));if(cs.every(i=>!g[i])){cs.forEach(i=>g[i]=id+1);break}}});return g};
  const en=place(),me=place(),es=Array(64).fill(0),ms=Array(64).fill(0);let eh=0,mh=0,shots=0,busy=false,q=[];
  const sunk=(grid,shots,id)=>grid.every((v,i)=>v!==id||shots[i]===2);
  $('p','note',ctx.stage,'Enemy waters');const ec=ctx.grid(N,64,340,3);boardBox(ec,'#0b2a44',6);const msg=$('p','note',ctx.stage,'Pick a square to fire.');msg.style.color='#f4eeff';msg.style.minHeight='1.4em';
  $('p','note',ctx.stage,'Your fleet');const mc=ctx.grid(N,64,220,2);boardBox(mc,'#0b2a44',4);
  const paint=(c,ship,s,grid,shotsArr,showShip,i)=>{c.style.borderRadius='4px';c.style.border='0';c.style.fontSize='clamp(10px,3.2vw,16px)';const isSunk=s===2&&sunk(grid,shotsArr,ship);
    c.textContent=s===2?(isSunk?'✖':'✹'):s===1?'◦':'';c.style.color=s===2?'#fff':'#9cc9ee';
    c.style.background=s===2?(isSunk?'#5a1a24':'radial-gradient(circle,#ffd84a,#ff5d3a 60%,#a8281e)'):showShip&&ship?'linear-gradient(#8a97b3,#5e6a86)':((i+((i/N)|0))%2?'#164a74':'#1a5584');c.style.boxShadow='inset 0 0 0 1px rgba(255,255,255,.06)'};
  const draw=()=>{ec.forEach((c,i)=>paint(c,en[i],es[i],en,es,false,i));mc.forEach((c,i)=>{paint(c,me[i],ms[i],me,ms,true,i);c.classList.add('flat');c.tabIndex=-1});ctx.info('Enemy ships left '+(5-[1,2,3,4,5].filter(id=>sunk(en,es,id)).length)+'   Yours '+(5-[1,2,3,4,5].filter(id=>sunk(me,ms,id)).length))};
  const ai=()=>{let i=-1;const free=[];ms.forEach((s,k)=>{if(!s)free.push(k)});if(ctx.diff==='easy'){q=[];i=free[R(free.length)]}else if(ctx.diff==='hard'){const dens=Array(64).fill(0);[1,2,3,4,5].forEach(id=>{if(sunk(me,ms,id))return;const L=SH[id-1];for(let y=0;y<N;y++)for(let x=0;x<N;x++)for(const hz of[0,1]){const cs=[];let ok=true;for(let k=0;k<L;k++){const a=x+(hz?k:0),c2=y+(hz?0:k);if(a>=N||c2>=N){ok=false;break}cs.push(c2*N+a)}if(!ok)continue;if(cs.some(c=>ms[c]===1||(ms[c]===2&&sunk(me,ms,me[c]))))continue;const hits=cs.filter(c=>ms[c]===2).length;cs.forEach(c=>{if(!ms[c])dens[c]+=1+hits*20})}});let bv=-1;free.forEach(k=>{const v=dens[k]+Math.random()*.5;if(v>bv){bv=v;i=k}})}else{do{i=q.length?q.pop():-1}while(i>=0&&ms[i]);if(i<0){const par=free.filter(k=>((k%N)+((k/N)|0))%2===0);const pool=par.length?par:free;i=pool[R(pool.length)]}}
    if(me[i]){ms[i]=2;mh++;const x=i%N,y=(i/N)|0;if(x>0)q.push(i-1);if(x<N-1)q.push(i+1);if(y>0)q.push(i-N);if(y<N-1)q.push(i+N);noise(.25,.18,0,400);beep(110,.25,'sawtooth',.05,0,50);anim(mc[i],'pop');
      if(sunk(me,ms,me[i])){msg.textContent='They sank your '+NM[me[i]-1]+'.';SFX.bad()}}else{ms[i]=1;noise(.18,.08,0,900)}busy=false;draw();if(mh>=TOT)ctx.over('Fleet sunk',null,'lose')};
  ec.forEach((c,i)=>{c.setAttribute('aria-label','Target '+(i+1));ctx.on(c,'click',()=>{if(ctx.paused||busy||es[i])return;es[i]=en[i]?2:1;ctx.score(++shots);anim(c,'pop');
    if(en[i]){eh++;noise(.3,.22,0,350);beep(120,.3,'sawtooth',.06,0,45);if(sunk(en,es,en[i])){msg.textContent='You sank their '+NM[en[i]-1]+'!';ctx.after(250,SFX.ok)}else msg.textContent='Hit!'}
    else{noise(.2,.09,0,1000);beep(700,.12,'sine',.04,0,300);msg.textContent='Splash. Missed.'}
    draw();if(eh>=TOT)return ctx.over('Enemy fleet sunk',undefined,'win');busy=true;ctx.after(650,ai)})});draw();
},{low:true,sl:'Shots'});

reg('rps','Rock Paper Scissors','Board','Pick your throw. Rock beats scissors, scissors beats paper, paper beats rock. Your run ends on the first loss.',ctx=>{
  const NM=['Rock','Paper','Scissors'],EM=['✊','✋','✌️'];let w=0,busy=false;const hist=[];let lastA=R(3);const aiThrow=()=>{let a;const d=ctx.diff;if(d==='easy')a=Math.random()<.6?lastA:R(3);else if(hist.length<2||Math.random()<(d==='hard'?.15:.5))a=R(3);else{const cnt=[0,0,0],last=hist[hist.length-1];for(let k=0;k<hist.length-1;k++)if(hist[k]===last)cnt[hist[k+1]]++;if(cnt.every(v=>!v))hist.forEach(v=>cnt[v]++);a=(cnt.indexOf(Math.max(...cnt))+1)%3}lastA=a;return a};
  const arena=$('div','row',ctx.stage);arena.style.cssText='gap:18px;align-items:center;padding:16px 10px;background:#211a33;border-radius:16px;max-width:360px;flex-wrap:nowrap';
  const side=(lab)=>{const d=$('div','',arena);d.style.cssText='display:flex;flex-direction:column;align-items:center;gap:4px;flex:1';const e=$('div','',d,'✊');e.style.cssText='font-size:clamp(54px,18vw,80px);line-height:1';$('span','note',d,lab);return e};
  const you=side('You');const vs=$('div','',arena,'vs');vs.style.cssText='font:400 18px var(--display);color:#a297c0';const cpu=side('Computer');cpu.style.transform='scaleX(-1)';
  const out=$('p','big',ctx.stage,'Make a throw');const sub=$('p','note',ctx.stage,'Ties do not count against you.');const r=ctx.row();
  NM.forEach((n,i)=>{const b=ctx.btn(r,EM[i]+' '+n,()=>{if(busy)return;busy=true;const a=aiThrow();hist.push(i);you.textContent=cpu.textContent='✊';out.textContent='';sub.textContent='';
    ['Rock','Paper','Scissors','Shoot!'].forEach((s,k)=>ctx.after(k*260,()=>{out.textContent=s;beep(k<3?440:880,.06,'square',.045);anim(you,'shake');anim(cpu,'shake')}));
    ctx.after(1100,()=>{you.textContent=EM[i];cpu.textContent=EM[a];anim(you,'pop');anim(cpu,'pop');busy=false;
      if(a===i){out.textContent='Tie';sub.textContent='You both threw '+n.toLowerCase()+'.';beep(500,.1,'triangle',.06)}
      else if((i-a+3)%3===1){ctx.score(++w);out.textContent='You win';sub.textContent=n+' beats '+NM[a].toLowerCase()+'. Streak '+w+'.';SFX.ok()}
      else{out.textContent='You lose';sub.textContent=NM[a]+' beats '+n.toLowerCase()+'.';ctx.over('Run over',undefined,'lose')}})},'pri');b.style.fontSize='17px'});
},{sl:'Wins'});
