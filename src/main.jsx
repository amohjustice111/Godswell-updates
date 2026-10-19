import React from 'react';
import { createRoot } from 'react-dom/client';
import { Video, Plus, CalendarDays, Menu, X, Download, Link2, UserRound } from 'lucide-react';
import './styles.css';

function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [notice, setNotice] = React.useState('');
  const [installPrompt, setInstallPrompt] = React.useState(null);
  const [username, setUsername] = React.useState(() => {
    try { return localStorage.getItem('godswell-username') || ''; } catch { return ''; }
  });
  const [nameInput, setNameInput] = React.useState(username);
  const [nameError, setNameError] = React.useState('');

  React.useEffect(() => {
    const handler = (event) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function continueWithUsername(event) {
    event.preventDefault();
    const cleanName = nameInput.trim().replace(/\\s+/g, ' ');
    if (cleanName.length < 2) {
      setNameError('Please enter a username with at least 2 characters.');
      return;
    }
    if (cleanName.length > 24) {
      setNameError('Please keep your username under 25 characters.');
      return;
    }
    setUsername(cleanName);
    setNameInput(cleanName);
    setNameError('');
    try { localStorage.setItem('godswell-username', cleanName); } catch {}
  }

  function changeUsername() {
    setNameInput('');
    setUsername('');
    setNameError('');
    try { localStorage.removeItem('godswell-username'); } catch {}
    setMenuOpen(false);
    setNotice('Enter a new username to continue.');
  }

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
      if (navigator.share) await navigator.share({title:'Godswell Updates',url:window.location.origin});
      else { await navigator.clipboard.writeText(window.location.origin); setNotice('Website link copied. Share it with your classmates.'); }
    } catch { setNotice('Copy the website address from your browser to share it.'); }
  }

  return <div className="meet-app">
    <header className="meet-topbar">
      <button className="menu-toggle" aria-label="Open menu" onClick={() => setMenuOpen(v=>!v)}>{menuOpen ? <X/> : <Menu/>}</button>
      <a className="meet-brand" href="/" aria-label="Godswell Updates home"><span className="meet-logo"><Video size={22}/></span><span>Godswell <b>Updates</b></span></a>
      <div className="top-actions"><button className="icon-button" title="Install app" onClick={installApp}><Download size={18}/></button><button className="profile" aria-label={username ? `Profile: ${username}` : 'Profile'}>{username ? username.charAt(0).toUpperCase() : <UserRound size={18}/>}</button></div>
    </header>
    {menuOpen && <><button className="drawer-scrim" aria-label="Close menu" onClick={()=>setMenuOpen(false)}></button><aside className="side-drawer"><div className="drawer-title">Menu</div><button onClick={()=>{setMenuOpen(false);createMeeting();}}><Plus size={18}/> New meeting</button><button onClick={()=>{setMenuOpen(false);setNotice('Your meeting schedule will appear here when a calendar service is connected.')}}><CalendarDays size={18}/> Scheduled meetings</button><button onClick={()=>{setMenuOpen(false);installApp();}}><Download size={18}/> Install app</button><button onClick={()=>{setMenuOpen(false);shareLink();}}><Link2 size={18}/> Share website</button>{username && <button onClick={changeUsername}><UserRound size={18}/> Change username</button>}</aside></>}
    <main className="meet-main">
      <section className="meet-copy">
        {username ? <>
          <h1>Welcome, {username}.</h1>
          <p>Connect, collaborate, and learn together from anywhere.</p>
          <div className="meet-actions"><button className="new-meeting" onClick={createMeeting}><Video size={19}/> New meeting</button><label className="join-meeting"><input aria-label="Meeting code or link" placeholder="Enter a code or link" onKeyDown={e=>{if(e.key==='Enter')setNotice('Live meeting service is not connected yet.');}} onChange={()=>{}}/><button type="button" onClick={()=>setNotice('Live meeting service is not connected yet. Add a video meeting provider to enable joining.')}>Join</button></label></div>
          <div className="meet-divider"></div><p className="meet-footnote"><b>Tip:</b> Your username is saved on this browser. It is not a secure account.</p>
        </> : <>
          <h1>Video calls and meetings for everyone</h1>
          <p>Choose a username to get started. No sign-up or password needed.</p>
          <form className="username-form" onSubmit={continueWithUsername}>
            <label htmlFor="username-input">Your username</label>
            <input id="username-input" autoComplete="nickname" maxLength={24} value={nameInput} onChange={e=>{setNameInput(e.target.value);setNameError('');}} placeholder="Enter your name" />
            {nameError && <p className="username-error" role="alert">{nameError}</p>}
            <button className="new-meeting" type="submit">Continue</button>
          </form>
          <div className="meet-divider"></div><p className="meet-footnote"><b>Note:</b> Your username is saved only in this browser. It is not a secure account.</p>
        </>}
      </section>
      <section className="meet-art" aria-label="Meeting illustration"><div className="art-circle art-circle-one"></div><div className="art-circle art-circle-two"></div><div className="screen-card"><div className="screen-header"><i></i><i></i><i></i><span>YOUR LEARNING ROOM</span></div><div className="screen-people"><div className="screen-person p-one">G</div><div className="screen-person p-two">J</div><div className="screen-person p-three">A</div><div className="screen-person p-four"><Plus/></div></div><div className="screen-controls"><span></span><span></span><span></span><span></span><b></b></div></div><div className="art-caption"><span className="status-dot"></span> Your class, all in one place</div></section>
    </main>
    {notice && <div className="meet-notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss notice">×</button></div>}
    <footer className="meet-footer"><span>Simple video meetings for learning</span><button onClick={shareLink}>Share website</button></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
