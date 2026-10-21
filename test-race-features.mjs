import assert from 'node:assert/strict';
import {createRace,resetRace,beginCountdown,step,createRaceFeatures,createBoostStrips} from './coast-rush/dist/physics.js';
let seed=98;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
const features=createRaceFeatures(createBoostStrips(rng),rng),next=createRaceFeatures(createBoostStrips(rng),rng);
assert(features.ramps.some(r=>r.paired));assert(features.ramps.some(r=>!r.paired));assert.notDeepEqual(features,next);assert(features.obstacles.some(o=>o.kind==='cone'));assert(features.obstacles.some(o=>o.kind==='barrier'));
assert(features.obstacles.every(o=>!features.ramps.some(r=>r.x===o.x&&Math.abs(r.distance-o.distance)<50)),'Keep the approach to ramps clear');
function fresh(mode='race'){const s=createRace();resetRace(s,mode,'normal',()=>.5);s.boostStrips=[];s.ramps=[];s.obstacles=[];s.traffic=[];return s;}
let s=fresh();beginCountdown(s);for(let i=0;i<40;i++)step(s,{gas:true,steer:1},.05);assert.equal(s.mode,'countdown');assert.equal(s.distance,0);assert.equal(s.speed,0);assert.equal(s.time,0);assert.equal(Math.ceil(s.countdown),1);
s.mode='paused';const frozen=JSON.stringify(s);step(s,{gas:true},.05);assert.equal(JSON.stringify(s),frozen);s.mode='countdown';for(let i=0;i<20;i++)step(s,{gas:true},.05);assert.equal(s.mode,'playing');assert.equal(s.distance,0);assert(s.goTime>0);step(s,{gas:true},.05);assert(s.speed>0);
s=createRace();resetRace(s);beginCountdown(s);for(let i=0;i<30;i++)step(s,{gas:true},.05);assert(s.traffic.every(t=>t.speed===0&&t.distance===8+t.id*8),'Bots wait for GO too');
for(const id of ['player',0]){
 s=fresh();s.ramps=[{distance:100,x:0,usedBy:[]}];let car=s;
 if(id===0){const original=createRace();resetRace(original);car={...original.traffic[0],distance:99,x:0,targetX:0,speed:180};s.traffic=[car];s.x=4;}else{s.distance=99;s.speed=180;}
 step(s,{gas:true},.05);assert(car.jumpY>=.85);assert(car.jumpVelocity>0);assert.equal(car.rampHits,1);assert(s.ramps[0].usedBy.includes(id));
 let peak=car.jumpY;for(let i=0;i<100;i++){car.x=0;s.x=id==='player'?0:4;step(s,{gas:true},.016);peak=Math.max(peak,car.jumpY);}assert(peak>2);assert.equal(car.jumpY,0,'Every jump lands');assert.equal(car.rampHits,1);
}
for(const kind of ['cone','barrier']){
 s=fresh();s.distance=99;s.speed=180;s.obstacles=[{distance:100,x:0,kind,usedBy:[]}];step(s,{gas:true},.016);assert(s.speed<180&&s.speed>150);assert.equal(s.obstacleHits,1);assert.equal(s.mode,'playing');step(s,{gas:true},.016);assert.equal(s.obstacleHits,1,'A prop costs pace once');
 s=fresh();s.distance=99;s.speed=180;s.jumpY=2;s.obstacles=[{distance:100,x:0,kind,usedBy:[]}];step(s,{gas:true},.016);assert.equal(s.obstacleHits,0,'Jumping clears low obstacles');
 const original=createRace();resetRace(original);s=fresh();s.x=4;s.traffic=[{...original.traffic[0],distance:99,x:0,targetX:0,speed:180}];s.obstacles=[{distance:100,x:0,kind,usedBy:[]}];step(s,{},.016);assert(s.traffic[0].speed<180,'Bots lose pace on props too');
}
s=fresh();s.distance=99;s.speed=240;s.boostStrips=[{distance:100,x:0,length:14,usedBy:[]}];s.ramps=[{distance:100,x:0,usedBy:[]}];step(s,{gas:true},.05);assert(s.boostTime>0&&s.jumpY>0,'Boost and ramp combine without an instant speed jump');
s=fresh('career');beginCountdown(s);assert.equal(s.mode,'playing');assert.equal(s.ramps.length,0);assert.equal(s.obstacles.length,0);
console.log('PASS: randomized paired/solo ramps and props, clear approaches, frozen countdown and pause, shared launches/landings, mild single-hit slowdowns, obstacle clearance, boost jumps, Career exclusion');
