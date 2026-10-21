import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {flatten,join,weld,simplify,prune,getBounds,transformMesh,compactPrimitive,dequantize} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'node:fs/promises';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);await MeshoptSimplifier.ready;
const entries=[
 {id:'sprint',file:'bmw-m4/source',paint:/^Meshesbody151Mtl$|^Mesheslivery1Mtl$|^Mesheszx1Mtl$/,yaw:0},
 {id:'gt',file:'replacement-gt/decoded',paint:/^Material\.001$/,yaw:1.331},
 {id:'apex',file:'concept',paint:/^Paint [12]/,yaw:0},
 {id:'muscle',file:'challenger/source',paint:/Paint_Material1|^Color_2$/,yaw:0}
];
await fs.mkdir('coast-rush/dist/assets/cars',{recursive:true});const report={};
for(const entry of entries){
 const doc=await io.read('asset-tools/new-cars/'+entry.file+'.glb');
 await doc.transform(dequantize());
 if(entry.id==='gt'){for(const m of doc.getRoot().listMeshes())for(const p of m.listPrimitives())if(p.getMaterial()?.getName()==='Material.035')m.removePrimitive(p);await doc.transform(prune());}
 for(const a of doc.getRoot().listAnimations())a.dispose();
 for(const mat of doc.getRoot().listMaterials()){
  if(entry.paint.test(mat.getName())){
   mat.setExtras({...mat.getExtras(),coastPaint:/Shadow|Paint 2/.test(mat.getName())?.3:1});mat.setBaseColorFactor([1,1,1,1]);
   const original=mat.getBaseColorTexture();if(original){const tex=doc.createTexture('Neutral paint detail').setMimeType('image/png').setImage(await sharp(original.getImage()).grayscale().modulate({brightness:1.4}).png().toBuffer());mat.setBaseColorTexture(tex);}
  }
  if(/logo|badge|emblem|^License$/i.test(mat.getName())){mat.setBaseColorTexture(null).setBaseColorFactor([.008,.012,.016,1]);}
 }
 // Isolate factory wings so the existing Clean / Wing style controls stay meaningful.
 for(const n of doc.getRoot().listNodes()){if(!/spoiler|rear[_ .-]?wing/i.test(n.getName())||!n.getMesh())continue;const mesh=n.getMesh().clone();n.setMesh(mesh);for(const p of mesh.listPrimitives()){const m=p.getMaterial();if(m)p.setMaterial(m.clone().setExtras({...m.getExtras(),coastSpoiler:true}));}}
 await doc.transform(flatten());
 // Bake each object's world transform before merging static material groups.
 // This avoids retaining a representative wheel/door transform on merged bodies.
 for(const n of doc.getRoot().listNodes()){
  if(!n.getMesh())continue;const matrix=n.getWorldMatrix(),mesh=n.getMesh().clone();
  for(const original of mesh.listPrimitives()){const p=original.clone();mesh.removePrimitive(original).addPrimitive(p);for(const key of p.listSemantics())p.setAttribute(key,p.getAttribute(key).clone());if(p.getIndices())p.setIndices(p.getIndices().clone());compactPrimitive(p);}
  n.setMesh(mesh);transformMesh(mesh,matrix);n.setTranslation([0,0,0]).setRotation([0,0,0,1]).setScale([1,1,1]);
 }
 await doc.transform(join({keepNamed:false}),weld(),prune());
 const stats=()=>({triangles:doc.getRoot().listMeshes().reduce((s,m)=>s+m.listPrimitives().reduce((t,p)=>t+(p.getIndices()?.getCount()||p.getAttribute('POSITION').getCount())/3,0),0),draws:doc.getRoot().listMeshes().reduce((s,m)=>s+m.listPrimitives().length,0)});
 report[entry.id]={...stats(),yaw:entry.yaw,bounds:getBounds(doc.getRoot().listScenes()[0]),paint:doc.getRoot().listMaterials().filter(m=>m.getExtras().coastPaint).map(m=>m.getName())};
 await io.write('coast-rush/dist/assets/cars/'+entry.id+'.glb',doc);
 // Distant opponents use the same silhouette and materials with fewer hidden surface triangles.
 await doc.transform(simplify({simplifier:MeshoptSimplifier,ratio:.17,error:.005}),prune());
 report[entry.id].lod=stats();await io.write('coast-rush/dist/assets/cars/'+entry.id+'-lod.glb',doc);console.log(entry.id,report[entry.id]);
}
await fs.writeFile('coast-rush/dist/assets/cars/model-report.json',JSON.stringify(report,null,2));
