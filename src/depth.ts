// !bundle=off
import * as THREE from "https://cdn.skypack.dev/three";

// !bundle=module:{three}
import { OrbitControls } from "npm>:three/examples/jsm/controls/OrbitControls.js";

const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
camera.position.set(0, 0, 600);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const scene = new THREE.Scene();
// const axes = new THREE.AxesHelper(20);
// scene.add(axes);

// const geometry = new THREE.PlaneGeometry( 10000, 10000 );
// const geometry = new THREE.BoxGeometry(50, 100, 50);
// const material = new THREE.MeshPhongMaterial({color: 0xffffffff, wireframe: true});
// const mesh = new THREE.Mesh( geometry, material );
// scene.add( mesh );

const geometry = new THREE.PlaneGeometry(320, 320, 320, 320);
let plane;

new THREE.TextureLoader().load("/img/mindon.png", (t: THREE.Texture) => {
  const material = new THREE.MeshPhongMaterial({
    wireframe: false,
    transparent: true,
    side: THREE.DoubleSide,
    alphaMap: t,
    map: new THREE.TextureLoader().load("/img/mindon.png", () => {
      renderer.render(scene, camera);
    }),
    displacementMap: t,
    displacementScale: 180,
    normalMap: t,
  }); //  wireframe: true, transparent: true
  material.needsUpdate = true;
  // const m = new SceneUtils.createMultiMaterialObject(geometry, [a]);
  plane = new THREE.Mesh(geometry, material);
  scene.add(plane);
  renderer.render(scene, camera);
});

const light = new THREE.AmbientLight(0xffffffff);
scene.add(light);

// let wireframe = new THREE.WireframeGeometry( geometry );
// let line = new THREE.LineSegments( wireframe );
// line.material.color.setHex(0x000000);

// scene.add(line);

// camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  logarithmicDepthBuffer: true,
});
renderer.shadowMap.enabled = true;
renderer.setSize(640, 640);

document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("change", () => {
  renderer.render(scene, camera);
});
// renderer.setAnimationLoop( animation );

// function animation( time ) {
//   plane.rotation.x = time / 2000;
//   plane.rotation.y = time / 1000;

//   renderer.render( scene, camera );
// }
