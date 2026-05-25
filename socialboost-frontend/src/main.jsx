import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronRight,
  ClipboardList,
  Clock,
  Copy,
  Eye,
  EyeOff,
  FileText,
  History,
  Instagram,
  LayoutDashboard,
  Linkedin,
  Loader2,
  LogOut,
  MessageSquareText,
  RadioTower,
  Rocket,
  Send,
  Settings,
  TrendingUp,
  UserRound,
  Video,
  Image as ImageIcon,
  Mic as MicIcon,
  PieChart,
  Download,
  Play,
  Pause,
  Sparkles
} from 'lucide-react';
import './styles.css';
import logoFull from './assets/logo-full.png';

const API_URL = import.meta.env.VITE_API_URL || '';
const DEFAULT_USER_ID = import.meta.env.VITE_USER_ID || 'demo-user';

const platforms = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, description: 'Metin, etiket, paylaşım saati' },
  { id: 'tiktok', label: 'TikTok', icon: Video, description: 'Açılış, kısa akış, etiket' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, description: 'Profesyonel metin ve çağrı' }
];

const tones = [
  { id: 'friendly', label: 'İkna Edici' },
  { id: 'premium', label: 'Kurumsal' },
  { id: 'playful', label: 'Modern' },
  { id: 'expert', label: 'Sektörel Uzman' }
];

function userIdFromEmail(email) {
  return email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || DEFAULT_USER_ID;
}

function readSession() {
  try {
    const saved = globalThis.localStorage?.getItem('socialboost-session');
    return saved ? JSON.parse(saved) : null;
  } catch (_error) {
    return null;
  }
}

function saveSession(session) {
  try {
    globalThis.localStorage?.setItem('socialboost-session', JSON.stringify(session));
  } catch (_error) {
    // Local demo still works without persisted browser storage.
  }
}

function clearSession() {
  try {
    globalThis.localStorage?.removeItem('socialboost-session');
  } catch (_error) {
    // Local demo still works without persisted browser storage.
  }
}

async function request(path, userId, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let errorMessage = 'İstek başarısız oldu.';
    try {
      const data = JSON.parse(text);
      if (data.error) errorMessage = data.error;
    } catch (e) {
      errorMessage = `Sunucu hatası (${response.status}): ${text.slice(0, 50)}`;
    }
    throw new Error(errorMessage);
  }
  const data = await response.json().catch(() => ({}));
  return data;
}

function App() {
  const [session, setSession] = useState(readSession);

  useEffect(() => {
    AOS.init({
      duration: 720,
      easing: 'ease-out-cubic',
      once: true,
      offset: 56
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [session]);

  function handleAuthSubmit(payload) {
    const nextSession = {
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      userId: userIdFromEmail(payload.email)
    };
    saveSession(nextSession);
    setSession(nextSession);
  }

  function signOut() {
    clearSession();
    setSession(null);
  }

  if (!session) return <AuthScreen onSubmit={handleAuthSubmit} />;
  return <Dashboard session={session} onSignOut={signOut} />;
}

function AuthScreen({ onSubmit }) {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <main className="auth-shell container-fluid p-0">
      <section className="auth-visual" data-aos="fade-right">
        <div className="auth-photo">
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"
            alt="İçerik planı üzerinde çalışan ekip"
          />
        </div>
      </section>

      <section className="auth-panel card border-0" data-aos="fade-left" data-aos-delay="120">
        <div className="auth-copy">
          <p className="eyebrow">Kurumsal Yönetim</p>
          <h1>{mode === 'login' ? 'Sisteme Giriş' : 'İşletme Kaydı'}</h1>
          <p>Markanızın dijital varlığını ve içerik stratejilerini tek bir güvenli panelden yönetin.</p>
        </div>

        <div className="auth-switch" role="tablist" aria-label="Giriş veya kayıt">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Giriş yap
          </button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            Kayıt ol
          </button>
        </div>

        <form className="auth-form shadow-sm" onSubmit={submit}>
          {mode === 'register' ? (
            <label className="field">
              <span>İşletme adı</span>
              <input className="form-control" value={form.name} onChange={(event) => update('name', event.target.value)} />
            </label>
          ) : null}

          <label className="field">
            <span>E-posta</span>
            <input className="form-control" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
          </label>

          <label className="field">
            <span>Şifre</span>
            <div className="password-input-wrapper">
              <input className="form-control" type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => update('password', event.target.value)} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Şifreyi göster/gizle">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button className="auth-submit btn">{mode === 'login' ? 'Oturum Aç' : 'Kaydı Tamamla'}</button>
        </form>

        <p className="auth-note">Platformumuz kurumsal standartlarda güvenlik ve gizlilik protokolleriyle korunmaktadır.</p>
      </section>
    </main>
  );
}

function Dashboard({ session, onSignOut }) {
  const [activeTab, setActiveTab] = useState('text');
  
  const [brief, setBrief] = useState({
    productName: '',
    description: '',
    platform: 'instagram',
    tone: 'premium',
    language: 'tr',
    imageNotes: ''
  });
  const [account, setAccount] = useState(null);
  const [health, setHealth] = useState(null);
  const [generations, setGenerations] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(null);

  const selectedPlatform = useMemo(() => platforms.find((platform) => platform.id === brief.platform), [brief.platform]);
  const usagePercent = useMemo(() => {
    if (!account?.usage?.limit) return 0;
    return Math.min(((account.usage.used || 0) / account.usage.limit) * 100, 100);
  }, [account]);

  async function loadDashboard() {
    const [healthData, accountData, historyData] = await Promise.all([
      request('/health', session.id),
      request('/api/me', session.id),
      request('/api/generations', session.id)
    ]);
    setHealth(healthData);
    setAccount(accountData);
    setGenerations(historyData.generations || []);
  }

  useEffect(() => {
    loadDashboard().catch((err) => setError(err.message));
  }, [session.id]);

  function updateBrief(field, value) {
    setBrief((current) => ({ ...current, [field]: value }));
  }

  async function generatePost(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setCopied(false);
    try {
      const data = await request('/api/generate-posts', session.id, {
        method: 'POST',
        body: JSON.stringify(brief)
      });
      setResult(data);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!result?.content) return;
    const text = [
      result.content.hook,
      result.content.caption,
      result.content.hashtags.join(' '),
      result.content.optimalTime ? `Paylaşım zamanı: ${result.content.optimalTime}` : ''
    ].filter(Boolean).join('\n\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function downloadText() {
    if (!result?.content) return;
    const text = [
      result.content.hook,
      result.content.caption,
      result.content.hashtags.join(' '),
      result.content.optimalTime ? `Paylaşım zamanı: ${result.content.optimalTime}` : ''
    ].filter(Boolean).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'socialboost-campaign.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePublish() {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    }, 2000);
  }

  async function toggleConnection(platform) {
    setConnecting(platform);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await request('/api/accounts/connect', session.id, {
        method: 'POST',
        body: JSON.stringify({ platform })
      });
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setConnecting(null);
    }
  }

  return (
    <div className="product-shell">
      <aside className="sidebar" data-aos="fade-right">
        <div className="brand-lockup">
          <img src={logoFull} alt="SocialBoost Logo" className="brand-logo" />
        </div>

        <nav className="side-nav" aria-label="Ana menü">
          <button className={activeTab === 'text' ? 'active' : ''} onClick={() => setActiveTab('text')}><LayoutDashboard size={18} />Metin Stüdyosu</button>
          <button className={activeTab === 'image' ? 'active' : ''} onClick={() => setActiveTab('image')}><ImageIcon size={18} />Görsel Stüdyosu <span className="demo-badge">YENİ</span></button>
          <button className={activeTab === 'audio' ? 'active' : ''} onClick={() => setActiveTab('audio')}><MicIcon size={18} />Ses Stüdyosu <span className="demo-badge">YENİ</span></button>
          <button className={activeTab === 'video' ? 'active' : ''} onClick={() => setActiveTab('video')}><Video size={18} />Video Stüdyosu <span className="demo-badge">YENİ</span></button>
          <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}><PieChart size={18} />Analizler <span className="demo-badge">PRO</span></button>
          <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}><History size={18} />Arşiv</button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}><Settings size={18} />Ayarlar</button>
        </nav>

        <div className="sidebar-card">
          <span>Paket</span>
          <strong>{account?.tier || 'free'}</strong>
          <div className="mini-meter"><div style={{ width: `${usagePercent}%` }} /></div>
          <small>{account?.usage?.used ?? 0}{account?.usage?.limit ? ` / ${account.usage.limit}` : ''} hak kullanıldı</small>
        </div>

        <button className="signout-button btn" onClick={onSignOut} onMouseDown={onSignOut}>
          <LogOut size={17} />Çıkış yap
        </button>
      </aside>

      <main className="app-shell" id="studio">
        <header className="topbar" data-aos="fade-down">
          <div>
            <p className="eyebrow">
              {activeTab === 'text' ? 'İçerik Stüdyosu' : activeTab === 'image' ? 'Görsel Stüdyosu' : activeTab === 'audio' ? 'Ses Stüdyosu' : activeTab === 'video' ? 'Video Stüdyosu' : activeTab === 'analytics' ? 'Analiz ve Raporlama' : activeTab === 'history' ? 'Arşiv' : 'Ayarlar'}
            </p>
            <h1>
              {activeTab === 'text' && 'Yapay Zeka Destekli İçerik Üretimi'}
              {activeTab === 'image' && 'Yapay Zeka Destekli Görsel Üretimi'}
              {activeTab === 'audio' && 'Yapay Zeka Destekli Seslendirme'}
              {activeTab === 'video' && 'Yapay Zeka Destekli Video Üretimi'}
              {activeTab === 'analytics' && 'Performans Analizleri'}
              {activeTab === 'history' && 'Önceki Üretimler'}
              {activeTab === 'settings' && 'Platform Ayarları'}
            </h1>
            <p className="page-subtitle">
              {activeTab === 'text' && 'Marka dilinize uygun, platform spesifik metinleri saniyeler içinde oluşturun.'}
              {activeTab === 'image' && 'Sosyal medya gönderileriniz için kusursuz ve eşsiz görseller tasarlayın.'}
              {activeTab === 'audio' && 'Metinlerinizi en doğal yapay zeka sesleriyle sese dönüştürün.'}
              {activeTab === 'video' && 'İçeriklerinizi dikkat çekici, sinematik Reels/Shorts formatlarına dönüştürün.'}
              {activeTab === 'analytics' && 'Bağlı sosyal medya hesaplarınızın etkileşim ve erişim verilerini inceleyin.'}
              {activeTab === 'history' && 'Geçmişte ürettiğiniz tüm içeriklere tek tıkla ulaşın.'}
              {activeTab === 'settings' && 'Sosyal medya hesaplarınızı bağlayın ve sistem ayarlarını yönetin.'}
            </p>
          </div>
          <div className="status-strip">
            <StatusItem icon={RadioTower} label="Servis" value={health?.ok ? 'Bağlı' : 'Kontrol'} state="good" />
            <StatusItem icon={UserRound} label="Hesap" value={session.name} />
            <StatusItem icon={BarChart3} label="Paket" value={account?.tier || 'free'} />
          </div>
        </header>

        {error ? <div className="alert">{error}</div> : null}

        {activeTab === 'text' && (
          <div data-aos="fade-in">
            <section className="metrics-grid" aria-label="Özet metrikler">
              <MetricCard icon={Activity} label="Servis" value={health?.ok ? 'Bağlı' : 'Bekliyor'} tone="green" />
              <MetricCard icon={TrendingUp} label="Bu ay" value={`${account?.usage?.used ?? 0}${account?.usage?.limit ? `/${account.usage.limit}` : ''}`} />
              <MetricCard icon={BadgeCheck} label="Arşiv" value={`${generations.length} taslak`} />
            </section>

            <section className="workspace">
              <form className="panel composer card border-0" onSubmit={generatePost}>
                <PanelHeader eyebrow="Veri Girişi" title="Hedef Kitle & Ürün" icon={ClipboardList} />
                <label className="field"><span>Proje / Ürün Adı</span><input className="form-control" value={brief.productName} onChange={(event) => updateBrief('productName', event.target.value)} placeholder="Örn. Finansal Analiz Çözümü" /></label>
                <label className="field"><span>Detaylı Açıklama</span><textarea className="form-control" value={brief.description} onChange={(event) => updateBrief('description', event.target.value)} placeholder="Projenizin veya ürününüzün iş dünyasına sağladığı faydayı ve temel özelliklerini belirtin" rows={5} /></label>
                <label className="field"><span>Görsel Bağlamı (Opsiyonel)</span><input className="form-control" value={brief.imageNotes} onChange={(event) => updateBrief('imageNotes', event.target.value)} placeholder="Örn. Modern ofis ortamında toplantı anı" /></label>

                <div className="control-group">
                  <span>Platform</span>
                  <div className="platform-grid">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <button key={platform.id} type="button" className={brief.platform === platform.id ? 'active' : ''} onClick={() => updateBrief('platform', platform.id)}>
                          <Icon size={18} /><strong>{platform.label}</strong><small>{platform.description}</small>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="control-group">
                  <span>Ton</span>
                  <div className="segmented four">
                    {tones.map((tone) => (
                      <button key={tone.id} type="button" className={brief.tone === tone.id ? 'active' : ''} onClick={() => updateBrief('tone', tone.id)}>{tone.label}</button>
                    ))}
                  </div>
                </div>

                <button className="primary-action btn" disabled={loading}>
                  {loading ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
                  {loading ? 'Taslak hazırlanıyor' : `${selectedPlatform?.label} taslağı hazırla`}
                </button>
              </form>

              <section className="panel output card border-0">
                <PanelHeader eyebrow="Sonuç" title="Oluşturulan Taslak" icon={FileText}>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <button className="icon-button btn" onClick={downloadText} disabled={!result} title="İndir"><Download size={18} /></button>
                    <button className="icon-button btn" onClick={copyResult} disabled={!result} title="Kopyala">{copied ? <Check size={18} /> : <Copy size={18} />}</button>
                  </div>
                </PanelHeader>

                {result ? (
                  <article className="post-preview">
                    <div className="preview-topline"><span>{result.platform}</span><small>{new Date(result.timestamp || result.createdAt).toLocaleString('tr-TR')}</small></div>
                    {result.content.hook ? <ContentBlock label="Açılış" value={result.content.hook} /> : null}
                    <ContentBlock label="Metin" value={result.content.caption} />
                    <div className="hashtag-row">{result.content.hashtags.map((hashtag) => <span key={hashtag}>{hashtag}</span>)}</div>
                    {result.content.optimalTime ? <div className="time-row"><Clock size={16} /><span>{result.content.optimalTime}</span></div> : null}
                    
                    <div className="publish-actions" style={{ marginTop: '16px' }}>
                      <button className={`btn w-100 ${published ? 'btn-success' : 'btn-connect'}`} onClick={handlePublish} disabled={publishing || published || !account?.user?.connectedAccounts?.includes(result.platform)}>
                        {publishing ? <><Loader2 className="spin" size={16}/> Gönderiliyor...</> : published ? <><BadgeCheck size={16}/> Başarıyla Paylaşıldı</> : <><Rocket size={16}/> {result.platform}'da Şimdi Paylaş</>}
                      </button>
                      {!account?.user?.connectedAccounts?.includes(result.platform) && <small style={{ color: 'var(--text-muted)', display: 'block', textAlign: 'center', marginTop: '8px' }}>Paylaşım yapabilmek için ayarlar menüsünden hesabı bağlamanız gereklidir.</small>}
                    </div>
                  </article>
                ) : (
                  <div className="empty-state"><MessageSquareText size={34} /><strong>Sistem Beklemede</strong><p>Gerekli parametreleri girip platform seçtiğinizde yapay zeka analiz sonuçları burada görüntülenecektir.</p></div>
                )}

                <div className="quality-panel">
                  <span>Kontrol listesi</span>
                  <ul>
                    <li><Check size={15} />Kanal formatı</li>
                    <li><Check size={15} />Etiket limiti</li>
                    <li><Check size={15} />Paylaşım zamanı</li>
                  </ul>
                </div>
              </section>
            </section>
          </div>
        )}

        {activeTab === 'image' && <ImageStudio account={account} />}
        {activeTab === 'audio' && <AudioStudio />}
        {activeTab === 'video' && <VideoStudio />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {activeTab === 'history' && (
          <div data-aos="fade-in">
            <section className="history-panel card border-0" id="history">
              <PanelHeader eyebrow="Kayıtlar" title="Son taslaklar" icon={History} />
              <div className="history-list">
                {generations.length ? generations.slice(0, 12).map((generation) => (
                  <button key={generation.id} onClick={() => { setActiveTab('text'); setResult({ ...generation, post: generation.content.raw }); }}>
                    <span>{generation.platform}</span><strong>{generation.productName}</strong><small>{new Date(generation.createdAt).toLocaleString('tr-TR')}</small><ChevronRight size={16} />
                  </button>
                )) : <p className="muted">Henüz üretim yok.</p>}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'settings' && (
          <div data-aos="fade-in">
            <section className="settings-panel card border-0" id="settings">
              <PanelHeader eyebrow="Entegrasyonlar" title="Bağlı Hesaplar" icon={Settings} />
              <div className="integrations-grid">
                <IntegrationCard
                  platform="Instagram"
                  icon={Instagram}
                  description="İçeriklerinizi doğrudan Instagram'a gönderin."
                  isConnected={account?.user?.connectedAccounts?.includes('instagram')}
                  onToggle={() => toggleConnection('instagram')}
                  connecting={connecting === 'instagram'}
                />
                <IntegrationCard
                  platform="TikTok"
                  icon={Video}
                  description="Video açıklamalarınızı tek tuşla yayınlayın."
                  isConnected={account?.user?.connectedAccounts?.includes('tiktok')}
                  onToggle={() => toggleConnection('tiktok')}
                  connecting={connecting === 'tiktok'}
                />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function ImageStudio({ account }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cyberpunk');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const styles = [
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'photoreal', label: 'Fotogerçekçi' },
    { id: '3d', label: '3D Render' },
    { id: 'sketch', label: 'Karakalem' },
    { id: 'anime', label: 'Anime' }
  ];

  function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    const encoded = encodeURIComponent(`${prompt}, ${styles.find(s => s.id === style).label} style, high quality, masterpiece`);
    const seed = Math.floor(Math.random() * 100000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=800&nologo=true&seed=${seed}`;

    const img = new Image();
    img.onload = () => {
      setResult(imageUrl);
      setLoading(false);
    };
    img.onerror = () => {
      setLoading(false);
      alert('Görsel oluşturulurken hata oluştu.');
    };
    img.src = imageUrl;
  }

  function handlePublish() {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    }, 2000);
  }

  return (
    <section className="workspace" data-aos="fade-in">
      <form className="panel composer card border-0" onSubmit={handleGenerate}>
        <PanelHeader eyebrow="Görsel Motoru" title="Prompt & Stil" icon={ImageIcon} />
        <label className="field"><span>Ne hayal ediyorsunuz?</span><textarea className="form-control" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Neon ışıklar altında fütüristik bir şehir..." rows={5} /></label>
        
        <div className="control-group">
          <span>Sanat Stili</span>
          <div className="segmented">
            {styles.map((s) => (
              <button key={s.id} type="button" className={style === s.id ? 'active' : ''} onClick={() => setStyle(s.id)}>{s.label}</button>
            ))}
          </div>
        </div>

        <button className="primary-action btn" disabled={loading || !prompt.trim()}>
          {loading ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
          {loading ? 'Yapay Zeka Çiziyor...' : 'Görsel Üret'}
        </button>
      </form>

      <section className="panel output card border-0">
        <PanelHeader eyebrow="Sonuç" title="Render Çıktısı" icon={ImageIcon} />
        {result ? (
          <div className="image-result">
            <img src={result} alt="Generated AI" />
            <div className="image-actions">
              <a href={result} download="socialboost-image.jpg" target="_blank" rel="noreferrer" className="btn btn-connect w-100" style={{textDecoration: 'none'}}><Download size={16}/> Görseli İndir</a>
              <button className={`btn w-100 ${published ? 'btn-success' : 'btn-connect'}`} onClick={handlePublish} disabled={publishing || published || !account?.user?.connectedAccounts?.includes('instagram')}>
                {publishing ? <><Loader2 className="spin" size={16}/> Gönderiliyor...</> : published ? <><BadgeCheck size={16}/> Başarıyla Paylaşıldı</> : <><Rocket size={16}/> Instagram'da Paylaş</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state"><ImageIcon size={34} /><strong>Sistem Beklemede</strong><p>Yapay zeka motoruna bir açıklama verin ve stili seçin.</p></div>
        )}
      </section>
    </section>
  );
}

function AudioStudio() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(false);
  const [text, setText] = useState('');
  const [playing, setPlaying] = useState(false);
  const [lang, setLang] = useState('tr-TR');
  const [gender, setGender] = useState('female');
  const [speed, setSpeed] = useState(1);

  function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setResult(false);
    setPlaying(false);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setTimeout(() => {
      setResult(true);
      setLoading(false);
    }, 800);
  }

  function togglePlay() {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.lang = lang;
      
      const availableVoices = window.speechSynthesis.getVoices();
      
      let voicesInLang = availableVoices.filter(v => v.lang.startsWith(lang.split('-')[0]));
      if (voicesInLang.length === 0) voicesInLang = availableVoices;

      let matchedVoice = null;
      if (gender === 'female') {
        matchedVoice = voicesInLang.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Yelda') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Victoria'));
      } else {
        matchedVoice = voicesInLang.find(v => v.name.toLowerCase().includes('male') || v.name.includes('Tolga') || v.name.includes('David') || v.name.includes('Alex') || v.name.includes('Daniel'));
      }
      
      if (!matchedVoice && voicesInLang.length > 0) matchedVoice = voicesInLang[0];
      
      if (matchedVoice) utterance.voice = matchedVoice;
      
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => setPlaying(false);
      
      window.speechSynthesis.speak(utterance);
      setPlaying(true);
    }
  }

  function handleDownload() {
    const blob = new Blob(["Simüle edilmiş ses dosyası verisi (MP3). Gerçek entegrasyon için sunucu tabanlı TTS gerekir. Metin: " + text], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'socialboost-voice.mp3';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="workspace" data-aos="fade-in">
      <form className="panel composer card border-0" onSubmit={handleGenerate}>
        <PanelHeader eyebrow="Ses Motoru" title="Metin & Seslendirme" icon={MicIcon} />
        <label className="field"><span>Seslendirilecek Metin</span><textarea className="form-control" value={text} onChange={(e) => setText(e.target.value)} placeholder="Merhaba, SocialBoost'un yeni yapay zeka ses özelliklerini test ediyorsunuz..." rows={5} /></label>
        
        <div className="audio-controls-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
          <div className="control-group">
            <span>Dil</span>
            <div className="segmented">
              <button type="button" className={lang === 'tr-TR' ? 'active' : ''} onClick={() => setLang('tr-TR')}>Türkçe</button>
              <button type="button" className={lang === 'en-US' ? 'active' : ''} onClick={() => setLang('en-US')}>İngilizce</button>
            </div>
          </div>
          <div className="control-group">
            <span>Cinsiyet</span>
            <div className="segmented">
              <button type="button" className={gender === 'female' ? 'active' : ''} onClick={() => setGender('female')}>Kadın</button>
              <button type="button" className={gender === 'male' ? 'active' : ''} onClick={() => setGender('male')}>Erkek</button>
            </div>
          </div>
        </div>
        
        <div className="control-group" style={{ marginTop: '10px' }}>
          <span>Konuşma Hızı: {speed.toFixed(1)}x</span>
          <input type="range" min="0.5" max="2" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} style={{ cursor: 'pointer' }} />
        </div>

        <button className="primary-action btn" disabled={loading || !text.trim()}>
          {loading ? <Loader2 className="spin" size={18} /> : <MicIcon size={18} />}
          {loading ? 'Ses İşleniyor...' : 'Sese Dönüştür'}
        </button>
      </form>

      <section className="panel output card border-0">
        <PanelHeader eyebrow="Sonuç" title="Kayıt Çıktısı" icon={MicIcon} />
        {result ? (
          <div className="audio-result">
            <div className="waveform-player">
              <button type="button" className="play-btn" onClick={togglePlay}>
                {playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              <div className={`waveform ${playing ? 'playing' : ''}`}>
                 <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>
            <div className="image-actions">
              <button type="button" className="btn btn-connect w-100" onClick={handleDownload}><Download size={16}/> MP3 İndir</button>
            </div>
          </div>
        ) : (
          <div className="empty-state"><MicIcon size={34} /><strong>Sistem Beklemede</strong><p>Metin girip ses seçimini tamamladığınızda yapay zeka sesi oluşturacaktır.</p></div>
        )}
      </section>
    </section>
  );
}

function VideoStudio() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('reels');

  function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setResult(false);
    setTimeout(() => {
      setResult(true);
      setLoading(false);
    }, 4000);
  }

  return (
    <section className="workspace" data-aos="fade-in">
      <form className="panel composer card border-0" onSubmit={handleGenerate}>
        <PanelHeader eyebrow="Video Motoru" title="Reels / Shorts Oluştur" icon={Video} />
        <label className="field"><span>Videonun Konusu</span><textarea className="form-control" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Neon şehirde uçan arabalar..." rows={4} /></label>
        
        <div className="control-group">
          <span>Video Formatı</span>
          <div className="segmented">
            <button type="button" className={style === 'reels' ? 'active' : ''} onClick={() => setStyle('reels')}>Instagram Reels (9:16)</button>
            <button type="button" className={style === 'youtube' ? 'active' : ''} onClick={() => setStyle('youtube')}>YouTube (16:9)</button>
          </div>
        </div>

        <button className="primary-action btn" disabled={loading || !prompt.trim()}>
          {loading ? <Loader2 className="spin" size={18} /> : <Video size={18} />}
          {loading ? 'Sahneler Oluşturuluyor...' : 'Video Render Et'}
        </button>
      </form>

      <section className="panel output card border-0">
        <PanelHeader eyebrow="Önizleme" title="Sinematik Çıktı" icon={Video} />
        {result ? (
          <div className="video-result">
            <div className={`video-player-mock ${style}`}>
              <div className="video-bg kenburns" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542382257-80da9fb9f5abc?q=80&w=800)' }}></div>
              <div className="video-ui">
                <div className="video-caption">
                  <strong>SocialBoost AI</strong>
                  <p>{prompt || 'Muazzam bir video deneyimi'}</p>
                </div>
              </div>
            </div>
            <div className="image-actions" style={{ marginTop: '16px' }}>
              <button type="button" className="btn btn-connect w-100"><Download size={16}/> MP4 İndir</button>
            </div>
          </div>
        ) : (
          <div className="empty-state"><Video size={34} /><strong>Sistem Beklemede</strong><p>Video konusu girerek sinematik slayt şovları veya AI tabanlı kısa videolar oluşturabilirsiniz.</p></div>
        )}
      </section>
    </section>
  );
}

function AnalyticsDashboard() {
  return (
    <section className="workspace" data-aos="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      <div className="panel card border-0" style={{ minHeight: 'auto', padding: '32px' }}>
        <PanelHeader eyebrow="Performans" title="Son 30 Günlük Veri" icon={PieChart} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
          <div className="metric-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <TrendingUp size={24} style={{ color: 'var(--accent-primary)' }} />
            <div><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>TOPLAM ERİŞİM</span><strong style={{ fontSize: '1.8rem' }}>24.5K</strong></div>
          </div>
          <div className="metric-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <UserRound size={24} style={{ color: 'var(--accent-primary)' }} />
            <div><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>YENİ TAKİPÇİ</span><strong style={{ fontSize: '1.8rem' }}>+1,240</strong></div>
          </div>
          <div className="metric-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <Activity size={24} style={{ color: 'var(--accent-primary)' }} />
            <div><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ETKİLEŞİM ORANI</span><strong style={{ fontSize: '1.8rem' }}>%8.4</strong></div>
          </div>
        </div>

        <div className="chart-mock" style={{ height: '300px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', padding: '0 20px 20px', gap: '10px' }}>
            {/* CSS Bar Chart Simulation */}
            {[40, 60, 45, 80, 50, 90, 70, 100, 65, 85].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--accent-gradient)', borderRadius: '4px 4px 0 0', opacity: 0.8, animation: `growUp 1s ease-out ${i*0.1}s forwards`, transformOrigin: 'bottom', transform: 'scaleY(0)' }}></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PanelHeader({ eyebrow, title, icon: Icon, children }) {
  return (
    <div className="panel-header">
      <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      {children || <Icon size={22} />}
    </div>
  );
}

function StatusItem({ icon: Icon, label, value, state }) {
  return <div className={`status-item ${state || ''}`}><Icon size={17} /><span>{label}</span><strong>{value}</strong></div>;
}

function MetricCard({ icon: Icon, label, value, tone }) {
  return <div className={`metric-card ${tone || ''}`}><Icon size={18} /><span>{label}</span><strong>{value}</strong></div>;
}

function ContentBlock({ label, value }) {
  return <div className="content-block"><span>{label}</span><p>{value}</p></div>;
}

function IntegrationCard({ platform, icon: Icon, description, isConnected, onToggle, connecting }) {
  const [hover, setHover] = useState(false);
  return (
    <div className={`integration-card ${isConnected ? 'connected' : ''}`}>
      <div className="integration-icon"><Icon size={28} /></div>
      <div className="integration-info">
        <h3>{platform} <span className="demo-badge">DEMO</span></h3>
        <p>{description}</p>
      </div>
      <button 
        className={`btn ${isConnected ? 'btn-connected' : 'btn-connect'}`} 
        onClick={onToggle} 
        disabled={connecting}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {connecting ? <Loader2 className="spin" size={16} /> : (isConnected ? (hover ? 'Bağlantıyı Kes' : <><BadgeCheck size={16} style={{marginRight: '6px'}}/> Bağlı</>) : 'Hesabı Bağla')}
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
