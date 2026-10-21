import assert from 'node:assert/strict';
import {TiltSteering,orientationTilt} from './coast-rush/dist/tilt-steering.js';
import {curveDrift,createRace,resetRace,step} from './coast-rush/dist/physics.js';
import {TRACKS} from './coast-rush/dist/track.js';
function calibrate(offset=0,hz=60){const t=new TiltSteering();t.sample(offset+1,0);for(let i=1;i<=hz;i++)t.sample(offset+(i%2?.015:-.015),i*1000/hz);assert(t.baseline!==null);assert(Math.abs(t.baseline-offset)<.015);return t;}
calibrate(.5,10); // Slower browser sensors must still finish calibrating.
for(const hz of [30,60,120]){
 const t=calibrate(.5,hz);for(let i=1;i<=hz*5;i++)assert.equal(t.sample(.5+(i%2?.025:-.025),1000+i*1000/hz),0,'Steady hands must not drift');
 const first=t.sample(1.1,6000+1000/hz);assert(first<.25,'Filter abrupt sensor spikes');let out;for(let i=2;i<=hz;i++)out=t.sample(1.1,6000+i*1000/hz);assert(out>.6&&out<.7,'Keep deliberate tilt sensitive');
 const baseline=t.baseline;for(let i=1;i<=hz*8;i++)t.sample(1.1,7000+i*1000/hz);assert.equal(t.baseline,baseline,'Held turns must not auto-center');
 for(let i=1;i<=hz;i++)out=t.sample(.5,15000+i*1000/hz);assert.equal(out,0,'Neutral must settle without a bias');assert.equal(t.value(17000),0,'Stale sensor input must release');
 t.reset();assert.equal(t.value(18000),0);assert.equal(t.baseline,null);
}
const wrap=new TiltSteering(),period=360/22;for(let i=0;i<60;i++)wrap.sample((i%2?179.9:-179.9)/22,i*1000/60,period);assert(wrap.baseline!==null);assert.equal(wrap.output,0,'Angle wrap must not become full steering');
for(const angle of [0,90,180,270,-90]){const t=calibrate(orientationTilt(13,9,angle));assert.equal(t.output,0);}assert.equal(orientationTilt(null,3,90),null);assert.equal(orientationTilt(10,3,90),10/22);assert.equal(orientationTilt(10,3,270),-10/22);assert.equal(orientationTilt(10,3,180),-3/22);
for(const angle of [0,90,180,270,-90])assert.equal(orientationTilt(null,null,angle),null,'Missing sensor data must remain invalid after rotation');
const invalid=calibrate();const saved=invalid.output;assert.equal(invalid.sample(NaN,2000),saved);invalid.sample(0,2100);assert.equal(invalid.baseline,null,'Sensor gaps trigger fresh calibration');
// Straight road and neutral controls cannot generate a persistent sideways force.
TRACKS['test-straight']={a:0,b:0,p:100,q:200,h:0,h2:0,hp:100,hp2:200};
for(const mode of ['race','career']){const s=createRace();resetRace(s,mode,'normal',()=>.5);s.trackProfile='test-straight';s.traffic=[];s.obstacles=[];s.ramps=[];s.boostStrips=[];s.speed=180;for(let i=0;i<300;i++){s.traffic=[];step(s,{gas:true,steer:0},1/60,()=>.5);}assert.equal(s.x,0);assert.equal(s.steering,0);}
assert(curveDrift(140,180)>0);assert(curveDrift(550,180)<0);assert.equal(curveDrift(140,0),0);delete TRACKS['test-straight'];
console.log('PASS: multi-sample calibration, first-sample outlier rejection, neutral dead zone at 30/60/120 Hz, filtered sensitive turns, fixed center during turns, stale input, recenter, angle wrap and landscape flips, no straight-road drift, balanced curve forces');
