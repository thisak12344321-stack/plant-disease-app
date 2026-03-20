import { useState } from "react";

// Offline tips images
import tipWater from '../assets/tipWater.jpg';
import tipSunlight from '../assets/tipSunlight.png';
import tipSoil from '../assets/tipSoil.png';

export default function Upload({ goToPage, handleImageUpload, isLoading, setDiagnosisResult }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [preview, setPreview] = useState(null);

  const checkIfLeafImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
          img.src = e.target.result;
          setPreview(e.target.result); 
      };
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let greenPixels = 0;
        let totalPixels = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (g > r && g > b && g > 70) greenPixels++;
        }
        resolve(greenPixels / totalPixels > 0.12);
      };
      reader.onerror = () => resolve(false);
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isLeaf = await checkIfLeafImage(file);
    if (!isLeaf) {
      setErrorMessage("⚠ Scan Rejected: No plant tissue detected. Please use a clear leaf photo.");
      setPreview(null);
      return;
    }
    setErrorMessage("");
    setDiagnosisResult(null); 
    handleImageUpload(file);
  };

  return (
    <div style={styles.mainContainer}>
      {/* 🟢 ADVANCED KINETIC ANIMATIONS */}
      <style>{`
        @keyframes slowLaser {
          0% { top: -5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 105%; opacity: 0; }
        }
        @keyframes glowPulse {
          0% { box-shadow: 0 0 10px rgba(74, 222, 128, 0.1); }
          50% { box-shadow: 0 0 30px rgba(74, 222, 128, 0.3); }
          100% { box-shadow: 0 0 10px rgba(74, 222, 128, 0.1); }
        }
        @keyframes textFlicker {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        .advanced-card {
          background: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(25px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 40px;
          transition: 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .advanced-card:hover {
          background: rgba(74, 222, 128, 0.03);
          border-color: rgba(74, 222, 128, 0.5);
          transform: translateY(-5px);
        }
      `}</style>

      {/* 🟢 HEADER AREA */}
      <header style={styles.header}>
        <div style={styles.microBadge}>LABORATORY GRADE AI</div>
        <h1 style={styles.title}>Visual <span style={{color: '#4ADE80'}}>Diagnostic</span></h1>
        <p style={styles.subtitle}>
          Securely upload leaf imagery for instant health verification.
        </p>
      </header>

      {/* 🟢 THE MAIN SCANNER */}
      <div style={styles.uploadWrapper}>
        <input 
          type="file" 
          id="file-upload" 
          accept="image/*" 
          onChange={handleFileSelect} 
          style={{ display:'none' }} 
          disabled={isLoading} 
        />
        
        <label 
          htmlFor="file-upload" 
          className="advanced-card"
          style={{
            ...styles.dropZone,
            cursor: isLoading ? 'wait' : 'pointer'
          }}
        >
          {isLoading ? (
            <div style={styles.scanContainer}>
              <div style={styles.holoFrame}>
                {preview && <img src={preview} style={styles.previewImage} alt="Scanning" />}
                <div style={styles.laserBeam} />
                
                {/* Micro-Data Overlays */}
                <div style={{...styles.dataTag, top: '10%', left: '10%'}}>X: 42.09</div>
                <div style={{...styles.dataTag, bottom: '15%', right: '10%'}}>CHLORO_VAL: 88%</div>
              </div>
              <div style={styles.loadingStatus}>
                <span style={styles.pulseText}>ANALYZING MOLECULAR STRUCTURE...</span>
                <div style={styles.miniProgress}><div style={styles.miniFill} /></div>
              </div>
            </div>
          ) : (
            <div style={styles.idleState}>
              <div style={styles.scannerIcon}>
                <div style={styles.iconRing} />
                <span style={{fontSize: '2.5rem', zIndex: 2}}>🌿</span>
              </div>
              <h3 style={styles.mainPrompt}>Initialize Scan</h3>
              <p style={styles.subPrompt}>Tap to select or drag photo</p>
            </div>
          )}
        </label>

        {errorMessage && (
          <div style={styles.errorAlert}>
            <span style={{fontWeight: '900'}}>ERROR:</span> {errorMessage}
          </div>
        )}
      </div>

      {/* 🟢 BOTTOM TIPS */}
      <section style={styles.tipsSection}>
        <div style={styles.tipsGrid}>
          {[
            { img: tipWater, t:'Sharp Focus', d:'Focus on the spots or leaves.' },
            { img: tipSunlight, t:'Daylight', d:'Best results in bright rooms.' },
            { img: tipSoil, t:'Isolation', d:'Keep background simple.' }
          ].map((tip, idx) => (
            <div key={idx} className="advanced-card" style={styles.tipCard}>
              <img src={tip.img} alt={tip.t} style={styles.miniThumb} />
              <div>
                <h4 style={styles.tipTitle}>{tip.t}</h4>
                <p style={styles.tipDesc}>{tip.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  mainContainer: { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: '60px' },
  microBadge: {
    display: 'inline-block', padding: '5px 15px', borderRadius: '50px',
    background: 'rgba(74, 222, 128, 0.05)', color: '#4ADE80',
    fontSize: '0.6rem', fontWeight: '900', letterSpacing: '2.5px',
    border: '1px solid rgba(74, 222, 128, 0.2)', marginBottom: '20px'
  },
  title: { fontSize: '3.5rem', fontWeight: '800', margin: 0, letterSpacing: '-2px' },
  subtitle: { color: '#9CA3AF', fontSize: '1.1rem', marginTop: '10px' },

  uploadWrapper: { maxWidth: '700px', margin: '0 auto' },
  dropZone: {
    height: '420px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
  },
  
  // Idle Styles
  idleState: { textAlign: 'center' },
  scannerIcon: {
    width: '100px', height: '100px', margin: '0 auto 30px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
  },
  iconRing: {
    position: 'absolute', width: '100%', height: '100%',
    borderRadius: '50%', border: '2px dashed rgba(74, 222, 128, 0.3)',
    animation: 'spin 10s linear infinite'
  },
  mainPrompt: { fontSize: '1.8rem', fontWeight: '800', margin: '0 0 10px 0' },
  subPrompt: { color: '#4ADE80', fontSize: '0.9rem', opacity: 0.7, fontWeight: '600' },

  // Scan Styles
  scanContainer: { textAlign: 'center' },
  holoFrame: {
    width: '240px', height: '240px', borderRadius: '30px',
    overflow: 'hidden', position: 'relative', border: '1px solid #4ADE80',
    boxShadow: '0 0 40px rgba(74, 222, 128, 0.2)', marginBottom: '30px',
    animation: 'glowPulse 3s infinite ease-in-out'
  },
  previewImage: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 },
  laserBeam: {
    position: 'absolute', width: '100%', height: '6px',
    background: 'linear-gradient(90deg, transparent, #4ADE80, transparent)',
    boxShadow: '0 0 25px #4ADE80',
    animation: 'slowLaser 3.5s infinite linear' // Slowed down significantly
  },
  dataTag: {
    position: 'absolute', fontSize: '0.6rem', color: '#4ADE80',
    fontFamily: 'monospace', background: 'rgba(0,0,0,0.5)', padding: '2px 5px'
  },
  loadingStatus: { marginTop: '20px' },
  pulseText: { 
    fontSize: '0.75rem', fontWeight: '900', color: '#4ADE80', 
    letterSpacing: '2px', animation: 'textFlicker 1.5s infinite'
  },
  miniProgress: { width: '100px', height: '2px', background: 'rgba(255,255,255,0.1)', margin: '15px auto 0', borderRadius: '10px' },
  miniFill: { width: '40%', height: '100%', background: '#4ADE80' },

  errorAlert: {
    marginTop: '30px', padding: '15px 25px', borderRadius: '20px',
    background: 'rgba(239, 68, 68, 0.05)', color: '#FCA5A5',
    border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center', fontSize: '0.85rem'
  },

  // Tips Styles
  tipsSection: { marginTop: '80px' },
  tipsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
  tipCard: { padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' },
  miniThumb: { width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' },
  tipTitle: { margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: '800' },
  tipDesc: { margin: 0, fontSize: '0.75rem', color: '#9CA3AF', lineHeight: '1.4' }
};