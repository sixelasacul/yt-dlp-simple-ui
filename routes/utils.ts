export type Route = {
	checker(req: Request): boolean;
	handler(req: Request): Response | Promise<Response>;
};

export function checkRoute(method: string, pattern: URLPattern) {
	return function (req: Request) {
		return pattern.test(req.url) &&
			req.method === method;
	};
}
