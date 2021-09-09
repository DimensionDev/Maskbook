import { CustomEventId, InternalEvents } from '../shared'

function raw_send<K extends keyof InternalEvents>(name: K, ...params: InternalEvents[K]) {
    document.dispatchEvent(
        new CustomEvent(CustomEventId, { cancelable: true, bubbles: true, detail: JSON.stringify([name, params]) }),
    )
}
export function pasteText(text: string) {
    raw_send('paste', text)
}
export function pasteImage(image: Uint8Array) {
    raw_send('pasteImage', Array.from(image))
}
export function pasteInstagram(url: string) {
    raw_send('instagramUpload', url)
}
export function inputText(text: string) {
    raw_send('input', text)
}
