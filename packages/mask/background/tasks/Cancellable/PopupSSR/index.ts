import { OnDemandWorker } from '../../../../utils-pure/OnDemandWorker'

let worker = new OnDemandWorker(new URL('./worker_init.ts', import.meta.url), { name: 'PopupSSR' })
export default async function PopupSSR(signal: AbortSignal) {
    browser.runtime.onMessage.addListener(f)

    if (import.meta.webpackHot) {
        // To receive the HMR
        const _f = () => import('./worker_init')
        import.meta.webpackHot.accept('./worker_init.ts', () => {
            if (signal.aborted) return
            worker.terminate()
            worker = new OnDemandWorker(new URL('./worker_init.ts', import.meta.url), { name: 'PopupSSR' })
        })
    }
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
        worker.postMessage('ping')
        worker.addEventListener(
            'message',
            (data) => {
                resolve(data.data)
            },
            { once: true },
        )
    })
}
