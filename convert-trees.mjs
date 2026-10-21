import fs from 'node:fs/promises';
import * as THREE from './coast-rush/dist/vendor/three.module.js';
import {FBXLoader} from './asset-tools/FBXLoader.js';
import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)('./asset-tools/node_modules/sharp');
globalThis.window={URL:globalThis.URL};
THREE.TextureLoader.prototype.load=function(){return new THREE.Texture();};
const base='C:/Users/madan/Documents/ChatGPT/Simple Car Race/',folder=base+'asset-tools/',out=base+'coast-rush/dist/assets/';
const align=n=>Math.ceil(n/4)*4;
for(const [source,name,species,bark]of [['PalmTree_1','texturedPalm','PalmTree','Trunk'],['PineTree_3','texturedPine','PineTree','Bark'],['BirchTree_1','texturedBirch','BirchTree','Bark'],['BirchTree_2','texturedBirchTall','BirchTree','Bark'],['MapleTree_1','texturedMaple','MapleTree','Bark']]){
 const bytes=await fs.readFile(folder+source+'.fbx'),root=new FBXLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');if(species!=='MapleTree')root.rotation.x=-Math.PI/2;root.updateMatrixWorld(true);
 const chunks=[],json={asset:{version:'2.0',generator:'Coastline Rush mobile asset preparation; Quaternius CC0 source'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[],textures:[],images:[],samplers:[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497}],buffers:[],bufferViews:[],accessors:[]};let length=0;
 function view(data,target){const buffer=Buffer.from(data.buffer||data,data.byteOffset||0,data.byteLength||data.length),index=json.bufferViews.length;json.bufferViews.push({buffer:0,byteOffset:length,byteLength:buffer.length,...(target?{target}:{})});const padded=Buffer.alloc(align(buffer.length));buffer.copy(padded);chunks.push(padded);length+=padded.length;return index;}
 function accessor(array,type,componentType=5126,bounds=false){const item={bufferView:view(array,34962),componentType,count:array.length/({VEC2:2,VEC3:3,SCALAR:1}[type]),type};if(bounds){const n=3;item.min=[Infinity,Infinity,Infinity];item.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<array.length;i++){item.min[i%n]=Math.min(item.min[i%n],array[i]);item.max[i%n]=Math.max(item.max[i%n],array[i]);}}json.accessors.push(item);return json.accessors.length-1;}
 for(const [i,file]of [species+'_'+bark+'.jpg',species+'_Leaves.png'].entries()){
  const image=await sharp(folder+file).resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true}).toBuffer();json.images.push({bufferView:view(image),mimeType:i?'image/png':'image/jpeg'});json.textures.push({sampler:0,source:i});
  json.materials.push({name:i?'Textured foliage':'Textured bark',pbrMetallicRoughness:{baseColorTexture:{index:i},metallicFactor:0,roughnessFactor:.9},...(i?{alphaMode:'MASK',alphaCutoff:.45,doubleSided:true}:{})});
 }
 let triangles=0;root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld),pos=new Float32Array(g.attributes.position.array),normal=new Float32Array(g.attributes.normal.array),uv=new Float32Array(g.attributes.uv.array);for(let i=1;i<uv.length;i+=2)uv[i]=1-uv[i];const attrs={POSITION:accessor(pos,'VEC3',5126,true),NORMAL:accessor(normal,'VEC3'),TEXCOORD_0:accessor(uv,'VEC2')};
  const mats=Array.isArray(o.material)?o.material:[o.material],groups=g.groups.length?g.groups:[{start:0,count:g.index?g.index.count:g.attributes.position.count,materialIndex:0}],primitives=[];
  for(const group of groups){const material=mats[group.materialIndex]||mats[0],indices=new Uint32Array(group.count);for(let i=0;i<group.count;i++)indices[i]=g.index?g.index.array[group.start+i]:group.start+i;primitives.push({attributes:attrs,indices:accessor(indices,'SCALAR',5125),material:/leaf|leave/i.test(material.name)?1:0});triangles+=group.count/3;}
  json.scenes[0].nodes.push(json.nodes.length);json.nodes.push({mesh:json.meshes.length});json.meshes.push({name:o.name,primitives});g.dispose();
 });json.buffers=[{byteLength:length}];const text=Buffer.from(JSON.stringify(json)),jsonChunk=Buffer.alloc(align(text.length),32);text.copy(jsonChunk);const bin=Buffer.concat(chunks),header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(20+jsonChunk.length+8+bin.length,8);header.writeUInt32LE(jsonChunk.length,12);header.writeUInt32LE(0x4e4f534a,16);const binHeader=Buffer.alloc(8);binHeader.writeUInt32LE(bin.length,0);binHeader.writeUInt32LE(0x004e4942,4);const result=Buffer.concat([header,jsonChunk,binHeader,bin]);await fs.writeFile(out+name+'.glb',result);console.log(name,triangles,'triangles',result.length,'bytes');
}
