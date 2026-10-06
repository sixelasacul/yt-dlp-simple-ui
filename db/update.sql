UPDATE jobs
SET
  status = ifnull(:status, job.status),
  progress = ifnull(:progress, job.progress),
  user_input = ifnull(:user_input, job.user_input),
  logs = ifnull(:logs, job.logs)
FROM (SELECT * FROM jobs WHERE id = :id) AS job
WHERE
  id = :id;
