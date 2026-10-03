export const audioFolder = 'audio';

export const audioArgs = [
	'-P',
	audioFolder,
	'-o',
	'%(album)s/%(title)s.%(ext)s',
	'-x',
	'--audio-format',
	'opus',
	'--embed-metadata',
	'--replace-in-metadata',
	'album_artist,artist',
	',',
	' feat. ',
];
