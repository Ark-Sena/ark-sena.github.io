uniform float u_time;
varying vec3 vNormal;

void main() {
    vNormal = normalize(normalMatrix * normal);

    float waveX = sin(position.x * 3.0 + u_time * 2.0);
    float waveY = cos(position.y * 4.0 - u_time * 1.5);
    float waveZ = sin(position.z * 5.0 + u_time * 2.5);

    float displacement = (waveX + waveY + waveZ) * 0.15;

    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}