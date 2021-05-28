import './constant'
import { AsyncCall, JSONSerialization, EventBasedChannel } from 'async-call-rpc'

console.log('SDK server started')
const channel: EventBasedChannel = {
    on(listener) {
        const l = (x: Event) => x instanceof CustomEvent && listener(x.detail)
        document.addEventListener('mask-in', l)
        return () => document.removeEventListener('mask-in', l)
    },
    send(message) {
        document.dispatchEvent(new CustomEvent('mask-out', { detail: message }))
    },
}

AsyncCall(
    import('./hmr-sdk').then((x) => x.default),
    {
        serializer: JSONSerialization(undefined),
        channel,
        log: false,
    },
)
document.dispatchEvent(new Event('mask-start'))
document.querySelector('html')?.setAttribute('data-mask-sdk-ready', 'true')
