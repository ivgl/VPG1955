#!/usr/bin/env node
/* Read-only local link and exposure audit for the VPI1955 public GitHub Pages site.
   Run from repository root: node scripts/check-public-links.mjs
   External HTTP statuses are deliberately not guessed: verify providers separately.
*/
import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const pages=["index.html","rules.html",..."usa ussr gbr fra frg jpn chn egy ind isr ita yug".split(" ").map(c=>"countries/"+c+".html")];
const allowedExtensions=new Set([".html",".js",".css",".svg",".png",".jpg",".jpeg",".webp",".json",".gif",".ico"]);
const blocked=[/docs\.google\.com\/spreadsheets\//i,/drive\.google\.com\/file\//i,/player_sheet_url/i, /chinacoop\.gov\.cn\/HTML\/2016\/04\/21\/106354/i, /State%2520Reorganisation%2520/i, /origin1504-mha\.nic\.in/i];
const errors=[],seen=new Set(),queue=[...pages];
const check=(file,p)=>fs.existsSync(path.resolve(root,file,p));
function validate(origin,ref){
 if(!ref||/^(?:#|mailto:|tel:|data:|javascript:)/i.test(ref)){
  if(ref?.startsWith("#") && origin.endsWith(".html")){
   const body=fs.readFileSync(path.join(root,origin),"utf8");
   const frag=ref.slice(1);
   if(frag && !body.includes('id="'+frag+'"') && !body.includes("id='"+frag+"'"))errors.push("Missing anchor: "+origin+" -> "+ref);
  }
  return;
 }
 if(/^https?:\/\//i.test(ref)||ref.startsWith("//"))return;
 const pathname=decodeURIComponent(ref.split("#")[0].split("?")[0]);
 if(!pathname||!allowedExtensions.has(path.posix.extname(pathname).toLowerCase()))return;
 const dest=path.posix.normalize(path.posix.join(path.posix.dirname(origin),pathname));
 if(dest.startsWith("../")||dest.startsWith("/")){errors.push("Outside public site: "+origin+" -> "+ref);return}
 if(!fs.existsSync(path.join(root,dest)))errors.push("Missing local target: "+origin+" -> "+dest);
 else if(/\.(?:js|css|html)$/i.test(dest)&&!seen.has(dest))queue.push(dest);
}
while(queue.length){
 const f=queue.shift();
 if(seen.has(f))continue;seen.add(f);
 if(!fs.existsSync(path.join(root,f))){errors.push("File missing: "+f);continue}
 const s=fs.readFileSync(path.join(root,f),"utf8");
 for(const forbidden of blocked)if(forbidden.test(s))errors.push("Forbidden reference "+forbidden+" in "+f);
 if(f.endsWith(".html"))for(const m of s.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/g))validate(f,m[1]);
 if(f.endsWith(".css"))for(const m of s.matchAll(/(?:@import\s+)?url\(\s*["']?([^"')]+)["']?\s*\)/g))validate(f,m[1]);
 if(f.endsWith(".js")){
  // Avoid arbitrary JS execution in the audit; only string-literal references.
  for(const m of s.matchAll(/["']((?:\.\.\/|\.\/)[^"']+\.(?:js|css|html|svg|json))["']/g))validate(f,m[1]);
 }
}
console.log("Active pages:",pages.length,"| checked public HTML/JS/CSS:",seen.size);
if(errors.length){for(const err of errors)console.error("FAIL",err);process.exitCode=1;}
else console.log("PASS: no exposed Google Sheets URLs or known dead links; no missing local files/anchors.");
