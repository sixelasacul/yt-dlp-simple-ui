import { serveFile } from '@std/http';
import { checkRoute, Route } from './utils.ts';

export const home: Route = {
	checker: checkRoute('GET', new URLPattern({ pathname: '/' })),
	handler: (req) => serveFile(req, 'index.html'),
};
