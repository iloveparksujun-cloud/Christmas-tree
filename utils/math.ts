import * as THREE from 'three';

// Random point inside a sphere
export const randomInSphere = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// Point on a cone surface (Golden Ratio Spiral distribution)
export const pointOnCone = (height: number, bottomRadius: number, percent: number, total: number, index: number, fuzziness: number = 0): THREE.Vector3 => {
  // y goes from -height/2 to height/2
  const y = (index / total) * height - (height / 2);
  const radiusAtY = ((height / 2 - y) / height) * bottomRadius;
  
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const theta = index * goldenAngle;

  const r = radiusAtY + (Math.random() - 0.5) * fuzziness;
  
  const x = r * Math.cos(theta);
  const z = r * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
};

// Specific distribution for the "Red Infection" (Internal Core)
export const randomInConeCore = (height: number, bottomRadius: number): THREE.Vector3 => {
  const y = (Math.random()) * height - (height / 2);
  const radiusAtY = ((height / 2 - y) / height) * (bottomRadius * 0.4); // Only 40% width
  
  const theta = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * radiusAtY;
  
  return new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
};