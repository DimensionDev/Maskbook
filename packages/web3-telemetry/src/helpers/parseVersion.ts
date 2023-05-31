export function parseVersion(version: string) {
    return version.split('.').map((n) => Number.parseInt(n, 10) || 0)
}
