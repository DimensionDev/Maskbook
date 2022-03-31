export default async function PopupSSR(signal: AbortSignal) {
    browser.runtime.onMessage.addListener(f)
    signal.addEventListener('abort', () => browser.runtime.onMessage.removeListener(f), { once: true })
}

function f(message: any) {
    if (!(message.type === 'popups-ssr')) return
    return import('./worker').then((x) => x.main())
}
