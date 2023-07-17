import { NetworkPluginID } from '@masknet/shared-base'
import { useChainId } from '@masknet/web3-hooks-base'
import { getNativeTokenAddress, type ChainId } from '@masknet/web3-shared-evm'
import { useSearchParams } from 'react-router-dom'

export function useTokenParams() {
    const [params] = useSearchParams()
    const defaultChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const rawChainId = params.get('chainId')
    const chainId: ChainId = rawChainId ? Number.parseInt(rawChainId, 10) : defaultChainId
    const address = params.get('address') || getNativeTokenAddress(chainId)
    return { chainId, address }
}
