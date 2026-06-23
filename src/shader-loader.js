import { SHADERS } from './shaders.js';

const shaderCache = {};
let posBuf = null;

export async function loadShader(gl, shaderFile, canvas) {
  if (shaderCache[shaderFile]) {
    return shaderCache[shaderFile];
  }

  const fragSrc = SHADERS[shaderFile];
  if (!fragSrc) {
    console.error(`Shader tidak ditemukan: ${shaderFile}`);
    return null;
  }
  
  const vertexSrc = `
    attribute vec2 a_position;
    varying vec2 vUv;
    void main() { 
      vUv = a_position * 0.5 + 0.5; // Konversi ke 0.0 - 1.0 untuk texture mapping
      gl_Position = vec4(a_position, 0.0, 1.0); 
    }
  `;
  
  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`Error kompilasi shader (${shaderFile}):`, gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  
  const vs = createShader(gl.VERTEX_SHADER, vertexSrc);
  const fs = createShader(gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return null;
  
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Error linking program:', gl.getProgramInfoLog(prog));
    return null;
  }
  
  if (!posBuf) {
    posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  }
  
  const posLoc = gl.getAttribLocation(prog, "a_position");
  const timeLoc = gl.getUniformLocation(prog, 'iTime');
  const resLoc = gl.getUniformLocation(prog, 'iResolution');
  const mouseLoc = gl.getUniformLocation(prog, 'iMouse');
  
  function render(t, mx = 0, my = 0) {
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    if (timeLoc !== null) gl.uniform1f(timeLoc, t);
    if (resLoc !== null) gl.uniform2f(resLoc, gl.canvas.width, gl.canvas.height);
    if (mouseLoc !== null) gl.uniform2f(mouseLoc, mx, my);
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  
  function reload() {
    gl.useProgram(prog);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    if (resLoc !== null) gl.uniform2f(resLoc, gl.canvas.width, gl.canvas.height);
  }
  
  const result = { render, reload };
  shaderCache[shaderFile] = result;
  return result;
}