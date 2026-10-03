import { serveFile } from '@std/http';
import { type } from 'arktype';
import { prepareRoute } from './utils.ts';
import { trackArgs } from '../sources/track.ts';
import { videoArgs } from '../sources/video.ts';
import { albumArgs } from '../sources/album.ts';
import { Source, SourceType } from '../sources/types.ts';
import { prepareSearch } from '../sources/search.ts';

const SaveFormData = type('FormData.parse').to({
	source: SourceType,
	url: 'string.url',
	search: 'never',
}).or({
	source: SourceType,
	url: 'never',
	search: 'string',
});

const TYPE_ARGS: Record<Source, (id: string) => string[]> = {
	'track': trackArgs,
	'video': videoArgs,
	'album': albumArgs,
};

const savePattern = new URLPattern({ pathname: '/' });
async function saveHandler(req: Request) {
	const formData = SaveFormData(await req.formData());
	if (formData instanceof type.errors) {
		return new Response(JSON.stringify(formData), { status: 400 });
	}

	const { url, search, source } = formData;
	const uuid = crypto.randomUUID();

	const ytDlpInput = source !== 'video' && search
		? prepareSearch(search, source)
		: url;

	const command = new Deno.Command('yt-dlp', {
		stdin: 'piped',
		stdout: 'piped',
		args: [ytDlpInput, ...TYPE_ARGS[source](uuid)],
		signal: undefined,
	});
	const child = command.spawn();
	// stores logs to be inspected client side during download
	// should mostly be progress info, or could be two different files
	// well then what about using a simple sqlite file?
	child.stdout.pipeTo(
		Deno.openSync(`${uuid}.logs.txt`, { write: true, create: true }).writable,
	);
	child.stdin.close();
	child.pid;

	const pidFile = Deno.openSync(`${uuid}.pid.txt`, {
		write: true,
		create: true,
	});
	pidFile.writeSync(new TextEncoder().encode(child.pid.toString()));

	return new Response();
}

export const saveRoute = prepareRoute('POST', savePattern, saveHandler);
