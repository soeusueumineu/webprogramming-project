

import * as THREE from "./environment/node_modules/three/build/three.module.js";
import { GLTFLoader } from "./environment/node_modules/three/examples/jsm/loaders/GLTFLoader.js";

//외부에서도 사용해야 하기에 export
export let renderer = null;
export let animateId = null;

const loader = new GLTFLoader();

let scene, fire_model, particles, camera, type;
let particleData = [];

//정의한 클래스들

class LightInform {
  constructor(directionalLight, directPos, pointLight, pointPos) {
    this.directionalLight = directionalLight;
    this.directPos = directPos;
    this.pointLight = pointLight;
    this.pointPos = pointPos;
  }
}

class FogInform {
  constructor(fogColor, near, far) {
    this.fogColor = fogColor;
    this.near = near;
    this.far = far;
  }
}

class CameraInform {
  constructor(fov, position, rotation, rotationType) {
    this.fov = fov;
    this.position = position;
    this.rotation = rotation;
    this.rotationType = rotationType;
  }
}

let lightInform, fogInform, cameraInform;

//카메라 좌우 조절을 위한 변수
let camera_rotation = 0;
let first_camera_rotation = 0;

//씬 생성
function createScene() {
  scene = new THREE.Scene();
}

//카메라 생성
function createCamera() {
  if (camera) {
    scene.remove(camera);
  }
  camera = new THREE.PerspectiveCamera(
    cameraInform.fov,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(
    cameraInform.position.x,
    cameraInform.position.y,
    cameraInform.position.z
  );
  camera.rotation.set(
    cameraInform.rotation.x,
    cameraInform.rotation.y,
    cameraInform.rotation.z
  );
  scene.add(camera);
}

//렌더러 생성
function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  threeContainer.appendChild(renderer.domElement);
}

//조명 추가 (lightInform을 조절하여 조명 설정)
function addLights() {
  const light = lightInform.directionalLight;
  light.position.set(
    lightInform.directPos.x,
    lightInform.directPos.y,
    lightInform.directPos.z
  );
  scene.add(light);

  const point = lightInform.pointLight;
  point.position.set(
    lightInform.pointPos.x,
    lightInform.pointPos.y,
    lightInform.pointPos.z
  );
  scene.add(point);
}

//불(fire.glb) 모델 로드
function loadFireModel() {
  loader.load("./environment/models/fire.glb", (gltf) => {
    fire_model = gltf.scene;
    fire_model.position.set(0, 12, -17);
    fire_model.scale.set(0.8, 0.8, 0.8);

    scene.add(fire_model);
    console.log("glb 모델 로드 성공!");
  });
}

//모델 로드(glbPath에 따라 변경)
function loadModel(glbPath) {
  loader.load(glbPath, (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);

    scene.add(model);

    camera.rotation.set(
      cameraInform.rotation.x,
      cameraInform.rotation.y,
      cameraInform.rotation.z
    );

    const overlay = document.getElementById("loading-overlay");
    overlay.style.opacity = 0;

    console.log("glb 모델 로드 성공!");
  });
}

//불(fire animation) 애니메이션
function fireAnimation() {
  if (fire_model) {
    fire_model.scale.y = Math.sin(Date.now() * 0.002) * 0.05 + 0.8; // y축으로 스케일 조정
  }
}

//모닥불 파티클 애니메이션
function fireParticleAnimation() {
  if (particles) {
    const positions = particles.geometry.attributes.position.array;
    const sizes = particles.geometry.attributes.size.array;

    for (let i = 0; i < particleData.length; i++) {
      const yIndex = i * 3 + 1;
      const t = 1; // 수명에 따라 t 값 조정
      // y 위치를 위로 올림
      positions[yIndex] += particleData[i].velocityY;

      sizes[i] = Math.random() * 5 + Math.sin(1); // 크기 진동

      // 수명 감소
      particleData[i].life -= 1;

      // 수명이 다하면 재생성 (랜덤 위치, 속도, 수명)
      if (particleData[i].life <= 0) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        sizes[i] = 5;

        particleData[i].velocityY = Math.random() * 0.1 + 0.02;
        particleData[i].life = Math.random() * 100 + 500;
      }
    }

    particles.geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

//모닥불 파티클 생성
function createFireParticles() {
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  // 입자 데이터 초기화
  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 50;
    const y = (Math.random() - 0.5) * 50;
    const z = (Math.random() - 0.5) * 50;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    sizes[i] = 5;

    // 각 입자의 속도와 생명 시간 설정
    particleData.push({
      velocityY: Math.random() * 0.1 + 0.02, // 위로 올라가는 속도
      life: Math.random() * 100 + 500, // 수명 (프레임 수 기준)
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: `
      attribute float size;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      void main() {
        gl_FragColor = vec4(1.0); // 흰색
      }
    `,
    transparent: true,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

//비 파티클 애니메이션
function rainParticleAnimation() {
  if (particles) {
    const positions = particles.geometry.attributes.position.array;
    const sizes = particles.geometry.attributes.size.array;

    for (let i = 0; i < particleData.length; i++) {
      const yIndex = i * 3 + 1;
      const t = 1; // 수명에 따라 t 값 조정
      // y 위치를 위로 올림
      positions[yIndex] += particleData[i].velocityY;

      sizes[i] = Math.random() * 5 + Math.sin(1); // 크기 진동

      // 수명 감소
      particleData[i].life -= 1;

      // 수명이 다하면 재생성 (랜덤 위치, 속도, 수명)
      if (particleData[i].life <= 0) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        sizes[i] = 5;

        particleData[i].velocityY = Math.random() * 0.1 + 0.02;
        particleData[i].life = Math.random() * 100 + 500;
      }
    }

    particles.geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

//비 파티클 생성
function createRainParticles() {
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  // 입자 데이터 초기화
  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 50;
    const y = (Math.random() - 0.5) * 50;
    const z = (Math.random() - 0.5) * 50;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    sizes[i] = 5;

    // 각 입자의 속도와 생명 시간 설정
    particleData.push({
      velocityY: Math.random() * 0.1 + 0.02, // 위로 올라가는 속도
      life: Math.random() * 100 + 500, // 수명 (프레임 수 기준)
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: `
      attribute float size;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      void main() {
        gl_FragColor = vec4(1.0); // 흰색
      }
    `,
    transparent: true,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

//안개 추가 (fogInform을 조절하여 안개 설정)
function addFog() {
  scene.fog = new THREE.Fog(fogInform.fogColor, fogInform.near, fogInform.far);
}

//카메라 좌우 조절을 위해 이징을 사용한 애니메이션 함수
function animateValue(start, end, duration, onUpdate) {
  // 이징 함수 (easeInOutQuad) - 애니메이션 함수에 사용하기 위해 정의
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = (currentTime - startTime) / duration; // 경과 시간 비율 (0 ~ 1)
    const t = Math.min(elapsed, 1); // 1을 초과하지 않도록 제한
    const easedT = easeInOutQuad(t); // 이징 적용
    const currentValue = start + (end - start) * easedT; // 보간 계산

    onUpdate(currentValue); // 값 업데이트 콜백

    if (t < 1) {
      requestAnimationFrame(step); // 다음 프레임 호출
    }
  }

  requestAnimationFrame(step);
}

//카메라 좌우 조절 애니메이션
function cameraMovement() {
  document.addEventListener("mousemove", (event) => {
    const mouseX = -(event.clientX / window.innerHeight) * 2 + 1; // -1 ~ 1
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1; // -1 ~ 1
    switch (cameraInform.rotationType) {
      case "y":
        animateValue(
          camera_rotation,
          mouseX * 0.05 + first_camera_rotation,
          1000,
          (value) => {
            camera_rotation = value;
            camera.rotation.y = camera_rotation;
          }
        );
        break;
      case "x":
        animateValue(
          camera_rotation,
          mouseY * 0.05 + first_camera_rotation,
          1000,
          (value) => {
            camera_rotation = value;
            camera.rotation.x = camera_rotation;
          }
        );
        break;
      case "Y":
        animateValue(
          camera_rotation,
          mouseX * 0.5 + first_camera_rotation,
          1000,
          (value) => {
            camera_rotation = value;
            camera.rotation.y = camera_rotation;
          }
        );
        break;
      default:
        console.error("Invalid rotation type");
    }
  });
}

//애니메이션 종합 루프
function animate() {
  animateId = requestAnimationFrame(animate);

  switch (type) {
    case "fire":
      //fireAnimation();
      fireParticleAnimation();
      console.log("모닥불 감성");
      break;
    case "rainy":
      console.log("비 오는 날");
      break;
    case "night":
      console.log("밤 감성");
      break;
    case "dreamy":
      console.log("몽환적인 분위기");
      break;
    default:
  }

  cameraMovement();

  renderer.render(scene, camera);
}

//반응형 처리를 renderer에 적용
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

//3D 환경 초기화
export function init(glbPath, cardText) {
  //화면 페이드아웃 (검은 화면)
  document.body.style.overflow = "hidden";
  threeContainer.style.display = "block";
  exit3D.style.display = "block";

  //카메라 좌우 조절시 초기 값
  camera_rotation = 0;
  first_camera_rotation = 0;

  //씬 생성을 먼저 해야만 아래 과정 수행 가능하므로 제일 상단에 위치치
  createScene();

  switch (cardText) {
    case "🔥 모닥불 감성":
      //해당 init함수는 한번만 호출되므로 cardText에 따라 애니메이션을 조절하기에 문제가 있음
      //따라서 type을 따로 설정
      type = "fire";
      lightInform = new LightInform(
        new THREE.DirectionalLight(0x9cecff, 0.3),
        new THREE.Vector3(3, 100, 40),
        new THREE.PointLight(0xffbe91, 130, 30, 1.5),
        new THREE.Vector3(0, 14, -17)
      );
      fogInform = new FogInform(0x0f1b1b, -30, 150);
      cameraInform = new CameraInform(
        33,
        new THREE.Vector3(0.3, 19, 11),
        new THREE.Vector3(-0.15, camera_rotation, 0),
        "y"
      );

      createFireParticles();

      break;

    case "🌧️ 비 오는 날":
      type = "rainy";
      lightInform = new LightInform(
        new THREE.DirectionalLight(0xbab08d, 3),
        new THREE.Vector3(3, 0, 40),
        new THREE.PointLight(0xffbe91, 5, 30, 1.5),
        new THREE.Vector3(4, 9, -5)
      );
      fogInform = new FogInform(0x0f1b1b, -30, 150);
      cameraInform = new CameraInform(
        25,
        new THREE.Vector3(6, 7, 7),
        new THREE.Vector3(0, 0.8, camera_rotation),
        "x"
      );

      break;

    case "🌙 밤 감성":
      break;

    case "🌌 몽환적인 분위기":
      type = "dreamy";
      lightInform = new LightInform(
        new THREE.DirectionalLight(0x524761, 5),
        new THREE.Vector3(3, 0, 40),
        new THREE.PointLight(0x524761, 1300, 30, 1.5),
        new THREE.Vector3(0, 0, 0)
      );
      fogInform = new FogInform(0x524761, 1, 1000);
      first_camera_rotation = 1;
      cameraInform = new CameraInform(
        25,
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.5, camera_rotation, -0.5),
        "Y"
      );

      break;

    default:
      type = "default";
  }

  createCamera();
  createRenderer();
  animate();
  addFog();
  addLights();
  loadModel(glbPath);
  window.addEventListener("resize", onWindowResize);
