import * as THREE from "three";

import { BoxLineGeometry } from "/examples/jsm/geometries/BoxLineGeometry.js"; //Used to find the center of the buffer geometry boxes
import { XRButton } from "/examples/jsm/webxr/XRButton.js";
import { ARButton } from "/ARButton.js";
import { XRControllerModelFactory } from "/examples/jsm/webxr/XRControllerModelFactory.js";
import { OrbitControls } from "/examples/jsm/controls/OrbitControls.js";
import { GCodeLoader } from "/examples/jsm/loaders/GCodeLoader.js";
import { GLTFLoader } from "/examples/jsm/loaders/GLTFLoader.js"; // for new avatars
import { GCodeLoaderLayer } from "/GCodeLoaderLayer.js";
import { GCodeLoaderLayerBoat } from "/GCodeLoaderLayerBoat.js";
import { GCodeLoaderNoLayer } from "/GCodeLoaderNoLayer.js";
import { GCodeLoaderPrinter } from "/GCodeLoaderPrinter.js";
import { createText } from "/examples/jsm/webxr/Text2D.js";
import { STLLoader } from "/examples/jsm/loaders/STLLoader.js";
//import { SimplifyModifier } from "https://unpkg.com/three@0.163.0/examples/jsm/modifiers/SimplifyModifier.js";
import { BoxGeometry, Matrix4, Mesh, MeshBasicMaterial, Object3D } from "three";
import { phy } from "./build/Phy.module.js";
import { TubePainter } from "/TubePainter.js";
import { XRHandModelFactory } from "/examples/jsm/webxr/XRHandModelFactory.js";
import * as ThreeMeshUI from "/three-mesh-ui.module.js";
import {
  World,
  System,
  Component,
  TagComponent,
  Types,
} from "https://unpkg.com/three@0.163.0/examples/jsm/libs/ecsy.module.js";

let button1, button2, button3, button4, button5;
let exitButton, resetButton, gravityButton, occlusionButton, clearPaintButton;
let button4Active = false;
let button5Active = false;
let menuGroup = new THREE.Group();
let proteinGroup = new THREE.Group();
let exitGroup = new THREE.Group();
let resetGroup = new THREE.Group();
let gravityGroup = new THREE.Group();
let paintGroup = new THREE.Group();
let occlusionGroup = new THREE.Group();
let shadowGroup = new THREE.Group();
let wireframemeshNumber = 0;
let siteLogo, galton;
let mode = "menu";
let meshNumber = 0;
let planeNumber = 0;
let ballsGalton = 500;
let ballsLab = 150;
let gravity = true;
let occlusion = true;
//let occlusionMesh, shadowMesh;
let previousActiveMesh;
let objectPosition = new THREE.Vector3();
let controllerSqueezeRotation = new THREE.Euler();
let boxMesh;
let proteinModel;
let printerPathArray = [];
let avatarModel = new THREE.Group();
let cursor = new THREE.Vector3();
let painter1 = new TubePainter();
let painter2 = new TubePainter();
let hand1, hand2;

// Track whether the trigger is squeezed

// Initial controller rotation state
let initialRotation = { x: 0, y: 0, z: 0 };
let initialPosition1 = new THREE.Vector3();
let initialPosition2 = new THREE.Vector3();
let drop = 0;
let dropRate = 5;
let galtonBalls = false;
let rightHand, leftHand, head;
//let sphereInter;

let stlMeshBoat, stlMeshTest, stlMeshOwl;
let wireframeMeshBoat, wireframeMeshTest, wireframeMeshOwl;
let gcodeMeshBoat,
  gcodeMeshBoatLayer,
  gcodeMeshTest,
  gcodeMeshTestTree,
  gcodeMeshTestLayer,
  gcodeMeshOwl,
  gcodeMeshOwlTree,
  gcodeMeshOwlLayer;

///////////////////////
//   Configuration   //
///////////////////////

let enablePhysics = true; //Allows Rapier Physics
let enableBalls = false; //Requires enablePhysics = true;
let newAvatar = false; //ReadyPlayerMe Avatar
let playerPhysics = true; //Add physics to players, balls bounce off players
let clients = 30; //Set max number of client bodies/controllers
let loadingDebug = false; //Console logs percentage done when loading assets
let fetchLog = true; //Loads log.txt into memory
let logFileTest = false; //Starts emiting the logFile to the server when set true
let enableGuide = true; //Shows the Toogle Guide Button on the wall
let questPro = true;
let logLocal = true;
let heatMap = false;
let heatMapWalls = false;
let heatMapResolution = 0.05;
let logLineHands = true;
let logLineHead = true;
let showVR = false;
let showUser = 1;
let activeMesh = "boat";
let endLog = 0;
let inClassDemo = true; //Moves starting point when join session
let minXCal = 7.4;
let maxXCal = 7.9;
let minYCal = 2.4;
let maxYCal = 2.8;

const meshes = [];
const meshMap = new WeakMap();

//////////////////////////////
// Custom Global Variables //
/////////////////////////////

let unselectedColor = 0x355c7d;
let selectedColor = 0x00aaaa;

let isRotating = false;
let tourGuide = 0;

let csvData = [];

let intersectedStartPos = new THREE.Vector3();
let intersectedCurrentPos = new THREE.Vector3();
let intersectedSelected = 0;
let intersectedScale = 0;
let intersectedStartRot;
let intersectedStartCon = new THREE.Vector3();

let start_x, start_y, start_z;
let rotateObject = 0;
let controllerName;
let conStartPos;
let conCurrentPos;
let objectStartRotation;
let gcodeState = 0;
let printerIndex = 0;
let printing = 0;
let startTime;
let pauseTime;

////
//let printerPath;
let printerPathBoat;
let printerPathTest;
let printerPathOwl;
let stopPrinting = false;
let lineBoat, lineFilament;
let centerOfRotation = new THREE.Group();

let coverButton, fansButton, heatsinkButton;

let buttonPressSound, buttonReleaseSound;

let raycaster;
let tempX, tempY;
let touch1X, touch1Y;
const intersected = [];
const tempMatrix = new THREE.Matrix4();

let boxes;
let rotateMeshMouse = false;
let rotateMeshTouch = false;
let scaleMeshTouch = false;
let scaleMouseWheel = 0;
let twofingers = false;

let cover,
  fans,
  heatsink,
  tube,
  block,
  xaxis_switch,
  bltouch,
  bltouch_needle,
  nozzle;

const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();

const pointer = new THREE.Vector2();

let stlButton;
let wireframeButton;
let gcodeButton;
let gcodeLayerToggle, gcodeLayerPlus, gcodeLayerMinus;
let gcodeLayer = 0;
let gcodeExtrudeButton;
let gcodeTravelButton;
let gcodeSupportButton;
let gcodeTreeButton;
let hideRoomButton, showRoomButton;
let togglePrinterButton, togglePrinterOnButton, pausePrinterButton;
let toggleGuideButton;
let pauseGuideButton;
let roomToggle = false;
let toggleBoatButton;
let toggleTestButton;
let toggleOwlButton;
let boatToggleState;
let furnitureGroup = new THREE.Group();
let planeGroup = new THREE.Group();
let ender3SpoolMesh;
let lineBoatState = false;
let lineFilamentState = false;

let togglePhysicsButton;
let physicsToggle = enablePhysics;

let voiceover;
let voiceoverFrame = 1;
let logIndex = 1;

let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let controllerGrip3, controllerGrip4;
let conLeftSelecting = false;
let conRightSelecting = false;
let conStartingDist;
let conCurrentDist;
let touchStartingDist;
let touchCurrentDist;

let stlMeshBoatParent = new THREE.Group();
let gcodeMeshBoatParent = new THREE.Group();
let wireframeMeshBoatParent = new THREE.Group();
let stlMeshTestParent = new THREE.Group();
let gcodeMeshTestParent = new THREE.Group();
let wireframeMeshTestParent = new THREE.Group();
let stlMeshOwlParent = new THREE.Group();
let gcodeMeshOwlParent = new THREE.Group();
let wireframeMeshOwlParent = new THREE.Group();
let boatMeshes = new THREE.Group();
let testMeshes = new THREE.Group();
let owlMeshes = new THREE.Group();
let boundingBoxesBoat = new THREE.Group();
let boundingBoxesTest = new THREE.Group();
let boundingBoxesOwl = new THREE.Group();
let ender3Group = new THREE.Group();
let ender3XAxisGroup = new THREE.Group();
let ender3YAxisGroup = new THREE.Group();
let ender3HotEndGroup = new THREE.Group();
let boatIntersectedLeft = 0;
let boatIntersectedRight = 0;
let boatStartingScale = new THREE.Vector3(1, 1, 1);
let snapshotScale = 0;
let allowRotationLeft = false;
let allowRotationRight = false;
let bothSelecting = false;

let buttonGroup = new THREE.Group();
let printerButtonGroup = new THREE.Group();

let stlMeshOriginalScale;
let wireframeMeshOriginalScale;
let gcodeMeshParentOriginalScale;
let boundingBoxesOriginalScale;

let room, spheres;
let physics,
  velocity = new THREE.Vector3();
let cubeGroup;
let controller1Group;
let controller2Group;
let physicsRoom;
let ar;
let vr;

let userArray = [];

let socket = io();
loadSockets(); //Loads sockets events... this needs to be done early to prevent userArray issues

let count = 0;
let frameCount = 0;
let pressCount = 0;
let presenting = 0;
let controllerGroup;
let myCubeGroup;
let myControllerGroup1;
let myControllerGroup2;
let controller0;
let consoleMesh;

let reticle;

let hitTestSource = null;
let hitTestSourceRequested = false;

let planes;
let planesAdded = 0;

let planesGeometry = [];
let planesMaterial = [];

let roomArray = [];

let lineGroup = new THREE.Group();

let triggerAudio = 1;

let showID;

let calibrationMatrix = new Matrix4();

let updateRot = false; //Used to update rotation after scene update for auto calibrarion

/////////////////////
//// For GAMEPAD  //
///////////////////
var cameraVector = new THREE.Vector3(); // create once and reuse it!
const prevGamePads = new Map();
var speedFactor = [0.0001, 0.0001, 0.0001, 0.0001];
let controls;
let calibrationMode = 0;
let printerMode = 0;
let baseReferenceSpace;
let myRot = new THREE.Vector3();
let myPos = new THREE.Vector3();
let timePrevFrame;
let exitText;
let FPS = "0 FPS";

/////////////////////
// Mesh-detection //
///////////////////

const allMeshOrigins = [];
const wireframeMaterial = new THREE.MeshBasicMaterial({
  wireframe: true,
});
const baseOriginGroup = new THREE.Group();

let meshId = 1;
let allMeshes = new Map();

///
//NEW
///
class XRPlanes extends Object3D {
  constructor(renderer) {
    super();

    const matrix = new Matrix4();

    const currentPlanes = new Map();

    const xr = renderer.xr;

    xr.addEventListener("planesdetected", (event) => {
      const frame = event.data;
      const planes = frame.detectedPlanes;

      const referenceSpace = xr.getReferenceSpace();

      let planeschanged = false;

      for (const [plane, mesh] of currentPlanes) {
        if (planes.has(plane) === false) {
          mesh.geometry.dispose();
          mesh.material.dispose();
          this.remove(mesh);

          currentPlanes.delete(plane);

          planeschanged = true;
        }
      }

      for (const plane of planes) {
        if (currentPlanes.has(plane) === false) {
          const pose = frame.getPose(plane.planeSpace, referenceSpace);
          matrix.fromArray(pose.transform.matrix);

          const polygon = plane.polygon;

          let minX = Number.MAX_SAFE_INTEGER;
          let maxX = Number.MIN_SAFE_INTEGER;
          let minZ = Number.MAX_SAFE_INTEGER;
          let maxZ = Number.MIN_SAFE_INTEGER;

          for (const point of polygon) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minZ = Math.min(minZ, point.z);
            maxZ = Math.max(maxZ, point.z);
          }

          const width = maxX - minX;
          const height = maxZ - minZ;

          const geometry = new THREE.BoxGeometry(width, 0.0001, height);

          const material = new THREE.ShadowMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.6,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.setFromMatrixPosition(matrix);
          mesh.quaternion.setFromRotationMatrix(matrix);
          //mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.name = "Plane2";

          //  planeGroup.add(mesh);

          var centerMesh = getCenterPoint(mesh);

          const edges = new THREE.EdgesGeometry(geometry);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 })
          );
          line.position.setFromMatrixPosition(matrix);
          line.quaternion.setFromRotationMatrix(mesh.matrix);
          line.updateMatrix();
          //  lineGroup.add(line);

          if (
            width > minXCal &&
            width < maxXCal &&
            height > minYCal &&
            height < maxYCal
          ) {
            socket.emit("debug", "***Found it!!!***");

            scene.traverse(function (object) {
              // Check if the object has a 'width' property
              if (object !== undefined) {
                // socket.emit("debug", "chECKING OBJECT");
                if (object.isMesh) {
                  ///socket.emit("debug", "This obejct is a mesh");
                  //  if (object.name === "furniture") {
                  // socket.emit("debug", object.name);
                  //socket.emit("debug", object.geometry);

                  var boundingBox = new THREE.Box3();
                  boundingBox.setFromBufferAttribute(
                    object.geometry.attributes.position
                  );

                  var width2 = boundingBox.max.x - boundingBox.min.x;
                  var height2 = boundingBox.max.y - boundingBox.min.y;
                  var depth2 = boundingBox.max.z - boundingBox.min.z;

                  //  socket.emit("debug", width2);
                  //  socket.emit("debug", height2);
                  //  socket.emit("debug", depth2);
                  if (
                    width2 > minXCal &&
                    width2 < maxXCal &&
                    depth2 > minYCal &&
                    depth2 < maxYCal
                  ) {
                    if (object.position.x != 0) {
                      /*
                    object.updateMatrix();
                    object.updateMatrixWorld(true); // true to force update

                    // Now you can access the updated transformation matrix
                    var matrix = object.matrixWorld;

                    // Extract position from the matrix
                    var position = new THREE.Vector3();
                    position.setFromMatrixPosition(matrix);

                    // Extract rotation from the matrix
                    var quaternion = new THREE.Quaternion();
                    quaternion.setFromRotationMatrix(matrix);

                    // Convert quaternion to Euler angles if needed
                    var eulerFix = new THREE.Euler();
                    eulerFix.setFromQuaternion(quaternion);
                    object.setRotationFromEuler(eulerFix);
                    object.position.set(position.x, position.y, position.z);
                    */

                      socket.emit("debug", "Mesh - Headset");
                      socket.emit("debug", mesh.rotation);
                      socket.emit("debug", "Object - JSON");
                      socket.emit("debug", object.name);
                      socket.emit("debug", object.rotation);

                      function rotatePoint(x, z, angleInRadians) {
                        let cosTheta = Math.cos(angleInRadians);
                        let sinTheta = Math.sin(angleInRadians);

                        let newX = x * cosTheta - z * sinTheta;
                        let newZ = x * sinTheta + z * cosTheta;

                        return { x: newX, z: newZ };
                      }

                      let rotationAngle = mesh.rotation._z - object.rotation._z;

                      // Original coordinates as a Vector2
                      let originalPoint = new THREE.Vector2(
                        mesh.position.x,
                        mesh.position.z
                      );

                      // Rotation angle in radians

                      // Apply rotation to the original point
                      originalPoint.rotateAround(
                        new THREE.Vector2(0, 0),
                        rotationAngle
                      );

                      // Get the new coordinates
                      let newX = originalPoint.x;
                      let newZ = originalPoint.y;

                      // socket.emit("debug", newX);
                      // socket.emit("debug", newZ);

                      let rotatedPointMesh = rotatePoint(
                        mesh.position.x,
                        mesh.position.z,
                        rotationAngle
                      );

                      let rotatedPointObject = rotatePoint(
                        object.position.x,
                        object.position.z,
                        rotationAngle
                      );
                      // socket.emit("debug", "Rotated Mesh");
                      // socket.emit("debug", rotatedPointMesh);
                      //  socket.emit("debug", "Object - JSON");
                      //  socket.emit("debug", rotatedPointObject);
                      myRot.y = mesh.rotation._z - object.rotation._z;

                      //First teleport for rotation
                      if (true) {
                        const offsetPosition = {
                          x: myPos.x,
                          y: myPos.y,
                          z: myPos.z,
                          w: 1,
                        };
                        const euler = new THREE.Euler(
                          myRot.x,
                          myRot.y,
                          myRot.z,
                          "XYZ"
                        );

                        const offsetRotation = new THREE.Quaternion();
                        offsetRotation.setFromEuler(euler);
                        const transform = new XRRigidTransform(
                          offsetPosition,
                          offsetRotation
                        );
                        const teleportSpaceOffset =
                          baseReferenceSpace.getOffsetReferenceSpace(transform);

                        renderer.xr.setReferenceSpace(teleportSpaceOffset);
                        baseReferenceSpace = teleportSpaceOffset;
                        myPos.x = 0;
                        myPos.y = 0;
                        myPos.z = 0;
                        myRot.x = 0;
                        myRot.y = 0;
                        myRot.z = 0;

                        //Second teleport for X and Z
                        if (true) {
                          myPos.x = rotatedPointMesh.x - object.position.x;
                          myPos.y = mesh.position.y - object.position.y;
                          myPos.z = rotatedPointMesh.z - object.position.z;
                          socket.emit("debug", myPos.x);
                          socket.emit("debug", myPos.y);
                          socket.emit("debug", myPos.z);
                          const offsetPosition = {
                            x: myPos.x,
                            y: myPos.y,
                            z: myPos.z,
                            w: 1,
                          };
                          const euler = new THREE.Euler(
                            myRot.x,
                            myRot.y,
                            myRot.z,
                            "XYZ"
                          );
                          const offsetRotation = new THREE.Quaternion();
                          offsetRotation.setFromEuler(euler);
                          const transform = new XRRigidTransform(
                            offsetPosition,
                            offsetRotation
                          );
                          const teleportSpaceOffset =
                            baseReferenceSpace.getOffsetReferenceSpace(
                              transform
                            );

                          renderer.xr.setReferenceSpace(teleportSpaceOffset);
                          baseReferenceSpace = teleportSpaceOffset;
                          myPos.x = 0;
                          myPos.y = 0;
                          myPos.z = 0;
                          myRot.x = 0;
                          myRot.y = 0;
                          myRot.z = 0;
                        }
                      }
                    }
                  }
                }
              }
            });

            //myRot.y = line.rotation.y;
          }

          const geometryPhysics = new THREE.BoxGeometry(
            width,
            0.05,
            height
          ).translate(0, 0.1, 0);
          const meshPhysics = new THREE.Mesh(geometryPhysics, material);
          meshPhysics.position.setFromMatrixPosition(matrix);
          meshPhysics.quaternion.setFromRotationMatrix(matrix);
          //scene.add(meshPhysics);
          //physics.addMesh(meshPhysics);

          currentPlanes.set(plane, mesh);

          planeschanged = true;
        }
      }

      if (planeschanged) {
        this.dispatchEvent({ type: "planeschanged" });
      }
    });
  }
}

//////////////////////////////
// For Button Components  ///
////////////////////////////
class Object3D2 extends Component {}

Object3D2.schema = {
  object: { type: Types.Ref },
};

class Button extends Component {}

Button.schema = {
  //button states: [resting, pressed, fully_pressed, recovering]
  currState: { type: Types.String, default: "resting" },
  prevState: { type: Types.String, default: "resting" },
  pressSound: { type: Types.Ref, default: null },
  releaseSound: { type: Types.Ref, default: null },
  action: { type: Types.Ref, default: () => {} },
};

class ButtonSystem extends System {
  init(attributes) {
    this.renderer = attributes.renderer;
    this.soundAdded = false;
  }

  execute(/*delta, time*/) {
    if (this.renderer.xr.getSession() && !this.soundAdded) {
      const xrCamera = this.renderer.xr.getCamera();

      this.soundAdded = true;
    }

    this.queries.buttons.results.forEach((entity) => {
      const button = entity.getMutableComponent(Button);
      const buttonMesh = entity.getComponent(Object3D2).object;
      // populate restingY
      if (button.restingZ == null) {
        button.restingZ = buttonMesh.position.z;
      }

      if (buttonPressSound) {
        button.pressSound = buttonPressSound;
      }

      if (buttonReleaseSound) {
        button.releaseSound = buttonReleaseSound;
      }

      if (buttonMesh.pressed == "fully_pressed") {
        button.currState = "fully_pressed";
      }

      if (
        button.currState == "fully_pressed" &&
        button.prevState != "fully_pressed"
      ) {
        button.pressSound?.play();
        button.action();
      }
      if (buttonMesh.pressed == "recovering") {
        button.currState = "recovering";
      }
      if (
        button.currState == "recovering" &&
        button.prevState != "recovering"
      ) {
        button.releaseSound?.play();
      }

      button.prevState = button.currState;
    });
  }
}

ButtonSystem.queries = {
  buttons: {
    components: [Button],
  },
};

const world = new World();
const clock = new THREE.Clock();

const loadingManager = new THREE.LoadingManager(() => {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.classList.add("fade-out");
  loadingScreen.addEventListener("transitionend", onTransitionEnd);
});

const countDiv = document.getElementById("count");

function updateCount(itemsLoaded, itemsTotal) {
  countDiv.textContent = `Loading... ${itemsLoaded} of ${itemsTotal}`;
}

loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
  updateCount(itemsLoaded, itemsTotal);
  console.log(
    "Started loading file: " +
      url +
      ".\nLoaded " +
      itemsLoaded +
      " of " +
      itemsTotal +
      " files."
  );
};

loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
  updateCount(itemsLoaded, itemsTotal);
  console.log(
    "Loading file: " +
      url +
      ".\nLoaded " +
      itemsLoaded +
      " of " +
      itemsTotal +
      " files."
  );
};

loadingManager.onError = function (url) {
  countDiv.textContent = `'There was an error loading ${url}`;
  console.log("There was an error loading " + url);
};

init();
if (enablePhysics) {
  await initPhysics();
}
loadButtons();
loadScene();

// socket.emit("requestUserArrayFromServer", "");

//////////////////////
//  Load log file  //
////////////////////

if (fetchLog) {
  fetch("log.txt")
    .then((response) => response.text())
    .then((data) => (csvData = csvToArray(data)));
}

///////////////////////////////
//  Start init() for scene  //
/////////////////////////////

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x505050);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(-3.5, 3, 1.75);
  camera.lookAt(0, 0, 0);
  camera.add(listener);

  const loadingManager = new THREE.LoadingManager(() => {
    const loadingScreen = document.getElementById("loading-screen");
    loadingScreen.classList.add("fade-out");

    // optional: remove loader from DOM via event listener
    loadingScreen.addEventListener("transitionend", onTransitionEnd);
  });

  // create a global audio source
  buttonPressSound = new THREE.Audio(listener);
  buttonReleaseSound = new THREE.Audio(listener);

  audioLoader.load(
    "https://cdn.glitch.global/b6e696c4-3c48-4951-a6a5-9fd8a178095a/button-press.mp3?v=1694015000305",
    function (buffer) {
      buttonPressSound.setBuffer(buffer);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );
  audioLoader.load(
    "https://cdn.glitch.global/b6e696c4-3c48-4951-a6a5-9fd8a178095a/button-release.mp3?v=1694015005967",
    function (buffer) {
      buttonReleaseSound.setBuffer(buffer);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  var initialClick = new THREE.Audio(listener);
  audioLoader.load(
    "https://cdn.glitch.global/b6e696c4-3c48-4951-a6a5-9fd8a178095a/button-press.mp3?v=1694015000305",
    function (buffer) {
      //initialClick.setBuffer(buffer);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  voiceover = new THREE.Audio(listener);
  audioLoader.load(
    "https://cdn.glitch.global/9fdd6c5e-7ec5-467b-b963-c8db9f6204ed/audio.mp3?v=1696532245618",
    function (buffer) {
      voiceover.setBuffer(buffer);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  container.onclick = function () {
    if (triggerAudio == 1) {
      initialClick?.play();
      triggerAudio = 0;
    }
  };

  scene.add(new THREE.HemisphereLight(0xbbbbbb, 0x888888, 5));

  const light = new THREE.DirectionalLight(0xffffff, 5);
  light.position.set(0, 6, -3);
  light.castShadow = true;
  light.shadow.camera.top = 3;
  light.shadow.camera.bottom = -3;
  light.shadow.camera.right = 3;
  light.shadow.camera.left = -3;
  light.shadow.mapSize.set(4096, 4096);
  scene.add(light);

  const light2 = new THREE.DirectionalLight(0xffffff, 3);
  light2.position.set(3, 3, 3);
  light2.castShadow = true;
  light2.shadow.camera.top = 3;
  light2.shadow.camera.bottom = -3;
  light2.shadow.camera.right = 3;
  light2.shadow.camera.left = -3;
  light2.shadow.mapSize.set(4096, 4096);
  scene.add(light2);

  const light3 = new THREE.DirectionalLight(0xffffff, 3);
  light3.position.set(-3, 3, 3);
  light3.castShadow = true;
  light3.shadow.camera.top = 3;
  light3.shadow.camera.bottom = -3;
  light3.shadow.camera.right = 3;
  light3.shadow.camera.left = -3;
  light3.shadow.mapSize.set(4096, 4096);
  scene.add(light3);

  const light4 = new THREE.DirectionalLight(0xffffff, 3);
  light4.position.set(0, -2, -2);
  light4.castShadow = true;
  light4.shadow.camera.top = 3;
  light4.shadow.camera.bottom = -3;
  light4.shadow.camera.right = 3;
  light4.shadow.camera.left = -3;
  light4.shadow.mapSize.set(4096, 4096);
  //scene.add(light4);

  scene.add(lineGroup); //lineGroup is used for the white edges on the walls and furniture
  scene.add(furnitureGroup);
  scene.add(planeGroup);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(render);
  //renderer.shadowMap.enabled = true;
  //renderer.setClearColor(0xabcdef, 0);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);
  renderer.xr.addEventListener("sessionstart", function (event) {
    baseReferenceSpace = renderer.xr.getReferenceSpace();
    scene.background = null;
    planes = new XRPlanes(renderer);
    planeGroup.add(planes);
    //  socket.emit("debug", "XRplanes loaded");
    //socket.emit("debug", calibrationMatrix);
    addLocalClientToVR();
    if (inClassDemo) {
      myPos.x = -1.75;
      myPos.z = -0.5;
      myRot.y = Math.PI / 2;
      teleportCamera();
    }
  });

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxDistance = 15;
  controls.target.set(2, 1.5, 1.75);
  controls.update();

  function onSelect() {
    if (reticle.visible) {
      const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 32).translate(
        0,
        0.1,
        0
      );
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff * Math.random(),
      });
      const mesh = new THREE.Mesh(geometry, material);
      reticle.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
      mesh.scale.y = Math.random() * 2 + 1;
      //scene.add(mesh);
    }
  }

  controller0 = renderer.xr.getController(0);
  controller0.addEventListener("select", onSelect);
  scene.add(controller0);

  reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial()
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  function onSqueezeStart(event) {
    //Painter
    this.userData.isSqueezing = true;
    this.userData.positionAtSqueezeStart = this.position.y;
    this.userData.scaleAtSqueezeStart = this.scale.x;
    //Original

    const controller = event.target;
    controller.userData.isSqueezing = true;

    const intersections = getIntersections(controller);

    if (intersections.length > 0) {
      const intersection = intersections[0];

      const object = intersection.object;
      object.material.emissive.b = 1;
      controller.attach(centerOfRotation);

      controller.userData.selected = object;
    }

    controller.userData.targetRayMode = event.data.targetRayMode;
  }

  function onSqueezeEnd(event) {
    const controller = event.target;
    controller.userData.isSqueezing = false;
    controllerSqueezeRotation = controller.rotation;

    if (controller.userData.selected !== undefined) {
      const object = controller.userData.selected;
      object.material.emissive.b = 0;
      scene.attach(centerOfRotation);

      socket.emit("centerOfRotationToServer", {
        CORposX: centerOfRotation.position.x,
        CORposY: centerOfRotation.position.y,
        CORposZ: centerOfRotation.position.z,
        CORrotX: centerOfRotation.rotation.x,
        CORrotY: centerOfRotation.rotation.y,
        CORrotZ: centerOfRotation.rotation.z,
      });

      // Apply the group's rotation to the child
      socket.emit("updateProteinGroupToServer", {
        quat: centerOfRotation.quaternion,
      });
      if (activeMesh == "protein") {
        proteinGroup.applyQuaternion(centerOfRotation.quaternion);
      } else if (activeMesh == "boat") {
        boatMeshes.applyQuaternion(centerOfRotation.quaternion);
      } else if (activeMesh == "test") {
        testMeshes.applyQuaternion(centerOfRotation.quaternion);
      } else if (activeMesh == "owl") {
        owlMeshes.applyQuaternion(centerOfRotation.quaternion);
      }

      centerOfRotation.rotation.set(0, 0, 0);
      controller.userData.selected = undefined;
    }
  }

  document.addEventListener("mousemove", onPointerMove);
  document.addEventListener("mousedown", onMouseDown, false);
  document.addEventListener("mouseup", onMouseUp, false);
  document.addEventListener("touchstart", onTouchStart, false);
  document.addEventListener("touchmove", onTouchMove, false);
  document.addEventListener("touchend", onTouchEnd, false);
  document.addEventListener("wheel", onMouseWheel, false);

  scene.add(painter1.mesh);
  painter1.mesh.visible = false; //Tube
  //painter1.mesh.material.visible = false; //Sphere attached to controller

  scene.add(painter2.mesh);
  painter2.mesh.visible = false;
  // painter2.mesh.material.visible = false; //Sphere attached to controller

  controller1 = renderer.xr.getController(0);
  controller1.name = "left";
  controller1.addEventListener("selectstart", onSelectStart);
  controller1.addEventListener("selectend", onSelectEnd);
  controller1.addEventListener("squeezestart", onSqueezeStart);
  controller1.addEventListener("squeezeend", onSqueezeEnd);
  controller1.userData.painter = painter1;

  scene.add(controller1);

  controller2 = renderer.xr.getController(1);
  controller2.name = "right";
  controller2.addEventListener("selectstart", onSelectStart);
  controller2.addEventListener("selectend", onSelectEnd);
  controller2.addEventListener("squeezestart", onSqueezeStart);
  controller2.addEventListener("squeezeend", onSqueezeEnd);
  controller2.userData.painter = painter2;

  scene.add(controller2);

  const pivot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.01, 3));
  pivot.name = "pivot";
  pivot.position.z = -0.05;

  const group = new THREE.Group();
  group.add(pivot);

  controller1.add(group.clone());
  controller2.add(group.clone());
  let pivot1 = controller1.getObjectByName("pivot");
  let pivot2 = controller2.getObjectByName("pivot");
  pivot1.visible = false;
  pivot2.visible = false;

  const controllerModelFactory = new XRControllerModelFactory();
  const handModelFactory = new XRHandModelFactory();

  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(
    controllerModelFactory.createControllerModel(controllerGrip1)
  );
  scene.add(controllerGrip1);

  hand1 = renderer.xr.getHand(0);
  hand1.add(handModelFactory.createHandModel(hand1, "boxes"));

  scene.add(hand1);
  console.log("Hand1");
  console.log(hand1);

  controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(
    controllerModelFactory.createControllerModel(controllerGrip2)
  );
  scene.add(controllerGrip2);

  hand2 = renderer.xr.getHand(1);
  hand2.add(handModelFactory.createHandModel(hand2, "boxes"));
  scene.add(hand2);

  //Raycast Line
  const geometryLine = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1),
  ]);

  const line = new THREE.Line(geometryLine);
  line.name = "line";
  line.scale.z = 5;

  controller1.add(line.clone());
  controller2.add(line.clone());

  raycaster = new THREE.Raycaster();

  window.addEventListener("keydown", (event) => {
    if (true) {
      let pos = new THREE.Vector3(1000, 0, 0);
      switch (event.key) {
        case " ":
          if (showVR === false) {
            showVR = true;
            showID = userArray[showUser].id;
            phy.change({
              name: "cube" + showUser,
              pos: [pos.x, pos.y, pos.z],
            });

            phy.change({
              name: "controller" + 2 * showUser,
              pos: [pos.x, pos.y, pos.z],
            });
            phy.change({
              name: "controller" + (2 * showUser + 1),
              pos: [pos.x, pos.y, pos.z],
            });
          } else {
            showVR = false;
            let lastClient = clients - 2;

            phy.change({
              name: "cube" + lastClient,
              pos: [pos.x, pos.y, pos.z],
            });

            phy.change({
              name: "controller" + lastClient,
              pos: [pos.x, pos.y, pos.z],
            });
            phy.change({
              name: "controller" + (lastClient + 1),
              pos: [pos.x, pos.y, pos.z],
            });

            let showVRLC1 = scene.getObjectByName("showVRLine1");
            let showVRLC2 = scene.getObjectByName("showVRLine2");
            if (showVRLC1 !== undefined) {
              showVRLC1.position.x = 1000;
            }
            if (showVRLC1 !== undefined) {
              showVRLC2.position.x = 1000;
            }
            camera.position.set(-3.5, 3, 1.75);
            camera.lookAt(0, 0, 0);
            showVR = false;
          }
          break;
        case "1":
          showVR = true;
          showUser = 1;
          showID = userArray[showUser].id;
          phy.change({
            name: "cube" + showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + 2 * showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + (2 * showUser + 1),
            pos: [pos.x, pos.y, pos.z],
          });
          break;
        case "2":
          showVR = true;
          showUser = 2;
          showID = userArray[showUser].id;
          phy.change({
            name: "cube" + showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + 2 * showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + (2 * showUser + 1),
            pos: [pos.x, pos.y, pos.z],
          });
          break;
        case "3":
          showVR = true;
          showUser = 3;
          phy.change({
            name: "cube" + showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + 2 * showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + (2 * showUser + 1),
            pos: [pos.x, pos.y, pos.z],
          });
          //physics.setMeshPosition(cubeGroup, pos, showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser + 1);
          break;
        case "4":
          showVR = true;
          showUser = 4;
          showID = userArray[showUser].id;
          phy.change({
            name: "cube" + showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + 2 * showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + (2 * showUser + 1),
            pos: [pos.x, pos.y, pos.z],
          });
          //physics.setMeshPosition(cubeGroup, pos, showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser + 1);
          break;
        case "5":
          showVR = true;
          showUser = 5;
          showID = userArray[showUser].id;
          phy.change({
            name: "cube" + showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + 2 * showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + (2 * showUser + 1),
            pos: [pos.x, pos.y, pos.z],
          });
          //physics.setMeshPosition(cubeGroup, pos, showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser + 1);
          break;
        case "6":
          showVR = true;
          showUser = 6;
          showID = userArray[showUser].id;
          phy.change({
            name: "cube" + showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + 2 * showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + (2 * showUser + 1),
            pos: [pos.x, pos.y, pos.z],
          });
          //physics.setMeshPosition(cubeGroup, pos, showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser + 1);
          break;
        case "7":
          showVR = true;
          showUser = 7;
          showID = userArray[showUser].id;
          phy.change({
            name: "cube" + showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + 2 * showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + (2 * showUser + 1),
            pos: [pos.x, pos.y, pos.z],
          });
          //physics.setMeshPosition(cubeGroup, pos, showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser + 1);
          break;
        case "8":
          showVR = true;
          showUser = 8;
          showID = userArray[showUser].id;
          phy.change({
            name: "cube" + showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + 2 * showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + (2 * showUser + 1),
            pos: [pos.x, pos.y, pos.z],
          });
          //physics.setMeshPosition(cubeGroup, pos, showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser + 1);
          break;
        case "9":
          showVR = true;
          showUser = 9;
          showID = userArray[showUser].id;
          phy.change({
            name: "cube" + showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + 2 * showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + (2 * showUser + 1),
            pos: [pos.x, pos.y, pos.z],
          });
          //physics.setMeshPosition(cubeGroup, pos, showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser + 1);
          break;
        case "0":
          showVR = true;
          showUser = 0;
          showID = userArray[showUser].id;
          phy.change({
            name: "cube" + showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + 2 * showUser,
            pos: [pos.x, pos.y, pos.z],
          });
          phy.change({
            name: "controller" + (2 * showUser + 1),
            pos: [pos.x, pos.y, pos.z],
          });
          //physics.setMeshPosition(cubeGroup, pos, showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser);
          //physics.setMeshPosition(controllerGroup, pos, 2 * showUser + 1);
          break;
      }
    }
    stopPrintingFunction();
    saveScene(event);
  });

  window.addEventListener("resize", onWindowResize);
  exitText = createText(FPS, 0.3);
  exitText.position.set(0, 2, -2.5);
  scene.add(exitText);
  /* 
  				const geometry = new THREE.SphereGeometry( 0.1 );
				const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

				sphereInter = new THREE.Mesh( geometry, material );
				sphereInter.visible = false;
				scene.add( sphereInter );
  
*/
}

///////Functions
function onSelectStart(event) {
  //
  //Painter
  this.updateMatrixWorld(true);

  const pivot = this.getObjectByName("pivot");
  cursor.setFromMatrixPosition(pivot.matrixWorld);

  const painter = this.userData.painter;
  painter.moveTo(cursor);

  //Original
  const controller = event.target;

  socket.emit("updatePaintStartToServer", {
    cursor: cursor,
    controllerName: controller.name,
  });

  start_x = controller.position.x;
  start_y = controller.position.y;
  start_z = controller.position.z;
  conStartPos = new THREE.Vector3();
  controller.getWorldPosition(conStartPos);
  rotateObject = 1;
  controllerName = controller.name;
  if (controllerName === "left") {
    conLeftSelecting = true;
  } else if (controllerName === "right") {
    conRightSelecting = true;
  }
  conStartingDist = controller1.position.distanceTo(controller2.position);
  objectStartRotation = centerOfRotation.rotation.y;

  this.userData.isSelecting = true;

  const intersections = getIntersections(controller);

  if (intersections.length > 0) {
    const intersection = intersections[0];

    const object = intersection.object;
    if (object.name !== activeMesh) {
      object.material.emissive.b = 1;
    }
    if (object.pressed == "fully_pressed") {
      object.pressed = "recovering";
    } else if (object.pressed == "recovering") {
      object.pressed = "fully_pressed";
    } else {
      object.pressed = "fully_pressed";
    }

    controller.userData.selected = object;
  }
}

function onSelectEnd(event) {
  rotateObject = 0;
  snapshotScale = 0;
  allowRotationLeft = false;
  allowRotationRight = false;

  this.userData.isSelecting = false;

  const controller = event.target;

  if (controller.userData.selected !== undefined) {
    const object = controller.userData.selected;
    if (object.name !== activeMesh) {
      object.material.emissive.b = 0;
    }
    if (object.pressed == "fully_pressed") {
      object.pressed = "recovering";
    } else if (object.pressed == "recovering") {
      object.pressed = "fully_pressed";
    } else {
      object.pressed = "fully_pressed";
    }

    controllerName = controller.name;
    if (controllerName === "left") {
      allowRotationLeft = false;
    }
    if (controllerName === "right") {
      allowRotationRight = false;
    }

    controller.userData.selected = undefined;
  }
}

function onMouseDown(event) {
  console.log(event);
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  tempX = pointer.x;
  tempY = pointer.y;
  raycaster.setFromCamera(pointer, camera);
  let intersections = raycasterFunction(raycaster);

  if (intersections.length != 0) {
    const object = intersections[0].object;
    //console.log(object);
    if (object !== undefined) {
      //const object = controller.userData.selected;
      if (object.name === activeMesh && showVR === false) {
        rotateMeshMouse = true;
        controls.enabled = false;
        objectStartRotation = centerOfRotation.rotation.y;
      }
      if (object.name !== activeMesh) {
        object.material.emissive.b = 1;
        //object.onClick();
        //object.pressSound?.play();
      }
      if (object.pressed == "fully_pressed") {
        object.pressed = "recovering";
      } else if (object.pressed == "recovering") {
        object.pressed = "fully_pressed";
      } else {
        object.pressed = "fully_pressed";
      }
    }
  }
}

function onMouseUp(event) {
  snapshotScale = 0;
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  if (showVR === false) {
    rotateMeshMouse = false;
    controls.enabled = true;
  }
  let intersections = raycasterFunction(raycaster);
  if (intersections.length != 0) {
    const object = intersections[0].object;
    //console.log(object);
    if (object !== undefined) {
      //const object = controller.userData.selected;
      if (object.name !== activeMesh) {
        object.material.emissive.b = 0;
      }
      if (object.pressed == "fully_pressed") {
        object.pressed = "recovering";
      } else if (object.pressed == "recovering") {
        object.pressed = "fully_pressed";
      } else {
        object.pressed = "fully_pressed";
      }
    }
  }
}

function onTouchStart(event) {
  pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  if (event.touches[1] !== undefined) {
    touch1X = (event.touches[1].clientX / window.innerWidth) * 2 - 1;
    touch1Y = -(event.touches[1].clientY / window.innerHeight) * 2 + 1;
    twofingers = true;
  }
  tempX = pointer.x;
  tempY = pointer.y;
  raycaster.setFromCamera(pointer, camera);
  let intersections = raycasterFunction(raycaster);
  if (intersections.length != 0) {
    const object = intersections[0].object;
    //console.log(object);
    if (object !== undefined) {
      //const object = controller.userData.selected;
      if (
        object.name === activeMesh &&
        showVR === false &&
        event.touches[1] === undefined
      ) {
        rotateMeshTouch = true;
        controls.enabled = false;
        objectStartRotation = centerOfRotation.rotation.y;
      }
      if (
        object.name === activeMesh &&
        showVR === false &&
        event.touches[1] !== undefined
      ) {
        rotateMeshTouch = false;
        scaleMeshTouch = true;
        controls.enabled = false;
        objectStartRotation = centerOfRotation.rotation.y;
        touchStartingDist = Math.sqrt(
          (touch1X - tempX) * (touch1X - tempX) +
            (touch1Y - tempY) * (touch1Y - tempY)
        );
      }
      if (object.name !== activeMesh) {
        object.material.emissive.b = 1;
      }
      if (object.pressed == "fully_pressed") {
        object.pressed = "recovering";
      } else if (object.pressed == "recovering") {
        object.pressed = "fully_pressed";
      } else {
        object.pressed = "fully_pressed";
      }
    }
  }
}

function onTouchMove(event) {
  pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  if (event.touches[1] !== undefined) {
    touch1X = (event.touches[1].clientX / window.innerWidth) * 2 - 1;
    touch1Y = -(event.touches[1].clientY / window.innerHeight) * 2 + 1;
    twofinger = false;
  }
  if (scaleMeshTouch) {
    tempX = pointer.x;
    tempY = pointer.y;
  }
}

function onTouchEnd(event) {
  scaleMeshTouch = false;
  snapshotScale = 0;
  pointer.x = tempX;
  pointer.y = tempY;

  raycaster.setFromCamera(pointer, camera);
  if (showVR === false) {
    rotateMeshTouch = false;
    controls.enabled = true;
  }
  let intersections = raycasterFunction(raycaster);
  if (intersections.length != 0) {
    const object = intersections[0].object;
    //console.log(object);
    if (object !== undefined) {
      if (object.name !== activeMesh) {
        //const object = controller.userData.selected;
        object.material.emissive.b = 0;
      }
      if (object.pressed == "fully_pressed") {
        object.pressed = "recovering";
      } else if (object.pressed == "recovering") {
        object.pressed = "fully_pressed";
      } else {
        object.pressed = "fully_pressed";
      }
    }
  }
}

function onMouseWheel(event) {
  // pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  //pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  let intersections = raycasterFunction(raycaster);

  //console.log(intersections);
  if (intersections.length > 0) {
    const intersection = intersections[0];
    const object = intersection.object;
    if (object.name == activeMesh) {
      scaleMouseWheel = event.deltaY;
      controls.enabled = false;
    }
  }
}

function getIntersections(controller) {
  tempMatrix.identity().extractRotation(controller.matrixWorld);

  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
  let raycasterArray = [];
  raycasterArray = raycasterFunction(raycaster);
  return raycasterArray;
}

function raycasterFunction(raycaster) {
  let raycasterArray = [];
  if (consoleMesh !== undefined) {
    if (raycasterArray.length === 0 && exitGroup.visible === true) {
      raycaster.intersectObjects(exitGroup.children, false, raycasterArray);
    }
    if (raycasterArray.length === 0 && resetGroup.visible === true) {
      raycaster.intersectObjects(resetGroup.children, false, raycasterArray);
    }
    if (raycasterArray.length === 0 && gravityGroup.visible === true) {
      raycaster.intersectObjects(gravityGroup.children, false, raycasterArray);
    }
    if (raycasterArray.length === 0 && paintGroup.visible === true) {
      raycaster.intersectObjects(paintGroup.children, false, raycasterArray);
    }
    if (raycasterArray.length === 0 && consoleMesh.visible === true) {
      raycaster.intersectObjects(consoleMesh.children, false, raycasterArray);
    }
    if (raycasterArray.length > 0) {
      return raycasterArray;
    }
    if (raycasterArray.length === 0 && buttonGroup.visible === true) {
      raycaster.intersectObjects(buttonGroup.children, false, raycasterArray);
    }
    if (raycasterArray.length === 0 && menuGroup.visible === true) {
      raycaster.intersectObjects(menuGroup.children, false, raycasterArray);
    }
    if (raycasterArray.length === 0 && proteinGroup.visible === true) {
      raycaster.intersectObjects(proteinGroup.children, false, raycasterArray);
    }

    if (raycasterArray.length === 0 && activeMesh === "boat") {
      raycaster.intersectObjects(
        boundingBoxesBoat.children,
        false,
        raycasterArray
      );
    }
    if (raycasterArray.length === 0 && activeMesh === "test") {
      raycaster.intersectObjects(
        boundingBoxesTest.children,
        false,
        raycasterArray
      );
    }
    if (raycasterArray.length === 0 && activeMesh === "owl") {
      raycaster.intersectObjects(
        boundingBoxesOwl.children,
        false,
        raycasterArray
      );
    }
    if (raycasterArray.length === 0 && printerButtonGroup.visible === true) {
      raycaster.intersectObjects(
        printerButtonGroup.children,
        false,
        raycasterArray
      );
    }
    if (raycasterArray.length === 0) {
      //   raycaster.intersectObjects(ender3HotEndGroup.children, false, raycasterArray);
    }

    if (heatMapWalls) {
      if (raycasterArray.length === 0 && furnitureGroup.visible === true) {
        raycaster.intersectObjects(
          furnitureGroup.children,
          false,
          raycasterArray
        );
      }
      if (raycasterArray.length === 0 && planeGroup.visible === true) {
        raycaster.intersectObjects(planeGroup.children, false, raycasterArray);
      }
    }
    return raycasterArray;
  }
}

function intersectObjects(controller) {
  // Do not highlight when already selected

  //if (controller.userData.selected !== undefined) return;

  const line = controller.getObjectByName("line");
  if (line !== undefined) {
    const intersections = getIntersections(controller);
    if (intersections !== undefined) {
      /*    	
      if ( intersections.length > 0 ) {

					sphereInter.visible = true;
					sphereInter.position.copy( intersections[ 0 ].point );

				} else {

					sphereInter.visible = false;

				}
        */
      if (intersections.length > 0) {
        const intersection = intersections[0];
        const object = intersection.object;

        if (object.name !== activeMesh) {
          object.material.emissive.r = 0.5;
        } else {
          if (controller.name === "left") {
            boatIntersectedLeft = true;
          }
          if (controller.name === "right") {
            boatIntersectedRight = true;
          }
        }

        intersected.push(object);

        if (
          intersectedSelected === 0 &&
          controller.userData.isSelecting === true
        ) {
          isRotating = true;
          //initialRotation = centerOfRotation.rotation.y;
          //intersectedStartRot = controller.rotation.y;
          intersectedSelected = 1;
        } else if (
          intersectedSelected === 1 &&
          !controller.userData.isSelecting
        ) {
          isRotating = false;
          intersectedSelected = 0;
          line.scale.z = intersection.distance;
        } else {
          line.scale.z = intersection.distance;
        }
      } else {
        line.scale.z = 5;
      }
    }
  }
}

function cleanIntersected() {
  while (intersected.length) {
    const object = intersected.pop();
    if (object.name !== activeMesh) {
      object.material.emissive.r = 0;
    } else {
      //sets both to false, since interSectedObjects will turn it back to true on next function
      boatIntersectedLeft = false;
      boatIntersectedRight = false;
    }
  }
}

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  if (consoleMesh !== undefined) {
    const intersections = raycaster.intersectObjects(
      consoleMesh.children,
      false
    );

    //console.log(intersections);
    if (intersections.length > 0) {
      const intersection = intersections[0];
      const object = intersection.object;

      if (object.name !== activeMesh) {
        object.material.emissive.r = 0.5;
      }

      intersected.push(object);
    }
  }
}

/////////////////
//  Renderer  //
////////////////

function render(timestamp, frame) {
  //Check to see if if any buttons have been pressed on the controllers
  ThreeMeshUI.update();
  phy.doStep(timestamp);
  if (galtonBalls) {
    dropBalls();
  }

  //Checks controller buttons for input
  dollyMove();

  //Checks for raycast from the controllers
  checkIntersections();

  //Checks if balls need to be fired in balls are enabled
  if (enableBalls) {
    handleController(controller1);
    handleController(controller2);
  }

  if (button5Active) {
    handlePainter(controller1);
    handlePainter(controller2);
  }

  //Checks whether controller squeeze is pressed, for moving objects
  if (controller1.userData.isSqueezing) {
    squeezeController(controller1);
  }
  if (controller2.userData.isSqueezing) {
    squeezeController(controller2);
  }
  /*
  //Starts logFile if logFileTest is true
  if (logFileTest && endLog === 0) {
    playLog(timestamp);
  }
  //Ends logFile is endLog is true
  if (endLog) {
    endLogFunction();
  }
  
  */

  //Sends socket.emit with userArray[0]'s data to server if the user is in VR or AR
  if (renderer.xr.isPresenting === true) {
    var XRCamera = renderer.xr.getCamera();

    if (playerPhysics) {
      socket.emit("updatePos", {
        con1Pos: controller1.position,
        con1Quat: controller1.quaternion,
        con2Pos: controller2.position,
        con2Quat: controller2.quaternion,
        camPos: XRCamera.position,
        camQuat: XRCamera.quaternion,
        con1Rot: controller1.rotation,
        con2Rot: controller2.rotation,
        camRot: XRCamera.rotation,
        name: userArray[0].id,
        vr: userArray[0].vr,
        presenting: userArray[0].presenting,
        id: userArray[0].id,
        color: userArray[0].color,
      });
    }
  }

  if (renderer.xr.isPresenting === true) {
    updateMyCube();
  }

  if (frame) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    if (button4Active) {
      processMeshes(timestamp, frame);
    }
  }
  /*

    if (hitTestSourceRequested === false) {
      session.requestReferenceSpace("viewer").then(function (referenceSpace) {
        session
          .requestHitTestSource({ space: referenceSpace })
          .then(function (source) {
            hitTestSource = source;
          });
      });

      session.addEventListener("end", function () {
        hitTestSourceRequested = false;
        hitTestSource = null;
      });

      hitTestSourceRequested = true;
    }

    if (hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);

      if (hitTestResults.length) {
        const hit = hitTestResults[0];

        reticle.visible = true;
        reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
        if (calibrationMode) {
          reticle.material.color.setHex(0xff0000);
        } else if (printerMode) {
          reticle.material.color.setHex(0x00ff00);
        } else {
          reticle.material.color.setHex(0xffffff);
        }
      } else {
        reticle.visible = false;
      }
    }
  }

  //Update Stats
*/
  frameCount = frameCount + 1;
  if (frameCount >= 200) {
    FPS = Math.round(1000 / ((timestamp - timePrevFrame) / 200));
    const triangles = renderer.info.render.triangles;
    const renderLines = renderer.info.render.lines;
    console.log(renderer.info.render);
    exitText.material.dispose();
    exitText.geometry.dispose();
    scene.remove(exitText);
    exitText = createText(
      FPS + " FPS  " + triangles + " Triangles  " + renderLines + " Lines",
      0.275
    );
    exitText.position.set(1.2, 2, -2.5);
    //exitText.visible = false;
    scene.add(exitText);
    frameCount = 0;
    timePrevFrame = timestamp;
  }

  renderer.xr.updateCamera(camera);
  renderer.render(scene, camera);
  const delta = clock.getDelta();
  const elapsedTime = clock.elapsedTime;
  world.execute(delta, elapsedTime);
  if (updateRot) {
    //teleportCamera();
    updateRot = false;
  }
}
////////////////////////////////
//  Check for Intersections  //
///////////////////////////////

function checkIntersections() {
  cleanIntersected();
  intersectObjects(controller1);
  intersectObjects(controller2);

  if (enableBalls === false) {
    if (
      boatIntersectedLeft === true &&
      controller1.userData.isSelecting === true
    ) {
      allowRotationLeft = true;
    }

    if (
      boatIntersectedRight === true &&
      controller2.userData.isSelecting === true
    ) {
      allowRotationRight = true;
    }

    //Checks to see if both selecting has ended and sets controller whose trigger is still down as the new rotation starting position
    //Prevents the boat from suddenly rotating to a new position based on the previous starting position
    if (rotateMeshMouse) {
      let totalDist = tempX - pointer.x;
      centerOfRotation.rotation.y = objectStartRotation - totalDist * 5;
      socket.emit("rotateBoatToServer", {
        centerOfRotationY: centerOfRotation.rotation.y,
      });
    }
    if (rotateMeshTouch) {
      let totalDist = tempX - pointer.x;
      centerOfRotation.rotation.y = objectStartRotation - totalDist * 5;
      socket.emit("rotateBoatToServer", {
        centerOfRotationY: centerOfRotation.rotation.y,
      });
    }
    if (scaleMeshTouch) {
      if (snapshotScale === 0) {
        centerOfRotation.getWorldScale(boatStartingScale);
        snapshotScale = 1;
      }
      touchCurrentDist = Math.sqrt(
        (touch1X - tempX) * (touch1X - tempX) +
          (touch1Y - tempY) * (touch1Y - tempY)
      );

      let setScale = (touchCurrentDist - touchStartingDist) / touchStartingDist;
      let scaleLimit = boatStartingScale.x + setScale;
      if (scaleLimit <= 0.05) {
        centerOfRotation.scale.set(0.05, 0.05, 0.05);
      } else {
        centerOfRotation.scale.set(
          boatStartingScale.x + setScale,
          boatStartingScale.y + setScale,
          boatStartingScale.z + setScale
        );
      }
      socket.emit("scaleBoatToServer", centerOfRotation.scale);
    }
    if (scaleMouseWheel !== 0) {
      centerOfRotation.getWorldScale(boatStartingScale);
      let setScale = -scaleMouseWheel / 600;
      scaleMouseWheel = 0;
      let scaleLimit = boatStartingScale.x + setScale;
      if (scaleLimit <= 0.05) {
        centerOfRotation.scale.set(0.05, 0.05, 0.05);
      } else {
        centerOfRotation.scale.set(
          boatStartingScale.x + setScale,
          boatStartingScale.y + setScale,
          boatStartingScale.z + setScale
        );
      }
      // controls.enabled = true;
      socket.emit("scaleBoatToServer", centerOfRotation.scale);
    }
    if (controller1.userData.isSelecting || controller2.userData.isSelecting) {
      if (bothSelecting) {
        if (controller1.userData.isSelecting) {
          conStartPos = new THREE.Vector3();
          controller1.getWorldPosition(conStartPos);
        } else if (controller2.userData.isSelecting) {
          conStartPos = new THREE.Vector3();
          controller2.getWorldPosition(conStartPos);
        }
        bothSelecting = 0;
      }
    }

    if (controller1.userData.isSelecting && controller2.userData.isSelecting) {
      bothSelecting = true;
      if (allowRotationLeft === true || allowRotationRight === true) {
        if (snapshotScale === 0) {
          centerOfRotation.getWorldScale(boatStartingScale);
          // console.log(boatStartingScale);
          snapshotScale = 1;
        }
        conCurrentDist = controller1.position.distanceTo(controller2.position);

        let setScale = (conCurrentDist - conStartingDist) / conStartingDist;
        let scaleLimit = boatStartingScale.x + setScale;
        if (scaleLimit <= 0.05) {
          centerOfRotation.scale.set(0.05, 0.05, 0.05);
        } else {
          centerOfRotation.scale.set(
            boatStartingScale.x + setScale,
            boatStartingScale.y + setScale,
            boatStartingScale.z + setScale
          );
        }
        socket.emit("scaleBoatToServer", centerOfRotation.scale);
        allowRotationLeft = false;
        allowRotationRight = false;
      }
    } else if (allowRotationLeft) {
      controllerName = controller1.name;
      conCurrentPos = new THREE.Vector3();
      controller1.getWorldPosition(conCurrentPos);
      let xDist = conCurrentPos.x - conStartPos.x;
      let zDist = conCurrentPos.z - conStartPos.z;
      let totalDist = Math.sqrt(xDist * xDist + zDist * zDist);
      let angle = (Math.atan2(zDist, xDist) * 180) / Math.PI;
      if (angle >= 0 && angle <= 180) {
        centerOfRotation.rotation.y = objectStartRotation + totalDist * 5;
      } else {
        centerOfRotation.rotation.y = objectStartRotation - totalDist * 5;
      }
      socket.emit("rotateBoatToServer", {
        centerOfRotationY: centerOfRotation.rotation.y,
      });
    } else if (allowRotationRight) {
      if (isRotating) {
      }
      conCurrentPos = new THREE.Vector3();
      controller2.getWorldPosition(conCurrentPos);
      let xDist = conCurrentPos.x - conStartPos.x;
      let zDist = conCurrentPos.z - conStartPos.z;
      let totalDist = Math.sqrt(xDist * xDist + zDist * zDist);
      let angle = (Math.atan2(zDist, xDist) * 180) / Math.PI;
      if (angle >= 0 && angle <= 180) {
        centerOfRotation.rotation.y = objectStartRotation + totalDist * 5;
      } else {
        centerOfRotation.rotation.y = objectStartRotation - totalDist * 5;
      }
      socket.emit("rotateBoatToServer", {
        centerOfRotationY: centerOfRotation.rotation.y,
      });
    }
  }
}

///////////////////////////
//  Initialize Physics  //
/////////////////////////

async function initPhysics() {
  phy.init({
    type: "RAPIER",
    worker: true,
    scene: scene,
    callback: startDemo,
    path: "/build/",
  });

  if (enablePhysics) {
    //Add cubeGroup
    if (playerPhysics) {
      if (cubeGroup === undefined) {
        const geometryCube = new THREE.BoxGeometry(0.6, 1, 0.15);
        const geometryController = new THREE.BoxGeometry(0.08, 0.15, 0.08);

        for (let i = 0; i < clients; i++) {
          const material = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.85,
          });
          let colorRandom = Math.random() * 0xffffff;
          material.color.set(colorRandom);
          const cube = new THREE.Mesh(geometryCube, material);
          phy.add({
            name: "cube" + i,
            type: "mesh",
            mesh: cube,
            mass: 0,
            friction: 0,
            restitution: 0,
            pos: [1000, i, i],
          });

          let index1 = 2 * i;
          let index2 = 2 * i + 1;

          const controller1 = new THREE.Mesh(geometryController, material);
          phy.add({
            name: "controller" + index1,
            type: "mesh",
            mesh: controller1,
            mass: 0,
            friction: 0,
            restitution: 0,
            pos: [900, 2 * i, 2 * i],
          });

          const controller2 = new THREE.Mesh(geometryController, material);
          phy.add({
            name: "controller" + index2,
            type: "mesh",
            mesh: controller2,
            mass: 0,
            friction: 0,
            restitution: 0,
            pos: [900, 2 * i + 1, 2 * i + 1],
          });
        }
      }
    }
  }
}

/////////////////////
//  Load Buttons  //
///////////////////

function loadButtons() {
  const consoleGeometry = new THREE.BoxGeometry(0, 0, 0);
  const consoleMaterial = new THREE.MeshPhongMaterial({ color: 0x595959 });
  consoleMesh = new THREE.Mesh(consoleGeometry, consoleMaterial);
  consoleMesh.position.set(0, 0, 0);
  scene.add(consoleMesh);
  consoleMesh.visible = false;

  //Menu Group
  button1 = makeButtonMesh(0.6, 0.4, 0.1, selectedColor);
  const button1Text = createText("Protein", 0.1);
  button1.add(button1Text);
  button1Text.position.set(0, 0, 0.052);
  button1.rotation.set(0, -Math.PI / 2, 0);
  button1.position.set(1.5, 1, 0.35);

  menuGroup.add(button1);

  // createXRButton(menuGroup, new THREE.Vector3(0.6, 0.4, 0.1), 'Protein', new THREE.Vector3(1.5, 1, 0.7), new THREE.Euler(0, -Math.PI/2, 0, 'XYZ'), selectedColor, function() {
  //   button1Pressed();
  //   socket.emit("button1ToServer", "");
  //});

  button2 = makeButtonMesh(0.6, 0.4, 0.1, selectedColor);
  const button2Text = createText("Galton Board", 0.1);
  button2.add(button2Text);
  //stlButtonText.rotation.y = -Math.PI;
  button2Text.position.set(0, 0, 0.052);
  button2.rotation.set(0, -Math.PI / 2, 0);
  button2.position.set(1.5, 1, 1.05);

  menuGroup.add(button2);

  button3 = makeButtonMesh(0.6, 0.4, 0.1, selectedColor);
  const button3Text = createText("3D Lab", 0.1);
  button3.add(button3Text);
  //stlButtonText.rotation.y = -Math.PI;
  button3Text.position.set(0, 0, 0.052);
  button3.rotation.set(0, -Math.PI / 2, 0);
  button3.position.set(1.5, 1, 1.75);

  menuGroup.add(button3);

  button4 = makeButtonMesh(0.6, 0.4, 0.1, selectedColor);
  const button4Text = createText("Ballshooter", 0.1);
  button4.add(button4Text);
  //stlButtonText.rotation.y = -Math.PI;
  button4Text.position.set(0, 0, 0.09);
  button4.rotation.set(0, -Math.PI / 2, 0);
  button4.position.set(1.5, 1, 2.45);

  menuGroup.add(button4);

  button5 = makeButtonMesh(0.6, 0.4, 0.1, selectedColor);
  const button5Text = createText("Line Painter", 0.1);
  button5.add(button5Text);
  //stlButtonText.rotation.y = -Math.PI;
  button5Text.position.set(0, 0, 0.09);
  button5.rotation.set(0, -Math.PI / 2, 0);
  button5.position.set(1.5, 1, 3.15);

  menuGroup.add(button5);

  scene.add(menuGroup);

  //Exit Button Group

  exitButton = makeButtonMesh(0.8, 0.4, 0.1, selectedColor);
  const exitButtonText = createText("Return to Menu", 0.1);
  exitButton.add(exitButtonText);
  //stlButtonText.rotation.y = -Math.PI;
  exitButtonText.position.set(0, 0, 0.07);
  exitButton.rotation.set(0, -Math.PI / 2, 0);
  exitButton.position.set(1.5, 1.4, 0);

  exitGroup.add(exitButton);

  scene.add(exitGroup);
  exitGroup.visible = false;

  resetButton = makeButtonMesh(0.8, 0.4, 0.1, selectedColor);
  const resetButtonText = createText("Reset Balls", 0.1);
  resetButton.add(resetButtonText);
  //stlButtonText.rotation.y = -Math.PI;
  resetButtonText.position.set(0, 0, 0.07);
  resetButton.rotation.set(0, -Math.PI / 2, 0);
  resetButton.position.set(1.5, 2.1, 0);

  resetGroup.add(resetButton);

  scene.add(resetGroup);
  resetGroup.visible = false;

  gravityButton = makeButtonMesh(0.8, 0.4, 0.1, selectedColor);
  const gravityButtonText = createText("Toggle Gravity", 0.1);
  gravityButton.add(gravityButtonText);
  //stlButtonText.rotation.y = -Math.PI;
  gravityButtonText.position.set(0, 0, 0.07);
  gravityButton.rotation.set(0, -Math.PI / 2, 0);
  gravityButton.position.set(1.5, 1.9, 0);

  gravityGroup.add(gravityButton);

  occlusionButton = makeButtonMesh(0.8, 0.4, 0.1, selectedColor);
  const occlusionButtonText = createText("Toggle Occlusion", 0.1);
  occlusionButton.add(occlusionButtonText);
  //stlButtonText.rotation.y = -Math.PI;
  occlusionButtonText.position.set(0, 0, 0.07);
  occlusionButton.rotation.set(0, -Math.PI / 2, 0);
  occlusionButton.position.set(1.5, 2.4, 0);

  gravityGroup.add(occlusionButton);

  scene.add(gravityGroup);
  gravityGroup.visible = false;

  clearPaintButton = makeButtonMesh(0.8, 0.4, 0.1, selectedColor);
  const clearPaintButtonText = createText("Clear Paint", 0.1);
  clearPaintButton.add(clearPaintButtonText);
  //stlButtonText.rotation.y = -Math.PI;
  clearPaintButtonText.position.set(0, 0, 0.07);
  clearPaintButton.rotation.set(0, -Math.PI / 2, 0);
  clearPaintButton.position.set(1.5, 1.9, 0);

  paintGroup.add(clearPaintButton);

  scene.add(paintGroup);
  paintGroup.visible = false;
  
    scene.add(occlusionGroup);
  occlusionGroup.visible = false;

    scene.add(shadowGroup);
  shadowGroup.visible = false;

  ///Add button Actions

  world.registerComponent(Object3D2).registerComponent(Button);

  world.registerSystem(ButtonSystem, { renderer: renderer, camera: camera });

  const button1Action = function () {
    button1Pressed();
    socket.emit("button1ToServer", "");
  };

  const button1Entity = world.createEntity();
  button1Entity.addComponent(Object3D2, { object: button1 });
  button1Entity.addComponent(Button, {
    action: button1Action,
  });

  const button2Action = function () {
    button2Pressed();
    socket.emit("button2ToServer", "");
  };

  const button2Entity = world.createEntity();
  button2Entity.addComponent(Object3D2, { object: button2 });
  button2Entity.addComponent(Button, {
    action: button2Action,
  });

  const button3Action = function () {
    button3Pressed();
    socket.emit("button3ToServer", "");
  };

  const button3Entity = world.createEntity();
  button3Entity.addComponent(Object3D2, { object: button3 });
  button3Entity.addComponent(Button, {
    action: button3Action,
  });

  const button4Action = function () {
    button4Pressed();
    socket.emit("button4ToServer", "");
  };

  const button4Entity = world.createEntity();
  button4Entity.addComponent(Object3D2, { object: button4 });
  button4Entity.addComponent(Button, {
    action: button4Action,
  });

  const button5Action = function () {
    button5Pressed();
    socket.emit("button5ToServer", "");
  };

  const button5Entity = world.createEntity();
  button5Entity.addComponent(Object3D2, { object: button5 });
  button5Entity.addComponent(Button, {
    action: button5Action,
  });

  const exitButtonAction = function () {
    exitButtonPressed();
    socket.emit("exitButtonToServer", "");
  };

  const exitButtonEntity = world.createEntity();
  exitButtonEntity.addComponent(Object3D2, { object: exitButton });
  exitButtonEntity.addComponent(Button, {
    action: exitButtonAction,
  });

  const resetButtonAction = function () {
    resetButtonPressed();
    socket.emit("resetButtonToServer", "");
  };

  const resetButtonEntity = world.createEntity();
  resetButtonEntity.addComponent(Object3D2, { object: resetButton });
  resetButtonEntity.addComponent(Button, {
    action: resetButtonAction,
  });

  const gravityButtonAction = function () {
    gravityButtonPressed();
    socket.emit("gravityButtonToServer", "");
  };

  const gravityButtonEntity = world.createEntity();
  gravityButtonEntity.addComponent(Object3D2, { object: gravityButton });
  gravityButtonEntity.addComponent(Button, {
    action: gravityButtonAction,
  });

  const clearPaintButtonAction = function () {
    clearPaintButtonPressed();
    socket.emit("clearPaintButtonToServer", "");
  };

  const clearPaintButtonEntity = world.createEntity();
  clearPaintButtonEntity.addComponent(Object3D2, { object: clearPaintButton });
  clearPaintButtonEntity.addComponent(Button, {
    action: clearPaintButtonAction,
  });

  const occlusionButtonAction = function () {
    occlusionButtonPressed();
    socket.emit("occlusionButtonToServer", "");
  };

  const occlusionButtonEntity = world.createEntity();
  occlusionButtonEntity.addComponent(Object3D2, { object: occlusionButton });
  occlusionButtonEntity.addComponent(Button, {
    action: occlusionButtonAction,
  });

  ///////////
  // 3d LAB buttons and actions
  ////////

  stlButton = makeButtonMesh(0.08, 0.12, 0.2, selectedColor);
  const stlButtonText = createText("STL", 0.04);
  stlButton.add(stlButtonText);
  stlButtonText.rotation.y = -Math.PI / 2;
  stlButtonText.position.set(-0.041, 0, 0.0);
  stlButton.rotation.set(0, 0, -Math.PI / 4);
  stlButton.position.set(1, 0.88, 1.2);
  console.log(stlButton);

  wireframeButton = makeButtonMesh(0.08, 0.12, 0.2, unselectedColor);
  const wireframeButtonText = createText("Wireframe", 0.04);
  wireframeButton.add(wireframeButtonText);
  wireframeButtonText.rotation.y = -Math.PI / 2;
  wireframeButtonText.position.set(-0.041, 0, 0);
  wireframeButton.rotation.set(0, 0, -Math.PI / 4);
  wireframeButton.position.set(1, 0.88, 1.6);

  gcodeButton = makeButtonMesh(0.08, 0.12, 0.2, unselectedColor);
  const gcodeButtonText = createText("G-code", 0.04);
  gcodeButton.add(gcodeButtonText);
  gcodeButtonText.rotation.y = -Math.PI / 2;
  gcodeButtonText.position.set(-0.041, 0, 0);
  gcodeButton.rotation.set(0, 0, -Math.PI / 4);
  gcodeButton.position.set(1, 0.88, 2.0);

  gcodeExtrudeButton = makeButtonMesh(0.08, 0.12, 0.2, unselectedColor);
  const gcodeExtrudeButtonText = createText("Extrude", 0.04);
  gcodeExtrudeButton.add(gcodeExtrudeButtonText);
  gcodeExtrudeButtonText.rotation.y = -Math.PI / 2;
  gcodeExtrudeButtonText.position.set(-0.041, 0, 0);
  gcodeExtrudeButton.rotation.set(0, 0, -Math.PI / 4);
  gcodeExtrudeButton.position.set(0.89, 0.76, 1.86);

  gcodeTravelButton = makeButtonMesh(0.08, 0.12, 0.2, unselectedColor);
  const gcodeTravelButtonText = createText("Travel", 0.04);
  gcodeTravelButton.add(gcodeTravelButtonText);
  gcodeTravelButtonText.rotation.y = -Math.PI / 2;
  gcodeTravelButtonText.position.set(-0.041, 0, 0);
  gcodeTravelButton.rotation.set(0, 0, -Math.PI / 4);
  gcodeTravelButton.position.set(0.78, 0.64, 1.86);
  //consoleMesh.add(gcodeTravelButton);

  gcodeSupportButton = makeButtonMesh(0.08, 0.12, 0.2, unselectedColor);
  const gcodeSupportButtonText = createText("Supports", 0.04);
  gcodeSupportButton.add(gcodeSupportButtonText);
  gcodeSupportButtonText.rotation.y = -Math.PI / 2;
  gcodeSupportButtonText.position.set(-0.041, 0, 0);
  gcodeSupportButton.rotation.set(0, 0, -Math.PI / 4);
  gcodeSupportButton.position.set(0.89, 0.76, 2.14);

  gcodeTreeButton = makeButtonMesh(0.08, 0.12, 0.2, unselectedColor);
  const gcodeTreeButtonText = createText("Tree", 0.04);
  gcodeTreeButton.add(gcodeTreeButtonText);
  gcodeTreeButtonText.rotation.y = -Math.PI / 2;
  gcodeTreeButtonText.position.set(-0.041, 0, 0);
  gcodeTreeButton.rotation.set(0, 0, -Math.PI / 4);
  gcodeTreeButton.position.set(0.78, 0.64, 2.14);

  gcodeLayerPlus = makeButtonMesh(0.08, 0.12, 0.24, unselectedColor);
  const gcodeLayerPlusText = createText("+1 Layer", 0.04);
  gcodeLayerPlus.add(gcodeLayerPlusText);
  gcodeLayerPlusText.rotation.y = -Math.PI / 2;
  gcodeLayerPlusText.position.set(-0.041, 0, 0);
  gcodeLayerPlus.rotation.set(0, 0, -Math.PI / 4);
  gcodeLayerPlus.position.set(1, 0.88, 2.42);

  gcodeLayerToggle = makeButtonMesh(0.08, 0.12, 0.24, unselectedColor);
  const gcodeLayerToggleText = createText("Toggle Layer", 0.04);
  gcodeLayerToggle.add(gcodeLayerToggleText);
  gcodeLayerToggleText.rotation.y = -Math.PI / 2;
  gcodeLayerToggleText.position.set(-0.041, 0, 0);
  gcodeLayerToggle.rotation.set(0, 0, -Math.PI / 4);
  gcodeLayerToggle.position.set(1, 1, 2.0);
  gcodeLayerToggle.position.set(0.89, 0.76, 2.42);

  gcodeLayerMinus = makeButtonMesh(0.08, 0.12, 0.24, unselectedColor);
  const gcodeLayerMinusText = createText("-1 Layer", 0.04);
  gcodeLayerMinus.add(gcodeLayerMinusText);
  gcodeLayerMinusText.rotation.y = -Math.PI / 2;
  gcodeLayerMinusText.position.set(-0.041, 0, 0);
  gcodeLayerMinus.rotation.set(0, 0, -Math.PI / 4);
  gcodeLayerMinus.position.set(1, 1, 2.0);
  gcodeLayerMinus.position.set(0.78, 0.64, 2.42);

  coverButton = makeButtonMesh(0.08, 0.12, 0.24, unselectedColor);
  const coverButtonText = createText("Cover", 0.04);
  coverButton.add(coverButtonText);
  coverButtonText.rotation.y = -Math.PI / 2;
  coverButtonText.position.set(-0.041, 0, 0);
  coverButton.rotation.set(0, 0, -Math.PI / 3.2);
  coverButton.position.set(1.2, 0.63, 3.57);

  fansButton = makeButtonMesh(0.08, 0.12, 0.24, unselectedColor);
  const fansButtonText = createText("Fans", 0.04);
  fansButton.add(fansButtonText);
  fansButtonText.rotation.y = -Math.PI / 2;
  fansButtonText.position.set(-0.041, 0, 0);
  fansButton.rotation.set(0, 0, -Math.PI / 3.2);
  fansButton.position.set(1, 1, 2.0);
  fansButton.position.set(1.0, 0.49, 3.57);

  heatsinkButton = makeButtonMesh(0.08, 0.12, 0.24, unselectedColor);
  const heatsinkButtonText = createText("Heatsink", 0.04);
  heatsinkButton.add(heatsinkButtonText);
  heatsinkButtonText.rotation.y = -Math.PI / 2;
  heatsinkButtonText.position.set(-0.041, 0, 0);
  heatsinkButton.rotation.set(0, 0, -Math.PI / 3.2);
  heatsinkButton.position.set(1, 1, 2.0);
  heatsinkButton.position.set(0.8, 0.35, 3.57);

  buttonGroup.add(stlButton);
  buttonGroup.add(wireframeButton);
  buttonGroup.add(gcodeButton);
  buttonGroup.add(gcodeExtrudeButton);
  buttonGroup.add(gcodeTreeButton);
  buttonGroup.add(gcodeTravelButton);
  buttonGroup.add(gcodeSupportButton);
  buttonGroup.add(gcodeLayerPlus);
  buttonGroup.add(gcodeLayerToggle);
  buttonGroup.add(gcodeLayerMinus);
  scene.add(buttonGroup);
  buttonGroup.visible = false;

  printerButtonGroup.add(coverButton);
  printerButtonGroup.add(fansButton);
  printerButtonGroup.add(heatsinkButton);
  scene.add(printerButtonGroup);
  printerButtonGroup.visible = false;

  hideRoomButton = makeButtonMesh(0.1, 0.2, 0.4, unselectedColor);
  const hideRoomButtonText = createText("Toggle Room", 0.06);
  hideRoomButton.add(hideRoomButtonText);
  hideRoomButtonText.rotation.y = -Math.PI / 2;
  hideRoomButtonText.position.set(-0.051, 0, 0);
  hideRoomButton.rotation.set(0, -Math.PI / 2, 0);
  hideRoomButton.position.set(1.6, 1, 4.5);
  consoleMesh.add(hideRoomButton);

  toggleBoatButton = makeButtonMesh(0.1, 0.2, 0.4, unselectedColor);
  const toggleBoatButtonText = createText("Toggle Boat", 0.06);
  toggleBoatButton.add(toggleBoatButtonText);
  toggleBoatButtonText.rotation.y = -Math.PI / 2;
  toggleBoatButtonText.position.set(-0.051, 0, 0);
  toggleBoatButton.rotation.set(0, -Math.PI / 2, 0);
  toggleBoatButton.position.set(2.2, 1, 4.5);
  consoleMesh.add(toggleBoatButton);

  toggleTestButton = makeButtonMesh(0.1, 0.2, 0.4, unselectedColor);
  const toggleTestButtonText = createText("Overhangs", 0.06);
  toggleTestButton.add(toggleTestButtonText);
  toggleTestButtonText.rotation.y = -Math.PI / 2;
  toggleTestButtonText.position.set(-0.051, 0, 0);
  toggleTestButton.rotation.set(0, -Math.PI / 2, 0);
  toggleTestButton.position.set(2.2, 1.3, 4.5);
  consoleMesh.add(toggleTestButton);

  toggleOwlButton = makeButtonMesh(0.1, 0.2, 0.4, unselectedColor);
  const toggleOwlButtonText = createText("Toggle Owl", 0.06);
  toggleOwlButton.add(toggleOwlButtonText);
  toggleOwlButtonText.rotation.y = -Math.PI / 2;
  toggleOwlButtonText.position.set(-0.051, 0, 0);
  toggleOwlButton.rotation.set(0, -Math.PI / 2, 0);
  toggleOwlButton.position.set(2.2, 1.6, 4.5);
  consoleMesh.add(toggleOwlButton);

  togglePrinterButton = makeButtonMesh(0.1, 0.2, 0.4, unselectedColor);
  const togglePrinterButtonText = createText("Toggle Printer", 0.06);
  togglePrinterButton.add(togglePrinterButtonText);
  togglePrinterButtonText.rotation.y = -Math.PI / 2;
  togglePrinterButtonText.position.set(-0.051, 0, 0);
  togglePrinterButton.rotation.set(0, -Math.PI / 2, 0);
  togglePrinterButton.position.set(1.0, 1, 4.5);
  consoleMesh.add(togglePrinterButton);

  togglePrinterOnButton = makeButtonMesh(0.1, 0.2, 0.4, unselectedColor);
  const togglePrinterOnButtonText = createText("Start Printer", 0.06);
  togglePrinterOnButton.add(togglePrinterOnButtonText);
  togglePrinterOnButtonText.rotation.y = -Math.PI / 2;
  togglePrinterOnButtonText.position.set(-0.051, 0, 0);
  togglePrinterOnButton.rotation.set(0, -Math.PI / 2, 0);
  togglePrinterOnButton.position.set(1.0, 1.3, 4.5);
  consoleMesh.add(togglePrinterOnButton);

  pausePrinterButton = makeButtonMesh(0.1, 0.2, 0.4, unselectedColor);
  const pausePrinterButtonText = createText("Pause Printer", 0.06);
  pausePrinterButton.add(pausePrinterButtonText);
  pausePrinterButtonText.rotation.y = -Math.PI / 2;
  pausePrinterButtonText.position.set(-0.051, 0, 0);
  pausePrinterButton.rotation.set(0, -Math.PI / 2, 0);
  pausePrinterButton.position.set(1.0, 1.6, 4.5);
  consoleMesh.add(pausePrinterButton);

  togglePhysicsButton = makeButtonMesh(0.1, 0.2, 0.4, unselectedColor);
  const togglePhysicsButtonText = createText("Toggle Physics", 0.06);
  togglePhysicsButton.add(togglePhysicsButtonText);
  togglePhysicsButtonText.rotation.y = -Math.PI / 2;
  togglePhysicsButtonText.position.set(-0.051, 0, 0);
  togglePhysicsButton.rotation.set(0, -Math.PI / 2, 0);
  togglePhysicsButton.position.set(0.4, 1, 4.5);
  if (enablePhysics) {
    consoleMesh.add(togglePhysicsButton);
  }

  toggleGuideButton = makeButtonMesh(0.1, 0.2, 0.4, unselectedColor);
  const toggleGuideButtonText = createText("Toggle Guide", 0.06);
  toggleGuideButton.add(toggleGuideButtonText);
  toggleGuideButtonText.rotation.y = -Math.PI / 2;
  toggleGuideButtonText.position.set(-0.051, 0, 0);
  toggleGuideButton.rotation.set(0, -Math.PI / 2, 0);
  toggleGuideButton.position.set(-0.2, 1, 4.5);
  if (enableGuide) {
    consoleMesh.add(toggleGuideButton);
  }

  pauseGuideButton = makeButtonMesh(0.1, 0.2, 0.4, unselectedColor);
  const pauseGuideButtonText = createText("Pause Guide", 0.06);
  pauseGuideButton.add(pauseGuideButtonText);
  pauseGuideButtonText.rotation.y = -Math.PI / 2;
  pauseGuideButtonText.position.set(-0.051, 0, 0);
  pauseGuideButton.rotation.set(0, -Math.PI / 2, 0);
  pauseGuideButton.position.set(-0.2, 1.3, 4.5);
  if (enableGuide) {
    consoleMesh.add(pauseGuideButton);
  }

  world.registerComponent(Object3D2).registerComponent(Button);

  world.registerSystem(ButtonSystem, { renderer: renderer, camera: camera });

  const coverAction = function () {
    coverButtonPressed();
    socket.emit("coverButtonToServer", "");
  };
  const fansAction = function () {
    fansButtonPressed();
    socket.emit("fansButtonToServer", "");
  };
  const heatsinkAction = function () {
    heatsinkButtonPressed();
    socket.emit("heatsinkButtonToServer", "");
  };
  const coverEntity = world.createEntity();
  coverEntity.addComponent(Object3D2, { object: coverButton });
  coverEntity.addComponent(Button, {
    action: coverAction,
  });

  const fansEntity = world.createEntity();
  fansEntity.addComponent(Object3D2, { object: fansButton });
  fansEntity.addComponent(Button, {
    action: fansAction,
  });

  const heatsinkEntity = world.createEntity();
  heatsinkEntity.addComponent(Object3D2, { object: heatsinkButton });
  heatsinkEntity.addComponent(Button, {
    action: heatsinkAction,
  });

  const stlAction = function () {
    stlButtonPressed();
    socket.emit("stlButtonToServer", "");
  };

  const stlEntity = world.createEntity();
  stlEntity.addComponent(Object3D2, { object: stlButton });
  stlEntity.addComponent(Button, {
    action: stlAction,
  });

  const wireframeAction = function () {
    wireframeButtonPressed();
    socket.emit("wireframeButtonToServer", "");
  };

  const wireframeEntity = world.createEntity();
  wireframeEntity.addComponent(Object3D2, { object: wireframeButton });
  wireframeEntity.addComponent(Button, {
    action: wireframeAction,
  });

  const gcodeAction = function () {
    gcodeButtonPressed();
    console.log(gcodeMeshBoatParent);
    socket.emit("gcodeButtonToServer", "");
  };

  const gcodeExtrudeAction = function () {
    gcodeExtrudeButtonPressed();
    socket.emit("gcodeExtrudeButtonToServer", "");
  };

  const gcodeTravelAction = function () {
    gcodeTravelButtonPressed();
    socket.emit("gcodeTravelButtonToServer", "");
  };

  const gcodeSupportAction = function () {
    gcodeSupportButtonPressed();
    socket.emit("gcodeSupportButtonToServer", "");
  };

  const gcodeTreeAction = function () {
    gcodeTreeButtonPressed();
    socket.emit("gcodeTreeButtonToServer", "");
  };

  const gcodeEntity = world.createEntity();
  gcodeEntity.addComponent(Object3D2, { object: gcodeButton });
  gcodeEntity.addComponent(Button, {
    action: gcodeAction,
  });

  const gcodeExtrudeEntity = world.createEntity();
  gcodeExtrudeEntity.addComponent(Object3D2, { object: gcodeExtrudeButton });
  gcodeExtrudeEntity.addComponent(Button, {
    action: gcodeExtrudeAction,
  });

  const gcodeTravelEntity = world.createEntity();
  gcodeTravelEntity.addComponent(Object3D2, { object: gcodeTravelButton });
  gcodeTravelEntity.addComponent(Button, {
    action: gcodeTravelAction,
  });

  const gcodeSupportEntity = world.createEntity();
  gcodeSupportEntity.addComponent(Object3D2, { object: gcodeSupportButton });
  gcodeSupportEntity.addComponent(Button, {
    action: gcodeSupportAction,
  });

  const gcodeTreeEntity = world.createEntity();
  gcodeTreeEntity.addComponent(Object3D2, { object: gcodeTreeButton });
  gcodeTreeEntity.addComponent(Button, {
    action: gcodeTreeAction,
  });

  const gcodeLayerPlusAction = function () {
    gcodeLayerPlusPressed();
    socket.emit("gcodeLayerPlusActionToServer", "");
  };

  const gcodeLayerToggleAction = function () {
    gcodeLayerTogglePressed();
    socket.emit("gcodeLayerToggleActionToServer", "");
  };

  const gcodeLayerMinusAction = function () {
    gcodeLayerMinusPressed();
    socket.emit("gcodeLayerMinusActionToServer", "");
  };

  const gcodeLayerPlusEntity = world.createEntity();
  gcodeLayerPlusEntity.addComponent(Object3D2, { object: gcodeLayerPlus });
  gcodeLayerPlusEntity.addComponent(Button, {
    action: gcodeLayerPlusAction,
  });

  const gcodeLayerToggleEntity = world.createEntity();
  gcodeLayerToggleEntity.addComponent(Object3D2, { object: gcodeLayerToggle });
  gcodeLayerToggleEntity.addComponent(Button, {
    action: gcodeLayerToggleAction,
  });

  const gcodeLayerMinusEntity = world.createEntity();
  gcodeLayerMinusEntity.addComponent(Object3D2, { object: gcodeLayerMinus });
  gcodeLayerMinusEntity.addComponent(Button, {
    action: gcodeLayerMinusAction,
  });

  const hideRoomAction = function () {
    hideRoomButtonPressed();
    socket.emit("hideRoomButtonToServer", "");
  };

  const hideRoomEntity = world.createEntity();
  hideRoomEntity.addComponent(Object3D2, { object: hideRoomButton });
  hideRoomEntity.addComponent(Button, {
    action: hideRoomAction,
  });

  const toggleBoatAction = function () {
    toggleBoat();
    socket.emit("toggleBoatToServer", "");
  };

  const toggleTestAction = function () {
    toggleTest();
    socket.emit("toggleTestToServer", "");
  };

  const toggleOwlAction = function () {
    toggleOwl();
    socket.emit("toggleOwlToServer", "");
  };

  const toggleBoatEntity = world.createEntity();
  toggleBoatEntity.addComponent(Object3D2, { object: toggleBoatButton });
  toggleBoatEntity.addComponent(Button, {
    action: toggleBoatAction,
  });

  const toggleTestEntity = world.createEntity();
  toggleTestEntity.addComponent(Object3D2, { object: toggleTestButton });
  toggleTestEntity.addComponent(Button, {
    action: toggleTestAction,
  });

  const toggleOwlEntity = world.createEntity();
  toggleOwlEntity.addComponent(Object3D2, { object: toggleOwlButton });
  toggleOwlEntity.addComponent(Button, {
    action: toggleOwlAction,
  });

  const togglePrinterAction = function () {
    togglePrinter();
    if (lineGroup.visible === false) {
      // lineGroup.visible = true;
      // furnitureGroup.visible = true;
    } else {
      // lineGroup.visible = false;
      // furnitureGroup.visible = false;
    }
    socket.emit("togglePrinterToServer", "");
  };

  const togglePrinterEntity = world.createEntity();
  togglePrinterEntity.addComponent(Object3D2, { object: togglePrinterButton });
  togglePrinterEntity.addComponent(Button, {
    action: togglePrinterAction,
  });

  const togglePrinterOnAction = function () {
    if (!printing) {
      togglePrinterOn(0);
      socket.emit("togglePrinterOnToServer", 0);
    }
  };

  const togglePrinterOnEntity = world.createEntity();
  togglePrinterOnEntity.addComponent(Object3D2, {
    object: togglePrinterOnButton,
  });
  togglePrinterOnEntity.addComponent(Button, {
    action: togglePrinterOnAction,
  });

  const pausePrinterAction = function () {
    pausePrinter();
    socket.emit("pausePrinterToServer", "");
  };

  const pausePrinterEntity = world.createEntity();
  pausePrinterEntity.addComponent(Object3D2, {
    object: pausePrinterButton,
  });
  pausePrinterEntity.addComponent(Button, {
    action: pausePrinterAction,
  });

  const togglePhysicsAction = function () {
    togglePhysics();
    socket.emit("togglePhysicsToServer", "");
  };

  const togglePhysicsEntity = world.createEntity();
  togglePhysicsEntity.addComponent(Object3D2, { object: togglePhysicsButton });
  togglePhysicsEntity.addComponent(Button, {
    action: togglePhysicsAction,
  });

  const toggleGuideAction = function () {
    toggleGuide();
    tourGuide = 1;
    socket.emit("toggleGuideToServer", "");
    //socket.emit("togglePhysicsToServer", "");
  };

  const toggleGuideEntity = world.createEntity();
  toggleGuideEntity.addComponent(Object3D2, { object: toggleGuideButton });
  toggleGuideEntity.addComponent(Button, {
    action: toggleGuideAction,
  });

  const pauseGuideAction = function () {
    pauseGuide();
    //tourGuide = 1;
    socket.emit("pauseGuideToServer", "");
  };

  const pauseGuideEntity = world.createEntity();
  pauseGuideEntity.addComponent(Object3D2, { object: pauseGuideButton });
  pauseGuideEntity.addComponent(Button, {
    action: pauseGuideAction,
  });
}

///////////////////////////
//  Load Scene Objects  //
//////////////////////////

function loadScene() {
  //Load scene

  const loader = new THREE.ObjectLoader();
  loader.load(
    // resource URL
    //"home.json",
    "3dPrinterLab_no_ceiling.json",
    //"labmesh.json",
    function (obj) {
      for (let i = 0; i < obj.children.length; i++) {
        if (obj.children[i] instanceof THREE.Mesh) {
          //console.log(obj.children[i]);
          if (obj.children[i].geometry.type == "BoxGeometry") {
            if (obj.children[i].geometry.parameters.height == 0) {
              //console.log(obj.children[i]);
              let data = {
                width: obj.children[i].geometry.parameters.width,
                length: obj.children[i].geometry.parameters.height,
                height: obj.children[i].geometry.parameters.depth,
                color: obj.children[i].material.color,
                transparent: obj.children[i].material.transparent,
                opacity: obj.children[i].material.opacity,
                matrix: obj.children[i].matrix,
                name: obj.children[i].name,
              };
              addPlaneFromServer(data);
            } else {
              //This first else statement sends furniture as "BoxGeometry"
              let data = {
                geometry: obj.children[i].geometry,
                width: obj.children[i].geometry.parameters.width,
                length: obj.children[i].geometry.parameters.height,
                height: obj.children[i].geometry.parameters.depth,
                color: obj.children[i].material.color,
                transparent: obj.children[i].material.transparent,
                opacity: obj.children[i].material.opacity,
                matrix: obj.children[i].matrix,
                name: obj.children[i].name,
              };
              addMeshDetectionJSON(data);
            }
          } else {
            //this second statement sends the "BufferGeometry" for the depth wireframe
            let data = {
              geometry: obj.children[i].geometry,
              color: obj.children[i].material.color,
              transparent: obj.children[i].material.transparent,
              opacity: obj.children[i].material.opacity,
              matrix: obj.children[i].matrix,
              name: obj.children[i].name,
            };
            addMeshDetectionJSON(data);
          }
        }
      }

      //    baseReferenceSpace = renderer.xr.getReferenceSpace();
      //scene.background = null;
      //planes = new XRPlanes(renderer);
      // planeGroup.add(planes);
      //  scene.add(obj);
      furnitureGroup.visible = false;
      lineGroup.visible = false;
    },

    // onProgress callback

    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  const STLloader = new STLLoader(loadingManager);
  STLloader.load(
    //"https://cdn.glitch.global/5f925a94-41ce-401a-9a3a-12fb19a7ca42/3DBenchy.stl?v=1691594384628",
    "https://cdn.glitch.global/004a9581-855e-468e-a7ff-af67b084fe16/SITE%202024%20Logo.stl?v=1710870002120",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x099966,
        specular: 0x494949,
        shininess: 200,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      siteLogo = new THREE.Mesh(geometry, material);
      siteLogo.position.x = 1.75;
      siteLogo.position.y = 1.5;
      siteLogo.position.z = 1.75;
      siteLogo.rotation.set(0, -Math.PI / 2, 0);
      siteLogo.scale.set(0.02, 0.02, 0.02);
      scene.add(siteLogo);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  const gltfloader = new GLTFLoader();
  gltfloader.load(
    "https://cdn.glitch.global/af53d743-7434-438c-b1cc-1197d824534b/Prot.gltf?v=1725459391773",
    //"https://cdn.glitch.me/4dee99f4-3b27-47bf-ab5c-24e04d8e18f5/4IHF-ribbon-secondary-vis_NIH3D.glb?v=1709753333428",
    //"https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/realistic_human_heart.glb?v=1711911660645",
    //"https://cdn.glitch.me/b3d90d45-9439-4d12-b6ad-1472ccec8903/pig_skull.glb?v=1711912161454",
    //"https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/6604d154d32ccf39d49d6f2d.glb?v=1712082602019",
    //"https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/rpm-avatar-vr-1.glb?v=1712083574534",
    async function (gltf) {
      proteinModel = gltf.scene;

      // wait until the model can be added to the scene without blocking due to shader compilation

      await renderer.compileAsync(proteinModel, camera, scene);
      proteinModel.scale.set(0.02, 0.02, 0.02);
      //proteinModel.position.y = -0.5;
      //model.position.y = 1.5;

      const boundingBox = new THREE.Box3();
      boundingBox.setFromObject(proteinModel);

      var size = new THREE.Vector3();
      boundingBox.getSize(size);

      var boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
      var boxMaterial = new THREE.MeshLambertMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

      var boundingBoxCenter = new THREE.Vector3();
      boundingBox.getCenter(boundingBoxCenter);
      boxMesh.position.copy(boundingBoxCenter);
      boxMesh.add(proteinModel);
      boxMesh.name = "protein";

      proteinGroup.add(boxMesh);
      proteinModel.rotation.set(0, -Math.PI / 2, 0);

      centerOfRotation.add(proteinGroup);
      proteinGroup.visible = false;
    }
  );
  if (newAvatar) {
    const gltfloader2 = new GLTFLoader();
    gltfloader2.load(
      //"https://cdn.glitch.me/4dee99f4-3b27-47bf-ab5c-24e04d8e18f5/4IHF-ribbon-secondary-vis_NIH3D.glb?v=1709753333428",
      //"https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/realistic_human_heart.glb?v=1711911660645",
      //"https://cdn.glitch.me/b3d90d45-9439-4d12-b6ad-1472ccec8903/pig_skull.glb?v=1711912161454",
      //"https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/6604d154d32ccf39d49d6f2d.glb?v=1712082602019",
      "https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/rpm-avatar-vr-1.glb?v=1712083574534",
      //https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/rotate3.glb?v=1712250929507",
      async function (gltf) {
        let model = gltf.scene;
        // wait until the model can be added to the scene without blocking due to shader compilation

        await renderer.compileAsync(model, camera, scene);
        rightHand = model.getObjectByName("RightHand");
        leftHand = model.getObjectByName("LeftHand");
        head = model.getObjectByName("Neck");
        //model.quaternion.invert();
        console.log(model);
        // model.position.set(0,0,0);
        avatarModel.add(model);
        //model.children[0].rotation.y = Math.PI;
        //model.up.y = -1;
        //avatarModel.rotation.y = Math.PI;
        //model.rotation.y = Math.PI;
        scene.add(avatarModel);
      }
    );
  }

  ///////
  //3d Lab
  ////////

  STLloader.load(
    //"https://cdn.glitch.global/5f925a94-41ce-401a-9a3a-12fb19a7ca42/3DBenchy.stl?v=1691594384628",
    "https://cdn.glitch.global/5f925a94-41ce-401a-9a3a-12fb19a7ca42/simplify_3DBenchy.stl?v=1691980248117",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0xff9c7c,
        specular: 0x494949,
        shininess: 200,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      stlMeshBoat = new THREE.Mesh(geometry, material);

      //stlMeshBoat.position.set(-1.535, 0.91, -1.564)
      stlMeshBoat.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      stlMeshBoat.scale.set(0.03, 0.03, 0.03);
      //stlMesh.castShadow = true;
      //stlMesh.receiveShadow = true;

      stlMeshBoat.name = "boat";
      centerOfRotation.add(boatMeshes);
      centerOfRotation.position.set(1.535, 0.91, 1.864);
      scene.add(centerOfRotation);
      boatMeshes.rotation.set(0, Math.PI, 0);
      //boatMeshes.position.set(-0.5, 0, -0.5);
      boatMeshes.scale.set(0.314, 0.314, 0.314);
      boatMeshes.add(stlMeshBoat);
      stlMeshOriginalScale = stlMeshBoat.scale;
      let boundingBoxMesh = getCenterPoint(stlMeshBoat);

      const geometry2 = new THREE.BoxGeometry(0.6, 1.2, 0.55);
      const geometry3 = new THREE.BoxGeometry(0.7, 0.4, 1.55);
      const geometry4 = new THREE.BoxGeometry(0.7, 0.4, 0.5);
      const material2 = new THREE.MeshLambertMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });

      var cube2 = new THREE.Mesh(geometry2, material2);
      var cube3 = new THREE.Mesh(geometry3, material2);
      var cube4 = new THREE.Mesh(geometry4, material2);

      cube2.position.set(0, 0.59, -0.06);
      cube3.position.set(0, 0.21, 0.04);
      cube4.position.set(0, 0.59, -0.66);
      cube2.name = "boat";
      cube3.name = "boat";
      cube4.name = "boat";
      boundingBoxesBoat.add(cube2);
      boundingBoxesBoat.add(cube3);
      boundingBoxesBoat.add(cube4);
      boatMeshes.add(boundingBoxesBoat);
      if (stlMeshBoat.name === activeMesh) {
        boatMeshes.visible = true;
      } else {
        boatMeshes.visible = false;
      }
      boatMeshes.visible = false;
      boundingBoxesBoat.visible = false;
      boundingBoxesOriginalScale = boundingBoxesBoat.scale;
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  STLloader.load(
    "https://cdn.glitch.global/9fdd6c5e-7ec5-467b-b963-c8db9f6204ed/3DBenchy_wireframe.stl?v=1696983564696",
    function (geometry) {
      let geo = new THREE.WireframeGeometry(geometry); // or WireframeGeometry( geometry )

      wireframeMeshBoat = new THREE.LineSegments(geo);
      wireframeMeshBoat.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      wireframeMeshBoat.position.y += 0.72;
      wireframeMeshBoat.position.z -= 0.03;
      wireframeMeshBoat.scale.set(0.03, 0.03, 0.03);
      wireframeMeshBoat.visible = false;
      wireframeMeshBoat.material.depthTest = false;
      wireframeMeshBoat.material.opacity = 0.8;
      wireframeMeshBoat.material.transparent = true;
      wireframeMeshBoat.name = "boat";
      wireframeMeshBoatParent.add(wireframeMeshBoat);
      boatMeshes.add(wireframeMeshBoatParent);
      wireframeMeshOriginalScale = wireframeMeshBoat.scale;
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );
  STLloader.load(
    "https://cdn.glitch.global/9fdd6c5e-7ec5-467b-b963-c8db9f6204ed/3D_Printer_test_fixed_stl_3rd_gen.STL?v=1694964337661",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0xff9c7c,
        specular: 0x494949,
        shininess: 200,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      stlMeshTest = new THREE.Mesh(geometry, material);

      stlMeshTest.position.set(-0.5, 0, 0);
      stlMeshTest.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      stlMeshTest.scale.set(0.03, 0.03, 0.03);

      //stlMesh.castShadow = true;
      //stlMesh.receiveShadow = true;

      stlMeshTest.name = "test";
      centerOfRotation.add(testMeshes);
      //centerOfRotation.position.set(1.835, 0.91, 1.864);
      //scene.add(centerOfRotation);
      testMeshes.rotation.set(0, Math.PI, 0);
      testMeshes.position.set(-0.5, 0, -0.5);
      testMeshes.scale.set(0.314, 0.314, 0.314);
      testMeshes.add(stlMeshTest);
      stlMeshOriginalScale = stlMeshTest.scale;
      let boundingBoxMesh = getCenterPoint(stlMeshTest);

      const geometry2 = new THREE.BoxGeometry(3, 1, 3);
      const geometry3 = new THREE.BoxGeometry(0.5, 1, 0.5);
      const geometry4 = new THREE.BoxGeometry(0.7, 1, 0.5);
      const material2 = new THREE.MeshLambertMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });

      var cube2 = new THREE.Mesh(geometry2, material2);
      var cube3 = new THREE.Mesh(geometry3, material2);
      var cube4 = new THREE.Mesh(geometry4, material2);

      cube2.position.set(-1.5, 0.6, -1.5);
      cube3.position.set(-0.4, 1, -0.2);
      cube4.position.set(-0.6, 1.5, -1);
      cube2.name = "test";
      cube3.name = "test";
      cube4.name = "test";
      boundingBoxesTest.add(cube2);
      boundingBoxesTest.add(cube3);
      boundingBoxesTest.add(cube4);
      testMeshes.add(boundingBoxesTest); //use boatMeshes
      if (stlMeshTest.name === activeMesh) {
        testMeshes.visible = true;
      } else {
        testMeshes.visible = false;
      }
      boundingBoxesTest.visible = false;
      boundingBoxesOriginalScale = boundingBoxesTest.scale;

      let geo = new THREE.WireframeGeometry(geometry); // or WireframeGeometry( geometry )

      //var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );

      wireframeMeshTest = new THREE.LineSegments(geo);
      //wireframeMesh.material.linewidth = 2;
      //wireframeMesh.material.color.set(0xff9c7c);
      wireframeMeshTest.position.set(-0.5, 0, 0);
      wireframeMeshTest.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      wireframeMeshTest.scale.set(0.03, 0.03, 0.03);
      //wireframeMesh.material.opacity = 0;
      wireframeMeshTest.visible = false;
      //wireframeMesh.material.color.setHex(0xff9c7c);
      wireframeMeshTest.material.depthTest = false;
      wireframeMeshTest.material.opacity = 0.5;
      wireframeMeshTest.material.transparent = true;
      wireframeMeshTest.name = "test";
      wireframeMeshTestParent.add(wireframeMeshTest);
      testMeshes.add(wireframeMeshTestParent);
      wireframeMeshOriginalScale = wireframeMeshTest.scale;

      // socket.emit("requestRoomState", "");
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  STLloader.load(
    "https://cdn.glitch.global/9fdd6c5e-7ec5-467b-b963-c8db9f6204ed/giantowl.stl?v=1695154608383",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0xff9c7c,
        specular: 0x494949,
        shininess: 200,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      stlMeshOwl = new THREE.Mesh(geometry, material);

      stlMeshOwl.position.set(-0.2, 0.1, -0.2);
      stlMeshOwl.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      stlMeshOwl.scale.set(0.03, 0.03, 0.03);

      //stlMesh.castShadow = true;
      //stlMesh.receiveShadow = true;

      stlMeshOwl.name = "owl";
      centerOfRotation.add(owlMeshes);
      //centerOfRotation.position.set(1.835, 0.91, 1.864);
      //scene.add(centerOfRotation);
      owlMeshes.rotation.set(0, Math.PI, 0);
      owlMeshes.position.set(0, 0, 0);
      owlMeshes.scale.set(0.314, 0.314, 0.314);
      owlMeshes.add(stlMeshOwl);
      if (stlMeshOwl.name === activeMesh) {
        owlMeshes.visible = true;
      } else {
        owlMeshes.visible = false;
      }
      stlMeshOriginalScale = stlMeshOwl.scale;
      let boundingBoxMesh = getCenterPoint(stlMeshOwl);

      const geometry2 = new THREE.BoxGeometry(1.5, 3, 1.5);
      const material2 = new THREE.MeshLambertMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });

      var cube2 = new THREE.Mesh(geometry2, material2);

      cube2.position.set(0.2, 0, 0.2);
      cube2.name = "owl";
      boundingBoxesOwl.add(cube2);
      owlMeshes.add(boundingBoxesOwl); //use boatMeshes
      boundingBoxesOwl.visible = false;
      boundingBoxesOriginalScale = boundingBoxesOwl.scale;
    }
  );
  STLloader.load(
    "https://cdn.glitch.global/9fdd6c5e-7ec5-467b-b963-c8db9f6204ed/giantowl_wireframe.stl?v=1696988787297",
    function (geometry) {
      let geo = new THREE.WireframeGeometry(geometry); // or WireframeGeometry( geometry )

      //var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );

      wireframeMeshOwl = new THREE.LineSegments(geo);
      //wireframeMesh.material.linewidth = 2;
      //wireframeMesh.material.color.set(0xff9c7c);
      //wireframeMeshOwl.position.set(-0.2, 0.1, -0.2);
      wireframeMeshOwl.position.y += 0.88;
      wireframeMeshOwl.position.x -= 0.03;
      wireframeMeshOwl.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      wireframeMeshOwl.scale.set(0.03, 0.03, 0.03);
      //wireframeMesh.material.opacity = 0;
      wireframeMeshOwl.visible = false;
      //wireframeMesh.material.color.setHex(0xff9c7c);
      wireframeMeshOwl.material.depthTest = false;
      wireframeMeshOwl.material.opacity = 0.8;
      wireframeMeshOwl.material.transparent = true;
      wireframeMeshOwl.name = "owl";
      wireframeMeshOwlParent.add(wireframeMeshOwl);
      owlMeshes.add(wireframeMeshOwlParent);
      wireframeMeshOriginalScale = wireframeMeshOwl.scale;
    }
  );

  const GcodeLoader = new GCodeLoader(loadingManager);
  GcodeLoader.load(
    "https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/benchy.gcode?v=1711830217510",
    function (object) {
      object.position.set(2.995, 0.0, 2.97);
      object.scale.set(0.03, 0.03, 0.03);
      gcodeMeshBoat = object;
      gcodeMeshBoat.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      //gcodeMeshParent.position.set(1.555, 0.91, 1.63); //offset 0, 0.5, -2 for consoleMesh Position
      gcodeMeshBoatParent.add(gcodeMeshBoat);
      gcodeMeshBoatParent.name = "boat";
      boatMeshes.add(gcodeMeshBoatParent);
      gcodeMeshParentOriginalScale = gcodeMeshBoatParent.scale;
      gcodeMeshBoat.children[0].material.transparent = true;
      gcodeMeshBoat.children[0].material.opacity = 1;
      gcodeMeshBoat.children[1].material.transparent = true;
      gcodeMeshBoat.children[1].material.opacity = 1;
      gcodeMeshBoat.children[1].visible = false;
      //gcodeMeshBoat.children[2].material.transparent = true;
      //gcodeMeshBoat.children[2].material.opacity = 0.5;
      gcodeMeshBoat.visible = false;
      //scene.add(gcodeMesh);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  const loaderGcodeLayerBoat = new GCodeLoaderLayerBoat(loadingManager);
  loaderGcodeLayerBoat.load(
    "https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/benchy.gcode?v=1711830217510",
    function (object) {
      object.position.set(2.995, 0.0, 2.97);
      object.scale.set(0.03, 0.03, 0.03);
      gcodeMeshBoatLayer = object;
      gcodeMeshBoatLayer.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      gcodeMeshBoatParent.add(gcodeMeshBoatLayer);
      gcodeMeshBoatLayer.visible = false;
      console.log(gcodeMeshBoatLayer);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );
  const loaderGcode = new GCodeLoaderNoLayer(loadingManager);
  loaderGcode.load(
    "https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/3d_printer_test_support.gcode?v=1711830470059",
    function (object) {
      object.position.set(0.85, 0.0, 1.3);
      object.scale.set(0.03, 0.03, 0.03);
      gcodeMeshTest = object;
      gcodeMeshTest.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      //gcodeMeshParent.position.set(1.555, 0.91, 1.63); //offset 0, 0.5, -2 for consoleMesh Position
      gcodeMeshTestParent.add(gcodeMeshTest);
      gcodeMeshTestParent.name = "test";
      testMeshes.add(gcodeMeshTestParent);
      gcodeMeshParentOriginalScale = gcodeMeshTestParent.scale;
      gcodeMeshTest.children[0].material.transparent = true;
      gcodeMeshTest.children[0].material.opacity = 1;
      gcodeMeshTest.children[1].material.transparent = true;
      gcodeMeshTest.children[1].material.opacity = 1;
      gcodeMeshTest.children[1].visible = false;
      //gcodeMeshTest.children[2].material.transparent = true;
      //gcodeMeshTest.children[2].material.opacity = 0.5;
      gcodeMeshTest.visible = false;
      //scene.add(gcodeMesh);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  loaderGcode.load(
    "https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/3d_printer_test_tree.gcode?v=1711830556575",
    function (object) {
      object.position.set(0.85, 0.0, 1.3);
      object.scale.set(0.03, 0.03, 0.03);
      gcodeMeshTestTree = object;
      gcodeMeshTestTree.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      //gcodeMeshParent.position.set(1.555, 0.91, 1.63); //offset 0, 0.5, -2 for consoleMesh Position
      testMeshes.add(gcodeMeshTestTree);
      //gcodeMeshTestParent.name = "test";
      //testMeshes.add(gcodeMeshTestParent);
      //gcodeMeshParentOriginalScale = gcodeMeshTestParent.scale;
      gcodeMeshTestTree.children[0].visible = false;
      gcodeMeshTestTree.children[1].visible = false;
      gcodeMeshTestTree.children[2].visible = false;
      gcodeMeshTestTree.children[2].material.transparent = true;
      gcodeMeshTestTree.children[2].material.opacity = 0.5;
      gcodeMeshTestTree.visible = false;
      //scene.add(gcodeMesh);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  const loaderGcodeLayer = new GCodeLoaderLayer(loadingManager);
  loaderGcodeLayer.load(
    "https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/3d_printer_test_tree.gcode?v=1711830556575",
    function (object) {
      object.position.set(0.85, 0.0, 1.3);
      object.scale.set(0.03, 0.03, 0.03);
      gcodeMeshTestLayer = object;
      gcodeMeshTestLayer.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      gcodeMeshTestParent.add(gcodeMeshTestLayer);
      gcodeMeshTestLayer.visible = false;
      console.log(gcodeMeshTestLayer);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  loaderGcode.load(
    "https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/giantowl_support.gcode?v=1711830912377",
    function (object) {
      object.position.set(2.82, -0.03, 2.79);
      object.scale.set(0.03, 0.03, 0.03);
      gcodeMeshOwl = object;
      gcodeMeshOwl.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      //gcodeMeshParent.position.set(1.555, 0.91, 1.63); //offset 0, 0.5, -2 for consoleMesh Position
      gcodeMeshOwlParent.add(gcodeMeshOwl);
      gcodeMeshOwlParent.name = "owl";
      owlMeshes.add(gcodeMeshOwlParent);
      gcodeMeshParentOriginalScale = gcodeMeshOwlParent.scale;
      gcodeMeshOwl.children[0].material.transparent = true;
      gcodeMeshOwl.children[0].material.opacity = 1;
      gcodeMeshOwl.children[1].material.transparent = true;
      gcodeMeshOwl.children[1].material.opacity = 1;
      gcodeMeshOwl.children[2].material.transparent = true;
      gcodeMeshOwl.children[2].material.opacity = 0.5;
      gcodeMeshOwl.children[1].visible = false;
      gcodeMeshOwl.visible = false;
      //scene.add(gcodeMesh);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  loaderGcode.load(
    "https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/giantowl_tree.gcode?v=1711830793758",
    function (object) {
      object.position.set(2.82, -0.03, 2.79);
      object.scale.set(0.03, 0.03, 0.03);
      gcodeMeshOwlTree = object;
      gcodeMeshOwlTree.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      //gcodeMeshParent.position.set(1.555, 0.91, 1.63); //offset 0, 0.5, -2 for consoleMesh Position
      owlMeshes.add(gcodeMeshOwlTree);
      //gcodeMeshTestParent.name = "test";
      //testMeshes.add(gcodeMeshTestParent);
      //gcodeMeshParentOriginalScale = gcodeMeshTestParent.scale;
      gcodeMeshOwlTree.children[0].visible = false;
      gcodeMeshOwlTree.children[1].visible = false;
      gcodeMeshOwlTree.children[2].visible = false;
      gcodeMeshOwlTree.children[2].material.transparent = true;
      gcodeMeshOwlTree.children[2].material.opacity = 0.5;
      gcodeMeshOwlTree.visible = false;
      //scene.add(gcodeMesh);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  //const loaderGcodeLayer = new GCodeLoaderLayer();
  loaderGcodeLayer.load(
    "https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/giantowl_support.gcode?v=1711830912377",
    function (object) {
      object.position.set(2.82, -0.03, 2.79);
      object.scale.set(0.03, 0.03, 0.03);
      gcodeMeshOwlLayer = object;
      gcodeMeshOwlLayer.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      gcodeMeshOwlParent.add(gcodeMeshOwlLayer);
      gcodeMeshOwlLayer.visible = false;
      console.log(gcodeMeshOwlLayer);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  const loaderGcodePrinter = new GCodeLoaderPrinter(loadingManager);
  loaderGcodePrinter.load(
    "https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/benchy.gcode?v=1711830217510",
    function (object) {
      let test = [];
      for (let i = 0; i < object.length; i++) {
        test.push(object[i]);
      }
      printerPathArray.push(test);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  const loaderGcodePrinter2 = new GCodeLoaderPrinter(loadingManager);
  loaderGcodePrinter2.load(
    "https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/3d_printer_test_tree.gcode?v=1711830556575",
    function (object2) {
      let test = [];
      for (let i = 0; i < object2.length; i++) {
        test.push(object2[i]);
      }
      printerPathArray.push(test);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  const loaderGcodePrinter3 = new GCodeLoaderPrinter(loadingManager);
  loaderGcodePrinter3.load(
    "https://cdn.glitch.global/b3d90d45-9439-4d12-b6ad-1472ccec8903/giantowl_tree.gcode?v=1711830793758",
    function (object3) {
      let test = [];
      for (let i = 0; i < object3.length; i++) {
        test.push(object3[i]);
      }
      printerPathArray.push(test);
      console.log(printerPathArray[0]);
      console.log(printerPathArray[1]);
      console.log(printerPathArray[2]);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );
  scene.add(boatMeshes);
  scene.add(testMeshes);
  scene.add(owlMeshes);

  STLloader.load(
    "https://cdn.glitch.global/5f925a94-41ce-401a-9a3a-12fb19a7ca42/Ender3_frame_8177_vertices.stl?v=1692067612586",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x333333,
        specular: 0x494949,
        shininess: 50,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      let ender3FrameMesh = new THREE.Mesh(geometry, material);
      ender3FrameMesh.rotation.set(0, 0, 0);
      ender3FrameMesh.scale.set(0.003, 0.003, 0.003);
      ender3FrameMesh.name = "Ender_3_frame";
      ender3FrameMesh.position.set(0, 0, 0);
      ender3Group.add(ender3FrameMesh);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  STLloader.load(
    "https://cdn.glitch.global/1da12087-2feb-47be-9fc0-46eb330f4795/xaxis_19640.stl?v=1694728590313",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x333333,
        specular: 0x494949,
        shininess: 50,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      let ender3XAxisMesh = new THREE.Mesh(geometry, material);
      ender3XAxisMesh.rotation.set(0, 0, 0);
      ender3XAxisMesh.scale.set(0.003, 0.003, 0.003);
      ender3XAxisMesh.name = "xaxis";
      ender3XAxisMesh.position.set(0, -0.183, 0);
      ender3XAxisGroup.add(ender3XAxisMesh);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  STLloader.load(
    "https://cdn.glitch.global/1da12087-2feb-47be-9fc0-46eb330f4795/xaxis_switch_38.stl?v=1694728590501",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x999999,
        specular: 0x494949,
        shininess: 50,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      xaxis_switch = new THREE.Mesh(geometry, material);
      xaxis_switch.rotation.set(Math.PI / 2, Math.PI / 2, 0);
      xaxis_switch.scale.set(0.003, 0.003, 0.003);
      xaxis_switch.name = "xaxis_switch";
      xaxis_switch.position.set(0.02, 0.85, -0.005);
      ender3XAxisGroup.add(xaxis_switch);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  STLloader.load(
    "https://cdn.glitch.global/1da12087-2feb-47be-9fc0-46eb330f4795/hotend_nozzle_105.stl?v=1694728586757",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0xcd7f32,
        specular: 0x494949,
        shininess: 200,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      nozzle = new THREE.Mesh(geometry, material);
      nozzle.rotation.set(0, 0, 0);
      nozzle.scale.set(0.003, 0.003, 0.003);
      nozzle.name = "Ender_3_hotend_nozzle";
      nozzle.position.set(-0.046, 0.756, 0.02);
      ender3HotEndGroup.add(nozzle);
    },

    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  STLloader.load(
    "https://cdn.glitch.global/1da12087-2feb-47be-9fc0-46eb330f4795/hotend_cover_2563.stl?v=1694728592550",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x333333,
        specular: 0x494949,
        shininess: 50,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      cover = new THREE.Mesh(geometry, material);

      cover.rotation.set(0, -Math.PI / 2, 0);
      cover.scale.set(0.003, 0.003, 0.003);
      cover.name = "Ender_3_hotend_cover";
      cover.position.set(-0.08, 0.84, 0.205);
      ender3HotEndGroup.add(cover);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  STLloader.load(
    "https://cdn.glitch.global/1da12087-2feb-47be-9fc0-46eb330f4795/hotend_fans_1979.stl?v=1694728627392",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x333333,
        specular: 0x494949,
        shininess: 50,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      fans = new THREE.Mesh(geometry, material);

      fans.rotation.set(0, -Math.PI / 2, 0);
      fans.scale.set(0.003, 0.003, 0.003);
      fans.name = "Ender_3_hotend_cover";
      fans.position.set(-0.08, 0.84, 0.21);
      ender3HotEndGroup.add(fans);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );
  STLloader.load(
    "https://cdn.glitch.global/1da12087-2feb-47be-9fc0-46eb330f4795/hotend_block_283.stl?v=1694728591306",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        specular: 0x494949,
        shininess: 50,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      block = new THREE.Mesh(geometry, material);
      block.rotation.set(0, -Math.PI / 2, 0);
      block.scale.set(0.003, 0.003, 0.003);
      block.name = "Ender_3_hotend_block";
      block.position.set(0.23, 0.756, 0.123);
      ender3HotEndGroup.add(block);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  STLloader.load(
    "https://cdn.glitch.global/1da12087-2feb-47be-9fc0-46eb330f4795/hotend_tube_151.stl?v=1694728586932",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        specular: 0x494949,
        shininess: 50,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      tube = new THREE.Mesh(geometry, material);
      tube.rotation.set(0, -Math.PI / 2, 0);
      tube.scale.set(0.003, 0.003, 0.003);
      tube.name = "Ender_3_hotend_block";
      tube.position.set(0.23, 0.756, 0.123);
      ender3HotEndGroup.add(tube);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );
  STLloader.load(
    "https://cdn.glitch.global/1da12087-2feb-47be-9fc0-46eb330f4795/hotend_heatsink_503.stl?v=1694728586575",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        specular: 0x494949,
        shininess: 50,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      heatsink = new THREE.Mesh(geometry, material);

      heatsink.rotation.set(0, -Math.PI / 2, 0);
      heatsink.scale.set(0.003, 0.003, 0.003);
      heatsink.name = "Ender_3_hotend_block";
      heatsink.position.set(0.23, 0.756, 0.123);
      ender3HotEndGroup.add(heatsink);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  STLloader.load(
    "https://cdn.glitch.global/1da12087-2feb-47be-9fc0-46eb330f4795/BLTouch_body_651.stl?v=1694728590901",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        specular: 0x494949,
        shininess: 200,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      bltouch = new THREE.Mesh(geometry, material);

      //stlMesh.position.set(-0.008, 0.725, -0.02);
      bltouch.rotation.set(-Math.PI / 2, 0, 0);
      bltouch.scale.set(0.003, 0.003, 0.003);
      bltouch.name = "Ender_3_bltouch";
      bltouch.position.set(0.018, 0.87, 0.087);
      ender3HotEndGroup.add(bltouch);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );
  STLloader.load(
    "https://cdn.glitch.global/1da12087-2feb-47be-9fc0-46eb330f4795/BLTouch_needle_88.stl?v=1694728591085",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        specular: 0x494949,
        shininess: 200,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      bltouch_needle = new THREE.Mesh(geometry, material);

      //stlMesh.position.set(-0.008, 0.725, -0.02);
      bltouch_needle.rotation.set(-Math.PI / 2, 0, 0);
      bltouch_needle.scale.set(0.003, 0.003, 0.003);
      bltouch_needle.name = "Ender_3_bltouch_needle";
      bltouch_needle.position.set(0.018, 0.87, 0.087);
      ender3HotEndGroup.add(bltouch_needle);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  STLloader.load(
    "https://cdn.glitch.global/5f925a94-41ce-401a-9a3a-12fb19a7ca42/Ender3_x_axis_hotend_backplate_1410_vertices.stl?v=1692067603554",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x333333,
        specular: 0x494949,
        shininess: 50,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      let ender3YAxisMesh = new THREE.Mesh(geometry, material);

      //stlMesh.position.set(-0.008, 0.725, -0.02);
      ender3YAxisMesh.rotation.set(-Math.PI / 2, 0, 0);
      ender3YAxisMesh.scale.set(0.003, 0.003, 0.003);
      ender3YAxisMesh.name = "Ender_3_backplate";
      ender3YAxisMesh.position.set(0.065, 0.194, 0.293);
      ender3HotEndGroup.add(ender3YAxisMesh);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );
  STLloader.load(
    "https://cdn.glitch.global/5f925a94-41ce-401a-9a3a-12fb19a7ca42/Ender3_y_axis_1895_vertices.stl?v=1692067607731",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x333333,
        specular: 0x494949,
        shininess: 50,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      let ender3YAxisMesh = new THREE.Mesh(geometry, material);

      //stlMesh.position.set(-0.008, 0.725, -0.02);
      ender3YAxisMesh.rotation.set(0, 0, 0);
      ender3YAxisMesh.scale.set(0.003, 0.003, 0.003);
      ender3YAxisMesh.name = "Ender_3_YAxis";
      ender3YAxisMesh.position.set(0.365, 0.645, 0.56);

      ender3YAxisGroup.add(ender3YAxisMesh);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );
  STLloader.load(
    "https://cdn.glitch.global/5f925a94-41ce-401a-9a3a-12fb19a7ca42/Ender3_y_axis_bed_112.stl?v=1692069779926",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x333333,
        specular: 0x494949,
        shininess: 50,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      let ender3YAxisMesh = new THREE.Mesh(geometry, material);

      //stlMesh.position.set(-0.008, 0.725, -0.02);
      ender3YAxisMesh.rotation.set(0, 0, 0);
      ender3YAxisMesh.scale.set(0.003, 0.003, 0.003);
      ender3YAxisMesh.name = "Ender_3_bed";
      ender3YAxisMesh.position.set(0.365, 0.645, 0.56);
      ender3YAxisGroup.add(ender3YAxisMesh);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );
  STLloader.load(
    "https://cdn.glitch.global/5f925a94-41ce-401a-9a3a-12fb19a7ca42/Ender3_y_axis_knobs_1040_verticies.stl?v=1692067610113",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x880808,
        specular: 0x494949,
        shininess: 200,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      let ender3YAxisMesh = new THREE.Mesh(geometry, material);

      //stlMesh.position.set(-0.008, 0.725, -0.02);
      ender3YAxisMesh.rotation.set(0, 0, 0);
      ender3YAxisMesh.scale.set(0.003, 0.003, 0.003);
      ender3YAxisMesh.name = "Ender_3_knobs";
      ender3YAxisMesh.position.set(0.365, 0.645, 0.56);
      ender3YAxisGroup.add(ender3YAxisMesh);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );

  STLloader.load(
    "https://cdn.glitch.global/5f925a94-41ce-401a-9a3a-12fb19a7ca42/Ender3_y_axis_glass.stl?v=1692107567976f",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x666666,
        specular: 0x494949,
        shininess: 50,
        transparent: true,
        opacity: 1,
        //normalMap: normalMap,
        //side: THREE.DoubleSide,
      });
      let ender3YAxisMesh = new THREE.Mesh(geometry, material);

      //stlMesh.position.set(-0.008, 0.725, -0.02);
      ender3YAxisMesh.rotation.set(0, -Math.PI / 2, 0);
      ender3YAxisMesh.scale.set(0.003, 0.003, 0.003);
      ender3YAxisMesh.name = "Ender_3_glass";
      ender3YAxisMesh.position.set(0.365, 0.6455, 0.56);
      ender3YAxisGroup.add(ender3YAxisMesh);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );
  STLloader.load(
    "https://cdn.glitch.global/5f925a94-41ce-401a-9a3a-12fb19a7ca42/Ender3_spool_2073_vertices.stl?v=1692067613822",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x333333,
        specular: 0x494949,
        shininess: 50,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });
      ender3SpoolMesh = new THREE.Mesh(geometry, material);

      //stlMesh.position.set(-0.008, 0.725, -0.02);

      ender3SpoolMesh.rotation.set(0, 0, Math.PI / 2);
      ender3SpoolMesh.scale.set(0.003, 0.003, 0.003);
      ender3SpoolMesh.name = "Ender_3_spool";
      ender3SpoolMesh.position.set(0.35, 2.11, 0.12);
      ender3Group.add(ender3SpoolMesh);
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );
  const geometryFilamentSpool = new THREE.CylinderGeometry(
    0.25,
    0.25,
    0.21,
    32,
    1,
    true
  );
  const materialFilamentSpool = new THREE.MeshPhongMaterial({ color: 0xff00 });
  const cylinder = new THREE.Mesh(geometryFilamentSpool, materialFilamentSpool);
  cylinder.position.set(0.35, 2.11, 0.12);
  cylinder.rotation.set(0, 0, Math.PI / 2);
  ender3Group.add(cylinder);

  const geometryRing = new THREE.RingGeometry(0.25, 0.076, 32);
  const materialRing = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const mesh = new THREE.Mesh(geometryRing, materialRing);
  const mesh2 = new THREE.Mesh(geometryRing, materialRing);
  ender3Group.add(mesh);
  mesh.rotation.set(0, Math.PI / 2, 0);
  mesh2.rotation.set(0, -Math.PI / 2, 0);
  mesh.position.set(0.245, 2.11, 0.12);
  mesh2.position.set(0.455, 2.11, 0.12);
  ender3Group.add(mesh2);
  scene.add(ender3Group);
  ender3Group.add(ender3XAxisGroup);
  ender3Group.add(ender3YAxisGroup);
  ender3XAxisGroup.add(ender3HotEndGroup);
  ender3Group.position.set(1.4, -1.3, 0);
  ender3Group.scale.set(3, 3, 3);
  ender3XAxisGroup.position.set(0, 0, 0); //Bottom y: -0.183, Top: 0.602
  ender3YAxisGroup.position.set(0, 0, 0);
  ender3HotEndGroup.position.set(0, 0, 0); //Left z: -0.345, Right z:0.37
  let multiplier = 0.69 / 220; // 0.00314 = 1mm
  ender3Group.visible = false;

  if (!lineFilamentState) {
    const materialFilament = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      linewidth: 5,
    });
    var geometryFilament = new THREE.BufferGeometry();
    var positionsFilament = new Float32Array(600); // 3 vertices per point, 2 points per line
    geometryFilament.setAttribute(
      "position",
      new THREE.BufferAttribute(positionsFilament, 3)
    );
    var colorsFilament = new Float32Array(600); //Start point color, end point color
    geometryFilament.setAttribute(
      "color",
      new THREE.BufferAttribute(colorsFilament, 3)
    );
    lineFilament = new THREE.Line(geometryFilament, materialFilament);
    geometryFilament.setDrawRange(0, 15);
    scene.add(lineFilament);
    lineFilament.visible = false;
    lineFilamentState = true;
    updateFilament();
  }
}

/////////////////
// Functions  //
///////////////

function button1Pressed() {
  proteinGroup.visible = true;
  menuGroup.visible = false;
  exitGroup.visible = true;
  siteLogo.visible = false;
  //galton.visible = false;
  furnitureGroup.visible = false;
  lineGroup.visible = false;
  previousActiveMesh = activeMesh;
  activeMesh = "protein";
  // boatMeshes.visible = true;
  centerOfRotation.position.y = 1.25;
}

function button2Pressed() {
  proteinGroup.visible = false;
  menuGroup.visible = false;
  exitGroup.visible = true;
  siteLogo.visible = false;
  furnitureGroup.visible = false;
  lineGroup.visible = false;
  resetGroup.visible = true;

  const STLloader = new STLLoader(loadingManager);
  STLloader.load(
    //"https://cdn.glitch.global/5f925a94-41ce-401a-9a3a-12fb19a7ca42/3DBenchy.stl?v=1691594384628",
    "https://cdn.glitch.global/004a9581-855e-468e-a7ff-af67b084fe16/Hexagon%20Scaled.stl?v=1710966108670",
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x099966,
        specular: 0x494949,
        shininess: 200,
        transparent: true,
        opacity: 1,
        //side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.wireframe = true;

      //Indices needed to Rapier, not needed for Physx
      const indices = [];
      for (let i = 0; i < geometry.attributes.position.count; i++) {
        indices.push(i);
      }

      mesh.geometry.setIndex(indices);

      phy.add({
        name: "galton",
        type: "mesh",
        mesh: mesh,
        pos: [1.75, 1.5, 1.75],
        rot: [0, -90, 180],
        debug: true,
        friction: 0,
        restitution: 0,
      });
      phy.add({
        name: "galtonGlass",
        type: "box",
        size: [0.1, 3, 3],
        pos: [1.58, 1.5, 1.75],
        //rot: [0, -90, 180],
        debug: true,
        visible: false,
      });
      //galton.position.x = 1.75;
      //galton.position.y = 1.75;
      //galton.position.z = 1.75;
      //galton.rotation.set(0, -Math.PI/2, Math.PI);
      //galton.scale.set(0.015, 0.015, 0.015);
      //scene.add(galton);
      //galton.visible = true;
    },
    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );
  galtonBalls = true;
}

function button3Pressed() {
  proteinGroup.visible = false;
  menuGroup.visible = false;
  exitGroup.visible = true;
  buttonGroup.visible = true;
  consoleMesh.visible = true;
  siteLogo.visible = false;
  //galton.visible = false;
  furnitureGroup.visible = true;
  lineGroup.visible = true;
  activeMesh = "boat";
  labReset();
  
    const loader = new THREE.ObjectLoader();
  loader.load(
    // resource URL
    //"home.json",
    "3dPrinterLab_no_ceiling.json",
    //"labmesh.json",
    function (obj) {
      for (let i = 0; i < obj.children.length; i++) {
        if (obj.children[i] instanceof THREE.Mesh) {
          //console.log(obj.children[i]);
          if (obj.children[i].geometry.type == "BoxGeometry") {
            if (obj.children[i].geometry.parameters.height == 0) {
              //console.log(obj.children[i]);
              let data = {
                width: obj.children[i].geometry.parameters.width,
                length: obj.children[i].geometry.parameters.height,
                height: obj.children[i].geometry.parameters.depth,
                color: obj.children[i].material.color,
                transparent: obj.children[i].material.transparent,
                opacity: obj.children[i].material.opacity,
                matrix: obj.children[i].matrix,
                name: obj.children[i].name,
              };
              addPlaneFromServer(data);
            } else {
              //This first else statement sends furniture as "BoxGeometry"
              let data = {
                geometry: obj.children[i].geometry,
                width: obj.children[i].geometry.parameters.width,
                length: obj.children[i].geometry.parameters.height,
                height: obj.children[i].geometry.parameters.depth,
                color: obj.children[i].material.color,
                transparent: obj.children[i].material.transparent,
                opacity: obj.children[i].material.opacity,
                matrix: obj.children[i].matrix,
                name: obj.children[i].name,
              };
              addPhysicsDetectionJSON(data);
            }
          } else {
            //this second statement sends the "BufferGeometry" for the depth wireframe
            let data = {
              geometry: obj.children[i].geometry,
              color: obj.children[i].material.color,
              transparent: obj.children[i].material.transparent,
              opacity: obj.children[i].material.opacity,
              matrix: obj.children[i].matrix,
              name: obj.children[i].name,
            };
            addPhysicsDetectionJSON(data);
          }
        }
      }
    },

    // onProgress callback

    function (xhr) {
      if (loadingDebug) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    },

    // onError callback
    function (err) {
      console.error("An error happened");
    }
  );
  
}

function button4Pressed() {
  proteinGroup.visible = false;
  menuGroup.visible = false;
  exitGroup.visible = true;
  siteLogo.visible = false;
  furnitureGroup.visible = false;
  lineGroup.visible = false;
  resetGroup.visible = false;
  occlusionGroup.visible = true;
  shadowGroup.visible = true;
  gravityGroup.visible = true;
  button4Active = true;
}

function button5Pressed() {
  proteinGroup.visible = false;
  menuGroup.visible = false;
  exitGroup.visible = true;
  paintGroup.visible = true;
  siteLogo.visible = false;
  furnitureGroup.visible = false;
  lineGroup.visible = false;
  resetGroup.visible = false;
  gravityGroup.visible = false;
  button5Active = true;
  painter1.mesh.visible = true;
  painter2.mesh.visible = true;
  let pivot1 = controller1.getObjectByName("pivot");
  let pivot2 = controller2.getObjectByName("pivot");
  pivot1.visible = true;
  pivot2.visible = true;
}

function exitButtonPressed() {
  proteinGroup.visible = false;
  menuGroup.visible = true;
  exitGroup.visible = false;
  paintGroup.visible = false;
  occlusionGroup.visible = false;
  shadowGroup.visible = false;
  siteLogo.visible = true;
  //galton.visible = false;
  resetGroup.visible = false;
  furnitureGroup.visible = false;
  lineGroup.visible = false;
  labOff();
  button4Active = false;
  button5Active = false;
  gravityGroup.visible = false;
  phy.setGravity([0, -9.81, 0]);
  gravity = true;
  enableBalls = false;
  activeMesh = previousActiveMesh;
  painter1.mesh.visible = false;
  painter2.mesh.visible = false;
  let pivot1 = controller1.getObjectByName("pivot");
  let pivot2 = controller2.getObjectByName("pivot");
  pivot1.visible = false;
  pivot2.visible = false;
  painter1.clear();
  painter2.clear();

  centerOfRotation.position.set(1.535, 0.91, 1.864);
  centerOfRotation.rotation.set(0, Math.PI, 0);
  centerOfRotation.scale.set(1, 1, 1);
  /*
  if (occlusionMesh !== undefined) {
    occlusionMesh.geometry.dispose();
    occlusionMesh.material.dispose();
    scene.remove(occlusionMesh);
    shadowMesh.geometry.dispose();
    shadowMesh.material.dispose();
    scene.remove(shadowMesh);
  }
  */

  for (let i = 0; i < wireframemeshNumber; i++) {
    phy.remove("wireframeMesh" + i); 
  }
  wireframemeshNumber = 0;
  phy.remove("galton");
  phy.remove("galtonGlass");
  for (let i = 0; i < 500; i++) {
    phy.remove("sphere" + i);
  }
  galtonBalls = false;
  for (let i = 0; i < meshNumber; i++) {
    phy.remove("mesh" + i);
  }
  meshNumber = 0;
  for (let i = 0; i < planeNumber; i++) {
    phy.remove("plane" + i);
  }
  planeNumber = 0;
  count = 0;
}
function resetButtonPressed() {
  for (let i = 0; i < ballsGalton; i++) {
    phy.remove("sphere" + i);
  }
  count = 0;
}

function gravityButtonPressed() {
  if (gravity) {
    phy.setGravity([0, 0, 0]);
    gravity = false;
  } else {
    phy.setGravity([0, -9.81, 0]);
    gravity = true;
  }
}

function occlusionButtonPressed() {
  if (occlusionGroup !== undefined) {
    if (occlusion) {
      occlusionGroup.visible = false;
      shadowGroup.visible = false;

      occlusion = false;
    } else {
      occlusionGroup.visible = true;
      shadowGroup.visible = true;
      occlusion = true;
    }
  }
}

function clearPaintButtonPressed() {
  painter1.clear();
  painter2.clear();
}

function addLocalClientToVR() {
  userArray[0].color = randomColor(); //calls randomColor() function
  userArray[0].presenting = 1;
  var data = userArray[0]; //sets data as userArray[0] (the local client)
  socket.emit("addCubeToServer", data);

  // Checks is user is a vr headset to add controllers
  if (userArray[0].vr === 1) {
    var con1Name = "controller1";
    var con2Name = "controller2";
    var userID = userArray[0].id;
    var cubeCon1Name = userID.concat(con1Name);
    var cubeCon2Name = userID.concat(con2Name);
    var data1 = controllerConstructor(
      cubeCon1Name,
      userArray[0].color,
      1,
      1,
      0
    );
    var data2 = controllerConstructor(
      cubeCon2Name,
      userArray[0].color,
      2,
      0,
      1
    );

    userArray[0].con1 = 1;
    userArray[0].con2 = 1;
    socket.emit("addControllerToServer", data1);
    socket.emit("addControllerToServer", data2);
  }
}

function addCube(data) {
  let inArray = getIndexByID(data);
  if (inArray < 0) {
    userArray.push(data);
  }

  const geometry = new THREE.BoxGeometry(0.6, 1, 0.15);
  const material = new THREE.MeshLambertMaterial({
    color: data.color,
    transparent: true,
    opacity: 0.85,
  });
  if (!playerPhysics) {
    const geometry = new THREE.BoxGeometry(0.6, 1, 0.15);
    const material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    });

    var cube = new THREE.Mesh(geometry, material);
    var name = data.id;
    cube.name = name;
    socket.emit("debug", "My name is " + cube.name);
    cube.position.set(0, 0, 0);
    scene.add(cube);
  }

  var i = getIndexByID(data);
  userArray[i] = data;
  userArray[i].presenting = 1;
  socket.emit("debug", "Cube added from array index " + i);
}

function addCubeController(data, i) {
  if (!playerPhysics) {
    const geometry = new THREE.BoxGeometry(0.08, 0.15, 0.08);
    const material = new THREE.MeshLambertMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.85,
    });

    var cube = new THREE.Mesh(geometry, material);
    var name = data.id;
    cube.name = name;
    socket.emit("debug", "My controller name is " + cube.name);
    cube.position.set(0, 0, 0);
    scene.add(cube);
  }
}

function buildController(data) {
  let geometry, material;

  switch (data.targetRayMode) {
    case "tracked-pointer":
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3)
      );
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3)
      );

      material = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
      });

      return new THREE.Line(geometry, material);

    case "gaze":
      geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
      material = new THREE.MeshBasicMaterial({
        opacity: 0.5,
        transparent: true,
      });
      return new THREE.Mesh(geometry, material);
  }
}

function controllerConstructor(conName, color, conNum, con1, con2) {
  var conJSON = {
    id: conName,
    color: color,
    presenting: 1,
    ar: 0,
    vr: 1,
    xr: 0,
    controllerNum: conNum,
    con1: con1,
    con2: con2,
    posX: 0,
    posY: 0,
    posZ: 0,
  };
  return conJSON;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//getCenterPoint(mesh) - Finds the center point of a mesh from its geometry
//                       Used to convert the bufferGeometry bounding box to a
//                       BoxGeometry with correct center for Rapier Physics.
function getCenterPoint(mesh) {
  var geometry = mesh.geometry;
  geometry.computeBoundingBox();
  var center = new THREE.Vector3();
  geometry.boundingBox.getCenter(center);
  mesh.localToWorld(center);
  return center;
}

function getIndexByID(data) {
  for (let i in userArray) {
    if (userArray[i].id == data.id) {
      return i;
    }
  }
}

function handleController(controller) {
  if (controller.userData.isSelecting) {
    if (enablePhysics) {
      pressCount = pressCount + 1;
      if (renderer.xr.isPresenting && pressCount >= 1) {
        pressCount = 0;
        var controllerOffset = controller.position;
        var XRCamera = renderer.xr.getCamera();
        var cameraOffset = XRCamera.position;

        velocity.x = (Math.random() - 0.5) * 2;
        velocity.y = (Math.random() - 0.5) * 2;
        velocity.z = Math.random() - 9;
        // Convert Euler rotation to Quaternion
        let quaternion = new THREE.Quaternion();
        if (!userArray[0].vr) {
          quaternion.setFromEuler(XRCamera.rotation);
        } else {
          quaternion.setFromEuler(controller.rotation);
        }

        // Create a vector representing the front direction
        let frontVector = new THREE.Vector3(0, 0, -1);

        // Apply the rotation to the front vector
        frontVector.applyQuaternion(quaternion);

        // Scale the front vector to your desired distance (0.2 units)
        let distance = 0.2;
        frontVector.multiplyScalar(distance);

        // Calculate the position
        let position = new THREE.Vector3();
        if (!userArray[0].vr) {
          position.copy(XRCamera.position);
        } else {
          position.copy(controller.position);
        }
        position.add(frontVector);

        if (!userArray[0].vr) {
          velocity.applyQuaternion(XRCamera.quaternion);
          phy.change({
            name: "sphere" + count,
            pos: [position.x, position.y, position.z],
            linearVelocity: [velocity.x, velocity.y, velocity.z],
          });
          position.y = position.y - 0.2;
          socket.emit("ballShot", {
            pos: position,
            count: count,
            vel: velocity,
          });
        } else {
          velocity.applyQuaternion(controller.quaternion);
          phy.change({
            name: "sphere" + count,
            pos: [position.x, position.y, position.z],
            linearVelocity: [velocity.x, velocity.y, velocity.z],
          });
          socket.emit("ballShot", {
            pos: position,
            count: count,
            vel: velocity,
          });
        }
        console.log("Ball shot");
        //physics.setMeshVelocity(spheres, velocity, count);
      } else if (pressCount >= 1) {
        pressCount = 0;

        var controllerOffset = controller.position;
        // controllerOffset.y = controllerOffset.y - 0.5;
        //physics.setMeshPosition(spheres, controllerOffset, count);
        velocity.x = (Math.random() - 0.5) * 2;
        velocity.y = (Math.random() - 0.5) * 2;
        velocity.z = Math.random() - 9;
        velocity.applyQuaternion(controller.quaternion);

        //physics.setMeshVelocity(spheres, velocity, count);
        phy.change({
          name: "sphere" + count,
          pos: [position.x, position.y, position.z],
          linearVelocity: [velocity.x, velocity.y, velocity.z],
        });

        socket.emit("ballShot", {
          pos: position,
          count: count,
          vel: velocity,
        });
      }
      if (++count === ballsLab) {
        count = 0;
      }
    }
  }
}

function updateMyCube() {
  var cube = scene.getObjectByName(userArray[0].id);
  if (cube !== undefined) {
    var XRCamera = renderer.xr.getCamera();
    console.log(cube);
    if (cube.name == userArray[0].id) {
      cube.position.x = XRCamera.position.x;
      cube.position.y = XRCamera.position.y;
      cube.position.z = XRCamera.position.z;
      cube.setRotationFromEuler(XRCamera.rotation);
    }
  }
}

function randomColor() {
  const r = Math.random(),
    g = Math.random(),
    b = Math.random();
  return new THREE.Color(r, g, b);
}

function checkForXR() {
  if (window.isSecureContext === false) {
    document.body.appendChild(XRButton.createButton(renderer));
  } else if ("xr" in navigator) {
    navigator.xr
      .isSessionSupported("immersive-vr")
      .then(function (supported) {
        if (supported) {
          userArray[0].vr = 1;
          socket.emit("syncXRSupport", userArray[0]);
          console.log("VR Supported");
          socket.emit("debug", "A new device joined that supports VR");
          document.body.appendChild(
            ARButton.createButton(renderer, {
              requiredFeatures: ["hit-test", "local-floor"],
              optionalFeatures: [
                "mesh-detection",
                "plane-detection",
                "hand-tracking",
                //, "depth-sensing"
              ],
            })
          );
        } else {
          navigator.xr
            .isSessionSupported("immersive-ar")
            .then(function (supported) {
              if (supported) {
                userArray[0].ar = 1;
                socket.emit("syncXRSupport", userArray[0]);
                console.log("AR Supported");
                socket.emit("debug", "A new device joined that supports AR");
                document.body.appendChild(
                  XRButton.createButton(renderer, {
                    requiredFeatures: ["hit-test", "local"],
                  })
                );
              } else {
                userArray[0].xr = 1;
                socket.emit("syncXRSupport", userArray[0]);
                console.log("No XR Support");
                socket.emit(
                  "debug",
                  "A new device joined that does not support XR"
                );
                document.body.appendChild(
                  ARButton.createButton(renderer, {
                    requiredFeatures: ["hit-test", "plane-detection", "local"],
                  })
                );
              }
            })
            .catch();
        }
      })
      .catch();
  }
}

////////////////////////
//  Plane Detection  //
//////////////////////

function addPlaneFromServer(data) {
  //console.log("Adding plane");
  const geometry = new THREE.BoxGeometry(data.width, data.length, data.height);
  let material;
  if (questPro) {
    material = new THREE.MeshLambertMaterial({
      color: data.color,
      transparent: data.transparent,
      //opacity: data.opacity,
      opacity: 0,
    });
  } else {
    material = new THREE.MeshLambertMaterial({
      color: data.color,
      transparent: data.transparent,
      opacity: data.opacity,
    });
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.setFromMatrixPosition(data.matrix);
  mesh.quaternion.setFromRotationMatrix(data.matrix);
  mesh.name = "plane";
  planeGroup.add(mesh);

  var centerMesh = getCenterPoint(mesh);

  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 })
  );
  line.position.setFromMatrixPosition(data.matrix);
  line.quaternion.setFromRotationMatrix(mesh.matrix);
  line.updateMatrix();
  lineGroup.add(line);

  const geometryPhysics = new THREE.BoxGeometry(
    data.width,
    0.1,
    data.height
  ).translate(0, 0, 0);
  const meshPhysics = new THREE.Mesh(geometryPhysics, material);
  meshPhysics.position.setFromMatrixPosition(data.matrix);
  meshPhysics.quaternion.setFromRotationMatrix(data.matrix);
  //scene.add(meshPhysics);
  if (enablePhysics) {
    phy.add({
      name: "plane" + planeNumber,
      type: "mesh",
      mesh: meshPhysics,
      pos: [
        meshPhysics.position.x,
        meshPhysics.position.y,
        meshPhysics.position.z,
      ],
      rot: [
        (meshPhysics.rotation.x * 180) / Math.PI,
        (meshPhysics.rotation.y * 180) / Math.PI,
        (meshPhysics.rotation.z * 180) / Math.PI,
      ],
      mass: 0,
      restitution: 0.2,
      friction: 0,
      debug: true,
      visible: false,
    });
    planeNumber = planeNumber + 1;
    //physics.addMesh(meshPhysics);
  }
}

/////////////////////
// Mesh-detection //
///////////////////

function addMeshDetectionJSON(data) {
  //console.log(data);

  //const geometry = new THREE.BoxGeometry(data.width, data.length, data.height);
  if (data.geometry.type == "BoxGeometry") {
    const x = data.width / 2;
    const y = data.length / 2;
    const z = data.height / 2;

    const material = new THREE.MeshLambertMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.5,
    });

    // create a buffer geometry
    const geometry = new THREE.BufferGeometry();

    // define vertices
    const vertices = new Float32Array([
      // front face
      -x,
      -y,
      z,
      x,
      -y,
      z,
      x,
      y,
      z,
      -x,
      y,
      z,
      // back face
      -x,
      -y,
      -z,
      -x,
      y,
      -z,
      x,
      y,
      -z,
      x,
      -y,
      -z,
    ]);

    // define indices
    const indices = new Uint16Array([
      0,
      1,
      2,
      0,
      2,
      3, // front face
      4,
      5,
      6,
      4,
      6,
      7, // back face
      3,
      2,
      6,
      3,
      6,
      5, // top face
      0,
      4,
      7,
      0,
      7,
      1, // bottom face
      1,
      7,
      6,
      1,
      6,
      2, // right face
      0,
      3,
      5,
      0,
      5,
      4, // left face
    ]);

    // define normals
    const normals = new Float32Array([
      // front face
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      // back face
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    ]);

    // add attributes to geometry
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3)); //24
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    //geometry.setDrawRange(0, 0);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.setFromMatrixPosition(data.matrix);
    mesh.quaternion.setFromRotationMatrix(data.matrix);
    mesh.name = "furniture";
    furnitureGroup.add(mesh);

    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    line.position.setFromMatrixPosition(data.matrix);
    line.quaternion.setFromRotationMatrix(data.matrix);
    lineGroup.add(line);

    var centerMesh = getCenterPoint(mesh);

    const geometryPhysics = new THREE.BoxGeometry(
      data.width,
      data.length,
      data.height
    );

    const meshPhysics = new THREE.Mesh(geometryPhysics, material);
    meshPhysics.position.setFromMatrixPosition(data.matrix);
    meshPhysics.quaternion.setFromRotationMatrix(data.matrix);
    if (enablePhysics) {
      phy.add({
        name: "mesh" + meshNumber,
        type: "mesh",
        mesh: mesh,
        pos: [mesh.position.x, mesh.position.y, mesh.position.z],
        rot: [
          (mesh.rotation.x * 180) / Math.PI,
          (mesh.rotation.y * 180) / Math.PI,
          (mesh.rotation.z * 180) / Math.PI,
        ],
        mass: 0,
        restitution: 0.2,
        friction: 0,
        debug: true,
        visible: false,
      });
      meshNumber = meshNumber + 1;
    }
  }
  if (data.geometry.type == "BufferGeometry") {
    const material = new THREE.MeshBasicMaterial({
      //wireframe: true,
      colorWrite: false,
      renderOrder: 2,
    });
    const material2 = new THREE.MeshBasicMaterial({
      wireframe: true,
    });

    // create a buffer geometry
    const mesh = new THREE.Mesh(data.geometry, material);
    const wiremesh = new THREE.Mesh(data.geometry, material2);
    mesh.position.setFromMatrixPosition(data.matrix);
    mesh.quaternion.setFromRotationMatrix(data.matrix);
    wiremesh.position.setFromMatrixPosition(data.matrix);
    wiremesh.quaternion.setFromRotationMatrix(data.matrix);
    scene.add(mesh);
    furnitureGroup.add(wiremesh);
    //physics.addMesh(mesh);
  }
}

function addPhysicsDetectionJSON(data) {
  console.log(data);

  //const geometry = new THREE.BoxGeometry(data.width, data.length, data.height);
  if (data.geometry.type == "BoxGeometry") {
    const x = data.width / 2;
    const y = data.length / 2;
    const z = data.height / 2;

    const material = new THREE.MeshLambertMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.5,
    });

    // create a buffer geometry
    const geometry = new THREE.BufferGeometry();

    // define vertices
    const vertices = new Float32Array([
      // front face
      -x,
      -y,
      z,
      x,
      -y,
      z,
      x,
      y,
      z,
      -x,
      y,
      z,
      // back face
      -x,
      -y,
      -z,
      -x,
      y,
      -z,
      x,
      y,
      -z,
      x,
      -y,
      -z,
    ]);

    // define indices
    const indices = new Uint16Array([
      0,
      1,
      2,
      0,
      2,
      3, // front face
      4,
      5,
      6,
      4,
      6,
      7, // back face
      3,
      2,
      6,
      3,
      6,
      5, // top face
      0,
      4,
      7,
      0,
      7,
      1, // bottom face
      1,
      7,
      6,
      1,
      6,
      2, // right face
      0,
      3,
      5,
      0,
      5,
      4, // left face
    ]);

    // define normals
    const normals = new Float32Array([
      // front face
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      // back face
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    ]);

    // add attributes to geometry
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3)); //24
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    //geometry.setDrawRange(0, 0);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.setFromMatrixPosition(data.matrix);
    mesh.quaternion.setFromRotationMatrix(data.matrix);
    mesh.name = "furniture";
    //furnitureGroup.add(mesh);

    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    line.position.setFromMatrixPosition(data.matrix);
    line.quaternion.setFromRotationMatrix(data.matrix);
    //lineGroup.add(line);

    var centerMesh = getCenterPoint(mesh);

    const geometryPhysics = new THREE.BoxGeometry(
      data.width,
      data.length,
      data.height
    );

    const meshPhysics = new THREE.Mesh(geometryPhysics, material);
    meshPhysics.position.setFromMatrixPosition(data.matrix);
    meshPhysics.quaternion.setFromRotationMatrix(data.matrix);
    if (enablePhysics) {
      phy.add({
        name: "mesh" + meshNumber,
        type: "mesh",
        mesh: mesh,
        pos: [mesh.position.x, mesh.position.y, mesh.position.z],
        rot: [
          (mesh.rotation.x * 180) / Math.PI,
          (mesh.rotation.y * 180) / Math.PI,
          (mesh.rotation.z * 180) / Math.PI,
        ],
        mass: 0,
        restitution: 0.2,
        friction: 0,
        debug: true,
        visible: false,
      });
      meshNumber = meshNumber + 1;
    }
  }
}

function createGeometry(vertices, indices) {
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

///////////////////////////////////////
// Teleport Camera and User Controls //
///////////////////////////////////////

function dollyMove() {
  var handedness = "unknown";
  var emitPrinter = false;

  //determine if we are in an xr session
  const session = renderer.xr.getSession();
  let i = 0;

  if (session) {
    let xrCamera = renderer.xr.getCamera(camera);
    xrCamera.getWorldDirection(cameraVector);

    //a check to prevent console errors if only one input source
    if (isIterable(session.inputSources)) {
      for (const source of session.inputSources) {
        if (source && source.handedness) {
          handedness = source.handedness; //left or right controllers
        }
        if (!source.gamepad) continue;
        const controller = renderer.xr.getController(i++);
        const old = prevGamePads.get(source);
        const data = {
          handedness: handedness,
          buttons: source.gamepad.buttons.map((b) => b.value),
          axes: source.gamepad.axes.slice(0),
        };
        if (data !== old) {
          if (
            data.buttons[4] == 1 &&
            old.buttons[4] == 0 &&
            data.handedness == "left"
          ) {
            calibrationMode = !calibrationMode;
          }

          if (
            data.buttons[4] == 1 &&
            old.buttons[4] == 0 &&
            data.handedness == "right"
          ) {
            printerMode = !printerMode;
          }

          if (
            data.buttons[5] == 1 &&
            old.buttons[5] == 0 &&
            data.handedness == "right"
          ) {
            stopPrintingFunction();
          }

          //////////////////////////////////////////////
          //  axes[0] = placeholder,
          //  axes[1] = placeholder,
          //  axes[2] = thumbstick x-axis,
          //  axes[3] = thumbstick y-axis,
          //  button[0] = Trigger,
          //  button[1] = Squeeze,
          //  button[2] = placeholder,
          //  button[3] = thumbstick press,
          //  button[4] = left: x, right: a,
          //  button[5] = left: y, right: b
          //////////////////////////////////////////////

          if (old) {
            data.buttons.forEach((value, i) => {
              //handlers for buttons
              if (value !== old.buttons[i] || Math.abs(value) > 0.8) {
                //check if it is 'all the way pushed'
                if (value === 1) {
                  //console.log("Button" + i + "Down");
                  if (data.handedness == "left") {
                    if (i == 1 && calibrationMode == 1) {
                      myRot.y = 0;
                      myRot.y += THREE.MathUtils.degToRad(0.015);
                      teleportCamera();
                    }
                  } else {
                    //console.log("Right Paddle Down");
                    if (i == 1 && calibrationMode == 1) {
                      myRot.y = 0;
                      myRot.y -= THREE.MathUtils.degToRad(0.015);
                      teleportCamera();
                    }
                  }
                }
              }
            });

            data.axes.forEach((value, i) => {
              //handlers for thumbsticks
              //if thumbstick axis has moved beyond the minimum threshold from center, windows mixed reality seems to wander up to about .17 with no input
              speedFactor[i] = 0.001;
              if (Math.abs(value) > 0.2) {
                //set the speedFactor per axis, with acceleration when holding above threshold, up to a max speed
                //speedFactor[i] > 1
                //  ? (speedFactor[i] = 1)
                //  : (speedFactor[i] *= 1.001);
                //console.log(value, speedFactor[i], i);
                if (i == 2) {
                  //left and right axis on thumbsticks
                  if (data.handedness == "left") {
                    // (data.axes[2] > 0) ? console.log('left on left thumbstick') : console.log('right on left thumbstick')

                    //move our dolly
                    //we reverse the vectors 90degrees so we can do straffing side to side movement
                    if (calibrationMode) {
                      myPos.x = 0;
                      myPos.x += speedFactor[i] * data.axes[2];
                      teleportCamera();
                    } else if (!calibrationMode) {
                      ender3HotEndGroup.position.z +=
                        speedFactor[i] * data.axes[2];
                      if (ender3HotEndGroup.position.z < 0) {
                        ender3HotEndGroup.position.z = 0;
                      } else if (ender3HotEndGroup.position.z > 0.69) {
                        ender3HotEndGroup.position.z = 0.69;
                      }
                      emitPrinter = true;
                      updateFilament();
                    }

                    //provide haptic feedback if available in browser
                    if (
                      source.gamepad.hapticActuators &&
                      source.gamepad.hapticActuators[0]
                    ) {
                      var pulseStrength = Math.abs(data.axes[2]); // + Math.abs(data.axes[3]);
                      if (pulseStrength > 0.75) {
                        pulseStrength = 0.75;
                      }

                      var didPulse = source.gamepad.hapticActuators[0].pulse(
                        pulseStrength,
                        100
                      );
                    }
                  } else {
                    // (data.axes[2] > 0) ? console.log('left on right thumbstick') : console.log('right on right thumbstick')
                    //dolly.rotateY(-THREE.MathUtils.degToRad(data.axes[2]));
                    //                   dolly.position.x -=
                    //   cameraVector.x * speedFactor[i] * data.axes[2];
                    //  dolly.position.x -=
                    //    cameraVector.x * speedFactor[i] * data.axes[2];
                  }
                  controls.update();
                }

                if (i == 3) {
                  //up and down axis on thumbsticks
                  if (data.handedness == "left") {
                    // (data.axes[3] > 0) ? console.log('up on left thumbstick') : console.log('down on left thumbstick')
                    // dolly.position.z += speedFactor[i] * data.axes[3];
                    //provide haptic feedback if available in browser
                    if (calibrationMode) {
                      myPos.z = 0;
                      myPos.z += speedFactor[i] * data.axes[3];
                      teleportCamera();
                    } else if (!calibrationMode) {
                      ender3YAxisGroup.position.x -=
                        speedFactor[i] * data.axes[3];
                      if (ender3YAxisGroup.position.x > 0) {
                        ender3YAxisGroup.position.x = 0;
                      } else if (ender3YAxisGroup.position.x < -0.69) {
                        ender3YAxisGroup.position.x = -0.69;
                      }
                      emitPrinter = true;
                      updateFilament();
                    }
                    if (
                      source.gamepad.hapticActuators &&
                      source.gamepad.hapticActuators[0]
                    ) {
                      var pulseStrength = Math.abs(data.axes[3]);
                      if (pulseStrength > 0.75) {
                        pulseStrength = 0.75;
                      }
                      var didPulse = source.gamepad.hapticActuators[0].pulse(
                        pulseStrength,
                        100
                      );
                    }
                  } else {
                    if (calibrationMode) {
                      myPos.y = 0;
                      myPos.y += speedFactor[i] * data.axes[3];
                      teleportCamera();
                    } else if (!calibrationMode) {
                      ender3XAxisGroup.position.y +=
                        speedFactor[i] * -data.axes[3];
                      if (ender3XAxisGroup.position.y < 0) {
                        ender3XAxisGroup.position.y = 0;
                      } else if (ender3XAxisGroup.position.y > 0.785) {
                        ender3XAxisGroup.position.y = 0.785;
                      }
                      emitPrinter = true;
                      updateFilament();
                    }

                    //provide haptic feedback if available in browser
                    if (
                      source.gamepad.hapticActuators &&
                      source.gamepad.hapticActuators[0]
                    ) {
                      var pulseStrength =
                        Math.abs(data.axes[2]) + Math.abs(data.axes[3]);
                      if (pulseStrength > 0.75) {
                        pulseStrength = 0.75;
                      }
                      var didPulse = source.gamepad.hapticActuators[0].pulse(
                        pulseStrength,
                        100
                      );
                    }
                  }
                  controls.update();
                }
              } else {
                //axis below threshold - reset the speedFactor if it is greater than zero  or 0.025 but below our threshold
                if (Math.abs(value) > 0.025) {
                  speedFactor[i] = 0.001;
                }
              }
            });
          }
          ///store this frames data to compate with in the next frame
          prevGamePads.set(source, data);
        }
      }
    }
  }
  if (emitPrinter) {
    socket.emit("updatePrinterPositionToServer", {
      hotEndZ: ender3HotEndGroup.position.z,
      yAxisX: ender3YAxisGroup.position.x,
      xAxisY: ender3XAxisGroup.position.y,
    });
  }
}

function isIterable(obj) {
  //function to check if object is iterable
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === "function";
}

function teleportCamera() {
  const offsetPosition = { x: myPos.x, y: myPos.y, z: myPos.z, w: 1 };
  const euler = new THREE.Euler(myRot.x, myRot.y, myRot.z, "XYZ");
  const offsetRotation = new THREE.Quaternion();
  offsetRotation.setFromEuler(euler);
  const transform = new XRRigidTransform(offsetPosition, offsetRotation);
  const teleportSpaceOffset =
    baseReferenceSpace.getOffsetReferenceSpace(transform);

  renderer.xr.setReferenceSpace(teleportSpaceOffset);
  baseReferenceSpace = teleportSpaceOffset;
  myPos.x = 0;
  myPos.y = 0;
  myPos.z = 0;
  myRot.x = 0;
  myRot.y = 0;
  myRot.z = 0;
}

function teleportCameraCalibrate() {
  const offsetPosition = { x: myPos.x, y: myPos.y, z: myPos.z, w: 1 };
  const euler = new THREE.Euler(0, 0, 0, "XYZ");
  const offsetRotation = new THREE.Quaternion();
  offsetRotation.setFromEuler(euler);
  const transform = new XRRigidTransform(offsetPosition, offsetRotation);
  const teleportSpaceOffset =
    baseReferenceSpace.getOffsetReferenceSpace(transform);

  renderer.xr.setReferenceSpace(teleportSpaceOffset);
  baseReferenceSpace = teleportSpaceOffset;
  myPos.x = 0;
  myPos.y = 0;
  myPos.z = 0;
  updateRot = true;
}

function rotateCamera() {
  const offsetPosition = { x: myPos.x, y: myPos.y, z: myPos.z, w: 1 };
  const offsetRotation = { x: myRot.x, y: myRot.y, z: myRot.z, w: 1 };
  //const offsetRotationQuat = new THREE.Quaternion();
  //offsetRotationQuat.setFromEuler(offsetRotation);
  const transform = new XRRigidTransform(offsetPosition, offsetRotation);
  const teleportSpaceOffset =
    baseReferenceSpace.getOffsetReferenceSpace(transform);

  renderer.xr.setReferenceSpace(teleportSpaceOffset);
  baseReferenceSpace = teleportSpaceOffset;
  //myPos.x = 0;
  //myPos.y = 0;
  //myPos.z = 0;
  myRot.x = 0;
  myRot.y = 0;
  myRot.z = 0;
}

//////////////////////////////
// Export the scene to JSON //
//////////////////////////////

function saveScene(event) {
  console.log(event);
  const link = document.createElement("a");
  function save(blob, filename) {
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }

    link.href = URL.createObjectURL(blob);
    link.download = filename || "data.json";
    link.dispatchEvent(new MouseEvent("click"));
  }

  function saveString(text, filename) {
    save(new Blob([text], { type: "text/plain" }), filename);
  }

  if (true) {
    switch (event.key) {
      case "s":
        if (spheres) {
          spheres.geometry.dispose();
          spheres.material.dispose();
          scene.remove(spheres);
        }
        if (controller) {
          scene.remove(controller);
        }
        if (controller1) {
          scene.remove(controller1);
        }

        if (controller2) {
          scene.remove(controller2);
        }

        if (controllerGrip1) {
          //controllerGrip1.geometry.dispose();
          //controllerGrip1.material.dispose();
          scene.remove(controllerGrip1);
        }

        if (controllerGrip2) {
          //controllerGrip2.geometry.dispose();
          //controllerGrip2.material.dispose();
          scene.remove(controllerGrip2);
        }
        if (lineGroup) {
          lineGroup.traverse((lineGroup) => lineGroup.dispose?.());
          //lineGroup.geometry.dispose();
          //lineGroup.material.dispose();
          scene.remove(lineGroup);
        }

        if (reticle) {
          reticle.geometry.dispose();
          reticle.material.dispose();
          scene.remove(reticle);
        }

        let output = scene.toJSON();

        try {
          output = JSON.stringify(output, null, "\t");
          output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, "$1");
        } catch (e) {
          output = JSON.stringify(output);
        }

        saveString(output, "scene.json");

        let outputRef = baseReferenceSpace;

        try {
          outputRef = JSON.stringify(outputRef, null, "\t");
          outputRef = outputRef.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, "$1");
        } catch (e) {
          outputRef = JSON.stringify(outputRef);
        }

        saveString(outputRef, "referenceSpace.json");

        break;
    }
  }
}

function makeButtonMesh(x, y, z, color) {
  const geometry = new THREE.BoxGeometry(x, y, z);
  const material = new THREE.MeshPhongMaterial({ color: color });
  const buttonMesh = new THREE.Mesh(geometry, material);
  return buttonMesh;
}

function stlButtonPressed() {
  stlButton.material.color.setHex(selectedColor);
  wireframeButton.material.color.setHex(unselectedColor);
  gcodeButton.material.color.setHex(unselectedColor);
  gcodeExtrudeButton.material.color.setHex(unselectedColor);
  gcodeTravelButton.material.color.setHex(unselectedColor);
  gcodeSupportButton.material.color.setHex(unselectedColor);
  gcodeTreeButton.material.color.setHex(unselectedColor);

  stlMeshBoat.visible = true;
  wireframeMeshBoat.visible = false;
  gcodeMeshBoat.visible = false;
  gcodeMeshBoatLayer.visible = false;

  stlMeshTest.visible = true;
  wireframeMeshTest.visible = false;
  gcodeMeshTest.visible = false;
  gcodeMeshTestTree.visible = false;
  gcodeMeshTestLayer.visible = false;

  stlMeshOwl.visible = true;
  wireframeMeshOwl.visible = false;
  gcodeMeshOwl.visible = false;
  gcodeMeshOwlTree.visible = false;
  gcodeMeshOwlLayer.visible = false;
  console.log("STL button pressed");
}
function coverButtonPressed() {
  cover.visible = !cover.visible;
}

function fansButtonPressed() {
  fans.visible = !fans.visible;
}

function heatsinkButtonPressed() {
  heatsink.visible = !heatsink.visible;
  tube.visible = !tube.visible;
  block.visible = !block.visible;
}

function wireframeButtonPressed() {
  stlButton.material.color.setHex(unselectedColor);
  wireframeButton.material.color.setHex(selectedColor);
  gcodeButton.material.color.setHex(unselectedColor);
  gcodeExtrudeButton.material.color.setHex(unselectedColor);
  gcodeTravelButton.material.color.setHex(unselectedColor);
  gcodeSupportButton.material.color.setHex(unselectedColor);
  gcodeTreeButton.material.color.setHex(unselectedColor);
  stlMeshBoat.visible = false;
  wireframeMeshBoat.visible = true;
  gcodeMeshBoat.visible = false;
  gcodeMeshBoatLayer.visible = false;
  stlMeshTest.visible = false;
  wireframeMeshTest.visible = true;
  gcodeMeshTest.visible = false;
  gcodeMeshTestTree.visible = false;
  gcodeMeshTestLayer.visible = false;
  stlMeshOwl.visible = false;
  wireframeMeshOwl.visible = true;
  gcodeMeshOwl.visible = false;
  gcodeMeshOwlTree.visible = false;
  gcodeMeshOwlLayer.visible = false;

  console.log("Wireframe button pressed");
}

function gcodeButtonPressed() {
  stlButton.material.color.setHex(unselectedColor);
  wireframeButton.material.color.setHex(unselectedColor);
  gcodeButton.material.color.setHex(selectedColor);
  gcodeExtrudeButton.material.color.setHex(unselectedColor);
  gcodeTravelButton.material.color.setHex(unselectedColor);
  gcodeSupportButton.material.color.setHex(unselectedColor);
  gcodeTreeButton.material.color.setHex(unselectedColor);
  //stlMesh.material.wireframe = false;
  stlMeshBoat.visible = false;
  wireframeMeshBoat.visible = false;
  gcodeMeshBoat.visible = true;
  //gcodeMeshBoat.children[0].visible = true;
  //gcodeMeshBoat.children[1].visible = false;
  gcodeMeshBoatLayer.visible = false;
  stlMeshTest.visible = false;
  wireframeMeshTest.visible = false;
  gcodeMeshTest.visible = true;
  //gcodeMeshTest.children[0].visible = true;
  //gcodeMeshTest.children[1].visible = false;
  //gcodeMeshTest.children[2].visible = true;
  gcodeMeshTestLayer.visible = false;
  stlMeshOwl.visible = false;
  wireframeMeshOwl.visible = false;
  gcodeMeshOwl.visible = true;
  //gcodeMeshOwl.children[0].visible = true;
  //gcodeMeshOwl.children[1].visible = false;
  //gcodeMeshOwl.children[2].visible = true;
  gcodeMeshOwlLayer.visible = false;

  console.log("G-code button pressed");
}

function gcodeExtrudeButtonPressed() {
  stlButton.material.color.setHex(unselectedColor);
  wireframeButton.material.color.setHex(unselectedColor);
  gcodeButton.material.color.setHex(unselectedColor);
  gcodeExtrudeButton.material.color.setHex(selectedColor);
  gcodeTravelButton.material.color.setHex(unselectedColor);
  gcodeSupportButton.material.color.setHex(unselectedColor);
  gcodeTreeButton.material.color.setHex(unselectedColor);
  //stlMesh.material.wireframe = false;

  gcodeMeshBoatLayer.visible = false;
  gcodeMeshTestLayer.visible = false;
  gcodeMeshOwlLayer.visible = false;
  if (activeMesh === "boat") {
    if (!gcodeMeshBoat.visible) {
      gcodeMeshBoat.visible = true;
      gcodeMeshBoat.children[0].visible = true;
    } else {
      gcodeMeshBoat.children[0].visible = !gcodeMeshBoat.children[0].visible;
    }
  } else if (activeMesh === "test") {
    if (!gcodeMeshTest.visible) {
      gcodeMeshTest.visible = true;
      gcodeMeshTest.children[0].visible = true;
    } else {
      gcodeMeshTest.children[0].visible = !gcodeMeshTest.children[0].visible;
    }
  } else if (activeMesh === "owl") {
    if (!gcodeMeshOwl.visible) {
      gcodeMeshOwl.visible = true;
      gcodeMeshOwl.children[0].visible = true;
    } else {
      gcodeMeshOwl.children[0].visible = !gcodeMeshOwl.children[0].visible;
    }
  }

  //gcodeMesh.children[1].visible = false;
  //gcodeMesh.children[2].visible = false;
  gcodeMeshBoatLayer.visible = false;
  console.log("G-code Extrude button pressed");
}

function gcodeTravelButtonPressed() {
  stlButton.material.color.setHex(unselectedColor);
  wireframeButton.material.color.setHex(unselectedColor);
  gcodeButton.material.color.setHex(unselectedColor);
  gcodeExtrudeButton.material.color.setHex(unselectedColor);
  gcodeTravelButton.material.color.setHex(selectedColor);
  gcodeSupportButton.material.color.setHex(unselectedColor);
  gcodeTreeButton.material.color.setHex(unselectedColor);
  //stlMesh.material.wireframe = false;

  gcodeMeshBoatLayer.visible = false;
  gcodeMeshTestLayer.visible = false;
  gcodeMeshOwlLayer.visible = false;
  if (activeMesh === "boat") {
    if (!gcodeMeshBoat.visible) {
      gcodeMeshBoat.visible = true;
      gcodeMeshBoat.children[1].visible = true;
    } else {
      gcodeMeshBoat.children[1].visible = !gcodeMeshBoat.children[1].visible;
    }
  } else if (activeMesh === "test") {
    if (!gcodeMeshTest.visible) {
      gcodeMeshTest.visible = true;
      gcodeMeshTest.children[1].visible = true;
    } else {
      gcodeMeshTest.children[1].visible = !gcodeMeshTest.children[1].visible;
    }
  } else if (activeMesh === "owl") {
    if (!gcodeMeshOwl.visible) {
      gcodeMeshOwl.visible = true;
      gcodeMeshOwl.children[1].visible = true;
    } else {
      gcodeMeshOwl.children[1].visible = !gcodeMeshOwl.children[1].visible;
    }
  }
  //gcodeMesh.children[2].visible = false;
  gcodeMeshBoatLayer.visible = false;
  console.log("G-code Travel button pressed");
}
function gcodeSupportButtonPressed() {
  stlButton.material.color.setHex(unselectedColor);
  wireframeButton.material.color.setHex(unselectedColor);
  gcodeButton.material.color.setHex(unselectedColor);
  gcodeExtrudeButton.material.color.setHex(unselectedColor);
  gcodeTravelButton.material.color.setHex(unselectedColor);
  gcodeSupportButton.material.color.setHex(selectedColor);
  gcodeTreeButton.material.color.setHex(unselectedColor);
  //stlMesh.material.wireframe = false;

  gcodeMeshBoatLayer.visible = false;
  gcodeMeshTestLayer.visible = false;
  gcodeMeshOwlLayer.visible = false;
  if (activeMesh === "boat") {
    gcodeMeshBoat.visible = true;
  } else if (activeMesh === "test") {
    if (!gcodeMeshTest.visible) {
      gcodeMeshTest.visible = true;
      gcodeMeshTest.children[2].visible = true;
    } else {
      gcodeMeshTest.children[2].visible = !gcodeMeshTest.children[2].visible;
    }
  } else if (activeMesh === "owl") {
    if (!gcodeMeshOwl.visible) {
      gcodeMeshOwl.visible = true;
      gcodeMeshOwl.children[2].visible = true;
    } else {
      gcodeMeshOwl.children[2].visible = !gcodeMeshOwl.children[2].visible;
    }
  }
  gcodeMeshBoatLayer.visible = false;
  gcodeMeshOwlTree.visible = false;
  gcodeMeshTestTree.visible = false;
  console.log("G-code Travel button pressed");
}
function gcodeTreeButtonPressed() {
  stlButton.material.color.setHex(unselectedColor);
  wireframeButton.material.color.setHex(unselectedColor);
  gcodeButton.material.color.setHex(unselectedColor);
  gcodeExtrudeButton.material.color.setHex(unselectedColor);
  gcodeTravelButton.material.color.setHex(unselectedColor);
  gcodeSupportButton.material.color.setHex(unselectedColor);
  gcodeTreeButton.material.color.setHex(selectedColor);
  //stlMesh.material.wireframe = false;
  gcodeMeshBoatLayer.visible = false;
  gcodeMeshTestLayer.visible = false;
  gcodeMeshOwlLayer.visible = false;
  if (activeMesh === "boat") {
    gcodeMeshBoat.visible = true;
  } else if (activeMesh === "test") {
    if (!gcodeMeshTestTree.visible) {
      gcodeMeshTestTree.visible = true;
      gcodeMeshTestTree.children[2].visible = true;
    } else {
      gcodeMeshTestTree.children[2].visible =
        !gcodeMeshTestTree.children[2].visible;
    }
  } else if (activeMesh === "owl") {
    if (!gcodeMeshOwlTree.visible) {
      gcodeMeshOwlTree.visible = true;
      gcodeMeshOwlTree.children[2].visible = true;
    } else {
      gcodeMeshOwlTree.children[2].visible =
        !gcodeMeshOwlTree.children[2].visible;
    }
  }
  gcodeMeshOwl.children[2].visible = false;
  gcodeMeshTest.children[2].visible = false;
  gcodeMeshBoatLayer.visible = false;
  console.log("G-code Travel button pressed");
}

function hideRoomButtonPressed() {
  lineGroup.visible = !lineGroup.visible;
  furnitureGroup.visible = !furnitureGroup.visible;
}

/////////////////////////
//  Button Functions  //
///////////////////////

function gcodeLayerMinusPressed() {
  stlMeshBoat.visible = false;
  wireframeMeshBoat.visible = false;
  gcodeMeshBoat.visible = false;
  gcodeMeshBoatLayer.visible = true;
  stlMeshTest.visible = false;
  wireframeMeshTest.visible = false;
  gcodeMeshTest.visible = false;
  gcodeMeshTestTree.visible = false;
  gcodeMeshTestLayer.visible = true;
  stlMeshOwl.visible = false;
  wireframeMeshOwl.visible = false;
  gcodeMeshOwl.visible = false;
  gcodeMeshOwlTree.visible = false;
  gcodeMeshOwlLayer.visible = true;
  gcodeLayer -= 1;
  if (gcodeLayer < 0) {
    gcodeLayer = 0;
  }
  if (activeMesh === "boat") {
    for (let i = 0; i < gcodeMeshBoatLayer.children.length; i++) {
      var dynamicVariableName = "layer" + gcodeLayer;
      var layerName = gcodeMeshBoatLayer.children[i].name;
      //console.log(layerName);
      if (layerName === dynamicVariableName) {
        gcodeMeshBoatLayer.children[i].visible = true;
      }
      if (layerName !== dynamicVariableName) {
        gcodeMeshBoatLayer.children[i].visible = false;
      }
    }
  }
  if (activeMesh === "test") {
    for (let i = 0; i < gcodeMeshTestLayer.children.length; i++) {
      var dynamicVariableName = "layer" + gcodeLayer;
      var layerName = gcodeMeshTestLayer.children[i].name;
      //console.log(layerName);
      if (layerName === dynamicVariableName) {
        gcodeMeshTestLayer.children[i].visible = true;
      }
      if (layerName !== dynamicVariableName) {
        gcodeMeshTestLayer.children[i].visible = false;
      }
    }
  }
  if (activeMesh === "owl") {
    for (let i = 0; i < gcodeMeshOwlLayer.children.length; i++) {
      var dynamicVariableName = "layer" + gcodeLayer;
      var layerName = gcodeMeshOwlLayer.children[i].name;
      //console.log(layerName);
      if (layerName === dynamicVariableName) {
        gcodeMeshOwlLayer.children[i].visible = true;
      }
      if (layerName !== dynamicVariableName) {
        gcodeMeshOwlLayer.children[i].visible = false;
      }
    }
  }
}

function gcodeLayerPlusPressed() {
  stlMeshBoat.visible = false;
  wireframeMeshBoat.visible = false;
  gcodeMeshBoat.visible = false;
  gcodeMeshBoatLayer.visible = true;
  stlMeshTest.visible = false;
  wireframeMeshTest.visible = false;
  gcodeMeshTest.visible = false;
  gcodeMeshTestTree.visible = false;
  gcodeMeshTestLayer.visible = true;
  stlMeshOwl.visible = false;
  wireframeMeshOwl.visible = false;
  gcodeMeshOwl.visible = false;
  gcodeMeshOwlTree.visible = false;
  gcodeMeshOwlLayer.visible = true;
  gcodeLayer += 1;

  if (activeMesh === "boat") {
    for (let i = 0; i < gcodeMeshBoatLayer.children.length; i++) {
      var dynamicVariableName = "layer" + gcodeLayer;
      var layerName = gcodeMeshBoatLayer.children[i].name;
      if (layerName === dynamicVariableName) {
        gcodeMeshBoatLayer.children[i].visible = true;
      }
      if (layerName !== dynamicVariableName) {
        gcodeMeshBoatLayer.children[i].visible = false;
      }
    }
  }
  if (activeMesh === "test") {
    for (let i = 0; i < gcodeMeshTestLayer.children.length; i++) {
      var dynamicVariableName = "layer" + gcodeLayer;
      var layerName = gcodeMeshTestLayer.children[i].name;
      if (layerName === dynamicVariableName) {
        gcodeMeshTestLayer.children[i].visible = true;
      }
      if (layerName !== dynamicVariableName) {
        gcodeMeshTestLayer.children[i].visible = false;
      }
    }
  }
  if (activeMesh === "owl") {
    for (let i = 0; i < gcodeMeshOwlLayer.children.length; i++) {
      var dynamicVariableName = "layer" + gcodeLayer;
      var layerName = gcodeMeshOwlLayer.children[i].name;
      if (layerName === dynamicVariableName) {
        gcodeMeshOwlLayer.children[i].visible = true;
      }
      if (layerName !== dynamicVariableName) {
        gcodeMeshOwlLayer.children[i].visible = false;
      }
    }
  }
}

function gcodeLayerTogglePressed() {
  if (
    gcodeMeshBoatLayer.visible ||
    gcodeMeshTestLayer.visible ||
    gcodeMeshOwlLayer.visible
  ) {
    stlMeshBoat.visible = false;
    wireframeMeshBoat.visible = false;
    gcodeMeshBoat.visible = true;
    gcodeMeshBoatLayer.visible = false;
    stlMeshTest.visible = false;
    wireframeMeshTest.visible = false;
    gcodeMeshTest.visible = true;
    gcodeMeshTestLayer.visible = false;
    if (gcodeMeshTestTree.children[2].visible) {
      gcodeMeshTestTree.visible = true;
    }
    stlMeshOwl.visible = false;
    wireframeMeshOwl.visible = false;
    gcodeMeshOwl.visible = true;
    if (gcodeMeshOwlTree.children[2].visible) {
      gcodeMeshOwlTree.visible = true;
    }
    gcodeMeshOwlLayer.visible = false;
  } else {
    stlMeshBoat.visible = false;
    wireframeMeshBoat.visible = false;
    gcodeMeshBoat.visible = false;
    gcodeMeshBoatLayer.visible = true;
    stlMeshTest.visible = false;
    wireframeMeshTest.visible = false;
    gcodeMeshTest.visible = false;
    gcodeMeshTestTree.visible = false;
    gcodeMeshTestLayer.visible = true;
    stlMeshOwl.visible = false;
    wireframeMeshOwl.visible = false;
    gcodeMeshOwl.visible = false;
    gcodeMeshOwlTree.visible = false;
    gcodeMeshOwlLayer.visible = true;
  }
  if (activeMesh === "boat") {
    for (let i = 0; i < gcodeMeshBoatLayer.children.length; i++) {
      var dynamicVariableName = "layer" + gcodeLayer;
      var layerName = gcodeMeshBoatLayer.children[i].name;
      if (layerName === dynamicVariableName) {
        gcodeMeshBoatLayer.children[i].visible = true;
      }
      if (layerName !== dynamicVariableName) {
        gcodeMeshBoatLayer.children[i].visible = false;
      }
    }
  }
  if (activeMesh === "test") {
    for (let i = 0; i < gcodeMeshTestLayer.children.length; i++) {
      var dynamicVariableName = "layer" + gcodeLayer;
      var layerName = gcodeMeshTestLayer.children[i].name;
      if (layerName === dynamicVariableName) {
        gcodeMeshTestLayer.children[i].visible = true;
      }
      if (layerName !== dynamicVariableName) {
        gcodeMeshTestLayer.children[i].visible = false;
      }
    }
  }
  if (activeMesh === "owl") {
    for (let i = 0; i < gcodeMeshOwlLayer.children.length; i++) {
      var dynamicVariableName = "layer" + gcodeLayer;
      var layerName = gcodeMeshOwlLayer.children[i].name;
      if (layerName === dynamicVariableName) {
        gcodeMeshOwlLayer.children[i].visible = true;
      }
      if (layerName !== dynamicVariableName) {
        gcodeMeshOwlLayer.children[i].visible = false;
      }
    }
  }
}

function toggleBoat() {
  boatMeshes.visible = !boatMeshes.visible;
  testMeshes.visible = false;
  owlMeshes.visible = false;
  activeMesh = "boat";
  centerOfRotation.scale.set(1, 1, 1);
  if (boatMeshes.visible === false) {
    buttonGroup.visible = false;
  } else {
    buttonGroup.visible = true;
  }
}

function toggleTest() {
  testMeshes.visible = !testMeshes.visible;
  boatMeshes.visible = false;
  owlMeshes.visible = false;
  activeMesh = "test";
  centerOfRotation.scale.set(1, 1, 1);
  if (testMeshes.visible === false) {
    buttonGroup.visible = false;
  } else {
    buttonGroup.visible = true;
  }
}

function toggleOwl() {
  owlMeshes.visible = !owlMeshes.visible;
  console.log(owlMeshes.visible);
  testMeshes.visible = false;
  boatMeshes.visible = false;
  activeMesh = "owl";
  centerOfRotation.scale.set(1, 1, 1);
  if (owlMeshes.visible === false) {
    buttonGroup.visible = false;
  } else {
    buttonGroup.visible = true;
  }
}

function toggleGuide() {
  if (logFileTest) {
    endLog = 1;
  }
  logFileTest = !logFileTest;
}

function pauseGuide() {
  if (logFileTest) {
    voiceover.pause();
    pauseTime = Date.now();
    logFileTest = !logFileTest;
  } else {
    voiceover.play();
    startTime = startTime + (Date.now() - pauseTime);
    logFileTest = !logFileTest;
  }
}

function togglePhysics() {
  if (!enableBalls) {
    let count = 0;
    for (let i = 0; i < ballsLab; i++) {
      const material = new THREE.MeshLambertMaterial();
      var ballColor = i % 3;
      if (ballColor == 0) {
        material.color.setHex(0xb0b3b2);
      } else if (ballColor == 1) {
        material.color.setHex(0x231f20);
      } else if (ballColor == 2) {
        material.color.setHex(0xeec629);
      }
      //count = count + 1;
      phy.add({
        name: "sphere" + i,
        type: "sphere",
        size: [0.03],
        pos: [Math.random() * 3, 3, Math.random() * 3],
        mass: 0.1,
        material: material,
        restitution: 0.3,
        friction: 0,
        linearVelocity: [0, 0, 0],
      });
      enableBalls = true;
    }
  } else if (enableBalls) {
    for (let i = 0; i < ballsLab; i++) {
      phy.remove("sphere" + i);
    }
    enableBalls = false;
  }
  console.log(enableBalls);
}

function togglePrinter() {
  ender3Group.visible = !ender3Group.visible;
  lineFilament.visible = !lineFilament.visible;
  //desk.visible = !desk.visible;
  printerButtonGroup.visible = !printerButtonGroup.visible;
  // if (boatMeshes.visible === true && ender3Group.visible === true){
  //  boatMeshes.visible = false;
  //buttonGroup.visible = !buttonGroup.visible;
  // } else {
  //      boatMeshes.visible = true;
  // buttonGroup.visible = !buttonGroup.visible;
  // }
  //Checks if buttons are already hidden
  if (!enableBalls) {
    if (boatMeshes.visible) {
      // buttonGroup.visible = !buttonGroup.visible;
      //buttonGroup3.visible = !buttonGroup3.visible;
    }
  }
}

//////////////////////////
//  Printer Functions  //
////////////////////////

async function togglePrinterOn(index) {
  // We need to wrap the loop into an async function for this to work
  const timer = (ms) => new Promise((res) => setTimeout(res, ms));
  printing = 1;
  let printerPath = [];
  if (activeMesh == "test") {
    for (let i = 0; i < printerPathArray[0].length; i++) {
      printerPath.push(printerPathArray[0][i]);
    }
  }
  if (activeMesh == "owl") {
    // printerPath = printerPathArray[1];
  }
  if (activeMesh == "boat") {
    // printerPath = printerPathArray[2];
  }
  console.log(activeMesh);
  console.log(printerPath);
  var MAX_POINTS = printerPath.length; //Pre-set the number of vertexes needed in buffer memory
  var drawCount = 2;
  if (!lineBoatState) {
    // geometry
    var geometry = new THREE.BufferGeometry();

    // attributes
    var positions = new Float32Array(MAX_POINTS * 3 * 3); // 3 vertices per point, 2 points per line
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var colors = new Float32Array(MAX_POINTS * 3 * 3); //Start point color, end point color
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      linewidth: 1,
    });
    lineBoat = new THREE.Line(geometry, material);
    geometry.setDrawRange(0, drawCount);
    scene.add(lineBoat);
    lineBoatState = true;
  }

  let x1, y1, z1;
  let x2, y2, z2;
  let x3, y3, z3;

  const positionAttribute = lineBoat.geometry.getAttribute("position");
  const colorAttribute = lineBoat.geometry.getAttribute("color");

  ender3YAxisGroup.add(lineBoat);
  ender3HotEndGroup.children[1].material.opacity = 0.15;
  ender3HotEndGroup.children[2].material.opacity = 0.15;
  if (boatMeshes.visible) {
    toggleBoat();
  }
  if (testMeshes.visible) {
    toggleTest();
  }
  if (owlMeshes.visible) {
    toggleOwl();
  }

  for (let i = index; i < printerPath.length; i++) {
    // for (let i = 0; i < 3000; i++) {
    //if (printerPath[i].name === "extruding") {
    let j = i;
    let k = i + 1;
    (x1 = printerPath[i].p1y * 0.00314 + 0.04),
      (y1 = printerPath[i].p1z * 0.00314 + 0.737),
      (z1 = printerPath[i].p1x * 0.00314 + 0.2105);
    (x2 = printerPath[i].p2y * 0.00314 + 0.04),
      (y2 = printerPath[i].p2z * 0.00314 + 0.737),
      (z2 = printerPath[i].p2x * 0.00314 + 0.2105);
    (x3 = printerPath[j].p1y * 0.00314 + 0.04),
      (y3 = printerPath[j].p1z * 0.00314 + 0.737),
      (z3 = printerPath[j].p1x * 0.00314 + 0.2105);

    if (printerPath[i].name === "extruded" || printerPath[i].name === "path") {
      //z1 += 0.03;
      // z2 += 0.03;
      // z3 += 0.03;
    }

    let v1 = 3 * i;
    let v2 = 3 * i + 1;
    let v3 = 3 * i + 2;

    positionAttribute.setXYZ(v1, x1, y1, z1);
    positionAttribute.setXYZ(v2, x2, y2, z2);
    positionAttribute.setXYZ(v3, x3, y3, z3);

    if (printerPath[i].name === "extruded") {
      colorAttribute.setXYZ(v1, 0, 1, 0);
    } else if (printerPath[i].name === "path") {
      colorAttribute.setXYZ(v1, 1, 0, 0);
    } else if (printerPath[k].name === "support") {
      colorAttribute.setXYZ(v1, 1, 1, 1);
    }
    if (printerPath[j].name === "extruded") {
      colorAttribute.setXYZ(v2, 0, 1, 0);
    } else if (printerPath[j].name === "path") {
      colorAttribute.setXYZ(v2, 1, 0, 0);
    } else if (printerPath[k].name === "support") {
      colorAttribute.setXYZ(v2, 1, 1, 1);
    }
    if (i === printerPath.length - 1) {
      k = i;
    }
    if (printerPath[k].name === "extruded") {
      colorAttribute.setXYZ(v3, 0, 1, 0);
    } else if (printerPath[k].name === "path") {
      colorAttribute.setXYZ(v3, 1, 0, 0);
    } else if (printerPath[k].name === "support") {
      colorAttribute.setXYZ(v3, 1, 1, 1);
    }

    lineBoat.geometry.setDrawRange(0, v3);
    lineFilament.geometry.setDrawRange(0, 15);

    positionAttribute.needsUpdate = true; // required after the first render
    colorAttribute.needsUpdate = true;

    ender3XAxisGroup.position.y = printerPath[i].p1z * 0.00314;
    ender3YAxisGroup.position.x = -printerPath[i].p1y * 0.00314;
    ender3HotEndGroup.position.z = printerPath[i].p1x * 0.00314;
    updateFilament();

    if (
      printerPath[i].name === "extruded" ||
      printerPath[i].name === "support"
    ) {
      let ex = Math.abs(printerPath[i].p2x - printerPath[i].p1x);
      let ey = Math.abs(printerPath[i].p2y - printerPath[i].p1y);
      let ez = Math.abs(printerPath[i].p2z - printerPath[i].p1z);
      const rotateSpool = Math.sqrt(ex * ex + ey * ey + ez * ez) * 0.05; //multiple for rate of spin
      const spoolLength = 2 * 250 * Math.PI * 0.00314;
      const spoolRotation = (rotateSpool / spoolLength) * 2 * Math.PI;
      ender3SpoolMesh.rotation.x -= spoolRotation * 0.00314;
    }
    printerIndex = i;
    if (stopPrinting) {
      stopPrinting = !stopPrinting;
      printing = 0;
      break;
    }
    await timer(1); // then the created Promise can be awaited, lowest value is 1ms
  }
}

function pausePrinter() {
  if (printing) {
    stopPrinting = !stopPrinting;
  } else {
    togglePrinterOn(printerIndex);
  }
}

function stopPrintingFunction() {
  stopPrinting = !stopPrinting;
  socket.emit("stopPrintingToServer", "");
}

function updateFilament() {
  const positionAttributeFilament =
    lineFilament.geometry.getAttribute("position");

  positionAttributeFilament.setXYZ(0, 2.35, 4.9, -0.375);
  positionAttributeFilament.setXYZ(
    1,
    2.35,
    2 + ender3XAxisGroup.position.y * 3,
    0.2
  );
  positionAttributeFilament.setXYZ(
    2,
    2.35,
    1.8 + ender3XAxisGroup.position.y * 3,
    0.23
  );
  positionAttributeFilament.setXYZ(
    3,
    2.34,
    1.75 + ender3XAxisGroup.position.y * 3,
    0.3
  );
  positionAttributeFilament.setXYZ(
    4,
    2.38,
    1.735 + ender3XAxisGroup.position.y * 3,
    0.7
  );
  positionAttributeFilament.setXYZ(
    5,
    2.36,
    1.735 + ender3XAxisGroup.position.y * 3,
    1.0
  );
  positionAttributeFilament.setXYZ(
    6,
    2.29,
    1.73 + ender3XAxisGroup.position.y * 3,
    1.15
  );
  positionAttributeFilament.setXYZ(
    7,
    2.22,
    1.73 + ender3XAxisGroup.position.y * 3,
    1.3
  );
  positionAttributeFilament.setXYZ(
    8,
    2,
    1.73 + ender3XAxisGroup.position.y * 3,
    ender3HotEndGroup.position.z * 1.5 + 1
  );
  positionAttributeFilament.setXYZ(
    9,
    1.72,
    1.73 + ender3XAxisGroup.position.y * 3,
    ender3HotEndGroup.position.z * 3 + 0.63
  );
  positionAttributeFilament.setXYZ(
    10,
    1.65,
    1.7 + ender3XAxisGroup.position.y * 3,
    ender3HotEndGroup.position.z * 3 + 0.63
  );
  positionAttributeFilament.setXYZ(
    11,
    1.57,
    1.65 + ender3XAxisGroup.position.y * 3,
    ender3HotEndGroup.position.z * 3 + 0.63
  );
  positionAttributeFilament.setXYZ(
    12,
    1.53,
    1.6 + ender3HotEndGroup.position.y * 3 + ender3XAxisGroup.position.y * 3,
    ender3HotEndGroup.position.z * 3 + 0.63
  );
  positionAttributeFilament.setXYZ(
    13,
    1.523,
    1.47 + ender3HotEndGroup.position.y * 3 + ender3XAxisGroup.position.y * 3,
    0.63 + ender3HotEndGroup.position.z * 3
  );
  positionAttributeFilament.setXYZ(
    14,
    1.523,
    1 + ender3XAxisGroup.position.y * 3,
    0.63 + ender3HotEndGroup.position.z * 3
  );
  positionAttributeFilament.needsUpdate = true; // required after the first render
}

/////////////////////////////
// Data Logging Functions //
////////////////////////////

function splitWithNestedBraces(inputString) {
  //Generated with ChatGPT
  const result = [];
  let buffer = "";
  let depth = 0;

  for (const char of inputString) {
    if (char === "{") {
      depth++;
      buffer += char;
    } else if (char === "}") {
      depth--;
      buffer += char;
    } else if (char === "," && depth === 0) {
      result.push(buffer.trim());
      buffer = "";
    } else {
      buffer += char;
    }
  }

  if (buffer.trim() !== "") {
    result.push(buffer.trim());
  }

  return result;
}

function csvToArray(csv) {
  const rows = csv.split("\n");
  const result = [];

  for (const row of rows) {
    const values = splitWithNestedBraces(row);
    result.push(values);
  }
  csvData = result;
  return csvData;
}

//logCallFunction is called by the data log interpreter.
//It will call the local function, and then emits the socket call to the server.
//Data sent via JSON.stringify(data) will need JSON.parse(data)

function logCallFunction(emit, data) {
  if (emit == "stlButtonPressed") {
    stlButtonPressed(data);
  } else if (emit == "wireframeButtonPressed") {
    wireframeButtonPressed(data);
  } else if (emit == "gcodeButtonPressed") {
    gcodeButtonPressed(data);
  } else if (emit == "gcodeExtrudeButtonPressed") {
    gcodeExtrudeButtonPressed();
  } else if (emit == "gcodeTravelButtonPressed") {
    gcodeTravelButtonPressed();
  } else if (emit == "hideRoomButtonPressed") {
    hideRoomButtonPressed();
  } else if (emit == "gcodeSupportButtonPressed") {
    gcodeSupportButtonPressed();
  } else if (emit == "gcodeTreeButtonPressed") {
    gcodeTreeButtonPressed();
  } else if (emit == "rotateBoat") {
    let myData = JSON.parse(data);
    centerOfRotation.rotation.y = myData.centerOfRotationY;
  } else if (emit == "scaleBoat") {
    let myData = JSON.parse(data);
    centerOfRotation.scale.set(myData.x, myData.y, myData.z);
  } else if (emit == "toggleBoat") {
    toggleBoat();
  } else if (emit == "toggleTest") {
    toggleTest();
  } else if (emit == "toggleOwl") {
    toggleOwl();
  } else if (emit == "togglePrinter") {
    togglePrinter();
  } else if (emit == "pausePrinterToClient") {
    pausePrinter();
  } else if (emit == "togglePrinterOn") {
    if (!printing) {
      togglePrinterOn(0);
    }
  } else if (emit == "togglePhysics") {
    togglePhysics();
  } else if (emit == "updatePrinterPositionToClient") {
    let myData = JSON.parse(data);
    ender3HotEndGroup.position.z = myData.hotEndZ;
    ender3YAxisGroup.position.x = myData.yAxisX;
    ender3XAxisGroup.position.y = myData.xAxisY;
    updateFilament();
  } else if (emit == "gcodeLayerPlusActionToClient") {
    gcodeLayerPlusPressed();
  } else if (emit == "gcodeLayerToggleActionToClient") {
    gcodeLayerTogglePressed();
  } else if (emit == "gcodeLayerMinusActionToClient") {
    gcodeLayerMinusPressed();
  } else if (emit == "stopPrintingToClient") {
    stopPrinting = !stopPrinting;
  } else if (emit == "coverButtonPressed") {
    coverButtonPressed();
  } else if (emit == "fansButtonPressed") {
    fansButtonPressed();
  } else if (emit == "heatsinkButtonPressed") {
    heatsinkButtonPressed();
  } else if (emit == "ballsFromServer") {
    if (enablePhysics) {
      let myData = JSON.parse(data);
      phy.change({
        name: "sphere" + count,
        pos: [myData.pos.x, myData.pos.y, myData.pos.z],
        linearVelocity: [myData.vel.x, myData.vel.y, myData.vel.z],
      });
      if (++count >= ballsLab) {
        count = 0;
      }
    }
  }
}

////////////////////////////
//  Socket.io Listeners  //
//////////////////////////

function loadSockets() {
  ///////////
  //Legacy//
  /////////
  socket.on("ender3XAxisGroupToClient", function (data) {
    ender3XAxisGroup.position.y = data;
    updateFilament();
  });

  socket.on("ender3YAxisGroupToClient", function (data) {
    ender3YAxisGroup.position.x = data;
    updateFilament();
  });

  socket.on("ender3HotEndGroupToClient", function (data) {
    ender3HotEndGroup.position.z = data;
    updateFilament();
  });
  /////////////////////////

  socket.on("button1ToClient", function (data) {
    button1Pressed();
  });

  socket.on("button2ToClient", function (data) {
    button2Pressed();
  });

  socket.on("button3ToClient", function (data) {
    button3Pressed();
  });

  socket.on("button4ToClient", function (data) {
    button4Pressed();
  });

  socket.on("button5ToClient", function (data) {
    button5Pressed();
  });

  socket.on("updatePaintToClient", function (data) {
    let paint = new THREE.Vector3(data.cursor.x, data.cursor.y, data.cursor.z);
    if (data.controllerName === "left") {
      painter1.lineTo(paint);
      painter1.update();
    } else {
      painter2.lineTo(paint);
      painter2.update();
    }
  });

  socket.on("updatePaintStartToClient", function (data) {
    let paint = new THREE.Vector3(data.cursor.x, data.cursor.y, data.cursor.z);
    if (data.controllerName === "left") {
      painter1.moveTo(paint);
    } else {
      painter2.moveTo(paint);
    }
  });

  socket.on("exitButtonToClient", function (data) {
    exitButtonPressed();
    console.log("exit button pressed");
  });

  socket.on("resetButtonToClient", function (data) {
    resetButtonPressed();
    console.log("reset button pressed");
  });

  socket.on("gravityButtonToClient", function (data) {
    gravityButtonPressed();
    console.log("gravity button pressed");
  });

  socket.on("clearPaintButtonToClient", function (data) {
    clearPaintButtonPressed();
    console.log("Clear paint button pressed");
  });

  socket.on("occlusionButtonToClient", function (data) {
    occlusionButtonPressed();
    console.log("occlusion button pressed");
  });

  socket.on("addMeshDetectionPhysicsToClient", function (data) {
    if (!userArray[0].vr) {
      processMeshesToClient(data);
      console.log("Add room mesh");
    }
  });

  socket.on("centerOfRotationToClient", function (data) {
    centerOfRotation.position.set(data.CORposX, data.CORposY, data.CORposZ);
    centerOfRotation.rotation.set(data.CORrotX, data.CORrotY, data.CORrotZ);
  });

  socket.on("updateProteinGroupToClient", function (data) {
    console.log(data);
    var quaternion = new THREE.Quaternion(
      data.quat[0],
      data.quat[1],
      data.quat[2],
      data.quat[3]
    );
    if (activeMesh == "protein") {
      proteinGroup.applyQuaternion(quaternion);
    } else if (activeMesh == "boat") {
      boatMeshes.applyQuaternion(quaternion);
    } else if (activeMesh == "test") {
      testMeshes.applyQuaternion(quaternion);
    } else if (activeMesh == "owl") {
      owlMeshes.applyQuaternion(quaternion);
    }
    centerOfRotation.rotation.set(0, 0, 0);
  });

  socket.on("addControllerToClient", function (data) {
    if (scene.getObjectByName(data.id) === undefined) {
      addCubeController(data);
    }
  });

  socket.on("addCubeToClient", function (data) {
    if (scene.getObjectByName(data.id) === undefined) {
      addCube(data);
    }
  });

  socket.on("addOtherUsers", function (userArrayFromServer) {
    //console.log(userArrayFromServer.id + " has joined the server.");
    if (userArrayFromServer.length !== -1) {
      for (let i = 0; i < userArrayFromServer.length; i++) {
        if (userArray[0].id !== userArrayFromServer[i].id) {
          userArray.push(userArrayFromServer[i]);
        }
      }
    }
    console.log(userArray);
  });

  socket.on("addNewUser", function (userArrayFromServer) {
    console.log(userArrayFromServer.id + " has joined the server.");
    userArray.push(userArrayFromServer);
    console.log(userArray);
    if (userArray.length === 1) {
      // checkForXR();
    }
  });

  socket.on("addPlaneToClient", function (data) {
    addPlaneFromServer(data);
  });

  socket.on("ballsFromServer", function (data) {
    if (enablePhysics) {
      phy.change({
        name: "sphere" + count,
        pos: [data.pos.x, data.pos.y, data.pos.z],
        linearVelocity: [data.vel.x, data.vel.y, data.vel.z],
      });

      if (++count >= ballsLab) {
        count = 0;
      }
    }
  });

  //Updated to new code
  socket.on("deleteUser", function (data) {
    if (playerPhysics) {
      function moveCubeGroup(i) {
        var position = new THREE.Vector3(-1000, 0, -1000);
        var position1 = new THREE.Vector3(-1001, 0, -1001);
        var position2 = new THREE.Vector3(-1002, 0, -1002);
        var quaternion = new THREE.Quaternion(0, 0, 0, 0);

        let index1 = 2 * i;
        let index2 = 2 * i + 1;
        phy.change({
          name: "cube" + i,
          pos: [position.x, position.y, position.z],
        });
        phy.change({
          name: "controller" + index1,
          pos: [position1.x, position1.y, position1.z],
        });
        phy.change({
          name: "controller" + index2,
          pos: [position2.x, position2.y, position2.z],
        });
      }

      //Move the cube if it in the middle of userArray
      for (let i = 0; i < userArray.length; i++) {
        if (userArray[i].id === data) {
          moveCubeGroup(i);
        }
      }
      //Always moves cube at the end of the userArray
      let i = userArray.length - 1;
      moveCubeGroup(i);
    }

    //userArray = userArray.filter((e) => e !== data); //not sure if this is needed
    var newArray = [];
    var con1 = "controller1";
    var con2 = "controller2";
    //var data = socket.id;
    var dataCon1 = data.concat(con1);
    var dataCon2 = data.concat(con2);
    console.log(data);
    console.log(dataCon1);
    console.log(dataCon2);
    for (let i = 0; i < userArray.length; i++) {
      if (
        userArray[i].id !== data &&
        userArray[i].id !== dataCon1 &&
        userArray[i].id !== dataCon2
      ) {
        newArray.push(userArray[i]);
      }
    }
    userArray = newArray;
    console.log(data + " has left the server.");
    console.log(userArray);
    if (!playerPhysics) {
      var removeCube = scene.getObjectByName(data);
      var removeCon1 = scene.getObjectByName(dataCon1);
      var removeCon2 = scene.getObjectByName(dataCon2);
      console.log("Removed obJect 3D from " + data);
      scene.remove(removeCube);
      scene.remove(removeCon1);
      scene.remove(removeCon2);
    }
  });

  socket.on("filterUserArray", function (data) {
    /*
    console.log(data);
    var con1 = "controller1";
    var con2 = "controller2";
    var dataCon1 = data.concat(con1);
    var dataCon2 = data.concat(con2);
    userArray = userArray.filter((e) => e !== data);
    //socket.broadcast.emit("filterUserArray", data);
    var newArray = [];

    for (let i = 0; i < userArray.length; i++) {
      if (
        userArray[i].id !== data &&
        userArray[i].id !== dataCon1 &&
        userArray[i].id !== dataCon2
      ) {
        newArray.push(userArray[i]);
      }
      userArray = newArray;
    }

    var removeCube = scene.getObjectByName(data);
    var removeCon1 = scene.getObjectByName(dataCon1);
    var removeCon2 = scene.getObjectByName(dataCon2);
    console.log("Removed object 3D from " + data);
    scene.remove(removeCube);
    scene.remove(removeCon1);
    scene.remove(removeCon2);
    console.log("Clent UserArray");
    console.log(userArray);
    console.log("Server userArray");
    socket.emit("requestUserArrayFromServerDebug", "");
    socket.on("sendUserArrayToClientDebug", function (data) {
      console.log(data);
    });
    */
  });

  socket.on("gcodeButtonPressed", function (data) {
    gcodeButtonPressed();
  });

  socket.on("gcodeExtrudeButtonPressed", function (data) {
    gcodeExtrudeButtonPressed();
  });

  socket.on("gcodeLayerPlusActionToClient", function (data) {
    gcodeLayerPlusPressed(data);
  });

  socket.on("gcodeLayerToggleActionToClient", function (data) {
    gcodeLayerTogglePressed(data);
  });

  socket.on("gcodeLayerMinusActionToClient", function (data) {
    gcodeLayerMinusPressed(data);
  });

  socket.on("gcodeSupportButtonPressed", function (data) {
    gcodeSupportButtonPressed();
  });

  socket.on("gcodeTreeButtonPressed", function (data) {
    gcodeTreeButtonPressed();
  });

  socket.on("gcodeTravelButtonPressed", function (data) {
    gcodeTravelButtonPressed();
  });

  socket.on("hideRoomButtonPressed", function (data) {
    hideRoomButtonPressed();
  });

  //////Legacy
  socket.on("mySocketID", function (data) {
    userArray[0].id = data;
    console.log("My socket.id is " + userArray[0].id);
  });
  ////////////

  socket.on("pausePrinterToClient", function () {
    pausePrinter();
  });

  socket.on("roomState", function (roomState) {
    console.log(roomState);
    if (roomState.stl) {
      stlMeshBoat.visible = true;
    } else {
      stlMeshBoat.visible = false;
    }
    if (roomState.wireframe) {
      wireframeMeshBoat.visible = true;
    } else {
      wireframeMeshBoat.visible = false;
    }
    if (roomState.gcode) {
      //gcodeMesh.visible = true;
      //gcodeMesh.children[0].visible = true;
      //gcodeMesh.children[1].visible = true;
    } else {
      //gcodeMesh.visible = false;
      //gcodeMesh.children[0].visible = false;
      //gcodeMesh.children[1].visible = false;
    }
    if (roomState.toggleLayer) {
      //gcodeLayer = roomState.layer;
      // gcodeLayerTogglePressed();
    } else {
      // gcodeMeshLayer.visible = false;
    }
    if (roomState.extrude) {
      //gcodeMesh.visible = true;
      //gcodeMesh.children[0].visible = true;
    } else {
      //gcodeMesh.children[0].visible = false;
    }
    if (roomState.travel) {
      //gcodeMesh.visible = true;
      //gcodeMesh.children[1].visible = true;
    } else {
      //gcodeMesh.children[1].visible = false;
    }
  });

  socket.on("rotateBoat", function (data) {
    centerOfRotation.rotation.y = data.centerOfRotationY;
  });

  socket.on("scaleBoat", function (data) {
    centerOfRotation.scale.set(data.x, data.y, data.z);
  });

  socket.on("sendUserArrayToClient", function (serverUserArray) {
    console.log(serverUserArray);
    for (let i = 0; i < serverUserArray.length; i++) {
      if (serverUserArray[i].id !== userArray[0].id) {
        let addClient = serverUserArray[i];
        userArray.push(addClient);
      }
      if (
        serverUserArray[i].presenting === 1 &&
        serverUserArray[i].controllerNum === 0
      ) {
        addCube(serverUserArray[i]);
      } else if (
        serverUserArray[i].presenting === 1 &&
        serverUserArray[i].controllerNum === 1
      ) {
        addCubeController(serverUserArray[i], i);
      } else if (
        serverUserArray[i].presenting === 1 &&
        serverUserArray[i].controllerNum === 2
      ) {
        addCubeController(serverUserArray[i], i);
      }
      console.log("This is my local userArray");
      console.log(userArray);
      console.log("This is the servers userArray");
      console.log(serverUserArray);
    }
  });

  socket.on("toggleGuide", function () {
    toggleGuide();
  });

  socket.on("pauseGuide", function () {
    pauseGuide();
  });

  socket.on("stlButtonPressed", function (data) {
    stlButtonPressed();
  });

  socket.on("coverButtonPressed", function (data) {
    coverButtonPressed();
  });

  socket.on("fansButtonPressed", function (data) {
    fansButtonPressed();
  });

  socket.on("heatsinkButtonPressed", function (data) {
    heatsinkButtonPressed();
  });

  socket.on("stoppedPresentingUserArray", function (data) {
    var newArray = [];
    var con1 = "controller1";
    var con2 = "controller2";
    var dataCon1 = data.concat(con1);
    var dataCon2 = data.concat(con2);

    for (let i = 0; i < userArray.length; i++) {
      if (
        userArray[i].id == data ||
        userArray[i].id == dataCon1 ||
        userArray[i].id == dataCon2
      ) {
        userArray[i].presenting = 0;
        var position = new THREE.Vector3(-1000, 0, -1000);
        var position1 = new THREE.Vector3(-1001, 0, -1001);
        var position2 = new THREE.Vector3(-1002, 0, -1002);
        var quaternion = new THREE.Quaternion(0, 0, 0, 0);
        phy.change({
          name: "cube" + i,
          pos: [position.x, position.y, position.z],
        });
        // physics.setMeshPositionAndRotation(cubeGroup, position, quaternion, i);
        let index1 = 2 * i;
        let index2 = 2 * i + 1;
        phy.change({
          name: "controller" + index1,
          pos: [position1.x, position1.y, position1.z],
        });
        phy.change({
          name: "controller" + index2,
          pos: [position2.x, position2.y, position2.z],
        });
      }
    }

    var removeCube = scene.getObjectByName(data);
    var removeCon1 = scene.getObjectByName(dataCon1);
    var removeCon2 = scene.getObjectByName(dataCon2);
    console.log(
      "Removed object 3D from " + data + " stoppedPresentingUserArray"
    );
    scene.remove(removeCube);
    scene.remove(removeCon1);
    scene.remove(removeCon2);

    //Remove controllers from the userArray
    userArray = userArray.filter((e) => e !== dataCon1);
    userArray = userArray.filter((e) => e !== dataCon2);
    //socket.broadcast.emit("isPresentingArrayFilter", socket.id);
    newArray = [];
    for (let i = 0; i < userArray.length; i++) {
      if (userArray[i].id !== dataCon1 && userArray[i].id !== dataCon2) {
        newArray.push(userArray[i]);
      } else if (userArray[i].id !== data) {
        // newArray.push(isPresentingArray[i]);
      }
    }
    userArray = newArray;
  });

  socket.on("stopPrintingToClient", function () {
    stopPrinting = !stopPrinting;
  });

  socket.on("toggleBoat", function (data) {
    toggleBoat();
  });

  socket.on("toggleTest", function (data) {
    toggleTest();
  });

  socket.on("toggleOwl", function (data) {
    toggleOwl();
  });

  socket.on("togglePhysics", function (data) {
    togglePhysics();
  });

  socket.on("togglePrinter", function (data) {
    togglePrinter();
  });

  socket.on("togglePrinterOn", function (data) {
    togglePrinterOn(data);
  });

  socket.on("updatePosFromServer", function (data) {
    if (playerPhysics) {
      if (!showVR) {
        for (let i = 0; i < userArray.length; i++) {
          if (userArray[i].id === data.id) {
            const color = new THREE.Color();
            color.set(data.color);
            if (userArray[i].vr) {
              let cameraPosition = new THREE.Vector3(
                data.camPos.x,
                data.camPos.y - 1.2,
                data.camPos.z
              );
              let cameraRotation = new THREE.Quaternion(
                data.camQuat[0],
                data.camQuat[1],
                data.camQuat[2],
                data.camQuat[3]
              );
              if (!newAvatar) {
                phy.change({
                  name: "cube" + i,
                  pos: [data.camPos.x, data.camPos.y, data.camPos.z],
                  quat: [
                    data.camQuat[0],
                    data.camQuat[1],
                    data.camQuat[2],
                    data.camQuat[3],
                  ],
                  color: color,
                });
              }

              if (newAvatar) {
                avatarModel.position.copy(cameraPosition);
                head.quaternion.copy(cameraRotation);
                //avatar.leftHand.position.copy(controller1Position);
                //avatar.leftHand.rotation.copy(controller1Rotation);
                //avatar.rightHand.position.copy(controller2Position);
                //avatar.rightHand.rotation.copy(controller2Rotation);
              }
            } else {
              if (!newAvatar) {
                phy.change({
                  name: "cube" + i,
                  pos: [data.camPos.x, data.camPos.y, data.camPos.z],
                  rot: [
                    (data.camRot._x * 180) / Math.PI,
                    (data.camRot._y * 180) / Math.PI,
                    (data.camRot._z * 180) / Math.PI,
                  ],
                  color: color,
                });
              }

              if (newAvatar) {
                avatarModel.position.set(
                  data.camPos.x,
                  data.camPos.y,
                  data.camPos.z
                );
                avatarModel.rotation.x = data.camRot._x;
                avatarModel.rotation.y = data.camRot._y;
                avatarModel.rotation.z = data.camRot._z;
              }
            }
            if (userArray[i].vr) {
              let index1 = 2 * i;
              let index2 = 2 * i + 1;
              if (!newAvatar) {
                phy.change({
                  name: "controller" + index1,
                  pos: [data.con1Pos.x, data.con1Pos.y, data.con1Pos.z],
                  rot: [
                    (data.con1Rot._x * 180) / Math.PI,
                    (data.con1Rot._y * 180) / Math.PI,
                    (data.con1Rot._z * 180) / Math.PI,
                  ],
                  color: color,
                });
              }

              if (newAvatar) {
                const controller1WorldPosition = new THREE.Vector3(
                  data.con1Pos.x,
                  data.con1Pos.y,
                  data.con1Pos.z
                );
                const controller1WorldQuaternion = new THREE.Quaternion(
                  data.con1Quat[0],
                  data.con1Quat[1],
                  data.con1Quat[2],
                  data.con1Quat[3]
                );

                // Get world position and rotation of the parent bone
                const parentWorldPosition = new THREE.Vector3(
                  data.camPos.x,
                  data.camPos.y,
                  data.camPos.z
                );
                const parentWorldQuaternion = new THREE.Quaternion(
                  data.camQuat[0],
                  data.camQuat[1],
                  data.camQuat[2],
                  data.camQuat[3]
                );

                let controller2WorldPosition = new THREE.Vector3(
                  data.con2Pos.x,
                  data.con2Pos.y,
                  data.con2Pos.z
                );
                const controller2WorldQuaternion = new THREE.Quaternion(
                  data.con2Quat[0],
                  data.con2Quat[1],
                  data.con2Quat[2],
                  data.con2Quat[3]
                );

                // Transform controller position relative to the camera
                controller1WorldPosition.sub(parentWorldPosition);
                controller2WorldPosition.sub(parentWorldPosition);

                // Update controller position
                leftHand.position.copy(controller1WorldPosition);
                leftHand.quaternion.copy(controller1WorldQuaternion);

                rightHand.position.copy(controller2WorldPosition);
                rightHand.quaternion.copy(controller2WorldQuaternion);
              }
              /*
              const controllerWorldPosition = new THREE.Vector3(
                data.con1Pos.x,
                data.con1Pos.y,
                data.con1Pos.z
              ); // Create a vector to hold the world position of the controller
              const avatarWorldPosition = new THREE.Vector3(
                data.camPos.x,
                data.camPos.y,
                data.camPos.z
              ); // Create a vector to hold the world position of the controller
              const controllerLocalPosition = controllerWorldPosition
                .clone()
                .sub(avatarWorldPosition);
              leftHand.position.copy(controllerLocalPosition);
              */
              // const controllerLocalPosition = controllerWorldPosition.applyMatrix4(leftHand.matrixWorld.clone().invert());

              // Set the position of the left hand bone to the transformed controller position
              //leftHand.position.set(controllerLocalPosition.x, controllerLocalPosition.y, controllerLocalPosition.z);

              //var worldPosition = new THREE.Vector3();
              //worldPosition.setFromMatrixPosition(head.matrixWorld);

              // Convert the world position to the local space of the child object
              //var localPosition = new THREE.Vector3();
              //leftHand.worldToLocal(worldPosition);

              // Set the position of the child object based on the local position obtained
              //leftHand.position.copy(localPosition);

              /* 
                leftHand.position.set(
                data.con1Pos.x - avatarModel.position.x,
                data.con1Pos.y - avatarModel.position.y-0.5,
                data.con1Pos.z - avatarModel.position.z,
               );
              leftHand.rotation.x = data.con1Rot._x;
              leftHand.rotation.y = data.con1Rot._y;
              leftHand.rotation.z = data.con1Rot._z;
              
              */
              if (!newAvatar) {
                phy.change({
                  name: "controller" + index2,
                  pos: [data.con2Pos.x, data.con2Pos.y, data.con2Pos.z],
                  rot: [
                    (data.con2Rot._x * 180) / Math.PI,
                    (data.con2Rot._y * 180) / Math.PI,
                    (data.con2Rot._z * 180) / Math.PI,
                  ],
                  color: color,
                });
              }

              // worldPosition.setFromMatrixPosition(head.matrixWorld);

              // Convert the world position to the local space of the child object
              //rightHand.worldToLocal(worldPosition);

              // Set the position of the child object based on the local position obtained
              //rightHand.position.copy(localPosition);
            }
          }
        }
      }
    }

    if (showVR) {
      for (let i = 0; i < userArray.length; i++) {
        if (userArray[i].id !== showID) {
          if (userArray[i].id === data.id) {
            const color = new THREE.Color();
            if (cubeGroup !== undefined) {
              cubeGroup.setColorAt(i, color.set(data.color));
              cubeGroup.instanceColor.needsUpdate = true;
            }
            let position = new THREE.Vector3();
            position.x = data.camPos.x;
            position.y = data.camPos.y - 0.4;
            position.z = data.camPos.z;
            let quaternion = new THREE.Quaternion();
            quaternion.x = data.camQuat[0];
            quaternion.y = data.camQuat[1];
            quaternion.z = data.camQuat[2];
            quaternion.w = data.camQuat[3];

            const rotation = new THREE.Euler();
            quaternion.normalize();
            rotation.setFromQuaternion(quaternion);
            phy.change({
              name: "cube" + i,
              pos: [position.x, position.y, position.z],
              rot: [
                (rotation._x * 180) / Math.PI,
                (rotation._y * 180) / Math.PI,
                (rotation._z * 180) / Math.PI,
              ],
            });
          }
          if (userArray[i].vr) {
            let position1 = new THREE.Vector3();
            position1.x = data.con1Pos.x;
            position1.y = data.con1Pos.y;
            position1.z = data.con1Pos.z;
            let quaternion1 = new THREE.Quaternion();
            quaternion1.x = data.con1Quat[0];
            quaternion1.y = data.con1Quat[1];
            quaternion1.z = data.con1Quat[2];
            quaternion1.w = data.con1Quat[3];
            let position2 = new THREE.Vector3();
            position2.x = data.con2Pos.x;
            position2.y = data.con2Pos.y;
            position2.z = data.con2Pos.z;
            let quaternion2 = new THREE.Quaternion();
            quaternion2.x = data.con2Quat[0];
            quaternion2.y = data.con2Quat[1];
            quaternion2.z = data.con2Quat[2];
            quaternion2.w = data.con2Quat[3];

            const rotation1 = new THREE.Euler();
            const rotation2 = new THREE.Euler();
            quaternion1.normalize();
            quaternion2.normalize();
            rotation1.setFromQuaternion(quaternion1);
            rotation2.setFromQuaternion(quaternion2);

            let index1 = 2 * i;
            let index2 = 2 * i + 1;

            phy.change({
              name: "controller" + index1,
              pos: [position1.x, position1.y, position1.z],
              rot: [
                (rotation1._x * 180) / Math.PI,
                (rotation1._y * 180) / Math.PI,
                (rotation1._z * 180) / Math.PI,
              ],
            });

            phy.change({
              name: "controller" + index2,
              pos: [position2.x, position2.y, position2.z],
              rot: [
                (rotation2._x * 180) / Math.PI,
                (rotation2._y * 180) / Math.PI,
                (rotation2._z * 180) / Math.PI,
              ],
            });
          }
        }
      }

      if (showID === data.id) {
        // controls.enabled = false;
        let position = new THREE.Vector3();
        position.x = data.camPos.x;
        position.y = data.camPos.y;
        position.z = data.camPos.z;
        let quaternion = new THREE.Quaternion();
        quaternion.x = data.camQuat[0];
        quaternion.y = data.camQuat[1];
        quaternion.z = data.camQuat[2];
        quaternion.w = data.camQuat[3];
        let position1 = new THREE.Vector3();
        position1.x = data.con1Pos.x;
        position1.y = data.con1Pos.y;
        position1.z = data.con1Pos.z;
        let quaternion1 = new THREE.Quaternion();
        quaternion1.x = data.con1Quat[0];
        quaternion1.y = data.con1Quat[1];
        quaternion1.z = data.con1Quat[2];
        quaternion1.w = data.con1Quat[3];
        let position2 = new THREE.Vector3();
        position2.x = data.con2Pos.x;
        position2.y = data.con2Pos.y;
        position2.z = data.con2Pos.z;
        let quaternion2 = new THREE.Quaternion();
        quaternion2.x = data.con2Quat[0];
        quaternion2.y = data.con2Quat[1];
        quaternion2.z = data.con2Quat[2];
        quaternion2.w = data.con2Quat[3];
        let i = clients - 2;
        const rotation = new THREE.Euler();
        quaternion.normalize();
        rotation.setFromQuaternion(quaternion);
        phy.change({
          name: "cube" + i,
          pos: [position.x, position.y, position.z],
          rot: [
            (rotation._x * 180) / Math.PI,
            (rotation._y * 180) / Math.PI,
            (rotation._z * 180) / Math.PI,
          ],
        });

        const rotation1 = new THREE.Euler();
        const rotation2 = new THREE.Euler();
        quaternion1.normalize();
        quaternion2.normalize();
        rotation.setFromQuaternion(quaternion1);
        rotation.setFromQuaternion(quaternion2);

        let index1 = 2 * i;
        let index2 = 2 * i + 1;

        phy.change({
          name: "controller" + index1,
          pos: [position1.x, position1.y, position1.z],
          rot: [
            (rotation1._x * 180) / Math.PI,
            (rotation1._y * 180) / Math.PI,
            (rotation1._z * 180) / Math.PI,
          ],
        });
        /*

      phy.change({
        name: "controller" + index2,
        pos: [position2.x, position2.y, position2.z],
        rot: [
          (rotation2._x * 180) / Math.PI,
          (rotation2._y * 180) / Math.PI,
          (rotation2._z * 180) / Math.PI,
        ],
      });
      */
        voiceoverFrame++;
        if (voiceoverFrame === 2) {
          const geometryLine = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1),
          ]);
          let lineCon1 = new THREE.Line(geometryLine);
          let lineCon2 = new THREE.Line(geometryLine);
          let lineCam = new THREE.Line(geometryLine);

          scene.add(lineCon1);
          scene.add(lineCon2);
          //scene.add(lineCam);

          lineCam.material.color.setHex(0x00ffff);

          lineCon1.name = "showVRLine1";
          lineCon1.scale.z = 5;
          lineCon2.name = "showVRLine2";
          lineCon2.scale.z = 5;
          //lineCam.name = "lineCam";
          // lineCam.scale.z = 5;
        }
        if (voiceoverFrame > 3) {
          voiceoverFrame = 3;
        }
        let showVRLC1 = scene.getObjectByName("showVRLine1");
        let showVRLC2 = scene.getObjectByName("showVRLine2");
        // let LCam = scene.getObjectByName("lineCam");
        let con1Pos = position1;
        let con2Pos = position2;
        let con1Quat = quaternion1;
        let con2Quat = quaternion2;
        let camPos = position;
        let camQuat = quaternion;
        camera.position.x = camPos.x;
        camera.position.y = camPos.y;
        camera.position.z = camPos.z;
        camera.quaternion.x = camQuat.x;
        camera.quaternion.y = camQuat.y;
        camera.quaternion.z = camQuat.z;
        camera.quaternion.w = camQuat.w;
        if (data.vr) {
          showVRLC1.position.x = con1Pos.x;
          showVRLC1.position.y = con1Pos.y;
          showVRLC1.position.z = con1Pos.z;
          showVRLC1.setRotationFromQuaternion(con1Quat);
          showVRLC1.updateMatrix();
          // lineCon2.position(con2Pos);
          showVRLC2.position.x = con2Pos.x;
          showVRLC2.position.y = con2Pos.y;
          showVRLC2.position.z = con2Pos.z;
          showVRLC2.setRotationFromQuaternion(con2Quat);
          showVRLC2.updateMatrix();

          const intersections1 = getIntersections(showVRLC1);
          const intersections2 = getIntersections(showVRLC2);

          if (intersections1.length > 0) {
            const intersection = intersections1[0];
            const object = intersection.object;
            if (object.name !== activeMesh) {
              object.material.emissive.r = 0.5;
              intersected.push(object);

              showVRLC1.scale.z = intersection.distance;
            } else {
              showVRLC1.scale.z = 5;
            }
          }
          if (intersections2.length > 0) {
            const intersection = intersections2[0];

            const object = intersection.object;
            if (object.name !== activeMesh) {
              object.material.emissive.r = 0.5;
              intersected.push(object);

              showVRLC2.scale.z = intersection.distance;
            } else {
              showVRLC2.scale.z = 5;
            }
          }
        }
      }
    }
  });

  socket.on("updatePrinterPositionToClient", function (data) {
    ender3HotEndGroup.position.z = data.hotEndZ;
    ender3YAxisGroup.position.x = data.yAxisX;
    ender3XAxisGroup.position.y = data.xAxisY;
    updateFilament();
  });

  socket.on("userArrayFromServer", function (userArrayFromServer) {
    if (userArrayFromServer.length != 0) {
      userArray.push(userArrayFromServer[1]);
      console.log("userArrayFromServer");
      console.log(userArray);
    }
    for (let i = 0; i < userArray.length; i++) {
      //let i = getIndexByID(data);
      var newArray = [];
      var userID = userArray[i].id;
      var con1 = "controller1";
      var con2 = "controller2";
      var dataCon1 = userID.concat(con1);
      var dataCon2 = userID.concat(con2);
      if (userArray[i].id == userID && userArray[i].presenting == 1) {
        addCube(userArray[i]);
      } else if (userArray[i].id == dataCon1 && userArray[i].presenting == 1) {
        addCubeController(userArray[i], i);
      } else if (userArray[i].id == dataCon2 && userArray[i].presenting == 1) {
        addCubeController(userArray[i], i);
      }
    }
  });

  socket.on("wireframeButtonPressed", function (data) {
    wireframeButtonPressed();
  });
}

function onTransitionEnd(event) {
  checkForXR();
  event.target.remove();
  socket.emit("requestRoomState", "");
  labOff();
}

function playLog(timestamp) {
  let playerData;
  let skipUpdate;
  if (voiceoverFrame === 1) {
    if (logLocal) {
      voiceover.play();
    }
    startTime = timestamp;
  }

  if (startTime === timestamp) {
    playerData = csvData[1];
  } else {
    skipUpdate = 1;
    let currentTime = timestamp - startTime;
    let firstFrameData = csvData[1];
    let firstFrameTime = firstFrameData[0];
    let timeSinceStart = Math.floor(currentTime + parseInt(firstFrameTime));
    for (let i = logIndex; i < csvData.length; i++) {
      if (csvData[i] !== undefined) {
        let stamp = csvData[i];
        let stampNow = stamp[0];
        if (i === csvData.length - 1) {
          endLog = 1;
          break;
        } else if (stamp[2] === "-999") {
          console.log("Button pressed: " + stamp[3]);
          let emit = stamp[3];
          let data = stamp[4];
          logCallFunction(emit, data);
          // skipUpdate = 1;
          logIndex = i + 1; //Need i + 1 or will enter forever loop
          //break;
        } else if (stampNow > timeSinceStart) {
          break;
        } else {
          playerData = csvData[i];
          logIndex = i;
          skipUpdate = 0;
        }
      }
    }
  }
  if (!skipUpdate) {
    let camPos = new THREE.Vector3(playerData[2], playerData[3], playerData[4]);

    let camQuat = new THREE.Quaternion(
      playerData[5],
      playerData[6],
      playerData[7],
      playerData[8]
    );
    let con1Pos = new THREE.Vector3(
      playerData[9],
      playerData[10],
      playerData[11]
    );
    let con1Quat = new THREE.Quaternion(
      playerData[12],
      playerData[13],
      playerData[14],
      playerData[15]
    );
    let con2Pos = new THREE.Vector3(
      playerData[16],
      playerData[17],
      playerData[18]
    );
    let con2Quat = new THREE.Quaternion(
      playerData[19],
      playerData[20],
      playerData[21],
      playerData[22]
    );

    if (playerPhysics) {
      voiceoverFrame++;
      if (logLocal) {
        const data = {
          con1Pos: con1Pos,
          con1Quat: con1Quat,
          con2Pos: con2Pos,
          con2Quat: con2Quat,
          camPos: camPos,
          camQuat: camQuat,
          color: 0xffc629,
        };

        let i = clients - 1;
        camPos.y = camPos.y - 0.4;
        const color = new THREE.Color();

        const rotation = new THREE.Euler();
        camQuat.normalize();
        rotation.setFromQuaternion(camQuat);

        phy.change({
          name: "cube" + i,
          pos: [camPos.x, camPos.y, camPos.z],
          rot: [
            (rotation._x * 180) / Math.PI,
            (rotation._y * 180) / Math.PI,
            (rotation._z * 180) / Math.PI,
          ],
        });

        let index1 = 2 * i;
        let index2 = 2 * i + 1;

        let rotation1 = new THREE.Euler();
        con1Quat.normalize();
        rotation1.setFromQuaternion(con1Quat);

        phy.change({
          name: "controller" + index1,
          pos: [con1Pos.x, con1Pos.y, con1Pos.z],
          // rot:[rotation1._x*180/Math.PI, rotation1._y*180/Math.PI, rotation1._z*180/Math.PI],
          debug: true,
        });

        let rotation2 = new THREE.Euler();
        con2Quat.normalize();
        rotation2.setFromQuaternion(con2Quat);
        phy.change({
          name: "controller" + index2,
          pos: [con2Pos.x, con2Pos.y, con2Pos.z],
          //  rot:[rotation2._x*180/Math.PI, rotation2._y*180/Math.PI, rotation2._z*180/Math.PI],
        });

        if (voiceoverFrame === 2) {
          const geometryLine = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1),
          ]);
          if (logLineHands) {
            let lineCon1 = new THREE.Line(geometryLine);
            let lineCon2 = new THREE.Line(geometryLine);

            scene.add(lineCon1);
            scene.add(lineCon2);

            lineCon1.name = "line1";
            lineCon1.scale.z = 5;
            lineCon2.name = "line2";
            lineCon2.scale.z = 5;
          }
          if (logLineHead) {
            let lineCam = new THREE.Line(geometryLine);
            scene.add(lineCam);
            lineCam.material.color.setHex(0x00ffff);

            lineCam.name = "lineCam";
            lineCam.scale.z = 5;
          }

          /////
          //Temp fix, usually not in if statrement
          if (heatMap) {
            var dotGeometry = new THREE.BufferGeometry();
            dotGeometry.setAttribute(
              "position",
              new THREE.Float32BufferAttribute([0, 0, 0], 3)
            );
            var dotMaterial = new THREE.PointsMaterial({
              size: heatMapResolution,
              color: 0x0000ff,
            });

            var dot = new THREE.Points(dotGeometry, dotMaterial);
            dot.name = "dot";
            dot.position.x = 1000;
            let dotGroup = new THREE.Group();
            dotGroup.name = "dotGroup";
            dotGroup.add(dot);
            scene.add(dotGroup);
            dotGroup.visible = false;

            var boxGeometry = new THREE.BoxGeometry(
              heatMapResolution,
              heatMapResolution,
              heatMapResolution
            );
            // boxGeometry.renderOrder = 99;
            var boxMaterial = new THREE.MeshPhysicalMaterial({
              transparent: true,
              opacity: 1,
              depthTest: true,
              depthWrite: true,
              side: THREE.DoubleSide,
            });
            boxes = new THREE.InstancedMesh(boxGeometry, boxMaterial, 60000);
            boxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            scene.add(boxes);
            boxes.frustumCulled = false;
            //boxes.renderOrder = -99;
            for (let i = 0; i < boxes.count; i++) {
              let x = 1000;
              let y = 0;
              let z = 0;
              let matrix = new THREE.Matrix4();
              matrix.setPosition(x, y, z);
              boxes.setMatrixAt(i, matrix);
              boxes.instanceMatrix.needsUpdate = true;
              //boxes.instanceColor.needsUpdate = true;
            }
          }
        }

        if (heatMap) {
          const positionAttribute = boxes.geometry.getAttribute("matrix");
          const colorAttribute = boxes.geometry.getAttribute("color");
          //positionAttribute.needsUpdate = true; // required after the first render
          //colorAttribute.needsUpdate = true;
        }
        if (logLineHands) {
          let LC1 = scene.getObjectByName("line1");
          let LC2 = scene.getObjectByName("line2");
          if (LC1 !== undefined) {
            LC1.position.x = con1Pos.x;
            LC1.position.y = con1Pos.y;
            LC1.position.z = con1Pos.z;
            con1Quat.normalize();
            LC1.setRotationFromQuaternion(con1Quat);
            LC1.updateMatrix();
            LC2.position.x = con2Pos.x;
            LC2.position.y = con2Pos.y;
            LC2.position.z = con2Pos.z;
            con2Quat.normalize();
            LC2.setRotationFromQuaternion(con2Quat);
            LC2.updateMatrix();

            const intersections1 = getIntersections(LC1);
            const intersections2 = getIntersections(LC2);
            if (intersections1.length > 0) {
              const intersection = intersections1[0];
              const object = intersection.object;
              if (object.name !== "boat") {
                object.material.emissive.r = 0.5;
                intersected.push(object);
                if (heatMap) {
                  let dot2 = scene.getObjectByName("dot");
                  let dotGroup2 = scene.getObjectByName("dotGroup");
                  let dot3 = dot2.clone();
                  dot3.material = dot3.material.clone();
                  // console.log(intersection);
                  dot3.position.x =
                    Math.round((1 / heatMapResolution) * intersection.point.x) /
                    (1 / heatMapResolution);
                  //console.log(dot3.position.x);
                  dot3.position.y =
                    Math.round((1 / heatMapResolution) * intersection.point.y) /
                    (1 / heatMapResolution);
                  dot3.position.z =
                    Math.round((1 / heatMapResolution) * intersection.point.z) /
                    (1 / heatMapResolution);
                  dotGroup2.children.forEach(function (child) {
                    if (child.position.equals(dot3.position)) {
                      let color = new THREE.Color(child.material.color);
                      if (color.r === 0 && color.g === 0 && color.b === 1) {
                        color.r = 0;
                        color.g = Math.round(10 * (color.g + 0.1)) / 10;
                        color.b = Math.round(10 * (color.b - 0.1)) / 10;
                      } else if (color.r === 0 && color.g < 1 && color.b < 1) {
                        color.r = 0;
                        color.g = Math.round(10 * (color.g + 0.1)) / 10;
                        color.b = Math.round(10 * (color.b - 0.1)) / 10;
                      } else if (
                        color.r === 0 &&
                        color.b === 0 &&
                        color.g === 1
                      ) {
                        color.r = Math.round(10 * (color.r + 0.1)) / 10;
                        color.b = 0;
                        color.g = 1;
                      } else if (
                        color.r < 1 &&
                        color.g === 1 &&
                        color.b === 0
                      ) {
                        color.r = Math.round(10 * (color.r + 0.1)) / 10;
                        color.b = 0;
                        color.g = 1;
                      } else if (
                        color.r === 1 &&
                        color.g === 1 &&
                        color.b === 0
                      ) {
                        color.r = 1;
                        color.b = 0;
                        color.g = Math.round(10 * (color.g - 0.1)) / 10;
                        //  console.log("yellow");
                      } else if (
                        color.r === 1 &&
                        color.g > 0 &&
                        color.b === 0
                      ) {
                        color.r = 1;
                        color.b = 0;
                        color.g = Math.round(10 * (color.g - 0.1)) / 10;
                        //  console.log("yellow");
                      } else if (
                        color.r === 1 &&
                        color.g === 0 &&
                        color.b === 0
                      ) {
                        color.r = 1;
                        color.b = 0;
                        color.g = 0;
                        //  console.log("red");
                      }
                      child.remove();
                      dot3.material.color.set(color);
                      dotGroup2.add(dot3);
                      let i = Array.from(dotGroup2.children).indexOf(child);
                      let matrix = new THREE.Matrix4();
                      matrix.setPosition(
                        dot3.position.x,
                        dot3.position.y,
                        dot3.position.z
                      );
                      boxes.setMatrixAt(i, matrix);
                      //let color2 = new THREE.Color()
                      //console.log(boxes);
                      boxes.setColorAt(i, color);

                      boxes.instanceMatrix.needsUpdate = true;
                      boxes.instanceColor.needsUpdate = true;
                    } else {
                      dotGroup2.add(dot3);
                    }
                  });
                }
              }
              LC1.scale.z = intersection.distance;
            } else {
              LC1.scale.z = 5;
            }
            if (intersections2.length > 0) {
              const intersection = intersections2[0];

              const object = intersection.object;
              if (object.name !== "boat") {
                object.material.emissive.r = 0.5;
                intersected.push(object);
                if (heatMap) {
                  let dot2 = scene.getObjectByName("dot");
                  let dotGroup2 = scene.getObjectByName("dotGroup");
                  let dot3 = dot2.clone();
                  dot3.material = dot3.material.clone();
                  // console.log(intersection);
                  dot3.position.x =
                    Math.round((1 / heatMapResolution) * intersection.point.x) /
                    (1 / heatMapResolution);
                  //console.log(dot3.position.x);
                  dot3.position.y =
                    Math.round((1 / heatMapResolution) * intersection.point.y) /
                    (1 / heatMapResolution);
                  dot3.position.z =
                    Math.round((1 / heatMapResolution) * intersection.point.z) /
                    (1 / heatMapResolution);
                  dotGroup2.children.forEach(function (child) {
                    if (child.position.equals(dot3.position)) {
                      let color = new THREE.Color(child.material.color);
                      if (color.r === 0 && color.g === 0 && color.b === 1) {
                        color.r = 0;
                        color.g = Math.round(10 * (color.g + 0.1)) / 10;
                        color.b = Math.round(10 * (color.b - 0.1)) / 10;
                      } else if (color.r === 0 && color.g < 1 && color.b < 1) {
                        color.r = 0;
                        color.g = Math.round(10 * (color.g + 0.1)) / 10;
                        color.b = Math.round(10 * (color.b - 0.1)) / 10;
                      } else if (
                        color.r === 0 &&
                        color.b === 0 &&
                        color.g === 1
                      ) {
                        color.r = Math.round(10 * (color.r + 0.1)) / 10;
                        color.b = 0;
                        color.g = 1;
                      } else if (
                        color.r < 1 &&
                        color.g === 1 &&
                        color.b === 0
                      ) {
                        color.r = Math.round(10 * (color.r + 0.1)) / 10;
                        color.b = 0;
                        color.g = 1;
                      } else if (
                        color.r === 1 &&
                        color.g === 1 &&
                        color.b === 0
                      ) {
                        color.r = 1;
                        color.b = 0;
                        color.g = Math.round(10 * (color.g - 0.1)) / 10;
                        // console.log("yellow");
                      } else if (
                        color.r === 1 &&
                        color.g > 0 &&
                        color.b === 0
                      ) {
                        color.r = 1;
                        color.b = 0;
                        color.g = Math.round(10 * (color.g - 0.1)) / 10;
                        // console.log("yellow");
                      } else if (
                        color.r === 1 &&
                        color.g === 0 &&
                        color.b === 0
                      ) {
                        color.r = 1;
                        color.b = 0;
                        color.g = 0;
                        //  console.log("red");
                      }
                      child.remove();
                      dot3.material.color.set(color);
                      dotGroup2.add(dot3);
                      dotGroup2.visible = false;
                      let i = Array.from(dotGroup2.children).indexOf(child);
                      let matrix = new THREE.Matrix4();
                      matrix.setPosition(
                        dot3.position.x,
                        dot3.position.y,
                        dot3.position.z
                      );
                      boxes.setMatrixAt(i, matrix);
                      //let color2 = new THREE.Color()
                      //console.log(boxes);
                      boxes.setColorAt(i, color);

                      boxes.instanceMatrix.needsUpdate = true;
                      boxes.instanceColor.needsUpdate = true;
                    } else {
                      dotGroup2.add(dot3);
                    }
                  });
                }
              }
              LC2.scale.z = intersection.distance;
            } else {
              LC2.scale.z = 5;
            }
          }
        }
        if (logLineHead) {
          let LCam = scene.getObjectByName("lineCam");
          if (LCam !== undefined) {
            LCam.position.x = camPos.x;
            LCam.position.y = camPos.y + 0.4;
            LCam.position.z = camPos.z;
            camQuat.normalize();
            LCam.setRotationFromQuaternion(camQuat);
            LCam.updateMatrix();

            const intersections3 = getIntersections(LCam);
            if (intersections3.length > 0) {
              const intersection = intersections3[0];

              const object = intersection.object;
              if (object.name !== "boat") {
                object.material.emissive.r = 0.5;
                intersected.push(object);
                if (heatMap) {
                  let dot2 = scene.getObjectByName("dot");
                  let dotGroup2 = scene.getObjectByName("dotGroup");
                  let dot3 = dot2.clone();
                  dot3.material = dot3.material.clone();
                  // console.log(intersection);
                  dot3.position.x =
                    Math.round((1 / heatMapResolution) * intersection.point.x) /
                    (1 / heatMapResolution);
                  //console.log(dot3.position.x);
                  dot3.position.y =
                    Math.round((1 / heatMapResolution) * intersection.point.y) /
                    (1 / heatMapResolution);
                  dot3.position.z =
                    Math.round((1 / heatMapResolution) * intersection.point.z) /
                    (1 / heatMapResolution);
                  dotGroup2.children.forEach(function (child) {
                    if (child.position.equals(dot3.position)) {
                      let color = new THREE.Color(child.material.color);
                      if (color.r === 0 && color.g === 0 && color.b === 1) {
                        color.r = 0;
                        color.g = Math.round(10 * (color.g + 0.1)) / 10;
                        color.b = Math.round(10 * (color.b - 0.1)) / 10;
                      } else if (color.r === 0 && color.g < 1 && color.b < 1) {
                        color.r = 0;
                        color.g = Math.round(10 * (color.g + 0.1)) / 10;
                        color.b = Math.round(10 * (color.b - 0.1)) / 10;
                      } else if (
                        color.r === 0 &&
                        color.b === 0 &&
                        color.g === 1
                      ) {
                        color.r = Math.round(10 * (color.r + 0.1)) / 10;
                        color.b = 0;
                        color.g = 1;
                      } else if (
                        color.r < 1 &&
                        color.g === 1 &&
                        color.b === 0
                      ) {
                        color.r = Math.round(10 * (color.r + 0.1)) / 10;
                        color.b = 0;
                        color.g = 1;
                      } else if (
                        color.r === 1 &&
                        color.g === 1 &&
                        color.b === 0
                      ) {
                        color.r = 1;
                        color.b = 0;
                        color.g = Math.round(10 * (color.g - 0.1)) / 10;
                        // console.log("yellow");
                      } else if (
                        color.r === 1 &&
                        color.g > 0 &&
                        color.b === 0
                      ) {
                        color.r = 1;
                        color.b = 0;
                        color.g = Math.round(10 * (color.g - 0.1)) / 10;
                        // console.log("yellow");
                      } else if (
                        color.r === 1 &&
                        color.g === 0 &&
                        color.b === 0
                      ) {
                        color.r = 1;
                        color.b = 0;
                        color.g = 0;
                        // console.log("red");
                      }
                      child.remove();
                      dot3.material.color.set(color);
                      dotGroup2.add(dot3);
                      dotGroup2.visible = false;
                      let i = Array.from(dotGroup2.children).indexOf(child);
                      let matrix = new THREE.Matrix4();
                      matrix.setPosition(
                        dot3.position.x,
                        dot3.position.y,
                        dot3.position.z
                      );
                      boxes.setMatrixAt(i, matrix);

                      boxes.setColorAt(i, color);

                      boxes.instanceMatrix.needsUpdate = true;
                      boxes.instanceColor.needsUpdate = true;
                    } else {
                      dotGroup2.add(dot3);
                    }
                  });
                }
              }

              LCam.scale.z = intersection.distance;
            } else {
              LCam.scale.z = 5;
            }
          }
        }
      }
    }

    if (!playerPhysics) {
      socket.emit("updatePos", {
        con1Pos: con1Pos,
        con1Rot: con1Rot,
        con2Pos: con2Pos,
        con2Rot: con2Rot,
        camPos: camPos,
        camRot: camRot,
        name: userArray[0].id,
        vr: userArray[0].vr,
        presenting: userArray[0].presenting,
        id: userArray[0].id,
        con1: userArray[0].con1,
        con2: userArray[0].con2,
        //matrix: matrix,
      });
      voiceoverFrame++;
    }
  }
}

function endLogFunction() {
  if (endLog) {
    voiceover.stop();
    logFileTest = false;
    voiceoverFrame = 1;
    logIndex = 1;
    endLog = 0;
    let i = clients - 1;
    let LC1 = scene.getObjectByName("line1");
    let LC2 = scene.getObjectByName("line2");
    let LCam = scene.getObjectByName("lineCam");
    heatMapWalls = false;
    scene.remove(LC1);
    scene.remove(LC2);
    scene.remove(LCam);
    //togglePhysics();

    console.log("Hide Guide");
    var position = new THREE.Vector3(-1000, 0, -1000);
    var position1 = new THREE.Vector3(-1001, 0, -1001);
    var position2 = new THREE.Vector3(-1002, 0, -1002);
    var quaternion = new THREE.Quaternion(0, 0, 0, 0);
    phy.change({
      name: "cube" + i,
      pos: [position.x, position.y, position.z],
    });
    // physics.setMeshPositionAndRotation(cubeGroup, position, quaternion, i);
    let index1 = 2 * i;
    let index2 = 2 * i + 1;
    phy.change({
      name: "controller" + index1,
      pos: [position1.x, position1.y, position1.z],
    });
    phy.change({
      name: "controller" + index2,
      pos: [position2.x, position2.y, position2.z],
    });
  }
}

function labReset() {
  /*
    stlButton.material.color.setHex(selectedColor);
    wireframeButton.material.color.setHex(unselectedColor);
    gcodeButton.material.color.setHex(unselectedColor);
    gcodeExtrudeButton.material.color.setHex(unselectedColor);
    gcodeTravelButton.material.color.setHex(unselectedColor);
    gcodeSupportButton.material.color.setHex(unselectedColor);
    gcodeTreeButton.material.color.setHex(unselectedColor);

    stlMeshBoat.visible = true;
    wireframeMeshBoat.visible = false;
    gcodeMeshBoat.visible = false;
    gcodeMeshBoatLayer.visible = false;

    stlMeshTest.visible = true;
    wireframeMeshTest.visible = false;
    gcodeMeshTest.visible = false;
    gcodeMeshTestTree.visible = false;
    gcodeMeshTestLayer.visible = false;

    stlMeshOwl.visible = true;
    wireframeMeshOwl.visible = false;
    gcodeMeshOwl.visible = false;
    gcodeMeshOwlTree.visible = false;
    gcodeMeshOwlLayer.visible = false;
    */

  ender3Group.visible = false;
  lineFilament.visible = false;
  //desk.visible = !desk.visible;
  printerButtonGroup.visible = false;

  boatMeshes.visible = true;
  console.log("3D Lab Reset");
}

function labOff() {
  ender3Group.visible = false;
  lineFilament.visible = false;
  //desk.visible = !desk.visible;
  printerButtonGroup.visible = false;
  buttonGroup.visible = false;
  consoleMesh.visible = false;

  boatMeshes.visible = false;
  owlMeshes.visible = false;
  testMeshes.visible = false;

  for (let i = 0; i < meshNumber; i++) {
    phy.remove("mesh" + i);
  }
  meshNumber = 0;
  for (let i = 0; i < planeNumber; i++) {
    phy.remove("plane" + i);
  }
  planeNumber = 0;
  count = 0;

  console.log("3D Lab Hidden");
}

function startDemo() {
  // set physics engine option
  phy.set({ substep: 2, gravity: [0, -9.81, 0], fps: 90 });
}

function processMeshes(timestamp, frame) {
  const referenceSpace = renderer.xr.getReferenceSpace();
  if (frame.detectedMeshes) {
    allMeshes.forEach((meshContext, mesh) => {
      // if a previous mesh is no longer reported
      if (!frame.detectedMeshes.has(mesh)) {
        // mesh was removed
        allMeshes.delete(mesh);
        console.debug("Mesh no longer tracked, id=" + meshContext.id);

        scene.remove(meshContext.mesh);
        scene.remove(meshContext.wireframe);
      }
    });
    // compare all incoming meshes with our internal state
    frame.detectedMeshes.forEach((mesh) => {
      const meshPose = frame.getPose(mesh.meshSpace, referenceSpace);
      let meshMesh;
      let wireframeMesh;

      // this is a mesh we've seen before

      if (allMeshes.has(mesh)) {
        /*
        // may have been updated:
        const meshContext = allMeshes.get(mesh);
        meshMesh = meshContext.mesh;
        wireframeMesh = meshContext.wireframe;

        if (meshContext.timestamp < mesh.lastChangedTime) {
          // the mesh was updated!
          meshContext.timestamp = mesh.lastChangedTime;

          const geometry = createGeometry(mesh.vertices, mesh.indices);
          meshContext.mesh.geometry.dispose();
          meshContext.mesh.geometry = geometry;
          meshContext.wireframe.geometry.dispose();
          meshContext.wireframe.geometry = geometry;
        }
       */
      } else {
        // new mesh

        // Create geometry:
        // const geometry = createGeometry(mesh.vertices, mesh.indices);
        const vertices = new Float32Array(mesh.vertices);
        const indices = new Uint32Array(mesh.indices);
        const geometry = createGeometry(vertices, indices);
        geometry.computeBoundingBox();

        const x = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        const y = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
        const z = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
        const geometryBoundingBox = new THREE.BoxGeometry(x, y, z);

        wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
        wireframeMesh.matrixAutoUpdate = false;
        var matrix = new Matrix4();
        matrix.fromArray(meshPose.transform.matrix);
        var position = new THREE.Vector3();
        position.setFromMatrixPosition(matrix);
        var rotation = new THREE.Euler();

        // Set rotation from the matrix
        rotation.setFromRotationMatrix(matrix);

        phy.add({
          name: "wireframeMesh" + wireframemeshNumber,
          type: "mesh",
          mesh: wireframeMesh,
          pos: [position.x, position.y, position.z],
          rot: [
            (rotation.x * 180) / Math.PI,
            (rotation.y * 180) / Math.PI,
            (rotation.z * 180) / Math.PI,
          ],
          mass: 0,
          debug: false,
          matrix: wireframeMesh.matrix,
          shadow: false,
          // visible: false
        });
        wireframemeshNumber = wireframemeshNumber + 1;

        let count = 0;
        for (let i = 0; i < ballsLab; i++) {
          const material = new THREE.MeshLambertMaterial();
          var ballColor = i % 3;
          if (ballColor == 0) {
            material.color.setHex(0xb0b3b2);
          } else if (ballColor == 1) {
            material.color.setHex(0x231f20);
          } else if (ballColor == 2) {
            material.color.setHex(0xeec629);
          }
          //count = count + 1;
          phy.add({
            name: "sphere" + i,
            type: "sphere",
            size: [0.05],
            widthSegments: 4,
            heightSegments: 4,
            pos: [Math.random() * 3, 2, Math.random() * 3],
            mass: 0.1,
            material: material,
            restitution: 1,
            friction: 0,
          });
        }
        const material2 = new THREE.MeshLambertMaterial({
          //wireframe: true,
          colorWrite: false,
          //transparent: true,
          //opacity: 0,
          renderOrder: 2,
          //receiveShadow: true,
        });

        const material3 = new THREE.ShadowMaterial({
          color: 0x000000,
          transparent: false,
          opacity: 0,
          renderOrder: 3,
        });

        // create a buffer geometry
        // create a buffer geometry
        let occlusionMesh = new THREE.Mesh(geometry, material2);
        occlusionMesh.position.setFromMatrixPosition(matrix);
        occlusionMesh.quaternion.setFromRotationMatrix(matrix);
        occlusionMesh.name = "Occlusion Mesh";
        let shadowMesh = new THREE.Mesh(geometry, material3);
        shadowMesh.position.setFromMatrixPosition(matrix);
        shadowMesh.quaternion.setFromRotationMatrix(matrix);
        shadowMesh.receiveShadow = true;
        shadowMesh.name = "Shadow Mesh";
        shadowGroup.add(shadowMesh);
        occlusionGroup.add(occlusionMesh);
        occlusionMesh.visible = true;
        shadowMesh.visible = true;
        socket.emit("addMeshDetectionPhysicsToServer", {
          vertices: mesh.vertices,
          indices: mesh.indices,
          matrix: matrix,
        });
      }
    });
  }
  button4Active = false;
  enableBalls = true;
}

function processMeshesToClient(data) {
  let wireframeMesh;
  const vertices = new Float32Array(data.vertices);
  const indices = new Uint32Array(data.indices);
  let matrix = new THREE.Matrix4();
  matrix = data.matrix;
  const geometry = createGeometry(vertices, indices);
  geometry.computeBoundingBox();

  const x = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
  const y = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
  const z = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
  const geometryBoundingBox = new THREE.BoxGeometry(x, y, z);

  wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
  wireframeMesh.matrixAutoUpdate = false;

  var position = new THREE.Vector3();
  position.setFromMatrixPosition(matrix);
  var rotation = new THREE.Euler();

  // Set rotation from the matrix
  rotation.setFromRotationMatrix(matrix);
  console.log(wireframeMesh);

  phy.add({
    name: "wireframeMesh" + wireframemeshNumber,
    type: "mesh",
    mesh: wireframeMesh,
    pos: [position.x, position.y, position.z],
    rot: [
      (rotation.x * 180) / Math.PI,
      (rotation.y * 180) / Math.PI,
      (rotation.z * 180) / Math.PI,
    ],
    mass: 0,
    debug: false,
    matrix: wireframeMesh.matrix,
  });
wireframemeshNumber = wireframemeshNumber + 1;
  let count = 0;
  for (let i = 0; i < ballsLab; i++) {
    const material = new THREE.MeshLambertMaterial();
    var ballColor = i % 3;
    if (ballColor == 0) {
      material.color.setHex(0xb0b3b2);
    } else if (ballColor == 1) {
      material.color.setHex(0x231f20);
    } else if (ballColor == 2) {
      material.color.setHex(0xeec629);
    }
    //count = count + 1;
    phy.add({
      name: "sphere" + i,
      type: "sphere",
      size: [0.05],
      pos: [Math.random() * 3, 2, Math.random() * 3],
      mass: 0.1,
      material: material,
      restitution: 1,
      friction: 0,
    });
  }
  const material2 = new THREE.MeshLambertMaterial({
    //wireframe: true,
    colorWrite: true,
    //transparent: true,
    //opacity: 0,
    renderOrder: 2,
    //receiveShadow: true,
  });

  const material3 = new THREE.ShadowMaterial({
    color: 0x444444,
    transparent: false,
    opacity: 0.6,
    renderOrder: 3,
  });

  // create a buffer geometry
  let occlusionMesh = new THREE.Mesh(geometry, material2);
  occlusionMesh.position.setFromMatrixPosition(matrix);
  occlusionMesh.quaternion.setFromRotationMatrix(matrix);
  occlusionMesh.name = "Occlusion Mesh";
  let shadowMesh = new THREE.Mesh(geometry, material3);
  shadowMesh.position.setFromMatrixPosition(matrix);
  shadowMesh.quaternion.setFromRotationMatrix(matrix);
  shadowMesh.receiveShadow = true;
  shadowMesh.name = "Shadow Mesh";
  shadowGroup.add(shadowMesh);
  occlusionGroup.add(occlusionMesh);

  button4Active = false;
  enableBalls = true;
}

function squeezeController(controller) {
  // Get the position and rotation of the controller
  const controllerPosition = new THREE.Vector3();
  const controllerRotation = new THREE.Quaternion();
  controller.getWorldPosition(controllerPosition);
  controller.getWorldQuaternion(controllerRotation);

  // Assuming your object is attached to the controller
  // You can get its position relative to the world by applying its world matrix
  const objectPosition = new THREE.Vector3();
  objectPosition.setFromMatrixPosition(centerOfRotation.matrixWorld);

  // To get the rotation, let's create a new matrix with the rotation from the controller
  const controllerRotationMatrix = new THREE.Matrix4();
  controllerRotationMatrix.makeRotationFromQuaternion(controllerRotation);

  const objectRotationQuaternion = new THREE.Quaternion();
  const objectRotationEuler = new THREE.Euler();
  objectRotationQuaternion
    .copy(controllerRotation)
    .multiply(centerOfRotation.quaternion);
  objectRotationEuler.setFromQuaternion(objectRotationQuaternion);
  socket.emit("centerOfRotationToServer", {
    CORposX: objectPosition.x,
    CORposY: objectPosition.y,
    CORposZ: objectPosition.z,
    CORrotX: objectRotationEuler.x,
    CORrotY: objectRotationEuler.y,
    CORrotZ: objectRotationEuler.z,
  });
}

function createXRButton(group, size, text, position, rotation, color, onClick) {
  // Create a button geometry
  const buttonGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
  const buttonMaterial = new THREE.MeshLambertMaterial({ color: color });
  const button = new THREE.Mesh(buttonGeometry, buttonMaterial);

  // Set button position
  button.position.copy(position);
  button.rotation.set(rotation.x, rotation.y, rotation.z);

  // Add button to the scene
  group.add(button);
  // Add event listener to the button
  button.onClick = onClick;

  // Add interaction handler to the button
  button.addEventListener("pointerclick", function (event) {
    onClick();
  });

  // Create a text geometry
  const buttonText = createText(text, 0.1);
  button.add(buttonText);

  // Position the text above the button
  buttonText.position.add(new THREE.Vector3(0, 0, 0.1));
}

function dropBalls() {
  drop = drop + 1;
  if (drop === dropRate) {
    drop = 0;
    if (count < ballsGalton - 1 && enablePhysics) {
      const material = new THREE.MeshLambertMaterial();
      count = count + 1;
      phy.add({
        name: "sphere" + count,
        type: "sphere",
        size: [0.013],
        pos: [1.65, 2.5, Math.random() * 0.5 + 1.5],
        mass: 1000,
        material: material,
        restitution: 0.85,
        friction: 0.5,
        linearVelocity: [0, 0, 0],
      });
    }
  }
}

function handlePainter(controller) {
  controller.updateMatrixWorld(true);

  const userData = controller.userData;
  const painter = userData.painter;

  const pivot = controller.getObjectByName("pivot");

  if (userData.isSqueezing === true) {
    const delta = (controller.position.y - userData.positionAtSqueezeStart) * 5;
    const scale = Math.max(0.1, userData.scaleAtSqueezeStart + delta);

    pivot.scale.setScalar(scale);
    painter.setSize(scale);
  }

  cursor.setFromMatrixPosition(pivot.matrixWorld);

  if (userData.isSelecting === true) {
    painter.lineTo(cursor);
    painter.update();
    socket.emit("updatePaintToServer", {
      cursor: cursor,
      controllerName: controller.name,
    });
  }
}

function uitest() {
  const container = new ThreeMeshUI.Block({
    width: 1.2,
    height: 0.7,
    padding: 0.2,
    fontFamily: "Roboto-msdf.json",
    fontTexture:
      "https://cdn.glitch.global/75a9e89d-a789-4b11-8971-b706f6ebc90d/Roboto-msdf.png?v=1712865747602",
  });

  //

  const text = new ThreeMeshUI.Text({
    content: "Some text to be displayed",
  });

  container.add(text);
  container.position.set(0, 2, 2);
  container.rotation.y = -Math.PI / 2;

  // scene is a THREE.Scene (see three.js)
  scene.add(container);
}

function makePanel() {
  // Container block, in which we put the two buttons.
  // We don't define width and height, it will be set automatically from the children's dimensions
  // Note that we set contentDirection: "row-reverse", in order to orient the buttons horizontally

  const container = new ThreeMeshUI.Block({
    justifyContent: "center",
    contentDirection: "row-reverse",
    fontFamily: "Roboto-msdf.json",
    fontTexture:
      "https://cdn.glitch.global/75a9e89d-a789-4b11-8971-b706f6ebc90d/Roboto-msdf.png?v=1712865747602",
    fontSize: 0.07,
    padding: 0.02,
    borderRadius: 0.11,
  });

  container.position.set(0, 0.6, -1.2);
  container.rotation.x = -0.55;
  scene.add(container);

  // BUTTONS

  // We start by creating objects containing options that we will use with the two buttons,
  // in order to write less code.

  const buttonOptions = {
    width: 0.4,
    height: 0.15,
    justifyContent: "center",
    offset: 0.05,
    margin: 0.02,
    borderRadius: 0.075,
  };

  // Options for component.setupState().
  // It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

  const hoveredStateAttributes = {
    state: "hovered",
    attributes: {
      offset: 0.035,
      backgroundColor: new THREE.Color(0x999999),
      backgroundOpacity: 1,
      fontColor: new THREE.Color(0xffffff),
    },
  };

  const idleStateAttributes = {
    state: "idle",
    attributes: {
      offset: 0.035,
      backgroundColor: new THREE.Color(0x666666),
      backgroundOpacity: 0.3,
      fontColor: new THREE.Color(0xffffff),
    },
  };

  // Buttons creation, with the options objects passed in parameters.

  const buttonNext = new ThreeMeshUI.Block(buttonOptions);
  const buttonPrevious = new ThreeMeshUI.Block(buttonOptions);

  // Add text to buttons

  buttonNext.add(new ThreeMeshUI.Text({ content: "next" }));

  buttonPrevious.add(new ThreeMeshUI.Text({ content: "previous" }));

  // Create states for the buttons.
  // In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

  const selectedAttributes = {
    offset: 0.02,
    backgroundColor: new THREE.Color(0x777777),
    fontColor: new THREE.Color(0x222222),
  };

  buttonNext.setupState({
    state: "selected",
    attributes: selectedAttributes,
    onSet: () => {
      currentMesh = (currentMesh + 1) % 3;
      showMesh(currentMesh);
    },
  });
  buttonNext.setupState(hoveredStateAttributes);
  buttonNext.setupState(idleStateAttributes);

  //

  buttonPrevious.setupState({
    state: "selected",
    attributes: selectedAttributes,
    onSet: () => {
      currentMesh -= 1;
      if (currentMesh < 0) currentMesh = 2;
      showMesh(currentMesh);
    },
  });
  buttonPrevious.setupState(hoveredStateAttributes);
  buttonPrevious.setupState(idleStateAttributes);

  //

  container.add(buttonNext, buttonPrevious);
  //objsToTest.push( buttonNext, buttonPrevious );
}
