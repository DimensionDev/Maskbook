import { cache, startListen } from './cache.js'
import { hmr } from '../../../../utils-pure/index.js'

const { signal } = hmr(import.meta.webpackHot)
// https://bugs.chromium.org/p/chromium/issues/detail?id=1219164
if (typeof Worker === 'undefined') {
    browser.runtime.onMessage.addListener(f)
    signal.addEventListener('abort', () => browser.runtime.onMessage.removeListener(f), { once: true })

    startListen(async (props) => {
        const { main } = await import('./worker.js')
        return main(props)
    }, signal)
}

function f(message: any) {
    if (!(message.type === 'popups-ssr')) return
    return Promise.resolve(cache)
}
