/**
 * Return a promise that resolved after `time` ms.
 * If `time` is `Infinity`, it will never resolve.
 * @param time - Time to sleep. In `ms`.
 */
export function delay(time: number) {
    return new Promise<void>((resolve) => (Number.isFinite(time) ? setTimeout(resolve, time) : void 0))
}
