import assert from 'node:assert/strict';
import {createRace,resetRace,step,rank,settleReward,curveDrift,steeringRate,ROAD_LIMIT,RACE_LENGTH,RACE_REWARDS} from './coast-rush/dist/physics.js';
import {bend,rise,heading} from './coast-rush/dist/track.js';
const random=()=>.5, fresh=(mode='race',density='normal')=>{const s=createRace();resetRace(s,mode,density,random);s.ramps=[];s.obstacles=[];return s;};
let s=fresh();s.traffic=[];for(let i=0;i<120;i++)step(s,{gas:true},1/60,random);assert(s.speed>100&&s.speed<106);assert(s.distance>25);const before=s.speed;step(s,{gas:true,brake:true},.05,random);assert(s.speed<before);
for(const gameMode of ['race','career'])for(const direction of [-1,1]){s=fresh(gameMode);s.speed=150;for(let i=0;i<200;i++){s.traffic=[];step(s,{gas:true,steer:direction},1/60,random);assert(Math.abs(s.x)<=ROAD_LIMIT);assert.equal(s.mode,'playing');}assert.equal(s.x,direction*ROAD_LIMIT);assert(s.rail);for(let j=0;j<20;j++)step(s,{steer:-direction},1/60,random);assert(Math.abs(s.x)<ROAD_LIMIT);assert(!s.rail);}
function impact(relative,offset){const s=fresh();s.speed=150;s.traffic=[{distance:1,z:1,x:offset,speed:150-relative,targetSpeed:150-relative,acceleration:0,targetX:offset,id:0,finishTime:null}];step(s,{},.016,random);assert.equal(s.mode,'playing');assert.equal(s.impactCount,1);const count=s.impactCount;step(s,{},.016,random);assert.equal(s.impactCount,count);return s.lastImpactLoss;}
assert(impact(90,0)>impact(5,1.1)*3,'Direct high-speed crashes must slow more than glancing bumps');
s=fresh('career');s.speed=100;s.traffic=[{distance:1,z:1,x:0,speed:90}];step(s,{},.016,random);assert.equal(s.mode,'over');assert.equal(s.won,false);
s=fresh('career');s.distance=70;s.speed=0;s.traffic=[];const count=s.coins.length;step(s,{},.016,random);assert.equal(s.collected,1);assert(!s.coins.some(c=>c.distance===70&&c.x===0));step(s,{},.016,random);assert.equal(s.collected,1,'No duplicate pickup');
s=fresh('career');s.distance=RACE_LENGTH+100;s.x=4.9;s.speed=120;s.traffic=[];step(s,{},.016,random);assert.equal(s.mode,'playing','Career must continue beyond race distance');assert.equal(settleReward(s),0);
const counts=[];for(const density of ['light','normal','heavy']){s=fresh('career',density);s.x=4.9;for(let i=0;i<400;i++)step(s,{gas:true},.05,random);counts.push(s.traffic.length);assert.equal(s.mode,'playing');assert(s.coins.length<=30);assert(s.traffic.length<=24);}assert(counts[0]<counts[1]&&counts[1]<counts[2],`Density should increase traffic: ${counts}`);
for(let position=1;position<=6;position++){s=fresh();s.mode='over';s.won=true;s.finishTime=70;s.traffic.forEach((t,i)=>{t.finishTime=i<position-1?65:75;});s.place=rank(s);assert.equal(s.place,position);assert.equal(settleReward(s),RACE_REWARDS[position-1]);assert.equal(settleReward(s),0,'Rewards must be paid exactly once');}
s=fresh();s.speed=200;s.distance=2999.5;s.traffic=[];step(s,{},.05,random);assert.equal(s.mode,'over');assert.equal(s.distance,3000);assert(s.won);assert(s.finishTime<s.time);
s=fresh();for(let i=0;i<400;i++)step(s,{},.05,random);assert(s.traffic.every(t=>t.distance>100),'Bots must drive independently of the player');assert.equal(rank(s),6);
s=fresh();s.mode='paused';const snapshot=JSON.stringify(s);step(s,{gas:true,steer:1},.05,random);assert.equal(JSON.stringify(s),snapshot);
for(const distance of [0,250,1000,4000,10000]){assert.equal(bend(0,distance),0);assert.equal(rise(0,distance),0);assert(Math.abs(heading(0,distance))<1e-9);assert(Math.abs(bend(100,distance))<12);assert(Math.abs(bend(100,distance)-bend(100,distance+.01))<.01);}
assert(Math.abs(bend(200,140))>20,'The road should visibly curve');
console.log('PASS: controls, both rail boundaries in both modes, graded race impacts, contact deduplication, fatal career collision, pickups, endless distance, density settings, all finish rewards, reward deduplication, bot motion, finish timing, pause, continuous curves');




