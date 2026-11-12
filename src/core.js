'use strict';
const $=(t,c,p,txt)=>{const e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;if(p)p.appendChild(e);if(t==='button')e.type='button';return e};
const R=n=>Math.floor(Math.random()*n);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=R(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const store={get(k){try{return JSON.parse(localStorage.getItem('pa_'+k))}catch(e){return null}},set(k,v){try{localStorage.setItem('pa_'+k,JSON.stringify(v))}catch(e){}}};
const C={bg:'#0e0a17',ink:'#f4eeff',mut:'#a297c0',red:'#ff5d5d',yel:'#ffc93c',teal:'#2fd6b5',blue:'#5aa9ff',pink:'#ff7ac6',line:'#3a2f5a',vio:'#9b7bff',org:'#ff9f43',panel:'#211a33'};
const PAL=[C.red,C.yel,C.teal,C.blue,C.pink,C.vio,C.org];
const FONT=(s,w=600)=>`${w} ${s}px "Chakra Petch",system-ui,sans-serif`;
const CATS=['Arcade','Puzzle','Board','Words & Math','Cards & Reflex'];
const CATVAR={'Arcade':'--arc','Puzzle':'--puz','Board':'--brd','Words & Math':'--wrd','Cards & Reflex':'--crd'};
const GAMES=[];
const reg=(id,name,cat,help,fn,opt)=>GAMES.push(Object.assign({id,name,cat,help,fn},opt||{}));
const el={};['home','game','bar','gname','score','best','slab','sbox','bbox','help','info','clock','stage','over','omsg','oscore','onew','again','quit','back','mute','shelf','chips','q','rand','tag','wrap'].forEach(i=>el[i]=document.getElementById(i));
const KEYMAP={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',' ':'space',Enter:'enter',Backspace:'back'};
let cur=null;
const noise=(dur=.15,vol=.08,when=0,hp=800)=>{if(MUTED||!AC||AC.state!=='running')return;try{const n=Math.floor(AC.sampleRate*dur),buf=AC.createBuffer(1,n,AC.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),gn=AC.createGain(),t=AC.currentTime+when;s.buffer=buf;f.type='bandpass';f.frequency.value=hp;gn.gain.value=vol;s.connect(f);f.connect(gn);gn.connect(AC.destination);s.start(t)}catch(e){}};
const SFX={tap:()=>beep(620,.04,'square',.03),tick:()=>beep(900,.025,'square',.025),ok:()=>{beep(660,.06,'square',.045);beep(990,.09,'square',.045,.06)},bad:()=>beep(150,.18,'sawtooth',.05,0,90),
  pop:(n=0)=>beep(400+n*60,.06,'square',.045,0,800+n*80),flip:()=>noise(.05,.12,0,2500),card:()=>noise(.07,.14,0,3200),thud:()=>beep(120,.09,'triangle',.12,0,60),
  win:()=>[523,659,784,1047,1319].forEach((f,i)=>beep(f,.12,'square',.05,i*.09)),lose:()=>{beep(330,.18,'square',.05);beep(247,.18,'square',.05,.18);beep(165,.4,'sawtooth',.05,.36,90)},
  end:()=>{beep(523,.1,'square',.05);beep(392,.18,'square',.05,.1)},boom:()=>{noise(.5,.25,0,300);beep(90,.45,'sawtooth',.06,0,30)}};
function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const cv=document.createElement('canvas');cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50';document.body.appendChild(cv);
  const w=cv.width=innerWidth,h=cv.height=innerHeight,g=cv.getContext('2d'),ps=Array.from({length:110},()=>({x:w/2+(Math.random()-.5)*w*.4,y:h*.35,vx:(Math.random()-.5)*9,vy:-Math.random()*11-3,r:Math.random()*6,c:PAL[R(PAL.length)],s:4+Math.random()*5}));let t0=performance.now();
  const f=t=>{const k=(t-t0)/1000;g.clearRect(0,0,w,h);ps.forEach(p=>{p.vy+=.32;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=.15;g.save();g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.globalAlpha=Math.max(0,1-k/2.4);g.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);g.restore()});if(k<2.4)requestAnimationFrame(f);else cv.remove()};requestAnimationFrame(f)}
const anim=(e,c)=>{if(!e)return;e.classList.remove(c);void e.offsetWidth;e.classList.add(c)};
/* sound: tiny synth beeps. Browsers only allow audio after a tap or key press, so unlock on the first one. */
let AC=null;
const unlockAudio=()=>{try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}};
['pointerdown','touchend','click','keydown'].forEach(ev=>window.addEventListener(ev,unlockAudio,true));
let MUTED=!!store.get('mute');
const beep=(f,dur=.08,type='square',vol=.06,when=0,f2)=>{if(MUTED||!AC||AC.state!=='running')return;try{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+when;o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+dur+.02)}catch(e){}};

function makeCtx(game){
  const stage=el.stage,cleanups=[];
  const ctx={stage,paused:false,done:false,dead:false,held:{},_s:0,_key:null,
    on(t,ev,fn,opt){t.addEventListener(ev,fn,opt);cleanups.push(()=>t.removeEventListener(ev,fn,opt))},
    score(n){ctx._s=n;el.score.textContent=n},
    info(t){el.info.textContent=t},
    loop(fn){let last=performance.now(),id;const f=t=>{if(ctx.dead)return;id=requestAnimationFrame(f);const dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;if(!ctx.paused)fn(dt)};id=requestAnimationFrame(f);cleanups.push(()=>cancelAnimationFrame(id))},
    every(ms,fn){const id=setInterval(()=>{if(!ctx.dead&&!ctx.paused)fn()},ms);cleanups.push(()=>clearInterval(id))},
    after(ms,fn){const id=setTimeout(()=>{if(!ctx.dead)fn()},ms);cleanups.push(()=>clearTimeout(id))},
    clock(sec,end){const o={t:sec};const show=()=>el.clock.textContent='Time '+Math.ceil(o.t);show();ctx.every(100,()=>{o.t-=.1;if(o.t<=0){o.t=0;show();end()}else show()});return o},
    canvas(w,h,reserve){const cv=$('canvas','cv',stage);const dpr=Math.min(2,window.devicePixelRatio||1);cv.width=w*dpr;cv.height=h*dpr;const g=cv.getContext('2d');g.scale(dpr,dpr);
      const fit=()=>{const aw=Math.max(140,stage.clientWidth-32),ah=Math.max(160,el.wrap.clientHeight-el.help.offsetHeight-document.getElementById('status').offsetHeight-(reserve||0)-44);const s=Math.min(aw/w,ah/h,1.9);cv.style.width=Math.round(w*s)+'px';cv.style.height=Math.round(h*s)+'px'};
      fit();ctx.on(window,'resize',fit);
      cv.pos=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*w/r.width,y:(e.clientY-r.top)*h/r.height}};
      return{cv,g}},
    follow(cv,x0){const p={x:x0,y:0,down:false,tap:null};const mv=e=>{const q=cv.pos(e);p.x=q.x;p.y=q.y;return q};
      ctx.on(cv,'pointerdown',e=>{e.preventDefault();p.down=true;const q=mv(e);if(p.tap&&!ctx.paused)p.tap(q)});ctx.on(cv,'pointermove',mv);ctx.on(window,'pointerup',()=>p.down=false);return p},
    keys(fn){ctx._key=fn},
    pad(list){const r=$('div','pad',stage);list.forEach(([lab,k,aria])=>{const b=$('button','btn',r,lab);b.setAttribute('aria-label',aria||k);
      ctx.on(b,'pointerdown',e=>{e.preventDefault();ctx.held[k]=true;if(!ctx.paused&&ctx._key)ctx._key(k)});const up=()=>{ctx.held[k]=false};
      ctx.on(b,'pointerup',up);ctx.on(b,'pointerleave',up);ctx.on(b,'pointercancel',up)});return r},
    swipe(t,fn){let s=null,fired=false;const old=t.style.touchAction;t.style.touchAction='none';cleanups.push(()=>t.style.touchAction=old);
      ctx.on(t,'pointerdown',e=>{s={x:e.clientX,y:e.clientY};fired=false});
      ctx.on(t,'pointermove',e=>{if(!s||ctx.paused)return;const dx=e.clientX-s.x,dy=e.clientY-s.y;if(Math.hypot(dx,dy)>24){fired=true;s={x:e.clientX,y:e.clientY};fn(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'),e)}});
      ctx.on(window,'pointerup',e=>{if(s&&!fired&&!ctx.paused&&e.target&&t.contains(e.target))fn('tap',e);s=null})},
    row(){return $('div','row',stage)},
    btn(p,label,fn,cls){const b=$('button','btn'+(cls?' '+cls:''),p,label);ctx.on(b,'click',()=>{if(!ctx.paused)fn(b)});return b},
    grid(cols,n,max,gap){const g=$('div','g',stage);const rows=Math.ceil(n/cols);g.style.gridTemplateColumns=`repeat(${cols},1fr)`;if(gap!=null)g.style.gap=gap+'px';
      g.style.maxWidth=`min(${max||420}px, max(220px, calc((100dvh - 410px) * ${cols} / ${rows})))`;const cs=[];for(let i=0;i<n;i++)cs.push($('button','c',g));return cs},
    over(msg,score,kind,note){if(ctx.dead||ctx.done)return;ctx.done=ctx.paused=true;{const od=document.getElementById('odiff');if(od)od.hidden=!game.ai||!!ctx.mp}if(kind==='win'){SFX.win();confetti()}else if(kind==='lose')SFX.lose();else if(kind==='end')SFX.end();if(score===undefined)score=ctx._s;let nb=false;
      if(score!=null&&!game.ns&&!ctx.mp){const bk=bestKey(game,ctx.diff),b=store.get(bk);if((b==null&&(game.low||score>0))||(b!=null&&(game.low?score<b:score>b))){store.set(bk,score);nb=true;el.best.textContent=score}}
      ctx.after(450,()=>{el.omsg.textContent=msg;el.oscore.textContent=score!=null&&!game.ns?(game.sl||'Score')+' '+score:'';{let n=document.getElementById('onote');if(!n){n=document.createElement('p');n.id='onote';el.oscore.after(n)}n.textContent='';n.hidden=!note;if(note){n.append('THE WORD WAS');const w=document.createElement('span');w.textContent=note.toUpperCase();n.append(w)}}el.oscore.hidden=!el.oscore.textContent;el.onew.hidden=!nb;el.over.hidden=false})},
    destroy(){ctx.dead=true;cleanups.forEach(f=>{try{f()}catch(e){}})}
  };
  const kd=e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;const inp=e.target&&e.target.tagName==='INPUT';const k=KEYMAP[e.key]||(e.key.length===1?e.key.toLowerCase():e.key);
    if(!inp&&KEYMAP[e.key]&&e.key!=='Enter'&&ctx._key)e.preventDefault();ctx.held[k]=true;if(!ctx.paused&&ctx._key&&!inp)ctx._key(k,e)};
  const ku=e=>{const k=KEYMAP[e.key]||(e.key.length===1?e.key.toLowerCase():e.key);ctx.held[k]=false};
  ctx.on(window,'keydown',kd);ctx.on(window,'keyup',ku);
  return ctx;
}
function stopGame(){if(cur){cur.destroy();cur=null}el.stage.textContent='';el.over.hidden=true;el.info.textContent='';el.clock.textContent=''}
const DIFFS=[['baby','BABY','IT BARELY KNOWS HOW TO PLAY','#ff8ad8'],['easy','EASY','THE COMPUTER MAKES MISTAKES','#2ee6b6'],['medium','MEDIUM','A FAIR FIGHT','#ffd23f'],['hard','HARD','NO MERCY','#ff2a2a']];
const bestKey=(g,d)=>'b_'+g.id+(g.ai?'_'+(d||store.get('d_'+g.id)||'medium'):'');
function diffMenu(game){stopGame();const ctx=makeCtx(game);cur=ctx;ctx.game=game;el.help.textContent='Choose how good the computer is.';
  let pick=Math.max(0,DIFFS.findIndex(d=>d[0]===(store.get('d_'+game.id)||'medium')));const box=$('div','dmenu',el.stage);$('p','dtitle',box,'SELECT DIFFICULTY');
  const draw=()=>items.forEach((b,i)=>b.classList.toggle('on',i===pick));
  const choose=i=>{if(ctx.paused)return;ctx.paused=true;pick=i;draw();store.set('d_'+game.id,DIFFS[i][0]);beep(988,.07,'square',.05);beep(1319,.22,'square',.05,.08);anim(items[i],'pop');ctx.after(420,()=>play(game,DIFFS[i][0]))};
  const items=DIFFS.map((d,i)=>{const b=$('button','ditem',box);b.style.setProperty('--dc',d[3]);$('span','dname',b,d[1]);$('span','ddesc',b,d[2]);
    const best=store.get('b_'+game.id+'_'+d[0]);if(best!=null&&!game.ns)$('span','dbest',b,'HI-SCORE '+best);ctx.on(b,'click',()=>choose(i));return b});
  $('p','dhint',box,'\u25B2 \u25BC TO MOVE \u00B7 ENTER TO PLAY');
  ctx.keys(k=>{if(k==='up'||k==='left'){pick=(pick+DIFFS.length-1)%DIFFS.length;draw();SFX.tick()}else if(k==='down'||k==='right'){pick=(pick+1)%DIFFS.length;draw();SFX.tick()}else if(k==='enter'||k==='space')choose(pick)});draw()}
// ---- no scrolling unless there is truly no room ----
// 1) the cabinet on the home screen shrinks to fit the phone
function fitHome(){const cab=document.getElementById('cab'),home=el.home;if(!cab||home.hidden)return;cab.style.zoom='';const cs=getComputedStyle(home),avail=home.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom),need=cab.offsetHeight;if(need<=avail)return;let z=Math.max(.6,avail/need);for(let k=0;k<3;k++){cab.style.zoom=z;const o=home.scrollHeight-home.clientHeight;if(o<=0||z<=.6)break;z=Math.max(.6,z*(1-(o+2)/home.clientHeight))}}
// 2) in a game: shrink the board a little first, then hide the how-to text, and only then allow scrolling
let fitRaf=0;function fitStage(){cancelAnimationFrame(fitRaf);fitRaf=requestAnimationFrame(()=>{const w=el.wrap,st=el.stage;if(el.game.hidden)return;st.style.zoom='';el.help.style.display='';
  const over=()=>w.scrollHeight-w.clientHeight;if(over()<=1)return;
  // games you steer by touching the canvas never get resized, only lose the how-to text
  const g=cur&&cur.game;if(st.querySelector('canvas')&&!(g&&g.fit)){el.help.style.display='none';return}
  const shrink=min=>{for(let z=.96;z>=min-.001&&over()>1;z-=.03)st.style.zoom=z.toFixed(2)};shrink(.88);if(over()<=1)return;
  st.style.zoom='';el.help.style.display='none';shrink(.7)})}
new MutationObserver(()=>fitStage()).observe(el.stage,{childList:true,subtree:true});
addEventListener('resize',()=>{fitHome();fitStage()});
// 3) a finger drag only scrolls something that actually has more to show
document.addEventListener('touchmove',e=>{if(e.touches.length>1)return;let n=e.target;while(n&&n!==document.body){if(n.scrollHeight>n.clientHeight+1){const o=getComputedStyle(n).overflowY;if(o==='auto'||o==='scroll')return}n=n.parentElement}if(e.cancelable)e.preventDefault()},{passive:false});

function play(game,diff,mp){stopGame();el.again.hidden=false;el.again.textContent=mp?'Rematch':'Play again';el.home.hidden=true;el.game.hidden=false;el.gname.textContent=game.name.toUpperCase();{const m=document.getElementById('gmeta');if(m)m.textContent=(game._sec?game._sec+' ':'')+'GAME '+String(game._no||GAMES.indexOf(game)+1).padStart(2,'0')+' \u00B7 '+game.cat.toUpperCase()+(mp?' \u00B7 VS FRIEND':diff?' \u00B7 '+diff.toUpperCase():'')}el.help.textContent=mp?game.help.replace(/the computer's/gi,"your friend's").replace(/the computer/gi,'your friend'):game.help;el.slab.textContent=game.sl||'Score';el.score.textContent='0';
  el.sbox.hidden=el.bbox.hidden=!!game.ns;const b=store.get(bestKey(game,diff));el.best.textContent=b==null?'-':b;el.wrap.scrollTop=0;
  if(game.ai&&!diff&&!mp){startMenu(game);return}
  cur=makeCtx(game);cur.game=game;cur.diff=diff||'medium';cur.mp=mp||null;try{game.fn(cur)}catch(e){console.error(e);$('p','note',el.stage,'This game hit an error. Go back and try another.')}}
