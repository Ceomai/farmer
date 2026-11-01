// ================= İLK OYUN REHBERİ =================
// Yeni oyuncuyu el işaretiyle ilk döngüden geçirir: haritaya çık → tarla → ek → topla → pazar → sat.
const TUT=[
  {say:'Hoş geldin! Masadaki <b>haritaya</b> dokun, çiftliğine çıkalım.',el:()=>document.querySelector('[data-desk="map"]'),done:()=>mode==='hub'},
  {say:'Bu senin çiftliğin. Alttaki <b>Tarlalar</b> kartına dokun.',el:()=>document.querySelector('.scard[data-go="tarla"]'),done:()=>mode==='focus'&&focus==='tarla'},
  {say:'Boş bir parsele dokun ya da parmağını parsellerin üzerinde gezdirerek <b>buğday ek</b>.',el:()=>document.querySelector('.plot.empty')||null,done:t=>(S.stats.plant_bugday||0)>t.b.plant},
  {say:'Buğdaylar olgunlaşıyor… Hazır olunca parsele dokunup <b>topla</b>.',el:()=>document.querySelector('.plot.ready'),done:t=>(S.stats.harvest_field||0)>t.b.harv},
  {say:'Harika hasat! Şimdi <b>← Harita</b> düğmesiyle geri dön.',el:()=>document.getElementById('backBtn'),done:()=>mode==='hub'},
  {say:'Ürünlerini satmak için <b>Köy Pazarı</b> kartına dokun.',el:()=>document.querySelector('.scard[data-go="pazar"]'),done:()=>mode==='focus'&&focus==='pazar'},
  {say:'Buğdayın yanındaki <b>Tümü</b> düğmesiyle sat.',el:()=>document.querySelector('[data-act="sell"][data-k="bugday"][data-n="999999"]'),done:t=>(S.stats.sold||0)>t.b.sold},
];
const tutEl=document.createElement('div');tutEl.className='tut';tutEl.hidden=true;tutEl.innerHTML='<div class="tut-hand">👆</div><div class="tut-say"><span class="fs-face">👨‍🌾</span><span class="tut-t"></span><button class="tut-skip">Rehberi geç</button></div>';document.body.appendChild(tutEl);
const tutHand=tutEl.querySelector('.tut-hand'),tutSay=tutEl.querySelector('.tut-say'),tutTxt=tutEl.querySelector('.tut-t');
tutEl.querySelector('.tut-skip').addEventListener('click',()=>{S.tut={done:1,skipped:1};tutEl.hidden=true;save();track('tutorial_skip',{step:tutStep()})});
const tutStep=()=>S&&S.tut&&!S.tut.done?S.tut.i:-1;
function tutStart(){if(S.tut)return;if(S.goal>0||(S.stats.plant_bugday||0)>0){S.tut={done:1};return}S.tut={i:0,b:{plant:0,harv:0,sold:0}};track('tutorial_start')}
function tutTick(){const i=tutStep();if(i<0||document.querySelector('.modal')){tutEl.hidden=true;return}const st=TUT[i];
  if(st.done(S.tut)){S.tut.i++;track('tutorial_step',{i:S.tut.i});S.tut.b={plant:S.stats.plant_bugday||0,harv:S.stats.harvest_field||0,sold:S.stats.sold||0};
    // rehberdeki ilk ekin hızlı büyüsün
    if(S.tut.i===3)S.fields.forEach(f=>{if(f.job&&f.job.r==='bugday')f.job.e=Math.min(f.job.e,now()+5000)});
    if(S.tut.i>=TUT.length){S.tut={done:1};tutEl.hidden=true;gain(150,'Ödül');S.gems+=3;sfx('win');celebrate('Aferin!');
      setTimeout(()=>toast('Rehber tamam: +₺150 +🍀3 · Çiftçinin baloncukları seni yönlendirmeye devam edecek'),900);track('tutorial_done');commit();return}save();return}
  tutEl.hidden=false;tutTxt.innerHTML=st.say;const el=st.el();
  if(el&&el.offsetParent!==null){const r=el.getBoundingClientRect();tutHand.hidden=false;const up=r.top>innerHeight*.55;tutHand.classList.toggle('up',up);
    tutHand.style.left=Math.round(r.left+r.width/2-22)+'px';tutHand.style.top=Math.round(up?r.top-56:r.bottom+4)+'px';tutEl.classList.toggle('top',r.top>innerHeight*.5)}else{tutHand.hidden=true;tutEl.classList.add('top')}}
