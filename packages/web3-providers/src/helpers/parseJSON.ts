export function parseJSON<T extends unknown>(json?: string): T | void {
    if (!json) return
    try {
        return JSON.parse(json) as T
    } catch {
        return
    }
}
