import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BoxGeometry, EdgesGeometry } from 'three';
import './App.css';

const DEFAULT_DIMENSIONS = {
  width: 15,
  height: 10,
  depth: 12,
};

const DIMENSION_FIELDS = [
  {
    key: 'width',
    label: 'Width',
    helper: 'Left to right span',
    min: 5,
    max: 60,
  },
  {
    key: 'height',
    label: 'Height',
    helper: 'Base to top',
    min: 5,
    max: 40,
  },
  {
    key: 'depth',
    label: 'Depth',
    helper: 'Front to back',
    min: 5,
    max: 60,
  },
];

const RATE_PER_CUBIC_CM = 0.08;
const MIN_ORDER_TOTAL = 45;

const formatNumber = (value) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);

function dimensionSummary({ width, height, depth }) {
  const volume = width * height * depth;
  const surfaceArea = 2 * (width * height + width * depth + height * depth);
  const price = Math.max(volume * RATE_PER_CUBIC_CM, MIN_ORDER_TOTAL);

  return {
    volume,
    surfaceArea,
    price,
  };
}

export default function App() {
  const [dimensions, setDimensions] = useState(DEFAULT_DIMENSIONS);

  const { width, height, depth } = dimensions;
  const summary = useMemo(() => dimensionSummary(dimensions), [dimensions]);
  const previewTarget = useMemo(
    () => [0, BASE_HEIGHT + (Math.max(height, 0.1) * PREVIEW_SCALE) / 2, 0],
    [height]
  );

  const setDimensionValue = (key, rawValue) => {
    const nextValue = Number(rawValue);
    setDimensions((current) => ({
      ...current,
      [key]: Number.isFinite(nextValue) ? nextValue : 0,
    }));
  };

  const handleInputChange = (key) => (event) => {
    setDimensionValue(key, event.target.value);
  };

  const handleSliderChange = (key) => (event) => {
    setDimensionValue(key, event.target.value);
  };

  const isValid = width > 0 && height > 0 && depth > 0;

  return (
    <div className="app">
      <section className="card">
        <header>
          <h1>Acrylic 3D Designer</h1>
          <p>
            Configure a custom acrylic enclosure by entering the exact dimensions
            in centimetres. We will simulate the volume, estimate material usage,
            and prepare it for checkout.
          </p>
        </header>

        <div className="preview" aria-hidden="true">
          <Canvas
            className="preview-canvas"
            shadows
            camera={{ position: [5.5, 4.5, 6.25], fov: 40 }}
          >
            <color attach="background" args={[0xe2e8f0]} />
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[6, 8, 6]}
              intensity={0.95}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <spotLight
              position={[-4, 6.5, -3]}
              angle={0.6}
              intensity={0.45}
              penumbra={0.5}
            />
            <PreviewScene width={width} height={height} depth={depth} />
            <OrbitControls
              enablePan={false}
              minDistance={4}
              maxDistance={15}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={(Math.PI * 5) / 6}
              target={previewTarget}
            />
          </Canvas>
          <div className="preview-dimensions">
            <span>W: {formatNumber(width)} cm</span>
            <span>H: {formatNumber(height)} cm</span>
            <span>D: {formatNumber(depth)} cm</span>
          </div>
        </div>

        <form className="form-grid" aria-label="Acrylic dimensions">
          {DIMENSION_FIELDS.map(({ key, label, helper, min, max }) => {
            const clampedValue = Math.min(Math.max(dimensions[key], min), max);
            const sliderRange = Math.max(max - min, 0.0001);
            const sliderProgress = ((clampedValue - min) / sliderRange) * 100;
            const sliderGradient =
              `linear-gradient(90deg, #2563eb 0%, #2563eb ${sliderProgress}%, ` +
              `rgba(148, 163, 184, 0.35) ${sliderProgress}%, rgba(148, 163, 184, 0.35) 100%)`;

            return (
              <fieldset key={key} className="dimension-field">
                <legend className="dimension-label">
                  <span>{label} (cm)</span>
                  <span className="dimension-value">{formatNumber(dimensions[key])}</span>
                </legend>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step="0.1"
                  value={clampedValue}
                  onChange={handleSliderChange(key)}
                  aria-describedby={`${key}-helper`}
                  style={{ background: sliderGradient }}
                />
                <div className="dimension-input-row">
                  <input
                    type="number"
                    min={min}
                    max={max}
                    step="0.1"
                    value={dimensions[key]}
                    onChange={handleInputChange(key)}
                    inputMode="decimal"
                    aria-describedby={`${key}-helper`}
                  />
                  <small id={`${key}-helper`}>{helper}</small>
                </div>
              </fieldset>
            );
          })}
        </form>

        <section className="summary" aria-live="polite">
          <h2>Project Summary</h2>
          <div className="summary-data">
            <span>
              <strong>Volume</strong>
              <span>{formatNumber(summary.volume)} cm³</span>
            </span>
            <span>
              <strong>Surface area</strong>
              <span>{formatNumber(summary.surfaceArea)} cm²</span>
            </span>
            <span>
              <strong>Estimated total</strong>
              <span>${formatNumber(summary.price)}</span>
            </span>
          </div>
        </section>

        <div className="checkout">
          <button type="button" disabled={!isValid}>
            Proceed to checkout
          </button>
          {!isValid && <small>Enter positive dimensions to continue.</small>}
          {isValid && (
            <small>
              Estimates include finishing and fabrication. The final quote will
              be confirmed at checkout.
            </small>
          )}
        </div>
      </section>
    </div>
  );
}

const PREVIEW_SCALE = 0.1;
const BASE_HEIGHT = 0.2;

function PreviewScene({ width, height, depth }) {
  const scaled = useMemo(
    () => ({
      width: Math.max(width, 0.1) * PREVIEW_SCALE,
      height: Math.max(height, 0.1) * PREVIEW_SCALE,
      depth: Math.max(depth, 0.1) * PREVIEW_SCALE,
    }),
    [width, height, depth]
  );

  return (
    <group position={[0, -0.4, 0]} rotation={[0.25, 0.6, 0]}>
      <Base width={scaled.width} depth={scaled.depth} />
      <AcrylicEnclosure dimensions={scaled} />
      <MockFigure dimensions={scaled} />
    </group>
  );
}

function Base({ width, depth }) {
  const baseWidth = width + 0.6;
  const baseDepth = depth + 0.6;

  return (
    <mesh position={[0, BASE_HEIGHT / 2, 0]} receiveShadow castShadow>
      <boxGeometry args={[baseWidth, BASE_HEIGHT, baseDepth]} />
      <meshStandardMaterial color="#facc15" roughness={0.7} metalness={0.05} />
    </mesh>
  );
}

function AcrylicEnclosure({ dimensions }) {
  const { width, height, depth } = dimensions;
  const geometry = useMemo(
    () => new BoxGeometry(width, height, depth),
    [width, height, depth]
  );
  const edges = useMemo(() => new EdgesGeometry(geometry), [geometry]);

  useEffect(
    () => () => {
      geometry.dispose();
      edges.dispose();
    },
    [geometry, edges]
  );

  return (
    <group position={[0, BASE_HEIGHT + height / 2, 0]}
    >
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial
          color="#60a5fa"
          transparent
          opacity={0.18}
          roughness={0.2}
          metalness={0.1}
          clearcoat={0.9}
          clearcoatRoughness={0.2}
          transmission={0.95}
          thickness={0.6}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#2563eb" linewidth={1} />
      </lineSegments>
    </group>
  );
}

function MockFigure({ dimensions }) {
  const { height, width, depth } = dimensions;
  const bodyHeight = height * 0.55;
  const bodyRadius = Math.min(width, depth) * 0.23;
  const headRadius = bodyRadius * 0.85;
  const figureBaseY = BASE_HEIGHT;

  return (
    <group position={[0, figureBaseY, 0]}>
      <mesh position={[0, bodyHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[bodyRadius * 0.9, bodyRadius * 1.05, bodyHeight, 36]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[0, bodyHeight + headRadius, 0]} castShadow>
        <sphereGeometry args={[headRadius, 32, 32]} />
        <meshStandardMaterial color="#fca5a5" roughness={0.6} />
      </mesh>
      <mesh position={[0, bodyHeight + headRadius * 2.1, 0]} castShadow>
        <coneGeometry args={[headRadius * 1.05, headRadius * 1.6, 6]} />
        <meshStandardMaterial color="#ef4444" roughness={0.25} metalness={0.4} />
      </mesh>
      <MockFigureOrnaments
        radius={headRadius * 0.45}
        height={bodyHeight + headRadius * 2.7}
      />
      <mesh position={[0, 0.02, 0]} rotation={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[bodyRadius * 1.15, bodyRadius * 1.4, 0.04, 32]} />
        <meshStandardMaterial color="#f97316" roughness={0.65} />
      </mesh>
    </group>
  );
}

function MockFigureOrnaments({ radius, height }) {
  const spherePositions = useMemo(
    () => [
      [radius, height, 0],
      [-radius, height, 0],
      [0, height, radius],
      [0, height, -radius],
      [0, height + radius * 0.75, 0],
    ],
    [radius, height]
  );

  const colors = ['#fbbf24', '#38bdf8', '#fb7185', '#22d3ee', '#a855f7'];

  return (
    <group>
      {spherePositions.map((position, index) => (
        <mesh key={index} position={position} castShadow>
          <sphereGeometry args={[radius * 0.55, 24, 24]} />
          <meshStandardMaterial
            color={colors[index % colors.length]}
            roughness={0.35}
            metalness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
