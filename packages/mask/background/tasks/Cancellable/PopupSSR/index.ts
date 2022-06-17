import { OnDemandWorker, serializer } from '@masknet/shared-base'
import { cache, startListen } from './cache'

const worker = new OnDemandWorker(new URL('./worker_init.ts', import.meta.url), { name: 'PopupSSR-Worker' })
export default async function PopupSSR(signal: AbortSignal) {
    browser.runtime.onMessage.addListener(listener)

    signal.addEventListener(
        'abort',
        () => {
            browser.runtime.onMessage.removeListener(listener)
            worker.terminate()
        },
        { once: true },
    )

    startListen((props) => {
        return new Promise((resolve) => {
            Promise.resolve(serializer.serialization(props)).then((data) => worker.postMessage(data))
            worker.addEventListener('message', (data) => resolve(data.data), { once: true })
        })
    }, signal)
}

function isRequestPopupSSRCache(x: unknown): boolean {
    return typeof x === 'object' && !!x && 'type' in x && (x as any).type === 'popups-ssr'
}
// Do not convert this function to async function.
function listener(message: unknown) {
    if (!isRequestPopupSSRCache(message)) return
    // Note: return a Promise in browser.runtime.onMessage can return the message to the caller.
    return Promise.resolve(cache)
}
