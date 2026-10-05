# How is it built

## Backend

### Core

This tool is based on [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) to download audio and video files from various sources, with a high level of control/customization. It is called server-side as a CLI, with arguments that are specific to the needs of that project.

I'm using the CLI as the Python API wasn't as well documented as the CLI, and it was easier for me to work with TypeScript

### Routing

Server-side stuff is handled by [`Deno`](https://deno.com/) with TypeScript. First of all, yt-dlp needs a JS runtime to handle some extracting/downloading part, so as we need Deno for this, let's use it for the rest.

Out of the box, Deno can handle, and is used for, simple routing, serving static files and API responses, working with a SQLite database, and spawning sub-processes (specifically `yt-dlp`).

It also lints and formats the project without the need of tools from the ecosystem. For a small project like this, it's quite nice.

### Database

For simple calls to `yt-dlp` from the browser, a database isn't actually needed. However, it is useful in this case to track download progression, especially for large videos or playlists, and stream logs to the frontend. It can also be a nice feature for users to have a history of what they downloaded, and be able to stop and/or retry runs.

This project uses [`SQLite`](https://sqlite.org/index.html). It's very simple, small, can either run in memory or in a single file. Either way, it stays local. Since it consists of a single table with just a few columns, no need to weigh down the project size with an ORM.

## Frontend

### Framework

Deno supports out of the box multiple frameworks that'd make the frontend perhaps more dynamic, but also more complex. The frontend doesn't need much, apart from base HTML features, and streaming logs. For the latter, it's very easy with [HTMX](https://four.htmx.org/) to implement. It's a small library that adds HTML attributes for bringing dynamic stuff onto the browser, without having to write custom JS.

### CSS

CSS is handled by [TailwindCSS](https://tailwindcss.com/). I'm most efficient with this tool, super simple to adopt and write re-usable, utility based CSS.

## Distribution

### Deployment

Instead of having to setup manually the environment for this tool to run, [`Docker`](https://www.docker.com/) is used to create a container of that setup. That means that everyone pulling this Docker image will have the same setup, and will receive updates via the Docker image, whether it's from the tool itself, or from a new version of `yt-dlp`.

With tools like [Coolify](https://coolify.io/) running on your own server, it's super easy to setup, especially with a [Navidrome](https://www.navidrome.org/) application to stream downloaded files. This is how I'm using the project personally.

### CI

Since this codebase is currently hosted on GitHub, it uses GitHub Actions to build the Docker image, and publish it on GitHub registry.
