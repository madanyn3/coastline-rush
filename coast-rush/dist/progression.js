import {normalizeChampionship} from './championship.js';
import {normalizeTrials} from './time-trials.js';
import {validRoute} from './routes.js';
import {appearanceFor,normalizeAppearance} from './customization.js';
import {normalizeMissions,advanceMissions} from './missions.js';
export const CARS=[
 {id:'classic',name:'Coast Classic',price:0,max:200,acceleration:52,color:'#ffad45',style:'classic'},
 {id:'sprint',name:'Sprint R',price:450,max:220,acceleration:59,color:'#54dacf',style:'sport'},
 {id:'gt',name:'Midnight GT',price:1100,max:240,acceleration:66,color:'#b29aff',style:'gt'},
 {id:'muscle',name:'Ironclad V8',price:1600,max:225,acceleration:74,handling:.94,braking:115,color:'#ec7250',style:'muscle',tagline:'Big torque. Straight-line attitude.'},
 {id:'apex',name:'Apex X',price:2800,max:265,acceleration:77,handling:1.06,braking:120,color:'#d9f775',style:'hyper',tagline:'Low, sharp and built to chase the podium.'}
];
export const WORLDS=[{id:'coast',name:'Coast',price:0,icon:'☀'},{id:'rain',name:'Rain',price:350,icon:'☂'},{id:'snow',name:'Snow',price:650,icon:'❄'},{id:'night',name:'Night',price:900,icon:'☾'}];
export const UPGRADES=[
 {id:'acceleration',name:'Acceleration',icon:'↗',costs:[120,240,420],step:.08,description:'Reach top speed sooner.'},
 {id:'handling',name:'Handling',icon:'↔',costs:[100,200,350],step:.07,description:'More control through corners.'},
 {id:'brakes',name:'Brakes',icon:'⊖',costs:[80,160,280],step:.12,description:'Slow down faster before turns.'},
 {id:'nitro',name:'Nitro tank',icon:'ϟ',costs:[150,300,500],step:.5,description:'Longer burst · Race only.'}
];
export function upgradeLevels(p,car=p.car){const owned=p.ownedCars?.includes(car);return Object.fromEntries(UPGRADES.map(u=>[u.id,owned?Math.min(u.costs.length,Math.max(0,Math.floor(Number(p.upgrades?.[car]?.[u.id])||0))):0]));}
export function carStats(p,car=p.car){const base=CARS.find(c=>c.id===car)||CARS[0],levels=upgradeLevels(p,base.id),bonus=id=>UPGRADES.find(u=>u.id===id).step*levels[id];return {...base,acceleration:base.acceleration*(1+bonus('acceleration')),handling:(base.handling||1)*(1+bonus('handling')),braking:(base.braking||110)*(1+bonus('brakes')),nitroDuration:3+bonus('nitro'),upgradeLevels:levels,upgradeCount:Object.values(levels).reduce((sum,l)=>sum+l,0)};}
export function upgradeCost(p,car,id){const item=UPGRADES.find(u=>u.id===id);if(!item||!p.ownedCars.includes(car))return null;return item.costs[upgradeLevels(p,car)[id]]??null;}
export function buyUpgrade(p,car,id){const price=upgradeCost(p,car,id);if(price===null||p.wallet<price)return false;const levels=upgradeLevels(p,car);p.wallet-=price;levels[id]++;p.upgrades??={};p.upgrades[car]=levels;return true;}
const KEY='coast-profile-v1',amount=n=>Number.isFinite(Number(n))?Math.max(0,Math.floor(Number(n))):0;
export function loadProfile(storage){let p;try{p=JSON.parse(storage.getItem(KEY));}catch{}const legacy=k=>{try{return storage.getItem(k);}catch{return 0;}};
 const wallet=amount(p?.wallet??legacy('coast-wallet')),ownedCars=CARS.filter(c=>c.price===0||p?.ownedCars?.includes(c.id)).map(c=>c.id),worlds=WORLDS.filter(w=>w.price===0||p?.worlds?.includes(w.id)).map(w=>w.id);
 const upgrades=Object.fromEntries(ownedCars.map(car=>[car,upgradeLevels({ownedCars,upgrades:p?.upgrades},car)]));
 return {version:1,medals:Object.fromEntries(['gold','silver','bronze'].map(key=>[key,amount(p?.medals?.[key]??(Array.isArray(p?.history)?p.history.filter(h=>h?.medal===key).length:0))])),achievements:Array.isArray(p?.achievements)?p.achievements.filter(v=>['first-finish','clean-podium','drift-driver','shortcut-scout','endurance','airtime'].includes(v)):[],championship:normalizeChampionship(p?.championship),cosmeticUnlocks:Array.isArray(p?.cosmeticUnlocks)?p.cosmeticUnlocks.filter(v=>['champion','drifter'].includes(v)):[],timeTrials:normalizeTrials(p?.timeTrials),route:validRoute(p?.route),wallet,totalEarned:Math.max(wallet,amount(p?.totalEarned)),best:Math.max(Number(p?.best)||0,Number(legacy('coast-career-best'))||0),ownedCars,worlds,car:ownedCars.includes(p?.car)?p.car:'classic',world:worlds.includes(p?.world)?p.world:'coast',history:Array.isArray(p?.history)?p.history.slice(0,100):[],active:p?.active||null,upgrades,missions:normalizeMissions(p?.missions),customization:Object.fromEntries(ownedCars.map(car=>[car,normalizeAppearance(p?.customization?.[car])]))};
}
export function persist(p,storage){try{storage.setItem(KEY,JSON.stringify(p));return true;}catch{return false;}}
export function buy(p,type,id){const list=type==='car'?CARS:WORLDS,key=type==='car'?'ownedCars':'worlds',item=list.find(c=>c.id===id);if(!item)return false;if(!p[key].includes(id)){if(p.wallet<item.price)return false;p.wallet-=item.price;p[key].push(id);}p[type]=id;return true;}
export function earn(p,n){n=amount(n);p.wallet+=n;p.totalEarned+=n;}
export function beginRun(p,mode){if(mode==='race')advanceMissions(p);p.active={id:globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random(),date:new Date().toISOString(),mode,car:p.car,world:p.world,route:validRoute(p.route),upgrades:upgradeLevels(p),appearance:appearanceFor(p),distance:0,time:0,coins:0};return p.active;}
export function recordRun(p,state,status,reward=0){const a=p.active;if(!a||p.history.some(h=>h.id===a.id))return false;earn(p,reward);if(state.gameMode==='race'&&status==='finish'){const medal=state.place===1?'gold':state.place<=3?'silver':'bronze';p.medals??={gold:0,silver:0,bronze:0};p.medals[medal]=(p.medals[medal]||0)+1;}p.history.unshift({...a,distance:Math.round(state.distance||0),time:Math.round(state.time||0),coins:a.coins+reward,status,medal:state.gameMode==='race'&&status==='finish'?(state.place===1?'gold':state.place<=3?'silver':'bronze'):null,drifts:state.driftCount||0,nearMisses:state.nearMisses||0,bestCombo:state.bestCombo||0,shortcuts:state.shortcutsCompleted||0,place:state.gameMode==='race'&&status==='finish'?state.place:null});p.history=p.history.slice(0,100);p.active=null;return true;}
