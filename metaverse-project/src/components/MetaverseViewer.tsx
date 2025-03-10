import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Sky, Html } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import MondrianLayout from '../utils/MondrianLayout';
import { useLanguage } from '../utils/languageContext';

// Declaração global para compartilhar o estado das teclas pressionadas
declare global {
  interface Window {
    __GLOBAL_KEYS_PRESSED__?: Set<string>;
    __METAVERSE_CUBES__?: any[];
  }
}

// Interface for the component props
interface MetaverseViewerProps {
  bitmapData: number[];
  style?: React.CSSProperties;
  onExportImage?: (dataUrl: string) => void;
  onLayoutDimensionsUpdate?: (dimensions: { width: number; height: number }) => void;
}

// Interface for the cube data
interface CubeData {
  position: [number, number, number];
  size: number;
  color: string;
  plotNumber?: number;
  // Adicionando propriedade para a caixa de colisão
  collisionBox?: {
    min: THREE.Vector3;
    max: THREE.Vector3;
  };
}

// Componente da nave espacial
function Spaceship({ position = [0, 0, 0], rotation = [0, 0, 0], isMoving = false, isColliding = false }: { 
  position?: [number, number, number], 
  rotation?: [number, number, number],
  isMoving?: boolean,
  isColliding?: boolean
}) {
  const shipRef = useRef<THREE.Group>(null);
  
  // Tamanho da caixa de colisão da nave (ligeiramente menor que o modelo visual)
  const shipCollisionSize = {
    width: 2.5,  // Largura da caixa de colisão
    height: 1.0, // Altura da caixa de colisão
    depth: 2.5   // Profundidade da caixa de colisão
  };
  
  // Função para criar a textura da nave espacial
  const createSpaceshipTexture = useCallback(() => {
    // Criar textura com grade colorida
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Fundo translúcido com gradiente multicolorido
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, 'rgba(0, 255, 0, 0.7)');    // Verde brilhante #00FF00
      gradient.addColorStop(0.4, 'rgba(0, 0, 255, 0.5)');  // Azul puro #0000FF
      gradient.addColorStop(0.8, 'rgba(128, 0, 128, 0.4)'); // Roxo escuro #800080
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Criar grade com linhas pretas
      ctx.lineWidth = 2;
      
      // Grade maior
      const gridSize = 64;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';  // Preto puro #000000
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';  // Preto puro #000000
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Grade menor
      ctx.lineWidth = 1;
      const smallGridSize = 16;
      for (let x = 0; x <= canvas.width; x += smallGridSize) {
        if (x % gridSize !== 0) { // Evitar sobrepor com a grade maior
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';  // Preto puro mais transparente
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
      }
      
      for (let y = 0; y <= canvas.height; y += smallGridSize) {
        if (y % gridSize !== 0) { // Evitar sobrepor com a grade maior
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';  // Preto puro mais transparente
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }
      
      ctx.globalAlpha = 1.0;
      
      // Adicionar alguns nós nos cruzamentos
      for (let x = 0; x <= canvas.width; x += gridSize) {
        for (let y = 0; y <= canvas.height; y += gridSize) {
          ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';  // Preto puro #000000
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
  
  // Estado para controlar a intensidade dos propulsores
  const [thrusterIntensity, setThrusterIntensity] = useState(1.5);
  
  // Posição anterior para calcular movimento suave
  const prevPosition = useRef(new THREE.Vector3(...position));
  
  // Adicionar estado para pulsação do fogo
  const [pulseFactor, setPulseFactor] = useState(1.0);
  
  // Referência para o tempo para animar as partículas de fogo
  const timeRef = useRef(0);
  
  // Estado para controlar a velocidade da nave
  const [shipSpeed, setShipSpeed] = useState(0);
  
  // Referência para as teclas pressionadas (para verificar o Shift)
  const keysPressed = useRef<Set<string>>(new Set());
  
  // Estado para armazenar as partículas do rastro de fogo
  const [trailParticles, setTrailParticles] = useState<Array<{
    id: number;
    position: [number, number, number];
    size: number;
    color: string;
    opacity: number;
    lifetime: number;
    maxLifetime: number;
  }>>([]);
  
  // ID para as partículas do rastro
  const nextParticleId = useRef(0);
  
  // Criar a nave espacial uma única vez usando useMemo
  const spaceship = useMemo(() => {
    const texture = createSpaceshipTexture();
    const group = new THREE.Group();

    // Main body - ellipsoid with exact proportions
    const bodyGeometry = new THREE.SphereGeometry(30, 32, 16);
    bodyGeometry.scale(1, 0.25, 1);
    
    // Criar material com cores específicas
    const bodyMaterial = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 60,
        specular: 0x333333
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);
    
    // Cores exatas conforme especificado
    const greenColor = 0x00FF00;  // Verde brilhante
    const blueColor = 0x0000FF;   // Azul puro
    const purpleColor = 0x800080; // Roxo escuro
    const blackColor = 0x000000;  // Preto puro
    const brownColor = 0x8B4513;  // Marrom claro
    const orangeRedColor = 0xFF4500; // Laranja avermelhado (Orange Red)
    
    // Cúpula de vidro laranja avermelhado
    const domeGeometry = new THREE.SphereGeometry(15, 32, 16);
    const domeMaterial = new THREE.MeshPhysicalMaterial({
        color: orangeRedColor, // Laranja avermelhado #FF4500
        transparent: true,
        opacity: 0.4,
        metalness: 0.1,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transmission: 0.9, // Transmissão para efeito de vidro
        ior: 1.5, // Índice de refração
        reflectivity: 0.5,
        envMapIntensity: 1.0
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 8;
    group.add(dome);
    
    // Adicionar propulsores (reduzidos de tamanho)
    // Propulsor esquerdo
    const leftThrusterGeometry = new THREE.CylinderGeometry(3, 5, 10, 16); // Tamanho reduzido
    const thrusterMaterial = new THREE.MeshPhongMaterial({
      color: brownColor, // Marrom claro #8B4513
      shininess: 30,
      specular: 0x222222
    });
    const leftThruster = new THREE.Mesh(leftThrusterGeometry, thrusterMaterial);
    leftThruster.position.set(-20, -5, -25);
    leftThruster.rotation.x = Math.PI / 2;
    group.add(leftThruster);
    
    // Propulsor direito
    const rightThruster = new THREE.Mesh(leftThrusterGeometry, thrusterMaterial);
    rightThruster.position.set(20, -5, -25);
    rightThruster.rotation.x = Math.PI / 2;
    group.add(rightThruster);
    
    // Adicionar pés de pouso mais discretos (apenas barras)
    const legMaterial = new THREE.MeshStandardMaterial({
      color: greenColor, // Verde brilhante #00FF00 (mesmo tom do corpo da nave)
      metalness: 0.3,
      roughness: 0.4
    });
    
    // Pé de pouso esquerdo (apenas uma barra) - comprimento reduzido pela metade
    const leftLegGeometry = new THREE.CylinderGeometry(1, 1, 10, 8); // Reduzido de 20 para 10
    const leftLeg = new THREE.Mesh(leftLegGeometry, legMaterial);
    leftLeg.position.set(-20, -5, 5); // Ajustado y de -10 para -5 para compensar o tamanho menor
    leftLeg.rotation.x = 0.2; // Leve inclinação
    group.add(leftLeg);
    
    // Pé de pouso direito (apenas uma barra) - comprimento reduzido pela metade
    const rightLeg = new THREE.Mesh(leftLegGeometry, legMaterial);
    rightLeg.position.set(20, -5, 5); // Ajustado y de -10 para -5 para compensar o tamanho menor
    rightLeg.rotation.x = 0.2; // Leve inclinação
    group.add(rightLeg);
    
    // Escalar e rotacionar a nave (aumentada para 2x o tamanho anterior)
    group.scale.set(0.264, 0.264, 0.264); // Voltando ao tamanho original
    
    // Não aplicamos rotação aqui, será feita dinamicamente
    
    return group;
  }, [createSpaceshipTexture]);
  
  // Animação da nave
  useFrame((state, delta) => {
    if (shipRef.current) {
      // Atualizar o tempo para animação das partículas
      timeRef.current += delta;
      
      // Posição normal (sem efeito de colisão)
      shipRef.current.position.set(position[0], position[1], position[2]);
      
      // Aplicar rotação
      shipRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
      
      // Calcular a velocidade atual da nave
      const currentPos = new THREE.Vector3(...position);
      const distance = currentPos.distanceTo(prevPosition.current);
      const speed = distance / delta;
      setShipSpeed(speed);
      
      // Atualizar a posição anterior
      prevPosition.current.copy(currentPos);
      
      // Atualizar a intensidade dos propulsores com base na velocidade
      const isShiftPressed = keysPressed.current && keysPressed.current.has('shift');
      const targetIntensity = isMoving 
        ? (isShiftPressed ? 2.5 : 1.5) // Intensidade maior quando Shift está pressionado
        : 0.5;
      setThrusterIntensity(THREE.MathUtils.lerp(thrusterIntensity, targetIntensity, 0.1));
      
      // Atualizar a pulsação do fogo
      const pulsationSpeed = isShiftPressed ? 15 : 10;
      const pulsationRange = isShiftPressed ? 0.3 : 0.2;
      const newPulseFactor = 0.8 + Math.sin(state.clock.elapsedTime * pulsationSpeed) * pulsationRange;
      setPulseFactor(newPulseFactor);
      
      // Sincronizar com as teclas pressionadas do controle de câmera
      if (window.__GLOBAL_KEYS_PRESSED__) {
        keysPressed.current = window.__GLOBAL_KEYS_PRESSED__;
      }
    }
  });
  
  // Calcular a intensidade final com pulsação
  const finalIntensity = thrusterIntensity * pulseFactor;
  
  // Gerar partículas de fogo com base no tempo atual
  const generateFireParticles = (side: 'left' | 'right') => {
    // Posição corrigida para sair dos propulsores
    const baseX = side === 'left' ? -5.28 : 5.28; // Posição X dos propulsores
    
    // Determinar o tamanho e quantidade de partículas com base na velocidade
    const isShiftPressed = keysPressed.current && keysPressed.current.has('shift');
    const baseParticleCount = isMoving ? 8 : 4; // Removida a condição de colisão
    const particleCount = isMoving && isShiftPressed ? baseParticleCount * 2 : baseParticleCount;
    const intensityMultiplier = isMoving && isShiftPressed ? 2.0 : 1.0;
    
    // Criar partículas de fogo
    const fireParticles = Array.from({ length: particleCount }).map((_, i) => {
      // Usar o timeRef para animação contínua
      const offset = i * 2.1 + timeRef.current * 10;
      const xOffset = Math.sin(offset) * 0.1;
      const yOffset = Math.cos(offset * 1.3) * 0.1;
      const zOffset = -(i * 0.15 * finalIntensity * intensityMultiplier);
      
      // Cores variadas para as partículas
      const colors = ["#ffdd00", "#ff5500", "#ff3300", "#ff7700"];
      const color = colors[i % colors.length];
      
      // Tamanho variado para as partículas, maior quando em velocidade máxima
      const size = (0.05 + (Math.sin(offset * 0.5) * 0.02) + (Math.random() * 0.02)) * intensityMultiplier;
      
      return (
        <mesh 
          key={`spark-${side}-${i}`} 
          position={[
            baseX + xOffset, 
            -1.32 + yOffset, // Posição Y corrigida para sair dos propulsores
            -6.6 + zOffset // Posição Z corrigida para sair dos propulsores
          ]} 
          rotation={[Math.PI / 2, 0, 0]}
        >
          <sphereGeometry args={[size, 8, 8]} />
          <meshBasicMaterial 
            color={color} 
            transparent={true} 
            opacity={(0.9 - i * 0.15) * finalIntensity * intensityMultiplier}
          />
        </mesh>
      );
    });
    
    // Adicionar jato de fogo principal quando estiver em movimento
    const fireJet = isMoving ? (
      <mesh 
        key={`fire-jet-${side}`} 
        position={[
          baseX, 
          -1.32, 
          -6.8 - (isShiftPressed ? 1.0 : 0.5)
        ]} 
        rotation={[Math.PI / 2, 0, 0]}
      >
        <coneGeometry args={[
          0.4 * intensityMultiplier, 
          2.0 * finalIntensity * intensityMultiplier, 
          16, 
          1, 
          true
        ]} />
        <meshBasicMaterial 
          color="#ff7700" 
          transparent={true} 
          opacity={0.7 * finalIntensity * intensityMultiplier}
        />
      </mesh>
    ) : null;
    
    // Adicionar núcleo interno do fogo quando estiver em movimento
    const fireCore = isMoving ? (
      <mesh 
        key={`fire-core-${side}`} 
        position={[
          baseX, 
          -1.32, 
          -6.7
        ]} 
        rotation={[Math.PI / 2, 0, 0]}
      >
        <coneGeometry args={[
          0.2 * intensityMultiplier, 
          1.0 * finalIntensity * intensityMultiplier, 
          16, 
          1, 
          true
        ]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent={true} 
          opacity={0.9 * finalIntensity * intensityMultiplier}
        />
      </mesh>
    ) : null;
    
    // Retornar todos os elementos do fogo
    return [
      ...fireParticles,
      fireJet,
      fireCore
    ];
  };
  
  return (
    <>
      {/* Renderizar as partículas do rastro de fogo */}
      {trailParticles.map(particle => (
        <mesh 
          key={`trail-${particle.id}`} 
          position={particle.position}
        >
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshBasicMaterial 
            color={particle.color} 
            transparent={true} 
            opacity={particle.opacity}
          />
        </mesh>
      ))}
      
      {/* Removido o efeito de colisão - flash de luz e partículas */}
      
      <group ref={shipRef} position={position} rotation={rotation}>
        <primitive object={spaceship} />
      </group>
      
      {/* Gerar partículas de fogo para os propulsores */}
      {generateFireParticles('left')}
      {generateFireParticles('right')}
    </>
  );
}

// Componente para criar o ambiente de multiverso
function MultiverseBackground() {
  return (
    <>
      {/* Céu escuro */}
      <color attach="background" args={['#000015']} />
      
      {/* Estrelas */}
      <Stars 
        radius={300} // Aumentado para o mapa maior
        depth={160} // Aumentado para o mapa maior
        count={8000} // Aumentado para o mapa maior
        factor={2.5} 
        saturation={0.1} 
        fade 
        speed={0.3}
      />
      
      {/* Fog muito leve apenas para dar profundidade */}
      <fog attach="fog" args={['#000010', 1000, 2500]} /> {/* Ajustado para o mapa maior */}
    </>
  );
}

// Main MetaverseViewer component
export default function MetaverseViewer({ bitmapData, style, onExportImage, onLayoutDimensionsUpdate }: MetaverseViewerProps) {
  // Use the language context
  const { language, setLanguage, t } = useLanguage();

  // State to store the processed cube data
  const [cubes, setCubes] = useState<CubeData[]>([]);
  // State to track the maximum dimensions of the layout
  const [maxDimensions, setMaxDimensions] = useState({ width: 0, height: 0 });
  // State to track loading status
  const [isLoading, setIsLoading] = useState(true);
  // Ref for the canvas container
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  // State to track the target plot number for camera focus
  const [targetPlotNumber, setTargetPlotNumber] = useState<string>('');
  // State to track camera target position
  const [cameraTarget, setCameraTarget] = useState<[number, number, number] | null>(null);
  
  // Fator de escala para quadruplicar o tamanho do mapa
  const scaleFactor = 20; // Aumentado de 10 para 20 (2x maior)

  // Process the bitmap data when the component mounts or when bitmapData changes
  useEffect(() => {
    if (!bitmapData || bitmapData.length === 0) return;

    setIsLoading(true);

    // Generate the layout using MondrianLayout
    const mondrian = new MondrianLayout(bitmapData);
    const size = mondrian.getSize();
    
    // Aplicar o fator de escala às dimensões do mapa
    const scaledSize = {
      width: size.width * scaleFactor,
      height: size.height * scaleFactor
    };
    
    setMaxDimensions(scaledSize);
    
    // Notify parent component about layout dimensions
    if (onLayoutDimensionsUpdate) {
      onLayoutDimensionsUpdate(scaledSize);
    }

    // Generate a color palette based on the number of cubes
    const generateColor = (index: number): string => {
      // Retorna a cor laranja mais escura (Bitcoin) para todos os plots
      return '#D07000'; // Laranja mais escuro e menos agressivo que #F7931A
    };

    // Process the layout data into cube data
    const processedCubes: CubeData[] = [];
    
    let colorIndex = 0;
    for (const slot of mondrian.slots) {
      // Aplicar o fator de escala às posições e tamanhos
      processedCubes.push({
        position: [
          (slot.position.x + slot.size / 2) * scaleFactor, 
          slot.size / 2 * scaleFactor, 
          (slot.position.y + slot.size / 2) * scaleFactor
        ],
        size: slot.size * scaleFactor,
        color: generateColor(colorIndex++)
      });
    }
    
    // Create a grid to properly sort plots
    // First, determine the grid dimensions
    const gridWidth = Math.ceil(scaledSize.width);
    const gridHeight = Math.ceil(scaledSize.height);
    
    // Create a 2D grid to map positions to indices
    const grid: number[][] = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(-1));
    
    // Assign each plot to its grid cells
    processedCubes.forEach((cube, index) => {
      const x = Math.floor(cube.position[0] - cube.size / 2);
      const z = Math.floor(cube.position[2] - cube.size / 2);
      const plotSize = Math.ceil(cube.size);
      
      // Mark all cells covered by this plot
      for (let i = 0; i < plotSize; i++) {
        for (let j = 0; j < plotSize; j++) {
          const gridX = x + i;
          const gridZ = z + j;
          
          if (gridX >= 0 && gridX < gridWidth && gridZ >= 0 && gridZ < gridHeight) {
            grid[gridZ][gridX] = index;
          }
        }
      }
    });
    
    // Create a mapping of plot indices to their new numbers
    const plotNumberMap: Record<number, number> = {};
    let plotNumber = 0;
    
    // Assign numbers from left to right, top to bottom
    // Vamos numerar as parcelas de 0 até o total de parcelas - 1
    for (let z = 0; z < gridHeight; z++) {
      for (let x = 0; x < gridWidth; x++) {
        const index = grid[z][x];
        if (index !== -1 && plotNumberMap[index] === undefined) {
          // Não precisamos limitar o número, apenas atribuir sequencialmente
          plotNumberMap[index] = plotNumber++;
        }
      }
    }
    
    // Verify if all plots were assigned a number
    const assignedIndices = Object.keys(plotNumberMap).length;
    console.log(`Total plots in bitmapData: ${bitmapData.length}`);
    console.log(`Total plots assigned a number: ${assignedIndices}`);
    console.log(`Total processed cubes: ${processedCubes.length}`);
    console.log(`Total slots from MondrianLayout: ${mondrian.slots.length}`);
    
    // If we're missing plots, try to identify which ones weren't assigned
    if (assignedIndices < bitmapData.length) {
      console.log("Missing plots detected. Checking which indices weren't assigned...");
      
      // Find which indices weren't assigned a plot number
      const missingIndices: number[] = [];
      for (let i = 0; i < processedCubes.length; i++) {
        if (plotNumberMap[i] === undefined) {
          missingIndices.push(i);
          // Assign a number to this missing plot
          plotNumberMap[i] = plotNumber++;
          console.log(`Assigned number ${plotNumberMap[i]} to previously missing plot at index ${i}`);
          
          // Log information about the missing plot
          const cube = processedCubes[i];
          console.log(`Missing plot at index ${i}:`, {
            position: cube.position,
            size: cube.size
          });
        }
      }
      
      if (missingIndices.length > 0) {
        console.log(`Found ${missingIndices.length} missing indices: ${missingIndices.join(', ')}`);
      }
    }
    
    // Log para debug
    console.log(`Total de parcelas numeradas: ${plotNumber}`);
    const expectedPlots = bitmapData.length;
    if (plotNumber !== expectedPlots) {
      console.warn(`Atenção: Esperávamos exatamente ${expectedPlots} parcelas (0-${expectedPlots-1}), mas encontramos ${plotNumber}`);
    }
    
    // Assign plot numbers based on the mapping
    processedCubes.forEach((cube, index) => {
      cube.plotNumber = plotNumberMap[index] !== undefined ? plotNumberMap[index] : index;
    });
    
    // Armazenar os cubos em uma variável global para acesso pelo sistema de identificação de parcelas
    (window as any).__METAVERSE_CUBES__ = processedCubes;
    
    setCubes(processedCubes);
    setIsLoading(false);
  }, [bitmapData, onLayoutDimensionsUpdate, scaleFactor]);

  // Efeito para posicionar a câmera inicialmente acima da parcela 0
  useEffect(() => {
    // Aguardar os cubos serem carregados
    if (cubes.length === 0 || isLoading) return;
    
    // Encontrar a parcela 0
    const parcelaZero = cubes.find(cube => cube.plotNumber === 0);
    
    if (parcelaZero) {
      // Calcular a posição inicial da nave acima do plot 0
      const plotHeight = parcelaZero.position[1]; // Altura do plot 0
      const plotSize = parcelaZero.size;
      
      // Posicionar a nave acima do plot 0 com altura adequada para visualização
      // A nave estará olhando para o mapa (direção positiva do eixo X)
      const initialPosition: [number, number, number] = [
        parcelaZero.position[0] - maxDimensions.width / 2 - plotSize * 1.5, // Menos afastado com a nova distância da câmera
        plotHeight + plotSize * 1.0, // Altura ajustada para a nova distância da câmera
        (parcelaZero.position[2] - maxDimensions.height / 2) // Centralizado sobre o plot
      ];
      
      // Definir a posição inicial da câmera
      setCameraTarget(initialPosition);
      
      // Destacar visualmente a parcela 0
      setTargetPlotNumber('0');
      
      console.log('Nave posicionada inicialmente com visão horizontal para o mapa');
    }
  }, [cubes, isLoading, maxDimensions]);

  // Handle exporting the current view as an image
  const handleExportImage = useCallback(() => {
    if (!canvasContainerRef.current || !onExportImage) return;
    
    // Get the canvas element
    const canvas = canvasContainerRef.current.querySelector('canvas');
    if (!canvas) return;
    
    // Convert the canvas to a data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Call the callback with the data URL
    onExportImage(dataUrl);
  }, [onExportImage]);

  // State to track the currently highlighted plot
  const [highlightedPlot, setHighlightedPlot] = useState<number | null>(null);
  
  // Handle focusing on a specific plot
  const handleFocusPlot = () => {
    const plotNum = parseInt(targetPlotNumber);
    if (isNaN(plotNum) || plotNum < 0 || plotNum >= bitmapData.length) {
      alert(`Por favor insira um número de parcela válido (0-${bitmapData.length - 1})`);
      return;
    }
    
    // Find the cube with the matching plot number
    const targetCube = cubes.find(cube => cube.plotNumber === plotNum);
    
    if (targetCube) {
      // Calcular a posição da nave acima do plot, mas mais próxima do chão
      const plotHeight = targetCube.position[1]; // Altura do plot
      const plotSize = targetCube.size;
      
      // Set the camera target to the position of the found cube
      // Posicionar a nave acima do plot, mas mais próxima do chão
      setCameraTarget([
        targetCube.position[0] - maxDimensions.width / 2, 
        plotHeight + plotSize * 0.8, // Posicionar mais próximo do chão
        targetCube.position[2] - maxDimensions.height / 2 // Centralizado sobre o plot
      ]);
      
      // Set highlighted plot for visual effect
      setHighlightedPlot(plotNum);
      
      console.log(`Focando na parcela ${plotNum}: ${JSON.stringify(targetCube.position)}`);
    } else {
      console.warn(`Parcela ${plotNum} não encontrada`);
      alert(`Parcela ${plotNum} não encontrada`);
      setCameraTarget(null);
      setHighlightedPlot(null);
    }
  };

  // Add keyboard shortcuts for export and share
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Export on Ctrl+E
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        handleExportImage();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleExportImage]);

  // Handle input change for plot number search
  const handleTargetPlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetPlotNumber(e.target.value);
  };

  // Handle key press in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Usar a mesma lógica do handleFocusPlot
      handleFocusPlot();
    }
  };

  // Function to render the cubes
  const renderCubes = () => {
    // Calculate the highlighted plot number
    const highlightedPlot = targetPlotNumber ? parseInt(targetPlotNumber) : null;
    
    return (
      <group>
        {cubes.map((cube, index) => (
          <BuildingCube 
            key={`cube-${index}`} 
            data={cube} 
            index={index} 
            isHighlighted={cube.plotNumber === highlightedPlot}
          />
        ))}
      </group>
    );
  };

  // Estado para controlar se a nave está se movendo
  const [isShipMoving, setIsShipMoving] = useState(false);
  
  // Estado para controlar se a nave está em colisão (sempre falso, mantido para compatibilidade)
  const [isColliding, setIsColliding] = useState(false);
  
  // Estado para rastrear o número da parcela sobre a qual a nave está
  const [currentPlotNumber, setCurrentPlotNumber] = useState<number | null>(null);

  return (
    <div 
      ref={canvasContainerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        ...style 
      }}
    >
      {isLoading ? (
        <div className="loading-indicator">
          <p>{t('plot.loading')}</p>
        </div>
      ) : (
        <>
          {/* Language toggle button */}
          <div style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            zIndex: 100, 
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer'
          }} onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}>
            {t('language.toggle')}
          </div>

          {/* Campo de busca de parcela */}
          <div style={{ 
            position: 'absolute', 
            top: '10px', 
            left: '10px', 
            zIndex: 100, 
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <input 
              type="number" 
              min="0" 
              max={bitmapData.length - 1}
              value={targetPlotNumber}
              onChange={handleTargetPlotChange}
              onKeyPress={handleKeyPress}
              style={{ width: '80px', padding: '5px' }}
              placeholder={`${t('plot.search.placeholder')} (0-${bitmapData.length - 1})`}
            />
            <button 
              onClick={handleFocusPlot}
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                color: 'white', 
                padding: '5px 10px', 
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              {t('plot.search.button')}
            </button>
          </div>

          {/* Exibição do número da parcela atual - Mostrar apenas quando estiver sobre uma parcela */}
          {currentPlotNumber !== null && (
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              zIndex: 100, 
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '5px',
              fontSize: '18px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {t('plot.current')} {currentPlotNumber}
            </div>
          )}

          {/* Instruções de controle - Reposicionado para a esquerda abaixo do campo de busca */}
          <div style={{ 
            position: 'absolute', 
            top: '70px', 
            left: '10px', 
            zIndex: 100, 
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            maxWidth: '300px',
            fontSize: '14px'
          }}>
            <h3 style={{ margin: '0 0 8px 0' }}>{t('controls.title')}</h3>
            <p style={{ margin: '4px 0' }}>{t('controls.forward')}</p>
            <p style={{ margin: '4px 0' }}>{t('controls.backward')}</p>
            <p style={{ margin: '4px 0' }}>{t('controls.left')}</p>
            <p style={{ margin: '4px 0' }}>{t('controls.right')}</p>
            <p style={{ margin: '4px 0' }}>{t('controls.up')}</p>
            <p style={{ margin: '4px 0' }}>{t('controls.down')}</p>
            <p style={{ margin: '4px 0' }}>{t('controls.speed')}</p>
            <p style={{ margin: '4px 0' }}>{t('controls.look')}</p>
            <p style={{ margin: '4px 0' }}>{t('controls.search')} (0-{bitmapData.length - 1})</p>
          </div>

          <Canvas shadows camera={{ position: [0, 0, 0] }}>
            {/* Fundo de multiverso */}
            <MultiverseBackground />
            
            {/* Camera setup - ajustada para uma perspectiva elevada e inclinada */}
            <PerspectiveCamera 
              makeDefault 
              position={[0, maxDimensions.width * 0.5, 0]} 
              fov={65} 
              near={0.1}
              far={4000} // Aumentado para acomodar o mapa maior
            />
            <CameraControls 
              cameraTarget={cameraTarget}
              maxDimensions={maxDimensions}
              onPlotChange={setCurrentPlotNumber}
            />

            {/* Ambient light for better visibility */}
            <ambientLight intensity={0.9} />
            <directionalLight position={[100, 60, 20]} intensity={1.5} castShadow /> {/* Posição e intensidade ajustadas */}
            <pointLight position={[0, 100, 0]} intensity={1.2} color="#ffffff" /> {/* Altura ajustada */}
            <pointLight position={[maxDimensions.width, 80, maxDimensions.height]} intensity={1.0} color="#ffffff" /> {/* Altura ajustada */}
            <hemisphereLight args={['#ffffff', '#000020', 0.8]} /> {/* Intensidade ajustada */}

            {/* Center the scene */}
            <group position={[-maxDimensions.width / 2, 0, -maxDimensions.height / 2]}>
              {renderCubes()}
            </group>
          </Canvas>
        </>
      )}
    </div>
  );
}

// Camera controls component with focus capability
interface CameraControlsProps {
  cameraTarget: [number, number, number] | null;
  maxDimensions: { width: number; height: number };
  onPlotChange?: (plotNumber: number | null) => void;
}

// Função auxiliar para verificar colisão entre duas caixas de colisão (AABB)
function checkAABBCollision(box1Min: THREE.Vector3, box1Max: THREE.Vector3, box2Min: THREE.Vector3, box2Max: THREE.Vector3): boolean {
  // Verifica se há sobreposição em todos os eixos (X, Y, Z)
  return (
    box1Min.x <= box2Max.x && box1Max.x >= box2Min.x &&
    box1Min.y <= box2Max.y && box1Max.y >= box2Min.y &&
    box1Min.z <= box2Max.z && box1Max.z >= box2Min.z
  );
}

function CameraControls({ cameraTarget, maxDimensions, onPlotChange }: CameraControlsProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const isAnimating = useRef(false);
  
  // Estado para controlar a posição do jogador
  const [playerPosition, setPlayerPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 5, 0));
  const playerPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 5, 0));
  const [playerSpeed] = useState(3.2); // Diminuído em 2x (de 6.4 para 3.2)
  const keysPressed = useRef<Set<string>>(new Set());
  
  // Referência para rastrear se o movimento está sendo controlado pelo teclado
  const isKeyboardMoving = useRef(false);
  
  // Estado para controlar se a nave está se movendo
  const [isShipMoving, setIsShipMoving] = useState(false);
  
  // Estado para controlar se a nave está em colisão
  const [isColliding, setIsColliding] = useState(false);
  
  // Estado para rastrear o número da parcela sobre a qual a nave está
  const [currentPlotNumber, setCurrentPlotNumber] = useState<number | null>(null);
  
  // Referência para a última direção de movimento
  const lastMoveDirection = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  
  // Fator de suavização para o movimento
  const smoothingFactor = 0.05; // Reduzido para movimento mais suave
  const accelerationFactor = 0.03; // Reduzido para aceleração mais gradual com a velocidade menor
  const decelerationFactor = 0.96; // Ajustado para desaceleração mais suave
  
  // Velocidade atual da nave
  const currentVelocity = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  
  // Estado para visualizar as caixas de colisão (apenas para desenvolvimento)
  const [showCollisionBoxes, setShowCollisionBoxes] = useState(false); // Desabilitado por padrão
  const [collisionBoxes, setCollisionBoxes] = useState<Array<{
    position: [number, number, number];
    size: [number, number, number];
    color: string;
  }>>([]);
  
  // Tamanho da caixa de colisão da nave (ligeiramente menor que o modelo visual)
  const shipCollisionSize = {
    width: 2.5,  // Largura da caixa de colisão
    height: 1.0, // Altura da caixa de colisão
    depth: 2.5   // Profundidade da caixa de colisão
  };
  
  // Configurações da câmera
  const cameraDistance = 120; // Reduzido para ficar mais próximo da nave (de 200 para 120)
  const cameraHeight = 25;   // Ajustado para uma visão mais horizontal
  const cameraAngle = 0.1;    // Ângulo de inclinação da câmera (em radianos) - quase horizontal
  
  // Função para verificar sobre qual parcela a nave está
  const checkCurrentPlot = useCallback((position: THREE.Vector3) => {
    // Obter todos os cubos do componente pai
    const cubes = (window as any).__METAVERSE_CUBES__ || [];
    
    // Verificar cada cubo
    for (const cube of cubes) {
      // Obter as dimensões e posição do cubo
      const cubeX = cube.position[0] - maxDimensions.width / 2;
      const cubeY = cube.position[1];
      const cubeZ = cube.position[2] - maxDimensions.height / 2;
      const cubeSize = cube.size;
      
      // Verificar se a nave está sobre este cubo
      // Consideramos que a nave está sobre o cubo se estiver dentro das coordenadas X e Z do cubo
      // e a uma altura razoável acima dele
      const isOverX = Math.abs(position.x - cubeX) < cubeSize / 2;
      const isOverZ = Math.abs(position.z - cubeZ) < cubeSize / 2;
      const isAboveY = position.y > cubeY && position.y < cubeY + cubeSize * 3; // Altura razoável
      
      if (isOverX && isOverZ && isAboveY) {
        return cube.plotNumber !== undefined ? cube.plotNumber : null;
      }
    }
    
    return null;
  }, [maxDimensions]);
  
  // Função para gerar as caixas de colisão para todos os plots
  const generateCollisionBoxes = useCallback(() => {
    // Obter todos os cubos do componente pai
    const cubes = (window as any).__METAVERSE_CUBES__ || [];
    
    // Array para armazenar as caixas de colisão para visualização
    const visualCollisionBoxes: Array<{
      position: [number, number, number];
      size: [number, number, number];
      color: string;
    }> = [];
    
    // Gerar caixas de colisão para cada cubo
    cubes.forEach((cube: CubeData) => {
      // Obter as dimensões e posição do cubo
      const cubeX = cube.position[0] - maxDimensions.width / 2;
      const cubeY = cube.position[1];
      const cubeZ = cube.position[2] - maxDimensions.height / 2;
      const cubeSize = cube.size;
      
      // Criar a caixa de colisão para o cubo
      const min = new THREE.Vector3(
        cubeX - cubeSize / 2,
        cubeY - cubeSize / 2, // Ajustado para alinhar com a base do plot
        cubeZ - cubeSize / 2
      );
      
      const max = new THREE.Vector3(
        cubeX + cubeSize / 2,
        cubeY + cubeSize / 2, // Ajustado para manter a proporção correta
        cubeZ + cubeSize / 2
      );
      
      // Armazenar a caixa de colisão no cubo
      cube.collisionBox = { min, max };
      
      // Adicionar a caixa de colisão para visualização
      visualCollisionBoxes.push({
        position: [cubeX, cubeY, cubeZ], // Ajustado para alinhar com a base do plot
        size: [cubeSize, cubeSize, cubeSize],
        color: '#00ff00' // Verde para as caixas de colisão dos plots
      });
    });
    
    // Atualizar o estado das caixas de colisão para visualização
    setCollisionBoxes(visualCollisionBoxes);
    
    // Atualizar a variável global com os cubos atualizados
    (window as any).__METAVERSE_CUBES__ = cubes;
  }, [maxDimensions]);
  
  // Gerar as caixas de colisão quando o componente é montado
  useEffect(() => {
    generateCollisionBoxes();
    
    // Adicionar tecla para alternar a visualização das caixas de colisão
    const handleToggleCollisionBoxes = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c') {
        setShowCollisionBoxes(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleToggleCollisionBoxes);
    
    return () => {
      window.removeEventListener('keydown', handleToggleCollisionBoxes);
    };
  }, [generateCollisionBoxes]);
  
  // Função para verificar colisão entre a nave e os plots
  const checkCollisions = useCallback((position: THREE.Vector3): { collision: boolean, normal?: THREE.Vector3 } => {
    // Obter todos os cubos do componente pai
    const cubes = (window as any).__METAVERSE_CUBES__ || [];
    
    // Criar a caixa de colisão para a nave
    const shipMin = new THREE.Vector3(
      position.x - shipCollisionSize.width / 2,
      position.y - shipCollisionSize.height / 2,
      position.z - shipCollisionSize.depth / 2
    );
    
    const shipMax = new THREE.Vector3(
      position.x + shipCollisionSize.width / 2,
      position.y + shipCollisionSize.height / 2,
      position.z + shipCollisionSize.depth / 2
    );
    
    // Verificar colisão com cada cubo
    for (const cube of cubes) {
      // Pular se o cubo não tiver caixa de colisão
      if (!cube.collisionBox) continue;
      
      // Verificar colisão entre as caixas de colisão
      if (checkAABBCollision(shipMin, shipMax, cube.collisionBox.min, cube.collisionBox.max)) {
        // Calcular a normal da colisão (direção para afastar a nave do cubo)
        // Encontrar o ponto central da nave
        const shipCenter = new THREE.Vector3(
          (shipMin.x + shipMax.x) / 2,
          (shipMin.y + shipMax.y) / 2,
          (shipMin.z + shipMax.z) / 2
        );
        
        // Encontrar o ponto central do cubo
        const cubeCenter = new THREE.Vector3(
          (cube.collisionBox.min.x + cube.collisionBox.max.x) / 2,
          (cube.collisionBox.min.y + cube.collisionBox.max.y) / 2,
          (cube.collisionBox.min.z + cube.collisionBox.max.z) / 2
        );
        
        // Calcular a direção da normal (do cubo para a nave)
        const normal = new THREE.Vector3().subVectors(shipCenter, cubeCenter).normalize();
        
        return { collision: true, normal };
      }
    }
    
    return { collision: false };
  }, []);
  
  // Função para verificar se a próxima posição causará uma colisão
  const checkNextPositionCollision = useCallback((currentPosition: THREE.Vector3, nextPosition: THREE.Vector3): { 
    collision: boolean, 
    safePosition: THREE.Vector3,
    normal?: THREE.Vector3,
    collisionPoint?: THREE.Vector3
  } => {
    // Verificar colisão na próxima posição
    const collisionResult = checkCollisions(nextPosition);
    
    if (collisionResult.collision && collisionResult.normal) {
      // Calcular o ponto de colisão (aproximado)
      // Usamos a posição atual e a direção do movimento para estimar onde ocorreu a colisão
      const direction = new THREE.Vector3().subVectors(nextPosition, currentPosition).normalize();
      const distance = currentPosition.distanceTo(nextPosition);
      
      // Estimar o ponto de colisão como um ponto entre a posição atual e a próxima posição
      // Mais próximo da próxima posição para melhor precisão
      const collisionPoint = currentPosition.clone().add(
        direction.clone().multiplyScalar(distance * 0.9)
      );
      
      // Calcular uma posição segura (antes da colisão)
      // Mover a nave de volta na direção da normal da colisão
      const safePosition = nextPosition.clone().add(
        collisionResult.normal.clone().multiplyScalar(2.0) // Fator de segurança maior
      );
      
      // Garantir que a posição segura não esteja muito longe da posição atual
      // Isso evita "saltos" grandes quando há colisão
      const maxDistance = 5.0;
      const distanceToSafe = currentPosition.distanceTo(safePosition);
      
      if (distanceToSafe > maxDistance) {
        // Se a distância for muito grande, limitar a um valor máximo
        const direction = new THREE.Vector3().subVectors(safePosition, currentPosition).normalize();
        safePosition.copy(currentPosition.clone().add(direction.multiplyScalar(maxDistance)));
      }
      
      return { 
        collision: true, 
        safePosition: safePosition,
        normal: collisionResult.normal,
        collisionPoint: collisionPoint
      };
    }
    
    // Sem colisão, a próxima posição é segura
    return { 
      collision: false, 
      safePosition: nextPosition 
    };
  }, [checkCollisions]);
  
  // Função para calcular a resposta física à colisão
  const calculateCollisionResponse = useCallback((
    velocity: THREE.Vector3, 
    normal: THREE.Vector3,
    restitution: number = 0.3, // Coeficiente de restituição (elasticidade)
    friction: number = 0.7     // Coeficiente de fricção (deslizamento)
  ): THREE.Vector3 => {
    // 1. Calcular a velocidade de reflexão (rebote)
    // Reflexão = V - 2 * (V · N) * N, onde V é a velocidade e N é a normal
    const dot = velocity.dot(normal);
    
    // Componente da velocidade na direção da normal (perpendicular à superfície)
    const normalComponent = normal.clone().multiplyScalar(dot);
    
    // Componente da velocidade tangencial à superfície (paralela à superfície)
    const tangentialComponent = velocity.clone().sub(normalComponent);
    
    // Aplicar reflexão com amortecimento (restitution) na componente normal
    const reflectedNormal = normalComponent.clone().multiplyScalar(-restitution);
    
    // Aplicar fricção na componente tangencial (deslizamento)
    const reducedTangential = tangentialComponent.clone().multiplyScalar(friction);
    
    // Combinar as componentes para obter a velocidade resultante
    const resultVelocity = new THREE.Vector3().addVectors(reflectedNormal, reducedTangential);
    
    return resultVelocity;
  }, []);
  
  // Função para posicionar a câmera atrás da nave
  const positionCameraBehindShip = useCallback((shipPosition: THREE.Vector3, shipDirection?: THREE.Vector3) => {
    if (!controlsRef.current) return;
    
    // Não modificamos a posição da câmera diretamente, apenas atualizamos o alvo
    // para que a câmera continue olhando para a nave
    
    // Definir o alvo dos controles para a posição da nave
    controlsRef.current.target.copy(shipPosition);
    
  }, []);
  
  // Initialize controls
  useEffect(() => {
    if (controlsRef.current) {
      // Configurar a câmera para seguir a nave com distâncias adequadas para o mapa maior
      controlsRef.current.minDistance = 20;
      controlsRef.current.maxDistance = 200;
      
      // Habilitar rotação para permitir o uso do mouse
      controlsRef.current.enableRotate = true;
      
      // Limitar a rotação vertical para manter uma visão mais horizontal
      controlsRef.current.minPolarAngle = Math.PI * 0.2; // Reduzido para permitir olhar mais para cima
      controlsRef.current.maxPolarAngle = Math.PI * 0.85; // Aumentado para permitir olhar mais para baixo
      
      // Ajustar a velocidade de rotação
      controlsRef.current.rotateSpeed = 0.6; // Aumentado para rotação mais responsiva
      
      // Posicionar a câmera inicialmente atrás da nave
      if (playerPositionRef.current) {
        // Direção inicial fixa (olhando para o mapa)
        const initialDirection = new THREE.Vector3(1, 0, 0).normalize();
        
        // Calcular a posição inicial da câmera
        const initialCameraPos = new THREE.Vector3(
          playerPositionRef.current.x - initialDirection.x * cameraDistance * 0.5, // Reduzido o fator de 0.6 para 0.5
          playerPositionRef.current.y + 15, // Reduzido para ficar mais próximo da nave
          playerPositionRef.current.z - initialDirection.z * cameraDistance * 0.5 // Reduzido o fator de 0.6 para 0.5
        );
        
        // Definir a posição da câmera
        camera.position.copy(initialCameraPos);
        
        // Definir o alvo dos controles para a posição da nave
        controlsRef.current.target.copy(playerPositionRef.current);
      }
    }
  }, [camera, cameraDistance]);

  // Handle camera target changes
  useEffect(() => {
    if (!cameraTarget || !controlsRef.current) return;
    
    // Mark as animating
    isAnimating.current = true;
    
    // Target position for the controls
    const targetPosition = new THREE.Vector3(cameraTarget[0], cameraTarget[1], cameraTarget[2]);
    
    // Atualizar a posição do jogador para a nova posição alvo
    setPlayerPosition(targetPosition.clone());
    playerPositionRef.current.copy(targetPosition);
    
    // Direção inicial fixa (olhando para o mapa)
    const initialDirection = new THREE.Vector3(1, 0, 0).normalize();
    
    // Calcular a posição inicial da câmera
    const initialCameraPos = new THREE.Vector3(
      targetPosition.x - initialDirection.x * cameraDistance * 0.5, // Reduzido o fator de 0.6 para 0.5
      targetPosition.y + 15, // Reduzido para ficar mais próximo da nave
      targetPosition.z - initialDirection.z * cameraDistance * 0.5 // Reduzido o fator de 0.6 para 0.5
    );
    
    // Definir a posição da câmera
    camera.position.copy(initialCameraPos);
    
    // Definir o alvo dos controles para a posição da nave
    controlsRef.current.target.copy(targetPosition);
    
    // Animar suavemente a transição
    gsap.to(camera.position, {
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => {
        isAnimating.current = false;
      }
    });
    
    // Verificar sobre qual parcela a nave está inicialmente
    const initialPlot = checkCurrentPlot(targetPosition);
    if (initialPlot !== null && onPlotChange) {
      onPlotChange(initialPlot);
    }
    
  }, [cameraTarget, camera, cameraDistance, checkCurrentPlot, onPlotChange]);
  
  // Adicionar controles de teclado para movimentação
  useEffect(() => {
    // Função para registrar teclas pressionadas
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      
      // Compartilhar globalmente para o componente Spaceship
      window.__GLOBAL_KEYS_PRESSED__ = keysPressed.current;
      
      // Verificar se alguma tecla de movimento está pressionada
      const movementKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'e', ' ', 'shift', 'control'];
      isKeyboardMoving.current = Array.from(keysPressed.current).some(key => movementKeys.includes(key));
      
      // Tecla para alternar a visualização das caixas de colisão (desativado)
      /*
      if (e.key === 'c') {
        toggleCollisionBoxes();
      }
      */
    };
    
    // Função para registrar teclas liberadas
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
      
      // Compartilhar globalmente para o componente Spaceship
      window.__GLOBAL_KEYS_PRESSED__ = keysPressed.current;
      
      // Verificar se alguma tecla de movimento ainda está pressionada
      const movementKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'e', ' ', 'shift', 'control'];
      isKeyboardMoving.current = Array.from(keysPressed.current).some(key => movementKeys.includes(key));
      
      // Se não houver mais teclas de movimento pressionadas, zerar a última direção
      if (!isKeyboardMoving.current) {
        lastMoveDirection.current.set(0, 0, 0);
      }
    };
    
    // Adicionar event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Remover event listeners ao desmontar
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Atualizar a posição da nave a cada frame
  useFrame((state, delta) => {
    if (!controlsRef.current) return;
    
    // Atualizar o estado das teclas pressionadas a partir da variável global
    if (window.__GLOBAL_KEYS_PRESSED__) {
      keysPressed.current = window.__GLOBAL_KEYS_PRESSED__;
      isKeyboardMoving.current = keysPressed.current.size > 0;
    }
    
    // Verificar sobre qual parcela a nave está
    const plotNumber = checkCurrentPlot(playerPositionRef.current);
    if (plotNumber !== currentPlotNumber) {
      setCurrentPlotNumber(plotNumber);
      if (onPlotChange) {
        onPlotChange(plotNumber);
      }
    }
    
    // Calcular movimento baseado no teclado
    if (isKeyboardMoving.current) {
      const moveDirection = new THREE.Vector3(0, 0, 0);
      
      // Obter a direção da câmera para movimento relativo
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      
      // Normalizar a direção horizontal (ignorar componente Y)
      const horizontalDirection = new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
      
      // Vetor perpendicular à direção da câmera (para movimento lateral)
      const cameraSide = new THREE.Vector3(-horizontalDirection.z, 0, horizontalDirection.x);
      
      // Verificar se a tecla Shift está pressionada para aumentar a velocidade
      const speedMultiplier = keysPressed.current.has('shift') ? 1.5 : 1.0; // Diminuído em 2x (de 3.0 para 1.5)
      
      // Teclas WASD para movimento relativo à câmera
      if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
        // Movimento para frente na direção da câmera
        moveDirection.add(horizontalDirection.clone().multiplyScalar(playerSpeed * speedMultiplier));
      }
      if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
        // Movimento para trás na direção oposta à câmera
        moveDirection.add(horizontalDirection.clone().multiplyScalar(-playerSpeed * speedMultiplier));
      }
      if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
        // Movimento para a esquerda em relação à câmera
        moveDirection.add(cameraSide.clone().multiplyScalar(-playerSpeed * speedMultiplier));
      }
      if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
        // Movimento para a direita em relação à câmera
        moveDirection.add(cameraSide.clone().multiplyScalar(playerSpeed * speedMultiplier));
      }
      
      // Teclas para movimento vertical
      if (keysPressed.current.has('e') || keysPressed.current.has(' ')) {
        moveDirection.y += playerSpeed * speedMultiplier;
      }
      if (keysPressed.current.has('control')) {
        moveDirection.y -= playerSpeed * speedMultiplier;
      }
      
      // Se houver movimento pelo teclado
      if (moveDirection.length() > 0) {
        // Normalizar a direção de movimento
        moveDirection.normalize();
        
        // Suavizar a direção de movimento
        lastMoveDirection.current.lerp(moveDirection, smoothingFactor);
        
        // Aplicar aceleração gradual à velocidade atual
        currentVelocity.current.lerp(
          lastMoveDirection.current.clone().multiplyScalar(playerSpeed * speedMultiplier),
          accelerationFactor
        );
        
        // Calcular a nova posição do jogador
        const newPlayerPosition = playerPositionRef.current.clone().add(currentVelocity.current);
        
        // Verificar colisão na nova posição e obter uma posição segura
        const collisionCheck = checkNextPositionCollision(playerPositionRef.current, newPlayerPosition);
        
        if (collisionCheck.collision) {
          // Colisão detectada, usar a posição segura
          setIsColliding(true);
          
          // Atualizar a velocidade para refletir na direção da normal com física simplificada
          if (collisionCheck.normal) {
            // Calcular a resposta física à colisão
            const newVelocity = calculateCollisionResponse(
              currentVelocity.current,
              collisionCheck.normal,
              0.3,  // Elasticidade moderada
              0.7   // Fricção moderada para permitir deslizamento
            );
            
            // Atualizar a velocidade atual com a resposta física
            currentVelocity.current.copy(newVelocity);
          } else {
            // Se não tiver normal, apenas parar o movimento
            currentVelocity.current.set(0, 0, 0);
          }
          
          // Limitar a posição dentro dos limites do mapa
          collisionCheck.safePosition.x = Math.max(-maxDimensions.width, Math.min(maxDimensions.width, collisionCheck.safePosition.x));
          collisionCheck.safePosition.y = Math.max(1, Math.min(maxDimensions.width, collisionCheck.safePosition.y));
          collisionCheck.safePosition.z = Math.max(-maxDimensions.height, Math.min(maxDimensions.height, collisionCheck.safePosition.z));
          
          // Atualizar a posição do jogador para a posição segura
          setPlayerPosition(collisionCheck.safePosition);
          playerPositionRef.current.copy(collisionCheck.safePosition);
          
          // Atualizar o alvo dos controles para a posição da nave
          controlsRef.current.target.copy(collisionCheck.safePosition);
        } else {
          // Sem colisão, movimento normal
          setIsColliding(false);
          
          // Limitar a posição dentro dos limites do mapa
          newPlayerPosition.x = Math.max(-maxDimensions.width, Math.min(maxDimensions.width, newPlayerPosition.x));
          newPlayerPosition.y = Math.max(1, Math.min(maxDimensions.width, newPlayerPosition.y));
          newPlayerPosition.z = Math.max(-maxDimensions.height, Math.min(maxDimensions.height, newPlayerPosition.z));
          
          // Atualizar a posição do jogador
          setPlayerPosition(newPlayerPosition);
          playerPositionRef.current.copy(newPlayerPosition);
          
          // Atualizar o alvo dos controles para a posição da nave
          controlsRef.current.target.copy(newPlayerPosition);
        }
        
        // Ativar o efeito de movimento da nave
        setIsShipMoving(true);
      } else {
        // Desacelerar suavemente quando não há entrada de teclado
        currentVelocity.current.multiplyScalar(decelerationFactor);
        
        if (currentVelocity.current.length() > 0.01) {
          // Continuar o movimento com desaceleração
          const newPlayerPosition = playerPositionRef.current.clone().add(currentVelocity.current);
          
          // Verificar colisão na nova posição e obter uma posição segura
          const collisionCheck = checkNextPositionCollision(playerPositionRef.current, newPlayerPosition);
          
          if (collisionCheck.collision) {
            // Colisão detectada, usar a posição segura
            setIsColliding(true);
            
            // Parar o movimento ao colidir durante a desaceleração
            currentVelocity.current.set(0, 0, 0);
            
            // Atualizar a posição do jogador para a posição segura
            setPlayerPosition(collisionCheck.safePosition);
            playerPositionRef.current.copy(collisionCheck.safePosition);
            
            // Atualizar o alvo dos controles para a posição da nave
            controlsRef.current.target.copy(collisionCheck.safePosition);
          } else {
            // Sem colisão, movimento normal com desaceleração
            setIsColliding(false);
            
            // Limitar a posição dentro dos limites do mapa
            newPlayerPosition.x = Math.max(-maxDimensions.width, Math.min(maxDimensions.width, newPlayerPosition.x));
            newPlayerPosition.y = Math.max(1, Math.min(maxDimensions.width, newPlayerPosition.y));
            newPlayerPosition.z = Math.max(-maxDimensions.height, Math.min(maxDimensions.height, newPlayerPosition.z));
            
            // Atualizar a posição do jogador
            setPlayerPosition(newPlayerPosition);
            playerPositionRef.current.copy(newPlayerPosition);
            
            // Atualizar o alvo dos controles para a posição da nave
            controlsRef.current.target.copy(newPlayerPosition);
          }
          
          setIsShipMoving(true);
        } else {
          // Parar completamente quando a velocidade é muito baixa
          currentVelocity.current.set(0, 0, 0);
          setIsShipMoving(false);
        }
        
        // Desativar o efeito de colisão
        setIsColliding(false);
      }
    } else {
      // Desacelerar suavemente quando não há entrada de teclado
      currentVelocity.current.multiplyScalar(decelerationFactor);
      
      if (currentVelocity.current.length() > 0.01) {
        // Continuar o movimento com desaceleração
        const newPlayerPosition = playerPositionRef.current.clone().add(currentVelocity.current);
        
        // Verificar colisão na nova posição e obter uma posição segura
        const collisionCheck = checkNextPositionCollision(playerPositionRef.current, newPlayerPosition);
        
        if (collisionCheck.collision) {
          // Colisão detectada, usar a posição segura
          setIsColliding(true);
          
          // Parar o movimento ao colidir durante a desaceleração
          currentVelocity.current.set(0, 0, 0);
          
          // Atualizar a posição do jogador para a posição segura
          setPlayerPosition(collisionCheck.safePosition);
          playerPositionRef.current.copy(collisionCheck.safePosition);
          
          // Atualizar o alvo dos controles para a posição da nave
          controlsRef.current.target.copy(collisionCheck.safePosition);
        } else {
          // Sem colisão, movimento normal com desaceleração
          setIsColliding(false);
          
          // Limitar a posição dentro dos limites do mapa
          newPlayerPosition.x = Math.max(-maxDimensions.width, Math.min(maxDimensions.width, newPlayerPosition.x));
          newPlayerPosition.y = Math.max(1, Math.min(maxDimensions.width, newPlayerPosition.y));
          newPlayerPosition.z = Math.max(-maxDimensions.height, Math.min(maxDimensions.height, newPlayerPosition.z));
          
          // Atualizar a posição do jogador
          setPlayerPosition(newPlayerPosition);
          playerPositionRef.current.copy(newPlayerPosition);
          
          // Atualizar o alvo dos controles para a posição da nave
          controlsRef.current.target.copy(newPlayerPosition);
        }
        
        setIsShipMoving(true);
      } else {
        // Parar completamente quando a velocidade é muito baixa
        currentVelocity.current.set(0, 0, 0);
        setIsShipMoving(false);
      }
      
      // Desativar o efeito de colisão
      setIsColliding(false);
    }
  });
  
  // Calcular a rotação da nave com base na direção do movimento
  const getShipRotation = (): [number, number, number] => {
    // Se a nave estiver se movendo, usar a direção do movimento
    if (lastMoveDirection.current.length() > 0.01) {
      // Normalizar a direção do movimento
      const direction = lastMoveDirection.current.clone().normalize();
      
      // Calcular o ângulo de rotação no eixo Y (yaw)
      const yaw = Math.atan2(direction.x, direction.z);
      
      return [0, yaw, 0];
    } else {
      // Se a nave não estiver se movendo, usar a direção fixa olhando para o mapa
      const direction = new THREE.Vector3(1, 0, 0).normalize();
      
      // Calcular o ângulo de rotação no eixo Y (yaw)
      const yaw = Math.atan2(direction.x, direction.z);
      
      return [0, yaw, 0];
    }
  };
  
  // Função para alternar a visualização das caixas de colisão
  const toggleCollisionBoxes = useCallback(() => {
    // Desabilitado - não mostra mais caixas de colisão
    // setShowCollisionBoxes(prev => !prev);
  }, []);
  
  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        screenSpacePanning={false}
        minDistance={10}
        maxDistance={300}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.85}
        enableZoom={true}
        enablePan={false}
        enableRotate={true} // Habilitar rotação para permitir o uso do mouse
        rotateSpeed={0.6} // Velocidade de rotação aumentada para movimento mais responsivo
      />
      
      <Spaceship 
        position={[playerPosition.x, playerPosition.y, playerPosition.z]} 
        rotation={getShipRotation()}
        isMoving={isShipMoving}
        isColliding={isColliding}
      />
      
      {/* Renderizar as caixas de colisão (apenas durante o desenvolvimento) */}
      {showCollisionBoxes && collisionBoxes.map((box, index) => (
        <mesh
          key={`collision-box-${index}`}
          position={box.position}
          scale={box.size}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={box.color}
            wireframe={true}
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      ))}
      
      {/* Renderizar a caixa de colisão da nave (apenas durante o desenvolvimento) */}
      {showCollisionBoxes && (
        <mesh
          position={[playerPosition.x, playerPosition.y, playerPosition.z]}
          scale={[shipCollisionSize.width, shipCollisionSize.height, shipCollisionSize.depth]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color="#ff0000" // Vermelho para a caixa de colisão da nave
            wireframe={true}
            transparent={true}
            opacity={0.5}
          />
        </mesh>
      )}
    </>
  );
}

// BuildingCube component to render each cube with animation
function BuildingCube({ data, index, isHighlighted = false }: { 
  data: CubeData, 
  index: number, 
  isHighlighted?: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const { camera } = useThree();
  
  // Altura fixa para todos os blocos
  const fixedHeight = data.size;
  
  // Efeito para definir a posição inicial do bloco
  useEffect(() => {
    if (!meshRef.current) return;
    
    // Definir a escala do bloco
    meshRef.current.scale.y = fixedHeight;
    
    // Atualizar a posição para manter a base no nível do solo
    meshRef.current.position.y = fixedHeight / 2;
  }, [fixedHeight]);

  return (
    <group>
      {/* Highlight effect for selected plot */}
      {isHighlighted && (
        <mesh
          position={[data.position[0], fixedHeight / 2, data.position[2]]}
          scale={[data.size * 1.1, fixedHeight * 1.1, data.size * 1.1]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color="#ffff00"
            wireframe={true}
            transparent={true}
            opacity={0.5}
          />
        </mesh>
      )}
      
      <mesh
        ref={meshRef}
        position={[data.position[0], fixedHeight / 2, data.position[2]]}
        scale={[data.size, fixedHeight, data.size]}
        onClick={() => setClicked(!clicked)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={isHighlighted ? '#ffff00' : data.color} 
          metalness={0.2}
          roughness={0.6}
          emissive={isHighlighted ? '#ffff00' : (clicked ? data.color : data.color)}
          emissiveIntensity={isHighlighted ? 1.5 : (clicked ? 0.5 : 0.2)}
          wireframe={false}
        />
      </mesh>
      
      {/* Adiciona um wireframe sobreposto ao bloco quando hover ou highlight, mantendo o bloco 3D visível */}
      {(hovered || isHighlighted) && (
        <mesh
          position={[data.position[0], fixedHeight / 2, data.position[2]]}
          scale={[data.size, fixedHeight, data.size]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={isHighlighted ? '#ffff00' : '#ffffff'}
            wireframe={true}
            transparent={true}
            opacity={0.7}
          />
        </mesh>
      )}
    </group>
  );
}