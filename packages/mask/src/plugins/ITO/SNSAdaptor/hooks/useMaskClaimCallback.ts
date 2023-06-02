import { useAsyncFn } from 'react-use'
import { Web3 } from '@masknet/web3-providers'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ContractTransaction } from '@masknet/web3-shared-evm'
import { useMaskITO_Contract } from './useMaskITO_Contract.js'

export function useMaskClaimCallback() {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const MaskITO_Contract = useMaskITO_Contract(chainId)

    return useAsyncFn(async () => {
        if (!MaskITO_Contract) return

        const tx = await new ContractTransaction(MaskITO_Contract).fillAll(MaskITO_Contract.methods.claim(), {
            from: account,
        })
        return Web3.sendTransaction(tx, {
            chainId,
        })
    }, [account, chainId, MaskITO_Contract])
}
