
/* ================= WORDS & MATH ================= */
const W5='apple brave chair dance eagle flame grape house input jolly knife lemon mango night ocean piano queen river stone tiger uncle voice water youth zebra beach cloud dream earth field ghost heart index juice kneel light money noble olive pearl quiet robot sheep train unity vivid whale young angle blend crane drift elbow frost globe honey ivory joint koala laser magic nurse orbit plant quest radio solar torch urban vault wheat yield amber bacon candy delta ember fairy giant hotel image jewel karma lunar maple ninja oasis panda quilt ranch storm table ultra viper witch pixel crown spice track sword shine blaze climb'.split(' ').filter(w=>w.length===5);
const WL='planet rocket guitar castle dragon forest bridge garden island jungle market museum pirate puzzle rabbit silver spider summer tunnel wizard anchor basket candle desert engine falcon galaxy hammer jacket kitten ladder magnet napkin orange pencil quartz ribbon saddle temple violin walnut zipper balloon captain diamond elephant fortune gateway harvest journey kingdom lantern machine network octopus penguin rainbow sandwich thunder volcano whisper'.split(' ');
const keyboard=(ctx,press)=>{const kb=$('div','kb',ctx.stage),map={};['qwertyuiop','asdfghjkl','>zxcvbnm<'].forEach(r=>{const d=$('div','',kb);[...r].forEach(ch=>{const k=ch==='>'?'enter':ch==='<'?'back':ch;const b=$('button',k.length>1?'wide':'',d,ch==='>'?'↵':ch==='<'?'⌫':ch);if(k.length>1)b.setAttribute('aria-label',ch==='<'?'Delete':'Enter');map[k]=b;ctx.on(b,'click',()=>{if(!ctx.paused)press(k)})})});return map};

reg('word','Word Guess','Words & Math','Guess the five-letter word in six tries. Green is the right letter in the right place, yellow is in the word but elsewhere.',ctx=>{
  const ans=W5[R(W5.length)];let row=0,cur='',lock=false;const cs=ctx.grid(5,30,300,6);const st={};
  cs.forEach(c=>{c.classList.add('flat');c.tabIndex=-1;c.style.textTransform='uppercase';c.style.border='2px solid #3a2f5a';c.style.borderRadius='8px';c.style.fontSize='clamp(20px,6.5vw,30px)';c.style.background='transparent'});
  const draw=()=>{for(let i=0;i<5;i++){const c=cs[row*5+i];c.textContent=cur[i]||'';c.style.borderColor=cur[i]?'#a297c0':'#3a2f5a'}};
  const press=k=>{if(lock)return;if(k==='back'){cur=cur.slice(0,-1);beep(300,.03,'square',.025);return draw()}
    if(k==='enter'){if(cur.length<5){for(let i=0;i<5;i++)anim(cs[row*5+i],'shake');SFX.bad();return ctx.info('Type five letters first')}ctx.info('');lock=true;
      const res=Array(5).fill(0),pool=[...ans];for(let i=0;i<5;i++)if(cur[i]===ans[i]){res[i]=2;pool[i]=null}for(let i=0;i<5;i++)if(!res[i]){const j=pool.indexOf(cur[i]);if(j>=0){res[i]=1;pool[j]=null}}
      const gs=cur,r0=row;res.forEach((r,i)=>ctx.after(i*230,()=>{const c=cs[r0*5+i];c.style.background=['#3a2f5a','#e0b73a','#2fb59a'][r];c.style.borderColor='transparent';c.style.color=r?'#10231f':C.ink;anim(c,'flipy');beep([260,520,780][r],.07,'square',.04);
        st[gs[i]]=Math.max(st[gs[i]]||0,r+1);const kb=map[gs[i]];kb.style.background=['','#1a1429','#e0b73a','#2fb59a'][st[gs[i]]];kb.style.color=st[gs[i]]>1?'#10231f':st[gs[i]]===1?'#5a5070':''}));
      ctx.after(5*230+150,()=>{lock=false;row++;ctx.score(row);if(gs===ans){for(let i=0;i<5;i++)ctx.after(i*70,()=>anim(cs[r0*5+i],'pop'));return ctx.over('Got it',undefined,'win')}
        if(row>=6){ctx.info('The word was '+ans.toUpperCase());return ctx.over('Out of tries',null,'lose')}});cur='';return}
    if(/^[a-z]$/.test(k)&&cur.length<5){cur+=k;beep(600,.03,'square',.025);draw();anim(cs[row*5+cur.length-1],'pop')}};
  const map=keyboard(ctx,press);ctx.keys(press);
},{low:true,sl:'Tries'});

reg('hangman','Hangman','Words & Math','Guess the word one letter at a time. Six wrong letters and the run ends. Each solved word scores a point.',ctx=>{
  let word,got,miss,sc=0,sway=0;const {cv,g}=ctx.canvas(170,150,330);const out=$('div','row',ctx.stage);out.style.gap='5px';const kg=$('div','g',ctx.stage);kg.style.gridTemplateColumns='repeat(9,1fr)';kg.style.maxWidth='420px';kg.style.gap='5px';const bs={};
  const fig=()=>{g.fillStyle='#120d1d';g.fillRect(0,0,170,150);g.fillStyle='#2b2242';g.fillRect(0,138,170,12);
    g.fillStyle='#8a5a32';g.fillRect(28,12,7,128);g.fillRect(28,10,82,7);g.fillRect(14,134,52,6);g.save();g.translate(35,30);g.rotate(-.78);g.fillRect(0,-3,26,5);g.restore();
    g.strokeStyle='#d9c8a0';g.lineWidth=2;g.beginPath();g.moveTo(104,17);g.lineTo(104,30);g.stroke();
    g.save();g.translate(104,30);g.rotate(Math.sin(sway)*.05);g.strokeStyle='#f4eeff';g.lineWidth=3.5;g.lineCap='round';g.beginPath();
    if(miss>0){g.moveTo(11,12);g.arc(0,12,11,0,7)}if(miss>1){g.moveTo(0,23);g.lineTo(0,62)}if(miss>2){g.moveTo(0,32);g.lineTo(-17,50)}if(miss>3){g.moveTo(0,32);g.lineTo(17,50)}if(miss>4){g.moveTo(0,62);g.lineTo(-14,88)}if(miss>5){g.moveTo(0,62);g.lineTo(14,88)}g.stroke();
    if(miss>5){g.strokeStyle='#ff5d7a';g.lineWidth=2;g.beginPath();g.moveTo(-6,7);g.lineTo(-2,11);g.moveTo(-2,7);g.lineTo(-6,11);g.moveTo(2,7);g.lineTo(6,11);g.moveTo(6,7);g.lineTo(2,11);g.stroke()}g.restore()};
  const slots=()=>{out.textContent='';[...word].forEach(ch=>{const s=$('span','',out,got.has(ch)?ch.toUpperCase():'');s.style.cssText='width:30px;height:38px;border-bottom:3px solid #a297c0;display:grid;place-items:center;font:400 22px var(--display);color:#ffd84a';s.dataset.ch=ch})};
  const draw=()=>{fig();ctx.info('Wrong '+miss+' / 6')};
  const fresh=()=>{word=WL[R(WL.length)];got=new Set();miss=0;Object.values(bs).forEach(b=>{b.disabled=false;b.style.background='';b.style.color=''});slots();draw()};
  const press=k=>{if(!/^[a-z]$/.test(k)||!bs[k]||bs[k].disabled)return;bs[k].disabled=true;
    if(word.includes(k)){got.add(k);bs[k].style.background='#2fb59a';bs[k].style.color='#10231f';[...out.children].forEach(s=>{if(s.dataset.ch===k){s.textContent=k.toUpperCase();anim(s,'pop')}});beep(700,.06,'square',.04);beep(940,.08,'square',.04,.05);
      if([...word].every(ch=>got.has(ch))){ctx.score(++sc);SFX.win();ctx.info('Solved! Next word coming.');ctx.after(1100,fresh)}}
    else{miss++;sway=0;bs[k].style.background='#3a1a26';bs[k].style.color='#7a5060';SFX.thud();beep(180,.12,'sawtooth',.04);draw();if(miss>=6){[...out.children].forEach(s=>{if(!s.textContent){s.textContent=s.dataset.ch.toUpperCase();s.style.color='#ff5d7a'}});ctx.over('Run over',undefined,'lose')}}};
  [...'abcdefghijklmnopqrstuvwxyz'].forEach(ch=>{const b=$('button','c',kg,ch.toUpperCase());b.style.aspectRatio='auto';b.style.height='42px';b.style.borderRadius='8px';bs[ch]=b;ctx.on(b,'click',()=>{if(!ctx.paused)press(ch)})});
  ctx.keys(press);fresh();ctx.loop(dt=>{if(miss>5){sway+=dt*3;fig()}});
},{sl:'Words'});

reg('typing','Typing Sprint','Words & Math','Type each word as it appears. It moves on by itself when you get it right. You have 45 seconds from your first key.',ctx=>{
  const pool=shuffle([...W5,...WL]);let i=0,sc=0,started=false,chars=0,combo=0;const box=$('div','',ctx.stage);box.style.cssText='background:#211a33;border-radius:16px;padding:18px 12px;width:100%;max-width:380px;text-align:center';
  const out=$('p','big',box);out.style.letterSpacing='.04em';const nx=$('p','note',box);nx.style.margin='6px auto 0';
  const inp=$('input','txt',ctx.stage);inp.id='typing-in';inp.type='text';inp.setAttribute('aria-label','Type the word here');inp.autocapitalize='off';inp.autocomplete='off';inp.spellcheck=false;inp.setAttribute('autocorrect','off');inp.placeholder='Type here';
  const show=v=>{out.textContent='';const w=pool[i];[...w].forEach((ch,k)=>{const s=$('span','',out,ch);s.style.color=k<v.length?(v[k]===ch?'#2fd6b5':'#ff5d7a'):'#f4eeff';if(k===v.length)s.style.textDecoration='underline'});nx.textContent='Next: '+pool[(i+1)%pool.length]};show('');
  ctx.on(inp,'input',()=>{if(ctx.paused)return;if(!started){started=true;const t0=performance.now();ctx.clock(45,()=>{inp.blur();const wpm=Math.round(chars/5/((performance.now()-t0)/60000));ctx.info(wpm+' words per minute');ctx.over('Time up',undefined,'end')})}
    const v=inp.value.trim().toLowerCase();if(v.length&&!pool[i].startsWith(v)){combo=0;if(!inp._bad){beep(160,.05,'triangle',.06);anim(box,'shake')}inp._bad=1}else{inp._bad=0;if(v.length)beep(1100,.012,'square',.012)}
    if(v===pool[i]){chars+=v.length+1;ctx.score(++sc);combo++;beep(600+Math.min(combo,12)*50,.06,'square',.04);if(combo%5===0){SFX.ok();ctx.info(combo+' clean words in a row')}i=(i+1)%pool.length;inp.value='';show('');anim(out,'pop')}else show(v)});
  ctx.btn(ctx.row(),'Tap here to start typing',()=>inp.focus());
},{sl:'Words'});

reg('math','Math Sprint','Words & Math','Pick the right answer as fast as you can. 45 seconds on the clock. Wrong answers cost 3 seconds, and every 5 in a row adds 2.',ctx=>{
  let sc=0,ans,streak=0;const box=$('div','',ctx.stage);box.style.cssText='background:#211a33;border-radius:16px;padding:18px 12px;width:100%;max-width:360px';const out=$('p','big',box);out.style.fontSize='clamp(34px,11vw,50px)';
  const cs=ctx.grid(2,4,360,10);cs.forEach(c=>{c.style.aspectRatio='2.2';c.style.fontSize='clamp(22px,7vw,30px)';c.style.border='0';c.style.borderRadius='14px';c.style.background='linear-gradient(#3a2f5a,#2b2242)';c.style.boxShadow='0 4px 0 #120d1d'});
  const ck=ctx.clock(45,()=>ctx.over('Time up',undefined,'end'));
  const next=()=>{const lv=Math.min(4,1+(sc/5|0)),op=R(lv>1?3:2);let a,b;if(op===2){a=2+R(4+lv*2);b=2+R(9);ans=a*b;out.textContent=a+' × '+b}else{a=3+R(10*lv);b=2+R(10*lv);if(op===1){if(b>a)[a,b]=[b,a];ans=a-b;out.textContent=a+' − '+b}else{ans=a+b;out.textContent=a+' + '+b}}
    anim(out,'pop');const o=new Set([ans]);while(o.size<4){const v=ans+(R(2)?1:-1)*(1+R(9));if(v>=0)o.add(v)}shuffle([...o]).forEach((v,i)=>{cs[i].textContent=v;cs[i].dataset.v=v;cs[i].style.background='linear-gradient(#3a2f5a,#2b2242)'})};
  cs.forEach(c=>ctx.on(c,'click',()=>{if(ctx.paused)return;if(+c.dataset.v===ans){ctx.score(++sc);streak++;beep(700+Math.min(streak,10)*40,.06,'square',.045);
      if(streak%5===0){ck.t+=2;SFX.ok();ctx.info(streak+' in a row, plus 2 seconds')}else ctx.info(streak>1?streak+' in a row':'');c.style.background='#2fb59a';ctx.after(120,next)}
    else{streak=0;ck.t=Math.max(.1,ck.t-3);ctx.info('Wrong, minus 3 seconds');c.style.background='#c0394f';anim(c,'shake');SFX.bad();ctx.after(220,next)}}));next();
});

reg('anagram','Anagram','Words & Math','Tap the letter tiles in the right order to spell the word. 75 seconds. Skipping costs five of them.',ctx=>{
  let sc=0,word,pick,tiles;const slots=$('div','row',ctx.stage);slots.style.gap='5px';slots.style.minHeight='54px';const tr=ctx.row();tr.style.gap='6px';const ck=ctx.clock(75,()=>ctx.over('Time up',undefined,'end'));
  const PTS={a:1,e:1,i:1,o:1,u:1,l:1,n:1,s:1,t:1,r:1,d:2,g:2,b:3,c:3,m:3,p:3,f:4,h:4,v:4,w:4,y:4,k:5,j:8,x:8,q:10,z:10};
  const tile=(p,ch,ghost)=>{const s=$('span','',p);s.style.cssText=`width:40px;height:46px;border-radius:7px;display:grid;place-items:center;position:relative;font:700 22px var(--body);${ghost?'border:2px dashed #3a2f5a':'background:linear-gradient(#fbecc8,#e9cf98);color:#3b2410;box-shadow:0 3px 0 #a07a42'}`;if(ch&&!ghost){s.textContent=ch.toUpperCase();const pt=$('small','',s,String(PTS[ch]||1));pt.style.cssText='position:absolute;right:4px;bottom:2px;font-size:9px'}return s};
  const draw=()=>{slots.textContent='';for(let k=0;k<word.length;k++){if(k<pick.length)anim(tile(slots,tiles[pick[k]]),k===pick.length-1?'pop':'x');else tile(slots,'',true)}[...tr.children].forEach((b,i)=>{b.style.visibility=pick.includes(i)?'hidden':'visible'})};
  const next=()=>{word=WL[R(WL.length)];do{tiles=shuffle([...word])}while(tiles.join('')===word);pick=[];tr.textContent='';
    tiles.forEach((ch,i)=>{const b=$('button','',tr);b.style.cssText='padding:0;border:0;background:none';b.setAttribute('aria-label',ch);tile(b,ch);ctx.on(b,'click',()=>{if(ctx.paused||pick.includes(i))return;pick.push(i);beep(500+pick.length*40,.04,'square',.035);draw();
      if(pick.length===word.length){if(pick.map(j=>tiles[j]).join('')===word){ctx.score(++sc);SFX.ok();ctx.info('');[...slots.children].forEach((s,k)=>ctx.after(k*40,()=>anim(s,'pop')));ctx.after(500,next)}else{SFX.bad();anim(slots,'shake');ctx.info('Not a match. Clear and try again.')}}})});draw()};
  const r=ctx.row();ctx.btn(r,'Undo',()=>{pick.pop();SFX.tap();ctx.info('');draw()});ctx.btn(r,'Clear',()=>{pick=[];SFX.tap();ctx.info('');draw()});ctx.btn(r,'Skip',()=>{ck.t=Math.max(.1,ck.t-5);beep(400,.15,'triangle',.05,0,150);ctx.info('It was '+word.toUpperCase());next()});next();
},{sl:'Words'});

/* ================= CARDS & REFLEX ================= */
const deck=()=>{const d=[];for(let s=0;s<4;s++)for(let r=1;r<=13;r++)d.push({r,s});return shuffle(d)};
const cardEl=(p,c,deal)=>{if(!c){const e=$('div','card back',p);if(deal)anim(e,'pop');return e}const rk=['A',2,3,4,5,6,7,8,9,10,'J','Q','K'][c.r-1],su='♠♥♦♣'[c.s];
  const e=$('div','card'+(c.s===1||c.s===2?' red':''),p);$('span','ck',e).innerHTML=rk+'<br>'+su;$('span','cs',e,su);$('span','ck2',e).innerHTML=rk+'<br>'+su;if(deal)anim(e,'pop');return e};

reg('blackjack','Blackjack','Cards & Reflex','Get closer to 21 than the dealer without going over. Tap the chips to set your bet before each deal. Cash out to bank your score.',ctx=>{
  let chips=100,d=deck(),ph=[],dh=[],bet=10,wager=10,live=false,hide=true,shownD=0,shownP=0;
  const felt=$('div','felt',ctx.stage);const dl=$('p','note',felt,'Dealer');const dz=$('div','hand',felt);const msg=$('p','big',felt,'');msg.style.cssText='font-size:clamp(20px,6vw,28px);min-height:1.2em;color:#fff3c4;text-shadow:0 2px 0 #0006';const pz=$('div','hand',felt);const pl=$('p','note',felt,'You');
  const cb=$('div','',felt);cb.style.cssText='display:flex;align-items:center;gap:8px;font-weight:700;color:#fff3c4';const chip=$('span','',cb);chip.style.cssText='width:22px;height:22px;border-radius:50%;background:radial-gradient(circle,#ffd84a 40%,#c9940f 42% 60%,#ffd84a 62%);border:2px dashed #fff8';const ct=$('span','',cb);
  // betting rack: tap chips to add, CLEAR to reset, ALL IN for everything
  const rack=$('div','',ctx.stage);rack.style.cssText='display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:8px';
  const bt=$('div','',rack);bt.style.cssText="font:12px 'Press Start 2P',monospace;color:#ffd84a;letter-spacing:1px";
  const cr=$('div','',rack);cr.style.cssText='display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center';
  const setW=v=>{wager=clamp(v,5,chips);bt.textContent='BET  '+wager;bD.textContent='Deal '+wager;anim(bt,'bump')};
  [[5,'#e9e4d8','#555'],[10,'#2f6fe0','#fff'],[25,'#1fa463','#fff'],[100,'#1c1c1c','#ffd84a'],[500,'#7b3fd1','#fff']].forEach(([v,bg,fg])=>{const c=$('button','',cr,String(v));
    c.style.cssText=`width:44px;height:44px;border-radius:50%;background:radial-gradient(circle,${bg} 52%,transparent 53%),repeating-conic-gradient(${bg} 0 30deg,#fff 30deg 45deg);color:${fg};border:2px solid #0006;font:9px 'Press Start 2P',monospace;box-shadow:0 3px 0 #0008;cursor:pointer;padding:0`;
    c.setAttribute('aria-label','Add '+v);c.onclick=()=>{if(live)return;if(wager>=chips){SFX.bad();anim(bt,'shake');return}const add=rack._t?v:v-wager;rack._t=1;setW(wager+add);beep(1300,.03,'square',.04);beep(900,.04,'square',.035,.03)};c._v=v});
  const r2=$('div','row',rack);ctx.btn(r2,'Clear',()=>{if(live)return;rack._t=0;wager=5;setW(5);SFX.tap()});ctx.btn(r2,'All in',()=>{if(live)return;rack._t=1;setW(chips);beep(220,.15,'sawtooth',.05,0,440)});
  const r=ctx.row();const bD=ctx.btn(r,'Deal',()=>deal(),'pri'),bH=ctx.btn(r,'Hit',()=>hit()),bS=ctx.btn(r,'Stand',()=>stand()),bX=ctx.btn(r,'Double',()=>dbl()),bC=ctx.btn(r,'Cash out',()=>ctx.over('Cashed out',chips,'end'));
  const val=h=>{let s=0,a=0;for(const c of h){s+=c.r>10?10:c.r===1?11:c.r;if(c.r===1)a++}while(s>21&&a){s-=10;a--}return s};
  const draw=()=>{dz.textContent='';dh.forEach((c,i)=>cardEl(dz,hide&&i===1?null:c,i>=shownD||(i===1&&!hide&&shownD<99)));shownD=hide?dh.length:99;pz.textContent='';ph.forEach((c,i)=>cardEl(pz,c,i>=shownP));shownP=ph.length;
    pl.textContent=ph.length?'You: '+val(ph):'You';dl.textContent=dh.length&&!hide?'Dealer: '+val(dh):'Dealer';ct.textContent=chips+' chips'+(live?'   ·   bet '+bet:'');ctx.score(chips);bD.hidden=bC.hidden=live;rack.style.display=live?'none':'flex';if(!live){wager=clamp(wager,Math.min(5,chips),chips);bt.textContent='BET  '+wager;bD.textContent='Deal '+wager}bH.hidden=bS.hidden=bX.hidden=!live;bX.disabled=ph.length!==2||chips<bet*2};
  const settle=()=>{hide=false;live=false;const p=val(ph),q=val(dh);let w;if(p>21)w=-1;else if(p===21&&ph.length===2&&!(q===21&&dh.length===2))w=1.5;else if(q>21||p>q)w=1;else if(p===q)w=0;else w=-1;
    chips+=Math.round(bet*w);msg.textContent=p>21?'Bust':w>1?'Blackjack!':w>0?(q>21?'Dealer busts. You win':'You win'):w===0?'Push':'Dealer wins';anim(msg,'pop');
    if(w>1){SFX.win();confetti()}else if(w>0)SFX.ok();else if(w<0)SFX.bad();else beep(500,.1,'triangle',.05);draw();if(chips<5)ctx.over('Out of chips',null,'lose')};
  const stand=()=>{SFX.tap();while(val(dh)<17)dh.push(d.pop());dh.slice(2).forEach((_,k)=>ctx.after(k*120,SFX.card));settle()};
  const hit=()=>{ph.push(d.pop());SFX.card();if(val(ph)>21)settle();else if(val(ph)===21)stand();else draw()};
  const dbl=()=>{bet*=2;ph.push(d.pop());SFX.card();if(val(ph)>21)settle();else stand()};
  const deal=()=>{if(d.length<16)d=deck();bet=Math.min(wager,chips);ph=[d.pop(),d.pop()];dh=[d.pop(),d.pop()];shownD=shownP=0;live=true;hide=true;msg.textContent='';[0,1,2,3].forEach(k=>ctx.after(k*90,SFX.card));if(val(ph)===21)return stand();draw()};
  draw();
},{sl:'Chips'});

reg('hilo','Higher or Lower','Cards & Reflex','Will the next card be higher or lower? Aces are low, and an equal card counts as correct. One miss ends the run.',ctx=>{
  let d=deck(),c=d.pop(),sc=0,hist=[];const felt=$('div','felt',ctx.stage);const hz=$('div','hand',felt);hz.style.transform='scale(1.35)';hz.style.margin='18px 0';const msg=$('p','big',felt,'');msg.style.cssText='font-size:22px;min-height:1.2em;color:#fff3c4';
  const hs=$('div','hand',felt);hs.style.cssText='transform:scale(.6);margin:-18px 0;min-height:82px;opacity:.75;flex-wrap:nowrap';
  const draw=()=>{hz.textContent='';cardEl(hz,c,true);hs.textContent='';hist.slice(-5).forEach(h=>cardEl(hs,h))};
  const go=hi=>{if(ctx.paused)return;if(!d.length)d=deck();const n=d.pop(),ok=n.r===c.r||(hi?n.r>c.r:n.r<c.r);hist.push(c);c=n;SFX.card();draw();
    if(ok){ctx.score(++sc);msg.textContent=sc%5===0?sc+' in a row!':'Correct';anim(msg,'pop');ctx.after(120,()=>{beep(600+Math.min(sc,15)*35,.07,'square',.045);if(sc%5===0)SFX.ok()})}else{msg.textContent='Wrong';anim(hz,'shake');ctx.over('Run over',undefined,'lose')}};
  const r=ctx.row();ctx.btn(r,'▲ Higher',()=>go(true),'pri');ctx.btn(r,'▼ Lower',()=>go(false));ctx.keys(k=>{if(k==='up')go(true);if(k==='down')go(false)});draw();
},{sl:'Streak'});

reg('echo','Echo','Cards & Reflex','Watch the pads light up and listen, then repeat the pattern. It gets one step longer every round.',ctx=>{
  const cs=ctx.grid(2,4,340,14),seq=[];let pos=0,busy=true,sc=0;const COL=['#2fd6b5','#ff5d7a','#ffd84a','#5aa9ff'],NOTE=[330,277,440,165];
  cs.forEach((c,i)=>{c.style.cssText+=`;background:${COL[i]};box-shadow:inset 0 6px 0 rgba(255,255,255,.3),inset 0 -8px 0 rgba(0,0,0,.25);border:0;opacity:.32;border-radius:${['60px 14px 14px 14px','14px 60px 14px 14px','14px 14px 14px 60px','14px 14px 60px 14px'][i]};transition:opacity .08s,box-shadow .08s`;c.setAttribute('aria-label','Pad '+(i+1))});
  const flash=(i,ms)=>{cs[i].style.opacity=1;cs[i].style.boxShadow=`inset 0 6px 0 rgba(255,255,255,.3),0 0 30px ${COL[i]}`;beep(NOTE[i],ms/1000,'triangle',.11);ctx.after(ms,()=>{cs[i].style.opacity=.32;cs[i].style.boxShadow='inset 0 6px 0 rgba(255,255,255,.3),inset 0 -8px 0 rgba(0,0,0,.25)'})};
  const round=()=>{busy=true;pos=0;seq.push(R(4));ctx.info('Watch');const gap=Math.max(260,520-seq.length*20);seq.forEach((s,k)=>ctx.after(500+k*gap,()=>flash(s,gap*.6)));ctx.after(500+seq.length*gap,()=>{busy=false;ctx.info('Your turn')})};
  cs.forEach((c,i)=>ctx.on(c,'pointerdown',e=>{e.preventDefault();if(ctx.paused||busy)return;if(seq[pos]!==i){cs.forEach(x=>anim(x,'shake'));beep(90,.6,'sawtooth',.08,0,60);ctx.paused=true;return ctx.over('Wrong pad')}flash(i,180);pos++;if(pos===seq.length){ctx.score(++sc);busy=true;ctx.info('Nice');ctx.after(650,round)}}));
  ctx.after(400,round);
},{sl:'Rounds'});

reg('reaction','Reaction Time','Cards & Reflex','Wait for the panel to turn green, then tap it as fast as you can. Five rounds, and your score is the average in milliseconds.',ctx=>{
  const b=$('button','btn',ctx.stage);b.style.cssText='width:100%;max-width:420px;height:min(46dvh,320px);font:400 26px var(--display);touch-action:manipulation;border:0;border-radius:20px;transition:background .1s';let st=0,t0=0,times=[],token=0;
  const hist=$('div','row',ctx.stage);
  const arm=()=>{st=1;b.textContent='Wait for green';b.style.background='#c0394f';b.style.color='#fff';beep(220,.08,'square',.04);const my=++token;ctx.after(1100+R(2400),()=>{if(my!==token||st!==1)return;st=2;t0=performance.now();b.textContent='TAP!';b.style.background='#2fd6b5';b.style.color='#06251f';beep(1200,.08,'square',.06)})};
  ctx.on(b,'pointerdown',e=>{e.preventDefault();if(ctx.paused)return;if(st===0||st===3)return arm();if(st===1){token++;st=3;b.textContent='Too early. Tap to retry.';b.style.background='#e0b73a';b.style.color='#1b1400';SFX.bad();anim(b,'shake');return}
    const ms=Math.round(performance.now()-t0);times.push(ms);const chip=$('span','',hist,ms+' ms');chip.style.cssText=`padding:6px 10px;border-radius:999px;font-weight:700;background:${ms<250?'#2fb59a':ms<350?'#e0b73a':'#c0394f'};color:#120d1d`;anim(chip,'pop');
    beep(ms<250?1000:ms<350?700:400,.1,'square',.05);ctx.info('Round '+times.length+' / 5');const avg=Math.round(times.reduce((a,c)=>a+c,0)/times.length);ctx.score(avg);
    if(times.length>=5)return ctx.over(avg<250?'Lightning fast':'Done',avg,avg<300?'win':'end');st=3;b.textContent=ms+' ms. Tap for the next round.';b.style.background='#3a2f5a';b.style.color=''});
  b.textContent='Tap to begin';b.style.background='#3a2f5a';
},{low:true,sl:'Avg ms'});

reg('aim','Aim Trainer','Cards & Reflex','Hit as many targets as you can in 30 seconds. They shrink as your score climbs, and a miss costs a point.',ctx=>{
  const W=320,H=400,{cv,g}=ctx.canvas(W,H);let t,sc=0,parts=[],txt=[],tt=0,combo=0;const mk=()=>{const r=Math.max(12,26-sc*.4);t={x:r+8+R(W-2*r-16),y:r+8+R(H-2*r-16),r,born:tt}};mk();
  ctx.on(cv,'pointerdown',e=>{e.preventDefault();if(ctx.paused)return;const q=cv.pos(e),d=Math.hypot(q.x-t.x,q.y-t.y);if(d<=t.r+3){sc++;combo++;const bull=d<t.r*.3;if(bull)sc++;burst(parts,t.x,t.y,'#ff5d7a',14,180);burst(parts,t.x,t.y,'#fff',8,120);
      txt.push({x:t.x,y:t.y,s:bull?'+2 BULLSEYE':'+1',l:.8});beep(bull?1100:700+Math.min(combo,10)*30,.06,'square',.045);mk()}
    else{sc=Math.max(0,sc-1);combo=0;txt.push({x:q.x,y:q.y,s:'-1',l:.6,bad:1});beep(160,.08,'triangle',.07);burst(parts,q.x,q.y,'#6b5a8a',5,60)}ctx.score(sc)});
  ctx.clock(30,()=>ctx.over('Time up',undefined,'end'));
  ctx.loop(dt=>{tt+=dt;g.fillStyle='#0e0a17';g.fillRect(0,0,W,H);g.strokeStyle='rgba(90,169,255,.08)';g.lineWidth=1;for(let x=0;x<W;x+=20){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()}for(let y=0;y<H;y+=20){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}
    const k=Math.min(1,(tt-t.born)*8),r=t.r*(.4+.6*k);g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(t.x+3,t.y+4,r,r,0,0,7);g.fill();
    [['#ff5d7a',1],['#fff',.75],['#ff5d7a',.5],['#fff',.28],['#ff5d7a',.12]].forEach(([c,f])=>{g.fillStyle=c;g.beginPath();g.arc(t.x,t.y,r*f,0,7);g.fill()});
    parts=drawParts(g,parts,dt,0);txt.forEach(q=>{q.l-=dt;q.y-=40*dt;g.globalAlpha=Math.max(0,q.l*1.4);g.fillStyle=q.bad?'#ff5d7a':'#ffd84a';g.font=FONT(15,700);g.textAlign='center';g.fillText(q.s,q.x,q.y-12)});g.globalAlpha=1;txt=txt.filter(q=>q.l>0)});
},{sl:'Hits'});

reg('mole','Mole Bash','Cards & Reflex','Bonk the moles the moment they pop up. Golden moles are worth 3. 30 seconds, and they get quicker as you go.',ctx=>{
  const cs=ctx.grid(3,9,360,14);boardBox(cs,'radial-gradient(circle at 50% 30%,#6cc25a,#3e8a3a)',16);let act=-1,gold=false,sc=0,token=0;
  cs.forEach((c,i)=>{c.style.cssText+=';border:0;border-radius:50%;background:radial-gradient(ellipse at 50% 60%,#2a170c 45%,#5a3a1f 47%,#7a5230 70%);box-shadow:inset 0 -4px 0 #4a2e17;overflow:hidden;position:relative';c.setAttribute('aria-label','Hole '+(i+1))});
  const mole=(c,gd)=>{const m=$('span','',c);m.style.cssText=`position:absolute;left:18%;right:18%;bottom:8%;height:70%;border-radius:45% 45% 20% 20%;background:${gd?'linear-gradient(#ffe58a,#d4a017)':'linear-gradient(#a0704a,#7a5230)'};box-shadow:inset 0 -6px 0 rgba(0,0,0,.2)`;
    m.innerHTML='<i style="position:absolute;left:24%;top:26%;width:12%;height:14%;border-radius:50%;background:#1b1326"></i><i style="position:absolute;right:24%;top:26%;width:12%;height:14%;border-radius:50%;background:#1b1326"></i><i style="position:absolute;left:40%;top:44%;width:20%;height:14%;border-radius:50%;background:#ff8fa8"></i><i style="position:absolute;left:30%;top:60%;width:40%;height:18%;border-radius:0 0 40% 40%;background:#f4e3cc"></i>';
    m.style.setProperty('--d','60px');m.style.animationDuration='.14s';anim(m,'dropin')};
  const hide=()=>{if(act>=0)cs[act].textContent='';act=-1};
  const pop=()=>{const prev=act;hide();let i;do{i=R(9)}while(i===prev);act=i;gold=Math.random()<.12;mole(cs[i],gold);beep(gold?900:500,.04,'square',.02);const my=++token;ctx.after(Math.max(420,(gold?750:950)-sc*15),()=>{if(my===token){hide();ctx.after(180,pop)}})};
  cs.forEach((c,i)=>ctx.on(c,'pointerdown',e=>{e.preventDefault();if(ctx.paused)return;if(i!==act){beep(130,.05,'triangle',.06);return}
    sc+=gold?3:1;ctx.score(sc);token++;const star=$('span','',c,gold?'+3':'✶');star.style.cssText='position:absolute;inset:0;display:grid;place-items:center;font:400 28px var(--display);color:#ffd84a;text-shadow:0 2px 0 #0008';anim(star,'pop');
    beep(gold?1200:300,.1,'square',.06,0,gold?1600:120);noise(.06,.15,0,900);act=-1;ctx.after(220,()=>{if(c.contains(star))c.textContent='';pop()})}));
  ctx.clock(30,()=>ctx.over('Time up',undefined,'end'));ctx.after(500,pop);
},{sl:'Moles'});

reg('hunt','Number Hunt','Cards & Reflex','Tap the numbers 1 to 25 in order as fast as you can. The clock starts on your first tap.',ctx=>{
  const cs=ctx.grid(5,25,380,6),ord=shuffle([...Array(25).keys()].map(i=>i+1));let next=1,t0=0;ctx.info('Find 1');
  cs.forEach((c,i)=>{c.textContent=ord[i];c.style.border='0';c.style.borderRadius='12px';c.style.color=PAL[ord[i]%7];c.style.fontSize='clamp(18px,6vw,28px)';c.style.background='#211a33';c.style.boxShadow='0 3px 0 #120d1d';
    ctx.on(c,'pointerdown',e=>{e.preventDefault();if(ctx.paused||c._done)return;if(ord[i]!==next){anim(c,'shake');beep(150,.08,'triangle',.07);return}if(next===1)t0=performance.now();c._done=1;c.style.background='#120d1d';c.style.color='#2b2242';c.style.boxShadow='none';anim(c,'pop');beep(400+next*28,.05,'square',.04);next++;
    if(next>25){const s=Math.round((performance.now()-t0)/100)/10;ctx.score(s);return ctx.over(s<20?'Speed hunter':'All found',s,'win')}ctx.info('Find '+next)})});
  ctx.loop(()=>{if(t0&&!ctx.done)ctx.score((Math.round((performance.now()-t0)/100)/10).toFixed(1))});
},{low:true,sl:'Seconds'});
