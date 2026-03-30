/**
 * Factory générant l'artéfact central interactif.
 * Combine des matériaux PBR classiques avec des shaders GLSL injectés dynamiquement.
 */
export function createArtifact(scene, THREE, CONFIG, shaders) {
    const { chunkChromeVertex, chunkChromeNormal, vertShaderForceField, fragShaderForceField, vertShaderRing, fragShaderRing } = shaders;

    // --- 1. Piédestal et Source Lumineuse Dynamique ---
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x111115, metalness: 0.8, roughness: 0.2 });
    const neonMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x00ffff, emissiveIntensity: 2.0 });
    
    const geoBase = new THREE.CylinderGeometry(4.5, 5, 1, 6);
    const geoNeon = new THREE.CylinderGeometry(4.2, 4.5, 0.2, 6);
    const geoTop = new THREE.CylinderGeometry(3.5, 4.2, 0.5, 6);

    const pedestal1 = new THREE.Mesh(geoBase, pedestalMat);
    pedestal1.position.set(0, 0.5, -5);
    pedestal1.castShadow = true;
    
    const pedestal2 = new THREE.Mesh(geoNeon, neonMat);
    pedestal2.position.set(0, 1.1, -5);
    
    const pedestal3 = new THREE.Mesh(geoTop, pedestalMat);
    pedestal3.position.set(0, 1.45, -5);
    pedestal3.castShadow = true;
    
    scene.add(pedestal1, pedestal2, pedestal3);

    const neonSourceLight = new THREE.PointLight(0x000000, 500, 50);
    neonSourceLight.position.set(0, 1.1, -5);
    neonSourceLight.castShadow = true;
    neonSourceLight.shadow.mapSize.set(512, 512);
    neonSourceLight.shadow.bias = -0.001;
    scene.add(neonSourceLight);

    // --- 2. Architecture Multicouche de l'Artéfact ---
    const artifactGroup = new THREE.Group();
    artifactGroup.position.set(0, CONFIG.artifact.baseY, -5);
    scene.add(artifactGroup);

    // Ajout de u_pulse pour gérer le battement de cœur sur tous les shaders
    const artifactUniforms = { u_time: { value: 0.0 }, u_hover: { value: 0.0 }, u_pulse: { value: 0.0 }};
    const artifactGeoBase = new THREE.IcosahedronGeometry(3, 10);

    // Couche Interne : PBR Liquide avec altération du Vertex Shader
    const artifactMaterialCore = new THREE.MeshPhysicalMaterial({ 
        color: 0xffffff, metalness: 1.0, roughness: 0.00, 
        clearcoat: 1.0, clearcoatRoughness: 0.05, envMapIntensity: 3.0 
    });
    
    const injectChromeShaders = (shader) => {
        shader.uniforms.u_time = artifactUniforms.u_time;
        shader.uniforms.u_pulse = artifactUniforms.u_pulse;
        shader.vertexShader = `uniform float u_time;\nuniform float u_pulse;\n${shader.vertexShader}`;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', chunkChromeVertex);
    };

    artifactMaterialCore.onBeforeCompile = (shader) => {
        injectChromeShaders(shader);
        shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', chunkChromeNormal);
    };

    const building2_core = new THREE.Mesh(artifactGeoBase, artifactMaterialCore);
    building2_core.castShadow = true;
    artifactGroup.add(building2_core);

    // Custom depth/distance materials pour calculer les ombres sur des vertex déformés
    const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    depthMat.onBeforeCompile = injectChromeShaders;
    building2_core.customDepthMaterial = depthMat;

    const distanceMat = new THREE.MeshDistanceMaterial();
    distanceMat.onBeforeCompile = injectChromeShaders;
    building2_core.customDistanceMaterial = distanceMat;

    // Couche Externe : Champ de force GLSL personnalisé
    const artifactMaterialForceField = new THREE.ShaderMaterial({
        uniforms: { u_time: artifactUniforms.u_time, u_hover: artifactUniforms.u_hover, u_pulse: artifactUniforms.u_pulse },
        vertexShader: vertShaderForceField,
        fragmentShader: fragShaderForceField,
        transparent: true, blending: THREE.AdditiveBlending,
        depthWrite: false, side: THREE.DoubleSide, wireframe: false
    });

    // Anneaux Gyroscopiques de Glyphes
    const ringGroup = new THREE.Group();
    artifactGroup.add(ringGroup);

    const ringUniforms = {
        u_time: artifactUniforms.u_time,
        u_pulse: artifactUniforms.u_pulse
    };

    const ringMat = new THREE.ShaderMaterial({
        uniforms: ringUniforms,
        vertexShader: vertShaderRing,
        fragmentShader: fragShaderRing,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const ring1 = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.0, 0.6, 64, 1, true), ringMat);
    const ring2 = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.3, 64, 1, true), ringMat);
    const ring3 = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.8, 64, 1, true), ringMat);

    ring1.rotation.x = Math.PI / 3;
    ring2.rotation.z = Math.PI / 4;
    ring3.rotation.x = -Math.PI / 6;

    ringGroup.add(ring1, ring2, ring3);

    const building2_forcefield = new THREE.Mesh(artifactGeoBase, artifactMaterialForceField);
    building2_forcefield.scale.set(1.05, 1.05, 1.05);
    building2_forcefield.userData = { name: "Projet B : Shaders Géométriques", isArtifactForceField: true }; 
    artifactGroup.add(building2_forcefield);

    // --- 3. Exposition de l'API du composant ---
    const neonColor = new THREE.Color();
    
    return {
        interactableMesh: building2_forcefield, // Mesh ciblé par le Raycaster
        artifactUniforms,                       // Exposition pour l'interaction externe (Hover)
        
        updateAnimation: (time) => {
            // Lévitation de base
            artifactGroup.rotation.y += 0.003;
            artifactGroup.rotation.x += 0.001;
            artifactGroup.position.y = CONFIG.artifact.baseY + Math.sin(time * CONFIG.artifact.floatSpeed) * CONFIG.artifact.floatAmplitude;
            
            // Rotation des anneaux
            ring1.rotation.y -= 0.01;
            ring2.rotation.x += 0.015;
            ring3.rotation.y += 0.005;
            ring3.rotation.z -= 0.005;

            artifactUniforms.u_time.value = time;
            
            // Signal de battement de coeur (Heartbeat)
            const beatFreq = 2.0;
            const beatExponent = 10.0;
            const heartbeatSignal = Math.pow(Math.sin(time * beatFreq) * 0.5 + 0.5, beatExponent);
            artifactUniforms.u_pulse.value = heartbeatSignal;
            
            // Cycle RGB de la lumière au sol
            neonColor.setHSL((time * CONFIG.artifact.rgbCycleSpeed) % 1.0, 1.0, 0.5);
            neonMat.emissive.copy(neonColor);
            neonSourceLight.color.copy(neonColor);
        },
        
        dispose: () => {
            pedestalMat.dispose(); neonMat.dispose();
            geoBase.dispose(); geoNeon.dispose(); geoTop.dispose();
            artifactMaterialCore.dispose(); artifactMaterialForceField.dispose();
            artifactGeoBase.dispose(); depthMat.dispose(); distanceMat.dispose();
            ringMat.dispose(); ring1.geometry.dispose(); 
            ring2.geometry.dispose(); ring3.geometry.dispose();
        }
    };
}