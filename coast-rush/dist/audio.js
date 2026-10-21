// Original, locally synthesized effects. No downloads or audio permissions.
export class GameAudio {
 constructor({muted=false,contextFactory}={}){this.muted=muted;this.factory=contextFactory;this.context=null;this.wantsRunning=false;this.voices=new Set();this.previous=null;this.events=0;this.available=true;}
 get status(){return !this.available?'unavailable':this.muted?'muted':this.context?.state||'locked';}
 init(){
  if(this.context||!this.available)return;
  try{
   const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
   this.context=this.factory?this.factory():new Audio({latencyHint:'interactive'});
   const c=this.context;this.master=c.createGain();this.master.gain.value=this.muted?0:.48;
   // Preserve the existing master response for UI cues. The driving bus adds
   // its own controlled gain without changing countdown/notification levels.
   const compressor=c.createDynamicsCompressor();compressor.threshold.value=-19;compressor.knee.value=22;compressor.ratio.value=5;compressor.attack.value=.004;compressor.release.value=.16;
   this.master.connect(compressor);compressor.connect(c.destination);
   this.driving=c.createGain();this.driving.gain.value=1.8;
   const drivingCompressor=c.createDynamicsCompressor();drivingCompressor.threshold.value=-12;drivingCompressor.knee.value=12;drivingCompressor.ratio.value=3;drivingCompressor.attack.value=.008;drivingCompressor.release.value=.18;
   this.driving.connect(drivingCompressor);drivingCompressor.connect(this.master);
   this.noise=c.createBuffer(1,c.sampleRate,c.sampleRate);const data=this.noise.getChannelData(0);let seed=23;for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=seed/2147483648-1;}
   this.engine=c.createGain();this.engine.gain.value=0;this.engine.connect(this.driving);
   this.motorFilter=c.createBiquadFilter();this.motorFilter.type='lowpass';this.motorFilter.frequency.value=420;this.motorFilter.Q.value=.45;
   this.bassEQ=c.createBiquadFilter();this.bassEQ.type='lowshelf';this.bassEQ.frequency.value=180;this.bassEQ.gain.value=4;this.motorFilter.connect(this.bassEQ);this.bassEQ.connect(this.engine);
   // Retain the bass rumble, with firing harmonics at 180–700 Hz that small
   // phone speakers can reproduce instead of spending all headroom on sub-bass.
   this.motors=[['sine',1,.5],['triangle',1.01,.22],['triangle',2,.22],['triangle',3,.2],['triangle',4,.16],['sine',6,.1],['sawtooth',3,.035]].map(([type,ratio,level])=>{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=48*ratio;g.gain.value=level;o.connect(g);g.connect(this.motorFilter);o.start();return {o,ratio};});
   this.wind=this.loopNoise('lowpass',1100);this.tires=this.loopNoise('bandpass',1700);this.tires.filter.Q.value=1.8;
  }catch{this.available=false;this.context?.close?.().catch(()=>{});this.context=null;}
 }
 loopNoise(type,frequency){const c=this.context,source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=this.noise;source.loop=true;filter.type=type;filter.frequency.value=frequency;gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(this.driving);source.start();return {source,filter,gain};}
 unlock(){
  this.wantsRunning=true;if(this.muted)return;this.init();const c=this.context;if(!c)return;
  if(c.state!=='running')c.resume?.().then(()=>{if(!this.wantsRunning||this.muted)c.suspend?.().catch(()=>{});}).catch(()=>{});
 }
 setMuted(value){this.muted=!!value;if(this.master)this.master.gain.setTargetAtTime(this.muted?0:.48,this.context.currentTime,.015);if(this.muted){this.cancelEffects();this.suspend();}else if(this.wantsRunning)this.unlock();}
 silenceLoops(){if(!this.context)return;const now=this.context.currentTime;for(const p of [this.engine.gain,this.wind.gain.gain,this.tires.gain.gain]){p.cancelScheduledValues(now);p.setValueAtTime(0,now);}}
 suspend(){const c=this.context;if(!c)return;this.silenceLoops();c.suspend?.().then(()=>{if(this.wantsRunning&&!this.muted)c.resume?.().catch(()=>{});}).catch(()=>{});}
 pause(){this.wantsRunning=false;this.cancelEffects();this.suspend();}
 reset(){this.cancelEffects();this.previous=null;}
 cancelEffects(){for(const v of [...this.voices]){v.source.onended=null;try{v.source.stop();}catch{}v.nodes.forEach(n=>n.disconnect());this.voices.delete(v);}}
 voice(source,nodes,delay,duration){
  if(this.voices.size>=12){nodes.forEach(n=>n.disconnect());return false;}
  const c=this.context,v={source,nodes};this.voices.add(v);source.onended=()=>{nodes.forEach(n=>n.disconnect());this.voices.delete(v);};source.start(c.currentTime+delay);source.stop(c.currentTime+delay+duration+.03);return true;
 }
 tone(from,to,duration=.16,volume=.12,delay=0,type='sine'){
  if(!this.context||this.muted||!this.wantsRunning)return;const c=this.context,t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+duration);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.effectOutput||this.master);this.voice(o,[o,g],delay,duration);
 }
 burst(from,to,duration=.2,volume=.2,type='lowpass'){
  if(!this.context||this.muted||!this.wantsRunning)return;const c=this.context,t=c.currentTime,source=c.createBufferSource(),filter=c.createBiquadFilter(),g=c.createGain();source.buffer=this.noise;filter.type=type;filter.frequency.setValueAtTime(from,t);filter.frequency.exponentialRampToValueAtTime(to,t+duration);filter.Q.value=.7;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);source.connect(filter);filter.connect(g);g.connect(this.effectOutput||this.master);this.voice(source,[source,filter,g],0,duration);
 }
 effect(kind,strength=1){
  if(!this.context||this.muted||!this.wantsRunning)return;this.events++;
  this.effectOutput=['boost','nitro','jump','land','prop','hit','crash'].includes(kind)?this.driving:this.master;
  switch(kind){
   case 'tick':this.tone(540,540,.12,.18);break;
   case 'go':this.tone(850,1000,.36,.2);break;
   case 'coin':this.tone(1100,1650,.13,.13);this.tone(1650,2000,.17,.09,.09);break;
   case 'charge':this.tone(720,1350,.22,.11,0,'triangle');break;
   case 'ready':this.tone(650,950,.12,.09);this.tone(950,1300,.18,.09,.12);break;
   case 'boost':this.burst(400,2600,.55,.17,'bandpass');this.tone(140,500,.42,.09,0,'triangle');break;
   case 'nitro':this.burst(300,4000,.8,.25,'bandpass');this.tone(90,700,.6,.12,0,'triangle');break;
   case 'jump':this.burst(600,2400,.22,.1,'bandpass');break;
   case 'land':this.burst(400,100,.14,.15);this.tone(90,40,.13,.1);break;
   case 'prop':this.burst(1000,150,.14,.19);this.tone(160,60,.12,.07,0,'triangle');break;
   case 'hit':this.burst(2200,140,.16+.2*strength,.13+.17*strength);this.tone(105,35,.19,.1*strength,0,'triangle');break;
   case 'crash':this.burst(3000,90,.65,.38);this.tone(130,32,.6,.18,0,'triangle');break;
   case 'finish':for(const [i,f] of [523,659,784,1046].entries())this.tone(f,f,.3,.14,i*.15,'triangle');break;
  }
  this.effectOutput=null;
 }
 update(s,input={}){
  const previous=this.previous;this.previous={mode:s.mode,countdown:s.countdown,coins:s.collected,impacts:s.impactCount,strips:s.stripHits,ramps:s.rampHits,obstacles:s.obstacleHits,bubbles:s.nitroBubbleHits||0,nitro:s.nitro,nitroTime:s.nitroTime,jump:s.jumpY};
  if(!this.context||this.muted||!this.wantsRunning)return;
  const c=this.context,t=c.currentTime,playing=s.mode==='playing',idle=s.mode==='countdown',moving=playing&&s.speed>1,air=(s.jumpY||0)>0,boost=s.boostTime>0||s.nitroTime>0;
  const speed=Math.max(0,s.speed||0),gear=Math.min(6,Math.floor(speed/45)),rpm=46+(speed%45)*.65+gear*4+(input.gas?5:0)+(boost?7:0);
  for(const {o,ratio} of this.motors)o.frequency.setTargetAtTime(rpm*ratio,t,.08);
  this.motorFilter.frequency.setTargetAtTime(620+speed*1.8+(input.gas?220:0),t,.12);
  this.engine.gain.setTargetAtTime(playing?(input.gas?.34:.2)*(air?.65:1):idle?.06:0,t,.05);
  this.wind.gain.gain.setTargetAtTime(moving?Math.min(.075,(speed/300)**2*.045+(boost?.03:0)+(s.slipstream||0)*.018):0,t,.12);
  const skid=moving&&!air&&(s.rail||input.brake&&speed>35||Math.abs(s.steering)>.8&&speed>135);
  this.tires.gain.gain.setTargetAtTime(skid?(s.rail?.1:.075):0,t,.045);
  const digit=idle?Math.ceil(s.countdown):0;
  if(digit>0&&(!previous||Math.ceil(previous.countdown)!==digit))this.effect('tick');
  if(playing&&previous?.countdown>0&&s.countdown===0)this.effect('go');
  if(!previous)return;
  if(s.collected>previous.coins)this.effect('coin');
  if(s.stripHits>previous.strips)this.effect('boost');
  if(s.nitroTime>0&&!(previous.nitroTime>0))this.effect('nitro');
  if(s.nitro>=99.999&&previous.nitro<99.999&&s.nitroTime<=0)this.effect('ready');
  if((s.nitroBubbleHits||0)>(previous.bubbles||0))this.effect('charge');
  if(s.rampHits>previous.ramps)this.effect('jump');
  if(previous.jump>0&&s.jumpY===0&&playing)this.effect('land');
  if(s.obstacleHits>previous.obstacles)this.effect('prop');
  if(s.impactCount>previous.impacts)this.effect('hit',Math.min(1,(s.lastImpactLoss||10)/70));
  if(s.mode==='over'&&previous.mode==='playing')this.effect(s.gameMode!=='career'?'finish':'crash');
 }
 dispose(){this.pause();this.motors?.forEach(({o})=>o.stop());this.wind?.source.stop();this.tires?.source.stop();this.context?.close?.().catch(()=>{});}
}
