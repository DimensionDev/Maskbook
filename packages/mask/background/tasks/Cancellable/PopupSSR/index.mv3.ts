import { prepareSSR } from './prepare-data'
export default async function PopupSSR(signal: AbortSignal) {
    browser.runtime.onMessage.addListener(f)
    signal.addEventListener('abort', () => browser.runtime.onMessage.removeListener(f), { once: true })
}

function f(message: any) {
    if (!(message.type === 'popups-ssr')) return
    return (async () => {
        const [{ main }, data] = await Promise.all([import('./worker'), prepareSSR()])
        return main(data)
    })()
}
