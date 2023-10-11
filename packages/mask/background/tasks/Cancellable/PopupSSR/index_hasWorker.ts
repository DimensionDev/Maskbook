import { OnDemandWorker, serializer } from '@masknet/shared-base'
import { hmr } from '../../../../utils-pure/index.js'
import { cache, startListen } from './cache.js'

const worker = new OnDemandWorker(new URL('./worker.tsx', import.meta.url), { name: 'PopupSSR-Worker' })
const { signal } = hmr(import.meta.webpackHot)
if (typeof Worker === 'function') {
    browser.runtime.onMessage.addListener(listener)

    signal.addEventListener('abort', () => {
        browser.runtime.onMessage.removeListener(listener)
        worker.terminate()
    })

    const { task } = startListen((props) => {
        return new Promise((resolve) => {
            Promise.resolve(serializer.serialization(props)).then((data) => worker.postMessage(data))
            worker.addEventListener('message', (data) => resolve(data.data))
        })
    }, signal)

    if (process.env.NODE_ENV === 'development') {
        Object.defineProperty(globalThis, '__popup__ssr__recompute__', {
            get: () => {
                worker.terminate()
                return task().then(() => cache)
            },
            configurable: true,
            enumerable: true,
        })
    }
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
