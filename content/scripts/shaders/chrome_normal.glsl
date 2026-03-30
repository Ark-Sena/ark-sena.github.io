#include <beginnormal_vertex>

float dDdx = cos(position.x * 3.0 + u_time * 2.0) * 3.0 * 0.15;
float dDdy = -sin(position.y * 4.0 - u_time * 1.5) * 4.0 * 0.15;
float dDdz = cos(position.z * 5.0 + u_time * 2.5) * 5.0 * 0.15;

objectNormal = normalize(objectNormal - vec3(dDdx, dDdy, dDdz));