/**
 * Initialise l'environnement statique (Lumières globales et sol PBR).
 * @param {THREE.Scene} scene - La scène principale
 * @param {Object} THREE - L'instance de Three.js
 * @param {Object} CONFIG - La configuration globale
 * @returns {Object} Méthode dispose() pour le garbage collection
 */
export function setupEnvironment(scene, THREE, CONFIG) {
    // Éclairage global et gestion des ombres douces
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    Object.assign(directionalLight.shadow.camera, { top: 30, bottom: -30, left: -30, right: 30 });
    scene.add(directionalLight);
    
    // Fill light pour l'ambiance colorimétrique
    scene.add(new THREE.HemisphereLight(0xff00aa, 0x00aaff, 3));
    
    // Sol réactif aux reflets spéculaires
    const planeMat = new THREE.MeshStandardMaterial({ 
        color: CONFIG.colors.ground, 
        roughness: 0.15,
        metalness: 0.0
    });
    const planeGeo = new THREE.PlaneGeometry(100, 100);
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    return { 
        dispose: () => {
            planeGeo.dispose();
            planeMat.dispose();
        }
    }; 
}