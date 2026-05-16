import { useState, useEffect, useRef } from "react";
import Login from "./Login";
import PaymentPlease from "./PaymentPlease";
import TrialBanner from "./TrialBanner";
import { billingAPI, getToken, clearAuth } from "./api";
import { resumeCheckoutAfterLogin, startSubscriptionCheckout } from "./billingCheckout";
/* ══════════════════════════════════════════════════════════════════
   RetailPRO SaaS — ULTIMATE COMPLETE EDITION
   ✅ Onboarding (Business + Owner setup)
   ✅ POS (Retail + Wholesale, GST bills, Credit)
   ✅ Products (Manual + Excel + Google Sheets + Bill Photo AI)
   ✅ QR Codes (per product, scan→stock update)
   ✅ Suppliers + Purchase tracking
   ✅ Customers (auto-save, ledger, history)
   ✅ Employees (attendance, salary tracker, commission)
   ✅ Cash Flow (Sales - Purchases - Expenses - P&L)
   ✅ Credit Ledger (customer credit + wholesaler credit)
   ✅ GST Bills (CGST + SGST breakdown, printable)
   ✅ Analytics (Daily / Monthly / Yearly)
   ✅ Stock Log + Low stock alerts
   Storage: localStorage (swap DB.get/set for Firebase/Supabase)
══════════════════════════════════════════════════════════════════ */

// ── UTILS ─────────────────────────────────────────────────────────
const fmt    = n => `₹${Number(n||0).toLocaleString("en-IN")}`;
const uid    = () => `${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2,5).toUpperCase()}`;
const todayK = () => new Date().toISOString().slice(0,10);
const monthK = () => new Date().toISOString().slice(0,7);
const nowStr = () => new Date().toLocaleString("en-IN",{hour12:true,day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
const QR_URL = (data,size=160) => `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&color=00E5A0&bgcolor=04060E`;
const QR_DAT = p => `RPPROD|${p.id}|${p.name}|${p.barcode||""}|R:${p.retailPrice}|W:${p.wholesalePrice}|U:${p.unit}`;

// ── STORAGE ────────────────────────────────────────────────────────
const DB = {
  get:(k,d)=>{ try{const v=localStorage.getItem(`rp_${k}`);return v?JSON.parse(v):d;}catch{return d;} },
  set:(k,v)=>{ try{localStorage.setItem(`rp_${k}`,JSON.stringify(v));}catch{} },
};

// ── DESIGN TOKENS ─────────────────────────────────────────────────
const C={
  bg:"#04060E", card:"#090E1C", card2:"#0D1428",
  border:"#131B32", border2:"#1C2840",
  text:"#C8D4FF", muted:"#374875", dim:"#0A1020",
  green:"#00E5A0", blue:"#3B82F6", purple:"#8B5CF6",
  orange:"#F97316", red:"#EF4444", yellow:"#FBBF24", cyan:"#22D3EE",
};

// ── CONSTANTS ─────────────────────────────────────────────────────
const CATS   = ["All","Grocery","Dairy","Snacks","Home","Personal","Beverages","Electronics","Medicines","Hardware","Clothing","Other"];
const PCATS  = ["Grocery","Dairy","Snacks","Home","Personal","Beverages","Electronics","Medicines","Hardware","Clothing","Other"];
const EMOJIS = ["📦","🌾","🫘","🧈","🍪","🧺","🍜","🧼","🦷","🥛","🥔","🍫","🧃","🥤","🍞","🧹","💊","📱","🔧","🎁","🧴","🫙","🥫","🧆","🫒","🧇","🫐","🍎","🥩","🌽","🧅","🥜","🫚","🧂","☕","🍵","🎂","🥐","🧁","🍕"];
const GST_RATES    = [0,5,12,18,28];
const PAY_METHODS  = ["Cash","UPI","Card","Credit","Cheque"];
const EMP_ROLES    = ["Manager","Cashier","Sales Executive","Delivery Boy","Storekeeper","Helper"];
const SUP_TYPES    = ["Wholesaler","Manufacturer","Distributor","Importer","Direct Farm"];
const BIZ_TYPES    = ["Retail Shop","Wholesale","Supermarket","Medical Store","Electronics","Clothing","Hardware","Restaurant","Bakery","Pharmacy","Other"];

// ── SEED DATA ─────────────────────────────────────────────────────
const SEED_PRODUCTS=[
  {id:"p1",name:"Basmati Rice",unit:"5kg",retailPrice:349,wholesalePrice:290,minWholesaleQty:10,category:"Grocery",stock:45,emoji:"🌾",barcode:"8901001",supplierId:"s1",hsn:"1006",gstRate:5,costPrice:250,reorderLevel:10},
  {id:"p2",name:"Toor Dal",unit:"1kg",retailPrice:145,wholesalePrice:118,minWholesaleQty:20,category:"Grocery",stock:32,emoji:"🫘",barcode:"8901002",supplierId:"s1",hsn:"0713",gstRate:5,costPrice:100,reorderLevel:15},
  {id:"p3",name:"Amul Butter",unit:"500g",retailPrice:260,wholesalePrice:220,minWholesaleQty:12,category:"Dairy",stock:18,emoji:"🧈",barcode:"8901003",supplierId:"s2",hsn:"0405",gstRate:12,costPrice:200,reorderLevel:8},
  {id:"p4",name:"Parle-G",unit:"800g",retailPrice:85,wholesalePrice:68,minWholesaleQty:24,category:"Snacks",stock:60,emoji:"🍪",barcode:"8901004",supplierId:"s3",hsn:"1905",gstRate:18,costPrice:55,reorderLevel:20},
  {id:"p5",name:"Surf Excel",unit:"1kg",retailPrice:195,wholesalePrice:158,minWholesaleQty:12,category:"Home",stock:28,emoji:"🧺",barcode:"8901005",supplierId:"s2",hsn:"3401",gstRate:18,costPrice:130,reorderLevel:10},
  {id:"p6",name:"Maggi Noodles",unit:"12pk",retailPrice:168,wholesalePrice:132,minWholesaleQty:10,category:"Snacks",stock:50,emoji:"🍜",barcode:"8901006",supplierId:"s3",hsn:"1902",gstRate:18,costPrice:108,reorderLevel:15},
  {id:"p7",name:"Dettol Soap",unit:"4pk",retailPrice:192,wholesalePrice:155,minWholesaleQty:24,category:"Personal",stock:35,emoji:"🧼",barcode:"8901007",hsn:"3401",gstRate:18,costPrice:125,reorderLevel:12},
  {id:"p8",name:"Colgate",unit:"200g",retailPrice:95,wholesalePrice:76,minWholesaleQty:24,category:"Personal",stock:40,emoji:"🦷",barcode:"8901008",hsn:"3306",gstRate:18,costPrice:60,reorderLevel:15},
];
const SEED_SUPPLIERS=[
  {id:"s1",name:"Sharma Brothers",type:"Wholesaler",contact:"Ramesh Sharma",phone:"9876543210",email:"sharma@gmail.com",address:"Hamidia Rd, Bhopal",gstin:"23SHARMA1234A1Z5",category:"Grocery",rating:4,creditLimit:0,totalPurchase:0,joinDate:todayK()},
  {id:"s2",name:"Amul Distributor",type:"Distributor",contact:"Rajesh Patel",phone:"9123456780",email:"amul@dist.in",address:"MP Nagar, Bhopal",gstin:"23AMULDIS1234B1Z5",category:"Dairy",rating:5,creditLimit:0,totalPurchase:0,joinDate:todayK()},
  {id:"s3",name:"Nestle Dist.",type:"Distributor",contact:"Suresh Kumar",phone:"9000123456",email:"nestle@dist.in",address:"Arera Colony, Bhopal",gstin:"23NESTLE12345C1Z5",category:"Snacks",rating:4,creditLimit:0,totalPurchase:0,joinDate:todayK()},
];
const EMPTY_P={name:"",unit:"",retailPrice:"",wholesalePrice:"",costPrice:"",minWholesaleQty:"10",category:"Grocery",stock:"",barcode:"",emoji:"📦",hsn:"",gstRate:"5",reorderLevel:"10",supplierId:"",description:""};

// ── AI CLAUDE CALL ────────────────────────────────────────────────
async function callClaude(prompt,imgBase64=null){
  const content=imgBase64
    ?[{type:"image",source:{type:"base64",media_type:"image/jpeg",data:imgBase64}},{type:"text",text:prompt}]
    :prompt;
  const res=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,messages:[{role:"user",content}]}),
  });
  const d=await res.json();
  return d.content?.[0]?.text||"";
}

// ── UI PRIMITIVES ─────────────────────────────────────────────────
function useToast(){
  const [toasts,setToasts]=useState([]);
  const add=(msg,type="success")=>{
    const id=Date.now();
    setToasts(p=>[...p.slice(-3),{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3500);
  };
  const Toast=()=>(
    <div style={{position:"fixed",top:16,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none"}}>
      {toasts.map(t=>(
        <div key={t.id} style={{
          background:t.type==="success"?"#002B1E":t.type==="error"?"#2B0A0A":t.type==="warning"?"#2B1A00":"#0A142B",
          border:`1px solid ${t.type==="success"?C.green:t.type==="error"?C.red:t.type==="warning"?C.yellow:C.blue}44`,
          color:t.type==="success"?C.green:t.type==="error"?C.red:t.type==="warning"?C.yellow:C.blue,
          padding:"10px 16px",borderRadius:10,fontSize:12,fontWeight:700,animation:"slideIn .3s ease",maxWidth:320,
        }}>{t.type==="success"?"✓ ":t.type==="error"?"✕ ":"⚠ "}{t.msg}</div>
      ))}
    </div>
  );
  return{add,Toast};
}

function Modal({children,onClose,width=560}){
  useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[onClose]);
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(4,6,14,.94)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,border:`1px solid ${C.border2}`,borderRadius:22,width,maxWidth:"100%",maxHeight:"92vh",overflowY:"auto",animation:"fadeUp .25s ease",boxShadow:"0 32px 80px #000A"}}>
        {children}
      </div>
    </div>
  );
}

const StatCard=({icon,label,value,sub,color=C.green})=>(
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 18px",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",right:-8,top:-8,fontSize:48,opacity:.05}}>{icon}</div>
    <div style={{fontSize:22,marginBottom:6}}>{icon}</div>
    <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:3}}>{label}</div>
    <div style={{fontSize:20,fontWeight:800,color,fontFamily:"monospace"}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{sub}</div>}
  </div>
);

const inp=(ex={})=>({width:"100%",background:C.dim,border:`1px solid ${C.border2}`,borderRadius:9,padding:"10px 13px",color:C.text,fontFamily:"'Space Grotesk',sans-serif",fontSize:13,outline:"none",...ex});
const lbl={fontSize:10,color:C.muted,marginBottom:5,display:"block",fontWeight:700,textTransform:"uppercase",letterSpacing:.5};
const btn=(color=C.green,ex={})=>({background:`linear-gradient(135deg,${color}CC,${color})`,color:color===C.green||color===C.yellow?"#030810":"#fff",border:"none",borderRadius:10,padding:"11px 20px",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:13,...ex});

// ══════════════════════════════════════════════════════════════════
// ONBOARDING
// ══════════════════════════════════════════════════════════════════
function Onboarding({onComplete}){
  const [step,setStep]=useState(0);
  const [biz,setBiz]=useState({name:"",ownerName:"",phone:"",email:"",gstin:"",address:"",city:"",state:"",pincode:"",type:"Retail Shop",logo:"🏪",financialYear:"April"});
  const [owner,setOwner]=useState({username:"admin",password:"",confirmPassword:""});
  const LOGOS=["🏪","🛒","🏬","🏭","💊","👕","⚙️","🍕","🎂","📱","🔧","🌾","🧴","📦"];
  const s=(k,v)=>setBiz(p=>({...p,[k]:v}));
  const o=(k,v)=>setOwner(p=>({...p,[k]:v}));
  const finish=()=>{
    if(!biz.name){alert("Business name required!");return;}
    if(!owner.password||owner.password.length<4){alert("Password min 4 chars!");return;}
    if(owner.password!==owner.confirmPassword){alert("Passwords don't match!");return;}
    DB.set("business",{...biz,id:uid(),createdAt:Date.now()});
    DB.set("currentUser",{id:uid(),username:owner.username,name:biz.ownerName||owner.username,role:"Owner",isOwner:true});
    DB.set("products",SEED_PRODUCTS);
    DB.set("suppliers",SEED_SUPPLIERS);
    DB.set("customers",[]);DB.set("employees",[]);DB.set("orders",[]);
    DB.set("purchases",[]);DB.set("credits",[]);DB.set("expenses",[]);DB.set("attendance",[]);
    onComplete();
  };
  const steps=["Business Info","Owner Login","Ready!"];
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Space Grotesk',sans-serif",padding:20}}>
      <div style={{width:540,maxWidth:"100%"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:42,marginBottom:8}}>{biz.logo||"🏪"}</div>
          <div style={{fontSize:28,fontWeight:900,color:C.text,letterSpacing:"-1px"}}><span style={{color:C.green}}>Retail</span><span style={{color:C.blue}}>PRO</span><span style={{fontSize:12,background:`linear-gradient(135deg,${C.purple},${C.blue})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontWeight:800,marginLeft:8}}>SaaS</span></div>
          <div style={{fontSize:12,color:C.muted,marginTop:4}}>Complete Business ERP — Setup karo, shuru karo</div>
        </div>
        {/* Step dots */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:24}}>
          {steps.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${i<=step?C.green:C.border2}`,background:i<step?C.green:i===step?"rgba(0,229,160,.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:i<step?"#030810":i===step?C.green:C.muted,fontWeight:700}}>
                {i<step?"✓":i+1}
              </div>
              {i<steps.length-1&&<div style={{width:40,height:2,background:i<step?C.green:C.border2}}/>}
            </div>
          ))}
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border2}`,borderRadius:20,padding:28}}>
          {step===0&&(
            <div>
              <div style={{fontWeight:800,fontSize:17,marginBottom:18,color:C.text}}>🏪 Business Information</div>
              <div style={{marginBottom:14}}>
                <label style={lbl}>Logo</label>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {LOGOS.map(l=><button key={l} onClick={()=>s("logo",l)} style={{fontSize:22,width:40,height:40,borderRadius:9,border:`2px solid ${biz.logo===l?C.green:C.border2}`,background:biz.logo===l?"rgba(0,229,160,.1)":C.dim,cursor:"pointer"}}>{l}</button>)}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{gridColumn:"1/-1"}}><label style={lbl}>Business Name *</label><input style={inp()} value={biz.name} onChange={e=>s("name",e.target.value)} placeholder="Sharma General Store"/></div>
                <div><label style={lbl}>Owner Name</label><input style={inp()} value={biz.ownerName} onChange={e=>s("ownerName",e.target.value)} placeholder="Ramesh Sharma"/></div>
                <div><label style={lbl}>Type</label><select style={inp({cursor:"pointer"})} value={biz.type} onChange={e=>s("type",e.target.value)}>{BIZ_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                <div><label style={lbl}>Phone *</label><input style={inp()} value={biz.phone} onChange={e=>s("phone",e.target.value)} placeholder="9876543210"/></div>
                <div><label style={lbl}>Email</label><input style={inp()} value={biz.email} onChange={e=>s("email",e.target.value)} placeholder="shop@email.com"/></div>
                <div style={{gridColumn:"1/-1"}}><label style={lbl}>GSTIN</label><input style={inp()} value={biz.gstin} onChange={e=>s("gstin",e.target.value)} placeholder="23ABCDE1234F1Z5"/></div>
                <div style={{gridColumn:"1/-1"}}><label style={lbl}>Address</label><textarea style={{...inp(),resize:"vertical"}} rows={2} value={biz.address} onChange={e=>s("address",e.target.value)}/></div>
                <div><label style={lbl}>City</label><input style={inp()} value={biz.city} onChange={e=>s("city",e.target.value)}/></div>
                <div><label style={lbl}>Pincode</label><input style={inp()} value={biz.pincode} onChange={e=>s("pincode",e.target.value)} placeholder="462001"/></div>
              </div>
            </div>
          )}
          {step===1&&(
            <div>
              <div style={{fontWeight:800,fontSize:17,marginBottom:18,color:C.text}}>👤 Owner Login Setup</div>
              <div style={{display:"grid",gap:12}}>
                <div><label style={lbl}>Username *</label><input style={inp()} value={owner.username} onChange={e=>o("username",e.target.value)} placeholder="admin"/></div>
                <div><label style={lbl}>Password *</label><input type="password" style={inp()} value={owner.password} onChange={e=>o("password",e.target.value)} placeholder="Min 4 characters"/></div>
                <div><label style={lbl}>Confirm Password *</label><input type="password" style={inp()} value={owner.confirmPassword} onChange={e=>o("confirmPassword",e.target.value)}/></div>
              </div>
              <div style={{marginTop:14,background:"rgba(77,158,255,.06)",border:`1px solid ${C.blue}33`,borderRadius:10,padding:12,fontSize:12,color:C.muted}}>
                Baad mein Settings se employees/staff add kar sakte ho with different roles.
              </div>
            </div>
          )}
          {step===2&&(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:56,marginBottom:16}}>🚀</div>
              <div style={{fontWeight:800,fontSize:20,color:C.green,marginBottom:8}}>Sab ready hai!</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:20,lineHeight:1.8}}>
                8 sample products · 3 suppliers · POS ready<br/>
                GST billing · QR codes · Analytics · Credit ledger
              </div>
              {["✓ Retail + Wholesale POS","✓ Product add (Manual/Excel/Sheets/Photo)","✓ QR code scanner","✓ Customer & Supplier ledger","✓ Employee attendance & salary","✓ Cash flow & P&L","✓ Credit management"].map(f=>(
                <div key={f} style={{fontSize:12,color:C.muted,marginBottom:4,textAlign:"left"}}>{f}</div>
              ))}
            </div>
          )}
          <div style={{display:"flex",gap:10,marginTop:20}}>
            {step>0&&<button onClick={()=>setStep(p=>p-1)} style={{padding:"11px 20px",borderRadius:10,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:13}}>← Back</button>}
            <button onClick={()=>{if(step<steps.length-1)setStep(p=>p+1);else finish();}} style={{...btn(C.green),flex:1}}>
              {step<steps.length-1?"Next →":"🚀 Launch RetailPRO"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PRODUCT FORM (reusable)
// ══════════════════════════════════════════════════════════════════
function ProductForm({initial=EMPTY_P,onSave,onCancel,title="Add Product",suppliers=[]}){
  const [f,setF]=useState({...EMPTY_P,...initial});
  const [showEmoji,setShowEmoji]=useState(false);
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const margin=f.retailPrice&&f.costPrice?Math.round(((f.retailPrice-f.costPrice)/f.retailPrice)*100):0;
  return(
    <div style={{padding:22}}>
      <div style={{fontWeight:800,fontSize:16,marginBottom:18,color:C.text}}>{title}</div>
      <div style={{marginBottom:14,position:"relative"}}>
        <label style={lbl}>Icon</label>
        <button onClick={()=>setShowEmoji(!showEmoji)} style={{fontSize:26,background:C.dim,border:`1px solid ${C.border2}`,borderRadius:10,padding:"6px 14px",cursor:"pointer"}}>{f.emoji}</button>
        {showEmoji&&<div style={{position:"absolute",top:70,left:0,background:C.card2,border:`1px solid ${C.border2}`,borderRadius:14,padding:10,display:"flex",flexWrap:"wrap",gap:4,zIndex:100,width:300,boxShadow:"0 16px 48px #000A"}}>
          {EMOJIS.map(e=><button key={e} onClick={()=>{s("emoji",e);setShowEmoji(false);}} style={{fontSize:20,background:"none",border:"none",cursor:"pointer",borderRadius:6,padding:"4px 6px"}}>{e}</button>)}
        </div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>Product Name *</label><input style={inp()} value={f.name} onChange={e=>s("name",e.target.value)} placeholder="e.g. Basmati Rice"/></div>
        <div><label style={lbl}>Unit *</label><input style={inp()} value={f.unit} onChange={e=>s("unit",e.target.value)} placeholder="1kg, 500g, 12pk"/></div>
        <div><label style={lbl}>Category</label><select style={inp({cursor:"pointer"})} value={f.category} onChange={e=>s("category",e.target.value)}>{PCATS.map(c=><option key={c}>{c}</option>)}</select></div>
        <div style={{gridColumn:"1/-1",background:C.dim,borderRadius:12,padding:13,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:9,textTransform:"uppercase",letterSpacing:.5}}>💰 Pricing</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}>
            <div><label style={lbl}>Cost Price (₹)</label><input type="number" style={inp()} value={f.costPrice} onChange={e=>s("costPrice",e.target.value)} placeholder="0"/></div>
            <div><label style={lbl}>Retail Price *</label><input type="number" style={inp()} value={f.retailPrice} onChange={e=>s("retailPrice",e.target.value)} placeholder="0"/></div>
            <div><label style={lbl}>Wholesale Price</label><input type="number" style={inp()} value={f.wholesalePrice} onChange={e=>s("wholesalePrice",e.target.value)} placeholder="0"/></div>
          </div>
          {margin>0&&<div style={{marginTop:7,fontSize:11,color:C.green,fontWeight:700}}>↑ Margin: {margin}% · Profit: {fmt(f.retailPrice-f.costPrice)}/unit</div>}
        </div>
        <div><label style={lbl}>Stock Qty</label><input type="number" style={inp()} value={f.stock} onChange={e=>s("stock",e.target.value)} placeholder="0"/></div>
        <div><label style={lbl}>Reorder Level</label><input type="number" style={inp()} value={f.reorderLevel} onChange={e=>s("reorderLevel",e.target.value)} placeholder="10"/></div>
        <div><label style={lbl}>Min Wholesale Qty</label><input type="number" style={inp()} value={f.minWholesaleQty} onChange={e=>s("minWholesaleQty",e.target.value)} placeholder="10"/></div>
        <div><label style={lbl}>GST Rate (%)</label><select style={inp({cursor:"pointer"})} value={f.gstRate} onChange={e=>s("gstRate",e.target.value)}>{GST_RATES.map(r=><option key={r} value={r}>{r}%</option>)}</select></div>
        <div><label style={lbl}>Barcode</label><input style={inp()} value={f.barcode} onChange={e=>s("barcode",e.target.value)} placeholder="8901234567890"/></div>
        <div><label style={lbl}>HSN Code</label><input style={inp()} value={f.hsn} onChange={e=>s("hsn",e.target.value)} placeholder="1006"/></div>
        {suppliers.length>0&&<div style={{gridColumn:"1/-1"}}><label style={lbl}>Supplier</label><select style={inp({cursor:"pointer"})} value={f.supplierId} onChange={e=>s("supplierId",e.target.value)}><option value="">Select...</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>}
      </div>
      <div style={{display:"flex",gap:10,marginTop:18}}>
        <button style={{...btn(C.green),flex:1}} onClick={()=>{
          if(!f.name||!f.retailPrice){alert("Name & Retail Price required!");return;}
          onSave({...f,id:f.id||uid(),retailPrice:Number(f.retailPrice)||0,wholesalePrice:Number(f.wholesalePrice)||0,costPrice:Number(f.costPrice)||0,stock:Number(f.stock)||0,minWholesaleQty:Number(f.minWholesaleQty)||10,gstRate:Number(f.gstRate)||5,reorderLevel:Number(f.reorderLevel)||10});
        }}>✓ Save Product</button>
        <button onClick={onCancel} style={{padding:"11px 18px",borderRadius:10,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>Cancel</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PRODUCTS ADD PAGE (Manual + Excel + Sheets + Bill Photo AI)
// ══════════════════════════════════════════════════════════════════
function ProductsPage({products,setProducts,notify}){
  const [method,setMethod]=useState(null);
  const [loading,setLoading]=useState(false);
  const [loadMsg,setLoadMsg]=useState("");
  const [preview,setPreview]=useState([]);
  const [editIdx,setEditIdx]=useState(null);
  const [imgPrev,setImgPrev]=useState(null);
  const [sheetsUrl,setSheetsUrl]=useState("");
  const [csvText,setCsvText]=useState("");
  const fileRef=useRef(); const imgRef=useRef();
  const suppliers=DB.get("suppliers",[]);

  const saveAll=list=>{
    const valid=list.filter(p=>p.name&&p.retailPrice);
    const newProds=[...products,...valid.map((p,i)=>({...EMPTY_P,...p,id:uid()+i,retailPrice:Number(p.retailPrice)||0,wholesalePrice:Number(p.wholesalePrice)||0,costPrice:Number(p.costPrice)||0,stock:Number(p.stock)||0,minWholesaleQty:Number(p.minWholesaleQty)||10,gstRate:Number(p.gstRate)||5,reorderLevel:Number(p.reorderLevel)||10,emoji:p.emoji||"📦"}))];
    setProducts(newProds);DB.set("products",newProds);
    notify(`✓ ${valid.length} product(s) added!`,"success");
    setPreview([]);setMethod(null);setImgPrev(null);
  };

  const parseAI=async(text,src)=>{
    setLoading(true);setLoadMsg(`🤖 AI reading ${src}…`);
    try{
      const resp=await callClaude(`Extract ALL products from this ${src} and return ONLY a valid JSON array (no markdown, no explanation):
[{"name":"","unit":"","retailPrice":0,"wholesalePrice":0,"costPrice":0,"category":"Grocery","stock":0,"barcode":"","emoji":"📦","minWholesaleQty":10,"gstRate":5,"hsn":"","reorderLevel":10}]
Rules: wholesale=retail*0.82 if missing, cost=retail*0.65 if missing, pick best emoji, if purchase bill: costPrice=bill price, retailPrice=costPrice*1.20
Data:\n${text.slice(0,5000)}\nReturn ONLY JSON array:`);
      const m=resp.match(/\[[\s\S]*?\]/);
      if(m){const p=JSON.parse(m[0]);setPreview(p);notify(`${p.length} products found!`,"info");}
      else notify("Parse failed. Try again.","error");
    }catch(e){notify("Error: "+e.message,"error");}
    setLoading(false);
  };

  const handleFile=async file=>{
    if(!file)return;
    if(file.name.match(/\.(csv|txt)$/i)){const r=new FileReader();r.onload=e=>parseAI(e.target.result,"CSV");r.readAsText(file);}
    else{const r=new FileReader();r.onload=async e=>{const arr=new Uint8Array(e.target.result);let s="";arr.slice(0,8000).forEach(x=>s+=String.fromCharCode(x));await parseAI(s.replace(/[^\x20-\x7E\n]/g," ").replace(/\s+/g," "),"Excel");};r.readAsArrayBuffer(file);}
  };
  const handleSheets=async()=>{
    if(!sheetsUrl.trim()){notify("URL daalo","warning");return;}
    setLoading(true);setLoadMsg("📊 Sheet fetch ho raha hai…");
    try{
      const id=sheetsUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if(!id){notify("Invalid URL","error");setLoading(false);return;}
      const res=await fetch(`https://docs.google.com/spreadsheets/d/${id}/export?format=csv`);
      if(!res.ok){notify("Sheet fetch failed. Share → Anyone with link → Viewer","error");setLoading(false);return;}
      await parseAI(await res.text(),"Google Sheet");
    }catch(e){notify("Error: "+e.message,"error");setLoading(false);}
  };
  const handleImage=async file=>{
    if(!file)return;
    setLoading(true);setLoadMsg("📷 AI bill scan kar raha hai…");
    const r=new FileReader();
    r.onload=async e=>{
      const b64=e.target.result.split(",")[1];setImgPrev(e.target.result);
      try{
        const resp=await callClaude(`This is a purchase bill/invoice/price list/product photo. Extract ALL products and return ONLY JSON array:
[{"name":"","unit":"","retailPrice":0,"wholesalePrice":0,"costPrice":0,"category":"Grocery","stock":0,"barcode":"","emoji":"📦","minWholesaleQty":10,"gstRate":5,"hsn":"","reorderLevel":10}]
If purchase bill: costPrice=bill amount, retailPrice=costPrice*1.20, wholesalePrice=costPrice*1.10. Return ONLY JSON array.`,b64);
        const m=resp.match(/\[[\s\S]*?\]/);
        if(m){const p=JSON.parse(m[0]);setPreview(p);notify(`${p.length} product(s) detected!`,"info");}
        else{setPreview([{...EMPTY_P}]);setEditIdx(0);notify("Manual fill karo","warning");}
      }catch{notify("Image error","error");}
      setLoading(false);
    };
    r.readAsDataURL(file);
  };

  const addMethods=[
    {id:"manual",icon:"✍️",label:"Manual Entry",desc:"Form se ek product add karo",color:C.green},
    {id:"excel",icon:"📊",label:"Excel / CSV",desc:".xlsx .csv upload ya paste karo",color:C.yellow},
    {id:"sheets",icon:"🔗",label:"Google Sheets",desc:"Public sheet se bulk import",color:C.blue},
    {id:"image",icon:"📷",label:"Bill Photo / Scan",desc:"Invoice photo → AI auto-extract",color:C.purple},
  ];

  return(
    <div style={{flex:1,padding:24,overflow:"auto",color:C.text,fontFamily:"'Space Grotesk',sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div><div style={{fontWeight:900,fontSize:22}}>📦 Products</div><div style={{fontSize:12,color:C.muted,marginTop:3}}>{products.length} products · 4 ways to add</div></div>
        {(method||preview.length>0)&&<button onClick={()=>{setMethod(null);setPreview([]);setImgPrev(null);setEditIdx(null);}} style={{padding:"8px 18px",borderRadius:10,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:13}}>← Back</button>}
      </div>

      {!method&&!preview.length&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,maxWidth:640,marginBottom:24}}>
            {addMethods.map(m=>(
              <div key={m.id} onClick={()=>setMethod(m.id)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:22,cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
                <div style={{fontSize:42,marginBottom:10}}>{m.icon}</div>
                <div style={{fontWeight:800,fontSize:14,color:m.color,marginBottom:5}}>{m.label}</div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>{m.desc}</div>
              </div>
            ))}
          </div>
          {/* Current inventory */}
          <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>Current Inventory ({products.length})</div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"2.5fr 1fr 1fr 1fr 1fr .8fr",padding:"9px 16px",borderBottom:`1px solid ${C.border}`,color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>
              <span>Product</span><span>Category</span><span>Retail</span><span>Wholesale</span><span>Cost</span><span>Stock</span>
            </div>
            {products.map((p,i)=>(
              <div key={p.id||i} style={{display:"grid",gridTemplateColumns:"2.5fr 1fr 1fr 1fr 1fr .8fr",padding:"11px 16px",borderBottom:`1px solid ${C.dim}`,alignItems:"center",fontSize:12}}>
                <span style={{fontWeight:600}}>{p.emoji} {p.name} <span style={{color:C.muted,fontSize:10}}>({p.unit})</span></span>
                <span style={{color:C.muted}}>{p.category}</span>
                <span style={{fontWeight:700,color:C.green}}>{fmt(p.retailPrice)}</span>
                <span style={{fontWeight:700,color:C.blue}}>{fmt(p.wholesalePrice)}</span>
                <span style={{color:C.muted}}>{fmt(p.costPrice||0)}</span>
                <span style={{fontWeight:700,color:p.stock===0?C.red:p.stock<=(p.reorderLevel||10)?C.yellow:C.text}}>{p.stock}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {loading&&<div style={{textAlign:"center",padding:"80px 0"}}><div style={{width:52,height:52,border:`4px solid ${C.border2}`,borderTopColor:C.green,borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 16px"}}/><div style={{fontSize:13,color:C.muted}}>{loadMsg}</div></div>}

      {method==="manual"&&!loading&&!preview.length&&<div style={{maxWidth:600}}><ProductForm title="✍️ Manual Entry" onSave={p=>saveAll([p])} onCancel={()=>setMethod(null)} suppliers={suppliers}/></div>}

      {method==="excel"&&!loading&&!preview.length&&(
        <div style={{maxWidth:620}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:24}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>📊 Excel / CSV Import</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:18}}>File upload karo ya CSV paste karo</div>
            <div onClick={()=>fileRef.current.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);}} style={{border:`2px dashed ${C.yellow}44`,borderRadius:14,padding:"32px 20px",textAlign:"center",cursor:"pointer",marginBottom:18,background:"rgba(251,191,36,.03)"}}>
              <div style={{fontSize:44,marginBottom:8}}>📄</div>
              <div style={{fontWeight:700,color:C.yellow}}>Click ya Drag & Drop</div>
              <div style={{fontSize:11,color:C.muted,marginTop:3}}>.xlsx · .xls · .csv · .txt</div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
            </div>
            <div style={{textAlign:"center",color:C.muted,fontSize:12,marginBottom:12}}>— ya CSV paste karo —</div>
            <textarea rows={5} value={csvText} onChange={e=>setCsvText(e.target.value)} placeholder={"Name,Unit,Retail,Wholesale,Cost,Category,Stock,Barcode,GST\nBasmati Rice,5kg,349,290,250,Grocery,100,8901001,5"} style={{width:"100%",background:C.dim,border:`1px solid ${C.border2}`,borderRadius:10,padding:12,color:C.text,fontFamily:"monospace",fontSize:12,resize:"vertical",outline:"none"}}/>
            {csvText.trim()&&<button style={{...btn(C.yellow),width:"100%",marginTop:10}} onClick={()=>parseAI(csvText,"CSV")}>🤖 AI se Parse Karo</button>}
          </div>
        </div>
      )}

      {method==="sheets"&&!loading&&!preview.length&&(
        <div style={{maxWidth:560}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:24}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>🔗 Google Sheets Import</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:18}}>Public Google Sheet URL paste karo</div>
            <input value={sheetsUrl} onChange={e=>setSheetsUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." style={{...inp(),marginBottom:12,fontFamily:"monospace",fontSize:12}}/>
            <button style={{...btn(C.blue),width:"100%",marginBottom:14}} onClick={handleSheets}>📥 Import Karo</button>
            <div style={{background:C.dim,borderRadius:10,padding:13,fontSize:11,color:C.muted,lineHeight:1.9}}>
              <b style={{color:C.blue}}>Setup:</b> Row 1: Name, Unit, Retail Price, Wholesale Price, Cost Price, Category, Stock, Barcode, GST%<br/>
              File → Share → Anyone with link → Viewer
            </div>
          </div>
        </div>
      )}

      {method==="image"&&!loading&&!preview.length&&(
        <div style={{maxWidth:580}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:24}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>📷 Bill Photo / Scan</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:18}}>Purchase invoice ya product label photo upload karo — AI auto-extract karega</div>
            <div onClick={()=>imgRef.current.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleImage(e.dataTransfer.files[0]);}} style={{border:`2px dashed ${C.purple}44`,borderRadius:14,padding:"32px 20px",textAlign:"center",cursor:"pointer",marginBottom:14,background:"rgba(139,92,246,.04)"}}>
              <div style={{fontSize:48,marginBottom:8}}>📷</div>
              <div style={{fontWeight:700,color:C.purple}}>Click ya Drag & Drop</div>
              <div style={{fontSize:11,color:C.muted,marginTop:3}}>JPG · PNG · WEBP</div>
              <input ref={imgRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleImage(e.target.files[0])}/>
            </div>
            {imgPrev&&<img src={imgPrev} alt="" style={{width:"100%",maxHeight:200,objectFit:"contain",borderRadius:10,border:`1px solid ${C.border2}`,marginBottom:12}}/>}
            <div style={{background:C.dim,borderRadius:10,padding:12,fontSize:12,color:C.muted,lineHeight:1.8}}>✓ Purchase bill → cost price extract + markup<br/>✓ Label → barcode, MRP, GST%<br/>✓ Invoice → qty as stock</div>
          </div>
        </div>
      )}

      {preview.length>0&&!loading&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div><div style={{fontWeight:800,fontSize:18}}>👀 Review Before Saving</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{preview.length} products found</div></div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setPreview([])} style={{padding:"9px 16px",borderRadius:10,border:`1px solid ${C.red}44`,background:`rgba(239,68,68,.08)`,color:C.red,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:13}}>✕ Discard</button>
              <button style={{...btn(C.green)}} onClick={()=>saveAll(preview)}>✓ Save All ({preview.length})</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
            {preview.map((p,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,overflow:"hidden"}}>
                {editIdx===i
                  ?<ProductForm title={`✏️ ${p.name||"Edit"}`} initial={p} onSave={u=>{setPreview(prev=>prev.map((x,j)=>j===i?u:x));setEditIdx(null);}} onCancel={()=>setEditIdx(null)} suppliers={suppliers}/>
                  :<div style={{padding:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
                      <div style={{display:"flex",gap:9,alignItems:"center"}}><span style={{fontSize:26}}>{p.emoji||"📦"}</span><div><div style={{fontWeight:700,fontSize:13}}>{p.name||"Unnamed"}</div><div style={{fontSize:11,color:C.muted}}>{p.unit} · {p.category}</div></div></div>
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={()=>setEditIdx(i)} style={{background:"none",border:`1px solid ${C.border2}`,borderRadius:6,padding:"3px 8px",color:C.blue,cursor:"pointer",fontSize:11}}>✏️</button>
                        <button onClick={()=>setPreview(prev=>prev.filter((_,j)=>j!==i))} style={{background:"none",border:`1px solid ${C.border2}`,borderRadius:6,padding:"3px 8px",color:C.red,cursor:"pointer",fontSize:11}}>✕</button>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      {[{l:"RETAIL",v:fmt(p.retailPrice||0),c:C.green},{l:"WHOLESALE",v:fmt(p.wholesalePrice||0),c:C.blue},{l:"COST",v:fmt(p.costPrice||0),c:C.muted},{l:"STOCK",v:p.stock||0,c:C.yellow}].map(r=>(
                        <div key={r.l} style={{flex:1,background:C.dim,borderRadius:7,padding:"6px 0",textAlign:"center"}}><div style={{fontSize:8,color:C.muted}}>{r.l}</div><div style={{fontSize:12,fontWeight:800,color:r.c}}>{r.v}</div></div>
                      ))}
                    </div>
                    {p.barcode&&<div style={{fontSize:10,color:C.muted,marginTop:7,fontFamily:"monospace"}}>📊 {p.barcode}{p.gstRate?` · GST:${p.gstRate}%`:""}</div>}
                  </div>
                }
              </div>
            ))}
            <div onClick={()=>{const np=[...preview,{...EMPTY_P}];setPreview(np);setEditIdx(np.length-1);}} style={{background:"transparent",border:`2px dashed ${C.border2}`,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6,minHeight:110,cursor:"pointer"}}>
              <div style={{fontSize:28,color:C.muted}}>+</div><div style={{fontSize:12,color:C.muted,fontWeight:600}}>Add More</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// QR CODES MODULE (with scanner)
// ══════════════════════════════════════════════════════════════════
function QRPage({products,setProducts,notify}){
  const [selected,setSelected]=useState([]);
  const [qrSize,setQrSize]=useState(150);
  const [filterCat,setFilterCat]=useState("All");
  const [scanInput,setScanInput]=useState("");
  const [scanResult,setScanResult]=useState(null);
  const [scanQty,setScanQty]=useState(1);
  const [scanAction,setScanAction]=useState("lookup");

  const filtered=products.filter(p=>filterCat==="All"||p.category===filterCat);
  const toggleOne=id=>setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  const handleScan=()=>{
    const raw=scanInput.trim();if(!raw)return;
    let prod=null;
    if(raw.startsWith("RPPROD|")){const parts=raw.split("|");prod=products.find(p=>p.id===parts[1])||products.find(p=>p.barcode===parts[3]);}
    else{prod=products.find(p=>p.barcode===raw||p.id===raw||p.name.toLowerCase()===raw.toLowerCase());}
    if(!prod){notify(`Product not found: ${raw}`,"error");return;}
    setScanResult(prod);setScanInput("");
  };

  const applyAction=()=>{
    if(!scanResult)return;
    const qty=Number(scanQty)||1;
    if(scanAction==="sale"){
      if(scanResult.stock<qty){notify(`Only ${scanResult.stock} in stock!`,"error");return;}
      const upd=products.map(p=>p.id===scanResult.id?{...p,stock:p.stock-qty}:p);
      setProducts(upd);DB.set("products",upd);notify(`✓ Sold ${qty}× ${scanResult.name}. Stock: ${scanResult.stock-qty}`,"success");
    } else if(scanAction==="restock"){
      const upd=products.map(p=>p.id===scanResult.id?{...p,stock:p.stock+qty}:p);
      setProducts(upd);DB.set("products",upd);notify(`✓ Restocked. Stock: ${scanResult.stock+qty}`,"success");
    }
    setScanResult(null);setScanQty(1);
  };

  const printOne=p=>{
    const w=window.open("","_blank","width=380,height=520");
    w.document.write(`<!DOCTYPE html><html><head><title>QR-${p.name}</title><style>body{font-family:Arial;padding:20px;width:260px;margin:0 auto;text-align:center;}img{border-radius:10px;border:2px solid #eee;}.prices{display:flex;gap:8px;justify-content:center;margin:10px 0;}.pb{border:1px solid #eee;border-radius:8px;padding:7px 12px;}.r{color:#00C896;font-size:18px;font-weight:bold;}.w{color:#3b82f6;font-size:18px;font-weight:bold;}@media print{}</style></head><body>
    <div style="font-size:32px;margin-bottom:6px">${p.emoji}</div>
    <div style="font-size:16px;font-weight:bold;color:#0a0e1a">${p.name}</div>
    <div style="font-size:12px;color:#666;margin-bottom:10px">${p.unit}${p.barcode?` · ${p.barcode}`:""}</div>
    <img src="${QR_URL(QR_DAT(p),180)}" width="180" height="180"/>
    <div class="prices"><div class="pb"><div style="font-size:9px;color:#888">RETAIL</div><div class="r">₹${p.retailPrice}</div></div><div class="pb"><div style="font-size:9px;color:#888">WHOLESALE</div><div class="w">₹${p.wholesalePrice}</div></div></div>
    ${p.hsn?`<div style="font-size:10px;color:#bbb">HSN: ${p.hsn} · GST: ${p.gstRate}%</div>`:""}
    <div style="font-size:9px;color:#ccc;margin-top:8px">RetailPRO · Scan to check price</div>
    <script>window.onload=()=>{window.print();window.close();}<\/script></body></html>`);
    w.document.close();
  };

  const printSelected=()=>{
    const sel=products.filter(p=>selected.includes(p.id));
    if(!sel.length){notify("Select products first","warning");return;}
    const w=window.open("","_blank","width=960,height=720");
    const cards=sel.map(p=>`<div class="card"><div class="emoji">${p.emoji}</div><div class="name">${p.name}</div><div class="unit">${p.unit}</div><img src="${QR_URL(QR_DAT(p),qrSize)}" width="${qrSize}" height="${qrSize}"/><div class="prices"><div class="pb"><div class="pl">Retail</div><div class="pv r">₹${p.retailPrice}</div></div><div class="pb"><div class="pl">Wholesale</div><div class="pv w">₹${p.wholesalePrice}</div></div></div>${p.barcode?`<div class="bc">${p.barcode}</div>`:""}</div>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>QR Codes (${sel.length})</title><style>body{font-family:Arial;padding:16px;}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(${qrSize+70}px,1fr));gap:12px;}.card{background:#fff;border-radius:10px;padding:14px 10px;text-align:center;border:1px solid #eee;break-inside:avoid;}.emoji{font-size:24px;margin-bottom:4px;}.name{font-size:12px;font-weight:bold;margin-bottom:2px;}.unit{font-size:10px;color:#888;margin-bottom:8px;}img{border-radius:8px;border:1px solid #eee;}.prices{display:flex;justify-content:center;gap:6px;margin-top:8px;flex-wrap:wrap;}.pb{border:1px solid #eee;border-radius:6px;padding:4px 8px;}.pl{font-size:8px;color:#888;text-transform:uppercase;}.pv{font-size:14px;font-weight:bold;}.r{color:#00C896;}.w{color:#3b82f6;}.bc{font-size:8px;color:#aaa;font-family:monospace;margin-top:4px;}@media print{body{background:#fff;}}</style></head><body><div class="grid">${cards}</div><script>window.onload=()=>{window.print();}<\/script></body></html>`);
    w.document.close();
  };

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",color:C.text,fontFamily:"'Space Grotesk',sans-serif"}}>
      {/* Scanner bar */}
      <div style={{padding:"12px 22px",borderBottom:`1px solid ${C.border}`,background:"rgba(34,211,238,.04)"}}>
        <div style={{fontWeight:700,fontSize:12,color:C.cyan,marginBottom:8}}>📷 QR / Barcode Scanner</div>
        <div style={{display:"flex",gap:9,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div style={{flex:2,minWidth:200}}>
            <input value={scanInput} onChange={e=>setScanInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleScan();}} placeholder="Scan QR code ya barcode → Enter" style={{...inp({border:`1px solid ${C.cyan}44`})}}/>
          </div>
          <div style={{display:"flex",gap:4}}>
            {[{v:"lookup",l:"🔍 Lookup"},{v:"sale",l:"🛒 Deduct"},{v:"restock",l:"📦 Restock"}].map(a=>(
              <button key={a.v} onClick={()=>setScanAction(a.v)} style={{padding:"9px 12px",borderRadius:8,border:`1px solid`,borderColor:scanAction===a.v?C.cyan:C.border2,background:scanAction===a.v?"rgba(34,211,238,.12)":"transparent",color:scanAction===a.v?C.cyan:C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>{a.l}</button>
            ))}
          </div>
          {(scanAction==="sale"||scanAction==="restock")&&<input type="number" value={scanQty} onChange={e=>setScanQty(e.target.value)} style={{...inp({width:70,textAlign:"center"})}}/>}
          <button style={{...btn(C.cyan),padding:"9px 18px"}} onClick={handleScan}>Scan ↵</button>
        </div>
        {scanResult&&(
          <div style={{marginTop:10,background:"rgba(0,229,160,.06)",border:`1px solid ${C.green}33`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <span style={{fontSize:26}}>{scanResult.emoji}</span>
            <div style={{flex:1}}><div style={{fontWeight:800,fontSize:14}}>{scanResult.name} <span style={{color:C.muted,fontSize:11}}>({scanResult.unit})</span></div><div style={{fontSize:12,color:C.muted}}>Retail: <b style={{color:C.green}}>{fmt(scanResult.retailPrice)}</b> · Wholesale: <b style={{color:C.blue}}>{fmt(scanResult.wholesalePrice)}</b> · Stock: <b style={{color:scanResult.stock<=5?C.red:C.green}}>{scanResult.stock}</b></div></div>
            {scanAction!=="lookup"&&<button style={{...btn(scanAction==="sale"?C.red:C.green),padding:"8px 16px"}} onClick={applyAction}>{scanAction==="sale"?"✓ Sell":"✓ Restock"} {scanQty}</button>}
            <button onClick={()=>setScanResult(null)} style={{background:"none",border:`1px solid ${C.border2}`,borderRadius:8,padding:"6px 10px",color:C.muted,cursor:"pointer"}}>✕</button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{padding:"10px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:9,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:12,color:C.muted,flex:1}}>{selected.length} selected</span>
        {[{l:"S",v:100},{l:"M",v:150},{l:"L",v:200}].map(sz=><button key={sz.v} onClick={()=>setQrSize(sz.v)} style={{padding:"5px 12px",borderRadius:7,border:`1px solid`,borderColor:qrSize===sz.v?C.green:C.border2,background:qrSize===sz.v?"rgba(0,229,160,.1)":"transparent",color:qrSize===sz.v?C.green:C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>{sz.l}</button>)}
        <button onClick={()=>setSelected(filtered.map(p=>p.id))} style={{padding:"6px 13px",borderRadius:7,border:`1px solid ${C.border2}`,background:"transparent",color:C.text,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>☑ All</button>
        <button onClick={()=>setSelected([])} style={{padding:"6px 13px",borderRadius:7,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>☐ None</button>
        <button style={{...btn(C.green),padding:"8px 16px",opacity:selected.length?1:.5}} onClick={printSelected}>🖨️ Print ({selected.length})</button>
      </div>

      {/* Category filter */}
      <div style={{padding:"9px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:5,flexWrap:"wrap"}}>
        {["All",...new Set(products.map(p=>p.category))].map(cat=>(
          <button key={cat} onClick={()=>setFilterCat(cat)} style={{padding:"4px 12px",borderRadius:20,border:`1px solid`,borderColor:filterCat===cat?C.green:C.border,background:filterCat===cat?"rgba(0,229,160,.1)":"transparent",color:filterCat===cat?C.green:C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:11,cursor:"pointer"}}>{cat}</button>
        ))}
      </div>

      {/* QR Grid */}
      <div style={{flex:1,overflow:"auto",padding:18}}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${qrSize+56}px,1fr))`,gap:12}}>
          {filtered.map(product=>{
            const sel=selected.includes(product.id);
            return(
              <div key={product.id} style={{background:C.card,border:`2px solid ${sel?C.green:C.border}`,borderRadius:14,padding:13,transition:"all .15s",position:"relative",boxShadow:sel?`0 0 20px ${C.green}22`:"none"}}>
                <div onClick={()=>toggleOne(product.id)} style={{position:"absolute",top:10,left:10,width:20,height:20,borderRadius:5,border:`2px solid ${sel?C.green:C.muted}`,background:sel?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:2}}>
                  {sel&&<span style={{fontSize:11,color:"#030810",fontWeight:900}}>✓</span>}
                </div>
                <div style={{position:"absolute",top:9,right:9,fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:20,background:product.stock===0?"rgba(239,68,68,.2)":product.stock<=(product.reorderLevel||10)?"rgba(251,191,36,.15)":"rgba(0,229,160,.1)",color:product.stock===0?C.red:product.stock<=(product.reorderLevel||10)?C.yellow:C.green}}>{product.stock===0?"OUT":product.stock}</div>
                <div style={{textAlign:"center",paddingTop:6,marginBottom:9}}>
                  <div style={{fontSize:26,marginBottom:3}}>{product.emoji}</div>
                  <div style={{fontSize:12,fontWeight:700}}>{product.name}</div>
                  <div style={{fontSize:10,color:C.muted}}>{product.unit}</div>
                </div>
                <div style={{display:"flex",justifyContent:"center",marginBottom:9}}>
                  <div style={{background:"#04060E",padding:5,borderRadius:9,border:`2px solid ${sel?C.green:C.border2}`}}>
                    <img src={QR_URL(QR_DAT(product),qrSize)} alt={product.name} style={{width:qrSize,height:qrSize,borderRadius:5,display:"block"}}/>
                  </div>
                </div>
                <div style={{display:"flex",gap:5,marginBottom:7}}>
                  <div style={{flex:1,background:C.dim,borderRadius:7,padding:"5px 0",textAlign:"center"}}><div style={{fontSize:8,color:C.muted}}>RETAIL</div><div style={{fontSize:12,fontWeight:800,color:C.green}}>{fmt(product.retailPrice)}</div></div>
                  <div style={{flex:1,background:C.dim,borderRadius:7,padding:"5px 0",textAlign:"center"}}><div style={{fontSize:8,color:C.muted}}>WHOLESALE</div><div style={{fontSize:12,fontWeight:800,color:C.blue}}>{fmt(product.wholesalePrice)}</div></div>
                </div>
                <button onClick={()=>printOne(product)} style={{width:"100%",padding:"7px 0",borderRadius:7,border:"none",background:`linear-gradient(135deg,${C.green}99,${C.green})`,color:"#030810",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>🖨️ Print QR</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// POS PAGE
// ══════════════════════════════════════════════════════════════════
function POSPage({products,setProducts,orders,setOrders,notify,mode,setMode}){
  const [cart,setCart]=useState([]);
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("All");
  const [discount,setDiscount]=useState(0);
  const [payment,setPayment]=useState("Cash");
  const [customer,setCustomer]=useState("");
  const [phone,setPhone]=useState("");
  const [gstin,setGstin]=useState("");
  const [receipt,setReceipt]=useState(null);
  const [custSuggest,setCustSuggest]=useState([]);
  const customers=DB.get("customers",[]);
  const business=DB.get("business",{});

  const accent=mode==="wholesale"?C.blue:C.green;
  const price=p=>mode==="wholesale"?p.wholesalePrice:p.retailPrice;
  const filtered=products.filter(p=>(category==="All"||p.category===category)&&(p.name.toLowerCase().includes(search.toLowerCase())||p.barcode?.includes(search)));
  const addToCart=p=>{
    if(p.stock===0){notify(`${p.name} out of stock!`,"error");return;}
    setCart(prev=>{const ex=prev.find(i=>i.id===p.id);if(ex){if(ex.qty>=p.stock){notify(`Only ${p.stock} left!`,"warning");return prev;}return prev.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i);}return[...prev,{...p,qty:1}];});
  };
  const updateQty=(id,d)=>{const prod=products.find(p=>p.id===id);setCart(prev=>prev.map(i=>{if(i.id!==id)return i;const nq=i.qty+d;if(nq>prod.stock){notify(`Only ${prod.stock} left!`,"warning");return i;}return{...i,qty:Math.max(0,nq)};}).filter(i=>i.qty>0));};
  const subtotal=cart.reduce((s,i)=>s+price(i)*i.qty,0);
  const discountAmt=Math.round(subtotal*discount/100);
  const gstAmt=Math.round((subtotal-discountAmt)*0.05);
  const total=subtotal-discountAmt+gstAmt;

  const handlePhone=v=>{
    setPhone(v);
    if(v.length>=3)setCustSuggest(customers.filter(c=>c.phone.includes(v)||c.name.toLowerCase().includes(v.toLowerCase())).slice(0,3));
    else setCustSuggest([]);
  };

  const checkout=()=>{
    if(cart.length===0){notify("Cart empty!","warning");return;}
    if(mode==="wholesale"&&!customer){notify("Customer name required","warning");return;}
    // Auto-save customer
    if(phone&&phone.length>=10){
      const existing=customers.find(c=>c.phone===phone);
      if(!existing&&customer){
        const nc={id:uid(),name:customer,phone,type:mode==="wholesale"?"Wholesale":"Retail",joinDate:todayK(),email:"",gstin,creditLimit:0};
        DB.set("customers",[...customers,nc]);
      }
    }
    // Auto credit entry if Credit payment
    if(payment==="Credit"&&customer){
      const credits=DB.get("credits",[]);
      DB.set("credits",[{id:uid(),name:customer,phone,type:"customer",creditType:"given",amount:total,paid:0,status:"pending",date:todayK(),notes:`POS Sale`,entries:[{amount:total,type:"credit",date:todayK()}],createdAt:Date.now()},...credits]);
    }
    const order={id:`ORD-${Date.now().toString(36).toUpperCase()}`,time:nowStr(),timestamp:Date.now(),mode,customer:customer||"Walk-in",phone,gst:gstin,cart:[...cart],subtotal,discountAmt,discount,gst_amount:gstAmt,total,payment};
    const newOrders=[order,...orders];setOrders(newOrders);DB.set("orders",newOrders);
    const newProds=products.map(p=>{const ci=cart.find(i=>i.id===p.id);return ci?{...p,stock:Math.max(0,p.stock-ci.qty)}:p;});
    setProducts(newProds);DB.set("products",newProds);
    cart.forEach(ci=>{const p=newProds.find(x=>x.id===ci.id);if(p&&p.stock<=0)notify(`🚨 ${p.name} OUT OF STOCK!`,"error");else if(p&&p.stock<=(p.reorderLevel||10))notify(`⚠ ${p.name}: ${p.stock} left!`,"warning");});
    setReceipt(order);setCart([]);setDiscount(0);setCustomer("");setPhone("");setGstin("");setCustSuggest([]);
    notify("✓ Sale done!","success");
  };

  // GST Bill Print
  const printGSTBill=order=>{
    const isWS=order.mode==="wholesale";
    const w=window.open("","_blank","width=860,height=720");
    const rows=order.cart.map(item=>{
      const rate=isWS?item.wholesalePrice:item.retailPrice;
      const taxable=rate*item.qty;const gstR=item.gstRate||5;
      const cgst=(taxable*gstR/200).toFixed(2);
      return`<tr><td>${item.emoji} ${item.name} (${item.unit})</td><td>${item.hsn||"—"}</td><td>${item.qty}</td><td>₹${rate.toLocaleString("en-IN")}</td><td>₹${taxable.toLocaleString("en-IN")}</td><td>${gstR}%</td><td>₹${cgst}</td><td>₹${cgst}</td><td>₹${(taxable+parseFloat(cgst)*2).toFixed(2)}</td></tr>`;
    }).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>GST Bill - ${order.id}</title><style>body{font-family:Arial;padding:24px;font-size:12px;color:#333;}h1{text-align:center;color:#00a876;font-size:20px;}h2{color:#1a6eb8;border-bottom:2px solid #eee;padding-bottom:4px;margin-top:18px;}.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;border-bottom:3px solid #00a876;padding-bottom:12px;}.bname{font-size:20px;font-weight:900;}.badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:bold;background:${isWS?"#dbeafe":"#dcfce7"};color:${isWS?"#1d4ed8":"#16a34a"};}.info{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}.ibox{border:1px solid #eee;border-radius:6px;padding:9px;}.il{font-size:9px;color:#888;text-transform:uppercase;}.iv{font-size:13px;font-weight:600;}table{width:100%;border-collapse:collapse;margin-bottom:12px;}th{background:#f5f5f5;padding:7px;text-align:left;border:1px solid #ddd;font-size:10px;}td{padding:7px;border:1px solid #eee;}.totbox{background:#f9f9f9;border:2px solid #00a876;border-radius:8px;padding:13px;max-width:300px;margin-left:auto;}.tr{display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;}.gt{display:flex;justify-content:space-between;font-size:18px;font-weight:900;color:#00a876;border-top:2px solid #00a876;padding-top:7px;margin-top:7px;}.footer{text-align:center;color:#aaa;font-size:10px;margin-top:18px;border-top:1px solid #eee;padding-top:9px;}@media print{body{padding:10px;}}</style></head><body>
    <div class="hdr"><div><div class="bname">🏪 ${business.name||"RetailPRO"}</div><div style="font-size:11px;color:#666;margin-top:3px">${business.address||""}</div><div style="font-size:11px;color:#666">GSTIN: ${business.gstin||"N/A"} | Ph: ${business.phone||""}</div></div><div style="text-align:right"><div style="font-size:18px;font-weight:bold;color:${isWS?"#1d4ed8":"#00a876"}">TAX INVOICE</div><div style="margin-top:5px"><span class="badge">${isWS?"🏭 WHOLESALE":"🛒 RETAIL"}</span></div><div style="margin-top:7px;font-size:11px;color:#666">Bill No: <b>${order.id}</b></div><div style="font-size:11px;color:#666">Date: <b>${order.time}</b></div></div></div>
    <div class="info"><div class="ibox"><div class="il">Bill To</div><div class="iv">${order.customer}</div>${order.phone?`<div style="font-size:11px;color:#666">Ph: ${order.phone}</div>`:""}</div><div class="ibox"><div class="il">Payment</div><div class="iv">${order.payment}</div></div></div>
    <table><thead><tr><th>Product</th><th>HSN</th><th>Qty</th><th>Rate</th><th>Taxable</th><th>GST%</th><th>CGST</th><th>SGST</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="totbox">
      <div class="tr"><span>Subtotal</span><span>₹${order.subtotal.toLocaleString("en-IN")}</span></div>
      ${order.discountAmt>0?`<div class="tr" style="color:red"><span>Discount(${order.discount}%)</span><span>-₹${order.discountAmt.toLocaleString("en-IN")}</span></div>`:""}
      <div class="tr"><span>CGST</span><span>₹${(order.gst_amount/2).toFixed(2)}</span></div>
      <div class="tr"><span>SGST</span><span>₹${(order.gst_amount/2).toFixed(2)}</span></div>
      <div class="gt"><span>GRAND TOTAL</span><span>₹${order.total.toLocaleString("en-IN")}</span></div>
    </div>
    <div class="footer"><p>${business.name||"RetailPRO"} · ${business.city||""} · GSTIN: ${business.gstin||"N/A"}</p><p>Computer generated invoice</p></div>
    <script>window.onload=()=>{window.print();}<\/script></body></html>`);
    w.document.close();
  };

  return(
    <>
      {receipt&&(
        <Modal onClose={()=>setReceipt(null)} width={380}>
          <div style={{padding:22,fontFamily:"monospace",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:900,marginBottom:3}}>{business.logo||"🏪"} {business.name||"RetailPRO"}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:10}}>{business.city ? `${business.city} · ` : ""}GSTIN: {business.gstin||"N/A"}</div>
            <div style={{display:"inline-block",padding:"2px 12px",borderRadius:20,background:mode==="wholesale"?"rgba(59,130,246,.15)":"rgba(0,229,160,.12)",color:mode==="wholesale"?C.blue:C.green,fontSize:11,fontWeight:700,marginBottom:12}}>{mode==="wholesale"?"🏭 WHOLESALE":"🛒 RETAIL"}</div>
            <div style={{borderTop:`1px dashed ${C.border2}`,paddingTop:10,marginBottom:8,fontSize:11,color:C.muted,display:"flex",justifyContent:"space-between"}}><span>{receipt.id}</span><span>{receipt.time}</span></div>
            <div style={{fontSize:12,textAlign:"left",marginBottom:10}}><div>Customer: <b>{receipt.customer}</b></div>{receipt.phone&&<div>Phone: {receipt.phone}</div>}</div>
            <div style={{borderTop:`1px dashed ${C.border2}`,paddingTop:9}}>
              {receipt.cart.map(item=>(
                <div key={item.id} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
                  <span>{item.emoji} {item.name} ×{item.qty}</span><span>{fmt((mode==="wholesale"?item.wholesalePrice:item.retailPrice)*item.qty)}</span>
                </div>
              ))}
            </div>
            <div style={{borderTop:`1px dashed ${C.border2}`,marginTop:9,paddingTop:9}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:C.muted}}>Subtotal</span><span>{fmt(receipt.subtotal)}</span></div>
              {receipt.discountAmt>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3,color:C.red}}><span>Discount({receipt.discount}%)</span><span>-{fmt(receipt.discountAmt)}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:7,color:C.muted}}><span>GST(5%)</span><span>{fmt(receipt.gst_amount)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:20,color:mode==="wholesale"?C.blue:C.green}}><span>TOTAL</span><span>{fmt(receipt.total)}</span></div>
              <div style={{color:C.green,fontWeight:700,fontSize:12,marginTop:5}}>✓ Paid via {receipt.payment}</div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button style={{...btn(C.green),flex:1}} onClick={()=>printGSTBill(receipt)}>🖨️ GST Bill</button>
              <button onClick={()=>setReceipt(null)} style={{flex:1,padding:"11px 0",borderRadius:10,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>Close</button>
            </div>
          </div>
        </Modal>
      )}

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'Space Grotesk',sans-serif"}}>
        <div style={{padding:"8px 16px",background:mode==="wholesale"?"rgba(59,130,246,.08)":"rgba(0,229,160,.06)",borderBottom:`1px solid ${mode==="wholesale"?"#152040":"#0a2820"}`,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:12,fontWeight:700,color:accent,flex:1}}>{mode==="wholesale"?"🏭 WHOLESALE":"🛒 RETAIL"} MODE</span>
          <div style={{display:"flex",gap:3,background:C.dim,borderRadius:8,padding:3}}>
            {["retail","wholesale"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:"5px 14px",borderRadius:6,border:"none",background:mode===m?(m==="retail"?C.green:C.blue):"transparent",color:mode===m?"#050F08":C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>{m==="retail"?"🛒 Retail":"🏭 Wholesale"}</button>)}
          </div>
        </div>
        <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8,flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:200}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.muted,fontSize:13}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search or scan barcode…" style={{...inp({paddingLeft:34})}}/>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {CATS.filter(c=>c==="All"||products.some(p=>p.category===c)).map(cat=>(
              <button key={cat} onClick={()=>setCategory(cat)} style={{padding:"6px 12px",borderRadius:20,border:`1px solid`,borderColor:category===cat?accent:C.border2,background:category===cat?`${accent}22`:"transparent",color:category===cat?accent:C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:11,cursor:"pointer"}}>{cat}</button>
            ))}
          </div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:13}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(138px,1fr))",gap:9}}>
            {filtered.map(p=>(
              <div key={p.id} onClick={()=>addToCart(p)} style={{background:C.card,border:`1px solid ${p.stock===0?"rgba(239,68,68,.3)":C.border}`,borderRadius:12,padding:"12px 10px",cursor:p.stock===0?"not-allowed":"pointer",opacity:p.stock===0?.6:1,transition:"all .15s"}}>
                <div style={{fontSize:24,marginBottom:5}}>{p.emoji}</div>
                <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{p.name}</div>
                <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{p.unit}</div>
                <div style={{fontSize:15,fontWeight:900,color:p.stock===0?C.red:accent}}>{p.stock===0?"OUT":fmt(price(p))}</div>
                {mode==="wholesale"&&p.stock>0&&<div style={{fontSize:9,color:C.muted,textDecoration:"line-through"}}>MRP {fmt(p.retailPrice)}</div>}
                <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                  <span style={{fontSize:9,color:C.muted}}>{p.category}</span>
                  <span style={{fontSize:9,fontWeight:700,color:p.stock===0?C.red:p.stock<=(p.reorderLevel||10)?C.yellow:C.muted}}>{p.stock===0?"🚨0":p.stock<=(p.reorderLevel||10)?`⚠${p.stock}`:p.stock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart */}
      <div style={{width:310,background:C.card,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",fontFamily:"'Space Grotesk',sans-serif"}}>
        <div style={{padding:"13px 15px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
            <div style={{fontWeight:800,fontSize:14}}>Cart <span style={{color:accent}}>({cart.length})</span></div>
            {cart.length>0&&<button onClick={()=>setCart([])} style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:12,fontWeight:600}}>Clear</button>}
          </div>
          <div style={{position:"relative",marginBottom:6}}>
            <input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder={mode==="wholesale"?"Firm / Customer name *":"Customer name"} style={inp({fontSize:12})}/>
          </div>
          <div style={{display:"flex",gap:6,position:"relative"}}>
            <input value={phone} onChange={e=>handlePhone(e.target.value)} placeholder="Phone" style={inp({flex:1,fontSize:12})}/>
            {mode==="wholesale"&&<input value={gstin} onChange={e=>setGstin(e.target.value)} placeholder="GSTIN" style={inp({flex:1,fontSize:12})}/>}
          </div>
          {custSuggest.length>0&&(
            <div style={{background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,marginTop:4,overflow:"hidden"}}>
              {custSuggest.map(c=><div key={c.id} onClick={()=>{setCustomer(c.name);setPhone(c.phone);setCustSuggest([]);}} style={{padding:"7px 12px",cursor:"pointer",fontSize:12,display:"flex",justifyContent:"space-between"}}><span>{c.name}</span><span style={{color:C.muted}}>{c.phone}</span></div>)}
            </div>
          )}
        </div>
        <div style={{flex:1,overflow:"auto",padding:"9px 12px"}}>
          {cart.length===0?<div style={{textAlign:"center",padding:"36px 0",color:C.muted}}><div style={{fontSize:38}}>🛒</div><div style={{fontSize:12,marginTop:7}}>Tap product to add</div></div>
          :cart.map(item=>(
            <div key={item.id} style={{background:C.dim,borderRadius:9,padding:"9px 11px",marginBottom:7}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <div style={{fontSize:12,fontWeight:700}}>{item.emoji} {item.name}</div>
                <button onClick={()=>setCart(p=>p.filter(i=>i.id!==item.id))} style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:15}}>×</button>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button onClick={()=>updateQty(item.id,-1)} style={{width:24,height:24,borderRadius:6,border:`1px solid ${C.border2}`,background:C.card,color:C.text,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                  <span style={{fontSize:13,fontWeight:800,minWidth:18,textAlign:"center"}}>{item.qty}</span>
                  <button onClick={()=>updateQty(item.id,1)} style={{width:24,height:24,borderRadius:6,border:`1px solid ${C.border2}`,background:C.card,color:C.text,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                </div>
                <div style={{fontSize:14,fontWeight:900,color:accent}}>{fmt(price(item)*item.qty)}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:"11px 14px",borderTop:`1px solid ${C.border}`}}>
          <div style={{marginBottom:9}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>DISCOUNT</div>
            <div style={{display:"flex",gap:3}}>{[0,5,10,15,20].map(d=><button key={d} onClick={()=>setDiscount(d)} style={{flex:1,padding:"5px 0",borderRadius:6,border:"1px solid",borderColor:discount===d?accent:C.border2,background:discount===d?`${accent}22`:"transparent",color:discount===d?accent:C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:10,cursor:"pointer"}}>{d}%</button>)}</div>
          </div>
          <div style={{background:C.dim,borderRadius:9,padding:"9px 11px",marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:C.muted}}>Subtotal</span><span>{fmt(subtotal)}</span></div>
            {discount>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3,color:C.red}}><span>Discount({discount}%)</span><span>-{fmt(discountAmt)}</span></div>}
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6,color:C.muted}}><span>GST(5%)</span><span>{fmt(gstAmt)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:18,color:accent}}><span>TOTAL</span><span>{fmt(total)}</span></div>
          </div>
          <div style={{display:"flex",gap:3,marginBottom:9}}>{PAY_METHODS.map(m=><button key={m} onClick={()=>setPayment(m)} style={{flex:1,padding:"6px 0",borderRadius:7,border:"1px solid",borderColor:payment===m?accent:C.border2,background:payment===m?`${accent}18`:"transparent",color:payment===m?accent:C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:9,cursor:"pointer"}}>{m==="Cash"?"💵":m==="UPI"?"📱":m==="Card"?"💳":m==="Credit"?"📒":"🧾"}<br/>{m}</button>)}</div>
          <button onClick={checkout} style={{width:"100%",background:mode==="wholesale"?`linear-gradient(135deg,#1d3a8c,${C.blue})`:`linear-gradient(135deg,#00a876,${C.green})`,color:"#050F08",border:"none",borderRadius:11,padding:"12px 0",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:900,fontSize:14}}>
            ⚡ Checkout {cart.length>0?`· ${fmt(total)}`:""}
          </button>
          <div style={{textAlign:"center",marginTop:5,fontSize:10,color:C.muted}}>Stock auto-updates · GST calculated ✓</div>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
// SUPPLIERS PAGE
// ══════════════════════════════════════════════════════════════════
function SuppliersPage({notify}){
  const [suppliers,setSuppliers]=useState(()=>DB.get("suppliers",SEED_SUPPLIERS));
  const [purchases,setPurchases]=useState(()=>DB.get("purchases",[]));
  const [modal,setModal]=useState(null);
  const [purchModal,setPurchModal]=useState(null);
  const [search,setSearch]=useState("");
  const EMPTY_S={name:"",type:"Wholesaler",contact:"",phone:"",email:"",address:"",gstin:"",category:"Grocery",rating:4,creditLimit:0,notes:""};
  const [form,setForm]=useState(EMPTY_S);
  const [pForm,setPForm]=useState({supplierId:"",items:"",amount:"",invoice:"",date:todayK(),notes:""});
  const sf=(k,v)=>setForm(p=>({...p,[k]:v}));

  const save=()=>{
    if(!form.name||!form.phone){notify("Name & phone required","error");return;}
    let upd;
    if(modal==="add"){upd=[...suppliers,{...form,id:uid(),joinDate:todayK(),totalPurchase:0}];}
    else upd=suppliers.map(s=>s.id===form.id?{...s,...form}:s);
    setSuppliers(upd);DB.set("suppliers",upd);notify(modal==="add"?"Supplier added!":"Updated!","success");setModal(null);setForm(EMPTY_S);
  };
  const savePurchase=()=>{
    if(!pForm.supplierId||!pForm.amount){notify("Supplier & amount required","error");return;}
    const np={...pForm,id:uid(),amount:Number(pForm.amount),createdAt:Date.now()};
    const upd=[np,...purchases];setPurchases(upd);DB.set("purchases",upd);
    const supUpd=suppliers.map(s=>s.id===pForm.supplierId?{...s,totalPurchase:(s.totalPurchase||0)+np.amount}:s);
    setSuppliers(supUpd);DB.set("suppliers",supUpd);
    setPurchModal(null);setPForm({supplierId:"",items:"",amount:"",invoice:"",date:todayK(),notes:""});
    notify("Purchase recorded!","success");
  };

  const filtered=suppliers.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||s.category.toLowerCase().includes(search.toLowerCase()));
  const totalSpend=suppliers.reduce((a,s)=>a+(s.totalPurchase||0),0);

  return(
    <div style={{flex:1,padding:24,overflow:"auto",color:C.text,fontFamily:"'Space Grotesk',sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><div style={{fontWeight:900,fontSize:22}}>🏭 Suppliers</div><div style={{fontSize:12,color:C.muted,marginTop:3}}>{suppliers.length} suppliers · Total spend: {fmt(totalSpend)}</div></div>
        <div style={{display:"flex",gap:9}}>
          <button style={{...btn(C.blue),padding:"9px 16px"}} onClick={()=>setPurchModal(true)}>+ Purchase</button>
          <button style={{...btn(C.green),padding:"9px 16px"}} onClick={()=>{setForm(EMPTY_S);setModal("add");}}>+ Add Supplier</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13,marginBottom:18}}>
        <StatCard icon="🏭" label="Total Suppliers" value={suppliers.length} color={C.blue}/>
        <StatCard icon="💰" label="Total Purchases" value={fmt(totalSpend)} color={C.green}/>
        <StatCard icon="🧾" label="Bills" value={purchases.length} color={C.purple}/>
      </div>
      <div style={{position:"relative",marginBottom:14}}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.muted}}>🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search supplier..." style={inp({paddingLeft:34})}/></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:13}}>
        {filtered.map(s=>{
          const myP=purchases.filter(p=>p.supplierId===s.id);
          return(
            <div key={s.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:15,padding:17}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div><div style={{fontWeight:800,fontSize:14}}>{s.name}</div><div style={{display:"flex",gap:5,marginTop:4}}><span style={{fontSize:10,padding:"1px 7px",borderRadius:6,background:"rgba(59,130,246,.15)",color:C.blue,fontWeight:700}}>{s.type}</span><span style={{fontSize:10,padding:"1px 7px",borderRadius:6,background:"rgba(0,229,160,.12)",color:C.green,fontWeight:700}}>{s.category}</span></div></div>
                <span>{"⭐".repeat(s.rating||0)}</span>
              </div>
              <div style={{fontSize:12,color:C.muted,marginBottom:3}}>👤 {s.contact}</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:7}}>📱 {s.phone}</div>
              <div style={{display:"flex",gap:7,marginBottom:11}}>
                <div style={{flex:1,background:C.dim,borderRadius:8,padding:"7px 0",textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>PURCHASE</div><div style={{fontSize:14,fontWeight:800,color:C.green}}>{fmt(myP.reduce((a,p)=>a+p.amount,0))}</div></div>
                <div style={{flex:1,background:C.dim,borderRadius:8,padding:"7px 0",textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>ORDERS</div><div style={{fontSize:14,fontWeight:800,color:C.blue}}>{myP.length}</div></div>
              </div>
              <div style={{display:"flex",gap:5}}>
                <button onClick={()=>{setForm({...s});setModal(s);}} style={{flex:1,padding:"6px 0",borderRadius:7,border:`1px solid ${C.border2}`,background:"transparent",color:C.blue,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:11}}>✏️ Edit</button>
                <button onClick={()=>{setPForm(p=>({...p,supplierId:s.id}));setPurchModal(true);}} style={{flex:1,padding:"6px 0",borderRadius:7,border:"none",background:`${C.green}22`,color:C.green,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:11}}>+ Purchase</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent purchases */}
      {purchases.length>0&&<div style={{marginTop:22}}>
        <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>🧾 Recent Purchases</div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1.5fr",padding:"9px 15px",borderBottom:`1px solid ${C.border}`,color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}><span>Supplier</span><span>Date</span><span>Invoice</span><span>Amount</span><span>Notes</span></div>
          {purchases.slice(0,15).map(p=>{const sup=suppliers.find(s=>s.id===p.supplierId);return(
            <div key={p.id} style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1.5fr",padding:"10px 15px",borderBottom:`1px solid ${C.dim}`,fontSize:12,alignItems:"center"}}>
              <span style={{fontWeight:700}}>{sup?.name||"Unknown"}</span><span style={{color:C.muted}}>{p.date}</span>
              <span style={{fontFamily:"monospace",color:C.blue,fontSize:11}}>{p.invoice||"—"}</span>
              <span style={{fontWeight:800,color:C.green}}>{fmt(p.amount)}</span><span style={{color:C.muted,fontSize:11}}>{p.notes||"—"}</span>
            </div>
          );})}
        </div>
      </div>}

      {modal&&<Modal onClose={()=>setModal(null)}><div style={{padding:22}}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:18,color:C.text}}>{modal==="add"?"➕ Add Supplier":"✏️ Edit Supplier"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          <div style={{gridColumn:"1/-1"}}><label style={lbl}>Name *</label><input style={inp()} value={form.name} onChange={e=>sf("name",e.target.value)} placeholder="ABC Wholesaler"/></div>
          <div><label style={lbl}>Type</label><select style={inp({cursor:"pointer"})} value={form.type} onChange={e=>sf("type",e.target.value)}>{SUP_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label style={lbl}>Category</label><select style={inp({cursor:"pointer"})} value={form.category} onChange={e=>sf("category",e.target.value)}>{PCATS.map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label style={lbl}>Contact Person</label><input style={inp()} value={form.contact} onChange={e=>sf("contact",e.target.value)}/></div>
          <div><label style={lbl}>Phone *</label><input style={inp()} value={form.phone} onChange={e=>sf("phone",e.target.value)}/></div>
          <div><label style={lbl}>Email</label><input style={inp()} value={form.email} onChange={e=>sf("email",e.target.value)}/></div>
          <div><label style={lbl}>GSTIN</label><input style={inp()} value={form.gstin} onChange={e=>sf("gstin",e.target.value)}/></div>
          <div><label style={lbl}>Rating</label><select style={inp({cursor:"pointer"})} value={form.rating} onChange={e=>sf("rating",Number(e.target.value))}>{[1,2,3,4,5].map(r=><option key={r} value={r}>{r} ⭐</option>)}</select></div>
          <div style={{gridColumn:"1/-1"}}><label style={lbl}>Address</label><textarea style={{...inp(),resize:"vertical"}} rows={2} value={form.address} onChange={e=>sf("address",e.target.value)}/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}><button style={{...btn(C.green),flex:1}} onClick={save}>✓ Save</button><button onClick={()=>setModal(null)} style={{padding:"11px 18px",borderRadius:10,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>Cancel</button></div>
      </div></Modal>}

      {purchModal&&<Modal onClose={()=>setPurchModal(null)} width={440}><div style={{padding:22}}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:18,color:C.text}}>📦 Record Purchase</div>
        <div style={{display:"grid",gap:11}}>
          <div><label style={lbl}>Supplier *</label><select style={inp({cursor:"pointer"})} value={pForm.supplierId} onChange={e=>setPForm(p=>({...p,supplierId:e.target.value}))}><option value="">Select...</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label style={lbl}>Invoice #</label><input style={inp()} value={pForm.invoice} onChange={e=>setPForm(p=>({...p,invoice:e.target.value}))} placeholder="INV-001"/></div>
          <div><label style={lbl}>Date</label><input type="date" style={inp()} value={pForm.date} onChange={e=>setPForm(p=>({...p,date:e.target.value}))}/></div>
          <div><label style={lbl}>Amount (₹) *</label><input type="number" style={inp()} value={pForm.amount} onChange={e=>setPForm(p=>({...p,amount:e.target.value}))} placeholder="0"/></div>
          <div><label style={lbl}>Items</label><textarea style={{...inp(),resize:"vertical"}} rows={2} value={pForm.items} onChange={e=>setPForm(p=>({...p,items:e.target.value}))} placeholder="Rice 100kg, Dal 50kg..."/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}><button style={{...btn(C.green),flex:1}} onClick={savePurchase}>✓ Save</button><button onClick={()=>setPurchModal(null)} style={{padding:"11px 18px",borderRadius:10,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>Cancel</button></div>
      </div></Modal>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// CUSTOMERS PAGE
// ══════════════════════════════════════════════════════════════════
function CustomersPage({orders,notify}){
  const [customers,setCustomers]=useState(()=>DB.get("customers",[]));
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [search,setSearch]=useState("");
  const EMPTY_C={name:"",phone:"",email:"",address:"",gstin:"",type:"Retail",creditLimit:0,dob:"",notes:""};
  const [form,setForm]=useState(EMPTY_C);

  const save=()=>{
    if(!form.name||!form.phone){notify("Name & phone required","error");return;}
    let upd;
    if(modal==="add")upd=[...customers,{...form,id:uid(),joinDate:todayK()}];
    else upd=customers.map(c=>c.id===form.id?{...c,...form}:c);
    setCustomers(upd);DB.set("customers",upd);notify(modal==="add"?"Customer added!":"Updated!","success");setModal(null);setForm(EMPTY_C);
  };

  const getStats=name=>{const myO=orders.filter(o=>o.customer===name);return{orderCount:myO.length,totalSpend:myO.reduce((a,o)=>a+o.total,0)};};
  const top5=customers.map(c=>({...c,...getStats(c.name)})).sort((a,b)=>b.totalSpend-a.totalSpend).slice(0,5);
  const filtered=customers.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search));

  return(
    <div style={{flex:1,padding:24,overflow:"auto",color:C.text,fontFamily:"'Space Grotesk',sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><div style={{fontWeight:900,fontSize:22}}>👥 Customers</div><div style={{fontSize:12,color:C.muted,marginTop:3}}>{customers.length} registered</div></div>
        <button style={{...btn(C.green),padding:"9px 16px"}} onClick={()=>{setForm(EMPTY_C);setModal("add");}}>+ Add Customer</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:18}}>
        <StatCard icon="👥" label="Total" value={customers.length} color={C.blue}/>
        <StatCard icon="💰" label="Revenue" value={fmt(customers.reduce((a,c)=>a+getStats(c.name).totalSpend,0))} color={C.green}/>
        <StatCard icon="🏆" label="Top Customer" value={top5[0]?.name?.split(" ")[0]||"—"} color={C.yellow}/>
        <StatCard icon="🔄" label="Repeat Rate" value={customers.length>0?`${Math.round(customers.filter(c=>getStats(c.name).orderCount>1).length/customers.length*100)}%`:"0%"} color={C.purple}/>
      </div>
      {top5.length>0&&<div style={{marginBottom:18}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:9,color:C.yellow}}>🏆 Top Customers</div>
        <div style={{display:"flex",gap:9,overflowX:"auto",paddingBottom:6}}>
          {top5.map((c,i)=><div key={c.id} style={{background:C.card,border:`1px solid ${i===0?C.yellow:C.border}`,borderRadius:11,padding:"11px 15px",minWidth:150,flexShrink:0}}>
            <div style={{fontSize:18,marginBottom:3}}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</div>
            <div style={{fontWeight:700,fontSize:13}}>{c.name}</div>
            <div style={{fontSize:11,color:C.muted}}>{c.phone}</div>
            <div style={{fontSize:15,fontWeight:900,color:C.green,marginTop:5}}>{fmt(c.totalSpend)}</div>
            <div style={{fontSize:10,color:C.muted}}>{c.orderCount} orders</div>
          </div>)}
        </div>
      </div>}
      <div style={{position:"relative",marginBottom:14}}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.muted}}>🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or phone..." style={inp({paddingLeft:34})}/></div>
      {filtered.length===0?<div style={{textAlign:"center",padding:"60px 0",color:C.muted}}><div style={{fontSize:50}}>👥</div><div style={{marginTop:9,fontSize:15,fontWeight:700}}>No customers</div><div style={{fontSize:12,marginTop:3}}>POS checkout se auto-save honge</div></div>
      :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:13}}>
        {filtered.map(c=>{const s=getStats(c.name);return(
          <div key={c.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:15,cursor:"pointer"}} onClick={()=>setSelected(c)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
              <div><div style={{fontWeight:800,fontSize:14}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>📱 {c.phone}</div></div>
              <span style={{fontSize:10,padding:"1px 7px",borderRadius:6,background:c.type==="Wholesale"?"rgba(59,130,246,.15)":"rgba(0,229,160,.12)",color:c.type==="Wholesale"?C.blue:C.green,fontWeight:700}}>{c.type}</span>
            </div>
            <div style={{display:"flex",gap:7}}>
              <div style={{flex:1,background:C.dim,borderRadius:8,padding:"7px 0",textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>SPENT</div><div style={{fontSize:14,fontWeight:800,color:C.green}}>{fmt(s.totalSpend)}</div></div>
              <div style={{flex:1,background:C.dim,borderRadius:8,padding:"7px 0",textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>ORDERS</div><div style={{fontSize:14,fontWeight:800,color:C.blue}}>{s.orderCount}</div></div>
            </div>
            <button onClick={e=>{e.stopPropagation();setForm({...c});setModal(c);}} style={{width:"100%",marginTop:9,padding:"6px 0",borderRadius:7,border:`1px solid ${C.border2}`,background:"transparent",color:C.blue,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:11}}>✏️ Edit</button>
          </div>
        );})}
      </div>}

      {modal&&<Modal onClose={()=>setModal(null)}><div style={{padding:22}}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:18,color:C.text}}>{modal==="add"?"➕ Add Customer":"✏️ Edit Customer"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          <div style={{gridColumn:"1/-1"}}><label style={lbl}>Full Name *</label><input style={inp()} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Ramesh Kumar"/></div>
          <div><label style={lbl}>Phone *</label><input style={inp()} value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/></div>
          <div><label style={lbl}>Type</label><select style={inp({cursor:"pointer"})} value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}><option>Retail</option><option>Wholesale</option><option>VIP</option></select></div>
          <div><label style={lbl}>Email</label><input style={inp()} value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
          <div><label style={lbl}>GSTIN</label><input style={inp()} value={form.gstin} onChange={e=>setForm(p=>({...p,gstin:e.target.value}))}/></div>
          <div><label style={lbl}>DOB</label><input type="date" style={inp()} value={form.dob} onChange={e=>setForm(p=>({...p,dob:e.target.value}))}/></div>
          <div><label style={lbl}>Credit Limit (₹)</label><input type="number" style={inp()} value={form.creditLimit} onChange={e=>setForm(p=>({...p,creditLimit:e.target.value}))}/></div>
          <div style={{gridColumn:"1/-1"}}><label style={lbl}>Address</label><textarea style={{...inp(),resize:"vertical"}} rows={2} value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))}/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}><button style={{...btn(C.green),flex:1}} onClick={save}>✓ Save</button><button onClick={()=>setModal(null)} style={{padding:"11px 18px",borderRadius:10,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>Cancel</button></div>
      </div></Modal>}

      {selected&&<Modal onClose={()=>setSelected(null)} width={500}><div style={{padding:22}}>
        <div style={{fontWeight:800,fontSize:18,marginBottom:3}}>{selected.name}</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:14}}>📱 {selected.phone} · Since {selected.joinDate}</div>
        {(()=>{const s=getStats(selected.name);const myO=orders.filter(o=>o.customer===selected.name);return(<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:14}}>
            <div style={{background:C.dim,borderRadius:9,padding:11,textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>TOTAL SPENT</div><div style={{fontSize:17,fontWeight:900,color:C.green}}>{fmt(s.totalSpend)}</div></div>
            <div style={{background:C.dim,borderRadius:9,padding:11,textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>ORDERS</div><div style={{fontSize:17,fontWeight:900,color:C.blue}}>{s.orderCount}</div></div>
            <div style={{background:C.dim,borderRadius:9,padding:11,textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>AVG</div><div style={{fontSize:17,fontWeight:900,color:C.purple}}>{s.orderCount>0?fmt(Math.round(s.totalSpend/s.orderCount)):"₹0"}</div></div>
          </div>
          {myO.slice(0,5).map(o=><div key={o.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 11px",background:C.dim,borderRadius:8,marginBottom:5,fontSize:12}}><span style={{color:C.muted}}>{o.time}</span><span style={{color:C.muted}}>{o.cart?.length||0} items</span><span style={{fontWeight:700,color:C.green}}>{fmt(o.total)}</span></div>)}
        </>)})()}
        <button onClick={()=>setSelected(null)} style={{width:"100%",marginTop:14,padding:"10px 0",borderRadius:9,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>Close</button>
      </div></Modal>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// EMPLOYEES PAGE
// ══════════════════════════════════════════════════════════════════
function EmployeesPage({notify}){
  const [employees,setEmployees]=useState(()=>DB.get("employees",[]));
  const [attendance,setAttendance]=useState(()=>DB.get("attendance",[]));
  const [modal,setModal]=useState(null);
  const [attModal,setAttModal]=useState(false);
  const [tab,setTab]=useState("list");
  const EMPTY_E={name:"",phone:"",email:"",role:"Cashier",salary:15000,salaryType:"Monthly",joinDate:todayK(),commissionRate:0,shiftStart:"09:00",shiftEnd:"18:00",notes:""};
  const [form,setForm]=useState(EMPTY_E);
  const [attForm,setAttForm]=useState({empId:"",date:todayK(),inTime:"09:00",outTime:"18:00",status:"Present",notes:""});

  const saveEmp=()=>{
    if(!form.name||!form.phone){notify("Name & phone required","error");return;}
    let upd;
    if(modal==="add")upd=[...employees,{...form,id:uid(),salary:Number(form.salary)||0}];
    else upd=employees.map(e=>e.id===form.id?{...e,...form,salary:Number(form.salary)||0}:e);
    setEmployees(upd);DB.set("employees",upd);notify(modal==="add"?"Employee added!":"Updated!","success");setModal(null);setForm(EMPTY_E);
  };
  const saveAtt=()=>{
    if(!attForm.empId){notify("Select employee","error");return;}
    const [ih,im]=attForm.inTime.split(":").map(Number);
    const [oh,om]=attForm.outTime.split(":").map(Number);
    const hoursWorked=Math.max(0,((oh*60+om)-(ih*60+im))/60);
    const na={...attForm,id:uid(),hoursWorked,createdAt:Date.now()};
    const upd=[...attendance,na];setAttendance(upd);DB.set("attendance",upd);
    notify("Attendance marked!","success");setAttModal(false);
  };
  const getSalaryInfo=emp=>{
    const mA=attendance.filter(a=>a.empId===emp.id&&a.date?.slice(0,7)===monthK());
    const presentDays=mA.filter(a=>a.status==="Present"||a.status==="Half Day").length;
    const totalHours=mA.reduce((a,d)=>a+Number(d.hoursWorked||0),0);
    return{presentDays,totalHours:totalHours.toFixed(1),earnedSalary:Math.round((emp.salary/26)*presentDays)};
  };

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",color:C.text,fontFamily:"'Space Grotesk',sans-serif"}}>
      <div style={{padding:"15px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontWeight:900,fontSize:19}}>👨‍💼 Employees</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>Monthly payroll: {fmt(employees.reduce((a,e)=>a+e.salary,0))}</div></div>
        <div style={{display:"flex",gap:9}}>
          <button style={{...btn(C.blue),padding:"8px 14px"}} onClick={()=>setAttModal(true)}>📋 Attendance</button>
          <button style={{...btn(C.green),padding:"8px 14px"}} onClick={()=>{setForm(EMPTY_E);setModal("add");}}>+ Add</button>
        </div>
      </div>
      <div style={{padding:"10px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:5}}>
        {[{id:"list",l:"👨‍💼 Team"},{id:"attendance",l:"📋 Attendance"},{id:"salary",l:"💰 Salary"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"6px 15px",borderRadius:8,border:`1px solid`,borderColor:tab===t.id?C.green:C.border2,background:tab===t.id?"rgba(0,229,160,.12)":"transparent",color:tab===t.id?C.green:C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>{t.l}</button>
        ))}
      </div>
      <div style={{flex:1,overflow:"auto",padding:22}}>
        {tab==="list"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:13}}>
          {employees.map(e=>{const info=getSalaryInfo(e);return(
            <div key={e.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:15,padding:17}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
                <div><div style={{fontWeight:800,fontSize:15}}>👤 {e.name}</div><div style={{fontSize:11,color:C.muted}}>{e.role}</div></div>
                <div style={{fontWeight:700,fontSize:13,color:C.green}}>{fmt(e.salary)}<span style={{color:C.muted,fontSize:10,fontWeight:400}}>/mo</span></div>
              </div>
              <div style={{fontSize:12,color:C.muted,marginBottom:3}}>📱 {e.phone}</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:9}}>🕐 {e.shiftStart}–{e.shiftEnd} · Since {e.joinDate}</div>
              {e.commissionRate>0&&<div style={{fontSize:11,color:C.yellow,marginBottom:9}}>Commission: {e.commissionRate}%</div>}
              <div style={{display:"flex",gap:7,marginBottom:9}}>
                <div style={{flex:1,background:C.dim,borderRadius:7,padding:"7px 0",textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>DAYS</div><div style={{fontSize:14,fontWeight:800,color:C.blue}}>{info.presentDays}</div></div>
                <div style={{flex:1,background:C.dim,borderRadius:7,padding:"7px 0",textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>HOURS</div><div style={{fontSize:14,fontWeight:800,color:C.orange}}>{info.totalHours}h</div></div>
                <div style={{flex:1,background:C.dim,borderRadius:7,padding:"7px 0",textAlign:"center"}}><div style={{fontSize:9,color:C.muted}}>EARNED</div><div style={{fontSize:13,fontWeight:800,color:C.green}}>{fmt(info.earnedSalary)}</div></div>
              </div>
              <button onClick={()=>{setForm({...e});setModal(e);}} style={{width:"100%",padding:"6px 0",borderRadius:7,border:`1px solid ${C.border2}`,background:"transparent",color:C.blue,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:11}}>✏️ Edit</button>
            </div>
          );})}
        </div>}
        {tab==="attendance"&&(attendance.length===0?<div style={{textAlign:"center",padding:"60px 0",color:C.muted}}><div style={{fontSize:48}}>📋</div><div style={{marginTop:9}}>No attendance records</div></div>
        :<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1fr 1fr",padding:"9px 15px",borderBottom:`1px solid ${C.border}`,color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}><span>Employee</span><span>Date</span><span>In</span><span>Out</span><span>Hours</span><span>Status</span></div>
          {attendance.slice().reverse().map(a=>{const emp=employees.find(e=>e.id===a.empId);return(
            <div key={a.id} style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1fr 1fr",padding:"10px 15px",borderBottom:`1px solid ${C.dim}`,fontSize:12,alignItems:"center"}}>
              <span style={{fontWeight:700}}>{emp?.name||"Unknown"}</span><span style={{color:C.muted}}>{a.date}</span><span>{a.inTime}</span><span>{a.outTime}</span>
              <span style={{color:C.orange,fontWeight:700}}>{a.hoursWorked}h</span>
              <span style={{padding:"1px 7px",borderRadius:6,fontSize:10,fontWeight:700,background:a.status==="Present"?"rgba(0,229,160,.15)":a.status==="Absent"?"rgba(239,68,68,.15)":"rgba(251,191,36,.12)",color:a.status==="Present"?C.green:a.status==="Absent"?C.red:C.yellow,display:"inline-block"}}>{a.status}</span>
            </div>
          );})}
        </div>)}
        {tab==="salary"&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1fr 1fr",padding:"9px 15px",borderBottom:`1px solid ${C.border}`,color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}><span>Employee</span><span>Role</span><span>Base Salary</span><span>Days</span><span>Hours</span><span>Earned</span></div>
          {employees.map(e=>{const i=getSalaryInfo(e);return(
            <div key={e.id} style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1fr 1fr",padding:"12px 15px",borderBottom:`1px solid ${C.dim}`,fontSize:12,alignItems:"center"}}>
              <span style={{fontWeight:700}}>{e.name}</span><span style={{color:C.muted}}>{e.role}</span>
              <span style={{fontWeight:700}}>{fmt(e.salary)}</span><span style={{color:C.blue,fontWeight:700}}>{i.presentDays}/26</span>
              <span style={{color:C.orange}}>{i.totalHours}h</span><span style={{fontWeight:800,color:C.green}}>{fmt(i.earnedSalary)}</span>
            </div>
          );})}
        </div>}
      </div>

      {modal&&<Modal onClose={()=>setModal(null)}><div style={{padding:22}}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:18,color:C.text}}>{modal==="add"?"➕ Add Employee":"✏️ Edit Employee"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          <div style={{gridColumn:"1/-1"}}><label style={lbl}>Full Name *</label><input style={inp()} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
          <div><label style={lbl}>Phone *</label><input style={inp()} value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/></div>
          <div><label style={lbl}>Role</label><select style={inp({cursor:"pointer"})} value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>{EMP_ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
          <div><label style={lbl}>Salary (₹/mo)</label><input type="number" style={inp()} value={form.salary} onChange={e=>setForm(p=>({...p,salary:e.target.value}))}/></div>
          <div><label style={lbl}>Commission (%)</label><input type="number" style={inp()} value={form.commissionRate} onChange={e=>setForm(p=>({...p,commissionRate:e.target.value}))} placeholder="0"/></div>
          <div><label style={lbl}>Shift Start</label><input type="time" style={inp()} value={form.shiftStart} onChange={e=>setForm(p=>({...p,shiftStart:e.target.value}))}/></div>
          <div><label style={lbl}>Shift End</label><input type="time" style={inp()} value={form.shiftEnd} onChange={e=>setForm(p=>({...p,shiftEnd:e.target.value}))}/></div>
          <div><label style={lbl}>Join Date</label><input type="date" style={inp()} value={form.joinDate} onChange={e=>setForm(p=>({...p,joinDate:e.target.value}))}/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}><button style={{...btn(C.green),flex:1}} onClick={saveEmp}>✓ Save</button><button onClick={()=>setModal(null)} style={{padding:"11px 18px",borderRadius:10,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>Cancel</button></div>
      </div></Modal>}

      {attModal&&<Modal onClose={()=>setAttModal(false)} width={440}><div style={{padding:22}}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:18,color:C.text}}>📋 Mark Attendance</div>
        <div style={{display:"grid",gap:11}}>
          <div><label style={lbl}>Employee *</label><select style={inp({cursor:"pointer"})} value={attForm.empId} onChange={e=>setAttForm(p=>({...p,empId:e.target.value}))}><option value="">Select...</option>{employees.map(e=><option key={e.id} value={e.id}>{e.name} — {e.role}</option>)}</select></div>
          <div><label style={lbl}>Date</label><input type="date" style={inp()} value={attForm.date} onChange={e=>setAttForm(p=>({...p,date:e.target.value}))}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>In Time</label><input type="time" style={inp()} value={attForm.inTime} onChange={e=>setAttForm(p=>({...p,inTime:e.target.value}))}/></div>
            <div><label style={lbl}>Out Time</label><input type="time" style={inp()} value={attForm.outTime} onChange={e=>setAttForm(p=>({...p,outTime:e.target.value}))}/></div>
          </div>
          <div><label style={lbl}>Status</label>
            <div style={{display:"flex",gap:5}}>{["Present","Absent","Half Day","Leave"].map(s=><button key={s} onClick={()=>setAttForm(p=>({...p,status:s}))} style={{flex:1,padding:"7px 0",borderRadius:7,border:`1px solid`,borderColor:attForm.status===s?C.green:C.border2,background:attForm.status===s?"rgba(0,229,160,.1)":"transparent",color:attForm.status===s?C.green:C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>{s}</button>)}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}><button style={{...btn(C.green),flex:1}} onClick={saveAtt}>✓ Mark</button><button onClick={()=>setAttModal(false)} style={{padding:"11px 18px",borderRadius:10,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>Cancel</button></div>
      </div></Modal>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// CASH FLOW + CREDIT LEDGER
// ══════════════════════════════════════════════════════════════════
function CashFlowPage({orders,notify}){
  const [expenses,setExpenses]=useState(()=>DB.get("expenses",[]));
  const [purchases]=useState(()=>DB.get("purchases",[]));
  const [period,setPeriod]=useState("monthly");
  const [dateFilter,setDateFilter]=useState(monthK());
  const [expModal,setExpModal]=useState(false);
  const [eForm,setEForm]=useState({amount:"",category:"Rent",note:"",date:todayK(),type:"expense"});
  const EXP_CATS=["Rent","Salary","Electricity","Transport","Packaging","Marketing","Repairs","Misc"];

  const fD=d=>{if(!d)return false;if(period==="daily")return d.slice(0,10)===dateFilter;if(period==="monthly")return d.slice(0,7)===dateFilter.slice(0,7);if(period==="yearly")return d.slice(0,4)===dateFilter.slice(0,4);return true;};
  const fO=orders.filter(o=>fD(new Date(o.timestamp).toISOString().slice(0,10)));
  const fE=expenses.filter(e=>fD(e.date));
  const fP=purchases.filter(p=>fD(p.date));
  const totalSales=fO.reduce((a,o)=>a+o.total,0);
  const totalPurch=fP.reduce((a,p)=>a+p.amount,0);
  const totalExp=fE.filter(e=>e.type!=="income").reduce((a,e)=>a+e.amount,0);
  const totalIncome=fE.filter(e=>e.type==="income").reduce((a,e)=>a+e.amount,0);
  const gstCollected=fO.reduce((a,o)=>a+(o.gst_amount||0),0);
  const grossProfit=totalSales-totalPurch;
  const netProfit=grossProfit-totalExp+totalIncome;

  const allEntries=[
    ...fO.map(o=>({date:o.time,desc:`Sale: ${o.customer} (${o.mode})`,amount:o.total,mode:"in",type:"sale"})),
    ...fP.map(p=>({date:p.date,desc:`Purchase: ${p.items||"Stock"}`,amount:p.amount,mode:"out",type:"purchase"})),
    ...fE.map(e=>({date:e.date,desc:`${e.type==="income"?"Income":"Expense"}: ${e.category} — ${e.note}`,amount:e.amount,mode:e.type==="income"?"in":"out",type:e.type})),
  ].sort((a,b)=>new Date(b.date)-new Date(a.date));

  const saveExp=()=>{
    if(!eForm.amount){notify("Amount daalo","error");return;}
    const ne={...eForm,id:uid(),amount:Number(eForm.amount),createdAt:Date.now()};
    const upd=[ne,...expenses];setExpenses(upd);DB.set("expenses",upd);
    notify("Entry saved!","success");setExpModal(false);setEForm({amount:"",category:"Rent",note:"",date:todayK(),type:"expense"});
  };

  return(
    <div style={{flex:1,padding:24,overflow:"auto",color:C.text,fontFamily:"'Space Grotesk',sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><div style={{fontWeight:900,fontSize:22}}>💰 Cash Flow</div><div style={{fontSize:12,color:C.muted,marginTop:3}}>Income · Purchases · Expenses · P&L</div></div>
        <div style={{display:"flex",gap:9,alignItems:"center"}}>
          <div style={{display:"flex",gap:3,background:C.dim,borderRadius:9,padding:3}}>
            {["daily","monthly","yearly"].map(p=><button key={p} onClick={()=>setPeriod(p)} style={{padding:"5px 13px",borderRadius:7,border:"none",background:period===p?C.green:"transparent",color:period===p?"#030810":C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer",transition:"all .15s",textTransform:"capitalize"}}>{p}</button>)}
          </div>
          <input type={period==="daily"?"date":period==="monthly"?"month":"number"} value={dateFilter} onChange={e=>setDateFilter(e.target.value)} min="2020" max="2099" style={{...inp({width:150})}}/>
          <button style={{...btn(C.orange),padding:"8px 14px"}} onClick={()=>setExpModal(true)}>+ Add</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13,marginBottom:18}}>
        <StatCard icon="📈" label="Total Sales" value={fmt(totalSales)} color={C.green} sub={`${fO.length} orders`}/>
        <StatCard icon="📉" label="Purchases" value={fmt(totalPurch)} color={C.red}/>
        <StatCard icon="🏭" label="Gross Profit" value={fmt(grossProfit)} color={grossProfit>=0?C.green:C.red} sub={totalSales>0?`Margin: ${Math.round(grossProfit/totalSales*100)}%`:""}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:18}}>
        <StatCard icon="🧾" label="Expenses" value={fmt(totalExp)} color={C.orange}/>
        <StatCard icon="💵" label="Net Profit" value={fmt(netProfit)} color={netProfit>=0?C.green:C.red}/>
        <StatCard icon="🏛️" label="GST Collected" value={fmt(gstCollected)} color={C.yellow}/>
        <StatCard icon="📒" label="Credit Sales" value={fmt(fO.filter(o=>o.payment==="Credit").reduce((a,o)=>a+o.total,0))} color={C.purple}/>
      </div>
      {/* Summary bar */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:17,marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:13}}>Cash Flow Summary</div>
        {[{l:"Cash In (Sales)",v:totalSales,c:C.green},{l:"Cash Out (Purchases)",v:totalPurch,c:C.red},{l:"Cash Out (Expenses)",v:totalExp,c:C.orange}].map(item=>(
          <div key={item.l} style={{marginBottom:11}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:C.muted}}>{item.l}</span><span style={{color:item.c,fontWeight:700}}>{fmt(item.v)}</span></div>
            <div style={{background:C.dim,borderRadius:4,height:7,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min((item.v/Math.max(totalSales,1))*100,100)}%`,background:item.c,borderRadius:4,transition:"width .5s"}}/></div>
          </div>
        ))}
        <div style={{marginTop:13,padding:"11px 15px",borderRadius:9,background:netProfit>=0?"rgba(0,229,160,.06)":"rgba(239,68,68,.06)",border:`1px solid ${netProfit>=0?C.green:C.red}22`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:700,fontSize:13}}>Net Profit / Loss</span>
          <span style={{fontWeight:900,fontSize:20,color:netProfit>=0?C.green:C.red}}>{netProfit>=0?"▲":"▼"} {fmt(Math.abs(netProfit))}</span>
        </div>
      </div>
      {/* Ledger */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,overflow:"hidden"}}>
        <div style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:13}}>📒 Transaction Ledger ({allEntries.length})</div>
        {allEntries.length===0?<div style={{textAlign:"center",padding:"36px 0",color:C.muted}}>No transactions</div>:(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1.5fr 2.5fr 1fr 1fr",padding:"8px 16px",borderBottom:`1px solid ${C.border}`,color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}><span>Date</span><span>Description</span><span>Type</span><span style={{textAlign:"right"}}>Amount</span></div>
            {allEntries.map((e,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1.5fr 2.5fr 1fr 1fr",padding:"10px 16px",borderBottom:`1px solid ${C.dim}`,fontSize:12,alignItems:"center"}}>
                <span style={{color:C.muted,fontSize:11}}>{typeof e.date==="string"?e.date.slice(0,16):e.date}</span>
                <span style={{fontWeight:600}}>{e.desc}</span>
                <span><span style={{padding:"1px 7px",borderRadius:5,fontSize:10,fontWeight:700,background:e.type==="sale"?"rgba(0,229,160,.12)":e.type==="purchase"?"rgba(239,68,68,.1)":"rgba(249,115,22,.1)",color:e.type==="sale"?C.green:e.type==="purchase"?C.red:C.orange}}>{e.type.toUpperCase()}</span></span>
                <span style={{textAlign:"right",fontWeight:800,color:e.mode==="in"?C.green:C.red}}>{e.mode==="in"?"+":"-"}{fmt(e.amount)}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {expModal&&<Modal onClose={()=>setExpModal(false)} width={420}><div style={{padding:22}}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:18,color:C.text}}>+ Add Entry</div>
        <div style={{display:"grid",gap:11}}>
          <div><label style={lbl}>Type</label><div style={{display:"flex",gap:5}}>{["expense","income"].map(t=><button key={t} onClick={()=>setEForm(p=>({...p,type:t}))} style={{flex:1,padding:"8px 0",borderRadius:7,border:`1px solid`,borderColor:eForm.type===t?C.green:C.border2,background:eForm.type===t?"rgba(0,229,160,.1)":"transparent",color:eForm.type===t?C.green:C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer",textTransform:"capitalize"}}>{t}</button>)}</div></div>
          <div><label style={lbl}>Category</label><select style={inp({cursor:"pointer"})} value={eForm.category} onChange={e=>setEForm(p=>({...p,category:e.target.value}))}>{EXP_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
          <div><label style={lbl}>Amount (₹) *</label><input type="number" style={inp()} value={eForm.amount} onChange={e=>setEForm(p=>({...p,amount:e.target.value}))} placeholder="0"/></div>
          <div><label style={lbl}>Date</label><input type="date" style={inp()} value={eForm.date} onChange={e=>setEForm(p=>({...p,date:e.target.value}))}/></div>
          <div><label style={lbl}>Note</label><input style={inp()} value={eForm.note} onChange={e=>setEForm(p=>({...p,note:e.target.value}))} placeholder="e.g. June ka kiraya"/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}><button style={{...btn(C.green),flex:1}} onClick={saveExp}>✓ Save</button><button onClick={()=>setExpModal(false)} style={{padding:"11px 18px",borderRadius:10,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>Cancel</button></div>
      </div></Modal>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// CREDIT LEDGER
// ══════════════════════════════════════════════════════════════════
function CreditPage({orders,notify}){
  const [credits,setCredits]=useState(()=>DB.get("credits",[]));
  const [modal,setModal]=useState(false);
  const [payModal,setPayModal]=useState(null);
  const [tab,setTab]=useState("all");
  const [form,setForm]=useState({name:"",phone:"",type:"customer",amount:"",note:"",date:todayK(),creditType:"given"});
  const [payForm,setPayForm]=useState({amount:"",note:"",date:todayK()});

  const saveCredit=()=>{
    if(!form.name||!form.amount){notify("Name & amount required","error");return;}
    const nc={...form,id:uid(),amount:Number(form.amount),paid:0,status:"pending",entries:[{amount:Number(form.amount),date:form.date,note:form.note,type:"credit"}],createdAt:Date.now()};
    const upd=[nc,...credits];setCredits(upd);DB.set("credits",upd);
    notify("Credit entry saved!","success");setModal(false);setForm({name:"",phone:"",type:"customer",amount:"",note:"",date:todayK(),creditType:"given"});
  };
  const addPayment=id=>{
    const amt=Number(payForm.amount)||0;if(!amt){notify("Amount daalo","error");return;}
    const upd=credits.map(c=>{
      if(c.id!==id)return c;
      const newPaid=c.paid+amt;
      return{...c,paid:newPaid,status:newPaid>=c.amount?"paid":"partial",entries:[...c.entries,{amount:amt,date:payForm.date,note:payForm.note||"Payment",type:"payment"}]};
    });
    setCredits(upd);DB.set("credits",upd);notify("Payment recorded!","success");setPayModal(null);setPayForm({amount:"",note:"",date:todayK()});
  };

  const creditOrders=orders.filter(o=>o.payment==="Credit");
  const filtered=tab==="all"?credits:tab==="customers"?credits.filter(c=>c.type==="customer"):credits.filter(c=>c.type==="wholesaler");
  const totalGiven=credits.filter(c=>c.creditType==="given").reduce((a,c)=>a+c.amount,0);
  const totalTaken=credits.filter(c=>c.creditType==="taken").reduce((a,c)=>a+c.amount,0);
  const totalPending=credits.filter(c=>c.status!=="paid").reduce((a,c)=>a+(c.amount-c.paid),0);

  return(
    <div style={{flex:1,padding:24,overflow:"auto",color:C.text,fontFamily:"'Space Grotesk',sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><div style={{fontWeight:900,fontSize:22}}>📒 Credit Ledger</div><div style={{fontSize:12,color:C.muted,marginTop:3}}>Customer credit · Wholesaler credit</div></div>
        <button style={{...btn(C.purple),padding:"9px 16px"}} onClick={()=>setModal(true)}>+ Add Credit</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:18}}>
        <StatCard icon="📤" label="Credit Given" value={fmt(totalGiven)} color={C.red} sub="To customers"/>
        <StatCard icon="📥" label="Credit Taken" value={fmt(totalTaken)} color={C.blue} sub="From wholesalers"/>
        <StatCard icon="⏳" label="Pending" value={fmt(totalPending)} color={C.yellow}/>
        <StatCard icon="🚨" label="Overdue" value={credits.filter(c=>c.status!=="paid"&&(Date.now()-c.createdAt)>7*86400000).length} color={C.red}/>
      </div>

      {creditOrders.length>0&&<div style={{background:"rgba(139,92,246,.05)",border:`1px solid ${C.purple}33`,borderRadius:13,padding:15,marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:9,color:C.purple}}>🛒 POS Credit Sales (uncollected)</div>
        <div style={{display:"flex",gap:9,overflowX:"auto",paddingBottom:5}}>
          {creditOrders.slice(0,6).map(o=><div key={o.id} style={{background:C.dim,borderRadius:9,padding:"9px 13px",minWidth:150,flexShrink:0}}><div style={{fontWeight:700,fontSize:12}}>{o.customer}</div><div style={{fontSize:10,color:C.muted}}>{o.time}</div><div style={{fontSize:15,fontWeight:900,color:C.red,marginTop:3}}>{fmt(o.total)}</div></div>)}
        </div>
        <div style={{marginTop:9,fontSize:12,color:C.muted}}>Total: <b style={{color:C.red}}>{fmt(creditOrders.reduce((a,o)=>a+o.total,0))}</b></div>
      </div>}

      <div style={{display:"flex",gap:5,marginBottom:14}}>
        {[{id:"all",l:"All"},{id:"customers",l:"👥 Customers"},{id:"wholesalers",l:"🏭 Wholesalers"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"6px 14px",borderRadius:8,border:`1px solid`,borderColor:tab===t.id?C.purple:C.border2,background:tab===t.id?"rgba(139,92,246,.1)":"transparent",color:tab===t.id?C.purple:C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>{t.l}</button>
        ))}
      </div>

      {filtered.length===0?<div style={{textAlign:"center",padding:"60px 0",color:C.muted}}><div style={{fontSize:50}}>📒</div><div style={{marginTop:9}}>No credit entries</div></div>
      :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:13}}>
        {filtered.map(c=>{
          const pending=c.amount-c.paid;
          const isOverdue=c.status!=="paid"&&(Date.now()-c.createdAt)>7*86400000;
          return(
            <div key={c.id} style={{background:C.card,border:`1px solid ${isOverdue?C.red:c.status==="paid"?C.green:C.border}`,borderRadius:15,padding:17}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
                <div><div style={{fontWeight:800,fontSize:14}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>{c.phone} · {c.type} · {c.date}</div></div>
                <span style={{padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:700,background:c.status==="paid"?"rgba(0,229,160,.15)":c.status==="partial"?"rgba(251,191,36,.12)":"rgba(239,68,68,.1)",color:c.status==="paid"?C.green:c.status==="partial"?C.yellow:C.red}}>{c.status==="paid"?"✓ PAID":c.status==="partial"?"PARTIAL":"PENDING"}</span>
              </div>
              <div style={{marginBottom:9}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:C.muted}}>Total: <b style={{color:C.text}}>{fmt(c.amount)}</b></span><span style={{color:C.muted}}>Paid: <b style={{color:C.green}}>{fmt(c.paid)}</b></span></div>
                <div style={{background:C.dim,borderRadius:4,height:7,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min((c.paid/c.amount)*100,100)}%`,background:c.status==="paid"?C.green:C.yellow,borderRadius:4,transition:"width .5s"}}/></div>
                {c.status!=="paid"&&<div style={{fontSize:13,fontWeight:900,color:C.red,marginTop:5}}>Pending: {fmt(pending)}</div>}
              </div>
              {c.note&&<div style={{fontSize:11,color:C.muted,marginBottom:7}}>📝 {c.note}</div>}
              {isOverdue&&<div style={{fontSize:11,color:C.red,fontWeight:700,marginBottom:7}}>🚨 Overdue!</div>}
              {c.entries.length>1&&<div style={{background:C.dim,borderRadius:7,padding:"7px 9px",marginBottom:9}}>
                {c.entries.slice(-3).map((e,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}><span style={{color:C.muted}}>{e.date} · {e.note}</span><span style={{color:e.type==="payment"?C.green:C.red,fontWeight:700}}>{e.type==="payment"?"+":""}{fmt(e.amount)}</span></div>)}
              </div>}
              {c.status!=="paid"&&<button onClick={()=>setPayModal(c.id)} style={{width:"100%",padding:"7px 0",borderRadius:8,border:"none",background:c.creditType==="given"?`linear-gradient(135deg,${C.green}99,${C.green})`:`linear-gradient(135deg,${C.blue}99,${C.blue})`,color:c.creditType==="given"?"#030810":"#fff",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>💵 Record Payment</button>}
            </div>
          );
        })}
      </div>}

      {modal&&<Modal onClose={()=>setModal(false)} width={480}><div style={{padding:22}}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:18,color:C.text}}>📒 Add Credit Entry</div>
        <div style={{display:"grid",gap:11}}>
          <div><label style={lbl}>Credit Type</label><div style={{display:"flex",gap:5}}>{[{v:"given",l:"📤 Given to Customer"},{v:"taken",l:"📥 Taken from Wholesaler"}].map(t=><button key={t.v} onClick={()=>setForm(p=>({...p,creditType:t.v}))} style={{flex:1,padding:"8px 0",borderRadius:7,border:`1px solid`,borderColor:form.creditType===t.v?C.purple:C.border2,background:form.creditType===t.v?"rgba(139,92,246,.1)":"transparent",color:form.creditType===t.v?C.purple:C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>{t.l}</button>)}</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Name *</label><input style={inp()} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Customer/Wholesaler"/></div>
            <div><label style={lbl}>Phone</label><input style={inp()} value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/></div>
          </div>
          <div><label style={lbl}>Type</label><select style={inp({cursor:"pointer"})} value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}><option>customer</option><option>wholesaler</option><option>other</option></select></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Amount (₹) *</label><input type="number" style={inp()} value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} placeholder="0"/></div>
            <div><label style={lbl}>Date</label><input type="date" style={inp()} value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
          </div>
          <div><label style={lbl}>Note</label><input style={inp()} value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} placeholder="Kya liya/diya..."/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}><button style={{...btn(C.purple),flex:1}} onClick={saveCredit}>✓ Save</button><button onClick={()=>setModal(false)} style={{padding:"11px 18px",borderRadius:10,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>Cancel</button></div>
      </div></Modal>}

      {payModal&&<Modal onClose={()=>setPayModal(null)} width={380}><div style={{padding:22}}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:4,color:C.text}}>💵 Record Payment</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:18}}>
          {credits.find(c=>c.id===payModal)?.name} — Pending: {fmt((credits.find(c=>c.id===payModal)?.amount||0)-(credits.find(c=>c.id===payModal)?.paid||0))}
        </div>
        <div style={{display:"grid",gap:11}}>
          <div><label style={lbl}>Amount *</label><input type="number" style={inp()} value={payForm.amount} onChange={e=>setPayForm(p=>({...p,amount:e.target.value}))} placeholder="0"/></div>
          <div><label style={lbl}>Date</label><input type="date" style={inp()} value={payForm.date} onChange={e=>setPayForm(p=>({...p,date:e.target.value}))}/></div>
          <div><label style={lbl}>Note</label><input style={inp()} value={payForm.note} onChange={e=>setPayForm(p=>({...p,note:e.target.value}))} placeholder="Cash/UPI received..."/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}><button style={{...btn(C.green),flex:1}} onClick={()=>addPayment(payModal)}>✓ Record</button><button onClick={()=>setPayModal(null)} style={{padding:"11px 18px",borderRadius:10,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>Cancel</button></div>
      </div></Modal>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════════════
function AnalyticsPage({orders,products}){
  const [period,setPeriod]=useState("daily");
  const [dateFilter,setDateFilter]=useState(todayK());

  const getFiltered=()=>{
    switch(period){
      case "daily":   return orders.filter(o=>new Date(o.timestamp).toISOString().slice(0,10)===dateFilter);
      case "monthly": return orders.filter(o=>new Date(o.timestamp).toISOString().slice(0,7)===dateFilter.slice(0,7));
      case "yearly":  return orders.filter(o=>new Date(o.timestamp).getFullYear().toString()===dateFilter.slice(0,4));
      default: return orders;
    }
  };
  const filtered=getFiltered();
  const rev=filtered.reduce((a,o)=>a+o.total,0);
  const wsRev=filtered.filter(o=>o.mode==="wholesale").reduce((a,o)=>a+o.total,0);
  const rtRev=filtered.filter(o=>o.mode==="retail").reduce((a,o)=>a+o.total,0);
  const gst=filtered.reduce((a,o)=>a+(o.gst_amount||0),0);
  const disc=filtered.reduce((a,o)=>a+o.discountAmt,0);
  const items=filtered.reduce((a,o)=>a+o.cart.reduce((b,i)=>b+i.qty,0),0);
  const avg=filtered.length?Math.round(rev/filtered.length):0;

  const pMap={};filtered.forEach(o=>o.cart.forEach(i=>{const p=pMap[i.name]||{qty:0,rev:0,emoji:i.emoji};p.qty+=i.qty;p.rev+=i.qty*(o.mode==="wholesale"?i.wholesalePrice:i.retailPrice);pMap[i.name]=p;}));
  const topP=Object.entries(pMap).sort((a,b)=>b[1].rev-a[1].rev).slice(0,8);
  const maxP=Math.max(...topP.map(p=>p[1].rev),1);

  const payMap={};filtered.forEach(o=>{payMap[o.payment]=(payMap[o.payment]||0)+o.total;});
  const payD=Object.entries(payMap).sort((a,b)=>b[1]-a[1]);

  const printRep=()=>{
    const biz=DB.get("business",{});
    const w=window.open("","_blank","width=900,height=720");
    w.document.write(`<!DOCTYPE html><html><head><title>Report</title><style>body{font-family:Arial;padding:22px;color:#333;}h1{text-align:center;color:#00a876;}h2{color:#1a6eb8;border-bottom:2px solid #eee;padding-bottom:4px;margin-top:18px;}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:11px 0;}.card{border:1px solid #eee;border-radius:8px;padding:10px;text-align:center;}.cv{font-size:18px;font-weight:bold;color:#00a876;}.cl{font-size:10px;color:#888;}table{width:100%;border-collapse:collapse;margin:7px 0;}th{background:#f5f5f5;padding:6px;font-size:11px;text-align:left;border:1px solid #ddd;}td{padding:6px;border:1px solid #eee;font-size:11px;}</style></head><body>
    <h1>🏪 ${biz.name||"RetailPRO"} — ${period.charAt(0).toUpperCase()+period.slice(1)} Report</h1>
    <p style="text-align:center;color:#888">${dateFilter} · ${new Date().toLocaleString("en-IN")}</p>
    <div class="grid"><div class="card"><div class="cv">${fmt(rev)}</div><div class="cl">Revenue</div></div><div class="card"><div class="cv">${filtered.length}</div><div class="cl">Orders</div></div><div class="card"><div class="cv">${items}</div><div class="cl">Items Sold</div></div><div class="card"><div class="cv">${fmt(avg)}</div><div class="cl">Avg Order</div></div></div>
    <h2>Split</h2><table><tr><th>Type</th><th>Revenue</th><th>Orders</th></tr><tr><td>🛒 Retail</td><td>${fmt(rtRev)}</td><td>${filtered.filter(o=>o.mode==="retail").length}</td></tr><tr><td>🏭 Wholesale</td><td>${fmt(wsRev)}</td><td>${filtered.filter(o=>o.mode==="wholesale").length}</td></tr><tr><td>GST</td><td>${fmt(gst)}</td><td>—</td></tr><tr><td>Discount</td><td>${fmt(disc)}</td><td>—</td></tr></table>
    <h2>Top Products</h2><table><tr><th>Product</th><th>Qty</th><th>Revenue</th></tr>${topP.map(([n,d])=>`<tr><td>${d.emoji} ${n}</td><td>${d.qty}</td><td>${fmt(d.rev)}</td></tr>`).join("")}</table>
    <h2>Payments</h2><table><tr><th>Method</th><th>Amount</th></tr>${payD.map(([m,v])=>`<tr><td>${m}</td><td>${fmt(v)}</td></tr>`).join("")}</table>
    ${products.filter(p=>p.stock<=5).length>0?`<h2 style="color:red">⚠ Low Stock</h2><table><tr><th>Product</th><th>Stock</th></tr>${products.filter(p=>p.stock<=5).map(p=>`<tr><td>${p.emoji} ${p.name}</td><td style="color:red">${p.stock}</td></tr>`).join("")}</table>`:""}
    <script>window.onload=()=>{window.print();}<\/script></body></html>`);
    w.document.close();
  };

  return(
    <div style={{flex:1,padding:24,overflow:"auto",color:C.text,fontFamily:"'Space Grotesk',sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><div style={{fontWeight:900,fontSize:22}}>📊 Analytics</div><div style={{fontSize:12,color:C.muted,marginTop:3}}>Daily · Monthly · Yearly</div></div>
        <div style={{display:"flex",gap:9,alignItems:"center"}}>
          <div style={{display:"flex",gap:3,background:C.dim,borderRadius:9,padding:3}}>
            {["daily","monthly","yearly"].map(p=><button key={p} onClick={()=>setPeriod(p)} style={{padding:"5px 13px",borderRadius:7,border:"none",background:period===p?C.green:"transparent",color:period===p?"#030810":C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer",transition:"all .15s",textTransform:"capitalize"}}>{p}</button>)}
          </div>
          <input type={period==="daily"?"date":period==="monthly"?"month":"number"} value={dateFilter} onChange={e=>setDateFilter(e.target.value)} min="2020" max="2099" style={{...inp({width:150})}}/>
          <button style={{...btn(C.blue),padding:"8px 14px"}} onClick={printRep}>🖨️ Print</button>
        </div>
      </div>

      {filtered.length===0?<div style={{textAlign:"center",padding:"80px 0",color:C.muted}}><div style={{fontSize:58}}>📊</div><div style={{fontSize:15,fontWeight:700,marginTop:14}}>No data for this period</div></div>:(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:18}}>
            <StatCard icon="💰" label="Revenue" value={fmt(rev)} color={C.green} sub={`${filtered.length} orders`}/>
            <StatCard icon="🛒" label="Retail" value={fmt(rtRev)} color={C.orange} sub={`${filtered.filter(o=>o.mode==="retail").length} orders`}/>
            <StatCard icon="🏭" label="Wholesale" value={fmt(wsRev)} color={C.blue} sub={`${filtered.filter(o=>o.mode==="wholesale").length} orders`}/>
            <StatCard icon="📦" label="Items Sold" value={items} color={C.purple} sub={`Avg ${fmt(avg)}/order`}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13,marginBottom:18}}>
            <StatCard icon="🏛️" label="GST Collected" value={fmt(gst)} color={C.yellow}/>
            <StatCard icon="🏷️" label="Discounts Given" value={fmt(disc)} color={C.red}/>
            <StatCard icon="📈" label="Avg Order" value={fmt(avg)} color={C.text}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:18}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:13}}>🏆 Top Products</div>
              {topP.map(([name,d],i)=>(
                <div key={name} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}}><span>{["🥇","🥈","🥉"][i]||`${i+1}.`} {d.emoji} {name}</span><span style={{fontWeight:700,color:C.green}}>{fmt(d.rev)}</span></div>
                  <div style={{background:C.dim,borderRadius:4,height:5,overflow:"hidden"}}><div style={{height:"100%",width:`${(d.rev/maxP)*100}%`,background:`linear-gradient(to right,${C.green},${C.blue})`,borderRadius:4}}/></div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>{d.qty} units</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:18,flex:1}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>💳 Payment Methods</div>
                {payD.map(([method,val])=>(
                  <div key={method} style={{marginBottom:9}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:C.muted}}>{method}</span><span style={{color:C.blue,fontWeight:700}}>{fmt(val)}</span></div>
                    <div style={{background:C.dim,borderRadius:4,height:5,overflow:"hidden"}}><div style={{height:"100%",width:`${(val/rev)*100}%`,background:C.blue,borderRadius:4}}/></div>
                  </div>
                ))}
              </div>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:18}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>📊 Revenue Split</div>
                {[{l:"🛒 Retail",v:rtRev,c:C.orange},{l:"🏭 Wholesale",v:wsRev,c:C.blue}].map(r=>(
                  <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 11px",background:C.dim,borderRadius:8,marginBottom:7,fontSize:12}}>
                    <span>{r.l}</span><div style={{textAlign:"right"}}><div style={{fontWeight:700,color:r.c}}>{fmt(r.v)}</div><div style={{fontSize:10,color:C.muted}}>{rev>0?Math.round(r.v/rev*100):0}%</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {products.filter(p=>p.stock<=5).length>0&&<div style={{marginTop:18,background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.3)",borderRadius:13,padding:16}}>
            <div style={{fontWeight:800,fontSize:13,color:C.red,marginBottom:9}}>🚨 Critical Low Stock</div>
            <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
              {products.filter(p=>p.stock<=5).map(p=><div key={p.id} style={{background:C.dim,borderRadius:9,padding:"8px 13px",display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:18}}>{p.emoji}</span><div><div style={{fontSize:12,fontWeight:700}}>{p.name}</div><div style={{fontSize:13,fontWeight:900,color:p.stock===0?C.red:C.yellow}}>{p.stock===0?"OUT":p.stock+" left"}</div></div></div>)}
            </div>
          </div>}
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ORDERS HISTORY
// ══════════════════════════════════════════════════════════════════
function OrdersPage({orders}){
  return(
    <div style={{flex:1,padding:24,overflow:"auto",color:C.text,fontFamily:"'Space Grotesk',sans-serif"}}>
      <div style={{fontWeight:900,fontSize:22,marginBottom:22}}>📋 Order History <span style={{fontSize:14,color:C.muted,fontWeight:400}}>({orders.length})</span></div>
      {orders.length===0?<div style={{textAlign:"center",padding:"80px 0",color:C.muted}}><div style={{fontSize:52}}>📋</div><div style={{marginTop:9}}>No orders yet</div></div>
      :<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"1.2fr 1.5fr 1fr .8fr .8fr 1fr 1fr",padding:"9px 16px",borderBottom:`1px solid ${C.border}`,color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>
          <span>Order ID</span><span>Customer</span><span>Time</span><span>Mode</span><span>Items</span><span>Payment</span><span>Total</span>
        </div>
        {orders.map(o=>(
          <div key={o.id} style={{display:"grid",gridTemplateColumns:"1.2fr 1.5fr 1fr .8fr .8fr 1fr 1fr",padding:"11px 16px",borderBottom:`1px solid ${C.dim}`,fontSize:12,alignItems:"center"}}>
            <span style={{fontFamily:"monospace",color:C.green,fontSize:10}}>{o.id}</span>
            <span style={{fontWeight:600}}>{o.customer}</span>
            <span style={{color:C.muted,fontSize:10}}>{o.time}</span>
            <span><span style={{padding:"1px 7px",borderRadius:5,fontSize:10,fontWeight:700,background:o.mode==="wholesale"?"rgba(59,130,246,.15)":"rgba(0,229,160,.12)",color:o.mode==="wholesale"?C.blue:C.green}}>{o.mode==="wholesale"?"W/S":"RTL"}</span></span>
            <span style={{color:C.muted}}>{o.cart?.reduce((a,i)=>a+i.qty,0)||0}</span>
            <span>{o.payment}</span>
            <span style={{fontWeight:800,color:C.green}}>{fmt(o.total)}</span>
          </div>
        ))}
      </div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// INVENTORY PAGE
// ══════════════════════════════════════════════════════════════════
function InventoryPage({products,setProducts,notify}){
  const [editId,setEditId]=useState(null);
  const [editStock,setEditStock]=useState("");
  const low=products.filter(p=>p.stock<=(p.reorderLevel||10));

  const updateStock=(id,val)=>{
    const upd=products.map(p=>p.id===id?{...p,stock:Math.max(0,Number(val)||0)}:p);
    setProducts(upd);DB.set("products",upd);setEditId(null);notify("Stock updated!","success");
  };

  return(
    <div style={{flex:1,padding:24,overflow:"auto",color:C.text,fontFamily:"'Space Grotesk',sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><div style={{fontWeight:900,fontSize:22}}>📦 Inventory</div><div style={{fontSize:12,color:C.muted,marginTop:3}}>{products.length} products</div></div>
        {low.length>0&&<div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:9,padding:"7px 15px",color:C.red,fontSize:13,fontWeight:700}}>🚨 {low.length} need restock</div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13,marginBottom:18}}>
        <StatCard icon="📦" label="Total Products" value={products.length} color={C.blue}/>
        <StatCard icon="✅" label="Good Stock" value={products.filter(p=>p.stock>(p.reorderLevel||10)).length} color={C.green}/>
        <StatCard icon="⚠️" label="Low / Out" value={products.filter(p=>p.stock<=(p.reorderLevel||10)).length} color={C.red}/>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr",padding:"9px 16px",borderBottom:`1px solid ${C.border}`,color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>
          <span>Product</span><span>Category</span><span>Retail</span><span>Wholesale</span><span>Cost</span><span>Stock</span><span>Status</span>
        </div>
        {products.sort((a,b)=>a.stock-b.stock).map(p=>(
          <div key={p.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr",padding:"11px 16px",borderBottom:`1px solid ${C.dim}`,background:p.stock===0?"rgba(239,68,68,.03)":"transparent",fontSize:12,alignItems:"center"}}>
            <span style={{fontWeight:600}}>{p.emoji} {p.name} <span style={{color:C.muted,fontSize:10}}>({p.unit})</span></span>
            <span style={{color:C.muted}}>{p.category}</span>
            <span style={{fontWeight:700,color:C.green}}>{fmt(p.retailPrice)}</span>
            <span style={{fontWeight:700,color:C.blue}}>{fmt(p.wholesalePrice)}</span>
            <span style={{color:C.muted}}>{fmt(p.costPrice||0)}</span>
            <span>
              {editId===p.id
                ?<div style={{display:"flex",gap:5}}><input type="number" value={editStock} onChange={e=>setEditStock(e.target.value)} style={{...inp({width:60,padding:"4px 8px",fontSize:12})}}/><button onClick={()=>updateStock(p.id,editStock)} style={{...btn(C.green),padding:"4px 10px",fontSize:11}}>✓</button><button onClick={()=>setEditId(null)} style={{padding:"4px 9px",borderRadius:7,border:`1px solid ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:11}}>✕</button></div>
                :<span onClick={()=>{setEditId(p.id);setEditStock(p.stock.toString());}} style={{fontWeight:900,cursor:"pointer",fontSize:15,color:p.stock===0?C.red:p.stock<=(p.reorderLevel||10)?C.yellow:C.text}}>{p.stock} ✎</span>
              }
            </span>
            <span><span style={{padding:"2px 8px",borderRadius:6,fontSize:10,fontWeight:700,background:p.stock===0?"rgba(239,68,68,.2)":p.stock<=5?"rgba(239,68,68,.15)":p.stock<=(p.reorderLevel||10)?"rgba(251,191,36,.12)":"rgba(0,229,160,.1)",color:p.stock===0?C.red:p.stock<=5?C.red:p.stock<=(p.reorderLevel||10)?C.yellow:C.green}}>{p.stock===0?"🚨 Out":p.stock<=5?"Critical":p.stock<=(p.reorderLevel||10)?"Low":"Good"}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
export default function RetailPROApp(){
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const [subAccess, setSubAccess] = useState(null);
  const [subLoading, setSubLoading] = useState(!!getToken());
  const [isSetup, setIsSetup] = useState(() => !!DB.get("business", null));
  const [activeTab, setActiveTab] = useState("pos");
  const [mode, setMode] = useState("retail");
  const [products, setProducts] = useState(() => DB.get("products", SEED_PRODUCTS));
  const [orders, setOrders] = useState(() => DB.get("orders", []));
  const { add: notify, Toast } = useToast();

  useEffect(() => {
    if (!getToken()) {
      setSubAccess(null);
      setSubLoading(false);
      return;
    }
    setSubLoading(true);
    billingAPI
      .status()
      .then((s) => setSubAccess(s))
      .catch(() => setSubAccess({ paymentRequired: true, message: "Could not load subscription" }))
      .finally(() => setSubLoading(false));
  }, [isLoggedIn]);

  const refreshSubscription = () => {
    if (!getToken()) return;
    billingAPI.status().then(setSubAccess).catch(() => {});
  };

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={async () => {
          setIsLoggedIn(true);
          const tier = resumeCheckoutAfterLogin();
          if (tier) {
            try {
              await startSubscriptionCheckout(tier);
              alert("Payment submitted. Your plan will activate shortly.");
              refreshSubscription();
            } catch (e) {
              if (e.message !== "Payment cancelled") {
                console.warn("Checkout after login:", e.message);
              }
            }
          }
        }}
      />
    );
  }

  if (subLoading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif" }}>
        Loading…
      </div>
    );
  }

  if (subAccess?.paymentRequired) {
    return (
      <PaymentPlease message={subAccess.message} status={subAccess.status} />
    );
  }

  const business = DB.get("business", {});

  const todayOrders=orders.filter(o=>new Date(o.timestamp).toISOString().slice(0,10)===todayK());
  const todayRev=todayOrders.reduce((a,o)=>a+o.total,0);
  const lowCount=products.filter(p=>p.stock<=(p.reorderLevel||10)).length;
  const pendingCredits=DB.get("credits",[]).filter(c=>c.status!=="paid").length;
  const accent=mode==="wholesale"?C.blue:C.green;

  const TABS=[
    {id:"pos",       icon:"⚡", label:"POS"},
    {id:"products",  icon:"📦", label:"Products"},
    {id:"qr",        icon:"🔲", label:"QR Codes", badge:lowCount>0?lowCount:null},
    {id:"suppliers", icon:"🏭", label:"Suppliers"},
    {id:"customers", icon:"👥", label:"Customers"},
    {id:"employees", icon:"👨‍💼", label:"Employees"},
    {id:"cashflow",  icon:"💰", label:"Cash Flow"},
    {id:"credits",   icon:"📒", label:"Credits",  badge:pendingCredits>0?pendingCredits:null},
    {id:"analytics", icon:"📊", label:"Analytics"},
    {id:"orders",    icon:"📋", label:"Orders"},
    {id:"inventory", icon:"🗂️", label:"Inventory"},
  ];

  if(!isSetup)return<Onboarding onComplete={()=>{setIsSetup(true);setProducts(DB.get("products",SEED_PRODUCTS));}}/>;

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}body{background:${C.bg};}
        ::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-thumb{background:${C.border2};border-radius:3px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        input:focus,select:focus,textarea:focus{border-color:${C.green}!important;outline:none!important;}
        input[type=date]::-webkit-calendar-picker-indicator,input[type=time]::-webkit-calendar-picker-indicator,input[type=month]::-webkit-calendar-picker-indicator{filter:invert(.5)opacity(.6);}
      `}</style>
      <Toast/>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Space Grotesk', sans-serif", background: C.bg, color: C.text }}>
        <TrialBanner
          trialDaysLeft={subAccess?.trialDaysLeft}
          plan={subAccess?.plan}
          status={subAccess?.status}
          currentPeriodEnd={subAccess?.currentPeriodEnd}
        />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* SIDEBAR */}
        <div style={{width:196,background:"#060B18",borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"14px 9px"}}>
          <div style={{marginBottom:18,padding:"0 5px"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
              <span style={{fontSize:20}}>{business.logo||"🏪"}</span>
              <div><div style={{fontSize:14,fontWeight:900,letterSpacing:"-.5px"}}><span style={{color:C.green}}>Retail</span><span style={{color:C.blue}}>PRO</span></div><div style={{fontSize:8,color:C.muted,fontFamily:"monospace"}}>SaaS v1</div></div>
            </div>
            <div style={{fontSize:11,color:C.muted,fontWeight:600,paddingLeft:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{business.name||"My Shop"}</div>
          </div>

          <div style={{flex:1,display:"flex",flexDirection:"column",gap:1,overflow:"auto"}}>
            {TABS.map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 11px",borderRadius:8,border:"none",cursor:"pointer",background:activeTab===tab.id?"rgba(255,255,255,.05)":"transparent",color:activeTab===tab.id?accent:C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:12,borderLeft:activeTab===tab.id?`3px solid ${accent}`:"3px solid transparent",transition:"all .15s",textAlign:"left"}}>
                <span style={{fontSize:14}}>{tab.icon}</span>
                <span style={{flex:1}}>{tab.label}</span>
                {tab.badge&&<span style={{background:C.red,color:"#fff",fontSize:10,fontWeight:800,padding:"1px 5px",borderRadius:8}}>{tab.badge}</span>}
              </button>
            ))}
          </div>

          <div style={{background:C.dim,borderRadius:10,padding:11,margin:"0 2px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Today</div>
            <div style={{fontSize:18,fontWeight:900,color:C.green,fontFamily:"monospace"}}>{fmt(todayRev)}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:3}}>{todayOrders.length} orders · {products.length} products</div>
            {lowCount>0&&<div style={{fontSize:10,color:C.red,marginTop:3,fontWeight:700}}>⚠ {lowCount} low stock</div>}
          </div>
        </div>

        {/* MAIN */}
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          {activeTab==="pos"      &&<POSPage       products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} notify={notify} mode={mode} setMode={setMode}/>}
          {activeTab==="products" &&<ProductsPage  products={products} setProducts={setProducts} notify={notify}/>}
          {activeTab==="qr"       &&<QRPage        products={products} setProducts={setProducts} notify={notify}/>}
          {activeTab==="suppliers"&&<SuppliersPage notify={notify}/>}
          {activeTab==="customers"&&<CustomersPage orders={orders} notify={notify}/>}
          {activeTab==="employees"&&<EmployeesPage notify={notify}/>}
          {activeTab==="cashflow" &&<CashFlowPage  orders={orders} notify={notify}/>}
          {activeTab==="credits"  &&<CreditPage    orders={orders} notify={notify}/>}
          {activeTab==="analytics"&&<AnalyticsPage orders={orders} products={products}/>}
          {activeTab==="orders"   &&<OrdersPage    orders={orders}/>}
          {activeTab==="inventory"&&<InventoryPage products={products} setProducts={setProducts} notify={notify}/>}
        </div>
        </div>
      </div>
    </>
  );
}
