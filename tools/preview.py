#!/usr/bin/env python3
"""Serve src/index.html wrapped in the same skeleton the Artifact publisher adds, for a local look.
Usage: python3 tools/preview.py [port]   (default 8765). Output lands in .preview/ (ignored by git)."""
import http.server, pathlib, sys, functools
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "src" / "index.html").read_text(encoding="utf-8")
out = root / ".preview"; out.mkdir(exist_ok=True)
skeleton_head = ('<!doctype html><html><head><meta charset="utf-8">'
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  '<style>:root{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style>'
  '</head><body>')
(out / "index.html").write_text(skeleton_head + src + "</body></html>", encoding="utf-8")
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(out))
print(f"preview on http://localhost:{port}/ (serving {out})", flush=True)
http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
