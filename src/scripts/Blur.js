import * as THREE from 'three';
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader';
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader';
import glslify from 'glslify';
import fullScreenVert from '../shaders/fullScreenTri.vert'
import fitPlaneToScreen from './utils/fitPlaneToScreen';


export default class Blur {
    constructor(scene, camera, renderer) {
        // this.scene = scene;
        // this.camera = camera;
        this.renderer = renderer;
        this.outputTexture = null;
        this.rt1 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
        this.rt2 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

        this.setupHBlurScene();
        this.setupVBlurScene();

    }

    setupHBlurScene() {
        this.hBlurScene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera();
        this.camera.position.z = 3;
        this.dim = fitPlaneToScreen(this.camera, 0, window.innerWidth, window.innerHeight);

        this.geo = new THREE.PlaneGeometry(2, 2);

        this.hBlurMat = new THREE.ShaderMaterial({
            uniforms: HorizontalBlurShader.uniforms,
            vertexShader: HorizontalBlurShader.vertexShader,
            fragmentShader: HorizontalBlurShader.fragmentShader,
        });

        this.hBlurMesh = new THREE.Mesh(this.geo, this.hBlurMat);

        this.hBlurScene.add(this.hBlurMesh);
    }

    setupVBlurScene() {
        this.vBlurScene = new THREE.Scene();

        this.vBlurMat = new THREE.ShaderMaterial({
            uniforms: VerticalBlurShader.uniforms,
            vertexShader: VerticalBlurShader.vertexShader,
            fragmentShader: VerticalBlurShader.fragmentShader,
        });

        this.vBlurMesh = new THREE.Mesh(this.geo, this.vBlurMat);

        this.vBlurScene.add(this.vBlurMesh);

    }

    draw(inputTexture) {
        // horizontal blur
        this.hBlurMat.uniforms.tDiffuse.value = inputTexture;
        this.renderer.setRenderTarget(this.rt1);
        this.renderer.render(this.hBlurScene, this.camera);
        this.renderer.setRenderTarget(null);


        this.vBlurMat.uniforms.tDiffuse.value = this.rt1.texture;
        this.renderer.setRenderTarget(this.rt2);
        this.renderer.render(this.vBlurScene, this.camera);
        this.renderer.setRenderTarget(null);

    }
}