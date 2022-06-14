import { useAccount, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, encodeTransaction, SchemaType } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { useAsyncFn } from 'react-use'
import { useArtBlocksContract } from './useArtBlocksContract'

export function usePurchaseCallback(chainId: ChainId, projectId: string, amount: string, schema = SchemaType.Native) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    const genArt721MinterContract = useArtBlocksContract(chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    return useAsyncFn(async () => {
        if (!genArt721MinterContract) return

        const value = new BigNumber(schema === SchemaType.Native ? amount : 0).toFixed()
        const config = {
            from: account,
            value,
        }
        const tx = await encodeTransaction(
            genArt721MinterContract,
            genArt721MinterContract.methods.purchase(projectId),
            config,
        )
        return connection.sendTransaction(tx)
    }, [account, amount, chainId, genArt721MinterContract, connection])
}
