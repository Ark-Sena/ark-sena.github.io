/**
 * Factory générant l'artéfact central interactif.
 * Combine des matériaux PBR classiques avec des shaders GLSL injectés dynamiquement.
 * @param {THREE.Scene} scene - La scène principale
 * @param {Object} THREE - L'instance de Three.js
 * @param {Object} CONFIG - La configuration globale de la scène
 * @param {Object} shaders - Dictionnaire contenant les textes des shaders GLSL
 * @returns {Object} Les meshes exposés, la caméra, les uniforms et les méthodes du cycle de vie
 */
export function createArtifact(scene, THREE, CONFIG, shaders) {
    const { chunkChromeVertex, chunkChromeNormal, chunkShatteredVertex, vertShaderRing, fragShaderRing } = shaders;

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

    // Ajout de u_hover_smooth pour gérer les transitions fluides
    const artifactUniforms = { u_time: { value: 0.0 }, u_hover: { value: 0.0 }, u_hover_smooth: { value: 0.0 }, u_pulse: { value: 0.0 }};
    const artifactGeoBase = new THREE.IcosahedronGeometry(3, 10);

    // Couche Interne : PBR Liquide avec altération du Vertex Shader
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    const cubeCamera = new THREE.CubeCamera(0.1, 50, cubeRenderTarget);
    artifactGroup.add(cubeCamera);

    const artifactMaterialCore = new THREE.MeshPhysicalMaterial({ 
        color: 0xffffff, metalness: 1.0, roughness: 0.0, 
        envMap: cubeRenderTarget.texture,
        envMapIntensity: 2.0,
        iridescence: 1.0,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400],
        emissive: 0xffffff,
        emissiveIntensity: 0.0
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

    const coreInternalLight = new THREE.PointLight(0xffffff, 0, 40);
    building2_core.add(coreInternalLight);

    const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    depthMat.onBeforeCompile = injectChromeShaders;
    building2_core.customDepthMaterial = depthMat;

    const distanceMat = new THREE.MeshDistanceMaterial();
    distanceMat.onBeforeCompile = injectChromeShaders;
    building2_core.customDistanceMaterial = distanceMat;

    // --- Couche Externe : Coquille Brisée (Shattered Core) ---
    const shatteredBaseGeo = new THREE.IcosahedronGeometry(3.4, 3);
    const shatteredGeo = shatteredBaseGeo.toNonIndexed();
    
    const positionAttribute = shatteredGeo.attributes.position;
    const centers = new Float32Array(positionAttribute.count * 3);
    const randoms = new Float32Array(positionAttribute.count);

    for (let i = 0; i < positionAttribute.count; i += 3) {
        const v1 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i);
        const v2 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 1);
        const v3 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 2);
        const center = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);
        const rand = Math.random();
        for (let j = 0; j < 3; j++) {
            centers[(i + j) * 3] = center.x; centers[(i + j) * 3 + 1] = center.y; centers[(i + j) * 3 + 2] = center.z;
            randoms[i + j] = rand;
        }
    }
    shatteredGeo.setAttribute('aCenter', new THREE.BufferAttribute(centers, 3));
    shatteredGeo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

    const shatteredMat = new THREE.MeshStandardMaterial({
        color: 0x050508, roughness: 0.1, metalness: 0.8, side: THREE.DoubleSide
    });

    shatteredMat.onBeforeCompile = (shader) => {
        shader.uniforms.u_time = artifactUniforms.u_time;
        shader.uniforms.u_pulse = artifactUniforms.u_pulse;
        shader.uniforms.u_hover = artifactUniforms.u_hover_smooth; 

        shader.vertexShader = `
            uniform float u_time;
            uniform float u_pulse;
            uniform float u_hover;
            attribute vec3 aCenter;
            attribute float aRandom;
            ${shader.vertexShader}
        `;

        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', chunkShatteredVertex);
    };

    const building2_forcefield = new THREE.Mesh(shatteredGeo, shatteredMat);
    building2_forcefield.scale.set(1.05, 1.05, 1.05);
    building2_forcefield.userData = { name: "Projet B : Coquille Brisée (Shattered Core)", isArtifactForceField: true }; 
    artifactGroup.add(building2_forcefield);


    // --- Anneaux Gyroscopiques de Glyphes ---
    const ringGroup = new THREE.Group();
    artifactGroup.add(ringGroup);

    const ringUniforms = {
        u_time: artifactUniforms.u_time,
        u_pulse: artifactUniforms.u_pulse,
        u_hover: artifactUniforms.u_hover_smooth // Connecté à l'animation de survol lisse
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

    const ringLight1 = new THREE.PointLight(0xffffff, 0, 50);
    const ringLight2 = new THREE.PointLight(0xffffff, 0, 50);
    const ringLight3 = new THREE.PointLight(0xffffff, 0, 50);
    
    ring1.add(ringLight1);
    ring2.add(ringLight2);
    ring3.add(ringLight3);

    ringGroup.add(ring1, ring2, ring3);

    // --- 3. Exposition de l'API du composant ---
    const neonColor = new THREE.Color();
    let heatLevel = 0.0;

    const fireBaseColor = new THREE.Color(0xff3300);
    const fireHotColor = new THREE.Color(0xffaa00);
    const currentFireColor = new THREE.Color();

    return {
        interactableMesh: building2_forcefield, // Mesh ciblé par le Raycaster
        coreMesh: building2_core,
        cubeCamera: cubeCamera,
        artifactUniforms,                       
        
        updateAnimation: (time, mouse) => {
            // Lissage de l'interaction (Transition douce même si la souris bouge vite)
            artifactUniforms.u_hover_smooth.value += (artifactUniforms.u_hover.value - artifactUniforms.u_hover_smooth.value) * 0.1;
            const smoothHover = artifactUniforms.u_hover_smooth.value;

            // Lévitation et Rotation (S'emballe complètement au survol !)
            artifactGroup.rotation.y += 0.003;
            artifactGroup.position.y = CONFIG.artifact.baseY + Math.sin(time * CONFIG.artifact.floatSpeed) * CONFIG.artifact.floatAmplitude;

            // Rotation horizontale du noyau et de la forcefield, accélérant avec le survol
            const coreSpinSpeed = smoothHover * 0.06; // Vitesse modérée et agréable
            building2_core.rotation.y += coreSpinSpeed;
            //building2_forcefield.rotation.y += coreSpinSpeed;
            if (mouse) {
             artifactGroup.rotation.z = mouse.x * 0.15;
            }

            // Les anneaux accélèrent aussi
            ring1.rotation.y -= 0.002 + (smoothHover * 0.01);
            ring2.rotation.x += 0.004 + (smoothHover * 0.01);
            ring3.rotation.y += 0.001 + (smoothHover * 0.01);
            ring3.rotation.z -= 0.001 + (smoothHover * 0.01);

            artifactUniforms.u_time.value = time;
            
            // Signal de battement de coeur (S'arrête au survol)
            const beatFreq = 2.0;
            const beatExponent = 10.0;
            const rawPulse = Math.pow(Math.sin(time * beatFreq) * 0.5 + 0.5, beatExponent);
            const currentPulse = rawPulse * (1.0 - smoothHover); // Tombe à 0 progressivement
            artifactUniforms.u_pulse.value = currentPulse;

            ringLight1.color.setHSL((time * 0.2) % 1.0, 1.0, 0.5);
            ringLight2.color.setHSL((time * 0.15 + 0.33) % 1.0, 1.0, 0.5);
            ringLight3.color.setHSL((time * 0.1 + 0.66) % 1.0, 1.0, 0.5);

            const lightIntensity = 1.0 + currentPulse * 20.0;
            ringLight1.intensity = lightIntensity;
            ringLight2.intensity = lightIntensity;
            ringLight3.intensity = lightIntensity;

            // Intensité pulsante du cœur et changement de couleur cyclique
            currentFireColor.lerpColors(fireBaseColor, fireHotColor, heatLevel);
            coreInternalLight.intensity = currentPulse * (1500.0 + heatLevel * 2000.0);
            coreInternalLight.color.copy(currentFireColor);
            artifactMaterialCore.emissive.copy(currentFireColor);
            artifactMaterialCore.emissiveIntensity = currentPulse * (1.5 + heatLevel);
            if (artifactUniforms.u_hover.value > 0.5) {
                heatLevel += 0.005; 
            } 
            else {
                heatLevel -= 0.01;  
            }
            
            heatLevel = Math.max(0.0, Math.min(1.0, heatLevel));

            artifactMaterialCore.roughness = heatLevel * 0.3; 
            artifactMaterialCore.iridescence = 1.0 - heatLevel;
            
            // Cycle RGB de la lumière au sol
            neonColor.setHSL((time * CONFIG.artifact.rgbCycleSpeed) % 1.0, 1.0, 0.5);
            neonMat.emissive.copy(neonColor);
            neonSourceLight.color.copy(neonColor);
        },
        
        dispose: () => {
            pedestalMat.dispose(); neonMat.dispose();
            geoBase.dispose(); geoNeon.dispose(); geoTop.dispose();
            artifactMaterialCore.dispose(); 
            shatteredMat.dispose();
            shatteredBaseGeo.dispose();
            shatteredGeo.dispose();
            artifactGeoBase.dispose(); depthMat.dispose(); distanceMat.dispose();
            ringMat.dispose(); ring1.geometry.dispose(); 
            ring2.geometry.dispose(); ring3.geometry.dispose();
        }
    };
}