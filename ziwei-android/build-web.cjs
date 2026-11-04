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
let notices='天纪紫微 1.9.0\n四柱命卦按《天机道》表例独立实现；天数5按4为本项目约定口径。\n紫微流年小限、年支太岁、四柱流年卦分别计算；命卦以立春年柱归年起算。\n流日按精确交节时刻起算，六日一卦；第31日起标待核。\n亮度盘例对照表以中州表为底，主星含三处约定修订；小星封诰子丑寅卯午及天姚寅按盘例补庙，其他沿用所选表；封诰丑为单例。\n\n条辨文字据用户提供的天纪网友整理稿；原文权益不在程序MIT许可范围内。\n\n排盘引擎来源：Renhuai123/ziwei-doushu（本地修订）\n\n'+fs.readFileSync(path.join(__dirname,'../ziwei-doushu/LICENSE'),'utf8');
notices+='\n\n--- 离线出生地代表经度 ---\nCity Geo: Copyright (c) 2020-present, b3log.org. Mulan PSL v2.\n来源：https://github.com/88250/city-geo/tree/0e7cb877cb75f4767a81d51c5921de33aacc8089\n补充地区：Wikidata P625（CC0），逐项版本见 birth-regions.ts；三沙及草湖代表点另据地方公开资料。均为近似代表点，不是具体出生地址。\n\n'+fs.readFileSync(path.join(__dirname,'third-party/city-geo-MulanPSL2.txt'),'utf8');
notices+='\n\n--- GeoNames 离线世界城市数据（派生摘录）---\n'+fs.readFileSync(path.join(__dirname,'third-party/geonames-CC-BY-4.0.txt'),'utf8');
for(const dir of packages) {
  const metadata=JSON.parse(fs.readFileSync(path.join(dir,'package.json'),'utf8'));
  const license=fs.readdirSync(dir).find(name=>/^licen[cs]e(?:\.|$)/i.test(name));
  notices+=`\n\n--- ${metadata.name} ${metadata.version} ---\n`+(license?fs.readFileSync(path.join(dir,license),'utf8'):`License: ${metadata.license}`);
}
fs.writeFileSync(path.join(output,'THIRD_PARTY_NOTICES.txt'),notices);
console.log('Offline web assets built');
