import React, { useRef, useState, useEffect } from 'react';

const MicrobialDrawingPad = ({ onInoculate }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#E74C3C');

  // Setup local drawing canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Coordinate helper for both Mouse & Mobile Touch events
  const getCoords = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoords(e, canvas);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.touches) e.preventDefault(); // Prevent touch scroll on mobile
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoords(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Pass drawing data back up to main app state
  const handleInoculate = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    if (onInoculate) {
      onInoculate(imageData, color);
    }
    clearCanvas();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-start' }}>
      <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
        3. DRAW CUSTOM SPECIMEN:
      </h3>
      
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        {/* Color Palette Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['#E74C3C', '#E67E22', '#F1C40F', '#3498DB', '#2ECC71'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: c,
                border: color === c ? '3px solid #333' : 'none',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>

        {/* Mobile & Mouse Friendly Custom Canvas */}
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={200}
            height={160}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              border: '2px dashed #666',
              borderRadius: '8px',
              backgroundColor: '#FAF9F6',
              cursor: 'crosshair',
              touchAction: 'none'
            }}
          />
          <button
            type="button"
            onClick={clearCanvas}
            style={{ position: 'absolute', top: 5, right: 5, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ↺
          </button>
        </div>
      </div>

      <p style={{ fontSize: '11px', color: '#666', margin: 0, fontFamily: 'monospace' }}>
        DRAW SPECIMEN, THEN TAP ANYWHERE ON THE DISH TO INOCULATE!
      </p>

      <button
        type="button"
        onClick={handleInoculate}
        style={{
          padding: '10px 20px',
          fontSize: '13px',
          fontWeight: 'bold',
          borderRadius: '20px',
          border: '2px solid #2C3E50',
          backgroundColor: '#FFF',
          cursor: 'pointer',
          boxShadow: '2px 2px 0px #2C3E50',
          fontFamily: 'monospace'
        }}
      >
        INOCULATE & SHARE GLOBALLY
      </button>
    </div>
  );
};

export default MicrobialDrawingPad;