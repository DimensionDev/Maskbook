import type { Result } from 'ts-results-es'

export async function andThenAsync<T, E, Q, E2>(
    op: Result<T, E> | Promise<Result<T, E>>,
    mapper: (t: T) => Result<Q, E2> | Promise<Result<Q, E2>>,
): Promise<Result<Q, E | E2>> {
    op = await op
    if (op.isErr()) return op
    return mapper(op.value)
}
