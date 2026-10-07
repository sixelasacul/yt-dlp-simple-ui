import { type } from 'arktype';
import { checkRoute, type Route } from './utils.ts';
import * as db from '../db/jobs.ts';

const TrackJobPath = type({
	id: 'string.uuid',
});

const trackJobPattern = new URLPattern({ pathname: '/job/:id' });
function trackJobHandler(req: Request) {
	const patternResult = trackJobPattern.exec(req.url);
	if (patternResult === null) {
		return new Response('Expected job id not found', { status: 400 });
	}
	const pathGroups = TrackJobPath(patternResult.pathname.groups);
	if (pathGroups instanceof type.errors) {
		return new Response(JSON.stringify(pathGroups), { status: 400 });
	}

	const { id } = pathGroups;

	// should properly handle not found jobs
	const job = db.getJob(id);

	return new Response(JSON.stringify(job), { status: 200 });
}

export const trackJob: Route = {
	checker: checkRoute('GET', new URLPattern({ pathname: '/job/:id' })),
	handler: trackJobHandler,
};
