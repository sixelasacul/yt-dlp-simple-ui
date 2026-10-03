# yt-dlp-simple-ui

Bare bone, simple UI for yt-dlp to be self host on your homelab.

## AI Disclaimer

First versions of this project was entirely written with local AI (Flask). Since I moved to Deno, it's now entirely written by hand.

## Notes

- Proper log streaming
- Use config files when possible
- ~~Use yt-dlp python API for better control and progress?~~
  - It would be better, but it's quite a lot of work just to see a progress bar. Let's just stream logs for now or something like that, we can handle the rest later. Do then improve
- Look into Youtube Music Search extractor
  - YES: https://github.com/yt-dlp/yt-dlp/blob/51bab8a0116f4d8004c315706d809782607d5847/yt_dlp/extractor/youtube/_search.py#L102
  - With a template URL for youtube music search, user could just pass artist + track/album and it will download it from youtube music, bypassing the issue of plain youtube playlist
- Look into Youtube to Music playlist
- Button to reset fields
