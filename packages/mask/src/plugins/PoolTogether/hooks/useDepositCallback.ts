import { BigNumber } from 'bignumber.js'
import { useAsyncFn } from 'react-use'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId, encodeContractTransaction, SchemaType } from '@masknet/web3-shared-evm'
import { usePoolTogetherPoolContract } from '../contracts/usePoolTogetherPool.js'

/**
 * A callback for deposit into pool
 * @param address the pool address
 * @param amount
 * @param controlledToken the ticket token address
 * @param referrer
 * @param token deposit token
 */
export function useDepositCallback(
    address: string,
    amount: string,
    controlledToken: string,
    referrer: string,
    token?: FungibleToken<ChainId, SchemaType>,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const poolContract = usePoolTogetherPoolContract(chainId, address)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    return useAsyncFn(async () => {
        if (!connection || !token || !poolContract) {
            return
        }

        // step 1: estimate gas
        const config = {
            from: account,
            value: new BigNumber(token.schema === SchemaType.Native ? amount : 0).toFixed(),
        }

        const tx = await encodeContractTransaction(
            poolContract,
            poolContract.methods.depositTo(account, amount, controlledToken, referrer),
            config,
        )
        return connection.sendTransaction(tx)
    }, [address, account, amount, token, referrer, controlledToken])
}
