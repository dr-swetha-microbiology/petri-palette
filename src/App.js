import React, { useState, useRef, useEffect } from 'react';
import MicrobialDrawingPad from './MicrobialDrawingPad';
import { db, ref, onValue, push, remove } from './firebase';
import './App.css'; // Ensure App.css is explicitly imported

const ORGANISM_TEMPLATES = {
  ecoli: {
    name: 'Escherichia coli (Metallic Green / Pink)',
    type: 'bacteria',
    radius: 22,
    render: (scale = 1, medium = 'nutrient') => {
      if (medium === 'emb') {
        return (
          <svg viewBox="0 0 100 100" width={48 * scale} height={48 * scale} style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.4))' }}>
            <circle cx="50" cy="50" r="30" fill="#1E8449" />
            <circle cx="47" cy="47" r="24" fill="#2ECC71" />
            <circle cx="43" cy="43" r="14" fill="#ABEBC6" opacity="0.8" />
            <path d="M 30 30 L 70 70 M 20 50 L 80 50" stroke="#F1C40F" strokeWidth="2" opacity="0.6" />
          </svg>
        );
      }
      if (medium === 'macconkey') {
        return (
          <svg viewBox="0 0 100 100" width={48 * scale} height={48 * scale} style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.3))' }}>
            <circle cx="50" cy="50" r="30" fill="#C2185B" />
            <circle cx="47" cy="47" r="24" fill="#E91E63" />
            <circle cx="43" cy="43" r="12" fill="#F8BBD0" opacity="0.8" />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 100 100" width={48 * scale} height={48 * scale} style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.25))' }}>
          <circle cx="50" cy="50" r="30" fill="#D5DBDB" />
          <circle cx="47" cy="47" r="24" fill="#EAEDED" />
          <circle cx="43" cy="43" r="12" fill="#FFFFFF" opacity="0.8" />
        </svg>
      );
    }
  },
  scerevisiae: {
    name: "Saccharomyces cerevisiae (Smooth Cream Baker's Yeast)",
    type: 'fungus',
    radius: 25,
    render: (scale = 1) => (
      <svg viewBox="0 0 100 100" width={52 * scale} height={52 * scale} style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.25))' }}>
        <circle cx="50" cy="50" r="28" fill="#E5D3B3" />
        <circle cx="46" cy="46" r="22" fill="#F3E5AB" />
        <circle cx="42" cy="42" r="12" fill="#FFF9E6" opacity="0.85" />
      </svg>
    )
  },
  klebsiella: {
    name: 'Klebsiella pneumoniae (Mucoid / Viscous)',
    type: 'bacteria',
    radius: 28,
    render: (scale = 1, medium = 'nutrient') => {
      const isPink = medium === 'macconkey' || medium === 'emb';
      return (
        <svg viewBox="0 0 100 100" width={58 * scale} height={58 * scale} style={{ filter: 'drop-shadow(2px 3px 5px rgba(0,0,0,0.25))' }}>
          <path d="M50 15 Q75 10 85 40 Q95 70 65 85 Q35 95 15 70 Q5 35 50 15 Z" fill={isPink ? '#AD1457' : '#F4ECC7'} opacity="0.9" />
          <path d="M50 25 Q65 20 75 45 Q80 65 60 75 Q40 80 25 60 Q18 38 50 25 Z" fill={isPink ? '#EC407A' : '#E6D796'} />
          <circle cx="42" cy="38" r="8" fill="#FFFFFF" opacity="0.7" />
        </svg>
      );
    }
  },
  staph: {
    name: 'Staphylococcus aureus (Golden Convex / Hemolytic)',
    type: 'bacteria',
    radius: 22,
    render: (scale = 1, medium = 'nutrient') => (
      <svg viewBox="0 0 100 100" width={50 * scale} height={50 * scale} style={{ filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.25))' }}>
        {medium === 'blood' && <circle cx="50" cy="50" r="42" fill="#F9E79F" opacity="0.5" />}
        <circle cx="50" cy="50" r="20" fill="#F1C40F" />
        <circle cx="46" cy="46" r="14" fill="#F4D03F" />
        <circle cx="42" cy="42" r="6" fill="#FEF9E7" opacity="0.8" />
      </svg>
    )
  },
  pseudomonas: {
    name: 'Pseudomonas aeruginosa (Pyocyanin Blue-Green)',
    type: 'bacteria',
    radius: 24,
    render: (scale = 1) => (
      <svg viewBox="0 0 100 100" width={52 * scale} height={52 * scale} style={{ filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.3))' }}>
        <circle cx="50" cy="50" r="32" fill="#16A085" opacity="0.4" />
        <circle cx="50" cy="50" r="22" fill="#117A65" />
        <circle cx="46" cy="46" r="14" fill="#48C9B0" />
      </svg>
    )
  },
  serratia: {
    name: 'Serratia marcescens (Prodigiosin Red Pigment)',
    type: 'bacteria',
    radius: 20,
    render: (scale = 1) => (
      <svg viewBox="0 0 100 100" width={46 * scale} height={46 * scale} style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.3))' }}>
        <circle cx="50" cy="50" r="22" fill="#900C3F" />
        <circle cx="47" cy="47" r="16" fill="#C70039" />
        <circle cx="43" cy="43" r="8" fill="#FF5733" opacity="0.8" />
      </svg>
    )
  },
  micrococcus: {
    name: 'Micrococcus luteus (Bright Yellow Smooth)',
    type: 'bacteria',
    radius: 18,
    render: (scale = 1) => (
      <svg viewBox="0 0 100 100" width={42 * scale} height={42 * scale} style={{ filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.2))' }}>
        <circle cx="50" cy="50" r="20" fill="#F39C12" />
        <circle cx="46" cy="46" r="14" fill="#F1C40F" />
      </svg>
    )
  },
  bacillus: {
    name: 'Bacillus subtilis (Rough / Irregular Margin)',
    type: 'bacteria',
    radius: 30,
    render: (scale = 1) => (
      <svg viewBox="0 0 100 100" width={60 * scale} height={60 * scale} style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.25))' }}>
        <path d="M50 10 Q70 15 80 35 Q95 60 70 80 Q45 95 20 75 Q5 50 30 20 Z" fill="#D5DBDB" />
        <path d="M50 20 Q65 25 72 40 Q82 60 62 72 Q42 82 28 65 Q18 45 38 28 Z" fill="#EAEDED" />
      </svg>
    )
  },
  penicillium: {
    name: 'Penicillium chrysogenum (Velvety Green Fungus)',
    type: 'fungus',
    radius: 35,
    render: (scale = 1) => (
      <svg viewBox="0 0 100 100" width={70 * scale} height={70 * scale} style={{ filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.3))' }}>
        <circle cx="50" cy="50" r="42" fill="#F4F6F6" opacity="0.9" />
        <circle cx="50" cy="50" r="34" fill="#2E7D32" />
        <circle cx="50" cy="50" r="26" fill="#1B5E20" />
      </svg>
    )
  },
  aspergillus: {
    name: 'Aspergillus niger (Black Spore Fungal Filament)',
    type: 'fungus',
    radius: 38,
    render: (scale = 1) => (
      <svg viewBox="0 0 100 100" width={75 * scale} height={75 * scale} style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.4))' }}>
        <circle cx="50" cy="50" r="44" fill="#E5E7E9" opacity="0.8" />
        <circle cx="50" cy="50" r="34" fill="#424949" />
        <circle cx="50" cy="50" r="24" fill="#1B2631" />
      </svg>
    )
  },
  candida: {
    name: 'Candida albicans (Creamy Yeast Colony)',
    type: 'fungus',
    radius: 22,
    render: (scale = 1) => (
      <svg viewBox="0 0 100 100" width={48 * scale} height={48 * scale} style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.2))' }}>
        <circle cx="50" cy="50" r="22" fill="#FADBD8" opacity="0.7" />
        <circle cx="50" cy="50" r="18" fill="#FDEDEC" />
        <circle cx="46" cy="46" r="10" fill="#FFFFFF" />
      </svg>
    )
  }
};

const MEDIA_TYPES = {
  emb: { name: 'Eosin Methylene Blue (EMB - Deep Wine Red)', filter: 'hue-rotate(300deg) saturate(2.5) brightness(0.5)', selectiveFor: 'bacteria' },
  macconkey: { name: 'MacConkey Agar (Selective Pinkish Mauve)', filter: 'hue-rotate(310deg) saturate(2) brightness(0.7)', selectiveFor: 'bacteria' },
  blood: { name: 'Blood Agar (Enriched Deep Red)', filter: 'hue-rotate(330deg) saturate(3) brightness(0.4)', selectiveFor: 'all' },
  sda: { name: 'Sabouraud Dextrose Agar (SDA - Pale Yellow + Antibiotics)', filter: 'hue-rotate(15deg) saturate(1.8) brightness(1.1)', selectiveFor: 'fungus' },
  pda: { name: 'Potato Dextrose Agar (PDA - Light Straw + Antibiotics)', filter: 'hue-rotate(25deg) saturate(1.4) brightness(1.05)', selectiveFor: 'fungus' },
  msa: { name: 'Mannitol Salt Agar (MSA - Bright Pink/Yellow)', filter: 'hue-rotate(320deg) saturate(2.2) brightness(0.8)', selectiveFor: 'bacteria' },
  cled: { name: 'CLED Agar (Urinary Diagnostic Soft Green)', filter: 'hue-rotate(150deg) saturate(1.2) brightness(0.85)', selectiveFor: 'bacteria' },
  tsa: { name: 'Tryptic Soy Agar (TSA - General Warm Amber)', filter: 'hue-rotate(20deg) saturate(1.1) brightness(0.9)', selectiveFor: 'all' },
  nutrient: { name: 'Nutrient Agar (Standard Light Amber)', filter: 'none', selectiveFor: 'all' }
};

function App() {
  const [microbes, setMicrobes] = useState([]);
  const [globalBioBank, setGlobalBioBank] = useState([]);
  const [selectedMedium, setSelectedMedium] = useState('sda');
  const [selectedOrganism, setSelectedOrganism] = useState('ecoli');
  const [modalInfo, setModalInfo] = useState(null);

  const [selectedMicrobeId, setSelectedMicrobeId] = useState(null);
  const dishRef = useRef(null);
  const draggingId = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // REALTIME FIREBASE SYNC: BioBank items stream instantly to both laptop & mobile
  useEffect(() => {
    const bankRef = ref(db, 'globalBioBank');
    const unsubscribe = onValue(bankRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedList = Object.keys(data).map((key) => ({
          firebaseKey: key,
          ...data[key]
        }));
        setGlobalBioBank(parsedList.reverse());
      } else {
        setGlobalBioBank([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const validateImageSafety = (imgUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imgUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const pixels = ctx.getImageData(0, 0, img.width, img.height).data;
        let drawnPixels = 0;

        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] > 50) drawnPixels++;
        }

        const coverage = drawnPixels / (img.width * img.height);
        resolve(coverage > 0.005 && coverage < 0.85);
      };
      img.onerror = () => resolve(true);
    });
  };

  const getRandomInDish = () => {
    const centerX = 235;
    const centerY = 245; 
    const maxRadius = 110;

    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.sqrt(Math.random()) * maxRadius;

    return {
      x: Math.round(centerX + distance * Math.cos(angle)),
      y: Math.round(centerY + distance * Math.sin(angle))
    };
  };

  const handleMouseDown = (id, e) => {
    e.stopPropagation();
    draggingId.current = id;
    setSelectedMicrobeId(id);

    const colony = microbes.find((m) => m.id === id);
    if (colony && dishRef.current) {
      const rect = dishRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      dragOffset.current = {
        x: mouseX - colony.x,
        y: mouseY - colony.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (!draggingId.current || !dishRef.current) return;

    const rect = dishRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let newX = mouseX - dragOffset.current.x;
    let newY = mouseY - dragOffset.current.y;

    const centerX = 235;
    const centerY = 245;
    const maxRadius = 110;

    const dist = Math.hypot(newX - centerX, newY - centerY);
    if (dist > maxRadius) {
      const angle = Math.atan2(newY - centerY, newX - centerX);
      newX = centerX + maxRadius * Math.cos(angle);
      newY = centerY + maxRadius * Math.sin(angle);
    }

    setMicrobes((prev) =>
      prev.map((m) => (m.id === draggingId.current ? { ...m, x: newX, y: newY } : m))
    );
  };

  const handleMouseUp = () => {
    draggingId.current = null;
  };

  const handleScaleChange = (id, delta) => {
    setMicrobes((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const currentScale = m.scale || 1.0;
          const newScale = Math.min(Math.max(0.4, currentScale + delta), 3.0);
          return { ...m, scale: parseFloat(newScale.toFixed(2)) };
        }
        return m;
      })
    );
  };

  const handleInoculateSelected = async (customData = null, customRadius = 25) => {
    const currentMediaInfo = MEDIA_TYPES[selectedMedium];
    const organismInfo = ORGANISM_TEMPLATES[selectedOrganism];
    const isBacteriaOnFungalMedia = !customData && currentMediaInfo?.selectiveFor === 'fungus' && organismInfo?.type === 'bacteria';

    const { x, y } = getRandomInDish();

    let colonyObj;

    if (customData) {
      const isSafe = await validateImageSafety(customData);
      if (!isSafe) {
        setModalInfo({
          title: 'Invalid Specimen',
          body: 'Drawing invalid or blank. Please draw a colony specimen inside the pad.'
        });
        return;
      }

      colonyObj = {
        id: Date.now() + Math.random(),
        type: 'custom',
        data: customData,
        radius: customRadius,
        scale: 1.0,
        x,
        y,
        isDying: false
      };

      // Push custom drawing instantly to Firebase Realtime Database
      const bankRef = ref(db, 'globalBioBank');
      push(bankRef, {
        id: Date.now(),
        data: customData,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        flags: 0
      });
    } else {
      colonyObj = {
        id: Date.now() + Math.random(),
        type: selectedOrganism,
        radius: ORGANISM_TEMPLATES[selectedOrganism]?.radius || 22,
        scale: 1.0,
        x,
        y,
        isDying: isBacteriaOnFungalMedia
      };
    }

    if (microbes.length >= 20) {
      setMicrobes([colonyObj]);
    } else {
      setMicrobes((prev) => [...prev, colonyObj]);
    }

    setSelectedMicrobeId(colonyObj.id);

    if (isBacteriaOnFungalMedia) {
      setTimeout(() => {
        setModalInfo({
          title: 'Growth Inhibited (Antibiotic Activity)',
          body: `${organismInfo.name} cannot survive on ${currentMediaInfo.name}. Added antibiotics disrupt bacterial cell wall assembly and protein synthesis.`
        });
      }, 800);

      setTimeout(() => {
        setMicrobes((prev) => prev.filter((m) => m.id !== colonyObj.id));
      }, 2500);
    }
  };

  const handleFlagSpecimen = (item, e) => {
    e.stopPropagation();
    const confirmFlag = window.confirm('Flag this specimen for inappropriate content?');
    if (!confirmFlag) return;

    if (item.firebaseKey) {
      const itemRef = ref(db, `globalBioBank/${item.firebaseKey}`);
      remove(itemRef);
    }
  };

  const currentMedia = MEDIA_TYPES[selectedMedium] || MEDIA_TYPES.sda;
  const activeMicrobe = microbes.find((m) => m.id === selectedMicrobeId);

  return (
    <div 
      onMouseMove={handleMouseMove} 
      onMouseUp={handleMouseUp} 
      style={{ padding: '40px', minHeight: '100vh', position: 'relative', userSelect: 'none' }}
    >
      <style>{`
        @keyframes floatUfo {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes shadowPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(0.75); opacity: 0.2; }
        }
        @keyframes dieBacteria {
          0% { transform: scale(1); filter: grayscale(0) opacity(1); }
          50% { transform: scale(1.1); filter: grayscale(0.5) opacity(0.8); }
          100% { transform: scale(0.2); filter: grayscale(1) opacity(0); }
        }
        .dying-organism {
          animation: dieBacteria 2.2s forwards ease-in-out;
        }
      `}</style>

      {modalInfo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '480px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
            textAlign: 'center',
            border: '2px solid #1B4D3E'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🦠💥</div>
            <h3 style={{ color: '#991B1B', marginTop: 0, marginBottom: '12px', fontSize: '1.4rem' }}>{modalInfo.title}</h3>
            <p style={{ color: '#334155', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>{modalInfo.body}</p>
            <button onClick={() => setModalInfo(null)}>
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 className="title-pixel" style={{ margin: '0 0 6px 0' }}>Petri Palette</h1>
        <p style={{ margin: 0, fontSize: '1rem', color: '#475569', fontStyle: 'italic' }}>
          Your Interactive Microbial Art Studio
        </p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '50px', flexWrap: 'wrap', marginTop: '20px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '520px', height: '520px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            
            <div style={{
              position: 'absolute',
              bottom: '20px',
              width: '360px',
              height: '35px',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              borderRadius: '50%',
              filter: 'blur(10px)',
              animation: 'shadowPulse 3.5s ease-in-out infinite'
            }} />

            <div 
              ref={dishRef}
              style={{
                position: 'relative',
                width: '520px',
                height: '520px',
                animation: 'floatUfo 3.5s ease-in-out infinite'
              }}
            >
              <img 
                src="/petri-dish-transparent.png" 
                alt="Petri Dish" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain', 
                  filter: currentMedia.filter,
                  transition: 'filter 0.4s ease'
                }} 
              />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                {microbes.map((m) => {
                  const isSelected = m.id === selectedMicrobeId;
                  const currentScale = m.scale || 1.0;
                  const customSize = 50 * currentScale;

                  return (
                    <div 
                      key={m.id} 
                      onMouseDown={(e) => handleMouseDown(m.id, e)}
                      className={m.isDying ? 'dying-organism' : ''} 
                      style={{ 
                        position: 'absolute', 
                        left: `${m.x}px`, 
                        top: `${m.y}px`, 
                        transform: 'translate(-50%, -50%)',
                        cursor: 'grab',
                        border: isSelected ? '2px dashed #2563EB' : '2px solid transparent',
                        borderRadius: '50%',
                        padding: '4px',
                        transition: 'border 0.2s ease'
                      }}
                    >
                      {m.type === 'custom' ? (
                        <img 
                          src={m.data} 
                          alt="Custom Colony" 
                          style={{ width: `${customSize}px`, height: `${customSize}px` }} 
                        />
                      ) : (
                        ORGANISM_TEMPLATES[m.type]?.render(currentScale, selectedMedium)
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '380px' }}>
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>1. Growth Medium / Agar Type:</p>
            <select
              value={selectedMedium}
              onChange={(e) => setSelectedMedium(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #1B4D3E', outline: 'none', cursor: 'pointer' }}
            >
              {Object.keys(MEDIA_TYPES).map((key) => (
                <option key={key} value={key}>{MEDIA_TYPES[key].name}</option>
              ))}
            </select>
          </div>

          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>2. Standard Organism Template:</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={selectedOrganism}
                onChange={(e) => setSelectedOrganism(e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #1B4D3E', outline: 'none', cursor: 'pointer' }}
              >
                {Object.keys(ORGANISM_TEMPLATES).map((key) => (
                  <option key={key} value={key}>{ORGANISM_TEMPLATES[key].name}</option>
                ))}
              </select>
              <button onClick={() => handleInoculateSelected()}>
                Inoculate
              </button>
            </div>
          </div>

          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>3. Draw Custom Specimen:</p>
            <MicrobialDrawingPad onInoculate={(imgData) => handleInoculateSelected(imgData, 25)} />
          </div>

          {activeMicrobe && (
            <div style={{ padding: '15px', border: '1px solid #CBD5E1', borderRadius: '12px', backgroundColor: '#F8FAFC' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '14px', color: '#1B4D3E' }}>
                Resize Selected Culture:
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <button 
                  onClick={() => handleScaleChange(activeMicrobe.id, -0.15)} 
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  🔍 - Decrease
                </button>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>
                  {((activeMicrobe.scale || 1.0) * 100).toFixed(0)}%
                </span>
                <button 
                  onClick={() => handleScaleChange(activeMicrobe.id, 0.15)} 
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  🔍 + Increase
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {globalBioBank.length > 0 && (
        <div style={{ marginTop: '50px', borderTop: '2px dashed #CBD5E1', paddingTop: '30px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '5px' }}>Global Specimen Bio-Bank</h2>
          <p style={{ textAlign: 'center', color: '#64748B', fontSize: '13px', marginBottom: '20px' }}>
            Shared user strains. Click any item to re-inoculate, or use 🚩 to flag/delete inappropriate drawings.
          </p>

          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '10px' }}>
            {globalBioBank.map((specimen, idx) => (
              <div 
                key={specimen.firebaseKey || specimen.id}
                onClick={() => handleInoculateSelected(specimen.data, 25)}
                style={{
                  position: 'relative',
                  flex: '0 0 auto',
                  padding: '14px 18px',
                  backgroundColor: '#FFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <button
                  onClick={(e) => handleFlagSpecimen(specimen, e)}
                  title="Flag/Delete Image"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#FEE2E2',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    color: '#EF4444',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: 0,
                    boxShadow: 'none'
                  }}
                >
                  🚩
                </button>

                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#F8FAFC', margin: '0 auto 8px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #E2E8F0' }}>
                  <img src={specimen.data} alt="Specimen" style={{ width: '45px', height: '45px' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1B4D3E', display: 'block' }}>
                  Strain #{globalBioBank.length - idx}
                </span>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>{specimen.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;