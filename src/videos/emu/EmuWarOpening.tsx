import React, {useEffect, useMemo} from "react";
import * as THREE from "three";
import {AbsoluteFill, useCurrentFrame} from "remotion";
import {ThreeCanvas} from "@remotion/three";
import {useThree} from "@react-three/fiber";
import {EffectComposer} from "@react-three/postprocessing";
import {BloomEffect, BlendFunction, ToneMappingEffect, ToneMappingMode} from "postprocessing";
import {InkPass, noInkFallback, NOINK} from "../bridge/ink";
import {LensBlur} from "../bridge/lensblur";
import {GradeEffect, GRADES, GRADE_STRENGTH, gradeFor} from "../bridge/grade";

const FPS=30;
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=(v:number)=>{const x=clamp(v);return x*x*(3-2*x);};
const hash=(n:number)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};

function cardTexture(kind:"soldier"|"emu"|"lookout") {
  const canvas=document.createElement("canvas"); canvas.width=256; canvas.height=512;
  const g=canvas.getContext("2d")!;
  const ink="#241726"; g.lineCap="round";g.lineJoin="round";
  const path=(pts:number[][],fill:string,width=8)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.strokeStyle=ink;g.lineWidth=width;g.stroke();g.fillStyle=fill;g.fill();};
  if(kind==="soldier"){
    // Flat bean-head card, deliberately not a 3D human.
    path([[82,235],[76,190],[84,140],[112,108],[151,110],[178,139],[182,190],[171,232],[150,250],[105,248]],"#f2d2b0",10);
    g.fillStyle="#2a201f";g.fillRect(83,102,91,24);g.fillRect(99,74,61,35);
    g.fillStyle=ink;g.beginPath();g.ellipse(111,177,7,10,0,0,Math.PI*2);g.ellipse(151,177,7,10,0,0,Math.PI*2);g.fill();
    g.beginPath();g.moveTo(108,208);g.quadraticCurveTo(130,216,153,207);g.strokeStyle=ink;g.lineWidth=5;g.stroke();
    path([[88,250],[168,250],[188,377],[70,377]],"#8b9271",10);
    path([[99,377],[118,377],[111,469],[88,469]],"#a9a18b",8);path([[145,377],[164,377],[177,469],[153,469]],"#a9a18b",8);
    path([[78,462],[111,462],[115,484],[69,484]],"#34343a",8);path([[153,462],[180,462],[190,484],[151,484]],"#34343a",8);
    g.strokeStyle=ink;g.lineWidth=13;g.beginPath();g.moveTo(79,270);g.lineTo(50,352);g.moveTo(176,270);g.lineTo(204,342);g.stroke();
  } else {
    const body=kind==="lookout"?"#393039":"#645b50";
    path([[61,267],[72,219],[111,191],[169,205],[199,246],[185,313],[138,348],[81,327]],body,10);
    // Long blue-grey neck and small beak; lookout is slightly taller.
    g.strokeStyle=ink;g.lineWidth=19;g.beginPath();g.moveTo(148,231);g.quadraticCurveTo(165,145,145,66);g.stroke();
    g.strokeStyle=kind==="lookout"?"#596a7b":"#748394";g.lineWidth=11;g.beginPath();g.moveTo(148,230);g.quadraticCurveTo(165,145,145,66);g.stroke();
    path([[131,66],[157,61],[181,74],[153,82]],"#3c3435",5);
    g.fillStyle="#fff";g.beginPath();g.ellipse(145,94,10,8,0,0,Math.PI*2);g.fill();g.fillStyle=ink;g.beginPath();g.arc(148,94,3,0,Math.PI*2);g.fill();
    for(let i=0;i<9;i++){g.strokeStyle=ink;g.lineWidth=5;g.beginPath();g.moveTo(78+i*12,250+hash(i)*20);g.lineTo(60+i*14,282+hash(i+9)*23);g.stroke();}
    g.strokeStyle=ink;g.lineWidth=8;g.beginPath();g.moveTo(105,330);g.lineTo(93,425);g.lineTo(74,463);g.moveTo(157,334);g.lineTo(169,420);g.lineTo(190,455);g.stroke();
    g.strokeStyle=ink;g.lineWidth=5;g.beginPath();g.moveTo(74,463);g.lineTo(60,476);g.moveTo(74,463);g.lineTo(86,479);g.moveTo(190,455);g.lineTo(177,473);g.moveTo(190,455);g.lineTo(205,469);g.stroke();
  }
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}

const SpriteCard:React.FC<{kind:"soldier"|"emu"|"lookout";position:[number,number,number];scale?:[number,number,number];}> = ({kind,position,scale=[1,2,1]})=>{
 const map=useMemo(()=>cardTexture(kind),[kind]);
 return <mesh position={position} scale={scale} onUpdate={(o)=>o.layers.set(NOINK)}><planeGeometry args={[1,1]}/><meshLambertMaterial map={map} transparent alphaTest={0.12} side={THREE.DoubleSide}/></mesh>;
};

const dirtTexture=()=>{
 const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=1024;
 const g=canvas.getContext("2d")!;g.fillStyle="#a65f3b";g.fillRect(0,0,1024,1024);
 for(let i=0;i<190;i++){const x=hash(i)*1024,y=hash(i+31)*1024,r=25+hash(i+63)*90;g.fillStyle=i%3===0?"rgba(75,45,35,.10)":"rgba(225,165,105,.10)";g.beginPath();g.ellipse(x,y,r,r*.38,hash(i+92)*Math.PI,0,Math.PI*2);g.fill();}
 for(let i=0;i<1600;i++){const x=hash(i+100)*1024,y=hash(i+400)*1024;g.strokeStyle=i%3===0?"rgba(74,63,43,.35)":"rgba(216,176,112,.45)";g.lineWidth=1+hash(i+800)*2;g.beginPath();g.moveTo(x,y);g.lineTo(x+2+hash(i+900)*10,y-2-hash(i+1200)*8);g.stroke();}
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;return tex;
};

const Wheat:React.FC<{x:number;z:number;h:number;lean:number}> = ({x,z,h,lean})=>(
 <group position={[x,0,z]} rotation={[0,0,lean]}>
  <mesh position={[0,h/2,0]}><cylinderGeometry args={[0.012,0.02,h,5]}/><meshStandardMaterial color="#9a7a3e" roughness={1}/></mesh>
  <mesh position={[0,h+0.08,0]} rotation={[0,0,-0.12]}><coneGeometry args={[0.045,0.2,5]}/><meshStandardMaterial color="#c8a45b" roughness={1}/></mesh>
 </group>
);

const PostProcess:React.FC=()=>{
 const {scene,camera}=useThree();
 const fx=useMemo(()=>({
  ink:new InkPass(scene,camera as THREE.PerspectiveCamera),
  lens:new LensBlur({maxCoC:24,nearScale:1.2}),
  bloom:new BloomEffect({blendFunction:BlendFunction.ADD,intensity:0.5,luminanceThreshold:1.0,luminanceSmoothing:0.2,mipmapBlur:true,levels:6,radius:0.6}),
  tone:new ToneMappingEffect({mode:ToneMappingMode.NEUTRAL}),
  grade:new GradeEffect(GRADES.golden,GRADE_STRENGTH.golden),
 }),[scene,camera]);
 useEffect(()=>()=>fx.ink.dispose(),[fx]);
 noInkFallback(scene);
 gradeFor(fx.grade,"golden");
 fx.lens.cInf=0; // the opening is an establishing wide; reserve DOF for the planned foreground-wheat close shot
 return <EffectComposer multisampling={4}>
  <primitive object={fx.ink} dispose={null}/>
  <primitive object={fx.lens.pre} dispose={null}/>
  <primitive object={fx.lens.main} dispose={null}/>
  <primitive object={fx.bloom} dispose={null}/>
  <primitive object={fx.tone} dispose={null}/>
  <primitive object={fx.grade} dispose={null}/>
 </EffectComposer>;
};

const OpeningScene:React.FC=()=>{
 const frame=useCurrentFrame(); const {camera}=useThree();
 const t=frame/FPS;
 const move=ease(frame/35);
 camera.position.set(-1.5+0.18*move,3.1-0.25*move,14-1.2*move);
 camera.lookAt(-1.5,1.7,-2.5);
 const dirt=useMemo(()=>dirtTexture(),[]);
 const wheat=useMemo(()=>Array.from({length:440},(_,i)=>({x:(hash(i)-.5)*35,z:-12+hash(i+700)*25,h:.75+hash(i+1300)*1.25,lean:(hash(i+2200)-.5)*.25})),[]);
 const soldiers=[-3.3,-2.4,-1.5,-.6,.3].map((x,i)=><SpriteCard key={i} kind="soldier" position={[x,1.05,2.1+(i%2)*.15]} scale={[.78,2.1,1]}/>);
 const emus=Array.from({length:17},(_,i)=><SpriteCard key={i} kind="emu" position={[-8+i*.92,.45,-18-hash(i+50)*2]} scale={[.65,1.25,1]}/>);
 return <>
  <color attach="background" args={["#e9b77f"]}/>
  <mesh onUpdate={(o)=>o.layers.set(NOINK)}><sphereGeometry args={[100,48,24]}/><shaderMaterial side={THREE.BackSide} depthWrite={false} vertexShader={`varying vec3 vP; void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`} fragmentShader={`varying vec3 vP; void main(){float h=clamp(vP.y,0.0,1.0);vec3 horizon=vec3(0.82,0.48,0.34);vec3 top=vec3(0.36,0.27,0.40);vec3 c=mix(horizon,top,smoothstep(0.0,0.72,h));gl_FragColor=vec4(c,1.0);}`}/></mesh>
  <fog attach="fog" args={["#e8bb91",22,65]}/>
  <ambientLight intensity={1.25}/>
  <directionalLight position={[-8,9,7]} intensity={2.3} color="#ffcf9e"/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.05,-5]}><planeGeometry args={[90,90]}/><meshLambertMaterial map={dirt} color="#ffffff" roughness={1}/></mesh>
  <mesh position={[0,1.8,-27]}><planeGeometry args={[90,9]}/><meshBasicMaterial color="#c98c64"/></mesh>
  <mesh position={[0,9,-35]}><sphereGeometry args={[1.2,24,16]}/><meshBasicMaterial color="#ffcf9e"/></mesh>
  {wheat.map((w,i)=><Wheat key={i} {...w}/>)}
  {soldiers}
  {emus}
  <SpriteCard kind="lookout" position={[7.4,.62,-17.6]} scale={[.88,1.85,1]}/>
  {/* Lewis gun silhouette: cooling jacket, receiver and top pan magazine. */}
  <group position={[-3.65,1.2,1.4]} rotation={[0,-.1,0]}>
   <mesh position={[0,.35,-.45]}><boxGeometry args={[.65,.28,1.25]}/><meshStandardMaterial color="#4b4b49" roughness={.75}/></mesh>
   <mesh position={[0,.42,-1.2]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.075,.075,.95,12]}/><meshStandardMaterial color="#59616a" metalness:.5 roughness:.45/></mesh>
   <mesh position={[0,.64,-.25]}><cylinderGeometry args={[.3,.3,.12,24]}/><meshStandardMaterial color="#6b7074" metalness:.45 roughness:.5/></mesh>
   <mesh position={[-.12,-.3,-.45]} rotation={[0,0,-.15]}><boxGeometry args={[.08,.75,.08]}/><meshStandardMaterial color="#414447"/></mesh>
   <mesh position={[.12,-.3,-.45]} rotation={[0,0,.15]}><boxGeometry args={[.08,.75,.08]}/><meshStandardMaterial color="#414447"/></mesh>
  </group>
  <mesh position={[0,0.02,0]}><boxGeometry args={[2.1,.06,.1]}/><meshStandardMaterial color="#76502f"/></mesh>
  <PostProcess/>
 </>;
};

export const EmuWarOpening:React.FC=()=>(
 <AbsoluteFill style={{background:"#e9b77f"}}>
  <ThreeCanvas width={1080} height={1920} shadows camera={{position:[0,3.1,14],fov:43,near:.1,far:150}}>
   <OpeningScene/>
  </ThreeCanvas>
 </AbsoluteFill>
);
