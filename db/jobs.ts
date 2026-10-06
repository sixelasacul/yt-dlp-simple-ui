import { DatabaseSync } from 'node:sqlite';
import _appendLogs from './append-logs.sql' with { type: 'text' };
import _create from './create.sql' with { type: 'text' };
import _insert from './insert.sql' with { type: 'text' };
import _update from './update.sql' with { type: 'text' };
import _selectOne from './select-one.sql' with { type: 'text' };
import _selectLimit from './select-limit.sql' with { type: 'text' };
import { type } from 'arktype';

// could be in memory though, don't care about the jobs after a restart
const db = new DatabaseSync('jobs.db');

export const JobType = type({
	id: 'string.uuid',
	status: '"started" | "running" | "stopped" | "finished" | "failed"',
	pid: 'number',
	progress: '0 < number < 100',
	user_input: 'string',
	logs: 'string',
	started_at: 'number.epoch',
});
export type Job = typeof JobType.infer;

export function init() {
	db.exec(_create);
}

function addJob(
	{ id, status, pid, progress, user_input, logs }: Omit<Job, 'started_at'>,
) {
	const statement = db.prepare(_insert);
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
	logs: 'string | null',
});
type UpdateJob = typeof UpdateJobType.infer;
export function updateJob(
	{ id, status, progress, user_input, logs }: UpdateJob,
) {
	const statement = db.prepare(_update);
	statement.run({
		'?status': status,
		'?progress': progress,
		'?user_input': user_input,
		'?logs': logs,
		'?id': id,
	});
}
export function appendLogs(
	id: string,
	logs: string,
) {
	const statement = db.prepare(_appendLogs);
	statement.run({
		'?logs': logs,
		'?id': id,
	});
}

export function startJob(pid: number, user_input: string) {
	const id = crypto.randomUUID();
	addJob({ id, status: 'started', pid, progress: 0, user_input, logs: '' });
	return id;
}

const JobRow = type({
	id: 'string',
	status: 'string',
	pid: 'number',
	progress: 'number',
	user_input: 'string',
	logs: 'string',
	started_at: 'number.epoch',
}).to(JobType);

// error handling to be done
export function getJob(id: string) {
	const query = db.prepare(_selectOne);
	const result = query.get({ '?id': id });

	if (result) throw new Error('Job not found');

	const job = JobRow(result);
	if (job instanceof type.errors) {
		return job.throw();
	}

	return job;
}

export function getJobs(limit = 10) {
	const query = db.prepare(_selectLimit);
	const result = query.all({ '?limit': limit });
	const jobs = JobRow.array()(result);
	if (jobs instanceof type.errors) {
		return jobs.throw();
	}

	return jobs;
}
