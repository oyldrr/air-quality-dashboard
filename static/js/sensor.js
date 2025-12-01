
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.5,
    500
);

camera.position.set(1.25, -.75, 3.5);

let object;

const loader = new GLTFLoader();
loader.load(
    './static/models/sensor/result.gltf',
    function (gltf) {
        object = gltf.scene;

        
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center); 
        const size = box.getSize(new THREE.Vector3()).length();
        const scaleFactor = 1.5 / size; 
        object.scale.setScalar(scaleFactor);

        scene.add(object);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error(error);
    }
);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("sensor-3d-container").appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, .5);
scene.add(ambientLight);


function animate() {
    requestAnimationFrame(animate);

    if (object) {
        object.rotation.y += 0.001; 
        object.rotation.x = -5; 
    }

    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();