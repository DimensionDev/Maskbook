export function getPastTimestamps(start: number, duration: number, size = 50) {
    // the smallest timestamp size is 10 minutes
    const step = Math.max(Math.floor(duration / size), 600)
    const timestamps = []

    for (let i = 1; i <= size; i += 1) {
        const timestamp = start - i * step
        if (timestamp > 0) timestamps.push(timestamp)
        else break
    }
    return timestamps.reverse()
}

export function getFutureTimestamps(start: number, duration: number, size = 50) {
    // the smallest timestamp size is 10 minutes
    const step = Math.max(Math.floor(duration / size), 600)
    const timestamps = []

    for (let i = 0; i < size; i += 1) {
        const timestamp = start + i * step
        timestamps.push(timestamp)
    }
    return timestamps
}
