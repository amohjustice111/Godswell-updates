import React from 'react';
import { createRoot } from 'react-dom/client';
import { Video, Users, ShieldCheck, MessageCircle, MonitorUp, Mic, Camera, Link2, ArrowRight, Sparkles, Play } from 'lucide-react';
import './styles.css';

function App() {
  const [notice, setNotice] = React.useState('');
  const [roomCode, setRoomCode] = React.useState('');
  const [showJoin, setShowJoin] = React.useState(false);

  async function authenticate(mode) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) { setNotice('Account login needs Supabase setup. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel → Settings → Environment Variables, then redeploy.'); return; }
    const email = window.prompt('Enter your email address:');
    if (!email || !email.trim()) return;
    const password = window.prompt('Enter your password (at least 6 characters):');
    if (!password) return;
    if (mode === 'signup' && password.length < 6) { setNotice('Password must be at least 6 characters.'); return; }
    try {
      const endpoint = mode === 'signup' ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password';
      const response = await fetch(url.replace(/\\/$/, '') + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: key }, body: JSON.stringify({ email: email.trim(), password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || data.message || data.error_description || data.error || 'Authentication failed.');
      if (mode === 'signup' && !data.access_token) setNotice('Sign-up submitted. Check your email for the verification link, then log in.');
      else setNotice(mode === 'signup' ? 'Account created successfully.' : 'Logged in successfully.');
    } catch (error) { setNotice(error.message || 'Could not connect to authentication. Check your Supabase settings.'); }
  }
  function createCall() {
    setNotice('The interface is ready, but live meetings need a video provider and account backend to be connected.');
  }
  function joinCall(e) {
    e.preventDefault();
    if (!roomCode.trim()) {
      setNotice('Enter a meeting link or code first.');
      return;
    }
    setNotice('Meeting joining is not connected yet. Next we will connect authentication and the video service.');
  }
  async function shareSite() {
    const shareData = { title: 'YouTube Automation', text: 'Join our learning meeting on YouTube Automation', url: window.location.origin };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.origin);
        setNotice('Website link copied. Paste it into WhatsApp to share.');
      } else setNotice('Copy the website address from your browser and share it in WhatsApp.');
    } catch {
      setNotice('You can copy the website address from your browser and share it in WhatsApp.');
    }
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="/" aria-label="YouTube Automation home">
        <span className="brand-mark"><Play size={21} fill="currentColor" /></span>
        <span><b>YouTube</b><small>AUTOMATION</small></span>
      </a>
      <nav><a href="#features">Features</a><button className="nav-button" onClick={() => authenticate('login')}>Log in</button><button className="signup" onClick={() => authenticate('signup')}>Sign up</button></nav>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15}/> YOUR ONLINE LEARNING SPACE</div>
          <h1>Learn together.<br/><span>Build something</span><br/>amazing.</h1>
          <p className="intro">A simple home for your lessons, group conversations, and online learning sessions — all in one place.</p>
          <div className="actions">
            <button className="primary" onClick={createCall}><Video size={19}/> Create a call <ArrowRight size={17}/></button>
            <button className="secondary" onClick={() => setShowJoin(v => !v)}><Link2 size={18}/> Join a call</button>
          </div>
          {showJoin && <form className="join-form" onSubmit={joinCall}>
            <input value={roomCode} onChange={e => setRoomCode(e.target.value)} placeholder="Paste a meeting link or code" aria-label="Meeting link or code"/>
            <button type="submit">Continue</button>
          </form>}
          {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}
          <div className="trust"><span className="trust-dot"></span> Designed for classes, teams, and creators</div>
        </div>
        <div className="hero-visual">
          <div className="yellow-orb"></div>
          <div className="call-card">
            <div className="call-head"><span className="live-dot"></span> YOUR LEARNING ROOM <span className="lock">PRIVATE BY DESIGN</span></div>
            <div className="video-grid">
              <div className="person tile-one"><span className="avatar avatar-yellow">G</span><b>Godswell</b><small>Host</small></div>
              <div className="person tile-two"><span className="avatar avatar-dark">J</span><b>Justice</b><small>Learning</small></div>
              <div className="person tile-three"><span className="avatar avatar-purple">A</span><b>A classmate</b><small>Connected later</small></div>
              <div className="add-tile"><Users size={25}/><b>More classmates</b><small>Group learning</small></div>
            </div>
            <div className="call-controls"><span><Mic size={17}/></span><span><Camera size={17}/></span><span><MonitorUp size={17}/></span><span><MessageCircle size={17}/></span><button onClick={createCall}>Start meeting</button></div>
          </div>
          <div className="floating-note"><ShieldCheck size={19}/><span><b>Host controls</b><small>Approve who joins</small></span></div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-heading"><span>MADE FOR YOUR GROUP</span><h2>Everything for learning, in one place.</h2><p>The starter design is here. Live calls and accounts will be connected in the next setup stage.</p></div>
        <div className="feature-grid">
          <article><div className="feature-icon"><Video/></div><h3>Group video calls</h3><p>Meet face-to-face with classmates. Final participant capacity depends on the selected video provider.</p></article>
          <article><div className="feature-icon"><MonitorUp/></div><h3>Share your screen</h3><p>Present notes, slides, websites, and lesson material during a session.</p></article>
          <article><div className="feature-icon"><MessageCircle/></div><h3>Live chat</h3><p>Keep lesson questions and useful links alongside the meeting.</p></article>
          <article><div className="feature-icon"><Link2/></div><h3>Share by WhatsApp</h3><p>Share the published site or meeting invitation using your device's share options.</p></article>
        </div>
      </section>
    </main>
    <footer><a className="footer-brand" href="/">YOUTUBE <span>AUTOMATION</span></a><p>Learning together, one call at a time.</p><button onClick={shareSite}>Share website link</button></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
