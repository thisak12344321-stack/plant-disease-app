import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ YOUR GNEWS API KEY (looks valid)
  const API_KEY = 'f2d6d0f0b8664d1b17db4fd123e32c26';

  const fetchFarmerNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://gnews.io/api/v4/search', {
        params: {
          q: 'farmer OR farming OR agriculture OR "plant disease" OR crops OR horticulture OR pesticide',
          lang: 'en',
          country: 'in',
          max: 20,
          apikey: API_KEY
        },
        timeout: 10000 // 10s timeout
      });

      const gnewsArticles = response.data.articles || [];
      
      // Filter agriculture keywords
      const keywords = ['farmer', 'farm', 'agriculture', 'plant disease', 'crop', 'crops', 'horticulture', 'pesticide', 'rural'];
      const filteredArticles = gnewsArticles.filter(article =>
        (article.title && keywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(article.title))) ||
        (article.description && keywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(article.description)))
      );

      // ✅ FIXED: Map GNews fields correctly
      const formattedArticles = filteredArticles.map(article => ({
        title: article.title || 'No title available',
        description: article.description || '',
        url: article.url || '#',
        urlToImage: article.image || null,
        publishedAt: article.publishedAt || new Date().toISOString(),
        source: { 
          name: article.publisher?.name || 
                article.source?.name || 
                article.source || 
                'Indian Agriculture News' 
        }
      }));

      setArticles(formattedArticles);
      console.log(`✅ Loaded ${formattedArticles.length} agriculture articles`);
      
    } catch (err) {
      console.error('GNews Error Details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      const errorMsg = err.response?.data?.message || 
                      (err.code === 'ECONNABORTED' ? 'Request timeout - slow connection' : 
                      'Failed to fetch news. Check internet or try refresh.');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerNews();
  }, []);

  return (
    <div style={styles.wrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap');
        
        .news-card { 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          backdrop-filter: blur(10px);
        }
        .news-card:hover { 
          transform: translateY(-8px); 
          border-color: rgba(74, 222, 128, 0.5);
          box-shadow: 0 20px 40px rgba(74, 222, 128, 0.15);
        }
        
        .custom-loader {
          width: 40px; height: 40px; 
          border: 3px solid rgba(74, 222, 128, 0.1);
          border-top: 3px solid #4ADE80; 
          border-radius: 50%;
          animation: spin 1s linear infinite; 
          margin: 20px auto;
        }
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        
        .refreshBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div style={styles.container}>
        <header style={styles.header}>
          <h2 style={styles.heroTitle}>
            <span style={{ color: '#4ADE80' }}>Latest Agriculture News</span>
          </h2>
          <div style={styles.divider} />
        </header>

        <div style={styles.actionRow}>
          <button 
            onClick={fetchFarmerNews} 
            style={{...styles.refreshBtn, ...(loading && styles.refreshBtnDisabled)}}
            disabled={loading}
          >
            {loading ? '🔄 Updating...' : '🔄 Refresh News'}
          </button>
        </div>

        {loading && <div className="custom-loader" />}

        {error && !loading && (
          <div style={styles.errorBox}>
            <p style={{ margin: 0 }}>{error}</p>
            <p style={styles.errorSubtext}>
              F12 → Console for detailed error | 
              <a href="https://gnews.io/" target="_blank" rel="noopener noreferrer" style={styles.errorLink}>
                {' '}Check quota
              </a>
            </p>
          </div>
        )}

        <div style={styles.newsGrid}>
          {articles.length === 0 && !loading && !error && (
            <p style={styles.emptyText}>No recent agricultural updates found in India.</p>
          )}

          {articles.map((article, index) => (
            <motion.div 
              key={`${article.url}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="news-card" 
              style={styles.card}
            >
              <div style={styles.imageWrapper}>
                {article.urlToImage ? (
                  <img 
                    src={article.urlToImage} 
                    alt={article.title.substring(0, 50)} 
                    style={styles.newsImg}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div style={styles.imgPlaceholder}>🌱</div>
                )}
                <div style={styles.sourceBadge}>
                  {article.source?.name?.substring(0, 20) || 'News'}
                </div>
              </div>

              <div style={styles.cardBody}>
                <h3 style={styles.newsTitle}>{article.title}</h3>
                <p style={styles.newsDesc}>
                  {article.description ? 
                    `${article.description.slice(0, 120)}${article.description.length > 120 ? '...' : ''}` : 
                    'Read the latest agricultural updates from India.'
                  }
                </p>
                
                <div style={styles.cardFooter}>
                  <span style={styles.dateText}>
                    {article.publishedAt ? 
                      new Date(article.publishedAt).toLocaleDateString('en-IN', { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                      }) : 'Recent'
                    }
                  </span>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={styles.readMore}
                  >
                    Read →
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ✅ COMPLETE FIXED STYLES
const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0A120E 0%, #1A1F14 100%)',
    color: '#F3F4F6',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden'
  },
  container: { maxWidth: '1200px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '50px' },
  heroTitle: { 
    fontFamily: "'Fraunces', serif", 
    fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
    margin: '0 0 20px 0', 
    color: '#fff',
    textShadow: '0 4px 20px rgba(74, 222, 128, 0.3)'
  },
  divider: { 
    width: '60px', height: '4px', 
    background: 'linear-gradient(90deg, #4ADE80, #22C55E)', 
    margin: '0 auto', 
    borderRadius: '2px' 
  },
  
  actionRow: { 
    display: 'flex', 
    justifyContent: 'center', 
    marginBottom: '60px' 
  },
  refreshBtn: {
    padding: '14px 36px', 
    borderRadius: '50px', 
    border: '2px solid rgba(74, 222, 128, 0.4)',
    background: 'rgba(74, 222, 128, 0.15)', 
    color: '#4ADE80', 
    fontWeight: '700', 
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  },
  refreshBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    background: 'rgba(74, 222, 128, 0.05)'
  },

  newsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '30px',
    marginTop: '20px'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '28px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backdropFilter: 'blur(20px)'
  },
  imageWrapper: { 
    position: 'relative', 
    width: '100%', 
    height: '220px',
    overflow: 'hidden'
  },
  newsImg: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },
  imgPlaceholder: { 
    width: '100%', 
    height: '100%', 
    background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(34, 197, 94, 0.05))', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '3rem',
    position: 'relative'
  },
  sourceBadge: { 
    position: 'absolute', 
    bottom: '16px', 
    left: '16px', 
    background: 'rgba(10, 18, 14, 0.9)',
    padding: '6px 12px', 
    borderRadius: '20px', 
    fontSize: '0.75rem', 
    fontWeight: '700', 
    color: '#4ADE80',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  },
  
  cardBody: { 
    padding: '28px', 
    flex: '1', 
    display: 'flex', 
    flexDirection: 'column' 
  },
  newsTitle: { 
    fontSize: '1.25rem', 
    lineHeight: '1.4', 
    fontWeight: '700', 
    marginBottom: '16px', 
    color: '#fff',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  newsDesc: { 
    fontSize: '0.95rem', 
    color: '#D1D5DB', 
    marginBottom: '24px', 
    lineHeight: '1.6',
    flexGrow: 1
  },
  
  cardFooter: { 
    marginTop: 'auto', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: '20px', 
    borderTop: '1px solid rgba(255,255,255,0.08)' 
  },
  dateText: { 
    fontSize: '0.8rem', 
    color: '#9CA3AF', 
    fontWeight: '600' 
  },
  readMore: { 
    color: '#4ADE80', 
    textDecoration: 'none', 
    fontSize: '0.9rem', 
    fontWeight: '700',
    transition: 'color 0.3s ease'
  },
  readMoreHover: {
    color: '#22C55E'
  },
  
  errorBox: { 
    textAlign: 'center', 
    color: '#FCA5A5', 
    background: 'rgba(252, 165, 165, 0.15)', 
    padding: '32px', 
    borderRadius: '20px', 
    marginBottom: '40px',
    border: '1px solid rgba(252, 165, 165, 0.3)',
    backdropFilter: 'blur(10px)'
  },
  errorSubtext: {
    fontSize: '0.85rem', 
    marginTop: '12px', 
    color: '#FBBF24'
  },
  errorLink: {
    color: '#4ADE80', 
    textDecoration: 'none',
    fontWeight: '600'
  },
  emptyText: { 
    textAlign: 'center', 
    gridColumn: '1/-1', 
    color: '#6B7280', 
    padding: '80px 20px',
    fontSize: '1.1rem'
  }
};
