import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AgentAvatarId, CustomAvatarStyle } from '../types';

export type AvatarMood = 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'alarmed';

interface ThreeAvatarProps {
  avatarId?: AgentAvatarId;
  customStyle?: CustomAvatarStyle;
  mood: AvatarMood;
  isThinking: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  gameProgress?: number; // 0 - 100
  className?: string;
  onClick?: () => void;
  interactive?: boolean; // allow drag-to-rotate
}

const AVATAR_COLOR_CONFIG: Record<
  string,
  {
    primaryHex: string;
    primaryNum: number;
    secondaryNum: number;
    chassisNum: number;
    visorBg: string;
  }
> = {
  'cyber-striker': {
    primaryHex: '#06b6d4',
    primaryNum: 0x06b6d4,
    secondaryNum: 0x4f46e5,
    chassisNum: 0x11162b,
    visorBg: '#040714'
  },
  'crimson-vanguard': {
    primaryHex: '#f43f5e',
    primaryNum: 0xf43f5e,
    secondaryNum: 0xea580c,
    chassisNum: 0x260b12,
    visorBg: '#140408'
  },
  'quantum-phantom': {
    primaryHex: '#10b981',
    primaryNum: 0x10b981,
    secondaryNum: 0x0d9488,
    chassisNum: 0x061f1a,
    visorBg: '#03120e'
  },
  'aegis-titan': {
    primaryHex: '#f59e0b',
    primaryNum: 0xf59e0b,
    secondaryNum: 0xd97706,
    chassisNum: 0x241a08,
    visorBg: '#120d03'
  },
  'void-overlord': {
    primaryHex: '#a855f7',
    primaryNum: 0xa855f7,
    secondaryNum: 0xc026d3,
    chassisNum: 0x190b28,
    visorBg: '#0c0414'
  }
};

function hexToNumber(hex: string, fallback: number): number {
  if (!hex) return fallback;
  const cleaned = hex.replace('#', '');
  const parsed = parseInt(cleaned, 16);
  return isNaN(parsed) ? fallback : parsed;
}

export const ThreeAvatar: React.FC<ThreeAvatarProps> = ({
  avatarId = 'cyber-striker',
  customStyle,
  mood,
  isThinking,
  isSpeaking,
  isListening,
  gameProgress = 0,
  className = '',
  onClick,
  interactive = true
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef({
    avatarId,
    customStyle,
    mood,
    isThinking,
    isSpeaking,
    isListening,
    gameProgress
  });

  useEffect(() => {
    propsRef.current = {
      avatarId,
      customStyle,
      mood,
      isThinking,
      isSpeaking,
      isListening,
      gameProgress
    };
  }, [avatarId, customStyle, mood, isThinking, isSpeaking, isListening, gameProgress]);

  // Draw tactical combat visor HUD & expressions on dynamic 2D canvas texture
  const updateVisorExpression = (
    ctx: CanvasRenderingContext2D,
    currentMood: AvatarMood,
    currentAvatarId: AgentAvatarId,
    style: CustomAvatarStyle | undefined,
    time: number
  ) => {
    const defaultTheme = AVATAR_COLOR_CONFIG[currentAvatarId] || AVATAR_COLOR_CONFIG['cyber-striker'];
    const primaryHex = style?.primaryColor || defaultTheme.primaryHex;
    const visorBg = defaultTheme.visorBg;

    ctx.clearRect(0, 0, 256, 128);

    // Visor dark glass background
    ctx.fillStyle = visorBg;
    ctx.fillRect(0, 0, 256, 128);

    // Subtle tactical HUD grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 64);
    ctx.lineTo(236, 64);
    ctx.moveTo(128, 20);
    ctx.lineTo(128, 108);
    ctx.stroke();

    ctx.save();
    ctx.shadowBlur = 14;

    if (currentMood === 'thinking') {
      // THINKING STATE: Concentrated scanning data matrix & tactical calculation HUD
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#fbbf24';

      const pulse = Math.sin(time * 8) * 3;
      ctx.fillRect(58, 56 - pulse / 2, 44, 12 + pulse);
      ctx.fillRect(154, 56 - pulse / 2, 44, 12 + pulse);

      // Data scan line
      const scanY = (time * 120) % 128;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.fillRect(0, scanY, 256, 4);

      // Telemetry text
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('SIM: 840K RUNS', 86, 28);
      ctx.fillText('SOLVING...', 98, 110);
    } else if (currentMood === 'happy') {
      // VICTORY / OPTIMAL STRATEGY LOCKED STATE
      ctx.strokeStyle = '#10b981';
      ctx.shadowColor = '#34d399';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(60, 72);
      ctx.lineTo(80, 52);
      ctx.lineTo(100, 72);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(156, 72);
      ctx.lineTo(176, 52);
      ctx.lineTo(196, 72);
      ctx.stroke();

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText('LOCKED // 99.4%', 82, 108);
    } else if (currentMood === 'listening') {
      // LISTENING STATE: Active voice radar iris
      ctx.fillStyle = '#ec4899';
      ctx.shadowColor = '#f472b6';

      const radarR = 17 + Math.sin(time * 6) * 4;
      ctx.beginPath();
      ctx.arc(80, 64, radarR, 0, Math.PI * 2);
      ctx.arc(176, 64, radarR, 0, Math.PI * 2);
      ctx.fill();

      // Inner target reticle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(80, 64, 5, 0, Math.PI * 2);
      ctx.arc(176, 64, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#f472b6';
      ctx.fillText('VOICE INPUT', 92, 108);
    } else if (currentMood === 'speaking') {
      // SPEAKING STATE: Tactical optics + equalizer waveform
      ctx.fillStyle = primaryHex;
      ctx.shadowColor = primaryHex;

      ctx.beginPath();
      ctx.ellipse(80, 58, 16, 18, 0, 0, Math.PI * 2);
      ctx.ellipse(176, 58, 16, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 5; i++) {
        const barH = Math.abs(Math.sin(time * 14 + i * 0.9)) * 14 + 4;
        ctx.fillRect(104 + i * 10, 102 - barH / 2, 6, barH);
      }
    } else {
      // IDLE READY STATE
      ctx.fillStyle = primaryHex;
      ctx.shadowColor = primaryHex;

      const blinkCycle = time % 4.2;
      const isBlinking = blinkCycle > 4.0 && blinkCycle < 4.14;

      if (isBlinking) {
        ctx.fillRect(62, 62, 36, 4);
        ctx.fillRect(158, 62, 36, 4);
      } else if (currentAvatarId === 'crimson-vanguard') {
        ctx.beginPath();
        ctx.moveTo(58, 52);
        ctx.lineTo(102, 58);
        ctx.lineTo(96, 74);
        ctx.lineTo(62, 70);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(198, 52);
        ctx.lineTo(154, 58);
        ctx.lineTo(160, 74);
        ctx.lineTo(194, 70);
        ctx.closePath();
        ctx.fill();
      } else if (currentAvatarId === 'quantum-phantom') {
        ctx.fillRect(56, 56, 46, 14);
        ctx.fillRect(154, 56, 46, 14);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(72, 60, 14, 6);
        ctx.fillRect(170, 60, 14, 6);
      } else if (currentAvatarId === 'aegis-titan') {
        ctx.fillRect(62, 50, 36, 26);
        ctx.fillRect(158, 50, 36, 26);
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(72, 56, 16, 10);
        ctx.fillRect(168, 56, 16, 10);
      } else {
        ctx.beginPath();
        ctx.ellipse(80, 64, 16, 21, 0, 0, Math.PI * 2);
        ctx.ellipse(176, 64, 16, 21, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(75, 56, 4.5, 0, Math.PI * 2);
        ctx.arc(171, 56, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 160;
    const height = container.clientHeight || 160;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 0.18, 4.2);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 3. Dynamic Visor 2D Canvas
    const eyeCanvas = document.createElement('canvas');
    eyeCanvas.width = 256;
    eyeCanvas.height = 128;
    const eyeTexture = new THREE.CanvasTexture(eyeCanvas);
    eyeTexture.colorSpace = THREE.SRGBColorSpace;

    // 4. 3D Tactical Unit Hierarchy
    const characterRoot = new THREE.Group();
    const headGroup = new THREE.Group();
    characterRoot.add(headGroup);
    scene.add(characterRoot);

    // Head Base Chassis
    const headGeo = new THREE.SphereGeometry(1, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x11162b,
      metalness: 0.7,
      roughness: 0.25
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headGroup.add(headMesh);

    // Curved Visor Shield
    const visorGeo = new THREE.SphereGeometry(1.02, 32, 24, 0, Math.PI, Math.PI * 0.25, Math.PI * 0.5);
    const visorMat = new THREE.MeshStandardMaterial({
      map: eyeTexture,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      emissive: 0x0a1025,
      emissiveIntensity: 0.5
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.rotation.y = -Math.PI / 2;
    headGroup.add(visorMesh);

    // Tactical Headset Arch
    const bandCurve = new THREE.EllipseCurve(0, 0, 1.15, 1.15, 0, Math.PI, false, 0);
    const bandPoints = bandCurve.getPoints(32).map(p => new THREE.Vector3(p.x, p.y, 0));
    const bandGeo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(bandPoints),
      32,
      0.08,
      12,
      false
    );
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x312e81,
      emissiveIntensity: 0.4
    });
    const bandMesh = new THREE.Mesh(bandGeo, bandMat);
    bandMesh.position.y = 0.05;
    headGroup.add(bandMesh);

    // Ear Modules
    const cupGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 24);
    const cupMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x4338ca,
      emissiveIntensity: 0.8
    });

    const leftCup = new THREE.Mesh(cupGeo, cupMat);
    leftCup.rotation.z = Math.PI / 2;
    leftCup.position.set(-1.12, 0.05, 0);
    headGroup.add(leftCup);

    const rightCup = new THREE.Mesh(cupGeo, cupMat);
    rightCup.rotation.z = Math.PI / 2;
    rightCup.position.set(1.12, 0.05, 0);
    headGroup.add(rightCup);

    // Tactical Comms Boom Mic
    const micArmGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8);
    const micArmMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const micArm = new THREE.Mesh(micArmGeo, micArmMat);
    micArm.rotation.x = Math.PI * 0.45;
    micArm.rotation.z = -Math.PI * 0.25;
    micArm.position.set(-0.85, -0.3, 0.55);
    headGroup.add(micArm);

    const micTipGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const micTipMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.2
    });
    const micTip = new THREE.Mesh(micTipGeo, micTipMat);
    micTip.position.set(-0.55, -0.55, 0.95);
    headGroup.add(micTip);

    // Special Attachment 1: Mecha V-Fin Crest Horns
    const crestGroup = new THREE.Group();
    const hornGeo = new THREE.ConeGeometry(0.12, 0.75, 6);
    const hornMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.7,
      metalness: 0.8,
      roughness: 0.2
    });
    const leftHorn = new THREE.Mesh(hornGeo, hornMat);
    leftHorn.position.set(-0.35, 1.05, 0.55);
    leftHorn.rotation.z = Math.PI * 0.22;
    leftHorn.rotation.x = -Math.PI * 0.1;
    const rightHorn = new THREE.Mesh(hornGeo, hornMat);
    rightHorn.position.set(0.35, 1.05, 0.55);
    rightHorn.rotation.z = -Math.PI * 0.22;
    rightHorn.rotation.x = -Math.PI * 0.1;
    crestGroup.add(leftHorn, rightHorn);
    headGroup.add(crestGroup);

    // Special Attachment 2: Floating Void Octahedron Crystal
    const crystalGeo = new THREE.OctahedronGeometry(0.24, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 1.4,
      metalness: 0.9,
      roughness: 0.1
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.position.set(0, 1.42, 0.2);
    headGroup.add(crystalMesh);

    // Torso / Neck Collar
    const collarGeo = new THREE.CylinderGeometry(0.85, 1.15, 0.7, 24);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.7,
      roughness: 0.3
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.position.y = -1.25;
    characterRoot.add(collarMesh);

    // Primary Halo Data Ring
    const haloGeo = new THREE.TorusGeometry(1.25, 0.028, 16, 64);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.85
    });
    const haloRing = new THREE.Mesh(haloGeo, haloMat);
    haloRing.rotation.x = Math.PI * 0.45;
    haloRing.position.y = 1.32;
    headGroup.add(haloRing);

    // Secondary Crossed Orbital Ring
    const secondHaloRing = new THREE.Mesh(haloGeo, haloMat);
    secondHaloRing.rotation.x = Math.PI * 0.35;
    secondHaloRing.rotation.y = Math.PI * 0.25;
    secondHaloRing.position.y = 1.1;
    headGroup.add(secondHaloRing);

    // Orbiting Data Particles
    const particleCount = 48;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 1.4 + Math.random() * 0.5;
      particlePositions[i * 3] = Math.cos(theta) * radius;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 1.8;
      particlePositions[i * 3 + 2] = Math.sin(theta) * radius;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    characterRoot.add(particles);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x818cf8, 2.0);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.8);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    // Interactive Drag to Rotate & Mouse Hover Tracking
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragRotY = 0;
    let dragRotX = 0;
    const hoverRotation = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      container.setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragRotY += dx * 0.015;
        dragRotX = Math.max(-0.6, Math.min(0.6, dragRotX + dy * 0.01));
      } else {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        hoverRotation.y = Math.max(-0.4, Math.min(0.4, x * 0.35));
        hoverRotation.x = Math.max(-0.3, Math.min(0.3, -y * 0.2));
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        container.releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 6. 60FPS Render & Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentProps = propsRef.current;
      const theme = AVATAR_COLOR_CONFIG[currentProps.avatarId] || AVATAR_COLOR_CONFIG['cyber-striker'];
      const style = currentProps.customStyle;

      const pColorNum = style ? hexToNumber(style.primaryColor, theme.primaryNum) : theme.primaryNum;
      const sColorNum = style ? hexToNumber(style.secondaryColor, theme.secondaryNum) : theme.secondaryNum;
      const cColorNum = style ? hexToNumber(style.chassisColor, theme.chassisNum) : theme.chassisNum;

      // Update 3D Materials
      headMat.color.setHex(cColorNum);
      bandMat.color.setHex(sColorNum);
      bandMat.emissive.setHex(sColorNum);
      cupMat.color.setHex(pColorNum);
      cupMat.emissive.setHex(sColorNum);
      hornMat.color.setHex(pColorNum);
      hornMat.emissive.setHex(pColorNum);
      crystalMat.color.setHex(pColorNum);
      crystalMat.emissive.setHex(pColorNum);
      particleMat.color.setHex(pColorNum);

      // Determine attachment visibility based on preset or custom prompt style
      const showHorns = style
        ? style.hasHorns ?? false
        : currentProps.avatarId === 'crimson-vanguard' || currentProps.avatarId === 'aegis-titan';
      const showCrystal = style
        ? style.hasCrystal ?? false
        : currentProps.avatarId === 'void-overlord' || currentProps.avatarId === 'aegis-titan';
      const showSecondHalo = style
        ? (style.haloCount ?? 1) >= 2
        : currentProps.avatarId === 'quantum-phantom';

      crestGroup.visible = showHorns;
      crystalMesh.visible = showCrystal;
      secondHaloRing.visible = showSecondHalo;

      // Smooth Rotation Lerp
      const targetY = dragRotY + hoverRotation.y;
      const targetX = dragRotX + hoverRotation.x;
      characterRoot.rotation.y += (targetY - characterRoot.rotation.y) * 0.1;
      headGroup.rotation.x += (targetX - headGroup.rotation.x) * 0.1;

      // Floating dynamic motion
      const floatSpeed = style?.pulseRate ? style.pulseRate * 2 : 2.5;
      headGroup.position.y = Math.sin(elapsedTime * floatSpeed) * 0.04;

      // Halo & crystal dynamic rotation
      const rotSpeed = style?.rotationSpeed ? style.rotationSpeed : 1.0;
      haloRing.rotation.z += 0.015 * rotSpeed;
      secondHaloRing.rotation.z -= 0.022 * rotSpeed;
      crystalMesh.rotation.y = elapsedTime * 1.8 * rotSpeed;
      particles.rotation.y = elapsedTime * 0.25 * rotSpeed;

      // Dynamic reactive halo color
      if (currentProps.isThinking) {
        haloMat.color.setHex(0xf59e0b);
        haloMat.emissive.setHex(0xf59e0b);
        haloRing.rotation.z += 0.05;
      } else if (currentProps.isListening) {
        haloMat.color.setHex(0xec4899);
        haloMat.emissive.setHex(0xec4899);
      } else if (currentProps.mood === 'happy') {
        haloMat.color.setHex(0x10b981);
        haloMat.emissive.setHex(0x10b981);
      } else {
        haloMat.color.setHex(pColorNum);
        haloMat.emissive.setHex(pColorNum);
      }

      // Update 2D Canvas Expression for 3D Visor
      const ctx = eyeCanvas.getContext('2d');
      if (ctx) {
        let activeMood = currentProps.mood;
        if (currentProps.isThinking) activeMood = 'thinking';
        else if (currentProps.isListening) activeMood = 'listening';
        else if (currentProps.isSpeaking) activeMood = 'speaking';
        else if (currentProps.gameProgress > 80) activeMood = 'happy';

        updateVisorExpression(ctx, activeMood, currentProps.avatarId, style, elapsedTime);
        eyeTexture.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      headGeo.dispose();
      headMat.dispose();
      visorGeo.dispose();
      visorMat.dispose();
      bandGeo.dispose();
      bandMat.dispose();
      cupGeo.dispose();
      cupMat.dispose();
      hornGeo.dispose();
      hornMat.dispose();
      crystalGeo.dispose();
      crystalMat.dispose();
      collarGeo.dispose();
      collarMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      onClick={onClick}
      className={`relative cursor-pointer select-none overflow-hidden ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};
