import React, { useRef, useState, useEffect } from 'react';

const MicrobialDrawingPad = ({ onInoculate }) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const [color, setColor] = useState('#E74C3C');

  const colors = [
    { name: 'Red', value: '#E74C3C' },
    { name: 'Orange', value: '#F39C12' },
    { name: 'Yellow', value: '#F1C40F' },
    { name: 'Green', value: '#2ECC71' },
    { name: 'Blue', value: '#3498DB' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (e.isPrimary === false) return;

    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (error) {}

    const ctx = canvas.getContext('2d');
    const point = getPosition(e);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    /* Small dot for a single tap */
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
    ctx.fill();

    isDrawingRef.current = true;
    lastPointRef.current = point;
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    if (e.isPrimary === false) return;

    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const point = getPosition(e);
    const lastPoint = lastPointRef.current;

    if (!lastPoint) {
      lastPointRef.current = point;
      return;
    }

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.stroke();

    lastPointRef.current = point;
  };

  const stopDrawing = (e) => {
    if (e) {
      e.preventDefault();

      const canvas = canvasRef.current;

      if (canvas) {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch (error) {}
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
  };

  const handleInoculate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL('image/png');

    onInoculate(imageData);

    clearCanvas();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
      }}
    >

      {/* Specimen Colour Palette */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '2px'
        }}
      >
        {colors.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-label={`Select ${item.name}`}
            title={item.name}
            onClick={() => setColor(item.value)}
            style={{
              width: '28px',
              height: '28px',
              padding: 0,
              borderRadius: '50%',
              border:
                color === item.value
                  ? '3px solid #2C3E50'
                  : '2px solid #666',
              backgroundColor: item.value,
              cursor: 'pointer',
              boxShadow:
                color === item.value
                  ? '2px 2px 0px #2C3E50'
                  : 'none'
            }}
          />
        ))}
      </div>

      {/* Drawing Canvas */}
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={250}
          height={200}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={(e) => {
            if (e.pointerType === 'mouse') {
              stopDrawing(e);
            }
          }}
          style={{
            border: '2px dashed #666',
            borderRadius: '8px',
            backgroundColor: '#FAF9F6',
            cursor: 'crosshair',

            /* Mobile drawing */
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none'
          }}
        />

        <button
          type="button"
          onClick={clearCanvas}
          aria-label="Clear drawing"
          title="Clear drawing"
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            background: '#FFF',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            width: '45px',
            height: '45px',
            borderRadius: '0 0 8px 8px',
            boxShadow: '2px 2px 0px #000'
          }}
        >
          ↺
        </button>
      </div>

      {/* Inoculate */}
      <button
        type="button"
        onClick={handleInoculate}
        style={{
          padding: '10px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '20px',
          border: '2px solid #2C3E50',
          backgroundColor: '#FFF',
          cursor: 'pointer',
          boxShadow: '2px 2px 0px #2C3E50'
        }}
      >
        Inoculate
      </button>

    </div>
  );
};

export default MicrobialDrawingPad;