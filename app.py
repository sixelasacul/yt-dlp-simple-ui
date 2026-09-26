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
            "-x",
            "--audio-format", "opus",    # Request opus output
            "--xattrs",
            "--add-metadata",
            "-o", "%(album)s/%(artist)s - %(title)s.%(ext)s"
        ])
        
    elif mode == "playlist":
        cmd.extend([
            "-P", AUDIO_DIR,
            "-x",
            "--audio-format", "opus",    # Request opus output
            "--xattrs",
            "--add-metadata",
            "-o", "%(album)s/%(artist)s - %(title)s.%(ext)s",
            "--lazy-playlist"
        ])

    try:
        # We use Popen instead of run() to allow real-time streaming of the output.
        # stderr=subprocess.STDOUT redirects error messages into the main stream 
        # so we can catch both progress and errors in one loop.
        process = subprocess.Popen(
            cmd, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.STDOUT, 
            text=True
        )

        # This loop reads the output line-by-line as yt-dlp produces it.
        # Each line is printed to the server's standard output (the logs).
        for line in process.stdout:
            clean_line = line.strip()
            if clean_line:
                # This prefix helps you identify yt-dlp output in your log files
                print(f"[yt-dlp] {clean_line}")

        # Wait for the process to actually finish
        return_code = process.wait()

        if return_code == 0:
            return f"Success! Download completed. Check your server logs for details.", 200
        else:
            return f"Error: yt-dlp failed with exit code {return_code}", 400
            
    except Exception as e:
        return f"System Error: {str(e)}", 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
