import { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'

export const resolveNextIDPlatform = (value: string) => {
    const address = value
    if (isValidAddress(address)) return NextIDPlatform.Ethereum

    const pubKey = value
    if (pubKey.length >= 44) return NextIDPlatform.NextID

    const userId = value
    if (/^\w{1,15}$/.test(userId)) return NextIDPlatform.Twitter

    return
}

export const resolveValueToSearch = (value: string) => {
    if (value.length === 44) return new ECKeyIdentifier('secp256k1', value).publicKeyAsHex ?? value
    return value.toLowerCase()
}
