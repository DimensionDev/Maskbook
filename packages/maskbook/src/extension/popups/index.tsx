export function PermissionAwareRedirectOf(url: string) {
    return `${DialogRoutes.PermissionAwareRedirect}?url=${encodeURIComponent(url)}`
}
/** Do not use this directly */
export enum DialogRoutes {
    PermissionAwareRedirect = '/redirect',
}
