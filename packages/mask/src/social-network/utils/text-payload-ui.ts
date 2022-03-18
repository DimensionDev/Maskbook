import { activatedSocialNetworkUI } from '../ui'
export function decodeTextPayloadUI(x: string): string[] {
    const f = activatedSocialNetworkUI.utils.textPayloadPostProcessor?.decoder
    if (f) return f(x).concat(x)
    return [x]
}
