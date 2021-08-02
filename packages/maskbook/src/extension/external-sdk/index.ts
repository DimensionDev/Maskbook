import './constant'
import { AsyncCall, JSONSerialization, EventBasedChannel } from 'async-call-rpc'
import { MaskEvent } from './constant'

console.log('SDK server started')
const channel: EventBasedChannel = {
    on(listener) {
        const l = (x: Event) => x instanceof CustomEvent && listener(x.detail)
        document.addEventListener(MaskEvent.In, l)
        return () => document.removeEventListener(MaskEvent.In, l)
    },
    send(message) {
        document.dispatchEvent(new CustomEvent(MaskEvent.Out, { detail: message }))
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
document.dispatchEvent(new Event(MaskEvent.Start))
document.querySelector('html')?.setAttribute('data-mask-sdk-ready', 'true')
