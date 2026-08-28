const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

http.createServer((req, res) => {
  const rawPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const relativePath = rawPath === "/" ? "index.html" : rawPath.replace(/^\/+/, "");
  let filePath = path.join(root, relativePath);

  if (!filePath.startsWith(root)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError) {
      send(res, 404, "Not found");
      return;
    }

    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (readError, data) => {
      if (readError) {
        send(res, 500, "Read error");
        return;
      }

      const extension = path.extname(filePath).toLowerCase();
      send(res, 200, data, {
        "Cache-Control": "no-cache",
        "Content-Type": mimeTypes[extension] || "application/octet-stream"
      });
    });
  });
}).listen(port, host, () => {
  const publicHost = host === "0.0.0.0" ? "localhost" : host;
  console.log(`Squat Bird Campus Web en http://${publicHost}:${port}`);
});
