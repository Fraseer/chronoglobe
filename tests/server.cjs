// Minimal static file server for local use and the end-to-end tests.
// Run directly: node tests/server.cjs [port]   (defaults to 8080)
const http = require("http");
const fs = require("fs");
const path = require("path");

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };

function startServer(root, port = 0) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    let file = path.normalize(path.join(root, decodeURIComponent(url.pathname)));
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    if (file.endsWith(path.sep)) file = path.join(file, "index.html");
    fs.readFile(file, (err, body) => {
      if (err) { res.writeHead(404).end("Not found"); return; }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" }).end(body);
    });
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

module.exports = { startServer };

if (require.main === module) {
  const port = Number(process.argv[2]) || 8080;
  startServer(path.resolve(__dirname, ".."), port).then(() => console.log(`Chronoglobe at http://localhost:${port}/`));
}
