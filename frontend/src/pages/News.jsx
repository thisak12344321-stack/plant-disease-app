import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get your FREE GNews API key from https://gnews.io/
  const API_KEY = 'f2d6d0f0b8664d1b17db4fd123e32c26'; // Replace with your key

  const fetchFarmerNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://gnews.io/api/v4/search`,
        {
          params: {
            q: 'farmer OR farming OR agriculture OR "plant disease" OR crops OR horticulture OR pesticide',
            lang: 'en',
            country: 'in', // India focus
            max: 20,
            apikey: API_KEY
          }
        }
      );

      // GNews response structure is slightly different
      const gnewsArticles = response.data.articles || [];
      
      // Filter for agriculture keywords (same logic)
      const keywords = ['farmer', 'farm', 'agriculture', 'plant disease', 'crop', 'crops', 'horticulture', 'pesticide', 'rural'];
      const filteredArticles = gnewsArticles.filter(article =>
        (article.title && keywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(article.title))) ||
        (article.description && keywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(article.description)))
      );

      // Map GNews fields to match your existing UI
      const formattedArticles = filteredArticles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.image,
        publishedAt: article.publishedAt,
        source: { name: article.publisher?.name || article.source || 'News' }
      }));

      setArticles(formattedArticles);
    } catch (err) {
      console.error('GNews Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch agricultural news. Please check API key.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on load
  useEffect(() => {
    fetchFarmerNews();
  }, []);

  return (
    <div style={styles.wrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap');
        
        .news-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .news-card:hover { transform: translateY(-8px); border-color: rgba(74, 222, 128, 0.3); }
        
        .custom-loader {
          width: 40px; height: 40px; border: 3px solid rgba(74, 222, 128, 0.1);
          border-top: 3px solid #4ADE80; border-radius: 50%;
          animation: spin 1s linear infinite; margin: 20px auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <div style={styles.container}>
        <header style={styles.header}>
          <h2 style={styles.heroTitle}>
            <span style={{ color: '#4ADE80' }}>Latest Agriculture News</span>
          </h2>
          <div style={styles.divider} />
        </header>

        <div style={styles.actionRow}>
          <button onClick={fetchFarmerNews} style={styles.refreshBtn} disabled={loading}>
            {loading ? 'Updating Feed...' : '🔄 Refresh News'}
          </button>
        </div>

        {loading && <div className="custom-loader" />}

        {error && (
          <div style={styles.errorBox}>
            <p>{error}</p>
            <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>
              Get free key: <a href="https://gnews.io/" target="_blank" style={{ color: '#4ADE80' }}>gnews.io</a>
            </p>
          </div>
        )}

        <div style={styles.newsGrid}>
          {articles.length === 0 && !loading && !error && (
            <p style={styles.emptyText}>No recent agricultural updates found.</p>
          )}

          {articles.map((article, index) => (
            <motion.div 
              key={article.url || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="news-card" 
              style={styles.card}
            >
              <div style={styles.imageWrapper}>
                {article.urlToImage ? (
                  <img src={article.urlToImage} alt={article.title} style={styles.newsImg} />
                ) : (
                  <div style={styles.imgPlaceholder}>🌱</div>
                )}
                <div style={styles.sourceBadge}>{article.source?.name}</div>
              </div>

              <div style={styles.cardBody}>
                <h3 style={styles.newsTitle}>{article.title}</h3>
                <p style={styles.newsDesc}>
                  {article.description ? (article.description.slice(0, 120) + '...') : 'Read full report below.'}
                </p>
                
                <div style={styles.cardFooter}>
                  <span style={styles.dateText}>
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(undefined, { 
                      month: 'short', day: 'numeric' 
                    }) : 'Recent'}
                  </span>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" style={styles.readMore}>
                    Read Report →
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

// Same styles - no changes needed
const styles = {
  wrapper: {
    minHeight: '100vh',
    background: '#0A120E',
    color: '#F3F4F6',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    padding: '40px 20px'
  },
  container: { maxWidth: '1100px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '40px' },
  heroTitle: { fontFamily: "'Fraunces', serif", fontSize: '3rem', margin: '10px 0', color: '#fff' },
  divider: { width: '40px', height: '4px', background: '#4ADE80', margin: '0 auto', borderRadius: '10px' },
  
  actionRow: { display: 'flex', justifyContent: 'center', marginBottom: '50px' },
  refreshBtn: {
    padding: '12px 30px', borderRadius: '100px', border: '1px solid rgba(74, 222, 128, 0.4)',
    background: 'rgba(74, 222, 128, 0.1)', color: '#4ADE80', fontWeight: '700', cursor: 'pointer',
    transition: '0.3s'
  },

  newsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '25px'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column'
  },
  imageWrapper: { position: 'relative', width: '100%', height: '200px' },
  newsImg: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPlaceholder: { 
    width: '100%', height: '100%', background: 'rgba(74, 222, 128, 0.05)', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' 
  },
  sourceBadge: { 
    position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(10, 18, 14, 0.8)',
    padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '700', color: '#4ADE80',
    backdropFilter: 'blur(4px)'
  },
  
  cardBody: { padding: '20px', flex: '1', display: 'flex', flexDirection: 'column' },
  newsTitle: { fontSize: '1.15rem', lineHeight: '1.4', fontWeight: '700', marginBottom: '12px', color: '#fff' },
  newsDesc: { fontSize: '0.9rem', color: '#9CA3AF', marginBottom: '20px', lineHeight: '1.6' },
  
  cardFooter: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' },
  dateText: { fontSize: '0.75rem', color: '#6B7280', fontWeight: '600' },
  readMore: { color: '#4ADE80', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' },
  
  errorBox: { textAlign: 'center', color: '#FCA5A5', background: 'rgba(252, 165, 165, 0.1)', 
    padding: '20px', borderRadius: '12px', marginBottom: '30px' },
  emptyText: { textAlign: 'center', gridColumn: '1/-1', color: '#6B7280', padding: '50px' }
};
