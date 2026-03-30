uniform float u_time;
uniform float u_pulse;
varying float vRandom;

void main() {
    // Découpe le Point carré en cercle adouci
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    // Calcule le scintillement et l'éclat du battement
    float twinkle = sin(u_time * 3.0 + vRandom * 20.0) * 0.5 + 0.5;
    float brightness = twinkle * 0.4 + (u_pulse * 3.0);
    
    // Génère une couleur procédurale multicolore basée sur la graine aléatoire et le temps
    vec3 baseColor = 0.5 + 0.5 * cos(6.28318 * (vRandom + (u_time * 0.1) + vec3(0.0, 0.33, 0.67)));
    vec3 color = baseColor * brightness;
    
    // Rendu final avec transparence adoucie sur les bords
    gl_FragColor = vec4(color, 1.0 - (dist * 2.0));
}