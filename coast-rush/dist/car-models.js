export const CAR_MODELS={
 classic:{file:'assets/touringCar.glb',yaw:0},
 sprint:{file:'assets/cars/sprint.glb',lod:'assets/cars/sprint-lod.glb',yaw:0},
 gt:{file:'assets/cars/gt.glb',lod:'assets/cars/gt-lod.glb',yaw:1.331},
 apex:{file:'assets/cars/apex.glb',lod:'assets/cars/apex-lod.glb',yaw:0},
 muscle:{file:'assets/cars/muscle.glb',lod:'assets/cars/muscle-lod.glb',yaw:0}
};
export const carModel=id=>CAR_MODELS[id]||CAR_MODELS.classic;
