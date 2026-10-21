import assert from 'node:assert/strict';
import {raceMapLayout} from './coast-rush/dist/race-map.js';
import {createRace,resetRace,step} from './coast-rush/dist/physics.js';
const seed=()=>.5;
for(const level of ['easy','medium','hard'])for(const distance of [0,120,800,1500,2900,3000]){
 const s=createRace();resetRace(s,'race','normal',seed,undefined,level);s.distance=distance;s.x=4.9;s.traffic.forEach((t,i)=>{t.distance=Math.max(0,distance+[-600,-60,20,140,800][i]);t.x=[-4.9,0,4.9,-3.7,3.7][i];});
 const map=raceMapLayout(s);assert.equal(map.markers.length,6);assert.equal(map.road.length,73);assert(map.start>=0&&map.end<=3000);assert(map.range>=300);for(const p of [...map.road,...map.markers]){assert(Number.isFinite(p.x)&&Number.isFinite(p.y));assert(p.x>=0&&p.x<=160);assert(p.y>=0&&p.y<=86);}for(const p of map.markers){assert(p.distance>=map.start&&p.distance<=map.end);}const ordered=[...map.markers].sort((a,b)=>a.distance-b.distance);for(let i=1;i<ordered.length;i++)assert(ordered[i].y<=ordered[i-1].y);assert.equal(!!map.finish,map.end===3000);
}
const s=createRace();resetRace(s,'race','normal',seed);let before=raceMapLayout(s);assert.equal(before.markers[0].id,'player');assert.equal(before.range,300);s.mode='playing';for(let i=0;i<180;i++)step(s,{gas:true,steer:0},1/60);const after=raceMapLayout(s);assert.notDeepEqual(after.markers,before.markers,'Map follows live vehicle positions');assert(after.markers.every(p=>p.distance>=0));
const medium=raceMapLayout(s);s.trackProfile='race-hard';assert.notDeepEqual(raceMapLayout(s).road,medium.road,'Map follows selected difficulty geometry');s.mode='paused';before=raceMapLayout(s);step(s,{gas:true,steer:1},.05);assert.deepEqual(raceMapLayout(s),before,'Paused markers stay fixed');
s.distance=3400;s.traffic.forEach(t=>t.distance=3600);assert(raceMapLayout(s).markers.every(p=>p.distance===3000));s.traffic=[];assert.equal(raceMapLayout(s).markers.length,1);
console.log('PASS: all six cars, adaptive range, lane coordinates, road profiles, progress ordering, endpoints, live motion, pause stability and finish clamping');
