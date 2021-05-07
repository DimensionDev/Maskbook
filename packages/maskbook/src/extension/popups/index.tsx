export enum DialogRoutes {
    PermissionAwareRedirect = '/redirect',
}
export function PermissionAwareRedirectOf(url: string) {
    return `${DialogRoutes.PermissionAwareRedirect}?url=${encodeURIComponent(url)}`
}
