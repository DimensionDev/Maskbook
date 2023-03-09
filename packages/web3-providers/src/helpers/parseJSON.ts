export function parseJSON<T>(json?: string) {
    if (!json) return
    try {
        return JSON.parse(json) as T
    } catch {
        return
    }
}
