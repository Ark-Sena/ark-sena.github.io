uniform float u_time;
uniform float u_pulse;
varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    // 1. Découpage en grille
    vec2 grid = vec2(60.0, 2.0);
    vec2 uvGrid = vUv * grid;
    vec2 id = floor(uvGrid);
    
    // Vitesse de défilement indépendante par ligne
    id.x += floor(u_time * (10.0 + random(vec2(id.y)) * 5.0));
    
    vec2 cellUv = fract(uvGrid) * 2.0 - 1.0;

    // Effet de respiration individuelle des glyphes
    float scale = 0.5 + 0.5 * sin(u_time * 4.0 + random(id) * 6.28);
    cellUv /= max(scale, 0.1);
    
    // 2. Génération géométrique des glyphes alien
    float shape = 0.0;
    float r1 = random(id + 1.0);
    float r2 = random(id + 2.0);
    float r3 = random(id + 3.0);
    
    if(r1 > 0.2) shape += step(abs(cellUv.x), 0.1 + r2 * 0.4) * step(abs(cellUv.y), 0.8);
    if(r2 > 0.3) shape += step(abs(cellUv.y), 0.1 + r3 * 0.4) * step(abs(cellUv.x), 0.8);
    if(r3 > 0.4) shape -= step(length(cellUv), 0.2 + r1 * 0.2);
    
    shape = clamp(shape, 0.0, 1.0);
    shape *= step(abs(cellUv.x), 1.0) * step(abs(cellUv.y), 1.0);

    // 3. Couleurs arc-en-ciel fluides
    vec3 runeColor = vec3(
        0.5 + 0.5 * sin(u_time * 2.0 + id.x * 0.2),
        0.5 + 0.5 * cos(u_time * 1.5 + id.y * 1.5 + 2.0),
        0.5 + 0.5 * sin(u_time * 3.0 + random(id) * 5.0 + 4.0)
    );
    
    // Flash lumineux synchronisé avec le battement de coeur global
    runeColor *= (1.0 + u_pulse * 3.0) * 2.0;

    // 4. Nettoyage et fondu sur les bords
    float activeRune = step(0.4, random(id));
    shape *= activeRune;
    float edgeFade = sin(vUv.y * 3.14159);
    
    gl_FragColor = vec4(runeColor, shape * edgeFade);
}