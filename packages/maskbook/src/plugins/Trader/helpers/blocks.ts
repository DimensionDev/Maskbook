/**
 * the latest unix timestamps
 * @param duration
 * @param size the max size of each subgraph request can be returned
 */
export function getLatestTimestamps(duration: number, size = 1000) {
    const now = Math.floor(Date.now() / 1000)

    // the smallest timestamp size is 10 minutes
    const step = Math.max(Math.floor(duration / size), 600)
    const timestamps = []

    for (let i = 0; i < size; i += 1) {
        const timestamp = now - i * step
        if (timestamp > 0) timestamps.push(timestamp)
        else break
    }
    return timestamps
}
