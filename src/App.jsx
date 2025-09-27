import { useMemo, useState } from 'react';
import './App.css';

const DEFAULT_DIMENSIONS = {
  width: 150,
  height: 100,
  depth: 120,
};

const RATE_PER_CUBIC_CM = 0.08;
const MIN_ORDER_TOTAL = 45;
const MM3_TO_CM3 = 1 / 1000;
const MM2_TO_CM2 = 1 / 100;

const formatNumber = (value) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);

function dimensionSummary({ width, height, depth }) {
  const volumeMm3 = width * height * depth;
  const surfaceAreaMm2 = 2 * (width * height + width * depth + height * depth);

  const volumeCm3 = volumeMm3 * MM3_TO_CM3;
  const surfaceAreaCm2 = surfaceAreaMm2 * MM2_TO_CM2;
  const price = Math.max(volumeCm3 * RATE_PER_CUBIC_CM, MIN_ORDER_TOTAL);

  return {
    volume: volumeCm3,
    surfaceArea: surfaceAreaCm2,
    price,
  };
}

export default function App() {
  const [dimensions, setDimensions] = useState(DEFAULT_DIMENSIONS);

  const { width, height, depth } = dimensions;
  const summary = useMemo(() => dimensionSummary(dimensions), [dimensions]);

  const handleChange = (key) => (event) => {
    const nextValue = Number(event.target.value);
    setDimensions((current) => ({
      ...current,
      [key]: Number.isFinite(nextValue) ? nextValue : 0,
    }));
  };

  const isValid = width > 0 && height > 0 && depth > 0;

  return (
    <div className="app">
      <section className="card">
        <header>
          <h1>Acrylic 3D Designer</h1>
          <p>
            Configure a custom acrylic enclosure by entering the exact dimensions
            in millimetres. We will simulate the volume, estimate material usage,
            and prepare it for checkout.
          </p>
        </header>

        <div className="preview" aria-hidden="true">
          <div
            className="preview-box"
            style={{
              transform: `rotateX(${12 + height / 500}deg) rotateY(${-18 + width / 600}deg)`
                + ` scale(${1 + depth / 2000})`,
            }}
          />
          <div className="preview-dimensions">
            <span>W: {formatNumber(width)} mm</span>
            <span>H: {formatNumber(height)} mm</span>
            <span>D: {formatNumber(depth)} mm</span>
          </div>
        </div>

        <form className="form-grid" aria-label="Acrylic dimensions">
          {[{ key: 'width', label: 'Width', helper: 'Left to right span' },
            { key: 'height', label: 'Height', helper: 'Base to top' },
            { key: 'depth', label: 'Depth', helper: 'Front to back' }].map(
            ({ key, label, helper }) => (
              <label key={key} className="label">
                {label} (mm)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={dimensions[key]}
                  onChange={handleChange(key)}
                  inputMode="numeric"
                  aria-describedby={`${key}-helper`}
                />
                <small id={`${key}-helper`}>{helper}</small>
              </label>
            )
          )}
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
