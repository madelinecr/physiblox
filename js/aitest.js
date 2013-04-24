var WIDTH = 400, HEIGHT = 300;
var VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.1, FAR = 10000;

var $container = $('#container');

var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
var scene = new THREE.Scene();

camera.position.z = 300;
renderer.setSize(WIDTH, HEIGHT);

$container.append(renderer.domElement);

// Add sphere to scene
var radius = 50, segments = 16, rings = 16;
var sphere_geom = new THREE.SphereGeometry(radius, segments, rings);
var sphere_mat  = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
var sphere = new THREE.Mesh(sphere_geom, sphere_mat);

scene.add(sphere);
scene.add(camera);

// Add light to the scene
var pointlight = new THREE.PointLight( 0xFFFFFF );
pointlight.position.x = 10;
pointlight.position.y = 50;
pointlight.position.z = 130;
scene.add(pointlight);

renderer.render(scene, camera);
