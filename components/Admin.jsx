// ─── PANEL DE ADMINISTRACIÓN (Fase 1) ────────────────────────────────────────
// Solo lo ven las cuentas de la tabla public.admins. Lee los datos a través de
// las funciones admin_* de Supabase, que devuelven metadatos: nunca el
// contenido de los informes (datos del asegurado, fotos, valoración).
// Paleta, tipografía y Logo llegan por props desde Peritia.jsx (`theme`) para
// no duplicarlos.
import { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard, Wallet, Scale, LineChart, Users, FileText, Tags, Settings,
  ArrowLeft, Plus, X, Lock, Info, Ban, Unlock, Save, Trash2, Check, RefreshCw,
  Search, CreditCard, AlertTriangle, Loader2,
} from "lucide-react";

// Tipo de cambio aproximado para mostrar en euros el coste de IA, que
// Anthropic factura en dólares. Ajustar si cambia mucho.
const USD_EUR = 0.86;

const SECCIONES_IA = {
  encargo:"Lectura del encargo", poliza:"Lectura de la póliza",
  sec1_riesgo:"Sec. 1 · tipo de riesgo", sec1_texto:"Sec. 1 · redacción",
  sec2_meteo:"Sec. 2 · texto meteorológico", sec2_texto:"Sec. 2 · redacción",
  sec3_texto:"Sec. 3 · redacción", sec3_baremo:"Sec. 3 · tabla desde baremo",
  sec3_facturas:"Sec. 3 · lectura de facturas", otros:"Otros",
};
const PLANES_SUG = ["Prueba","Básico","Pro","Por informe","Cortesía","Sin plan"];

const num  = n => new Intl.NumberFormat("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2}).format(+n||0);
const eur  = n => `${num(n)} €`;
const usd2eur = n => (+n||0)*USD_EUR;
const fecha = d => d ? new Date(d).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"}) : "—";
const hoyISO = () => new Date().toISOString().slice(0,10);
const diasDesde = d => d ? Math.floor((Date.now()-new Date(d).getTime())/86400000) : null;
const relativo = d => {
  const n = diasDesde(d);
  if(n===null) return "Nunca";
  if(n<=0) return "Hoy"; if(n===1) return "Ayer";
  return `Hace ${n} días`;
};
const pct = (a,b) => b ? Math.round((a-b)/b*100) : null;
const nombreDe = p => p?.nombre || p?.email || "—";

const css = `
  .adm-shell{display:flex;min-height:100vh;min-height:100dvh}
  .adm-sb{width:232px;flex-shrink:0;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;height:100dvh}
  .adm-nav{display:flex;flex-direction:column;gap:2px;padding:10px 8px;flex:1;overflow:auto}
  .adm-nav-l{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.35);padding:12px 10px 6px}
  .adm-content{padding:26px 28px 60px;max-width:1240px;width:100%}
  .adm-kpis{display:grid;gap:14px;grid-template-columns:repeat(4,minmax(0,1fr))}
  .adm-kpis.k6{grid-template-columns:repeat(6,minmax(0,1fr))}
  .adm-g2{display:grid;gap:16px;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)}
  .adm-g2e{display:grid;gap:16px;grid-template-columns:repeat(2,minmax(0,1fr))}
  .adm-tw{overflow-x:auto}
  .adm-tr:hover td{background:#FAF8F4}
  .adm-bar{display:grid;grid-template-columns:190px minmax(0,1fr) 84px;gap:10px;align-items:center;font-size:14px;padding:5px 0}
  @media(max-width:1100px){.adm-kpis.k6{grid-template-columns:repeat(3,minmax(0,1fr))}}
  @media(max-width:1023px){
    .adm-shell{flex-direction:column}
    .adm-sb{width:100%;height:auto;position:static}
    .adm-nav{flex-direction:row;overflow-x:auto;padding:6px 10px 10px}
    .adm-nav-l,.adm-sb-foot{display:none}
    .adm-nav button{width:auto!important;white-space:nowrap}
    .adm-g2,.adm-g2e{grid-template-columns:minmax(0,1fr)}
  }
  @media(max-width:767px){
    .adm-content{padding:20px 16px 48px}
    .adm-kpis,.adm-kpis.k6{grid-template-columns:repeat(2,minmax(0,1fr))}
    .adm-bar{grid-template-columns:120px minmax(0,1fr) 72px}
    .adm-f2{grid-template-columns:1fr!important}
  }
`;

// Piezas de UI del panel. Se crean una sola vez por paleta (useMemo) para que
// React no las trate como componentes nuevos en cada render: si no, cualquier
// cambio de estado desmontaría los campos de texto y perderían el foco.
function makeUI(C){
  const card = {background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:20,minWidth:0};
  const lbl = {fontSize:12,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase",color:C.muted};
  const inp = {width:"100%",padding:"9px 12px",border:`1px solid ${C.border}`,borderRadius:7,fontSize:15,background:C.white,outline:"none",fontFamily:"inherit"};
  const tnum = {fontVariantNumeric:"tabular-nums",fontWeight:600};
  const th = {background:C.ink,color:"rgba(255,255,255,.85)",fontSize:11.5,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",textAlign:"left",padding:"10px 12px",whiteSpace:"nowrap"};
  const td = {padding:"11px 12px",borderTop:`1px solid ${C.border}`,whiteSpace:"nowrap",verticalAlign:"middle",fontSize:14.5};

  const Btn = ({children,onClick,primary,danger,sm,disabled,type="button",full}) => (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      border:"none",borderRadius:9,padding:sm?"6px 12px":"9px 18px",fontSize:sm?13:14,fontWeight:600,
      cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,
      fontFamily:"inherit",opacity:disabled?.6:1,width:full?"100%":"auto",
      background:primary?C.accent:danger?C.redBg:C.tag, color:primary?"#fff":danger?C.red:C.ink,
    }}>{children}</button>
  );
  const Badge = ({children,tone="tag"}) => {
    const m = {green:[C.green,C.greenBg],orange:[C.orange,C.orangeBg],red:[C.red,C.redBg],plano:[C.plano,C.planoLight],acc:[C.accent,C.accentLight],tag:[C.muted,C.tag]}[tone];
    return <span style={{display:"inline-block",fontSize:12.5,fontWeight:600,padding:"2px 9px",borderRadius:20,whiteSpace:"nowrap",color:m[0],background:m[1]}}>{children}</span>;
  };
  const Kpi = ({l,v,d,hl}) => (
    <div style={{...card,padding:"16px 18px",display:"flex",flexDirection:"column",gap:4,
      ...(hl?{borderColor:C.accent,boxShadow:`inset 0 3px 0 ${C.accent}`}:{})}}>
      <span style={lbl}>{l}</span>
      <span style={{...tnum,fontSize:23,letterSpacing:"-.01em",whiteSpace:"nowrap",color:C.ink}}>{v}</span>
      {d&&<span style={{fontSize:13,color:C.muted}}>{d}</span>}
    </div>
  );
  const Delta = ({a,b,suf="vs mes anterior"}) => {
    const p = pct(a,b);
    if(p===null) return <span>{suf.replace("vs","sin datos del")}</span>;
    return <span><span style={{color:p>=0?C.green:C.red,fontWeight:600}}>{p>=0?"▲":"▼"} {Math.abs(p)}%</span> {suf}</span>;
  };
  const Head = ({eyebrow,title,right}) => (
    <div style={{display:"flex",alignItems:"flex-end",gap:14,flexWrap:"wrap",marginBottom:20}}>
      <div>
        <div style={{...lbl,fontSize:11,letterSpacing:".12em"}}>{eyebrow}</div>
        <h1 style={{fontSize:28,fontWeight:600,color:C.ink,marginTop:2}}>{title}</h1>
      </div>
      <div style={{flex:1}}/>
      {right}
    </div>
  );
  const Nota = ({icon:Icon=Info,children}) => (
    <div style={{display:"flex",gap:8,alignItems:"flex-start",fontSize:14,color:C.muted,marginBottom:14}}>
      <Icon size={15} style={{flexShrink:0,marginTop:2}}/><span>{children}</span>
    </div>
  );
  const Bar = ({label,value,max,right,color=C.plano}) => (
    <div className="adm-bar">
      <span>{label}</span>
      <div style={{height:10,background:C.tag,borderRadius:5,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${max?Math.max(2,value/max*100):0}%`,background:color,borderRadius:5}}/>
      </div>
      <span style={{...tnum,textAlign:"right"}}>{right}</span>
    </div>
  );
  const Tabla = ({cols,children,flush}) => (
    <div className="adm-tw" style={flush?{}:{border:`1px solid ${C.border}`,borderRadius:10,background:C.white}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{cols.map((c,i)=><th key={i} style={{...th,textAlign:c.r?"right":"left"}}>{c.l}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
  const Vacio = ({children}) => <div style={{padding:"28px 12px",textAlign:"center",color:C.muted,fontSize:14.5}}>{children}</div>;

  return {Btn,Badge,Kpi,Delta,Head,Nota,Bar,Tabla,Vacio,card,lbl,inp,tnum,th,td};
}

// ── Componentes con estado propio (fuera de AdminPanel para no remontarse) ──
function AccionesCobro({c, ctx}){
  const {C, ui:{Btn}, borrarCobro, marcarPagado, aviso} = ctx;
    const [seguro,setSeguro] = useState(false);
    if(seguro) return <span style={{display:"inline-flex",gap:6}}>
      <Btn sm danger onClick={()=>borrarCobro(c.id).catch(()=>aviso("No se pudo eliminar"))}>Eliminar</Btn>
      <Btn sm onClick={()=>setSeguro(false)}>No</Btn></span>;
    return <span style={{display:"inline-flex",gap:6}}>
      {c.estado==="pendiente"&&<Btn sm onClick={()=>marcarPagado(c.id).catch(()=>aviso("No se pudo actualizar"))}><Check size={13}/>Pagado</Btn>}
      <button onClick={()=>setSeguro(true)} aria-label="Eliminar cobro" title="Eliminar cobro" style={{border:"none",background:"none",cursor:"pointer",color:C.muted,padding:4}}><Trash2 size={15}/></button>
    </span>;
  }

  // ── Ficha de perito ─────────────────────────────────────────────────────────
function Ficha({ctx}){
  const {C, ui, data, ficha, user, guardarCuenta, aviso, setFicha, setModalCobro, estadoPerito} = ctx;
  const {Btn,Badge,Kpi,card,lbl,inp,tnum} = ui;
    const p = data.peritos.find(x=>x.user_id===ficha);
    const [plan,setPlan] = useState(p?.plan||"Sin plan");
    const [cuota,setCuota] = useState(String(p?.cuota_mensual??0).replace(".",","));
    const [notas,setNotas] = useState(p?.notas||"");
    const [guardando,setGuardando] = useState(false);
    const [confirmar,setConfirmar] = useState(false);
    if(!p) return null;
    const esYo = p.user_id===user?.id;
    const costeMes = usd2eur(p.coste_ia_mes_usd), cuotaN = +p.cuota_mensual||0;
    const cobrosP = data.cobros.filter(c=>c.user_id===p.user_id);
    const guardar = async () => {
      const c = parseFloat(cuota.replace(/\./g,"").replace(",","."));
      if(isNaN(c)||c<0){ aviso("La cuota debe ser un importe válido"); return; }
      setGuardando(true);
      try { await guardarCuenta(p.user_id,{plan:plan.trim()||"Sin plan",cuota_mensual:c,notas}); aviso("Ficha guardada"); }
      catch { aviso("No se pudo guardar. Inténtalo de nuevo."); }
      setGuardando(false);
    };
    const bloquear = async v => {
      setGuardando(true);
      try { await guardarCuenta(p.user_id,{bloqueado:v}); aviso(v?"Perito bloqueado: ya no puede entrar ni usar la IA":"Perito desbloqueado"); }
      catch { aviso("No se pudo cambiar el acceso."); }
      setGuardando(false); setConfirmar(false);
    };
    const [t,tone] = estadoPerito(p);
    return (
      <>
        <div onClick={()=>setFicha(null)} style={{position:"fixed",inset:0,background:"rgba(27,36,48,.45)",zIndex:60}}/>
        <aside role="dialog" aria-label={`Ficha de ${nombreDe(p)}`} style={{position:"fixed",top:0,right:0,bottom:0,width:480,maxWidth:"100%",background:C.bg,zIndex:61,overflow:"auto",boxShadow:"-2px 0 20px rgba(0,0,0,.25)"}}>
          <div style={{background:C.sidebar,color:"#fff",padding:"18px 20px",display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(255,255,255,.5)"}}>Perito · alta {fecha(p.alta)}</div>
              <div style={{fontSize:19,fontWeight:600,marginTop:2}}>{p.nombre||p.email}</div>
              {p.nombre&&<div style={{fontSize:13.5,color:"rgba(255,255,255,.65)"}}>{p.email}</div>}
            </div>
            <button onClick={()=>setFicha(null)} aria-label="Cerrar" style={{marginLeft:"auto",background:"rgba(255,255,255,.1)",border:"none",color:"#fff",borderRadius:6,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><X size={15}/></button>
          </div>
          <div style={{padding:"18px 20px 40px",display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Badge tone={tone}>{t}</Badge><Badge>{p.plan}</Badge>
              <Badge>Último acceso: {relativo(p.ultimo_acceso).toLowerCase()}</Badge>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10}}>
              <Kpi l="Pagado total" v={eur(p.pagado_total)}/>
              <Kpi l="Coste IA mes" v={eur(costeMes)} d={`${p.informes_mes} informes`}/>
              <Kpi l="Margen mes" v={cuotaN?`${Math.round((cuotaN-costeMes)/cuotaN*100)}%`:"—"} d={cuotaN?"Sobre su cuota":"Sin cuota"}/>
            </div>
            <div style={card}>
              <h3 style={{fontSize:16,fontWeight:600,marginBottom:12}}>Plan y cuota</h3>
              <div className="adm-f2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                <div><label htmlFor="adm-plan" style={{...lbl,display:"block",marginBottom:5}}>Plan</label>
                  <input id="adm-plan" list="adm-planes" value={plan} onChange={e=>setPlan(e.target.value)} style={inp}/>
                  <datalist id="adm-planes">{PLANES_SUG.map(x=><option key={x} value={x}/>)}</datalist></div>
                <div><label htmlFor="adm-cuota" style={{...lbl,display:"block",marginBottom:5}}>Cuota €/mes</label>
                  <input id="adm-cuota" inputMode="decimal" value={cuota} onChange={e=>setCuota(e.target.value)} style={{...inp,...tnum}}/></div>
              </div>
              <label htmlFor="adm-notas" style={{...lbl,display:"block",marginBottom:5}}>Notas internas <span style={{textTransform:"none",fontWeight:500,letterSpacing:0}}>(solo las ves tú)</span></label>
              <textarea id="adm-notas" rows={3} value={notas} onChange={e=>setNotas(e.target.value)} placeholder="Ej.: lo conocí en el congreso de peritos de Barcelona" style={{...inp,resize:"vertical",marginBottom:12}}/>
              <Btn primary full onClick={guardar} disabled={guardando}>{guardando?<Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>:<Save size={14}/>}Guardar ficha</Btn>
            </div>
            <div style={card}>
              <div style={{display:"flex",alignItems:"center",marginBottom:10}}>
                <h3 style={{fontSize:16,fontWeight:600}}>Cobros</h3><div style={{flex:1}}/>
                <Btn sm onClick={()=>setModalCobro({user_id:p.user_id, concepto:`${p.plan!=="Sin plan"?`Plan ${p.plan} · `:""}${new Date().toLocaleDateString("es-ES",{month:"long"})}`, importe:cuotaN?String(cuotaN).replace(".",","):""})}><Plus size={13}/>Registrar</Btn>
              </div>
              {cobrosP.length===0 ? <div style={{fontSize:14,color:C.muted}}>Sin cobros registrados.</div> :
                cobrosP.slice(0,8).map(c=>(
                  <div key={c.id} style={{display:"flex",gap:10,alignItems:"center",padding:"7px 0",borderTop:`1px solid ${C.border}`,fontSize:14}}>
                    <span style={{...tnum,fontWeight:500,color:C.muted,width:86}}>{fecha(c.fecha)}</span>
                    <span style={{flex:1,minWidth:0}}>{c.concepto}</span>
                    <Badge tone={c.estado==="pagado"?"green":"red"}>{c.estado==="pagado"?"Pagado":"Pendiente"}</Badge>
                    <span style={{...tnum,width:80,textAlign:"right"}}>{eur(c.importe)}</span>
                  </div>))}
            </div>
            <div style={card}>
              <h3 style={{fontSize:16,fontWeight:600,marginBottom:6}}>Acceso</h3>
              {esYo ? <div style={{fontSize:14,color:C.muted}}>Es tu propia cuenta: no se puede bloquear desde aquí.</div> :
              p.bloqueado ? <Btn full onClick={()=>bloquear(false)} disabled={guardando}><Unlock size={14}/>Desbloquear acceso</Btn> :
              confirmar ? <div>
                  <div style={{fontSize:14,marginBottom:10}}>No podrá entrar en PERIT.IA ni usar la IA hasta que lo desbloquees. Sus informes se conservan.</div>
                  <div style={{display:"flex",gap:8}}><Btn danger onClick={()=>bloquear(true)} disabled={guardando}><Ban size={14}/>Sí, bloquear</Btn><Btn onClick={()=>setConfirmar(false)}>Cancelar</Btn></div>
                </div> :
              <Btn danger full onClick={()=>setConfirmar(true)}><Ban size={14}/>Bloquear acceso</Btn>}
            </div>
          </div>
        </aside>
      </>
    );
  }

  // ── Modal: registrar cobro ──────────────────────────────────────────────────
function ModalCobro({ctx}){
  const {C, ui, data, modalCobro, guardarCobro, setModalCobro, aviso} = ctx;
  const {Btn,lbl,inp,tnum} = ui;
    const ini = modalCobro||{};
    const [f,setF] = useState({user_id:ini.user_id||"", concepto:ini.concepto||"", importe:ini.importe||"", fecha:hoyISO(), metodo:"Transferencia", estado:"pagado"});
    const [e,setE] = useState(""); const [g,setG] = useState(false);
    const set = (k,v) => setF(x=>({...x,[k]:v}));
    const enviar = async ev => {
      ev.preventDefault();
      const imp = parseFloat(String(f.importe).replace(/\./g,"").replace(",","."));
      if(!f.user_id) return setE("Elige el perito que ha pagado.");
      if(!f.concepto.trim()) return setE("Escribe el concepto, por ejemplo «Plan Pro · octubre».");
      if(isNaN(imp)||imp<=0) return setE("El importe debe ser mayor que 0.");
      setG(true);
      try { await guardarCobro({user_id:f.user_id, concepto:f.concepto.trim(), importe:+imp.toFixed(2), fecha:f.fecha||hoyISO(), metodo:f.metodo, estado:f.estado});
        setModalCobro(null); aviso("Cobro registrado"); }
      catch { setE("No se pudo guardar el cobro. Inténtalo de nuevo."); setG(false); }
    };
    const peritos = [...data.peritos].sort((a,b)=>nombreDe(a).localeCompare(nombreDe(b)));
    return (
      <>
        <div onClick={()=>setModalCobro(null)} style={{position:"fixed",inset:0,background:"rgba(27,36,48,.45)",zIndex:60}}/>
        <form onSubmit={enviar} role="dialog" aria-label="Registrar cobro" style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:C.white,borderRadius:12,boxShadow:"0 20px 60px rgba(0,0,0,.3)",zIndex:61,width:460,maxWidth:"calc(100vw - 32px)",maxHeight:"calc(100vh - 32px)",overflow:"auto"}}>
          <div style={{padding:"18px 20px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{...lbl,fontSize:11,letterSpacing:".12em"}}>Ingresos</div>
            <div style={{fontSize:19,fontWeight:600}}>Registrar cobro</div>
          </div>
          <div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:14}}>
            <div><label htmlFor="cb-perito" style={{...lbl,display:"block",marginBottom:5}}>Perito</label>
              <select id="cb-perito" value={f.user_id} onChange={e=>set("user_id",e.target.value)} style={inp}>
                <option value="">Elige un perito…</option>
                {peritos.map(p=><option key={p.user_id} value={p.user_id}>{nombreDe(p)}{p.nombre?` · ${p.email}`:""}</option>)}
              </select></div>
            <div><label htmlFor="cb-concepto" style={{...lbl,display:"block",marginBottom:5}}>Concepto</label>
              <input id="cb-concepto" value={f.concepto} onChange={e=>set("concepto",e.target.value)} placeholder="Plan Pro · octubre" style={inp}/></div>
            <div className="adm-f2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><label htmlFor="cb-importe" style={{...lbl,display:"block",marginBottom:5}}>Importe (€)</label>
                <input id="cb-importe" inputMode="decimal" value={f.importe} onChange={e=>set("importe",e.target.value)} placeholder="99,00" style={{...inp,...tnum}}/></div>
              <div><label htmlFor="cb-fecha" style={{...lbl,display:"block",marginBottom:5}}>Fecha</label>
                <input id="cb-fecha" type="date" value={f.fecha} onChange={e=>set("fecha",e.target.value)} style={inp}/></div>
              <div><label htmlFor="cb-metodo" style={{...lbl,display:"block",marginBottom:5}}>Método</label>
                <select id="cb-metodo" value={f.metodo} onChange={e=>set("metodo",e.target.value)} style={inp}>
                  {["Transferencia","Bizum","Efectivo","Otro"].map(m=><option key={m}>{m}</option>)}</select></div>
              <div><label htmlFor="cb-estado" style={{...lbl,display:"block",marginBottom:5}}>Estado</label>
                <select id="cb-estado" value={f.estado} onChange={e=>set("estado",e.target.value)} style={inp}>
                  <option value="pagado">Pagado</option><option value="pendiente">Pendiente</option></select></div>
            </div>
            {e&&<div style={{background:C.redBg,border:"1px solid #FECACA",borderRadius:7,padding:"8px 12px",fontSize:14,color:C.red}}>{e}</div>}
          </div>
          <div style={{padding:"14px 20px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn onClick={()=>setModalCobro(null)}>Cancelar</Btn>
            <Btn primary type="submit" disabled={g}>{g?<Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>:<Check size={14}/>}Guardar cobro</Btn>
          </div>
        </form>
      </>
    );
  }

export default function AdminPanel({token, user, onExit, theme, sb}){
  const {C, Logo} = theme;
  const [sec,setSec] = useState("inicio");
  const [data,setData] = useState(null);     // {peritos, informes, mensual, secciones, cobros}
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState("");
  const [toast,setToast] = useState("");
  const [ficha,setFicha] = useState(null);   // user_id del perito abierto
  const [modalCobro,setModalCobro] = useState(null); // {user_id?} o null

  // ── Acceso a Supabase con la sesión del admin ──────────────────────────────
  const api = async (path, method="GET", body=null, prefer="return=representation") => {
    const r = await fetch(`${sb.url}/rest/v1/${path}`, {
      method, headers:{"Content-Type":"application/json", apikey:sb.key,
        Authorization:`Bearer ${token}`, Prefer:prefer},
      body: body ? JSON.stringify(body) : undefined,
    });
    const txt = await r.text();
    if(!r.ok){ const e = new Error(txt.slice(0,300)); e.status = r.status; throw e; }
    try { return txt ? JSON.parse(txt) : null; } catch { return null; }
  };

  const cargar = async () => {
    setLoading(true); setErr("");
    try {
      const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0,0,0,0);
      const [peritos, informes, mensual, secciones, cobros] = await Promise.all([
        api("rpc/admin_peritos","POST",{}),
        api("rpc/admin_informes","POST",{p_limite:300}),
        api("rpc/admin_mensual","POST",{p_meses:6}),
        api("rpc/admin_uso_secciones","POST",{p_desde:inicioMes.toISOString()}),
        api("cobros?select=*&order=fecha.desc,created_at.desc"),
      ]);
      setData({peritos:peritos||[], informes:informes||[], mensual:mensual||[], secciones:secciones||[], cobros:cobros||[]});
    } catch(e) {
      console.error("Admin:", e);
      setErr(e.status===404
        ? "Falta aplicar en Supabase la migración del panel de administración (supabase/migrations/20260930120000_admin_fase1.sql)."
        : "No se pudieron cargar los datos del panel. Revisa la conexión e inténtalo de nuevo.");
    }
    setLoading(false);
  };
  useEffect(()=>{ cargar(); },[]);

  const aviso = t => { setToast(t); setTimeout(()=>setToast(""),2600); };

  // ── Escrituras ──────────────────────────────────────────────────────────────
  const guardarCuenta = async (user_id, cambios) => {
    await api("cuentas?on_conflict=user_id","POST",{user_id, ...cambios, updated_at:new Date().toISOString()},
      "resolution=merge-duplicates,return=minimal");
    await cargar();
  };
  const guardarCobro = async cobro => { await api("cobros","POST",cobro,"return=minimal"); await cargar(); };
  const marcarPagado = async id => { await api(`cobros?id=eq.${id}`,"PATCH",{estado:"pagado"},"return=minimal"); await cargar(); aviso("Cobro marcado como pagado"); };
  const borrarCobro = async id => { await api(`cobros?id=eq.${id}`,"DELETE",null,"return=minimal"); await cargar(); aviso("Cobro eliminado"); };

  // ── Cifras derivadas ────────────────────────────────────────────────────────
  const k = useMemo(()=>{
    if(!data) return null;
    const m = data.mensual; const act = m[m.length-1]||{}; const ant = m[m.length-2]||{};
    const ingresosMes = +act.ingresos||0, ingresosAnt = +ant.ingresos||0;
    const costeMes = usd2eur(act.coste_ia_usd), informesMes = +act.informes||0;
    const activos = data.peritos.filter(p=>!p.bloqueado);
    const recurrente = activos.reduce((a,p)=>a+(+p.cuota_mensual||0),0);
    const dePago = activos.filter(p=>+p.cuota_mensual>0).length;
    const pendientes = data.cobros.filter(c=>c.estado==="pendiente");
    const anio = new Date().getFullYear();
    const cobradoAnio = data.cobros.filter(c=>c.estado==="pagado"&&new Date(c.fecha).getFullYear()===anio).reduce((a,c)=>a+(+c.importe),0);
    const activos7 = data.peritos.filter(p=>{const d=diasDesde(p.ultimo_acceso); return d!==null&&d<=7;}).length;
    return {ingresosMes, ingresosAnt, costeMes, informesMes, informesAnt:+ant.informes||0,
      margen:ingresosMes-costeMes, recurrente, dePago, pendientes,
      pendienteImporte:pendientes.reduce((a,c)=>a+(+c.importe),0), cobradoAnio, activos7};
  },[data]);

  const alertas = useMemo(()=>{
    if(!data) return [];
    const out = [];
    data.cobros.filter(c=>c.estado==="pendiente").forEach(c=>{
      const p = data.peritos.find(x=>x.user_id===c.user_id);
      out.push({t:"red", titulo:`Cobro pendiente · ${nombreDe(p)}`, sub:`${c.concepto}, ${eur(c.importe)}. Desde el ${fecha(c.fecha)}.`, go:()=>setSec("ingresos")});
    });
    data.peritos.forEach(p=>{
      if(p.bloqueado) return;
      const cuota = +p.cuota_mensual||0, costeMes = usd2eur(p.coste_ia_mes_usd);
      if(cuota>0 && costeMes>cuota) out.push({t:"orange", titulo:`Gasta más de lo que paga · ${nombreDe(p)}`, sub:`Coste de IA este mes ${eur(costeMes)} frente a una cuota de ${eur(cuota)}.`, go:()=>setFicha(p.user_id)});
      const inact = diasDesde(p.ultimo_informe||p.alta);
      if(cuota>0 && inact!==null && inact>=30) out.push({t:"orange", titulo:`Sin actividad · ${nombreDe(p)}`, sub:`${inact} días sin crear informes y sigue pagando. Riesgo de baja.`, go:()=>setFicha(p.user_id)});
      const alta = diasDesde(p.alta);
      if(p.plan==="Sin plan" && alta!==null && alta<=14) out.push({t:"muted", titulo:`Nuevo perito · ${nombreDe(p)}`, sub:`Se registró ${relativo(p.alta).toLowerCase()}. Asígnale un plan.`, go:()=>setFicha(p.user_id)});
    });
    return out;
  },[data]);

  const ui = useMemo(()=>makeUI(C),[C]);
  const {Btn,Badge,Kpi,Delta,Head,Nota,Bar,Tabla,Vacio,card,lbl,inp,tnum,th,td} = ui;

  const estadoPerito = p => {
    if(p.bloqueado) return ["Bloqueado","tag"];
    const inact = diasDesde(p.ultimo_informe||p.alta);
    if(+p.cuota_mensual>0 && inact!==null && inact>=30) return ["Sin actividad 30 días","orange"];
    if(p.plan==="Sin plan") return ["Sin plan","plano"];
    return ["Activo","green"];
  };
  const estadoInforme = e => ({exportado:["Finalizado","green"],completado:["Completado","orange"]}[e] || ["En curso","plano"]);

  // ── Gráfico ingresos vs coste de IA ─────────────────────────────────────────
  const grafico = () => {
    const m = data.mensual.map(r=>({mes:new Date(r.mes+"T00:00:00").toLocaleDateString("es-ES",{month:"short"}).replace(".",""),
      ing:+r.ingresos||0, cos:usd2eur(r.coste_ia_usd)}));
    const W=560,H=220,pl=52,pr=8,pt=16,pb=26;
    const top = Math.max(10,...m.map(r=>Math.max(r.ing,r.cos)));
    const paso = Math.pow(10,Math.floor(Math.log10(top))); const max = Math.ceil(top/paso)*paso;
    const iw=W-pl-pr, ih=H-pt-pb, bw=iw/Math.max(1,m.length);
    const y = v => pt+ih-(v/max)*ih;
    const ticks = [0,.25,.5,.75,1].map(f=>max*f);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Ingresos y coste de IA por mes">
        {ticks.map((v,i)=><g key={i}>
          <line x1={pl} x2={W-pr} y1={y(v)} y2={y(v)} stroke={C.border}/>
          <text x={pl-8} y={y(v)+4} textAnchor="end" fontSize="11" fill={C.muted}>{Math.round(v)} €</text>
        </g>)}
        {m.map((r,i)=>{ const x=pl+i*bw+bw*.18, w=bw*.3, last=i===m.length-1; return <g key={i}>
          <rect x={x} y={y(r.ing)} width={w} height={Math.max(0,pt+ih-y(r.ing))} rx="3" fill={last?C.accent:"#C9A5A6"}><title>{`${r.mes}: ingresos ${eur(r.ing)}`}</title></rect>
          <rect x={x+w+4} y={y(r.cos)} width={w} height={Math.max(0,pt+ih-y(r.cos))} rx="3" fill={last?C.plano:"#A9C3C8"}><title>{`${r.mes}: coste IA ${eur(r.cos)}`}</title></rect>
          <text x={x+w+2} y={H-8} textAnchor="middle" fontSize="11" fill={last?C.ink:C.muted} fontWeight={last?600:400}>{r.mes}</text>
        </g>; })}
      </svg>
    );
  };

  // ── Secciones ───────────────────────────────────────────────────────────────
  const vInicio = () => (
    <>
      <Head eyebrow={new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} title="Panel de administración"/>
      <div className="adm-kpis k6" style={{marginBottom:16}}>
        <Kpi hl l="Ingresos del mes" v={eur(k.ingresosMes)} d={<Delta a={k.ingresosMes} b={k.ingresosAnt}/>}/>
        <Kpi l="Recurrente" v={`${num(k.recurrente)} €/mes`} d="Suma de cuotas activas"/>
        <Kpi l="Margen del mes" v={eur(k.margen)} d={k.ingresosMes?`${Math.round(k.margen/k.ingresosMes*100)}% de lo ingresado`:"Ingresos menos coste IA"}/>
        <Kpi l="Peritos de pago" v={k.dePago} d={`de ${data.peritos.length} registrados`}/>
        <Kpi l="Informes del mes" v={k.informesMes} d={<Delta a={k.informesMes} b={k.informesAnt}/>}/>
        <Kpi l="Coste de IA" v={eur(k.costeMes)} d={k.informesMes?`${num(k.costeMes/k.informesMes)} € por informe`:"Este mes"}/>
      </div>
      <div className="adm-g2">
        <div style={card}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
            <h2 style={{fontSize:18,fontWeight:600}}>Ingresos frente a coste de IA</h2><div style={{flex:1}}/>
            <span style={{fontSize:13,color:C.muted,display:"flex",gap:14}}>
              <span><i style={{display:"inline-block",width:10,height:10,borderRadius:2,background:C.accent,marginRight:6}}/>Ingresos</span>
              <span><i style={{display:"inline-block",width:10,height:10,borderRadius:2,background:C.plano,marginRight:6}}/>Coste IA</span>
            </span>
          </div>
          {grafico()}
        </div>
        <div style={card}>
          <h2 style={{fontSize:18,fontWeight:600,marginBottom:12}}>Requiere tu atención</h2>
          {alertas.length===0 && <div style={{fontSize:14.5,color:C.muted,display:"flex",gap:8,alignItems:"center"}}><Check size={15} color={C.green}/>Todo en orden.</div>}
          {alertas.slice(0,6).map((a,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"11px 0",borderTop:i?`1px solid ${C.border}`:"none"}}>
              <span style={{width:8,height:8,borderRadius:"50%",marginTop:7,flexShrink:0,background:a.t==="red"?C.red:a.t==="orange"?C.orange:C.muted}}/>
              <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:14.5}}>{a.titulo}</div><div style={{fontSize:13.5,color:C.muted}}>{a.sub}</div></div>
              <Btn sm onClick={a.go}>Ver</Btn>
            </div>
          ))}
          {alertas.length>6 && <div style={{fontSize:13,color:C.muted,marginTop:6}}>Y {alertas.length-6} más.</div>}
        </div>
      </div>
      <div style={{...card,marginTop:16}}>
        <div style={{display:"flex",alignItems:"center",marginBottom:12}}>
          <h2 style={{fontSize:18,fontWeight:600}}>Últimos informes</h2><div style={{flex:1}}/>
          <Btn sm onClick={()=>setSec("informes")}>Ver todos</Btn>
        </div>
        {tablaInformes(data.informes.slice(0,5),true)}
      </div>
    </>
  );

  const tablaInformes = (rows,flush) => rows.length===0 ? <Vacio>Aún no hay informes.</Vacio> : (
    <Tabla flush={flush} cols={[{l:"Referencia"},{l:"Perito"},{l:"Compañía"},{l:"Garantía"},{l:"Estado"},{l:"Creado"},{l:"Última edición"}]}>
      {rows.map(r=>{ const [t,tone]=estadoInforme(r.estado); return (
        <tr key={r.id} className="adm-tr">
          <td style={{...td,...tnum}}>{r.num_referencia||"—"}</td><td style={td}>{r.perito}</td>
          <td style={td}>{r.compania||"—"}</td><td style={td}>{r.garantia||"—"}</td>
          <td style={td}><Badge tone={tone}>{t}</Badge></td>
          <td style={{...td,color:C.muted}}>{fecha(r.created_at)}</td><td style={{...td,color:C.muted}}>{relativo(r.updated_at)}</td>
        </tr>); })}
    </Tabla>
  );

  const [pFiltro,setPFiltro] = useState("Todos");
  const [pBusca,setPBusca] = useState("");
  const vPeritos = () => {
    const filtros = ["Todos","De pago","Sin plan","Requieren atención","Bloqueados"];
    const q = pBusca.trim().toLowerCase();
    const list = data.peritos.filter(p=>{
      if(q && !(`${p.nombre} ${p.email}`.toLowerCase().includes(q))) return false;
      if(pFiltro==="De pago") return +p.cuota_mensual>0 && !p.bloqueado;
      if(pFiltro==="Sin plan") return p.plan==="Sin plan";
      if(pFiltro==="Bloqueados") return p.bloqueado;
      if(pFiltro==="Requieren atención") return ["orange"].includes(estadoPerito(p)[1]) || (+p.cuota_mensual>0 && usd2eur(p.coste_ia_mes_usd)>+p.cuota_mensual);
      return true;
    });
    const altasMes = data.peritos.filter(p=>new Date(p.alta)>=new Date(new Date().getFullYear(),new Date().getMonth(),1)).length;
    return (
      <>
        <Head eyebrow="Clientes" title="Peritos"/>
        <div className="adm-kpis" style={{marginBottom:16}}>
          <Kpi l="Registrados" v={data.peritos.length} d={`${data.peritos.filter(p=>p.bloqueado).length} bloqueados`}/>
          <Kpi l="Activos 7 días" v={k.activos7} d="Han entrado esta semana"/>
          <Kpi l="De pago" v={k.dePago} d={`${num(k.recurrente)} €/mes en cuotas`}/>
          <Kpi l="Altas este mes" v={altasMes} d="Nuevos registros"/>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12,alignItems:"center"}}>
          {filtros.map(f=><button key={f} onClick={()=>setPFiltro(f)} style={{border:`1px solid ${pFiltro===f?C.ink:C.border}`,
            background:pFiltro===f?C.ink:C.white,color:pFiltro===f?"#fff":C.ink,borderRadius:20,padding:"5px 12px",fontSize:13.5,cursor:"pointer",fontFamily:"inherit"}}>{f}</button>)}
          <div style={{flex:1}}/>
          <div style={{position:"relative",width:260,maxWidth:"100%"}}>
            <Search size={14} style={{position:"absolute",left:10,top:11,color:C.muted}}/>
            <input id="adm-busca-perito" value={pBusca} onChange={e=>setPBusca(e.target.value)} placeholder="Buscar por nombre o email" style={{...inp,paddingLeft:30}}/>
          </div>
        </div>
        {list.length===0 ? <div style={card}><Vacio>No hay peritos con este filtro.</Vacio></div> :
        <Tabla cols={[{l:"Perito"},{l:"Plan"},{l:"Estado"},{l:"Informes mes",r:1},{l:"Último informe"},{l:"Pagado total",r:1},{l:"Coste IA mes",r:1}]}>
          {list.map(p=>{ const [t,tone]=estadoPerito(p); return (
            <tr key={p.user_id} className="adm-tr" style={{cursor:"pointer"}} tabIndex={0}
              onClick={()=>setFicha(p.user_id)} onKeyDown={e=>{if(e.key==="Enter")setFicha(p.user_id);}}>
              <td style={td}><div style={{fontWeight:600}}>{p.nombre||p.email}</div>{p.nombre&&<div style={{fontSize:12.5,color:C.muted}}>{p.email}</div>}</td>
              <td style={td}>{p.plan}{+p.cuota_mensual>0&&<div style={{fontSize:12.5,color:C.muted}}>{eur(p.cuota_mensual)}/mes</div>}</td>
              <td style={td}><Badge tone={tone}>{t}</Badge></td>
              <td style={{...td,...tnum,textAlign:"right"}}>{p.informes_mes}</td>
              <td style={{...td,color:C.muted}}>{p.ultimo_informe?relativo(p.ultimo_informe):"Ninguno"}</td>
              <td style={{...td,...tnum,textAlign:"right"}}>{eur(p.pagado_total)}</td>
              <td style={{...td,...tnum,textAlign:"right"}}>{eur(usd2eur(p.coste_ia_mes_usd))}</td>
            </tr>); })}
        </Tabla>}
      </>
    );
  };

  const [iFiltro,setIFiltro] = useState("Todos");
  const [iBusca,setIBusca] = useState("");
  const vInformes = () => {
    const q = iBusca.trim().toLowerCase();
    const rows = data.informes.filter(r=>{
      if(q && !(`${r.num_referencia} ${r.perito} ${r.garantia}`.toLowerCase().includes(q))) return false;
      return iFiltro==="Todos" || estadoInforme(r.estado)[0]===iFiltro;
    });
    const inicioMes = new Date(new Date().getFullYear(),new Date().getMonth(),1);
    const mes = data.informes.filter(r=>new Date(r.created_at)>=inicioMes);
    return (
      <>
        <Head eyebrow="Clientes" title="Informes"/>
        <div className="adm-kpis" style={{marginBottom:16}}>
          <Kpi l="Este mes" v={k.informesMes} d={<Delta a={k.informesMes} b={k.informesAnt}/>}/>
          <Kpi l="Finalizados este mes" v={mes.filter(r=>r.estado==="exportado").length} d="Exportados a PDF o Word"/>
          <Kpi l="En curso este mes" v={mes.filter(r=>r.estado!=="exportado").length} d="Sin exportar todavía"/>
          <Kpi l="Coste IA por informe" v={k.informesMes?eur(k.costeMes/k.informesMes):"—"} d="Media del mes"/>
        </div>
        <Nota icon={Lock}>Solo ves la ficha general de cada informe. El contenido (datos del asegurado, fotos, valoración) es siempre privado para su perito.</Nota>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12,alignItems:"center"}}>
          {["Todos","En curso","Completado","Finalizado"].map(f=><button key={f} onClick={()=>setIFiltro(f)} style={{border:`1px solid ${iFiltro===f?C.ink:C.border}`,
            background:iFiltro===f?C.ink:C.white,color:iFiltro===f?"#fff":C.ink,borderRadius:20,padding:"5px 12px",fontSize:13.5,cursor:"pointer",fontFamily:"inherit"}}>{f}</button>)}
          <div style={{flex:1}}/>
          <div style={{position:"relative",width:260,maxWidth:"100%"}}>
            <Search size={14} style={{position:"absolute",left:10,top:11,color:C.muted}}/>
            <input id="adm-busca-informe" value={iBusca} onChange={e=>setIBusca(e.target.value)} placeholder="Referencia, perito o garantía" style={{...inp,paddingLeft:30}}/>
          </div>
        </div>
        {rows.length===0 ? <div style={card}><Vacio>No hay informes con este filtro.</Vacio></div> : tablaInformes(rows)}
        {data.informes.length>=300 && <div style={{fontSize:13,color:C.muted,marginTop:8}}>Se muestran los 300 más recientes.</div>}
      </>
    );
  };

  const vIngresos = () => (
    <>
      <Head eyebrow="Negocio" title="Ingresos" right={<Btn primary onClick={()=>setModalCobro({})}><Plus size={14}/>Registrar cobro</Btn>}/>
      <div style={{display:"flex",gap:14,alignItems:"center",background:C.planoLight,border:"1px solid #C9DDE0",color:C.plano,borderRadius:10,padding:"14px 16px",marginBottom:16,flexWrap:"wrap"}}>
        <CreditCard size={20}/>
        <div style={{flex:1,minWidth:220}}>
          <div style={{fontWeight:600}}>Por ahora los cobros se apuntan a mano</div>
          <div style={{fontSize:14}}>Registra aquí las transferencias y los Bizum. Cuando llegue la Fase 2 con Stripe, los pagos con tarjeta y las renovaciones aparecerán solos.</div>
        </div>
      </div>
      <div className="adm-kpis" style={{marginBottom:16}}>
        <Kpi hl l="Cobrado este mes" v={eur(k.ingresosMes)} d={<Delta a={k.ingresosMes} b={k.ingresosAnt}/>}/>
        <Kpi l="Recurrente" v={`${num(k.recurrente)} €/mes`} d={`${k.dePago} peritos con cuota`}/>
        <Kpi l="Pendiente de cobro" v={eur(k.pendienteImporte)} d={k.pendientes.length?<span style={{color:C.red,fontWeight:600}}>{k.pendientes.length} cobro{k.pendientes.length!==1?"s":""} pendiente{k.pendientes.length!==1?"s":""}</span>:"Nada pendiente"}/>
        <Kpi l={`Cobrado en ${new Date().getFullYear()}`} v={eur(k.cobradoAnio)} d="Desde el 1 de enero"/>
      </div>
      {data.cobros.length===0 ? <div style={card}><Vacio>Aún no has registrado ningún cobro. Usa «Registrar cobro» para apuntar el primero.</Vacio></div> :
      <Tabla cols={[{l:"Fecha"},{l:"Perito"},{l:"Concepto"},{l:"Método"},{l:"Estado"},{l:"Importe",r:1},{l:""}]}>
        {data.cobros.map(c=>{ const p=data.peritos.find(x=>x.user_id===c.user_id); return (
          <tr key={c.id} className="adm-tr">
            <td style={{...td,...tnum,fontWeight:500}}>{fecha(c.fecha)}</td>
            <td style={td}>{p?nombreDe(p):<span style={{color:C.muted}}>Perito eliminado</span>}</td>
            <td style={td}>{c.concepto}</td><td style={{...td,color:C.muted}}>{c.metodo}</td>
            <td style={td}><Badge tone={c.estado==="pagado"?"green":"red"}>{c.estado==="pagado"?"Pagado":"Pendiente"}</Badge></td>
            <td style={{...td,...tnum,textAlign:"right"}}>{eur(c.importe)}</td>
            <td style={{...td,textAlign:"right"}}><AccionesCobro c={c} ctx={ctx}/></td>
          </tr>); })}
      </Tabla>}
    </>
  );

  const vCostes = () => {
    const secs = data.secciones.map(s=>({l:SECCIONES_IA[s.seccion]||s.seccion, v:usd2eur(s.coste_usd), n:+s.llamadas}));
    const maxS = Math.max(0,...secs.map(s=>s.v));
    const lectura = secs.filter(s=>s.l.startsWith("Lectura")).reduce((a,s)=>a+s.v,0);
    const porPerito = data.peritos.filter(p=>+p.coste_ia_mes_usd>0 || +p.cuota_mensual>0).map(p=>{
      const coste=usd2eur(p.coste_ia_mes_usd), cuota=+p.cuota_mensual||0;
      return {p, coste, cuota, margen: cuota? (cuota-coste)/cuota : null};
    }).sort((a,b)=>(a.margen??9)-(b.margen??9)); // peor margen primero; sin cuota al final
    return (
      <>
        <Head eyebrow="Negocio" title="Costes y margen"/>
        <div className="adm-kpis" style={{marginBottom:16}}>
          <Kpi l="Ingresos del mes" v={eur(k.ingresosMes)} d="Cobrado"/>
          <Kpi l="Coste de IA" v={eur(k.costeMes)} d={`${k.informesMes} informes este mes`}/>
          <Kpi l="Costes fijos" v="0,00 €" d="Vercel y Supabase en plan gratuito"/>
          <Kpi hl l="Margen" v={eur(k.margen)} d={k.ingresosMes?`${Math.round(k.margen/k.ingresosMes*100)}% de lo ingresado`:"Ingresos menos costes"}/>
        </div>
        <div className="adm-g2e">
          <div style={card}>
            <h2 style={{fontSize:18,fontWeight:600,marginBottom:12}}>¿En qué se gasta la IA este mes?</h2>
            {secs.length===0 ? <Vacio>Todavía no hay consumo registrado este mes.</Vacio> :
              secs.map(s=><Bar key={s.l} label={s.l} value={s.v} max={maxS} right={eur(s.v)}/>)}
            {secs.length>0 && k.costeMes>0 && <div style={{marginTop:12}}><Nota>Leer los PDF de encargo y póliza supone el {Math.round(lectura/k.costeMes*100)}% del gasto.</Nota></div>}
          </div>
          <div style={card}>
            <h2 style={{fontSize:18,fontWeight:600,marginBottom:12}}>Margen por perito este mes <span style={{fontSize:13,fontWeight:500,color:C.muted}}>· de peor a mejor</span></h2>
            {porPerito.length===0 ? <Vacio>Sin datos todavía.</Vacio> :
            <Tabla flush cols={[{l:"Perito"},{l:"Cuota",r:1},{l:"Coste IA",r:1},{l:"Margen",r:1}]}>
              {porPerito.slice(0,10).map(({p,coste,cuota,margen})=>(
                <tr key={p.user_id} className="adm-tr" style={{cursor:"pointer"}} onClick={()=>setFicha(p.user_id)}>
                  <td style={td}>{nombreDe(p)}<div style={{fontSize:12.5,color:C.muted}}>{p.informes_mes} informes · {p.plan}</div></td>
                  <td style={{...td,...tnum,textAlign:"right"}}>{eur(cuota)}</td>
                  <td style={{...td,...tnum,textAlign:"right"}}>{eur(coste)}</td>
                  <td style={{...td,textAlign:"right"}}>{margen===null?<Badge>Sin cuota</Badge>:<Badge tone={margen<0?"red":margen<.75?"orange":"green"}>{Math.round(margen*100)}%</Badge>}</td>
                </tr>))}
            </Tabla>}
          </div>
        </div>
        <div style={{marginTop:14}}><Nota>El coste de IA se factura en dólares; aquí se muestra en euros con un cambio aproximado de {String(USD_EUR).replace(".",",")} €/$. Registrado desde que se activó el panel.</Nota></div>
      </>
    );
  };

  const vAjustes = () => (
    <>
      <Head eyebrow="Producto" title="Ajustes"/>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={card}>
          <h2 style={{fontSize:18,fontWeight:600,marginBottom:6}}>Seguridad y acceso</h2>
          {[["Uso de la IA protegido","Solo peritos con sesión iniciada y sin bloquear pueden usar la IA.",<Badge tone="green">Activo</Badge>],
            ["Administradores","Tú. Se añaden solo desde Supabase (tabla admins), nunca desde la app.",<Badge>Solo Supabase</Badge>],
            ["Bloqueo de peritos","Desde la ficha de cada perito. Un perito bloqueado no puede entrar ni usar la IA.",<Badge tone="green">Activo</Badge>],
          ].map(([t,s,b],i)=>(
            <div key={i} style={{display:"flex",gap:16,alignItems:"center",padding:"14px 0",borderTop:i?`1px solid ${C.border}`:"none",flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:220}}><div style={{fontWeight:600}}>{t}</div><div style={{fontSize:13.5,color:C.muted}}>{s}</div></div>{b}
            </div>))}
        </div>
        <div style={{...card,background:"transparent",borderStyle:"dashed"}}>
          <h2 style={{fontSize:18,fontWeight:600,marginBottom:6}}>Próximamente</h2>
          <div style={{fontSize:14.5,color:C.muted}}>Registro de peritos (libre, con aprobación o solo por invitación), compañías y baremos editables y avisos por correo llegarán en las próximas fases.</div>
        </div>
      </div>
    </>
  );

  const vProx = ({titulo,fase,texto}) => (
    <>
      <Head eyebrow="Producto" title={titulo}/>
      <div style={{...card,textAlign:"center",padding:"48px 20px"}}>
        <Badge tone="plano">{fase}</Badge>
        <div style={{fontSize:15,color:C.muted,marginTop:12,maxWidth:520,marginInline:"auto"}}>{texto}</div>
      </div>
    </>
  );

  const ctx = {C, ui, data, ficha, user, modalCobro, guardarCuenta, guardarCobro, marcarPagado, borrarCobro,
    aviso, setFicha, setModalCobro, estadoPerito};

  // ── Navegación ──────────────────────────────────────────────────────────────
  const NAV = [
    {g:"Negocio", items:[["inicio","Inicio",LayoutDashboard],["ingresos","Ingresos",Wallet],["costes","Costes y margen",Scale],["analiticas","Analíticas",LineChart]]},
    {g:"Clientes", items:[["peritos","Peritos",Users],["informes","Informes",FileText]]},
    {g:"Producto", items:[["planes","Planes",Tags],["ajustes","Ajustes",Settings]]},
  ];
  const nAlertas = alertas.length;

  let vista = null;
  if(data && k){
    vista = ({inicio:vInicio, peritos:vPeritos, informes:vInformes, ingresos:vIngresos, costes:vCostes, ajustes:vAjustes,
      planes:()=>vProx({titulo:"Planes", fase:"Fase 2 · con Stripe", texto:"Aquí definirás los planes y sus precios, y la app aplicará sola los límites de cada uno. Mientras tanto, asigna a cada perito su plan y su cuota desde su ficha."}),
      analiticas:()=>vProx({titulo:"Analíticas", fase:"Fase 3", texto:"Conversión de prueba a pago, tiempo por sección e informes por garantía y compañía. Los datos ya se están registrando desde hoy."}),
    }[sec]||vInicio)();
  }

  return (
    <div className="adm-shell" style={{background:C.bg,color:C.ink,fontFamily:"'DM Sans',sans-serif",fontSize:15}}>
      <style>{css}</style>
      <aside className="adm-sb" style={{background:C.sidebar,color:"#fff"}}>
        <div style={{padding:"16px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <Logo/>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",padding:"3px 8px",borderRadius:20,background:"rgba(193,73,78,.2)",color:"#F3B7B9"}}>Admin</span>
        </div>
        <nav className="adm-nav" aria-label="Secciones del panel">
          {NAV.map(({g,items})=>[
            <div key={g} className="adm-nav-l">{g}</div>,
            ...items.map(([id,l,Icon])=>(
              <button key={id} onClick={()=>setSec(id)} style={{border:"none",display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:6,width:"100%",
                fontSize:14.5,fontFamily:"inherit",cursor:"pointer",textAlign:"left",
                background:sec===id?"rgba(255,255,255,.1)":"transparent",color:sec===id?"#fff":"rgba(255,255,255,.72)",fontWeight:sec===id?600:500}}>
                <Icon size={16}/>{l}
                {id==="inicio"&&nAlertas>0&&<span style={{marginLeft:"auto",fontSize:11,fontWeight:700,background:C.accent,color:"#fff",borderRadius:20,padding:"1px 7px"}}>{nAlertas}</span>}
                {(id==="planes"||id==="analiticas")&&<span style={{marginLeft:"auto",fontSize:10.5,color:"rgba(255,255,255,.4)"}}>Pronto</span>}
              </button>))
          ])}
        </nav>
        <div className="adm-sb-foot" style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
          <button onClick={onExit} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",color:"rgba(255,255,255,.75)",cursor:"pointer",fontFamily:"inherit",fontSize:14,padding:0}}>
            <ArrowLeft size={14}/>Volver a mis encargos
          </button>
        </div>
      </aside>

      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
        <div style={{background:C.accent,color:"#fff",padding:"10px 28px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <span style={{fontSize:14,opacity:.85}}>PERIT.IA · Panel de administración</span>
          <div style={{flex:1}}/>
          <button onClick={cargar} disabled={loading} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:6,padding:"5px 12px",color:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
            <RefreshCw size={13} style={loading?{animation:"spin 1s linear infinite"}:{}}/>Actualizar
          </button>
          <button onClick={onExit} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:6,padding:"5px 12px",color:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
            <ArrowLeft size={13}/>Mis encargos
          </button>
        </div>
        <main className="adm-content">
          {err ? <div style={{...card,display:"flex",gap:12,alignItems:"flex-start",borderColor:"#FECACA",background:C.redBg,color:C.red}}>
              <AlertTriangle size={18} style={{flexShrink:0,marginTop:2}}/><div><div style={{fontWeight:600,marginBottom:4}}>No se puede mostrar el panel</div><div style={{fontSize:14.5}}>{err}</div>
              <div style={{marginTop:10}}><Btn sm onClick={cargar}>Reintentar</Btn></div></div></div>
            : !data ? <div style={{display:"flex",gap:10,alignItems:"center",color:C.muted,padding:40,justifyContent:"center"}}><Loader2 size={18} style={{animation:"spin 1s linear infinite",color:C.accent}}/>Cargando datos…</div>
            : vista}
        </main>
      </div>

      {ficha && data && <Ficha key={ficha} ctx={ctx}/>}
      {modalCobro && data && <ModalCobro ctx={ctx}/>}
      {toast && <div role="status" style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:C.ink,color:"#fff",padding:"10px 18px",borderRadius:9,fontSize:14.5,zIndex:80,boxShadow:"0 12px 32px rgba(27,36,48,.13)"}}>{toast}</div>}
    </div>
  );
}
