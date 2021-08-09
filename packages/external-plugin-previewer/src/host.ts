/** @internal */
export const hostConfig: HostConfig = {
    permissionAwareOpen(url: string) {
        return url
    },
}
export interface HostConfig {
    permissionAwareOpen(url: string): void
}
export function setHostConfig(host: HostConfig) {
    hostConfig.permissionAwareOpen = host.permissionAwareOpen
}
