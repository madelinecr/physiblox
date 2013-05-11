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
  ground = create_wall(10, 1, 100, 0);
  left_wall = create_wall(10, 200, 1, 0);
  right_wall = create_wall(10, 200, 1, 0);

  // invisible walls that keep pieces from falling out
  front_blockguard = create_wall(1, 200, 100);
  front_blockguard.visible = false;
  rear_blockguard = create_wall(1, 200, 100);
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
    current_block.position.set(0, 100, 0);
    scene.add(current_block);
  }
  if(input_manager.left == true) {
    current_block.applyCentralForce( new THREE.Vector3(0, 0, MOVE_FORCE) );
  } if(input_manager.right == true) {
    current_block.applyCentralForce( new THREE.Vector3(0, 0, -MOVE_FORCE) );
  } if(input_manager.rot_left == true) {
    console.log("rotate left");
    var force_vector = new THREE.Vector3(0, 0, 0.2);
    var offset_vector = new THREE.Vector3(0, 20, 0);
    current_block.applyImpulse(force_vector, offset_vector);
  } if(input_manager.rot_right == true) {
    var force_vector = new THREE.Vector3(0, 0, -0.2);
    var offset_vector = new THREE.Vector3(0, 20, 0);
    current_block.applyImpulse(force_vector, offset_vector);
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
  rot_left: false,
  rot_right: false
}

function on_key_event(event) {
  var direction = (event.type == 'keydown') ? true : false
  var rot_direction = (event.type == 'keydown') ? true : false
  console.log(event.keyCode);
  switch(event.keyCode) {
    case 37:
      input_manager.left = direction;
      break;
    case 39:
      input_manager.right = direction;
      break;
    case 88:
      input_manager.rot_right = rot_direction;
      break;
    case 90:
      input_manager.rot_left = rot_direction;
      break;
  }
}

function create_wall(width, height, length) {
  var wall_geom  = new THREE.CubeGeometry(width, height, length);
  var wall_mat  = new THREE.MeshLambertMaterial({ color: 0x333333 });
  var wall = new Physijs.BoxMesh(wall_geom, wall_mat, 0);
  return wall;
}


function create_cube(width, height, length, color) {
  if(typeof(color) === 'undefined') color = 0x00CC00;
  color += Math.random() * 0x010101;
  var cube_geom = new THREE.CubeGeometry(width, height, length);
  var cube_mat = new THREE.MeshLambertMaterial({ color: color });
  var cube = new Physijs.BoxMesh(cube_geom, cube_mat, CUBE_MASS);
  return cube;
}

function create_long() {
  var piece = create_cube(1, 1, 1, CUBE_MASS);
  for(var i = 1; i <= 4; i++) {
    var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, 0xCC00CC);
    block.position.add(new THREE.Vector3(0, 0, (i-2.5) * CUBE_SIZE));
    piece.add(block);
  }
  return piece;
}

function get_block() {
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
