import {curvature} from './track.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Deterministic decisions preserve championship retries and trial reproducibility.
export function planBot(car,state,dt){
 car.planTime=(car.planTime||0)-dt;if(car.planTime>0)return;
 car.planTime=.28+(car.id%3)*.075;
 const rivals=[state,...state.traffic].filter(r=>r!==car&&r.finishTime==null),look=12+car.speed*.2;
 const ahead=rivals.filter(r=>r.distance>car.distance&&r.distance-car.distance<look&&Math.abs(r.x-car.x)<1.7).sort((a,b)=>a.distance-b.distance)[0];
 const lanes=[-3.5,0,3.5],scores=lanes.map(x=>{
  const unsafe=rivals.some(r=>Math.abs(r.distance-car.distance)<10&&Math.abs(r.x-x)<1.65);if(unsafe&&Math.abs(car.x-x)>.5)return -1000;
  let score=-Math.abs(x-car.x)*.3;
  for(const r of rivals){const gap=r.distance-car.distance;if(gap>0&&gap<look&&Math.abs(r.x-x)<1.7)score-=25*(1-gap/look);if(gap<0&&gap>-12&&Math.abs(r.x-x)<1.7)score-=14;}
  for(const o of state.obstacles||[])if(o.distance>car.distance&&o.distance-car.distance<look&&Math.abs(o.x-x)<1.5)score-=18;
  for(const p of state.boostStrips||[])if(p.distance>car.distance+12&&p.distance-car.distance<100&&!p.usedBy.includes(car.id)&&Math.abs(p.x-x)<1.4)score+=5;
  const curve=curvature(car.distance+40,state.trackProfile);score+=clamp(-Math.sign(curve)*x*.2,-1,1);
  return score;
 });
 const best=scores.indexOf(Math.max(...scores)),current=lanes.reduce((a,x,i)=>Math.abs(x-car.x)<Math.abs(lanes[a]-car.x)?i:a,0);
 if(scores[best]>scores[current]+1.2&&state.time>(car.laneLock||0)){car.targetX=lanes[best];car.laneLock=state.time+1.1;car.overtakes=(car.overtakes||0)+(ahead?1:0);}
 // Defend early, with room to react; never cut across a car alongside.
 const challenger=rivals.find(r=>car.distance-r.distance>13&&car.distance-r.distance<27&&r.speed>car.speed+6);
 if(!ahead&&challenger&&state.time>(car.laneLock||0)){const lane=lanes.reduce((best,x)=>Math.abs(x-challenger.x)<Math.abs(best-challenger.x)?x:best,0);if(!rivals.some(r=>Math.abs(r.distance-car.distance)<12&&Math.abs(r.x-lane)<1.7)){car.targetX=lane;car.laneLock=state.time+1.8;car.defences=(car.defences||0)+1;}}
 // Ease off before blind bends; personalities change the margin, not engine power.
 const bend=Math.max(...[20,45,75].map(d=>Math.abs(curvature(car.distance+d,state.trackProfile))));
 car.cornerTarget=clamp(car.targetSpeed-bend*(state.routeId==='mountain'?11500:6500)*(1+(car.id%3)*.04),105,car.targetSpeed);
 car.blockedBy=ahead?.id??null;
}
