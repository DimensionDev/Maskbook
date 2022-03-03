import { ProtocolType } from '../types'

export const ProviderIconURLs: Record<ProtocolType, string> = {
    [ProtocolType.Lido]: new URL('./assets/lido.png', import.meta.url).toString(),
    [ProtocolType.AAVE]: new URL('./assets/aave.png', import.meta.url).toString(),
}
