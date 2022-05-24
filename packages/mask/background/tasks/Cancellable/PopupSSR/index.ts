import { OnDemandWorker, serializer } from '@masknet/shared-base'
import { cache, startListen } from './cache'

const worker = new OnDemandWorker(new URL('./worker_init.ts', import.meta.url), { name: 'PopupSSR-Worker' })
export default async function PopupSSR(signal: AbortSignal) {
    browser.runtime.onMessage.addListener(f)

    signal.addEventListener(
        'abort',
        () => {
            browser.runtime.onMessage.removeListener(f)
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

function f(message: any) {
    if (!(message.type === 'popups-ssr')) return
    return new Promise((resolve) => {
        resolve(cache)
    })
}
