import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('three-canvas'),
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);


const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
const cubeMaterial = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
const cube1 = new THREE.Mesh(geometry, cubeMaterial);
cube1.position.y = 5;
cube1.position.x = -2; // Position to the left
scene.add(cube1);

const cube2 = new THREE.Mesh(geometry, cubeMaterial);
cube2.position.y = 5;
cube2.position.x = 2; // Position to the right
scene.add(cube2);

// Add floor
const floorGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight); // 10x10 units wide
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 }); // Gray color
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
floor.position.y = -2; // Position below the cube
scene.add(floor);

// Add physics variables
let cube1Velocity = 0;
let cube2Velocity = 0;
let cube1RotationX = 0;
let cube1RotationY = 0;
let cube1RotationZ = 0;
let cube2RotationX = 0;
let cube2RotationY = 0;
let cube2RotationZ = 0;
const gravity = 0.01;
const floorY = -2;
let cube1Falling = false;
let cube2Falling = false;
const bounceFactor = 0.7; // How much energy is retained after bounce
const friction = 0.98; // Air resistance

camera.position.set(0, 10, 0); // X=0, Y=10, Z=0
camera.lookAt(0, 0, 0);

// Add mouse click event
document.addEventListener('click', () => {
    cube1Falling = true;
    cube2Falling = true;
});

function animate() {
    // Only apply gravity if falling
    // Handle cube1 physics
    if (cube1Falling) {
        cube1Velocity += gravity;
        cube1.position.y -= cube1Velocity;
        
        if (cube1.position.y <= floorY + 0.5) {
            cube1.position.y = floorY + 0.5;
            cube1Velocity = 0;
            cube1Falling = false;
        }
    }
    
    // Handle cube2 physics
    if (cube2Falling) {
        cube2Velocity += gravity;
        cube2.position.y -= cube2Velocity;
        
        if (cube2.position.y <= floorY + 0.5) {
            cube2.position.y = floorY + 0.5;
            cube2Velocity = 0;
            cube2Falling = false;
        }
    }

    
    renderer.render( scene, camera );
  }
  renderer.setAnimationLoop( animate );


const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);