import assert from 'node:assert/strict';
import {smoothBoostSpeed,createRace,resetRace,step,curveDrift} from './coast-rush/dist/physics.js';
import {center,curvature,bend,rise,heading} from './coast-rush/dist/track.js';
for(const rate of [30,60,120]){
 const car={speed:200};let last=200,reached=null;for(let i=0;i<rate*3;i++){smoothBoostSpeed(car,280,'nitro',1/rate,52);assert(car.speed>=last);assert(car.speed-last<=48/rate+.001,'Bounded speed gain');if(car.speed>=275&&reached===null)reached=(i+1)/rate;last=car.speed;}
 assert(reached>2&&reached<=3.05,`The nitro surge must take seconds: ${rate} fps, ${reached}`);assert(car.speed>275&&car.speed<=280);
 let elapsed=0;for(let i=0;i<rate*8&&car.speed>200;i++){const before=car.speed;smoothBoostSpeed(car,200,null,1/rate,52);assert(car.speed<=before);assert(before-car.speed<=26/rate+.001,'Bounded return to normal');elapsed+=1/rate;}assert.equal(car.speed,200);assert(elapsed>3&&elapsed<8);
}
let s=createRace();resetRace(s);s.traffic=[];s.ramps=[];s.obstacles=[];s.speed=200;s.distance=99;s.x=0;s.boostStrips=[{distance:100,x:0,length:14,usedBy:[]}];step(s,{gas:true},.016);assert.equal(s.speed,200,'Strip pickup must not change speed instantly');assert(s.boostTime>0);step(s,{gas:true},.016);assert(s.speed>200&&s.speed<201);
let racePeak=0,careerPeak=0;for(let d=0;d<3000;d+=5){racePeak=Math.max(racePeak,Math.abs(curvature(d,'race')));careerPeak=Math.max(careerPeak,Math.abs(curvature(d,'career')));for(const mode of ['race','career']){assert.equal(bend(0,d,mode),0);assert.equal(rise(0,d,mode),0);assert.equal(heading(0,d,mode),0);assert(Math.abs(bend(100,d+.001,mode)-bend(100,d,mode))<.01);}}
assert(racePeak>careerPeak*2.5,'Race bends should be substantially tighter');assert.notEqual(center(500,'race'),center(500,'career'));
assert(Math.abs(curveDrift(140,200,'career'))<Math.abs(curveDrift(140,200,'race')),'Career handling must follow its gentler geometry');
console.log('PASS: gradual 200→280 and 280→200 at 30/60/120 Hz, no strip speed impulse, distinct continuous mode geometry and matching handling');
