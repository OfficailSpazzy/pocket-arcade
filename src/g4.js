
/* ================= ONLINE (vs computer) ================= */
reg('pool','8-Ball Pool','Board','Drag the cue stick around the ball to aim. Hold SHOOT, let go to hit. Sink your group, then the 8.',ctx=>{
  const W=300,H=560,L=24,R=276,T=54,B=536,r=8,MX=(L+R)/2,MY=(T+B)/2,{cv,g}=ctx.canvas(W,H,62);
  const PK=[[L-3,T-3,15],[R+3,T-3,15],[L-7,MY,13],[R+7,MY,13],[L-3,B+3,15],[R+3,B+3,15]];
  const COL=['#f4f1e8','#f2c21b','#1f5fd0','#d42a2a','#6a2fa0','#ff7a1a','#1f8a3a','#7a1a1a','#111111','#f2c21b','#1f5fd0','#d42a2a','#6a2fa0','#ff7a1a','#1f8a3a','#7a1a1a'];
  const grp=n=>n===0?null:n===8?'eight':n<8?'solid':'stripe';
  const MP=ctx.mp?mpWire(ctx):null,ME=MP?MP.me:0,OPN=MP?'FRIEND':'CPU';let lastSend=0;
  let balls=[],turn=MP?MP.first:0,groups=[null,null],state='aim',aim=-Math.PI/2,power=0,charging=false,chargeT=0,inHand=false,shot=null,msg='',msgT=0,plan=null,aiT=0,dragCue=false,down=false,isBreak=true,lastClick=0,lastCush=0,t=0,keyCharge=false;
  const cue=()=>balls[0];
  const rack=()=>{balls=[{n:0,x:MX,y:B-110,vx:0,vy:0,on:true}];let so=shuffle([1,2,3,4,5,6,7]),st=shuffle([9,10,11,12,13,14,15]);const ay=T+150,dy=r*1.74+.6,slots=[];
    for(let row=0;row<5;row++)for(let k=0;k<=row;k++)slots.push({x:MX+(k-row/2)*(2*r+.6),y:ay-row*dy});
    const nums=Array(15);nums[4]=8;nums[10]=so.pop();nums[14]=st.pop();const rest=shuffle([...so,...st]);for(let i=0;i<15;i++)if(nums[i]==null)nums[i]=rest.pop();
    slots.forEach((s,i)=>balls.push({n:nums[i],x:s.x,y:s.y,vx:0,vy:0,on:true}))};
  rack();
  const say=(m,dur=1.6)=>{msg=m;msgT=dur};
  const left=gp=>balls.filter(b=>b.on&&grp(b.n)===gp).length;
  const freeSpot=(x,y,ex)=>x>=L+r&&x<=R-r&&y>=T+r&&y<=B-r&&balls.every(b=>!b.on||b===ex||Math.hypot(b.x-x,b.y-y)>=2*r+.5);
  const click=v=>{if(t-lastClick<.03)return;lastClick=t;beep(1700+Math.random()*300,.025,'square',Math.min(.055,.01+v/9000));noise(.02,Math.min(.12,v/5000),0,3200)};
  const cush=v=>{if(t-lastCush<.05||v<40)return;lastCush=t;beep(150,.05,'triangle',Math.min(.1,v/5000))};
  const pot=(b)=>{b.on=false;b.vx=b.vy=0;if(shot)shot.potted.push(b.n);beep(150,.28,'sine',.09,0,55);noise(.2,.1,0,300);if(b.n===0&&shot)shot.scratch=true};
  const phys=dt=>{const n=8,h=dt/n;for(let s=0;s<n;s++){
      for(const b of balls){if(!b.on)continue;b.x+=b.vx*h;b.y+=b.vy*h;const sp=Math.hypot(b.vx,b.vy);if(sp>0){const ns=Math.max(0,sp-115*h)*(1-.32*h);if(ns<2.5){b.vx=b.vy=0}else{b.vx*=ns/sp;b.vy*=ns/sp}}
        let near=null;for(const p of PK){const d=Math.hypot(b.x-p[0],b.y-p[1]);if(d<p[2]){pot(b);break}if(d<p[2]+12)near=p}if(!b.on)continue;
        if(!near){const v=Math.hypot(b.vx,b.vy);if(b.x<L+r){b.x=L+r;b.vx=Math.abs(b.vx)*.78;cush(v)}if(b.x>R-r){b.x=R-r;b.vx=-Math.abs(b.vx)*.78;cush(v)}if(b.y<T+r){b.y=T+r;b.vy=Math.abs(b.vy)*.78;cush(v)}if(b.y>B-r){b.y=B-r;b.vy=-Math.abs(b.vy)*.78;cush(v)}}
        else if(b.x<L-16||b.x>R+16||b.y<T-16||b.y>B+16)pot(b)}
      for(let i=0;i<balls.length;i++){const a=balls[i];if(!a.on)continue;for(let j=i+1;j<balls.length;j++){const c=balls[j];if(!c.on)continue;const dx=c.x-a.x,dy=c.y-a.y,d2=dx*dx+dy*dy;
        if(d2<4*r*r&&d2>0){const d=Math.sqrt(d2),nx=dx/d,ny=dy/d,ov=2*r-d;a.x-=nx*ov/2;a.y-=ny*ov/2;c.x+=nx*ov/2;c.y+=ny*ov/2;const rv=(a.vx-c.vx)*nx+(a.vy-c.vy)*ny;
          if(rv>0){const im=rv*.96;a.vx-=im*nx;a.vy-=im*ny;c.vx+=im*nx;c.vy+=im*ny;click(rv);if(shot&&shot.first==null){if(a.n===0)shot.first=c.n;else if(c.n===0)shot.first=a.n}}}}}}};
  const moving=()=>balls.some(b=>b.on&&(b.vx||b.vy));
  const fire=pw=>{const c=cue(),sp=110+pw*900;c.vx=Math.cos(aim)*sp;c.vy=Math.sin(aim)*sp;shot={first:null,potted:[],scratch:false,shooter:turn,brk:isBreak};isBreak=false;inHand=false;state='roll';charging=false;power=0;if(MP)MP.send('shot',{});
    noise(.05,.12+pw*.15,0,1800);beep(420,.05,'square',.03+pw*.03)};
  const end=w=>{state='over';if(MP)MP.send('fin',{w});ctx.after(500,()=>ctx.over(w===ME?'You win':OPN==='CPU'?'CPU wins':'Friend wins',undefined,w===ME?'win':'lose'))};
  const resolve=()=>{const s=shot,me=s.shooter,mine=groups[me],pots=s.potted.filter(n=>n!==0);const before=gp=>left(gp)+pots.filter(n=>grp(n)===gp).length;
    let foul=s.scratch||s.first==null;if(!foul&&mine){if(s.first===8){if(before(mine)>0)foul=true}else if(grp(s.first)!==mine)foul=true}if(!foul&&!mine&&s.first===8)foul=true;
    if(pots.includes(8)){if(s.brk&&!s.scratch){const b8=balls.find(b=>b.n===8);b8.on=true;let y=T+150;while(!freeSpot(MX,y,b8))y-=2*r;b8.x=MX;b8.y=y;say('8-BALL RESPOTTED')}
      else{const cleared=mine&&before(mine)===0;return end(cleared&&!foul?me:1-me)}}
    if(!groups[me]&&!foul){const own=pots.filter(n=>n!==8);if(own.length){groups[me]=grp(own[0]);groups[1-me]=groups[me]==='solid'?'stripe':'solid';say((me===ME?'YOU ARE ':OPN+' IS ')+groups[me].toUpperCase()+'S',1.8);SFX.ok()}}
    const potOwn=pots.some(n=>n!==8&&(groups[me]?grp(n)===groups[me]:true));
    const c=cue();if(!c.on){c.on=true;c.vx=c.vy=0;let x=MX,y=B-110;while(!freeSpot(x,y,c)){x=L+r+Math.random()*(R-L-2*r);y=T+r+Math.random()*(B-T-2*r)}c.x=x;c.y=y}
    if(foul){turn=1-me;inHand=true;say(s.scratch?'SCRATCH! BALL IN HAND':'FOUL! BALL IN HAND',1.8);SFX.bad()}else if(potOwn){turn=me;if(pots.length)beep(880,.06,'square',.04)}else{turn=1-me}
    state='aim';if(MP)MP.send('sync',snap());if(!MP&&turn===1)aiStart();else if(turn===ME){aim=Math.atan2(MY-c.y,MX-c.x);if(!foul&&!potOwn)say('YOUR SHOT',1)}else if(!foul)say(OPN+"'S SHOT",1)};
  const snap=()=>({b:balls.map(b=>[b.n,Math.round(b.x*10)/10,Math.round(b.y*10)/10,b.on?1:0]),turn,groups,inHand,isBreak});
  const applySnap=m=>{const had=groups[ME];balls=m.b.map(v=>({n:v[0],x:v[1],y:v[2],vx:0,vy:0,on:!!v[3]}));turn=m.turn;groups=m.groups;inHand=m.inHand;isBreak=m.isBreak;state='aim';power=0;
    if(!had&&groups[ME])say('YOU ARE '+groups[ME].toUpperCase()+'S',1.8);else if(turn===ME){const c=cue();aim=Math.atan2(MY-c.y,MX-c.x);say(inHand?'BALL IN HAND':'YOUR SHOT',1.4);if(inHand)SFX.ok()}else say(OPN+"'S SHOT",1)};
  if(MP)MP.on(m=>{if(m.t==='need'&&ME===0)MP.send('sync',snap());else if(m.t==='aim'&&turn!==ME&&state==='aim'){aim=m.a;const c=cue();c.x=m.x;c.y=m.y;power=m.p}
    else if(m.t==='shot'){state='remote';power=0}else if(m.t==='pos'){m.b.forEach((v,i)=>{const b=balls[i];if(!b)return;if(b.on&&!v[2]){beep(150,.28,'sine',.09,0,55);noise(.2,.1,0,300)}b.tx=v[0];b.ty=v[1];b.on=!!v[2]})}
    else if(m.t==='sync')applySnap(m);else if(m.t==='fin'&&state!=='over'){state='over';ctx.after(500,()=>ctx.over(m.w===ME?'You win':'Friend wins',undefined,m.w===ME?'win':'lose'))}});
  // ---- computer player ----
  const segClear=(x1,y1,x2,y2,ex)=>{const dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy||1;return balls.every(b=>{if(!b.on||ex.includes(b))return true;const k=clamp(((b.x-x1)*dx+(b.y-y1)*dy)/l2,0,1);return Math.hypot(x1+dx*k-b.x,y1+dy*k-b.y)>=2*r-.5})};
  const targets=me=>{const mine=groups[me];return balls.filter(b=>b.on&&b.n&&(mine?(grp(b.n)===mine||(b.n===8&&left(mine)===0)):b.n!==8))};
  const bestFrom=(cx,cy,me)=>{const c=cue();let best=null;for(const o of targets(me))for(const p of PK){const px=p[0]+(MX-p[0])*.06,py=p[1]+(MY-p[1])*.03,dpx=px-o.x,dpy=py-o.y,d2=Math.hypot(dpx,dpy),ux=dpx/d2,uy=dpy/d2,gx=o.x-ux*2*r,gy=o.y-uy*2*r;
      const vx=gx-cx,vy=gy-cy,d1=Math.hypot(vx,vy);if(d1<1)continue;const cos=(vx*ux+vy*uy)/d1;if(cos<.3)continue;if(!segClear(cx,cy,gx,gy,[c,o])||!segClear(o.x,o.y,px,py,[c,o]))continue;
      const sc=cos*cos*1000/(d1+d2*1.4+60);if(!best||sc>best.sc)best={sc,ang:Math.atan2(vy,vx),pw:clamp((d1*.55+d2)/(560*Math.sqrt(cos))+.22,.28,.95)}}return best};
  const aiStart=()=>{state='ai';aiT=0;const c=cue(),err={baby:.2,easy:.07,medium:.028,hard:.008}[ctx.diff]??.028;
    if(inHand){let bp=null;for(let k=0;k<90;k++){const x=L+r+Math.random()*(R-L-2*r),y=T+r+Math.random()*(B-T-2*r);if(!freeSpot(x,y,c))continue;if(ctx.diff==='baby'){bp={x,y,s:null};break}const s=bestFrom(x,y,1);if(s&&(!bp||s.sc>bp.s.sc))bp={x,y,s}}if(bp){c.x=bp.x;c.y=bp.y}inHand=false}
    let p=bestFrom(c.x,c.y,1);
    if(!p||(ctx.diff==='easy'&&Math.random()<.3)||(ctx.diff==='baby'&&Math.random()<.8)){const ts=targets(1).length?targets(1):balls.filter(b=>b.on&&b.n);let o=ts[0],bd=1e9;if(ctx.diff==='baby')o=ts[Math.floor(Math.random()*ts.length)];else for(const b of ts){const d=Math.hypot(b.x-c.x,b.y-c.y);if(d<bd&&segClear(c.x,c.y,b.x,b.y,[c,b])){bd=d;o=b}}p={ang:Math.atan2(o.y-c.y,o.x-c.x),pw:ctx.diff==='baby'?.25+Math.random()*.75:.45+Math.random()*.25}}
    if(isBreak)p={ang:Math.atan2(T+150-c.y,MX-c.x),pw:1};
    const g2=()=>((Math.random()+Math.random()+Math.random())/3-.5)*2;plan={ang:p.ang+g2()*err,pw:clamp(p.pw+g2()*.06,.2,1),from:aim};say('CPU IS AIMING',1)};
  // ---- input ----
  const canShoot=()=>turn===ME&&state==='aim';
  const aimTo=q=>{const c=cue();if(Math.hypot(q.x-c.x,q.y-c.y)>4)aim=Math.atan2(c.y-q.y,c.x-q.x)};
  ctx.on(cv,'pointerdown',e=>{e.preventDefault();if(!canShoot()||charging)return;const q=cv.pos(e),c=cue();down=true;dragCue=inHand&&Math.hypot(q.x-c.x,q.y-c.y)<26;if(!dragCue)aimTo(q)});
  ctx.on(window,'pointermove',e=>{if(!down||!canShoot())return;const q=cv.pos(e),c=cue();if(dragCue){const x=clamp(q.x,L+r,R-r),y=clamp(q.y,T+r,B-r);if(freeSpot(x,y,c)){c.x=x;c.y=y}}else aimTo(q)});
  ctx.on(window,'pointerup',()=>{down=false;dragCue=false});
  const row=ctx.row();row.style.flexWrap='nowrap';row.style.maxWidth='340px';
  const fine=d=>{if(canShoot()&&!charging){aim+=d;SFX.tick()}};
  const mkHold=(lab,fn)=>{const b=$('button','btn',row,lab);let iv=null;const stop=()=>{clearInterval(iv);iv=null};ctx.on(b,'pointerdown',e=>{e.preventDefault();fn();stop();iv=setInterval(()=>{if(ctx.dead)return stop();fn()},45)});['pointerup','pointerleave','pointercancel'].forEach(ev=>ctx.on(b,ev,stop));ctx.on(window,'pointerup',stop);return b};
  mkHold('◀',()=>fine(-.005));
  const shoot=$('button','btn pri',row,'HOLD TO SHOOT');shoot.style.flex='1';shoot.style.touchAction='none';
  ctx.on(shoot,'pointerdown',e=>{e.preventDefault();if(!canShoot())return;charging=true;chargeT=0;beep(300,.04,'square',.03)});
  const release=()=>{if(charging&&!keyCharge&&canShoot())fire(power)};ctx.on(shoot,'pointerup',release);ctx.on(shoot,'pointerleave',release);ctx.on(shoot,'pointercancel',()=>{charging=false;power=0});
  mkHold('▶',()=>fine(.005));
  ctx.keys(k=>{if(k==='left')fine(-.01);if(k==='right')fine(.01)});
  // ---- prediction for the aiming guide ----
  const predict=()=>{const c=cue(),dx=Math.cos(aim),dy=Math.sin(aim);let best=1e9,hit=null;for(const b of balls){if(!b.on||!b.n)continue;const fx=c.x-b.x,fy=c.y-b.y,bb=fx*dx+fy*dy,cc=fx*fx+fy*fy-4*r*r,disc=bb*bb-cc;if(disc<0)continue;const k=-bb-Math.sqrt(disc);if(k>0&&k<best){best=k;hit=b}}
    let tc=1e9;if(dx>0)tc=Math.min(tc,(R-r-c.x)/dx);if(dx<0)tc=Math.min(tc,(L+r-c.x)/dx);if(dy>0)tc=Math.min(tc,(B-r-c.y)/dy);if(dy<0)tc=Math.min(tc,(T+r-c.y)/dy);
    return hit&&best<tc?{x:c.x+dx*best,y:c.y+dy*best,hit}:{x:c.x+dx*tc,y:c.y+dy*tc,hit:null}};
  // ---- drawing ----
  const ball=(b,x,y,s=1)=>{const n=b.n,col=COL[n];g.save();g.translate(x,y);g.scale(s,s);g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(1.6,2.4,r,0,7);g.fill();
    if(n>8){g.fillStyle='#f4f1e8';g.beginPath();g.arc(0,0,r,0,7);g.fill();g.save();g.beginPath();g.arc(0,0,r,0,7);g.clip();g.fillStyle=col;g.fillRect(-r,-r*.55,2*r,r*1.1);g.restore()}else{g.fillStyle=col;g.beginPath();g.arc(0,0,r,0,7);g.fill()}
    if(n){g.fillStyle='#f4f1e8';g.beginPath();g.arc(0,0,3.7,0,7);g.fill();g.fillStyle='#111';g.font='700 5.5px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(n,0,.4)}
    const hl=g.createRadialGradient(-2.6,-3,0,-2.6,-3,r);hl.addColorStop(0,'rgba(255,255,255,.6)');hl.addColorStop(.35,'rgba(255,255,255,.08)');hl.addColorStop(1,'rgba(0,0,0,.25)');g.fillStyle=hl;g.beginPath();g.arc(0,0,r,0,7);g.fill();g.restore()};
  const table=()=>{g.fillStyle='#0b0a0d';g.fillRect(0,0,W,H);const wd=g.createLinearGradient(0,0,W,0);wd.addColorStop(0,'#4a2a14');wd.addColorStop(.5,'#7a4a24');wd.addColorStop(1,'#4a2a14');g.fillStyle=wd;rrect(g,2,32,W-4,H-34,14);g.fill();
    g.fillStyle='rgba(255,230,190,.65)';for(let k=1;k<4;k++){const x=L+(R-L)*k/4;g.fillRect(x-1.5,40,3,3);g.fillRect(x-1.5,H-11,3,3)}for(let k=1;k<8;k++){if(k===4)continue;const y=T+(B-T)*k/8;g.fillRect(8,y-1.5,3,3);g.fillRect(W-11,y-1.5,3,3)}
    g.fillStyle='#0e5a30';g.fillRect(L-12,T-12,R-L+24,B-T+24);const fe=g.createRadialGradient(MX,MY,40,MX,MY,320);fe.addColorStop(0,'#22a35a');fe.addColorStop(1,'#11703a');g.fillStyle=fe;g.fillRect(L,T,R-L,B-T);
    g.strokeStyle='rgba(255,255,255,.08)';g.beginPath();g.moveTo(L,B-110);g.lineTo(R,B-110);g.stroke();g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.arc(MX,T+150,2,0,7);g.fill();
    PK.forEach(p=>{g.fillStyle='#2a1a0e';g.beginPath();g.arc(p[0],p[1],p[2]+3,0,7);g.fill();g.fillStyle='#050505';g.beginPath();g.arc(p[0],p[1],p[2],0,7);g.fill()})};
  const hud=()=>{g.fillStyle='#000';g.fillRect(0,0,W,30);const side=(x,al,who,me)=>{g.textAlign=al;g.font='8px "Press Start 2P",monospace';g.fillStyle=turn===me&&state!=='over'?'#ffd23f':'#8a8478';g.fillText((turn===me?'▶':'')+who,x,12);
      const gp=groups[me];const list=gp?balls.filter(b=>b.on&&grp(b.n)===gp):[];g.fillStyle='#a9a39a';g.font='6px "Press Start 2P",monospace';if(!gp)g.fillText('OPEN TABLE',x,25);else list.forEach((b,i)=>ball(b,al==='left'?x+5+i*13:x-5-i*13,23,.62));if(gp&&!list.length)g.fillText('8-BALL',x,25)};
    side(6,'left','YOU',ME);side(W-6,'right',OPN,1-ME);if(charging){g.fillStyle='#222';g.fillRect(W/2-30,8,60,8);const k=power;g.fillStyle=k>.8?'#ff2a2a':k>.5?'#ffd23f':'#2ee6b6';g.fillRect(W/2-30,8,60*k,8)}};
  ctx.loop(dt=>{t+=dt;msgT-=dt;
    if(state==='roll'){phys(dt);if(MP&&t-lastSend>.05){lastSend=t;MP.send('pos',{b:balls.map(b=>[Math.round(b.x*10)/10,Math.round(b.y*10)/10,b.on?1:0])})}if(!moving())resolve()}
    if(state==='remote')balls.forEach(b=>{if(b.tx!=null){b.x+=(b.tx-b.x)*Math.min(1,dt*18);b.y+=(b.ty-b.y)*Math.min(1,dt*18)}});
    if(MP&&canShoot()&&t-lastSend>.08){lastSend=t;const c=cue();MP.send('aim',{a:Math.round(aim*1000)/1000,x:Math.round(c.x*10)/10,y:Math.round(c.y*10)/10,p:charging?Math.round(power*100)/100:0})}
    if(charging){if(keyCharge&&!ctx.held.space){fire(power)}else{chargeT+=dt;power=.5-.5*Math.cos(chargeT*Math.PI/.9)}}
    else if(canShoot()&&ctx.held.space){charging=true;keyCharge=true;chargeT=0}
    if(!charging)keyCharge=false;
    if(state==='ai'){aiT+=dt;const k=Math.min(1,aiT/1);let d=plan.ang-plan.from;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;aim=plan.from+d*(1-Math.pow(1-k,3));
      if(aiT>1.05){power=Math.min(plan.pw,(aiT-1.05)/.45*plan.pw);if(aiT>1.5){aim=plan.ang;turn=1;fire(plan.pw)}}}
    table();const c=cue();
    if((canShoot()||state==='ai')&&c.on){const pr=predict();g.setLineDash([4,4]);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1;g.beginPath();g.moveTo(c.x,c.y);g.lineTo(pr.x,pr.y);g.stroke();g.setLineDash([]);
      g.strokeStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(pr.x,pr.y,r,0,7);g.stroke();
      if(pr.hit&&state!=='ai'){const nx=pr.hit.x-pr.x,ny=pr.hit.y-pr.y,d=Math.hypot(nx,ny)||1,len=ctx.diff==='hard'?40:70;g.strokeStyle='rgba(255,255,255,.8)';g.beginPath();g.moveTo(pr.hit.x,pr.hit.y);g.lineTo(pr.hit.x+nx/d*len,pr.hit.y+ny/d*len);g.stroke()}}
    balls.forEach(b=>{if(b.on)ball(b,b.x,b.y)});
    if(inHand&&canShoot()){g.strokeStyle=Math.floor(t*3)%2?'#ffd23f':'rgba(255,210,63,.3)';g.lineWidth=1.5;g.beginPath();g.arc(c.x,c.y,r+5,0,7);g.stroke()}
    if((canShoot()||state==='ai'||(MP&&state==='aim'&&turn!==ME))&&c.on){const back=14+power*40,dx=Math.cos(aim),dy=Math.sin(aim);g.save();g.translate(c.x-dx*back,c.y-dy*back);g.rotate(aim+Math.PI);
      const cg=g.createLinearGradient(0,-3,0,3);cg.addColorStop(0,'#e8c98a');cg.addColorStop(1,'#8a5a2a');g.fillStyle=cg;g.beginPath();g.moveTo(0,-2);g.lineTo(210,-4);g.lineTo(210,4);g.lineTo(0,2);g.fill();
      g.fillStyle='#2a1a10';g.fillRect(150,-3.6,60,7.2);g.fillStyle='#f4f1e8';g.fillRect(0,-2,4,4);g.fillStyle='#4a8ad0';g.fillRect(-2,-2,2,4);g.restore()}
    hud();
    if(msgT>0){g.globalAlpha=Math.min(1,msgT*2);g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,MY-18,W,30);g.fillStyle='#ffd23f';g.font='9px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(msg,MX,MY-3);g.globalAlpha=1}
    g.textBaseline='alphabetic'});
  if(MP&&ME===1){state='wait';MP.send('need')}
  say(turn===ME?'YOU BREAK':OPN+' BREAKS',1.4);
},{ns:true});

reg('checkers','Checkers','Board','Tap a piece, then tap where it goes. Your pieces move up the board. Jumps are required, chain jumps keep going, and reaching the far row crowns a king.',ctx=>{
  const N=8,inb=(x,y)=>x>=0&&y>=0&&x<N&&y<N;let b=Array(64).fill(0);for(let i=0;i<64;i++){const x=i%N,y=(i/N)|0;if((x+y)%2){if(y<3)b[i]=-1;else if(y>4)b[i]=1}}
  const NW=ctx.mp?mpWire(ctx):null,PS=NW&&NW.me===1?-1:1,FLIP=PS===-1,OPN=NW?'Friend':'CPU';let side=NW?(NW.first===0?1:-1):1;
  const dirs=p=>Math.abs(p)===2?[[-1,-1],[1,-1],[-1,1],[1,1]]:p>0?[[-1,-1],[1,-1]]:[[-1,1],[1,1]];
  const promote=(nb,i)=>{if(nb[i]===1&&i<N){nb[i]=2;return true}if(nb[i]===-1&&i>=N*(N-1)){nb[i]=-2;return true}return false};
  const seqs=(bd,s)=>{const res=[];const rec=(bd,i,path,caps)=>{const p=bd[i],x=i%N,y=(i/N)|0;let ext=false;for(const[dx,dy] of dirs(p)){const mx=x+dx,my=y+dy,tx=x+2*dx,ty=y+2*dy;if(!inb(tx,ty))continue;const m=my*N+mx,to=ty*N+tx;if(bd[m]*p<0&&bd[to]===0){ext=true;const nb=bd.slice();nb[to]=p;nb[i]=0;nb[m]=0;if(promote(nb,to))res.push({path:[...path,to],caps:[...caps,m]});else rec(nb,to,[...path,to],[...caps,m])}}if(!ext&&caps.length)res.push({path,caps})};rec(bd,s,[s],[]);return res};
  const moves=(bd,sd)=>{const caps=[],simple=[];for(let i=0;i<64;i++){if(bd[i]*sd<=0)continue;caps.push(...seqs(bd,i));const x=i%N,y=(i/N)|0;for(const[dx,dy] of dirs(bd[i])){const tx=x+dx,ty=y+dy;if(inb(tx,ty)&&bd[ty*N+tx]===0)simple.push({path:[i,ty*N+tx],caps:[]})}}return caps.length?caps:simple};
  const apply=(bd,m)=>{const nb=bd.slice(),p=nb[m.path[0]];nb[m.path[0]]=0;m.caps.forEach(c=>nb[c]=0);const e=m.path[m.path.length-1];nb[e]=p;promote(nb,e);return nb};
  const evalRed=bd=>{let s=0;for(let i=0;i<64;i++){const p=bd[i];if(!p)continue;const y=(i/N)|0,x=i%N,ctr=(x>1&&x<6&&y>1&&y<6)?.06:0;s+=p>0?(p===2?1.75:1+.045*(7-y))+ctr:-((p===-2?1.75:1+.045*y)+ctr)}return s};
  const nega=(bd,d,sd,al,be)=>{const ms=moves(bd,sd);if(!ms.length)return -1000-d;if(!d)return sd*evalRed(bd);let best=-1e9;for(const m of ms){const v=-nega(apply(bd,m),d-1,-sd,-be,-al);if(v>best)best=v;if(v>al)al=v;if(al>=be)break}return best};
  const cs=ctx.grid(N,64,420,0);const bx=boardBox(cs,'#3a2312',6);bx.style.gap='0';const B=c=>FLIP?63-c:c;
  let sel=-1,prefix=null,chosen=null,busy=side!==PS,last=[],legal=side===PS?moves(b,PS):[];
  const draw=()=>{const starts=new Set(busy?[]:legal.map(m=>m.path[0])),dest=new Set();if(prefix)legal.forEach(m=>{if(prefix.every((v,k)=>m.path[k]===v)&&m.path.length>prefix.length)dest.add(m.path[prefix.length])});
    cs.forEach((c,ci)=>{const i=B(ci),x=ci%N,y=(ci/N)|0,dark=(x+y)%2;c.textContent='';c.style.border='0';c.style.borderRadius='0';c.style.background=dark?(last.includes(i)?'#8a5a2c':'#6b3f22'):'#e8d1a8';c.style.boxShadow='none';
      const p=b[i];if(p){const d=$('span','dot',c);d.style.width=d.style.height='78%';d.style.display='grid';d.style.placeItems='center';
        d.style.background=p>0?'radial-gradient(circle at 38% 32%,#ff8a7a,#d0202a 55%,#7a0a10)':'radial-gradient(circle at 38% 32%,#6a6a72,#1d1d22 55%,#000)';d.style.boxShadow='inset 0 0 0 3px rgba(0,0,0,.25),0 3px 0 rgba(0,0,0,.45)'+(i===sel?',0 0 0 3px #ffd23f':starts.has(i)&&!prefix?',0 0 0 2px rgba(255,210,63,.45)':'');
        if(Math.abs(p)===2){d.textContent='♛';d.style.color='#ffd23f';d.style.fontSize='clamp(12px,4vw,20px)'}}
      if(dest.has(i)){const m=$('span','dot',c);m.style.cssText='width:30%;height:30%;background:rgba(255,210,63,.85);box-shadow:0 0 8px #ffd23f'}});
    const mine=b.filter(v=>v*PS>0).length,theirs=b.filter(v=>v*PS<0).length;ctx.info((busy?(NW?"FRIEND'S TURN   ":''):(NW?'YOUR TURN   ':''))+'YOU '+mine+'  '+OPN.toUpperCase()+' '+theirs+(legal.some(m=>m.caps.length)&&!busy?'   JUMP REQUIRED!':''))};
  const step=(from,to,cap)=>{const p=b[from];b[from]=0;b[to]=p;if(cap!=null){b[cap]=0;beep(240,.12,'square',.05,0,120);noise(.08,.14,0,1200)}else beep(520,.05,'square',.04);if(promote(b,to))[784,988,1319].forEach((f,k)=>beep(f,.08,'square',.05,k*.07))};
  const finishTurn=()=>{const m=chosen;sel=-1;prefix=null;chosen=null;busy=true;legal=[];if(NW)NW.send('mv',{path:m.path,caps:m.caps});draw();
    if(!moves(b,-PS).length)return ctx.after(300,()=>ctx.over('You win',undefined,'win'));if(!NW)ctx.after(450,cpu)};
  const theirMove=m=>{const path=m.path;let k=1;const go=()=>{step(path[k-1],path[k],m.caps.length?m.caps[k-1]:null);last=[path[0],path[k]];draw();k++;if(k<path.length)return ctx.after(300,go);
      legal=moves(b,PS);busy=false;draw();if(!legal.length)ctx.over(NW?'Friend wins':'CPU wins',undefined,'lose')};go()};
  cs.forEach((c,ci)=>{c.setAttribute('aria-label','Square '+(ci+1));ctx.on(c,'click',()=>{const i=B(ci);if(ctx.paused||busy)return;
    if(prefix){const nx=legal.filter(m=>prefix.every((v,k)=>m.path[k]===v)&&m.path[prefix.length]===i);
      if(!nx.length){if(prefix.length===1&&b[i]*PS>0&&legal.some(m=>m.path[0]===i)){sel=i;prefix=[i];SFX.tick();draw()}return}
      const m=nx[0],k=prefix.length;step(prefix[k-1],i,m.caps.length?m.caps[k-1]:null);prefix.push(i);last=[prefix[0],i];
      const done=nx.find(mm=>mm.path.length===prefix.length);if(done){chosen=done;return finishTurn()}draw();return}
    if(b[i]*PS>0&&legal.some(m=>m.path[0]===i)){sel=i;prefix=[i];SFX.tick();draw()}else if(b[i]*PS>0){SFX.bad();anim(c,'shake')}})});
  const cpu=()=>{const ms=moves(b,-1);let pick;if(ctx.diff==='easy'||ctx.diff==='baby')pick=ms[R(ms.length)];else{const D=ctx.diff==='hard'?6:3;let bs=-1e9;for(const m of shuffle(ms.slice())){const v=-nega(apply(b,m),D-1,1,-1e9,1e9)+Math.random()*.01;if(v>bs){bs=v;pick=m}}}theirMove(pick)};
  if(NW)NW.on(m=>{if(m.t==='mv'&&busy&&!ctx.done)theirMove(m)});
  draw();
},{ns:true});
