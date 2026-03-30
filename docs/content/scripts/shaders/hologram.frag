uniform float u_time;
uniform float u_hover;
varying vec3 vNormal;

void main() {
    vec3 baseColor = vec3(0.1, 0.5, 1.0); // Bleu cyan de base
    float pulse = (sin(u_time * 2.0) + 1.0) * 0.5;

    // Effet Fresnel pour illuminer les bords du halo
    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    vec3 finalColor = baseColor * pulse + vec3(0.0, 0.8, 0.8) * intensity;
    
    // Gestion de l'opacité et de la lueur au survol de la souris
    float currentAlpha = mix(0.1, 0.6, u_hover);
    vec3 hoverGlow = vec3(0.0, 0.8, 0.8) * u_hover;
    
    gl_FragColor = vec4(finalColor + hoverGlow, currentAlpha);
}