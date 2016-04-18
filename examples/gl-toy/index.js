// setup glsl-toy
const glslify = require('glslify');
const start   = Date.now();
const toy     = require('gl-toy');
const { GUI } = require('dat-gui');

const shader  = glslify('./gradient.frag');

// glsl-auto-ui related
const {
  generateUI,
  updateGLSLToyShaderUniforms
} = require('../../src');

let params; // here we will hold params generated from ui* shader uniforms

toy(shader, (gl, shader) => {
  shader.uniforms.iResolution = [ gl.drawingBufferWidth, gl.drawingBufferHeight ];
  shader.uniforms.iGlobalTime = (Date.now() - start) / 1000;

  // update
  updateGLSLToyShaderUniforms(shader.uniforms, params);
});

// add UI - after glsl-toy so it displays on top
const gui = new GUI();

// generate params and setup UI
params = generateUI(gui, shader);
