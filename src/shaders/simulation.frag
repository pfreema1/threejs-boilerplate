precision mediump float;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

uniform sampler2D posTex;
uniform float uTime;

varying vec2 vUv;

void main() {

    // read the supplied x,y,z vert positions
    vec3 pos = texture2D(posTex, vUv).xyz;

    float noiseVal = snoise3(pos);

    // update the positional attributes here!
    pos.x += cos(uTime) * 0.06 + noiseVal;
    // pos.y += cos(uTime) * 0.06 + noiseVal;
    pos.z += cos(uTime) * 0.06 + noiseVal;

    // render the new positional attributes
    gl_FragColor = vec4(pos, 1.0);
}