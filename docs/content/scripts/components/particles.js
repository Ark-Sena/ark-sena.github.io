/**
 * Factory générant la poussière stellaire (Orbiting Particles).
 * Système de particules autonome synchronisé avec le battement de l'artéfact.
 *
 * @param {THREE.Scene} scene - La scène principale
 * @param {Object} THREE - L'instance de Three.js
 * @param {Object} CONFIG - La configuration globale de la scène
 * @param {Object} artifactUniforms - Les variables uniformes de l'artéfact pour la synchronisation
 * @param {Object} shaders - Dictionnaire contenant les shaders spécifiques aux particules
 * @returns {Object} Les méthodes du cycle de vie (animation et nettoyage)
 */
export function createStardust(scene, THREE, CONFIG, artifactUniforms, shaders) {
    const { vertShaderParticles, fragShaderParticles } = shaders;

    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleRandoms = new Float32Array(particleCount);

    for(let i = 0; i < particleCount; i++) {
        // Rayon : distance par rapport au centre (entre 4 et 12)
        const r = 4.0 + Math.random() * 8.0;
        
        // Angles aléatoires dans toutes les directions
        const theta = Math.random() * Math.PI * 2; // Angle horizontal
        const phi = Math.acos((Math.random() * 2) - 1); // Angle vertical
        
        // Conversion Sphérique -> Cartésienne (Sans aucun mur invisible !)
        particlePos[i*3]     = r * Math.sin(phi) * Math.cos(theta); // Axe X
        particlePos[i*3+1] = r * Math.cos(phi) * 0.6;               // Axe Y
        particlePos[i*3+2] = r * Math.sin(phi) * Math.sin(theta); // Axe Z
        particleRandoms[i] = Math.random(); 
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('aRandom', new THREE.BufferAttribute(particleRandoms, 1));

    const particleMat = new THREE.ShaderMaterial({
        uniforms: {
            u_time: artifactUniforms.u_time,
            u_pulse: artifactUniforms.u_pulse,
            u_hover: artifactUniforms.u_hover_smooth
        },
        vertexShader: vertShaderParticles,
        fragmentShader: fragShaderParticles,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particlesMesh = new THREE.Points(particleGeo, particleMat);
    particlesMesh.position.set(0, CONFIG.artifact.baseY, -5); 
    scene.add(particlesMesh);

    return {
        updateAnimation: () => {
            particlesMesh.rotation.y -= 0.002;
            particlesMesh.rotation.z += 0.001;
        },
        dispose: () => {
            particleGeo.dispose(); 
            particleMat.dispose();
            scene.remove(particlesMesh);
        }
    };
}