
/* ---------- play a friend: direct phone-to-phone connection joined with a 6-digit code (PeerJS) ---------- */
const PFX='spazzys-arcade-v1-';
const NET={peer:null,conn:null,role:null,code:null,round:0,game:null,last:0,hb:null,dropped:false,_lp:null,
  load(){if(window.Peer)return Promise.resolve();if(this._lp)return this._lp;this._lp=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';s.onload=()=>window.Peer?res():rej(new Error('load'));s.onerror=()=>{this._lp=null;rej(new Error('load'))};document.head.appendChild(s)});return this._lp},
  opts(){return{debug:0,config:{iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}]}}},
  host(cb){this.close();this.role='host';const tryId=()=>{const code=String(100000+Math.floor(Math.random()*900000));this.code=code;let p;try{p=new Peer(PFX+code,this.opts())}catch(e){return cb.error({type:'load'})}this.peer=p;
      p.on('open',()=>cb.code(code));
      p.on('connection',c=>{if(this.conn&&this.conn.open){try{c.close()}catch(e){}return}this.attach(c);c.on('open',()=>cb.connected())});
      p.on('error',e=>{if(e&&e.type==='unavailable-id'){try{p.destroy()}catch(x){}tryId()}else cb.error(e||{})});
      p.on('disconnected',()=>{if(this.peer===p&&!this.conn)try{p.reconnect()}catch(x){}})};
    this.load().then(tryId).catch(()=>cb.error({type:'load'}))},
  join(code,cb){this.close();this.role='guest';this.load().then(()=>{let p;try{p=new Peer(this.opts())}catch(e){return cb.error({type:'load'})}this.peer=p;
      p.on('open',()=>{const c=p.connect(PFX+code,{reliable:true});this.attach(c);c.on('open',()=>cb.connected())});p.on('error',e=>cb.error(e||{}))}).catch(()=>cb.error({type:'load'}))},
  attach(c){this.conn=c;this.dropped=false;this.last=Date.now();c.on('data',d=>{this.last=Date.now();let m;try{m=typeof d==='string'?JSON.parse(d):d}catch(e){return}if(m&&m.t)this.route(m)});
    c.on('close',()=>this.drop());c.on('error',()=>this.drop());clearInterval(this.hb);this.hb=setInterval(()=>{if(!this.conn)return;this.send('ping');if(this.conn.open&&Date.now()-this.last>9000)this.drop()},2000)},
  route(m){if(m.t==='ping')return;if(m.t==='bye'){this.drop();return}
    if(m.t==='start'&&this.role==='guest'){if(m.round>this.round){this.round=m.round;this.game=m.game;startMP(m.game,'guest',m.round)}return}
    if(m.t==='again'&&this.role==='host'){mpRematch();return}
    window.dispatchEvent(new CustomEvent('netmsg',{detail:m}))},
  send(t,d){try{if(this.conn&&this.conn.open)this.conn.send(JSON.stringify(Object.assign({t},d||{})))}catch(e){}},
  live(){return !!(this.conn&&this.conn.open&&!this.dropped)},
  drop(){if(this.dropped||!this.conn)return;this.dropped=true;clearInterval(this.hb);netDrop()},
  close(){clearInterval(this.hb);if(this.conn&&this.conn.open)this.send('bye');try{this.conn&&this.conn.close()}catch(e){}try{this.peer&&this.peer.destroy()}catch(e){}this.conn=this.peer=null;this.dropped=false;this.round=0;this.role=null;this.code=null}};
window.addEventListener('pagehide',()=>{if(NET.conn&&NET.conn.open)NET.send('bye')});
const netErr=e=>{const t=e&&e.type;return t==='peer-unavailable'?'NO GAME WITH THAT CODE':t==='load'?"COULDN'T START THE CONNECTION. CHECK YOUR INTERNET.":(t==='network'||t==='server-error'||t==='socket-error'||t==='socket-closed')?'NO CONNECTION. CHECK YOUR INTERNET.':t==='browser-incompatible'?"THIS BROWSER CAN'T CONNECT PHONES.":'CONNECTION FAILED. TRY AGAIN.'};
function netDrop(){if(!cur||!cur.mp){if(cur&&cur.lobbyDrop)cur.lobbyDrop();return}if(!cur.done)cur.over('Friend left',null,'end');else{el.oscore.hidden=false;el.oscore.textContent='YOUR FRIEND LEFT';el.again.hidden=true}}
function startMP(id,role,round){const gm=GAMES.find(x=>x.id===id);if(!gm)return;NET.game=id;if(typeof setShown==='function')setShown(gm);play(gm,null,{role,me:role==='host'?0:1,round})}
function mpRematch(){if(!NET.live()){el.oscore.hidden=false;el.oscore.textContent='YOUR FRIEND LEFT';el.again.hidden=true;return}
  if(NET.role==='host'){NET.round++;NET.send('start',{game:NET.game,round:NET.round});startMP(NET.game,'host',NET.round)}else{NET.send('again');el.oscore.hidden=false;el.oscore.textContent='WAITING FOR HOST...'}}
const mpWire=ctx=>{const mp=ctx.mp;return{me:mp.me,first:mp.round%2?0:1,send:(t,d)=>NET.send(t,d),on:fn=>ctx.on(window,'netmsg',e=>{if(!ctx.dead)fn(e.detail)})}};

/* ---------- lobby screens ---------- */
function menuCtx(game,help){stopGame();const ctx=makeCtx(game);cur=ctx;ctx.game=game;el.help.textContent=help;return ctx}
function arcadeMenu(ctx,title,items,hint){let pick=0;const box=$('div','dmenu',el.stage);$('p','dtitle',box,title);
  const draw=()=>els.forEach((b,i)=>b.classList.toggle('on',i===pick));
  const choose=i=>{if(ctx.paused)return;pick=i;draw();beep(988,.07,'square',.05);anim(els[i],'pop');ctx.paused=true;ctx.after(240,()=>items[i].go())};
  const els=items.map((it,i)=>{const b=$('button','ditem',box);b.style.setProperty('--dc',it.c);$('span','dname',b,it.n);$('span','ddesc',b,it.d);ctx.on(b,'click',()=>choose(i));return b});
  if(hint)$('p','dhint',box,hint);ctx.keys(k=>{if(k==='up'||k==='left'){pick=(pick+items.length-1)%items.length;draw();SFX.tick()}else if(k==='down'||k==='right'){pick=(pick+1)%items.length;draw();SFX.tick()}else if(k==='enter'||k==='space')choose(pick)});draw();return box}
function startMenu(game){const ctx=menuCtx(game,'Play the computer, or connect with a friend using a number code.');
  arcadeMenu(ctx,'CHOOSE OPPONENT',[{n:'VS COMPUTER',d:'EASY, MEDIUM OR HARD',c:'#ffd23f',go:()=>diffMenu(game)},{n:'PLAY A FRIEND',d:'CONNECT WITH A NUMBER CODE',c:'#4cc9f0',go:()=>friendMenu(game)}],'▲ ▼ TO MOVE · ENTER TO PICK')}
function friendMenu(game){const ctx=menuCtx(game,'One phone hosts and shares the code. The other joins by typing it in. Both need internet.');
  arcadeMenu(ctx,'PLAY A FRIEND',[{n:'HOST GAME',d:'GET A CODE TO SHARE',c:'#2ee6b6',go:()=>hostScreen(game)},{n:'JOIN GAME',d:"TYPE YOUR FRIEND'S CODE",c:'#ff7ac6',go:()=>joinScreen(game)},{n:'BACK',d:'CHOOSE A DIFFERENT OPPONENT',c:'#a9a39a',go:()=>startMenu(game)}])}
function hostScreen(game){const ctx=menuCtx(game,'Share this code with your friend. The game starts as soon as they join.');
  const box=$('div','dmenu',el.stage);$('p','dtitle',box,'YOUR GAME CODE');const code=$('div','mpcode',box,'------');const st=$('p','mpstat',box,'STARTING...');
  ctx.btn(ctx.row(),'Cancel',()=>{NET.close();friendMenu(game)});
  NET.host({code:c=>{if(ctx.dead)return;code.textContent=c;anim(code,'pop');SFX.ok();st.textContent='WAITING FOR YOUR FRIEND...';st.classList.add('blink')},
    connected:()=>{if(ctx.dead)return;st.classList.remove('blink');st.textContent='FRIEND JOINED!';[523,659,784,1047].forEach((f,i)=>beep(f,.08,'square',.05,i*.07));NET.game=game.id;NET.round=1;ctx.after(700,()=>{NET.send('start',{game:game.id,round:1});startMP(game.id,'host',1)})},
    error:e=>{if(ctx.dead)return;st.classList.remove('blink');st.textContent=netErr(e);SFX.bad()}})}
function joinScreen(game){const ctx=menuCtx(game,"Type the 6-digit code from your friend's screen.");let code='',busyJ=false;
  const box=$('div','dmenu',el.stage);$('p','dtitle',box,'ENTER CODE');const disp=$('div','mpcode',box);const st=$('p','mpstat',box,'');
  const show=()=>{disp.textContent=(code+'------').slice(0,6)};show();
  const go=()=>{if(busyJ||code.length<6)return;busyJ=true;st.textContent='CONNECTING...';st.classList.add('blink');
    const to=setTimeout(()=>{if(!ctx.dead&&!NET.live()){NET.close();busyJ=false;st.classList.remove('blink');st.textContent="COULDN'T CONNECT. CHECK THE CODE AND TRY AGAIN.";SFX.bad()}},15000);
    NET.join(code,{connected:()=>{clearTimeout(to);if(ctx.dead)return;st.classList.remove('blink');st.textContent='CONNECTED! STARTING...';SFX.ok()},
      error:e=>{clearTimeout(to);if(ctx.dead)return;NET.close();busyJ=false;st.classList.remove('blink');st.textContent=netErr(e);SFX.bad();code='';show()}})};
  const press=k=>{if(busyJ)return;if(/^[0-9]$/.test(k)){if(code.length<6){code+=k;beep(500+(+k)*40,.04,'square',.035);st.textContent='';show();anim(disp,'pop');if(code.length===6)go()}}else if(k==='back'||k==='del'){code=code.slice(0,-1);beep(300,.04,'square',.03);show()}else if(k==='enter'||k==='join')go()};
  const pad=$('div','mppad',box);['1','2','3','4','5','6','7','8','9','del','0','join'].forEach(k=>{const b=$('button','btn'+(k==='join'?' pri':''),pad,k==='del'?'⌫':k==='join'?'JOIN':k);ctx.on(b,'click',()=>press(k))});
  ctx.btn(ctx.row(),'Back',()=>{NET.close();friendMenu(game)});ctx.keys(press)}
