import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Global variables
let scene, camera, renderer;
let cube1, cube2, floor;
let world, cube1Body, cube2Body, floorBody;

// Initialize everything
initThree();
initCannon();
animate();

function initThree() {
    // Scene
    scene = new THREE.Scene();
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('three-canvas'),
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Create cubes
    const boxWidth = 1, boxHeight = 1, boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    
    cube1 = new THREE.Mesh(geometry, cubeMaterial);
    cube1.position.set(-2, 5, 0);
    scene.add(cube1);
    
    cube2 = new THREE.Mesh(geometry, cubeMaterial);
    cube2.position.set(2, 5, 0);
    scene.add(cube2);
    
    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    scene.add(floor);
    
    // Lighting
    const light = new THREE.DirectionalLight(0xFFFFFF, 3);
    light.position.set(-1, 2, 4);
    scene.add(light);
    
    // Event listeners
    document.addEventListener('click', onMouseClick);
    window.addEventListener('resize', onWindowResize);
}

function initCannon() {
    // Debug: check what we imported
    console.log('CANNON:', CANNON);
    console.log('CANNON.World:', CANNON.World);
    
    // Create physics world
    world = new CANNON.World({
        gravity: new CANNON.Vec3(0, 0, 0)
    });
    
    console.log('World created:', world);
    console.log('World methods:', Object.getOwnPropertyNames(world));
    
    // Create physics bodies for cubes
    const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    
    cube1Body = new CANNON.Body({
        mass: 1,
        shape: boxShape,
        material: new CANNON.Material({ 
            friction: 0.3,
            restitution: 0.8
        })
    });
    cube1Body.position.set(-2, 5, 0);
    cube1Body.angularDamping = 0.2;
    world.addBody(cube1Body);
    
    cube2Body = new CANNON.Body({
        mass: 1,
        shape: boxShape,
        material: new CANNON.Material({ 
            friction: 0.3,
            restitution: 0.8
        })
    });
    cube2Body.position.set(2, 5, 0);
    cube2Body.angularDamping = 0.2;
    world.addBody(cube2Body);
    


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
    floorBody.position.set(0, -2, 0);
    world.addBody(floorBody);
    
    // Create contact material
    const cubeFloorContact = new CANNON.ContactMaterial(
        cube1Body.material,
        floorBody.material,
        { friction: 0.3, restitution: 0.7 }
    );
    world.addContactMaterial(cubeFloorContact);
    
    
}

function animate() {
    // Step physics simulation
    world.step(1/60);
    
    // Sync physics to visual objects
    cube1.position.copy(cube1Body.position);
    cube1.quaternion.copy(cube1Body.quaternion);
    
    cube2.position.copy(cube2Body.position);
    cube2.quaternion.copy(cube2Body.quaternion);
    
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
    cube1Body.angularVelocity.set(randomX, randomY, randomZ);
    const randomX2 = (Math.random() - 0.5) * 3;
    const randomY2 = (Math.random() - 0.5) * 3;
    const randomZ2 = (Math.random() - 0.5) * 3;
    cube2Body.angularVelocity.set(randomX2, randomY2, randomZ2);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}