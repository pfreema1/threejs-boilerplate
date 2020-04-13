import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import glslify from 'glslify';
import Tweakpane from 'tweakpane';
import OrbitControls from 'three-orbitcontrols';
import TweenMax from 'TweenMax';
import baseDiffuseFrag from '../../shaders/basicDiffuse.frag';
import basicDiffuseVert from '../../shaders/basicDiffuse.vert';
import MouseCanvas from '../MouseCanvas';
import TextCanvas from '../TextCanvas';
import RenderTri from '../RenderTri';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { debounce } from '../utils/debounce';
import Blur from '../Blur';

export default class WebGLView {
  constructor(app) {
    this.app = app;
    this.PARAMS = {
      rotSpeed: 0.005
    };

    this.init();
  }

  async init() {
    this.initThree();
    this.initBgScene();
    this.initLights();
    this.initTweakPane();
    this.setupTextCanvas();
    this.initMouseMoveListen();
    this.initMouseCanvas();
    this.initRenderTri();
    this.initPostProcessing();
    this.initResizeHandler();

    this.addCubes();

    this.initBlur();
  }

  initBlur() {
    this.blur = new Blur(this.bgScene, this.bgCamera, this.renderer);
  }

  addCubes() {
    let geo = new THREE.BoxBufferGeometry(0.5, 0.5, 0.5, 8, 8, 8);
    let mat1 = new THREE.MeshBasicMaterial({ color: 'blue' });
    let mat2 = new THREE.MeshBasicMaterial({ color: 'green' });

    this.cube1 = new THREE.Mesh(geo, mat1);
    this.cube1.position.x = -1;
    this.cube2 = new THREE.Mesh(geo, mat2);
    this.cube2.position.x = 1;

    this.bgScene.add(this.cube1);
    this.bgScene.add(this.cube2);


  }

  initResizeHandler() {
    window.addEventListener(
      'resize',
      debounce(() => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.renderer.setSize(this.width, this.height);

        // render tri
        this.renderTri.renderer.setSize(this.width, this.height);
        this.renderTri.mat.uniforms.uResolution.value = new THREE.Vector2(
          this.width,
          this.height
        );

        // bg scene
        this.bgRenderTarget.setSize(this.width, this.height);
        this.bgCamera.aspect = this.width / this.height;
        this.bgCamera.updateProjectionMatrix();

        // text canvas
        this.textCanvas.canvas.width = this.width;
        this.textCanvas.canvas.height = this.height;
        this.setupTextCanvas();
        this.renderTri.mat.uniforms.uTextCanvas.value = this.textCanvas.texture;

        // mouse canvas
        this.mouseCanvas.canvas.width = this.width;
        this.mouseCanvas.canvas.height = this.height;

        // composer
        this.composer.setSize(this.width, this.height);
      }, 500)
    );
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);

    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // const bloomPass = new BloomPass(
    //   1, // strength
    //   25, // kernel size
    //   4, // sigma ?
    //   256 // blur render target resolution
    // );
    // this.composer.addPass(bloomPass);

    // const filmPass = new FilmPass(
    //   0.35, // noise intensity
    //   0.025, // scanline intensity
    //   648, // scanline count
    //   false // grayscale
    // );
    // filmPass.renderToScreen = true;
    // this.composer.addPass(filmPass);
  }

  initTweakPane() {
    this.pane = new Tweakpane();

    this.pane
      .addInput(this.PARAMS, 'rotSpeed', {
        min: 0.0,
        max: 0.5
      })
      .on('change', value => { });
  }

  initMouseCanvas() {
    this.mouseCanvas = new MouseCanvas();
  }

  initMouseMoveListen() {
    this.mouse = new THREE.Vector2();
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    window.addEventListener('mousemove', ({ clientX, clientY }) => {
      this.mouse.x = clientX; //(clientX / this.width) * 2 - 1;
      this.mouse.y = clientY; //-(clientY / this.height) * 2 + 1;

      this.mouseCanvas.addTouch(this.mouse);
    });
  }

  initThree() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.autoClear = true;

    this.clock = new THREE.Clock();
  }

  setupTextCanvas() {
    this.textCanvas = new TextCanvas(this);
  }


  initRenderTri() {
    this.resize();

    this.renderTri = new RenderTri(
      this.scene,
      this.renderer,
      this.bgRenderTarget,
      this.mouseCanvas,
      this.textCanvas
    );
  }

  initBgScene() {
    this.bgRenderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
    this.bgCamera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    );
    this.controls = new OrbitControls(this.bgCamera, this.renderer.domElement);

    this.bgCamera.position.z = 3;
    this.controls.update();

    this.bgScene = new THREE.Scene();
  }

  initLights() {
    this.pointLight = new THREE.PointLight(0xff0000, 1, 100);
    this.pointLight.position.set(0, 0, 50);
    this.bgScene.add(this.pointLight);
  }

  resize() {
    if (!this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.fovHeight =
      2 *
      Math.tan((this.camera.fov * Math.PI) / 180 / 2) *
      this.camera.position.z;
    this.fovWidth = this.fovHeight * this.camera.aspect;

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.trackball) this.trackball.handleResize();
  }
  updateTextCanvas(time) {
    this.textCanvas.textLine.update(time);
    this.textCanvas.textLine.draw(time);
    this.textCanvas.texture.needsUpdate = true;
  }

  update() {
    const delta = this.clock.getDelta();
    const time = performance.now() * 0.0005;

    this.controls.update();

    if (this.renderTri) {
      this.renderTri.mat.uniforms.uTime.value = time;
    }


    if (this.mouseCanvas) {
      this.mouseCanvas.update();
    }

    if (this.textCanvas) {
      this.updateTextCanvas(time);
    }

    if (this.trackball) this.trackball.update();
  }

  draw() {

    this.renderer.setRenderTarget(this.bgRenderTarget);
    this.renderer.render(this.bgScene, this.bgCamera);
    this.renderer.setRenderTarget(null);

    // run blur process
    this.blur.draw(this.bgRenderTarget.texture);

    // set blurred texture uniform
    this.renderTri.mat.uniforms.blurredTexture.value = this.blur.rt2.texture;
    // debugger;

    // maybe this isnt needed because of composer below?
    this.renderer.render(this.scene, this.camera);

    // if (this.composer) {
    //   this.composer.render();
    // }
  }
}
