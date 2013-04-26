var WIDTH = 600, HEIGHT = 600;
var VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.1, FAR = 10000;
var $container = $('#container');

var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
var scene = new THREE.Scene();

camera.position.z = 200;
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColorHex(0x111111, 1.0);

$container.append(renderer.domElement);

// Application specific logic
var CUBE_SIZE = 2;
var CUBEGRID_SIZE = 40;
var CUBEGRID_ITERS = 20;
var CUBEGRID_STEPSIZE = CUBEGRID_SIZE / CUBEGRID_ITERS;
var COLOR_SCALE = 0.05;
var OFFSET_SCALE = 1.5;
var cubes = new THREE.Object3D();

function create_cube(width, height, length) {
  var cube_geom  = new THREE.CubeGeometry(width, height, length);
  var cube_mat  = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
  var cube = new THREE.Mesh(cube_geom, cube_mat);
  return cube;
}

for(var x = 0; x < CUBEGRID_ITERS; x++) {
  for(var y = 0; y < CUBEGRID_ITERS; y++) {
    var cube = create_cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    cube.position.x = CUBEGRID_STEPSIZE * OFFSET_SCALE * x;
    cube.position.y = CUBEGRID_STEPSIZE * OFFSET_SCALE * y;
    cube.material.color.setRGB(0, COLOR_SCALE * x, COLOR_SCALE * y);
    cubes.add(cube);
  }
}

create_cube(80, 80, 80);
scene.add(cubes);
scene.add(camera);

// Add light to the scene
var pointlight = new THREE.PointLight( 0xFFFFFF );
pointlight.position.x = 10;
pointlight.position.y = 50;
pointlight.position.z = 130;
scene.add(pointlight);

function render() {
  requestAnimationFrame(render);

  renderer.render(scene, camera);
}

render();
