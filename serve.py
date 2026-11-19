"""Servidor local com suporte a HTTP Range.

O vídeo do passeio é controlado pela rolagem, e o navegador só consegue
pular para qualquer quadro se o servidor responder a pedidos Range.
O `python -m http.server` não faz isso, então use este arquivo:

    python serve.py            # http://localhost:5173
    python serve.py 8080       # outra porta
"""
import os
import re
import sys
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))


class RangeHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        self._remaining = None
        rng = self.headers.get("Range")
        path = self.translate_path(self.path)
        if not rng or os.path.isdir(path) or not os.path.exists(path):
            return super().send_head()
        m = re.match(r"bytes=(\d*)-(\d*)", rng)
        size = os.path.getsize(path)
        start = int(m.group(1)) if m and m.group(1) else 0
        end = int(m.group(2)) if m and m.group(2) else size - 1
        end = min(end, size - 1)
        if start > end:
            self.send_error(416, "Range Not Satisfiable")
            return None
        f = open(path, "rb")
        f.seek(start)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        self._remaining = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        remaining = getattr(self, "_remaining", None)
        try:
            if remaining is None:
                return super().copyfile(source, outputfile)
            while remaining > 0:
                chunk = source.read(min(65536, remaining))
                if not chunk:
                    break
                outputfile.write(chunk)
                remaining -= len(chunk)
        except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
            pass

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    nums = [a for a in sys.argv[1:] if a.isdigit()]
    port = int(nums[0]) if nums else 5173
    url = f"http://localhost:{port}"
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(RangeHandler, directory=ROOT))
    print(f"BMW M3 Competition rodando em {url}  (Ctrl+C para parar)")
    if "--no-open" not in sys.argv:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
