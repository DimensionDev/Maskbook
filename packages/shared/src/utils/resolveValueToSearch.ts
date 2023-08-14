import { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'

export const resolveValueToSearch = (value: string, type?: NextIDPlatform) => {
    if (value.length === 44) return new ECKeyIdentifier('secp256k1', value).publicKeyAsHex ?? value
    if (type === NextIDPlatform.Twitter) return value.replace(/^@/, '').toLowerCase()
    return value.toLowerCase()
}
