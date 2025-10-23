export function assert(condition: any, message: string): asserts condition {
    if (condition) return
    throw new Error(message)
}
