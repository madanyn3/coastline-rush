import assert from 'node:assert/strict';
import {smoothSteering,createRace,resetRace} from './coast-rush/dist/physics.js';
const first=smoothSteering(0,1,1/60);assert(first.value>0&&first.value<.15);assert(first.average<first.value,'A tap must build up rather than immediately using full lock');
let value=1;for(let i=0;i<18;i++)value=smoothSteering(value,0,1/60).value;assert(value>0&&value<.05,'Release must settle promptly without snapping');
const reversed=smoothSteering(1,-1,1/60);assert(reversed.value>0,'Reversing must not instantly jump across centre');value=1;for(let i=0;i<24;i++)value=smoothSteering(value,-1,1/60).value;assert(value<-.85,'Reversal must still be responsive');
const results=[];for(const fps of [30,60,120]){let value=0,travel=0;for(let i=0;i<fps;i++){const r=smoothSteering(value,1,1/fps);value=r.value;travel+=r.average/fps;}for(let i=0;i<fps/2;i++){const r=smoothSteering(value,0,1/fps);value=r.value;travel+=r.average/fps;}results.push({value,travel});}assert(Math.max(...results.map(r=>r.travel))-Math.min(...results.map(r=>r.travel))<1e-10,'Steering travel must agree across frame rates');
value=.3;let jitter=0;for(let i=0;i<120;i++){value=smoothSteering(value,.3+(i%2?.04:-.04),1/60).value;jitter=Math.max(jitter,Math.abs(value-.3));}assert(jitter<.012,'Small analog/tilt fluctuations should be damped');
const state=createRace();state.steering=.9;resetRace(state);assert.equal(state.steering,0,'Starting again must clear the previous steering');
console.log('PASS: gradual turn-in, smooth release, responsive reversal, identical steering travel at 30/60/120 Hz, analog jitter damping, restart reset');
