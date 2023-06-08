import { isUndefined } from 'lodash-es'
import { attemptUntil } from './attemptUntil.js'

export async function attemptTimes<T>(
    func: () => Promise<T>,
    fallback: T,
    predicator: (result: Awaited<T> | undefined) => boolean = isUndefined,
    times = 3,
) {
    if (times <= 1 || times > 59) times = 3
    return attemptUntil(new Array(times).fill(func), fallback, predicator)
}
