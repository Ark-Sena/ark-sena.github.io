vec3 transformed = vec3(position);

// 1. Ondulation organique synchronisée avec le noyau liquide
float waveX = sin(aCenter.x * 3.0 + u_time * 2.0);
float waveY = cos(aCenter.y * 4.0 - u_time * 1.5);
float waveZ = sin(aCenter.z * 5.0 + u_time * 2.5);
float liquidDisplacement = (waveX + waveY + waveZ) * 0.15;

float corePulse = 1.0 - (u_pulse * 0.35) + (pow(u_pulse, 4.0) * 0.55);

// On déplace le centre et le sommet
vec3 animatedCenter = aCenter * corePulse + (normalize(aCenter) * liquidDisplacement);
transformed = transformed * corePulse + (normal * liquidDisplacement);

// 2. Gestion des FISSURES (Rétractation vers le centre)
// 0.94 = failles fines au repos. 0.15 = poussière au survol.
float fragScale = mix(0.94, 0.4, u_hover); 
transformed = animatedCenter + (transformed - animatedCenter) * fragScale;

// 3. EXPLOSION GRAVITATIONNELLE
vec3 dir = normalize(animatedCenter);
float hoverExplosion = u_hover * (1.2 + aRandom * 1.0);
float pulseDisplacement = u_pulse * 0.3 * aRandom * (1.0 - u_hover);

transformed += dir * (hoverExplosion + pulseDisplacement);