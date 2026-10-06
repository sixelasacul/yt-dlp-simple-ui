import { home } from './routes/home.ts';
import { save } from './routes/save.ts';
import { trackJob } from './routes/track-job.ts';

export default {
	fetch(req) {
		if (home.checker(req)) return home.handler(req);
		if (save.checker(req)) return save.handler(req);
		if (trackJob.checker(req)) return trackJob.handler(req);

		return new Response('Not found', { status: 404 });
	},
} satisfies Deno.ServeDefaultExport;
