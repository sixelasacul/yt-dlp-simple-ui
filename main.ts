import { homeRoute } from './routes/home.ts';
import { saveRoute } from './routes/save.ts';

export default {
	fetch(req) {
		homeRoute(req);
		saveRoute(req);

		return new Response('Not found', { status: 404 });
	},
} satisfies Deno.ServeDefaultExport;
