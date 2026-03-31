uniform float u_time;
uniform float u_pulse;
uniform float u_hover;
varying vec2 vUv;

// Fonction de bruit aléatoire
float random(float x) {
    return fract(sin(x) * 43758.5453123);
}

void main() {
    vUv = uv;
    vec3 transformed = vec3(position);

    // 1. Calcul du retard (inertie) basé sur la taille de l'anneau
    float ringRadius = length(position.xz);
    float delayOffset = ringRadius * 0.15;
    float delayIntensity = random(ringRadius);

    // 2. Onde de choc différée (Le battement arrive en retard)
    float localPulse = pow(sin(u_time * 2.0 - delayOffset) * 0.5 + 0.5, 10.0);
    localPulse *= (1.0 - u_hover);
    
    // 3. Contraction de base
    float scaleMult = 1.0 - (localPulse * 0.35) + (pow(localPulse, 4.0) * 0.55);

    // 3. Écartement massif au survol
    // Plus l'anneau est grand (ringRadius), plus il s'éloigne loin !
    scaleMult += u_hover * (0.8 + ringRadius * 0.3); 

    transformed *= scaleMult;
    transformed.y += localPulse * delayIntensity * 0.5;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}