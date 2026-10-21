// Reuse small render pools along the whole route, including the final kilometre.
export const nearbyFeatures=(features,distance,behind=25,ahead=300)=>(features||[]).filter(f=>f.distance-distance>-behind&&f.distance-distance<ahead);
