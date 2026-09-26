from flask import Flask, render_template, request
import subprocess
import os

app = Flask(__name__)

# Pre-define the download directories
VIDEO_DIR = "downloads/videos"
AUDIO_DIR = "downloads/audio"

# Ensure directories exist on startup
os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/run', methods=['POST'])
def run_command():
    url = request.form.get('url')
    mode = request.form.get('mode')

    if not url:
        return "Error: No URL provided", 400

    # Base command
    cmd = ["yt-dlp", url]

    # Logic for different modes
    if mode == "video":
        cmd.extend(["-P", VIDEO_DIR])
        
    elif mode == "audio":
        cmd.extend([
            "-P", AUDIO_DIR,
            "--xattrs",
            "--add-metadata",
            "-o", "%(album)s/%(artist)s - %(title)s.%(ext)s"
        ])
        
    elif mode == "playlist":
        cmd.extend([
            "-P", AUDIO_DIR,
            "--xattrs",
            "--add-metadata",
            "-o", "%(album)s/%(artist)s - %(title)s.%(ext)s",
            "--lazy-playlist"
        ])

    try:
        # We use subprocess.run to execute the command
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            return f"Success! Files saved to the appropriate folder. Output: {result.stdout[:200]}..."
        else:
            return f"Error: {result.stderr}", 400
            
    except Exception as e:
        return f"System Error: {str(e)}", 500

if __name__ == '__main__':
    # host='0.0.0.0' makes it accessible on your local network
    app.run(host='0.0.0.0', port=5000)
