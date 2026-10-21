import assert from 'node:assert/strict';
import {sceneryForward} from './coast-rush/dist/scenery.js';
// The old 12 m reset was visible even for a tree just ahead of the camera.
assert(Math.abs(sceneryForward(4,12.01)-sceneryForward(4,11.99)+.02)<1e-9);
let recycled=0;
for(let row=0;row<26;row++){
 const anchor=-20+row*12;
 for(let d=0;d<1500;d+=.75){const a=sceneryForward(anchor,d),b=sceneryForward(anchor,d+.75),delta=b-a;assert(b>=-32&&b<280);if(delta>0){recycled++;assert(a< -31.2,'Recycling must happen behind the camera');assert(b>279,'A recycled tree must return inside the far fog');}else assert(Math.abs(delta+.75)<1e-8,'Visible trees must advance continuously');}
}
assert(recycled>100);
for(const d of [1e4,1e6,1e8]){const f=sceneryForward(40,d);assert(f>=-32&&f<280,'Endless driving must retain the same safe recycle range');}
console.log('PASS: continuous visible tree movement, no 12 m snaps, recycling behind the camera into far fog, endless-distance stability');
