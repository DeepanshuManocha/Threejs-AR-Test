import "./style.css";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

var light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-1, 2, 4);
scene.add(light);

window.addEventListener("resize", function () {
  let aspectRatio = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();
});

//enable XR
renderer.xr.enabled = true;

//create AR BUtton
document.body.appendChild(ARButton.createButton(renderer));

//Xr Controls
let controller = renderer.xr.getController(0);
controller.addEventListener("select", onSelect);
scene.add(controller);

let reticle;
reticle = new THREE.Mesh(
  new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial()
);
reticle.matrixAutoUpdate = false;
reticle.visible = false;
scene.add(reticle);

let hitTestSource = null;
let hitTestSourceRequested = false;

const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 32).translate(
  0,
  0.1,
  0
);

function onSelect() {
  alert("before if condition");
  if (reticle.visible) {
    alert("inside if condition");
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff * Math.random(),
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.setFromMatrixPosition(reticle.matrix);
    mesh.scale.y = Math.random() * 2 + 1;
    scene.add(mesh);
    alert(mesh);
  }
}

function Animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  if (frame) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    if (hitTestSourceRequested === false) {
      session.requestReferenceSpace("viewer").then(function (referenceSpace) {
        session
          .requestHitTestSource({ space: referenceSpace })
          .then(function (source) {
            hitTestSource = source;
          });
      });

      session.addEventListener("end", function () {
        hitTestSourceRequested = false;
        hitTestSource = null;
      });
      hitTestSourceRequested = true;
    }

    if (hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length) {
        const hit = hitTestResults[0];
        reticle.visible = true;
        reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
      } else {
        reticle.visible = false;
      }
    }
  }

  renderer.render(scene, camera);
}

Animate();
