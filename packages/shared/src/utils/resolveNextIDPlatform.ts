import { NextIDPlatform } from '@masknet/shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'

export const resolveNextIDPlatform = (value: string) => {
    const address = value
    if (isValidAddress(address)) return NextIDPlatform.Ethereum

    const pubKey = value
    if (pubKey.length >= 44) return NextIDPlatform.NextID

    const domain = value

    if (domain.endsWith('.eth') || domain.endsWith('.lens')) return NextIDPlatform.Ethereum

    const userId = value
    if (/^@?\w{1,15}$/.test(userId)) return NextIDPlatform.Twitter

    return
}
