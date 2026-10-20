import React from 'react';
import { createRoot } from 'react-dom/client';
import { Video, Plus, CalendarDays, Menu, X, Download, Link2, UserRound, Copy, ArrowLeft, Camera, CameraOff, Mic, MicOff, MonitorUp } from 'lucide-react';
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
  const [meetingInput, setMeetingInput] = React.useState('');
  const [roomName, setRoomName] = React.useState(() => new URLSearchParams(window.location.search).get('room') || '');
  const meetingContainer = React.useRef(null);
  const localVideoRef = React.useRef(null);
  const localStreamRef = React.useRef(null);
  const [cameraOn, setCameraOn] = React.useState(false);
  const [micOn, setMicOn] = React.useState(false);
  const [sharingScreen, setSharingScreen] = React.useState(false);

  React.useEffect(() => {
    const handler = (event) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  React.useEffect(() => {
    if (!roomName) return;
    startCamera();
    return () => {
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setCameraOn(false);
      setMicOn(false);
      setSharingScreen(false);
    };
  }, [roomName]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setCameraOn(true);
      setMicOn(true);
      setNotice('Camera preview is ready. Live calls between different people still need a signaling server.');
    } catch {
      setNotice('Camera or microphone access was blocked. Allow permissions in your browser and try again.');
    }
  }

  async function toggleCamera() {
    if (!localStreamRef.current) return startCamera();
    const track = localStreamRef.current.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCameraOn(track.enabled); }
  }

  function toggleMic() {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
    else setNotice('Allow microphone access to use the microphone.');
  }

  async function shareScreen() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setNotice('Screen sharing is not supported by this browser/device. Try a desktop browser.');
      return;
    }
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = screen.getVideoTracks()[0];
      if (localVideoRef.current) localVideoRef.current.srcObject = screen;
      setSharingScreen(true);
      track.addEventListener('ended', () => {
        setSharingScreen(false);
        if (localVideoRef.current && localStreamRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      });
    } catch {
      setNotice('Screen sharing was cancelled or not permitted by your browser.');
    }
  }

  function stopScreenShare() {
    if (localVideoRef.current && localStreamRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    setSharingScreen(false);
  }

  function continueWithUsername(event) {
    event.preventDefault();
    const cleanName = nameInput.trim().replace(/\s+/g, ' ');
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

  function openMeeting(name) {
    const cleanRoom = name.trim().replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
    if (!cleanRoom) { setNotice('Enter a meeting code or link first.'); return; }
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('room', cleanRoom);
    window.history.pushState({}, '', nextUrl);
    setRoomName(cleanRoom);
    setMeetingInput('');
    setNotice('');
  }

  function createMeeting() {
    const suffix = Math.random().toString(36).slice(2, 9);
    openMeeting('godswell-' + suffix);
    setMenuOpen(false);
  }

  function leaveMeeting() {
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(track => track.stop()); localStreamRef.current = null; }
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete('room');
    window.history.pushState({}, '', nextUrl);
    setRoomName('');
    setNotice('You left the meeting.');
  }

  async function copyMeetingLink() {
    const link = window.location.origin + window.location.pathname + '?room=' + encodeURIComponent(roomName);
    try {
      await navigator.clipboard.writeText(link);
      setNotice('Meeting link copied. Send it to anyone you want to invite.');
    } catch {
      window.prompt('Copy this meeting link and share it:', link);
    }
  }

  async function shareLink() {
    const link = roomName ? window.location.origin + window.location.pathname + '?room=' + encodeURIComponent(roomName) : window.location.origin;
    try {
      if (navigator.share) await navigator.share({title: roomName ? 'Join my Godswell meeting' : 'Godswell Updates', url: link});
      else { await navigator.clipboard.writeText(link); setNotice(roomName ? 'Meeting link copied. Share it with your guests.' : 'Website link copied. Share it with your classmates.'); }
    } catch { setNotice('Copy the website address from your browser to share it.'); }
  }

  function joinMeeting(event) {
    event.preventDefault();
    let value = meetingInput.trim();
    if (!value) { setNotice('Enter a meeting link or room code.'); return; }
    try {
      if (/^https?:\/\//i.test(value)) {
        const parsed = new URL(value);
        if (parsed.hostname.endsWith('meet.jit.si')) value = decodeURIComponent(parsed.pathname.replace(/^\/+|\/+$/g, ''));
        else value = parsed.searchParams.get('room') || '';
      }
    } catch {}
    openMeeting(value);
  }

  return <div className="meet-app">
    <header className="meet-topbar">
      <button className="menu-toggle" aria-label="Open menu" onClick={() => setMenuOpen(v=>!v)}>{menuOpen ? <X/> : <Menu/>}</button>
      <a className="meet-brand" href="/" aria-label="Godswell Updates home"><span className="meet-logo"><Video size={22}/></span><span>Godswell <b>Updates</b></span></a>
      <div className="top-actions"><button className="icon-button" title="Install app" onClick={installApp}><Download size={18}/></button><button className="profile" aria-label={username ? `Profile: ${username}` : 'Profile'}>{username ? username.charAt(0).toUpperCase() : <UserRound size={18}/>}</button></div>
    </header>
    {menuOpen && <><button className="drawer-scrim" aria-label="Close menu" onClick={()=>setMenuOpen(false)}></button><aside className="side-drawer"><div className="drawer-title">Menu</div><button onClick={createMeeting}><Plus size={18}/> New meeting</button><button onClick={()=>{setMenuOpen(false);setNotice('Use New meeting to start a call, or enter a meeting link on the home page.')}}><CalendarDays size={18}/> Scheduled meetings</button><button onClick={()=>{setMenuOpen(false);installApp();}}><Download size={18}/> Install app</button><button onClick={()=>{setMenuOpen(false);shareLink();}}><Link2 size={18}/> Share {roomName ? 'meeting' : 'website'}</button>{username && <button onClick={changeUsername}><UserRound size={18}/> Change username</button>}</aside></>}
    {roomName ? <main className="meeting-page">
      <div className="meeting-toolbar"><div><h1>Godswell meeting</h1><p>You're joining as <b>{username || 'Guest'}</b></p></div><div className="meeting-toolbar-actions"><button className="secondary-button" onClick={copyMeetingLink}><Copy size={17}/> Copy invite link</button><button className="secondary-button" onClick={sharingScreen ? stopScreenShare : shareScreen}><MonitorUp size={17}/> {sharingScreen ? 'Stop sharing' : 'Share screen'}</button><button className="leave-button" onClick={leaveMeeting}><ArrowLeft size={17}/> Leave</button></div></div>
      <div className="jitsi-frame local-camera-frame"><video ref={localVideoRef} autoPlay playsInline muted></video><div className="local-camera-controls"><button onClick={toggleCamera}>{cameraOn ? <CameraOff size={18}/> : <Camera size={18}/>} {cameraOn ? 'Turn camera off' : 'Turn camera on'}</button><button onClick={toggleMic}>{micOn ? <MicOff size={18}/> : <Mic size={18}/>} {micOn ? 'Mute mic' : 'Unmute mic'}</button><button onClick={sharingScreen ? stopScreenShare : shareScreen}><MonitorUp size={18}/> {sharingScreen ? 'Stop sharing' : 'Share screen'}</button></div><div className="local-camera-label">{username || 'Guest'} · Local preview</div></div>
      <p className="meeting-help">If your browser asks for camera or microphone permission, choose <b>Allow</b>. Share the invite link with others to join the same room.</p>
    </main> : <main className="meet-main">
      <section className="meet-copy">
        {username ? <>
          <h1>Welcome, {username}.</h1>
          <p>Start a video call or join a meeting with a link or room code.</p>
          <div className="meet-actions"><button className="new-meeting" onClick={createMeeting}><Video size={19}/> New meeting</button><form className="join-meeting" onSubmit={joinMeeting}><input aria-label="Meeting code or link" value={meetingInput} onChange={e=>setMeetingInput(e.target.value)} placeholder="Enter a code or link"/><button type="submit">Join</button></form></div>
          <div className="meet-divider"></div><p className="meet-footnote"><b>Tip:</b> Share a room link. Multi-person calling needs a signaling server to be configured.</p>
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
    </main>}
    {notice && <div className="meet-notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss notice">×</button></div>}
    {!roomName && <footer className="meet-footer"><span>Browser-based camera preview</span><button onClick={shareLink}>Share website</button></footer>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
