export const QUALITY={low:{pixel:.85,shadows:false,range:155,fps:30,lod:true,lights:0},balanced:{pixel:1.15,shadows:false,range:240,fps:60,lod:false,lights:2},high:{pixel:1.6,shadows:true,range:340,fps:60,lod:false,lights:4}};
export const SETTINGS_KEY='coast-driver-settings-v1';
export let currentQuality=QUALITY.high;
export function setRuntimeQuality(value){currentQuality=value;}
export function normalizeSettings(raw={}){return {quality:['auto',...Object.keys(QUALITY)].includes(raw.quality)?raw.quality:'auto',sensitivity:Math.max(.65,Math.min(1.5,Number(raw.sensitivity)||1)),assist:raw.assist!==false,reducedMotion:!!raw.reducedMotion};}
export function qualityFor(settings,device={}){const q=settings.quality==='auto'?((device.deviceMemory&&device.deviceMemory<=4)||(device.hardwareConcurrency&&device.hardwareConcurrency<=4)?'low':device.mobile?'balanced':'high'):settings.quality;return {...QUALITY[q],name:q};}
export class AutoQuality {constructor(){this.elapsed=0;this.frames=0;this.downgraded=false;}sample(ms,settings){if(settings.quality!=='auto'||ms>200||ms<2)return false;this.elapsed+=ms;this.frames++;if(this.elapsed<5000)return false;const slow=this.elapsed/this.frames>31;this.elapsed=0;this.frames=0;if(slow&&!this.downgraded){this.downgraded=true;return true;}return false;}}
