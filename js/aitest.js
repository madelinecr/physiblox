'use strict';

Physijs.scripts.worker = '/js/physijs_worker.js'
Physijs.scripts.ammo = '/js/ammo.js'

var WIDTH = 600, HEIGHT = 600;
var VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.1, FAR = 10000;
var $container = $('#container');
var renderer, camera, scene;
var cube;

function init() {
  renderer = new THREE.WebGLRenderer();
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene = new Physijs.Scene();

  camera.position.set( 200, 0, 0 );
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  renderer.setSize(WIDTH, HEIGHT);
  renderer.setClearColorHex(0x111111, 1.0);
  scene.add(camera);
  $container.append(renderer.domElement);
  document.addEventListener( 'keydown', on_key_down, false );
}

function load_level() {
  cube = create_cube(8, 8, 8, 1);
  cube.position.set(0, 50, 0);
  scene.add(cube);

  var ground = create_cube(10, 1, 80, 0);
  ground.position.set(0, -50, 0);
  scene.add(ground);

  // Add light to the scene
  var pointlight = new THREE.PointLight( 0x999999, 2 );
  pointlight.position.set( 50, 50, 500 );
  scene.add(pointlight);
}


function render() {
  requestAnimationFrame(render);

  scene.simulate();
  //controls.update();
  renderer.render(scene, camera);
}

function on_key_down(event) {
  switch(event.keyCode) {
    case 37:
      cube.applyCentralForce( new THREE.Vector3(0, 0, 80) );
      break;
    case 39:
      cube.applyCentralForce( new THREE.Vector3(0, 0, -80) );
      break;
  }
}

function create_cube(width, height, length, mass) {
  var cube_geom  = new THREE.CubeGeometry(width, height, length);
  var cube_mat  = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
  var cube = new Physijs.BoxMesh(cube_geom, cube_mat, mass);
  return cube;
}

init();
load_level();
render();
