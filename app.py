from flask import Flask, render_template, request
import subprocess
import os
import threading

app = Flask(__name__)

# Configuration
VIDEO_DIR = "downloads/videos"
AUDIO_DIR = "downloads/audio"

# Ensure directories exist
os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

# Global state for HTMX polling
latest_log = "Ready to download..."
is_running = False

def run_yt_dlp_task(cmd):
    """Runs the yt-dlp process in a separate thread to avoid blocking the UI."""
    global latest_log, is_running
    is_running = True
    try:
        # stdout=subprocess.PIPE and stderr=subprocess.STDOUT allows us to 
        # capture both progress and errors in a single stream.
        process = subprocess.Popen(
            cmd, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.STDOUT, 
            text=True
        )

        for line in process.stdout:
            clean_line = line.strip()
            if clean_line:
                latest_log = clean_line
                # This prints to your server/docker logs
                print(f"[yt-dlp] {clean_line}")

        process.wait()
        is_running = False
        latest_log = "Task completed successfully!" if process.returncode == 0 else "Task failed!"
    except Exception as e:
        latest_log = f"System Error: {str(e)}"
        is_running = False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/log')
def get_log():
    """Endpoint for HTMX to poll the latest log message."""
    return latest_log

@app.route('/run', methods=['POST'])
def run_command():
    """Endpoint for HTMX to trigger the background download."""
    global latest_log, is_running
    url = request.form.get('url')
    mode = request.form.get('mode')

    if is_running:
        return "<b style='color:red;'>Error: A download is already in progress!</b>"
    if not url:
        return "<b style='color:red;'>Error: No URL provided!</b>"

    # Base Command
    cmd = ["yt-dlp", url]

    if mode == "video":
        cmd.extend(["-P", VIDEO_DIR])
        
    elif mode == "audio" or mode == "playlist":
        # The 'Navidrome Optimized' Configuration
        cmd.extend([
            "-x",                          # Extract audio
            "--audio-format", "opus",      # High quality/efficiency format
            "-P", AUDIO_DIR,               # Directory
            "--embed-thumbnail",           # Embed art in file
            "--write-thumbnail",           # Save cover.jpg in folder (Navidrome backup)
            "--xattrs",                     # Write filesystem attributes
            "--add-metadata",               # Add metadata to file
            "--replace-in-metadata", "artist", "^([^,]+).*", # Keep only the FIRST artist
            "-o", "%(album)s/%(title)s.%(ext)s"            # Clean filename
        ])
        if mode == "playlist":
            cmd.append("--lazy-playlist")

    # Start the background thread
    thread = threading.Thread(target=run_yt_dlp_task, args=(cmd,))
    thread.start()

    return "<b style='color:green;'>Download started in background...</b>"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
