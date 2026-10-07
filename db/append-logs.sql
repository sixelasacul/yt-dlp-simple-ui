UPDATE jobs
SET
  logs = concat(job.logs, '\n', :logs)
FROM (SELECT logs FROM jobs WHERE id = :id) AS job
WHERE
  id = :id;
