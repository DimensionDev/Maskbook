import { cache, startListen } from './cache.js'
import { hmr } from '../../../../utils-pure/index.js'

const { signal } = hmr(import.meta.webpackHot)
if (process.env.manifest === '3') {
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
