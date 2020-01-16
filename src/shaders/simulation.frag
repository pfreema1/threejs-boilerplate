precision mediump float;

uniform sampler2D posTex;

varying vec2 vUv;

void main() {

    // read the supplied x,y,z vert positions
    vec3 pos = texture2D(posTex, vUv).xyz;

    // update the positional attributes here!
    pos.x += cos(pos.y) * 0.06;
    pos.y += sin(pos.x) * 0.06;

    // render the new positional attributes
    gl_FragColor = vec4(pos, 1.0);
}