export function parseJSON<T>(json: string | undefined | null) {
    if (!json) return
    try {
        return JSON.parse(json) as T
    } catch {
        return
    }
}
