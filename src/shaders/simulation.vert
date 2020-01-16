precision mediump float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec2 uv; // x,y offsets of each point in texture
attribute vec3 position;

varying vec2 vUv;

void main() {
    vUv = vec2(uv.x, 1.0 - uv.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}