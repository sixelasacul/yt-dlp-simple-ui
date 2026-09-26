# Use a lightweight Python base image
FROM python:3.11-slim

# Install ffmpeg (required for yt-dlp to merge video/audio and process audio)
# We also install curl and ca-certificates for network stability
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg curl ca-certificates unzip && \
    rm -rf /var/lib/apt/lists/*

# Install Deno (to satisfy yt-dlp JS requirements)
RUN curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh -s -- -y

# Set the working directory inside the container
WORKDIR /app

# Install Python dependencies
# We copy requirements first to leverage Docker caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
COPY . .

# Create the download directories inside the container
RUN mkdir -p /app/downloads/videos /app/downloads/audio

# Expose the port Flask runs on
EXPOSE 5000

# Set the command to run the app
CMD ["python", "app.py"]
