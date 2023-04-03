export async function captureAsyncTransaction<T extends unknown>(toBeResolved: Promise<T>): Promise<T> {
    const startAt = Date.now()

    let hasError = false

    try {
        const resolved = await toBeResolved
        return resolved
    } catch (error) {
        hasError = true
        throw error
    } finally {
        const transaction = Sentry.startTransaction({
            name: '',
        })
        const span = transaction.startChild({
            op: 'task',
            status: hasError ? 'succeed' : 'failed',
            startTimestamp: startAt,
            endTimestamp: Date.now(),
        })

        span.finish()
        transaction.finish()
    }
}
