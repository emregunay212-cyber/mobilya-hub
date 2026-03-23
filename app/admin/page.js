"use client";
import { useState, useEffect } from "react";

const THEMES = [
  { id:"classic-warm", name:"Klasik Sıcak", desc:"Kahverengi, geleneksel mobilya", c:["#2C2420","#C8553D","#D4A03C","#FAF8F5"], tags:["Geleneksel","Sıcak"], p:{n:"#2C2420",b:"#FAF8F5",a:"#C8553D",g:"#D4A03C",t:"#2C2420",m:"#6B5B4E",d:"#E8DDD0"} },
  { id:"navy-gold", name:"Navy Premium", desc:"Lacivert + altın, lüks düğün", c:["#1B2A4A","#C9A55C","#B8464B","#FFFDF8"], tags:["Premium","Lüks"], p:{n:"#1B2A4A",b:"#FFFDF8",a:"#C9A55C",g:"#C9A55C",t:"#1B2A4A",m:"#7A7062",d:"#E5DDD0"} },
  { id:"modern-minimal", name:"Modern Minimal", desc:"Siyah-beyaz, temiz şık", c:["#111","#FF4D4D","#333","#FAFAFA"], tags:["Modern","Minimal"], p:{n:"#111",b:"#FAFAFA",a:"#FF4D4D",g:"#FF4D4D",t:"#111",m:"#777",d:"#E5E5E5"} },
  { id:"forest-natural", name:"Doğal Orman", desc:"Yeşil, organik doğal his", c:["#2D4A2B","#6B8F3C","#B8A44C","#F8FAF5"], tags:["Doğal","Eko"], p:{n:"#2D4A2B",b:"#F8FAF5",a:"#6B8F3C",g:"#B8A44C",t:"#2D3B2A",m:"#6B7A62",d:"#D8E5D0"} },
  { id:"cream-elegant", name:"Krem Elegant", desc:"Krem bordo, sofistike", c:["#5C1A33","#8B3A5C","#C4956A","#FDF9F4"], tags:["Elegant","Sofistike"], p:{n:"#5C1A33",b:"#FDF9F4",a:"#8B3A5C",g:"#C4956A",t:"#3A2030",m:"#8A7A70",d:"#E8DDD5"} },
];

const CAT_P = {
  mobilya:["Koltuk Takımları","Yatak Odası","Yemek Odası","TV Ünitesi","Genç Odası","Mutfak"],
  dugun:["Düğün Paketi","Yatak Odası","Koltuk Takımları","Yemek Odası","Halı & Perde","Avize"],
  dekorasyon:["Halı","Perde","Aydınlatma","Ev Tekstili","Dekoratif Obje","Duvar Sanatı"],
};

function slugify(t){return t.toLowerCase().replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}

const STEPS=["Tasarım","Bilgiler","Kategoriler","Oluştur"];

export default function AdminPage(){
  const [view,setView]=useState("list"); // list | wizard | done
  const [stores,setStores]=useState([]);
  const [loading,setLoading]=useState(true);
  const [step,setStep]=useState(0);
  const [theme,setTheme]=useState(null);
  const [f,setF]=useState({name:"",phone:"",whatsapp:"",email:"",address:"",city:"Balıkesir",description:"",instagram:""});
  const [preset,setPreset]=useState("mobilya");
  const [cats,setCats]=useState([...CAT_P.mobilya]);
  const [newCat,setNewCat]=useState("");
  const [creating,setCreating]=useState(false);
  const [logs,setLogs]=useState([]);
  const [error,setError]=useState(null);
  const [result,setResult]=useState(null);

  const sl=slugify(f.name||"magaza");
  const th=THEMES.find(t=>t.id===theme);
  const canNext=step===0?!!theme:step===1?f.name.trim()&&f.phone.trim():step===2?cats.length>0:true;

  const log=m=>setLogs(p=>[...p,{t:new Date().toLocaleTimeString("tr-TR"),m}]);
  const doPreset=k=>{setPreset(k);if(CAT_P[k])setCats([...CAT_P[k]])};
  const addCat=()=>{if(newCat.trim()&&!cats.includes(newCat.trim())){setCats([...cats,newCat.trim()]);setNewCat("")}};
  const rmCat=i=>setCats(cats.filter((_,idx)=>idx!==i));

  // Load stores
  useEffect(()=>{loadStores()},[]);
  const loadStores=async()=>{
    setLoading(true);
    try{
      const res=await fetch("/api/admin/stores");
      const data=await res.json();
      setStores(Array.isArray(data)?data:[]);
    }catch(e){setStores([])}
    setLoading(false);
  };

  // Create store
  const createStore=async()=>{
    setCreating(true);setError(null);setLogs([]);
    try{
      log("Mağaza oluşturuluyor...");
      const res=await fetch("/api/admin/stores",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          name:f.name, slug:sl, phone:f.phone, whatsapp:f.whatsapp,
          email:f.email, address:f.address, city:f.city,
          description:f.description, instagram:f.instagram, theme,
          categories:cats.map((c,i)=>({name:c,slug:slugify(c),sort_order:i+1})),
        }),
      });
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||"Hata oluştu");
      log(`✓ Mağaza oluşturuldu: ${data.store.id.slice(0,8)}...`);
      log(`✓ ${cats.length} kategori eklendi`);
      log("✓ Tamamlandı!");
      setResult(data.store);
      setView("done");
      loadStores();
    }catch(e){
      setError(e.message);
      log(`✗ Hata: ${e.message}`);
    }
    setCreating(false);
  };

  const reset=()=>{
    setView("wizard");setStep(0);setTheme(null);setError(null);setLogs([]);setResult(null);
    setF({name:"",phone:"",whatsapp:"",email:"",address:"",city:"Balıkesir",description:"",instagram:""});
    setCats([...CAT_P.mobilya]);setPreset("mobilya");
  };

  const S={bg:"#0F1117",card:"#1A1D27",bdr:"#2A2D37",pri:"#6366F1",grn:"#10B981",red:"#EF4444",txt:"#E5E7EB",mut:"#9CA3AF",dim:"#4B5563"};

  // ─── DONE VIEW ───
  if(view==="done"&&result){
    return <Shell S={S}><div style={{maxWidth:600,margin:"0 auto",padding:"40px 20px",textAlign:"center"}}>
      <div style={{width:64,height:64,borderRadius:"50%",background:S.grn,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28,color:"#fff"}}>✓</div>
      <h1 style={{fontSize:24,fontWeight:700,marginBottom:6,color:"#fff"}}>{f.name} Oluşturuldu!</h1>
      <p style={{color:S.mut,fontSize:14,marginBottom:24}}>Supabase'e otomatik kaydedildi. Sıradaki adımlar aşağıda.</p>
      <Card S={S} title="Mağaza Bilgileri">
        {[["Mağaza",f.name],["URL","/"+sl],["Tema",th?.name],["Kategoriler",cats.join(", ")],["Store ID",result.id?.slice(0,16)+"..."]].map(([k,v])=><Row key={k} k={k} v={v} S={S}/>)}
      </Card>
      <Card S={S} title="İşlem Logu" mt={16}>
        {logs.map((l,i)=><p key={i} style={{fontSize:12,color:S.txt,lineHeight:1.8}}><span style={{color:S.dim,marginRight:8}}>{l.t}</span>{l.m}</p>)}
      </Card>
      <Card S={S} title="Sonraki Adımlar" mt={16} color={S.grn}>
        <p style={{fontSize:13,color:S.txt,lineHeight:2}}>
          1. Ürün eklemek için: <b style={{color:"#A5B4FC"}}>Mağaza listesinden ürün ekle</b><br/>
          2. Claude'a yaz: <b style={{color:"#A5B4FC"}}>"Vercel'e deploy et"</b><br/>
          3. Domain bağla
        </p>
      </Card>
      <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:28}}>
        <Btn onClick={()=>{setView("list");reset()}} bg={S.card} color="#fff">← Mağaza Listesi</Btn>
        <Btn onClick={reset} bg={S.pri}>+ Yeni Mağaza</Btn>
      </div>
    </div></Shell>;
  }

  // ─── LIST VIEW ───
  if(view==="list"){
    return <Shell S={S}><div style={{maxWidth:700,margin:"0 auto",padding:"24px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:"#fff"}}>Mağazalarım</h1>
          <p style={{fontSize:13,color:S.mut}}>{stores.length} mağaza kayıtlı</p>
        </div>
        <Btn onClick={()=>setView("wizard")} bg={S.pri}>+ Yeni Mağaza</Btn>
      </div>

      {loading?<p style={{color:S.mut,textAlign:"center",padding:40}}>Yükleniyor...</p>:
      stores.length===0?<div style={{textAlign:"center",padding:60,color:S.mut}}>
        <p style={{fontSize:40,marginBottom:12}}>🏪</p>
        <p style={{marginBottom:16}}>Henüz mağaza yok.</p>
        <Btn onClick={()=>setView("wizard")} bg={S.pri}>İlk Mağazayı Oluştur</Btn>
      </div>:
      <div style={{display:"grid",gap:12}}>
        {stores.map(s=>(
          <div key={s.id} style={{background:S.card,borderRadius:14,padding:16,border:`1px solid ${S.bdr}`,display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:44,height:44,borderRadius:10,background:s.settings?.theme?THEMES.find(t=>t.id===s.settings.theme)?.p?.n||S.pri:S.pri,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:18,flexShrink:0}}>
              {s.name?.[0]}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <h3 style={{fontSize:15,fontWeight:700,color:"#fff"}}>{s.name}</h3>
                <span style={{fontSize:10,padding:"2px 8px",borderRadius:5,background:s.is_active?S.grn:S.red,color:"#fff",fontWeight:600}}>
                  {s.is_active?"Aktif":"Pasif"}
                </span>
              </div>
              <p style={{fontSize:12,color:S.mut}}>/{s.slug} · {s.city} · {new Date(s.created_at).toLocaleDateString("tr-TR")}</p>
            </div>
            <div style={{fontSize:12,color:S.dim,textAlign:"right",flexShrink:0}}>
              <p>{s.categories?.[0]?.count||0} kategori</p>
              <p>{s.products?.[0]?.count||0} ürün</p>
            </div>
          </div>
        ))}
      </div>}
    </div></Shell>;
  }

  // ─── WIZARD VIEW ───
  return <Shell S={S}><div style={{maxWidth:640,margin:"0 auto",padding:"0 20px 40px"}}>
    {/* Progress */}
    <div style={{padding:"18px 0"}}>
      <div style={{display:"flex",gap:4}}>
        {STEPS.map((s,i)=>(
          <div key={i} style={{flex:1}}>
            <div style={{height:3,borderRadius:2,background:i<=step?S.pri:S.bdr,transition:"background .3s"}}/>
            <p style={{fontSize:10,marginTop:5,color:i<=step?"#A5B4FC":S.dim,fontWeight:i===step?700:400}}>{i+1}. {s}</p>
          </div>
        ))}
      </div>
    </div>

    {/* STEP 0 */}
    {step===0&&<div>
      <h2 style={{fontSize:20,fontWeight:700,color:"#fff",marginBottom:4}}>Tasarım Seçin</h2>
      <p style={{color:S.mut,fontSize:13,marginBottom:20}}>Mağazanın görsel temasını belirleyin.</p>
      <div style={{display:"grid",gap:12}}>
        {THEMES.map(t=>(
          <button key={t.id} onClick={()=>setTheme(t.id)} style={{display:"flex",gap:14,padding:14,borderRadius:14,border:theme===t.id?`2px solid ${S.pri}`:`2px solid ${S.bdr}`,background:theme===t.id?"#1A1D40":S.card,cursor:"pointer",textAlign:"left",alignItems:"center"}}>
            <div style={{width:72,minWidth:72,height:50,borderRadius:8,overflow:"hidden",border:"1px solid #333"}}>
              <div style={{background:t.p.n,height:10}}/>
              <div style={{background:t.p.b,height:40,padding:2,display:"grid",gridTemplateColumns:"1fr 1fr",gap:1}}>
                {[0,1,2,3].map(i=><div key={i} style={{background:t.p.d,borderRadius:1,opacity:.4}}/>)}
              </div>
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                <span style={{fontWeight:700,fontSize:14,color:"#fff"}}>{t.name}</span>
                {theme===t.id&&<span style={{fontSize:9,background:S.pri,color:"#fff",padding:"2px 7px",borderRadius:5,fontWeight:700}}>SEÇİLDİ</span>}
              </div>
              <p style={{fontSize:11,color:S.mut,marginBottom:3}}>{t.desc}</p>
              <div style={{display:"flex",gap:3}}>{t.c.map((c,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:c,border:"1px solid #444"}}/>)}</div>
            </div>
          </button>
        ))}
      </div>
    </div>}

    {/* STEP 1 */}
    {step===1&&<div>
      <h2 style={{fontSize:20,fontWeight:700,color:"#fff",marginBottom:4}}>Mağaza Bilgileri</h2>
      <p style={{color:S.mut,fontSize:13,marginBottom:20}}>* zorunlu alanlar</p>
      <div style={{display:"grid",gap:12}}>
        <Field label="Mağaza Adı *" value={f.name} onChange={v=>setF({...f,name:v})} placeholder="örn: Kurtdereli Mobilya" hint={f.name?`URL: /${sl}`:null} S={S}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Telefon *" value={f.phone} onChange={v=>setF({...f,phone:v})} placeholder="0266 XXX XX XX" S={S}/>
          <Field label="WhatsApp" value={f.whatsapp} onChange={v=>setF({...f,whatsapp:v})} placeholder="905XXXXXXXXX" S={S}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="E-posta" value={f.email} onChange={v=>setF({...f,email:v})} placeholder="info@magaza.com" S={S}/>
          <Field label="Instagram" value={f.instagram} onChange={v=>setF({...f,instagram:v})} placeholder="kullaniciadi" S={S}/>
        </div>
        <Field label="Adres" value={f.address} onChange={v=>setF({...f,address:v})} placeholder="Milli Kuvvetler Cad. No:42" S={S}/>
        <Field label="Şehir" value={f.city} onChange={v=>setF({...f,city:v})} S={S}/>
        <Field label="Açıklama" value={f.description} onChange={v=>setF({...f,description:v})} placeholder="Mağaza hakkında..." textarea S={S}/>
      </div>
    </div>}

    {/* STEP 2 */}
    {step===2&&<div>
      <h2 style={{fontSize:20,fontWeight:700,color:"#fff",marginBottom:4}}>Kategoriler</h2>
      <p style={{color:S.mut,fontSize:13,marginBottom:16}}>Hazır şablondan seçin veya özel ekleyin.</p>
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {[["mobilya","🛋️ Mobilya"],["dugun","💍 Düğün"],["dekorasyon","🏠 Dekorasyon"]].map(([k,l])=>(
          <button key={k} onClick={()=>doPreset(k)} style={{padding:"7px 14px",borderRadius:10,fontSize:12,fontWeight:600,border:preset===k?`1.5px solid ${S.pri}`:`1.5px solid ${S.bdr}`,background:preset===k?"#1A1D40":S.card,color:preset===k?"#A5B4FC":S.mut,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
        {cats.map((c,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:5,background:S.card,border:`1px solid ${S.bdr}`,borderRadius:8,padding:"5px 10px"}}>
            <span style={{fontSize:12,fontWeight:500,color:"#fff"}}>{c}</span>
            <button onClick={()=>rmCat(i)} style={{background:"none",border:"none",color:S.red,cursor:"pointer",fontSize:13,padding:0}}>✕</button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <input className="ip" placeholder="Yeni kategori..." value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCat()} style={{flex:1}}/>
        <Btn onClick={addCat} bg={S.pri}>Ekle</Btn>
      </div>
    </div>}

    {/* STEP 3 */}
    {step===3&&th&&<div>
      <h2 style={{fontSize:20,fontWeight:700,color:"#fff",marginBottom:4}}>Önizleme & Oluştur</h2>
      <p style={{color:S.mut,fontSize:13,marginBottom:20}}>"Oluştur" butonuna basın — Supabase'e otomatik kaydedilecek.</p>
      
      {/* Preview */}
      <div style={{borderRadius:14,overflow:"hidden",border:`1px solid ${S.bdr}`,marginBottom:20}}>
        <div style={{background:th.p.n,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:24,height:24,borderRadius:6,background:th.p.g,display:"flex",alignItems:"center",justifyContent:"center",color:th.p.n,fontWeight:800,fontSize:11}}>{f.name?.[0]||"M"}</div>
            <span style={{color:"#fff",fontWeight:700,fontSize:12}}>{f.name}</span>
          </div>
          <span style={{fontSize:14}}>🛒</span>
        </div>
        <div style={{background:th.p.b,padding:14}}>
          <p style={{fontSize:9,fontWeight:700,letterSpacing:3,color:th.p.a,textTransform:"uppercase",marginBottom:3}}>✦ {f.city}</p>
          <h3 style={{fontSize:18,fontWeight:700,color:th.p.t,marginBottom:6}}>{f.name}</h3>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
            {cats.slice(0,4).map(c=><span key={c} style={{padding:"3px 8px",borderRadius:6,fontSize:9,border:`1px solid ${th.p.d}`,color:th.p.m,fontWeight:600}}>{c}</span>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {[0,1,2].map(i=><div key={i} style={{background:"#fff",borderRadius:8,border:`1px solid ${th.p.d}`,overflow:"hidden"}}><div style={{height:32,background:th.p.d,opacity:.25,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14}}>🛋️</span></div><div style={{padding:4}}><div style={{height:4,background:th.p.d,borderRadius:2,width:"60%",marginBottom:2}}/><div style={{height:5,background:th.p.a,borderRadius:2,width:"35%",opacity:.6}}/></div></div>)}
          </div>
        </div>
      </div>

      <Card S={S} title="Özet">
        {[["Mağaza",f.name],["URL","/"+sl],["Tema",th.name],["Telefon",f.phone],["Şehir",f.city],["Kategoriler",cats.join(", ")]].map(([k,v])=><Row key={k} k={k} v={v} S={S}/>)}
      </Card>

      {creating&&<Card S={S} title="İşlem Logu" mt={16}>
        {logs.map((l,i)=><p key={i} style={{fontSize:12,color:S.txt,lineHeight:1.8}}><span style={{color:S.dim,marginRight:8}}>{l.t}</span>{l.m}</p>)}
        <p style={{color:"#818CF8",fontSize:12,marginTop:4}}><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span> Devam ediyor...</p>
      </Card>}

      {error&&<div style={{background:"#2D1B1B",borderRadius:12,padding:14,border:"1px solid #7F1D1D",marginTop:16,fontSize:13,color:"#FCA5A5"}}>{error}</div>}
    </div>}

    {/* NAV */}
    <div style={{display:"flex",justifyContent:"space-between",marginTop:24}}>
      <Btn onClick={()=>{if(step===0)setView("list");else setStep(step-1)}} bg="transparent" border={S.bdr} color={step===0?S.dim:S.txt}>
        {step===0?"← Liste":"← Geri"}
      </Btn>
      {step<3?
        <Btn onClick={()=>canNext&&setStep(step+1)} bg={canNext?S.pri:S.bdr} color={canNext?"#fff":S.dim} disabled={!canNext}>İleri →</Btn>
      :
        <Btn onClick={createStore} bg={creating?S.dim:S.grn} disabled={creating}>
          {creating?"Oluşturuluyor...":"⚡ Otomatik Oluştur"}
        </Btn>
      }
    </div>
  </div></Shell>;
}

// ─── COMPONENTS ───
function Shell({S,children}){
  return <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:S.bg,minHeight:"100vh",color:"#fff"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
      .ip{width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid #2A2D37;background:#1A1D27;color:#fff;font-size:14px;outline:none;transition:border-color .2s;font-family:'DM Sans',sans-serif;box-sizing:border-box}
      .ip:focus{border-color:#6366F1}.ip::placeholder{color:#4B5563}
      @keyframes spin{to{transform:rotate(360deg)}}
    `}</style>
    <div style={{borderBottom:"1px solid #1E2130",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:30,height:30,borderRadius:8,background:"#6366F1",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13}}>W</div>
        <span style={{fontWeight:700,fontSize:14}}>WEBKODA Admin</span>
      </div>
      <span style={{fontSize:11,color:"#10B981",fontWeight:600}}>● Supabase Bağlı</span>
    </div>
    {children}
  </div>;
}

function Card({S,title,children,mt=0,color=null}){
  return <div style={{background:S.card,borderRadius:14,padding:18,border:`1px solid ${S.bdr}`,marginTop:mt}}>
    <h3 style={{fontSize:11,fontWeight:700,color:color||"#818CF8",letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>{title}</h3>
    {children}
  </div>;
}

function Row({k,v,S}){
  return <div style={{display:"flex",gap:8,fontSize:13,marginBottom:4}}>
    <span style={{color:S.dim,minWidth:80}}>{k}:</span>
    <span style={{color:S.txt,fontWeight:500}}>{v}</span>
  </div>;
}

function Btn({onClick,bg,color="#fff",border,disabled,children}){
  return <button onClick={disabled?undefined:onClick} disabled={disabled} style={{padding:"11px 24px",borderRadius:12,background:bg,color,border:border?`1.5px solid ${border}`:"none",fontSize:13,fontWeight:700,cursor:disabled?"default":"pointer",transition:"opacity .2s",opacity:disabled?.5:1}}>{children}</button>;
}

function Field({label,value,onChange,placeholder,hint,textarea,S}){
  const Tag=textarea?"textarea":"input";
  return <div>
    <label style={{fontSize:11,fontWeight:600,color:"#D1D5DB",marginBottom:3,display:"block"}}>{label}</label>
    <Tag className="ip" placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} {...(textarea?{rows:3}:{})}/>
    {hint&&<p style={{fontSize:10,color:"#818CF8",marginTop:3}}>{hint}</p>}
  </div>;
}
