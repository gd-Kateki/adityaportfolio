import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
const pages=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
let errors=[],links=0;
const fail=(file,message)=>errors.push(`${file}: ${message}`);
for(const file of pages){
 const html=fs.readFileSync(file,'utf8');
 if(!/<main\b/.test(html))fail(file,'Missing main landmark');
 if((html.match(/class="site-header"/g)||[]).length!==1)fail(file,'Expected one shared header');
 if((html.match(/class="site-footer"/g)||[]).length!==1)fail(file,'Expected one shared footer');
 if(!/<h1\b/.test(html))fail(file,'Missing main heading');
 if(/onclick=/.test(html))fail(file,'Inline click handler');
 if(/\{\{/.test(html))fail(file,'Unresolved template');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 for(const id of new Set(ids))if(ids.filter(x=>x===id).length>1)fail(file,`Duplicate id ${id}`);
 for(const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)){
  const url=match[1];if(/^(https?:|mailto:|data:|javascript:)/.test(url))continue;
  const [p,hash]=url.split('#');const target=decodeURIComponent((p||file).split('?')[0]);
  links++;if(!fs.existsSync(target)){fail(file,`Missing ${target}`);continue}
  if(hash&&target.endsWith('.html')&&!fs.readFileSync(target,'utf8').includes(`id="${hash}"`))fail(file,`Missing anchor ${url}`);
 }
 for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))try{new vm.Script(script[1])}catch(e){fail(file,e.message)}
}
new vm.Script(fs.readFileSync('assets/js/main.js','utf8'));
new vm.Script(fs.readFileSync('assets/js/motion.js','utf8'));
const projects=JSON.parse(fs.readFileSync('src/data/projects.json','utf8'));
assert.equal(projects.length,8);
assert.equal(projects.filter(p=>p.discipline==='game').length,3);
assert.equal(new Set(projects.map(p=>p.id)).size,projects.length);
for(const p of projects)assert.ok(fs.existsSync(p.url),`Missing case study ${p.url}`);
for(const page of ['index.html','projects.html']){
 const html=fs.readFileSync(page,'utf8');
 assert.equal((html.match(/data-discipline=/g)||[]).length,page==='index.html'?projects.filter(p=>p.featured).length:projects.length,`${page} should show its intended selection`);
 assert.ok(!html.includes('gdPortfolioPrompt'));
}
const home=fs.readFileSync('index.html','utf8');
const sectionOrder=['home','work','about','experience','contact'].map(id=>home.indexOf(`id="${id}"`));
assert.ok(sectionOrder.every((position,index)=>position>=0&&(index===0||position>sectionOrder[index-1])),'Homepage sections should follow the agreed hierarchy');
assert.ok(!home.includes('data-explorer'),'Homepage should preview work, not repeat catalogue controls');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`Passed: ${pages.length} pages, ${links} local references, all project routes, static cards, unique IDs, landmarks, and JavaScript syntax.`);
