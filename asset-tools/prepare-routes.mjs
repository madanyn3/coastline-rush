import {NodeIO} from '@gltf-transform/core';
import {simplify,getBounds,weld} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';
import fs from 'node:fs/promises';
const base='coast-rush/dist/assets/routes';
const io=new NodeIO();
await MeshoptSimplifier.ready;
const report={};
for(const id of ['rock_face_01','boulder_01','modular_urban_apartments_facade']){
 const doc=await io.read(`${base}/${id}/${id}_2k.gltf`);
 if(id==='boulder_01')await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.2,error:.01}));
 let tris=0;for(const m of doc.getRoot().listMeshes())for(const p of m.listPrimitives())tris+=(p.getIndices()?.getCount()||p.getAttribute('POSITION').getCount())/3;
 const bounds=getBounds(doc.getRoot().listScenes()[0]);
 report[id]={triangles:tris,bounds,materials:doc.getRoot().listMaterials().map(m=>({name:m.getName(),base:!!m.getBaseColorTexture(),normal:!!m.getNormalTexture(),metalrough:!!m.getMetallicRoughnessTexture()}))};
 if(id==='modular_urban_apartments_facade')report[id].modules=doc.getRoot().listNodes().filter(n=>n.getMesh()).map(n=>({name:n.getName(),translation:n.getTranslation(),bounds:getBounds(n)}));
 await io.write(`${base}/${id}.glb`,doc);
 console.log(id,Math.round(tris),bounds);
}
await fs.writeFile(`${base}/asset-report.json`,JSON.stringify(report,null,2));
