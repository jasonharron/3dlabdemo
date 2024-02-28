import {
	BoxGeometry,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	Object3D
} from 'three';

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
          const material = new THREE.MeshLambertMaterial({
            color: 0x75d2e0, //0xffffff * Math.random(),
            transparent: true,
            opacity: 0.2,
            //wireframe: true,
            //wireframeLinewidth: 3,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.setFromMatrixPosition(matrix);
          mesh.quaternion.setFromRotationMatrix(matrix);
          this.add(mesh);

          var centerMesh = getCenterPoint(mesh);

          const edges = new THREE.EdgesGeometry(geometry);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 5 })
          );
          line.position.setFromMatrixPosition(matrix);
          line.quaternion.setFromRotationMatrix(mesh.matrix);
          line.updateMatrix();
          lineGroup.add(line);

          const geometryPhysics = new THREE.BoxGeometry(
            width,
            0.2,
            height
          ).translate(0, 0.1, 0);
          const meshPhysics = new THREE.Mesh(geometryPhysics, material);
          meshPhysics.position.setFromMatrixPosition(matrix);
          meshPhysics.quaternion.setFromRotationMatrix(matrix);
          //scene.add(meshPhysics);
          physics.addMesh(meshPhysics);

          socket.emit("addPlane", {
            width: width,
            length: length,
            height: height,
            color: material.color,
            transparent: material.transparent,
            opacity: material.opacity,
            matrix: matrix,
          });

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
export { XRPlanes };