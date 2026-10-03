export function prepareRoute(
	method: string,
	pattern: URLPattern,
	handler: (req: Request) => Response | Promise<Response>,
) {
	return function (req: Request) {
		if (pattern.test(req.url) && req.method === method) {
			return handler;
		}
	};
}
