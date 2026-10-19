import React from 'react';
import { createRoot } from 'react-dom/client';
import { Video, Plus, CalendarDays, Menu, X, Download, Link2 } from 'lucide-react';
import './styles.css';

function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [notice, setNotice] = React.useState('');
  const [installPrompt, setInstallPrompt] = React.useState(null);
  React.useEffect(() => {
    const handler = (event) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  async function installApp() {
    if (!installPrompt) { setNotice('To install: open your browser menu and choose Install app or Add to Home screen.'); return; }
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }
  function createMeeting() {
    setNotice('Meeting creation is not connected to a video service yet. You can still share this website link with your class.');
  }
  async function shareLink() {
    try {
      if (navigator.share) await navigator.share({title:'YouTube Automation',url:window.location.origin});
      else { await navigator.clipboard.writeText(window.location.origin); setNotice('Website link copied. Share it with your classmates.'); }
    } catch { setNotice('Copy the website address from your browser to share it.'); }
  }
  return <div className="meet-app">
    <header className="meet-topbar">
      <button className="menu-toggle" aria-label="Open menu" onClick={() => setMenuOpen(v=>!v)}>{menuOpen ? <X/> : <Menu/>}</button>
      <a className="meet-brand" href="/" aria-label="YouTube Automation home"><span className="meet-logo"><Video size={22}/></span><span>YouTube <b>Automation</b></span></a>
      <div className="top-actions"><button className="icon-button" title="Install app" onClick={installApp}><Download size={18}/></button><button className="profile" aria-label="Profile">J</button></div>
    </header>
    {menuOpen && <><button className="drawer-scrim" aria-label="Close menu" onClick={()=>setMenuOpen(false)}></button><aside className="side-drawer"><div className="drawer-title">Menu</div><button onClick={()=>{setMenuOpen(false);createMeeting();}}><Plus size={18}/> New meeting</button><button onClick={()=>{setMenuOpen(false);setNotice('Your meeting schedule will appear here when a calendar service is connected.')}}><CalendarDays size={18}/> Scheduled meetings</button><button onClick={()=>{setMenuOpen(false);installApp();}}><Download size={18}/> Install app</button><button onClick={()=>{setMenuOpen(false);shareLink();}}><Link2 size={18}/> Share website</button></aside></>}
    <main className="meet-main">
      <section className="meet-copy"><h1>Video calls and meetings for everyone</h1><p>Connect, collaborate, and learn together from anywhere.</p>
        <div className="meet-actions"><button className="new-meeting" onClick={createMeeting}><Video size={19}/> New meeting</button><button className="join-meeting" onClick={()=>setNotice('Paste a real meeting link from your video provider to join. Live meeting service is not connected yet.')}><input aria-label="Meeting code or link" placeholder="Enter a code or link" onKeyDown={e=>{if(e.key==='Enter')setNotice('Live meeting service is not connected yet.');}}/></button></div>
        <div className="meet-divider"></div><p className="meet-footnote"><b>Tip:</b> You can install this website as an app from the menu.</p>
      </section>
      <section className="meet-art" aria-label="Meeting illustration"><div className="art-circle art-circle-one"></div><div className="art-circle art-circle-two"></div><div className="screen-card"><div className="screen-header"><i></i><i></i><i></i><span>YOUR LEARNING ROOM</span></div><div className="screen-people"><div className="screen-person p-one">G</div><div className="screen-person p-two">J</div><div className="screen-person p-three">A</div><div className="screen-person p-four"><Plus/></div></div><div className="screen-controls"><span></span><span></span><span></span><span></span><b></b></div></div><div className="art-caption"><span className="status-dot"></span> Your class, all in one place</div></section>
    </main>
    {notice && <div className="meet-notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss notice">×</button></div>}
    <footer className="meet-footer"><span>Simple video meetings for learning</span><button onClick={shareLink}>Share website</button></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
