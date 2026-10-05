// Generate stable section anchors and consistent navigation around each art direction.
const clean = text => text.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
const escape = text => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
export function caseTools(html, project) {
  const sections = [];
  let index = 0;
  html = html.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/g, (match, attrs, content) => {
    const id = attrs.match(/\bid="([^"]+)"/)?.[1] || `section-${++index}`;
    sections.push({ id, title: clean(content) });
    return `<h2${attrs}${/\bid=/.test(attrs) ? '' : ` id="${id}"`} tabindex="-1" data-reading-section>${content}</h2>`;
  });
  const links = sections.map(({id,title}) => `<a href="#${id}" data-section-link>${escape(title)}</a>`).join('');
  const menu = sections.length ? `<details class="section-menu"><summary><span class="section-menu-label">On this page</span><span data-current-section>Overview</span><span aria-hidden="true">⌄</span></summary><nav aria-label="Page sections">${links}</nav></details>` : '';
  const tools = `<div class="page-tools"><nav class="site-breadcrumb" aria-label="Breadcrumb"><a href="projects.html">← All projects</a><span aria-hidden="true">/</span><span aria-current="page">${escape(project.title)}</span></nav>${menu}</div>`;
  return html.replace('<main id="main-content">', `<main id="main-content">${tools}`);
}

export function reserveImageSpace(html, root, fs) {
  return html.replace(/<img\b[^>]*>/g, tag => {
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    if (!src?.endsWith('.png') || !src.startsWith('assets/') || /\bwidth=/.test(tag)) return tag;
    const bytes = fs.readFileSync(`${root}/${src}`);
    if (bytes.toString('ascii', 1, 4) !== 'PNG') return tag;
    return tag.replace(/\s*\/?>(\s*)$/, ` width="${bytes.readUInt32BE(16)}" height="${bytes.readUInt32BE(20)}">`);
  });
}
