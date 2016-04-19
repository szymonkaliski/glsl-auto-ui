const flatten     = require('lodash.flatten');
const get         = require('lodash.get');
const parseTokens = require('glsl-parser/direct');
const tokenString = require('glsl-tokenizer/string');

// finds uniforms with name starting with "ui",
// currently matches only float, vec2, vec3, vec4
const findUniforms = (ast) => {
  return Object.keys(ast.scope)
    .filter(key => key.startsWith('ui'))
    .map(key => ({ key, scope: ast.scope[key] }))
    .map(({ key, scope }) => {
      const type = get(scope, [ 'parent', 'parent', 'children' ])
        .filter(({ type }) => type === 'keyword')
        .map(({ token: { data } }) => data)
        .filter(data => [ 'float', 'vec2', 'vec3', 'vec4' ].indexOf(data) >= 0);

      return {
        key,
        type: get(type, [ 0 ], undefined)
      };
    });
};

// generates UI from shader string
const generateUI = (gui, shader, { remember } = { remember: true }) => {
  const uniforms = findUniforms(parseTokens(tokenString(shader)));

  const paramsStruct = uniforms.map(({ key, type }) => {
    if (type === 'float') {
      return [ { [key]: 0.01 } ];
    }
    else if (type.startsWith('vec')) {
      return [
        { [`${key}.x`]: 0.01 },
        { [`${key}.y`]: 0.01 },
        { [`${key}.z`]: 0.01 },
        { [`${key}.w`]: 0.01 }
      ].slice(0, parseInt(type.replace('vec', '')));
    }
  });

  // output params
  let outParams = flatten(paramsStruct).reduce((memo, value) => Object.assign(memo, value), {});

  // remember state - especially helpful with localStorage set to true
  // NOT: this HAS to be called before any gui.add!
  if (remember) { gui.remember(outParams); }

  // add folders to DAT.GUI
  paramsStruct.forEach((params, i) => {
    const folder = gui.addFolder(uniforms[i].key);

    params.forEach(params => {
      folder.add(outParams, Object.keys(params)[0], 0.0, 1.0);
    });

    folder.open();
  });

  // return params
  return outParams;
};

// updates shader uniforms with params for glsl-toy
const updateGLSLToyShaderUniforms = (uniforms, params) => {
  const realParams = Array.from(Object.keys(params)
    .reduce((memo, key) => {
      if (key.indexOf('.') > 0) {
        const realKey = key.split('.')[0];
        memo.add(realKey);
      }
      else {
        memo.add(key);
      }

      return memo;
    }, new Set()));

  realParams.forEach(param => {
    if (params[param]) {
      uniforms[param] = params[param];
    }
    else {
      const value = [ 'x', 'y', 'z', 'w' ]
        .map(key => params[`${param}.${key}`])
        .filter(value => value !== undefined);

      uniforms[param] = value;
    }
  });
};

module.exports = {
  generateUI,
  updateGLSLToyShaderUniforms
};
