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
const el={};['home','game','bar','gname','score','best','slab','sbox','bbox','help','info','clock','stage','over','omsg','oscore','onew','again','quit','back','shelf','chips','q','rand','tag','wrap'].forEach(i=>el[i]=document.getElementById(i));
const KEYMAP={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',' ':'space',Enter:'enter',Backspace:'back'};
let cur=null;
/* sound: tiny synth beeps. Browsers only allow audio after a tap or key press, so unlock on the first one. */
let AC=null;
const unlockAudio=()=>{try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}};
['pointerdown','touchend','click','keydown'].forEach(ev=>window.addEventListener(ev,unlockAudio,true));
const beep=(f,dur=.08,type='square',vol=.06,when=0,f2)=>{if(!AC||AC.state!=='running')return;try{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+when;o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+dur+.02)}catch(e){}};

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
      const fit=()=>{const aw=Math.max(140,stage.clientWidth-32),ah=Math.max(160,window.innerHeight-el.bar.offsetHeight-(reserve||0)-96);const s=Math.min(aw/w,ah/h,1.9);cv.style.width=Math.round(w*s)+'px';cv.style.height=Math.round(h*s)+'px'};
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
      g.style.maxWidth=`min(${max||420}px, max(220px, calc((100dvh - 270px) * ${cols} / ${rows})))`;const cs=[];for(let i=0;i<n;i++)cs.push($('button','c',g));return cs},
    over(msg,score){if(ctx.dead||ctx.done)return;ctx.done=ctx.paused=true;if(score===undefined)score=ctx._s;let nb=false;
      if(score!=null&&!game.ns){const b=store.get('b_'+game.id);if((b==null&&(game.low||score>0))||(b!=null&&(game.low?score<b:score>b))){store.set('b_'+game.id,score);nb=true;el.best.textContent=score}}
      ctx.after(450,()=>{el.omsg.textContent=msg;el.oscore.textContent=score!=null&&!game.ns?(game.sl||'Score')+' '+score:'';el.oscore.hidden=!el.oscore.textContent;el.onew.hidden=!nb;el.over.hidden=false})},
    destroy(){ctx.dead=true;cleanups.forEach(f=>{try{f()}catch(e){}})}
  };
  const kd=e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;const inp=e.target&&e.target.tagName==='INPUT';const k=KEYMAP[e.key]||(e.key.length===1?e.key.toLowerCase():e.key);
    if(!inp&&KEYMAP[e.key]&&e.key!=='Enter'&&ctx._key)e.preventDefault();ctx.held[k]=true;if(!ctx.paused&&ctx._key&&!inp)ctx._key(k,e)};
  const ku=e=>{const k=KEYMAP[e.key]||(e.key.length===1?e.key.toLowerCase():e.key);ctx.held[k]=false};
  ctx.on(window,'keydown',kd);ctx.on(window,'keyup',ku);
  return ctx;
}
function stopGame(){if(cur){cur.destroy();cur=null}el.stage.textContent='';el.over.hidden=true;el.info.textContent='';el.clock.textContent=''}
function play(game){stopGame();el.home.hidden=true;el.game.hidden=false;el.gname.textContent=game.name;el.help.textContent=game.help;el.slab.textContent=game.sl||'Score';el.score.textContent='0';
  el.sbox.hidden=el.bbox.hidden=!!game.ns;const b=store.get('b_'+game.id);el.best.textContent=b==null?'-':b;el.wrap.scrollTop=0;
  cur=makeCtx(game);cur.game=game;try{game.fn(cur)}catch(e){console.error(e);$('p','note',el.stage,'This game hit an error. Go back and try another.')}}
