/**
 * Configuration globale de la scène 3D.
 * Centralise les paramètres physiques, visuels et temporels pour éviter les valeurs magiques dans le code.
 */
export const CONFIG = {
    colors: { 
        bg: 0x1a1a1a, 
        ground: 0x1a1a1a, 
        defaultObj: 0x555555, 
        hoverObj: 0x00ffff 
    },
    physics: { 
        moveSpeed: 0.4, 
        minCameraHeight: 1.0 
    },
    artifact: { 
        baseY: 7.0, 
        floatSpeed: 2.0, 
        floatAmplitude: 0.4, 
        rgbCycleSpeed: 0.05 
    }
};