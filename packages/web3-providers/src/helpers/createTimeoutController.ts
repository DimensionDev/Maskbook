export function createTimeoutController(ms: number) {
    const abortController = new AbortController()

    setTimeout(() => abortController.abort(), ms)

    return abortController
}
