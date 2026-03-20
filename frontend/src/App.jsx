import { useState, useEffect } from 'react';
import Home from './pages/Home.jsx';
import Products from './pages/products.jsx';
import Upload from './pages/Upload.jsx';
import Results from './pages/Results.jsx';
import Login from './pages/Login.jsx';
import News from './pages/News.jsx';

function App() {
  const savedUser = localStorage.getItem("user");

  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  const [currentPage, setCurrentPage] = useState(savedUser ? 'home' : 'login');
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrollToRecommended, setScrollToRecommended] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track mouse for the spotlight effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const goToPage = (page, options = {}) => {
    setCurrentPage(page);
    setProfileOpen(false); 
    if (options.scrollToRecommended) setScrollToRecommended(true);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsLoading(true);
    setDiagnosisResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Backend returned status " + res.status);

      const data = await res.json();
      setDiagnosisResult(data);
      goToPage("results");

    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.appWrapper}>
      {/* 🟢 HYPER-ADVANCED GLOBAL CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        body { margin: 0; padding: 0; background: #020604; overflow-x: hidden; color: #fff; }

        /* Animated Mesh Background */
        .mesh-bg {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: 
            radial-gradient(at 0% 0%, rgba(74, 222, 128, 0.08) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(34, 197, 94, 0.05) 0px, transparent 50%),
            radial-gradient(at 50% 100%, rgba(21, 128, 61, 0.08) 0px, transparent 50%);
          filter: blur(80px); z-index: -2;
        }

        /* Mouse Spotlight */
        .spotlight {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(74, 222, 128, 0.04), transparent 40%);
          z-index: -1; pointer-events: none;
        }

        .nav-link { 
          position: relative; padding: 10px 18px; border-radius: 12px;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); 
          color: rgba(255,255,255,0.6);
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .nav-link-active { 
          color: #4ADE80 !important; 
          background: rgba(74, 222, 128, 0.08) !important;
          box-shadow: inset 0 0 12px rgba(74, 222, 128, 0.1);
        }
        
        .nav-link-active::before {
          content: ''; position: absolute; top: -15px; left: 50%; transform: translateX(-50%);
          width: 40%; height: 2px; background: #4ADE80; box-shadow: 0 0 15px #4ADE80;
        }

        @keyframes premiumPop {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        .animate-pop { animation: premiumPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="mesh-bg" />
      <div className="spotlight" />

      {currentPage !== 'login' && (
        <nav style={styles.navbar}>
          <div style={styles.navContainer}>
            <div style={styles.logoGroup} onClick={() => goToPage('home')}>
              <div style={styles.logoIcon}>
                <div style={styles.logoInnerIcon}>🌿</div>
              </div>
              <h1 style={styles.logoText}>PlantCare <span style={{color: '#4ADE80', fontWeight: '400'}}>AI</span></h1>
            </div>

            <div style={styles.navLinks}>
              {[
                {id: 'home', label: 'Dashboard'},
                {id: 'upload', label: 'Scan'},
                {id: 'results', label: 'Report'},
                {id: 'products', label: 'Store'},
                {id: 'news', label: 'Insights'}
              ].map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => goToPage(item.id)} 
                  className={`nav-link ${currentPage === item.id ? 'nav-link-active' : ''}`}
                  style={styles.navItem}
                >
                  {item.label}
                </button>
              ))}

              {user && (
                <div style={styles.profileWrapper}>
                  <button onClick={() => setProfileOpen(!profileOpen)} style={styles.avatarBtn}>
                    <div style={styles.avatarInner}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </button>

                  {profileOpen && (
                    <div style={styles.profileDropdown} className="animate-pop">
                      <div style={styles.dropHeader}>
                        <p style={styles.dropName}>{user.name || 'User'}</p>
                        <p style={styles.dropEmail}>{user.email}</p>
                      </div>
                      
                      <div style={styles.purchaseSection}>
                        <p style={styles.dropLabel}>Activity Log</p>
                        <div style={styles.purchaseList}>
                          {user.purchasedItems?.length === 0 ? (
                            <p style={styles.emptyText}>No recent scan history</p>
                          ) : (
                            user.purchasedItems?.map((item, i) => (
                              <div key={i} style={styles.purchaseItem}>
                                <span>{item?.productName}</span>
                                <span style={{color: '#4ADE80'}}>₹{item?.totalAmount}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => { 
                          setUser(null); 
                          localStorage.removeItem("user");
                          goToPage('login'); 
                        }}
                        style={styles.logoutBtn}
                      >
                        Terminate Session
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      <main style={styles.mainContent}>
        {currentPage === 'login' && <Login goToPage={goToPage} setUser={setUser} />}
        {currentPage === 'home' && <Home goToPage={goToPage} />}
        {currentPage === 'upload' && <Upload goToPage={goToPage} handleImageUpload={handleImageUpload} isLoading={isLoading} setDiagnosisResult={setDiagnosisResult} />}
        {currentPage === 'products' && <Products goToPage={goToPage} diagnosisResult={diagnosisResult} user={user} setUser={setUser} scrollToRecommended={scrollToRecommended} setScrollToRecommended={setScrollToRecommended} />}
        {currentPage === 'results' && <Results result={diagnosisResult} goToPage={goToPage} diagnosisResult={diagnosisResult} />}
        {currentPage === 'news' && <News />}
      </main>
    </div>
  );
}

const styles = {
  appWrapper: {
    minHeight: '100vh',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  navbar: {
    position: 'sticky',
    top: '15px',
    margin: '0 20px',
    zIndex: 1000,
    background: 'rgba(10, 15, 12, 0.6)',
    backdropFilter: 'blur(32px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '0 30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  },
  navContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    height: '75px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
  logoIcon: { 
    width: '40px', height: '40px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #166534 0%, #064e3b 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid rgba(74, 222, 128, 0.3)'
  },
  logoInnerIcon: { fontSize: '1.2rem' },
  logoText: { fontFamily: "'Fraunces', serif", fontSize: '1.4rem', margin: 0, fontWeight: '700' },
  
  navLinks: { display: 'flex', gap: '15px', alignItems: 'center' },
  navItem: { 
    background: 'none', border: 'none', cursor: 'pointer', 
    fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' 
  },
  
  profileWrapper: { position: 'relative' },
  avatarBtn: {
    width: '42px', height: '42px', borderRadius: '50%', padding: '2px',
    background: 'linear-gradient(135deg, #4ADE80, #15803d)',
    border: 'none', cursor: 'pointer',
  },
  avatarInner: {
    width: '100%', height: '100%', borderRadius: '50%',
    background: '#020604', color: '#4ADE80',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '800', fontSize: '0.9rem'
  },
  
  profileDropdown: {
    position: 'absolute', top: '60px', right: 0, width: '280px',
    background: 'rgba(10, 15, 12, 0.9)', backdropFilter: 'blur(40px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px', padding: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
  },
  dropHeader: { marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  dropName: { margin: 0, fontSize: '1rem', fontWeight: '700' },
  dropEmail: { margin: '2px 0 0 0', fontSize: '0.75rem', color: '#9CA3AF' },
  
  purchaseSection: { marginBottom: '20px' },
  dropLabel: { fontSize: '0.65rem', fontWeight: '800', color: '#4ADE80', textTransform: 'uppercase', marginBottom: '12px', opacity: 0.8 },
  purchaseList: { maxHeight: '120px', overflowY: 'auto' },
  purchaseItem: { 
    display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', 
    padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' 
  },
  emptyText: { fontSize: '0.75rem', color: '#6B7280', textAlign: 'center', padding: '10px 0' },
  
  logoutBtn: {
    width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)',
    color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '700',
    cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px'
  },
  
  mainContent: {
    maxWidth: '1200px', margin: '0 auto', padding: '40px 20px'
  }
};

export default App;