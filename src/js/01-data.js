// ================= OYUN VERİSİ =================
const ITEMS={
  bugday:{n:'Buğday',e:'🌾',p:4}, misir:{n:'Mısır',e:'🌽',p:9}, domates:{n:'Domates',e:'🍅',p:16},
  aycicegi:{n:'Ayçiçeği',e:'🌻',p:22}, pamuk:{n:'Pamuk',e:'☁️',p:30}, cilek:{n:'Çilek',e:'🍓',p:38}, elma:{n:'Elma',e:'🍎',p:12},
  yumurta:{n:'Yumurta',e:'🥚',p:10}, sut:{n:'Süt',e:'🥛',p:22}, yun:{n:'Yün',e:'🧶',p:36}, bal:{n:'Bal',e:'🍯',p:42}, et:{n:'Et',e:'🥩',p:130},
  yem:{n:'Yem',e:'🌰',p:3,buy:7}, un:{n:'Un',e:'🥡',p:12}, ekmek:{n:'Ekmek',e:'🍞',p:42}, kek:{n:'Kek',e:'🎂',p:120},
  peynir:{n:'Peynir',e:'🧀',p:95}, yogurt:{n:'Yoğurt',e:'🥣',p:58}, salca:{n:'Salça',e:'🫙',p:85}, yag:{n:'Ayçiçek Yağı',e:'🧴',p:110},
  kumas:{n:'Kumaş',e:'🧵',p:160}, at:{n:'Yarış Tayı',e:'🐎',p:1800},
  kabak:{n:'Kabak',e:'🎃',p:240}, kasar:{n:'Eski Kaşar',e:'🟨',p:950}, kestane:{n:'Kestane Balı',e:'🏺',p:330}, tereyag:{n:'Tereyağı',e:'🧈',p:150}, recel:{n:'Reçel',e:'🥫',p:140}, baklava:{n:'Baklava',e:'🥮',p:520}, hali:{n:'El Dokuma Halı',e:'🟥',p:1400}, sabun:{n:'Bal Sabunu',e:'🧼',p:170}, pastirma:{n:'Pastırma',e:'🥓',p:430},
  altinbugday:{n:'Altın Buğday',e:'🌟',p:35}, morhavuc:{n:'Mor Havuç',e:'🥕',p:28},
  lale:{n:'Lale',e:'🌷',p:26}, karpuz:{n:'Karpuz',e:'🍉',p:70}, patates:{n:'Patates',e:'🥔',p:21}, lahana:{n:'Lahana',e:'🥬',p:40}
};
const CROPS=[
  {id:'bugday',n:'Buğday',cost:5,t:20,out:{bugday:3},lvl:1},
  {id:'misir',n:'Mısır',cost:10,t:45,out:{misir:3},lvl:2},
  {id:'domates',n:'Domates',cost:20,t:90,out:{domates:3},lvl:4},
  {id:'aycicegi',n:'Ayçiçeği',cost:30,t:150,out:{aycicegi:3},lvl:6},
  {id:'pamuk',n:'Pamuk',cost:45,t:240,out:{pamuk:3},lvl:8},
  {id:'kabak',n:'Kabak (1 saat)',cost:80,t:3600,out:{kabak:2},lvl:3},
  {id:'altinbugday',n:'Altın Buğday',cost:20,t:120,out:{altinbugday:3},lvl:1,col:'altin_bugday'},
  {id:'morhavuc',n:'Mor Havuç',cost:15,t:300,out:{morhavuc:4},lvl:1,col:'mor_havuc'},
  // Mevsim ürünleri: yalnızca kendi mevsiminde tarlaya ekilir (serada her mevsim yetişir); daha değerlidir
  {id:'lale',n:'Lale',cost:25,t:120,out:{lale:3},lvl:3,season:[0]},
  {id:'karpuz',n:'Karpuz',cost:40,t:240,out:{karpuz:2},lvl:5,season:[1]},
  {id:'patates',n:'Patates',cost:20,t:150,out:{patates:4},lvl:4,season:[2]},
  {id:'lahana',n:'Lahana',cost:35,t:200,out:{lahana:3},lvl:6,season:[3]},
];
const B={
  kumes:{n:'Kümes',e:'🐔',cost:250,lvl:1,d:'Tavukları besle, folluklardan yumurta topla.',recipes:[{id:'besle',n:'Tavukları besle',in:{yem:1},t:40,out:{yumurta:2},lvl:1}]},
  silo:{n:'Silo',e:'🛢️',cost:700,lvl:2,d:'Her seviyede ambara +150 yer açar.',storage:150},
  yemhane:{n:'Yem Değirmeni',e:'⚙️',cost:600,lvl:2,d:'Mısırdan hayvan yemi öğütür. Pazardan almaktan ucuz.',recipes:[{id:'yem',n:'Yem öğüt',in:{misir:2},t:30,out:{yem:5},lvl:2}]},
  degirmen:{n:'Yel Değirmeni',e:'🌬️',cost:1000,lvl:3,d:'Buğdayı una çevirir. Çalışırken kanatlar hızlanır.',recipes:[{id:'un',n:'Un öğüt',in:{bugday:3},t:40,out:{un:2},lvl:3}]},
  ahir:{n:'Ahır',e:'🐄',cost:1500,lvl:3,d:'İnekleri besle, süt sağ.',recipes:[{id:'sag',n:'İnekleri besle',in:{yem:2},t:90,out:{sut:2},lvl:3}]},
  firin:{n:'Taş Fırın',e:'🧱',cost:2000,lvl:4,d:'Ekmek ve kek pişirir.',recipes:[
    {id:'ekmek',n:'Ekmek',in:{un:2},t:60,out:{ekmek:1},lvl:4},
    {id:'kek',n:'Kek',in:{un:2,yumurta:2,sut:1},t:120,out:{kek:1},lvl:6},
    {id:'baklava',n:'Baklava',in:{un:3,bal:2,tereyag:1},t:600,out:{baklava:1},lvl:13}]},
  agil:{n:'Ağıl',e:'🐑',cost:2500,lvl:5,d:'Koyunları besle, yün kırp.',recipes:[{id:'kirp',n:'Koyunları besle',in:{yem:2},t:120,out:{yun:2},lvl:5}]},
  mandira:{n:'Mandıra',e:'🧀',cost:3000,lvl:5,d:'Sütü peynire ve yoğurda işler.',recipes:[
    {id:'yogurt',n:'Yoğurt',in:{sut:2},t:60,out:{yogurt:1},lvl:5},
    {id:'peynir',n:'Peynir',in:{sut:3},t:120,out:{peynir:1},lvl:5},
    {id:'kasar',n:'Eski Kaşar (8 saat)',in:{sut:6},t:28800,out:{kasar:1},lvl:7},
    {id:'tereyag',n:'Tereyağı',in:{sut:4},t:180,out:{tereyag:1},lvl:10}]},
  kovan:{n:'Arılık',e:'🐝',cost:1800,lvl:5,d:'Yem istemez, yavaş ama bedava bal.',recipes:[{id:'bal',n:'Bal hasadı',in:{},t:180,out:{bal:2},lvl:5},{id:'kestane',n:'Kestane balı (6 saat)',in:{},t:21600,out:{kestane:2},lvl:6}]},
  bahce:{n:'Elma Bahçesi',e:'🌳',cost:2500,lvl:6,d:'Elma ağaçları. Tohum gerekmez.',recipes:[{id:'elma',n:'Elma topla',in:{},t:300,out:{elma:6},lvl:6},{id:'buyukhasat',n:'Büyük hasat (4 saat)',in:{},t:14400,out:{elma:40},lvl:6}]},
  konserve:{n:'Salça Atölyesi',e:'🥫',cost:4000,lvl:6,d:'Domatesi salçaya çevirir.',recipes:[{id:'salca',n:'Salça',in:{domates:4},t:90,out:{salca:1},lvl:6},{id:'recel',n:'Elma reçeli',in:{elma:6},t:240,out:{recel:1},lvl:11},{id:'recel2',n:'Çilek reçeli',in:{cilek:3},t:240,out:{recel:1},lvl:11}]},
  besi:{n:'Besi Ahırı',e:'🐂',cost:5000,lvl:7,d:'Dana al, besle, et olarak sat. Yüksek kâr, uzun süre.',recipes:[{id:'besi',n:'Dana besle',cost:150,in:{yem:4},t:300,out:{et:3},lvl:7},{id:'pastirma',n:'Pastırma (2 saat)',in:{et:3},t:7200,out:{pastirma:2},lvl:15}]},
  yaghane:{n:'Yağhane',e:'🛢',cost:6000,lvl:8,d:'Ayçiçeğinden yağ sıkar.',recipes:[{id:'yag',n:'Yağ sık',in:{aycicegi:4},t:120,out:{yag:1},lvl:8},{id:'sabun',n:'Bal sabunu',in:{yag:2,bal:1},t:300,out:{sabun:2},lvl:12}]},
  dokuma:{n:'Dokuma Atölyesi',e:'🪡',cost:6500,lvl:8,d:'Yün ve pamuktan kumaş dokur.',recipes:[
    {id:'kumas1',n:'Yün kumaş',in:{yun:3},t:150,out:{kumas:1},lvl:8},
    {id:'kumas2',n:'Pamuklu kumaş',in:{pamuk:4},t:150,out:{kumas:1},lvl:8},
    {id:'hali',n:'El dokuma halı (3 saat)',in:{kumas:3,yun:2},t:10800,out:{hali:1},lvl:14}]},
  sera:{n:'Sera',e:'🏕️',cost:7000,lvl:9,field:true,d:'Ürünler iki kat hızlı büyür, çilek yetişir.',recipes:[
    ...CROPS.map(c=>({...c,t:Math.round(c.t/2)})),{id:'cilek',n:'Çilek',cost:60,t:180,out:{cilek:4},lvl:9}]},
  hara:{n:'Hara',e:'🐴',cost:10000,lvl:9,d:'Safkan tay yetiştir. Tayını yarışa sokabilir ya da pazarda satabilirsin.',recipes:[{id:'tay',n:'Tay yetiştir',cost:300,in:{yem:6},t:600,out:{at:1},lvl:9}]},
};
const HOUSE=[{n:'Kulübe',e:'🛖'},{n:'Taş Ev',e:'🏠',cost:800,lvl:3},{n:'Çiftlik Evi',e:'🏡',cost:4000,lvl:6},{n:'Konak',e:'🏰',cost:15000,lvl:10}];
// Arazi bölgeleri: [x1,z1,x2,z2]
const REG={
  baba:{n:'Baba Ocağı',cost:0,lvl:1,rect:[-22,-9,11,11]},
  town:{n:'Kasaba',cost:0,lvl:1,rect:null},
  dere:{n:'Dere Kenarı',cost:600,lvl:2,rect:[-6,-21,24,-9]},
  kavak:{n:'Kavaklık',cost:1800,lvl:4,rect:[11,-9,26,11]},
  yamac:{n:'Çam Yamacı',cost:4500,lvl:6,rect:[-31,-21,-6,-9]},
  ova:{n:'Doğu Ovası',cost:9000,lvl:8,rect:[26,-15,46,11]},
};
// Haritadaki konumlar
const LOC={
  ev:{n:'Çiftlik Evi',reg:'baba',p:[-1,0,0],r:4,kind:'house',h:7,e:'🏡'},
  tarla:{n:'Tarlalar',reg:'baba',p:[-14.5,0,.5],r:7.5,kind:'fields',h:3.2,e:'🌾'},
  kumes:{n:'Kümes',reg:'baba',p:[6.2,0,-4.2],r:3.5,units:['kumes'],h:3.8,e:'🐔'},
  silo:{n:'Ambar ve Silo',reg:'baba',p:[6.8,0,5.2],r:3.5,units:['silo'],h:5.4,e:'🛢️'},
  pazar:{n:'Köy Pazarı',reg:'town',p:[-8,0,18],r:5.5,kind:'market',h:4,e:'🏪'},
  han:{n:'Tüccar Hanı',reg:'town',p:[8,0,18],r:5.5,kind:'orders',h:5.2,e:'📜'},
  atolye:{n:'Değirmen Sokağı',reg:'dere',p:[2,0,-15],r:9,units:['yemhane','degirmen','firin','mandira','konserve','yaghane','dokuma'],slots:[[-6.6,-2.4],[-2.2,-2.4],[2.2,-2.4],[6.6,-2.4],[-4.4,2.4],[0,2.4],[4.4,2.4]],h:6,e:'⚙️'},
  ahir:{n:'Ahır',reg:'dere',p:[17,0,-15],r:4,units:['ahir'],h:5,e:'🐄'},
  agil:{n:'Ağıl',reg:'kavak',p:[17.5,0,-3],r:4,units:['agil'],h:3.2,e:'🐑'},
  bahce:{n:'Arılık ve Bahçe',reg:'kavak',p:[18.5,0,6],r:5,units:['kovan','bahce'],slots:[[-2.4,0],[2.4,0]],h:3.6,e:'🍎'},
  besi:{n:'Besi Ahırı',reg:'yamac',p:[-13,0,-15],r:4,units:['besi'],h:3.4,e:'🐂'},
  sera:{n:'Seralar',reg:'yamac',p:[-24,0,-15],r:4,units:['sera'],h:4,e:'🏕️'},
  panayir:{n:'Panayır',reg:'town',p:[24,0,18.5],r:5.5,kind:'fair',h:4,e:'🎪'},
  hipo:{n:'Yarış Alanı',reg:'ova',p:[36,0,-1],r:9.5,units:['hara'],kind:'race',slots:[[0,-9.4]],h:4.5,e:'🏇'},
};
const SIGN={ev:[0,3.4],tarla:[0,7.2],kumes:[0,2.6],silo:[0,2.6],pazar:[0,3.6],han:[0,2.6],atolye:[0,5],ahir:[0,2.6],agil:[0,2.6],bahce:[0,2.8],besi:[0,2.6],sera:[0,2.6],hipo:[0,6.8],panayir:[0,4.2]};
for(const k in SIGN)LOC[k].s=SIGN[k];
const INSIDE_UNITS={kumes:1,ahir:1,agil:1,besi:1,hara:1};
const PLOT_COST=[0,0,150,300,500,800,1200,1800,2600],PLOT_LV=[1,1,1,2,3,4,5,6,7];
const FIELD_UP=[0,600,2500,9000,22000];
const MAXL=5;
// Seviye 4 ve 5 için gereken ev ve oyuncu seviyesi
const upReq=l=>({house:Math.min(4,l),lv:l>=5?16:l>=4?12:0});
const upBlock=l=>{const q=upReq(l);return S.house<q.house?'🏠 '+HOUSE[q.house-1].n:S.lv<q.lv?'🔒 Sv '+q.lv:''};
const ERAS=['Kulübe dönemi','Köy çiftliği','Büyüyen çiftlik','Çiftlik işletmesi','Tarım imparatorluğu'];
const locOf=u=>Object.keys(LOC).find(k=>(LOC[k].units||[]).includes(u));
