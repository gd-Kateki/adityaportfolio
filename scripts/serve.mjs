import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { output as root } from './lib/paths.mjs';
if(!fs.existsSync(path.join(root,'index.html'))) throw new Error('Run npm run build before starting the preview.');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.pdf':'application/pdf'};
http.createServer((req,res)=>{
 let relative;
 try{relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '')||'index.html'}catch{res.writeHead(400);res.end();return}
 const file=path.resolve(root,relative);
 const publicFile=relative.startsWith('assets/')||relative==='styles.css'||/^[^/\\]+\.html$/.test(relative);
 if(!file.startsWith(root+path.sep)||relative.split(/[\\/]/).some(p=>p.startsWith('.'))||!publicFile){res.writeHead(403);res.end();return}
 try{const content=fs.readFileSync(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(content)}catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(fs.readFileSync(path.join(root,'404.html')))}
}).listen(4173,'127.0.0.1',()=>console.log('Portfolio preview: http://127.0.0.1:4173'));
