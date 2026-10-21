import fs from 'node:fs';
import * as THREE from '../coast-rush/dist/vendor/three.module.js';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {simplify,prune} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';
import {CAR_MODELS} from '../coast-rush/dist/car-models.js';
await MeshoptSimplifier.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),doc=await io.read('coast-rush/dist/assets/cars/sprint.glb');
const sloppy={...MeshoptSimplifier,simplify:(indices,positions,stride,target)=>MeshoptSimplifier.simplifySloppy(indices,positions,stride,null,target,.02)};
await doc.transform(simplify({simplifier:sloppy,ratio:.17,error:.02}),prune());await io.write('coast-rush/dist/assets/cars/sprint-lod.glb',doc);
const all={};
for(const id of ['sprint','gt','apex','muscle']){
 const config=CAR_MODELS[id],b=fs.readFileSync('coast-rush/dist/'+config.file),size=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+size)),bin=b.subarray(28+size);
 function attribute(index){const a=j.accessors[index],v=j.bufferViews[a.bufferView],count={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],Type={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType],stride=v.byteStride||count*Type.BYTES_PER_ELEMENT,out=new Type(a.count*count),offset=(v.byteOffset||0)+(a.byteOffset||0);for(let i=0;i<a.count;i++)out.set(new Type(bin.buffer,bin.byteOffset+offset+i*stride,count),i*count);return new THREE.BufferAttribute(out,count);}
 const nodes=j.nodes.map(n=>{const g=new THREE.Group();if(n.matrix)g.applyMatrix4(new THREE.Matrix4().fromArray(n.matrix));else{if(n.translation)g.position.fromArray(n.translation);if(n.rotation)g.quaternion.fromArray(n.rotation);if(n.scale)g.scale.fromArray(n.scale);}if(n.mesh!==undefined)for(const p of j.meshes[n.mesh].primitives){const geo=new THREE.BufferGeometry();geo.setAttribute('position',attribute(p.attributes.POSITION));if(p.indices!==undefined)geo.setIndex(attribute(p.indices));const m=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});m.userData.paint=!!j.materials[p.material]?.extras?.coastPaint;g.add(new THREE.Mesh(geo,m));}return g;});
 j.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>nodes[i].add(nodes[c])));const root=new THREE.Group();j.scenes[j.scene||0].nodes.forEach(i=>root.add(nodes[i]));root.rotation.y=config.yaw;root.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(root,true),dimensions=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());root.position.sub(new THREE.Vector3(center.x,box.min.y,center.z));const body=new THREE.Group();body.add(root);body.scale.setScalar(1.45/dimensions.x);body.updateMatrixWorld(true);
 const length=dimensions.z*1.45/dimensions.x,ray=new THREE.Raycaster(),points=[],cache=new Map();
 function sample(x,z){const key=x+','+z;if(cache.has(key))return cache.get(key);ray.set(new THREE.Vector3(x,3,z),new THREE.Vector3(0,-1,0));const h=ray.intersectObject(body,true)[0],value=h?.object.material.userData.paint&&h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.25?h.point.y+.005:null;cache.set(key,value);return value;}
 const step=length/58;for(const x of [-.16,.16])for(let i=0;i<58;i++){const z=-length/2+i*step,a=sample(x-.045,z),c=sample(x+.045,z),d=sample(x-.045,z+step),e=sample(x+.045,z+step);if([a,c,d,e].some(y=>y===null)||Math.max(a,c,d,e)-Math.min(a,c,d,e)>.12)continue;points.push(x-.045,a,z,x+.045,c,z,x+.045,e,z+step,x-.045,a,z,x+.045,e,z+step,x-.045,d,z+step);}
 if(points.length<36)throw Error('Missing paint stripe geometry: '+id);all[id]=points.map(v=>Math.round(v*1e5)/1e5);console.log(id,'stripe triangles',points.length/9,'length',length);
}
fs.writeFileSync('coast-rush/dist/car-model-stripes.js','// Stripes sampled on each imported body; glass and trim are excluded.\nexport const MODEL_STRIPES='+JSON.stringify(all)+';\n');
