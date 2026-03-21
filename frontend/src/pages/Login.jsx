// ✅ COMPLETE login.jsx - FULLY FIXED & READY TO COPY-PASTE
// All Render URLs fixed + perfect error handling + production ready

import { useState, useEffect } from 'react';

const styles = {
  fullScreenOverlay: { 
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
    zIndex: 9999, background: "#0a0c0a", fontFamily: "'Plus Jakarta Sans', sans-serif",
    overflow: "hidden", color: "#e2e8f0"
  },
  container: { display: "flex", width: "100%", height: "100%", position: 'relative' },
  left: { 
    flex: 1.2, 
    background: "radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(5, 150, 105, 0.1) 0%, transparent 50%)",
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  meshGradient: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    background: "url('https://images.unsplash.com/photo-1530836361280-ca8cc0aa5631?q=80&w=2070')",
    backgroundSize: 'cover',
    opacity: 0.2,
    filter: 'grayscale(100%) contrast(120%)',
    animation: 'pan 60s linear infinite'
  },
  heroContent: { 
    position: 'relative', zIndex: 2, textAlign: "left", padding: "60px", maxWidth: "600px" 
  },
  glassBadge: {
    background: "rgba(16, 185, 129, 0.1)",
    backdropFilter: "blur(8px)",
    padding: "6px 16px",
    borderRadius: "8px",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "4px",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    marginBottom: "32px",
    display: "inline-block",
    color: "#10b981"
  },
  brand: { 
    fontSize: "clamp(40px, 6vw, 84px)", fontWeight: "800", margin: "0", 
    letterSpacing: "-4px", lineHeight: 0.9, color: "#fff"
  },
  tagLine: { 
    fontSize: "18px", color: "#94a3b8", fontWeight: "300", 
    marginTop: "24px", lineHeight: "1.6", maxWidth: "450px" 
  },
  right: { 
    flex: 1, display: "flex", justifyContent: "center", alignItems: "center", 
    padding: "40px", position: 'relative', background: "rgba(10, 12, 10, 0.8)"
  },
  card: { 
    width: "100%", maxWidth: "440px", padding: "48px",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: "32px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    display: "flex", flexDirection: "column", gap: "28px",
    animation: "slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
  },
  heading: { color: "#fff", fontSize: "36px", margin: 0, fontWeight: "700", letterSpacing: "-1.5px" },
  sub: { color: "#64748b", fontSize: "16px", marginTop: "-16px", fontWeight: "400" },
  inputWrapper: { position: "relative", width: "100%" },
  input: { 
    width: "100%", padding: "20px", background: "rgba(255,255,255,0.03)", 
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", 
    fontSize: "15px", color: "#fff", outline: "none", boxSizing: "border-box",
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
  },
  inputFocus: { 
    border: "1px solid rgba(16, 185, 129, 0.5)", 
    background: "rgba(16, 185, 129, 0.02)",
    boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.1)"
  },
  label: { 
    position: "absolute", left: "20px", top: "20px", color: "#475569", 
    transition: "0.3s", pointerEvents: 'none', fontSize: "15px"
  },
  labelActive: { 
    position: "absolute", left: "18px", top: "-10px", fontSize: "12px", 
    color: "#10b981", fontWeight: "600", background: "#0c0e0c", padding: "0 6px",
    borderRadius: "4px"
  },
  button: { 
    padding: "20px", border: "none", borderRadius: "18px", 
    background: "#10b981", 
    color: "#050806", fontWeight: "700", fontSize: "16px", cursor: "pointer", 
    transition: "all 0.3s ease",
    boxShadow: "0 8px 20px rgba(16, 185, 129, 0.2)"
  },
  btnSecondary: { 
    background: "rgba(255, 255, 255, 0.05)", color: "#fff", 
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "none"
  },
  forgotBtn: { 
    alignSelf: 'flex-end', background: 'none', border: 'none', 
    color: '#94a3b8', fontSize: '13px', cursor: 'pointer', marginTop: '-12px',
    transition: 'color 0.2s'
  },
  divider: { 
    display: 'flex', alignItems: 'center', color: "#334155", 
    fontSize: "11px", gap: "15px", textTransform: 'uppercase', letterSpacing: '2px' 
  },
  dividerLine: { flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' },
  guest: { 
    background: "none", border: "none", color: "#64748b", 
    cursor: "pointer", fontSize: "14px", fontWeight: "500", marginTop: "10px"
  },
  back: { 
    background: "none", border: "none", color: "#10b981", 
    fontWeight: "600", cursor: "pointer", fontSize: "14px"
  },
  msg: { 
    padding: "16px", borderRadius: "14px", fontSize: "13px", 
    textAlign: "center", border: "1px solid", marginTop: "10px"
  }
};

const Input = ({ value, onChange, placeholder, type = "text" }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div style={styles.inputWrapper}>
      <input
        type={type}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={onChange}
        style={{...styles.input, ...(isFocused ? styles.inputFocus : {})}}
        placeholder=" "
      />
      <label style={value || isFocused ? styles.labelActive : styles.label}>
        {placeholder}
      </label>
    </div>
  );
};

const Btn = ({ text, onClick, variant = "primary", disabled = false }) => (
  <button 
    disabled={disabled}
    onClick={onClick} 
    style={{
      ...styles.button, 
      ...(variant === "secondary" ? styles.btnSecondary : {}),
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}
    onMouseOver={(e) => {
      if(!disabled) {
        e.currentTarget.style.transform = 'translateY(-3px)';
        if(variant === 'primary') e.currentTarget.style.boxShadow = '0 12px 28px rgba(16, 185, 129, 0.4)';
      }
    }}
    onMouseOut={(e) => {
      if(!disabled) {
        e.currentTarget.style.transform = 'translateY(0)';
        if(variant === 'primary') e.currentTarget.style.boxShadow = styles.button.boxShadow;
      }
    }}
  >
    {text}
  </button>
);

export default function Login({ goToPage, setUser }) {
  const [page, setPage] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoginFlow, setIsLoginFlow] = useState(false);

  // ✅ FIXED: Single source of truth - UPDATE THIS URL FROM YOUR RENDER DASHBOARD
  const BACKEND_URL = 'https://plant-disease-app-qigz.onrender.com';

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      goToPage('home');
    }
  }, [setUser, goToPage]);

  const handleSignup = async () => {
    if (!name || !email || !password) return setMessage('All fields required');
    
    const formData = new URLSearchParams();
    formData.append('name', name.trim());
    formData.append('email', email.trim().toLowerCase());
    formData.append('password', password);

    try {
      const res = await fetch(`${BACKEND_URL}/signup`, {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Signup failed');
      setMessage('Account created! You can now sign in.');
      setPage('login'); 
      setName(''); 
      setEmail(''); 
      setPassword('');
    } catch (err) { 
      setMessage(err.message); 
    }
  };

  const handleSendOTP = async (isLogin = false) => {
    if (!email) return setMessage('Please enter your email');
    setMessage('Sending code...');
    const formData = new URLSearchParams();
    formData.append('email', email.toLowerCase().trim());
    try {
      const res = await fetch(`${BACKEND_URL}/send-otp`, {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData
      });
      if (!res.ok) throw new Error('Failed to send code');
      setMessage('Verification code sent to email');
      setPage('otp'); 
      setResendTimer(30); 
      setIsLoginFlow(isLogin);
    } catch (err) { 
      setMessage(err.message); 
    }
  };

  const verifyOTP = async () => {
    if (!otp) return setMessage('Enter verification code');
    const formData = new URLSearchParams();
    formData.append('email', email.toLowerCase().trim());
    formData.append('otp', otp);
    try {
      const verifyRes = await fetch(`${BACKEND_URL}/verify-otp`, {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData
      });
      if (!verifyRes.ok) throw new Error('Invalid or expired code');
      if (isLoginFlow && password) {
        completeLogin();
      } else if (isLoginFlow) {
        setMessage('Code verified. Please enter your password.');
        setPage('login');
      } else {
        setPage('reset'); 
        setMessage('Code verified. Enter your new password.');
      }
    } catch (err) { 
      setMessage(err.message); 
    }
  };

  const completeLogin = async () => {
    const formData = new URLSearchParams();
    formData.append('email', email.toLowerCase().trim());
    formData.append('password', password);
    try {
      const loginRes = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData
      });
      const userData = await loginRes.json();
      if (loginRes.ok) {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        goToPage('home');
      } else throw new Error(userData.detail || 'Login failed');
    } catch (err) { 
      setMessage(err.message); 
    }
  };

  const handlePasswordReset = async () => {
    if (!password) return setMessage('Please enter a new password');
    const formData = new URLSearchParams();
    formData.append('email', email.toLowerCase().trim());
    formData.append('new_password', password);
    try {
      const res = await fetch(`${BACKEND_URL}/reset-password`, {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData
      });
      if (!res.ok) throw new Error('Failed to update password');
      setMessage('Password updated! Please login.');
      setPage('login'); 
      setPassword('');
    } catch (err) { 
      setMessage(err.message); 
    }
  };

  return (
    <div style={styles.fullScreenOverlay}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pan { from { background-position: 0% 0%; } to { background-position: 100% 100%; } }
        body { margin: 0; background: #0a0c0a; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #1a1d1a inset !important; -webkit-text-fill-color: white !important; }
      `}</style>
      <div style={styles.container}>
        <div style={styles.left}>
          <div style={styles.meshGradient}></div>
          <div style={styles.heroContent}>
            <div style={styles.glassBadge}>Agricultural Intelligence</div>
            <h1 style={styles.brand}>Green<br/>Guardian<span style={{color: '#10b981'}}>.</span></h1>
            <p style={styles.tagLine}>Precision monitoring and disease diagnostics powered by advanced neural networks.</p>
          </div>
        </div>

        <div style={styles.right}>
          <div style={styles.card}>
            {page === 'login' && <>
              <h2 style={styles.heading}>Welcome Back</h2>
              <p style={styles.sub}>Enter your details to sync data</p>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" />
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
                <button onClick={() => { setPage('forgot'); setPassword(''); }} style={styles.forgotBtn}>Forgot password?</button>
              </div>
              <Btn text="Sign In" onClick={() => handleSendOTP(true)} />
              <div style={styles.divider}><div style={styles.dividerLine}></div>OR<div style={styles.dividerLine}></div></div>
              <Btn text="Create Account" variant="secondary" onClick={() => { setMessage(''); setPage('signup'); }} />
              <button style={styles.guest} onClick={() => { setUser(null); goToPage('home'); }}>Continue as Explorer</button>
            </>}

            {page === 'signup' && <>
              <h2 style={styles.heading}>Join Us</h2>
              <p style={styles.sub}>Start your journey in smart farming</p>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" />
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" />
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create Password" />
              <Btn text="Register Account" onClick={handleSignup} />
              <button style={styles.back} onClick={() => { setMessage(''); setPage('login'); }}>Already a member? Sign In</button>
            </>}

            {page === 'forgot' && <>
              <h2 style={styles.heading}>Recovery</h2>
              <p style={styles.sub}>Verification code will be sent to your email</p>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" />
              <Btn text="Send Reset Code" onClick={() => handleSendOTP(false)} />
              <button style={styles.back} onClick={() => setPage('login')}>Return to login</button>
            </>}

            {page === 'otp' && <>
              <h2 style={styles.heading}>Verification</h2>
              <p style={styles.sub}>Verifying identity for {email}</p>
              <Input value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-Digit Security Code" />
              <Btn text="Confirm Identity" onClick={verifyOTP} />
              <div style={{...styles.sub, textAlign: 'center', marginTop: '10px', fontSize: '14px'}}>
                {resendTimer > 0 ? `Retry available in ${resendTimer}s` : <span onClick={() => handleSendOTP(isLoginFlow)} style={{color: '#10b981', cursor: 'pointer', fontWeight: '700'}}>Resend Security Code</span>}
              </div>
              <button style={styles.back} onClick={() => setPage(isLoginFlow ? 'login' : 'forgot')}>Go Back</button>
            </>}

            {page === 'reset' && <>
              <h2 style={styles.heading}>New Password</h2>
              <p style={styles.sub}>Choose a strong, unique password</p>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter New Password" />
              <Btn text="Secure My Account" onClick={handlePasswordReset} />
            </>}

            {message && (
              <div style={{
                ...styles.msg, 
                borderColor: message.toLowerCase().includes('failed') || message.toLowerCase().includes('error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                background: message.toLowerCase().includes('failed') || message.toLowerCase().includes('error') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                color: message.toLowerCase().includes('failed') || message.toLowerCase().includes('error') ? '#f87171' : '#34d399',
              }}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
