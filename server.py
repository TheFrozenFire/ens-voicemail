#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
from urllib.parse import parse_qs, urlparse
from datetime import datetime

class LoggingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/log':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                log_data = json.loads(post_data.decode('utf-8'))
                self.handle_log_message(log_data)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'logged'}).encode())
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def handle_log_message(self, log_data):
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"[{timestamp}] {log_data.get('level', 'INFO')}: {log_data.get('message', '')}\n"
        
        # Write to console
        print(log_entry.strip())
        
        # Write to file
        with open('debug.log', 'a') as f:
            f.write(log_entry)

if __name__ == "__main__":
    PORT = 8001
    
    with socketserver.TCPServer(("", PORT), LoggingHTTPRequestHandler) as httpd:
        print(f"Logging server running on port {PORT}")
        print(f"Debug logs will be written to debug.log")
        httpd.serve_forever() 