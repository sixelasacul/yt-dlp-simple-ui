import { serveFile } from '@std/http';
import { prepareRoute } from './utils.ts';

const homePattern = new URLPattern({ pathname: '/' });
function homeHandler(req: Request) {
	return serveFile(req, 'index.html');
}

export const homeRoute = prepareRoute('GET', homePattern, homeHandler);
