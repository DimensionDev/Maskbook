import { useAsyncFn } from 'react-use'
import { BigNumber } from 'bignumber.js'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId, ContractTransaction, SchemaType } from '@masknet/web3-shared-evm'
import { useArtBlocksContract } from './useArtBlocksContract.js'

export function usePurchaseCallback(chainId: ChainId, projectId: string, amount: string, schema = SchemaType.Native) {
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const genArt721MinterContract = useArtBlocksContract(chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    return useAsyncFn(async () => {
        if (!connection || !genArt721MinterContract) return

        const tx = await new ContractTransaction(genArt721MinterContract).encodeWithGas(
            genArt721MinterContract.methods.purchase(projectId),
            {
                from: account,
                value: new BigNumber(schema === SchemaType.Native ? amount : 0).toFixed(),
            },
        )
        return connection.sendTransaction(tx)
    }, [account, amount, chainId, genArt721MinterContract, connection])
}
