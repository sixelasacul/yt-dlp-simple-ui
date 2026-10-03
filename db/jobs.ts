import { DatabaseSync } from 'node:sqlite';
import create from './create.sql';

const db = new DatabaseSync('jobs.db', { open: false });

export function init() {
	db.open();
	db.exec(create);
	db.close();
}
