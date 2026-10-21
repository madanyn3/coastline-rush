import assert from 'node:assert/strict';
import {createRace,resetRace,step,curveDrift,steeringRate,ROAD_LIMIT} from './coast-rush/dist/physics.js';
const random=()=>.5, fresh=()=>{const s=createRace();resetRace(s,'race','normal',random);s.boostStrips=[];s.ramps=[];s.obstacles=[];return s;};
// Hands-off driving must run wide in either direction, including under throttle.
for(const distance of [140,550]){
 const s=fresh();s.distance=distance;s.speed=180;s.traffic=[];let touched=false,maxLateral=0;
 const direction=Math.sign(curveDrift(distance,180));
 for(let i=0;i<270;i++){s.traffic=[];step(s,{gas:true},1/60,random);touched ||= s.rail;maxLateral=Math.max(maxLateral,Math.abs(s.x));}
 assert(maxLateral>1.5,'Not steering must still run wide on a bend');assert.equal(Math.sign(s.x),direction);assert(Math.abs(s.x)<=ROAD_LIMIT);if(touched)assert(s.speed<180,'Wall riding must cost speed');
 const controlled=fresh();controlled.distance=distance;controlled.speed=180;controlled.traffic=[];
 for(let i=0;i<270;i++){controlled.traffic=[];const nextSpeed=controlled.speed-7/60;const steer=-curveDrift(controlled.distance,nextSpeed)/steeringRate(nextSpeed)-controlled.x*.5;assert(Math.abs(steer)<1,'Steering must be capable of holding the lane');step(controlled,{steer},1/60,random);}
 assert(Math.abs(controlled.x)<.15,'Steering into a curve must hold the lane');assert(!controlled.rail);
}
assert(Math.abs(curveDrift(140,200)/curveDrift(140,100)-4)<1e-9,'Slowing down must reduce curve drift');
// Compare the bots to the player on a clean launch, keeping the player in a gap.
const s=fresh();s.x=1.85;
for(let i=0;i<120;i++){const nextSpeed=Math.min(200,s.speed+52/60),steer=steeringRate(nextSpeed)?-curveDrift(s.distance,nextSpeed)/steeringRate(nextSpeed)-(s.x-1.85)*.5:0;step(s,{gas:true,steer},1/60,random);}
assert(s.traffic.every(t=>Math.abs(t.speed-s.speed)<=6),'Bot launch acceleration should match the player');
for(let i=0;i<1080;i++){const nextSpeed=Math.min(200,s.speed+52/60),steer=-curveDrift(s.distance,nextSpeed)/steeringRate(nextSpeed)-(s.x-1.85)*.5;step(s,{gas:true,steer},1/60,random);}
assert(s.traffic.every(t=>t.speed>=190&&t.speed<=280),'Racers must respect normal/nitro speed limits');assert(s.traffic.some(t=>t.nitroUses>0),'Bots must use earned nitro during a race');assert(s.traffic.every(t=>Math.abs(t.distance-s.distance)<180),'The field must remain competitive');
console.log('PASS: hands-off drift in left/right bends, effective countersteering, slower-speed control, rail speed cost, comparable bot launches and race pace');

