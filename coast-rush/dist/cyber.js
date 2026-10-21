import * as THREE from './vendor/three.module.js';
import {bend,rise,heading} from './track.js';
import {sceneryForward} from './scenery.js';
export function createCyber(scene){
 const signs=[];
 const textures=['RUSH ↗','N₂O','/// 2049','APEX'].map((word,i)=>{const c=document.createElement('canvas');c.width=512;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle='#0a1228';ctx.fillRect(0,0,512,192);ctx.strokeStyle=i%2?'#ff7bce':'#54f4f3';ctx.lineWidth=8;ctx.strokeRect(8,8,496,176);ctx.fillStyle=ctx.strokeStyle;ctx.font='bold 76px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=14;ctx.fillText(word,256,100);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;});
 for(let i=0;i<8;i++){const g=new THREE.Group(),screen=new THREE.Mesh(new THREE.PlaneGeometry(5,1.9),new THREE.MeshBasicMaterial({map:textures[i%4],side:THREE.DoubleSide,toneMapped:false}));screen.position.y=4.8;g.add(screen);const post=new THREE.Mesh(new THREE.BoxGeometry(.14,4,.14),new THREE.MeshStandardMaterial({color:'#253b52',roughness:.7}));post.position.y=2;g.add(post);g.userData={anchor:38+i*46,x:i%3===0?-12:13+i%2*3};scene.add(g);signs.push(g);}
 return {update(s){const enabled=s.gameMode!=='career'&&(!s.routeId||s.routeId==='coast'),track=s.trackProfile||s.gameMode;for(const g of signs){g.visible=enabled;if(!enabled)continue;const f=sceneryForward(g.userData.anchor,s.distance,368,40);g.position.set(g.userData.x+bend(f,s.distance,track),rise(f,s.distance,track),-f);g.rotation.y=-heading(f,s.distance,track)+(g.userData.x<0?.18:-.18);}}};
}
