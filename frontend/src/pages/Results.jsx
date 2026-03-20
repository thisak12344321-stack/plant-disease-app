import { useRef } from 'react';
import html2pdf from 'html2pdf.js';

export default function Results({ result, goToPage }) {
  const resultsRef = useRef(null);

  const handleDownloadPDF = () => {
    if (resultsRef.current && result) {
      const element = resultsRef.current;
      const opt = {
        margin: 0.5,
        filename: 'plant_diagnosis_report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        // CRITICAL FIX: Ensure the background color matches your UI exactly for the canvas
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: '#050806', // Matches your obsidian green/black
          logging: false 
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
    }
  };

  const diseaseInfo = {
    "Pepper__bell___Bacterial_spot": {
      symptoms: ["Small water-soaked spots on leaves", "Yellowing of leaves", "Spots may fall out leaving holes"],
      treatment: ["Use copper-based fungicides", "Remove infected leaves", "Practice crop rotation"],
      prevention: ["Avoid overhead watering", "Use disease-free seeds", "Maintain plant spacing"],
      additionalInfo: "Bacterial spot is common in warm, wet conditions."
    },
    "Pepper__bell___healthy": {
      symptoms: ["No visible disease", "Green leaves and firm fruits"],
      treatment: ["None required"],
      prevention: ["Maintain regular care", "Monitor for pests and diseases"],
      additionalInfo: "Plant is healthy."
    },
    "Potato___Early_blight": {
      symptoms: ["Dark spots on leaves with concentric rings", "Yellowing leaves"],
      treatment: ["Apply fungicides", "Remove infected leaves"],
      prevention: ["Crop rotation", "Avoid wetting leaves while watering"],
      additionalInfo: "Early blight spreads faster in humid weather."
    },
    "Potato___healthy": {
      symptoms: ["No disease", "Healthy foliage and tubers"],
      treatment: ["None"],
      prevention: ["Regular monitoring and good care"],
      additionalInfo: "Plant is healthy."
    },
    "Potato___Late_blight": {
      symptoms: ["Brown patches on leaves", "White mold on undersides", "Rotting tubers"],
      treatment: ["Use fungicides", "Remove infected plants"],
      prevention: ["Plant resistant varieties", "Avoid water logging"],
      additionalInfo: "Late blight spreads fast in humid weather."
    },
    "Tomato_Bacterial_spot": {
      symptoms: ["Small water-soaked lesions", "Yellowing leaves"],
      treatment: ["Copper sprays", "Remove infected leaves"],
      prevention: ["Clean seeds", "Avoid overhead watering"],
      additionalInfo: "Bacterial spot can reduce yield significantly."
    },
    "Tomato_Early_blight": {
      symptoms: ["Dark concentric rings on older leaves", "Yellowing leaves"],
      treatment: ["Fungicide sprays", "Remove infected leaves"],
      prevention: ["Crop rotation", "Avoid wetting leaves"],
      additionalInfo: "Early blight affects leaves first."
    },
    "Tomato_healthy": {
      symptoms: ["Green leaves", "Firm fruits"],
      treatment: ["None"],
      prevention: ["Regular care and monitoring"],
      additionalInfo: "Plant is healthy."
    },
    "Tomato_Late_blight": {
      symptoms: ["Dark brown lesions", "White mold on underside", "Fruit rot"],
      treatment: ["Fungicide sprays", "Remove infected leaves"],
      prevention: ["Resistant varieties", "Good drainage"],
      additionalInfo: "Late blight spreads fast in humid weather."
    },
    "Tomato_Leaf_Mold": {
      symptoms: ["Yellow spots on leaves", "Gray mold underside"],
      treatment: ["Fungicide sprays", "Remove affected leaves"],
      prevention: ["Avoid wet foliage", "Good air circulation"],
      additionalInfo: "Common in greenhouse tomatoes."
    },
    "Tomato_Septoria_leaf_spot": {
      symptoms: ["Small circular spots with dark edges", "Leaves drop prematurely"],
      treatment: ["Fungicide sprays", "Remove infected leaves"],
      prevention: ["Crop rotation", "Avoid wetting foliage"],
      additionalInfo: "Septoria is fungal disease common in humid areas."
    },
    "Tomato_Spider_mites_Two_spotted_spider_mite": {
      symptoms: ["Tiny spots on leaves", "Webbing on leaves", "Yellowing and leaf drop"],
      treatment: ["Miticides", "Wash leaves with water"],
      prevention: ["Maintain humidity", "Introduce natural predators"],
      additionalInfo: "Spider mites thrive in hot dry conditions."
    },
    "Tomato__Target_Spot": {
      symptoms: ["Small dark spots with concentric rings", "Leaves fall off"],
      treatment: ["Fungicide sprays", "Remove infected leaves"],
      prevention: ["Good spacing", "Avoid overhead watering"],
      additionalInfo: "Target spot mostly affects leaves and stems."
    },
    "Tomato__Tomato_mosaic_virus": {
      symptoms: ["Mottled leaves", "Stunted growth", "Reduced fruit quality"],
      treatment: ["Remove infected plants", "No chemical cure"],
      prevention: ["Use virus-free seeds", "Control aphids"],
      additionalInfo: "Virus spreads mechanically and via insects."
    },
    "Tomato__Tomato_YellowLeaf__Curl_Virus": {
      symptoms: ["Yellowing leaves", "Leaf curl", "Stunted growth"],
      treatment: ["Remove infected plants", "Control whiteflies"],
      prevention: ["Resistant varieties", "Remove weeds that harbor virus"],
      additionalInfo: "Spread by whiteflies; serious in tomato crops."
    }
  };

  const plantResults = Array.isArray(result) ? result : [result];

  return (
    <div style={styles.wrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Fraunces:opsz,wght@9..144,700&display=swap');
        
        .list-item { 
          list-style-type: none; 
          position: relative; 
          padding-left: 1.8rem; 
          margin-bottom: 0.8rem; 
          color: #D1D5DB; 
          font-size: 0.95rem; 
        }
        .list-item::before { 
          content: ''; 
          position: absolute; 
          left: 0; 
          top: 8px;
          width: 6px;
          height: 6px;
          background: #4ADE80;
          box-shadow: 0 0 12px #4ADE80;
          border-radius: 1px;
        }

        .aura-effect {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle at 50% -20%, rgba(74, 222, 128, 0.08) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }
        
        @media print { .no-print { display: none !important; } }
      `}</style>

      <div className="aura-effect" />

      <div style={styles.container}>
        <nav style={styles.navbar} className="no-print">
          <button onClick={() => goToPage('home')} style={styles.textBtn}>← Exit Report</button>
          <button onClick={handleDownloadPDF} disabled={!result} style={styles.downloadBtn}>
            Export PDF
          </button>
        </nav>

        <header style={styles.header}>
          <h1 style={styles.heroTitle}>Scan <span style={{color: '#4ADE80'}}>Analysis</span></h1>
          <div style={styles.divider} />
        </header>

        {!result ? (
          <div style={styles.emptyState}>
            <p>Waiting for data input...</p>
            <button onClick={() => goToPage('upload')} style={styles.primaryBtn}>Return to Scan</button>
          </div>
        ) : (
          <div ref={resultsRef} style={styles.resultsGrid}>
            {plantResults.map((plantObj, i) => (
              <div key={i} style={styles.card}>
                <div style={styles.cardHeader}>
                  <p style={styles.metaText}>Specimen identified as</p>
                  <h2 style={styles.plantTitle}>{plantObj.plant}</h2>
                </div>

                {plantObj.diseases?.map((diseaseObj, j) => {
                  const info = diseaseInfo[plantObj.classKey] || {};
                  const isHealthy = diseaseObj.disease.toLowerCase().includes('healthy');
                  
                  return (
                    <div key={j} style={styles.contentSection}>
                      <div style={{...styles.statusBox, borderLeft: isHealthy ? '3px solid #4ADE80' : '3px solid #FCA5A5'}}>
                        <div style={{flex: 1}}>
                          <p style={styles.label}>Condition Detected</p>
                          <h3 style={{...styles.diseaseName, color: isHealthy ? '#4ADE80' : '#FCA5A5'}}>
                            {diseaseObj.disease}
                          </h3>
                        </div>
                        <div style={styles.confidenceBlock}>
                          <span style={styles.confValue}>{diseaseObj.confidence}%</span>
                          <span style={styles.confLabel}>Accuracy</span>
                        </div>
                      </div>

                      <div style={styles.detailsGrid}>
                        <div style={styles.infoCol}>
                          <h4 style={styles.sectionHeading}>Physical Symptoms</h4>
                          <ul>{info.symptoms?.map((s,k)=><li key={k} className="list-item">{s}</li>)}</ul>
                        </div>
                        <div style={styles.infoCol}>
                          <h4 style={styles.sectionHeading}>Actionable Treatment</h4>
                          <ul>{info.treatment?.map((t,k)=><li key={k} className="list-item">{t}</li>)}</ul>
                        </div>
                        <div style={styles.infoCol}>
                          <h4 style={styles.sectionHeading}>Future Prevention</h4>
                          <ul>{info.prevention?.map((p,k)=><li key={k} className="list-item">{p}</li>)}</ul>
                        </div>
                      </div>

                      {info.additionalInfo && (
                        <div style={styles.noteBox}>
                          <span style={{color: '#4ADE80', fontWeight: '800', marginRight: '10px', fontSize: '0.7rem'}}>NOTE:</span>
                          {info.additionalInfo}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <footer style={styles.footer} className="no-print">
          <button 
            onClick={() => goToPage('products', { scrollToRecommended: true })} 
            style={styles.mainActionBtn}
          >
            Get Recommended Treatment
          </button>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: '#050806',
    color: '#F3F4F6', 
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    padding: '0 20px 100px 20px',
    position: 'relative'
  },
  container: { maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 },
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '40px 0', borderBottom: '1px solid rgba(255,255,255,0.03)'
  },
  textBtn: { background: 'none', border: 'none', color: '#71717A', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' },
  downloadBtn: {
    padding: '12px 28px', borderRadius: '14px', border: '1px solid rgba(74, 222, 128, 0.4)',
    background: 'rgba(74, 222, 128, 0.05)', color: '#4ADE80', fontWeight: '700', cursor: 'pointer',
    backdropFilter: 'blur(10px)', transition: 'all 0.3s ease'
  },
  header: { textAlign: 'center', padding: '80px 0 60px' },
  heroTitle: { fontFamily: "'Fraunces', serif", fontSize: '4rem', margin: '10px 0', color: '#fff', letterSpacing: '-1px' },
  divider: { width: '40px', height: '3px', background: '#4ADE80', margin: '0 auto', borderRadius: '10px', boxShadow: '0 0 15px #4ADE80' },
  
  resultsGrid: { display: 'flex', flexDirection: 'column', gap: '40px' },
  card: {
    background: 'rgba(255, 255, 255, 0.02)', 
    borderRadius: '48px', padding: '60px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  },
  cardHeader: { marginBottom: '50px', textAlign: 'center' },
  metaText: { fontSize: '0.8rem', color: '#71717A', marginBottom: '8px', letterSpacing: '1px' },
  plantTitle: { fontFamily: "'Fraunces', serif", fontSize: '2.8rem', margin: 0, color: '#fff' },
  
  statusBox: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.02)', padding: '35px', borderRadius: '24px', 
    marginBottom: '50px', border: '1px solid rgba(255, 255, 255, 0.03)'
  },
  label: { fontSize: '0.7rem', fontWeight: '800', color: '#4ADE80', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '2px' },
  diseaseName: { fontSize: '2.2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' },
  confidenceBlock: { textAlign: 'right', borderLeft: '1px solid rgba(255, 255, 255, 0.08)', paddingLeft: '35px' },
  confValue: { display: 'block', fontSize: '2.2rem', fontWeight: '300', color: '#fff' },
  confLabel: { fontSize: '0.65rem', color: '#71717A', textTransform: 'uppercase', fontWeight: '700' },
  
  detailsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '50px'
  },
  sectionHeading: { fontSize: '0.85rem', fontWeight: '800', marginBottom: '25px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1.5px' },
  noteBox: { 
    background: 'rgba(255, 255, 255, 0.02)', padding: '30px', borderRadius: '20px', 
    border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.95rem', color: '#9CA3AF', lineHeight: '1.6'
  },
  
  footer: { marginTop: '80px', textAlign: 'center' },
  mainActionBtn: {
    background: '#4ADE80', color: '#050806', padding: '24px 60px', borderRadius: '100px',
    border: 'none', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer',
    boxShadow: '0 20px 40px rgba(74, 222, 128, 0.2)', transition: 'transform 0.2s ease'
  },
  emptyState: { textAlign: 'center', padding: '120px 0', color: '#71717A' },
  primaryBtn: { marginTop: '30px', padding: '16px 40px', background: 'transparent', border: '1px solid #4ADE80', color: '#4ADE80', borderRadius: '16px', cursor: 'pointer', fontWeight: '700' }
};