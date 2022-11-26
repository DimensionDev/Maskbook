import { useAsyncFn } from 'react-use'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ContractTransaction } from '@masknet/web3-shared-evm'
import { useMaskITO_Contract } from './useMaskITO_Contract.js'

export function useMaskClaimCallback() {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const MaskITO_Contract = useMaskITO_Contract(chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    return useAsyncFn(async () => {
        if (!connection || !MaskITO_Contract) return

        const tx = await new ContractTransaction(MaskITO_Contract).encodeWithGas(MaskITO_Contract.methods.claim(), {
            from: account,
        })
        return connection.sendTransaction(tx)
    }, [account, chainId, MaskITO_Contract, connection])
}
