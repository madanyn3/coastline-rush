import fs from 'node:fs';
import {loadProfile} from '../coast-rush/dist/progression.js';
import {exportSave} from '../coast-rush/dist/save-backup.js';
const root=new URL('../',import.meta.url),dist=new URL('coast-rush/dist/',root);
const fixture=loadProfile({getItem:()=>null});fixture.wallet=321;
fs.writeFileSync(new URL('beta/qa-backup-v135.json',root),exportSave(fixture,{quality:'low',sensitivity:1,assist:true}));
fs.writeFileSync(new URL('__qa-driver.html',dist),fs.readFileSync(new URL('index.html',dist),'utf8').replace('src="game3d.js"','src="__qa-driver.js"'));
const buttons=`
const qaPanel=document.createElement('aside');qaPanel.style.cssText='position:fixed;z-index:200;right:5px;bottom:90px;display:flex;gap:5px;background:#fff;padding:5px';document.body.append(qaPanel);
function qaButton(text,fn){const b=document.createElement('button');b.textContent=text;b.onclick=fn;qaPanel.append(b);}
qaButton('QA tunnel',async()=>{await start({setup:{...captureRunSetup(profile,'race','normal',carStats(profile),'medium',appearanceFor(profile)),route:'mountain',world:'coast'}});race.distance=1550;race.speed=100;race.x=0;race.traffic.forEach((t,i)=>{t.distance=1575+i*20;t.z=t.distance-race.distance;});race.mode='paused';});
qaButton('QA finish race',async()=>{await start({setup:{...captureRunSetup(profile,'race','normal',carStats(profile),'easy',appearanceFor(profile)),route:'coast',world:'coast'}});race.mode='playing';let ticks=0;while(race.mode==='playing'&&ticks++<60000){const steer=Math.max(-1,Math.min(1,(-race.x*3-curveDrift(race.distance,race.speed,race.trackProfile)*.5)/steeringRate(race.speed)));step(race,{gas:true,steer},1/60);}finish();});
qaButton('QA drift',async()=>{await start({setup:{...captureRunSetup(profile,'race','normal',carStats(profile),'medium',appearanceFor(profile)),route:'coast',world:'coast'}});race.mode='playing';race.distance=140;race.speed=180;race.x=0;race.traffic=[];for(let i=0;i<30;i++)step(race,{gas:false,brake:true,steer:1},1/60);});
qaButton('Hide QA',()=>qaPanel.hidden=true);
`;
fs.writeFileSync(new URL('__qa-driver.js',dist),"import {curveDrift,steeringRate} from './physics.js';\n"+fs.readFileSync(new URL('game3d.js',dist),'utf8')+buttons);
console.log('Created temporary QA page and 321-coin backup fixture.');
