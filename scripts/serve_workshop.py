#!/usr/bin/env python3
from __future__ import annotations

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from extract_real_sas_profiles import ROOT, build_and_write, file_fingerprint

STATE = {'fingerprint': None}


def ensure_current() -> None:
    current = file_fingerprint()
    if current != STATE['fingerprint']:
        profiles = build_and_write()
        STATE['fingerprint'] = file_fingerprint()
        print(f'[workshop] rebuilt profile set: {len(profiles)} app(s)')


class AutoBuildHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        ensure_current()
        super().do_GET()

    def do_HEAD(self):
        ensure_current()
        super().do_HEAD()


def main() -> None:
    parser = argparse.ArgumentParser(description='Serve the workshop and auto-rebuild when real SAS docs change.')
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()

    ensure_current()
    handler = partial(AutoBuildHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    url = f'http://127.0.0.1:{args.port}/index.html'
    print(f'[workshop] serving {ROOT}')
    print(f'[workshop] open {url}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n[workshop] stopped')


if __name__ == '__main__':
    main()
