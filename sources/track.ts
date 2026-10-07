import { audioArgs } from './audio.ts';

export const trackArgs = () => [
	...audioArgs,
	'--write-thumbnail',
	'-o',
	'thumbnail:%(album)s/cover.%(ext)s',
];
