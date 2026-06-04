import { useState, useRef, useEffect } from "react";
import {
  FileText, MapPin, AlertTriangle, List, FileCheck, DollarSign,
  Camera, Upload, Mic, MicOff, Loader2, Check, ChevronRight, ChevronLeft,
  Plus, X, Search, Home, Sparkles, Shield, Building2, Image,
  FileImage, Receipt, Save, Eye, RefreshCw, Edit3,
} from "lucide-react";

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:"#F7F5F2", white:"#FFFFFF", sidebar:"#181C23",
  accent:"#9B2226", accentLight:"#FDF0F0", accentMid:"#C1494E",
  ink:"#1A2332", muted:"#6B7480", border:"#E8E4DE",
  green:"#0F7B4D", greenBg:"#EDFAF3",
  orange:"#B45309", orangeBg:"#FFFBEB",
  red:"#C0392B", redBg:"#FEF2F2",
  blue:"#1D4ED8", blueBg:"#EFF6FF",
  tag:"#F0EDE8",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const BAREMO = [
  {g:"Pintura",      cod:"PIN-01",desc:"Pintado paramentos verticales",      u:"m²", p:8.50},
  {g:"Pintura",      cod:"PIN-02",desc:"Pintado de techos",                   u:"m²", p:10.20},
  {g:"Pintura",      cod:"PIN-03",desc:"Papel pintado — colocación",          u:"m²", p:15.80},
  {g:"Albañilería",  cod:"ALB-01",desc:"Tabique ladrillo hueco sencillo",     u:"m²", p:38.50},
  {g:"Albañilería",  cod:"ALB-02",desc:"Guarnecido y enlucido de yeso",       u:"m²", p:12.40},
  {g:"Albañilería",  cod:"ALB-03",desc:"Solado baldosa cerámica",             u:"m²", p:32.00},
  {g:"Albañilería",  cod:"ALB-04",desc:"Alicatado azulejo",                   u:"m²", p:35.00},
  {g:"Albañilería",  cod:"ALB-05",desc:"Falso techo de escayola",             u:"m²", p:28.00},
  {g:"Fontanería",   cod:"FON-01",desc:"Localización y reparación de fuga",   u:"ud", p:185.00},
  {g:"Fontanería",   cod:"FON-02",desc:"Sustitución tubería cobre (ml)",      u:"ml", p:22.50},
  {g:"Fontanería",   cod:"FON-03",desc:"Grifo monomando — sustitución",       u:"ud", p:95.00},
  {g:"Electricidad", cod:"ELE-01",desc:"Punto de luz completo",               u:"ud", p:65.00},
  {g:"Electricidad", cod:"ELE-02",desc:"Toma de corriente doble",             u:"ud", p:55.00},
  {g:"Electricidad", cod:"ELE-03",desc:"Cuadro eléctrico — sustitución",      u:"ud", p:380.00},
  {g:"Carpintería",  cod:"CAR-01",desc:"Puerta de paso interior",             u:"ud", p:285.00},
  {g:"Carpintería",  cod:"CAR-02",desc:"Ventana aluminio RPT 100×120cm",      u:"ud", p:320.00},
  {g:"Cristalería",  cod:"CRI-01",desc:"Vidrio simple hasta 1m²",             u:"ud", p:55.00},
  {g:"Cristalería",  cod:"CRI-02",desc:"Doble acristalamiento 100×120cm",     u:"ud", p:145.00},
  {g:"Loza",         cod:"LOZ-01",desc:"Inodoro — sustitución completa",      u:"ud", p:320.00},
  {g:"Loza",         cod:"LOZ-02",desc:"Lavabo — sustitución completa",       u:"ud", p:185.00},
  {g:"Otros",        cod:"OTR-01",desc:"Cuadro / obra de arte — reposición",  u:"ud", p:150.00},
  {g:"Otros",        cod:"OTR-02",desc:"Persiana enrollable — sustitución",   u:"ud", p:165.00},
];

const MOD_ARQ = {
  "07":{n:"Baleares",  hotel:[996,1149,1744],  local:[730,842,1192]},
  "08":{n:"Barcelona", hotel:[1042,1201,1825], local:[764,881,1247]},
  "17":{n:"Girona",    hotel:[983,1133,1721],  local:[720,831,1176]},
  "28":{n:"Madrid",    hotel:[1080,1246,1890], local:[792,915,1295]},
  "41":{n:"Sevilla",   hotel:[940,1084,1646],  local:[690,796,1127]},
  "46":{n:"Valencia",  hotel:[970,1118,1698],  local:[712,821,1162]},
  "00":{n:"Otras",     hotel:[950,1095,1660],  local:[696,804,1140]},
};
const PROVINCIAS = [
  {v:"07",l:"Baleares"},{v:"08",l:"Barcelona"},{v:"17",l:"Girona"},
  {v:"28",l:"Madrid"},{v:"29",l:"Málaga"},{v:"33",l:"Asturias"},
  {v:"35",l:"Las Palmas"},{v:"38",l:"S.C.Tenerife"},{v:"41",l:"Sevilla"},
  {v:"43",l:"Tarragona"},{v:"46",l:"Valencia"},{v:"00",l:"Otras"},
];
const COMPANIAS = ["AXA","Mapfre","Allianz","Generali","Zurich","Helvetia","Mutua Madrileña","Caser","Reale","Santalucía","Pelayo","BBVA Seguros","Catalana Occidente","Línea Directa"];
const TIPOS_USO = ["Hotel / Apart-hotel","Hostal / Pensión","Local comercial","Oficinas","Vivienda unifamiliar","Piso / Apartamento","Comunidad de propietarios","Industria / Nave","Restaurante / Bar","Otro"];
const TIPOS_GARANTIA = ["Continente","Contenido","Terceros implicados"];

const SECCIONES = [
  {id:"informe", label:"Informe",                    icon:FileText},
  {id:"encargo", label:"Datos del Encargo",           icon:FileCheck},
  {id:"s1",      label:"1. Verificación del Riesgo",  icon:MapPin},
  {id:"s2",      label:"2. Causas y Circunstancias",  icon:AlertTriangle},
  {id:"s3",      label:"3. Valoración de Daños",      icon:List},
  {id:"s4",      label:"4. Cobertura-Indemnización",  icon:FileCheck},
  {id:"anexos",  label:"Anexos",                      icon:Camera},
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt  = n => new Intl.NumberFormat("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2}).format(+n||0);
const fmtE = n => `${fmt(n)} €`;

const callClaude = async (system, userContent, onTokens, maxTok=1500) => {
  const res = await fetch("/api/claude",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:maxTok,
      system, messages:[{role:"user",content:userContent}] })
  });
  const d = await res.json();
  if(onTokens) onTokens(d.usage?.input_tokens||0, d.usage?.output_tokens||0);
  return (d.content||[]).map(b=>b.text||"").join("");
};

// Normaliza valores monetarios extraídos por IA (6.000,00 → 6000 | 6000.00 → 6000)
const parseCap = v => {
  if(!v && v!==0) return 0;
  const s = String(v).trim();
  // Spanish format: 6.000,00
  if(/^[\d.]+,\d{1,2}$/.test(s)) return parseFloat(s.replace(/\./g,"").replace(",","."));
  // Remove all non-numeric except dot/comma, then parse
  const clean = s.replace(/[^0-9.,]/g,"").replace(",",".");
  return parseFloat(clean)||0;
};


// ─── SUPABASE CLIENT ─────────────────────────────────────────────────────────
const SB_URL  = "https://yrulaaxdusvmzohugmnc.supabase.co";
const SB_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydWxhYXhkdXN2bXpvaHVnbW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzQyMTUsImV4cCI6MjA5NjE1MDIxNX0.TOS0mgr0TdHxlC_kMhqOya_WNWyt2KTEn356USWKQFw";

const sbAuth = async (path, body) => {
  const r = await fetch(`${SB_URL}/auth/v1/${path}`, {
    method:'POST', headers:{'Content-Type':'application/json','apikey':SB_KEY},
    body: JSON.stringify(body)
  });
  return r.json();
};

const sbDb = async (path, method='GET', body=null, token='') => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method, headers:{
      'Content-Type':'application/json', 'apikey':SB_KEY,
      'Authorization':`Bearer ${token||SB_KEY}`,
      'Prefer':'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if(!r.ok) return null;
  const txt = await r.text();
  try { return JSON.parse(txt); } catch { return null; }
};

// ─── CÁLCULO DE PARTIDAS (fuente única de verdad) ────────────────────────────
// Baremo: sin IVA (iva=0). Factura/presupuesto: IVA del documento.
// V.Real = V.Repos × (1 − Depr%) + IVA €
const calcPartida = p => {
  const vRepos = (p.uds||1)*(p.p||0);
  const ivaAmt = vRepos*((p.iva??0)/100);
  const vReal  = vRepos*(1-(p.depr?(p.pctDepr||0):0)/100)+ivaAmt;
  return {vRepos, ivaAmt, vReal};
};
// Partidas activas según modo, excluyendo las sin cobertura
const getPartidas = s3 => {
  const rows = (s3?.modoValoracion==="factura") ? (s3?.pLibres||[]) : (s3?.partidas||[]);
  return rows.filter(p=>p.cobertura!==false);
};
const sumRepos = rows => rows.reduce((a,p)=>a+(p.uds||1)*(p.p||0),0);
const sumIVA   = rows => rows.reduce((a,p)=>a+calcPartida(p).ivaAmt,0);
const sumReal  = rows => rows.reduce((a,p)=>a+calcPartida(p).vReal,0);
// Regla proporcional: 1 si primer riesgo u obras de reforma; si no, infraseguro
const calcRegla = (enc, s1) => {
  if(enc?.primerRiesgo || s1?.tipoContinente==="obrasReforma" || enc?.esHogar) return 1;
  const capCont = parseCap(enc?.capitalContinente);
  const prov = PROVINCIAS.find(p=>p.l===enc?.provincia||p.v===enc?.provincia);
  const calIdx = (s1?.calidad)==="Alta"?2:(s1?.calidad)==="Básica"?0:1;
  const modProv = MOD_ARQ[prov?.v||"00"]||MOD_ARQ["00"];
  const vReal = parseCap(s1?.superficieConstruida)*modProv.hotel[calIdx];
  return vReal>0&&capCont>0&&capCont<vReal ? (capCont/vReal) : 1;
};

const parseJSON = txt => {
  const patterns = [/```json\s*([\s\S]*?)```/,/```([\s\S]*?)```/,/([\s\S]*)/];
  for(const p of patterns){
    const m=txt.match(p);
    if(m){try{return JSON.parse(m[1]||m[0]);}catch{}}
  }
  return {};
};

const getRiesgoIA = async (enc, onTokens) => {
  const raw = await callClaude(
    "Eres un perito de seguros español. Responde SOLO con JSON válido, sin markdown.",
    `Estima las características catastrales del inmueble basándote en los datos del encargo.
ASEGURADO: ${enc.asegurado||""}
DIRECCIÓN: ${enc.lugarIntervencion||""}
MUNICIPIO: ${enc.municipio||""}, PROVINCIA: ${enc.provincia||""}
CAUSA: ${enc.causa||""} — RAMO: ${enc.ramo||""}
DESCRIPCIÓN: ${enc.descripcionSiniestro||""}

Devuelve SOLO este JSON:
{"tipoRiesgo":"tipo de uso (Hotel, Local, Vivienda...)","anoConstruccion":"año numérico","superficieConstruida":"m2 numérico","refCatastral":"si la conoces","calidad":"Básica|Media|Alta","justificacionCalidad":"una frase técnica"}`,
    onTokens
  );
  return parseJSON(raw);
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const FONT = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap";
const css = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.ink};font-size:14px}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .fade{animation:fadeIn .2s ease}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#ccc;border-radius:2px}
  input,select,textarea{font-family:inherit;color:${C.ink}}
  input[type=number]::-webkit-inner-spin-button{opacity:.6}
`;

// ─── BASE UI ─────────────────────────────────────────────────────────────────
const Spin = () => <Loader2 size={14} style={{animation:"spin 1s linear infinite",color:C.accent}}/>;
const Lbl  = ({c,req}) => <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:5,letterSpacing:"0.05em",textTransform:"uppercase"}}>{c}{req&&<span style={{color:C.accent}}> *</span>}</div>;

const inpStyle = (dis) => ({
  width:"100%",padding:"9px 12px",border:`1px solid ${C.border}`,borderRadius:7,
  fontSize:14,background:dis?C.bg:C.white,outline:"none",fontFamily:"inherit",
  transition:"border-color .15s",
});

const Inp = ({label,value,onChange,placeholder,type="text",disabled,required,hint}) => (
  <div style={{marginBottom:14}}>
    {label&&<Lbl c={label} req={required}/>}
    <input type={type} value={value||""} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled} style={inpStyle(disabled)}/>
    {hint&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{hint}</div>}
  </div>
);

const EuroInput = ({label,value,onChange,hint,required,disabled}) => {
  const [focused,setFocused] = useState(false);
  const display = focused?(value||""):(+value>0?fmt(+value)+" €":"");
  return (
    <div style={{marginBottom:14}}>
      {label&&<Lbl c={label} req={required}/>}
      <input type={focused?"number":"text"} value={display}
        onFocus={e=>{setFocused(true);setTimeout(()=>e.target.select(),10)}}
        onBlur={()=>setFocused(false)}
        onChange={e=>onChange(e.target.value)}
        placeholder="0,00 €" disabled={disabled}
        style={{...inpStyle(disabled),fontWeight:!focused&&+value>0?600:400}}/>
      {hint&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{hint}</div>}
    </div>
  );
};

const Sel = ({label,value,onChange,options,required,hint}) => (
  <div style={{marginBottom:14}}>
    {label&&<Lbl c={label} req={required}/>}
    <select value={value||""} onChange={e=>onChange(e.target.value)}
      style={{...inpStyle(false),cursor:"pointer"}}>
      <option value="">Seleccionar…</option>
      {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
    </select>
    {hint&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{hint}</div>}
  </div>
);

const Txt = ({label,value,onChange,placeholder,rows=4,disabled,hint}) => (
  <div style={{marginBottom:14}}>
    {label&&<Lbl c={label}/>}
    <textarea value={value||""} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder} rows={rows} disabled={disabled}
      style={{...inpStyle(disabled),resize:"vertical",lineHeight:1.65}}/>
    {hint&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{hint}</div>}
  </div>
);

const Btn = ({onClick,children,primary,ghost,danger,disabled,sm,full,outline}) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding:sm?"6px 14px":"9px 20px",borderRadius:7,
    border:outline?`1.5px solid ${C.accent}`:"none",
    background:disabled?"#E5E0D8":primary?C.accent:danger?C.red:ghost||outline?"transparent":C.tag,
    color:disabled?C.muted:primary||danger?C.white:C.ink,
    fontSize:sm?12:13,fontWeight:600,display:"inline-flex",alignItems:"center",gap:6,
    fontFamily:"inherit",width:full?"100%":"auto",justifyContent:"center",
    cursor:disabled?"not-allowed":"pointer",opacity:disabled?.6:1,transition:"opacity .15s",
  }}>{children}</button>
);

const Card = ({children,s}) => (
  <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:20,...s}}>{children}</div>
);

const SecTitle = ({n,label,sub}) => (
  <div style={{marginBottom:22,paddingBottom:12,borderBottom:`2px solid ${C.accent}`}}>
    {n&&<div style={{fontSize:10,fontWeight:700,color:C.accent,letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>SECCIÓN {n}</div>}
    <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,fontWeight:400,color:C.ink}}>{label}</h2>
    {sub&&<p style={{fontSize:13,color:C.muted,marginTop:4,lineHeight:1.5}}>{sub}</p>}
  </div>
);

const SectionLabel = ({children}) => (
  <div style={{fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10,marginTop:4}}>{children}</div>
);

const InfoRow = ({label,val}) => (
  <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
    <span style={{color:C.muted}}>{label}</span>
    <span style={{fontWeight:600,color:C.ink,textAlign:"right",maxWidth:"60%"}}>{val||"—"}</span>
  </div>
);

// ─── AI VOICE INPUT ───────────────────────────────────────────────────────────
const VoiceBox = ({value,onChange,onImprove,improving,onApply,applied,placeholder,rows=5}) => {
  const [rec,setRec]   = useState(false);
  const recRef         = useRef();
  const supported      = !!(window.SpeechRecognition||window.webkitSpeechRecognition);

  const startRec = () => {
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR)return;
    const r=new SR(); r.lang="es-ES"; r.continuous=true; r.interimResults=true;
    let final="";
    r.onresult=e=>{let int="";for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)final+=e.results[i][0].transcript+" ";else int+=e.results[i][0].transcript;}onChange((value||"")+(final||int));};
    r.onend=()=>setRec(false);
    recRef.current=r; r.start(); setRec(true);
  };
  const stopRec = ()=>{recRef.current?.stop();setRec(false);};

  return (
    <div>
      <div style={{position:"relative"}}>
        <textarea value={value||""} onChange={e=>onChange(e.target.value)}
          placeholder={placeholder} rows={rows}
          style={{...inpStyle(false),resize:"vertical",lineHeight:1.65,paddingRight:46}}/>
        {supported&&(
          <button onClick={rec?stopRec:startRec} style={{
            position:"absolute",top:10,right:10,background:rec?C.red:C.accent,
            border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>
            {rec?<MicOff size={13} style={{color:"#fff"}}/>:<Mic size={13} style={{color:"#fff"}}/>}
          </button>
        )}
      </div>
      {rec&&<div style={{fontSize:11,color:C.red,marginTop:4,display:"flex",alignItems:"center",gap:5}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:C.red,display:"inline-block",animation:"pulse 1s infinite"}}/>
        Grabando — habla con claridad
      </div>}
      <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
        {value&&<Btn sm onClick={onImprove} disabled={improving} primary>
          {improving?<><Spin/>Mejorando…</>:<><Sparkles size={12}/>Mejorar con IA</>}
        </Btn>}
        {value&&onApply&&<Btn sm onClick={onApply} outline>
          {applied?<><Check size={12}/>Aplicado</>:<><Check size={12}/>Aplicar al informe</>}
        </Btn>}
      </div>
    </div>
  );
};

// ─── NAV BOTTOM ──────────────────────────────────────────────────────────────
const NavBottom = ({onPrev,onNext,onSave,saving,saved,prevLabel,nextLabel}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
    marginTop:32,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
    <div>
      {onPrev&&<Btn ghost onClick={onPrev}><ChevronLeft size={14}/>{prevLabel||"Anterior"}</Btn>}
    </div>
    <div style={{display:"flex",gap:10}}>
      {onSave&&<Btn ghost onClick={onSave} disabled={saving}>
        {saving?<><Spin/>Guardando…</>:saved?<><Check size={13} style={{color:C.green}}/>Guardado</>:<><Save size={13}/>Guardar cambios</>}
      </Btn>}
      {onNext&&<Btn primary onClick={onNext}>{nextLabel||"Siguiente"}<ChevronRight size={14}/></Btn>}
    </div>
  </div>
);

// ─── LOGO ─────────────────────────────────────────────────────────────────────
const Logo = () => (
  <div style={{display:"flex",alignItems:"center",gap:9}}>
    <div style={{width:32,height:32,background:`linear-gradient(135deg,${C.accent},#C1494E)`,
      borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <Sparkles size={14} style={{color:"#fff"}}/>
    </div>
    <div style={{lineHeight:1}}>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16}}>
        <span style={{color:"#fff"}}>PERIT</span><span style={{color:"#C1494E"}}>.IA</span>
      </div>
      <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:".08em",textTransform:"uppercase"}}>Informes Periciales</div>
    </div>
  </div>
);

// ─── LOGIN / REGISTRO ─────────────────────────────────────────────────────────
const LoginScreen = ({onAuth}) => {
  const [mode,setMode]   = useState('login');
  const [email,setEmail] = useState('');
  const [pass,setPass]   = useState('');
  const [err,setErr]     = useState('');
  const [load,setLoad]   = useState(false);

  const [emailSent,setEmailSent] = useState(false);

  const submit = async () => {
    if(!email||!pass){ setErr('Introduce email y contraseña'); return; }
    if(pass.length < 6){ setErr('La contraseña debe tener mínimo 6 caracteres'); return; }
    setLoad(true); setErr('');
    try {
      const res = mode==='login'
        ? await sbAuth('token?grant_type=password', {email, password:pass})
        : await sbAuth('signup', {email, password:pass});

      // Error explícito de Supabase
      if(res.error || res.error_code) {
        const msg = res.error_description || res.message || res.error || 'Error de acceso';
        setErr(msg === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : msg);
        setLoad(false); return;
      }

      // Signup sin session = confirmación de email requerida
      if(mode==='signup' && !res.access_token) {
        setEmailSent(true); setLoad(false); return;
      }

      const token = res.access_token;
      const user  = res.user || res;
      if(!token) { setErr('No se pudo obtener la sesión. Inténtalo de nuevo.'); setLoad(false); return; }
      onAuth(user, token);
    } catch(e) {
      setErr('Error de conexión con el servidor. Verifica tu conexión.');
    } finally {
      setLoad(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'#F8F5F0',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <link rel="stylesheet" href={FONT}/>
      <div style={{width:380,background:'#fff',borderRadius:16,padding:40,boxShadow:'0 8px 40px rgba(0,0,0,.1)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,fontWeight:400,color:'#1A1714',letterSpacing:'-.02em'}}>
            PERIT<span style={{color:'#9B2226'}}>.IA</span>
          </div>
          <div style={{fontSize:12,color:'#888',marginTop:4}}>
            {mode==='login'?'Accede a tu cuenta':'Crea tu cuenta'}
          </div>
        </div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:600,color:'#555',marginBottom:5,textTransform:'uppercase',letterSpacing:'.04em'}}>Email</div>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submit()}
            placeholder="perito@ejemplo.com"
            style={{width:'100%',padding:'10px 13px',border:'1px solid #ddd',borderRadius:8,fontSize:14,fontFamily:'inherit',boxSizing:'border-box',outline:'none'}}/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:600,color:'#555',marginBottom:5,textTransform:'uppercase',letterSpacing:'.04em'}}>Contraseña</div>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submit()}
            placeholder="••••••••"
            style={{width:'100%',padding:'10px 13px',border:'1px solid #ddd',borderRadius:8,fontSize:14,fontFamily:'inherit',boxSizing:'border-box',outline:'none'}}/>
        </div>

        {emailSent&&<div style={{background:'#F0FDF4',border:'1px solid #A7F3D0',borderRadius:7,padding:'10px 14px',fontSize:13,color:'#065F46',marginBottom:14,lineHeight:1.6}}>
          <b>✉️ Revisa tu correo</b><br/>
          Te hemos enviado un email de confirmación a <b>{email}</b>.<br/>
          Confirma tu cuenta y luego <button onClick={()=>{setMode('login');setEmailSent(false);}} style={{background:'none',border:'none',color:'#9B2226',cursor:'pointer',fontWeight:600,fontSize:13,fontFamily:'inherit',padding:0}}>inicia sesión</button>.
        </div>}

        {err&&<div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:7,padding:'8px 12px',fontSize:12,color:'#B91C1C',marginBottom:14}}>{err}</div>}

        {!emailSent&&<button onClick={submit} disabled={load}
          style={{width:'100%',padding:'11px 0',background:load?'#ccc':'#9B2226',color:'#fff',border:'none',borderRadius:9,fontSize:14,fontWeight:700,cursor:load?'not-allowed':'pointer',fontFamily:'inherit',transition:'background .2s'}}>
          {load?'Conectando…':mode==='login'?'Entrar':'Crear cuenta'}
        </button>}

        <div style={{textAlign:'center',marginTop:16,fontSize:13,color:'#888'}}>
          {mode==='login'?'¿No tienes cuenta? ':'¿Ya tienes cuenta? '}
          <button onClick={()=>{setMode(mode==='login'?'signup':'login');setErr('');}}
            style={{background:'none',border:'none',color:'#9B2226',cursor:'pointer',fontWeight:600,fontSize:13,fontFamily:'inherit',padding:0}}>
            {mode==='login'?'Regístrate':'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({cases,onNew,onOpen}) => (
  <div style={{minHeight:"100vh",display:"flex",background:C.bg}}>
    <div style={{width:220,background:C.sidebar,padding:"22px 16px",flexShrink:0,display:"flex",flexDirection:"column"}}>
      <Logo/>
      <div style={{height:1,background:"rgba(255,255,255,.07)",margin:"20px 0"}}/>
      <div style={{flex:1}}/>
      <div style={{background:"rgba(255,255,255,.05)",borderRadius:8,padding:12,fontSize:11,color:"rgba(255,255,255,.35)"}}>PERIT.IA v2.0</div>
    </div>
    <div style={{flex:1,padding:"40px 44px",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32}}>
        <div>
          <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:28,fontWeight:400,color:C.ink,marginBottom:4}}>Mis Encargos</h1>
          <p style={{color:C.muted,fontSize:13}}>{cases.length} expediente{cases.length!==1?"s":""}</p>
        </div>
        <Btn primary onClick={onNew}><Plus size={14}/>Nuevo Encargo</Btn>
      </div>
      {cases.length===0
        ?<Card s={{textAlign:"center",padding:"60px 40px"}}>
          <Building2 size={44} style={{color:C.border,marginBottom:14}}/>
          <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,fontWeight:400,marginBottom:8}}>Sin encargos todavía</h3>
          <p style={{color:C.muted,fontSize:13,marginBottom:20}}>Sube el PDF del encargo para comenzar</p>
          <Btn primary onClick={onNew}><Plus size={14}/>Crear primer encargo</Btn>
        </Card>
        :<div style={{display:"flex",flexDirection:"column",gap:8}}>
          {cases.map(c=>{
            const e=c.encargo||{};
            const done=[c.s1,c.s2,c.s3,c.s4].filter(s=>s&&Object.keys(s).length>2).length;
            return (
              <div key={c.id} onClick={()=>onOpen(c)} style={{background:C.white,border:`1px solid ${C.border}`,
                borderRadius:10,padding:"16px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:42,height:42,background:C.accentLight,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <FileText size={18} style={{color:C.accent}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:15,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.asegurado||"Sin asegurado"}</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:2}}>{e.compania||"—"} · {e.numReferencia||"—"} · {e.lugarIntervencion||""}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                  <div style={{background:C.greenBg,color:C.green,borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:700}}>{done}/4</div>
                  <ChevronRight size={15} style={{color:C.muted}}/>
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  </div>
);

// ─── DROPZONE ─────────────────────────────────────────────────────────────────
const DropZone = ({label,sublabel,icon:Icon,file,onFile,accept=".pdf",badge,isLoading,loadingMsg}) => {
  const ref=useRef(); const [drag,setDrag]=useState(false);
  return (
    <div onDragOver={e=>{e.preventDefault();if(!isLoading)setDrag(true)}}
      onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault();setDrag(false);if(!isLoading){const f=e.dataTransfer.files[0];if(f)onFile(f);}}}
      onClick={()=>{if(!isLoading)ref.current.click()}}
      style={{border:`2px dashed ${drag?C.accent:isLoading?C.accent:file?C.green:C.border}`,borderRadius:10,padding:"24px 18px",
        textAlign:"center",cursor:isLoading?"default":"pointer",
        background:drag?C.accentLight:isLoading?C.accentLight:file?C.greenBg:C.bg,
        transition:"all .2s",position:"relative",minHeight:120,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",gap:7}}>
      {badge&&<div style={{position:"absolute",top:8,left:8,background:C.accent,color:"#fff",borderRadius:4,fontSize:10,fontWeight:700,padding:"2px 7px"}}>{badge}</div>}
      {isLoading
        ?<><Loader2 size={26} style={{color:C.accent,animation:"spin 1s linear infinite"}}/><div style={{fontWeight:600,fontSize:13,color:C.accent}}>{loadingMsg||"Procesando…"}</div></>
        :file
          ?<><div style={{width:32,height:32,background:C.green,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={16} style={{color:"#fff"}}/></div>
              <div style={{fontWeight:600,fontSize:13,color:C.green}}>{file.name}</div>
              <div style={{fontSize:11,color:C.muted}}>{(file.size/1024).toFixed(0)} KB · clic para cambiar</div></>
          :<><Icon size={24} style={{color:drag?C.accent:C.muted}}/><div style={{fontWeight:600,fontSize:13,color:C.ink}}>{label}</div><div style={{fontSize:11,color:C.muted}}>{sublabel}</div></>
      }
      <input ref={ref} type="file" accept={accept} style={{display:"none"}} onChange={e=>e.target.files[0]&&onFile(e.target.files[0])}/>
    </div>
  );
};

// ─── UPLOAD ENCARGO ───────────────────────────────────────────────────────────
const UploadEncargo = ({onDone,onCancel,onTokens}) => {
  const [step,setStep]     = useState("upload");
  const [data,setData]     = useState({});
  const [encFile,setEncFile] = useState(null);
  const [polFile,setPolFile] = useState(null);
  const [polLoading,setPolLoading] = useState(false);
  const [msg,setMsg]       = useState("");

  const toB64 = f => new Promise(r=>{const fr=new FileReader();fr.onload=e=>r(e.target.result.split(",")[1]);fr.readAsDataURL(f);});

  const handlePolFile = async f => { setPolLoading(true); await new Promise(r=>setTimeout(r,300)); setPolFile(f); setPolLoading(false); };

  const processAll = async () => {
    if(!encFile) return;
    setStep("extracting");
    setMsg("Leyendo hoja de encargo…");
    const b64 = await toB64(encFile);
    const encPrompt = `Extrae del documento todos los campos y devuelve SOLO este JSON (sin markdown):
{
  "compania": "nombre de la compania aseguradora",
  "numReferencia": "numero de siniestro o referencia",
  "numPoliza": "numero de poliza",
  "ramo": "ramo del seguro",
  "garantia": "coberturas afectadas separadas por coma (DAGUA, RCEXP, etc)",
  "fechaEncargo": "fecha del encargo dd/mm/aaaa",
  "fechaSiniestro": "fecha de ocurrencia dd/mm/aaaa",
  "numExpInterno": "numero de expediente interno",
  "lugarIntervencion": "direccion completa con numero municipio y codigo postal",
  "provincia": "provincia solo el nombre",
  "municipio": "municipio",
  "asegurado": "nombre completo del asegurado o tomador",
  "nifAsegurado": "NIF o CIF del asegurado",
  "causa": "causa del siniestro",
  "descripcionSiniestro": "descripcion completa del siniestro",
  "perito": "nombre completo del perito",
  "telPerito": "telefono del perito",
  "capitalContinente": "capital asegurado del CONTINENTE EDIFICIO u OBRAS DE REFORMA en euros solo el numero. Busca en tabla de garantias o capitales asegurados. Si no aparece pon 0",
  "capitalContenido": "capital asegurado del CONTENIDO MOBILIARIO o MERCANCIAS en euros solo el numero. Si no aparece pon 0",
  "franquicia": "franquicia general en euros solo el numero. Si no hay pon 0",
  "fechaEfecto": "fecha de efecto o inicio de la poliza en formato dd/mm/aaaa. En encargos AXA aparece como Fecha de efecto en la seccion Poliza al final del documento. Ejemplo: 30/06/2021",
  "tipoEncargo": "INSTANT_PAYMENT si el tipo contiene Instant Payment, PERITACION para cualquier otro tipo",
  "modalidadVisita": "PRESENCIAL si el perito visita el riesgo fisicamente, DOCUMENTAL si se gestiona sin visita presencial",
  "coberturaInferida": "si cobertura afectada vacia deduce de causa: Viento/Pedrisco/Lluvia/Nieve=RGEXT Agua/Filtracion=DAGUA Incendio=INCEN Robo=ROBO Electrico=DELEC sino vacio"
}`;
    const raw = await callClaude(
      "Eres un extractor experto de documentos periciales y de seguros espanoles. Responde SOLO con JSON valido sin markdown.",
      [{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}},
       {type:"text",text:encPrompt}],
      onTokens
    , onTokens, 3000).catch(()=>"{}");
    const enc = parseJSON(raw);

    let pol = {};
    if(polFile){
      setMsg("Leyendo poliza de seguro...");
      const pb64 = await toB64(polFile);
      const cobEnc = (enc.garantia||"").toUpperCase();
      const polPrompt = "Eres un perito de seguros experto en polizas AXA y similares. Analiza esta poliza y extrae los capitales correctos para el siniestro.\n\nCOBERTURA AFECTADA: " + cobEnc + "\n\nINSTRUCCIONES CRITICAS:\n- La poliza puede tener MULTIPLES valores para el continente (Edificio, Edificio primer riesgo, Obras de reforma...)\n- Para DAGUA, RGEXT, INCEN: usa EDIFICIO PRIMER RIESGO si existe con valor>0. Si no, usa OBRAS DE REFORMA.\n- Para RCEXP, RCLOC: usa el capital de RC, no el de continente.\n- NUNCA sumes los valores, elige UNO solo el mas relevante.\n- Para contenido: usa el capital principal de Mobiliario y maquinaria, NO sublimites.\n\nDevuelve SOLO este JSON sin markdown:\n{\n  \"capitalContinente\": \"numero en euros sin simbolo. Capital del continente mas relevante para " + cobEnc + ". Si no existe 0\",\n  \"tipoContinente\": \"tipo elegido: Edificio primer riesgo / Obras de reforma / Edificio\",\n  \"capitalContenido\": \"numero en euros. Capital principal mobiliario o contenido. Si no existe 0\",\n  \"franquicia\": \"numero en euros. Franquicia general. Si no hay 0\",\n  \"garantiasActivas\": \"coberturas contratadas separadas por coma\",\n  \"condicionesEspeciales\": \"resumen breve de condiciones relevantes para la peritacion\",\n  \"primerRiesgo\": true si el capital continente elegido es a primer riesgo false si es valor total,\n  \"fechaEfecto\": \"fecha de efecto de la poliza en formato dd/mm/aaaa. Busca en primera pagina o datos del contrato. Ejemplo: 30/06/2021\",\n  \"todosCapitalesContinente\": \"lista de TODOS los valores de continente: Edificio:0 / Edificio PR:6000 / Obras reforma:1388139\",\"umbralLluvia\": \"litros/m2/hora minimos lluvia segun poliza ej 40\",\"umbralViento\": \"kmh minimos viento segun poliza ej 80\",\n  \"descripciones\": {\n    \"INCEN\": \"texto cobertura incendio\",\n    \"DAGUA\": \"texto cobertura danos por agua\",\n    \"RCEXP\": \"texto cobertura RC explotacion\",\n    \"RGEXT\": \"texto riesgos extensivos\"\n  }\n}";
      const praw = await callClaude(
        "Eres un extractor experto de polizas de seguro empresariales espanolas, especialmente AXA Multirriesgo Empresa. Responde SOLO con JSON valido sin markdown.",
        [{type:"document",source:{type:"base64",media_type:"application/pdf",data:pb64}},
         {type:"text",text:polPrompt}],
        onTokens, 3000
      ).catch(()=>"{}");
      pol = parseJSON(praw);
    }

    // Poliza tiene prioridad sobre encargo
    const bestCap = (a, b) => {
      const vb = parseCap(b);
      if(vb > 0) return String(vb);
      const va = parseCap(a);
      if(va > 0) return String(va);
      return "";
    };

        const CAUSA_COB = {VIENTO:"RGEXT",PEDRISCO:"RGEXT",LLUVIA:"RGEXT",NIEVE:"RGEXT",ATMOSFER:"RGEXT",TEMPORAL:"RGEXT",AGUA:"DAGUA",FILTRAC:"DAGUA",INCENDIO:"INCEN",FUEGO:"INCEN",ROBO:"ROBO",HURTO:"ROBO",ELECTRIC:"DELEC",RAYO:"DELEC"};
    const causaU = (enc.causa||"").toUpperCase();
    const cobFinal2 = enc.garantia||enc.coberturaInferida||Object.entries(CAUSA_COB).find(([k])=>causaU.includes(k))?.[1]||"";
    const ramoU = (enc.ramo||"").toUpperCase();
    const esHogarEnc = ramoU.includes("HOGAR")||ramoU.includes("VIVIENDA");
    const capCPol = parseCap(pol.capitalContinente||enc.capitalContinente);
    const normD = r => { const m=(r||"").match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/); return m?m[1].padStart(2,"0")+"/"+m[2].padStart(2,"0")+"/"+m[3]:r||""; };
    const bestCap2 = (a,b) => { const vb=parseCap(b); if(vb>0)return String(vb); const va=parseCap(a); if(va>0)return String(va); return ""; };
    setData({...enc,
      capitalContinente:        esHogarEnc?(capCPol>0?String(capCPol):""):bestCap2(enc.capitalContinente,pol.capitalContinente),
      capitalContenido:         bestCap2(enc.capitalContenido, pol.capitalContenido),
      franquicia:               String(parseCap(pol.franquicia||enc.franquicia)||0),
      garantia:                 cobFinal2,
      garantiasActivas:         pol.garantiasActivas||enc.garantia||"",
      condicionesEspeciales:    pol.condicionesEspeciales||"",
      primerRiesgo:             pol.primerRiesgo||esHogarEnc||false,
      tipoContinentePoliza:     esHogarEnc?"Primer riesgo (Hogar)":(pol.tipoContinente||""),
      todosCapitalesContinente: esHogarEnc?"":(pol.todosCapitalesContinente||""),
      tipoEncargo:              enc.tipoEncargo||"PERITACION",
      modalidadVisita:          enc.modalidadVisita||"PRESENCIAL",
      esHogar:                  esHogarEnc,
      umbralLluvia:             pol.umbralLluvia||"",
      umbralViento:             pol.umbralViento||"",
      fechaEfecto:              normD(pol.fechaEfecto||enc.fechaEfecto||""),
      descripciones:            pol.descripciones||{},
      polizaAdjunta:            !!polFile,
    });;
    setStep("review");
  };

  const s = f => v => setData(p=>({...p,[f]:v}));

  if(step==="upload") return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg}}>
      <div style={{width:580,background:C.white,borderRadius:14,padding:38,border:`1px solid ${C.border}`}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:48,height:48,background:`linear-gradient(135deg,${C.accent},#C1494E)`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
            <Sparkles size={22} style={{color:"#fff"}}/>
          </div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:22,fontWeight:400,color:C.ink,marginBottom:6}}>Nuevo Encargo</h2>
          <p style={{color:C.muted,fontSize:13}}>Adjunta el encargo y la póliza. La IA extraerá todos los datos automáticamente.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.ink,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Hoja de Encargo <span style={{color:C.accent}}>*</span></div>
            <DropZone label="Adjuntar encargo" sublabel="PDF de la compañía" icon={FileText} file={encFile} onFile={setEncFile} badge="Obligatorio"/>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.ink,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Póliza de Seguro</div>
            <DropZone label="Adjuntar póliza" sublabel="Para extraer capitales y garantías" icon={Shield} file={polFile} onFile={handlePolFile} badge="Opcional" isLoading={polLoading} loadingMsg="Subiendo póliza…"/>
          </div>
        </div>
        {encFile&&<div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:7,padding:"9px 12px",fontSize:12,color:C.green,marginBottom:14,display:"flex",alignItems:"center",gap:7}}>
          <Check size={13}/>
          <span><b>Listo.</b> {polFile?"Encargo y póliza adjuntos — la IA extraerá datos de ambos.":"Encargo adjunto. Sin póliza, los capitales se rellenarán manualmente."}</span>
        </div>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={()=>{setData({});setStep("review");}} style={{background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer",textDecoration:"underline"}}>Crear sin documentos</button>
          <div style={{display:"flex",gap:10}}>
            <Btn ghost onClick={onCancel}>Cancelar</Btn>
            <Btn primary onClick={processAll} disabled={!encFile}><Sparkles size={13}/>Extraer con IA</Btn>
          </div>
        </div>
      </div>
    </div>
  );

  if(step==="extracting") return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg}}>
      <div style={{textAlign:"center",maxWidth:360}}>
        <Loader2 size={40} style={{color:C.accent,animation:"spin 1s linear infinite",marginBottom:16}}/>
        <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:19,fontWeight:400,marginBottom:6}}>Extrayendo datos…</h3>
        <p style={{color:C.accent,fontSize:13,fontWeight:600}}>{msg}</p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,padding:"36px 0",overflowY:"auto"}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 24px"}}>
        <div style={{marginBottom:22}}>
          <div style={{fontSize:10,color:C.accent,fontWeight:700,letterSpacing:".08em",marginBottom:3,textTransform:"uppercase"}}>Datos extraídos ✨</div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:22,fontWeight:400,color:C.ink}}>Revisión del Encargo</h2>
          <p style={{color:C.muted,fontSize:12,marginTop:3}}>Revisa y corrige antes de continuar</p>
        </div>
        <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
          {encFile&&<div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:6,padding:"4px 11px",fontSize:11,color:C.green,display:"flex",alignItems:"center",gap:4}}><Check size={10}/>Encargo: {encFile.name}</div>}
          {polFile&&<div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:6,padding:"4px 11px",fontSize:11,color:C.blue,display:"flex",alignItems:"center",gap:4}}><Check size={10}/>Póliza: {polFile.name}</div>}
        </div>

        <Card s={{marginBottom:12}}>
          <SectionLabel>🏢 Compañía y Siniestro</SectionLabel>
          <div style={{marginBottom:14}}>
            <Lbl c="Compañía ✨" req/>
            <select value={COMPANIAS.find(c=>data.compania&&data.compania.toUpperCase().includes(c.toUpperCase()))||data.compania||""}
              onChange={e=>s("compania")(e.target.value)}
              style={{...inpStyle(false),cursor:"pointer",border:`1px solid ${data.compania?C.border:C.accent}`}}>
              <option value="">Seleccionar…</option>
              {COMPANIAS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            {data.compania&&!COMPANIAS.find(c=>data.compania&&data.compania.toUpperCase().includes(c.toUpperCase()))&&
              <div style={{fontSize:11,color:C.orange,marginTop:3}}>Valor extraído: "{data.compania}" — selecciona manualmente</div>
            }
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Nº Siniestro / Referencia ✨" value={data.numReferencia} onChange={s("numReferencia")} required/>
            <Inp label="Nº Póliza ✨" value={data.numPoliza} onChange={s("numPoliza")}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Ramo ✨" value={data.ramo} onChange={s("ramo")}/>
            <Inp label="Garantía afectada ✨" value={data.garantia} onChange={s("garantia")}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Causa ✨" value={data.causa} onChange={s("causa")}/>
            <Inp label="Nº Exp. Interno ✨" value={data.numExpInterno} onChange={s("numExpInterno")}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Fecha Encargo ✨" value={data.fechaEncargo} onChange={s("fechaEncargo")} placeholder="dd/mm/aaaa"/>
            <Inp label="Fecha Siniestro ✨" value={data.fechaSiniestro} onChange={s("fechaSiniestro")} placeholder="dd/mm/aaaa"/>
          </div>
        </Card>

        <Card s={{marginBottom:12}}>
          <SectionLabel>📍 Asegurado y Localización</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Asegurado / Tomador ✨" value={data.asegurado} onChange={s("asegurado")} required/>
            <Inp label="NIF / CIF ✨" value={data.nifAsegurado} onChange={s("nifAsegurado")}/>
          </div>
          <Inp label="Lugar de intervención ✨" value={data.lugarIntervencion} onChange={s("lugarIntervencion")} required/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Provincia ✨" value={data.provincia} onChange={s("provincia")} placeholder="Ej: Girona"/>
            <Inp label="Municipio ✨" value={data.municipio} onChange={s("municipio")} placeholder="Ej: Palamós"/>
          </div>
        </Card>

        <Card s={{marginBottom:12}}>
          <SectionLabel>💰 Capitales Asegurados {data.polizaAdjunta&&<span style={{color:C.green,fontWeight:400}}>✨ de la póliza</span>}</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <EuroInput label="Capital Continente" value={data.capitalContinente} onChange={s("capitalContinente")}
                hint={data.tipoContinentePoliza?"Tipo: "+data.tipoContinentePoliza:data.polizaAdjunta?"Extraído de la póliza":"Introduce el valor de la póliza"}/>
              {data.todosCapitalesContinente&&<div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:5,padding:"5px 9px",fontSize:10,color:C.blue,marginTop:-10,marginBottom:8}}>
                Todos los capitales en póliza: {data.todosCapitalesContinente}
              </div>}
            </div>
            <EuroInput label="Capital Contenido" value={data.capitalContenido} onChange={s("capitalContenido")}
              hint={data.polizaAdjunta?"Extraído de la póliza":"Introduce el valor de la póliza"}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <EuroInput label="Franquicia general" value={data.franquicia} onChange={s("franquicia")} hint="0,00 € si no hay franquicia"/>
            <Inp label="Fecha efecto póliza ✨" value={data.fechaEfecto} onChange={s("fechaEfecto")} placeholder="dd/mm/aaaa"/>
          </div>
          {data.garantiasActivas&&<div style={{background:C.accentLight,border:"1px solid #F0C0C0",borderRadius:7,padding:"9px 12px",fontSize:12}}>
            <b style={{color:C.accent}}>Garantías:</b> {data.garantiasActivas}
          </div>}
        </Card>

        <Card s={{marginBottom:14}}>
          <SectionLabel>👤 Perito</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Nombre del Perito ✨" value={data.perito} onChange={s("perito")}/>
            <Inp label="Teléfono ✨" value={data.telPerito} onChange={s("telPerito")}/>
          </div>
          <Txt label="Descripción del siniestro ✨" value={data.descripcionSiniestro} onChange={s("descripcionSiniestro")} rows={3}/>
        </Card>

        <div style={{display:"flex",justifyContent:"space-between",paddingBottom:32}}>
          <Btn ghost onClick={onCancel}><ChevronLeft size={14}/>Cancelar</Btn>
          <Btn primary onClick={()=>onDone(data)}>Crear Informe<ChevronRight size={14}/></Btn>
        </div>
      </div>
    </div>
  );
};

// ─── SEC INFORME (live preview) ───────────────────────────────────────────────
const SecInforme = ({enc,s1,s2,s3,s4,anexos,onGoTo}) => {
  const provincia = enc.provincia||"";
  const prov = PROVINCIAS.find(p=>p.l===enc.provincia||p.v===enc.provincia);
  const calIdx = s1?.calidad==="Alta"?2:s1?.calidad==="Básica"?0:1;
  const modProv = MOD_ARQ[prov?.v||"00"]||MOD_ARQ["00"];
  const precio = modProv.hotel[calIdx];
  const vReal = parseFloat(s1?.superficieConstruida||0)*precio;
  const capCont = parseFloat(enc.capitalContinente||0);
  const infraCont = vReal>0&&capCont>0&&capCont<vReal?((vReal-capCont)/vReal*100):0;
  const regla = infraCont>0?(capCont/vReal):1;
  const partidas = s3?.partidas||[];
  const totalDano = sumReal(getPartidas(s3));
  const indemn = Math.max(0,totalDano*regla-parseCap(s3?.franquiciaVal||enc.franquicia));

  const Section = ({n,title,children,id,done}) => (
    <div style={{marginBottom:22,paddingBottom:22,borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:15,fontWeight:400,color:C.ink,borderBottom:`2px solid ${C.accent}`,paddingBottom:5}}>
          {n&&<span style={{fontSize:10,color:C.accent,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",display:"block",marginBottom:2}}>SECCIÓN {n}</span>}
          {title}
        </div>
        {!done&&<Btn sm ghost onClick={()=>onGoTo(id)}>Completar →</Btn>}
        {done&&<span style={{fontSize:11,color:C.green,display:"flex",alignItems:"center",gap:4}}><Check size={11}/>Completado</span>}
      </div>
      {children}
    </div>
  );

  const Empty = ({msg}) => <div style={{fontSize:12,color:C.border,fontStyle:"italic",padding:"12px 0"}}>{msg}</div>;

  return (
    <div className="fade">
      <SecTitle label="Informe Pericial" sub="Vista en tiempo real del informe — se actualiza automáticamente"/>

      {/* CABECERA */}
      <Card s={{marginBottom:18,borderLeft:`4px solid ${C.accent}`,padding:24}}>
        <div style={{textAlign:"center",marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,fontStyle:"italic",color:C.ink}}>INFORME PERICIAL</div>
          <div style={{fontSize:11,color:C.muted,letterSpacing:".1em",textTransform:"uppercase",marginTop:3}}>Intervención Pericial No Auto</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:16}}>
          {[["Compañía",enc.compania],["Nº Referencia",enc.numReferencia],["Nº Póliza",enc.numPoliza],
            ["Ramo",enc.ramo],["Garantía",enc.garantia],["Importe líquido",totalDano>0?fmtE(totalDano):null],
            ["Fecha Encargo",enc.fechaEncargo],["Fecha Siniestro",enc.fechaSiniestro],["Nº Exp. Interno",enc.numExpInterno],
          ].map(([k,v])=>(
            <div key={k} style={{borderBottom:`1px solid ${C.border}`,paddingBottom:7}}>
              <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>{k}</div>
              <div style={{fontSize:13,fontWeight:600,color:v?C.ink:C.border}}>{v||"—"}</div>
            </div>
          ))}
        </div>
        <InfoRow label="Lugar de intervención" val={enc.lugarIntervencion+(provincia?`, ${provincia}`:"")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:10}}>
          <InfoRow label="Asegurado" val={enc.asegurado}/>
          <InfoRow label="Perito" val={enc.perito?(enc.perito+(enc.telPerito?" · "+enc.telPerito:"")):null}/>
        </div>
        <div style={{marginTop:14,padding:11,background:C.bg,borderRadius:7,fontSize:11,color:C.muted,lineHeight:1.7,fontStyle:"italic"}}>
          Este informe ha sido emitido a tenor del siniestro declarado en el riesgo asegurado. El que suscribe manifiesta bajo promesa de decir verdad que ha actuado con la mayor objetividad posible.
        </div>
      </Card>

      {/* PROGRESO */}
      <div style={{display:"flex",gap:7,marginBottom:18,flexWrap:"wrap"}}>
        {[["Encargo",!!(enc.asegurado&&enc.numReferencia)],["Sec.1",!!(s1?.superficieConstruida)],
          ["Sec.2",!!(s2?.textoAI)],["Sec.3",partidas.length>0],["Sec.4",!!(s4?.aiText)]
        ].map(([l,done])=>(
          <div key={l} style={{background:done?C.greenBg:C.tag,border:`1px solid ${done?"#A7F3D0":C.border}`,
            borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:600,color:done?C.green:C.muted,
            display:"flex",alignItems:"center",gap:4}}>
            {done&&<Check size={10}/>}{l}
          </div>
        ))}
        {indemn>0&&<div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:20,padding:"3px 14px",fontSize:12,fontWeight:700,color:C.green,marginLeft:"auto"}}>
          Indemnización: {fmtE(indemn)}
        </div>}
      </div>

      {/* SECCIÓN 1 */}
      <Section n="1" title="Verificación del Riesgo y Póliza" id="s1" done={!!(s1?.superficieConstruida||s1?.textoInstant)}>
        {enc.tipoEncargo==="INSTANT_PAYMENT"
          ? <div style={{fontSize:13,color:C.ink,lineHeight:1.8}}>
              {s1?.textoInstant||(`Localización del riesgo: el riesgo está situado en ${enc.lugarIntervencion||"—"}. Este siniestro se ha gestionado documentalmente.`)}
            </div>
          : s1?.superficieConstruida
          ?<>
            <div style={{fontSize:13,color:C.ink,lineHeight:1.8,marginBottom:12}}>
              {[["Tipo de riesgo",s1.tipoRiesgo],["Año de construcción",s1.anoConstruccion],
                ["Superficie construida",s1.superficieConstruida?" m²":null],
                ["Calidad de acabados",s1.calidad],["Estado general",s1.estado||"—"],
                ["Ref. catastral",s1.refCatastral]
              ].filter(([,v])=>v).map(([k,v])=><InfoRow key={k} label={k} val={k==="Superficie construida"?s1.superficieConstruida+" m²":v}/>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["CONTINENTE",capCont,vReal,infraCont],["CONTENIDO",parseFloat(enc.capitalContenido||0),parseFloat(enc.capitalContenido||0),0]].map(([t,aseg,prev,infra])=>(
                <div key={t} style={{background:infra>0?C.redBg:C.greenBg,border:`1px solid ${infra>0?"#FECACA":"#A7F3D0"}`,borderRadius:7,padding:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:infra>0?C.red:C.green,marginBottom:7,textTransform:"uppercase"}}>{t}</div>
                  {[["Valor Asegurado",fmtE(aseg)],["Valor Preexistente",fmtE(prev)],["Infraseguro",`${fmt(infra)} %`]].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                      <span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {s1.aiText&&<div style={{marginTop:12,fontSize:12,color:C.ink,lineHeight:1.8,background:C.bg,borderRadius:7,padding:12,whiteSpace:"pre-wrap"}}>{s1.aiText}</div>}
          </>
          :<Empty msg="Completa la Sección 1 para ver los datos del riesgo"/>
        }
      </Section>

      {/* SECCIÓN 2 */}
      <Section n="2" title="Causas y Circunstancias" id="s2" done={!!(s2?.textoAI||s2?.textoRaw)}>
        {(s2?.textoAI||s2?.textoRaw)
          ?<div style={{fontSize:13,color:C.ink,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{s2.textoAI||s2.textoRaw}</div>
          :<Empty msg="Completa la Sección 2 para ver las causas y circunstancias"/>}
      </Section>

      {/* SECCIÓN 3 */}
      <Section n="3" title="Valoración de Daños" id="s3" done={partidas.length>0}>
        {partidas.length>0
          ?<>
            {s3?.textoAI&&<div style={{fontSize:13,color:C.ink,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:14}}>{s3.textoAI}</div>}
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:14,fontWeight:400,color:C.ink,marginBottom:8,textAlign:"center"}}>{s3?.tipoGarantia||"Fenómenos atmosféricos"} — {s3?.tipoGarantiaVal||"CONTINENTE"}</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:C.accentLight}}>
                {["Descripción-concepto","Uds","V.Unit.€","V.Repos.€","%IVA","IVA €","Depr","%Depr","V.Real €","V.Prop.€","Perceptor","Cob."].map(h=>(
                  <th key={h} style={{padding:"5px 6px",textAlign:h==="Descripción-concepto"?"left":"right",color:C.accent,fontWeight:700,fontSize:10}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {getPartidas(s3).map((p,i)=>{
                  const {vRepos:vr,ivaAmt,vReal:vreal}=calcPartida(p);
                  return (<tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
                    <td style={{padding:"5px 6px",fontSize:11}}>{p.desc}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{p.uds||1}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{fmt(p.p)}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{fmt(vr)}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{p.iva??21}%</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{fmt(ivaAmt)}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{p.depr?"SI":"NO"}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{p.depr?(p.pctDepr||0)+"%":"0,00"}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{fmt(vreal)}</td>
                    <td style={{padding:"5px 6px",textAlign:"right",fontWeight:700,color:C.green}}>{fmt(vreal)}</td>
                    <td style={{padding:"5px 6px",textAlign:"right"}}>{p.perceptor||"Asegurado 1"}</td>
                    <td style={{padding:"5px 6px",textAlign:"center"}}>{p.cobertura?"Sí":"No"}</td>
                  </tr>);
                })}
                <tr style={{background:C.accentLight,fontWeight:700}}>
                  <td colSpan={3} style={{padding:"7px 6px",color:C.accent}}>Subtotal</td>
                  <td style={{padding:"7px 6px",textAlign:"right"}}>{fmt(sumRepos(getPartidas(s3)))} €</td>
                  <td/><td style={{padding:"7px 6px",textAlign:"right"}}>{fmt(sumIVA(getPartidas(s3)))} €</td>
                  <td colSpan={2}/>
                  <td style={{padding:"7px 6px",textAlign:"right",color:C.accent}}>{fmtE(totalDano)}</td>
                  <td style={{padding:"7px 6px",textAlign:"right",color:C.accent,fontSize:13}}>{fmtE(totalDano)}</td>
                  <td colSpan={2}/>
                </tr>
              </tbody>
            </table>
          </>
          :<Empty msg="Completa la Sección 3 para ver la valoración de daños"/>}
      </Section>

      {/* SECCIÓN 4 */}
      <Section n="4" title="Estudio de Cobertura-Indemnización" id="s4" done={!!(s4?.aiText)}>
        {s4?.aiText
          ?<>
            <div style={{fontSize:13,color:C.ink,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:14}}>{s4.aiText}</div>
            {totalDano>0&&<>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:14,textAlign:"center",marginBottom:8}}>Resumen por garantías — Propuesta de indemnización</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:14}}>
                <thead><tr style={{background:C.accentLight}}>
                  {["Garantía Afectada","D.con cobertura","Límite aseg.","Regla proporcional","Valor ajustado","Franquicia","Indemnización"].map(h=>(
                    <th key={h} style={{padding:"6px 8px",textAlign:h==="Garantía Afectada"?"left":"right",color:C.accent,fontWeight:700,fontSize:11}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  <tr style={{borderBottom:`1px solid ${C.border}`}}>
                    <td style={{padding:"8px",fontWeight:600}}>{enc.garantia||"CONTINENTE"}</td>
                    <td style={{padding:"8px",textAlign:"right"}}>{fmtE(totalDano)}</td>
                    <td style={{padding:"8px",textAlign:"right"}}>{fmtE(capCont)}</td>
                    <td style={{padding:"8px",textAlign:"right"}}>{regla<1?`${fmt(regla*100)}%`:"NO"}</td>
                    <td style={{padding:"8px",textAlign:"right",fontWeight:600}}>{fmtE(totalDano*regla)}</td>
                    <td style={{padding:"8px",textAlign:"right"}}>{fmtE(parseFloat(enc.franquicia||0))}</td>
                    <td style={{padding:"8px",textAlign:"right",fontWeight:700,color:C.green}}>{fmtE(indemn)}</td>
                  </tr>
                  <tr style={{background:C.accentLight,fontWeight:700}}>
                    <td colSpan={6} style={{padding:"8px",textAlign:"right",color:C.accent}}>TOTAL PROPUESTA DE INDEMNIZACIÓN</td>
                    <td style={{padding:"8px",textAlign:"right",color:C.accent,fontSize:14}}>{fmtE(indemn)}</td>
                  </tr>
                </tbody>
              </table>
            </>}
          </>
          :<Empty msg="Completa la Sección 4 para ver el estudio de cobertura"/>}
      </Section>

      {/* ANEXOS */}
      {(()=>{
        const allFotos    = anexos?.fotos||[];
        const allCatastro = anexos?.catastro||[];
        const allMeteosim = anexos?.meteosim||[];
        const allFacturas = [...(anexos?.facturas||[]),...(s3?.facturas||[])];
        const anyAnex = allFotos.length||allCatastro.length||allMeteosim.length||allFacturas.length;
        if(!anyAnex) return null;
        return (
          <div style={{marginBottom:22,paddingBottom:22,borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:15,fontWeight:400,color:C.ink,borderBottom:`2px solid ${C.accent}`,paddingBottom:5,marginBottom:14}}>Anexos</div>
            {[{label:"Reportaje fotográfico",items:allFotos},{label:"Info catastral",items:allCatastro},{label:"Info Meteosim",items:allMeteosim},{label:"Factura",items:allFacturas}]
              .filter(g=>g.items.length>0).map(g=>(
              <div key={g.label} style={{marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>- {g.label}. {g.label}</div>
                {g.label==="Reportaje fotográfico"
                  ?<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                    {allFotos.map(f=>(
                      <div key={f.id} style={{borderRadius:6,overflow:"hidden",border:`1px solid ${C.border}`}}>
                        <img src={f.url} alt={f.caption} style={{width:"100%",height:80,objectFit:"cover",display:"block"}}/>
                        {f.caption&&<div style={{fontSize:9,padding:"3px 5px",color:C.muted,textAlign:"center"}}>{f.caption}</div>}
                      </div>
                    ))}
                  </div>
                  :<div style={{fontSize:12,color:C.muted}}>
                    {g.items.map(f=><div key={f.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                      <Receipt size={11} style={{color:C.muted,flexShrink:0}}/>{f.name}
                    </div>)}
                  </div>
                }
              </div>
            ))}
          </div>
        );
      })()}

      <div style={{textAlign:"center",color:C.muted,fontSize:12,fontStyle:"italic",paddingTop:8}}>
        Por nuestra parte damos por finalizada la intervención en el siniestro, quedando a su disposición ante cualquier aclaración que estimen oportuna.
      </div>
    </div>
  );
};

// ─── SECCIÓN 1 ────────────────────────────────────────────────────────────────
const Sec1 = ({data,onChange,enc,onTokens,onNext,onSave}) => {
  const [autoLoad,setAutoLoad] = useState(false);
  const [autoMsg,setAutoMsg]   = useState("");
  const [autoOk,setAutoOk]     = useState(false);
  const [calSug,setCalSug]     = useState("");
  const [aiLoad,setAiLoad]     = useState(false);
  const [saved,setSaved]       = useState(false);
  const s = f => v => onChange({...data,[f]:v});
  const esHogar  = enc.esHogar||((enc.ramo||"").toUpperCase().includes("HOGAR"));
  const esInstant = enc.tipoEncargo==="INSTANT_PAYMENT";
  const handleSave = () => { onSave?.(); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  // Auto-init instant text
  useEffect(()=>{
    if(esInstant && !data.textoInstant){
      const loc = enc.lugarIntervencion||enc.municipio||"";
      onChange({...data, textoInstant: `Localización del riesgo: el riesgo está situado en ${loc}. Este siniestro se ha gestionado documentalmente.`});
    }
  },[esInstant]);

  // Catastro is manual — no auto-run on mount

  // runAuto removed — catastro data must be entered manually from the official source

  // buscarRef removed — data entered manually from Catastro

  const genTexto = async () => {
    setAiLoad(true);
    const prov = PROVINCIAS.find(p=>p.l===enc.provincia||p.v===enc.provincia);
    const calIdx = data.calidad==="Alta"?2:data.calidad==="Básica"?0:1;
    const precio = (MOD_ARQ[prov?.v||"00"]||MOD_ARQ["00"]).hotel[calIdx];
    const vReal = parseFloat(data.superficieConstruida||0)*precio;
    const capCont = parseFloat(enc.capitalContinente||0);
    const text = await callClaude(
      "Perito de seguros. Redacta en estilo técnico pericial, conciso. Sin título de apartado.",
      `Sección 1.1 "Descripción del Riesgo" de un informe pericial:
RIESGO: ${data.tipoRiesgo||""} · ${data.superficieConstruida||"—"} m² · Año ${data.anoConstruccion||"—"} · Calidad ${data.calidad||"Media"} · ${data.estado||"—"}
UBICACIÓN: ${enc.lugarIntervencion||""}, ${enc.provincia||""}
REF.CATASTRAL: ${data.refCatastral||"No aportada"}
CONTINENTE: Asegurado ${fmtE(capCont)} / Preexistente ${fmtE(vReal)} / Infraseguro ${vReal>capCont&&capCont>0?((vReal-capCont)/vReal*100).toFixed(2):"0,00"}%
Redacta en viñetas, siguiendo el estilo de un informe pericial real.`,
      onTokens
    ).catch(()=>"Error al conectar con la IA.");
    onChange({...data,aiText:text,aiEdited:false,aiApplied:false});
    setAiLoad(false);
  };

  const prov = PROVINCIAS.find(p=>p.l===enc.provincia||p.v===enc.provincia);
  const calIdx = data.calidad==="Alta"?2:data.calidad==="Básica"?0:1;
  const modProv = MOD_ARQ[prov?.v||"00"]||MOD_ARQ["00"];
  const precio = modProv.hotel[calIdx];
  const vReal = parseFloat(data.superficieConstruida||0)*precio;
  const capCont  = data.capContOverride!=null ? parseCap(data.capContOverride)  : parseCap(enc.capitalContinente);
  const capCont2  = data.capCont2Override!=null ? parseCap(data.capCont2Override) : parseCap(enc.capitalContenido);
  const vRealMod = vReal;
  const vRealFinal = esHogar ? capCont : vReal;
  const infraCont = !esHogar&&vReal>0&&capCont>0&&capCont<vReal?((vReal-capCont)/vReal*100):0;
  const primeRiesgo = enc.primerRiesgo||esHogar||false;

  if(esInstant) return (
    <div className="fade">
      <SecTitle n="1" label="Verificación del Riesgo y Póliza" sub="Siniestro gestionado documentalmente — Instant Payment"/>

      <Card s={{marginBottom:14}}>
        <SectionLabel>Texto de la Sección 1</SectionLabel>
        <div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:7,padding:"8px 12px",fontSize:12,color:C.blue,marginBottom:10}}>
          📋 <b>Instant Payment — gestión documental.</b> El texto se genera automáticamente con la dirección del encargo. Edítalo si necesitas ajustarlo.
        </div>
        <textarea value={data.textoInstant||""} onChange={e=>onChange({...data,textoInstant:e.target.value})}
          rows={3} style={{...inpStyle(false),resize:"vertical",lineHeight:1.7,fontSize:13,marginBottom:8}}/>
        <Btn sm primary onClick={async ()=>{
          setAiLoad(true);
          const t = await callClaude(
            "Perito de seguros. Redacta en tercera persona, estilo pericial, conciso. Sin título de apartado.",
            `Mejora este texto para la sección de verificación del riesgo de un informe Instant Payment. Debe incluir la localización del riesgo y que se ha gestionado documentalmente:
TEXTO: "${data.textoInstant||""}"
DIRECCIÓN: ${enc.lugarIntervencion||""}, ${enc.municipio||""}`,
            onTokens
          ).catch(()=>data.textoInstant||"");
          onChange({...data,textoInstant:t});
          setAiLoad(false);
        }} disabled={aiLoad}>
          {aiLoad?<><Spin/>Mejorando…</>:<><Sparkles size={12}/>Mejorar con IA</>}
        </Btn>
      </Card>

      {(enc.umbralViento||enc.umbralLluvia)&&<Card s={{marginBottom:14}}>
        <SectionLabel>Umbrales de Cobertura (Póliza)</SectionLabel>
        {enc.umbralViento&&<InfoRow label="Umbral velocidad viento" val={enc.umbralViento+" km/h"}/>}
        {enc.umbralLluvia&&<InfoRow label="Umbral precipitación lluvia" val={enc.umbralLluvia+" l/m²/h"}/>}
      </Card>}

      <NavBottom onSave={handleSave} onNext={onNext} saved={saved} nextLabel="Siguiente — Causas y Circunstancias"/>
    </div>
  );

  return (
    <div className="fade">
      <SecTitle n="1" label="Verificación del Riesgo y Póliza" sub="Datos del inmueble asegurado, capitales y detección de infraseguro"/>



      {/* DATOS DEL RIESGO */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Datos del Riesgo Asegurado</SectionLabel>
        <Sel label="Tipo de uso" value={data.tipoRiesgo} onChange={s("tipoRiesgo")} options={TIPOS_USO}
          hint={data.tipoRiesgo?"Completado por IA — editable":""}/>

        <div style={{marginBottom:14}}>
          <Lbl c="Calidad de acabados"/>
          <select value={data.calidad||""} onChange={e=>s("calidad")(e.target.value)}
            style={{...inpStyle(false),cursor:"pointer",border:`1.5px solid ${data.calidad?"#A7F3D0":C.border}`}}>
            <option value="">Seleccionar…</option>
            {["Básica","Media","Alta"].map(o=><option key={o}>{o}</option>)}
          </select>
          {calSug&&<div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:5,padding:"7px 10px",marginTop:5,fontSize:11,color:C.green}}>
            <b>✨ Sugerencia IA:</b> {data.calidad} — {calSug}
          </div>}
        </div>
        <Sel label="Estado general del riesgo ✏️ (rellenar tras visita)" value={data.estado} onChange={s("estado")}
          options={["Nuevo","Buen estado","Reformado","Regular","Deteriorado"]}/>
        {!data.estado&&<div style={{fontSize:11,color:C.orange,marginTop:-10,marginBottom:10}}>⚠ Pendiente de rellenar tras la visita presencial</div>}
      </Card>

      {/* CATASTRO */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Consulta Catastral</SectionLabel>
        <div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:7,padding:"10px 13px",marginBottom:12,fontSize:12,color:C.blue,lineHeight:1.6}}>
          <b>ℹ Cómo obtener los datos:</b> Abre la Sede del Catastro, busca el inmueble por la dirección del encargo e introduce los datos manualmente en los campos de abajo.
        </div>
        <a href={`https://www1.sedecatastro.gob.es/cartografia/mapa.aspx?buscar=S&del=&muni=&cp=${encodeURIComponent(enc.lugarIntervencion||"")}`}
          target="_blank" rel="noreferrer"
          style={{display:"flex",alignItems:"center",gap:8,background:C.blue,color:"#fff",borderRadius:7,
            padding:"10px 16px",fontSize:13,fontWeight:600,textDecoration:"none",marginBottom:12,justifyContent:"center"}}>
          🗺️ Abrir Catastro — buscar inmueble
        </a>
        <Inp label="Referencia Catastral" value={data.refCatastral} onChange={s("refCatastral")} placeholder="Ej: 0731107EG1303S0001UG" hint="Cópiala del Catastro (20 caracteres)"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Superficie construida (m²)" value={data.superficieConstruida} onChange={s("superficieConstruida")} type="number" hint="Del Catastro"/>
          <Inp label="Año de construcción" value={data.anoConstruccion} onChange={s("anoConstruccion")} type="number" hint="Del Catastro"/>
        </div>
      </Card>

      {/* CONTINENTE */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Continente / Obras de Reforma</SectionLabel>
        {esHogar&&<div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:7,padding:"9px 12px",fontSize:12,color:C.blue,marginBottom:12}}>
          <b>ℹ Seguro de Hogar — primer riesgo:</b> El valor preexistente es igual al capital asegurado. Sin módulos de arquitectura ni regla proporcional.
        </div>}

        {/* AVISO SI CAPITAL = 0 */}
        {capCont===0&&<div style={{background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:7,
          padding:"10px 13px",marginBottom:12,fontSize:12,color:"#92400E",lineHeight:1.6}}>
          <b>⚠ Capital asegurado no detectado.</b> Introduce el valor manualmente desde la póliza.
        </div>}

        {/* ENTRADA DE CAPITAL */}
        <EuroInput label="Capital asegurado continente (de la póliza)" value={data.capContOverride!=null?data.capContOverride:enc.capitalContinente}
          onChange={v=>onChange({...data,capContOverride:v})}
          hint="Introduce el valor que figura en la póliza"/>

        {!esHogar&&<div style={{marginBottom:14}}>
          <Lbl c="Tipo de cobertura del continente"/>
          <div style={{display:"flex",gap:10,marginTop:4}}>
            {[
              {v:"obrasReforma", l:"Obras de reforma / Primer riesgo", desc:"Valor preexistente = Capital asegurado"},
              {v:"continenteCompleto", l:"Continente completo", desc:"Valor preexistente calculado por módulos"},
            ].map(opt=>(
              <div key={opt.v} onClick={()=>onChange({...data,tipoContinente:opt.v})}
                style={{flex:1,padding:"10px 12px",borderRadius:7,cursor:"pointer",
                  border:`2px solid ${(data.tipoContinente||"obrasReforma")===opt.v?C.accent:C.border}`,
                  background:(data.tipoContinente||"obrasReforma")===opt.v?C.accentLight:C.white}}>
                <div style={{fontWeight:700,fontSize:12,color:(data.tipoContinente||"obrasReforma")===opt.v?C.accent:C.ink,marginBottom:2}}>{opt.l}</div>
                <div style={{fontSize:10,color:C.muted}}>{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>}

        {/* TABLA RESULTADO */}
        {(()=>{
          const tipoCalc = data.tipoContinente||"obrasReforma";
          const prev = (esHogar||tipoCalc==="obrasReforma") ? capCont : (vRealMod||capCont);
          const infra = !esHogar&&tipoCalc==="continenteCompleto"&&vRealMod>0&&capCont>0&&capCont<vRealMod ? ((vRealMod-capCont)/vRealMod*100) : 0;
          const color = infra>0?C.red:C.green;
          const bg    = infra>0?C.redBg:C.greenBg;
          const bord  = infra>0?"#FECACA":"#A7F3D0";
          return (
            <div style={{background:bg,border:`1px solid ${bord}`,borderRadius:8,padding:14}}>
              <div style={{fontSize:11,fontWeight:700,color,marginBottom:10,textTransform:"uppercase"}}>CONTINENTE</div>
              {[["Valor Asegurado",fmtE(capCont)],["Valor Preexistente",fmtE(prev)],["Infraseguro",`${fmt(infra)} %`]].map(([k,v],i)=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${i<2?C.border:"transparent"}`,fontSize:13}}>
                  <span style={{color:C.muted,fontWeight:i===2?700:400}}>{k}</span>
                  <span style={{fontWeight:700,color:i===2&&infra>0?C.red:i===2?C.green:C.ink}}>{v}</span>
                </div>
              ))}
              {tipoCalc==="continenteCompleto"&&data.superficieConstruida&&(
                <div style={{fontSize:10,color:C.muted,marginTop:6}}>
                  Cálculo: {fmt(parseFloat(data.superficieConstruida))} m² × {fmt(precio)} €/m² ({modProv.n} · {data.calidad||"Media"})
                </div>
              )}
              {infra>0&&<div style={{background:C.orangeBg,border:"1px solid #FED7AA",borderRadius:6,padding:"8px 10px",marginTop:8,fontSize:11,color:C.orange}}>
                <b>⚠ Infraseguro {fmt(infra)}%</b> — Regla proporcional: coeficiente {(capCont/vReal).toFixed(4)}
              </div>}
            </div>
          );
        })()}
      </Card>

      {/* CONTENIDO */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Contenido</SectionLabel>

        {/* AVISO SI CAPITAL = 0 */}
        {capCont2===0&&<div style={{background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:7,
          padding:"10px 13px",marginBottom:12,fontSize:12,color:"#92400E",lineHeight:1.6}}>
          <b>⚠ Capital asegurado no detectado.</b> Introduce el valor manualmente desde la póliza.
        </div>}

        <EuroInput label="Capital asegurado contenido (de la póliza)" value={data.capCont2Override!=null?data.capCont2Override:enc.capitalContenido}
          onChange={v=>onChange({...data,capCont2Override:v})}
          hint="Introduce el valor que figura en la póliza"/>

        <div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:8,padding:14,marginTop:4}}>
          <div style={{fontSize:11,fontWeight:700,color:C.green,marginBottom:10,textTransform:"uppercase"}}>CONTENIDO</div>
          {[["Valor Asegurado",fmtE(capCont2)],["Valor Preexistente",fmtE(capCont2)],["Infraseguro","0,00 %"]].map(([k,v],i)=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${i<2?C.border:"transparent"}`,fontSize:13}}>
              <span style={{color:C.muted,fontWeight:i===2?700:400}}>{k}</span>
              <span style={{fontWeight:700,color:i===2?C.green:C.ink}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{fontSize:11,color:C.muted,marginTop:7,fontStyle:"italic"}}>La preexistencia del contenido es estimada atendiendo a criterios objetivos de calidad, ubicación y superficie.</div>
      </Card>

      {/* IA TEXTO */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Redacción IA — Sección 1</SectionLabel>
        {!data.estado&&<div style={{fontSize:11,color:C.orange,marginBottom:8}}>⚠ Rellena primero el estado general del riesgo</div>}
        <Btn primary onClick={genTexto} disabled={aiLoad||!data.superficieConstruida}>
          {aiLoad?<><Spin/>Generando…</>:<><Sparkles size={13}/>Generar texto pericial</>}
        </Btn>
        {(data.aiText||aiLoad)&&<div style={{background:C.accentLight,border:"1px solid #F0C0C0",borderRadius:8,padding:13,marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:11,fontWeight:700,color:C.accent,display:"flex",alignItems:"center",gap:5}}><Sparkles size={11}/>TEXTO IA {data.aiEdited&&<span style={{color:C.orange}}>(editado)</span>}</span>
            <div style={{display:"flex",gap:6}}>
              <Btn sm ghost onClick={genTexto} disabled={aiLoad}><RefreshCw size={10}/></Btn>
              {data.aiText&&<Btn sm outline onClick={()=>onChange({...data,aiApplied:true})}>{data.aiApplied?<><Check size={10}/>Aplicado al informe</>:<><Check size={10}/>Aplicar al informe</>}</Btn>}
            </div>
          </div>
          {aiLoad?<div style={{display:"flex",gap:8,alignItems:"center",color:C.muted,fontSize:12}}><Spin/>Generando…</div>
            :<textarea value={data.aiText||""} onChange={e=>onChange({...data,aiText:e.target.value,aiEdited:true})}
              rows={6} style={{...inpStyle(false),resize:"vertical",lineHeight:1.65,fontSize:13}}/>}
        </div>}
      </Card>

      <NavBottom onSave={handleSave} onNext={onNext} saved={saved} nextLabel="Siguiente — Causas y Circunstancias"/>
    </div>
  );
};

// ─── SECCIÓN 2 ────────────────────────────────────────────────────────────────
const Sec2 = ({data,onChange,enc,onTokens,onNext,onPrev,onSave}) => {
  const [improving,setImproving] = useState(false);
  const [saved,setSaved]         = useState(false);
  const s = f => v => onChange({...data,[f]:v});

  const improve = async () => {
    if(!data.textoRaw) return;
    setImproving(true);
    const text = await callClaude(
      "Perito de seguros. Redacta en tercera persona, estilo pericial, conciso. Sin título de apartado.",
      `Mejora este texto para causas y circunstancias del siniestro. Tercera persona, técnico, conciso:
CONTEXTO: ${enc.causa||""} — ${enc.lugarIntervencion||""}
"${data.textoRaw}"`,
      onTokens
    ).catch(()=>"Error de conexión.");
    onChange({...data,textoAI:text,aiApplied:false});
    setImproving(false);
  };

  const handleSave = () => { onSave?.(); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <div className="fade">
      <SecTitle n="2" label="Causas y Circunstancias" sub="Describe el siniestro — por voz o texto. La IA adaptará el lenguaje al vocabulario pericial."/>

      <Card s={{marginBottom:14}}>
        <SectionLabel>Descripción del Siniestro</SectionLabel>
        <div style={{background:C.accentLight,border:"1px solid #F0C0C0",borderRadius:7,padding:"9px 12px",fontSize:12,color:C.accent,marginBottom:12}}>
          Habla o escribe con tus propias palabras. La IA transformará el texto al lenguaje técnico pericial.
        </div>
        {(enc.umbralViento||enc.umbralLluvia)&&<div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:7,padding:"8px 12px",fontSize:11,color:C.blue,marginBottom:10,display:"flex",gap:14,flexWrap:"wrap"}}>
          <b>Umbrales póliza:</b>{enc.umbralViento&&<span> 🌬️ Viento: <b>{enc.umbralViento} km/h</b></span>}{enc.umbralLluvia&&<span> 🌧️ Lluvia: <b>{enc.umbralLluvia} l/m²/h</b></span>}
        </div>}
        <VoiceBox value={data.textoRaw||""} onChange={s("textoRaw")}
          onImprove={improve} improving={improving}
          onApply={()=>onChange({...data,aiApplied:true})} applied={data.aiApplied}
          placeholder="Describe el siniestro: cómo ocurrió, qué daños encontraste, qué te dijeron los afectados…" rows={5}/>
      </Card>

      {data.textoAI&&(
        <Card s={{marginBottom:14}}>
          <SectionLabel>Texto Pericial — Editable</SectionLabel>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            <Btn sm ghost onClick={improve} disabled={improving}><RefreshCw size={10}/>Regenerar</Btn>
            <Btn sm outline onClick={()=>onChange({...data,aiApplied:true})}>{data.aiApplied?<><Check size={10}/>Aplicado</>:<><Check size={10}/>Aplicar al informe</>}</Btn>
          </div>
          <textarea value={data.textoAI} onChange={e=>onChange({...data,textoAI:e.target.value,aiEdited:true})}
            rows={6} style={{...inpStyle(false),resize:"vertical",lineHeight:1.65,fontSize:13}}/>
          {data.aiEdited&&<div style={{fontSize:11,color:C.orange,marginTop:3}}>Texto editado manualmente</div>}
        </Card>
      )}


      <NavBottom onPrev={onPrev} onSave={handleSave} onNext={onNext} saved={saved}
        prevLabel="Verificación del Riesgo" nextLabel="Siguiente — Valoración de Daños"/>
    </div>
  );
};

// ─── SECCIÓN 3 ────────────────────────────────────────────────────────────────
const Sec3 = ({data,onChange,enc,onTokens,onNext,onPrev,onSave}) => {
  const [improving,setImproving] = useState(false);
  const [genLoad,setGenLoad]     = useState(false);
  const [saved,setSaved]         = useState(false);
  const facRef                   = useRef();
  const s = f => v => onChange({...data,[f]:v});

  const partidas  = data.partidas||[];
  const modoVal   = data.modoValoracion||"baremo";
  const facturas  = data.facturas||[];

  // Usa la fuente única global calcPartida
  const calc = calcPartida;
  const rowsActivas = getPartidas(data);
  const totRepos = sumRepos(rowsActivas);
  const totIVA   = sumIVA(rowsActivas);
  const totReal  = sumReal(rowsActivas);

  const updP = (i,f,v) => onChange({...data,partidas:partidas.map((p,idx)=>idx===i?{...p,[f]:v}:p)});
  const delP = i => onChange({...data,partidas:partidas.filter((_,idx)=>idx!==i)});
  const addRow = () => { const ivaDef=modoVal==="factura"?21:0; onChange({...data,partidas:[...partidas,{id:Date.now()+Math.random(),desc:"",uds:1,p:0,iva:ivaDef,depr:false,pctDepr:0,perceptor:"Asegurado 1",cobertura:true}]}); };

  const handleSave = () => { onSave?.(); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  // ── AI: mejorar texto descripción ────────────────────────────────────────
  const improveText = async () => {
    if(!data.textoRaw) return;
    setImproving(true);
    const text = await callClaude(
      "Perito de seguros. Redacta en tercera persona, estilo pericial, conciso. Sin título de apartado.",
      `Mejora este texto para el apartado de valoración de daños. Directo, técnico, sin redundancias:
CAUSA: ${enc.causa||""} | GARANTÍA: ${enc.garantia||""}
TEXTO: "${data.textoRaw}"`,
      onTokens
    ).catch(()=>"Error al conectar.");
    onChange({...data,textoAI:text});
    setImproving(false);
  };

  // ── AI: generar tabla desde descripción usando Baremo ────────────────────
  const genFromBaremo = async () => {
    const desc = data.textoAI||data.textoRaw;
    if(!desc) return;
    setGenLoad(true);
    const baremoCtx = BAREMO.map(b=>`${b.cod}|${b.g}|${b.desc}|${b.u}|${fmt(b.p)}€`).join('\n');
    const raw = await callClaude(
      "Perito de seguros. SOLO JSON válido, sin markdown.",
      `Selecciona partidas del baremo según los daños descritos y estima cantidades razonables.
DAÑOS: ${desc}
CAUSA: ${enc.causa||""} | RIESGO: ${enc.lugarIntervencion||""}

BAREMO AXA 2025 (cod|grupo|descripción|ud|precio):
${baremoCtx}

Devuelve SOLO:
{"partidas":[{"cod":"","desc":"","uds":1,"p":0,"iva":21,"depr":false,"pctDepr":0,"perceptor":"Asegurado 1","cobertura":true}]}`,
      onTokens, 2000
    ).catch(()=>'{"partidas":[]}');
    const j = parseJSON(raw);
    if(j.partidas?.length>0){
      // Merge baremo price from BAREMO array
      const rows = j.partidas.map(p=>{
        const ref = BAREMO.find(b=>b.cod===p.cod);
        return {...p, id:Date.now()+Math.random(), p:ref?ref.p:p.p, desc:ref?ref.desc:p.desc, iva:0, depr:p.depr||false, pctDepr:p.pctDepr||0, cobertura:p.cobertura!==false};
      });
      onChange({...data,partidas:rows});
    }
    setGenLoad(false);
  };

  // ── AI: extraer tabla desde facturas/presupuestos ─────────────────────────
  const extractFromFacturas = async () => {
    if(!facturas.length) return;
    setGenLoad(true);
    const toB64 = f=>new Promise(r=>{const fr=new FileReader();fr.onload=e=>r(e.target.result.split(',')[1]);fr.readAsDataURL(f);});
    let all=[];
    for(const fac of facturas){
      if(!fac.file) continue;
      const b64 = await toB64(fac.file);
      const raw = await callClaude(
        "Extractor de facturas/presupuestos. SOLO JSON válido.",
        [{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}},
         {type:"text",text:`Extrae todas las líneas de esta factura o presupuesto. Devuelve SOLO:
{"partidas":[{"desc":"descripción","uds":1,"p":0.00,"iva":21,"depr":false,"pctDepr":0,"perceptor":"Asegurado 1","cobertura":true}]}`}],
        onTokens, 2000
      ).catch(()=>'{"partidas":[]}');
      const j = parseJSON(raw);
      if(j.partidas?.length>0) all=[...all,...j.partidas.map(p=>({...p,id:Date.now()+Math.random()}))];
    }
    if(all.length>0) onChange({...data,partidas:all});
    setGenLoad(false);
  };

  // ── Adjuntar facturas ────────────────────────────────────────────────────
  const addFactura = files => {
    const news = Array.from(files).map(f=>({id:Date.now()+Math.random(),name:f.name,size:f.size,file:f}));
    onChange({...data,facturas:[...facturas,...news]});
  };
  const delFactura = id => onChange({...data,facturas:facturas.filter(f=>f.id!==id)});

  const InpCell = ({val,onChange:oc,type="text",w=60}) => (
    <input type={type} value={val||""} onChange={e=>oc(type==="number"?+e.target.value:e.target.value)}
      style={{width:w,padding:"2px 4px",border:`1px solid ${C.border}`,borderRadius:3,fontSize:10,fontFamily:"inherit",textAlign:type==="number"?"right":"left"}}/>
  );

  return (
    <div className="fade">
      <SecTitle n="3" label="Valoración de Daños" sub="Describe los daños y la IA creará la tabla de valoración automáticamente."/>

      {/* PARÁMETROS DE GARANTÍA */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Parámetros de Garantía</SectionLabel>
        <Sel label="Tipo de garantía" value={data.tipoGarantiaVal} onChange={v=>{
          const lim=v==="Continente"?(enc.capitalContinente||"0"):v==="Contenido"?(enc.capitalContenido||"0"):"0";
          onChange({...data,tipoGarantiaVal:v,limiteGarantia:data.limiteGarantia||lim});
        }} options={TIPOS_GARANTIA}/>
        <Inp label="Concepto de garantía" value={data.conceptoGarantia} onChange={s("conceptoGarantia")}
          placeholder={enc.causa||"Fenómenos atmosféricos"} hint="Del encargo — editable"/>
        <EuroInput label="Límite de garantía (€)" value={data.limiteGarantia||enc.capitalContinente} onChange={s("limiteGarantia")}/>
        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:14}}>
          <div>
            <Lbl c="Regla proporcional"/>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
              <input type="checkbox" checked={!!data.reglaProporcionl} onChange={e=>onChange({...data,reglaProporcionl:e.target.checked})} style={{width:16,height:16,cursor:"pointer"}}/>
              <span style={{fontSize:12,color:data.reglaProporcionl?C.orange:C.muted}}>{data.reglaProporcionl?"Activada":"Desactivada"}</span>
            </div>
          </div>
        </div>
        <EuroInput label="Franquicia (€)" value={data.franquiciaVal||enc.franquicia||"0"} onChange={s("franquiciaVal")}
          hint="De la póliza — editable"/>
      </Card>

      {/* DESCRIPCIÓN DE DAÑOS */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Descripción de los Daños</SectionLabel>
        <VoiceBox value={data.textoRaw||""} onChange={s("textoRaw")}
          onImprove={improveText} improving={improving}
          placeholder="Describe los daños encontrados en la visita pericial…" rows={4}/>
        {data.textoAI&&(
          <div style={{marginTop:10}}>
            <div style={{display:"flex",gap:6,marginBottom:6}}>
              <Btn sm ghost onClick={improveText} disabled={improving}><RefreshCw size={10}/>Regenerar</Btn>
              <Btn sm outline onClick={()=>onChange({...data,aiApplied:true})}>{data.aiApplied?<><Check size={10}/>Aplicado al informe</>:<><Check size={10}/>Aplicar al informe</>}</Btn>
            </div>
            <textarea value={data.textoAI} onChange={e=>onChange({...data,textoAI:e.target.value})}
              rows={4} style={{...inpStyle(false),resize:"vertical",lineHeight:1.65,fontSize:13}}/>
          </div>
        )}
      </Card>

      {/* MODO DE VALORACIÓN */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[{v:"baremo",l:"📋 Por Baremo AXA 2025"},{v:"factura",l:"🧾 Por Factura / Presupuesto"}].map(m=>(
          <button key={m.v} onClick={()=>onChange({...data,modoValoracion:m.v})}
            style={{padding:"7px 16px",borderRadius:7,border:`1.5px solid ${modoVal===m.v?C.accent:C.border}`,
              background:modoVal===m.v?C.accentLight:C.white,cursor:"pointer",fontSize:12,
              fontWeight:modoVal===m.v?700:400,color:modoVal===m.v?C.accent:C.ink,fontFamily:"inherit"}}>{m.l}
          </button>
        ))}
      </div>

      {/* FACTURAS / PRESUPUESTOS */}
      {modoVal==="factura"&&<Card s={{marginBottom:14}}>
        <SectionLabel>Facturas / Presupuestos</SectionLabel>
        <div onClick={()=>facRef.current.click()}
          style={{border:`2px dashed ${C.border}`,borderRadius:8,padding:"16px",textAlign:"center",
            cursor:"pointer",background:C.bg,marginBottom:10}}>
          <Upload size={20} style={{color:C.muted,marginBottom:6}}/>
          <div style={{fontSize:12,fontWeight:600,color:C.ink}}>Adjuntar facturas o presupuestos</div>
          <div style={{fontSize:11,color:C.muted}}>PDF · Se adjuntarán automáticamente al informe final</div>
          <input ref={facRef} type="file" multiple accept=".pdf" style={{display:"none"}}
            onChange={e=>addFactura(e.target.files)}/>
        </div>
        {facturas.map(f=>(
          <div key={f.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",
            background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:6,marginBottom:6,fontSize:12}}>
            <Receipt size={13} style={{color:C.green,flexShrink:0}}/>
            <span style={{flex:1,color:C.green,fontWeight:600}}>{f.name}</span>
            <span style={{color:C.muted,fontSize:11}}>{f.size?(f.size/1024).toFixed(0)+" KB":""}</span>
            <button onClick={()=>delFactura(f.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted}}><X size={12}/></button>
          </div>
        ))}
        {facturas.length>0&&<Btn primary full onClick={extractFromFacturas} disabled={genLoad}>
          {genLoad?<><Spin/>Extrayendo partidas…</>:<><Sparkles size={13}/>Extraer tabla desde {facturas.length} factura{facturas.length>1?"s":""}</>}
        </Btn>}
      </Card>}

      {/* TABLA DE VALORACIÓN */}
      <Card s={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <SectionLabel>{modoVal==="baremo"?"Tabla de Valoración — Baremo AXA 2025":"Tabla de Valoración — Factura/Presupuesto"}</SectionLabel>
          <div style={{display:"flex",gap:6}}>
            {modoVal==="baremo"&&<Btn sm primary onClick={genFromBaremo} disabled={genLoad||(!data.textoRaw&&!data.textoAI)}>
              {genLoad?<><Spin/>Generando…</>:<><Sparkles size={11}/>Generar tabla con IA</>}
            </Btn>}
            <Btn sm onClick={addRow}><Plus size={11}/>Fila</Btn>
          </div>
        </div>

        <div style={{fontSize:11,color:C.blue,background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:6,padding:"6px 10px",marginBottom:10}}>
          <b>Fórmula:</b> V.Real = V.Repos × (1 − Depr%) + IVA importes
        </div>

        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,minWidth:900}}>
            <thead><tr style={{background:C.accentLight}}>
              {["Descripción-concepto","Uds","V.Unitario €","V.Repos €","%IVA","IVA €","Depr","%Depr","V.Real €","V.Propuesto €","Perceptor","Cob.",""].map(h=>(
                <th key={h} style={{padding:"5px 5px",textAlign:h==="Descripción-concepto"||h===""?"left":"right",color:C.accent,fontWeight:700,whiteSpace:"nowrap",borderBottom:`2px solid ${C.accent}`}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {partidas.length===0&&<tr><td colSpan={13} style={{padding:20,textAlign:"center",color:C.muted,fontSize:12}}>
                {modoVal==="baremo"?"Describe los daños y pulsa «Generar tabla con IA»":"Adjunta facturas y extrae las partidas automáticamente"}
              </td></tr>}
              {partidas.map((p,i)=>{
                const {vRepos,ivaAmt,vReal}=calc(p);
                return (
                  <tr key={p.id||i} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?"transparent":C.bg}}>
                    <td style={{padding:"4px 5px",minWidth:180}}>
                      <input value={p.desc||""} onChange={e=>updP(i,"desc",e.target.value)}
                        style={{width:"100%",padding:"2px 4px",border:`1px solid ${C.border}`,borderRadius:3,fontSize:10,fontFamily:"inherit"}}/>
                    </td>
                    <td style={{padding:"3px 4px"}}><InpCell val={p.uds} onChange={v=>updP(i,"uds",v)} type="number" w={44}/></td>
                    <td style={{padding:"3px 4px"}}><InpCell val={p.p} onChange={v=>updP(i,"p",v)} type="number" w={70}/></td>
                    <td style={{padding:"4px 5px",textAlign:"right",fontWeight:600}}>{fmt(vRepos)}</td>
                    <td style={{padding:"3px 4px"}}><InpCell val={p.iva??21} onChange={v=>updP(i,"iva",v)} type="number" w={36}/></td>
                    <td style={{padding:"4px 5px",textAlign:"right"}}>{fmt(ivaAmt)}</td>
                    <td style={{padding:"3px 4px",textAlign:"center"}}>
                      <input type="checkbox" checked={!!p.depr} onChange={e=>updP(i,"depr",e.target.checked)} style={{cursor:"pointer"}}/>
                    </td>
                    <td style={{padding:"3px 4px"}}>{p.depr&&<InpCell val={p.pctDepr} onChange={v=>updP(i,"pctDepr",v)} type="number" w={36}/>}</td>
                    <td style={{padding:"4px 5px",textAlign:"right"}}>{fmt(vReal)}</td>
                    <td style={{padding:"4px 5px",textAlign:"right",fontWeight:700,color:C.green}}>{fmt(vReal)}</td>
                    <td style={{padding:"3px 4px"}}>
                      <select value={p.perceptor||"Asegurado 1"} onChange={e=>updP(i,"perceptor",e.target.value)}
                        style={{fontSize:9,border:`1px solid ${C.border}`,borderRadius:3,padding:"2px",fontFamily:"inherit"}}>
                        <option>Asegurado 1</option><option>Asegurado 2</option><option>Perjudicado 1</option><option>Perjudicado 2</option>
                      </select>
                    </td>
                    <td style={{padding:"3px 4px",textAlign:"center"}}>
                      <input type="checkbox" checked={p.cobertura!==false} onChange={e=>updP(i,"cobertura",e.target.checked)} style={{cursor:"pointer"}}/>
                    </td>
                    <td><button onClick={()=>delP(i)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,padding:"2px"}}><X size={11}/></button></td>
                  </tr>
                );
              })}
              {partidas.length>0&&<tr style={{background:C.accentLight,fontWeight:700}}>
                <td style={{padding:"6px 5px",color:C.accent,fontSize:11}}>Subtotal</td>
                <td/>
                <td/>
                <td style={{padding:"6px 5px",textAlign:"right",color:C.accent}}>{fmt(totRepos)} €</td>
                <td/>
                <td style={{padding:"6px 5px",textAlign:"right",color:C.accent}}>{fmt(totIVA)} €</td>
                <td colSpan={2}/>
                <td style={{padding:"6px 5px",textAlign:"right",color:C.accent,fontSize:12}}>{fmt(totReal)} €</td>
                <td style={{padding:"6px 5px",textAlign:"right",color:C.accent,fontSize:13}}>{fmt(totReal)} €</td>
                <td colSpan={3}/>
              </tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <NavBottom onPrev={onPrev} onSave={handleSave} onNext={onNext} saved={saved}
        prevLabel="Causas y Circunstancias" nextLabel="Siguiente — Cobertura e Indemnización"/>
    </div>
  );
};

// ─── SECCIÓN 4 ────────────────────────────────────────────────────────────────
const Sec4 = ({data,onChange,enc,s1,s3,onTokens,onNext,onPrev,onSave}) => {
  const [aiLoad,setAiLoad] = useState(false);
  const [saved,setSaved]   = useState(false);
  const s = f => v => onChange({...data,[f]:v});

  const partidas = getPartidas(s3);
  const totalDano = sumReal(partidas);
  const capCont = parseCap(enc.capitalContinente);
  const regla = calcRegla(enc, s1);
  const franq = parseCap(s3?.franquiciaVal||enc.franquicia);
  const indemn = Math.max(0,totalDano*regla-franq);

  // Auto-fill descripción cobertura from policy
  useEffect(()=>{
    if(!data.descripcionCobertura&&enc.descripciones){
      const gars = (enc.garantia||"").split(/[;, ]+/);
      const desc = gars.map(g=>enc.descripciones[g]).filter(Boolean).join("\n\n");
      if(desc) onChange({...data,descripcionCobertura:desc});
    }
  },[]);

  const genAI = async () => {
    setAiLoad(true);
    const text = await callClaude(
      "Perito de seguros. Redacta en estilo pericial, conciso y técnico. Sin título de apartado.",
      `Sección "Estudio de Cobertura-Indemnización" del informe:
CAUSA: ${enc.causa||""} · GARANTÍA: ${enc.garantia||""} · PÓLIZA: ${enc.numPoliza||""}
DAÑO VALORADO: ${fmtE(totalDano)} · REGLA PROPORCIONAL: ${regla<1?`Sí, coeficiente ${regla.toFixed(4)}`:"No aplicable"}
FRANQUICIA: ${fmtE(franq)} · INDEMNIZACIÓN: ${fmtE(indemn)}
COBERTURA PÓLIZA: ${data.descripcionCobertura||enc.garantia||""}
Analiza coberturas aplicables, posibles exclusiones y justifica la propuesta de indemnización. Sin redundancias.`,
      onTokens
    ).catch(()=>"Error.");
    onChange({...data,aiText:text,aiApplied:false});
    setAiLoad(false);
  };

  const handleSave = () => { onSave?.(); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <div className="fade">
      <SecTitle n="4" label="Estudio de Cobertura-Indemnización" sub="Análisis de coberturas aplicables y propuesta de indemnización final"/>

      {/* DESCRIPCIÓN COBERTURA */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Descripción de la Cobertura</SectionLabel>
        <div style={{fontSize:11,color:C.muted,marginBottom:8}}>
          Texto extraído automáticamente de la póliza para la garantía afectada. Editable.
        </div>
        <Txt value={data.descripcionCobertura} onChange={s("descripcionCobertura")} rows={5}
          placeholder={enc.garantia?"Buscando cobertura para "+enc.garantia+"…":"Adjunta la póliza en el paso inicial para extraer automáticamente la descripción de la cobertura"}/>
        {!data.descripcionCobertura&&<div style={{fontSize:11,color:C.orange}}>⚠ Sin póliza adjunta — introduce manualmente la descripción de la cobertura</div>}
      </Card>

      {/* TABLA GARANTÍAS */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Resumen por Garantías</SectionLabel>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:C.accentLight}}>
              {["Garantía Afectada","D.con cobertura","Límite aseg.","Regla proporcional","Valor ajustado","Franquicia","Indemnización"].map(h=>(
                <th key={h} style={{padding:"7px 8px",textAlign:h==="Garantía Afectada"?"left":"right",color:C.accent,fontWeight:700,fontSize:11}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              <tr style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"8px",fontWeight:600}}>{enc.garantia||"CONTINENTE"} — {enc.causa||""}</td>
                <td style={{padding:"8px",textAlign:"right"}}>{fmtE(totalDano)}</td>
                <td style={{padding:"8px",textAlign:"right"}}>{fmtE(parseFloat(s3?.limiteGarantia||capCont))}</td>
                <td style={{padding:"8px",textAlign:"right"}}>{regla<1?`${fmt(regla*100)}%`:"NO"}</td>
                <td style={{padding:"8px",textAlign:"right",fontWeight:600}}>{fmtE(totalDano*regla)}</td>
                <td style={{padding:"8px",textAlign:"right"}}>{fmtE(franq)}</td>
                <td style={{padding:"8px",textAlign:"right",fontWeight:700,color:C.green}}>{fmtE(indemn)}</td>
              </tr>
              <tr style={{background:C.accentLight,fontWeight:700}}>
                <td style={{padding:"8px",color:C.accent}}>Total</td>
                <td style={{padding:"8px",textAlign:"right"}}>{fmtE(totalDano)}</td>
                <td/><td/>
                <td style={{padding:"8px",textAlign:"right"}}>{fmtE(totalDano*regla)}</td>
                <td/>
                <td style={{padding:"8px",textAlign:"right",color:C.accent,fontSize:14}}>{fmtE(indemn)}</td>
              </tr>
              <tr><td style={{padding:"6px 8px",fontSize:12,color:C.muted}}>Franquicia general</td><td colSpan={5}/><td style={{padding:"6px 8px",textAlign:"right",fontSize:12}}>{fmtE(franq)}</td></tr>
            </tbody>
          </table>
        </div>
        <div style={{background:C.greenBg,border:"1px solid #A7F3D0",borderRadius:8,padding:16,marginTop:14,textAlign:"center"}}>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Total Propuesta de Indemnización</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:30,color:C.green}}>{fmtE(indemn)}</div>
        </div>
      </Card>

      {/* IA */}
      <Card s={{marginBottom:14}}>
        <SectionLabel>Redacción IA — Sección 4</SectionLabel>
        <Btn primary onClick={genAI} disabled={aiLoad} full>
          {aiLoad?<><Spin/>Generando análisis…</>:<><Sparkles size={13}/>Generar análisis de cobertura e indemnización</>}
        </Btn>
        {(data.aiText||aiLoad)&&<div style={{background:C.accentLight,border:"1px solid #F0C0C0",borderRadius:8,padding:13,marginTop:12}}>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            <Btn sm ghost onClick={genAI} disabled={aiLoad}><RefreshCw size={10}/>Regenerar</Btn>
            <Btn sm outline onClick={()=>onChange({...data,aiApplied:true})}>{data.aiApplied?<><Check size={10}/>Aplicado</>:<><Check size={10}/>Aplicar</>}</Btn>
          </div>
          {aiLoad?<div style={{display:"flex",gap:8,alignItems:"center",color:C.muted,fontSize:12}}><Spin/>Generando…</div>
            :<textarea value={data.aiText||""} onChange={e=>onChange({...data,aiText:e.target.value})}
              rows={6} style={{...inpStyle(false),resize:"vertical",lineHeight:1.65,fontSize:13}}/>}
        </div>}
      </Card>

      <NavBottom onPrev={onPrev} onSave={handleSave} onNext={onNext} saved={saved}
        prevLabel="Valoración de Daños" nextLabel="Siguiente — Anexos"/>
    </div>
  );
};

// ─── ANEXOS ──────────────────────────────────────────────────────────────────
const SecAnexos = ({data,onChange,s3,onPrev,onSave}) => {
  const tabs = [
    {id:"fotos",    icon:Camera,     label:"Reportaje Fotográfico"},
    {id:"catastro", icon:FileImage,  label:"Info Catastral"},
    {id:"meteosim", icon:Image,      label:"Info Meteosim"},
    {id:"facturas", icon:Receipt,    label:"Facturas / Presupuestos"},
  ];
  const [tab,setTab] = useState("fotos");
  const [saved,setSaved] = useState(false);
  const fRef = useRef();
  const bucket = data[tab]||[];
  const CATS = ["Daño general","Zona afectada","Vista exterior","Vista interior","Daño específico","Estado previo","Documento"];

  const addFiles = files => {
    Promise.all(Array.from(files).map(f=>new Promise(r=>{const fr=new FileReader();fr.onload=e=>r({id:Date.now()+Math.random(),name:f.name,url:e.target.result,caption:"",cat:"Daño general"});fr.readAsDataURL(f);}))).then(news=>onChange({...data,[tab]:[...bucket,...news]}));
  };
  const updI=(id,k,v)=>onChange({...data,[tab]:bucket.map(i=>i.id===id?{...i,[k]:v}:i)});
  const delI=id=>onChange({...data,[tab]:bucket.filter(i=>i.id!==id)});
  const handleSave = () => { onSave?.(); setSaved(true); setTimeout(()=>setSaved(false),2500); };
  const total = tabs.reduce((a,t)=>a+(data[t.id]||[]).length,0);

  return (
    <div className="fade">
      <SecTitle label="Anexos" sub="Reportaje fotográfico, datos catastrales, Meteosim y facturas"/>

      <div style={{display:"flex",gap:7,marginBottom:16,flexWrap:"wrap"}}>
        {tabs.map(t=>{
          const cnt=(data[t.id]||[]).length;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",
              borderRadius:7,border:`1px solid ${tab===t.id?C.accent:C.border}`,
              background:tab===t.id?C.accentLight:C.white,cursor:"pointer",fontSize:13,
              fontWeight:tab===t.id?700:400,color:tab===t.id?C.accent:C.ink,fontFamily:"inherit"}}>
              <t.icon size={13}/>{t.label}
              {cnt>0&&<span style={{background:C.accent,color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      <div onClick={()=>fRef.current.click()} style={{border:`2px dashed ${C.border}`,borderRadius:10,padding:28,
        textAlign:"center",cursor:"pointer",background:C.bg,marginBottom:14}}>
        <Upload size={24} style={{color:C.muted,marginBottom:7}}/>
        <div style={{fontSize:13,fontWeight:600,color:C.ink}}>Arrastra archivos o haz clic para seleccionar</div>
        <div style={{fontSize:12,color:C.muted,marginTop:2}}>Imágenes y PDFs</div>
        <input ref={fRef} type="file" multiple accept="image/*,.pdf" style={{display:"none"}} onChange={e=>addFiles(e.target.files)}/>
      </div>

      {bucket.length>0
        ?<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {bucket.map(item=>(
            <div key={item.id} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:9,overflow:"hidden"}}>
              <div style={{position:"relative"}}>
                <img src={item.url} alt={item.caption} style={{width:"100%",height:120,objectFit:"cover",display:"block"}}/>
                <button onClick={()=>delI(item.id)} style={{position:"absolute",top:5,right:5,background:"rgba(0,0,0,.6)",border:"none",borderRadius:"50%",width:22,height:22,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <X size={10}/>
                </button>
              </div>
              <div style={{padding:8}}>
                {tab==="fotos"&&<select value={item.cat} onChange={e=>updI(item.id,"cat",e.target.value)}
                  style={{width:"100%",padding:"3px 6px",border:`1px solid ${C.border}`,borderRadius:4,fontSize:10,marginBottom:5,fontFamily:"inherit"}}>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>}
                <input value={item.caption} onChange={e=>updI(item.id,"caption",e.target.value)} placeholder="Pie de foto…"
                  style={{width:"100%",padding:"4px 6px",border:`1px solid ${C.border}`,borderRadius:4,fontSize:10,fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
            </div>
          ))}
        </div>
        :<div style={{textAlign:"center",padding:28,color:C.muted,fontSize:13}}>Sin archivos en este apartado</div>
      }

      <NavBottom onPrev={onPrev} onSave={handleSave} saved={saved}
        prevLabel="Cobertura-Indemnización" nextLabel={null}/>
    </div>
  );
};

// ─── REPORT EDITOR ────────────────────────────────────────────────────────────
// ─── EXPORT HELPERS ──────────────────────────────────────────────────────────
const fmtPDF = n => new Intl.NumberFormat('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}).format(+n||0);

const buildWordHTML = (cData) => {
  const enc=cData.encargo||{}, s1=cData.s1||{}, s2=cData.s2||{}, s3=cData.s3||{}, s4=cData.s4||{};
  const partidas=s3.partidas||[];
  const totalDano=partidas.reduce((a,p)=>{const v=(p.uds||1)*(p.p||0);return a+v*(1-(p.depr?p.pctDepr||0:0)/100)+v*((p.iva||21)/100);},0);
  const capCont=parseFloat(enc.capitalContinente||0);
  const franq=parseFloat(s3.franquiciaVal||enc.franquicia||0);
  const prov=PROVINCIAS.find(p=>p.l===enc.provincia||p.v===enc.provincia);
  const calIdx=(s1.calidad)==='Alta'?2:(s1.calidad)==='Básica'?0:1;
  const vRealM=(MOD_ARQ[prov?.v||'00']||MOD_ARQ['00']).hotel[calIdx];
  const vRealC=enc.primerRiesgo?capCont:parseFloat(s1.superficieConstruida||0)*vRealM;
  const regla=!enc.primerRiesgo&&vRealC>0&&capCont>0&&capCont<vRealC?(capCont/vRealC):1;
  const indemn=Math.max(0,totalDano*regla-franq);
  const capCont2=parseFloat(enc.capitalContenido||0);
  const riesgoLines=enc.tipoEncargo==='INSTANT_PAYMENT'
    ?[s1.textoInstant||('Localización del riesgo: el riesgo está situado en '+enc.lugarIntervencion+'. Este siniestro se ha gestionado documentalmente.')]
    :[`El riesgo asegurado se corresponde con: ${s1.tipoRiesgo||'—'}.`,
      `La fecha de construcción es del año ${s1.anoConstruccion||'—'}.`,
      `Cuenta con una superficie construida de ${s1.superficieConstruida||'—'} M2 en total`,
      `Acabados son de calidad: ${s1.calidad||'—'}`,
      `El estado general del riesgo asegurado se encuentra según nuestro criterio: ${s1.estado||'—'}`,
      `Localización del riesgo: el riesgo está situado en ${enc.lugarIntervencion||'—'}`,
      `Referencia catastral del inmueble: ${s1.refCatastral||''}`];
  const rowPart=partidas.map(p=>{
    const vr=(p.uds||1)*(p.p||0);const iv=vr*((p.iva||21)/100);const vreal=vr*(1-(p.depr?p.pctDepr||0:0)/100)+iv;
    return `<tr><td>${p.desc||''}</td><td>${p.uds||1}</td><td>${fmtPDF(p.p)}</td><td>${fmtPDF(vr)}</td><td>${p.iva??21}%</td><td>${fmtPDF(iv)}</td><td>${p.depr?'SI':'NO'}</td><td>${p.depr?fmtPDF(p.pctDepr||0)+'%':'0,00'}</td><td>${fmtPDF(vreal)}</td><td>${fmtPDF(vreal)}</td><td>${p.perceptor||'Asegurado 1'}</td><td>${p.cobertura!==false?'Si':'No'}</td></tr>`;
  }).join('');
  return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'/><title>Informe Pericial ${enc.numReferencia||''}</title>
<style>
  @page{size:A4;margin:2cm 2cm 2.5cm 2cm;}
  body{font-family:Arial,sans-serif;font-size:10pt;color:#000;margin:0}
  h1{font-size:18pt;font-style:italic;text-align:center;border-top:1px solid #9B2226;border-bottom:1px solid #9B2226;padding:6pt 0}
  h2{font-size:11pt;border-bottom:2px solid #9B2226;padding-bottom:3pt;margin-top:18pt}
  h3{font-size:10pt;margin-top:12pt}
  table{border-collapse:collapse;width:100%;font-size:8pt;margin:6pt 0}
  th{background:#9B2226;color:#fff;padding:3pt 4pt;text-align:left;font-size:7.5pt}
  td{border:1px solid #ddd;padding:3pt 4pt;vertical-align:top}
  tr:nth-child(even) td{background:#fafafa}
  .subtotal td{background:#fdf0f0;font-weight:bold;color:#9B2226;border-color:#9B2226}
  .total-box{border:2px solid #9B2226;background:#fdf0f0;padding:8pt;text-align:right;font-size:13pt;font-weight:bold;color:#9B2226;margin-top:10pt}
  .field-label{font-size:8pt;color:#666;display:block}
  .field-value{font-size:10pt;font-weight:bold;border-bottom:1px solid #ccc;padding-bottom:2pt;margin-bottom:8pt;display:block}
  .intro{font-style:italic;color:#555;font-size:9pt;margin:8pt 0;line-height:1.6}
  .header-gvp{border-bottom:1px solid #9B2226;padding-bottom:4pt;margin-bottom:10pt;display:flex;justify-content:space-between}
  .bullet{margin-left:12pt;list-style:square}
  .bullet li{margin-bottom:4pt}
  .cap-table{width:200pt;margin-left:30pt}
  .cap-table th{background:#9B2226}
  .firma-box{border:1px solid #ccc;width:150pt;height:50pt;display:inline-block}
  .page-break{page-break-before:always}
</style></head>
<body>
<div class='header-gvp'><b style='color:#9B2226'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h1>INFORME PERICIAL</h1>
<table style='margin-top:16pt'><tr>
  <td><span class='field-label'>Compañía</span><span class='field-value'>${enc.compania||'—'}</span></td>
  <td><span class='field-label'>Nº Referencia</span><span class='field-value'>${enc.numReferencia||'—'}</span></td>
  <td><span class='field-label'>Nº Póliza</span><span class='field-value'>${enc.numPoliza||'—'}</span></td>
</tr><tr>
  <td><span class='field-label'>Ramo</span><span class='field-value'>${enc.ramo||'—'}</span></td>
  <td><span class='field-label'>Garantía</span><span class='field-value'>${enc.garantia||'—'}</span></td>
  <td><span class='field-label'>Importe líquido siniestro</span><span class='field-value'>${fmtPDF(totalDano)} €</span></td>
</tr><tr>
  <td><span class='field-label'>Fecha Encargo</span><span class='field-value'>${enc.fechaEncargo||'—'}</span></td>
  <td><span class='field-label'>Fecha Siniestro</span><span class='field-value'>${enc.fechaSiniestro||'—'}</span></td>
  <td><span class='field-label'>Nº Exp interno</span><span class='field-value'>${enc.numExpInterno||'—'}</span></td>
</tr></table>
<p><span class='field-label'>Lugar intervención (Provincia)</span><span class='field-value'>${enc.lugarIntervencion||'—'}</span></p>
<p><span class='field-label'>Asegurado</span><span class='field-value'>${enc.asegurado||'—'}</span></p>
<table><tr><td><span class='field-label'>Perito:</span><span class='field-value'>${enc.perito||'—'}</span></td><td><span class='field-label'>Teléfono Perito:</span><span class='field-value'>${enc.telPerito||'—'}</span></td></tr></table>
<p class='intro'>Este informe pericial ha sido emitido por el perito Don ${enc.perito||'—'}, ha sido solicitado por el departamento de siniestros de la aseguradora epigrafiada anteriormente, a tenor del siniestro declarado en el riesgo asegurado con póliza suscrita por la precitada aseguradora.</p>
<p class='intro'>En cumplimiento de lo requerido, se ha procedido a la comparecencia pericial en el Riesgo Asegurado, realizando la función pericial iniciando los trabajos que nos son propios, tendentes a la determinación de las causas y circunstancias del siniestro y a la valoración de los daños consecuentes al mismo, para finalmente elevar propuesta de indemnización a las partes, a tenor de la información conocida hasta la fecha.</p>
<p class='intro'>El que suscribe en cumplimiento del artículo 335.2 de la Ley 1/2000 de Enjuiciamiento Civil, manifiesta bajo promesa de decir verdad, que ha actuado y actuará con la mayor objetividad posible, tomando en consideración tanto lo que pueda favorecer como lo que sea susceptible de causar perjuicio a cualquiera de las partes.</p>
<p class='intro'>La valoración económica sugerida, así como cualquier observación relativa a coberturas, exclusiones y/o responsabilidad del presente informe, queda supeditada en todo caso a criterio de la Compañía en base de la póliza suscrita.</p>
<div class='page-break'></div>
<div class='header-gvp'><b style='color:#9B2226'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>1. VERIFICACIÓN DEL RIESGO Y PÓLIZA.</h2>
<h3>1.1. Descripción del riesgo:</h3>
<ul class='bullet'>${riesgoLines.map(l=>`<li>${l}</li>`).join('')}</ul>
<br/>
<b>CONTINENTE / OBRAS DE REFORMA</b>
<p style='font-style:italic;font-size:9pt'>1. La preexistencia ha sido estudiada en aplicación de los precios por m², teniendo en cuenta calidad de acabados y provincia.</p>
<table class='cap-table'><tr><th colspan='2'>CONTINENTE</th></tr>
<tr><td>VALOR ASEGURADO</td><td>${fmtPDF(capCont)} €</td></tr>
<tr><td>VALOR PREEXISTENTE</td><td>${fmtPDF(vRealC)} €</td></tr>
<tr><td><b>INFRASEGURO</b></td><td><b>${fmtPDF(regla<1?((vRealC-capCont)/vRealC*100):0)} %</b></td></tr></table>
<br/>
<b>CONTENIDO:</b>
<p style='font-style:italic;font-size:9pt'>1. La preexistencia ES ESTIMADA atendiendo a los criterios de objetividad pericial.</p>
<table class='cap-table'><tr><th colspan='2'>CONTENIDO</th></tr>
<tr><td>VALOR ASEGURADO</td><td>${fmtPDF(capCont2)} €</td></tr>
<tr><td>VALOR PREEXISTENTE</td><td>${fmtPDF(capCont2)} €</td></tr>
<tr><td><b>INFRASEGURO</b></td><td><b>0,00 %</b></td></tr></table>
${s1.aiText?'<p>'+s1.aiText+'</p>':''}
<div class='page-break'></div>
<div class='header-gvp'><b style='color:#9B2226'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>2. CAUSAS Y CIRCUNSTANCIAS</h2>
<h3>2.1. Descripción del siniestro:</h3>
<p>${(s2.textoAI||s2.textoRaw||'').replace(/\n/g,'<br/>')}</p>
<div class='page-break'></div>
<div class='header-gvp'><b style='color:#9B2226'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>3. VALORACIÓN DE DAÑOS.</h2>
<p>Evaluada con arreglo a los criterios que se establecen en las condiciones de la póliza, resumimos la tasación de daños:</p>
${s3.textoAI?'<p>'+s3.textoAI+'</p>':''}
${partidas.length>0?`<h3 style='text-align:center'>${s3.conceptoGarantia||enc.garantia||'Fenómenos atmosféricos'}. ${s3.tipoGarantiaVal||'CONTINENTE'}</h3>
<table><tr><th>Descripción-concepto</th><th>Uds</th><th>V.Unit.</th><th>V.Repos.</th><th>%IVA</th><th>IVA</th><th>Depr</th><th>%Depr</th><th>V.Real</th><th>V.Prop.</th><th>Perceptor</th><th>Cob.</th></tr>
${rowPart}
<tr class='subtotal'><td>Subtotal</td><td></td><td></td><td>${fmtPDF(sumRepos(partidas))} €</td><td></td><td>${fmtPDF(sumIVA(partidas))} €</td><td></td><td></td><td>${fmtPDF(totalDano)} €</td><td>${fmtPDF(totalDano)} €</td><td></td><td></td></tr></table>`:''}
<div class='page-break'></div>
<div class='header-gvp'><b style='color:#9B2226'>GABINETE DE VALORACIONES PERICIALES</b><span style='color:#666'>expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>4. ESTUDIO DE COBERTURA-INDEMNIZACIÓN.</h2>
<p>${(s4.aiText||'').replace(/\n/g,'<br/>')}</p>
${partidas.length>0?`<h3 style='text-align:center'>Resumen por garantías. Propuesta de indemnización</h3>
<table><tr><th>Garantía Afectada</th><th>D. con cobertura</th><th>Límite aseg.</th><th>Regla proporcional</th><th>Valor ajustado</th><th>Franquicia</th><th>Indemnización</th></tr>
<tr><td>${s3.tipoGarantiaVal||'CONTINENTE'}.<br/>${enc.garantia||''}<br/>${enc.causa||''}</td><td>${fmtPDF(totalDano)} €</td><td>${fmtPDF(capCont)} €</td><td>${regla<1?fmtPDF(regla*100)+'%':'NO'}</td><td>${fmtPDF(totalDano*regla)} €</td><td>${fmtPDF(franq)} €</td><td>${fmtPDF(indemn)} €</td></tr>
<tr class='subtotal'><td>Total</td><td>${fmtPDF(totalDano)} €</td><td></td><td></td><td>${fmtPDF(totalDano*regla)} €</td><td></td><td>${fmtPDF(indemn)} €</td></tr>
<tr><td>Franquicia general</td><td></td><td></td><td></td><td></td><td></td><td>${fmtPDF(franq)} €</td></tr></table>
<div class='total-box'>Total propuesta de indemnización &nbsp;&nbsp;${fmtPDF(indemn)} €</div>`:''}
<br/><br/>
<p>Por nuestra parte damos por finalizada la intervención en el siniestro, quedando a su disposición ante cualquier aclaración que estimen oportuna.</p>
<p style='margin-top:16pt'>En ${enc.municipio||enc.lugarIntervencion||'—'}, a ${new Date().toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})}</p>
<table style='margin-top:20pt;width:100%'><tr>
<td style='width:50%;vertical-align:top'><p style='font-style:italic'>VºBº técnico GVP</p><div class='firma-box'>&nbsp;</div></td>
<td style='width:50%;text-align:right;vertical-align:top'>
<p style='font-style:italic'>Perito: ${enc.perito||'—'}</p>
<p style='font-style:italic'>Telef: ${enc.telPerito||'—'}</p>
<p style='font-style:italic'>Firma perito:</p>
<div class='firma-box'>&nbsp;</div></td>
</tr></table>
</body></html>`;
};

const exportWord = (cData) => {
  const enc=cData.encargo||{};
  const html=buildWordHTML(cData);
  const blob=new Blob(['﻿'+html],{type:'application/msword'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=`Informe_${enc.numExpInterno||enc.numReferencia||'pericial'}.doc`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};

const exportPDF = (cData, dniPerito='') => {
  const enc=cData.encargo||{}, s1=cData.s1||{}, s2=cData.s2||{}, s3=cData.s3||{}, s4=cData.s4||{}, anexos=cData.anexos||{};
  const partidas=getPartidas(s3);
  const totalDano=sumReal(partidas);
  const prov=PROVINCIAS.find(p=>p.l===enc.provincia||p.v===enc.provincia);
  const calI=(s1.calidad)==='Alta'?2:(s1.calidad)==='Básica'?0:1;
  const mP=(MOD_ARQ[prov?.v||'00']||MOD_ARQ['00']).hotel[calI];
  const capC=parseCap(enc.capitalContinente), capC2=parseCap(enc.capitalContenido);
  const vRC=(enc.primerRiesgo||s1.tipoContinente==='obrasReforma'||enc.esHogar)?capC:parseCap(s1.superficieConstruida)*mP;
  const reg=calcRegla(enc,s1);
  const inf=reg<1?((vRC-capC)/vRC*100):0;
  const fr=parseCap(s3.franquiciaVal||enc.franquicia);
  const ind=Math.max(0,totalDano*reg-fr);
  const today=new Date().toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});
  const allFotos=anexos?.fotos||[];
  const allFac=[...(anexos?.facturas||[]),...(s3?.facturas||[])];

  const rowPart=partidas.map(p=>{
    const {vRepos:vr,ivaAmt:iv,vReal:vreal}=calcPartida(p);
    return `<tr><td>${p.desc||''}</td><td style="text-align:right">${p.uds||1}</td><td style="text-align:right">${fmtPDF(p.p)}</td><td style="text-align:right">${fmtPDF(vr)}</td><td style="text-align:right">${p.iva??0}%</td><td style="text-align:right">${fmtPDF(iv)}</td><td style="text-align:center">${p.depr?'SI':'NO'}</td><td style="text-align:right">${p.depr?fmtPDF(p.pctDepr||0)+'%':'0,00'}</td><td style="text-align:right">${fmtPDF(vreal)}</td><td style="text-align:right">${fmtPDF(vreal)}</td><td>${p.perceptor||'Asegurado 1'}</td><td style="text-align:center">${p.cobertura!==false?'Si':'No'}</td></tr>`;
  }).join('');

  const rLines=enc.tipoEncargo==='INSTANT_PAYMENT'
    ?[s1.textoInstant||('Localización del riesgo: el riesgo está situado en '+enc.lugarIntervencion+'. Este siniestro se ha gestionado documentalmente.')]
    :['El riesgo asegurado se corresponde con: '+(s1.tipoRiesgo||'—')+'.','La fecha de construcción es del año '+(s1.anoConstruccion||'—')+'.','Cuenta con una superficie construida de '+(s1.superficieConstruida||'—')+' M2 en total','Acabados son de calidad: '+(s1.calidad||'—'),'El estado general del riesgo asegurado se encuentra según nuestro criterio: '+(s1.estado||'—'),'Localización del riesgo: el riesgo está situado en '+(enc.lugarIntervencion||'—'),'Referencia catastral del inmueble: '+(s1.refCatastral||'')];

  const fotoImgs=allFotos.map((f,i)=>`<div style="display:inline-block;width:47%;margin:${i%2===0?'0 2% 10px 0':'0 0 10px 2%'};vertical-align:top"><img src="${f.url}" style="width:100%;height:160px;object-fit:cover;border:1px solid #ddd"/>${f.caption?'<div style="font-size:7pt;text-align:center;color:#666;margin-top:2pt">'+f.caption+'</div>':''}</div>`).join('');

  const html=`<!DOCTYPE html><html>
<head><meta charset="utf-8"/><title>Informe Pericial ${enc.numReferencia||''}</title>
<style>
  @page{size:A4;margin:20mm 20mm 25mm 20mm}
  *{box-sizing:border-box}
  body{font-family:Arial,sans-serif;font-size:9.5pt;color:#000;margin:0;line-height:1.4}
  .hdr{border-bottom:0.4pt solid #9B2226;padding-bottom:4pt;margin-bottom:10pt;display:flex;justify-content:space-between;align-items:baseline}
  .hdr-left{font-weight:bold;color:#9B2226;font-size:8pt}
  .hdr-right{font-size:8pt;color:#666}
  .ftr{position:fixed;bottom:15mm;left:20mm;right:20mm;border-top:0.3pt solid #ccc;padding-top:3pt;font-size:7pt;color:#666;text-align:center}
  h1{font-size:18pt;font-style:italic;text-align:center;border-top:0.5pt solid #9B2226;border-bottom:0.5pt solid #9B2226;padding:6pt 0;margin:20pt 0 16pt}
  h2{font-size:10.5pt;font-weight:bold;border-bottom:1.5pt solid #9B2226;padding-bottom:2pt;margin-top:18pt;margin-bottom:8pt}
  h3{font-size:9.5pt;font-weight:bold;margin:10pt 0 4pt}
  .grid3{display:table;width:100%;margin-bottom:8pt}
  .grid3-row{display:table-row}
  .grid3-cell{display:table-cell;width:33.3%;padding:0 4pt 6pt 0}
  .fl{font-size:7.5pt;color:#666;display:block;margin-bottom:1pt}
  .fv{font-size:10pt;font-weight:bold;border-bottom:0.3pt solid #ccc;padding-bottom:2pt;display:block}
  p.intro{font-style:italic;color:#555;font-size:8.5pt;margin:6pt 0;line-height:1.6}
  ul.viñetas{margin:4pt 0 4pt 12pt;padding:0}
  ul.viñetas li{margin-bottom:3pt;font-size:9.5pt}
  table.data{border-collapse:collapse;width:100%;margin:6pt 0;font-size:7.5pt}
  table.data th{background:#9B2226;color:#fff;padding:3pt 3pt;text-align:left;font-weight:bold}
  table.data td{border:0.3pt solid #ddd;padding:2.5pt 3pt;vertical-align:top}
  table.data tr:nth-child(even) td{background:#fafafa}
  table.cap{border-collapse:collapse;width:180pt;margin-left:20pt;font-size:9pt}
  table.cap th{background:#9B2226;color:#fff;padding:3pt;text-align:center}
  table.cap td{border:0.5pt solid #ccc;padding:3pt 5pt}
  .subtotal td{background:#fdf0f0!important;font-weight:bold;color:#9B2226;border-color:#9B2226!important}
  .total-box{border:1.5pt solid #9B2226;background:#fdf0f0;padding:7pt;text-align:right;font-size:12pt;font-weight:bold;color:#9B2226;margin-top:8pt}
  .page-break{page-break-before:always;margin-top:0}
  .firma-box{border:0.5pt solid #bbb;width:140pt;height:45pt;display:inline-block;margin-top:4pt}
  .firma-table{width:100%;margin-top:20pt}
  .firma-table td{vertical-align:top;font-style:italic;font-size:9pt}
  .anex-foto{display:flex;flex-wrap:wrap;gap:8pt}
  .anex-foto-item{width:calc(50% - 4pt)}
  .anex-foto-item img{width:100%;height:150pt;object-fit:cover;border:0.3pt solid #ddd}
  .anex-foto-item .cap{font-size:7pt;text-align:center;color:#666;margin-top:2pt}
  @media print{
    .hdr{position:fixed;top:0;left:0;right:0;background:white;padding:5mm 20mm 3mm}
    body{padding-top:20mm}
    .no-print{display:none}
  }
</style></head>
<body>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<div class="ftr">Avda. Josep Tarradellas, 38 · 08029 Barcelona · Teléfono: 93.118.51.38 · @: asesoria@gvperitos.es</div>
<h1>INFORME PERICIAL</h1>
<div class="grid3"><div class="grid3-row"><div class="grid3-cell"><span class="fl">Compañía</span><span class="fv">${enc.compania||'—'}</span></div><div class="grid3-cell"><span class="fl">Nº Referencia</span><span class="fv">${enc.numReferencia||'—'}</span></div><div class="grid3-cell"><span class="fl">Nº Póliza</span><span class="fv">${enc.numPoliza||'—'}</span></div></div></div>
<div class="grid3"><div class="grid3-row"><div class="grid3-cell"><span class="fl">Ramo</span><span class="fv">${enc.ramo||'—'}</span></div><div class="grid3-cell"><span class="fl">Garantía</span><span class="fv">${enc.garantia||'—'}</span></div><div class="grid3-cell"><span class="fl">Importe líquido siniestro</span><span class="fv">${fmtPDF(totalDano)} €</span></div></div></div>
<div class="grid3"><div class="grid3-row"><div class="grid3-cell"><span class="fl">Fecha Encargo</span><span class="fv">${enc.fechaEncargo||'—'}</span></div><div class="grid3-cell"><span class="fl">Fecha Siniestro</span><span class="fv">${enc.fechaSiniestro||'—'}</span></div><div class="grid3-cell"><span class="fl">Nº Exp interno</span><span class="fv">${enc.numExpInterno||'—'}</span></div></div></div>
<div style="margin-bottom:6pt"><span class="fl">Lugar intervención (Provincia)</span><span class="fv">${enc.lugarIntervencion||'—'}</span></div>
<div style="margin-bottom:6pt"><span class="fl">Asegurado</span><span class="fv">${enc.asegurado||'—'}</span></div>
<div class="grid3"><div class="grid3-row"><div class="grid3-cell"><span class="fl">Perito:</span><span class="fv">${enc.perito||'—'}</span></div><div class="grid3-cell"><span class="fl">Teléfono Perito:</span><span class="fv">${enc.telPerito||'—'}</span></div></div></div>
<p class="intro">Este informe pericial ha sido emitido por el perito Don ${enc.perito||'—'}, ha sido solicitado por el departamento de siniestros de la aseguradora epigrafiada anteriormente, a tenor del siniestro declarado en el riesgo asegurado con póliza suscrita por la precitada aseguradora.</p>
<p class="intro">En cumplimiento de lo requerido, se ha procedido a la comparecencia pericial en el Riesgo Asegurado, realizando la función pericial iniciando los trabajos que nos son propios, tendentes a la determinación de las causas y circunstancias del siniestro y a la valoración de los daños consecuentes al mismo, para finalmente elevar propuesta de indemnización a las partes.</p>
<p class="intro">El que suscribe en cumplimiento del artículo 335.2 de la Ley 1/2000 de Enjuiciamiento Civil, manifiesta bajo promesa de decir verdad, que ha actuado y actuará con la mayor objetividad posible, tomando en consideración tanto lo que pueda favorecer como lo que sea susceptible de causar perjuicio a cualquiera de las partes.</p>
<p class="intro">La valoración económica sugerida, así como cualquier observación relativa a coberturas, exclusiones y/o responsabilidad del presente informe, queda supeditada en todo caso a criterio de la Compañía en base de la póliza suscrita.</p>
<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>1.&nbsp;&nbsp;&nbsp;VERIFICACIÓN DEL RIESGO Y PÓLIZA.</h2>
<h3>1.1. Descripción del riesgo:</h3>
<ul class="viñetas">${rLines.filter(Boolean).map(l=>`<li>${l}</li>`).join('')}</ul>
<h3>Estudios de los capitales Asegurados:</h3>
<p style="font-weight:bold">CONTINENTE / OBRAS DE REFORMA</p>
<p style="font-style:italic;font-size:8.5pt">1. La preexistencia ha sido estudiada en aplicación de los precios por m², teniendo en cuenta calidad de acabados y provincia.</p>
<table class="cap"><tr><th colspan="2">CONTINENTE</th></tr><tr><td>VALOR ASEGURADO</td><td><strong>${fmtPDF(capC)} €</strong></td></tr><tr><td>VALOR PREEXISTENTE</td><td><strong>${fmtPDF(vRC)} €</strong></td></tr><tr><td><strong>INFRASEGURO</strong></td><td><strong>${fmtPDF(inf)} %</strong></td></tr></table>
<br/>
<p style="font-weight:bold">CONTENIDO:</p>
<p style="font-style:italic;font-size:8.5pt">1. La preexistencia ES ESTIMADA atendiendo a los criterios de objetividad pericial teniendo en cuenta criterios objetivos.</p>
<table class="cap"><tr><th colspan="2">CONTENIDO</th></tr><tr><td>VALOR ASEGURADO</td><td><strong>${fmtPDF(capC2)} €</strong></td></tr><tr><td>VALOR PREEXISTENTE</td><td><strong>${fmtPDF(capC2)} €</strong></td></tr><tr><td><strong>INFRASEGURO</strong></td><td><strong>0,00 %</strong></td></tr></table>
${s1.aiText?`<p style="margin-top:10pt">${s1.aiText.replace(/\n/g,'<br/>')}</p>`:''}
<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>2.&nbsp;&nbsp;&nbsp;CAUSAS Y CIRCUNSTANCIAS</h2>
<h3>2.1. Descripción del siniestro:</h3>
<p>${(s2.textoAI||s2.textoRaw||'').replace(/\n/g,'<br/>')}</p>
<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>3.&nbsp;&nbsp;&nbsp;VALORACIÓN DE DAÑOS.</h2>
<p>Evaluada con arreglo a los criterios que se establecen en las condiciones de la póliza, resumimos la tasación de daños:</p>
${s3.textoAI?`<p>${s3.textoAI.replace(/\n/g,'<br/>')}</p>`:''}
${partidas.length>0?`<h3 style="text-align:center">${s3.conceptoGarantia||enc.garantia||'Fenómenos atmosféricos'}. ${s3.tipoGarantiaVal||'CONTINENTE'}</h3>
<table class="data"><thead><tr><th>Descripción-concepto</th><th>Uds</th><th>V.Unit.</th><th>V.Repos.</th><th>%IVA</th><th>IVA</th><th>Depr</th><th>%Depr</th><th>V.Real</th><th>V.Prop.</th><th>Perceptor</th><th>Cob.</th></tr></thead><tbody>
${rowPart}
<tr class="subtotal"><td>Subtotal</td><td></td><td></td><td>${fmtPDF(sumRepos(partidas))} €</td><td></td><td>${fmtPDF(sumIVA(partidas))} €</td><td></td><td></td><td>${fmtPDF(totalDano)} €</td><td>${fmtPDF(totalDano)} €</td><td></td><td></td></tr></tbody></table>`:''}
<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2>4.&nbsp;&nbsp;&nbsp;ESTUDIO DE COBERTURA-INDEMNIZACIÓN.</h2>
${s4.aiText?`<p>${s4.aiText.replace(/\n/g,'<br/>')}</p>`:''}
${partidas.length>0?`<h3 style="text-align:center">Resumen por garantías. Propuesta de indemnización</h3>
<table class="data"><thead><tr><th>Garantía Afectada</th><th>D. con cobertura</th><th>Límite aseg.</th><th>Regla proporcional</th><th>Valor ajustado</th><th>Franquicia</th><th>Indemnización</th></tr></thead><tbody>
<tr><td>${(s3.tipoGarantiaVal||'CONTINENTE')+'. '+(enc.garantia||'')+'. '+(enc.causa||'')}</td><td style="text-align:right">${fmtPDF(totalDano)} €</td><td style="text-align:right">${fmtPDF(capC)} €</td><td style="text-align:right">${reg<1?fmtPDF(reg*100)+'%':'NO'}</td><td style="text-align:right">${fmtPDF(totalDano*reg)} €</td><td style="text-align:right">${fmtPDF(fr)} €</td><td style="text-align:right"><strong>${fmtPDF(ind)} €</strong></td></tr>
<tr class="subtotal"><td>Total</td><td style="text-align:right">${fmtPDF(totalDano)} €</td><td></td><td></td><td style="text-align:right">${fmtPDF(totalDano*reg)} €</td><td></td><td style="text-align:right">${fmtPDF(ind)} €</td></tr>
<tr><td colspan="6">Franquicia general</td><td style="text-align:right">${fmtPDF(fr)} €</td></tr></tbody></table>
<div class="total-box">Total propuesta de indemnización &nbsp;&nbsp;${fmtPDF(ind)} €</div>`:''}
<br/><br/>
<p>Por nuestra parte damos por finalizada la intervención en el siniestro, quedando a su disposición ante cualquier aclaración que estimen oportuna.</p>
<p style="margin-top:12pt">En ${enc.municipio||enc.lugarIntervencion||'—'}, a ${today}</p>
<table class="firma-table"><tr>
<td style="width:50%"><p>VºBº técnico GVP</p><div class="firma-box"></div></td>
<td style="width:50%;text-align:right"><p>Perito: ${enc.perito||'—'}</p><p>Telef: ${enc.telPerito||'—'}</p><p>DNI: ${dniPerito||'—'}</p><p>Firma perito:</p><div class="firma-box"></div></td>
</tr></table>
${(anexos?.catastro?.length||anexos?.meteosim?.length||allFac.length||allFotos.length)?`
<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2 style="text-align:center">Anexos.</h2>
${allFotos.length?'<p>- Reportaje fotográfico. Reportaje fotográfico</p>':''}
${anexos?.catastro?.length?'<p>- Info catastral.</p>':''}
${anexos?.meteosim?.length?'<p>- Info Meteosim.</p>':''}
${allFac.length?'<p>- Factura.</p>':''}
${allFotos.length?`<div class="page-break"></div>
<div class="hdr"><span class="hdr-left">GABINETE DE VALORACIONES PERICIALES</span><span class="hdr-right">expediente ${enc.numExpInterno||enc.numReferencia||''}</span></div>
<h2 style="text-align:center">Reportaje fotográfico.</h2>
<div class="anex-foto">${allFotos.map(f=>`<div class="anex-foto-item"><img src="${f.url}" onerror="this.style.display='none'"/>${f.caption?`<div class="cap">${f.caption}</div>`:''}</div>`).join('')}</div>`:''}
`:''}
<script>window.onload=()=>{window.print();}</script>
</body></html>`;

  // Blob URL approach: reliable across all browsers, no document.write
  const blob = new Blob([html], {type:'text/html;charset=utf-8'});
  const url  = URL.createObjectURL(blob);
  const w    = window.open(url, '_blank');
  if(!w){
    // Popup blocked - fallback: download as HTML and let browser print it
    const a = document.createElement('a');
    a.href = url; a.download = 'informe_peritia.html';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    alert('Se ha descargado el informe como HTML. Ábrelo en el navegador y usa Ctrl+P para imprimir como PDF.');
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};


const ExportModal = ({cData, onClose, user, token, onSaveDni}) => {
  const [dni,setDni]     = useState(cData.encargo?.dniPerito||'');
  const [pdfLoad,setPdfLoad] = useState(false);
  const [wrdLoad,setWrdLoad] = useState(false);
  const [pdfOk,setPdfOk]   = useState(false);
  const [wrdOk,setWrdOk]   = useState(false);
  const [err,setErr]       = useState('');

  const handlePDF = () => {
    setErr('');
    try{ exportPDF(cData, dni); setPdfOk(true); setTimeout(()=>setPdfOk(false),3000); onSaveDni?.(dni); }
    catch(e){ setErr('Error al generar PDF. Activa las ventanas emergentes del navegador.'); console.error(e); }
  };
  const handleWord = () => {
    setWrdLoad(true); setErr('');
    try{ exportWord(cData); setWrdOk(true); setTimeout(()=>setWrdOk(false),3000); }
    catch(e){ setErr('Error al generar Word.'); console.error(e); }
    setWrdLoad(false);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.white,borderRadius:12,padding:30,width:420,boxShadow:'0 20px 60px rgba(0,0,0,.3)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,fontWeight:400,color:C.ink}}>Exportar Informe</h3>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:4}}><X size={18}/></button>
        </div>
        <div style={{marginBottom:20}}>
          <Lbl c="DNI del Perito (para la página de firma)"/>
          <input value={dni} onChange={e=>setDni(e.target.value)} placeholder="Ej: B13809660"
            style={{...inpStyle(false),marginBottom:4}}/>
          <div style={{fontSize:11,color:C.muted}}>Se guarda automáticamente en el encargo</div>
        </div>
        {err&&<div style={{background:C.redBg,border:'1px solid #FECACA',borderRadius:7,padding:'8px 12px',fontSize:12,color:C.red,marginBottom:14}}>{err}</div>}
        <div style={{display:'flex',gap:10}}>
          <button onClick={handlePDF} disabled={wrdLoad}
            style={{flex:1,padding:'11px 0',borderRadius:8,border:'none',background:pdfLoad?'#E5E0D8':pdfOk?C.green:C.accent,color:'#fff',fontSize:13,fontWeight:700,cursor:pdfLoad||wrdLoad?'not-allowed':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:7,transition:'background .2s'}}>
            {pdfOk?<><Check size={15}/>Abierto en nueva pestaña</>:<><FileText size={15}/>Generar PDF</>}
          </button>
          <button onClick={handleWord} disabled={pdfLoad||wrdLoad}
            style={{flex:1,padding:'11px 0',borderRadius:8,border:`1.5px solid ${C.accent}`,background:wrdOk?C.green:'transparent',color:wrdOk?'#fff':C.accent,fontSize:13,fontWeight:700,cursor:pdfLoad||wrdLoad?'not-allowed':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:7,transition:'all .2s'}}>
            {wrdLoad?<><Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/>Generando…</>:wrdOk?<><Check size={15}/>Word descargado</>:<><FileText size={15}/>Generar Word</>}
          </button>
        </div>
        <div style={{fontSize:11,color:C.muted,textAlign:'center',marginTop:12}}>
          PDF · fiel a la plantilla GVP &nbsp;·&nbsp; Word · editable en Microsoft Word
        </div>
      </div>
    </div>
  );
};

// ─── SECCIÓN DATOS DEL ENCARGO (editable dentro del informe) ────────────────
const SecEncargo = ({enc, onUpdate, onNext, onSave}) => {
  const [saved, setSaved] = useState(false);
  const s = f => v => onUpdate({...enc, [f]:v});
  const handleSave = () => { onSave?.(); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <div className="fade">
      <SecTitle n="0" label="Datos del Encargo" sub="Revisa y edita los datos extraídos por la IA"/>

      <Card s={{marginBottom:12}}>
        <SectionLabel>🏢 Compañía y Siniestro</SectionLabel>
        <div style={{marginBottom:14}}>
          <Lbl c="Compañía" req/>
          <select value={COMPANIAS.find(c=>enc.compania&&enc.compania.toUpperCase().includes(c.toUpperCase()))||enc.compania||""}
            onChange={e=>s("compania")(e.target.value)}
            style={{...inpStyle(false),cursor:"pointer"}}>
            <option value="">Seleccionar…</option>
            {COMPANIAS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Nº Referencia / Siniestro" value={enc.numReferencia} onChange={s("numReferencia")} required/>
          <Inp label="Nº Póliza" value={enc.numPoliza} onChange={s("numPoliza")}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Ramo" value={enc.ramo} onChange={s("ramo")}/>
          <Inp label="Garantía afectada" value={enc.garantia} onChange={s("garantia")}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Causa" value={enc.causa} onChange={s("causa")}/>
          <Inp label="Nº Exp. Interno" value={enc.numExpInterno} onChange={s("numExpInterno")}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Fecha Encargo" value={enc.fechaEncargo} onChange={s("fechaEncargo")} placeholder="dd/mm/aaaa"/>
          <Inp label="Fecha Siniestro" value={enc.fechaSiniestro} onChange={s("fechaSiniestro")} placeholder="dd/mm/aaaa"/>
        </div>
      </Card>

      <Card s={{marginBottom:12}}>
        <SectionLabel>📍 Asegurado y Localización</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Asegurado / Tomador" value={enc.asegurado} onChange={s("asegurado")} required/>
          <Inp label="NIF / CIF" value={enc.nifAsegurado} onChange={s("nifAsegurado")}/>
        </div>
        <Inp label="Lugar de intervención" value={enc.lugarIntervencion} onChange={s("lugarIntervencion")} required/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Provincia" value={enc.provincia} onChange={s("provincia")}/>
          <Inp label="Municipio" value={enc.municipio} onChange={s("municipio")}/>
        </div>
      </Card>

      <Card s={{marginBottom:12}}>
        <SectionLabel>💰 Capitales Asegurados {enc.polizaAdjunta&&<span style={{color:C.green,fontWeight:400,fontSize:11}}>✨ de la póliza</span>}</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <EuroInput label="Capital Continente" value={enc.capitalContinente} onChange={s("capitalContinente")}
              hint={enc.tipoContinentePoliza?"Tipo: "+enc.tipoContinentePoliza:enc.polizaAdjunta?"Extraído de la póliza":""}/>
            {enc.todosCapitalesContinente&&<div style={{background:C.blueBg,border:"1px solid #BFDBFE",borderRadius:5,padding:"5px 9px",fontSize:10,color:C.blue,marginTop:-10,marginBottom:8}}>
              Capitales en póliza: {enc.todosCapitalesContinente}
            </div>}
          </div>
          <EuroInput label="Capital Contenido" value={enc.capitalContenido} onChange={s("capitalContenido")}
            hint={enc.polizaAdjunta?"Extraído de la póliza":""}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <EuroInput label="Franquicia general" value={enc.franquicia} onChange={s("franquicia")} hint="0,00 € si no hay"/>
          <Inp label="Fecha efecto póliza" value={enc.fechaEfecto} onChange={s("fechaEfecto")} placeholder="dd/mm/aaaa"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <Lbl c="Tipo de encargo"/>
            <select value={enc.tipoEncargo||"PERITACION"} onChange={e=>s("tipoEncargo")(e.target.value)}
              style={{...inpStyle(false),cursor:"pointer"}}>
              <option value="PERITACION">Peritación</option>
              <option value="INSTANT_PAYMENT">Instant Payment</option>
            </select>
          </div>
          <div>
            <Lbl c="Modalidad de visita"/>
            <select value={enc.modalidadVisita||"PRESENCIAL"} onChange={e=>s("modalidadVisita")(e.target.value)}
              style={{...inpStyle(false),cursor:"pointer"}}>
              <option value="PRESENCIAL">Presencial</option>
              <option value="DOCUMENTAL">Documental</option>
            </select>
          </div>
        </div>
        {enc.garantiasActivas&&<div style={{background:C.accentLight,border:"1px solid #F0C0C0",borderRadius:7,padding:"9px 12px",fontSize:12,marginTop:4}}>
          <b style={{color:C.accent}}>Garantías contratadas:</b> {enc.garantiasActivas}
        </div>}
      </Card>

      <Card s={{marginBottom:14}}>
        <SectionLabel>👤 Perito</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Nombre del Perito" value={enc.perito} onChange={s("perito")}/>
          <Inp label="Teléfono" value={enc.telPerito} onChange={s("telPerito")}/>
        </div>
        <Txt label="Descripción del siniestro" value={enc.descripcionSiniestro} onChange={s("descripcionSiniestro")} rows={3}/>
      </Card>

      <NavBottom onSave={handleSave} onNext={onNext} saved={saved} nextLabel="Siguiente — Verificación del Riesgo"/>
    </div>
  );
};

const ReportEditor = ({cData,onUpdate,onBack,user,token,sidebarOpen,setSidebarOpen}) => {
  const [sec,setSec]         = useState("informe");
  const [saving,setSaving]   = useState(false);
  const [exportOpen,setExportOpen]   = useState(false);
  const tokens = cData.tokenStats||{i:0,o:0};
  const costEur = ((tokens.i||0)/1e6*3+(tokens.o||0)/1e6*15)*1.08;
  const addTokens = (i,o) => onUpdate({...cData,tokenStats:{i:(tokens.i||0)+i,o:(tokens.o||0)+o}});
  const upd = (key,val) => onUpdate({...cData,[key]:val});

  const secIds = SECCIONES.map(s=>s.id);
  const curIdx = secIds.indexOf(sec);
  const goNext = () => { if(curIdx<secIds.length-1) setSec(secIds[curIdx+1]); };
  const goPrev = () => { if(curIdx>0) setSec(secIds[curIdx-1]); };

  const handleSave = () => { setSaving(true); setTimeout(()=>setSaving(false),1200); };

  const commonProps = {onNext:goNext,onPrev:goPrev,onSave:handleSave,onTokens:addTokens};

  const renderSec = () => {
    switch(sec){
      case "informe": return <SecInforme enc={cData.encargo||{}} s1={cData.s1||{}} s2={cData.s2||{}} s3={cData.s3||{}} s4={cData.s4||{}} anexos={cData.anexos||{}} onGoTo={setSec}/>;
      case "encargo": return <SecEncargo enc={cData.encargo||{}} onUpdate={enc=>onUpdate({...cData,encargo:enc})} onNext={()=>setSec("s1")} onSave={handleSave}/>;
      case "s1": return <Sec1 data={cData.s1||{}} onChange={v=>upd("s1",v)} enc={cData.encargo||{}} {...commonProps}/>;
      case "s2": return <Sec2 data={cData.s2||{}} onChange={v=>upd("s2",v)} enc={cData.encargo||{}} {...commonProps}/>;
      case "s3": return <Sec3 data={cData.s3||{}} onChange={v=>upd("s3",v)} enc={cData.encargo||{}} {...commonProps}/>;
      case "s4": return <Sec4 data={cData.s4||{}} onChange={v=>upd("s4",v)} enc={cData.encargo||{}} s1={cData.s1||{}} s3={cData.s3||{}} {...commonProps}/>;
      case "anexos": return <SecAnexos data={cData.anexos||{}} onChange={v=>upd("anexos",v)} s3={cData.s3||{}} onPrev={goPrev} onSave={handleSave}/>;
      default: return null;
    }
  };

  const doneSecs = ["s1","s2","s3","s4"].filter(k=>cData[k]&&Object.keys(cData[k]).length>2).length;

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* TOP BAR */}
      <div style={{background:C.sidebar,height:50,display:"flex",alignItems:"center",padding:"0 16px",gap:12,flexShrink:0}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:6,padding:"5px 10px",cursor:"pointer",color:"rgba(255,255,255,.7)",fontSize:12,fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
          <Home size={12}/>Inicio
        </button>
        <button onClick={()=>setSidebarOpen(v=>!v)} title={sidebarOpen?"Ocultar menú":"Mostrar menú"}
          style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",color:"rgba(255,255,255,.7)",fontSize:12,fontFamily:"inherit",display:"flex",alignItems:"center",gap:3}}>
          {sidebarOpen?<ChevronLeft size={13}/>:<ChevronRight size={13}/>}
        </button>
        <div style={{width:1,height:22,background:"rgba(255,255,255,.1)"}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:"#fff",fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cData.encargo?.asegurado||"Nuevo informe"}</div>
          <div style={{color:"rgba(255,255,255,.4)",fontSize:10}}>{cData.encargo?.compania||""} · {cData.encargo?.numReferencia||""}</div>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center",flexShrink:0}}>
          <div style={{textAlign:"right"}}>
            <div style={{color:"rgba(255,255,255,.35)",fontSize:9,textTransform:"uppercase",letterSpacing:".06em"}}>Consumo IA</div>
            <div style={{color:"rgba(255,255,255,.75)",fontSize:11,fontWeight:600}}>{((tokens.i||0)+(tokens.o||0)).toLocaleString("es-ES")} tokens · {costEur.toFixed(4)} €</div>
          </div>
          <div style={{background:"rgba(15,123,77,.3)",borderRadius:5,padding:"4px 10px",color:"rgba(255,255,255,.75)",fontSize:11,display:"flex",alignItems:"center",gap:4}}>
            <Check size={10}/>{doneSecs}/4
          </div>
          <button onClick={()=>setExportOpen(true)}
            style={{background:"rgba(155,34,38,.8)",border:"none",borderRadius:7,padding:"6px 14px",cursor:"pointer",color:"#fff",fontSize:12,fontWeight:700,fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
            <FileText size={13}/>Exportar
          </button>
        </div>
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        {/* SIDEBAR */}
        <div style={{width:sidebarOpen?216:0,background:C.sidebar,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto",paddingTop:sidebarOpen?6:0,overflow:"hidden",transition:"width .2s ease"}}>
          {sidebarOpen&&<>
          {SECCIONES.map(item=>{
            const Icon=item.icon;
            const isActive=sec===item.id;
            const isDone=(()=>{
              if(item.id==="s1") return !!(cData.s1?.superficieConstruida||cData.s1?.textoInstant);
              if(item.id==="s2") return !!(cData.s2?.textoAI||cData.s2?.textoRaw);
              if(item.id==="s3") return !!(cData.s3?.partidas?.length>0||cData.s3?.pLibres?.length>0);
              if(item.id==="s4") return !!(cData.s4?.aiText);
              if(item.id==="anexos"){
                const a=cData.anexos||{};
                return !!(a.fotos?.length||a.catastro?.length||a.meteosim?.length||a.facturas?.length||(cData.s3?.facturas?.length));
              }
              return false;
            })();
            return (
              <div key={item.id} onClick={()=>setSec(item.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",cursor:"pointer",
                borderLeft:`3px solid ${isActive?C.accent:"transparent"}`,background:isActive?"rgba(155,34,38,.2)":"transparent",marginBottom:1}}>
                <div style={{width:23,height:23,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                  background:isActive?C.accent:isDone?"rgba(15,123,77,.3)":"rgba(255,255,255,.08)"}}>
                  {isDone&&!isActive?<Check size={11} style={{color:"#6EE7B7"}}/>:<Icon size={11} style={{color:isActive?"#fff":"rgba(255,255,255,.45)"}}/>}
                </div>
                <span style={{fontSize:12,fontWeight:isActive?600:400,color:isActive?"#fff":"rgba(255,255,255,.5)",lineHeight:1.3}}>{item.label}</span>
              </div>
            );
          })}
          <div style={{height:12}}/>
          </>}
        </div>

        {/* CONTENT — single column, max width for readability */}
        <div style={{flex:1,overflowY:"auto",background:C.bg,display:"flex",justifyContent:"center"}}>
          <div style={{width:"100%",maxWidth:760,padding:"28px 28px 48px"}}>
            {renderSec()}
          </div>
        </div>
      </div>

      {exportOpen&&<ExportModal cData={cData} onClose={()=>setExportOpen(false)} user={user} token={token} onSaveDni={async (dni)=>{ if(token&&user?.id) await sbDb(`perfiles?id=eq.${user.id}`,"PATCH",{dni},token); }}/>}
      <link rel="stylesheet" href={FONT}/>
      <style>{css}</style>
    </div>
  );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]   = useState(null);
  const [token,setToken] = useState(null);
  const [view,setView]   = useState("dashboard");
  const [cases,setCases] = useState([]);
  const [active,setActive] = useState(null);
  const [sbLoading,setSbLoading]   = useState(false);
  const [sidebarOpen,setSidebarOpen] = useState(true);

  // Cargar informes del usuario desde Supabase
  const loadCases = async (tk) => {
    setSbLoading(true);
    const rows = await sbDb('informes?select=*&order=created_at.desc', 'GET', null, tk);
    if(rows) setCases(rows.map(r=>({id:r.id,_sbId:r.id,encargo:r.encargo||{},s1:r.s1||{},s2:r.s2||{},s3:r.s3||{},s4:r.s4||{},anexos:r.anexos||{},tokenStats:{i:0,o:0},estado:r.estado})));
    setSbLoading(false);
  };

  const handleAuth = (u, tk) => { setUser(u); setToken(tk); loadCases(tk); };
  const handleSignOut = () => { setUser(null); setToken(null); setCases([]); setActive(null); setView('dashboard'); };

  const handleDone = async enc => {
    const newRow = {user_id:user.id, num_referencia:enc.numReferencia||'', compania:enc.compania||'', asegurado:enc.asegurado||'', estado:'borrador', encargo:enc, s1:{}, s2:{}, s3:{}, s4:{}, anexos:{}};
    const saved = await sbDb('informes', 'POST', newRow, token);
    const row = Array.isArray(saved)?saved[0]:saved;
    if(row){
      const c={id:row.id,_sbId:row.id,encargo:enc,s1:{},s2:{},s3:{},s4:{},anexos:{},tokenStats:{i:0,o:0},estado:'borrador'};
      setCases(p=>[c,...p]); setActive(c); setView("editor");
    }
  };

  const openCase  = c => { setActive(c); setView("editor"); };

  const updateCase = async u => {
    setActive(u); setCases(p=>p.map(c=>c.id===u.id?u:c));
    if(u._sbId&&token){
      await sbDb(`informes?id=eq.${u._sbId}`, 'PATCH', {
        encargo:u.encargo||{}, s1:u.s1||{}, s2:u.s2||{}, s3:u.s3||{}, s4:u.s4||{},
        anexos:u.anexos||{}, estado:u.estado||'borrador',
        num_referencia:u.encargo?.numReferencia||'',
        compania:u.encargo?.compania||'', asegurado:u.encargo?.asegurado||''
      }, token);
    }
  };

  const deleteCase = async id => {
    const cas = cases.find(c=>c.id===id);
    if(cas?._sbId&&token) await sbDb(`informes?id=eq.${cas._sbId}`,'DELETE',null,token);
    setCases(p=>p.filter(c=>c.id!==id));
    if(active?.id===id){ setActive(null); setView('dashboard'); }
  };

  if(!user) return <LoginScreen onAuth={handleAuth}/>;
  if(view==="upload") return <UploadEncargo onDone={handleDone} onCancel={()=>setView("dashboard")} onTokens={()=>{}}/>;
  if(view==="editor"&&active) return <ReportEditor cData={active} onUpdate={updateCase} onBack={()=>setView("dashboard")} user={user} token={token} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>;
  return <>
    <Dashboard cases={cases} onNew={()=>setView("upload")} onOpen={openCase} onDelete={deleteCase} user={user} onSignOut={handleSignOut} loading={sbLoading} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
    <link rel="stylesheet" href={FONT}/>
    <style>{css}</style>
  </>;
}
