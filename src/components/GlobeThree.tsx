import * as THREE from 'three';
import {useEffect, useMemo, useRef, useState} from "react";
import colors from 'tailwindcss/colors'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {degToRad, radToDeg} from "three/src/math/MathUtils";
import {Vector2, Vector3} from "three";

const COLOR = colors.yellow[300]
const COLORS = [
  colors.red[300],
  colors.red[400],
  colors.blue[300],
  colors.blue[400],
  colors.blue[500],
  colors.blue[600],
]
const LOCATIONS: [number, number, string][] = [
  [39.464110240058474, 116.76059998183419, COLOR],
  [10, 107, COLOR],
  [14.607267116823683, 120.98230962898955, COLOR],
  [28.666581425155876, 77.13986948910272, COLOR],
  [51.22845035657287, 6.79236826370534, COLOR],
  [40.74073476240403, -74.00993876330539, COLOR],
  [49.27271658864407, -123.1692250640194, COLOR],
  [-33.796463490407795, 150.95115015617827, COLOR],
  [-37.69739684214308, 144.84969824580452, COLOR],
  [-22.11011005802673, -45.676777503725255, COLOR],
  [1.363145943310978, 103.80157848931465, COLOR],
  [51.517924352947105, -0.10987471591297189, COLOR],
]

const randomInt = (n: number) => Math.floor(Math.random() * n)

const createHexagon = (r: number, h: number, color: string) => {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, h, 6),
    new THREE.MeshPhongMaterial({
      color: color,
      specular: 'white',
      shininess: 80
    }),
  );
}

const convertLatLon = (lat: number, lon: number, r: number) => {
  const phi = degToRad(lat)
  const theta = degToRad(lon)
  return new Vector3(
    Math.cos(phi) * Math.sin(theta) * r,  // through long 90
    Math.sin(phi) * r,  // up pol
    Math.cos(phi) * Math.cos(theta) * r,  // through long lat 0
  )
}

const createLocation = (lat: number, lon: number, props?: {
  size?: number,
  color?: string,
}) => {

  const o = createHexagon(props?.size ?? 0.02, 0.05, props?.color ?? colors.slate[800]);

  const p = convertLatLon(lat, lon, 1.01);

  o.position.set(p.x, p.y, p.z)

  o.setRotationFromEuler(new THREE.Euler(degToRad(-lat + 90), degToRad(lon), 0, 'YXZ'))

  return o
}

const drawLine = (scene: THREE.Scene, pointStart: Vector3, pointEnd: Vector3, smoothness: number, color: string, clockWise: boolean) => {
  // calculate a normal ( taken from Geometry().computeFaceNormals() )
  const cb = new THREE.Vector3(), ab = new THREE.Vector3(), normal = new THREE.Vector3();
  cb.subVectors(new THREE.Vector3(), pointEnd);
  ab.subVectors(pointStart, pointEnd);
  cb.cross(ab);
  normal.copy(cb).normalize();


  let angle = pointStart.angleTo(pointEnd); // get the angle between vectors
  if (clockWise) angle = angle - Math.PI * 2;  // if clockWise is true, then we'll go the longest path
  const angleDelta = angle / (smoothness - 1); // increment

  const points = []
  for (let i = 0; i < smoothness; i++) {
    points.push(pointStart.clone().applyAxisAngle(normal, angleDelta * i))  // this is the key operation
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(points);

  const material = new THREE.LineDashedMaterial({
    color: color,
    gapSize: 0,
    dashSize: 1,
  })
  const arc = new THREE.Line(geometry, material);
  scene.add(arc)

  return {
    material,
    arc,
  }
}

const drawGalaxy = (scene: THREE.Scene) => {
  const galaxyGeometry = new THREE.SphereGeometry(100, 16, 16);
  const galaxyMaterial = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,

  });
  const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);

  const textureLoader = new THREE.TextureLoader();

  // Load Galaxy Textures
  textureLoader.load(
    '/images/starfield.png',
    function (texture) {
      galaxyMaterial.map = texture;
      scene.add(galaxy);
    }
  );
  return galaxy

}

const drawAxis = (scene: THREE.Scene) => {
  const r = 1.2;
  /// X
  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(r, 0, 0),
    ]),
    new THREE.LineBasicMaterial({color: 'red'})
  ))

  /// Y
  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, r, 0),
    ]),
    new THREE.LineBasicMaterial({color: 'green'})
  ))

  /// Z
  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, r),
    ]),
    new THREE.LineBasicMaterial({color: 'yellow'})
  ))
}

const drawEarth = (scene: THREE.Scene) => {
  const texture = new THREE.TextureLoader().load('/images/earthdark2.jpg');
  const texture2 = new THREE.TextureLoader().load('/images/earthbump.jpg');
  const texture3 = new THREE.TextureLoader().load('/images/earthspec.jpg');
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    bumpMap: texture2,
    bumpScale: 0.02,
    specularMap: texture3,
    specular: new THREE.Color('grey'),
    shininess: 20
  })
  const s1 = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    material,
  );
  s1.rotation.y = -Math.PI / 2
  scene.add(s1);

}

const render = (canvas: HTMLCanvasElement, width, height) => {

  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
  renderer.setSize(width, height);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 200);


  /// Lights
  scene.add(new THREE.AmbientLight(colors.slate[700]));
  const l1 = new THREE.PointLight(colors.blue[200], 1.0)
  l1.position.set(200, 50, -200)
  scene.add(l1)

  const linesList = []


  // OBJECTS


  // drawAxis(scene)
  // const galaxy = drawGalaxy(scene)
  drawEarth(scene)
  LOCATIONS.forEach(([lat, lon, color], index) => {
    scene.add(createLocation(lat, lon, {color}));

  });

  const randomLine = () => {
    if (Math.random() > 0.3) return;
    if (linesList.length > 0){
      const index = Math.floor(Math.random() * linesList.length)
      const found = linesList[index];
      scene.remove(found.arc)
      linesList.splice(index,1)
    }

    LOCATIONS.forEach(([lat, lon, color], index) => {
      if (LOCATIONS.length > 1) {
        if (Math.random() > 0.5) return;
        if (linesList.length > 40) return;
        for (let i = 0; i < 1; i++) {
          let index2;
          do {
            index2 = Math.floor(Math.random() * LOCATIONS.length)
          } while (index === index2)
          const [lat2, lon2,] = LOCATIONS[index2];

          const p1 = convertLatLon(lat, lon, 1.04)
          const p2 = convertLatLon(lat2, lon2, 1.04)

          linesList.push(
            drawLine(scene, p1, p2, 100, COLORS[randomInt(COLORS.length)], Math.random() > 0.5)
          )

        }
      }
    });
  }

  // for (let lat = -90; lat <= 90 ; lat +=45){
  //   for (let lon = -180; lon <= 180; lon+=45) {
  //     scene.add(createLocation(lat, lon, {size: 0.02}))
  //   }
  // }

  // INTERACTIVE
  let pointer = new Vector2()
  const raycaster = new THREE.Raycaster();

  function handleMouseMove(e: MouseEvent) {
    pointer = new Vector2((e.offsetX / canvas.width) * 2 - 1, (e.offsetY / canvas.height) * 2 - 1)
    // console.log(pointer)
  }

  canvas.addEventListener('mousemove', handleMouseMove);

  /// CONTROLS
  const controls = new OrbitControls(camera, canvas)
  controls.minDistance = 3
  controls.maxDistance = 5
  controls.minPolarAngle = 1.0
  controls.maxPolarAngle = 1.2

  let destroyed = false;
  let animationFrame;

  camera.position.set(2.3888806822433493, 1.2544188165577134, -0.9222139556923159);

  let fraction = 0;

  scene.rotation.y = -1.4
  /// the loop
  function animate() {
    if (destroyed) {
      if (animationFrame) cancelAnimationFrame(animationFrame)
      return;
    }
    scene.rotation.y += 0.002
    // galaxy.rotation.y -= 0.0018

    {
      // const {x,y,z} = camera.position
      // console.log(x,y,z)
    }

    {
      randomLine()
    }


    // raycaster.setFromCamera(pointer, camera);
    // const intersects = raycaster.intersectObjects(scene.children,false);
    // if (intersects.length > 0){
    //   console.log(intersects.length, pointer, intersects[0].object)
    // }

    controls.update();

    animationFrame = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();

  /// return deconstructor for useEffect
  return () => {
    destroyed = true;
    canvas.removeEventListener('mousemove', handleMouseMove)
  }
}

export const GlobeThree = (props: {
  className?: string,
  size?: number,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas != null) {
      return render(canvas, props.size ?? 800, props.size ?? 800);
    }
  }, [canvasRef.current, props.size])

  return <div {...props} >
    <canvas ref={canvasRef} style={{
      filter: 'drop-shadow(10px 10px 30px #111)'
    }}/>
  </div>
}