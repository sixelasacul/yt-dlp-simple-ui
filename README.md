# yt-dlp-simple-ui

Bare bone, simple UI for yt-dlp to be self host on your homelab.

## AI Disclaimer

First versions of this project was entirely written with local AI (Flask). Since I moved to Deno, it's now entirely written by hand.

## Notes

- Proper log streaming
- Button to reset fields
- Use sqlite to track downloads and clear them (or not if we want tracking history)
  - https://docs.deno.com/examples/sqlite/
- have progress and logs different thing
- abort button (kill yt-dlp pid)
