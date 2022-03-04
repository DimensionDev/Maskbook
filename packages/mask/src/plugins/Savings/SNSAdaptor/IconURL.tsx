import { ProtocolType } from '../types'

// export const IconURLs: Readonly<Record<string, string>> = {
//     lido: new URL('./assets/lido.png', import.meta.url).toString(),
//     eth: new URL('./assets/eth.png', import.meta.url).toString(),
// }

export const ProviderIconURLs: Record<ProtocolType, string> = {
    [ProtocolType.Lido]: new URL('./assets/lido.png', import.meta.url).toString(),
    [ProtocolType.Convex]: new URL('./assets/convex.svg', import.meta.url).toString(),
}
