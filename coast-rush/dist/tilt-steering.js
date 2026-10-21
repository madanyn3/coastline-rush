const clamp=v=>Math.max(-1,Math.min(1,v));
// Browser angles and Android gravity readings enter in units of full steering.
// Keep calibration fixed while driving: a held turn must never become neutral.
export class TiltSteering {
 constructor(){this.reset();}
 reset(){this.samples=[];this.baseline=null;this.lastRaw=null;this.unwrapped=0;this.lastTime=null;this.filtered=0;this.output=0;}
 sample(raw,time,period=0){
  if(!Number.isFinite(raw)||!Number.isFinite(time))return this.output;
  if(this.lastTime!==null&&(time<this.lastTime||time-this.lastTime>600))this.reset();
  let delta=this.lastRaw===null?0:raw-this.lastRaw;
  if(period)delta=((delta+period/2)%period+period)%period-period/2;
  this.unwrapped=this.lastRaw===null?raw:this.unwrapped+delta;this.lastRaw=raw;
  const dt=this.lastTime===null?0:Math.min(.1,(time-this.lastTime)/1000);this.lastTime=time;
  if(this.baseline===null){
   this.samples.push({value:this.unwrapped,time});
   while(this.samples.length>1&&time-this.samples[0].time>480)this.samples.shift();
   const values=this.samples.map(s=>s.value).sort((a,b)=>a-b),trim=Math.floor(values.length*.2),middle=values.slice(trim,values.length-trim);
   if(values.length>=4&&time-this.samples[0].time>=350&&middle.at(-1)-middle[0]<.12){this.baseline=middle.reduce((a,b)=>a+b,0)/middle.length;this.filtered=this.unwrapped-this.baseline;}
   return this.output=0;
  }
  const target=this.unwrapped-this.baseline;
  this.filtered+=(target-this.filtered)*(1-Math.exp(-dt/.075));
  const magnitude=Math.abs(this.filtered),deadzone=.065;
  this.output=magnitude<=deadzone?0:clamp(Math.sign(this.filtered)*(magnitude-deadzone)/(1-deadzone)*1.15);
  return this.output;
 }
 value(time){return this.lastTime===null||time-this.lastTime>250?0:this.output;}
}
export function orientationTilt(beta,gamma,angle=0){
 const rotation=((angle%360)+360)%360;
 const value=rotation===90||rotation===270?beta:gamma;
 return Number.isFinite(value)?value/22*(rotation===180||rotation===270?-1:1):null;
}
