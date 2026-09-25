import { AmbientLight, Color, DirectionalLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { THEME } from '../ui/theme';

export type CameraPreset = 'default' | 'bottom' | 'top' | 'front';

const CAMERA_PRESETS: Readonly<Record<CameraPreset, { readonly x: number; readonly y: number; readonly z: number }>> = {
  default: { x: 4.8, y: 1.6, z: 4.8 },
  bottom: { x: 4.6, y: -2.3, z: 4.6 }, // Angle looking up: Bottom (White), Front, and Right faces clearly visible!
  top: { x: 4.6, y: 3.3, z: 4.6 },    // Angle looking down: Top (Yellow Face), Front, and Right faces clearly visible!
  front: { x: 0.1, y: 0.4, z: 7.2 },  // Front eye-level face
};

export type RendererApi = {
  readonly canvas: HTMLCanvasElement;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly orbit: OrbitControls;
  start(onFrame: (nowMs: number) => void): void;
  resetCamera(): void;
  setCameraPreset(preset: CameraPreset): void;
  setCameraStage(stage: string): void;
};

export function createRenderer(container: HTMLElement): RendererApi {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  scene.background = new Color(THEME.colors.sceneBgHex);

  const camera = new PerspectiveCamera(40, 1, 0.1, 100);
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;
  orbit.enablePan = false;
  orbit.minDistance = 4;
  orbit.maxDistance = 15;

  const targetPosition = new Vector3(CAMERA_PRESETS.default.x, CAMERA_PRESETS.default.y, CAMERA_PRESETS.default.z);
  let isLerping = false;

  const resetCamera = (): void => {
    targetPosition.set(CAMERA_PRESETS.default.x, CAMERA_PRESETS.default.y, CAMERA_PRESETS.default.z);
    camera.position.copy(targetPosition);
    orbit.target.set(0, 0, 0);
    orbit.update();
    isLerping = false;
  };
  resetCamera();

  // If user grabs and orbits manually, pause automated camera glide
  orbit.addEventListener('start', () => {
    isLerping = false;
  });

  const setCameraPreset = (preset: CameraPreset): void => {
    const p = CAMERA_PRESETS[preset] ?? CAMERA_PRESETS.default;
    targetPosition.set(p.x, p.y, p.z);
    isLerping = true;
  };

  const setCameraStage = (stage: string): void => {
    if (stage === 'white_cross' || stage === 'white_corners') {
      // Tilt to reveal White Cross and bottom corners
      setCameraPreset('bottom');
    } else if (stage === 'middle_edges') {
      // Balanced eye-level view for second layer
      setCameraPreset('default');
    } else {
      // Tilt up to reveal Yellow Cross, Sune, Niklas, and U-Perm
      setCameraPreset('top');
    }
  };

  scene.add(new AmbientLight(0xffffff, 1.3));
  const key = new DirectionalLight(0xffffff, 1.8);
  key.position.set(5, 8, 6);
  scene.add(key);
  const fill = new DirectionalLight(0xffffff, 0.7);
  fill.position.set(-6, -3, -4);
  scene.add(fill);

  const resize = (): void => {
    const { clientWidth, clientHeight } = container;
    if (clientWidth <= 0 || clientHeight <= 0) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container);
  resize();

  return {
    canvas: renderer.domElement,
    scene,
    camera,
    orbit,
    start(onFrame) {
      renderer.setAnimationLoop((nowMs) => {
        if (isLerping) {
          camera.position.lerp(targetPosition, 0.08);
          orbit.target.set(0, 0, 0);
          orbit.update();
          if (camera.position.distanceTo(targetPosition) < 0.04) {
            camera.position.copy(targetPosition);
            isLerping = false;
          }
        }
        onFrame(nowMs);
        orbit.update();
        renderer.render(scene, camera);
      });
    },
    resetCamera,
    setCameraPreset,
    setCameraStage,
  };
}
