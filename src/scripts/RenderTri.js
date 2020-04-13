// concept mostly taken from here: https://medium.com/@luruke/simple-postprocessing-in-three-js-91936ecadfb7

import * as THREE from 'three';
import glslify from 'glslify';
import fullScreenTriFrag from './../shaders/fullScreenTri.frag';
import fullScreenTriVert from './../shaders/fullScreenTri.vert';

export default class RenderTri {
  constructor(scene, renderer, bgRenderTarget, mouseCanvas, textCanvas) {
    this.scene = scene;
    this.renderer = renderer;
    this.bgRenderTarget = bgRenderTarget;
    this.mouseCanvas = mouseCanvas;
    this.textCanvas = textCanvas;

    const resolution = new THREE.Vector2();
    this.renderer.getDrawingBufferSize(resolution);

    this.RenderTriTarget = new THREE.WebGLRenderTarget(
      resolution.x,
      resolution.y,
      {
        format: THREE.RGBFormat,
        stencilBuffer: false,
        depthBuffer: true
      }
    );

    this.mat = new THREE.RawShaderMaterial({
      fragmentShader: glslify(fullScreenTriFrag),
      vertexShader: glslify(fullScreenTriVert),
      uniforms: {
        uScene: {
          type: 't',
          value: this.bgRenderTarget.texture
        },
        uMouseCanvas: {
          type: 't',
          value: this.mouseCanvas.texture
        },
        uTextCanvas: {
          type: 't',
          value: this.textCanvas.texture
        },
        uResolution: { value: resolution },
        uTime: {
          value: 0.0
        },
        blurredTexture: {
          value: null
        }
      }
    });

    let renderTri = new THREE.Mesh(
      this.returnRenderTriGeometry(),
      this.mat
    );
    renderTri.frustumCulled = false;

    this.scene.add(renderTri);
  }

  returnRenderTriGeometry() {
    const geometry = new THREE.BufferGeometry();

    // triangle in clip space coords
    const vertices = new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]);

    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 2));

    return geometry;
  }
}
