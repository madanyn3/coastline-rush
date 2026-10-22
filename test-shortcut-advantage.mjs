import assert from 'node:assert/strict';
import {TRACKS} from './coast-rush/dist/track.js';
import {shortcutsFor,shortcutOffset,shortcutProgressFactor} from './coast-rush/dist/shortcuts.js';
import {createRace,resetRace,step,steeringRate} from './coast-rush/dist/physics.js';

const random=()=>.5,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function traverse(profile,path,{cut,speed=200,dt=1/120,scrape=false,boost=false}={}){
 const s=createRace();resetRace(s,'race','normal',random);
 Object.assign(s,{routeId:profile.startsWith('mountain')?'mountain':profile.startsWith('city')?'city':'coast',trackProfile:profile,raceLength:10000,distance:path.entry-240,x:0,speed,normalMax:speed,traffic:[],ramps:[],obstacles:[],boostStrips:[],nitroBubbles:[],boostTime:boost?30:0});
 const end=path.exit+55;let traversed=false,scrapeSeconds=0,maxStep=0;
 while(s.distance<end){assert.equal(s.mode,'playing');
  const active=!!s.shortcutActive;
  const offset=shortcutOffset(path,s.distance);
  // Drive into the actual entrance, follow the cut, then merge and recenter.
  const target=cut&&s.distance<path.exit+16?(s.distance<path.entry?path.side*4.1:clamp(offset,-4.55,4.55)):0;
  const aim=active?offset:target;
  let steer=clamp(((aim-s.x)*(active?4:2)-(active?0:s.curveForce||0))/steeringRate(s.speed),-1,1);
  if(scrape&&active&&s.distance>path.entry+35&&scrapeSeconds<.15){if(scrapeSeconds===0){s.x=offset+path.side*1.34;s.steering=path.side*.5;}steer=path.side;scrapeSeconds+=dt;}
  const before=s.distance;step(s,{gas:true,steer},dt,random);
  traversed ||=!!s.shortcutActive;
  maxStep=Math.max(maxStep,s.distance-before);
  if(s.distance>=end)return {time:s.time-dt*(s.distance-end)/(s.distance-before),s,traversed,maxStep};
  assert(s.time<35,'Traversal must finish');
 }
}
let minimum=Infinity,maximum=0,count=0;
for(const profile of Object.keys(TRACKS).filter(k=>!k.includes('career'))){
 for(const length of [3000,10000])for(const path of shortcutsFor(profile,length)){
  assert.equal(shortcutProgressFactor(path,path.entry),1);
  assert.equal(shortcutProgressFactor(path,path.exit+16),1);
  for(const speed of [100,200,280])for(const dt of [1/120,1/30]){
   const main=traverse(profile,path,{speed,dt}),cut=traverse(profile,path,{cut:true,speed,dt});
   assert(cut.traversed,profile+' '+speed+' '+dt+' at '+path.entry+' must enter through the gate');
   assert.equal(cut.s.shortcutsCompleted,1);
   assert.equal(cut.s.railHits,0,profile+' clean entry/exit must not scrape');
   assert.equal(main.s.railHits,0,'Main-road comparison must stay on road');
   assert.equal(cut.s.obstacleHits,0,profile+' '+speed+' '+dt+' clean line stays clear');
   const saving=main.time-cut.time;
   assert(saving>.4,`${profile} ${speed} km/h: useful advantage required, got ${saving}`);
   minimum=Math.min(minimum,saving);maximum=Math.max(maximum,saving);count++;
  }
  const main=traverse(profile,path),brush=traverse(profile,path,{cut:true,scrape:true});
  assert(brush.s.railHits>0,'Brush test must actually contact a rail');
  assert(brush.time<main.time-.3,'Brief correction should preserve the reward');
  // Equal strip boost on both routes must not erase the shortcut advantage.
  const fastMain=traverse(profile,path,{boost:true}),fastCut=traverse(profile,path,{cut:true,boost:true});
  assert(fastMain.time-fastCut.time>.35,'Shortcut still helps with boost');
 }
}
assert.deepEqual(shortcutsFor('career'),[]);
console.log(`PASS: ${count} timed gate-to-merge runs across all routes, tiers, 3/10 km courses and 30/120 Hz: ${minimum.toFixed(2)}–${maximum.toFixed(2)} s saved; steering, bumps, boosts and corrections included.`);







