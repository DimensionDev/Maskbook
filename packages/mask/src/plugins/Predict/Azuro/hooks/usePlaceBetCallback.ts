import { encodeContractTransaction } from '@masknet/web3-shared-evm'
import { useAccount, useChainId, useWeb3Connection } from '@masknet/plugin-infra/web3'
import type BigNumber from 'bignumber.js'
import { useAzuroContract } from './useAzuroContract'
import { NetworkPluginID, toFixed } from '@masknet/web3-shared-base'
import { useAsyncFn } from 'react-use'

export function usePlaceBetCallback(
    conditionID: number,
    amount: BigNumber,
    outcomeID: number,
    deadline: number,
    minOdds: BigNumber,
) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const azuroContract = useAzuroContract()
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    return useAsyncFn(async () => {
        if (!azuroContract) return

        const config = {
            from: account,
            value: toFixed(amount),
        }
        const tx = await encodeContractTransaction(
            azuroContract,
            azuroContract.methods.betNative(conditionID, outcomeID, deadline, minOdds),
            config,
        )
        return connection.sendTransaction(tx)
    }, [account, amount, conditionID, outcomeID, deadline, minOdds, chainId, azuroContract, connection])
}
