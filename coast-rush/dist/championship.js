import {CUPS,cupDefinition,cupRounds,cupComplete,cupUnlocked,unlockedCups} from './cup-definitions.js';
export {CUPS,cupDefinition,cupRounds,cupComplete,cupUnlocked,nextCupChoice} from './cup-definitions.js';
import {step,raceLength} from './physics.js';
import {normalizeAppearance} from './customization.js';
export const CUP_POINTS=[10,7,5,3,2,1];
export const CUP_ROUNDS=CUPS[0].rounds;
export const CUP_RIVALS=['Kestrel','Viper','Nova','Echo','Blaze'];
export const RIVAL_COLORS=['#64cc99','#ed7272','#cedced','#a891f5','#ffb34e'];
const copy=v=>JSON.parse(JSON.stringify(v)),levels=['easy','medium','hard'];
export function normalizeChampionship(raw){
 const records=Array.isArray(raw?.records)?raw.records.filter(r=>r&&(!r.cupKey||CUPS.some(c=>c.id===r.cupKey))&&levels.includes(r.level)&&Number.isInteger(r.place)&&r.place>=1&&r.place<=6&&typeof r.id==='string').map(r=>({...r,cupKey:CUPS.some(c=>c.id===r.cupKey)?r.cupKey:'coastline'})).slice(0,30):[];
 let active=raw?.active;try{if(!active||typeof active.id!=='string'||!levels.includes(active.level)||!['classic','sprint','gt','muscle','apex'].includes(active.setup?.car)||!Array.isArray(active.results)||active.results.length>cupRounds(active).length)throw Error();
  const spec=active.setup.spec;if(!spec||!['max','acceleration','handling','braking','nitroDuration'].every(k=>Number.isFinite(spec[k])&&spec[k]>0&&spec[k]<1000))throw Error();
  if(active.results.some((r,i)=>r.round!==i||r.entries?.length!==6||new Set(r.entries.map(e=>e.id)).size!==6||r.entries.some(e=>!['player','0','1','2','3','4'].includes(e.id)||!Number.isFinite(e.time)||e.time<=0)))throw Error();
  active=copy(active);active.cupKey=active.cupKey||'coastline';if(!CUPS.some(c=>c.id===active.cupKey))throw Error();active.level=cupDefinition(active.cupKey).level;active.version=2;active.setup.appearance=normalizeAppearance(active.setup.appearance);active.retryUsed=Math.max(0,Math.min(1,Number(active.retryUsed)||0));active.inProgress=!!active.inProgress&&!cupComplete(active);
 }catch{active=null;}return {active,records,unlocked:unlockedCups({records,unlocked:raw?.unlocked})};
}
export function createChampionship(profile,setup,key='coastline'){
 if(!cupUnlocked(profile,key)||profile.championship?.active&&!cupComplete(profile.championship.active))return null;
 const cup={id:globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random(),version:2,cupKey:key,level:cupDefinition(key).level,seed:Math.floor(Math.random()*0xffffffff),date:new Date().toISOString(),setup:copy(setup),results:[],retryUsed:0,inProgress:false};
 profile.championship??={active:null,records:[],unlocked:['coastline']};profile.championship.active=cup;return cup;
}
export function championshipSetup(cup){const index=cup.results.length,r=cupRounds(cup)[index];return r?{...copy(cup.setup),...r,mode:'race',density:'normal',level:cup.level,cupId:cup.id,cupKey:cup.cupKey,cupName:cupDefinition(cup.cupKey).name,cupRounds:cupRounds(cup).length,cupRound:index}:null;}
export function cupRandom(cup,round=cup.results.length){let x=(cup.seed^(round+1)*2654435761)>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
export function applyChampionshipGrid(s,cup,round){const random=cupRandom(cup,round),scale={easy:.95,medium:1,hard:1.025}[cup.level];for(const [i,t] of s.traffic.entries()){t.name=CUP_RIVALS[i];t.targetSpeed=Math.min(t.normalMax*1.03,t.targetSpeed*scale*(.985+random()*.03));t.acceleration*=scale*(.985+random()*.03);}const rows=cupStandings(cup),you=rows.find(r=>r.id===String("player"));s.cupRivalId=cup.results.length?(you.position===1?rows[1]:rows[0]).id:null;s.cupId=cup.id;s.cupRound=round;}
// Let unfinished bots finish using the real race physics, away from the parked player.
export function completedCupField(state){const s=copy(state);s.mode='playing';s.distance=-100000;s.speed=0;s.x=0;for(let i=0;i<360*60&&s.traffic.some(t=>t.finishTime===null);i++)step(s,{},1/60,()=>.5);return s.traffic;}
export function cupStandings(cup){const rows=[{id:'player',name:'You',color:'#d9ff59'},...CUP_RIVALS.map((name,i)=>({id:String(i),name,color:RIVAL_COLORS[i]}))].map(r=>({...r,points:0,wins:0,podiums:0,time:0}));
 for(const result of cup.results)for(const [i,e] of result.entries.entries()){const row=rows.find(r=>r.id===e.id);row.points+=CUP_POINTS[i];row.wins+=i===0?1:0;row.podiums+=i<3?1:0;row.time+=e.time;}
 return rows.sort((a,b)=>b.points-a.points||b.wins-a.wins||b.podiums-a.podiums||a.time-b.time||a.id.localeCompare(b.id)).map((r,i)=>({...r,position:i+1}));
}
export function retryAvailable(cup){return !cupComplete(cup)&&(cup.level==='easy'||cup.level==='medium'&&!cup.retryUsed);}
export function useCupRetry(cup){if(!retryAvailable(cup))return false;if(cup.level==='medium')cup.retryUsed=1;return true;}
export function settleCupRound(profile,state,setup){const cup=profile.championship?.active;if(!cup||setup.cupId!==cup.id||setup.cupRound!==cup.results.length||state.mode!=='over'||!Number.isFinite(state.finishTime)||state.distance<(setup.raceLength||3000))return null;
 const field=completedCupField(state),entries=[{id:'player',time:state.finishTime},...field.map(t=>({id:String(t.id),time:t.finishTime??state.finishTime+Math.max(0,raceLength(state)-t.distance)/Math.max(1,t.speed/3.6)}))].sort((a,b)=>a.time-b.time||(a.id==='player'?1:b.id==='player'?-1:a.id.localeCompare(b.id)));
 const result={round:setup.cupRound,distance:raceLength(state),entries};cup.results.push(result);cup.inProgress=false;const standings=cupStandings(cup),place=standings.find(r=>r.id==='player').position;
 let bonus=0,newPaint=false;if(cupComplete(cup)){bonus=[600,400,275,175,125,100][place-1]*cupDefinition(cup.cupKey).multiplier;
  if(!profile.championship.records.some(r=>r.id===cup.id)){profile.wallet+=bonus;profile.totalEarned+=bonus;profile.championship.records.unshift({id:cup.id,cupKey:cup.cupKey,rounds:cupRounds(cup).length,level:cup.level,place,date:new Date().toISOString(),points:standings.find(r=>r.id==='player').points,car:cup.setup.car,bonus});profile.championship.records=profile.championship.records.slice(0,30);profile.championship.unlocked=unlockedCups(profile.championship);if(place===1&&!profile.cosmeticUnlocks?.includes('champion')){profile.cosmeticUnlocks??=[];profile.cosmeticUnlocks.push('champion');newPaint=true;}}
 }
 return {id:cup.id,round:setup.cupRound,entries,standings,cupKey:cup.cupKey,cupName:cupDefinition(cup.cupKey).name,totalRounds:cupRounds(cup).length,complete:cupComplete(cup),place,bonus,newPaint};
}
