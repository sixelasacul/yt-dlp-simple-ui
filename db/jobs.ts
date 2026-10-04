import { DatabaseSync } from 'node:sqlite';
import create from './create.sql';
import insert from './insert.sql';
import update from './update.sql';
import selectOne from './select-one.sql';
import selectLimit from './select-limit.sql';
import { type } from 'arktype';

// could be in memory though, don't care about the jobs after a restart
const db = new DatabaseSync('jobs.db');

export const JobType = type({
	id: 'string.uuid',
	status: '"started" | "running" | "stopped" | "finished" | "failed"',
	pid: 'number',
	progress: '0 < number < 100',
	user_input: 'string',
	logs: 'string[]',
	started_at: 'number.epoch',
});
export type Job = typeof JobType.infer;

export function init() {
	db.exec(create);
}

function addJob(
	{ id, status, pid, progress, user_input, logs }: Omit<Job, 'started_at'>,
) {
	const statement = db.prepare(insert);
	statement.run({
		id,
		status,
		pid,
		progress,
		user_input,
		logs: JSON.stringify(logs),
	});
}

// makes all nullable except for id, and pid is omitted
// idky I can't use arktype map to properly make this
const UpdateJobType = type({
	id: 'string.uuid',
	status: '"started" | "running" | "stopped" | "finished" | "failed" | null',
	progress: '0 < number < 100 | null',
	user_input: 'string | null',
	logs: 'string[] | null',
});
type UpdateJob = typeof UpdateJobType.infer;
export function updateJob(
	{ id, status, progress, user_input, logs }: UpdateJob,
) {
	const statement = db.prepare(update);
	statement.run({
		'?status': status,
		'?progress': progress,
		'?user_input': user_input,
		'?logs': logs ? JSON.stringify(logs) : null,
		'?id': id,
	});
}

export function startJob(pid: number, user_input: string) {
	const id = crypto.randomUUID();
	addJob({ id, status: 'started', pid, progress: 0, user_input, logs: [] });
	return id;
}

const JobRow = type({
	id: 'string',
	status: 'string',
	pid: 'number',
	progress: 'number',
	user_input: 'string',
	logs: 'string.json.parse',
	started_at: 'number.epoch',
}).to(JobType);

// error handling to be done
export function getJob(id: string) {
	const query = db.prepare(selectOne);
	const result = query.get({ '?id': id });

	if (result) throw new Error('Job not found');

	const job = JobRow(result);
	if (job instanceof type.errors) {
		return job.throw();
	}

	return job;
}

export function getJobs(limit = 10) {
	const query = db.prepare(selectLimit);
	const result = query.all({ '?limit': limit });
	const jobs = JobRow.array()(result);
	if (jobs instanceof type.errors) {
		return jobs.throw();
	}

	return jobs;
}
