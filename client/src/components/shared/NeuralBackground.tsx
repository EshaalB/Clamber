/* NeuralBackground.tsx: A high-performance, smooth constellation effect for academic aesthetics. */
import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const NeuralNodes = ({ count = 30, color = "#7CB9E8" }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const { viewport } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * viewport.width;
      const y = (Math.random() - 0.5) * viewport.height;
      const z = (Math.random() - 0.5) * 10;
      const vx = (Math.random() - 0.5) * 0.02;
      const vy = (Math.random() - 0.5) * 0.02;
      temp.push({ x, y, z, vx, vy });
    }
    return temp;
  }, [count, viewport]);

  useFrame((state) => {
    const { pointer } = state;
    const mouseX = (pointer.x * viewport.width) / 2;
    const mouseY = (pointer.y * viewport.height) / 2;

    const linePositions = [];
    
    particles.forEach((p, i) => {
      // Gentle movement
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (Math.abs(p.x) > viewport.width / 2) p.vx *= -1;
      if (Math.abs(p.y) > viewport.height / 2) p.vy *= -1;

      // Mouse attraction
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 5) {
        p.x += dx * 0.02;
        p.y += dy * 0.02;
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(0.08);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);

      // Line connections
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx2 = p.x - p2.x;
        const dy2 = p.y - p2.y;
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (dist2 < 3) {
          linePositions.push(p.x, p.y, p.z, p2.x, p2.y, p2.z);
        }
      }
    });

    if (meshRef.current) meshRef.current.instanceMatrix.needsUpdate = true;
    if (lineRef.current) {
      lineRef.current.geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(linePositions, 3)
      );
    }
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </instancedMesh>
      <lineSegments ref={lineRef}>
        <bufferGeometry />
        <lineBasicMaterial color={color} transparent opacity={0.05} linewidth={1} />
      </lineSegments>
    </>
  );
};

const NeuralBackground: React.FC<{ color?: string }> = ({ color }) => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
        <NeuralNodes color={color} />
      </Canvas>
    </div>
  );
};

export default NeuralBackground;
