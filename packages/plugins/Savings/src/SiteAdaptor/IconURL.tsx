import { ProtocolType } from '../types.js'

export const ProviderIconURLs: Record<ProtocolType, string> = {
    [ProtocolType.Lido]: new URL('./assets/lido.png', import.meta.url).href,
    [ProtocolType.AAVE]: new URL('./assets/aave.png', import.meta.url).href,
}
