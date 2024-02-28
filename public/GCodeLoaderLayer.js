import {
  BufferGeometry,
  FileLoader,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Loader,
} from "three";

let tcode = 0;
let printerPath = [];
/**
 * GCodeLoader is used to load gcode files usually used for 3D printing or CNC applications.
 *
 * Gcode files are composed by commands used by machines to create objects.
 *
 * @class GCodeLoader
 * @param {Manager} manager Loading manager.
 */

class GCodeLoaderLayer extends Loader {
  constructor(manager) {
    super(manager);

    this.splitLayer = true;
  }

  load(url, onLoad, onProgress, onError) {
    const scope = this;

    const loader = new FileLoader(scope.manager);
    loader.setPath(scope.path);
    loader.setRequestHeader(scope.requestHeader);
    loader.setWithCredentials(scope.withCredentials);
    loader.load(
      url,
      function (text) {
        try {
          onLoad(scope.parse(text));
        } catch (e) {
          if (onError) {
            onError(e);
          } else {
            console.error(e);
          }

          scope.manager.itemError(url);
        }
      },
      onProgress,
      onError
    );
  }

  parse(data) {
    let state = {
      x: 0,
      y: 0,
      z: 0,
      e: 0,
      f: 0,
      extruding: false,
      relative: false,
    };
    const layers = [];

    let currentLayer = undefined;

    const pathMaterial = new LineBasicMaterial({ color: 0xff0000 });
    pathMaterial.name = "path";

    const supportMaterial = new LineBasicMaterial({ color: 0xffffff });
    supportMaterial.name = "support";

    const extrudingMaterial = new LineBasicMaterial({ color: 0x00ff00 });
    extrudingMaterial.name = "extruded";

    function newLayer(line) {
      currentLayer = {
        vertex: [],
        pathVertex: [],
        supportVertex: [],
        z: line.z,
      };
      layers.push(currentLayer);
    }

    //Create lie segment between p1 and p2
    function addSegment(p1, p2, tc) {
      if (currentLayer === undefined) {
        newLayer(p1);
      }

      if (state.extruding && tc === 1) {
        currentLayer.vertex.push(p1.x, p1.y, p1.z);
        currentLayer.vertex.push(p2.x, p2.y, p2.z);
      } else if (state.extruding && tc === 0) {
        currentLayer.supportVertex.push(p1.x, p1.y, p1.z);
        currentLayer.supportVertex.push(p2.x, p2.y, p2.z);
      } else {
        currentLayer.pathVertex.push(p1.x, p1.y, p1.z);
        currentLayer.pathVertex.push(p2.x, p2.y, p2.z);}
    }

    function delta(v1, v2) {
      return state.relative ? v2 : v2 - v1;
    }

    function absolute(v1, v2) {
      return state.relative ? v1 + v2 : v2;
    }

		var lines = data.replace( /;.+/g, '' ).split( '\n' );
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]; // Trim leading and trailing spaces
      //console.log(line);

      if (line.includes("T1")) {
        tcode = 1;
        //console.log("T1");
      }
      if (line.includes("T0")) {
        tcode = 0;
        // console.log("T0");
      }

      const tokens = lines[i].split(" ");
      const cmd = tokens[0].toUpperCase();

      //Argumments
      const args = {};
      tokens.splice(1).forEach(function (token) {
        if (token[0] !== undefined) {
          const key = token[0].toLowerCase();
          const value = parseFloat(token.substring(1));
          args[key] = value;
        }
      });

      //Process commands
      //G0/G1 – Linear Movement
      if (cmd === "G0" || cmd === "G1") {
        let line;
        if (tcode === 0) {
          line = {
            x: args.x !== undefined ? absolute(state.x, args.x) : state.x,
            y: args.y !== undefined ? absolute(state.y, args.y) : state.y,
            z: args.z !== undefined ? absolute(state.z, args.z) : state.z,
            e: args.e !== undefined ? absolute(state.e, args.e) : state.e,
            f: args.f !== undefined ? absolute(state.f, args.f) : state.f,
          };
        } else {
          line = {
            x: args.x !== undefined ? absolute(state.x, args.x - 22) : state.x,
            y: args.y !== undefined ? absolute(state.y, args.y) : state.y,
            z: args.z !== undefined ? absolute(state.z, args.z) : state.z,
            e: args.e !== undefined ? absolute(state.e, args.e) : state.e,
            f: args.f !== undefined ? absolute(state.f, args.f) : state.f,
          };
        }

        //Layer change detection is or made by watching Z, it's made by watching when we extrude at a new Z position
        if (delta(state.e, line.e) > 0) {
          state.extruding = delta(state.e, line.e) > 0;

          if (currentLayer == undefined || line.z != currentLayer.z) {
            newLayer(line);
          }
        }

        addSegment(state, line, tcode);
        state = line;
      } else if (cmd === "G2" || cmd === "G3") {
        //G2/G3 - Arc Movement ( G2 clock wise and G3 counter clock wise )
        //console.warn( 'THREE.GCodeLoader: Arc command not supported' );
      } else if (cmd === "G90") {
        //G90: Set to Absolute Positioning
        state.relative = false;
      } else if (cmd === "G91") {
        //G91: Set to state.relative Positioning
        state.relative = true;
      } else if (cmd === "G92") {
        //G92: Set Position
        const line = state;
        line.x = args.x !== undefined ? args.x : line.x;
        line.y = args.y !== undefined ? args.y : line.y;
        line.z = args.z !== undefined ? args.z : line.z;
        line.e = args.e !== undefined ? args.e : line.e;
      } else {
        //console.warn( 'THREE.GCodeLoader: Command not supported:' + cmd );
      }
    }

    function addObject(vertex, extruding, i) {
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new Float32BufferAttribute(vertex, 3));
      const segments = new LineSegments(
        geometry,
        extruding,
      );
      segments.name = "layer" + i;
      object.add(segments);
    }

    const object = new Group();
    object.name = "gcode";

    if (this.splitLayer) {
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        addObject(layer.vertex, extrudingMaterial, i);
        addObject(layer.pathVertex, pathMaterial, i);
        addObject(layer.supportVertex, supportMaterial, i);
      }
    } else {
      const vertex = [],
        pathVertex = [],
        supportVertex = [];

      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const layerVertex = layer.vertex;
        const layerPathVertex = layer.pathVertex;
        const layerSupportVertex = layer.supportVertex;

        for (let j = 0; j < layerVertex.length; j++) {
          vertex.push(layerVertex[j]);
        }

        for (let j = 0; j < layerPathVertex.length; j++) {
          pathVertex.push(layerPathVertex[j]);
        }

        for (let j = 0; j < layerSupportVertex.length; j++) {
          supportVertex.push(layerSupportVertex[j]);
        }
      }

      addObject(vertex, extrudingMaterial, layers.length);
      addObject(pathVertex, pathMaterial, layers.length);
      addObject(supportVertex, supportMaterial, layers.length);
    }

    object.rotation.set(-Math.PI / 2, 0, 0);
    return object;
  }
}

export { GCodeLoaderLayer };
