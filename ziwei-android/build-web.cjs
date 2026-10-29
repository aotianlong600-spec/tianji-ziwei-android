const path = require('node:path');
const fs = require('node:fs');
const esbuild = require(require.resolve('esbuild', { paths: [path.join(__dirname,'../ziwei-doushu/node_modules')] }));
const output = path.join(__dirname, 'build/assets');
fs.mkdirSync(output, { recursive: true });
const result = esbuild.buildSync({ entryPoints: [path.join(__dirname,'web/app.ts')], bundle:true, minify:true, target:'es2017', nodePaths:[path.join(__dirname,'../ziwei-doushu/node_modules')], outfile:path.join(output,'app.js'), legalComments:'eof', metafile:true });
for (const name of ['index.html','style.css']) fs.copyFileSync(path.join(__dirname,'web',name),path.join(output,name));
const packages = new Set();
for(const name of Object.keys(result.metafile.inputs)) {
  const abs=path.resolve(name).replace(/\\/g,'/'), at=abs.lastIndexOf('/node_modules/');
  if(at<0) continue;
  const pieces=abs.slice(at+14).split('/');
  packages.add(abs.slice(0,at+14)+pieces.slice(0,pieces[0].startsWith('@')?2:1).join('/'));
}
let notices='天纪紫微 1.3.0\n四柱命卦按《天机道》表例独立实现；天数5按4为本项目约定口径。\n紫微流年小限、年支太岁、四柱流年卦分别计算；命卦以立春年柱归年起算。\n亮度盘例对照表以中州表为底，含三处约定修订；小星亮度沿用所选表。\n\n排盘引擎来源：Renhuai123/ziwei-doushu（本地修订）\n\n'+fs.readFileSync(path.join(__dirname,'../ziwei-doushu/LICENSE'),'utf8');
for(const dir of packages) {
  const metadata=JSON.parse(fs.readFileSync(path.join(dir,'package.json'),'utf8'));
  const license=fs.readdirSync(dir).find(name=>/^licen[cs]e(?:\.|$)/i.test(name));
  notices+=`\n\n--- ${metadata.name} ${metadata.version} ---\n`+(license?fs.readFileSync(path.join(dir,license),'utf8'):`License: ${metadata.license}`);
}
fs.writeFileSync(path.join(output,'THIRD_PARTY_NOTICES.txt'),notices);
console.log('Offline web assets built');
