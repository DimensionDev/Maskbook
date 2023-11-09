import { useAsyncFn } from 'react-use'
import { BigNumber } from 'bignumber.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, ContractTransaction, SchemaType } from '@masknet/web3-shared-evm'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useArtBlocksContract } from './useArtBlocksContract.js'

export function usePurchaseCallback(chainId: ChainId, projectId: string, amount: string, schema = SchemaType.Native) {
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const genArt721MinterContract = useArtBlocksContract(chainId)

    return useAsyncFn(async () => {
        if (!genArt721MinterContract) return

        const tx = await new ContractTransaction(genArt721MinterContract).fillAll(
            genArt721MinterContract.methods.purchase(projectId),
            {
                from: account,
                value: new BigNumber(schema === SchemaType.Native ? amount : 0).toFixed(),
            },
        )
        return EVMWeb3.sendTransaction(tx, { chainId })
    }, [account, chainId, amount, genArt721MinterContract])
}
