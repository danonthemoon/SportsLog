import os
import sys
import json
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8080
STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static')

class SportsLogHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def do_GET(self):
        if self.path == '/api/data':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            data_file = os.path.join(STATIC_DIR, 'data.json')
            if os.path.exists(data_file):
                with open(data_file, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.wfile.write(b'{"error": "data not found"}')
            return
        elif self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "ok"}')
            return
        
        # Default routing: if path doesn't have an extension, serve index.html
        if not '.' in self.path:
            self.path = '/index.html'

        return super().do_GET()

def find_available_port(start_port=8080):
    port = start_port
    while port < start_port + 50:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) != 0:
                return port
        port += 1
    return start_port

def run():
    port = find_available_port(8080)
    server_address = ('127.0.0.1', port)
    httpd = HTTPServer(server_address, SportsLogHandler)
    print(f"SportsLog Web App running at http://localhost:{port}")
    sys.stdout.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == '__main__':
    run()
