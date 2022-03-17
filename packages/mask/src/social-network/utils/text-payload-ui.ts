import { activatedSocialNetworkUI } from '../ui'
export function encodeTextPayloadUI(x: string): string {
    const f = activatedSocialNetworkUI.utils.textPayloadPostProcessor?.encoder
    if (f) return f(x) || x
    return x
}
export function decodeTextPayloadUI(x: string): string[] {
    const f = activatedSocialNetworkUI.utils.textPayloadPostProcessor?.decoder
    if (f) return f(x).concat(x)
    return [x]
}
