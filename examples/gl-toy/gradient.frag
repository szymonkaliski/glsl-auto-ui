precision mediump float;

uniform vec2 iResolution;

// just start uniform name with 'ui' and it gets pulled into DAT.GUI automagically!
uniform vec2 uiGradientPos;
uniform vec3 uiBaseColor;
uniform vec3 uiSecondaryColor;

void main() {
  vec2 pos = gl_FragCoord.xy / iResolution.xy;
  float dist = distance(pos, uiGradientPos);

  gl_FragColor = vec4(mix(uiBaseColor * (1.0 - dist), uiSecondaryColor, dist), 1.0);
}
