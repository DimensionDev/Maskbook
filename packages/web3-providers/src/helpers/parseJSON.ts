export function parseJSON<T extends unknown>(json?: string) {
    if (!json) return
    try {
        return JSON.parse(json) as T
    } catch {
        return
    }
}
