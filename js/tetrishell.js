'use strict';

Physijs.scripts.worker = 'js/physijs_worker.js'
Physijs.scripts.ammo = 'ammo.js'

var WIDTH = 600, HEIGHT = 600;
var VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.1, FAR = 10000;

var CUBE_SIZE = 9, CUBE_MASS = 0.5;
var MOVE_FORCE = 20;
var $container = $('#container');
var renderer, camera, scene, input_manager;
var current_block;

var ground, left_wall, right_wall, rear_blockguard, front_blockguard;

function init() {
  renderer = new THREE.WebGLRenderer();
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene = new Physijs.Scene();

  camera.position.set( 300, 100, 0 );
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  renderer.setSize(WIDTH, HEIGHT);
  renderer.setClearColorHex(0x111111, 1.0);
  scene.add(camera);
  $container.append(renderer.domElement);
  document.addEventListener( 'keydown', on_key_event, false );
  document.addEventListener( 'keyup', on_key_event, false );
}

function load_level() {
  ground = create_cube(10, 1, 100, 0, 0x333333);
  left_wall = create_cube(10, 200, 1, 0, 0x333333);
  right_wall = create_cube(10, 200, 1, 0, 0x333333);

  // invisible walls that keep pieces from falling out
  front_blockguard = create_cube(1, 200, 100, 0);
  front_blockguard.visible = false;
  rear_blockguard = create_cube(1, 200, 100, 0);
  rear_blockguard.visible = false;

  ground.position.set(0, -100, 0);
  left_wall.position.set(0, 0, 50);
  right_wall.position.set(0, 0, -50);
  front_blockguard.position.set(7, 0, 0);
  rear_blockguard.position.set(-7, 0, 0);
  
  scene.add(ground);
  scene.add(left_wall);
  scene.add(right_wall);
  scene.add(front_blockguard);
  scene.add(rear_blockguard);

  // Add light to the scene
  var pointlight = new THREE.PointLight( 0x999999, 2 );
  pointlight.position.set( 100, 50, 0 );
  scene.add(pointlight);
}

function tick() {
  if(typeof(current_block) === 'undefined' || current_block == null) {
    current_block = get_block();
    current_block.position.set(0, 100, current_block.userData.offset_amount * CUBE_SIZE);
    scene.add(current_block);
  }
  if(input_manager.left == true) {
    current_block.applyCentralForce( new THREE.Vector3(0, 0, MOVE_FORCE) );
  } else if(input_manager.right == true) {
    current_block.applyCentralForce( new THREE.Vector3(0, 0, -MOVE_FORCE) );
  }
}

function render() {
  requestAnimationFrame(render);
  scene.simulate();
  tick();
  renderer.render(scene, camera);
}

input_manager = {
  left: false,
  right: false,
}

function on_key_event(event) {
  var direction = (event.type == 'keydown') ? true : false
  switch(event.keyCode) {
    case 37:
      input_manager.left = direction;
      break;
    case 39:
      input_manager.right = direction;
      break;
  }
}

function create_cube(width, height, length, mass, color) {
  if(typeof(color) === 'undefined') color = 0x00CC00;
  var cube_geom  = new THREE.CubeGeometry(width, height, length);
  var cube_mat  = new THREE.MeshLambertMaterial({ color: color });
  var cube = new Physijs.BoxMesh(cube_geom, cube_mat, mass);
  return cube;
}

function create_long() {
  var piece = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, CUBE_MASS);
  piece.userData.offset_amount = 1.5;
  for(var i = 1; i < 4; i++) {
    var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, CUBE_MASS);
    block.position.add(new THREE.Vector3(0, 0, -i * CUBE_SIZE));
    piece.add(block);
  }
  return piece;
}

function get_block() {
  var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, CUBE_MASS);
  var block = create_long();
  block.disabled = false;
  block.handle_collision = function(collided_with, linear_velocity, angular_velocity) {
    if(collided_with == left_wall) {
      return;
    } else if(collided_with == right_wall) {
      return;
    } else if(collided_with == rear_blockguard) {
      return;
    } else if(collided_with == front_blockguard) {
      return;
    } else if(this.disabled == false) {
      this.disabled = true;
      current_block = null;
    }
  };
  block.addEventListener('collision', block.handle_collision );
  return block;
}

init();
load_level();
render();
