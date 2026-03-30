vec3 transformed = vec3(position);

// 1. Contraction et explosion (Le battement de coeur)
transformed *= 1.0 - (u_pulse * 0.35) + (pow(u_pulse, 4.0) * 0.55);

// 2. Ondulations fluides du mercure
float waveX = sin(position.x * 3.0 + u_time * 2.0);
float waveY = cos(position.y * 4.0 - u_time * 1.5);
float waveZ = sin(position.z * 5.0 + u_time * 2.5);

float displacement = (waveX + waveY + waveZ) * 0.15;
transformed += normal * displacement;