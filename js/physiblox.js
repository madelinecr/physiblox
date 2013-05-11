'use strict';

Physijs.scripts.worker = 'js/physijs_worker.js'
Physijs.scripts.ammo = 'ammo.js'

var WIDTH = 600, HEIGHT = 600;
var VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.1, FAR = 10000;

var CUBE_SIZE = 9, CUBE_MASS = 0.5;
var MOVE_FORCE = 20;
var I_PIECE_COLOR = 0x1ABC9C;
var J_PIECE_COLOR = 0x2ECC71;
var L_PIECE_COLOR = 0x3498DB;
var O_PIECE_COLOR = 0x9B59B6;
var S_PIECE_COLOR = 0xE74C3C;
var T_PIECE_COLOR = 0xE67E22;
var Z_PIECE_COLOR = 0x34495E;
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
    var force_vector = new THREE.Vector3(0, 0, 0.1);
    var offset_vector = new THREE.Vector3(0, 15, 0);
    current_block.applyImpulse(force_vector, offset_vector);
  } if(input_manager.rot_right == true) {
    var force_vector = new THREE.Vector3(0, 0, -0.1);
    var offset_vector = new THREE.Vector3(0, 15, 0);
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

function create_block(type) {
  var piece = create_cube(1, 1, 1, CUBE_MASS);
  switch(type) {
    case 1: // I piece
      for(var i = 1; i <= 4; i++) {
        var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, I_PIECE_COLOR);
        block.position.add(new THREE.Vector3(0, 0, (i-2.5) * CUBE_SIZE));
        piece.add(block);
      }
      return piece;
    case 2: // J piece
      for(var i = 1; i <= 3; i++) {
        var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, J_PIECE_COLOR);
        block.position.add(new THREE.Vector3(0, 0.5*CUBE_SIZE, (i-2) * CUBE_SIZE));
        piece.add(block);
      }
      var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, J_PIECE_COLOR);
      block.position.add(new THREE.Vector3(0, -0.5*CUBE_SIZE, -CUBE_SIZE));
      piece.add(block);
      return piece;
    case 3: // L piece
      for(var i = 1; i <= 3; i++) {
        var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, L_PIECE_COLOR);
        block.position.add(new THREE.Vector3(0, 0.5*CUBE_SIZE, (i-2) * CUBE_SIZE));
        piece.add(block);
      }
      var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, L_PIECE_COLOR);
      block.position.add(new THREE.Vector3(0, -0.5*CUBE_SIZE, CUBE_SIZE));
      piece.add(block);
      return piece;
    case 4: // O piece
      for(var x = -1; x <= 0; x++) {
        for(var y = -1; y <= 0; y++) {
          var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, O_PIECE_COLOR);
          block.position.add(new THREE.Vector3(0, x*CUBE_SIZE+0.5*CUBE_SIZE, y*CUBE_SIZE+0.5*CUBE_SIZE));
          piece.add(block);
        }
      }
      return piece;
    case 5: // S piece
      for(var i = 1; i <= 2; i++) {
        var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, S_PIECE_COLOR);
        block.position.add(new THREE.Vector3(0, 0.5*CUBE_SIZE, (i-2) * CUBE_SIZE));
        piece.add(block);
      }
      for(var i = 1; i <= 2; i++) {
        var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, S_PIECE_COLOR);
        block.position.add(new THREE.Vector3(0, -0.5*CUBE_SIZE, (i-1) * CUBE_SIZE));
        piece.add(block);
      }
      return piece;
    case 6: // T piece
      for(var i = 1; i <= 3; i++) {
        var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, T_PIECE_COLOR);
        block.position.add(new THREE.Vector3(0, 0.5*CUBE_SIZE, (i-2) * CUBE_SIZE));
        piece.add(block);
      }
      var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, T_PIECE_COLOR);
      block.position.add(new THREE.Vector3(0, -0.5*CUBE_SIZE, 0));
      piece.add(block);
      return piece;
    case 7: // Z piece
      for(var i = 1; i <= 2; i++) {
        var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, Z_PIECE_COLOR);
        block.position.add(new THREE.Vector3(0, 0.5*CUBE_SIZE, (i-1) * CUBE_SIZE));
        piece.add(block);
      }
      for(var i = 1; i <= 2; i++) {
        var block = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, Z_PIECE_COLOR);
        block.position.add(new THREE.Vector3(0, -0.5*CUBE_SIZE, (i-2) * CUBE_SIZE));
        piece.add(block);
      }
      return piece;
  }
}

function get_block() {
  // not the right way to generate random blocks
  // TODO replace with grab-bag implementation
  var block = create_block(Math.floor(Math.random() * 7 + 1));
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
