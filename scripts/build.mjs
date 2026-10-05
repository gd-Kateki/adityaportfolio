import fs from 'node:fs';
import path from 'node:path';
import { caseTools, reserveImageSpace } from './lib/page-shell.mjs';
import { root, output } from './lib/paths.mjs';
// Only this generated directory may be cleared; never follow a linked output folder.
if(path.dirname(output)!==root || path.basename(output)!=='dist') throw new Error('Unsafe build output');
if(fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink()) throw new Error('Build output must not be a symbolic link');
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});
fs.cpSync(path.join(root,'assets'),path.join(output,'assets'),{recursive:true});
fs.cpSync(path.join(root,'public'),output,{recursive:true});
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const projects=JSON.parse(read('src/data/projects.json'));
const resumePath='assets/documents/aditya-nair-resume.pdf';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function card(p){
 const visual=p.id==='novelnest'?`<div class="novelnest-cover"><img src="assets/images/thumbnails/novelnest-home.png" alt="NovelNest home and discovery interface" loading="lazy" width="486" height="1055"><img src="assets/images/thumbnails/novelnest-detail.png" alt="NovelNest story browsing interface" loading="lazy" width="486" height="1055"></div>`:p.image?`<img src="${escape(p.image)}" alt="${escape(p.title)} project preview" loading="lazy" decoding="async" width="760" height="440">`:`<div class="project-art ${escape(p.visual)}" aria-hidden="true">${p.visual==='novelnest'?'<span class="art-book">N</span><span>NovelNest</span><small>A home for every story.</small>':'<span class="art-college">St. Andrew’s</span><small>Heritage meets clarity.</small>'}</div>`;
 return `<article class="proj-card" data-project="${escape(p.id)}" data-discipline="${p.discipline}" data-search="${escape([p.title,p.category,...p.tags,p.description].join(' ').toLowerCase())}"><div class="proj-visual ${p.id==='cafe'?'cafe-visual':''}">${visual}<span class="discipline-label">${p.discipline==='game'?'Game design':'UI/UX design'}</span></div><div class="proj-body"><div class="proj-tags">${p.tags.map(t=>`<span class="proj-tag">${escape(t)}</span>`).join('')}</div><h3 class="proj-title"><a class="project-title-link" href="${p.url}">${escape(p.title)}</a></h3><p class="proj-desc">${escape(p.description)}</p><p class="project-deliverable">${escape(p.label)}</p><div class="proj-footer"><span class="proj-year">${p.year}</span><span class="proj-link" aria-hidden="true">Explore project <span class="card-arrow">↗</span></span></div></div></article>`;
}
function explorer(featured=false){
 if(featured) return `<div class="home-work-preview"><div class="discipline-routes" aria-label="Explore work by discipline"><a href="projects.html?discipline=uiux">UI/UX design <span aria-hidden="true">↗</span></a><a href="projects.html?discipline=game">Game design <span aria-hidden="true">↗</span></a></div><div class="portfolio-grid home-project-grid">${projects.filter(p=>p.featured).map(card).join('\n')}</div><a class="text-link preview-more" href="projects.html">Explore all ${projects.length} projects <span aria-hidden="true">→</span></a></div>`;
 return `<div class="project-explorer ${featured?'featured-explorer':''}" data-explorer><div class="explorer-toolbar"><div class="filter-container" role="group" aria-label="Filter projects by discipline"><button class="filter-btn active" type="button" data-filter="all" aria-pressed="true">All work <span>08</span></button><button class="filter-btn" type="button" data-filter="uiux" aria-pressed="false">UI/UX design <span>05</span></button><button class="filter-btn" type="button" data-filter="game" aria-pressed="false">Game design <span>03</span></button></div>${featured?'':'<label class="project-search"><span class="sr-only">Search projects by name, tool, or skill</span><span aria-hidden="true">⌕</span><input type="search" placeholder="Search projects, tools, skills…" data-project-search autocomplete="off"></label>'}</div><div class="explorer-caption"><p>${featured?'Two disciplines. One considered approach.':'Find a project that speaks to your brief.'}</p><p data-result-count role="status" aria-live="polite">8 projects</p></div><div class="portfolio-grid">${projects.map(card).join('\n')}</div><div class="empty-state" hidden><h3>No matching projects</h3><p>Try a different name or tool, or explore all the work.</p><button type="button" class="btn-outline" data-reset-filters>Reset filters</button></div></div>`;
}
for(const file of fs.readdirSync(path.join(root,'src/pages')).filter(f=>f.endsWith('.html'))){
 let html=read(`src/pages/${file}`);
 const project=projects.find(p=>p.url===file);
 if(project) html=caseTools(html,project);
 if(project) html=reserveImageSpace(html,root,fs);
 html=html.replace('</head>','<link rel="stylesheet" href="assets/css/site-shell.css">\n<link rel="stylesheet" href="assets/css/hierarchy.css">\n<link rel="stylesheet" href="assets/css/glass.css">\n<link rel="stylesheet" href="assets/css/identity.css">\n<link rel="stylesheet" href="assets/css/motion.css">\n<script src="assets/js/motion.js" defer></script>\n</head>');
 html=html.replace(/\{\{(nav|footer)\}\}/g,(_,part)=>read(`src/partials/${part}.html`));
 html=html.replace('{{featured-projects}}',explorer(true)).replace('{{project-explorer}}',explorer());
 // Only expose a download when the owner's actual résumé is available.
 html=html.replace('{{resume-download}}',fs.existsSync(path.join(root,resumePath))?`<a class="btn-outline resume-download" href="${resumePath}" download="Aditya-Nair-Resume.pdf">Download resume <span aria-hidden="true">↓</span></a>`:'');
 const current=projects.findIndex(p=>p.url===file),next=projects[(current+1)%projects.length];
 html=html.replace('{{case-footer}}',`<nav class="case-next" aria-label="More projects"><a href="projects.html"><small>Keep exploring</small><strong>All projects <span aria-hidden="true">↗</span></strong></a><a href="${next.url}"><small>Next project</small><strong>${escape(next.title)} <span aria-hidden="true">→</span></strong></a></nav>`);
 if(/\{\{/.test(html))throw new Error(`Unresolved template in ${file}`);
 fs.writeFileSync(path.join(output,file),html);
}
console.log(`Built ${fs.readdirSync(path.join(root,'src/pages')).filter(f=>f.endsWith('.html')).length} static pages with ${projects.length} projects in dist/.`);
