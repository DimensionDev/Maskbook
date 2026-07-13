import { useQuery } from '@tanstack/react-query'
import { AAVEProtocol } from '../../protocols/AAVEProtocol.js'
import type { SavingsProtocol } from '../../types.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export function useApr(protocol: SavingsProtocol, enabled: boolean) {
    const isAAve = protocol instanceof AAVEProtocol
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: ChainId.Mainnet })
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    return useQuery({
        queryKey: ['savings', 'apr', chainId, isAAve ? protocol.bareToken.address : 'lido'],
        enabled,
        queryFn: () => protocol.getApr(chainId),
    })
}

export function useBalance(protocol: SavingsProtocol, enabled: boolean) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    return useQuery({
        queryKey: ['savings', 'balance', chainId, protocol.bareToken.address, account],
        enabled,
        queryFn: () => protocol.getBalance(chainId, account),
    })
}
