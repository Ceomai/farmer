// Bot oyuncu simülasyonu: farklı oyun tarzlarıyla oyunda uzun süre (sanal günler) oynanır.
// Amaç: uzun vadede hata çıkmaması, ekonominin bozulmaması ve oyuncunun hiçbir şey yapamaz duruma (kilitlenme) düşmemesi.
// Kilitlenme: para tohuma yetmiyor + satılacak ürün yok + çalışan iş yok + işçi yok → oyuncu ertesi günü beklemek zorunda.
// Kullanım: node scripts/bot-sim.mjs [gün=60]
import {createRequire} from 'node:module';import path from 'node:path';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const DAYS=+(process.argv[2]||60),SEED=+(process.argv[3]||1);const FILE='file://'+path.resolve('www/index.html');
// Tarzlar: her "tur" oyunda geçen süre ve botun o turda ne yaptığı
const ONLY=process.env.ONLY;const STYLES0={
  'özenli':     {gap:5*60e3,   sellAll:false,spend:.5, orders:true},  // 5 dakikada bir uğrayan, dengeli oyuncu
  'savurgan':   {gap:10*60e3,  sellAll:true, spend:1,  orders:false}, // her şeyi satıp eline geçeni harcayan
  'nadiren':    {gap:8*3600e3, sellAll:false,spend:.7, orders:true},  // günde 3 kez giren
  'tıklamacı':  {gap:30e3,     sellAll:false,spend:.3, orders:true, days:5},  // çok sık giren, az harcayan (5 gün)
  'nesilci':     {gap:15*60e3,  sellAll:false,spend:.8, orders:true, gen:true}, // yeni nesle devreden, projeleri yapan, hikâyeleri izleyen
  'yeni-hevesli':{gap:60e3,    sellAll:true, spend:1,  orders:false, days:10}, // sıfırdan, her kuruşu bina/arazi için harcayan
};
const STYLES=Object.fromEntries(Object.entries(STYLES0).filter(([k])=>!ONLY||ONLY.split(',').includes(k)));
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fail=0;
for(const [name,st] of Object.entries(STYLES)){
  const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));
  await p.route(/^https?:/,r=>r.abort());await p.addInitScript(seed=>{let a=seed*7919;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};if(window.name!=='b'){window.name='b';localStorage.clear()}},SEED);
  await p.goto(FILE,{timeout:120000});await p.waitForFunction(()=>typeof S==='object'&&S&&!document.getElementById('boot'),null,{timeout:120000});
  await p.evaluate(([st,DAYS])=>{DAYS=st.days||DAYS;
    // görselleri durdur: yalnızca oyun mantığı koşsun (hız için)
    document.querySelectorAll('.modal').forEach(m=>m.remove());S.consent={a:1};S.tut={done:1};
    const end=now()+DAYS*864e5;window.__B={end};let turns=0,stuck=0,stuckMax=0,stuckRun=0,lastProg='',lastProgT=now(),flat=0;const snaps=[];const errs=[];
    const val=k=>ITEMS[k].p;
    window.__B.run=(N)=>{let c=0;while(now()<end&&c++<N){turns++;
      try{
        if(checkDaily()){}if(S.daily&&!S.daily.login){const r=LOGIN[S.daily.streak-1];if(r.c)gain(r.c,'Ödül');if(r.yem)S.items.yem=has('yem')+r.yem;if(r.g)S.gems+=r.g;S.daily.login=true}
        friendGifts();document.querySelectorAll('.modal').forEach(m=>m.remove());renewAll();queueAll();
        // olaylar: bot olaya hemen katılır, mini oyunu otomatik oynar (ödül yolu denensin)
        evtTick();if(S.evt&&S.evt.cur){runEvent();document.querySelectorAll('.modal').forEach(m=>{const b=m.querySelector('[data-deal="0"]')||m.querySelector('.bush');if(b)b.click();const f=m.querySelector('.foxbtn');if(f)for(let i=0;i<5;i++)f.click()});document.querySelectorAll('.modal').forEach(m=>m.remove())}
        for(const n of NAMES)if(questOf(n))doQuest(n);for(const a of achReady())claimAch(a.id);
        if(st.gen){for(const p of PROJ)if(!projOn(p.id)&&S.coins>p.c*1.5)doProj(p.id);document.querySelectorAll('.modal').forEach(m=>m.remove());if(genReady())doGen()}
        for(const k in LOC)if(owned(LOC[k].reg))quickLoc(k);
        if(st.orders){for(let i=S.orders.length-1;i>=0;i--)try{fillOrder(i)}catch(e){}S.contracts.forEach((c,i)=>{if(has(c.k))deliverContract(i)})}
        claimGoal();if(S.daily)S.daily.tasks.forEach((t,i)=>{if(t.p>=t.n&&!t.c){t.c=true;gain(t.r,'Görev')}});
        // ambar dolmasın: değerin yarısından fazlasını sat (savurgan: hepsini)
        const keep=st.sellAll?0:6;for(const k in S.items){if(k==='at')continue;const n=has(k)-keep-(k==='yem'?12:0);if(n>0&&(st.sellAll||stored()>cap()*.6||S.coins<60))sell(k,n)}
        if(has('yem')<6&&S.coins>70)buyFeed(10);
        // harcama: önce arazi/bina/parsel/ev, sonra yükseltme
        const budget=S.coins*st.spend;const tries=[()=>buyPlot(),...Object.keys(REG).map(r=>()=>{if(!owned(r)&&regCost(r)<=budget)buyRegion(r)}),
          ...Object.keys(B).map(u=>()=>{if(!S.units[u]&&B[u].cost<=budget&&owned(LOC[locOf(u)].reg))buildUnit(u)}),()=>{const h=HOUSE[S.house];if(h&&h.cost<=budget)upgradeHouse()},
          ()=>{if(FIELD_UP[S.fieldLv]<=budget*.5)upgradeFields()},...Object.keys(S.units).map(u=>()=>{if(upCost(u)<=budget*.4)upgradeUnit(u)}),
          ...['fields',...Object.keys(S.units)].map(u=>()=>{if(S.lv>=WORKER_LV&&!S.workers[u]&&workerCost(u)<=budget*.3&&(u==='fields'||B[u].recipes))hire(u)})];
        for(const f of tries)try{f()}catch(e){errs.push('harcama: '+e.message+' @ '+(e.stack||'').split('\n').slice(1,3).join(' < ')+' :: '+f.toString().slice(0,90))}
        // değişik tarifler: boştaki binada en kârlı yapılabilir tarifi seç
        for(const u in S.units){const s=S.units[u];if(s.job||!B[u].recipes)continue;const rs=B[u].recipes.filter(r=>r.lvl<=S.lv&&(!r.col||has1(r.col))&&canPay(r)&&r.t<=Math.max(st.gap/1000*3,120));if(rs.length){startUnit(u,rs[rs.length-1].id,true);if(s.job&&rs.length>1)queueAdd(u,rs[rs.length-2].id)}}
        const best=CROPS.filter(c=>!cropLocked(c)&&c.cost<=S.coins/3&&c.t<=Math.max(st.gap/1000*2,20)).pop();if(best)S.lastCrop=best.id;
        automate();rescue();document.querySelectorAll(".toast").forEach(t=>t.remove());
      }catch(e){errs.push(e.message+' @ '+(e.stack||'').split('\n')[1])}
      // kilitlenme denetimi
      const sellable=Object.keys(S.items).some(k=>has(k)>0&&k!=='yem'),running=S.fields.some(f=>f.job)||Object.values(S.units).some(s=>s.job),cheapest=Math.min(...CROPS.filter(c=>!cropLocked(c)).map(c=>c.cost));
      const isStuck=S.coins<cheapest&&!sellable&&!running&&!Object.keys(S.workers).length;if(isStuck){stuck++;stuckRun++;stuckMax=Math.max(stuckMax,stuckRun)}else stuckRun=0;
      const prog=S.lv+'|'+Object.keys(S.units).length+'|'+Object.keys(S.regions).length+'|'+S.house+'|'+S.fields.length+'|'+Math.floor(Math.log2(S.coins+2));if(prog!==lastProg){lastProg=prog;lastProgT=now()}else flat=Math.max(flat,(now()-lastProgT)/864e5);
      // tutarlılık
      const bad=[];if(!isFinite(S.coins)||S.coins<0)bad.push('para '+S.coins);for(const k in S.items)if(!(S.items[k]>=0))bad.push(k+' '+S.items[k]);if(bad.length){errs.push('tutarsız: '+bad.join(','));break}
      if(turns%Math.max(1,Math.round(864e5/st.gap))===0)snaps.push({gün:Math.round((now()-end+DAYS*864e5)/864e5),sv:S.lv,para:Math.round(S.coins),bina:Object.keys(S.units).length,arazi:Object.keys(S.regions).length,ev:S.house});
      TIME_OFF+=st.gap;if(errs.length>5)break}
    };window.__B.result=()=>{    const __dump=()=>JSON.stringify({coins:S.coins,items:S.items,cap:cap(),stored:stored(),units:S.units,fields:S.fields,workers:S.workers,lastCrop:S.lastCrop,orders:S.orders.length});return{flat:Math.round(flat*10)/10,dump:__dump(),turns,stuck,stuckMax,errs:[...new Set(errs)].slice(0,6),snaps,final:{sv:S.lv,para:Math.round(S.coins),yonca:S.gems,bina:Object.keys(S.units).length,arazi:Object.keys(S.regions).length,ev:S.house,parsel:S.fields.length,hedef:S.goal,isci:Object.keys(S.workers).length,nesil:S.gen||0,proje:Object.keys(S.proj||{}).length,hikaye:Object.values(S.quests||{}).reduce((a,b)=>a+b,0),basarim:Object.keys(S.ach||{}).length}}};},[st,DAYS]);
  let out;while(true){const fin=await p.evaluate(()=>{window.__B.run(150);document.querySelectorAll('.conf,.celeb,.float,.flyi').forEach(e=>e.remove());return now()>=window.__B.end});await p.waitForTimeout(5);if(fin)break}
  out=await p.evaluate(()=>window.__B.result());
  const all=[...errs,...out.errs];const ok=!all.length&&out.stuckMax<3&&!(out.flat>=4&&out.final.sv<30&&!out.final.nesil);if(!ok)fail++;
  console.log(`${ok?'✓':'✗'} ${name}: ${out.turns} tur · ${st.days||DAYS} gün sonunda ${JSON.stringify(out.final)}${out.flat>=2?` · ${out.flat} gün ilerlemedi`:''}${out.stuck?` · kilitlenme ${out.stuck} tur (en uzun ${out.stuckMax})`:''}`);
  const sn=out.snaps.filter((_,i,a)=>i%Math.ceil(a.length/6)===0||i===a.length-1);console.log('   ilerleme: '+sn.map(s=>`g${s.gün}: Sv${s.sv} ₺${s.para} ${s.bina}bina ${s.arazi}arazi`).join(' · '));
  for(const e of all)console.log('   ✗ '+e);if(process.env.DUMP)console.log('   durum: '+out.dump);await p.close()}
await b.close();console.log(fail?`\n${fail} tarz sorunlu`:'\nTüm tarzlar sorunsuz');process.exit(fail?1:0);
