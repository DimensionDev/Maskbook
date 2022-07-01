import { cache, startListen } from './cache'
export default async function PopupSSR(signal: AbortSignal) {
    browser.runtime.onMessage.addListener(f)
    signal.addEventListener('abort', () => browser.runtime.onMessage.removeListener(f), { once: true })

    startListen(async (props) => {
        const { main } = await import('./worker')
        return main(props)
    }, signal)
}

function f(message: any) {
    if (!(message.type === 'popups-ssr')) return
    return Promise.resolve(cache)
}
