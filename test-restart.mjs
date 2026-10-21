import assert from 'node:assert/strict';
import {captureRunSetup,stampRunSetup} from './coast-rush/dist/run-setup.js';
import {loadProfile,beginRun,recordRun,carStats,earn} from './coast-rush/dist/progression.js';
import {appearanceFor} from './coast-rush/dist/customization.js';
import {createRace,resetRace,beginCountdown} from './coast-rush/dist/physics.js';
for(const mode of ['race','career']) {
 const p=loadProfile({getItem:()=>null});p.route='mountain';
 p.upgrades.classic={acceleration:2,handling:1,brakes:3,nitro:1};
 const setup=captureRunSetup(p,mode,'heavy',carStats(p),'hard',appearanceFor(p));
 beginRun(p,mode);stampRunSetup(p.active,setup);const oldId=p.active.id;
 const state=createRace();resetRace(state,mode,setup.density,()=>.5,setup.spec,setup.level,setup.route);
 Object.assign(state,{distance:456,time:31,speed:210,nitro:80,boostTime:2,nitroTime:1,jumpY:3,collected:mode==='career'?12:0});
 if(mode==='career'){earn(p,12);p.active.coins+=12;}
 // Menu selections and later upgrades cannot mutate the in-progress setup.
 p.route='city';p.upgrades.classic.acceleration=3;p.customization.classic.paint='red';
 assert.equal(setup.spec.upgradeLevels.acceleration,2);assert.equal(setup.appearance.paint,'stock');
 assert(recordRun(p,state,'retired'));assert(!recordRun(p,state,'retired'));
 beginRun(p,setup.mode);stampRunSetup(p.active,setup);
 resetRace(state,setup.mode,setup.density,()=>.5,setup.spec,setup.level,setup.route);beginCountdown(state);
 assert.notEqual(p.active.id,oldId);assert.equal(p.active.route,'mountain');assert.equal(p.active.appearance.paint,'stock');
 assert.equal(p.active.upgrades.acceleration,2);assert.equal(p.active.difficulty,mode==='race'?'hard':'heavy');
 for(const field of ['distance','time','speed','nitro','nitroTime','boostTime','jumpY','collected'])assert.equal(state[field],0,field+' resets');
 assert.equal(state.gameMode,mode);assert.equal(state.routeId,'mountain');assert.equal(state.acceleration,setup.spec.acceleration);
 assert.equal(state.mode,mode==='race'?'countdown':'playing');assert.equal(state.traffic.length,mode==='race'?5:8);
 assert.equal(p.history.length,1);assert.equal(p.history[0].coins,mode==='career'?12:0);
 assert.equal(p.wallet,mode==='career'?12:0,'Restart never pays race rewards or duplicates collected coins');
 assert.equal(p.route,'city','Restart preserves pending menu selection');
}
console.log('PASS: race/career restart resets, countdown, preserved setup, retired history, saved coins and no duplicated rewards');
