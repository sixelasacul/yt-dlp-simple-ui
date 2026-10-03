import os
import threading
from uuid import uuid4

from flask import Flask, render_template, request
from yt_dlp import YoutubeDL, _Params

app = Flask(__name__)

VIDEO_DIR = "videos"
AUDIO_DIR = "audio"
os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)


@app.route("/")
def index():
    return render_template("index.html")


@app.get("/log")
def get_log():
    """Endpoint for HTMX to poll the latest log message."""


@app.post("/download")
def download():
    # get form data
    # should check if it get decoded
    search = request.form.get("search")
    url = request.form.get("url")
    type = request.form.get("type")

    # prepare log file
    id = uuid4()
    with open(f"{id}.txt", "x") as f:
        f.close()

    opts: _Params = {}

    if type == "video":
        opts["paths"] = {"home": "videos"}

    if type == "audio":
        opts = {
            "outtmpl": {"default": "%(album)s/%(title)s.%(ext)s"},
            "postprocessors": [],
        }

    with YoutubeDL(opts) as ydl:
        ydl.download([url])


@app.route("/run", methods=["POST"])
def run_command():
    """Endpoint for HTMX to trigger the background download."""
    global latest_log, is_running
    url = request.form.get("url")
    mode = request.form.get("mode")

    if is_running:
        return "<b style='color:red;'>Error: A download is already in progress!</b>"
    if not url:
        return "<b style='color:red;'>Error: No URL provided!</b>"

    # Base Command
    cmd = ["yt-dlp", url]

    id = uuid4()

    if mode == "video":
        cmd.extend(["-P", VIDEO_DIR])

    elif mode == "audio" or mode == "playlist":
        cmd.extend(
            [
                "-P",
                AUDIO_DIR,  # Directory
                "-o",
                "%(album)s/%(title)s.%(ext)s",  # Clean filename
                "-x",  # Extract audio
                "--audio-format",
                "opus",  # High quality/efficiency format
                "--embed-metadata",  # Add metadata to file
                "--replace-in-metadata",  # write featurings in a way that Navidrome can correctly read
                "album_artist,artist",
                ",",
                " feat. ",
            ]
        )
        if mode == "audio":
            cmd.extend(
                [
                    "--write-thumbnail",
                    "-o",
                    "thumbnail:%(album)s/cover.%(ext)s",
                ]
            )
        if mode == "playlist":
            # yt-dlp is missing hooks on after a playlist info is extracted and before the first video is downloaded
            # so that we can work with its fields and metadata to move the thumbnail as expected
            # instead, we have to grab the album name to know the folder name, and move the cover with its uuid to the folder
            # (using uuid in case multiple playlist are being downloaded at the same time)
            cmd.extend(
                [
                    "--write-thumbnail",
                    "-o",
                    "thumbnail:",  # make sure that each track doesn't write its own thumbnail
                    "-o",
                    f"pl_thumbnail:{id}.%(ext)s",
                    "--convert-thumbnails",
                    "jpg",
                    "--print-to-file",
                    "%(album)s",
                    f"{id}.txt",
                    "--exec",
                    f'playlist:mv {AUDIO_DIR}/{id}.jpg {AUDIO_DIR}/"$(tail -1 {AUDIO_DIR}/{id}.txt)/cover.jpg" && rm {AUDIO_DIR}/{id}.txt',
                ]
            )

    print(f"[cmd] {cmd}")
    # Start the background thread
    thread = threading.Thread(target=run_yt_dlp_task, args=(cmd,))
    thread.start()

    return "<b style='color:green;'>Download started in background...</b>"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
