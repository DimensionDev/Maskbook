import { useQuery } from '@tanstack/react-query'
import { AAVEProtocol } from '../../protocols/AAVEProtocol.js'
import type { SavingsProtocol } from '../../types.js'
import { useChainContext, useWeb3 } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

export function useApr(protocol: SavingsProtocol, enabled: boolean) {
    const isAAve = protocol instanceof AAVEProtocol
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    return useQuery({
        queryKey: ['savings', 'apr', chainId, isAAve ? protocol.bareToken.address : 'lido'],
        enabled: enabled && !!web3,
        queryFn: () => protocol.getApr(chainId, web3!),
    })
}

export function useBalance(protocol: SavingsProtocol, enabled: boolean) {
    const { chainId, account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    return useQuery({
        queryKey: ['savings', 'balance', chainId, protocol.bareToken.address, account],
        enabled: enabled && !!web3,
        queryFn: () => protocol.getBalance(chainId, web3!, account),
    })
}
