import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Global variables
let scene, camera, renderer;
let bue1, bue2, floor;
let world, bue1Body, bue2Body, floorBody;
let modelsLoaded = false;
let physicsVisuals = []; // Add this for physics visualization

const bue1StartPos = { x: 3, y: 8, z: 0 };
const bue2StartPos = { x: -3, y: 8, z: 0 };

const physicsBoxDimensions = { 
    width: 2.4,
    height: 0.1,
    depth: 3.6
};

// Initialize everything
initThree();
initCannon();
animate();

function initThree() {
    // Scene
    scene = new THREE.Scene();
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 40, 0);
    camera.lookAt(0, 0, 0);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('three-canvas'),
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Enable shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

    createObjects();
    createFloor();
    
    // Lighting
    const light = new THREE.DirectionalLight(0xFFFFFF, 2);
    light.position.set(10, 20, 10);
    light.castShadow = true; // Enable shadow casting
    light.shadow.mapSize.width = 2048; // Higher resolution shadows
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 100;

    // Expand shadow camera bounds to cover the entire floor
    light.shadow.camera.left = -250;   // Half of your floor size (500/2)
    light.shadow.camera.right = 250;
    light.shadow.camera.top = 250;
    light.shadow.camera.bottom = -250;

    scene.add(light);
    
    // Event listeners
    document.addEventListener('click', onMouseClick);
    window.addEventListener('resize', onWindowResize);
}

function createObjects() {
    const loader = new GLTFLoader();
    
    loader.load(
        './bue/bue.glb',
        function (gltf) {
            const model = gltf.scene;

            // Enable shadows for all meshes in the model
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            // Create first object
            bue1 = model.clone();
            bue1.position.set(bue1StartPos.x, bue1StartPos.y, bue1StartPos.z);
            bue1.scale.set(0.1, 0.1, 0.1);
            // bue1.castShadow = true; // Enable shadow casting
            // bue1.receiveShadow = true; // Enable shadow receiving
            scene.add(bue1);
            
            // Create second object
            bue2 = model.clone();
            bue2.position.set(bue2StartPos.x, bue2StartPos.y, bue2StartPos.z);
            bue2.scale.set(0.1, 0.1, 0.1);
            // bue2.castShadow = true; // Enable shadow casting
            // bue2.receiveShadow = true; // Enable shadow receiving
            scene.add(bue2);

            modelsLoaded = true;
            animate();

        },
        function (progress) {
            console.log('Loading progress:', progress);
        },
        function (error) {
            console.error('Error loading model:', error);
        }
    );
}

function createFloor() {
    const floorSize = 500; // Adjust this to make the floor bigger/smaller
    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
    const textureLoader = new THREE.TextureLoader();
    const floorTexture = textureLoader.load('./bue/stone_embedded_tiles_diff_4k.jpg')

    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);

    const floorMaterial = new THREE.MeshPhongMaterial({
        map: floorTexture,
    });

    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -20;
    floor.receiveShadow = true;
    scene.add(floor);
}

function initCannon() {
    // Create physics world
    world = new CANNON.World({
        gravity: new CANNON.Vec3(0, 0, 0)
    });
    
    // Create physics bodies (easily swappable)
    createPhysicsBodies();
    
    // Create physics floor
    const floorShape = new CANNON.Plane();
    floorBody = new CANNON.Body({
        mass: 0, // Static
        shape: floorShape,
        material: new CANNON.Material({ 
            friction: 0.8,
            restitution: 0.6
        })
    });
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    floorBody.position.set(0, -20, 0);  // Match visual floor position
    world.addBody(floorBody);
    
    // Create contact material
    const cubeFloorContact = new CANNON.ContactMaterial(
        bue1Body.material,
        floorBody.material,
        { friction: 0.3, restitution: 0.7 }
    );
    world.addContactMaterial(cubeFloorContact);
}

function createPhysicsBodies() {
    const boxShape = new CANNON.Box(new CANNON.Vec3(
        physicsBoxDimensions.width, 
        physicsBoxDimensions.height, 
        physicsBoxDimensions.depth
    ));
    
    bue1Body = new CANNON.Body({
        mass: 1,
        shape: boxShape,
        material: new CANNON.Material({ 
            friction: 0.3,
            restitution: 0.8
        })
    });

    bue1Body.position.set(bue1StartPos.x, bue1StartPos.y, bue1StartPos.z);
    bue1Body.angularDamping = 0.2;
    world.addBody(bue1Body);
    
    // Create visual representation of physics body
    const physicsBox1 = new THREE.BoxGeometry(
        physicsBoxDimensions.width * 2, 
        physicsBoxDimensions.height * 2, 
        physicsBoxDimensions.depth * 2
    );
    const physicsMaterial1 = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const physicsVisual1 = new THREE.Mesh(physicsBox1, physicsMaterial1);
    physicsVisuals.push(physicsVisual1);
    scene.add(physicsVisual1);
    
    bue2Body = new CANNON.Body({
        mass: 1,
        shape: boxShape,
        material: new CANNON.Material({ 
            friction: 0.3,
            restitution: 0.8
        })
    });
    
    bue2Body.position.set(bue2StartPos.x, bue2StartPos.y, bue2StartPos.z);
    bue2Body.angularDamping = 0.2;
    world.addBody(bue2Body);
    
    // Create visual representation of physics body
    const physicsBox2 = new THREE.BoxGeometry(
        physicsBoxDimensions.width * 2, 
        physicsBoxDimensions.height * 2, 
        physicsBoxDimensions.depth * 2
    );
    const physicsMaterial2 = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00, 
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const physicsVisual2 = new THREE.Mesh(physicsBox2, physicsMaterial2);
    physicsVisuals.push(physicsVisual2);
    scene.add(physicsVisual2);
}

function animate() {
    if (!modelsLoaded) return;
    
    // Step physics simulation
    world.step(1/60);
    
    // Sync physics to visual objects
    bue1.position.copy(bue1Body.position);
    bue1.quaternion.copy(bue1Body.quaternion);
    
    bue2.position.copy(bue2Body.position);
    bue2.quaternion.copy(bue2Body.quaternion);
    
    // Sync physics visuals
    physicsVisuals[0].position.copy(bue1Body.position);
    physicsVisuals[0].quaternion.copy(bue1Body.quaternion);
    
    physicsVisuals[1].position.copy(bue2Body.position);
    physicsVisuals[1].quaternion.copy(bue2Body.quaternion);
    
    // Render
    renderer.render(scene, camera);
    
    // Continue animation loop
    requestAnimationFrame(animate);
}

function onMouseClick() {
    world.gravity.set(0, -9.82, 0);
    // Apply random angular impulses to make cubes spin
    const randomX = (Math.random() - 0.5) * 3;
    const randomY = (Math.random() - 0.5) * 3;
    const randomZ = (Math.random() - 0.5) * 3;
    bue1Body.angularVelocity.set(randomX, randomY, randomZ);
    const randomX2 = (Math.random() - 0.5) * 3;
    const randomY2 = (Math.random() - 0.5) * 3;
    const randomZ2 = (Math.random() - 0.5) * 3;
    bue2Body.angularVelocity.set(randomX2, randomY2, randomZ2);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}