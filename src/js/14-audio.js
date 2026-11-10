// ================= SES VE MÜZİK =================
const SND={ctx:null};let booted=false;
function audioInit(){if(SND.ctx)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C();SND.ctx=c;SND.master=c.createGain();SND.master.gain.value=.55;SND.master.connect(c.destination);
  SND.sfx=c.createGain();SND.sfx.connect(SND.master);SND.mus=c.createGain();SND.mus.gain.value=S.sound.music?.13:0;SND.mus.connect(SND.master);startMusic()}catch(e){}}
function tone(f,d,type,v,when,slide,dest){const c=SND.ctx;if(!c)return;const t=c.currentTime+(when||0),o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.2,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(dest||SND.sfx);o.start(t);o.stop(t+d+.05)}
const SFX={pop:()=>tone(480,.14,'triangle',.25,0,2.2),coin:()=>{tone(1046,.09,'square',.08);tone(1568,.22,'square',.08,.08)},click:()=>tone(620,.05,'triangle',.1),
  plant:()=>tone(420,.12,'triangle',.1,0,1.5),cluck:()=>{tone(760,.07,'square',.05,0,.55);tone(900,.09,'square',.05,.1,.5);tone(700,.07,'square',.04,.22,.6)},
  moo:()=>{tone(220,.7,'triangle',.07,0,.75);tone(165,.7,'sine',.06,0,.8)},baa:()=>{for(let i=0;i<5;i++)tone(380+(i%2)*30,.09,'sawtooth',.05,i*.08,.9)},
  neigh:()=>{for(let i=0;i<6;i++)tone(900-i*80,.08,'sawtooth',.04,i*.06,.8)},buzz:()=>tone(220,.5,'sawtooth',.03,0,1.05),
  build:()=>[392,523,659].forEach((f,i)=>tone(f,.25,'triangle',.08,i*.09)),level:()=>[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.22,'square',.08,i*.1)),
  whoosh:()=>{tone(660,.5,'triangle',.05,.05);tone(990,.6,'triangle',.04,.18)},thunder:()=>{},chime:()=>[523,659,784,1047].forEach((f,i)=>{tone(f,.9,'triangle',.06,i*.16);tone(f*2,.6,'sine',.02,i*.16+.02)}),fail:()=>tone(330,.25,'triangle',.06,0,.7),win:()=>[784,988,1175,1568].forEach((f,i)=>tone(f,.18,'triangle',.18,i*.09))};
const UNIT_SFX={kumes:'cluck',ahir:'moo',besi:'moo',agil:'baa',hara:'neigh',kovan:'buzz'};
function sfx(k){if(!SND.ctx||!S.sound.sfx||!SFX[k])return;try{SFX[k]()}catch(e){}}
const MUS={next:0,step:0,timer:null,mel:[]};
function makeMelody(){const sc=[0,2,4,7,9,12,14,16];MUS.mel=[];for(let i=0;i<32;i++){const st=i%8;MUS.mel.push(Math.random()<(st%2?.35:.75)?sc[Math.floor(Math.random()*sc.length)]:-1)}}
function startMusic(){if(MUS.timer||!SND.ctx)return;makeMelody();MUS.next=SND.ctx.currentTime+.2;MUS.timer=setInterval(()=>{const c=SND.ctx;if(!c||c.state!=='running')return;const beat=60/(dayFactor()<.3?88:104);
  while(MUS.next<c.currentTime+.35){const s=MUS.step,bar=Math.floor(s/8)%4,st=s%8,root=[48,53,55,48][bar],w=Math.max(0,MUS.next-c.currentTime),mf=n=>440*Math.pow(2,(n-69)/12);
    if(S.sound.music){if(st===0)tone(mf(root-12),.32,'triangle',.3,w,0,SND.mus);if(st===4)tone(mf(root-5),.32,'triangle',.26,w,0,SND.mus);
      if(st===2||st===6)[0,4,7].forEach(iv=>tone(mf(root+12+iv),.12,'square',.03,w,0,SND.mus));const m=MUS.mel[s%32];if(m>=0)tone(mf(60+m+(bar===2?2:0)),.2,'triangle',.11,w,0,SND.mus)}
    MUS.next+=(st%2===0?.6:.4)*beat;MUS.step++;if(MUS.step%128===0)makeMelody()}},90)}
function applySound(){if(SND.mus)SND.mus.gain.value=S.sound.music?.13:0}
let lastP={x:innerWidth/2,y:innerHeight/2};
addEventListener('pointerdown',e=>{lastP={x:e.clientX,y:e.clientY};audioInit();if(SND.ctx&&SND.ctx.state==='suspended')SND.ctx.resume()},{passive:true,capture:true});
