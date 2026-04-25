import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';


import leafHealthy from '../assets/leafHealthy.jpg';
import plantCare from '../assets/plantCare.jpg';
import soilTips from '../assets/soilTips.jpg';
import growthTools from '../assets/growthTools.jpg';

export default function Home({ goToPage }) {
  const [city, setCity] = useState('Mumbai');
  const [liveData, setLiveData] = useState({ temperature: null, humidity: null, sunlight: null, tips: null });
  const [detailPage, setDetailPage] = useState(null);
  const API_KEY = '7fcef72053e5d7f3262c4408f8bcce00';

  const fetchWeatherData = async () => {
    if (!city) return alert('Please enter a city');
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      const data = response.data;
      setLiveData(prev => ({
        ...prev,
        temperature: data.main.temp.toFixed(1),
        humidity: data.main.humidity,
        sunlight: data.weather[0].main
      }));
    } catch {
      alert('Unable to fetch weather data for this city');
    }
  };

  const fetchPlantTips = () => {
    const tipsArray = [
      "🌱 Water early in the morning for best absorption.",
      "🌿 Use compost to improve soil nutrients.",
      "☀ Most plants need 4-6 hours of sunlight daily.",
      "💧 Avoid overwatering, check soil moisture first.",
      "🪴 Prune dead leaves to encourage new growth."
    ];
    const randomTip = tipsArray[Math.floor(Math.random() * tipsArray.length)];
    setLiveData(prev => ({ ...prev, tips: randomTip }));
  };

  const detailContent = {
    plantCare: {
      title: 'Plant Care Basics 🌱',
      img: plantCare,
      sections: [
        { title: 'Watering', text: 'Water early in morning or evening to help roots absorb moisture.' },
        { title: 'Pruning', text: 'Remove dead leaves to prevent diseases and encourage new growth.' },
        { title: 'Sunlight', text: 'Most plants need 4-6 hours of sunlight daily.' },
      ]
    },
    soilTips: {
      title: 'Soil & Nutrients 🌿',
      img: soilTips,
      sections: [
        { title: 'Soil Types', text: 'Use sandy, clay, loamy, or well-draining soil based on plant type.' },
        { title: 'Fertilizers', text: 'Use compost, organic manure, or balanced NPK fertilizers.' },
        { title: 'pH Balance', text: 'Maintain correct soil pH for nutrient absorption.' },
      ]
    },
    growthTools: {
      title: 'Tools & Accessories 🛠️',
      img: growthTools,
      sections: [
        { title: 'Gardening Tools', text: 'Trowels, pruners, and watering cans make care easier.' },
        { title: 'Pots & Planters', text: 'Choose right pot size and material for roots.' },
        { title: 'Support & Accessories', text: 'Use stakes, trellises, and labels to help growth.' },
      ]
    }
  };

  return (
    <div style={styles.mainContainer}>
      {/* Bio-Digital Ambient Background Glows */}
      <div style={styles.ambientGlow1} />
      <div style={styles.ambientGlow2} />
      
      {/* 🟢 TOP ACTION BAR */}
      <div style={styles.topBar}>
        <button onClick={() => goToPage('login')} style={styles.backBtn}>
          ↩ Exit to Login
        </button>
      </div>

      {/* 🟢 HERO SECTION */}
      <section style={styles.heroSection}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.heroGlass}
        >
          <div style={styles.badge}>Powered by PlantCare AI</div>
          <h1 style={styles.heroTitle}>Grow Smarter 🌿</h1>
          <p style={styles.heroSubtitle}>
            Instantly diagnose diseases and get pro-level treatment plans for your garden.
          </p>
          <button 
            onClick={() => goToPage('upload')} 
            style={styles.mainActionBtn}
          >
            📸 Diagnose My Plant
          </button>
        </motion.div>
      </section>

      {/* 🟢 DASHBOARD (WEATHER & TIPS) */}
      <section style={styles.dashboardGrid}>
        <div style={styles.glassCard}>
          <h3 style={styles.cardHeading}>☁️ Environment</h3>
          <div style={styles.searchBox}>
            <input 
              type="text" 
              value={city} 
              onChange={e => setCity(e.target.value)} 
              style={styles.input} 
              placeholder="City Name" 
            />
            <button onClick={fetchWeatherData} style={styles.iconBtn}>🔍</button>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.statItem}>
              <span style={styles.statVal}>{liveData.temperature || '--'}°</span>
              <span style={styles.statLabel}>TEMP</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statVal}>{liveData.humidity || '--'}%</span>
              <span style={styles.statLabel}>HUMIDITY</span>
            </div>
          </div>
        </div>

        <div style={styles.glassCard}>
          <h3 style={styles.cardHeading}>💡 Growth Tip</h3>
          <p style={styles.tipText}>
            {liveData.tips || "Tap below to reveal a secret for healthy growth!"}
          </p>
          <button onClick={fetchPlantTips} style={styles.secondaryBtn}>Reveal Tip</button>
        </div>
      </section>

      {/* 🟢 INFO CARDS */}
      <section style={styles.infoGrid}>
        {['plantCare', 'soilTips', 'growthTools'].map((key) => (
          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            key={key} 
            style={styles.categoryCard}
            onClick={() => setDetailPage(key)}
          >
            <div style={styles.imgWrapper}>
              <img src={detailContent[key].img} alt={key} style={styles.cardImg} />
              <div style={styles.imgOverlay} />
            </div>
            <div style={styles.cardContent}>
              <h3 style={styles.categoryTitle}>{detailContent[key].title}</h3>
              <span style={styles.categoryLink}>Explore Guide →</span>
            </div>
          </motion.div>
        ))}
      </section>

      {/* 🟢 DETAIL MODAL */}
      <AnimatePresence>
        {detailPage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              style={styles.modalContent}
            >
              <button onClick={() => setDetailPage(null)} style={styles.closeBtn}>✕</button>
              <h2 style={styles.modalTitle}>{detailContent[detailPage].title}</h2>
              <div style={styles.modalBody}>
                {detailContent[detailPage].sections.map((s, i) => (
                  <div key={i} style={styles.modalSection}>
                    <h4 style={styles.modalSectionTitle}>{s.title}</h4>
                    <p style={styles.modalSectionText}>{s.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  mainContainer: {
    minHeight: '100vh',
    backgroundColor: '#050806', 
    color: '#e0f2f1',
    padding: '20px',
    fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif",
    position: 'relative',
    overflow: 'hidden'
  },
  ambientGlow1: {
    position: 'absolute', top: '-10%', right: '-5%', width: '50vw', height: '50vw',
    background: 'radial-gradient(circle, rgba(46, 204, 113, 0.08) 0%, transparent 70%)',
    zIndex: 0, pointerEvents: 'none'
  },
  ambientGlow2: {
    position: 'absolute', bottom: '-10%', left: '-5%', width: '40vw', height: '40vw',
    background: 'radial-gradient(circle, rgba(39, 174, 96, 0.05) 0%, transparent 70%)',
    zIndex: 0, pointerEvents: 'none'
  },
  topBar: { padding: '10px 0', display: 'flex', zIndex: 10, position: 'relative' },
  backBtn: {
    padding: '10px 24px', borderRadius: '14px', border: '1px solid rgba(46, 204, 113, 0.3)',
    background: 'rgba(255, 255, 255, 0.02)', color: '#2ecc71', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: '600', backdropFilter: 'blur(10px)'
  },
  heroSection: { padding: '60px 0', textAlign: 'center', zIndex: 1, position: 'relative' },
  heroGlass: {
    background: 'rgba(255, 255, 255, 0.01)', backdropFilter: 'blur(40px)',
    borderRadius: '50px', padding: '80px 30px', border: '1px solid rgba(255, 255, 255, 0.05)',
    maxWidth: '900px', margin: '0 auto', boxShadow: '0 40px 100px rgba(0, 0, 0, 0.5)'
  },
  badge: {
    display: 'inline-block', padding: '8px 20px', borderRadius: '100px',
    background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', fontSize: '0.7rem',
    fontWeight: '800', letterSpacing: '1.5px', marginBottom: '25px', border: '1px solid rgba(46, 204, 113, 0.2)'
  },
  heroTitle: {
    fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: '900', margin: '0 0 25px 0',
    background: 'linear-gradient(to bottom, #ffffff, #a8ff78)', WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent', lineHeight: '1.1'
  },
  heroSubtitle: {
    fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 45px',
    lineHeight: '1.7', fontWeight: '400'
  },
  mainActionBtn: {
    padding: '24px 60px', fontSize: '1.1rem', fontWeight: '800', borderRadius: '22px',
    border: 'none', background: '#2ecc71', color: '#050806', cursor: 'pointer',
    boxShadow: '0 15px 40px rgba(46, 204, 113, 0.3)', transition: 'all 0.3s ease'
  },
  dashboardGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px', maxWidth: '1100px', margin: '50px auto', zIndex: 1, position: 'relative'
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.02)', borderRadius: '35px', padding: '40px',
    border: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'
  },
  cardHeading: {
    fontSize: '0.8rem', color: '#2ecc71', textTransform: 'uppercase',
    letterSpacing: '2.5px', marginBottom: '30px', fontWeight: '800'
  },
  searchBox: { display: 'flex', gap: '12px', marginBottom: '35px' },
  input: {
    flex: 1, padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.3)', color: '#FFFFFF', outline: 'none', fontSize: '0.95rem'
  },
  iconBtn: { background: '#2ecc71', border: 'none', borderRadius: '16px', padding: '0 20px', cursor: 'pointer' },
  statsRow: { display: 'flex', justifyContent: 'space-around', alignItems: 'center' },
  statDivider: { width: '1px', height: '40px', background: 'rgba(255, 255, 255, 0.1)' },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statVal: { fontSize: '2.6rem', fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: '0.65rem', color: '#64748b', fontWeight: '800', letterSpacing: '1px' },
  tipText: {
    fontSize: '1.1rem', lineHeight: '1.6', minHeight: '100px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontStyle: 'italic'
  },
  secondaryBtn: {
    width: '100%', background: 'transparent', border: '1px solid rgba(46, 204, 113, 0.4)',
    color: '#2ecc71', padding: '16px', borderRadius: '18px', cursor: 'pointer', fontWeight: '700'
  },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', padding: '60px 0' },
  categoryCard: {
    background: 'rgba(255, 255, 255, 0.02)', borderRadius: '40px', overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer', position: 'relative'
  },
  imgWrapper: { height: '240px', position: 'relative' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  imgOverlay: {
    position: 'absolute', bottom: 0, left: 0, width: '100%', height: '60%',
    background: 'linear-gradient(to top, #050806, transparent)'
  },
  cardContent: { padding: '30px' },
  categoryTitle: { fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px', color: '#fff' },
  categoryLink: { color: '#2ecc71', fontSize: '0.9rem', fontWeight: '700' },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(20px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px'
  },
  modalContent: {
    background: '#0a140f', padding: '50px', borderRadius: '50px', maxWidth: '600px',
    width: '100%', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 50px 100px rgba(0, 0, 0, 0.6)'
  },
  closeBtn: {
    position: 'absolute', top: '30px', right: '30px', background: 'rgba(255, 255, 255, 0.05)',
    border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer'
  },
  modalTitle: { fontSize: '2.2rem', fontWeight: '900', marginBottom: '40px', textAlign: 'center' },
  modalSection: {
    marginBottom: '25px', background: 'rgba(255, 255, 255, 0.03)', padding: '25px',
    borderRadius: '25px', borderLeft: '5px solid #2ecc71'
  },
  modalSectionTitle: { color: '#2ecc71', margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '800' },
  modalSectionText: { fontSize: '1rem', color: '#94a3b8', lineHeight: '1.6' }
};