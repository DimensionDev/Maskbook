import { Flags } from '@masknet/flags'

export async function captureAsyncTransaction<T>(name: string, toBeResolved: Promise<T>): Promise<T> {
    if (!Flags.sentry_enabled) return toBeResolved
    if (!Flags.sentry_async_transaction_enabled) return toBeResolved

    const startAt = Date.now()

    let hasError = false
    let capturedError: Error | undefined

    try {
        const resolved = await toBeResolved
        return resolved
    } catch (error) {
        if (error instanceof Error) {
            capturedError = error
        }
        hasError = true
        throw error
    } finally {
        const transaction = Sentry.startTransaction({
            name,
        })
        const span = transaction.startChild({
            op: 'task',
            status: hasError ? 'succeed' : 'failed',
            startTimestamp: startAt,
            endTimestamp: Date.now(),
            description: capturedError?.message,
        })

        span.finish()
        transaction.finish()
    }
}
