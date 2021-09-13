import { noop } from 'lodash-es'

/**
 * There are some side effects in a module import.
 *
 * To chain the sideEffect after this Promise,
 * the sideEffect will only be invoked in the non-test env.
 */
let invokeSideEffect: () => void
export const sideEffect = new Promise<void>((resolve) => (invokeSideEffect = resolve))
try {
    if (process.env.STORYBOOK === true) {
    } else if (globalThis?.process?.argv[1]?.includes('ssr')) {
    } else {
        throw new Error()
    }
} catch {
    if (typeof invokeSideEffect! === 'undefined') {
        const i = setInterval(() => {
            if (typeof invokeSideEffect === 'undefined') return
            clearInterval(i)
            invokeSideEffect!()
        }, 10)
    } else {
        invokeSideEffect()
    }
}

export function startEffect(
    hot: __WebpackModuleApi.Hot | undefined,
    f: (abortController: AbortSignal) => void | (() => void),
) {
    const ac = new AbortController()
    if (!hot) {
        try {
            f(ac.signal)
        } catch {}
        return
    }
    try {
        const cancel = f(ac.signal) || noop
        hot.dispose(cancel)
    } catch {}
    hot.dispose(() => ac.abort())
}
export function startEffects(hot: __WebpackModuleApi.Hot | undefined) {
    return startEffect.bind(null, hot)
}
