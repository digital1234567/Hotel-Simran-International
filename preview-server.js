const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIR = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

const server = http.createServer((req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    let reqPath = decodeURIComponent(parsedUrl.pathname);

    // Default clean routes
    if (reqPath === '/' || reqPath === '') {
      reqPath = '/index.html';
    } else if (reqPath === '/admin' || reqPath === '/admin/') {
      reqPath = '/admin.html';
    } else if (reqPath === '/crm' || reqPath === '/crm/') {
      reqPath = '/admin.html';
    }

    let filePath = path.join(DIR, reqPath);

    // If file doesn't exist and has no extension, try appending .html
    if (!fs.existsSync(filePath) && !path.extname(filePath)) {
      if (fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      }
    }

    // Check if it's a directory
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      const indexFile = path.join(filePath, 'index.html');
      if (fs.existsSync(indexFile)) {
        filePath = indexFile;
      }
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        console.warn(`[404] Not Found: ${req.url} -> ${filePath}`);
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;">
          <h2>Page Not Found</h2>
          <p>Requested URL: <code>${req.url}</code></p>
          <p><a href="/" style="color:#1a365d;font-weight:bold;">Return to Website Homepage</a> | <a href="/admin.html" style="color:#c9983b;font-weight:bold;">Open Admin CRM Panel</a></p>
        </body></html>`);
      } else {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  } catch (error) {
    console.error(`Server error on ${req.url}:`, error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error: ' + error.message);
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Hotel Simran International live server active!`);
  console.log(`Website:   http://localhost:${PORT}/`);
  console.log(`Admin CRM: http://localhost:${PORT}/admin.html`);
  console.log(`CRM Alias: http://localhost:${PORT}/crm`);
  console.log(`====================================================`);
});
