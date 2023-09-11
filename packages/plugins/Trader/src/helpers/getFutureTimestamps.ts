export function getFutureTimestamps(start: number, duration: number, size = 50) {
    // the smallest timestamp size is 10 minutes
    const step = Math.max(Math.floor(duration / size), 600)
    const timestamps: number[] = []

    for (let i = 0; i < size; i += 1) {
        const timestamp = start + i * step
        timestamps.push(timestamp)
    }
    return timestamps
}
