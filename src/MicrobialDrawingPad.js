import React, { useRef, useState, useEffect } from 'react';

function MicrobialDrawingPad({ onInoculate }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#2E7D32'); // Default green colony
  const [brushSize, setBrushSize] = useState(16);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#F4F6F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (e.cancelable) e.preventDefault(); // Prevents page scrolling on mobile
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (e && e.cancelable) e.preventDefault();
    setIsDrawing(false);
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <canvas
        ref={canvasRef}
        width={260}
        height={260}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
        style={{
          border: '2px solid #1B4D3E',
          borderRadius: '50%',
          backgroundColor: '#F4F6F6',
          cursor: 'crosshair',
          touchAction: 'none', // Crucial: disables mobile pinch-zoom and scroll gestures on the canvas
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)'
        }}
      />

      {/* Drawing Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <input 
          type="color" 
          value={brushColor} 
          onChange={(e) => setBrushColor(e.target.value)}
          style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', background: 'none' }}
          title="Colony Pigment Color"
        />

        <select 
          value={brushSize} 
          onChange={(e) => setBrushSize(Number(e.target.value))}
          style={{ padding: '6px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
        >
          <option value={10}>Fine Point</option>
          <option value={16}>Standard Colony</option>
          <option value={26}>Large Mucoid</option>
        </select>

        <button 
          onClick={clearCanvas}
          style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#E2E8F0', color: '#334155' }}
        >
          Clear
        </button>

        <button 
          onClick={handleInoculateClick}
          style={{ padding: '6px 14px', fontSize: '12px', backgroundColor: '#1B4D3E', color: '#FFF' }}
        >
          Inoculate Custom
        </button>
      </div>
    </div>
  );
}

export default MicrobialDrawingPad;