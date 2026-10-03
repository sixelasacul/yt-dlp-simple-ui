import { Source } from './types.ts';

type MusicSources = Exclude<Source, 'video'>;

const YT_MUSIC_SOURCES: Record<MusicSources, string> = {
	'album': 'EgWKAQIYAWoKEAoQAxAEEAkQBQ==',
	'track': 'EgWKAQIIAWoKEAoQAxAEEAkQBQ==',
};

// Based on https://github.com/yt-dlp/yt-dlp/blob/51bab8a0116f4d8004c315706d809782607d5847/yt_dlp/extractor/youtube/_search.py#L131
export function prepareSearch(input: string, source: MusicSources) {
	const url = new URL('https://music.youtube.com/search');
	// should take care of encoding
	url.searchParams.append('q', input);
	url.searchParams.append('sp', YT_MUSIC_SOURCES[source]);
	return url.toString();
}
