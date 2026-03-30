uniform float u_time;
uniform float u_pulse;
varying vec3 vNormal;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 transformed = position;

    // 1. Battement synchronisé avec le coeur liquide
    transformed *= 1.0 - (u_pulse * 0.35) + (pow(u_pulse, 4.0) * 0.55);

    // 2. Ondulations du champ de force
    float waveX = sin(position.x * 3.0 + u_time * 2.0);
    float waveY = cos(position.y * 4.0 - u_time * 1.5);
    float waveZ = sin(position.z * 5.0 + u_time * 2.5);

    float displacement = (waveX + waveY + waveZ) * 0.15;
    transformed += normal * displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}