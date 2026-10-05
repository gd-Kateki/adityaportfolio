// GitHub's configure-pages action supplies the repository path or an empty root.
const segments = (process.env.SITE_BASE_PATH || '/').split('/').filter(Boolean);
if (segments.some(segment => !/^[\w.-]+$/.test(segment) || segment === '.' || segment === '..')) {
  throw new Error('SITE_BASE_PATH must be a URL path such as /uiux_website/');
}
export const siteBasePath = segments.length ? `/${segments.join('/')}/` : '/';
