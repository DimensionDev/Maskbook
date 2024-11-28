import { useQuery } from '@tanstack/react-query'
import { AAVEProtocol } from '../../protocols/AAVEProtocol.js'
import type { SavingsProtocol } from '../../types.js'
import { useChainContext, useWeb3 } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export function useApr(protocol: SavingsProtocol, enabled: boolean) {
    const isAAve = protocol instanceof AAVEProtocol
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: ChainId.Mainnet })
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    return useQuery({
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ['savings', 'apr', chainId, isAAve ? protocol.bareToken.address : 'lido'],
        enabled: enabled && !!web3,
        queryFn: () => protocol.getApr(chainId, web3!),
    })
}

export function useBalance(protocol: SavingsProtocol, enabled: boolean) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    return useQuery({
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ['savings', 'balance', chainId, protocol.bareToken.address, account],
        enabled: enabled && !!web3,
        queryFn: () => protocol.getBalance(chainId, web3!, account),
    })
}
