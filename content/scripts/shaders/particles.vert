uniform float u_time;
uniform float u_hover;
attribute float aRandom;
varying float vRandom;

void main() {
    vRandom = aRandom;
    vec3 pos = position;
    
    // Applique un flottement organique individuel
    pos.y += sin(u_time * 2.0 + aRandom * 10.0) * 0.5;

    pos -= normalize(pos) * (u_hover * 3.0);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Calcule la taille basée sur l'aléatoire et la perspective (profondeur)
    gl_PointSize = (8.0 * aRandom + 2.0) * (20.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}