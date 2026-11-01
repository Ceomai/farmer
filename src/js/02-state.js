// ================= DURUM =================
const SAVE='ciftlik-imparatorlugu-v3';
let S;
function fresh(){return {coins:300,xp:0,lv:1,rep:50,items:{yem:6},house:1,regions:{baba:1,town:1},units:{kumes:{l:1}},fields:[{},{}],fieldLv:1,lastCrop:'bugday',
  orders:[],market:{at:0,m:{},h:{}},fin:{day:'',inc:{},exp:{},hist:[]},stats:{},goal:0,created:Date.now(),
  gems:5,album:{},workers:{},contracts:[],horses:[],league:{tier:0,pts:0},decor:{owned:{},house:{},farm:{}},ads:{day:'',n:0},sound:{music:true,sfx:true,notif:false},daily:null,contests:{day:'',list:[],done:{}},weather:{k:'sun',until:0},lastSeen:0,consent:null}}
function load(){try{const r=localStorage.getItem(SAVE);if(r)return JSON.parse(r)}catch(e){}return null}
function save(){try{S.lastSeen=Date.now();const j=JSON.stringify(S);localStorage.setItem(SAVE,j);if(typeof PLATFORM!=='undefined')PLATFORM.backup(j)}catch(e){}}
