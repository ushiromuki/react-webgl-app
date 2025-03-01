import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GraphicsTheme } from '../types';

// 背景グラフィックスのプロパティ
interface BackgroundGraphicsProps {
  theme: GraphicsTheme;
}

// 天気カテゴリに対応する絵文字のマッピング
const weatherEmojiMap: Record<string, string[]> = {
  sunny: ['☀️', '🌞', '✨'],
  cloudy: ['☁️', '⛅', '🌥️'],
  rainy: ['🌧️', '💧', '☔'],
  snowy: ['❄️', '🌨️', '⛄'],
  foggy: ['🌫️', '💨'],
  stormy: ['⚡', '🌩️', '⛈️'],
  default: ['✨', '💫', '⭐'],
};

// テキストスプライト（絵文字）コンポーネント
const TextSprite: React.FC<{ position: THREE.Vector3; text: string; scale: number; color: THREE.Color }> = ({ 
  position, 
  text, 
  scale,
  color
}) => {
  const spriteRef = useRef<THREE.Sprite>(null);
  
  // テキストをキャンバスにレンダリングしてテクスチャを作成
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();
    
    // キャンバスサイズ設定
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    
    // 背景を透明に
    ctx.clearRect(0, 0, size, size);
    
    // テキスト（絵文字）描画
    ctx.font = `${size * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2);
    
    // テクスチャ作成
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [text]);
  
  return (
    <sprite ref={spriteRef} position={[position.x, position.y, position.z]} scale={[scale, scale, 1]}>
      <spriteMaterial
        map={texture}
        transparent={true}
        opacity={0.8}
        color={color}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
};

// パーティクルシステムのコンポーネント
const ParticleSystem: React.FC<BackgroundGraphicsProps> = ({ theme }) => {
  const { colors, category, intensity } = theme;
  const { size, viewport } = useThree();
  const aspect = size.width / size.height;
  const [particles, setParticles] = useState<Array<{
    position: THREE.Vector3;
    emoji: string;
    scale: number;
    color: THREE.Color;
    velocity: THREE.Vector3;
  }>>([]);

  // 使用する絵文字の配列を取得
  const emojis = useMemo(() => {
    const categoryKey = category as keyof typeof weatherEmojiMap;
    return weatherEmojiMap[categoryKey] || weatherEmojiMap.default;
  }, [category]);

  // パーティクルの数（カテゴリと強度に基づいて調整）
  const particleCount = useMemo(() => {
    const baseCount = 50; // 絵文字パーティクルは少なめに
    
    // カテゴリに応じてパーティクル数を調整
    switch (category) {
      case 'rainy':
        return baseCount * 1.5;
      case 'snowy':
        return baseCount * 2;
      case 'foggy':
        return baseCount * 1.2;
      case 'stormy':
        return baseCount * 1.3;
      default:
        return baseCount;
    }
  }, [category]);

  // パーティクルの初期化
  useEffect(() => {
    const newParticles = [];
    const availableColors = colors.map(hex => new THREE.Color(hex));
    
    for (let i = 0; i < particleCount; i++) {
      // パーティクルの位置
      const x = (Math.random() - 0.5) * 10 * aspect;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      
      // パーティクルの色
      const colorIndex = Math.floor(Math.random() * availableColors.length);
      const color = availableColors[colorIndex].clone();
      
      // パーティクルのサイズ（カテゴリによって調整）
      let scale = Math.random() * 0.3 + 0.2;
      
      if (category === 'rainy') {
        scale = Math.random() * 0.2 + 0.1;
      } else if (category === 'snowy') {
        scale = Math.random() * 0.4 + 0.2;
      } else if (category === 'foggy') {
        scale = Math.random() * 0.5 + 0.3;
      }
      
      // 絵文字の選択
      const emojiIndex = Math.floor(Math.random() * emojis.length);
      const emoji = emojis[emojiIndex];
      
      // 初期速度
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        category === 'rainy' ? -0.03 * (Math.random() * 0.5 + 0.5) : (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      );
      
      newParticles.push({
        position: new THREE.Vector3(x, y, z),
        emoji,
        scale,
        color,
        velocity
      });
    }
    
    setParticles(newParticles);
  }, [particleCount, colors, category, aspect, emojis]);

  // アニメーションフレームごとの更新
  useFrame((state, delta) => {
    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        const newPosition = particle.position.clone();
        
        // カテゴリに応じたアニメーション
        if (category === 'rainy') {
          // 雨のアニメーション - 上から下へ落ちる
          newPosition.y += particle.velocity.y * intensity;
          
          // 画面外に出たら上に戻す
          if (newPosition.y < -5) {
            newPosition.y = 5;
            newPosition.x = (Math.random() - 0.5) * 10 * aspect;
          }
        } else if (category === 'snowy') {
          // 雪のアニメーション - ゆっくり落ちて揺れる
          newPosition.y -= 0.01 * intensity;
          newPosition.x += Math.sin(state.clock.elapsedTime * 0.1 + Math.random()) * 0.01;
          
          // 画面外に出たら上に戻す
          if (newPosition.y < -5) {
            newPosition.y = 5;
            newPosition.x = (Math.random() - 0.5) * 10 * aspect;
          }
        } else if (category === 'cloudy' || category === 'foggy') {
          // 雲や霧のアニメーション - ゆっくり動く
          newPosition.x += Math.sin(state.clock.elapsedTime * 0.1 + Math.random()) * 0.002 * intensity;
          newPosition.y += Math.cos(state.clock.elapsedTime * 0.1 + Math.random()) * 0.002 * intensity;
        } else if (category === 'stormy') {
          // 嵐のアニメーション - 激しく動く
          newPosition.x += (Math.random() - 0.5) * 0.05 * intensity;
          newPosition.y += (Math.random() - 0.5) * 0.05 * intensity;
          
          // 一定の範囲内に収める
          if (Math.abs(newPosition.x) > 5 * aspect) {
            newPosition.x *= 0.95;
          }
          if (Math.abs(newPosition.y) > 5) {
            newPosition.y *= 0.95;
          }
        } else {
          // デフォルトのアニメーション - ゆっくり回転
          const x = newPosition.x;
          const z = newPosition.z;
          const angle = delta * 0.05 * intensity;
          
          newPosition.x = x * Math.cos(angle) - z * Math.sin(angle);
          newPosition.z = x * Math.sin(angle) + z * Math.cos(angle);
        }
        
        return {
          ...particle,
          position: newPosition
        };
      });
    });
  });

  return (
    <>
      {particles.map((particle, index) => (
        <TextSprite
          key={index}
          position={particle.position}
          text={particle.emoji}
          scale={particle.scale}
          color={particle.color}
        />
      ))}
    </>
  );
};

// 背景グラデーションのコンポーネント
const BackgroundGradient: React.FC<BackgroundGraphicsProps> = ({ theme }) => {
  const { colors } = theme;
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  const aspect = size.width / size.height;

  // グラデーションシェーダー
  const uniforms = useMemo(() => ({
    color1: { value: new THREE.Color(colors[0]) },
    color2: { value: new THREE.Color(colors[1]) },
    color3: { value: new THREE.Color(colors[2]) },
    aspect: { value: aspect },
    time: { value: 0 }
  }), [colors, aspect]);

  // シェーダーの更新
  useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.color1.value = new THREE.Color(colors[0]);
      material.uniforms.color2.value = new THREE.Color(colors[1]);
      material.uniforms.color3.value = new THREE.Color(colors[2]);
    }
  }, [colors]);

  // アニメーションフレームごとの更新
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <planeGeometry args={[20, 20]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 color1;
          uniform vec3 color2;
          uniform vec3 color3;
          uniform float aspect;
          uniform float time;
          varying vec2 vUv;
          
          void main() {
            vec2 uv = vUv;
            uv.x *= aspect;
            
            // 時間に基づく動的なグラデーション
            float noise = sin(uv.x * 3.0 + time) * sin(uv.y * 3.0 + time) * 0.25 + 0.75;
            
            // 3色のグラデーション
            vec3 color = mix(color1, color2, uv.y);
            color = mix(color, color3, uv.x * noise);
            
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
};

// メインの背景グラフィックスコンポーネント
const BackgroundGraphics: React.FC<BackgroundGraphicsProps> = ({ theme }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <BackgroundGradient theme={theme} />
        <ParticleSystem theme={theme} />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};

export default BackgroundGraphics;
