import { Emitter } from '@servie/events'
import { sideEffect } from './side-effects'
sideEffect.then(() => {
    if (process.env.NODE_ENV === 'production') return undefined
    const ws = new WebSocket('ws://localhost:7687')
    console.log('HMR client started')
    ws.addEventListener('message', async (e) => {
        const url = browser.runtime.getURL(e.data)
        console.log(e.data, 'updated')
        try {
            const newModule = await import(url + `?now=${Date.now()}`)
            event.emit(url, newModule)
        } catch (e) {
            console.warn(e.data, 'update failed!', e)
        }
    })
    return ws
})
const event = new Emitter<any>()
export function registerHMR(meta: ImportMeta, onUpdate: () => void) {
    const normalizedURL = meta.url.split('?')[0]
    event.on(normalizedURL, onUpdate)
    return () => event.off(normalizedURL, onUpdate)
}
