import { ProtocolType } from '../types'

export const ProviderIconURLs: Record<ProtocolType, string> = {
    [ProtocolType.Lido]: new URL('./assets/lido.png', import.meta.url).toString(),
    [ProtocolType.BENQI]: new URL('./assets/benqi.png', import.meta.url).toString(),
    [ProtocolType.Compound]: new URL('./assets/compound.png', import.meta.url).toString(),
    [ProtocolType.AAVE]: new URL('./assets/aave.png', import.meta.url).toString(),
    [ProtocolType.Aurigami]: new URL('./assets/aurigami.png', import.meta.url).toString(),
    [ProtocolType.Giest]: new URL('./assets/giest.png', import.meta.url).toString(),
    [ProtocolType.Alpaca]: new URL('./assets/alpaca.png', import.meta.url).toString(),
    [ProtocolType.Moola]: new URL('./assets/moola.png', import.meta.url).toString(),
    [ProtocolType.Tranquil]: new URL('./assets/tranquil.png', import.meta.url).toString(),
}
