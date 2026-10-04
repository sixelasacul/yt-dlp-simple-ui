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
- abort button (kill yt-dlp pid) + retry
- 2 steps download
  - first, --write-info-json --no-download, saved in db
    - though this will save a json file for each video in a playlist, + the playlist itself, so it depends. either we're fine with this since we just need some metadata from the playlist (album name, cover) and that's it, or we keep everything and will need to spawn multiple yt-dlp for each info json
    - why do we need the 2 steps? currently we can't put the album cover directly in the album folder because of missing album info at the playlist level, so we have to store logical links via uuid and files containing album names, so that we can move it afterwards. If we download as usual, but add the --write-info-json, this metadata is then available without having to write new files. I mean, all we need is the album name, and an id to identify the cover name. Or, download everything except thumbnail, and do the thumbnail afterward.
  - second, --load-info-json
  - OR, let's no download the cover for now and let navidrome do it.
