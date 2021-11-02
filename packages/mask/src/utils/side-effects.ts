import { noop } from 'lodash-es'

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
