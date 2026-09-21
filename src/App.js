import React, { useState, useEffect } from 'react';
import MicrobialDrawingPad from './MicrobialDrawingPad';
import { db, ref, onValue, push } from './firebase';
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
  const [visitorId] = useState(() => {
    const saved = localStorage.getItem('petriPaletteVisitorId');
    if (saved) return saved;

    const newId = crypto.randomUUID();
    localStorage.setItem('petriPaletteVisitorId', newId);
    return newId;
  });

  const MAX_GLOBAL_ON_PLATE = 14;
  const MIN_GLOBAL_ON_PLATE = 5;

  const shuffleArray = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const getCustomDisplayRadius = (item) => {
    if (item.width && item.height) {
      return Math.hypot(item.width / 2, item.height / 2) + 4;
    }
    return (item.radius || 25) * (item.scale || 1) + 4;
  };

  // The shared plate contains ONLY specimens from the Global Specimen Bio-Bank.
  // Each refresh selects a random subset and gives them fresh random positions
  // inside the coloured agar. Standard template organisms are never added here.
  const getVisibleGlobalSpecimens = (parsedList) => {
    const centerX = 260;
    const centerY = 260;
    const agarRadius = 168;
    const gap = 2;
    const visible = [];

    const tryPlace = (item, attempts = 1500) => {
      const radius = getCustomDisplayRadius(item);
      const usableRadius = agarRadius - radius;
      if (usableRadius <= 0) return null;

      const isValidPosition = (x, y) => {
        if (typeof x !== 'number' || typeof y !== 'number') return false;
        if (Math.hypot(x - centerX, y - centerY) > usableRadius) return false;

        return !visible.some((other) => {
          const otherRadius = getCustomDisplayRadius(other);
          return Math.hypot(x - other._displayX, y - other._displayY) <
            radius + otherRadius + gap;
        });
      };

      // Keep the position saved with the specimen whenever it is still valid.
      // This makes a newly inoculated specimen appear immediately and keeps
      // the same position for everyone viewing the shared plate.
      if (isValidPosition(item.x, item.y)) {
        return { x: item.x, y: item.y };
      }

      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.sqrt(Math.random()) * usableRadius;
        const x = Math.round(centerX + distance * Math.cos(angle));
        const y = Math.round(centerY + distance * Math.sin(angle));

        if (isValidPosition(x, y)) return { x, y };
      }

      return null;
    };

    if (!parsedList.length) return visible;

    // Always put the newest contributed specimen on the shared plate first.
    // This guarantees that a drawing which has just been inoculated appears
    // in real time instead of being lost in a random subset.
    const newest = parsedList[parsedList.length - 1];
    const newestPlaced = tryPlace(newest, 5000);
    if (newestPlaced) {
      visible.push({ ...newest, _displayX: newestPlaced.x, _displayY: newestPlaced.y });
    }

    // Fill the remaining spaces with randomly selected older Bio-Bank specimens.
    const older = shuffleArray(
      parsedList.slice(0, -1).filter((item) => item.firebaseKey !== newest.firebaseKey)
    );

    for (const item of older) {
      if (visible.length >= MAX_GLOBAL_ON_PLATE) break;
      const placed = tryPlace(item, 3000);
      if (placed) {
        visible.push({ ...item, _displayX: placed.x, _displayY: placed.y });
      }
    }

    // If there are at least five custom specimens, keep trying until five
    // visible custom specimens are present whenever the geometry allows it.
    if (parsedList.length >= MIN_GLOBAL_ON_PLATE && visible.length < MIN_GLOBAL_ON_PLATE) {
      const remaining = shuffleArray(
        parsedList.filter((item) => !visible.some((v) => v.firebaseKey === item.firebaseKey))
      );

      for (const item of remaining) {
        if (visible.length >= MIN_GLOBAL_ON_PLATE) break;
        const placed = tryPlace(item, 5000);
        if (placed) {
          visible.push({ ...item, _displayX: placed.x, _displayY: placed.y });
        }
      }
    }

    return visible;
  };

  useEffect(() => {
    const bankRef = ref(db, 'globalBioBank');

    const unsubscribeBank = onValue(bankRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setGlobalBioBank([]);
        setMicrobes((prev) => prev.filter((m) => !m.firebaseKey));
        return;
      }

      const parsedList = Object.keys(data).map((key) => ({
        firebaseKey: key,
        ...data[key]
      }));

      // The gallery always keeps every contributed specimen.
      setGlobalBioBank([...parsedList].reverse());

      // The plate shows the newest specimens first. If the plate becomes
      // crowded, older specimens naturally remain in the gallery but are
      // no longer displayed on the shared plate. No Firebase update/delete
      // is needed.
      const visibleGlobalSpecimens = getVisibleGlobalSpecimens(parsedList);

      const globalColonies = visibleGlobalSpecimens.map((item) => ({
        id: `global-${item.firebaseKey}`,
        firebaseKey: item.firebaseKey,
        creatorId: item.creatorId,
        type: 'custom',
        data: item.data,
        width: item.width,
        height: item.height,
        locked: true,
        radius: item.radius || 25,
        scale: item.scale || 1,
        x: item._displayX,
        y: item._displayY,
        isDying: false
      }));

      setMicrobes((prev) => {
        const localMicrobes = prev.filter((m) => !m.firebaseKey);
        return [...localMicrobes, ...globalColonies];
      });
    });

    return () => unsubscribeBank();
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

const getRandomInDish = (newRadius = 25, ignoredIds = []) => {
    const ignoredSet = new Set(Array.isArray(ignoredIds) ? ignoredIds : [ignoredIds]);
    const centerX = 260;
    const centerY = 260;
    // This is the coloured agar area, not the outer rim of the PNG dish.
    const plateRadius = 168;
    const gap = 2;

    const existingColonies = microbes.filter(
      (m) =>
        typeof m.x === 'number' &&
        typeof m.y === 'number' &&
        !ignoredSet.has(m.firebaseKey) && !ignoredSet.has(m.id)
    );

    // Custom drawings are displayed at 75% of their cropped drawing size.
    // The app never shrinks them further to force a fit.
    if (newRadius + 4 > plateRadius) return null;

    const usableRadius = plateRadius - newRadius - 4;

    // Try many random positions so the app can use small free gaps
    // between existing cultures before declaring the dish full.
    for (let attempt = 0; attempt < 3000; attempt++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.sqrt(Math.random()) * usableRadius;

      const x = Math.round(centerX + distance * Math.cos(angle));
      const y = Math.round(centerY + distance * Math.sin(angle));

      const overlaps = existingColonies.some((m) => {
        const existingRadius = m.width && m.height
          ? Math.hypot(m.width / 2, m.height / 2) + 6
          : (m.radius || 25) * (m.scale || 1) + 6;

        return Math.hypot(x - m.x, y - m.y) < newRadius + existingRadius + gap;
      });

      if (!overlaps) return { x, y };
    }

    return null;
  };

  // Crop transparent space around the drawing so its displayed size
  // matches the actual area the user drew.
  const prepareCustomSpecimen = (imgUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const pixels = ctx.getImageData(
          0, 0, canvas.width, canvas.height
        ).data;

        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = -1;
        let maxY = -1;

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const alpha = pixels[(y * canvas.width + x) * 4 + 3];

            if (alpha > 30) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }

        if (maxX < 0 || maxY < 0) {
          reject(new Error('blank'));
          return;
        }

        const padding = 4;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(canvas.width - 1, maxX + padding);
        maxY = Math.min(canvas.height - 1, maxY + padding);

        const width = maxX - minX + 1;
        const height = maxY - minY + 1;

        const cropped = document.createElement('canvas');
        cropped.width = width;
        cropped.height = height;

        cropped.getContext('2d').drawImage(
          canvas,
          minX, minY, width, height,
          0, 0, width, height
        );

        // The drawing is reduced by 25% on the Petri dish so it fits
        // more naturally while preserving its proportions. The original
        // cropped drawing remains intact in the stored PNG.
        const displayScale = 0.75;
        const displayWidth = Math.max(1, Math.round(width * displayScale));
        const displayHeight = Math.max(1, Math.round(height * displayScale));

        resolve({
          data: cropped.toDataURL('image/png'),
          width: displayWidth,
          height: displayHeight,
          radius: Math.hypot(displayWidth / 2, displayHeight / 2) + 6
        });
      };

      img.onerror = reject;
      img.src = imgUrl;
    });
  };


  const handleInoculateSelected = async (customData = null, customRadius = 25) => {
  // CUSTOM DRAWING
  if (customData) {
    const isSafe = await validateImageSafety(customData);

    if (!isSafe) {
      setModalInfo({
        title: 'Invalid Specimen',
        body: 'Drawing invalid or blank. Please draw a colony specimen inside the pad.'
      });
      return;
    }

    let prepared;

    try {
      prepared = await prepareCustomSpecimen(customData);
    } catch (error) {
      setModalInfo({
        title: 'Invalid Specimen',
        body: 'Unable to read the drawing. Please draw your specimen again.'
      });
      return;
    }

    let position = getRandomInDish(prepared.radius);

    // LOOP BEHAVIOUR: if the plate is crowded, progressively remove the
    // oldest currently visible cultures from the local plate view and retry.
    // Firebase records are never deleted, so removed cultures remain in the gallery.
    if (!position) {
      const oldestLocalFirst = microbes
        .filter((m) => !m.firebaseKey)
        .slice()
        .sort((a, b) => (a.id || 0) - (b.id || 0));

      for (let count = 1; count <= oldestLocalFirst.length && !position; count++) {
        const removeIds = oldestLocalFirst.slice(0, count).map((m) => m.id);
        position = getRandomInDish(prepared.radius, removeIds);
        if (position) {
          setMicrobes((prev) => prev.filter((m) => !removeIds.includes(m.id)));
        }
      }
    }

    if (!position) {
      const oldestGlobalFirst = globalBioBank.slice().reverse();

      for (let count = 1; count <= oldestGlobalFirst.length && !position; count++) {
        const ignoredKeys = oldestGlobalFirst
          .slice(0, count)
          .map((item) => item.firebaseKey);
        position = getRandomInDish(prepared.radius, ignoredKeys);
      }
    }

    if (!position) {
      // Do not interrupt inoculation with a full-dish acknowledgement popup.
      // The gallery keeps all saved specimens; if this particular drawing
      // physically cannot fit, simply leave it in the drawing pad.
      return;
    }

    const bankRef = ref(db, 'globalBioBank');

    const specimenRecord = {
      id: Date.now(),
      data: prepared.data,
      date: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      flags: 0,
      x: position.x,
      y: position.y,
      radius: Math.hypot(prepared.width / 2, prepared.height / 2) + 6,
      width: prepared.width,
      height: prepared.height,
      scale: 1.0,
      creatorId: visitorId,
      locked: true,
      positionVersion: 2
    };

    // Wait for Firebase to create the record, then show the same specimen
    // immediately on this user's plate. The realtime listener will reconcile
    // it with the shared Bio-Bank for everyone else.
    const pushedRef = await push(bankRef, specimenRecord);

    setMicrobes((prev) => {
      const withoutDuplicate = prev.filter((m) => m.firebaseKey !== pushedRef.key);
      return [
        ...withoutDuplicate,
        {
          id: `global-${pushedRef.key}`,
          firebaseKey: pushedRef.key,
          creatorId: visitorId,
          type: 'custom',
          data: specimenRecord.data,
          width: specimenRecord.width,
          height: specimenRecord.height,
          locked: true,
          radius: specimenRecord.radius,
          scale: 1,
          x: specimenRecord.x,
          y: specimenRecord.y,
          isDying: false
        }
      ];
    });

    return;
  }

  // Standard templates remain available in the controls, but the shared
  // Petri plate is reserved exclusively for custom specimens from the
  // Global Specimen Bio-Bank. Standard templates are never added to it.
  return;
};

  const handleFlagSpecimen = (item, e) => {
    e.stopPropagation();

    if (!item?.firebaseKey) return;

    setModalInfo({
      title: 'Specimen Reported',
      body: 'Thank you. This specimen has been reported for review.'
    });
  };



  const currentMedia = MEDIA_TYPES[selectedMedium] || MEDIA_TYPES.sda;
  return (
    <div style={{ padding: '40px', minHeight: '100vh', position: 'relative', userSelect: 'none' }}
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
        @keyframes colonyPopIn {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.25);
          }
          65% {
            opacity: 1;
            transform: translateY(-3px) scale(1.08);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .petri-colony-visual {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transform-origin: center bottom;
          animation: colonyPopIn 520ms cubic-bezier(0.2, 0.8, 0.25, 1) both;
          transition: transform 180ms ease, filter 180ms ease;
          position: relative;
          z-index: 1;
        }
        @media (hover: hover) and (pointer: fine) {
          .petri-colony-position:hover {
            z-index: 50 !important;
          }
          .petri-colony-position:hover .petri-colony-visual {
            transform: translateY(-8px) scale(1.12);
            filter: drop-shadow(0 8px 8px rgba(0, 0, 0, 0.28));
            z-index: 50;
          }
        }
        .petri-colony-position:focus-visible {
          z-index: 50 !important;
          outline: none;
        }
        .petri-colony-position:focus-visible .petri-colony-visual {
          transform: translateY(-8px) scale(1.12);
          filter: drop-shadow(0 8px 8px rgba(0, 0, 0, 0.28));
        }
        @media (prefers-reduced-motion: reduce) {
          .petri-colony-visual {
            animation: none;
            transition: none;
          }
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
                {microbes.map((m, index) => {
                  const currentScale = m.scale || 1.0;
                  const customWidth = m.width || ((m.radius || 25) * 2);
                  const customHeight = m.height || ((m.radius || 25) * 2);

                  return (
                    <div 
                      key={m.id}
                      className={`petri-colony-position ${m.isDying ? 'dying-organism' : ''}`}
                      tabIndex={0}
                      aria-label="Custom colony"
                      style={{ 
                        position: 'absolute', 
                        left: `${m.x}px`, 
                        top: `${m.y}px`, 
                        transform: 'translate(-50%, -50%)',
                        cursor: 'default',
                        border: '2px solid transparent',
                        borderRadius: '50%',
                        padding: '4px',
                      }}
                    >
                      <div
                        className="petri-colony-visual"
                        style={{ animationDelay: `${Math.min(index * 110, 1400)}ms` }}
                      >
                        {m.type === 'custom' ? (
                          <img 
                            src={m.data} 
                            alt="Custom Colony" 
                            style={{
                              width: `${customWidth * currentScale}px`,
                              height: `${customHeight * currentScale}px`,
                              objectFit: 'contain',
                              display: 'block'
                            }}
                          />
                        ) : (
                          ORGANISM_TEMPLATES[m.type]?.render(currentScale, selectedMedium)
                        )}
                      </div>
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
        </div>
      </div>

      {globalBioBank.length > 0 && (
        <div style={{ marginTop: '50px', borderTop: '2px dashed #CBD5E1', paddingTop: '30px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '5px' }}>Global Specimen Bio-Bank</h2>
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '10px' }}>
            {globalBioBank.map((specimen, idx) => (
              <div 
                key={specimen.firebaseKey || specimen.id}
                style={{
                  position: 'relative',
                  flex: '0 0 auto',
                  padding: '14px 18px',
                  backgroundColor: '#FFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  textAlign: 'center',
                  cursor: 'default'
                }}
              >
                <button
                  onClick={(e) => handleFlagSpecimen(specimen, e)}
                  title="Report specimen"
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
