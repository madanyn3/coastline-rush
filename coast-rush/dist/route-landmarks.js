import * as THREE from './vendor/three.module.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {bend,rise,heading} from './track.js';
import {routeTextures} from './route-environments.js';
export function createRouteLandmarks(scene,renderer){
 const concrete=new THREE.MeshStandardMaterial({color:'#7a8589',roughness:.9}),metal=new THREE.MeshStandardMaterial({color:'#607b83',metalness:.5,roughness:.5}),light=new THREE.MeshBasicMaterial({color:'#c3f6ff'}),segments=[];
 function merged(parts,material){const geometries=parts.map(([w,h,d,x,y,z])=>new THREE.BoxGeometry(w,h,d).translate(x,y,z));const g=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());return new THREE.Mesh(g,material);}
 for(let i=0;i<23;i++){const g=new THREE.Group();g.add(merged([[17,1,10.2,0,7,0],[1.4,7,10.2,-8,3.5,0],[1.4,7,10.2,8,3.5,0]],concrete),merged([[.2,.16,9,-7.1,4.7,0],[.2,.16,9,7.1,4.7,0],[2,.08,3,0,6.45,0]],light));g.visible=false;scene.add(g);segments.push(g);}
 const harbour=new THREE.Group();harbour.add(merged([[.28,8,.28,-8,4,0],[.28,8,.28,8,4,0],[16.3,.35,.35,0,8,0]],metal),merged([[7,.12,.12,0,7.7,0]],light));harbour.visible=false;scene.add(harbour);
 return {async prepare(id){if(id==='mountain'){Object.assign(concrete,await routeTextures('rock_face_03',renderer));concrete.needsUpdate=true;}},update(s){const cycle=Math.floor(s.distance/3000);for(let i=0;i<segments.length;i++){const at=cycle*3000+1500+i*10,f=at-s.distance,g=segments[i];g.visible=s.routeId==='mountain'&&f>-30&&f<300;if(g.visible){g.position.set(bend(f,s.distance,s.trackProfile),rise(f,s.distance,s.trackProfile),-f);g.rotation.y=-heading(f,s.distance,s.trackProfile);}}const f=cycle*3000+1120-s.distance;harbour.visible=s.routeId==='coast'&&f>-25&&f<300;if(harbour.visible){harbour.position.set(bend(f,s.distance,s.trackProfile),rise(f,s.distance,s.trackProfile),-f);harbour.rotation.y=-heading(f,s.distance,s.trackProfile);}}};
}
