export default async function PopupSSR(signal: AbortSignal) {
    browser.runtime.onMessage.addListener(f)
    signal.addEventListener('abort', () => browser.runtime.onMessage.removeListener(f), { once: true })
}

function f(message: any) {
    if (!(message.type === 'popups-ssr')) return
    return (async () => {
        const x = import('./worker')
        const y = import('./prepare-data').then((f) => f.prepareSSR())
        const [{ main }, data] = await Promise.all([x, y])
        return main(data)
    })()
}
