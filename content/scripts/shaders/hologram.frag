uniform float u_time;
uniform float u_hover;
varying vec3 vNormal;

void main() {
    vec3 baseColor = vec3(0.1, 0.5, 1.0); // Bleu cyan
    float pulse = (sin(u_time * 2.0) + 1.0) * 0.5; // Oscille entre 0 et 1

    // Effet Fresnel pour l'intensité lumineuse
    float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);

    vec3 finalColor = baseColor * pulse + vec3(0.0, 0.8, 0.8) * intensity;

    // Alpha = 0.1 , 0.6 au survol
    float currentAlpha = mix(0.1, 0.6, u_hover); 

    // Lueur additionnelle au survol
    vec3 hoverGlow = vec3(0.0, 0.8, 0.8) * u_hover;

    gl_FragColor = vec4(finalColor + hoverGlow, currentAlpha);
}