
/* ================= PUZZLE ================= */
reg('2048','2048','Puzzle','Swipe or use the arrow keys. Matching tiles merge. Reach 2048 and keep going.',ctx=>{
  let b=Array(16).fill(0),sc=0;const cs=ctx.grid(4,16,380,8);cs.forEach(c=>{c.classList.add('flat');c.tabIndex=-1});
  const add=()=>{const e=[];b.forEach((v,i)=>{if(!v)e.push(i)});if(e.length)b[e[R(e.length)]]=Math.random()<.9?2:4};
  const draw=()=>cs.forEach((c,i)=>{const v=b[i];c.textContent=v||'';const l=v?Math.log2(v):0;c.style.background=v?`hsl(${(50-l*26+360)%360} 80% ${l>6?58:62}%)`:'';c.style.color='#1a1326';c.style.fontSize=v>999?'clamp(12px,3.6vw,18px)':''});
  const slide=line=>{const a=line.filter(v=>v);for(let i=0;i<a.length-1;i++)if(a[i]===a[i+1]){a[i]*=2;sc+=a[i];a.splice(i+1,1)}while(a.length<4)a.push(0);return a};
  const can=()=>b.some((v,i)=>!v||(i%4<3&&v===b[i+1])||(i<12&&v===b[i+4]));
  const move=d=>{if(!['left','right','up','down'].includes(d))return;const old=b.join();
    for(let i=0;i<4;i++){const idx=[0,1,2,3].map(j=>d==='left'?i*4+j:d==='right'?i*4+3-j:d==='up'?j*4+i:(3-j)*4+i);const l=slide(idx.map(k=>b[k]));idx.forEach((k,j)=>b[k]=l[j])}
    if(b.join()!==old){add();draw();ctx.score(sc);if(!can())ctx.over('No moves left')}};
  ctx.keys(move);ctx.swipe(ctx.stage,move);add();add();draw();
});

reg('mines','Minesweeper','Puzzle','Tap to reveal. Numbers count the mines next to a square. Switch on Flag to mark mines. Clear every safe square.',ctx=>{
  const N=9,M=10;let mine=null,open=Array(81).fill(false),flag=Array(81).fill(false),fm=false,left=81-M,t=0,started=false;
  const cs=ctx.grid(N,81,400,3);const r=ctx.row();const fb=ctx.btn(r,'Flag: off',()=>{fm=!fm;fb.textContent='Flag: '+(fm?'on':'off');fb.classList.toggle('on',fm)});
  const nb=i=>{const x=i%N,y=(i/N)|0,o=[];for(let dy=-1;dy<2;dy++)for(let dx=-1;dx<2;dx++){const a=x+dx,c=y+dy;if((dx||dy)&&a>=0&&c>=0&&a<N&&c<N)o.push(c*N+a)}return o};
  const cnt=i=>nb(i).filter(j=>mine[j]).length;const NC=[,C.blue,C.teal,C.red,C.vio,C.org,C.pink,C.yel,C.ink];
  const draw=()=>cs.forEach((c,i)=>{c.style.borderRadius='4px';if(open[i]){c.classList.add('dim');const n=mine[i]?'✹':cnt(i);c.textContent=n||'';c.style.color=mine[i]?C.red:NC[n]||''}else{c.textContent=flag[i]?'⚑':'';c.style.color=C.yel}});
  const reveal=i=>{if(open[i]||flag[i])return;open[i]=true;left--;if(!cnt(i))nb(i).forEach(reveal)};
  const toggle=i=>{if(!open[i]){flag[i]=!flag[i];draw()}};
  cs.forEach((c,i)=>{ctx.on(c,'contextmenu',e=>{e.preventDefault();if(!ctx.paused)toggle(i)});ctx.on(c,'click',()=>{if(ctx.paused||open[i])return;if(fm)return toggle(i);if(flag[i])return;
    if(!mine){const ban=new Set([i,...nb(i)]);mine=Array(81).fill(false);let k=0;while(k<M){const j=R(81);if(!mine[j]&&!ban.has(j)){mine[j]=true;k++}}started=true}
    if(mine[i]){mine.forEach((m,j)=>{if(m)open[j]=true});draw();return ctx.over('Boom',null)}
    reveal(i);draw();if(left===0)ctx.over('Field cleared',t)})});
  ctx.every(1000,()=>{if(started)ctx.score(++t)});mine=null;cs.forEach(c=>c.style.borderRadius='4px');
},{low:true,sl:'Seconds'});

reg('sudoku','Sudoku','Puzzle','Tap a square, then a number. Fill every row, column and 3x3 box with 1 to 9. Clashes show in red.',ctx=>{
  const sh3=()=>shuffle([0,1,2]),ord=()=>{const o=[];for(const b of sh3())for(const r of sh3())o.push(b*3+r);return o};
  const rows=ord(),cols=ord(),dig=shuffle([1,2,3,4,5,6,7,8,9]),v=[],fix=[];let sel=-1,t=0;
  for(let r=0;r<9;r++)for(let c=0;c<9;c++)v.push(dig[(3*(rows[r]%3)+((rows[r]/3)|0)+cols[c])%9]);
  shuffle([...Array(81).keys()]).slice(0,42).forEach(i=>v[i]=0);v.forEach((x,i)=>fix[i]=!!x);
  const cs=ctx.grid(9,81,430,2);cs.forEach((c,i)=>{c.style.borderRadius='3px';if(i%9%3===2&&i%9<8)c.style.marginRight='4px';if(((i/9)|0)%3===2&&i<72)c.style.marginBottom='4px';ctx.on(c,'click',()=>{if(!ctx.paused&&!fix[i]){sel=i;draw()}})});
  const clash=i=>{const r=(i/9)|0,c=i%9;for(let j=0;j<81;j++){if(j===i||v[j]!==v[i])continue;const r2=(j/9)|0,c2=j%9;if(r2===r||c2===c||(((r/3)|0)===((r2/3)|0)&&((c/3)|0)===((c2/3)|0)))return true}return false};
  const draw=()=>{let ok=true;cs.forEach((c,i)=>{c.textContent=v[i]||'';const bad=v[i]&&clash(i);if(bad||!v[i])ok=false;c.className='c'+(fix[i]?' fix dim':'')+(bad?' bad':'')+(i===sel?' sel':'')});if(ok)ctx.over('Solved',t)};
  const put=n=>{if(sel>=0&&!fix[sel]){v[sel]=n;draw()}};
  const pad=$('div','g',ctx.stage);pad.style.gridTemplateColumns='repeat(5,1fr)';pad.style.maxWidth='340px';
  for(let n=1;n<=10;n++){const b=$('button','btn',pad,n===10?'⌫':String(n));if(n===10)b.setAttribute('aria-label','Erase');ctx.on(b,'click',()=>{if(!ctx.paused)put(n%10)})}
  ctx.keys(k=>{if(/^[1-9]$/.test(k))put(+k);else if(k==='back'||k==='0')put(0)});ctx.every(1000,()=>ctx.score(++t));draw();
},{low:true,sl:'Seconds'});

reg('lights','Lights Out','Puzzle','Tapping a light flips it and its four neighbours. Turn every light off in as few moves as you can.',ctx=>{
  const N=5,b=Array(25).fill(false);let mv=0;const cs=ctx.grid(N,25,360,8);
  const flip=i=>{const x=i%N,y=(i/N)|0;[[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const a=x+dx,c=y+dy;if(a>=0&&c>=0&&a<N&&c<N)b[c*N+a]=!b[c*N+a]})};
  const draw=()=>cs.forEach((c,i)=>{c.style.background=b[i]?C.yel:'';c.style.borderColor=b[i]?C.yel:''});
  do{for(let k=0;k<10;k++)flip(R(25))}while(!b.some(x=>x));
  cs.forEach((c,i)=>{c.setAttribute('aria-label','Light '+(i+1));ctx.on(c,'click',()=>{if(ctx.paused)return;flip(i);ctx.score(++mv);draw();if(!b.some(x=>x))ctx.over('All dark')})});draw();
},{low:true,sl:'Moves'});

reg('slide','Slide 15','Puzzle','Tap a tile next to the gap to slide it. Put the numbers in order, 1 to 15, with the gap last.',ctx=>{
  const b=[...Array(15).keys()].map(i=>i+1).concat(0);let mv=0;const cs=ctx.grid(4,16,360,6);
  const adj=i=>{const x=i%4,y=(i/4)|0,o=[];if(x>0)o.push(i-1);if(x<3)o.push(i+1);if(y>0)o.push(i-4);if(y<3)o.push(i+4);return o};
  let e=15,last=-1;for(let k=0;k<200;k++){const o=adj(e).filter(j=>j!==last);const j=o[R(o.length)];b[e]=b[j];b[j]=0;last=e;e=j}
  const draw=()=>cs.forEach((c,i)=>{c.textContent=b[i]||'';c.classList.toggle('dim',!b[i]);c.style.background=b[i]?(b[i]===i+1?'#1f4a45':''):''});
  cs.forEach((c,i)=>ctx.on(c,'click',()=>{if(ctx.paused)return;const z=b.indexOf(0);if(!adj(i).includes(z))return;b[z]=b[i];b[i]=0;ctx.score(++mv);draw();if(b.every((v,k)=>v===(k+1)%16))ctx.over('In order')}));draw();
},{low:true,sl:'Moves'});

reg('flood','Flood','Puzzle','Start from the top-left corner. Pick a colour to flood into matching neighbours. Fill the whole board in 22 moves.',ctx=>{
  const N=12,S=25,MAX=22,{cv,g}=ctx.canvas(300,300,120);const b=Array.from({length:N*N},()=>R(6));let mv=0;
  const draw=()=>{b.forEach((c,i)=>{g.fillStyle=PAL[c];g.fillRect((i%N)*S,((i/N)|0)*S,S,S)});ctx.info('Moves '+mv+' / '+MAX)};
  const fill=c=>{const o=b[0];if(o===c||ctx.paused)return;const st=[0];b[0]=c;while(st.length){const i=st.pop(),x=i%N,y=(i/N)|0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const a=x+dx,d=y+dy,j=d*N+a;if(a>=0&&d>=0&&a<N&&d<N&&b[j]===o){b[j]=c;st.push(j)}})}
    ctx.score(++mv);draw();if(b.every(v=>v===c))ctx.over('Flooded');else if(mv>=MAX)ctx.over('Out of moves',null)};
  const r=ctx.row();for(let c=0;c<6;c++){const k=ctx.btn(r,'',()=>fill(c));k.style.background=PAL[c];k.style.width='46px';k.style.borderColor=PAL[c];k.setAttribute('aria-label','Colour '+(c+1))}draw();
},{low:true,sl:'Moves'});

reg('hanoi','Tower Stack','Puzzle','Move all five rings to the right-hand peg. Tap a peg to lift its top ring, tap another to drop it. A bigger ring can never sit on a smaller one.',ctx=>{
  const N=5,pg=[[5,4,3,2,1],[],[]];let sel=-1,mv=0;const r=ctx.row();r.style.flexWrap='nowrap';r.style.maxWidth='460px';r.style.alignItems='stretch';
  const bs=[0,1,2].map(i=>{const b=$('button','btn',r);b.style.cssText='flex:1;min-width:0;height:190px;display:flex;flex-direction:column-reverse;align-items:center;gap:4px;padding:8px 4px';b.setAttribute('aria-label','Peg '+(i+1));
    ctx.on(b,'click',()=>{if(ctx.paused)return;if(sel<0){if(pg[i].length)sel=i}else{if(i!==sel){const d=pg[sel][pg[sel].length-1],t=pg[i][pg[i].length-1];if(!t||t>d){pg[i].push(pg[sel].pop());ctx.score(++mv)}}sel=-1}draw();if(pg[2].length===N)ctx.over('Tower moved')});return b});
  const draw=()=>bs.forEach((b,i)=>{b.textContent='';b.classList.toggle('on',i===sel);pg[i].forEach(d=>{const e=$('span','',b);e.style.cssText=`display:block;height:22px;border-radius:6px;width:${22+d*15}%;background:${PAL[d-1]}`})});draw();
},{low:true,sl:'Moves'});

reg('maze','Maze Run','Puzzle','Swipe or use the arrow keys. You slide until the next junction. Reach the yellow square before time runs out. Each maze adds time.',ctx=>{
  const {cv,g}=ctx.canvas(300,300);let N,m,x,y,sc=0;const D={up:[0,-1,1,4],right:[1,0,2,8],down:[0,1,4,1],left:[-1,0,8,2]};
  const gen=()=>{N=Math.min(8+sc*2,16);m=Array(N*N).fill(0);const seen=Array(N*N).fill(false),st=[0];seen[0]=true;
    while(st.length){const i=st[st.length-1],cx=i%N,cy=(i/N)|0;const o=Object.values(D).filter(([dx,dy])=>{const a=cx+dx,b=cy+dy;return a>=0&&b>=0&&a<N&&b<N&&!seen[b*N+a]});
      if(!o.length){st.pop();continue}const [dx,dy,bit,opp]=o[R(o.length)],j=(cy+dy)*N+cx+dx;m[i]|=bit;m[j]|=opp;seen[j]=true;st.push(j)}x=y=0};
  const pc=v=>(v&1)+((v>>1)&1)+((v>>2)&1)+((v>>3)&1);
  const draw=()=>{const S=300/N;cls(g,300,300);g.fillStyle=C.yel;g.fillRect((N-1)*S+S*.2,(N-1)*S+S*.2,S*.6,S*.6);g.strokeStyle=C.blue;g.lineWidth=2;g.beginPath();
    m.forEach((v,i)=>{const a=(i%N)*S,b=((i/N)|0)*S;if(!(v&1)){g.moveTo(a,b);g.lineTo(a+S,b)}if(!(v&8)){g.moveTo(a,b);g.lineTo(a,b+S)}if(!(v&2)){g.moveTo(a+S,b);g.lineTo(a+S,b+S)}if(!(v&4)){g.moveTo(a,b+S);g.lineTo(a+S,b+S)}});g.stroke();
    g.fillStyle=C.pink;g.beginPath();g.arc(x*S+S/2,y*S+S/2,S*.3,0,7);g.fill()};
  const ck=ctx.clock(60,()=>ctx.over('Time up'));
  const move=k=>{const d=D[k];if(!d)return;let n=0;while(m[y*N+x]&d[2]){x+=d[0];y+=d[1];n++;if((x===N-1&&y===N-1)||pc(m[y*N+x])!==2)break}
    if(x===N-1&&y===N-1){ctx.score(++sc);ck.t+=20;gen()}draw()};
  ctx.keys(move);ctx.swipe(ctx.stage,move);gen();draw();
},{sl:'Mazes'});

reg('memory','Memory Match','Puzzle','Flip two cards at a time and find all eight pairs in as few turns as you can.',ctx=>{
  const SY=['★','◆','●','▲','■','♥','♣','☼'];const d=shuffle([...Array(16).keys()].map(i=>i>>1));
  const st=Array(16).fill(0);let a=-1,lock=false,mv=0,found=0;const cs=ctx.grid(4,16,360,8);
  const draw=()=>cs.forEach((c,i)=>{c.textContent=st[i]?SY[d[i]]:'';c.style.color=PAL[d[i]%7];c.style.fontSize='clamp(22px,8vw,36px)';c.style.background=st[i]===2?'#120d1d':st[i]?C.panel:'#3a2f5a'});
  cs.forEach((c,i)=>{c.setAttribute('aria-label','Card '+(i+1));ctx.on(c,'click',()=>{if(ctx.paused||lock||st[i])return;st[i]=1;draw();if(a<0){a=i;return}ctx.score(++mv);const b=a;a=-1;
    if(d[b]===d[i]){st[b]=st[i]=2;draw();if(++found===8)ctx.over('All matched')}else{lock=true;ctx.after(700,()=>{st[b]=st[i]=0;lock=false;draw()})}})});draw();
},{low:true,sl:'Turns'});

reg('code','Code Breaker','Puzzle','Crack the hidden four-colour code in ten guesses. Colours can repeat. After each guess you learn how many are exact and how many are the right colour in the wrong place.',ctx=>{
  const code=[0,1,2,3].map(()=>R(6));let cur=[],n=0;const log=$('div','',ctx.stage);log.style.cssText='display:flex;flex-direction:column;gap:6px;width:100%;max-width:340px';
  const peg=(p,c)=>{const e=$('span','',p);e.style.cssText=`display:inline-block;width:26px;height:26px;border-radius:50%;background:${c==null?'transparent':PAL[c]};border:2px solid ${c==null?C.line:PAL[c]}`;return e};
  const now=$('div','row',ctx.stage);const draw=()=>{now.textContent='';for(let i=0;i<4;i++)peg(now,cur[i])};
  const r=ctx.row();for(let c=0;c<6;c++){const k=ctx.btn(r,'',()=>{if(cur.length<4){cur.push(c);draw()}});k.style.background=PAL[c];k.style.borderColor=PAL[c];k.style.width='44px';k.setAttribute('aria-label','Colour '+(c+1))}
  const r2=ctx.row();ctx.btn(r2,'Undo',()=>{cur.pop();draw()});ctx.btn(r2,'Check',()=>{if(cur.length<4)return;let ex=0,cl=0;const a=[],b=[];cur.forEach((c,i)=>{if(c===code[i])ex++;else{a.push(c);b.push(code[i])}});a.forEach(c=>{const j=b.indexOf(c);if(j>=0){cl++;b.splice(j,1)}});
    const row=$('div','',log);row.style.cssText='display:flex;gap:6px;align-items:center;justify-content:space-between';const l=$('span','',row);l.style.cssText='display:flex;gap:6px';cur.forEach(c=>peg(l,c));$('span','',row,ex+' exact, '+cl+' close');
    ctx.score(++n);ctx.info('Guess '+n+' / 10');if(ex===4)return ctx.over('Code cracked');if(n>=10){const s=$('div','row',ctx.stage);$('span','note',s,'The code was');code.forEach(c=>peg(s,c));return ctx.over('Locked out',null)}cur=[];draw()},'pri');
  ctx.info('Guess 0 / 10');draw();
},{low:true,sl:'Guesses'});

reg('pop','Block Pop','Puzzle','Tap a group of two or more touching blocks of the same colour to pop them. Bigger groups score far more.',ctx=>{
  const CW=10,CH=12,S=30,{cv,g}=ctx.canvas(300,360);let cols=Array.from({length:CW},()=>Array.from({length:CH},()=>R(4))),sc=0;
  const grp=(c,r)=>{const col=cols[c][r],seen=new Set([c+','+r]),st=[[c,r]];while(st.length){const [a,b]=st.pop();[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const x=a+dx,y=b+dy,k=x+','+y;if(cols[x]&&cols[x][y]===col&&!seen.has(k)){seen.add(k);st.push([x,y])}})}return seen};
  const any=()=>cols.some((cl,c)=>cl.some((v,r)=>cl[r+1]===v||(cols[c+1]&&cols[c+1][r]===v)));
  const draw=()=>{cls(g,300,360);cols.forEach((cl,c)=>cl.forEach((v,r)=>{g.fillStyle=PAL[v];g.fillRect(c*S+1,360-(r+1)*S+1,S-2,S-2)}))};
  ctx.on(cv,'pointerdown',e=>{e.preventDefault();if(ctx.paused)return;const q=cv.pos(e),c=(q.x/S)|0,r=((360-q.y)/S)|0;if(!cols[c]||cols[c][r]==null)return;const s=grp(c,r);if(s.size<2)return;
    cols=cols.map((cl,x)=>cl.filter((_,y)=>!s.has(x+','+y))).filter(cl=>cl.length);sc+=s.size*(s.size-1);if(!cols.length)sc+=500;ctx.score(sc);draw();if(!any())ctx.over(cols.length?'No more groups':'Board cleared')});draw();
});

/* ================= BOARD ================= */
reg('ttt','Tic-Tac-Toe','Board','You are X. Get three in a row before the computer does.',ctx=>{
  const b=Array(9).fill(0),L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];let busy=false;const cs=ctx.grid(3,9,330,8);
  const win=p=>L.some(l=>l.every(i=>b[i]===p)),full=()=>b.every(v=>v);
  const mm=p=>{if(win(-p))return -1;if(full())return 0;let best=-2;for(let i=0;i<9;i++)if(!b[i]){b[i]=p;best=Math.max(best,-mm(-p));b[i]=0}return best};
  const draw=()=>cs.forEach((c,i)=>{c.textContent=b[i]===1?'X':b[i]===-1?'O':'';c.style.color=b[i]===1?C.teal:C.red;c.style.fontSize='clamp(34px,14vw,60px)'});
  const end=()=>{if(win(1))return ctx.over('You win'),true;if(win(-1))return ctx.over('Computer wins'),true;if(full())return ctx.over('Draw'),true;return false};
  cs.forEach((c,i)=>{c.setAttribute('aria-label','Square '+(i+1));ctx.on(c,'click',()=>{if(ctx.paused||busy||b[i])return;b[i]=1;draw();if(end())return;busy=true;ctx.after(350,()=>{const free=b.map((v,k)=>v?-1:k).filter(k=>k>=0);let pick=free[R(free.length)];
    if(Math.random()>.25){let bs=-2;for(const k of free){b[k]=-1;const s=-mm(1);b[k]=0;if(s>bs){bs=s;pick=k}}}b[pick]=-1;busy=false;draw();end()})})});draw();
},{ns:true});

reg('four','Four in a Row','Board','Tap a column to drop a disc. Line up four of yours in any direction before the computer does.',ctx=>{
  const W=7,H=6,b=Array(42).fill(0),lines=[];let busy=false;
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)[[0,1],[1,0],[1,1],[1,-1]].forEach(([dr,dc])=>{const l=[];for(let k=0;k<4;k++){const y=r+dr*k,x=c+dc*k;if(y<0||y>=H||x<0||x>=W)return;l.push(y*W+x)}lines.push(l)});
  const low=c=>{for(let r=H-1;r>=0;r--)if(!b[r*W+c])return r*W+c;return -1};
  const won=p=>lines.some(l=>b[l[0]]===p&&b[l[1]]===p&&b[l[2]]===p&&b[l[3]]===p);
  const ev=p=>{let s=0;for(const l of lines){let a=0,o=0;for(const i of l){if(b[i]===p)a++;else if(b[i])o++}if(!o)s+=[0,1,5,40,0][a];if(!a)s-=[0,1,5,40,0][o]}return s};
  const nm=(d,al,be,p)=>{if(won(-p))return -10000-d;if(!d)return ev(p);let best=-1e9,any=false;for(const c of[3,2,4,1,5,0,6]){const i=low(c);if(i<0)continue;any=true;b[i]=p;const v=-nm(d-1,-be,-al,-p);b[i]=0;if(v>best)best=v;if(v>al)al=v;if(al>=be)break}return any?best:0};
  const cs=ctx.grid(W,42,420,5);const draw=()=>cs.forEach((c,i)=>{c.style.borderRadius='50%';c.style.background=b[i]===1?C.yel:b[i]===-1?C.red:'';c.style.borderColor=b[i]===1?C.yel:b[i]===-1?C.red:''});
  const end=()=>{if(won(1))return ctx.over('You win'),true;if(won(-1))return ctx.over('Computer wins'),true;if(b.every(v=>v))return ctx.over('Draw'),true;return false};
  cs.forEach((c,i)=>{c.setAttribute('aria-label','Column '+(i%W+1));ctx.on(c,'click',()=>{if(ctx.paused||busy)return;const j=low(i%W);if(j<0)return;b[j]=1;draw();if(end())return;busy=true;ctx.after(300,()=>{let bc=-1,bs=-1e9;for(const col of[3,2,4,1,5,0,6]){const k=low(col);if(k<0)continue;b[k]=-1;const s=-nm(4,-1e9,1e9,1)+Math.random()*.5;b[k]=0;if(s>bs){bs=s;bc=k}}b[bc]=-1;busy=false;draw();end()})})});draw();
},{ns:true});

reg('reversi','Reversi','Board','You are yellow. Place a disc to trap the computer\'s discs between yours and flip them. Small dots show where you can play. Most discs wins.',ctx=>{
  const N=8,b=Array(64).fill(0);b[27]=b[36]=-1;b[28]=b[35]=1;let busy=false;const cs=ctx.grid(N,64,420,3);
  const flips=(i,p)=>{if(b[i])return[];const x=i%N,y=(i/N)|0,out=[];for(let dy=-1;dy<2;dy++)for(let dx=-1;dx<2;dx++){if(!dx&&!dy)continue;const l=[];let a=x+dx,c=y+dy;while(a>=0&&c>=0&&a<N&&c<N&&b[c*N+a]===-p){l.push(c*N+a);a+=dx;c+=dy}if(l.length&&a>=0&&c>=0&&a<N&&c<N&&b[c*N+a]===p)out.push(...l)}return out};
  const moves=p=>{const o=[];for(let i=0;i<64;i++){const f=flips(i,p);if(f.length)o.push([i,f])}return o};
  const wt=i=>{const x=i%N,y=(i/N)|0,ex=x===0||x===7,ey=y===0||y===7;if(ex&&ey)return 100;const nx=x===1||x===6,ny=y===1||y===6;if((nx||ex)&&(ny||ey)&&(nx||ny))return -25;return ex||ey?8:0};
  const count=p=>b.filter(v=>v===p).length;
  const draw=()=>{const mv=new Set(busy?[]:moves(1).map(m=>m[0]));cs.forEach((c,i)=>{c.textContent='';c.style.borderRadius='4px';c.style.background='#1c3a3a';if(b[i]){const d=$('span','dot',c);d.style.background=b[i]===1?C.yel:C.red}else if(mv.has(i)){const d=$('span','dot',c);d.style.cssText='width:22%;height:22%;background:'+C.mut}});ctx.score(count(1));ctx.info('You '+count(1)+'  :  '+count(-1)+' Computer')};
  const fin=()=>{const a=count(1),c=count(-1);ctx.over(a>c?'You win':a<c?'Computer wins':'Draw')};
  const ai=()=>{const m=moves(-1);if(!m.length){busy=false;if(!moves(1).length)return draw(),fin();return draw()}let best=m[0],bs=-1e9;for(const mv of m){const s=wt(mv[0])+mv[1].length+Math.random();if(s>bs){bs=s;best=mv}}b[best[0]]=-1;best[1].forEach(i=>b[i]=-1);
    if(!moves(1).length){if(!moves(-1).length){busy=false;draw();return fin()}draw();return ctx.after(600,ai)}busy=false;draw()};
  cs.forEach((c,i)=>{c.setAttribute('aria-label','Square '+(i+1));ctx.on(c,'click',()=>{if(ctx.paused||busy)return;const f=flips(i,1);if(!f.length)return;b[i]=1;f.forEach(k=>b[k]=1);busy=true;draw();ctx.after(600,ai)})});draw();
},{sl:'Discs'});

reg('sea','Sea Battle','Board','Five ships hide on each grid. Tap the top grid to fire. Sink the whole enemy fleet before the computer sinks yours.',ctx=>{
  const N=8,SH=[4,3,3,2,2],TOT=14;const place=()=>{const g=Array(64).fill(0);SH.forEach((L,id)=>{for(;;){const h=R(2),x=R(h?N-L+1:N),y=R(h?N:N-L+1),cs=[];for(let k=0;k<L;k++)cs.push((y+(h?0:k))*N+x+(h?k:0));if(cs.every(i=>!g[i])){cs.forEach(i=>g[i]=id+1);break}}});return g};
  const en=place(),me=place(),es=Array(64).fill(0),ms=Array(64).fill(0);let eh=0,mh=0,shots=0,busy=false,q=[];
  $('p','note',ctx.stage,'Enemy waters');const ec=ctx.grid(N,64,340,3);$('p','note',ctx.stage,'Your fleet');const mc=ctx.grid(N,64,220,2);
  const paint=(c,ship,s,showShip)=>{c.style.borderRadius='3px';c.style.fontSize='clamp(10px,3vw,16px)';c.textContent=s===2?'✖':s===1?'•':'';c.style.color=s===2?C.bg:C.mut;c.style.background=s===2?C.red:showShip&&ship?'#3d5f8f':s===1?'#120d1d':''};
  const draw=()=>{ec.forEach((c,i)=>paint(c,en[i],es[i],false));mc.forEach((c,i)=>{paint(c,me[i],ms[i],true);c.classList.add('flat');c.tabIndex=-1});ctx.info('Enemy hull left '+(TOT-eh)+'   Yours '+(TOT-mh))};
  const ai=()=>{let i;do{i=q.length?q.pop():-1}while(i>=0&&ms[i]);if(i<0){const free=[];ms.forEach((s,k)=>{if(!s)free.push(k)});const par=free.filter(k=>((k%N)+((k/N)|0))%2===0);const pool=par.length?par:free;i=pool[R(pool.length)]}
    if(me[i]){ms[i]=2;mh++;const x=i%N,y=(i/N)|0;if(x>0)q.push(i-1);if(x<N-1)q.push(i+1);if(y>0)q.push(i-N);if(y<N-1)q.push(i+N)}else ms[i]=1;busy=false;draw();if(mh>=TOT)ctx.over('Fleet sunk',null)};
  ec.forEach((c,i)=>{c.setAttribute('aria-label','Target '+(i+1));ctx.on(c,'click',()=>{if(ctx.paused||busy||es[i])return;es[i]=en[i]?2:1;if(en[i])eh++;ctx.score(++shots);draw();if(eh>=TOT)return ctx.over('Enemy fleet sunk');busy=true;ctx.after(450,ai)})});draw();
},{low:true,sl:'Shots'});

reg('rps','Rock Paper Scissors','Board','Pick your throw. Rock beats scissors, scissors beats paper, paper beats rock. Your run ends on the first loss.',ctx=>{
  const NM=['Rock','Paper','Scissors'];let w=0;const out=$('p','big',ctx.stage,'Make a throw');const sub=$('p','note',ctx.stage,'Ties do not count against you.');const r=ctx.row();
  NM.forEach((n,i)=>ctx.btn(r,n,()=>{const a=R(3);if(a===i){out.textContent='Tie';sub.textContent='You both threw '+n.toLowerCase()+'.'}
    else if((i-a+3)%3===1){ctx.score(++w);out.textContent='You win';sub.textContent=n+' beats '+NM[a].toLowerCase()+'.'}
    else{out.textContent='You lose';sub.textContent=NM[a]+' beats '+n.toLowerCase()+'.';ctx.over('Run over')}},'pri'));
},{sl:'Wins'});
