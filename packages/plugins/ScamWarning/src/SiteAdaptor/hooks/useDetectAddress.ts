import { GoPlusLabs } from '@masknet/web3-providers'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { isValidAddress as isSolAddress } from '@masknet/web3-shared-solana'
import { useQuery } from '@tanstack/react-query'
import { SecurityProvider } from '../../constants.js'
import { PluginScamRPC } from '../../messages.js'
import { isTronAddress } from '../../utils.js'

export function useDetectAddress(address: string | null | undefined, enabled = true) {
    return useQuery({
        enabled: !!address && enabled,
        queryKey: ['detect-address', address],
        queryFn: async () => {
            if (!address) return null
            if (isValidAddress(address)) {
                return { isScam: await PluginScamRPC.checkAddress(address), provider: SecurityProvider.ScamSniffer }
            }
            if (isSolAddress(address))
                return {
                    isScam: await GoPlusLabs.checkIfAddressIsScam('solana', address),
                    provider: SecurityProvider.GoPlus,
                }
            if (isTronAddress(address))
                return {
                    isScam: await GoPlusLabs.checkIfAddressIsScam('tron', address),
                    provider: SecurityProvider.GoPlus,
                }
            return { isScam: false, provider: null }
        },
    })
}
