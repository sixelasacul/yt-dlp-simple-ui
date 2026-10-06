import { type } from 'arktype';
import { checkRoute, Route } from './utils.ts';
import { trackArgs } from '../sources/track.ts';
import { videoArgs } from '../sources/video.ts';
import { albumArgs } from '../sources/album.ts';
import { Source, SourceType } from '../sources/types.ts';
import { prepareSearch } from '../sources/search.ts';
import * as db from '../db/jobs.ts';

const SaveParams = type({
	source: SourceType,
	url: 'string.url',
	search: 'never',
}).or({
	source: SourceType,
	url: 'never',
	search: 'string',
});
const SaveFormData = type('FormData.parse').to(SaveParams);

const TYPE_ARGS: Record<Source, (id: string) => string[]> = {
	'track': trackArgs,
	'video': videoArgs,
	'album': albumArgs,
};

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
		stdin: 'null',
		stdout: 'piped',
		stderr: 'piped',
		args: [ytDlpInput, ...TYPE_ARGS[source](uuid)],
	});
	const child = command.spawn();
	const id = db.startJob(child.pid, ytDlpInput);

	const decoder = new TextDecoder();
	child.stdout.pipeTo(
		new WritableStream({
			write(chunk) {
				// chunks already contains '\n'
				// in theory we could split and json stringify to db, but hey, we already
				// have a delimited so no need to make this more complex for now

				// There should be a regex or something like that to distinguish
				// logs and progress
				db.appendLogs(id, decoder.decode(chunk));
			},
		}),
	);
	child.stderr.pipeTo(
		new WritableStream({
			write(chunk) {
				db.appendLogs(id, decoder.decode(chunk));
			},
		}),
	);

	return new Response(JSON.stringify({ id }), { status: 200 });
}

export const save: Route = {
	checker: checkRoute('POST', new URLPattern({ pathname: '/save' })),
	handler: saveHandler,
};
