type HasNonNullableAbortSignal<T extends unknown[]> = false extends (
    T extends [infer Head, ...infer Rest] ? (Head extends AbortSignal ? true : HasNonNullableAbortSignal<Rest>) : false
)
    ? false
    : true

export function combineAbortSignal<T extends (AbortSignal | undefined | null)[]>(
    ..._: T
): HasNonNullableAbortSignal<T> extends true ? AbortSignal : AbortSignal | undefined {
    const args: (AbortSignal | undefined | null)[] = _.filter(Boolean)
    if (args.length === 0) return undefined!
    if (args.length === 1) return args[0] ?? undefined!
    const controller = new AbortController()
    const abort = () => controller.abort()
    for (const each of args) {
        each!.addEventListener('abort', abort, { signal: controller.signal })
    }
    return controller.signal
}
