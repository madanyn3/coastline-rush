import {planBot} from './bot-driver.js';
import {updateDrift} from './drifting.js';
import {laneLimit} from './route-sections.js';
import {updateShortcutTerrain} from './shortcut-terrain.js';
import {updateNearMisses} from './near-misses.js';
import {trialSeed} from './time-trials.js';
import {shortcutBounds,shortcutOffset} from './shortcuts.js';
import {validRoute} from './routes.js';
import {updateSlipstream,clearSlipstream,DRAFT_BONUS} from './slipstream.js';
import {curvature,trackFor,RACE_DIFFICULTIES} from './track.js';
export const ROAD_LIMIT=4.9, RACE_LENGTH=3000, RACE_REWARDS=[150,100,70,45,25,10];
export const raceLength=s=>Number.isFinite(s?.raceLength)?Math.max(3000,Math.min(10000,s.raceLength)):RACE_LENGTH;
export const NORMAL_MAX=200,STRIP_MAX=270,NITRO_MAX=280,COMBO_MAX=300,NITRO_SECONDS=3;
const nitroSeconds=car=>car.nitroDuration||NITRO_SECONDS;
// Steering and road drift are expressed in metres/second in the road frame.
// Faster driving needs stronger steering into a bend to hold the same lane.
export const steeringRate=speed=>(1.2+speed/30)*(speed>1?1:0);
export const curveDrift=(distance,speed,mode='race')=>-curvature(distance,mode)*(speed/3.6)**2*.4;
// Boost acceleration eases in; expiry eases into a gradual coast-down.
export function smoothBoostSpeed(car,cap,boost,dt,normalAcceleration,brake=false){
 if(brake){car.boostAcceleration=0;car.speed=Math.max(0,car.speed-(car.braking||110)*dt);return;}
 if(boost==='draft'){if(car.speed<(car.normalMax||NORMAL_MAX)&&normalAcceleration>0){car.boostAcceleration=0;car.speed=Math.min(cap,car.speed+normalAcceleration*dt);return;}const previous=car.speed,delta=cap-car.speed,target=normalAcceleration<0?normalAcceleration:delta>0?Math.min(18,delta*2.5):Math.max(-18,delta*1.8);car.boostAcceleration=(car.boostAcceleration||0)+(target-(car.boostAcceleration||0))*(1-Math.exp(-dt/.28));car.speed=Math.max(0,car.speed+car.boostAcceleration*dt);if(previous<=cap)car.speed=Math.min(cap,car.speed);}
 else if(boost){const ceiling=boost==='combo'?46:boost==='nitro'?40:36,target=Math.min(ceiling,Math.max(-26,(cap-car.speed)*1.2+8));car.boostAcceleration=(car.boostAcceleration||0)+(target-(car.boostAcceleration||0))*(1-Math.exp(-dt/.28));car.speed=Math.max(0,Math.min(Math.max(cap,car.speed),car.speed+car.boostAcceleration*dt));}
 else if(car.speed>(car.normalMax||NORMAL_MAX)){const target=-Math.min(26,8+(car.speed-(car.normalMax||NORMAL_MAX))*.22);car.boostAcceleration=(car.boostAcceleration||0)+(target-(car.boostAcceleration||0))*(1-Math.exp(-dt/.5));car.speed=Math.max(car.normalMax||NORMAL_MAX,car.speed+Math.min(0,car.boostAcceleration)*dt);}
 else{car.boostAcceleration=0;car.speed=clamp(car.speed+normalAcceleration*dt,0,cap);}
}
export function smoothSteering(current,target,dt){
 const value=Number.isFinite(current)?clamp(current,-1,1):0,aim=clamp(target||0,-1,1);
 // Ease in; release and direction changes respond a little faster. The exact
 // exponential and its average keep both response and travel frame independent.
 const tau=aim===0?.095:value*aim<0?.11:.16,decay=Math.exp(-Math.max(0,dt)/tau);
 return {value:aim+(value-aim)*decay,average:dt>0?aim+(value-aim)*tau*(1-decay)/dt:value};
}
export const DENSITY={light:{spacing:90,initial:3},normal:{spacing:55,initial:5},heavy:{spacing:30,initial:8}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lanes=[-3.7,0,3.7];
export function createRace(){return {curveForce:0,drifting:false,driftTime:0,driftAngle:0,driftCount:0,driftBank:0,driftBest:0,tutorial:false,cornerAssist:true,terrainNormalTick:0,won:false,raceLength:RACE_LENGTH,cupId:null,cupRound:null,cupRivalId:null,mode:'ready',gameMode:'race',difficulty:'normal',slipstream:0,drafting:false,draftSeconds:0,railHits:0,nitroUses:0,speed:0,distance:0,x:0,steering:0,traffic:[],coins:[],collected:0,ramps:[],obstacles:[],jumpY:0,jumpVelocity:0,rampHits:0,obstacleHits:0,countdown:0,goTime:0,boostStrips:[],boostAcceleration:0,boostTime:0,stripHits:0,nitro:0,nitroTime:0,nitroIgnition:0,sinceSpawn:0,nextCoin:70,rail:false,time:0,place:1,impact:0,impactCount:0,lastImpactLoss:0,rewardPaid:false,finishTime:null,nearCombo:0,comboTime:0,nearMisses:0,nearReward:0,bestCombo:0,nearFlash:0,trialSplits:[],shortcutActive:null,shortcutUses:0,shortcutsCompleted:0,shortcutLift:0,shortcutPitch:0,shortcutRoll:0,shortcutAir:false,shortcutRampHits:[],shortcutPropHits:[]};}
function vehicle(distance,x,speed,kind){return {distance,z:distance,x,speed,kind,contact:false};}
export function resetRace(s,gameMode='race',difficulty='normal',random=Math.random,spec={max:200,acceleration:52},raceDifficulty='medium',route='coast',length=RACE_LENGTH){
 Object.assign(s,createRace(),{mode:'playing',gameMode:gameMode==='trial'?'trial':gameMode==='career'?'career':'race',difficulty:DENSITY[difficulty]?difficulty:'normal'});
 s.raceLength=raceLength({raceLength:length});s.raceDifficulty=RACE_DIFFICULTIES.includes(raceDifficulty)?raceDifficulty:'medium';s.routeId=validRoute(route);s.trackProfile=trackFor(s.gameMode,s.raceDifficulty,s.routeId);s.nitroBubbles=[];s.nitroBubbleHits=0;s.normalMax=spec.max;s.acceleration=spec.acceleration;s.handling=spec.handling||1;s.braking=spec.braking||110;s.nitroDuration=spec.nitroDuration||NITRO_SECONDS;s.upgradeLevels={...spec.upgradeLevels};
 if(s.gameMode!=='career'){if(s.gameMode==='trial')random=trialSeed(s.routeId,s.raceDifficulty);s.traffic=s.gameMode==='race'?Array.from({length:5},(_,i)=>({...vehicle(8+i*8,lanes[i%3],0,1+i%3),id:i,normalMax:spec.max,handling:s.handling,braking:s.braking,nitroDuration:s.nitroDuration,targetSpeed:spec.max+[ -4,-2,0,-3,-1][i],acceleration:spec.acceleration+[-2,0,2,-1,1][i],targetX:lanes[i%3],finishTime:null,boostTime:0,boostHits:0,impactTime:0,nitro:0,nitroTime:0,nitroUses:0})):[];s.boostStrips=createBoostStrips(random,s.raceLength);Object.assign(s,createRaceFeatures(s.boostStrips,random,s.raceLength));if(s.routeId==='city'){s.ramps=s.ramps.filter(r=>r.distance%3000<1090||r.distance%3000>1500);s.nitroBubbles=s.nitroBubbles.filter(b=>s.ramps.some(r=>r.distance+10===b.distance));}}
 else{const n=DENSITY[s.difficulty].initial;s.traffic=Array.from({length:n},(_,i)=>vehicle(85+i*35,lanes[Math.floor(random()*3)],65+random()*40,1+i%3));addCoins(s,random);}
}
export function createBoostStrips(random=Math.random,length=RACE_LENGTH){const strips=[];let distance=150+random()*80;while(distance<length-150){strips.push({distance,z:distance,x:lanes[Math.floor(random()*3)],length:14,usedBy:[]});distance+=220+random()*180;}return strips;}
export function createRaceFeatures(strips,random=Math.random,length=RACE_LENGTH){
 const ramps=[],obstacles=[];
 // Guaranteed mix: several randomly selected boost pads lead straight into a ramp.
 strips.forEach((b,i)=>{if(i%3===0||random()<.25)ramps.push({distance:b.distance+12,x:b.x,paired:true,usedBy:[]});});
 for(let distance=340+random()*100;distance<length-220;distance+=440+random()*180){
  if(!ramps.some(r=>Math.abs(r.distance-distance)<65))ramps.push({distance,x:lanes[Math.floor(random()*3)],paired:false,usedBy:[]});
 }
 for(let distance=260+random()*100;distance<length-150;distance+=130+random()*110){
  const nearby=ramps.find(r=>Math.abs(r.distance-distance)<50);
  const options=lanes.filter(x=>!nearby||x!==nearby.x);
  obstacles.push({distance,x:options[Math.floor(random()*options.length)],kind:random()<.55?'cone':'barrier',usedBy:[]});
 }
 return {ramps:ramps.sort((a,b)=>a.distance-b.distance),obstacles,nitroBubbles:ramps.map(r=>({distance:r.distance+10,x:r.x,y:2.2,usedBy:[]}))};
}
export function beginCountdown(s){if(s.gameMode!=='career'){s.mode='countdown';s.countdown=3;s.goTime=0;s.place=rank(s);}}
function verticalStep(car,dt){
 if((car.jumpY||0)>0||(car.jumpVelocity||0)>0){car.jumpY=Math.max(0,(car.jumpY||0)+(car.jumpVelocity||0)*dt-10*dt*dt);car.jumpVelocity=(car.jumpVelocity||0)-20*dt;if(car.jumpY===0)car.jumpVelocity=0;}
}
function raceFeatures(s,car,id,previous){
 // The low end of a six-metre ramp rises to its launch lip at distance.
 const ramp=s.ramps.find(r=>car.distance>=r.distance-6&&car.distance<r.distance&&Math.abs(car.x-r.x)<1.25);
 car.rampLift=ramp&&!(car.jumpY>0)?(car.distance-ramp.distance+6)/6*.85:0;
 for(const r of s.ramps){if(r.usedBy.includes(id)||Math.abs(car.x-r.x)>1.25||previous>r.distance||car.distance<r.distance)continue;r.usedBy.push(id);if(car.speed<45||car.jumpY>0)continue;car.jumpY=.85;car.jumpVelocity=5+Math.min(car.speed,300)/55;car.rampHits=(car.rampHits||0)+1;car.rampLift=0;}
 for(const bubble of s.nitroBubbles||[]){if(bubble.usedBy.includes(id)||Math.abs(car.x-bubble.x)>1.35||previous>bubble.distance+2||car.distance<bubble.distance-2||(car.jumpY||0)<.6||Math.abs((car.jumpY||0)+.35-bubble.y)>1.1)continue;bubble.usedBy.push(id);car.nitro=Math.min(100,(car.nitro||0)+25);if(car.nitroTime>0){car.nitroTime=Math.min(nitroSeconds(car),car.nitroTime+nitroSeconds(car)*.25);car.nitro=100*car.nitroTime/nitroSeconds(car);}car.nitroBubbleHits=(car.nitroBubbleHits||0)+1;}
 for(const o of s.obstacles){if(o.usedBy.includes(id)||Math.abs(car.x-o.x)>(o.kind==='cone'?.8:1.35)||previous>o.distance+1||car.distance<o.distance-1)continue;
  // Each racer can clip a prop once; jumping clears these low obstacles.
  if((car.jumpY||0)+(car.rampLift||0)>.85)continue;o.usedBy.push(id);car.speed*=o.kind==='cone'?.94:.88;car.obstacleHits=(car.obstacleHits||0)+1;if(id==='player'){s.impact=.12;}
 }
}
export function chargeNitro(car,dt){if(car.nitroTime>0){car.nitroTime=Math.max(0,car.nitroTime-dt);car.nitro=100*car.nitroTime/nitroSeconds(car);}else car.nitro=Math.min(100,(car.nitro||0)+8*clamp((car.speed-80)/120,0,1)*dt);}
export function botNitro(car,state,ahead){
 if(car.nitro<99.999||car.nitroTime>0||car.speed<140||car.impactTime>0||car.jumpY>0)return false;
 const clear=!ahead||ahead.distance-car.distance>18||Math.abs(ahead.x-car.x)>1.5;
 const straight=Math.abs(curvature(car.distance+35,state.trackProfile||state.gameMode))<.0015;
 const attacking=state.distance>car.distance-25||raceLength(state)-car.distance<450||(state.time+car.id*1.7)%7<1.4;
 if(!clear||!straight||!attacking)return false;car.nitro=100;car.nitroTime=nitroSeconds(car);car.nitroUses=(car.nitroUses||0)+1;return true;
}
export function activateNitro(s){if(s.gameMode==='career'||s.mode!=='playing'||s.nitro<99.999||s.nitroTime>0)return false;s.nitro=100;s.nitroTime=nitroSeconds(s);s.nitroIgnition=.3;s.nitroUses=(s.nitroUses||0)+1;return true;}
function stripPickup(s,car,id,previous){for(const strip of s.boostStrips){if(strip.usedBy.includes(id)||Math.abs(car.x-strip.x)>1.25||previous>strip.distance+strip.length/2||car.distance<strip.distance-strip.length/2)continue;strip.usedBy.push(id);car.boostTime=Math.max(car.boostTime||0,2);if(id==='player')s.stripHits++;else car.boostHits=(car.boostHits||0)+1;}}
function addCoins(s,random){while(s.nextCoin<s.distance+240){const x=lanes[Math.floor(random()*3)];for(let i=0;i<3;i++)s.coins.push({distance:s.nextCoin+i*5,z:s.nextCoin+i*5-s.distance,x});s.nextCoin+=40;}}
export function rank(s){if(s.gameMode!=='race')return 0;return 1+s.traffic.filter(t=>s.finishTime!==null?t.finishTime!==null&&t.finishTime<=s.finishTime:t.finishTime!==null||t.distance>s.distance).length;}
export function settleReward(s){if(s.gameMode!=='race'||s.mode!=='over'||!s.won||s.rewardPaid)return 0;s.rewardPaid=true;return RACE_REWARDS[clamp(s.place,1,6)-1];}
export function step(s,input,dt,random=Math.random){
 dt=clamp(dt,0,.05);
 if(s.mode==='countdown'){s.countdown=Math.max(0,Math.round((s.countdown-dt)*1e9)/1e9);if(s.countdown<=1e-8){s.countdown=0;s.mode='playing';s.goTime=.7;}return;}
 if(s.mode!=='playing')return;
 s.goTime=Math.max(0,s.goTime-dt);verticalStep(s,dt);for(const t of s.traffic)verticalStep(t,dt);
 if(s.gameMode!=='career'){const racers=[s,...s.traffic];for(const car of racers)updateSlipstream(car,racers,dt,{enabled:car===s?!!input.gas:true,brake:car===s&&input.brake});}
 const length=raceLength(s),oldDistance=s.distance,oldTime=s.time,oldX=s.x;s.time+=dt;s.impact=Math.max(0,s.impact-dt);
 s.boostTime=Math.max(0,s.boostTime-dt);s.nitroIgnition=Math.max(0,s.nitroIgnition-dt);
 if(s.gameMode!=='career'&&s.nitroTime>0){s.nitroTime=Math.max(0,s.nitroTime-dt);s.nitro=100*s.nitroTime/nitroSeconds(s);if(input.brake){s.nitroTime=0;s.nitro=0;}}
 else if(s.gameMode!=='career')s.nitro=Math.min(100,s.nitro+8*clamp((s.speed-80)/120,0,1)*dt);
 const stripActive=s.gameMode!=='career'&&s.boostTime>0,nitroActive=s.gameMode!=='career'&&s.nitroTime>0,draftActive=s.gameMode!=='career'&&s.slipstream>0&&input.gas;
 const offset=(s.normalMax||200)-200;
 const limit=offset+(stripActive&&nitroActive?COMBO_MAX:nitroActive?NITRO_MAX:stripActive?STRIP_MAX:NORMAL_MAX+(draftActive?DRAFT_BONUS*s.slipstream:0));
 smoothBoostSpeed(s,limit,stripActive&&nitroActive?'combo':nitroActive?'nitro':stripActive?'strip':draftActive?'draft':null,dt,input.gas?(s.acceleration||52):-7,input.brake);
 const branch=shortcutBounds(s),edge=laneLimit(s.routeId,s.distance),steering=smoothSteering(s.steering,input.steer,dt),targetForce=branch?0:curveDrift(s.distance,s.speed,s.trackProfile||s.gameMode)*(s.cornerAssist===false?1:.5);s.curveForce=(s.curveForce||0)+(targetForce-(s.curveForce||0))*(1-Math.exp(-dt/.24));const lateralSpeed=steering.average*steeringRate(s.speed)*(s.handling||1)+(branch?0:s.curveForce),desired=s.x+lateralSpeed*dt,wasRail=s.rail;
 s.steering=steering.value;s.rail=desired<(branch?.min??-edge)||desired>(branch?.max??edge);s.x=clamp(desired,branch?.min??-edge,branch?.max??edge);
 if(s.rail){clearSlipstream(s);if(!wasRail){s.speed*=.82;s.railHits=(s.railHits||0)+1;}s.speed=Math.max(0,s.speed-(35+s.speed*.35)*dt);}
 const meters=s.speed/3.6*dt*(branch?.factor||1);s.distance+=meters;s.sinceSpawn+=meters;if(branch)s.x+=shortcutOffset(s.shortcutActive,s.distance)-shortcutOffset(s.shortcutActive,oldDistance);
 if(s.gameMode!=='career'){stripPickup(s,s,'player',oldDistance);raceFeatures(s,s,'player',oldDistance);for(const strip of s.boostStrips)strip.z=strip.distance-s.distance;}
 updateShortcutTerrain(s,oldDistance);
 if(s.gameMode==='career'){
  if(s.sinceSpawn>=DENSITY[s.difficulty].spacing){s.sinceSpawn=0;if(s.traffic.length<24)s.traffic.push(vehicle(s.distance+250,lanes[Math.floor(random()*3)],65+random()*40,1+Math.floor(random()*3)));}
 }else{
  for(const t of s.traffic){
   if(t.finishTime!==null)continue;
   t.boostTime=Math.max(0,(t.boostTime||0)-dt);t.impactTime=Math.max(0,(t.impactTime||0)-dt);chargeNitro(t,dt);
   const racers=[...s.traffic,s],ahead=racers.filter(o=>o!==t&&o.distance>t.distance&&o.distance-t.distance<22&&Math.abs(o.x-t.x)<1.6).sort((a,b)=>a.distance-b.distance)[0];
   planBot(t,s,dt);
   botNitro(t,s,ahead);const boosted=t.boostTime>0,nitrous=t.nitroTime>0,draftBoost=t.slipstream>0,cap=offset+(boosted&&nitrous?COMBO_MAX:nitrous?NITRO_MAX:boosted?STRIP_MAX:NORMAL_MAX+(draftBoost?DRAFT_BONUS*t.slipstream:0));
   const mountainLimit=s.routeId==='mountain'?Math.max(105,t.normalMax-Math.min(95,Math.max(...[10,35,65].map(a=>Math.abs(curvature(t.distance+a,s.trackProfile))))*17000)):Infinity;
   const cornerSpeed=Math.min(mountainLimit,boosted||nitrous||draftBoost?cap:Math.min(t.cornerTarget??t.targetSpeed,t.targetSpeed-Math.min(4,Math.abs(curvature(t.distance+20,s.trackProfile||s.gameMode))*1800)));
   const desiredSpeed=ahead&&Math.abs(t.x-t.targetX)<.4?Math.min(cornerSpeed,ahead.speed+4):cornerSpeed;
   const normalAcceleration=clamp((desiredSpeed-t.speed)/(dt||1),-70*(t.braking||110)/110,t.acceleration*(t.impactTime>0?.15:1));smoothBoostSpeed(t,Math.min(cap,mountainLimit),boosted&&nitrous?'combo':nitrous?'nitro':boosted?'strip':draftBoost?'draft':null,dt,normalAcceleration);if(ahead&&t.speed>desiredSpeed&&Math.abs(t.x-t.targetX)<.4)t.speed=Math.max(desiredSpeed,t.speed-70*(t.braking||110)/110*dt);
   const safeEdge=laneLimit(s.routeId,t.distance)-.25;t.targetX=clamp(t.targetX,-safeEdge,safeEdge);t.x+=clamp(t.targetX-t.x,-2.6*(t.handling||1)*dt,2.6*(t.handling||1)*dt);
  }
 }
 for(const t of s.traffic){
  const previous=t.distance;t.previousDistance=previous;t.distance+=t.speed/3.6*dt;t.z=t.distance-s.distance;
  if(s.gameMode!=='career'){stripPickup(s,t,t.id,previous);raceFeatures(s,t,t.id,previous);}
  if(s.gameMode!=='career'&&t.finishTime===null&&t.distance>=length){t.finishTime=oldTime+dt*clamp((length-previous)/(t.distance-previous||1),0,1);t.nitroTime=0;t.boostTime=0;clearSlipstream(t);}
  const dx=Math.abs(t.x-s.x),dz=Math.abs(t.z),touching=dz<2.65&&dx<1.3&&Math.abs((s.jumpY||0)+(s.rampLift||0)-(t.jumpY||0)-(t.rampLift||0))<.9;
  if(!touching){if(dz>3.4||dx>1.6)t.contact=false;continue;}
  if(s.gameMode==='career'){s.mode='over';s.won=false;s.impact=.5;break;}
  if(!t.contact){
   const severity=Math.hypot(s.speed-t.speed,lateralSpeed*3.6),directness=1-dx/1.3;
   const loss=Math.min(s.speed*.75,Math.max(3,severity*.55)*(.35+.65*directness));
   const botLoss=Math.min(t.speed*.75,Math.max(6,severity*.4)*(.35+.65*directness));
   s.speed=Math.max(0,s.speed-loss);t.speed=Math.max(0,t.speed-botLoss);t.impactTime=.65;t.boostTime=0;if(t.nitroTime>0){t.nitroTime=0;t.nitro=0;}s.boostTime=0;if(s.nitroTime>0){s.nitroTime=0;s.nitro=0;}clearSlipstream(s);clearSlipstream(t);s.lastImpactLoss=loss;s.impact=.45;s.impactCount++;t.contact=true;
   s.x=clamp(s.x+(s.x>=t.x?1:-1)*(.18+Math.min(.4,severity/180)),branch?shortcutOffset(s.shortcutActive,s.distance)-1.35:-ROAD_LIMIT,branch?shortcutOffset(s.shortcutActive,s.distance)+1.35:ROAD_LIMIT);
   t.distance+=(t.z>=0?1:-1)*.5;t.z=t.distance-s.distance;
  }
 }
 updateDrift(s,input,dt);
 if(s.gameMode==='career'){
  updateNearMisses(s,dt,oldDistance,oldX);s.traffic=s.traffic.filter(t=>t.z>-30&&t.z<450);
  // A traffic crash ends the run before any pickups in that frame.
  if(s.mode==='playing')for(const c of s.coins){c.z=c.distance-s.distance;if(Math.abs(c.z)<2.5&&Math.abs(c.x-s.x)<.95){c.taken=true;s.collected++;}}
  s.coins=s.coins.filter(c=>!c.taken&&c.distance>s.distance-10);addCoins(s,random);
 }else{
  if(s.gameMode==='trial')for(const checkpoint of [750,1500,2250])if(oldDistance<checkpoint&&s.distance>=checkpoint)s.trialSplits.push(oldTime+dt*(checkpoint-oldDistance)/(s.distance-oldDistance));
  if(s.distance>=length){s.finishTime=oldTime+dt*clamp((length-oldDistance)/(s.distance-oldDistance||1),0,1);s.distance=length;s.mode='over';s.won=true;}
  s.place=rank(s);
  if(s.mode==='over'){clearSlipstream(s);s.boostTime=0;s.nitroTime=0;s.nitroIgnition=0;}
 }
}
