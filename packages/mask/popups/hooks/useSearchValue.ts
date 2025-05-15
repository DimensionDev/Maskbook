import { useLensClient } from '@masknet/shared'
import { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { ENS } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

export function useSearchValue(value: string, type?: NextIDPlatform) {
    const lensClient = useLensClient()
    return useQuery({
        queryKey: ['search-value', value, type, !lensClient],
        queryFn: async () => {
            if (!type) return ''
            if (value.length === 44) return new ECKeyIdentifier('secp256k1', value).publicKeyAsHex ?? value
            if (type === NextIDPlatform.Twitter) return value.replace(/^@/, '').toLowerCase()

            if (value.endsWith('.eth')) return (await ENS.lookup(value))?.toLowerCase() || ''

            if (value.endsWith('.lens') && lensClient) {
                const account = await lensClient?.getAccountByHandle(value)
                return (account?.username?.ownedBy as string).toLowerCase() || ''
            }

            return value.toLowerCase()
        },
    })
}
