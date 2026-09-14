import React, { useRef, useState, useEffect } from 'react';

function MicrobialDrawingPad({ onInoculate }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const [brushColor, setBrushColor] = useState('#2E7D32');
  const [brushSize, setBrushSize] = useState(16);

  const brushColorRef = useRef(brushColor);
  const brushSizeRef = useRef(brushSize);

  useEffect(() => {
    brushColorRef.current = brushColor;
    brushSizeRef.current = brushSize;
  }, [brushColor, brushSize]);

  // Set up canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#F4F6F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCanvasPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Only respond to primary finger/mouse/stylus
    if (event.isPrimary === false) return;

    event.preventDefault();

    // Keep receiving movement even if finger moves slightly
    // outside the canvas.
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (error) {
      // Some older browsers may not support pointer capture.
    }

    const ctx = canvas.getContext('2d');
    const point = getCanvasPosition(event);

    isDrawingRef.current = true;
    lastPointRef.current = point;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);

    ctx.strokeStyle = brushColorRef.current;
    ctx.lineWidth = brushSizeRef.current;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Make a dot when the user simply taps
    ctx.beginPath();
    ctx.arc(
      point.x,
      point.y,
      brushSizeRef.current / 2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = brushColorRef.current;
    ctx.fill();

    lastPointRef.current = point;
  };

  const handlePointerMove = (event) => {
    if (!isDrawingRef.current) return;
    if (event.isPrimary === false) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const point = getCanvasPosition(event);
    const lastPoint = lastPointRef.current;

    if (!lastPoint) {
      lastPointRef.current = point;
      return;
    }

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);

    ctx.strokeStyle = brushColorRef.current;
    ctx.lineWidth = brushSizeRef.current;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPointRef.current = point;
  };

  const stopDrawing = (event) => {
    if (event) {
      event.preventDefault();

      const canvas = canvasRef.current;

      if (canvas) {
        try {
          canvas.releasePointerCapture(event.pointerId);
        } catch (error) {
          // Pointer capture may already have been released.
        }
      }
    }

    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#F4F6F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleInoculateClick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');

    onInoculate(dataUrl, brushSize);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        width: '100%'
      }}
    >
      <canvas
        ref={canvasRef}
        width={260}
        height={260}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        onPointerLeave={(event) => {
          // Do NOT stop drawing here.
          // Pointer capture keeps drawing alive on mobile.
        }}
        style={{
          width: '260px',
          height: '260px',
          maxWidth: '90vw',
          aspectRatio: '1 / 1',

          border: '2px solid #1B4D3E',
          borderRadius: '50%',
          backgroundColor: '#F4F6F6',

          cursor: 'crosshair',

          // CRITICAL FOR MOBILE
          touchAction: 'none',

          // Prevent browser selection/drag behaviour
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',

          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)'
        }}
      />

      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          style={{
            width: '36px',
            height: '36px',
            border: 'none',
            cursor: 'pointer',
            background: 'none'
          }}
          title="Colony Pigment Color"
        />

        <select
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          style={{
            padding: '6px',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            fontSize: '12px'
          }}
        >
          <option value={10}>Fine Point</option>
          <option value={16}>Standard Colony</option>
          <option value={26}>Large Mucoid</option>
        </select>

        <button
          onClick={clearCanvas}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: '#E2E8F0',
            color: '#334155'
          }}
        >
          Clear
        </button>

        <button
          onClick={handleInoculateClick}
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            backgroundColor: '#1B4D3E',
            color: '#FFF'
          }}
        >
          Inoculate Custom
        </button>
      </div>
    </div>
  );
}

export default MicrobialDrawingPad;