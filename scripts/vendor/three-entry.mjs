// three-entry.mjs: the only Three.js classes the site's scene uses.
//
// `npm run vendor` bundles this file with esbuild into
// public/vendor/three.scene.min.js. Exporting a short list instead of the whole
// library lets esbuild drop what the scene never touches, which keeps the file
// the phone downloads well under the full library's 184 KB compressed.
//
// Add a class here when scene code starts importing it, then run
// `npm run vendor` and commit the rebuilt file.
export {
  AdditiveBlending,
  Box3,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Clock,
  Color,
  CylinderGeometry,
  DoubleSide,
  Euler,
  Float32BufferAttribute,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Quaternion,
  Raycaster,
  Scene,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  Sphere,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
