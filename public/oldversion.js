<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js vr - ball shooter</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>
	<body>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> vr - ball shooter
		</div>

		<script type="module">

			import * as THREE from '../build/three.module.js';

			import { BoxLineGeometry } from './jsm/geometries/BoxLineGeometry.js';
			import { VRButton } from './jsm/webxr/VRButton.js';
			import { XRControllerModelFactory } from './jsm/webxr/XRControllerModelFactory.js';
		  import { SVGLoader } from './jsm/loaders/SVGLoader.js';

			var camera, scene, renderer;
			var controller1, controller2;
			var controllerGrip1, controllerGrip2;

			var room;


			var count = 0;
			var radius = 0.08;
			var normal = new THREE.Vector3();
			var relativeVelocity = new THREE.Vector3();

			var clock = new THREE.Clock();

			init();
			animate();

			function init() {

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x222222 );

				camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
				camera.position.set( 0, 1.6, 3 );

				room = new THREE.LineSegments(
					new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ),
					new THREE.LineBasicMaterial( { color: 0x808080 } )
				);
				room.geometry.translate( 0, 3, 0 );
				scene.add( room );

				scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

				var light = new THREE.DirectionalLight( 0xffffff );
				light.position.set( 1, 1, 1 ).normalize();
				scene.add( light );

				var geometry = new THREE.IcosahedronBufferGeometry( radius, 3 );

//Add KSU Logo
var loader = new SVGLoader();

loader.load( 'models/svg/KSU.svg', function ( data ) {

	var paths = data.paths;

	var group = new THREE.Group();
	group.scale.multiplyScalar( 0.008 );
	group.position.x = -2.42;
	group.position.y = 4.6;
	group.position.z = -2.95;
	group.scale.y *= -1;

	for ( var i = 0; i < paths.length; i ++ ) {

		var path = paths[ i ];

		var fillColor = path.userData.style.fill;
		if ( true && fillColor !== undefined && fillColor !== 'none' ) {

			var material = new THREE.MeshBasicMaterial( {
				color: new THREE.Color().setStyle( fillColor ),
				opacity: path.userData.style.fillOpacity,
				transparent: path.userData.style.fillOpacity < 1,
				side: THREE.DoubleSide,
				depthWrite: false,
				wireframe: false
			} );

			var shapes = path.toShapes( true );

			for ( var j = 0; j < shapes.length; j ++ ) {

				var shape = shapes[ j ];

				var geometry = new THREE.ShapeBufferGeometry( shape );
				var mesh = new THREE.Mesh( geometry, material );

				group.add( mesh );

			}

		}

		var strokeColor = path.userData.style.stroke;

		if ( false && strokeColor !== undefined && strokeColor !== 'none' ) {

			var material = new THREE.MeshBasicMaterial( {
				color: new THREE.Color().setStyle( strokeColor ),
				opacity: path.userData.style.strokeOpacity,
				transparent: path.userData.style.strokeOpacity < 1,
				side: THREE.DoubleSide,
				depthWrite: false,
				wireframe: false
			} );

			for ( var j = 0, jl = path.subPaths.length; j < jl; j ++ ) {

				var subPath = path.subPaths[ j ];

				var geometry = SVGLoader.pointsToStroke( subPath.getPoints(), path.userData.style );

				if ( geometry ) {

					var mesh = new THREE.Mesh( geometry, material );

					group.add( mesh );

				}

			}

		}

	}

	scene.add( group );

} );




				for ( var i = 0; i < 200; i ++ ) {
					var ballColor = i % 3;
					if (ballColor == 0) {
						var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xb0b3b2 } ) );
					} else if (ballColor == 1) {
						var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0x231f20 } ) );
					} else if (ballColor == 2){
						var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xffc629 } ) );
					}


					object.position.x = Math.random() * 4 - 2;
					object.position.y = Math.random() * 4;
					object.position.z = Math.random() * 4 - 2;

					object.userData.velocity = new THREE.Vector3();
					object.userData.velocity.x = Math.random() * 0.01 - 0.005;
					object.userData.velocity.y = Math.random() * 0.01 - 0.005;
					object.userData.velocity.z = Math.random() * 0.01 - 0.005;

					room.add( object );

				}

				//

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.outputEncoding = THREE.sRGBEncoding;
				renderer.xr.enabled = true;
				document.body.appendChild( renderer.domElement );

				//

				document.body.appendChild( VRButton.createButton( renderer ) );

				// controllers

				function onSelectStart() {

					this.userData.isSelecting = true;

				}

				function onSelectEnd() {

					this.userData.isSelecting = false;

				}

				controller1 = renderer.xr.getController( 0 );
				controller1.addEventListener( 'selectstart', onSelectStart );
				controller1.addEventListener( 'selectend', onSelectEnd );
				controller1.addEventListener( 'connected', function ( event ) {

					this.add( buildController( event.data ) );

				} );
				controller1.addEventListener( 'disconnected', function () {

					this.remove( this.children[ 0 ] );

				} );
				scene.add( controller1 );

				controller2 = renderer.xr.getController( 1 );
				controller2.addEventListener( 'selectstart', onSelectStart );
				controller2.addEventListener( 'selectend', onSelectEnd );
				controller2.addEventListener( 'connected', function ( event ) {

					this.add( buildController( event.data ) );

				} );
				controller2.addEventListener( 'disconnected', function () {

					this.remove( this.children[ 0 ] );

				} );
				scene.add( controller2 );

				// The XRControllerModelFactory will automatically fetch controller models
				// that match what the user is holding as closely as possible. The models
				// should be attached to the object returned from getControllerGrip in
				// order to match the orientation of the held device.

				var controllerModelFactory = new XRControllerModelFactory();

				controllerGrip1 = renderer.xr.getControllerGrip( 0 );
				controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
				scene.add( controllerGrip1 );

				controllerGrip2 = renderer.xr.getControllerGrip( 1 );
				controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
				scene.add( controllerGrip2 );

				//

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function buildController( data ) {

				switch ( data.targetRayMode ) {

					case 'tracked-pointer':

						var geometry = new THREE.BufferGeometry();
						geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
						geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

						var material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );

						return new THREE.Line( geometry, material );

					case 'gaze':

						var geometry = new THREE.RingBufferGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
						var material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
						return new THREE.Mesh( geometry, material );

				}

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function handleController( controller ) {

				if ( controller.userData.isSelecting ) {

					var object = room.children[ count ++ ];

					object.position.copy( controller.position );
					object.userData.velocity.x = ( Math.random() - 0.5 ) * 3;
					object.userData.velocity.y = ( Math.random() - 0.5 ) * 3;
					object.userData.velocity.z = ( Math.random() - 9 );
					object.userData.velocity.applyQuaternion( controller.quaternion );

					if ( count === room.children.length ) count = 0;

				}

			}

			//

			function animate() {

				renderer.setAnimationLoop( render );

			}

			function render() {

				handleController( controller1 );
				handleController( controller2 );

				//

				var delta = clock.getDelta() * 0.8; // slow down simulation

				var range = 3 - radius;

				for ( var i = 0; i < room.children.length; i ++ ) {

					var object = room.children[ i ];

					object.position.x += object.userData.velocity.x * delta;
					object.position.y += object.userData.velocity.y * delta;
					object.position.z += object.userData.velocity.z * delta;

					// keep objects inside room

					if ( object.position.x < - range || object.position.x > range ) {

						object.position.x = THREE.MathUtils.clamp( object.position.x, - range, range );
						object.userData.velocity.x = - object.userData.velocity.x;

					}

					if ( object.position.y < radius || object.position.y > 6 ) {

						object.position.y = Math.max( object.position.y, radius );

						object.userData.velocity.x *= 0.98;
						object.userData.velocity.y = - object.userData.velocity.y * 0.8;
						object.userData.velocity.z *= 0.98;

					}

					if ( object.position.z < - range || object.position.z > range ) {

						object.position.z = THREE.MathUtils.clamp( object.position.z, - range, range );
						object.userData.velocity.z = - object.userData.velocity.z;

					}

					for ( var j = i + 1; j < room.children.length; j ++ ) {

						var object2 = room.children[ j ];

						normal.copy( object.position ).sub( object2.position );

						var distance = normal.length();

						if ( distance < 2 * radius ) {

							normal.multiplyScalar( 0.5 * distance - radius );

							object.position.sub( normal );
							object2.position.add( normal );

							normal.normalize();

							relativeVelocity.copy( object.userData.velocity ).sub( object2.userData.velocity );

							normal = normal.multiplyScalar( relativeVelocity.dot( normal ) );

							object.userData.velocity.sub( normal );
							object2.userData.velocity.add( normal );

						}

					}

					object.userData.velocity.y -= 9.8 * delta;

				}

				renderer.render( scene, camera );

			}

		</script>
	</body>
</html>
