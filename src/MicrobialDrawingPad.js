import React, { useRef, useState, useEffect } from 'react';

function MicrobialDrawingPad({ onInoculate }) {
  const canvasRef = useRef(null);
  const [brushColor, setBrushColor] = useState('#2E7D32'); // Default green colony
  const [brushSize, setBrushSize] = useState(16);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#F4F6F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let isDrawing = false;

    const getPos = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const startDraw = (clientX, clientY) => {
      isDrawing = true;
      const pos = getPos(clientX, clientY);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    const moveDraw = (clientX, clientY) => {
      if (!isDrawing) return;
      const pos = getPos(clientX, clientY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const endDraw = () => {
      isDrawing = false;
    };

    // Mouse Event Handlers
    const onMouseDown = (e) => startDraw(e.clientX, e.clientY);
    const onMouseMove = (e) => moveDraw(e.clientX, e.clientY);
    const onMouseUp = () => endDraw();

    // Touch Event Handlers (Native with passive: false to allow e.preventDefault())
    const onTouchStart = (e) => {
      e.preventDefault();
      if (e.touches && e.touches[0]) {
        startDraw(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches && e.touches[0]) {
        moveDraw(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = (e) => {
      e.preventDefault();
      endDraw();
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [brushColor, brushSize]);

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
        style={{
          border: '2px solid #1B4D3E',
          borderRadius: '50%',
          backgroundColor: '#F4F6F6',
          cursor: 'crosshair',
          touchAction: 'none',
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