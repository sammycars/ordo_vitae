#!/usr/bin/env python3
"""
Ordo_Vitae HTTP Server with Diagnostics Logging

A simple HTTP server that:
1. Serves static files from the current directory
2. Logs every request to /tmp/ordovitae-requests.log
3. Exposes /api/diagnostics.json — app health state
4. Exposes /api/state.json — current app state from JS window object (posted by app)
"""

import http.server
import socketserver
import json
import os
import threading
from datetime import datetime, timezone
from urllib.parse import urlparse

PORT = 45682
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = "/tmp/ordovitae-requests.log"
DIAGNOSTICS_FILE = "/tmp/ordovitae-diagnostics.json"
STATE_FILE = "/tmp/ordovitae-state.json"

# Thread-safe state
state_lock = threading.Lock()
app_state = {
    "last_request": None,
    "last_view": None,
    "last_db_op": None,
    "errors": [],
    "requests": []
}
diagnostics = {
    "status": "ok",
    "server": "ordo_vitae",
    "uptime": None,
    "started": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
}

class LoggingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_request(self, code=200, size=None):
        # Custom logging
        ts = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        path = self.path
        method = self.command
        client = self.client_address[0]
        
        log_entry = {
            "ts": ts,
            "method": method,
            "path": path,
            "code": code,
            "client": client
        }
        
        with state_lock:
            app_state["last_request"] = log_entry
            app_state["requests"].append(log_entry)
            if len(app_state["requests"]) > 100:
                app_state["requests"] = app_state["requests"][-100:]
        
        # Write to log file
        try:
            with open(LOG_FILE, "a") as f:
                f.write(json.dumps(log_entry) + "\n")
        except Exception:
            pass
        
        super().log_request(code, size)
    
    def do_GET(self):
        parsed = urlparse(self.path)
        
        if parsed.path == "/api/diagnostics.json":
            self.send_json_response(diagnostics)
        elif parsed.path == "/api/state.json":
            with state_lock:
                self.send_json_response(app_state)
        else:
            super().do_GET()
    
    def do_POST(self):
        parsed = urlparse(self.path)
        
        if parsed.path == "/api/state":
            # JS app posts its state here
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
                with state_lock:
                    if "view" in data:
                        app_state["last_view"] = data["view"]
                    if "db_op" in data:
                        app_state["last_db_op"] = data["db_op"]
                    if "error" in data:
                        app_state["errors"].append(data["error"])
                        if len(app_state["errors"]) > 20:
                            app_state["errors"] = app_state["errors"][-20:]
                self.send_json_response({"status": "ok"})
            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON")
        else:
            self.send_error(404)
    
    def send_json_response(self, data):
        response = json.dumps(data, indent=2)
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(response))
        self.end_headers()
        self.wfile.write(response.encode("utf-8"))
    
    def log_message(self, format, *args):
        # Suppress default logging to stderr
        pass


if __name__ == "__main__":
    # Initialize log file
    with open(LOG_FILE, "a") as f:
        f.write(f"# Ordo_Vitae server started at {datetime.now(timezone.utc).isoformat()}Z\n")
    
    print(f"Starting Ordo_Vitae server on port {PORT}")
    print(f"Serving from: {DIRECTORY}")
    print(f"Request log: {LOG_FILE}")
    print(f"Diagnostics: {DIAGNOSTICS_FILE}")
    print(f"Endpoints:")
    print(f"  GET  /api/diagnostics.json  — server diagnostics")
    print(f"  GET  /api/state.json        — app state history")
    print(f"  POST /api/state             — app posts state here")
    
    with socketserver.TCPServer(("", PORT), LoggingHTTPRequestHandler) as httpd:
        httpd.serve_forever()
