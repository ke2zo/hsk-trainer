#!/usr/bin/env python3
"""Локальный сервер HSK-тренажёра: раздаёт статику и хранит результаты в data/."""
import json
import os
import re
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, "data")
RESULTS = os.path.join(DATA, "results")
SAFE = re.compile(r"^[A-Za-z0-9_-]{1,80}$")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, fmt, *args):
        if "/api/" in (self.path or ""):
            super().log_message(fmt, *args)

    # ---------- JSON helpers ----------
    def _json(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        return json.loads(self.rfile.read(n) or b"null")

    # ---------- API ----------
    def do_GET(self):
        if self.path == "/api/results":
            out = []
            for f in sorted(os.listdir(RESULTS)):
                if f.endswith(".json"):
                    with open(os.path.join(RESULTS, f), encoding="utf-8") as fh:
                        out.append(json.load(fh))
            return self._json(out)
        m = re.match(r"^/api/store/([^/?]+)$", self.path)
        if m:
            name = m.group(1)
            if not SAFE.match(name):
                return self._json({"error": "bad name"}, 400)
            p = os.path.join(DATA, name + ".json")
            if not os.path.exists(p):
                return self._json(None)
            with open(p, encoding="utf-8") as fh:
                return self._json(json.load(fh))
        return self._static()

    def do_POST(self):
        if self.path == "/api/results":
            r = self._body()
            if not isinstance(r, dict) or not SAFE.match(str(r.get("id", ""))):
                return self._json({"error": "bad result"}, 400)
            _write(os.path.join(RESULTS, r["id"] + ".json"), r)
            return self._json({"ok": True})
        return self._json({"error": "not found"}, 404)

    def do_PUT(self):
        m = re.match(r"^/api/store/([^/?]+)$", self.path)
        if m and SAFE.match(m.group(1)):
            _write(os.path.join(DATA, m.group(1) + ".json"), self._body())
            return self._json({"ok": True})
        return self._json({"error": "not found"}, 404)

    def do_DELETE(self):
        m = re.match(r"^/api/results/([^/?]+)$", self.path)
        if m and SAFE.match(m.group(1)):
            p = os.path.join(RESULTS, m.group(1) + ".json")
            if os.path.exists(p):
                os.remove(p)
            return self._json({"ok": True})
        return self._json({"error": "not found"}, 404)

    # ---------- static with Range (нужно для перемотки mp3) ----------
    def _static(self):
        path = self.translate_path(self.path)
        rng = self.headers.get("Range")
        if not rng or not os.path.isfile(path):
            return super().do_GET()
        m = re.match(r"bytes=(\d*)-(\d*)", rng)
        size = os.path.getsize(path)
        start = int(m.group(1)) if m and m.group(1) else 0
        end = int(m.group(2)) if m and m.group(2) else size - 1
        end = min(end, size - 1)
        if start > end:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            self.end_headers()
            return
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        with open(path, "rb") as f:
            f.seek(start)
            left = end - start + 1
            try:
                while left > 0:
                    chunk = f.read(min(1 << 16, left))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    left -= len(chunk)
            except (BrokenPipeError, ConnectionResetError):
                pass

    def end_headers(self):
        if not self.path.startswith("/api/"):
            self.send_header("Accept-Ranges", "bytes")
            if self.path.endswith((".js", ".css", ".html", ".json")) or self.path == "/":
                self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def _write(path, obj):
    # своё имя tmp на каждый поток: параллельные PUT не мешают друг другу
    tmp = f"{path}.{threading.get_ident()}.tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, indent=1)
    os.replace(tmp, path)


if __name__ == "__main__":
    os.makedirs(RESULTS, exist_ok=True)
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    try:
        httpd = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    except OSError:
        print(f"Порт {port} занят — скорее всего, тренажёр уже запущен: http://localhost:{port}")
        print(f"Другой порт: python3 server.py {port + 1}")
        sys.exit(1)
    print(f"HSK тренажёр: http://localhost:{port}  (остановить: Ctrl+C)")
    httpd.serve_forever()
