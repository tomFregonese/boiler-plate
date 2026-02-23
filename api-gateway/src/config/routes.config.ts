export interface PublicRoute {
    method: string;
    pattern: RegExp;
}

export const PUBLIC_ROUTES: PublicRoute[] = [
    // Health check
    {method: 'GET', pattern: /^\/health$/},

    // Auth service - public routes
    {method: 'POST', pattern: /^\/api\/auth\/account$/},
    {method: 'POST', pattern: /^\/api\/auth\/token$/},
    {method: 'POST', pattern: /^\/api\/auth\/refresh-token\/[^/]+\/token$/},
    {method: 'GET', pattern: /^\/api\/auth\/validate\/[^/]+$/},

    // Movies service - only public
    {method: 'GET', pattern: /^\/api\/movies(\/.*)?$/},

    // Cinema service - public routes
    {method: 'GET', pattern: /^\/api\/cinemas$/},
    {method: 'GET', pattern: /^\/api\/cinemas\/[^/]+\/catalog$/},
    {method: 'GET', pattern: /^\/api\/cinemas\/movies\/[^/]+\/sessions$/},
    {method: 'GET', pattern: /^\/api\/cinemas\/sessions\/[^/]+\/seats$/},
];

export function isPublicRoute(method: string, path: string): boolean {
    return PUBLIC_ROUTES.some(
        (route) =>
            route.method === method.toUpperCase() && route.pattern.test(path),
    );
}

export interface AdminRoute {
    method: string;
    pattern: RegExp;
}

export const ADMIN_ROUTES: AdminRoute[] = [
    {method: 'GET', pattern: /^\/api\/cinemas\/admin\/rooms\/[^/]+\/availability$/},
    {method: 'POST', pattern: /^\/api\/cinemas\/admin\/sessions$/},
];

export function isAdminRoute(method: string, path: string): boolean {
    return ADMIN_ROUTES.some(
        (route) =>
            route.method === method.toUpperCase() && route.pattern.test(path),
    );
}
