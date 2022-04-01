import { serializer } from '@masknet/shared-base'
import { OnDemandWorker } from '../../../../utils-pure/OnDemandWorker'
import { prepareSSR } from './prepare-data'

const worker = new OnDemandWorker(new URL('./worker_init.ts', import.meta.url), { name: 'PopupSSR' })
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
}

function f(message: any) {
    if (!(message.type === 'popups-ssr')) return
    return new Promise((resolve) => {
        prepareSSR()
            .then(serializer.serialization)
            .then((data) => worker.postMessage(data))
        worker.addEventListener(
            'message',
            (data) => {
                resolve(data.data)
            },
            { once: true },
        )
    })
}
