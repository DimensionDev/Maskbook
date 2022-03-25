import { ProtocolType } from '../types'

export const ProviderIconURLs: Record<ProtocolType, string> = {
    [ProtocolType.Lido]: new URL('./assets/lido.png', import.meta.url).toString(),
    [ProtocolType.BENQI]: new URL('./assets/benqi.png', import.meta.url).toString(),
    [ProtocolType.Compound]: new URL('./assets/compound.png', import.meta.url).toString(),
}
