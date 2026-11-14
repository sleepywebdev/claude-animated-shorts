import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const BUNKER_FRAMES = 1200;
const clamp = (v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const ease = (a:number,b:number,f:number)=>{const t=clamp((f-a)/(b-a),0,1);return t*t*(3-2*t);};
const fade = (f:number,a:number,b:number)=>clamp(Math.min((f-a)/12,(b-f)/12),0,1);

const Figure:React.FC<{x:number;y:number;s?:number;kind?:"owner"|"survivor"|"infected";pose?:number}> = ({x,y,s=1,kind="owner",pose=0})=>{
 const infected=kind==="infected", survivor=kind==="survivor";
 const body=infected?"#74836b":survivor?"#e0a16d":"#5e9ac2";
 const limb=infected?"#66765f":survivor?"#d58b5e":"#477ca6";
 const skin=infected?"#b9c39a":"#f1c9a6";
 const armA=pose?"M-13 -5 Q-35 -34 -48 -52":"M-13 -5 Q-35 5 -42 28";
 const armB=pose?"M13 -5 Q34 -28 48 -48":"M13 -5 Q34 7 42 27";
 return <g transform={`translate(${x} ${y}) scale(${s})`} stroke="#172330" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
  <ellipse cx="0" cy="5" rx="31" ry="8" fill="#07131d" opacity=".28" stroke="none"/>
  {survivor&&<path d="M-18 -3L-30 10L-21 34L-9 28Z" fill="#8c493d" stroke="#172330" strokeWidth="3"/>}
  <path d="M-10 17L-18 57L-23 91 M10 17L18 57L26 91" fill="none" stroke="#172330" strokeWidth="17"/>
  <path d="M-10 17L-18 57L-23 91 M10 17L18 57L26 91" fill="none" stroke={limb} strokeWidth="11"/>
  <path d="M-25 92L-9 92 M20 92L37 92" fill="none" stroke="#e4e8e8" strokeWidth="10"/>
  <path d="M-16 -12Q-22 -4 -21 15L-17 35Q0 44 18 34L21 8Q20 -11 13 -17Z" fill={body}/>
  <path d="M-8 -8L0 1L8 -8" fill="none" stroke="#dce8e9" strokeWidth="3" opacity=".9"/>
  <path d={armA} fill="none" stroke="#172330" strokeWidth="16"/><path d={armB} fill="none" stroke="#172330" strokeWidth="16"/>
  <path d={armA} fill="none" stroke={limb} strokeWidth="10"/><path d={armB} fill="none" stroke={limb} strokeWidth="10"/>
  <circle cx={pose?-51:-44} cy={pose?-55:31} r="7" fill={skin} strokeWidth="3"/>
  <circle cx={pose?51:44} cy={pose?-51:30} r="7" fill={skin} strokeWidth="3"/>
  <path d="M-11 -17Q-17 -25 -17 -42Q-17 -68 0 -70Q18 -68 18 -43L14 -17Q0 -6 -11 -17Z" fill={skin}/>
  {infected?<><path d="M-18 -49Q-20 -76 1 -77Q21 -74 18 -48L10 -55L3 -48L-5 -58L-13 -49Z" fill="#455b45"/><path d="M-9 -37L-3 -36 M7 -37L12 -40" stroke="#8e3636" strokeWidth="4"/><path d="M-5 -21L8 -25" stroke="#8e3636" strokeWidth="3"/></>:<><path d="M-18 -48Q-19 -72 1 -74Q18 -71 19 -48L12 -56Q0 -63 -10 -53Z" fill={survivor?"#60432e":"#263c50"}/><circle cx="-7" cy="-40" r="2.7" fill="#172330" stroke="none"/><circle cx="8" cy="-40" r="2.7" fill="#172330" stroke="none"/>{survivor?<path d="M-5 -26Q1 -32 7 -26" fill="none" stroke="#8b4540" strokeWidth="3"/>:<path d="M-4 -27Q1 -24 6 -27" fill="none" stroke="#8b4540" strokeWidth="2.5"/>}</>}
  {survivor&&<path d="M-18 -10L-30 5L-20 17L-8 2" fill="#d58b5e" strokeWidth="3"/>}
  {infected&&<path d="M-16 5L-7 13L2 5L12 13" fill="none" stroke="#8e3636" strokeWidth="4"/>}
 </g>;
};

const BunkerArt:React.FC<{f:number}>=({f})=>{
 const reveal=ease(250,350,f), push=ease(350,600,f), alarm=ease(780,850,f);
 const exterior=1-push;
 const camera=push*18;
 const door=ease(260,390,f);
 const pulse=(Math.sin(f*.24)+1)/2;
 return <svg viewBox="0 0 540 960" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
 <defs>
  <linearGradient id="sky" x2="0" y2="1"><stop stopColor="#182b3d"/><stop offset="1" stopColor="#64717a"/></linearGradient>
  <linearGradient id="earth" x2="0" y2="1"><stop stopColor="#5d5c4a"/><stop offset="1" stopColor="#292f2c"/></linearGradient>
  <linearGradient id="concrete" x2="1" y2="1"><stop stopColor="#aeb1a8"/><stop offset=".48" stopColor="#6f7775"/><stop offset="1" stopColor="#424c50"/></linearGradient>
  <linearGradient id="inside" x2="0" y2="1"><stop stopColor="#344654"/><stop offset="1" stopColor="#101c29"/></linearGradient>
  <linearGradient id="door" x2="1" y2="1"><stop stopColor="#91a0a4"/><stop offset=".25" stopColor="#394953"/><stop offset=".65" stopColor="#1d2b36"/><stop offset="1" stopColor="#68757a"/></linearGradient>
  <radialGradient id="glow"><stop stopColor="#ffbf78" stopOpacity=".9"/><stop offset="1" stopColor="#ff8b4d" stopOpacity="0"/></radialGradient>
  <pattern id="grain" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M4 8l5 -2 M21 24l7 -3 M11 31l3 -1" stroke="#e2dfd1" strokeOpacity=".14" strokeWidth="1.5"/></pattern>
  <pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V12" stroke="#0b1722" strokeOpacity=".18" strokeWidth="3"/></pattern>
 </defs>
 <rect width="540" height="960" fill="#101c29"/>
 <g transform={`translate(0 ${-camera})`}>
  <rect width="540" height="490" fill="url(#sky)"/>
  <circle cx="425" cy="160" r="145" fill="url(#glow)" opacity={.55*(1-push)}/>
  <path d="M0 350 Q100 295 185 340 T360 330 T540 340 V570 H0Z" fill="#263b36"/>
  <path d="M0 400 Q110 354 230 390 T540 365 V600 H0Z" fill="#344638"/>
  <g opacity=".7" fill="#182d29"><path d="M20 365l20 -105 20 105z M63 372l25 -145 25 145z M410 370l22 -132 22 132z M468 370l24 -105 24 105z"/></g>
  <path d="M0 445 L540 445 V960 H0Z" fill="url(#earth)"/>
  <path d="M0 453 Q270 420 540 453" fill="none" stroke="#8e8768" strokeWidth="8"/>
  <g transform="translate(0 0)">
   <path d="M44 457 L44 320 Q44 278 86 278 H454 Q496 278 496 320 V457Z" fill="url(#concrete)" stroke="#d1d0c4" strokeWidth="8"/>
   <path d="M54 450 V325 Q54 291 91 291 H449 Q486 291 486 325 V450Z" fill="url(#inside)" stroke="#253744" strokeWidth="5"/>
   <path d="M44 320 Q44 278 86 278 H454 Q496 278 496 320" fill="none" stroke="#d7d4c8" strokeWidth="12"/>
   <path d="M44 278 H496 L475 250 H65Z" fill="#66705d" stroke="#a0a28b" strokeWidth="5"/>
   <path d="M54 291 H486 V450 H54Z" fill="url(#grain)" opacity=".7"/>
   <g opacity={1-push}>
    <path d="M0 458 L540 458 L540 495 L0 495Z" fill="#b58c5a"/>
    <path d="M0 468H540" stroke="#f1c47a" strokeWidth="4" strokeDasharray="18 12"/>
   </g>
   <g transform="translate(270 367)">
    <circle r="83" fill="#172630" stroke="#b3b9b5" strokeWidth="12"/>
    <circle r="68" fill="url(#door)" stroke="#1b2932" strokeWidth="7"/>
    <circle r="54" fill="none" stroke="#87969a" strokeWidth="4"/>
    <circle r="37" fill="none" stroke="#263944" strokeWidth="8"/>
    <path d="M-7 -57 H7 V57 H-7Z M-57 -7H57V7H-57Z" fill="#a6b2b3" opacity=".6"/>
    {Array.from({length:16},(_,i)=><circle key={i} cx={Math.cos(i*Math.PI/8)*75} cy={Math.sin(i*Math.PI/8)*75} r="4.5" fill="#e0c58e" stroke="#263944" strokeWidth="2"/>)}
    <g transform={`translate(${door*140} 0) rotate(${door*80})`}><path d="M-80 -83 Q-94 -92 -103 -70 V70 Q-94 92 -80 83Z" fill="#293c47" stroke="#aeb8b7" strokeWidth="5"/></g>
   </g>
   <g opacity={push}>
    <path d="M72 420 V328 H115 V420 M425 420 V328 H468 V420" fill="#53636a" stroke="#a7b0ad" strokeWidth="5"/>
    <path d="M82 347H105 M82 365H105 M435 347H458 M435 365H458" stroke="#d6b36d" strokeWidth="4"/>
    <g transform="translate(112 360)"><rect x="-22" y="-56" width="44" height="110" rx="5" fill="#273b48" stroke="#9da9a5" strokeWidth="4"/><path d="M-13 -35H13 M-13 -20H13 M-13 -5H13" stroke="#e1b66d" strokeWidth="4"/><circle cy="28" r="8" fill="#64c6bd"/></g>
    <g transform="translate(425 350)"><rect x="-35" y="-42" width="70" height="85" rx="5" fill="#1a2c39" stroke="#7f9599" strokeWidth="4"/><rect x="-25" y="-30" width="50" height="38" fill="#1b6570"/><path d="M-18 -12L-5 -22L7 -4L18 -17" fill="none" stroke="#8be2d4" strokeWidth="3"/><circle cx="0" cy="23" r="5" fill="#f2b75f"/></g>
    <g transform="translate(170 420)"><rect x="-34" y="-38" width="68" height="75" fill="#594c3d" stroke="#b59c73" strokeWidth="4"/><path d="M-24 -25H24 M-24 -8H24 M-24 9H24" stroke="#d8bd8c" strokeWidth="3"/><rect x="-25" y="-31" width="15" height="12" fill="#a5ad79"/><rect x="4" y="-31" width="18" height="12" fill="#b87850"/></g>
    <g transform="translate(350 420)"><rect x="-32" y="-48" width="64" height="90" rx="4" fill="#394a4d" stroke="#a3aca4" strokeWidth="4"/><path d="M-23 -28H23 M-23 -12H23 M-23 4H23" stroke="#7f9d91" strokeWidth="5"/><circle cy="27" r="12" fill="#c68a55"/></g>
   </g>
   <path d="M55 445H485" stroke="#d8c8a0" strokeWidth="6"/>
  </g>
  <g opacity={1-push}>
   <path d="M0 500 Q110 475 220 500 T540 492 V620 H0Z" fill="#353d35"/>
   <path d="M0 515H540" stroke="#c4a36b" strokeWidth="3" strokeDasharray="16 14"/>
   <g transform="translate(120 440)"><path d="M-55 0l-18 -36 35 8 16 -31 18 35 34 -8 -17 38Z" fill="#445847"/><path d="M-8 -20V-82" stroke="#293d34" strokeWidth="5"/></g>
   <g transform="translate(420 440)"><path d="M-55 0l-18 -36 35 8 16 -31 18 35 34 -8 -17 38Z" fill="#445847"/><path d="M-8 -20V-82" stroke="#293d34" strokeWidth="5"/></g>
  </g>
  <g opacity={push}>
   <rect x="0" y="470" width="540" height="490" fill="url(#inside)"/>
   <path d="M0 470 L540 470 L540 510 L0 510Z" fill="#253946"/>
   <path d="M0 510H540 M0 890H540" stroke="#8c9a98" strokeOpacity=".35" strokeWidth="5"/>
   <path d="M0 510L60 540V900L0 930Z M540 510L480 540V900L540 930Z" fill="#263b48" stroke="#819092" strokeWidth="4"/>
   <path d="M0 520L60 548 M540 520L480 548" stroke="#d2b57b" strokeWidth="5"/>
   <g opacity=".9">
    <path d="M75 550H190V565H75Z M75 660H190V675H75Z M75 770H190V785H75Z" fill="#6c7774"/>
    <path d="M350 550H465V565H350Z M350 660H465V675H350Z M350 770H465V785H350Z" fill="#6c7774"/>
    {Array.from({length:6},(_,i)=><g key={i}><rect x={82+(i%3)*32} y={580+Math.floor(i/3)*105} width="24" height="35" rx="3" fill={i%2?"#9b8057":"#7c936d"} stroke="#1c2c35" strokeWidth="3"/><path d={`M${85+(i%3)*32} ${590+Math.floor(i/3)*105}h18`} stroke="#d5c6a2" strokeWidth="3"/></g>)}
    <g transform="translate(270 770)"><rect x="-75" y="-65" width="150" height="115" rx="7" fill="#39484a" stroke="#9ca9a3" strokeWidth="5"/><rect x="-60" y="-48" width="120" height="52" fill="#102e3c" stroke="#7b999a" strokeWidth="3"/><path d="M-48 -24L-24 -34L-3 -15L20 -37L45 -18" fill="none" stroke="#66c5b5" strokeWidth="4"/><circle cx="0" cy="26" r="13" fill="#b28a54"/><path d="M-45 55V77 M45 55V77" stroke="#9ca9a3" strokeWidth="8"/></g>
    <path d="M65 845H475" stroke="#73817d" strokeWidth="5"/>
    <path d="M85 875H455" stroke="#8b9a93" strokeWidth="3" strokeDasharray="12 10"/>
   </g>
   <g transform="translate(270 535)"><path d="M-190 0H190" stroke="#879694" strokeWidth="6"/><path d="M-170 0V25 M170 0V25" stroke="#879694" strokeWidth="6"/><path d="M-130 0V18 M-65 0V18 M0 0V18 M65 0V18 M130 0V18" stroke="#c3a46e" strokeWidth="4"/></g>
  </g>
  <g transform={`translate(0 0)`} opacity={1-push}>
   <Figure x={270} y={490} s={.92} kind="owner"/>
  </g>
  <g opacity={reveal}>
   <Figure x={270} y={478} s={.86} kind="survivor" pose={1}/>
   <g transform={`translate(${350+Math.sin(f*.08)*8} 470)`}><path d="M-12 55Q-26 5 3 -18Q26 0 22 56Z" fill="#111b22" stroke="#070e15" strokeWidth="4"/><path d="M0 -8l14 18" stroke="#7e3836" strokeWidth="4"/></g>
  </g>
  <g opacity={alarm}>
   <rect x="0" y="450" width="540" height="510" fill="#b72e2b" opacity={pulse*.12}/>
   <path d="M40 470H500" stroke="#ed4b43" strokeWidth="5" opacity={pulse}/>
   <g transform="translate(270 515)"><rect x="-45" y="-14" width="90" height="28" rx="14" fill="#a82e2b" stroke="#ff9d80" strokeWidth="3"/><circle r="5" fill="#ffe1b0"/></g>
   <Figure x={270} y={478} s={.88} kind="survivor" pose={1}/>
   <Figure x={395} y={465} s={1.1} kind="infected" pose={1}/>
  </g>
 </g>
 <rect width="540" height="960" fill="url(#hatch)" opacity=".18" pointerEvents="none"/>
 <path d="M0 0H540V960H0Z" fill="none" stroke="#0a1119" strokeWidth="18"/>
 </svg>;
};

const beats=[
 {a:0,b:104,tag:"THE LAST SHELTER",text:"I spent $1,000,000 preparing for the end of the world."},
 {a:105,b:225,tag:"BUILT TO SURVIVE",text:"Six metres underground. Reinforced concrete. A four-tonne blast door."},
 {a:226,b:390,tag:"ONE YEAR. NO EXIT.",text:"Food, clean water, power, medicine. Everything I need to outlast the outbreak."},
 {a:391,b:555,tag:"DAY ONE",text:"Then every motion sensor in the bunker turned red."},
 {a:556,b:735,tag:"THREE SURVIVORS",text:"One was bleeding. One was screaming. And one wasn't moving like a human."},
 {a:736,b:900,tag:"INCOMING TRANSMISSION",text:"The radio crackled: “Please open the door. I'm not alone.”"},
 {a:901,b:1034,tag:"CHECK THE CAMERA",text:"But the camera showed one person… and a second shadow behind them."},
 {a:1035,b:1199,tag:"YOUR CALL",text:"Would you risk opening the door?"}
];
const Overlay:React.FC=()=>{
 const f=useCurrentFrame(), beat=beats.find(b=>f>=b.a&&f<=b.b)||beats[beats.length-1], opacity=fade(f,beat.a,beat.b);
 const final=f>=1035;
 return <AbsoluteFill style={{pointerEvents:"none",fontFamily:"Arial,Helvetica,sans-serif",color:"#fff",padding:"7% 7% 8%",justifyContent:"space-between"}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:19,fontWeight:900,letterSpacing:3,textShadow:"0 2px 8px #07111c"}}>
   <span>LAST SHELTER</span><span style={{color:"#f1c27b"}}>01 / 06</span>
  </div>
  <div style={{marginTop:"auto",marginBottom:final?"auto":"7%",opacity,textAlign:"left",maxWidth:"100%"}}>
   <div style={{fontSize:18,fontWeight:900,letterSpacing:4,color:"#f3bd72",marginBottom:15,textShadow:"0 2px 6px #07111c"}}>{beat.tag}</div>
   <div style={{fontSize:39,fontWeight:900,lineHeight:1.08,letterSpacing:-1.1,textShadow:"0 3px 15px rgba(0,0,0,.95)",maxWidth:490}}>{beat.text}</div>
   {final&&<div style={{display:"flex",gap:12,marginTop:28}}>
    <div style={{flex:1,background:"#174f61",border:"2px solid #85d8df",padding:"18px 14px",borderRadius:12}}><div style={{fontSize:22,fontWeight:900,color:"#a8f0f2"}}>A — OPEN</div><div style={{fontSize:19,fontWeight:700,marginTop:7}}>Let them in.</div></div>
    <div style={{flex:1,background:"#652f32",border:"2px solid #f09b7e",padding:"18px 14px",borderRadius:12}}><div style={{fontSize:22,fontWeight:900,color:"#ffc0a6"}}>B — SEAL</div><div style={{fontSize:19,fontWeight:700,marginTop:7}}>Save the bunker.</div></div>
   </div>}
  </div>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:900,letterSpacing:2,textShadow:"0 2px 8px #07111c"}}><span>COMMENT A OR B</span><span>PART 01</span></div>
 </AbsoluteFill>;
};
export const BunkerSurvival:React.FC=()=>{
 const f=useCurrentFrame();
 return <AbsoluteFill style={{background:"#101c29"}}><BunkerArt f={f}/><Overlay/></AbsoluteFill>;
};
