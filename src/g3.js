
/* ================= WORDS & MATH ================= */
const W5='apple brave chair dance eagle flame grape house input jolly knife lemon mango night ocean piano queen river stone tiger uncle voice water youth zebra beach cloud dream earth field ghost heart index juice kneel light money noble olive pearl quiet robot sheep train unity vivid whale young angle blend crane drift elbow frost globe honey ivory joint koala laser magic nurse orbit plant quest radio solar torch urban vault wheat yield amber bacon candy delta ember fairy giant hotel image jewel karma lunar maple ninja oasis panda quilt ranch storm table ultra viper witch pixel crown spice track sword shine blaze climb'.split(' ').filter(w=>w.length===5);
const WL='planet rocket guitar castle dragon forest bridge garden island jungle market museum pirate puzzle rabbit silver spider summer tunnel wizard anchor basket candle desert engine falcon galaxy hammer jacket kitten ladder magnet napkin orange pencil quartz ribbon saddle temple violin walnut zipper balloon captain diamond elephant fortune gateway harvest journey kingdom lantern machine network octopus penguin rainbow sandwich thunder volcano whisper'.split(' ');
const keyboard=(ctx,press)=>{const kb=$('div','kb',ctx.stage),map={};['qwertyuiop','asdfghjkl','>zxcvbnm<'].forEach(r=>{const d=$('div','',kb);[...r].forEach(ch=>{const k=ch==='>'?'enter':ch==='<'?'back':ch;const b=$('button',k.length>1?'wide':'',d,ch==='>'?'↵':ch==='<'?'⌫':ch);if(k.length>1)b.setAttribute('aria-label',ch==='<'?'Delete':'Enter');map[k]=b;ctx.on(b,'click',()=>{if(!ctx.paused)press(k)})})});return map};

reg('word','Word Guess','Words & Math','Guess the five-letter word in six tries. Green is the right letter in the right place, yellow is in the word but elsewhere.',ctx=>{
  const ans=W5[R(W5.length)];let row=0,cur='';const cs=ctx.grid(5,30,300,5);cs.forEach(c=>{c.classList.add('flat');c.tabIndex=-1;c.style.textTransform='uppercase'});const st={};
  const draw=()=>{for(let i=0;i<5;i++)cs[row*5+i].textContent=cur[i]||''};
  const press=k=>{if(k==='back'){cur=cur.slice(0,-1);return draw()}if(k==='enter'){if(cur.length<5)return ctx.info('Type five letters first');ctx.info('');
      const res=Array(5).fill(0),pool=[...ans];for(let i=0;i<5;i++)if(cur[i]===ans[i]){res[i]=2;pool[i]=null}for(let i=0;i<5;i++)if(!res[i]){const j=pool.indexOf(cur[i]);if(j>=0){res[i]=1;pool[j]=null}}
      res.forEach((r,i)=>{const c=cs[row*5+i];c.style.background=[C.line,C.yel,C.teal][r];c.style.color=r?'#10231f':C.ink;st[cur[i]]=Math.max(st[cur[i]]||0,r+1);const kb=map[cur[i]];kb.style.background=['','#1a1429',C.yel,C.teal][st[cur[i]]];kb.style.color=st[cur[i]]>1?'#10231f':st[cur[i]]===1?C.mut:''});
      const g=cur;cur='';row++;ctx.score(row);if(g===ans)return ctx.over('Got it');if(row>=6){ctx.info('The word was '+ans.toUpperCase());return ctx.over('Out of tries',null)}return}
    if(/^[a-z]$/.test(k)&&cur.length<5){cur+=k;draw()}};
  const map=keyboard(ctx,press);ctx.keys(press);
},{low:true,sl:'Tries'});

reg('hangman','Hangman','Words & Math','Guess the word one letter at a time. Six wrong letters and the run ends. Each solved word scores a point.',ctx=>{
  let word,got,miss,sc=0;const {cv,g}=ctx.canvas(160,150,330);const out=$('p','big',ctx.stage);out.style.letterSpacing='.18em';const kg=$('div','g',ctx.stage);kg.style.gridTemplateColumns='repeat(9,1fr)';kg.style.maxWidth='420px';kg.style.gap='5px';const bs={};
  const fig=()=>{cls(g,160,150);g.strokeStyle=C.mut;g.lineWidth=3;g.beginPath();g.moveTo(20,140);g.lineTo(110,140);g.moveTo(40,140);g.lineTo(40,14);g.lineTo(100,14);g.lineTo(100,30);g.stroke();g.strokeStyle=C.ink;g.beginPath();
    if(miss>0){g.moveTo(112,42);g.arc(100,42,12,0,7)}if(miss>1){g.moveTo(100,54);g.lineTo(100,92)}if(miss>2){g.moveTo(100,64);g.lineTo(82,80)}if(miss>3){g.moveTo(100,64);g.lineTo(118,80)}if(miss>4){g.moveTo(100,92);g.lineTo(84,118)}if(miss>5){g.moveTo(100,92);g.lineTo(116,118)}g.stroke()};
  const draw=()=>{out.textContent=[...word].map(ch=>got.has(ch)?ch.toUpperCase():'_').join('');fig();ctx.info('Wrong '+miss+' / 6')};
  const fresh=()=>{word=WL[R(WL.length)];got=new Set();miss=0;Object.values(bs).forEach(b=>b.disabled=false);draw()};
  const press=k=>{if(!/^[a-z]$/.test(k)||got.has(k)||bs[k].disabled)return;bs[k].disabled=true;if(word.includes(k)){got.add(k);draw();if([...word].every(ch=>got.has(ch))){ctx.score(++sc);ctx.after(700,fresh)}}
    else{miss++;draw();if(miss>=6){out.textContent=word.toUpperCase();ctx.over('Run over')}}};
  [...'abcdefghijklmnopqrstuvwxyz'].forEach(ch=>{const b=$('button','c',kg,ch.toUpperCase());b.style.aspectRatio='auto';b.style.height='42px';bs[ch]=b;ctx.on(b,'click',()=>{if(!ctx.paused)press(ch)})});
  ctx.keys(press);fresh();
},{sl:'Words'});

reg('typing','Typing Sprint','Words & Math','Type each word as it appears. It moves on by itself when you get it right. You have 45 seconds from your first key.',ctx=>{
  const pool=shuffle([...W5,...WL]);let i=0,sc=0,started=false;const out=$('p','big',ctx.stage,pool[0]);const nx=$('p','note',ctx.stage,'Next: '+pool[1]);
  const inp=$('input','txt',ctx.stage);inp.id='typing-in';inp.type='text';inp.setAttribute('aria-label','Type the word here');inp.autocapitalize='off';inp.autocomplete='off';inp.spellcheck=false;inp.setAttribute('autocorrect','off');inp.placeholder='Type here';
  ctx.on(inp,'input',()=>{if(ctx.paused)return;if(!started){started=true;ctx.clock(45,()=>{inp.blur();ctx.over('Time up')})}const v=inp.value.trim().toLowerCase();out.style.color=pool[i].startsWith(v)?'':C.red;
    if(v===pool[i]){ctx.score(++sc);i=(i+1)%pool.length;out.textContent=pool[i];nx.textContent='Next: '+pool[(i+1)%pool.length];inp.value=''}});
  ctx.btn(ctx.row(),'Tap here to start typing',()=>inp.focus());
},{sl:'Words'});

reg('math','Math Sprint','Words & Math','Pick the right answer as fast as you can. 45 seconds on the clock, and a wrong answer costs three of them.',ctx=>{
  let sc=0,ans;const out=$('p','big',ctx.stage);const cs=ctx.grid(2,4,360,10);cs.forEach(c=>{c.style.aspectRatio='2.2';c.style.fontSize='clamp(20px,6vw,28px)'});
  const ck=ctx.clock(45,()=>ctx.over('Time up'));
  const next=()=>{const lv=Math.min(4,1+(sc/5|0)),op=R(lv>1?3:2);let a,b;if(op===2){a=2+R(4+lv*2);b=2+R(9);ans=a*b;out.textContent=a+' × '+b}else{a=3+R(10*lv);b=2+R(10*lv);if(op===1){if(b>a)[a,b]=[b,a];ans=a-b;out.textContent=a+' − '+b}else{ans=a+b;out.textContent=a+' + '+b}}
    const o=new Set([ans]);while(o.size<4){const v=ans+(R(2)?1:-1)*(1+R(9));if(v>=0)o.add(v)}shuffle([...o]).forEach((v,i)=>{cs[i].textContent=v;cs[i].dataset.v=v})};
  cs.forEach(c=>ctx.on(c,'click',()=>{if(ctx.paused)return;if(+c.dataset.v===ans){ctx.score(++sc);ctx.info('')}else{ck.t=Math.max(.1,ck.t-3);ctx.info('Wrong, minus 3 seconds')}next()}));next();
});

reg('anagram','Anagram','Words & Math','Tap the letters in the right order to spell the word. 75 seconds. Skipping costs five of them.',ctx=>{
  let sc=0,word,pick,tiles;const out=$('p','big',ctx.stage);out.style.letterSpacing='.14em';out.style.minHeight='1.2em';const tr=ctx.row();const ck=ctx.clock(75,()=>ctx.over('Time up'));
  const draw=()=>{out.textContent=pick.map(i=>tiles[i]).join('').toUpperCase()||'·';[...tr.children].forEach((b,i)=>b.disabled=pick.includes(i))};
  const next=()=>{word=WL[R(WL.length)];do{tiles=shuffle([...word])}while(tiles.join('')===word);pick=[];tr.textContent='';tiles.forEach((ch,i)=>{const b=ctx.btn(tr,ch.toUpperCase(),()=>{pick.push(i);draw();if(pick.length===word.length){if(pick.map(j=>tiles[j]).join('')===word){ctx.score(++sc);ctx.info('');next()}else{ctx.info('Not a match. Clear and try again.')}}});b.style.minWidth='44px';b.style.fontSize='20px'});draw()};
  const r=ctx.row();ctx.btn(r,'Undo',()=>{pick.pop();ctx.info('');draw()});ctx.btn(r,'Clear',()=>{pick=[];ctx.info('');draw()});ctx.btn(r,'Skip',()=>{ck.t=Math.max(.1,ck.t-5);ctx.info('It was '+word.toUpperCase());next()});next();
},{sl:'Words'});

/* ================= CARDS & REFLEX ================= */
const deck=()=>{const d=[];for(let s=0;s<4;s++)for(let r=1;r<=13;r++)d.push({r,s});return shuffle(d)};
const cardEl=(p,c)=>{if(!c)return $('div','card back',p);const e=$('div','card'+(c.s===1||c.s===2?' red':''),p,(['A',2,3,4,5,6,7,8,9,10,'J','Q','K'][c.r-1])+'♠♥♦♣'[c.s]);return e};

reg('blackjack','Blackjack','Cards & Reflex','Get closer to 21 than the dealer without going over. Each hand costs 10 chips. Cash out to bank your score.',ctx=>{
  let chips=100,d=deck(),ph=[],dh=[],bet=10,live=false,hide=true;
  const val=h=>{let s=0,a=0;for(const c of h){s+=c.r>10?10:c.r===1?11:c.r;if(c.r===1)a++}while(s>21&&a){s-=10;a--}return s};
  $('p','note',ctx.stage,'Dealer');const dz=$('div','hand',ctx.stage);const msg=$('p','big',ctx.stage,'');msg.style.fontSize='clamp(20px,6vw,28px)';msg.style.minHeight='1.2em';const pz=$('div','hand',ctx.stage);const pl=$('p','note',ctx.stage,'You');
  const r=ctx.row();const bD=ctx.btn(r,'Deal',()=>deal(),'pri'),bH=ctx.btn(r,'Hit',()=>hit()),bS=ctx.btn(r,'Stand',()=>stand()),bX=ctx.btn(r,'Double',()=>dbl()),bC=ctx.btn(r,'Cash out',()=>ctx.over('Cashed out',chips));
  const draw=()=>{dz.textContent='';dh.forEach((c,i)=>cardEl(dz,hide&&i===1?null:c));pz.textContent='';ph.forEach(c=>cardEl(pz,c));pl.textContent=ph.length?'You: '+val(ph):'You';ctx.score(chips);
    bD.hidden=bC.hidden=live;bH.hidden=bS.hidden=bX.hidden=!live;bX.disabled=ph.length!==2||chips<bet*2};
  const settle=()=>{hide=false;live=false;const p=val(ph),q=val(dh);let w;if(p>21)w=-1;else if(p===21&&ph.length===2&&!(q===21&&dh.length===2))w=1.5;else if(q>21||p>q)w=1;else if(p===q)w=0;else w=-1;
    chips+=Math.round(bet*w);msg.textContent=p>21?'Bust':w>1?'Blackjack':w>0?'You win':w===0?'Push':'Dealer wins';draw();if(chips<10)ctx.over('Out of chips',null)};
  const stand=()=>{while(val(dh)<17)dh.push(d.pop());settle()};
  const hit=()=>{ph.push(d.pop());if(val(ph)>21)settle();else if(val(ph)===21)stand();else draw()};
  const dbl=()=>{bet*=2;ph.push(d.pop());if(val(ph)>21)settle();else stand()};
  const deal=()=>{if(d.length<16)d=deck();bet=10;ph=[d.pop(),d.pop()];dh=[d.pop(),d.pop()];live=true;hide=true;msg.textContent='';if(val(ph)===21)return stand();draw()};
  draw();ctx.score(100);
},{sl:'Chips'});

reg('hilo','Higher or Lower','Cards & Reflex','Will the next card be higher or lower? Aces are low, and an equal card counts as correct. One miss ends the run.',ctx=>{
  let d=deck(),c=d.pop(),sc=0;const hz=$('div','hand',ctx.stage);const msg=$('p','note',ctx.stage,'');const draw=()=>{hz.textContent='';cardEl(hz,c)};
  const go=hi=>{if(!d.length)d=deck();const n=d.pop(),ok=n.r===c.r||(hi?n.r>c.r:n.r<c.r);c=n;draw();if(ok){ctx.score(++sc);msg.textContent='Correct'}else{msg.textContent='';ctx.over('Run over')}};
  const r=ctx.row();ctx.btn(r,'Higher',()=>go(true),'pri');ctx.btn(r,'Lower',()=>go(false));ctx.keys(k=>{if(k==='up')go(true);if(k==='down')go(false)});draw();
},{sl:'Streak'});

reg('echo','Echo','Cards & Reflex','Watch the pads light up, then repeat the pattern. It gets one step longer every round.',ctx=>{
  const cs=ctx.grid(2,4,340,12),seq=[];let pos=0,busy=true,sc=0;const COL=[C.red,C.yel,C.teal,C.blue];
  cs.forEach((c,i)=>{c.style.background=COL[i];c.style.borderColor=COL[i];c.style.opacity=.35;c.style.borderRadius='18px';c.setAttribute('aria-label','Pad '+(i+1))});
  const flash=(i,ms)=>{cs[i].style.opacity=1;ctx.after(ms,()=>cs[i].style.opacity=.35)};
  const round=()=>{busy=true;pos=0;seq.push(R(4));ctx.info('Watch');seq.forEach((s,k)=>ctx.after(500+k*520,()=>flash(s,300)));ctx.after(500+seq.length*520,()=>{busy=false;ctx.info('Your turn')})};
  cs.forEach((c,i)=>ctx.on(c,'pointerdown',e=>{e.preventDefault();if(ctx.paused||busy)return;flash(i,160);if(seq[pos]!==i)return ctx.over('Wrong pad');pos++;if(pos===seq.length){ctx.score(++sc);busy=true;ctx.after(500,round)}}));
  ctx.after(400,round);
},{sl:'Rounds'});

reg('reaction','Reaction Time','Cards & Reflex','Wait for the panel to turn green, then tap it as fast as you can. Five rounds, and your score is the average in milliseconds.',ctx=>{
  const b=$('button','btn',ctx.stage);b.style.cssText='width:100%;max-width:420px;height:min(46dvh,320px);font-size:24px;touch-action:manipulation';let st=0,t0=0,times=[],token=0;
  const arm=()=>{st=1;b.textContent='Wait for green';b.style.background=C.red;b.style.color='#1b0a0a';const my=++token;ctx.after(1100+R(2400),()=>{if(my!==token||st!==1)return;st=2;t0=performance.now();b.textContent='Tap';b.style.background=C.teal;b.style.color='#06251f'})};
  ctx.on(b,'pointerdown',e=>{e.preventDefault();if(ctx.paused)return;if(st===0||st===3)return arm();if(st===1){token++;st=3;b.textContent='Too early. Tap to retry.';b.style.background=C.yel;b.style.color='#1b1400';return}
    const ms=Math.round(performance.now()-t0);times.push(ms);ctx.info('Round '+times.length+' / 5: '+ms+' ms');const avg=Math.round(times.reduce((a,c)=>a+c,0)/times.length);ctx.score(avg);if(times.length>=5)return ctx.over('Done',avg);st=3;b.textContent=ms+' ms. Tap for the next round.';b.style.background='';b.style.color=''});
  b.textContent='Tap to begin';
},{low:true,sl:'Avg ms'});

reg('aim','Aim Trainer','Cards & Reflex','Hit as many targets as you can in 30 seconds. They shrink as your score climbs, and a miss costs a point.',ctx=>{
  const W=320,H=400,{cv,g}=ctx.canvas(W,H);let t,sc=0;const mk=()=>{const r=Math.max(12,26-sc*.4);t={x:r+R(W-2*r),y:r+R(H-2*r),r}};mk();
  const draw=()=>{cls(g,W,H);g.fillStyle=C.red;g.beginPath();g.arc(t.x,t.y,t.r,0,7);g.fill();g.fillStyle=C.ink;g.beginPath();g.arc(t.x,t.y,t.r*.6,0,7);g.fill();g.fillStyle=C.red;g.beginPath();g.arc(t.x,t.y,t.r*.25,0,7);g.fill()};
  ctx.on(cv,'pointerdown',e=>{e.preventDefault();if(ctx.paused)return;const q=cv.pos(e);if(Math.hypot(q.x-t.x,q.y-t.y)<=t.r+3){sc++;mk()}else sc=Math.max(0,sc-1);ctx.score(sc);draw()});
  ctx.clock(30,()=>ctx.over('Time up'));draw();
},{sl:'Hits'});

reg('mole','Mole Bash','Cards & Reflex','Tap the moles the moment they pop up. 30 seconds, and they get quicker as you go.',ctx=>{
  const cs=ctx.grid(3,9,360,10);let act=-1,sc=0,token=0;cs.forEach((c,i)=>{c.style.borderRadius='50%';c.style.background='#2a1f1a';c.style.borderColor='#4a372c';c.setAttribute('aria-label','Hole '+(i+1))});
  const hide=()=>{if(act>=0){cs[act].textContent=''}act=-1};
  const pop=()=>{hide();let i;do{i=R(9)}while(i===act);act=i;const d=$('span','dot',cs[i]);d.style.background=C.org;const my=++token;ctx.after(Math.max(420,950-sc*18),()=>{if(my===token){hide();ctx.after(180,pop)}})};
  cs.forEach((c,i)=>ctx.on(c,'pointerdown',e=>{e.preventDefault();if(ctx.paused||i!==act)return;ctx.score(++sc);token++;hide();ctx.after(160,pop)}));
  ctx.clock(30,()=>ctx.over('Time up'));ctx.after(500,pop);
},{sl:'Moles'});

reg('hunt','Number Hunt','Cards & Reflex','Tap the numbers 1 to 25 in order as fast as you can. The clock starts on your first tap.',ctx=>{
  const cs=ctx.grid(5,25,380,6),ord=shuffle([...Array(25).keys()].map(i=>i+1));let next=1,t0=0;ctx.info('Find 1');
  cs.forEach((c,i)=>{c.textContent=ord[i];ctx.on(c,'pointerdown',e=>{e.preventDefault();if(ctx.paused||ord[i]!==next)return;if(next===1)t0=performance.now();c.classList.add('dim');c.style.color=C.line;next++;
    if(next>25){const s=Math.round((performance.now()-t0)/100)/10;ctx.score(s);return ctx.over('All found',s)}ctx.info('Find '+next)})});
  ctx.loop(()=>{if(t0)ctx.score((Math.round((performance.now()-t0)/100)/10).toFixed(1))});
},{low:true,sl:'Seconds'});
