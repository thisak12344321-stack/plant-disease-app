import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

export default function Products({
  goToPage,
  diagnosisResult,
  user,
  setUser,
  scrollToRecommended,
  setScrollToRecommended
}) {
  const recommendedRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [orderDetails, setOrderDetails] = useState({ name: '', phone: '', address: '' });
  const [successMessage, setSuccessMessage] = useState('');

 
  const [paymentStep, setPaymentStep] = useState("checkout");
  const [upiId, setUpiId] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const allProducts = [
    { id: 1, name: 'Copper Fungicide Spray', category: 'fungicide', treats: ['blight', 'scab', 'rust', 'spot', 'mildew'], price: 499 },
    { id: 2, name: 'Neem Oil', category: 'organic pesticide', treats: ['aphids', 'spot', 'mildew', 'fungus'], price: 299 },
    { id: 3, name: 'Organic Plant Booster', category: 'fertilizer', treats: ['all'], price: 399 },
    { id: 4, name: 'Liquid Seaweed Extract', category: 'fertilizer', treats: ['all'], price: 599 },
    { id: 5, name: 'Precision Sprayer', category: 'tool', treats: ['application'], price: 1499 },
    { id: 6, name: 'Plant Disease Monitoring Kit', category: 'tool', treats: ['monitoring'], price: 999 }
  ];

  const diseaseNames = diagnosisResult?.diseases
    ?.map(d => d.disease?.toLowerCase())
    ?.filter(d => d && d !== "healthy");

  let recommendedProducts = [];
  if (diseaseNames && diseaseNames.length > 0) {
    recommendedProducts = allProducts.filter(product => {
      if (product.treats.includes("all")) return true;
      return diseaseNames.some(disease =>
        product.treats.some(keyword => disease.includes(keyword))
      );
    });
  }

  useEffect(() => {
    if (scrollToRecommended && diagnosisResult && recommendedProducts.length > 0 && recommendedRef.current) {
      recommendedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setScrollToRecommended(false);
    }
  }, [scrollToRecommended, diagnosisResult, recommendedProducts, setScrollToRecommended]);

  const handleBuyClick = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setOrderDetails({ name: '', phone: '', address: '' });
    setPaymentStep("checkout");
    setShowPopup(true);
  };

  const isValidIndianPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

  const handleOfflineOrder = async (product) => {
    if (!orderDetails.name || !orderDetails.phone || !orderDetails.address) {
      setSuccessMessage("Please fill all details");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    if (!isValidIndianPhone(orderDetails.phone)) {
      setSuccessMessage('Enter a valid 10-digit number');
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    if (!user) {
      setSuccessMessage("Please login first");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    const order = {
      productName: product.name,
      productCategory: product.category,
      quantity,
      pricePerUnit: product.price,
      totalAmount: product.price * quantity,
      ...orderDetails,
      paymentType: "COD"
    };

    try {
      const res = await fetch("https://plant-disease-app-qigz.onrender.com/offline-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: user.email, order })
      });
      if (res.ok) {
        setUser(prev => ({ ...prev, purchasedItems: [...(prev.purchasedItems || []), order] }));
        setShowPopup(false);
        setSuccessMessage(`✅ Order placed: ${product.name}`);
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setSuccessMessage("Server error");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handlePayment = async (product) => {
    if (!orderDetails.name || !orderDetails.phone) {
      setSuccessMessage("Fill name & phone");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    if (!isValidIndianPhone(orderDetails.phone)) {
      setSuccessMessage("Enter valid 10-digit phone");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    if (!user) {
      setSuccessMessage("Please login first");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    setPaymentStep("upi");
  };

  const finishFakePayment = async () => {
    if (!upiId.trim()) {
      setSuccessMessage("Enter UPI ID");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    const totalAmount = selectedProduct.price * quantity;
    const purchasedItem = {
      productName: selectedProduct.name,
      productCategory: selectedProduct.category,
      quantity,
      pricePerUnit: selectedProduct.price,
      totalAmount,
      ...orderDetails,
      paymentType: "ONLINE",
      upiId: upiId.trim()
    };

    setIsPaying(true);

    setTimeout(async () => {
      try {
        const res = await fetch(
          "https://plant-disease-app-qigz.onrender.com/mock-payment",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userEmail: user.email,
              product: purchasedItem,
              shouldSucceed: true
            })
          }
        );

        if (!res.ok) {
          const err = await res.json();
          throw err;
        }

        const data = await res.json();
        const savedItem = data.userPurchasedItem;

        setUser(prev => ({
          ...prev,
          purchasedItems: [...(prev.purchasedItems || []), savedItem]
        }));

        setSuccessMessage(`✅ payment received via UPI: ${upiId}`);
        setTimeout(() => setSuccessMessage(""), 3000);
      return;
      } catch (err) {
        console.error("payment error:", err);
        setSuccessMessage("UPI payment failed");
      }

      setShowPopup(false);
      setPaymentStep("checkout");
      setUpiId("");
      setIsPaying(false);
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Fraunces:opsz,wght@9..144,700&display=swap');
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background: rgba(74, 222, 128, 0.3); border-radius: 10px; }
        
        .aura-bg {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle at 10% 10%, rgba(74, 222, 128, 0.05) 0%, transparent 40%),
                      radial-gradient(circle at 90% 90%, rgba(34, 197, 94, 0.05) 0%, transparent 40%);
          pointer-events: none;
          z-index: -1;
        }
      `}</style>

      <div className="aura-bg" />

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.successToast}
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🟢 AI RECOMMENDED SECTION */}
      {diagnosisResult && recommendedProducts.length > 0 && (
        <div ref={recommendedRef} style={styles.section}>
          <div style={styles.badge}>Precision Protocol</div>
          <h2 style={styles.sectionTitle}>Prescribed Treatments</h2>
          <div style={styles.horizontalScroll}>
            {recommendedProducts.map(p => (
              <motion.div
                key={p.id}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={styles.recommendedCard}
                onClick={() => handleBuyClick(p)}
              >
                <div style={styles.glowOverlay} />
                <div style={styles.iconCircle}>
                  <span style={{ filter: 'drop-shadow(0 0 8px #4ADE80)' }}>🌿</span>
                </div>
                <h3 style={styles.cardTitle}>{p.name}</h3>
                <p style={styles.cardCat}>{p.category}</p>
                <div style={styles.priceContainer}>
                  <span style={styles.currency}>₹</span>
                  <span style={styles.priceValue}>{p.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 🟢 ALL PRODUCTS */}
      <div style={styles.section}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={styles.heroTitle}>Botanical <span style={{ color: '#4ADE80' }}>Supply</span></h1>
          <p style={styles.subText}>Browse our agricultural product catalog</p>
        </div>

        <div style={styles.productGrid}>
          {allProducts.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              style={styles.productCard}
              onClick={() => handleBuyClick(p)}
            >
              <div style={styles.categoryTag}>{p.category}</div>
              <h3 style={styles.cardTitle}>{p.name}</h3>
              <p style={styles.priceTag}>₹{p.price}</p>
              <button style={styles.buyBtn}>Initiate Purchase</button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 🟢 CHECKOUT & UPI POPUP */}
      <AnimatePresence>
        {showPopup && selectedProduct && (
          <div style={styles.modalOverlay}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={styles.modalContent}
            >
              <button
                onClick={() => {
                  setShowPopup(false);
                  setPaymentStep("checkout");
                }}
                style={styles.closeModalBtn}
              >
                ✕
              </button>

              {paymentStep === "checkout" && (
                <>
                  <p style={styles.modalLabel}>Selected Item</p>
                  <h2 style={styles.modalHeader}>{selectedProduct.name}</h2>

                  <div style={styles.quantityRow}>
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      style={styles.qtyBtn}
                    >
                      −
                    </button>
                    <div style={styles.qtyDisplay}>
                      <span style={styles.qtyText}>{quantity}</span>
                      <span style={{ fontSize: '0.6rem', color: '#71717A' }}>UNITS</span>
                    </div>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      style={styles.qtyBtn}
                    >
                      +
                    </button>
                  </div>

                  <div style={styles.totalBox}>
                    <span>Payable Amount</span>
                    <span style={{ color: '#4ADE80', fontWeight: '800' }}>
                      ₹{selectedProduct.price * quantity}
                    </span>
                  </div>

                  <div style={styles.inputGroup}>
                    <input
                      placeholder="Full Name"
                      style={styles.input}
                      onChange={e => setOrderDetails({ ...orderDetails, name: e.target.value })}
                    />
                    <input
                      placeholder="Mobile Number"
                      style={styles.input}
                      onChange={e => setOrderDetails({ ...orderDetails, phone: e.target.value })}
                    />
                    <textarea
                      placeholder="Delivery Address"
                      style={{ ...styles.input, height: '100px', resize: 'none' }}
                      onChange={e => setOrderDetails({ ...orderDetails, address: e.target.value })}
                    />
                  </div>

                  <div style={styles.actionRow}>
                    <button
                      onClick={() => handleOfflineOrder(selectedProduct)}
                      style={styles.codBtn}
                    >
                      Offline COD
                    </button>
                    <button
                      onClick={() => handlePayment(selectedProduct)}
                      style={styles.onlineBtn}
                    >
                      Secure Checkout
                    </button>
                  </div>
                </>
              )}

              {paymentStep === "upi" && (
                <>
                  <h2 style={styles.modalHeader}>Pay via UPI</h2>

                  <p style={{ fontSize: '0.9rem', color: '#B1B1B1', margin: '10px 0 20px' }}>
                    Use any UPI app to send money to:
                  </p>

                  <div style={{
                    background: 'rgba(74, 222, 128, 0.1)',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    marginBottom: '20px'
                  }}>
                    <span style={{ color: '#4ADE80', fontWeight: '600' }}>
                      plantdoc@okaxis
                    </span>
                  </div>

                  <div style={styles.inputGroup}>
                    <input
                      type="text"
                      placeholder="Enter UPI ID (e.g., myupi@okaxis)"
                      style={styles.input}
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                    />
                  </div>

                  <div style={styles.actionRow}>
                    <button
                      onClick={() => setPaymentStep("checkout")}
                      style={styles.codBtn}
                    >
                      Back
                    </button>
                    <button
                      onClick={finishFakePayment}
                      style={styles.onlineBtn}
                      disabled={isPaying}
                    >
                      {isPaying ? "Processing..." : "Pay Now via UPI"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px',
    color: '#F3F4F6',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: '#050806'
  },
  successToast: {
    position: 'fixed',
    top: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(74, 222, 128, 0.9)',
    backdropFilter: 'blur(10px)',
    color: '#050806',
    padding: '16px 40px',
    borderRadius: '100px',
    zIndex: 5000,
    fontWeight: '800',
    fontSize: '0.9rem',
    boxShadow: '0 20px 40px rgba(74, 222, 128, 0.3)',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  section: { marginBottom: '100px' },
  badge: {
    display: 'table',
    margin: '0 auto 15px',
    padding: '6px 16px',
    borderRadius: '100px',
    background: 'rgba(74, 222, 128, 0.1)',
    color: '#4ADE80',
    fontSize: '0.65rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    border: '1px solid rgba(74, 222, 128, 0.2)'
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '2.8rem',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '40px',
    fontFamily: "'Fraunces', serif"
  },
  

  heroTitle: {
    fontSize: '4rem',
    fontWeight: '800',
    margin: '0 0 10px 0',
    fontFamily: "'Fraunces', serif"
  },
  subText: {
    color: '#71717A',
    fontSize: '1.1rem'
  },
  horizontalScroll: {
    display: 'flex',
    gap: '25px',
    overflowX: 'auto',
    padding: '20px 10px',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch'
  },
  recommendedCard: {
    minWidth: '320px',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '40px',
    borderRadius: '40px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
    scrollSnapAlign: 'center'
  },
  glowOverlay: {
    position: 'absolute',
    top: '-50%', left: '-50%', width: '200%', height: '200%',
    background: 'radial-gradient(circle at center, rgba(74, 222, 128, 0.05) 0%, transparent 50%)',
    pointerEvents: 'none'
  },
  iconCircle: {
    width: '80px', height: '80px',
    background: 'rgba(74, 222, 128, 0.1)',
    borderRadius: '30px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 25px',
    fontSize: '2rem',
    border: '1px solid rgba(74, 222, 128, 0.2)'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px'
  },
  productCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '40px',
    borderRadius: '44px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    textAlign: 'left',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
    categoryTag: {
        fontSize: '0.6rem',
        color: '#71717A',
        textTransform: 'uppercase',
        fontWeight: '800',
        letterSpacing: '1.5px',
        marginBottom: '15px'},
    
    
      cardTitle: { fontSize: '1.4rem', fontWeight: '700', margin: '0 0 15px 0', color: '#fff' },
      priceTag: { fontSize: '1.8rem', fontWeight: '300', color: '#4ADE80', marginBottom: '25px' },
      buyBtn: {
        width: '100%',
        padding: '16px',
        borderRadius: '20px',
        border: '1px solid rgba(74, 222, 128, 0.3)',
        background: 'rgba(74, 222, 128, 0.05)',
        color: '#4ADE80',
        fontWeight: '800',
        cursor: 'pointer',
        transition: '0.3s'
      },
      modalOverlay: {
        position: 'fixed',
        top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 4000,
        backdropFilter: 'blur(20px)',
        padding: '20px'
      },
      modalContent: { 
        background: '#0A0F0C', 
        padding: '30px 24px 20px 24px',
        borderRadius: '28px', 
        maxWidth: '380px', 
        width: '100%', 
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column'
      },
    
    
      closeModalBtn: { 
        position: 'absolute', 
        top: '16px', 
        right: '16px', 
        background: 'rgba(74, 222, 128, 0.1)', 
        border: 'none', 
        color: '#4ADE80', 
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: '0.2s',
        zIndex: 10 
      },
      modalHeader: { 
        fontSize: '1.2rem', 
        fontWeight: '800', 
        marginBottom: '12px',
        textAlign: 'center' 
      },
      quantityRow: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '15px', 
        marginBottom: '15px', 
        background: 'rgba(255,255,255,0.03)', 
        padding: '10px', 
        borderRadius: '14px' 
      },
      totalBox: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '10px 15px', 
        background: 'rgba(74, 222, 128, 0.05)', 
        borderRadius: '12px', 
        marginBottom: '15px',
        fontSize: '0.85rem' 
      },
      inputGroup: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        marginBottom: '18px' 
      },
      input: { 
        padding: '10px 12px', 
        borderRadius: '12px', 
        border: '1px solid rgba(255,255,255,0.05)', 
        background: 'rgba(255,255,255,0.02)', 
        color: '#fff', 
        outline: 'none', 
        fontSize: '0.85rem' 
      },
      actionRow: { 
        display: 'flex', 
        gap: '10px',
        marginTop: 'auto'
      }};