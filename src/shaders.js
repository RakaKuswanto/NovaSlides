export const SHADERS = {
  'fire.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; ++i) {
        v += a * noise(p);
        p = p * 2.0;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.y += iTime * 0.4;
    vec2 q = vec2(fbm(uv * 2.0), fbm(uv * 2.0 + vec2(1.0)));
    float f = fbm(uv * 2.0 + q + vec2(0.0, -iTime * 0.4));
    float grad = pow(1.0 - uv.y / 2.0, 2.0);
    vec3 fc = mix(vec3(0.9, 0.2, 0.0), vec3(1.0, 0.9, 0.0), f);
    gl_FragColor = vec4(fc * grad, 1.0);
}
  `,

  'waterfall.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;

float random (vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.y *= 2.0;
    float num_columns = 40.0;
    uv.x *= num_columns;
    float column_id = floor(uv.x);
    uv.x = fract(uv.x);
    float speed = 0.2 + random(vec2(column_id, 0.0)) * 0.8;
    float offset = random(vec2(column_id, 10.0)) * 5.0;
    uv.y += iTime * speed + offset;
    float trail = fract(uv.y);
    float trail_id = floor(uv.y);
    float intensity = pow(1.0 - trail, 25.0);
    float character = random(vec2(column_id, trail_id));
    intensity *= character;
    if(random(vec2(column_id, 3.0)) > 0.3) { intensity = 0.0; }
    vec3 color = vec3(0.2, 1.0, 0.6) * intensity;
    gl_FragColor = vec4(color, 1.0);
}
  `,

  'nebula.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;

vec2 hash(vec2 p){
    p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

float noise(in vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix( mix(dot(hash(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                    dot(hash(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
                mix(dot(hash(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                    dot(hash(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
}

float fbm(vec2 p){
    float v = 0.0;
    float a = 0.5;
    for(int i = 0; i < 5; ++i){
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

void main(){
    vec2 R = iResolution.xy;
    vec2 uv = (gl_FragCoord.xy * 2.0 - R) / R.y;
    float t = iTime * 0.1;
    vec2 m = vec2(fbm(uv + t), fbm(uv - t));
    float f = fbm(uv + m);
    vec3 c = mix(vec3(0.1, 0.0, 0.2), vec3(0.9, 0.1, 0.1), smoothstep(-0.1, 0.2, f));
    c = mix(c, vec3(0.2, 0.6, 0.8), smoothstep(0.1, 0.4, f));
    c = mix(c, vec3(1.0, 0.9, 0.7), smoothstep(0.35, 0.6, f));
    gl_FragColor = vec4(pow(c, vec3(0.8)), 1.0);
}
  `,

  'tunnel.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    float z = 1.0 / radius + iTime * 0.5;
    angle += iTime * 0.3;
    float pattern = (sin(z * 5.0) + sin(angle * 8.0));
    float neon = abs(0.02 / pattern);
    vec3 color_anim = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0.0, 2.0, 4.0));
    vec3 color = color_anim * neon * (1.0 - radius);
    gl_FragColor = vec4(color, 1.0);
}
  `,

  'mouse_trail.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 p = uv;
    p.x *= iResolution.x / iResolution.y;
    vec2 m = iMouse / iResolution.xy;
    m.x *= iResolution.x / iResolution.y;
    if(iMouse.x == 0.0 && iMouse.y == 0.0) {
        m = vec2(0.5 * (iResolution.x / iResolution.y), 0.5);
    }
    float d = distance(p, m);
    float ripple = sin(20.0 * d - iTime * 5.0) * 0.5 + 0.5;
    float core = 0.02 / (d + 0.01);
    float intensity = exp(-d * 4.0);
    vec3 color1 = vec3(0.0, 0.8, 1.0);
    vec3 color2 = vec3(0.8, 0.0, 1.0);
    vec3 finalColor = mix(color1, color2, ripple);
    finalColor = (finalColor * intensity * ripple) + (color1 * core);
    vec2 grid = fract(uv * 30.0);
    float gridDot = step(0.8, grid.x) * step(0.8, grid.y) * 0.1;
    gl_FragColor = vec4(finalColor + vec3(gridDot), 1.0);
}
  `,

  'liquid.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    float t = iTime * 0.4;
    
    // Distorsi gelombang organik
    for(float i = 1.0; i < 5.0; i++) {
        uv.x += 0.5 / i * cos(i * 2.0 * uv.y + t);
        uv.y += 0.5 / i * cos(i * 1.5 * uv.x + t);
    }
    
    // Pewarnaan dinamis bergaya premium macOS/Windows 11 bloom
    float r = cos(uv.x + uv.y + 1.0) * 0.5 + 0.5;
    float g = sin(uv.x + uv.y + 1.0) * 0.5 + 0.5;
    float b = (sin(uv.x + t) + cos(uv.y + t)) * 0.25 + 0.5;
    
    // Pencampuran warna dengan kontras gelap agar cocok untuk background teks
    vec3 color = vec3(r * 0.2, g * 0.5, b * 0.8) * 0.8;
    color -= vec3(0.1); // Gelapkan sedikit
    
    gl_FragColor = vec4(color, 1.0);
}
  `,

  'aurora.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;
    vec3 color = vec3(0.0);
    float t = iTime * 0.5;
    for (float i = 1.0; i < 4.0; i++) {
        vec2 p = uv;
        p *= rot(i * 0.5);
        float wave = sin(p.x * 2.0 + t + i) * 0.2;
        float diff = abs(p.y - wave);
        float glow = 0.01 / (diff + 0.01);
        vec3 c = vec3(0.1 * i, 0.5, 0.2 + 0.2 * i);
        color += c * glow * 0.5;
    }
    vec2 pos = gl_FragCoord.xy;
    float star = fract(sin(dot(pos, vec2(12.9898, 78.233))) * 43758.5453);
    color += vec3(star) * step(0.995, star) * 0.5;
    gl_FragColor = vec4(color, 1.0);
}
  `,

  'cyber_grid.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    float z = 1.0 / abs(uv.y + 0.1); 
    vec2 p = uv * z;
    p.y -= iTime * 2.0;
    vec2 grid = fract(p * 2.0);
    float line = step(0.9, grid.x) + step(0.9, grid.y);
    float fade = min(1.0, 1.0 / z);
    float horizon = smoothstep(0.0, 0.2, abs(uv.y + 0.1));
    vec3 color = vec3(0.8, 0.0, 1.0) * line * fade;
    color += vec3(0.0, 0.2, 0.6) * (1.0 - horizon) * 0.5;
    if(uv.y > -0.1) color = vec3(0.01, 0.01, 0.05); // Sky
    gl_FragColor = vec4(color, 1.0);
}
  `,

  'starfield.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
float hash(float n) { return fract(sin(n)*43758.5453123); }
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
    vec3 color = vec3(0.0);
    float t = iTime * 2.0;
    for(float i=0.0; i<60.0; i++) {
        float z = fract(hash(i) - t * 0.1);
        if(z <= 0.0) continue;
        vec2 p = vec2(hash(i*2.0), hash(i*3.0)) * 2.0 - 1.0;
        p /= z;
        float d = length(uv - p);
        float brightness = 0.001 / (d + 0.001) * (1.0 - z);
        color += vec3(brightness);
    }
    gl_FragColor = vec4(color, 1.0);
}
  `,

  'lava_lamp.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}
void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;
    float d1 = length(uv - vec2(sin(iTime*0.7)*0.5, sin(iTime*1.2)*0.6)) - 0.3;
    float d2 = length(uv - vec2(cos(iTime*0.5)*0.6, cos(iTime*0.9)*0.4)) - 0.4;
    float d3 = length(uv - vec2(sin(iTime*0.3)*0.4, cos(iTime*1.5)*0.5)) - 0.2;
    float d = smin(d1, smin(d2, d3, 0.2), 0.2);
    vec3 color = vec3(1.0, 0.3, 0.0);
    float alpha = smoothstep(0.02, 0.0, d);
    vec3 bg = vec3(0.1, 0.0, 0.2) + uv.y * 0.1;
    gl_FragColor = vec4(mix(bg, color, alpha), 1.0);
}
  `,

  'ocean_waves.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec3 color = vec3(0.05, 0.1, 0.2);
    float t = iTime * 1.5;
    float y1 = sin(uv.x * 10.0 + t) * 0.05 + 0.3;
    float y2 = sin(uv.x * 8.0 - t * 0.8) * 0.06 + 0.4;
    float y3 = sin(uv.x * 12.0 + t * 1.2) * 0.04 + 0.2;
    if (uv.y < y2) color = mix(color, vec3(0.0, 0.3, 0.7), 0.7);
    if (uv.y < y1) color = mix(color, vec3(0.0, 0.4, 0.6), 0.8);
    if (uv.y < y3) color = mix(color, vec3(0.0, 0.2, 0.5), 0.9);
    gl_FragColor = vec4(color, 1.0);
}
  `,

  '3d_ripple.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 p = uv;
    p.x *= iResolution.x / iResolution.y;
    
    vec2 m = iMouse / iResolution.xy;
    m.x *= iResolution.x / iResolution.y;
    
    // Posisi mouse default di tengah jika belum digerakkan
    if(iMouse.x == 0.0 && iMouse.y == 0.0) {
        m = vec2(0.5 * (iResolution.x / iResolution.y), 0.5);
    }
    
    float dist = distance(p, m);
    
    // Membuat tonjolan virtual 3D (bump) di posisi kursor
    float bump = exp(-dist * 8.0);
    
    // Menambahkan gelombang (ripple) yang dianimasikan berdasarkan waktu
    float ripple = sin(dist * 40.0 - iTime * 8.0) * bump;
    
    // Mendistorsi UV untuk menipu mata seolah-olah bidangnya melengkung secara 3D
    vec2 distortedUV = uv + (p - m) * ripple * 0.1;
    
    // Menggambar jaring (grid) pada bidang yang sudah terdistorsi
    vec2 grid = fract(distortedUV * 30.0);
    float line = step(0.85, grid.x) + step(0.85, grid.y);
    
    // Gradasi warna yang terinspirasi dari kode kustom Anda (pergeseran RGB)
    float r = 0.2 + bump * 0.8 + ripple * 0.5;
    float g = 0.8 - bump * 0.5;
    float b = 1.0 - ripple * 0.2;
    
    vec3 color = vec3(r, g, b) * line;
    
    // Tambahkan cahaya pendar (glow) di titik tengah
    color += vec3(0.1, 0.3, 0.6) * bump;
    
    gl_FragColor = vec4(color, 1.0);
}
  `,

  'rain_glass.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
float hash(float x){return fract(sin(x*132.324)*435.34);}
void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec3 color = vec3(0.05, 0.1, 0.15); 
    uv.x *= 40.0;
    float id = floor(uv.x);
    uv.y += iTime * (1.0 + hash(id) * 1.5) + hash(id*10.0)*10.0;
    uv.x = fract(uv.x);
    float drop = step(0.8, uv.x) * step(0.9, fract(uv.y));
    color += drop * vec3(0.4, 0.7, 1.0) * (1.0 - uv.x);
    gl_FragColor = vec4(color, 1.0);
}
  `,

  'fractal.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);
    for (float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * 1.5) - 0.5;
        float d = length(uv) * exp(-length(uv0));
        vec3 col = 0.5 + 0.5 * cos(iTime + uv0.xyx + vec3(0, 2, 4));
        d = sin(d * 8.0 + iTime) / 8.0;
        d = abs(d);
        d = pow(0.01 / d, 1.2);
        finalColor += col * d;
    }
    gl_FragColor = vec4(finalColor * 0.5, 1.0);
}
  `,

  'plasma.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;
    float d = length(uv);
    float t = iTime * 2.0;
    float plasma = sin(10.0 * d - t) * 0.5 + 0.5;
    float noise = fract(sin(dot(uv, vec2(12.9898, 78.233)) + t) * 43758.5453) * 0.1;
    vec3 color = vec3(0.2, 0.0, 1.0) * plasma + vec3(1.0, 0.2, 0.5) * (1.0 - plasma);
    float globe = smoothstep(0.8, 0.75, d);
    color *= globe;
    color += vec3(0.1, 0.8, 1.0) * (0.02 / abs(d - 0.75));
    gl_FragColor = vec4(color + noise * globe, 1.0);
}
  `,

  'matrix_rain.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.x *= iResolution.x / iResolution.y;
    vec2 grid = vec2(40.0, 40.0);
    vec2 id = floor(uv * grid);
    float speed = 0.2 + random(vec2(id.x, 0.0)) * 1.5;
    float y = fract(uv.y + iTime * speed);
    float tail = smoothstep(1.0, 0.0, y);
    float head = step(0.95, y);
    float drop = tail + head * 2.0;
    vec3 color = vec3(0.1, 0.9, 0.2) * drop * random(id);
    gl_FragColor = vec4(color, 1.0);
}
  `,

  'black_hole.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i); float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
    float d = length(uv);
    float angle = atan(uv.y, uv.x);
    float warp = 1.0 / (d * d + 0.01);
    
    float t = iTime * 2.0;
    vec2 warped_uv = vec2(cos(angle - t + warp), sin(angle - t + warp)) * d;
    
    float diskNoise = noise(vec2(atan(warped_uv.y, warped_uv.x) * 10.0, d * 20.0 - iTime * 3.0));
    
    float disk = smoothstep(0.35, 0.5, d) * smoothstep(0.8, 0.5, d);
    float horizon = smoothstep(0.3, 0.32, d);
    
    vec3 color = vec3(1.0, 0.6, 0.2) * disk * horizon * (diskNoise * 0.8 + 0.2);
    color += vec3(0.8, 0.3, 0.1) * smoothstep(0.32, 0.4, d) * (1.0 - smoothstep(0.4, 0.8, d));
    
    // Glow
    color += vec3(0.3, 0.1, 0.0) * (0.05 / abs(d - 0.3));
    gl_FragColor = vec4(color, 1.0);
}
  `,

  'neon_waves.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;
    vec3 col = vec3(0.0);
    for(float i=0.0; i<3.0; i++){
        vec2 p = uv;
        p.y += sin(p.x * (1.5 + i) + iTime * (1.0 + i * 0.5)) * 0.3;
        float wave = abs(1.0 / (50.0 * p.y));
        col += wave * vec3(0.2 + i*0.3, 0.4 + i*0.2, 1.0 - i*0.2);
    }
    gl_FragColor = vec4(col, 1.0);
}
  `,

  'golden_fluid.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;
    vec2 p = uv * 1.5;
    for(float i = 1.0; i < 5.0; i++) {
        p.x += 0.3 * sin(2.0 * p.y + iTime * 0.5);
        p.y += 0.3 * cos(2.1 * p.x + iTime * 0.4);
    }
    float r = cos(p.x + p.y + 1.0) * 0.5 + 0.5;
    float g = sin(p.x + p.y + 1.0) * 0.5 + 0.5;
    vec3 color = vec3(r, g * 0.8, 0.2) * 1.2;
    float spec = pow(max(0.0, sin(p.x * 2.0 + iTime)), 4.0);
    color += vec3(1.0, 0.9, 0.5) * spec;
    gl_FragColor = vec4(color, 1.0);
}
  `,

  'sunset_synthwave.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= iResolution.x / iResolution.y;
    vec3 col = vec3(0.0);
    if (p.y > 0.0) {
        float d = length(p - vec2(0.0, 0.2));
        float sun = smoothstep(0.4, 0.38, d);
        float stripes = step(0.05, fract(p.y * 10.0 - iTime));
        col = mix(vec3(0.1, 0.0, 0.2), vec3(1.0, 0.2, 0.6) * sun * stripes, sun);
        col += vec3(1.0, 0.5, 0.0) * (0.05 / max(0.01, d - 0.4));
    } else {
        vec2 gridP = vec2(p.x / abs(p.y), 1.0 / abs(p.y));
        gridP.y -= iTime * 4.0;
        float lineX = smoothstep(0.1, 0.0, abs(fract(gridP.x * 2.0) - 0.5));
        float lineY = smoothstep(0.1, 0.0, abs(fract(gridP.y) - 0.5));
        float grid = max(lineX, lineY) * smoothstep(0.0, 1.0, abs(p.y));
        col = vec3(0.8, 0.1, 0.9) * grid;
    }
    gl_FragColor = vec4(col, 1.0);
}
  `,

  'galaxy_spiral.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
    float t = iTime * 0.2;
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    float arms = sin(a * 3.0 - r * 10.0 + t * 5.0) * 0.5 + 0.5;
    float glow = 0.05 / (r + 0.01);
    float core = smoothstep(0.5, 0.0, r);
    vec3 col = vec3(0.2, 0.4, 1.0) * arms * glow;
    col += vec3(1.0, 0.8, 0.6) * core * 1.5;
    float stars = fract(sin(dot(uv * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
    col += vec3(1.0) * step(0.99, stars) * core;
    gl_FragColor = vec4(col, 1.0);
}
  `,

  'cyber_circuit.frag': `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.y;
    vec2 p = uv * 10.0;
    vec2 id = floor(p);
    vec2 f = fract(p);
    float lines = step(0.95, f.x) + step(0.95, f.y);
    float pulseX = step(0.98, fract(p.x - iTime * 2.0)) * step(0.1, fract(sin(id.y * 12.3) * 45.6));
    float pulseY = step(0.98, fract(p.y - iTime * 2.0)) * step(0.1, fract(sin(id.x * 78.9) * 12.3));
    vec3 col = vec3(0.0, 0.2, 0.4) * lines;
    col += vec3(0.0, 1.0, 1.0) * (pulseX + pulseY);
    gl_FragColor = vec4(col, 1.0);
}
  `
};
