# yt-dlp-simple-ui

Bare bone, simple UI for yt-dlp to be self host on your homelab.

## AI Disclaimer

First versions of this project was entirely written with local AI (Flask). Since I moved to Deno, it's now entirely written by hand.

## Architecture

To know more about how this project is built, have a look at the [`ARCHITECTURE.md`]("ARCHITECTURE.md") file.

## Development

```sh
podman compose --file ./docker-compose.dev.yml up --build
```

## Notes

- Proper log streaming
- Button to reset fields
- abort button (kill yt-dlp pid) + retry
