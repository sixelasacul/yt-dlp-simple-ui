import { audioArgs, audioFolder } from './audio.ts';

// we'll check later for thumbnails
export const albumArgs = () => [
	...audioArgs,
	// '--write-thumbnail',
	// '-o',
	// 'thumbnail:',
	// '-o',
	// // `pl_thumbnail:${id}.%(ext)s`,
	// '--convert-thumbnails',
	// 'jpg',
	// '--print-to-file',
	// '%(album)s',
	// `${id}.txt`,
	// '--exec',
	// `playlist:mv ${audioFolder}/${id}.jpg ${audioFolder}/"$(tail -1 ${audioFolder}/${id}.txt)/cover.jpg" && rm ${audioFolder}/${id}.txt`,
];
