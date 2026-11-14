// Render selected stills; no machine-specific browser path is assumed.
import fs from "node:fs";
import path from "node:path";
if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP,{recursive:true}); process.env.TEMP=process.env.TMP=process.env.REMOTION_TMP; }
const {bundle}=await import("@remotion/bundler");
const {renderStill,selectComposition}=await import("@remotion/renderer");
const [prefix,frames,scale="0.5",compositionId="BridgeShort"]=process.argv.slice(2);
if(!prefix||!frames) throw new Error("Usage: node scripts/bridge-stills.mjs <prefix> <frames> [scale] [compositionId]");
const browser=process.env.CHROME_EXECUTABLE?{browserExecutable:process.env.CHROME_EXECUTABLE}:{};
const serveUrl=await bundle({entryPoint:path.resolve(process.env.BRIDGE_ENTRY||"src/index.ts"),publicDir:path.resolve("public")});
const composition=await selectComposition({serveUrl,id:compositionId,...browser,chromiumOptions:{gl:"angle"}});
for(const frame of frames.split(",").map(Number)){fs.mkdirSync(path.dirname(prefix),{recursive:true});const output=prefix+frame+".jpg";await renderStill({composition,serveUrl,frame,output,imageFormat:"jpeg",jpegQuality:90,scale:Number(scale),...browser,chromiumOptions:{gl:"angle"},timeoutInMilliseconds:180000});console.log("Rendered",output);}
